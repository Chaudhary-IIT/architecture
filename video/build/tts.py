"""Generate Hinglish narration for every beat with the free Edge neural voice.
   usage: python3 build/tts.py   (reads out/beats.json, writes audio/<id>.mp3 + durations.js)"""
import asyncio, hashlib, json, os, re, subprocess, sys
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.environ.get("VOICE", "hi-IN-MadhurNeural")
RATE = os.environ.get("RATE", "+14%")
PROXY = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")

# The Hindi voice reads common English words well, but stumbles on product names and
# acronyms, so those are spelled phonetically in Devanagari just for the audio.
SAY = [
    ("urls.py", "यू आर एल्स डॉट पाई"), ("PostgreSQL", "पोस्टग्रेस क्यू एल"), ("Postgres", "पोस्टग्रेस"), ("PgBouncer", "पीजी बाउंसर"),
    ("Django", "जैंगो"), ("Gunicorn", "गनिकॉर्न"), ("Nginx", "इंजिन एक्स"), ("Redis", "रेडिस"), ("Celery Beat", "सेलरी बीट"), ("Celery", "सेलरी"),
    ("Dockerfile", "डॉकर फ़ाइल"), ("docker compose", "डॉकर कम्पोज़"), ("Docker", "डॉकर"), ("MySQL", "माय एस क्यू एल"), ("SQLite", "एस क्यू लाइट"),
    ("MongoDB", "मॉन्गो डी बी"), ("SQL", "एस क्यू एल"), ("ORM", "ओ आर एम"), ("WSGI", "विज़गी"), ("LDAP", "एल डैप"), ("CSRF", "सी एस आर एफ"),
    ("ACID", "एसिड"), ("MVT", "एम वी टी"), ("MVC", "एम वी सी"), ("ERP", "ई आर पी"), ("HTTP", "एच टी टी पी"), ("HTML", "एच टी एम एल"),
    ("URL", "यू आर एल"), ("CPU", "सी पी यू"), ("GIL", "जी आई एल"), ("YAML", "यैमल"), ("RAM", "रैम"), ("CCTV", "सी सी टी वी"), ("CSS", "सी एस एस"),
    ("WhiteNoise", "व्हाइट नॉइज़"), ("Apache", "अपाचे"), ("cache", "कैश"), ("queue", "क्यू"), ("QuerySet", "क्वेरी सेट"),
    ("makemigrations", "मेक माइग्रेशन्स"), ("runserver", "रन सर्वर"), ("select_related", "सिलेक्ट रिलेटेड"), ("prefetch_related", "प्रीफ़ेच रिलेटेड"),
    ("B-tree", "बी ट्री"), ("hash", "हैश"), ("prev", "प्रीवियस"), ("CONN MAX AGE", "कॉन मैक्स एज"), ("WiFi", "वाई फ़ाई"), ("idle", "आइडल"),
    ("seal", "सील"), ("sealers", "सीलर्स"), ("Verify", "वेरिफ़ाई"), ("lazy", "लेज़ी"), ("content", "कॉन्टेंट"), ("altered", "ऑल्टर्ड"), ("intact", "इनटैक्ट"), ("sealers", "सीलर्स"), ("genesis", "जेनेसिस"), ("Git", "गिट"), ("JOIN", "जॉइन"), ("dabbe", "डब्बे"), ("dabba", "डब्बा"),
]
def spoken(text):
    for a, b in SAY:
        text = re.sub(r"(?<![A-Za-z])" + re.escape(a) + r"(?![A-Za-z])", b, text, flags=re.I)
    return text

def dur(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).strip())

async def one(sem, b, cache):
    out = os.path.join(ROOT, "audio", b["id"] + ".mp3")
    text = spoken(b["say"])
    key = hashlib.sha1(f"{VOICE}|{RATE}|{text}".encode()).hexdigest()
    if cache.get(b["id"]) == key and os.path.exists(out):
        return
    async with sem:
        for attempt in range(5):
            try:
                await edge_tts.Communicate(text, VOICE, rate=RATE, proxy=PROXY).save(out)
                if os.path.getsize(out) > 2000:
                    cache[b["id"]] = key
                    return
            except Exception as e:  # network hiccup: back off and retry
                err = e
            await asyncio.sleep(2 * (attempt + 1))
        raise RuntimeError(f"TTS failed for {b['id']}: {err}")

async def main():
    data = json.load(open(os.path.join(ROOT, "out/beats.json")))
    os.makedirs(os.path.join(ROOT, "audio"), exist_ok=True)
    cpath = os.path.join(ROOT, "audio", ".cache.json")
    cache = json.load(open(cpath)) if os.path.exists(cpath) else {}
    sem = asyncio.Semaphore(6)
    try:
        await asyncio.gather(*(one(sem, b, cache) for b in data["beats"]))
    finally:
        json.dump(cache, open(cpath, "w"))
    durs = {b["id"]: round(dur(os.path.join(ROOT, "audio", b["id"] + ".mp3")), 3) for b in data["beats"]}
    open(os.path.join(ROOT, "durations.js"), "w").write("window.DUR=" + json.dumps(durs) + ";\n")
    print(len(durs), "clips,", round(sum(durs.values()) / 60, 2), "min of narration")

asyncio.run(main())
