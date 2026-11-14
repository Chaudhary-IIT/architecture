"""Join chapter MP4s into the final video and write subtitles + YouTube description. Run after render.mjs for all chapters."""
import json, os, re, subprocess
V = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
O = os.path.join(V, "out")
D = os.path.join(os.path.dirname(V), "deliverables")
os.makedirs(D, exist_ok=True)
data = json.load(open(os.path.join(O, "beats.json")))
chs = data["chapters"]
open(os.path.join(O, "concat.txt"), "w").write("".join(f"file '{O}/chapters/{c['id']}.mp4'\n" for c in chs))
final = os.path.join(D, "ERP_Architecture_Hinglish_1080p.mp4")
joined = os.path.join(O, "joined.mp4")
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", os.path.join(O, "concat.txt"), "-c", "copy", joined])
def loud(path, extra=""):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-vn", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" + extra, "-f", "null", "-"], capture_output=True, text=True).stderr
    return json.loads(r[r.rindex("{"):r.rindex("}") + 1])
m = loud(joined)   # pass 1: measure; pass 2: linear gain to -14 LUFS with a true-peak ceiling, video untouched
af = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.check_call(["ffmpeg", "-v", "error", "-y", "-i", joined, "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", final])
after = loud(final)
print("loudness after AAC encode:", after["input_i"], "LUFS, true peak", after["input_tp"], "dBTP")

def ts(t, sep=","):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02}{sep}{ms:03}"
dur = json.loads(open(os.path.join(V, "durations.js")).read().split("=", 1)[1].rstrip(";\n"))
srt, n = [], 1
for b in data["beats"]:
    words = b["say"].split()
    chunks = [" ".join(words[i:i + 11]) for i in range(0, len(words), 11)]
    total = sum(len(c) for c in chunks); t = b["start"]; span = dur[b["id"]]
    for c in chunks:
        d = span * len(c) / total
        srt.append(f"{n}\n{ts(t)} --> {ts(t + d)}\n{c}\n"); n += 1; t += d
open(os.path.join(D, "subtitles_hinglish.srt"), "w").write("\n".join(srt))

names = {"c00": "10:00:00 — 3000 students, ek button", "c13": "Poora safar + interview one-liners"}
stamp = lambda t: f"{int(t // 60)}:{int(t % 60):02}"
lines = [f"{stamp(c['start'])} {names.get(c['id'], c['title'])}" for c in chs]
open(os.path.join(D, "youtube_description.txt"), "w").write(f"""TITLE (options)
1. Django + PostgreSQL + Redis + Celery + Docker: Ek Real ERP ka Poora Architecture | Zero se Interview tak (Hinglish)
2. System Design for Beginners: Academic ERP kaise bana hai? Django, Gunicorn, Nginx, PgBouncer, Hash Chain Audit Log
3. 35 Minute me Backend Architecture: Django se Docker tak | Interview Q&A ke saath

DESCRIPTION
3,000 students ek saath course registration karte hain — phir bhi server crash nahi hota, data galat nahi hota, aur har click ka record rehta hai. Kaise?

Is video me hum ek real academic ERP (student registration, grading, bulk uploads) ka poora architecture bilkul zero se samjhenge — aur har topic ke baad: interview me kya bolna hai.

🌐 Companion website (interactive animations, quiz, 70+ interview Q&A, AI doubt solver): <YOUR-SITE-LINK>

⏱️ CHAPTERS
{chr(10).join(lines)}

🧠 Is video me
• Django: MVT, request lifecycle, middleware • ORM: QuerySet, migrations, N+1, select_related
• PostgreSQL: ACID, constraints, indexes, race conditions • Gunicorn: WSGI, workers, threads, GIL
• Nginx / reverse proxy: TLS, buffering, static files • Docker & docker-compose: image, container, volumes
• Redis: cache-aside, sessions, rate limiting, eviction • Celery: task queue, progress polling, Beat
• PgBouncer: connection pooling, transaction mode • Login & security: LDAP, sessions, CSRF
• Audit log hash chain: SHA-256, sealing, verify, limits

🧠 Video me 4 quick quiz hain — apna score comment me batao!

Note: narration AI voice (text-to-speech) se bani hai; music aur sound effects original (synthesized) hain.

TAGS
django, postgresql, redis, celery, docker, gunicorn, nginx, pgbouncer, system design hindi, backend architecture, django interview questions, system design for beginners, hash chain, audit log, web development hindi, hinglish, placement preparation, backend developer roadmap
""")
print("final:", final, round(os.path.getsize(final) / 1e6, 1), "MB,", stamp(data["total"]))
