chapter({ id: "c10", title: "PgBouncer", c: "bouncer", icon: "🎱", tag: "Connection pooling — database ke gate ka bouncer", say: "अब एक ऐसा tool, जिसका नाम कम लोग जानते हैं, लेकिन interview में बहुत impress करता है: PgBouncer।" }, () => {
  scene("Database connection <b>mehenga</b> hota hai", (S) => {
    const app = S.box({ x: 150, y: 480, w: 340, h: 250, ic: "🎸", t: "Django", s: "har request par", c: "django" });
    const pg = S.box({ x: 1430, y: 480, w: 340, h: 250, ic: "🐘", t: "PostgreSQL", s: "max_connections = 100", c: "pg" });
    const ar = S.arrow(app, pg, { c: "pg" });
    const steps = S.list({ x: 560, y: 150 + 100, w: 800, size: 28, gap: 6, items: [["🤝", "TCP handshake"], ["🔑", "password check"], ["🏗️", "Postgres ek <b>naya process</b> banata hai (kai MB RAM)"], ["💬", "…tab jaake query chalti hai"]] });
    const n = S.text({ x: 150, y: 810, w: 1620, t: "Registration day: saikdon requests/second × har baar naya connection = 🔥", size: 38, weight: 700, color: "bad", align: "center" });
    S.beat("Database से बात करने के लिए पहले एक connection खोलना पड़ता है। और ये सस्ता काम नहीं है। Handshake, password check, और PostgreSQL हर connection के लिए एक पूरा नया process बनाता है।", (t) => {
      t.at(0.05).show([app, pg]).draw(ar).at(0.35).show(steps.items, { st: 0.7 });
    });
    S.beat("ऊपर से PostgreSQL की एक limit है: यहाँ सिर्फ़ सौ connections। Registration day पर अगर हर request नया connection खोले, तो database query चलाने से ज़्यादा time connection बनाने में लगा देगा।", (t) => {
      t.at(0.1).flash(pg, "bad").at(0.4).send(ar, "connect", { d: 0.5, rep: 5 }).at(0.6).show(n);
    });
  });

  scene("PgBouncer = <b>connection pool</b>", "bank ke counter aur token system", (S) => {
    const cl = Array.from({ length: 8 }, (_, i) => S.box({ x: 70 + (i % 2) * 150, y: 270 + Math.floor(i / 2) * 150, w: 130, h: 125, ic: "🧵", c: "django", sm: true }));
    const lab1 = S.text({ x: 40, y: 880, w: 340, t: "saikdon app threads", size: 28, color: "mute", align: "center" });
    const pb = S.box({ x: 700, y: 400, w: 380, h: 300, ic: "🎱", t: "PgBouncer", s: "pool manager", c: "bouncer" });
    const pg = S.box({ x: 1480, y: 400, w: 360, h: 300, ic: "🐘", t: "PostgreSQL", s: "sirf thode asli connections", c: "pg" });
    const ca = cl.filter((_, i) => i % 2).map((c) => S.arrow(c, pb, { c: "django", sw: 2.5, to: "l" }));
    const pa = [-60, 0, 60].map((off) => S.arrow(pb, pg, { c: "pg", off, sw: 7 }));
    const lab2 = S.text({ x: 1100, y: 720, w: 360, t: "3 asli connections,<br>baar-baar reuse", size: 28, color: "pg", align: "center" });
    const tip = S.tip("<b>Connection pooling:</b> connections pehle se khule rakho aur reuse karo. Kam RAM, zero handshake, aur database kabhi “too many connections” nahi bolta.");
    S.beat("इसका इलाज है connection pool। बीच में बैठता है PgBouncer। वो database के साथ कुछ connections पहले से खोलकर रखता है, और उन्हें कभी बंद नहीं करता।", (t) => {
      t.at(0.1).show(pg).at(0.3).pop(pb).at(0.6).draw(pa, { adv: 0.15 }).show(lab2);
    });
    S.beat("App के सैकड़ों threads PgBouncer से जुड़ते हैं। ये बहुत सस्ता है। और PgBouncer उन्हें बारी-बारी से असली connections दे देता है। जैसे bank में दस counter हों और सौ customers, token से सबका काम हो जाता है।", (t) => {
      t.at(0.05).show(cl, { st: 0.08 }).show(lab1).draw(ca, { adv: 0.08 }).at(0.45).send(ca[0], "q", { d: 0.5 }).send(pa[0], "q", { d: 0.5 }).at(0.6).send(ca[2], "q", { d: 0.5 }).send(pa[1], "q", { d: 0.5 }).at(0.75).send(ca[3], "q", { d: 0.5 }).send(pa[0], "q", { d: 0.5 });
    });
    S.beat("फ़ायदा: database पर load कम, RAM कम, और too many connections वाला error कभी नहीं आता।", (t) => {
      t.at(0.15).show(tip);
    });
  });

  scene("Transaction mode — aur uski <b>keemat</b>", (S) => {
    const m1 = S.box({ x: 110, y: 270, w: 830, h: 200, ic: "🪑", t: "Session mode", s: "client jab tak juda hai, connection usi ka", c: "mute", row: true });
    const m2 = S.box({ x: 980, y: 270, w: 830, h: 200, ic: "🔄", t: "Transaction mode ✓", s: "transaction khatam → connection turant pool me wapas", c: "bouncer", row: true });
    const cfg = S.code({ x: 110, y: 530, w: 830, size: 28, title: "settings.py", lines: ['"CONN_MAX_AGE": 0,   # Django connection pakad ke na baithe'] });
    const con = S.list({ x: 1000, y: 520, w: 820, size: 29, gap: 16, items: [
      ["⚠️", "Agli query kisi <b>dusre</b> connection par ja sakti hai"],
      ["🚫", "Session-level cheezein toot jaati hain: <small>session advisory locks, SET, kuch prepared statements</small>"],
      ["✅", "Isliye is app me lock <b>transaction-scoped</b> hai: <small>pg_try_advisory_xact_lock(…)</small>"],
    ] });
    const tip = S.tip("<b>Yeh detail bolo to interviewer khush:</b> “Transaction pooling me session state par bharosa nahi kar sakte, isliye CONN_MAX_AGE=0 aur xact-scoped advisory locks use kiye.”");
    S.beat("PgBouncer के modes होते हैं। यहाँ transaction mode use होता है। मतलब: जैसे ही आपका transaction खत्म हुआ, connection तुरंत pool में वापस, और किसी और को मिल सकता है। ये सबसे efficient है।", (t) => {
      t.at(0.1).show(m1).at(0.3).show(m2).at(0.6).dim(m1, 0.4).hl(m2);
    });
    S.beat("लेकिन इसकी एक कीमत है। आपकी अगली query किसी दूसरे connection पर जा सकती है। तो जो चीज़ें connection के साथ जुड़ी होती हैं, वो भरोसे लायक नहीं रहतीं।", (t) => {
      t.at(0.02).unhl(m2).at(0.2).show(con.items[0]).at(0.6).show(con.items[1]);
    });
    S.beat("इसीलिए इस app की settings में CONN MAX AGE zero है, यानी Django खुद connection पकड़कर नहीं बैठता। और जहाँ lock चाहिए, वहाँ transaction वाला lock use किया गया है। ये छोटी detail बताती है कि आपने system सच में समझा है।", (t) => {
      t.at(0.05).show(cfg).type(cfg).at(0.45).show(con.items[2]).at(0.7).show(tip);
    });
  });
});
