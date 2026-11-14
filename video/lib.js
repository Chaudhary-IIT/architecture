/* Tiny scene engine on top of GSAP.
   Everything is built up-front into one paused master timeline so any frame can be
   rendered deterministically with master.seek(t) (used by the MP4 renderer) or played
   in real time with per-beat audio (used by the website player). */
const Q = new URLSearchParams(location.search);
const stage = document.getElementById("stage");
const master = gsap.timeline({ paused: true });
const CHAPTERS = [];
const BEATS = [];
const SFX = [];
const sfx = (type, t) => SFX.push({ t: +t.toFixed(3), type });
const GAP = 0.34;
let T = 0;
let curCh = null;

const C = {
  django: "#44d19a", pg: "#6aa9ff", guni: "#3fd0c9", nginx: "#35c46b", docker: "#4ab3ff", redis: "#ff6b5e",
  celery: "#b9e34f", bouncer: "#b48cff", sec: "#ffb454", audit: "#f5c542", web: "#7c9cff", bad: "#ff5d73", ok: "#4ade80", mute: "#9aa6d1",
};

function chapter(meta, fn) { CHAPTERS.push({ ...meta, fn }); }
function estimate(say) { return Math.max(2.5, say.replace(/\s+/g, " ").length / 15.5); }
function mk(tag, cls, html, parent) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  (parent || stage).appendChild(e);
  return e;
}
function place(e, o) {
  if (o.x != null) e.style.left = o.x + "px";
  if (o.y != null) e.style.top = o.y + "px";
  if (o.w != null) e.style.width = o.w + "px";
  if (o.h != null) e.style.height = o.h + "px";
  if (o.c) e.style.setProperty("--c", C[o.c] || o.c);
  if (o.z != null) e.style.zIndex = o.z;
  e._r = { x: o.x || 0, y: o.y || 0, w: o.w || 0, h: o.h || 0 };
  return e;
}
function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
function hlcode(src, lang) {
  let s = esc(src);
  const hold = [];
  const keep = (cls) => (m) => { hold.push(`<span class="${cls}">${m}</span>`); return String.fromCharCode(0xe000 + hold.length - 1); };
  s = s.replace(lang === "sql" ? /--.*$/g : /#.*$/g, keep("com"));
  s = s.replace(/("[^"]*"|'[^']*')/g, keep("str"));
  if (lang === "sql") {
    s = s.replace(/\b(SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|ON|AND|OR|ORDER BY|LIMIT|BEGIN|COMMIT|ROLLBACK|CREATE|UNIQUE|INDEX|TABLE|IN|AS|COUNT|NOT NULL|PRIMARY KEY|REFERENCES|IS|NULL|TRUE)\b/g, '<span class="sql">$1</span>');
  } else {
    s = s.replace(/\b(def|class|return|import|from|if|else|elif|for|in|with|as|not|and|or|None|True|False|try|except|raise|while|FROM|RUN|COPY|CMD|services|image|build|command|volumes|depends_on)\b/g, '<span class="kw">$1</span>');
    s = s.replace(/\b([A-Z][A-Za-z]+)(?=\(|\.)/g, '<span class="cls">$1</span>');
    s = s.replace(/\b([a-z_]+)(?=\()/g, '<span class="fn">$1</span>');
  }
  s = s.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
  return s.replace(/[\ue000-\uefff]/g, (c) => hold[c.charCodeAt(0) - 0xe000]);
}

class Scene {
  constructor(title, sub) {
    this.el = mk("div", "scene");
    this.el.style.display = "block";
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("class", "wires");
    this.svg.innerHTML = "<defs></defs>";
    this.el.appendChild(this.svg);
    this.start = T;
    if (title) {
      this.h = mk("h1", "st", title + (sub ? `<small>${sub}</small>` : ""), this.el);
      this.h.style.setProperty("--c", curCh.color);
    }
  }
  _n(cls, html, o) { return place(mk("div", "n " + cls, html, this.el), o); }
  box(o) {
    const html = (o.ic ? `<div class="ic">${o.ic}</div>` : "") + `<div><div class="lb">${o.t || ""}</div>` + (o.s ? `<div class="sb">${o.s}</div>` : "") + "</div>";
    return this._n("box" + (o.row ? " row" : "") + (o.sm ? " sm" : ""), html, { w: 260, h: 170, ...o });
  }
  zone(o) { return this._n("zone", `<div class="zl">${o.t}</div>`, { z: 0, ...o }); }
  text(o) {
    const e = this._n("txt" + (o.mono ? " mono" : ""), o.t, o);
    if (o.size) e.style.fontSize = o.size + "px";
    if (o.color) e.style.color = C[o.color] || o.color;
    if (o.align) e.style.textAlign = o.align;
    if (o.weight) e.style.fontWeight = o.weight;
    return e;
  }
  emoji(o) { const e = this._n("emo", o.t, o); e.style.fontSize = (o.size || 100) + "px"; return e; }
  pill(o) { return this._n("pill", o.t, o); }
  code(o) {
    const e = this._n("code", `<div class="ct"><i></i><i></i><i></i>${o.title || ""}</div><div class="cb"></div>`, o);
    if (o.size) e.style.setProperty("--fs", o.size + "px");
    const cb = e.querySelector(".cb");
    e.lines = o.lines.map((l) => mk("div", "ln", hlcode(l, o.lang) || "&nbsp;", cb));
    return e;
  }
  table(o) {
    const e = this._n("tbl", `<div class="tt">${o.title}</div>`, o);
    e.style.setProperty("--cols", o.grid || `repeat(${o.cols.length}, 1fr)`);
    if (o.size) e.style.setProperty("--fs", o.size + "px");
    mk("div", "tr th", o.cols.map((c) => `<div>${c}</div>`).join(""), e);
    e.rows = o.rows.map((r) => mk("div", "tr" + (o.hideRows ? " n" : ""), r.map((c) => `<div>${c}</div>`).join(""), e));
    return e;
  }
  list(o) {
    const e = this._n("lst", "", o);
    if (o.size) e.style.setProperty("--fs", o.size + "px");
    if (o.gap) e.style.setProperty("--gap", o.gap + "px");
    e.items = o.items.map((it) => {
      const [bu, tx] = Array.isArray(it) ? it : [o.bu || "▸", it];
      return mk("div", "li n", `<span class="bu">${bu}</span><span>${tx}</span>`, e);
    });
    return e;
  }
  /* pause-and-guess quiz: question, options, 3s countdown, then reveal */
  quiz(q, opts, ans, why, sayAsk, sayReveal) {
    const qe = this.text({ x: 160, y: 250, w: 1600, t: q, size: 52, weight: 800, align: "center" });
    const w = opts.length === 3 ? 520 : 400, gap = 40, x0 = (1920 - opts.length * w - (opts.length - 1) * gap) / 2;
    const ob = opts.map((o, i) => this.box({ x: x0 + i * (w + gap), y: 470, w, h: 190, ic: "ABCD"[i] === undefined ? "" : `<b style="font:900 54px Inter;color:#f5c542">${"ABCD"[i]}</b>`, t: o, c: "web", row: true }));
    const tm = this.text({ x: 860, y: 720, w: 200, t: "3", size: 130, weight: 900, color: "audit", align: "center", mono: true });
    const tl = this.text({ x: 560, y: 880, w: 800, t: "⏸ Pause karke socho… jawab comment me likho!", size: 30, color: "mute", align: "center" });
    const we = this.text({ x: 210, y: 740, w: 1500, t: why, size: 36, weight: 600, align: "center", c: "ok" });
    this.beat(sayAsk, (t) => {
      t.at(0.05).show(qe).at(0.45).show(ob, { st: 0.35 });
      t.at(t.D).show([tm, tl], { y: 0 }).count(tm, 3, 1, { d: 2.6, ease: "steps(2)" });
      for (let i = 0; i < 3; i++) sfx("tick2", T + t.D + i * 0.9);
      t.wait(2.9);
    });
    this.beat(sayReveal, (t) => {
      sfx("success", T + 0.15);
      t.at(0.15 / t.D).hide([tm, tl]).hl(ob[ans], "ok").dim(ob.filter((_, i) => i !== ans), 0.3).at(0.3).show(we);
    });
  }
  nudge(t) { const e = this._n("pill", t, { x: 60, y: 985, z: 45, c: "bad" }); e.style.fontSize = "28px"; e.style.padding = "12px 26px"; return e; }
  tip(t, tag) { return this._n("tip", `<span class="tg">${tag || "INTERVIEW"}</span><span>${t}</span>`, { z: 40 }); }
  /* arrow between two placed elements (or raw points {x,y}) */
  arrow(a, b, o = {}) {
    const pt = (r, side) => {
      if (r.w == null || (!r.w && !r.h)) return { x: r.x, y: r.y };
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
      return { l: { x: r.x, y: cy }, r: { x: r.x + r.w, y: cy }, t: { x: cx, y: r.y }, b: { x: cx, y: r.y + r.h } }[side];
    };
    const rect = (e) => (e instanceof Element ? { x: e.offsetLeft, y: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight } : e);
    const ra = rect(a), rb = rect(b);
    const ca = { x: ra.x + (ra.w || 0) / 2, y: ra.y + (ra.h || 0) / 2 }, cb = { x: rb.x + (rb.w || 0) / 2, y: rb.y + (rb.h || 0) / 2 };
    let sa, sb;
    if (Math.abs(cb.x - ca.x) >= Math.abs(cb.y - ca.y)) { sa = cb.x > ca.x ? "r" : "l"; sb = cb.x > ca.x ? "l" : "r"; }
    else { sa = cb.y > ca.y ? "b" : "t"; sb = cb.y > ca.y ? "t" : "b"; }
    const p1 = pt(ra, o.from || sa), p2 = pt(rb, o.to || sb);
    const off = o.off || 0;
    const horiz = "lr".includes(o.from || sa);
    if (horiz) { p1.y += off; p2.y += off; } else { p1.x += off; p2.x += off; }
    const pad = o.pad == null ? 8 : o.pad;
    const len0 = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
    const ux = (p2.x - p1.x) / len0, uy = (p2.y - p1.y) / len0;
    p1.x += ux * pad; p1.y += uy * pad; p2.x -= ux * (pad + 6); p2.y -= uy * (pad + 6);
    const col = C[o.c] || o.c || "#6f7fbf";
    const id = "m" + Math.random().toString(36).slice(2, 8);
    this.svg.querySelector("defs").insertAdjacentHTML("beforeend",
      `<marker id="${id}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${col}"/></marker>`);
    const ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    for (const [k, v] of Object.entries({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: col, "stroke-width": o.sw || 4.5, "stroke-linecap": "round", "marker-end": `url(#${id})` })) ln.setAttribute(k, v);
    if (o.dash) ln.setAttribute("stroke-dasharray", "4 14");
    ln.style.opacity = 0;
    this.svg.appendChild(ln);
    const A = { ln, p1, p2, len, col, dash: o.dash };
    if (o.t) {
      A.lab = mk("div", "n wl", o.t, this.el);
      A.lab.style.left = (p1.x + p2.x) / 2 + (o.lx || 0) + "px";
      A.lab.style.top = (p1.y + p2.y) / 2 + (o.ly || 0) + "px";
      A.lab.style.setProperty("--c", col);
    }
    return A;
  }
  beat(say, fn) {
    const ch = curCh;
    const id = `${ch.id}_${String(ch.n++).padStart(2, "0")}`;
    say = (window.NARR && window.NARR[id]) || say;
    const audio = window.DUR && window.DUR[id];
    const D = (audio || estimate(say)) + GAP;
    const start = T;
    const sc = this;
    let cur = 0, end = D;
    const add = (tw, vars, dur) => { master.add(tw, start + cur); end = Math.max(end, cur + (dur || 0.5) + 0.15); };
    const arr = (x) => (Array.isArray(x) ? x : [x]).map((e) => (e && e.ln ? [e.ln, e.lab].filter(Boolean) : e)).flat();
    const t = {
      D,
      at(f) { cur = f <= 1 ? f * (D - GAP) : f; return t; },
      wait(s) { cur += s; return t; },
      show(els, o = {}) {
        const d = o.d || 0.55, st = o.st == null ? 0.12 : o.st, L = arr(els);
        if (L.some((e) => e.classList && e.classList.contains("tip"))) sfx("ding", start + cur);
        const from = { opacity: 0, y: o.y == null ? 34 : o.y, x: o.x || 0, scale: o.s == null ? 1 : o.s };
        master.fromTo(L, from, { opacity: o.op || 1, y: 0, x: 0, scale: 1, duration: d, ease: o.ease || "power3.out", stagger: st, immediateRender: false }, start + cur);
        end = Math.max(end, cur + d + st * L.length);
        cur += o.adv == null ? 0.3 : o.adv;
        return t;
      },
      pop(els, o = {}) { sfx("pop", start + cur); return t.show(els, { y: 0, s: 0.5, ease: "back.out(2)", ...o }); },
      hide(els, o = {}) { add(gsap.to(arr(els), { opacity: 0, duration: o.d || 0.35, immediateRender: false })); cur += o.adv || 0; return t; },
      dim(els, v = 0.22) { add(gsap.to(arr(els), { opacity: v, duration: 0.4 })); return t; },
      undim(els) { add(gsap.to(arr(els), { opacity: 1, duration: 0.4 })); return t; },
      hl(els, c) {
        const col = C[c] || c || ch.color;
        add(gsap.to(arr(els), { boxShadow: `0 0 0 5px ${col}, 0 0 70px ${col}`, scale: 1.05, duration: 0.35, ease: "power2.out" }));
        return t;
      },
      unhl(els) { add(gsap.to(arr(els), { boxShadow: "0 0 0 0px rgba(0,0,0,0), 0 18px 50px rgba(0,0,0,.45)", scale: 1, duration: 0.35 })); return t; },
      flash(els, c) { t.hl(els, c); const k = cur; cur += 0.9; t.unhl(els); cur = k + 0.3; return t; },
      shake(els) { sfx("error", start + cur); add(gsap.fromTo(arr(els), { x: -10 }, { x: 0, duration: 0.5, ease: "elastic.out(1.2,0.2)", immediateRender: false })); return t; },
      to(els, vars, d = 0.6) { add(gsap.to(arr(els), { duration: d, ease: "power2.inOut", ...vars }), null, d); return t; },
      draw(As, o = {}) {
        for (const A of Array.isArray(As) ? As : [As]) {
          const d = o.d || 0.5;
          if (A.dash) master.to(A.ln, { opacity: 1, duration: d }, start + cur);
          else master.fromTo(A.ln, { strokeDasharray: A.len, strokeDashoffset: A.len, opacity: 1 }, { strokeDashoffset: 0, duration: d, ease: "power2.out", immediateRender: false }, start + cur);
          if (A.lab) master.fromTo(A.lab, { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, start + cur + d * 0.6);
          end = Math.max(end, cur + d + 0.3);
          cur += o.adv == null ? 0.25 : o.adv;
        }
        return t;
      },
      /* a labelled packet travelling along an arrow */
      send(A, label, o = {}) {
        const d = o.d || 1.0, a = o.rev ? A.p2 : A.p1, b = o.rev ? A.p1 : A.p2;
        const p = mk("div", "n pk", label, sc.el);
        p.style.setProperty("--c", C[o.c] || o.c || A.col);
        p.style.left = "0px"; p.style.top = "0px";
        const rep = o.rep || 1;
        sfx("tick", start + cur);
        for (let i = 0; i < rep; i++) {
          const s0 = start + cur + i * (d + 0.15);
          master.fromTo(p, { x: a.x, y: a.y, opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.2, immediateRender: false }, s0);
          master.fromTo(p, { x: a.x, y: a.y }, { x: b.x, y: b.y, duration: d, ease: "power1.inOut", immediateRender: false }, s0);
          master.to(p, { opacity: 0, scale: 0.6, duration: 0.2 }, s0 + d - 0.05);
        }
        end = Math.max(end, cur + rep * (d + 0.15) + 0.3);
        cur += o.adv == null ? d : o.adv;
        return t;
      },
      type(code, o = {}) {
        const L = o.lines ? o.lines.map((i) => code.lines[i]) : code.lines;
        const st = o.st || 0.22;
        master.fromTo(L, { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.3, stagger: st, immediateRender: false }, start + cur);
        end = Math.max(end, cur + st * L.length + 0.4);
        cur += o.adv == null ? 0.3 : o.adv;
        return t;
      },
      mark(lineEls, c) {
        const col = C[c] || c || ch.color;
        add(gsap.to(arr(lineEls), { backgroundColor: col + "30", borderLeftColor: col, duration: 0.3 }));
        return t;
      },
      unmark(lineEls) { add(gsap.to(arr(lineEls), { backgroundColor: "rgba(0,0,0,0)", borderLeftColor: "rgba(0,0,0,0)", duration: 0.3 })); return t; },
      count(el, a, b, o = {}) {
        const pr = { v: a }, d = o.d || 1.2, f = o.fmt || ((v) => Math.round(v).toLocaleString("en-IN"));
        add(gsap.to(pr, { v: b, duration: d, ease: o.ease || "power1.out", onUpdate: () => { el.textContent = (o.pre || "") + f(pr.v) + (o.suf || ""); } }), null, d);
        return t;
      },
    };
    if (BEATS.length === 0 || BEATS[BEATS.length - 1].sc !== this) {
      sfx("whoosh", start);
      master.set(this.el, { display: "block" }, start);
      master.fromTo(this.el, { opacity: 0 }, { opacity: 1, duration: 0.45, immediateRender: false }, start);
      if (this.h) master.fromTo(this.h, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, start + 0.1);
      if (this.onstart) this.onstart(t);
    }
    if (fn) fn(t);
    const b = { id, say, start, dur: end, audio: audio || null, ch: ch.id, sc: this };
    BEATS.push(b);
    ch.beats.push(b);
    T = start + end;
    this.end = T;
  }
}

function scene(title, sub, fn) {
  if (typeof sub === "function") { fn = sub; sub = null; }
  const prev = BEATS.length ? BEATS[BEATS.length - 1].sc : null;
  const S = new Scene(title, sub);
  fn(S);
  S.el.style.display = "none";
  // close the scene: fade out at its end
  master.to(S.el, { opacity: 0, duration: 0.3 }, S.end - 0.3);
  master.set(S.el, { display: "none" }, S.end);
  return S;
}

function titleCard(ch, i, total) {
  scene(null, (S) => {
    const c = mk("div", "card0", `<div class="cn">CHAPTER ${String(i).padStart(2, "0")} / ${String(total).padStart(2, "0")}</div><div class="ce">${ch.icon}</div><div class="cT">${ch.title}</div><div class="bar"></div><div class="cs">${ch.tag}</div>`, S.el);
    c.style.setProperty("--c", ch.color);
    S.beat(ch.say, (t) => {
      t.show([...c.querySelectorAll(".cn,.ce,.cT,.cs")], { st: 0.14 });
      t.at(0.25).to(c.querySelector(".bar"), { width: 420 }, 0.8);
    });
  });
}

function build() {
  const only = Q.get("ch");
  const list = CHAPTERS.filter((c) => !only || c.id === only);
  const hud = mk("div", "hud", "");
  CHAPTERS.forEach((ch, i) => {
    if (only && ch.id !== only) return;
    curCh = ch; ch.n = 0; ch.beats = []; ch.start = T; ch.color = C[ch.c] || ch.c;
    const s0 = T;
    if (!ch.nocard) titleCard(ch, i, CHAPTERS.length - 1);
    const hudAt = T;
    ch.fn();
    ch.end = T;
    master.call(() => {}, null, T);
    const segs = CHAPTERS.slice(1).map((c, k) => `<i class="${k + 1 < i ? "dn" : k + 1 === i ? "on" : ""}" style="--c:${ch.color}"></i>`).join("");
    const lab = mk("div", "n", `<span class="chip" style="--c:${ch.color}">${ch.title}</span>`, hud);
    const bar = mk("div", "n pbar", segs + `<em>${i} / ${CHAPTERS.length - 1}</em>`, stage);
    if (!ch.nocard) { master.fromTo(bar, { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, hudAt); master.to(bar, { opacity: 0, duration: 0.3 }, T - 0.3); }
    lab.style.position = "absolute"; lab.style.whiteSpace = "nowrap";
    if (!ch.nocard) {
      master.fromTo(lab, { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, hudAt);
      master.to(lab, { opacity: 0, duration: 0.3 }, T - 0.3);
    }
  });
  window.BEATS = BEATS; window.TOTAL = T; window.master = master; window.SFX = SFX;
  const b1 = mk("div", "blob b1", "", stage), b2 = mk("div", "blob b2", "", stage);
  stage.insertBefore(b2, stage.firstChild); stage.insertBefore(b1, stage.firstChild);
  window.ambient = (t) => {
    b1.style.transform = `translate(${Math.sin(t * 0.21) * 160}px, ${Math.cos(t * 0.17) * 90}px)`;
    b2.style.transform = `translate(${Math.cos(t * 0.13) * 200}px, ${Math.sin(t * 0.19) * 110}px)`;
    stage.style.setProperty("--gx", (t * 6) % 40 + "px");
  };
  // intervals during which something is animating (renderer repeats frames outside them)
  const iv = master.getChildren(true, true, false).map((tw) => [tw.startTime(), tw.startTime() + tw.duration()]).sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [a, b] of iv) { if (merged.length && a <= merged[merged.length - 1][1] + 0.05) merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], b); else merged.push([a, b]); }
  window.ACTIVE = merged;
  window.seek = (t) => { master.seek(Math.min(t, T - 0.001), false); window.ambient(t); };
  window.beatsInfo = () => BEATS.map((b) => ({ id: b.id, say: b.say, start: b.start, dur: b.dur, ch: b.ch }));
  window.chaptersInfo = () => list.map((c) => ({ id: c.id, title: c.title, start: c.start, end: c.end }));
  if (Q.get("render")) { window.seek(0); return; }
  player();
}

/* ---------- real-time player with narration (website embed) ---------- */
function player() {
  document.body.classList.add("player", "idle", "cc");
  const wrap = document.getElementById("wrap");
  const fit = () => {
    const capH = document.body.classList.contains("cc") ? 64 : 0, h = innerHeight - 54 - capH;
    const s = Math.min(innerWidth / 1920, h / 1080);
    wrap.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px, ${(h - 1080 * s) / 2}px) scale(${s})`;
  };
  addEventListener("resize", fit); fit();
  const $ = (id) => document.getElementById(id);
  const audio = new Audio(); let cur = -1, playing = false;
  const base = Q.get("audio") || "audio/";
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const idx = (t) => { let i = BEATS.findIndex((b) => t < b.start + b.dur); return i < 0 ? BEATS.length - 1 : i; };
  function sync(force) {
    const t = master.time(), i = idx(t), b = BEATS[i];
    if (i !== cur || force) {
      cur = i; $("cap").textContent = b.say;
      audio.src = base + b.id + ".mp3";
      const off = t - b.start;
      audio.addEventListener("loadedmetadata", () => { if (off < audio.duration) { audio.currentTime = off; if (playing) audio.play().catch(() => {}); } }, { once: true });
    }
  }
  function play() { if (master.time() >= T - 0.05) master.seek(0); playing = true; document.body.classList.remove("idle"); master.play(); sync(true); $("pp").textContent = "⏸"; }
  function pause() { playing = false; master.pause(); audio.pause(); $("pp").textContent = "▶"; }
  function go(t) { master.seek(Math.max(0, Math.min(T - 0.01, t)), false); sync(true); }
  $("pp").onclick = () => (playing ? pause() : play());
  $("big").onclick = play;
  $("prev").onclick = () => go(BEATS[Math.max(0, idx(master.time()) - (master.time() - BEATS[idx(master.time())].start < 1.5 ? 1 : 0))].start);
  $("next").onclick = () => go(BEATS[Math.min(BEATS.length - 1, idx(master.time()) + 1)].start);
  $("ccb").onclick = () => { document.body.classList.toggle("cc"); fit(); };
  $("sk").oninput = (e) => go((e.target.value / 1000) * T);
  $("sp").onclick = () => { const r = { 1: 1.25, 1.25: 1.5, 1.5: 0.85, 0.85: 1 }[master.timeScale()] || 1; master.timeScale(r); audio.playbackRate = r; $("sp").textContent = r + "×"; };
  audio.addEventListener("play", () => { audio.playbackRate = master.timeScale(); });
  gsap.ticker.add(() => {
    window.ambient(performance.now() / 1000);
    $("tm").textContent = fmt(master.time()) + " / " + fmt(T);
    if (document.activeElement !== $("sk")) $("sk").value = (master.time() / T) * 1000;
    if (playing) { sync(false); if (master.time() >= T - 0.02) pause(); }
  });
  addEventListener("keydown", (e) => { if (e.code === "Space") { e.preventDefault(); $("pp").click(); } if (e.code === "ArrowRight") $("next").click(); if (e.code === "ArrowLeft") $("prev").click(); });
  master.seek(Q.get("t") ? +Q.get("t") : Math.min(1.2, T), false);
}
