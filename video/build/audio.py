"""Mix one chapter's soundtrack: narration + synthesized sound effects + a soft music bed (all original, no samples).
   usage: python3 build/audio.py <meta.json> <out.wav>   (meta: {total, beats:[{id,start,dur}], sfx:[{t,type}]})"""
import json, os, subprocess, sys, wave
import numpy as np
SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(7)

def tone(f, d, decay=8.0, a=1.0):
    t = np.arange(int(d * SR)) / SR
    return a * np.sin(2 * np.pi * f * t) * np.exp(-decay * t)
def chirp(f0, f1, d, decay=10.0):
    t = np.arange(int(d * SR)) / SR
    f = f0 + (f1 - f0) * t / d
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-decay * t)
def whoosh(d=0.5):
    n = int(d * SR); x = rng.standard_normal(n)
    k = 64; x = np.convolve(x, np.ones(k) / k, "same")          # soften the noise
    t = np.linspace(0, 1, n)
    return x * np.sin(np.pi * t) ** 2 * 3.0
def pad(sig, n):
    return np.pad(sig, (0, max(0, n - len(sig))))[:n]
def seq(parts, gap):
    out = np.zeros(int((len(parts) * gap + 0.8) * SR))
    for i, p in enumerate(parts):
        s = int(i * gap * SR); out[s:s + len(p)] += p
    return out
SFX = {
    "whoosh": 0.10 * whoosh(),
    "pop": 0.16 * chirp(480, 900, 0.12, 22),
    "ding": 0.11 * (tone(1318.5, 0.9, 5) + 0.6 * tone(1975.5, 0.9, 6) + 0.3 * tone(2637, 0.9, 8)),
    "error": 0.16 * (tone(155, 0.3, 9) + 0.5 * tone(116, 0.3, 9) + 0.25 * tone(233, 0.3, 14)),
    "tick": 0.035 * tone(1500, 0.05, 60),
    "tick2": 0.12 * tone(880, 0.12, 25),
    "success": 0.12 * seq([tone(523.25, 0.5, 7), tone(659.25, 0.5, 7), tone(783.99, 0.7, 5)], 0.09),
}

def music(n):
    """Slow four-chord pad (Am7 – Fmaj7 – Cmaj7 – G6). Pure sines with gentle beating: warm, unobtrusive."""
    chords = [[110.0, 220.0, 261.63, 329.63, 392.0], [87.31, 174.61, 220.0, 261.63, 329.63], [130.81, 196.0, 261.63, 329.63, 493.88], [98.0, 196.0, 246.94, 293.66, 329.63]]
    bar = 8.0; t = np.arange(n) / SR; out = np.zeros(n)
    for k in range(int(n / SR / bar) + 2):
        s = int((k * bar - 1.5) * SR); e = int(((k + 1) * bar + 1.5) * SR)
        s0, e0 = max(s, 0), min(e, n)
        if s0 >= e0: break
        tt = t[s0:e0] - (k * bar - 1.5)
        env = np.clip(tt / 3.0, 0, 1) * np.clip((bar + 3.0 - tt) / 3.0, 0, 1)      # 3 s cross-fades
        seg = np.zeros(e0 - s0)
        for j, f in enumerate(chords[k % 4]):
            seg += (0.9 if j < 2 else 0.6) * (np.sin(2 * np.pi * f * t[s0:e0]) + np.sin(2 * np.pi * f * 1.004 * t[s0:e0] + j))
        out[s0:e0] += seg * env
    out *= 1 + 0.15 * np.sin(2 * np.pi * 0.11 * t)
    return out / np.max(np.abs(out) + 1e-9)

def decode(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)

def main(meta_path, out_path):
    m = json.load(open(meta_path)); n = int(round(m["total"] * SR))
    voice = np.zeros(n)
    for b in m["beats"]:
        v = decode(os.path.join(ROOT, "audio", b["id"] + ".mp3")); s = int(b["start"] * SR)
        voice[s:s + len(v)] += v[: max(0, n - s)]
    fx = np.zeros(n); last = {}
    for ev in sorted(m["sfx"], key=lambda e: e["t"]):
        if ev["t"] - last.get(ev["type"], -9) < 0.18: continue     # no machine-gun repeats
        last[ev["type"]] = ev["t"]
        w = SFX[ev["type"]]; s = int(ev["t"] * SR)
        if s < n: fx[s:s + len(w)] += w[: n - s]
    bed = music(n)
    # duck the bed under speech: follow the voice envelope (cumulative-sum moving averages, O(n))
    def mavg(x, k):
        c = np.cumsum(np.concatenate(([0.0], x)))
        out = (c[k:] - c[:-k]) / k
        return np.pad(out, (k // 2, len(x) - len(out) - k // 2), mode="edge")
    env = np.sqrt(mavg(voice ** 2, int(0.05 * SR)))
    speaking = (env > 0.01).astype(float)
    # hold the "speech" state across pauses shorter than 2.5 s so the bed never pumps between words,
    # and start lowering it ~0.4 s before the first word
    hold = mavg(speaking, int(2.5 * SR)) > 0.001
    duck = mavg(hold.astype(float), int(0.8 * SR))
    v_rms = np.sqrt(np.mean(voice[speaking > 0] ** 2)) if speaking.any() else 0.05
    bed_rms = np.sqrt(np.mean(bed ** 2))
    g_speech = v_rms * 10 ** (-19 / 20) / bed_rms            # music 19 dB under the voice while he talks
    g_open = v_rms * 10 ** (-9 / 20) / bed_rms               # and comes up in real silences (title cards, countdowns)
    fade = np.clip(np.arange(n) / SR / 1.2, 0, 1) * np.clip((n - np.arange(n)) / SR / 1.2, 0, 1)
    fx *= 1 - 0.5 * np.clip(mavg(speaking, int(0.15 * SR)) * 3, 0, 1)     # effects sit back under speech
    mix = voice + fx + bed * (g_open + (g_speech - g_open) * duck) * fade
    mix *= 0.5 / max(np.percentile(np.abs(mix), 99.9), 1e-6)          # clean headroom: no saturation here;
    mix = np.clip(mix, -0.9, 0.9)                                     # loudness and peak limiting happen once, in final.py
    pcm = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
    with wave.open(out_path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.repeat(pcm, 2).tobytes())

main(sys.argv[1], sys.argv[2])
