chapter({ id: "c04", title: "PostgreSQL", c: "pg", icon: "🐘", tag: "The database — jahan asli data rehta hai", say: "अब चलते हैं database की तरफ़: PostgreSQL।" }, () => {
  scene("Data aapas me <b>juda hua</b> hai", "isliye Relational database", (S) => {
    const st = S.table({ x: 70, y: 290, w: 480, title: "student", cols: ["id", "roll_no", "name"], grid: "70px 150px 1fr", size: 24, rows: [["1", "b23101", "Aarav"], ["2", "b23102", "Diya"]] });
    const en = S.table({ x: 690, y: 430, w: 560, title: "enrollment", cols: ["student_id", "offering_id", "grade"], grid: "190px 200px 1fr", size: 24, rows: [["1", "7", "A"], ["1", "9", "B"], ["2", "7", "A-"]] });
    const co = S.table({ x: 1380, y: 290, w: 480, title: "course_offering", cols: ["id", "course", "session"], grid: "70px 1fr 150px", size: 24, rows: [["7", "CS201", "2025-ODD"], ["9", "MA102", "2025-ODD"]] });
    const a1 = S.arrow(en, st, { c: "pg", t: "foreign key", from: "l", to: "b", ly: 30 });
    const a2 = S.arrow(en, co, { c: "pg", t: "foreign key", from: "r", to: "b", ly: 30 });
    const why = S.list({ x: 150, y: 760, w: 1650, size: 31, gap: 12, items: [
      ["🍃", "<b>MongoDB kyun nahi?</b> Yahan har cheez JOIN hoti hai aur data strict hona chahiye"],
      ["🪶", "<b>SQLite kyun nahi?</b> Ek time par ek hi writer — hazaaron users ke liye nahi"],
      ["🐬", "<b>MySQL se behtar kyun?</b> Partial indexes, strong constraints, JSON fields, advisory locks"],
    ] });
    S.beat("ERP का data देखो। Students हैं, courses हैं, और कौन सा student किस course में है, उसकी enrollment है। ये सब एक दूसरे से जुड़े हुए हैं।", (t) => {
      t.at(0.1).show(st).at(0.3).show(co).at(0.6).show(en);
    });
    S.beat("ये जोड़ बनता है foreign key से। Enrollment की row बस ये बोलती है: student number एक, offering number सात, grade A। ऐसे जुड़े हुए tables वाले database को relational database कहते हैं।", (t) => {
      t.at(0.1).draw([a1, a2]).at(0.35).flash(en.rows[0], "pg").at(0.5).flash(st.rows[0], "pg").at(0.6).flash(co.rows[0], "pg");
    });
    S.beat("अब interview का सवाल: PostgreSQL ही क्यों? MongoDB इसलिए नहीं, क्योंकि हमारा data जुड़ा हुआ और strict है। SQLite इसलिए नहीं, क्योंकि वो बहुत सारे users एक साथ नहीं संभाल सकता। और MySQL के मुकाबले Postgres में ज़्यादा powerful features हैं, जो हम आगे use करेंगे।", (t) => {
      t.at(0.12).show(why.items[0]).at(0.4).show(why.items[1]).at(0.65).show(why.items[2]);
    });
  });

  scene("<b>ACID</b> — database ke 4 vaade", "transaction = ek saath hone wale kaam ka group", (S) => {
    const code = S.code({ x: 80, y: 270, w: 880, size: 27, title: "bulk grade upload", lines: [
      "with transaction.atomic():",
      "    for row in excel_rows:        # 3000 rows",
      "        save_grade(row)",
      "    # row 2999 me error?  → sab ROLLBACK",
    ] });
    const L = [["A", "Atomic", "sab hoga ya kuch nahi"], ["C", "Consistent", "rules kabhi nahi tootenge"], ["I", "Isolated", "do log ek dusre ko disturb nahi karte"], ["D", "Durable", "save hua to bijli jaane par bhi rahega"]];
    const bx = L.map(([k, t, s], i) => S.box({ x: 1040, y: 265 + i * 160, w: 800, h: 135, ic: `<b style="font:900 60px Inter;color:#6aa9ff">${k}</b>`, t, s, c: "pg", row: true }));
    const bar = S.text({ x: 80, y: 600, w: 880, t: "", size: 30 });
    bar.innerHTML = '<div style="height:44px;border-radius:12px;background:#10172e;border:2px solid #2b3765;overflow:hidden"><div id="acidbar" style="height:100%;width:0;background:#4ade80"></div></div>';
    const msg = S.text({ x: 80, y: 670, w: 880, t: "💥 Error at row 2999 → <b>ROLLBACK</b>: database bilkul pehle jaisa", size: 30, c: "bad" });
    const tip = S.tip("<b>Atomicity example:</b> aadhe students ke grade save, aadhe nahi — yeh kabhi nahi hona chahiye. <code>transaction.atomic()</code> isi ki guarantee deta hai.");
    S.beat("अब एक खतरनाक situation सोचो। Admin ने तीन हज़ार students के grades की Excel upload की। दो हज़ार rows save हो गईं, और फिर error आ गया। अब आधे grades database में हैं, आधे नहीं।", (t) => {
      t.at(0.1).show(code).type(code, { lines: [0, 1, 2] }).at(0.35).show(bar).to("#acidbar", { width: "66%" }, 2.2).at(0.75).to("#acidbar", { backgroundColor: "#ff5d73" }, 0.3);
    });
    S.beat("इससे बचाता है transaction। Transaction मतलब: या तो सारे काम होंगे, या एक भी नहीं। बीच में error आया, तो database सब कुछ वापस पलट देता है। इसे rollback कहते हैं।", (t) => {
      t.at(0.3).type(code, { lines: [3] }).mark(code.lines[3], "bad").at(0.55).to("#acidbar", { width: "0%" }, 1).show(msg).at(0.8).pop(bx[0]);
    });
    S.beat("ये database के चार वादों में से पहला है: Atomic। बाकी तीन हैं: Consistent, Isolated और Durable। चारों मिलकर बनते हैं ACID। ये शब्द interview में पक्का आता है।", (t) => {
      t.at(0.2).hl(bx[0]).at(0.4).unhl(bx[0]).show(bx.slice(1), { st: 0.5 }).at(0.85).show(tip);
    });
  });

  scene("Constraints — database hi <b>aakhri chowkidar</b> hai", (S) => {
    const u1 = S.box({ x: 90, y: 300, w: 300, h: 200, ic: "🖱️🖱️", t: "Double click", s: "Register button 2 baar", c: "web" });
    const tb = S.table({ x: 560, y: 280, w: 620, title: "enrollment   UNIQUE(student, offering)", cols: ["student_id", "offering_id", "status"], grid: "190px 200px 1fr", size: 24, hideRows: true, rows: [["1", "7", "PND"], ["1", "7", "✗ rejected"]] });
    const ar = S.arrow(u1, tb, { c: "web" });
    const cons = S.list({ x: 1260, y: 280, w: 620, size: 28, gap: 22, items: [
      ["🔑", "<b>UNIQUE</b><small>ek student, ek course — sirf ek baar</small>"],
      ["🎯", "<b>Partial UNIQUE</b><small>sirf EK session active ho sakta hai</small>"],
      ["✅", "<b>CHECK</b><small>status sirf valid values me se</small>"],
      ["🔗", "<b>FOREIGN KEY PROTECT</b><small>jis course me students hain wo delete nahi hoga</small>"],
    ] });
    const tip = S.tip("<b>Line:</b> “Validation Python me bhi karte hain, par race condition me sirf database constraint hi 100% guarantee deta hai.”");
    S.beat("मान लो student ने register button पर जल्दी-जल्दी दो बार click कर दिया। दो requests एक साथ server पर पहुँचीं। दोनों ने check किया: registered तो नहीं है? दोनों को जवाब मिला नहीं। और दोनों ने row डाल दी।", (t) => {
      t.at(0.1).pop(u1).at(0.3).show(tb).draw(ar).send(ar, "INSERT", { d: 0.9 }).at(0.5).send(ar, "INSERT", { d: 0.9 }).at(0.6).show(tb.rows[0]);
    });
    S.beat("इसे कहते हैं race condition। Python का check यहाँ fail हो जाता है। लेकिन database में unique constraint लगा है, तो दूसरी row को database खुद मना कर देता है।", (t) => {
      t.at(0.5).show(tb.rows[1]).mark(tb.rows[1], "bad").shake(tb).at(0.75).show(cons.items[0]);
    });
    S.beat("इस ERP में ऐसे कई नियम सीधे database में लिखे हैं। जैसे: एक time पर सिर्फ़ एक academic session active हो सकता है। ये PostgreSQL के partial unique index से बना है।", (t) => {
      t.at(0.2).show(cons.items[1]).at(0.6).show(cons.items.slice(2), { st: 0.4 }).at(0.85).show(tip);
    });
  });

  scene("Index — kitaab ke peeche wali <b>index</b> jaisa", (S) => {
    const l = S.text({ x: 90, y: 270, w: 800, t: "❌ Index ke bina", size: 40, weight: 800, color: "bad" });
    const r = S.text({ x: 1030, y: 270, w: 800, t: "✅ Index (B-tree) ke saath", size: 40, weight: 800, color: "ok" });
    const scan = S.text({ x: 90, y: 350, w: 800, t: "", size: 20 });
    scan.innerHTML = '<div style="display:grid;grid-template-columns:repeat(20,1fr);gap:6px">' + Array.from({ length: 140 }, (_, i) => `<i class="sq" style="height:30px;border-radius:5px;background:#26305a;display:block"></i>`).join("") + "</div>";
    const n1 = S.text({ x: 90, y: 650, w: 800, t: "0", size: 110, weight: 900, color: "bad", mono: true, align: "center" });
    const c1 = S.text({ x: 90, y: 790, w: 800, t: "rows padhni padi (full table scan)", size: 30, color: "mute", align: "center" });
    const root = S.box({ x: 1340, y: 350, w: 180, h: 80, t: "A – Z", c: "pg", sm: true });
    const m1 = S.box({ x: 1130, y: 480, w: 180, h: 80, t: "A – M", c: "pg", sm: true });
    const m2 = S.box({ x: 1550, y: 480, w: 180, h: 80, t: "N – Z", c: "pg", sm: true });
    const lf = S.box({ x: 1030, y: 610, w: 180, h: 80, t: "b23101", c: "ok", sm: true });
    const lf2 = S.box({ x: 1240, y: 610, w: 180, h: 80, t: "b24…", c: "pg", sm: true });
    const ta = [S.arrow(root, m1, { c: "pg", from: "b", to: "t" }), S.arrow(root, m2, { c: "pg", from: "b", to: "t" }), S.arrow(m1, lf, { c: "ok", from: "b", to: "t" }), S.arrow(m1, lf2, { c: "pg", from: "b", to: "t" })];
    const n2 = S.text({ x: 1030, y: 705, w: 800, t: "~17", size: 90, weight: 900, color: "ok", mono: true, align: "center" });
    const c2 = S.text({ x: 1030, y: 810, w: 800, t: "steps — 1 lakh rows me bhi", size: 30, color: "mute", align: "center" });
    const tip = S.tip("<b>Trade-off:</b> Index se read tez, par har INSERT/UPDATE thoda slow aur disk zyada. Isliye sirf un columns par jo WHERE / JOIN me aate hain — jaise <code>(student, status)</code>.");
    S.beat("अब speed की बात। मान लो enrollment table में एक लाख rows हैं, और हमें एक student की rows चाहिए। Index के बिना database को हर एक row पढ़नी पड़ेगी।", (t) => {
      t.at(0.1).show([l, scan]).at(0.4).to(".sq", { backgroundColor: "#ff5d73", stagger: 0.02, duration: 0.2 }, 3).show([n1, c1]).count(n1, 0, 100000, { d: 3 });
    });
    S.beat("Index बिल्कुल किताब के पीछे वाली index जैसा है। ये एक sorted tree होता है, जिसे B-tree कहते हैं। Database ऊपर से शुरू करता है, और हर step पर आधा हिस्सा छोड़ता जाता है।", (t) => {
      t.at(0.05).show(r).at(0.3).show(root).at(0.5).draw([ta[0], ta[1]]).show([m1, m2]).at(0.75).hl(m1, "ok").draw([ta[2], ta[3]]).show([lf, lf2]).at(0.92).hl(lf, "ok");
    });
    S.beat("एक लाख rows में भी सिर्फ़ सत्रह के आसपास steps। लेकिन ध्यान रखना, index मुफ़्त नहीं है। हर नई row पर index भी update होता है, तो writes थोड़े धीमे होते हैं।", (t) => {
      t.at(0.05).show([n2, c2]).at(0.45).show(tip);
    });
  });

  scene("🧠 Quick Quiz 1 / 4", (S) => {
    S.quiz("Double-click se do baar registration ko <b>100%%</b> kaun rokta hai?", ["Button ko JavaScript se disable karna", "Python ka if-check", "Database ka UNIQUE constraint"], 2, "✅ Sirf database constraint race condition me bhi guarantee deta hai.", "", "");
  });
});
