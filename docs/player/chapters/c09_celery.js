chapter({ id: "c09", title: "Celery", c: "celery", icon: "🥬", tag: "Bhaari kaam background me", say: "अब बात करते हैं Celery की, जो भारी काम पीछे से करता है।" }, () => {
  scene("Problem: ek request, <b>2 minute</b> ka kaam", (S) => {
    const ad = S.box({ x: 120, y: 360, w: 320, h: 260, ic: "🛡️", t: "Admin", s: "Excel upload: 3000 students", c: "web" });
    const wk = S.box({ x: 800, y: 360, w: 340, h: 260, ic: "👨‍🍳", t: "Gunicorn worker", s: "row 1… row 2… row 3…", c: "guni" });
    const ar = S.arrow(ad, wk, { c: "web" });
    const tm = S.text({ x: 1260, y: 380, w: 560, t: "0 s", size: 130, weight: 900, color: "bad", mono: true, align: "center" });
    const tl = S.text({ x: 1260, y: 550, w: 560, t: "⏱️ timeout = 120 s → 💀", size: 34, color: "mute", align: "center" });
    const pr = S.list({ x: 200, y: 720, w: 1500, size: 34, gap: 14, items: [["😵", "User ka browser ghoomta rehta hai, phir error"], ["🧱", "Ek worker itni der tak block — baaki users slow"]] });
    S.beat("Admin तीन हज़ार students की Excel file upload करता है। हर row को check करना है, database में डालना है। इसमें दो minute लग सकते हैं।", (t) => {
      t.at(0.1).pop(ad).at(0.35).show(wk).draw(ar).send(ar, "students.xlsx", { d: 1.2 });
    });
    S.beat("अगर ये काम request के अंदर ही हुआ, तो दो problems। User का browser घूमता रहेगा, और Gunicorn दो minute बाद उस worker को मार देगा। और तब तक वो worker किसी और के काम का नहीं।", (t) => {
      t.at(0.05).show(tm).count(tm, 0, 120, { d: 4, suf: " s", ease: "none" }).at(0.3).show(pr.items[0]).at(0.6).show(tl).shake(wk).show(pr.items[1]);
    });
  });

  scene("Solution: <b>token le lo, kaam peeche hoga</b>", "restaurant ka order system", (S) => {
    const br = S.box({ x: 70, y: 300, w: 270, h: 210, ic: "💻", t: "Browser", c: "web" });
    const dj = S.box({ x: 520, y: 300, w: 300, h: 210, ic: "🎸", t: "Django view", s: "order leta hai", c: "django" });
    const q = S.box({ x: 1010, y: 300, w: 330, h: 210, ic: "📬", t: "Redis queue", s: "broker", c: "redis" });
    const cw = S.box({ x: 1530, y: 300, w: 320, h: 210, ic: "🥬", t: "Celery worker", s: "alag container", c: "celery" });
    const pg = S.box({ x: 1530, y: 680, w: 320, h: 190, ic: "🐘", t: "PostgreSQL", c: "pg" });
    const res = S.box({ x: 1010, y: 680, w: 330, h: 190, ic: "📊", t: "Progress", s: "Redis me: 1500 / 3000", c: "redis" });
    const a1 = S.arrow(br, dj, { c: "web", off: -40 }), a1b = S.arrow(dj, br, { c: "django", off: 40 });
    const a2 = S.arrow(dj, q, { c: "django" }), a3 = S.arrow(q, cw, { c: "redis" }), a4 = S.arrow(cw, pg, { c: "celery" }), a5 = S.arrow(cw, res, { c: "celery", from: "b", to: "r", off: -90 });
    const a6 = S.arrow(br, res, { c: "web", from: "b", to: "l", dash: true, t: "har 2 sec: kitna hua?", ly: 36 });
    const bar = S.text({ x: 70, y: 560, w: 760, t: "", size: 24 });
    bar.innerHTML = '<div style="font:700 26px Inter;margin-bottom:10px">Processing students… <span id="cpct">0%</span></div><div style="height:38px;border-radius:12px;background:#10172e;border:2px solid #2b3765;overflow:hidden"><div id="cbar" style="height:100%;width:0;background:#b9e34f"></div></div>';
    const tip = S.tip("<b>Flow:</b> view task ko queue me daalta hai → turant task-id lautata hai → worker kaam karta hai → browser <b>polling</b> se progress poochta hai.");
    S.beat("इसका हल restaurant जैसा है। Counter पर order दो, token लो, और बैठ जाओ। खाना kitchen में बनेगा। Counter वाला अगले customer को देखेगा।", (t) => {
      t.at(0.1).show([br, dj]).at(0.5).show(q).at(0.7).show(cw);
    });
    S.beat("यहाँ भी वही होता है। Django view file को save करता है, और Redis की queue में एक छोटा सा message डाल देता है: ये file process करनी है। और तुरंत browser को एक task I D लौटा देता है।", (t) => {
      t.at(0.05).draw(a1).send(a1, "upload", { d: 0.8 }).at(0.35).draw(a2).send(a2, "task: file.xlsx", { d: 1 }).at(0.7).draw(a1b).send(a1b, "task_id: 7f3a", { c: "django", d: 0.9 });
    });
    S.beat("उधर Celery worker, जो एक अलग container में चल रहा है, queue से वो message उठाता है, और आराम से काम शुरू करता है। पाँच सौ rows का एक batch बनाकर database में डालता है।", (t) => {
      t.at(0.1).draw(a3).send(a3, "task", { d: 0.9 }).at(0.4).hl(cw).show(pg).draw(a4).send(a4, "500 rows", { d: 0.8, rep: 3 });
    });
    S.beat("और हर batch के बाद Redis में progress लिख देता है। Browser हर दो second में पूछता है: कितना हुआ? और user को एक सुंदर progress bar दिखती है।", (t) => {
      t.at(0.02).unhl(cw).show(res).draw(a5).send(a5, "50%", { d: 0.7 }).at(0.35).draw(a6).show(bar).to("#cbar", { width: "100%" }, 4).count(document.getElementById("cpct"), 0, 100, { d: 4, suf: "%", ease: "power2.inOut" });
    });
    S.beat("इसे कहते हैं asynchronous processing। Request तुरंत खत्म, और भारी काम background में। यही flow interview में step by step बोलना है।", (t) => {
      t.at(0.2).show(tip);
    });
  });

  scene("Celery aur kya-kya karta hai?", (S) => {
    const J = [["📥", "Bulk imports", "students, faculty, grades, marks ki Excel"], ["🧾", "PDF generation", "transcripts, reports"], ["✉️", "Emails", "OTP aur notifications"], ["⏰", "Celery Beat", "alarm clock: har 5 min audit log seal, roz purane OTP saaf"]];
    const bx = J.map(([ic, t, s], i) => S.box({ x: 110 + (i % 2) * 870, y: 270 + Math.floor(i / 2) * 250, w: 830, h: 215, ic, t, s, c: "celery", row: true }));
    const cmd = S.code({ x: 110, y: 780, w: 1700, size: 26, title: "worker command", lines: ["celery -A erp worker -B --concurrency=4 --max-tasks-per-child=50      # retries: max 3"] });
    const tip = S.tip("<b>Thread kyun nahi, Celery kyun?</b> Task queue me safe rehta hai (server restart ho to bhi), fail ho to <b>retry</b>, aur workers ko web se alag scale kar sakte hain. Tasks <b>idempotent</b> rakho.");
    S.beat("Celery सिर्फ़ Excel के लिए नहीं है। P D F बनाना, emails भेजना, ये सब भी धीमे काम हैं, और ये भी Celery को दे दिए जाते हैं।", (t) => {
      t.at(0.1).show(bx.slice(0, 3), { st: 0.5 });
    });
    S.beat("और एक चीज़ है Celery Beat। ये एक alarm clock है, जो तय time पर tasks चलाता है। जैसे हर पाँच minute में audit log को seal करना। ये क्या है, वो बस थोड़ी देर में देखेंगे।", (t) => {
      t.at(0.1).show(bx[3]).hl(bx[3], "audit").at(0.9).unhl(bx[3]);
    });
    S.beat("Interview में पूछेंगे: एक simple thread क्यों नहीं चला दिया? जवाब: Celery में task queue में सुरक्षित रहता है, fail हो तो दोबारा try होता है, और workers को अलग से बढ़ा सकते हैं।", (t) => {
      t.at(0.05).show(cmd).type(cmd).at(0.35).show(tip);
    });
  });
});
