// Preview: one screenshot per beat (at ~96% of the beat) for a chapter. usage: node build/snap.mjs <chapterId> [outDir]
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PW_PATH || "playwright");
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ch = process.argv[2];
const out = process.argv[3] || path.join(root, "out/snap");
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 0.5 });
p.on("pageerror", (e) => console.log("PAGEERROR", e.message));
p.on("console", (m) => m.type() === "error" && console.log("CONSOLE", m.text()));
await p.goto("file://" + root + "/stage.html?render=1" + (ch ? "&ch=" + ch : ""));
await p.waitForFunction("window.BEATS");
await p.evaluate("document.fonts.ready");
const beats = await p.evaluate("beatsInfo()");
for (const bt of beats) {
  await p.evaluate((t) => seek(t), bt.start + bt.dur * 0.96 - 0.35);
  await p.screenshot({ path: path.join(out, bt.id + ".jpg"), type: "jpeg", quality: 80 });
}
console.log(beats.length, "beats", (await p.evaluate("TOTAL")).toFixed(1) + "s");
await b.close();
