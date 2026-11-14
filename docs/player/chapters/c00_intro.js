chapter({ id: "c00", title: "Intro", c: "web", nocard: true }, () => {
  /* cold open: the 10:00:00 registration rush */
  scene(null, (S) => {
    const lab = S.text({ x: 160, y: 110, w: 1600, t: "COURSE REGISTRATION OPENS IN", size: 34, weight: 800, color: "mute", align: "center", mono: true });
    const clock = S.text({ x: 160, y: 160, w: 1600, t: "09:59:57", size: 230, weight: 900, align: "center", mono: true });
    const crowd = S.emoji({ x: 160, y: 470, w: 1600, t: "🧑‍🎓👩‍🎓🧑‍🎓👩‍🎓🧑‍🎓👩‍🎓🧑‍🎓👩‍🎓🧑‍🎓👩‍🎓🧑‍🎓👩‍🎓", size: 96 });
    crowd.style.textAlign = "center";
    const btn = S.pill({ x: 810, y: 640, t: "Register ▶", c: "ok" });
    btn.style.fontSize = "44px"; btn.style.padding = "18px 44px";
    const srv = S.box({ x: 760, y: 760, w: 400, h: 230, ic: "🖥️", t: "Server", s: "", c: "web" });
    const cnt = S.text({ x: 1200, y: 790, w: 600, t: "0", size: 120, weight: 900, color: "bad", mono: true });
    const cl = S.text({ x: 1200, y: 930, w: 600, t: "requests / second", size: 30, color: "mute" });
    const boom = S.text({ x: 160, y: 330, w: 1600, t: "💥 502 Bad Gateway", size: 150, weight: 900, color: "bad", align: "center" });
    const okk = S.text({ x: 160, y: 300, w: 1600, t: "✅ 3000 / 3000 registered", size: 120, weight: 900, color: "ok", align: "center" });
    const q = S.text({ x: 160, y: 520, w: 1600, t: "Zero crash · zero galat data · har click ka record.<br><b>Kaise?</b>", size: 56, weight: 700, align: "center", c: "audit" });
    S.beat("", (t) => {
      t.at(0.02).show([lab, clock], { s: 0.9 }).at(0.4).pop(crowd).at(0.7).pop(btn);
      t.at(0.1).count(clock, 57, 59, { d: t.D * 0.8, ease: "none", fmt: (v) => "09:59:" + Math.round(v) });
    });
    S.beat("", (t) => {
      t.at(0.0).to(clock, { color: "#ff5d73" }, 0.2).count(clock, 0, 0, { d: 0.05, fmt: () => "10:00:00" }).shake(clock);
      t.at(0.12).show(srv).show([cnt, cl]).count(cnt, 0, 3000, { d: 2.2 }).at(0.45).shake(srv).hl(srv, "bad");
      t.at(0.62).hide([lab, clock, crowd, btn]).pop(boom).shake(boom);
    });
    S.beat("", (t) => {
      t.at(0.05).hide([boom, srv, cnt, cl]).at(0.16).pop(okk).at(0.7).show(q);
    });
  });

  scene("Agle 30 minute me", "ek real academic ERP ka poora architecture — zero se", (S) => {
    const items = [
      ["🌐", "Web basics", "web"], ["🎸", "Django", "django"], ["🧩", "ORM", "django"], ["🐘", "PostgreSQL", "pg"],
      ["🦄", "Gunicorn", "guni"], ["🚦", "Nginx", "nginx"], ["🐳", "Docker", "docker"], ["⚡", "Redis", "redis"],
      ["🥬", "Celery", "celery"], ["🎱", "PgBouncer", "bouncer"], ["🔐", "Security", "sec"], ["⛓️", "Audit hash chain", "audit"],
    ];
    const bx = items.map(([ic, t, c], i) => S.box({ x: 110 + (i % 4) * 440, y: 270 + Math.floor(i / 4) * 200, w: 380, h: 165, ic, t, c, row: true }));
    const pr = S.list({ x: 150, y: 860, w: 1700, size: 30, gap: 6, items: [["🎯", "Har topic ke baad: <b>interview me kya bolna hai</b> &nbsp;·&nbsp; 🧠 <b>4 quick quiz</b> — score comment me &nbsp;·&nbsp; ⛓️ ant me <b>hash chain</b> ka raaz"]] });
    S.beat("", (t) => { t.at(0.15).show(bx.slice(0, 4), { st: 0.2 }); });
    S.beat("", (t) => { t.at(0.1).show(bx.slice(4, 8), { st: 0.3 }).at(0.55).show(bx.slice(8), { st: 0.3 }).at(0.85).flash(bx[11], "audit"); });
    S.beat("", (t) => { t.at(0.1).show(pr.items[0]); });
  });
});
