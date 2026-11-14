chapter({ id: "c02", title: "Django", c: "django", icon: "🎸", tag: "The web framework — “batteries included”", say: "तो चलो, सबसे पहले बात करते हैं Django की।" }, () => {
  scene("Django kya hai?", "Python ka web framework", (S) => {
    const scratch = S.box({ x: 140, y: 290, w: 520, h: 250, ic: "🧱", t: "Sab kuch khud banao", s: "routing, login, security, DB code…", c: "bad" });
    const kit = S.box({ x: 140, y: 600, w: 520, h: 250, ic: "🧰", t: "Framework", s: "ready-made toolkit — aap sirf apna logic likho", c: "django" });
    const bats = [["🧭", "URL routing"], ["🧩", "ORM"], ["📄", "Templates"], ["🍪", "Sessions"], ["🛡️", "CSRF / security"], ["🔁", "Migrations"], ["📝", "Forms"], ["🧪", "Testing"]];
    const bb = bats.map(([ic, t], i) => S.box({ x: 800 + (i % 2) * 500, y: 275 + Math.floor(i / 2) * 150, w: 460, h: 125, ic, t, c: "django", row: true, sm: true }));
    const tip = S.tip("<b>Why Django?</b> Data-heavy app + chhoti team → ORM, migrations, security defaults sab built-in. Python hone se Excel/PDF ka kaam (pandas) bhi easy.");
    S.beat("Website बनाने में बहुत सारे common काम होते हैं: URL समझना, login संभालना, database से बात करना, security। अगर ये सब खुद लिखोगे, तो महीनों लग जाएँगे।", (t) => {
      t.at(0.1).pop(scratch);
    });
    S.beat("Framework मतलब एक ready-made toolkit, जिसमें ये सारे common काम पहले से बने हुए हैं। Django, Python का सबसे popular web framework है।", (t) => {
      t.at(0.05).dim(scratch, 0.35).pop(kit);
    });
    S.beat("Django को कहते हैं batteries included। मतलब routing, ORM, templates, sessions, security, migrations, सब कुछ box के अंदर ही मिलता है।", (t) => {
      t.at(0.2).show(bb, { st: 0.28 });
    });
    S.beat("तो ERP के लिए Django क्यों? क्योंकि ERP में सैकड़ों forms और tables होते हैं। Django में ये बहुत जल्दी और safely बन जाते हैं। ये line interview में ज़रूर बोलना।", (t) => {
      t.at(0.15).show(tip);
    });
  });

  scene("Ek request ka safar — Django ke <b>andar</b>", "MVT pattern: Model · View · Template", (S) => {
    const y = 420, w = 250, h = 190;
    const br = S.box({ x: 60, y, w: 210, h, ic: "💻", t: "Browser", c: "web" });
    const ur = S.box({ x: 345, y, w, h, ic: "🧭", t: "urls.py", s: "kaunsa view?", c: "django" });
    const mw = S.box({ x: 670, y, w, h, ic: "💂", t: "Middleware", s: "security guards", c: "sec" });
    const vw = S.box({ x: 995, y, w, h, ic: "🧠", t: "View", s: "Python logic", c: "django" });
    const md = S.box({ x: 1320, y: 250, w, h, ic: "🧩", t: "Model", s: "data (ORM)", c: "pg" });
    const tp = S.box({ x: 1320, y: 600, w, h, ic: "📄", t: "Template", s: "HTML design", c: "web" });
    const db = S.box({ x: 1650, y: 250, w: 210, h, ic: "🐘", t: "Database", c: "pg" });
    const a = [S.arrow(br, ur), S.arrow(ur, mw), S.arrow(mw, vw), S.arrow(vw, md, { c: "pg" }), S.arrow(md, db, { c: "pg" }), S.arrow(vw, tp, { c: "web" })];
    const route = S.code({ x: 60, y: 720, w: 760, size: 25, title: "urls.py", lines: ['path("results/", views.results),', 'path("register/", views.register),'] });
    const guards = S.list({ x: 560, y: 690, w: 620, size: 27, gap: 10, items: [["🍪", "Session: kaun logged in hai?"], ["🛡️", "CSRF: form asli hai?"], ["🎭", "Role: is page ki permission?"], ["🧾", "Audit: sab note karo"]] });
    const back = S.arrow(tp, br, { c: "django", from: "l", to: "b", t: "HTML response", ly: 34 });
    const tip = S.tip("<b>MVT vs MVC:</b> Model = data, Template = dikhawat, View = logic. Django ka “View” = MVC ka Controller; framework khud routing sambhalta hai.");
    S.beat("अब देखते हैं कि Django के अंदर एक request के साथ होता क्या है। मान लो student ने results page खोला।", (t) => {
      t.at(0.2).pop(br).at(0.6).show(ur).draw(a[0]).send(a[0], "/results/");
    });
    S.beat("सबसे पहले request जाती है urls.py के पास। ये एक list है जो बताती है कि कौन से URL पर कौन सा Python function चलेगा। इस function को view कहते हैं।", (t) => {
      t.at(0.1).hl(ur).at(0.3).show(route).type(route).at(0.6).mark(route.lines[0]).at(0.95).unhl(ur);
    });
    S.beat("लेकिन view तक पहुँचने से पहले request को middleware से गुज़रना पड़ता है। Middleware को समझो security guards की line। हर request को हर guard check करता है।", (t) => {
      t.at(0.02).hide(route).at(0.1).show(mw).draw(a[1]).send(a[1], "request").at(0.45).hl(mw, "sec").show(guards.items, { st: 0.3 });
    });
    S.beat("फिर आता है view। ये असली दिमाग है। View तय करता है कि क्या data चाहिए, और वो data Model से माँगता है। Model, database से बात करता है।", (t) => {
      t.at(0.02).unhl(mw).hide(guards.items).at(0.08).show(vw).draw(a[2]).send(a[2], "request").at(0.4).hl(vw).at(0.6).show([md, db]).draw([a[3], a[4]]).send(a[3], "data do", { c: "pg" }).send(a[4], "SQL", { c: "pg" });
    });
    S.beat("Data मिलने के बाद view उसे template में भर देता है। Template मतलब HTML का ढाँचा, जिसमें खाली जगहें होती हैं। और तैयार page वापस browser को चला जाता है।", (t) => {
      t.at(0.02).unhl(vw).at(0.1).show(tp).draw(a[5]).send(a[5], "data → HTML", { c: "web" }).at(0.65).draw(back).send(back, "200 OK", { c: "django", d: 1.3 });
    });
    S.beat("इसी को कहते हैं MVT: Model, View, Template। Interview में पूछें कि MVC से क्या फ़र्क है, तो बोलना: Django का view असल में controller का काम करता है।", (t) => {
      t.at(0.1).flash([md, vw, tp], "audit").at(0.4).show(tip);
    });
  });

  scene("Ek asli view kaisa dikhta hai?", (S) => {
    const code = S.code({ x: 160, y: 260, w: 1600, size: 32, title: "views/student_results.py", lines: [
      "@student_required                      # sirf STUDENT role andar aa sakta hai",
      "def results(request):",
      '    roll = request.session["roll_no"]  # session se pata chala kaun hai',
      "    student = Student.objects.get(roll_no=roll)",
      '    rows = student.enrollments.filter(status="CMP")',
      '    return render(request, "results.html", {"rows": rows})',
    ] });
    const n1 = S.pill({ x: 220, y: 700, t: "1️⃣ permission check", c: "sec" });
    const n2 = S.pill({ x: 610, y: 700, t: "2️⃣ kaun hai?", c: "redis" });
    const n3 = S.pill({ x: 900, y: 700, t: "3️⃣ data lao (ORM)", c: "pg" });
    const n4 = S.pill({ x: 1270, y: 700, t: "4️⃣ HTML banao", c: "web" });
    S.beat("ये रहा एक असली view। सिर्फ़ छह lines। ऊपर एक decorator है जो check करता है कि user student ही है।", (t) => {
      t.at(0.1).show(code).type(code, { st: 0.3 }).at(0.6).mark(code.lines[0], "sec").show(n1);
    });
    S.beat("फिर session से roll number निकाला, database से उस student के completed courses निकाले, और template को दे दिए। बस, इतना ही।", (t) => {
      t.at(0.02).unmark(code.lines[0]).mark(code.lines[2], "redis").show(n2).at(0.35).unmark(code.lines[2]).mark([code.lines[3], code.lines[4]], "pg").show(n3).at(0.7).unmark([code.lines[3], code.lines[4]]).mark(code.lines[5], "web").show(n4);
    });
    S.beat("ध्यान दो, हमने कहीं भी SQL नहीं लिखा। ये जादू है ORM का। अगला chapter उसी के बारे में है।", (t) => {
      t.at(0.2).unmark(code.lines[5]).mark([code.lines[3], code.lines[4]], "audit");
    });
    const nd = S.nudge("👍 Kuch naya seekha? Ek like — taaki yeh video aur students tak pahunche");
    S.beat("", (t) => { t.at(0.1).pop(nd); });
  });
});
