/* ERP Architecture course — static site logic (no build step, no dependencies). */
(() => {
  const C = window.COURSE, SITE = window.SITE || {}, TR = window.TRANSCRIPT || {};
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  let done = new Set(store.get("erp.done", []));
  const main = $("#main");

  if (SITE.youtubeUrl) { const y = $("#ytLink"); y.href = SITE.youtubeUrl; y.hidden = false; }

  /* ---------------- sidebar ---------------- */
  function toc(active) {
    $("#toc").innerHTML = C.map((c) => `<li><a href="#/${c.slug}" class="${c.slug === active ? "on" : ""} ${done.has(c.id) ? "done" : ""}" style="--cc:${c.color}"><span class="ic">${c.icon}</span>${esc(c.title)}<span class="ck">✓</span></a></li>`).join("");
    const n = C.filter((c) => done.has(c.id)).length;
    $("#progFill").style.width = (n / C.length) * 100 + "%";
    $("#progTxt").textContent = `${n} / ${C.length} done`;
  }
  $("#menuBtn").onclick = () => $("#side").classList.toggle("open");
  $("#side").addEventListener("click", (e) => { if (e.target.closest("a")) $("#side").classList.remove("open"); });

  /* ---------------- chapter page ---------------- */
  function chapter(c) {
    const i = C.indexOf(c), prev = C[i - 1], next = C[i + 1];
    main.style.setProperty("--c", c.color);
    let h = `<div class="kicker">${i === 0 ? "Welcome" : "Chapter " + String(i).padStart(2, "0")}</div><h1>${c.icon} ${esc(c.title)}</h1><p class="tag">${c.tagline}</p>`;
    if (i === 0) h += hero();
    h += `<div class="player"><iframe src="player/stage.html?ch=${c.id}" title="${esc(c.title)} animation" allow="autoplay" loading="lazy"></iframe></div>
      <p class="hint">▶ Play dabao · Space = pause · ← → = pichhla/agla step · CC = captions · 1× = speed</p>`;
    h += `<h2>Is chapter me</h2><ul class="points">${c.points.map((p) => `<li>${p}</li>`).join("")}</ul>`;
    h += `<h2>Notes</h2><div class="prose">${c.body}</div>`;
    if (c.qa.length) h += `<h2>Interview Q&amp;A</h2>` + c.qa.map(([q, a]) => `<details class="qa"><summary>${esc(q)}</summary><div class="a">${esc(a)}</div></details>`).join("");
    if (c.quiz.length) h += `<h2>Quick quiz</h2><div id="quiz"></div>`;
    if (TR[c.id]) h += `<h2>Transcript</h2><details class="tr"><summary>Video ka poora narration (Hinglish)</summary><div class="tx">${TR[c.id].map((t) => `<p>${esc(t)}</p>`).join("")}</div></details>`;
    h += `<div class="nav2">${prev ? `<a class="btn" href="#/${prev.slug}">← ${esc(prev.title)}</a>` : "<span></span>"}
      <button class="btn ${done.has(c.id) ? "done" : ""}" id="doneBtn">${done.has(c.id) ? "✓ Done" : "Mark as done"}</button>
      ${next ? `<a class="btn pri" href="#/${next.slug}">${esc(next.title)} →</a>` : `<a class="btn pri" href="#/interview">Interview bank →</a>`}</div>`;
    main.innerHTML = h;
    $("#doneBtn").onclick = () => { done.has(c.id) ? done.delete(c.id) : done.add(c.id); store.set("erp.done", [...done]); route(); };
    const qz = $("#quiz");
    if (qz) c.quiz.forEach(([q, opts, ans, why]) => {
      const box = el("div", "quiz", `<div class="q">${esc(q)}</div><div class="opts"></div><div class="why"></div>`);
      opts.forEach((o, k) => {
        const b = el("button", "", esc(o));
        b.onclick = () => {
          box.querySelectorAll("button").forEach((x, j) => { x.disabled = true; if (j === ans) x.classList.add("ok"); });
          if (k !== ans) b.classList.add("no");
          box.querySelector(".why").textContent = (k === ans ? "✅ Sahi! " : "❌ ") + why;
        };
        box.querySelector(".opts").appendChild(b);
      });
      qz.appendChild(box);
    });
  }
  function hero() {
    const stack = [["Django", "#44d19a"], ["PostgreSQL", "#6aa9ff"], ["Gunicorn", "#3fd0c9"], ["Nginx", "#35c46b"], ["Docker", "#4ab3ff"], ["Redis", "#ff6b5e"], ["Celery", "#b9e34f"], ["PgBouncer", "#b48cff"], ["Hash-chain audit log", "#f5c542"]];
    return `<div class="hero"><div class="chips">${stack.map(([t, c]) => `<span style="--cc:${c}">${t}</span>`).join("")}</div></div>`;
  }

  /* ---------------- architecture map ---------------- */
  function mapPage() {
    main.style.setProperty("--c", "#4ab3ff");
    const by = (s) => C.find((c) => c.slug === s);
    const card = (s, sub) => { const c = by(s); return `<a class="card" href="#/${c.slug}" style="--cc:${c.color}"><div class="e">${c.icon}</div><b>${esc(c.title)}</b><small>${sub}</small></a>`; };
    main.innerHTML = `<div class="kicker">Big picture</div><h1>🗺️ Architecture map</h1><p class="tag">Kisi bhi dabbe par click karo — seedha us chapter par.</p>
      <p class="flow">Browser → reverse proxy → app server → framework → pool → database</p>
      <div class="map">${card("web-basics", "Browser ↔ server, HTTP")}${card("nginx", "TLS, buffering, static")}${card("gunicorn", "workers + threads")}${card("django", "middleware → view")}
      ${card("orm", "Python ⇄ SQL")}${card("pgbouncer", "connection pool")}${card("postgresql", "ACID, constraints")}${card("redis", "cache, sessions, queue")}
      ${card("celery", "background jobs")}${card("security", "LDAP, sessions, CSRF")}${card("audit-hash-chain", "tamper-evident log")}${card("docker", "sab kuch containers me")}</div>
      <h2>Sab chapters</h2><div class="grid">${C.map((c, i) => `<a class="card" href="#/${c.slug}" style="--cc:${c.color}"><span class="n">${String(i).padStart(2, "0")}</span><div class="e">${c.icon}</div><b>${esc(c.title)}</b><small>${c.tagline}</small></a>`).join("")}</div>`;
  }

  /* ---------------- interview bank ---------------- */
  function interview() {
    main.style.setProperty("--c", "#f5c542");
    const all = C.flatMap((c) => c.qa.map(([q, a]) => ({ q, a, c })));
    main.innerHTML = `<div class="kicker">Revision</div><h1>🎯 Interview bank</h1><p class="tag">${all.length} sawaal — “why” aur “how” dono ke jawab ke saath.</p>
      <input class="search" id="qs" placeholder="Search: index, WSGI, cache invalidation…" autocomplete="off"><div class="filters" id="fl"></div><div id="ql"></div>`;
    let topic = "";
    const draw = () => {
      const s = $("#qs").value.trim().toLowerCase();
      const L = all.filter((x) => (!topic || x.c.id === topic) && (!s || (x.q + " " + x.a).toLowerCase().includes(s)));
      $("#ql").innerHTML = L.map((x) => `<details class="qa"><summary>${esc(x.q)}<span class="tp">${x.c.icon} ${esc(x.c.title)}</span></summary><div class="a">${esc(x.a)}</div></details>`).join("") || `<p class="hint">Kuch nahi mila. “Ask a doubt” try karo.</p>`;
    };
    $("#fl").innerHTML = `<button class="on" data-t="">All</button>` + C.filter((c) => c.qa.length).map((c) => `<button data-t="${c.id}">${c.icon} ${esc(c.title)}</button>`).join("");
    $("#fl").onclick = (e) => { const b = e.target.closest("button"); if (!b) return; topic = b.dataset.t; $("#fl").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); draw(); };
    $("#qs").oninput = draw; draw();
  }

  /* ---------------- hash chain playground (real SHA-256) ---------------- */
  function sha256(str) {
    const K = [], H = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225];
    for (let n = 2, i = 0; i < 64; n++) { let p = true; for (let d = 2; d * d <= n; d++) if (n % d === 0) { p = false; break; } if (p) K[i++] = (Math.cbrt(n) % 1) * 4294967296 | 0; }
    const b = [...new TextEncoder().encode(str)], l = b.length * 8;
    b.push(128); while (b.length % 64 !== 56) b.push(0);
    for (let i = 7; i >= 0; i--) b.push(i > 3 ? 0 : (l >>> (i * 8)) & 255);
    const h = H.slice(), w = new Int32Array(64), r = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < b.length; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = (b[o + i * 4] << 24) | (b[o + i * 4 + 1] << 16) | (b[o + i * 4 + 2] << 8) | b[o + i * 4 + 3];
      for (let i = 16; i < 64; i++) { const a = w[i - 15], c = w[i - 2]; w[i] = (w[i - 16] + (r(a, 7) ^ r(a, 18) ^ (a >>> 3)) + w[i - 7] + (r(c, 17) ^ r(c, 19) ^ (c >>> 10))) | 0; }
      let [a, bb, c, d, e, f, g, hh] = h;
      for (let i = 0; i < 64; i++) {
        const t1 = (hh + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
      }
      [a, bb, c, d, e, f, g, hh].forEach((v, i) => (h[i] = (h[i] + v) | 0));
    }
    return h.map((v) => (v >>> 0).toString(16).padStart(8, "0")).join("");
  }
  const GENESIS = "0".repeat(64);
  const canon = (r) => JSON.stringify({ content: r.content, id: r.id });
  const entryHash = (prev, r) => sha256(prev + "\n" + canon(r));
  let PG = null;
  function pgReset() {
    PG = [{ id: 101, content: "LOGIN prof.rao 10:02" }, { id: 102, content: "UPDATE grade B -> A (student b23101)" }, { id: 103, content: "VIEW /results/ b23101" }, { id: 104, content: "LOGOUT prof.rao 10:20" }];
    pgSeal();
  }
  function pgSeal() {
    let prev = GENESIS;
    for (const r of PG) { if (r.hash) { prev = r.hash; continue; } r.prev = prev; r.hash = prev = entryHash(prev, r); }
  }
  function pgVerify() {
    let prev = GENESIS, verdict = { ok: true, msg: "chain intact — sab sealed rows sahi hain" };
    for (const r of PG) {
      r.state = "ok";
      if (!r.hash) { r.state = "un"; continue; }
      if (!verdict.ok) { r.state = "skip"; continue; }
      if (r.prev !== prev) { r.state = "link"; verdict = { ok: false, msg: `broken link at row ${r.id} — koi sealed row delete/reorder hui, ya pichhli row ka hash badla gaya` }; continue; }
      if (entryHash(prev, r) !== r.hash) { r.state = "content"; verdict = { ok: false, msg: `content altered at row ${r.id} — is row ka data seal ke baad badla gaya` }; continue; }
      prev = r.hash;
    }
    return verdict;
  }
  function playground() {
    main.style.setProperty("--c", "#f5c542");
    if (!PG) pgReset();
    const v = pgVerify(), short = (h) => (h ? h.slice(0, 16) + "…" + h.slice(-6) : "NULL");
    const label = { ok: ["ok", "✓ hash match"], content: ["no", "✗ content altered"], link: ["no", "✗ broken link"], un: ["un", "○ unsealed (abhi chain me nahi)"], skip: ["un", "— (pehle wali galti ke baad check ruk gaya)"] };
    main.innerHTML = `<div class="kicker">Hands-on</div><h1>🧪 Hash chain playground</h1>
      <p class="tag">Asli SHA-256. Kisi row ka text badlo, row delete karo, ya “attacker” ban kar hash dobara likho — aur dekho verify kya pakadta hai.</p>
      <div class="verdict ${v.ok ? "ok" : "no"}">${v.ok ? "✅" : "🚨"} verify_audit_chain(): ${esc(v.msg)}</div>
      <div id="rows">${PG.map((r, i) => `<div class="pg-row ${["content", "link"].includes(r.state) ? "bad" : ""} ${r.hash ? "" : "unsealed"}"><div class="id">${r.id}</div><div>
        <button class="del" data-del="${i}" title="Delete row">🗑 delete</button>
        <input data-i="${i}" value="${esc(r.content)}" aria-label="Row ${r.id} content">
        <div class="h">prev_hash: <b>${short(r.prev)}</b><br>entry_hash: <i>${short(r.hash)}</i></div>
        <div class="st ${label[r.state][0]}">${label[r.state][1]} ${["content", "link"].includes(r.state) ? `<button class="btn" style="padding:3px 10px;font-size:12.5px;margin-left:8px" data-forge="${i}">😈 Attacker: is row ka hash dobara likho</button>` : ""}</div></div></div>`).join("")}</div>
      <div class="pg-bar"><button class="btn" id="pgAdd">＋ Nayi row (unsealed)</button><button class="btn pri" id="pgSeal">⏰ Sealer chalao (Celery Beat)</button><button class="btn" id="pgReset">↺ Reset</button></div>
      <div class="prose"><h4>Try karo</h4><ol>
        <li>Row 102 me <code>B -&gt; A</code> ko <code>B -&gt; B</code> kar do → <b>content altered</b>.</li>
        <li>“Attacker” button dabao → row 102 theek lagegi, par ab row 103 par <b>broken link</b>. Chain ke ant tak yahi karna padega.</li>
        <li>Reset karke row 102 delete karo → row 103 par <b>broken link</b>.</li>
        <li>Nayi row add karo: wo <i>unsealed</i> hai (hash NULL) jab tak sealer nahi chalta — yahi “unsealed tail” hai.</li>
        <li>Sochne ki baat: agar attacker <u>saari</u> rows ka hash dobara likh de to? Verify pass ho jayega — isiliye latest hash ko database ke bahar bhi save (anchor) karna chahiye.</li></ol>
        <pre>entry_hash = sha256(prev_hash + "\\n" + canonical_json(row))</pre></div>`;
    main.querySelectorAll("input[data-i]").forEach((inp) => (inp.onchange = () => { PG[+inp.dataset.i].content = inp.value; playground(); }));
    main.querySelectorAll("[data-del]").forEach((b) => (b.onclick = () => { PG.splice(+b.dataset.del, 1); playground(); }));
    main.querySelectorAll("[data-forge]").forEach((b) => (b.onclick = () => { const i = +b.dataset.forge, r = PG[i]; r.prev = i ? PG[i - 1].hash : GENESIS; r.hash = entryHash(r.prev, r); playground(); }));
    $("#pgAdd").onclick = () => { PG.push({ id: (PG.length ? PG[PG.length - 1].id : 100) + 1, content: "VIEW /dashboard/ " + new Date().toLocaleTimeString() }); playground(); };
    $("#pgSeal").onclick = () => { pgSeal(); playground(); };
    $("#pgReset").onclick = () => { pgReset(); playground(); };
  }

  /* ---------------- router ---------------- */
  function route() {
    const slug = (location.hash.replace(/^#\/?/, "") || "start").split("?")[0];
    const c = C.find((x) => x.slug === slug);
    toc(slug);
    if (slug === "playground") playground();
    else if (slug === "interview") interview();
    else if (slug === "map") mapPage();
    else chapter(c || C[0]);
    window.scrollTo(0, 0);
    document.title = (c ? c.title + " — " : "") + "ERP Architecture zero se";
  }
  addEventListener("hashchange", route);
  route();

  /* ======================= doubt chat ======================= */
  const chat = $("#chat"), msgs = $("#msgs"), hist = [];
  const strip = (h) => h.replace(/<pre>[\s\S]*?<\/pre>/g, (m) => "\n" + m.replace(/<[^>]+>/g, "") + "\n").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/[ \t]+/g, " ");
  const KNOWLEDGE = C.map((c) => `## ${c.title} (${c.tagline})\n${c.points.map(strip).join("\n")}\n${strip(c.body)}\n${c.qa.map(([q, a]) => `Q: ${q}\nA: ${a}`).join("\n")}`).join("\n\n");
  const SYSTEM = `You are a friendly senior engineer tutoring a first-year Indian undergraduate about the architecture of an academic ERP web app (student registration, grading, bulk uploads) built with Django, PostgreSQL, Gunicorn, a reverse proxy (Nginx concept; Apache in this deployment), Docker Compose, Redis, Celery, PgBouncer and a SHA-256 hash-chained audit log.
Rules:
- Reply in simple Hinglish written in Roman script (Hindi + English mix), unless the student writes in pure English or asks for another language.
- Assume zero background. Start with a one-line direct answer, then a short everyday analogy, then how it works in this ERP. Keep it under ~180 words unless asked for depth.
- When useful, end with "Interview line:" followed by one crisp sentence the student can say in an interview.
- Use the COURSE NOTES below as the source of truth for how this specific system works. For general CS questions you may use your own knowledge. If you are not sure, say so instead of inventing details.
- Stay on computer science, this stack and interview preparation; politely decline unrelated requests.

COURSE NOTES:
${KNOWLEDGE}`;

  function say(role, html) { const m = el("div", "m " + (role === "u" ? "u" : "b"), html); msgs.appendChild(m); msgs.scrollTop = msgs.scrollHeight; return m; }
  const md = (t) => esc(t).replace(/```(?:\w+)?\n?([\s\S]*?)```/g, "<code>$1</code>").replace(/`([^`\n]+)`/g, "<code>$1</code>").replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>").replace(/^\s*[*-] /gm, "• ");

  /* --- offline answerer: keyword search over the interview bank --- */
  const STOP = new Set("kya hai hota hoti hote ka ki ke ko me mein se aur ya to the a an is are of in on for what why how kyun kaise kab kaun kis par bhi hi nahi ho kar karta karte karna do batao samjhao explain please mujhe yeh ye wo woh ek".split(" "));
  const SYN = { postgres: "postgresql", pg: "postgresql", db: "database", nginx: "proxy", apache: "proxy", cache: "cache", caching: "cache", queue: "celery", task: "celery", tasks: "celery", pool: "pooling", pooler: "pooling", hashing: "hash", blockchain: "blockchain", session: "session", sessions: "session", login: "login", jwt: "jwt", index: "index", indexes: "index", indexing: "index", worker: "workers", thread: "threads", container: "container", containers: "container", image: "image", middleware: "middleware", migrations: "migration", n1: "n+1" };
  const tok = (s) => s.toLowerCase().replace(/[^a-z0-9+_ ]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).map((w) => SYN[w] || w);
  const BANK = C.flatMap((c) => c.qa.map(([q, a]) => ({ q, a, c, tq: tok(q + " " + c.title), ta: tok(a) })));
  function offline(text) {
    const T = tok(text);
    if (!T.length) return null;
    const scored = BANK.map((x) => ({ x, s: T.reduce((n, w) => n + (x.tq.includes(w) ? 3 : 0) + (x.ta.includes(w) ? 1 : 0) + (x.tq.some((k) => k.startsWith(w) || w.startsWith(k)) ? 0.5 : 0), 0) })).filter((r) => r.s >= 3).sort((a, b) => b.s - a.s);
    return scored.slice(0, 2).map((r) => r.x);
  }

  /* --- Gemini (visitor's own free key) or an optional owner-run proxy --- */
  const API = "https://generativelanguage.googleapis.com/v1beta/";
  const getKey = () => store.get("erp.gkey", "");
  async function pickModel(key) {
    const r = await fetch(API + "models?pageSize=200", { headers: { "x-goog-api-key": key } });
    const j = await r.json();
    if (!r.ok) throw new Error((j.error && j.error.message) || "HTTP " + r.status);
    const ver = (n) => parseFloat((n.match(/gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]);
    const L = (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes("generateContent") && /gemini-.*flash/.test(m.name) && !/preview|exp|tts|image|live|audio|embedding|thinking|native/.test(m.name));
    L.sort((a, b) => ver(b.name) - ver(a.name) || /lite/.test(a.name) - /lite/.test(b.name) || a.name.length - b.name.length);
    if (!L.length) throw new Error("Is key par koi Gemini flash model nahi mila");
    return L[0].name;
  }
  async function askAI(question) {
    const contents = [...hist.slice(-8), { role: "user", parts: [{ text: question }] }];
    const body = { system_instruction: { parts: [{ text: SYSTEM }] }, contents, generationConfig: { temperature: 0.5, maxOutputTokens: 900 } };
    let r;
    if (SITE.proxyUrl) r = await fetch(SITE.proxyUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    else {
      const key = getKey();
      let model = store.get("erp.gmodel", "");
      if (!model) { model = await pickModel(key); store.set("erp.gmodel", model); }
      r = await fetch(API + model + ":generateContent", { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key }, body: JSON.stringify(body) });
      if (r.status === 404) store.del("erp.gmodel");
    }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error((j.error && j.error.message) || "HTTP " + r.status);
    const text = ((j.candidates || [])[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
    if (!text) throw new Error("AI ne khaali jawab diya");
    hist.push({ role: "user", parts: [{ text: question }] }, { role: "model", parts: [{ text }] });
    return text;
  }
  const aiOn = () => !!(SITE.proxyUrl || getKey());
  function modeBadge() { const m = $("#chatMode"); m.textContent = aiOn() ? "AI tutor on" : "offline notes"; m.classList.toggle("ai", aiOn()); }

  async function send(text) {
    text = text.trim(); if (!text) return;
    say("u", esc(text));
    const hits = offline(text) || [];
    const src = hits.length ? `<span class="src">📖 Related: ${hits.map((x) => `<a href="#/${x.c.slug}">${x.c.icon} ${esc(x.c.title)}</a>`).join(" · ")}</span>` : "";
    if (aiOn()) {
      const m = say("b", "<i>Soch raha hoon…</i>");
      try { m.innerHTML = md(await askAI(text)) + src; }
      catch (e) { m.innerHTML = `⚠️ AI se jawab nahi aaya: ${esc(e.message)}<br><br>` + offlineHtml(hits); }
    } else say("b", offlineHtml(hits));
    msgs.scrollTop = msgs.scrollHeight;
  }
  function offlineHtml(hits) {
    if (!hits.length) return `Is sawaal ka seedha jawab notes me nahi mila. 🙈<br>• Alag shabdon me poochho (jaise “index”, “WSGI”, “cache invalidation”)<br>• <a href="#/interview">Interview bank</a> me search karo<br>• Ya ⚙️ se free AI tutor on kar lo — phir kuch bhi pooch sakte ho.`;
    return hits.map((x) => `<b>${esc(x.q)}</b>\n${esc(x.a)}<span class="src">📖 <a href="#/${x.c.slug}">${x.c.icon} ${esc(x.c.title)}</a></span>`).join("\n\n") + (aiOn() ? "" : `<span class="src">💡 Apne shabdon me jawab chahiye? ⚙️ se free AI tutor on karo.</span>`);
  }

  $("#askBtn").onclick = () => {
    chat.hidden = !chat.hidden;
    if (!chat.hidden && !msgs.children.length) {
      say("b", "Namaste! 👋 Is course ke kisi bhi topic par doubt poochho — Django, Postgres, Redis, Celery, hash chain, kuch bhi.\n\nAbhi main <b>notes me se</b> jawab dhoondhta hoon. Apne shabdon me AI se samajhna ho to ⚙️ dabakar free Gemini key daal do.");
      $("#sugg").innerHTML = ["Django kyun use kiya?", "N+1 problem kya hai?", "Redis aur Postgres me fark?", "Hash chain kaise kaam karti hai?", "PgBouncer transaction mode?", "Celery kyun, thread kyun nahi?"].map((s) => `<button>${s}</button>`).join("");
    }
    modeBadge(); $("#chatIn").focus();
  };
  $("#chatX").onclick = () => (chat.hidden = true);
  $("#chatCfg").onclick = () => { $("#cfgBox").hidden = !$("#cfgBox").hidden; $("#keyIn").value = getKey(); };
  if (SITE.proxyUrl) $("#chatCfg").hidden = true;
  $("#sugg").onclick = (e) => { if (e.target.tagName === "BUTTON") send(e.target.textContent); };
  $("#chatForm").onsubmit = (e) => { e.preventDefault(); const t = $("#chatIn"); send(t.value); t.value = ""; };
  $("#chatIn").onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("#chatForm").requestSubmit(); } };
  $("#keySave").onclick = async () => {
    const k = $("#keyIn").value.trim(), st = $("#keySt");
    if (!k) return;
    st.textContent = "Key check ho rahi hai…";
    try { const model = await pickModel(k); store.set("erp.gkey", k); store.set("erp.gmodel", model); st.textContent = "✅ AI tutor on — model: " + model.replace("models/", ""); modeBadge(); setTimeout(() => ($("#cfgBox").hidden = true), 1500); }
    catch (e) { st.textContent = "❌ " + e.message; }
  };
  $("#keyClear").onclick = () => { store.del("erp.gkey"); store.del("erp.gmodel"); $("#keyIn").value = ""; $("#keySt").textContent = "Key hata di gayi."; modeBadge(); };
})();
