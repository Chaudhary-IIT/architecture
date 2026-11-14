// Re-mix every chapter's soundtrack and re-mux it onto the already-rendered video (no frames re-rendered).
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PW_PATH || "playwright");
import { fileURLToPath } from "url";
import { execFileSync } from "child_process";
import path from "path";
import fs from "fs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmp = path.join(root, "out/remix"); fs.mkdirSync(tmp, { recursive: true });
const b = await chromium.launch();
for (const f of fs.readdirSync(path.join(root, "chapters")).sort()) {
  const ch = f.split("_")[0];
  const p = await b.newPage();
  await p.goto("file://" + root + "/stage.html?render=1&ch=" + ch);
  await p.waitForFunction("window.BEATS");
  const meta = { total: await p.evaluate("TOTAL"), beats: await p.evaluate("beatsInfo()"), sfx: await p.evaluate("SFX") };
  await p.close();
  fs.writeFileSync(path.join(tmp, "m.json"), JSON.stringify(meta));
  execFileSync("python3", [path.join(root, "build/audio.py"), path.join(tmp, "m.json"), path.join(tmp, "a.wav")]);
  const src = path.join(root, "out/chapters", ch + ".mp4"), out = path.join(tmp, ch + ".mp4");
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", src, "-i", path.join(tmp, "a.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", out]);
  fs.renameSync(out, src);
  console.log(ch, "remixed");
}
await b.close();
