# Architecture explainer — video + learning site

A Hinglish explainer of the stack behind an academic ERP (Django, PostgreSQL, Gunicorn, reverse proxy,
Docker, Redis, Celery, PgBouncer, hash-chained audit log), aimed at first-year students and interview prep.

| Folder | What |
|---|---|
| `video/` | Scene engine (`lib.js`, GSAP) + one file per chapter in `chapters/`. Final narration lives in `narration.js`. |
| `docs/` | Static companion site (no build step): animated lessons, notes, quizzes, interview bank, hash-chain playground, doubt chat. Deployable to GitHub Pages as-is. |
| `ai-proxy/` | Optional Cloudflare Worker so site visitors can use the AI tutor without their own key. |
| `deliverables/` | Rendered MP4 (not committed — too large), subtitles, thumbnail, YouTube description. |

## Rebuild the video

```bash
cd video && npm install                 # gsap; needs Playwright + Chromium, ffmpeg, python3 with numpy and edge-tts
node build/beats.mjs                    # export narration beats -> out/beats.json
python3 build/voice.py synth            # Gemini TTS, one request per narrator block (needs GEMINI_API_KEY)
python3 build/voice.py cut              # align words, cut pauses, slice per beat -> audio/*.mp3 + durations.js
python3 build/voice.py check            # listening-model check against the script
node build/beats.mjs                    # re-export with real timings
ls chapters | sed 's/_.*//' | xargs -P 4 -I{} node build/render.mjs {}   # one MP4 per chapter
python3 build/final.py                  # join + subtitles + description -> ../deliverables
python3 build/site.py                   # refresh docs/player + transcript
```

Preview a chapter in the browser: open `video/stage.html?ch=c04`. Contact sheets: `build/sheet.sh c04`.

## Publish the site (GitHub Pages)

Enable Pages: Settings → Pages → Deploy from a branch → `main`, folder `/docs`.
Then set `youtubeUrl` (and optionally `proxyUrl`) in `docs/assets/config.js`.
