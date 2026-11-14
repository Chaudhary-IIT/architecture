"""Natural narrator pipeline (Gemini TTS): one request per narrator block -> align words -> cut pauses -> slice per beat.

  python3 build/voice.py synth            # voice every block (skips blocks already voiced)
  python3 build/voice.py cut              # align + shorten pauses + write audio/<beat>.mp3, durations.js, metrics
  python3 build/voice.py check            # listening-model check of every block against the script
  python3 build/voice.py selftest c04     # alignment test on existing per-beat audio (true boundaries known)

The API key is never read here: the session proxy injects it for generativelanguage.googleapis.com
(or set GEMINI_API_KEY in the environment when running elsewhere)."""
import base64, json, os, re, subprocess, sys, time, urllib.request, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "out", "voice")
SR = 24000
API = "https://generativelanguage.googleapis.com/v1beta/"
TTS_MODELS = ["gemini-3.8-flash-tts", "gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts", "gemini-2.5-pro-preview-tts"]
VOICE = os.environ.get("VOICE", "Algenib")
BLOCKS = [["c00", "c01"], ["c02", "c03"], ["c04"], ["c05", "c06"], ["c07"], ["c08"], ["c09", "c10"], ["c11"], ["c12"], ["c13"]]
PROMPT = """# AUDIO PROFILE: A confident, warm young Indian man (mid-20s), the elder-brother friend who knows how things work.
Natural everyday Hindi with a neutral North-Indian accent; English loanwords pronounced the Indian way.
### DIRECTOR'S NOTES
Confident, brisk and energetic, like excitedly explaining something fascinating to a friend. Smiling voice.
Keep moving from sentence to sentence with only short natural pauses. It must flow as one continuous story,
never as separate announcements. Read only the transcript, never these notes.
#### TRANSCRIPT
"""
MAXGAP = {"word": 0.10, "comma": 0.16, "sentence": 0.20, "thought": 0.34}
REVEAL = (0.42, 0.62)

# ───────────────────────── script helpers
def beats():
    return json.load(open(os.path.join(ROOT, "out", "beats.json")))["beats"]
def block_beats(block):
    return [b for b in beats() if b["ch"] in block]
def syllables(w):
    dev = len(re.findall(r"[अ-औॠॡ]|[क-हक़-य़](?!्)", w))
    lat = sum(max(1, len(re.findall(r"[aeiouyAEIOUY]+", x))) if len(x) > 1 else 2 for x in re.findall(r"[A-Za-z]+", w))
    num = 2 * len(re.findall(r"\d", w))
    return max(1, dev + lat + num)
def gap_type(word, last_in_line):
    if "…" in word: return "reveal"
    if last_in_line: return "thought"
    if re.search(r"[।.?!]$", word): return "sentence"
    if re.search(r"[,—:;]$", word): return "comma"
    return "word"
def script_words(bts):
    W = []
    for bi, b in enumerate(bts):
        ws = b["say"].split()
        for k, w in enumerate(ws):
            W.append({"w": w, "beat": bi, "syl": syllables(w), "gap": gap_type(w, k == len(ws) - 1)})
    return W

# ───────────────────────── audio helpers
def read_wav(p):
    with wave.open(p) as w:
        assert w.getframerate() == SR and w.getnchannels() == 1
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
def write_wav(p, x):
    with wave.open(p, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
def decode(p):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", p, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768
def stretches(x, min_sil=0.09):
    """Speech stretches [(start,end)] in seconds, split at silences >= min_sil."""
    hop = int(0.01 * SR); n = len(x) // hop
    rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1) + 1e-12)
    thr = max(np.percentile(rms, 95) * 0.045, 0.0025)
    sp = rms > thr
    out, i = [], 0
    while i < n:
        if sp[i]:
            j = i
            while j < n and sp[j]: j += 1
            out.append([i * 0.01, j * 0.01]); i = j
        else: i += 1
    merged = []
    for s in out:
        if merged and s[0] - merged[-1][1] < min_sil: merged[-1][1] = s[1]
        else: merged.append(s)
    return [s for s in merged if s[1] - s[0] >= 0.05]

