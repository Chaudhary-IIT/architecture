// Export all beats (id + narration) to out/beats.json
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)(process.env.PW_PATH || "playwright");
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
fs.mkdirSync(path.join(root, "out"), { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on("pageerror", (e) => console.log("PAGEERROR", e.message));
await p.goto("file://" + root + "/stage.html?render=1");
await p.waitForFunction("window.BEATS");
const beats = await p.evaluate("beatsInfo()");
const chapters = await p.evaluate("chaptersInfo()");
fs.writeFileSync(path.join(root, "out/beats.json"), JSON.stringify({ total: await p.evaluate("TOTAL"), chapters, beats }, null, 1));
console.log(beats.length, "beats,", (await p.evaluate("TOTAL") / 60).toFixed(1), "min; words:", beats.reduce((a, x) => a + x.say.split(/\s+/).length, 0));
await b.close();
