chapter({ id: "c13", title: "Poora Safar", c: "web", icon: "🗺️", tag: "Ek click, poora system", say: "चलो, अब सब कुछ जोड़कर एक बार पूरा सफ़र देखते हैं।" }, () => {
  scene("Ek click ka <b>poora safar</b>", "student ne “Register” dabaya", (S) => {
    const zone = S.zone({ x: 400, y: 250, w: 1470, h: 690, t: "Docker — sab kuch containers me", c: "docker" });
    const br = S.box({ x: 50, y: 330, w: 250, h: 180, ic: "🧑‍🎓", t: "Browser", c: "web", sm: true });
    const ng = S.box({ x: 440, y: 330, w: 250, h: 180, ic: "🚦", t: "Nginx", s: "HTTPS, buffer", c: "nginx", sm: true });
    const gu = S.box({ x: 800, y: 330, w: 250, h: 180, ic: "🦄", t: "Gunicorn", s: "worker + thread", c: "guni", sm: true });
    const dj = S.box({ x: 1160, y: 330, w: 280, h: 180, ic: "🎸", t: "Django", s: "middleware → view → ORM", c: "django", sm: true });
    const rd = S.box({ x: 1570, y: 290, w: 260, h: 160, ic: "⚡", t: "Redis", s: "session, cache", c: "redis", sm: true });
    const pb = S.box({ x: 1160, y: 590, w: 280, h: 150, ic: "🎱", t: "PgBouncer", s: "pooled connection", c: "bouncer", sm: true });
    const pg = S.box({ x: 1570, y: 590, w: 260, h: 150, ic: "🐘", t: "PostgreSQL", s: "transaction + constraints", c: "pg", sm: true });
    const ce = S.box({ x: 800, y: 590, w: 250, h: 150, ic: "🥬", t: "Celery", s: "bhaari kaam, seal task", c: "celery", sm: true });
    const au = S.box({ x: 1160, y: 780, w: 670, h: 130, ic: "⛓️", t: "Audit log", s: "har request + har change, hash chain me sealed", c: "audit", row: true, sm: true });
    const a = [S.arrow(br, ng, { c: "web" }), S.arrow(ng, gu, { c: "nginx" }), S.arrow(gu, dj, { c: "guni" }), S.arrow(dj, rd, { c: "redis", from: "r", to: "l" }), S.arrow(dj, pb, { c: "bouncer" }), S.arrow(pb, pg, { c: "pg" }), S.arrow(dj, ce, { c: "celery", dash: true, from: "b", to: "t", off: -100 }), S.arrow({ x: 1700, y: 740 }, { x: 1700, y: 780 }, { c: "audit", pad: 2 })];
    const back = S.arrow(ng, br, { c: "ok", off: 50, t: "200 OK", ly: 30 });
    S.beat("Student ने register button दबाया। Request सबसे पहले पहुँची Nginx के पास, जिसने H T T P S संभाला। फिर Gunicorn के एक worker के एक thread ने उसे उठाया, और Django को दे दिया।", (t) => {
      t.at(0.05).show([zone, br]).at(0.25).show(ng).draw(a[0]).send(a[0], "POST", { d: 0.7 }).at(0.55).show(gu).draw(a[1]).send(a[1], "POST", { d: 0.7 }).at(0.8).show(dj).draw(a[2]).send(a[2], "POST", { d: 0.7 });
    });
    S.beat("Django में middleware ने Redis से session पढ़ा: ये कौन है, और इसका role क्या है। View ने ORM से query बनाई, जो PgBouncer के pool से होते हुए PostgreSQL तक पहुँची।", (t) => {
      t.at(0.05).show(rd).draw(a[3]).send(a[3], "session?", { d: 0.6 }).send(a[3], "STUDENT", { rev: true, d: 0.6 }).at(0.5).show(pb).draw(a[4]).send(a[4], "SQL", { d: 0.5 }).at(0.7).show(pg).draw(a[5]).send(a[5], "SQL", { d: 0.5 });
    });
    S.beat("PostgreSQL ने transaction के अंदर, constraints check करके, enrollment save की। कोई भारी काम होता, तो वो Celery को चला जाता। और इस पूरी कहानी की एक row audit log में लिखी गई, जो थोड़ी देर में hash chain में seal हो जाएगी।", (t) => {
      t.at(0.05).flash(pg, "pg").at(0.35).show(ce).draw(a[6]).at(0.6).show(au).draw(a[7]).send(a[7], "log", { d: 0.6 }).at(0.85).draw(back).send(back, "✓ Registered", { c: "ok" });
    });
    S.beat("और ये सब कुछ Docker के containers में चल रहा है, और आधे second से भी कम में हो गया। यही है एक production web application का architecture।", (t) => {
      t.at(0.1).flash(zone, "docker").at(0.5).flash([ng, gu, dj, rd, pb, pg, ce, au], "audit");
    });
  });

  scene("Interview ke liye <b>ek-ek line</b>", "screenshot le lo 📸", (S) => {
    const L = [
      ["🎸", "Django", "batteries-included framework: ORM, migrations, security built-in", "django"],
      ["🐘", "PostgreSQL", "relational + ACID + constraints = data kabhi galat nahi", "pg"],
      ["🦄", "Gunicorn", "WSGI server: master + worker processes + threads", "guni"],
      ["🚦", "Nginx", "reverse proxy: TLS, buffering, static, load balancing", "nginx"],
      ["🐳", "Docker", "code + environment ek image me; compose se poora stack", "docker"],
      ["⚡", "Redis", "in-memory store: cache, sessions, rate limit, queue", "redis"],
      ["🥬", "Celery", "task queue: bhaari kaam background me, retry ke saath", "celery"],
      ["🎱", "PgBouncer", "connection pooling: thode connections, bahut clients", "bouncer"],
      ["⛓️", "Hash chain", "har row pichhli row ke hash se judi → tamper-evident log", "audit"],
    ];
    const bx = L.map(([ic, t, s, c], i) => S.box({ x: 80 + (i % 3) * 595, y: 270 + Math.floor(i / 3) * 235, w: 565, h: 205, ic, t, s, c, row: true, sm: true }));
    S.beat("जाते-जाते, हर tool की एक line, जो आप interview में बोल सकते हो। Django: batteries included framework। PostgreSQL: ACID और constraints वाला relational database। Gunicorn: WSGI server, जिसमें workers और threads हैं।", (t) => {
      t.at(0.2).show(bx[0]).at(0.45).show(bx[1]).at(0.75).show(bx[2]);
    });
    S.beat("Nginx: reverse proxy। Docker: code और उसका पूरा माहौल एक image में। Redis: RAM वाला store, cache और sessions के लिए।", (t) => {
      t.at(0.05).show(bx[3]).at(0.3).show(bx[4]).at(0.65).show(bx[5]);
    });
    S.beat("Celery: background task queue। PgBouncer: connection pooling। और hash chain: ऐसा audit log जिससे छेड़छाड़ छुप नहीं सकती।", (t) => {
      t.at(0.05).show(bx[6]).at(0.35).show(bx[7]).at(0.6).show(bx[8]).hl(bx[8], "audit");
    });
  });

  scene(null, (S) => {
    const big = S.text({ x: 160, y: 250, w: 1600, t: "Ab aap ek production system<br>ko <b>explain</b> kar sakte ho 🎉", size: 84, weight: 900, align: "center", c: "audit" });
    const web = S.box({ x: 360, y: 610, w: 1200, h: 190, ic: "🌐", t: "Companion website — link description me", s: "har chapter ka interactive animation · quiz · interview Q&A · AI se doubt poochho", c: "web", row: true });
    const end = S.text({ x: 160, y: 860, w: 1600, t: "🧠 Quiz me 4 me se kitne sahi? Comment karo · Share with a friend 👋", size: 40, color: "mute", align: "center" });
    S.beat("तो आज आपने एक पूरा production system समझ लिया, zero से। अब कोई पूछे कि आपका project कैसे काम करता है, तो आप सिर्फ़ tools के नाम नहीं, उनके पीछे का क्यों और कैसे भी बता सकते हो।", (t) => {
      t.at(0.1).show(big, { s: 0.9 });
    });
    S.beat("Description में एक website का link है। वहाँ हर chapter का interactive animation है, quiz है, interview के सवाल-जवाब हैं, और आप A I से अपना doubt भी पूछ सकते हो। Video अच्छा लगा हो तो share ज़रूर करना। मिलते हैं अगले video में।", (t) => {
      t.at(0.05).pop(web).at(0.75).show(end);
    });
  });
});