# ───────────────────────── alignment (dynamic programming over words x stretches)
def align(x, W):
    S = stretches(x)
    nS, nW = len(S), len(W)
    syl = np.cumsum([0] + [w["syl"] for w in W])
    spp = sum(e - s for s, e in S) / syl[-1]                      # seconds per syllable
    gaps = [S[k + 1][0] - S[k][1] for k in range(nS - 1)] + [1.0]
    want = {"word": -1.0, "comma": 0.25, "sentence": 0.6, "thought": 1.6, "reveal": 1.0}
    INF = 1e18; MAXW = 60
    dp = np.full((nS + 1, nW + 1), INF); bk = np.zeros((nS + 1, nW + 1), dtype=np.int32); dp[0][0] = 0
    for k in range(1, nS + 1):
        dur = S[k - 1][1] - S[k - 1][0]; g = min(gaps[k - 1], 1.0)
        lo = max(0, nW - (nS - k) * MAXW)
        for i in range(lo, nW + 1):
            best, arg = INF, 0
            for a in range(max(0, i - MAXW), i + 1):              # stretch k-1 holds words a..i-1 (may be empty: a breath)
                if dp[k - 1][a] >= INF: continue
                if a == i: c = dur / spp * 0.6 + 0.5
                else:
                    c = abs(dur - (syl[i] - syl[a]) * spp) / spp   # mismatch in syllables
                    c -= 6.0 * g * want[W[i - 1]["gap"]]          # long pause should follow punctuation, not a bare word
                v = dp[k - 1][a] + c
                if v < best: best, arg = v, a
            dp[k][i] = best; bk[k][i] = arg
    i = nW
    for k in range(nS, 0, -1):
        a = bk[k][i]; s, e = S[k - 1]; tot = syl[i] - syl[a]; t = s
        for j in range(a, i):
            d = (e - s) * W[j]["syl"] / tot
            W[j]["t0"], W[j]["t1"], W[j]["st"] = t, t + d, k - 1; t += d
        i = a
    return S

# ───────────────────────── pause shortening + per-beat slicing
def xfade(a, b, n=int(0.010 * SR)):
    if len(a) < n or len(b) < n: return np.concatenate([a, b])
    t = np.linspace(0, np.pi / 2, n)
    return np.concatenate([a[:-n], a[-n:] * np.cos(t) + b[:n] * np.sin(t), b[n:]])
def cut_beat(x, segs):
    """segs: the speech stretches owned by this beat ({t0,t1,gap}). Every stretch is kept (never drop speech);
    only the silences between them are shortened to the maximum for their type."""
    out = None; pieces, pauses = [], []
    start = max(0.0, segs[0]["t0"] - 0.05)
    for k, s in enumerate(segs):
        if k + 1 < len(segs):
            gap = segs[k + 1]["t0"] - s["t1"]
            keep = min(max(gap, REVEAL[0]), REVEAL[1]) if s["gap"] == "reveal" else min(gap, max(MAXGAP[s["gap"]], 0.08))
            if keep >= gap:                                       # nothing to remove (maybe lengthen a reveal)
                pieces.append(x[int(start * SR): int((s["t1"] + gap / 2) * SR)])
                if keep > gap: pieces.append(np.zeros(int((keep - gap) * SR)))
                start = s["t1"] + gap / 2
            else:                                                 # remove the centre of the silence
                pieces.append(x[int(start * SR): int((s["t1"] + keep / 2) * SR)])
                start = segs[k + 1]["t0"] - keep / 2
            pauses.append(keep)
        else:
            pieces.append(x[int(start * SR): int((s["t1"] + 0.07) * SR)])
    for p in pieces: out = p if out is None else xfade(out, p)
    return out, pauses

def beat_segments(S, W, nbeats):
    """Give every speech stretch to a beat. Stretches the aligner left wordless (a breath, or a short word it
    merged into a neighbour) go to the beat of the next stretch that has words, so no audio is discarded."""
    info = [None] * len(S)
    for w in W:
        info[w["st"]] = {"beat": w["beat"], "gap": w["gap"]}      # last word in the stretch decides the gap type
    nxt = None
    for k in range(len(S) - 1, -1, -1):
        if info[k] is None: info[k] = {"beat": nxt if nxt is not None else nbeats - 1, "gap": "word"}
        else: nxt = info[k]["beat"]
    per = [[] for _ in range(nbeats)]
    for k, (a, e) in enumerate(S): per[info[k]["beat"]].append({"t0": a, "t1": e, "gap": info[k]["gap"]})
    return per, sum(1 for k in range(len(S)) if not any(w["st"] == k for w in W))

