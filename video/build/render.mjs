// Render one chapter to out/chapters/<id>.mp4 (video + narration). usage: node build/render.mjs <chapterId>
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PW_PATH || "playwright");
import { fileURLToPath } from "url";
import { spawn, execFileSync } from "child_process";
import path from "path";
import fs from "fs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ch = process.argv[2], FPS = 30;
const outDir = path.join(root, "out/chapters"), tmp = path.join(root, "out/tmp", ch);
fs.mkdirSync(outDir, { recursive: true }); fs.mkdirSync(tmp, { recursive: true });

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on("pageerror", (e) => { console.error("PAGEERROR", e.message); process.exit(1); });
await p.goto("file://" + root + "/stage.html?render=1&ch=" + ch);
await p.waitForFunction("window.BEATS");
await p.evaluate("document.fonts.ready");
const total = await p.evaluate("TOTAL"), active = await p.evaluate("ACTIVE"), beats = await p.evaluate("beatsInfo()");
const frames = Math.round(total * FPS);

// ---- audio: narration + sound effects + music bed, mixed in Python
const sfxEv = await p.evaluate("SFX");
fs.writeFileSync(path.join(tmp, "meta.json"), JSON.stringify({ total, beats, sfx: sfxEv }));
execFileSync("python3", [path.join(root, "build/audio.py"), path.join(tmp, "meta.json"), path.join(tmp, "audio.wav")]);

// ---- video: every frame is captured (the background is always gently moving)
const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-", "-i", path.join(tmp, "audio.wav"),
  "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", String(FPS), "-g", "60", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-shortest", "-movflags", "+faststart",
  path.join(outDir, ch + ".mp4")], { stdio: ["pipe", "inherit", "inherit"] });
const done = new Promise((res, rej) => ff.on("close", (c) => (c ? rej(new Error("ffmpeg " + c)) : res())));
const isActive = (t) => active.some(([a, z]) => t >= a - 0.04 && t <= z + 0.08);
let last = null, shots = 0;
for (let f = 0; f < frames; f++) {
  const t = f / FPS;
  {
    await p.evaluate((x) => seek(x), t);
    last = await p.screenshot({ type: "jpeg", quality: 94 });
    shots++;
  }
  if (!ff.stdin.write(last)) await new Promise((r) => ff.stdin.once("drain", r));
}
ff.stdin.end();
await done; await b.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(ch, total.toFixed(1) + "s", frames, "frames,", shots, "rendered");
