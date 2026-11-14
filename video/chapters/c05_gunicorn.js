chapter({ id: "c05", title: "Gunicorn", c: "guni", icon: "🦄", tag: "The application server — Django ko duniya ke saamne chalata hai", say: "Code तैयार है। अब उसे चलाएगा कौन? इसका जवाब है Gunicorn।" }, () => {
  scene("Django akela <b>request nahi sun sakta</b>", (S) => {
    const dev = S.box({ x: 120, y: 290, w: 520, h: 230, ic: "🧪", t: "runserver", s: "sirf development ke liye — ek-ek request, no security", c: "bad" });
    const net = S.box({ x: 120, y: 640, w: 300, h: 210, ic: "🌍", t: "Network", s: "port 8000", c: "web" });
    const gu = S.box({ x: 620, y: 640, w: 340, h: 210, ic: "🦄", t: "Gunicorn", s: "HTTP samajhta hai", c: "guni" });
    const ws = S.box({ x: 1140, y: 665, w: 240, h: 160, ic: "🔌", t: "WSGI", s: "standard plug", c: "sec", sm: true });
    const dj = S.box({ x: 1540, y: 640, w: 300, h: 210, ic: "🎸", t: "Django", s: "aapka code", c: "django" });
    const a = [S.arrow(net, gu), S.arrow(gu, ws), S.arrow(ws, dj)];
    const tip = S.tip("<b>WSGI</b> = Web Server Gateway Interface. Python web servers aur frameworks ke beech ka standard — isliye Gunicorn kisi bhi WSGI app (Django, Flask) ko chala sakta hai.");
    S.beat("जब आप अपने laptop पर Django चलाते हो, तो runserver command use करते हो। लेकिन Django खुद बोलता है: इसे production में कभी मत चलाना। ये धीमा है और secure नहीं है।", (t) => {
      t.at(0.2).pop(dev).at(0.7).shake(dev);
    });
    S.beat("असल में Django सिर्फ़ Python code है। उसे एक ऐसा program चाहिए जो network से requests सुने, और Django के function को call करे। यही काम Gunicorn करता है।", (t) => {
      t.at(0.02).dim(dev, 0.3).at(0.3).show(net).at(0.5).show(gu).draw(a[0]).send(a[0], "HTTP").at(0.8).show(dj);
    });
    S.beat("दोनों के बीच बात करने का तरीका एक standard है, जिसका नाम है WSGI। इसे समझो एक standard plug और socket की तरह। कोई भी WSGI server, किसी भी WSGI framework के साथ चल जाता है।", (t) => {
      t.at(0.15).pop(ws).draw([a[1], a[2]]).send(a[1], "call", { d: 0.7 }).send(a[2], "call", { d: 0.7 }).at(0.6).show(tip);
    });
  });

  scene("Master aur <b>workers</b>", "ek restaurant ki tarah", (S) => {
    const ms = S.box({ x: 810, y: 245, w: 300, h: 170, ic: "👨‍💼", t: "Master", s: "manager — khud khana nahi banata", c: "guni" });
    const wk = [0, 1, 2, 3, 4].map((i) => S.box({ x: 110 + i * 350, y: 520, w: 300, h: 210, ic: "👨‍🍳", t: "Worker " + (i + 1), s: "alag process", c: "guni" }));
    const wa = wk.map((w) => S.arrow(ms, w, { c: "guni", pad: 6, from: "b", to: "t" }));
    const th = wk.map((w, i) => S.text({ x: 110 + i * 350, y: 745, w: 300, t: "🧵🧵🧵🧵", size: 40, align: "center" }));
    const fm = S.text({ x: 110, y: 850, w: 1700, t: "workers = <b>2 × CPU cores + 1</b> &nbsp;·&nbsp; har worker me <b>4 threads</b> &nbsp;·&nbsp; class = <b>gthread</b>", size: 36, align: "center", c: "guni" });
    const tip = S.tip("<b>Kyun 2×CPU+1?</b> Web requests zyada time DB ka wait karti hain, CPU free rehta hai — to cores se thode zyada workers. <b>Kyun threads?</b> Wait ke time dusri request sambhal sakte hain.");
    S.beat("Gunicorn एक restaurant की तरह काम करता है। एक master process होता है, यानी manager। वो खुद कोई request handle नहीं करता। उसका काम है workers को संभालना।", (t) => {
      t.at(0.25).pop(ms);
    });
    S.beat("Workers अलग-अलग processes होते हैं, जैसे अलग-अलग chefs। हर worker के अंदर Django की पूरी copy चल रही होती है। एक worker busy है, तो दूसरा request ले लेता है।", (t) => {
      t.at(0.1).draw(wa, { adv: 0.1 }).show(wk, { st: 0.2 }).at(0.7).flash(wk[1]).at(0.8).flash(wk[3]);
    });
    S.beat("कितने workers? Formula है: दो गुणा CPU cores, plus एक। और इस app में हर worker के अंदर चार threads भी हैं। तो एक worker एक साथ चार requests संभाल सकता है।", (t) => {
      t.at(0.2).show(fm).at(0.55).show(th, { st: 0.12 });
    });
    S.beat("Process और thread दोनों क्यों? क्योंकि Python में एक process के अंदर एक time पर एक ही thread Python code चला सकता है। इसे GIL कहते हैं। तो CPU के लिए processes, और database के इंतज़ार के time के लिए threads।", (t) => {
      t.at(0.1).hide(fm).at(0.3).show(tip);
    });
  });

  scene("Gunicorn ke <b>safety switches</b>", (S) => {
    const cmd = S.code({ x: 110, y: 260, w: 1700, size: 31, title: "entrypoint.sh", lines: [
      "gunicorn erp.wsgi:application \\",
      "  --workers 5 --worker-class gthread --threads 4 \\",
      "  --timeout 120 \\",
      "  --max-requests 10000 --max-requests-jitter 1000 \\",
      "  --keep-alive 75",
    ] });
    const ex = S.list({ x: 150, y: 640, w: 1650, size: 33, gap: 16, items: [
      ["⏱️", "<b>timeout 120</b> — worker 2 minute se atka hai? Master use maar ke naya bana deta hai"],
      ["♻️", "<b>max-requests</b> — 10,000 requests ke baad worker restart → memory leak jama nahi hota"],
      ["🎲", "<b>jitter</b> — sab workers ek saath restart na ho jayein"],
    ] });
    S.beat("ये रही असली command जिससे Gunicorn start होता है। इसमें कुछ बहुत समझदार safety switches हैं।", (t) => {
      t.at(0.1).show(cmd).type(cmd, { st: 0.3 });
    });
    S.beat("Timeout: अगर कोई worker दो minute से अटका हुआ है, तो master उसे बंद करके नया worker बना देता है। Max requests: दस हज़ार requests के बाद worker खुद restart हो जाता है, ताकि memory leak जमा न हो।", (t) => {
      t.at(0.02).mark(cmd.lines[2]).show(ex.items[0]).at(0.5).unmark(cmd.lines[2]).mark(cmd.lines[3]).show(ex.items[1]);
    });
    S.beat("और jitter का मतलब है थोड़ा random फ़र्क, ताकि सारे workers एक ही time पर restart न हो जाएँ। ऐसी छोटी details ही production और college project का फ़र्क होती हैं।", (t) => {
      t.at(0.1).show(ex.items[2]);
    });
  });

  scene("🧠 Quick Quiz 2 / 4", (S) => {
    S.quiz("Server me <b>4 CPU cores</b> hain. Formula se kitne workers?", ["4 workers", "8 workers", "9 workers"], 2, "✅ 2 × 4 + 1 = 9 &nbsp;(is app me upar se 6 ka cap bhi hai)", "", "");
  });
});