def metrics(W_all, durs, pauses):
    words = len(W_all); syl = sum(w["syl"] for w in W_all); total = sum(durs)
    pz = [p for p in pauses if p > 0.09]
    return {"wpm": round(words / total * 60, 1), "pause_share": round(float(sum(pz) / total), 3), "syl_per_s": round(float(syl / (total - sum(pz))), 2), "longest_pause": round(max(pz or [0]), 2), "minutes": round(total / 60, 2)}

def cut(blocks=BLOCKS, src=None):
    rng = np.random.default_rng(3); durs_js = {}; report = {}
    os.makedirs(os.path.join(ROOT, "audio"), exist_ok=True)
    for block in blocks:
        name = "_".join(block); raw = (src or {}).get(name) or os.path.join(OUT, f"raw_{name}.wav")
        if not os.path.exists(raw): print("missing take:", name); continue
        x = read_wav(raw); bts = block_beats(block); W = script_words(bts); S = align(x, W)
        per, wordless = beat_segments(S, W, len(bts))
        durs, pauses = [], []
        for bi, b in enumerate(bts):
            seg, pz = cut_beat(x, per[bi])
            seg = seg + rng.standard_normal(len(seg)) * 10 ** (-62 / 20)       # quiet room tone under every cut
            fade = int(0.012 * SR); seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
            tmp = os.path.join(OUT, "tmp.wav"); write_wav(tmp, seg)
            subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-ar", "24000", "-b:a", "80k", os.path.join(ROOT, "audio", b["id"] + ".mp3")])
            durs_js[b["id"]] = round(len(seg) / SR, 3); durs.append(len(seg) / SR); pauses += pz
        # inter-beat gap on the timeline is the engine's GAP (a "thought" pause)
        report[name] = metrics(W, durs, pauses); report[name]["wordless_stretches_kept"] = wordless; print(name, report[name])
    old = {}
    p = os.path.join(ROOT, "durations.js")
    if os.path.exists(p): old = json.loads(open(p).read().split("=", 1)[1].rstrip(";\n"))
    old.update(durs_js); open(p, "w").write("window.DUR=" + json.dumps(old) + ";\n")
    json.dump(report, open(os.path.join(OUT, "metrics.json"), "w"), indent=1)

