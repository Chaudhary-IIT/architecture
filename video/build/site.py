"""Copy the animation player + narration into ../site/player and write the transcript data. Run after tts.py + beats.mjs."""
import json, os, shutil
V = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(os.path.dirname(V), "docs")
P = os.path.join(S, "player")
shutil.rmtree(P, ignore_errors=True)
os.makedirs(os.path.join(P, "audio"))
for f in ["stage.html", "stage.css", "lib.js", "gsap.min.js", "durations.js", "narration.js"]:
    shutil.copy(os.path.join(V, f), P)
shutil.copytree(os.path.join(V, "chapters"), os.path.join(P, "chapters"))
data = json.load(open(os.path.join(V, "out/beats.json")))
tr = {}
for b in data["beats"]:
    shutil.copy(os.path.join(V, "audio", b["id"] + ".mp3"), os.path.join(P, "audio"))
    tr.setdefault(b["ch"], []).append(b["say"])
open(os.path.join(S, "assets/transcript.js"), "w").write("window.TRANSCRIPT=" + json.dumps(tr, ensure_ascii=False) + ";\n")
open(os.path.join(S, ".nojekyll"), "w").write("")
print("site/player ready:", sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(S) for f in fs) // 1024, "KB total site size")