# ───────────────────────── Gemini calls
def call(path, body=None, timeout=600):
    headers = {"content-type": "application/json"}
    if os.environ.get("GEMINI_API_KEY"): headers["x-goog-api-key"] = os.environ["GEMINI_API_KEY"]
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body else None, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r: return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode()[:400]}
def synth(blocks=BLOCKS, model=None):
    os.makedirs(OUT, exist_ok=True)
    state_p = os.path.join(OUT, "model.txt")
    model = model or (open(state_p).read().strip() if os.path.exists(state_p) else None)
    for block in blocks:
        name = "_".join(block); raw = os.path.join(OUT, f"raw_{name}.wav")
        if os.path.exists(raw): continue
        text = "\n".join(b["say"] for b in block_beats(block))
        body = {"contents": [{"parts": [{"text": PROMPT + text}]}], "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOICE}}}}}
        for m in ([model] if model else TTS_MODELS):
            for attempt in range(4):                       # transient gateway errors: wait and retry the same model
                code, j = call(f"models/{m}:generateContent", body)
                if code not in (429, 500, 502, 503, 504): break
                time.sleep(75)
            if code == 200:
                parts = j["candidates"][0]["content"]["parts"]
                pcm = b"".join(base64.b64decode(p["inlineData"]["data"]) for p in parts if "inlineData" in p)
                x = np.frombuffer(pcm, dtype=np.int16).astype(np.float64) / 32768
                write_wav(raw, x); model = m; open(state_p, "w").write(m)
                print(name, "voiced with", m, round(len(x) / SR, 1), "s"); break
            print(name, m, "->", code, str(j.get("error"))[:160])
        else:
            print("STOP: no model could voice", name, "(quota?). Voiced blocks are kept; rerun later."); return False
        time.sleep(40)
    return True
def check(blocks=BLOCKS):
    code, j = call("models?pageSize=200")
    names = sorted([m["name"] for m in j.get("models", []) if "generateContent" in m.get("supportedGenerationMethods", []) and re.search(r"gemini-[\d.]+-flash$", m["name"])], reverse=True)
    judges = (names or ["models/gemini-2.5-flash"])[:5]
    cp = os.path.join(OUT, "check.json"); res = json.load(open(cp)) if os.path.exists(cp) else {}
    for block in blocks:
        name = "_".join(block); bts = block_beats(block)
        if name in res and "NO_RESULT" not in res[name]: continue
        files = [os.path.join(ROOT, "audio", b["id"] + ".mp3") for b in bts]
        lst = os.path.join(OUT, "c.txt"); open(lst, "w").write("".join(f"file '{f}'\n" for f in files))
        mp3 = os.path.join(OUT, f"chk_{name}.mp3")
        subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-ac", "1", "-b:a", "48k", mp3])
        q = ("Listen to this Hindi/English narration and compare it with the exact script below. Return ONLY JSON with keys: "
             "missing_or_wrong_words (array), extra_speech (bool), pronunciation_issues (array), naturalness_1to10, intelligibility_1to10, "
             "energy_1to10 (1 lethargic .. 10 rushed; 7 is ideal brisk-but-relaxed), feels_rushed (bool), sounds_like_separate_announcements (bool), emotion_1to10, notes.\n\nSCRIPT:\n"
             + "\n".join(b["say"] for b in bts))
        body = {"contents": [{"parts": [{"inlineData": {"mimeType": "audio/mp3", "data": base64.b64encode(open(mp3, "rb").read()).decode()}}, {"text": q}]}], "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}
        for attempt in range(14):
            if not judges: break
            judge = judges[attempt % len(judges)]
            code, j = call(f"{judge}:generateContent", body)
            try: res[name] = json.loads(j["candidates"][0]["content"]["parts"][0]["text"]); res[name]["judge"] = judge; break
            except Exception:
                res[name] = {"NO_RESULT": code, "detail": str(j)[:200]}
                if code == 404: judges.remove(judge)             # model not offered on this key: stop trying it
                else: time.sleep(15)
        json.dump(res, open(cp, "w"), ensure_ascii=False, indent=1)
        print(name, json.dumps(res[name], ensure_ascii=False)[:600]); time.sleep(5)
    json.dump(res, open(os.path.join(OUT, "check.json"), "w"), ensure_ascii=False, indent=1)

def selftest(ch):
    """Join the existing per-beat clips (with random extra silences) and see if alignment finds the true beat boundaries."""
    os.makedirs(OUT, exist_ok=True)
    bts = block_beats([ch]); rng = np.random.default_rng(1); xs, truth, t = [], [], 0.0
    for b in bts:
        v = decode(os.path.join(ROOT, "audio", b["id"] + ".mp3")); sil = np.zeros(int(rng.uniform(0.25, 0.7) * SR))
        truth.append((t, t + len(v) / SR)); xs += [v, sil]; t += (len(v) + len(sil)) / SR
    x = np.concatenate(xs); W = script_words(bts); align(x, W)
    bad = 0; worst = 0.0
    for bi, (a, e) in enumerate(truth):       # clips carry their own leading/trailing silence, so test containment
        ws = [w for w in W if w["beat"] == bi]
        ok = a - 0.05 <= ws[0]["t0"] <= a + 0.5 and ws[-1]["t1"] <= e + 0.05 and ws[-1]["t1"] >= e - 1.6
        bad += not ok; worst = max(worst, abs(ws[0]["t0"] - a))
    print(ch, "beats", len(bts), "| misplaced beats:", bad, "| worst start offset (s):", round(worst, 2))

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "synth": sys.exit(0 if synth() else 2)
    elif cmd == "cut": cut()
    elif cmd == "check": check()
    elif cmd == "selftest": selftest(sys.argv[2])
