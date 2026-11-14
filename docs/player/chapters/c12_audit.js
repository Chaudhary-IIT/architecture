chapter({ id: "c12", title: "Audit Hash Chain", c: "audit", icon: "⛓️", tag: "Aisa log jisse chhed-chhad chhup nahi sakti", say: "और अब इस video का सबसे interesting हिस्सा: hash chain वाला audit log।" }, () => {
  scene("Audit log = <b>CCTV recording</b>", "kisne, kab, kahan se, kya badla", (S) => {
    const tb = S.table({ x: 110, y: 290, w: 1700, title: "audit_log", cols: ["id", "time", "user", "ip", "action", "kya badla (diff)"], grid: "80px 130px 300px 190px 150px 1fr", size: 25, hideRows: true, rows: [
      ["101", "10:02", "prof.rao@…", "10.8.1.20", "LOGIN", "—"],
      ["102", "10:05", "prof.rao@…", "10.8.1.20", "UPDATE", 'grade: "B" → "A"   (student b23101)'],
      ["103", "10:09", "b23101", "10.9.4.77", "VIEW", "/results/"],
    ] });
    const how = S.list({ x: 180, y: 620, w: 1560, size: 33, gap: 18, items: [
      ["💂", "<b>Middleware</b> har request ki ek row likhta hai"],
      ["📡", "<b>Django signals</b> har data change ka purana → naya value (diff) likhte hain"],
    ] });
    const q = S.text({ x: 110, y: 830, w: 1700, t: "Par agar koi database me ghus kar yeh log hi badal de? 😈", size: 44, weight: 800, color: "bad", align: "center" });
    S.beat("ERP में grades जैसी sensitive चीज़ें हैं। तो ये पता होना चाहिए कि किसने, कब, कहाँ से, क्या बदला। इसलिए हर request और हर data change की एक row audit log में लिखी जाती है। जैसे CCTV recording।", (t) => {
      t.at(0.1).show(tb).at(0.35).show(tb.rows, { st: 0.5 }).at(0.75).show(how.items, { st: 0.4 });
    });
    S.beat("देखो row एक सौ दो: किसी ने grade B से A कर दिया। अब सोचो, अगर किसी के पास database का access हो, और वो इस row को ही बदल दे या delete कर दे? तब तो log का कोई मतलब ही नहीं रहा।", (t) => {
      t.at(0.05).mark(tb.rows[1], "audit").at(0.45).mark(tb.rows[1], "bad").shake(tb).at(0.6).show(q);
    });
  });

  scene("Pehle samjho: <b>Hash</b> kya hota hai?", "SHA-256 = data ka fingerprint", (S) => {
    const i1 = S.code({ x: 110, y: 290, w: 620, size: 34, title: "input", lines: ['"grade = B"'] });
    const fn = S.box({ x: 820, y: 280, w: 280, h: 180, ic: "⚙️", t: "SHA-256", c: "audit", sm: true });
    const o1 = S.code({ x: 1190, y: 290, w: 620, size: 34, title: "hash (64 characters)", lines: ["9f2c41…e07a"] });
    const i2 = S.code({ x: 110, y: 540, w: 620, size: 34, title: "input (bas 1 akshar badla)", lines: ['"grade = A"'] });
    const fn2 = S.box({ x: 820, y: 530, w: 280, h: 180, ic: "⚙️", t: "SHA-256", c: "audit", sm: true });
    const o2 = S.code({ x: 1190, y: 540, w: 620, size: 34, title: "hash — poora alag!", lines: ["d81b7a…33c5"] });
    const a = [S.arrow(i1, fn, { c: "audit" }), S.arrow(fn, o1, { c: "audit" }), S.arrow(i2, fn2, { c: "audit" }), S.arrow(fn2, o2, { c: "bad" })];
    const props = S.list({ x: 150, y: 790, w: 1650, size: 31, gap: 10, items: [
      ["☝️", "<b>Same input → hamesha same hash.</b> Zara sa badlav → bilkul alag hash."],
      ["🚪", "<b>One-way:</b> hash se wapas data nahi nikal sakte."],
    ] });
    S.beat("इसका हल समझने के लिए पहले hash समझो। Hash function एक machine है। उसमें कोई भी data डालो, वो चौंसठ characters का एक code निकाल देती है। इसे data का fingerprint समझो।", (t) => {
      t.at(0.1).show(i1).type(i1).at(0.35).show(fn).draw(a[0]).at(0.6).draw(a[1]).show(o1).type(o1);
    });
    S.beat("इसकी खास बात: अगर input में एक अक्षर भी बदला, तो hash पूरा का पूरा बदल जाता है। B को A किया, और देखो, fingerprint बिल्कुल अलग।", (t) => {
      t.at(0.1).show(i2).type(i2).at(0.4).show(fn2).draw(a[2]).at(0.6).draw(a[3]).show(o2).type(o2).mark(o2.lines[0], "bad");
    });
    S.beat("Same input पर हमेशा same hash आता है। और hash से वापस data नहीं निकाला जा सकता। यहाँ जो function use हुआ है, उसका नाम है S H A two fifty six।", (t) => {
      t.at(0.1).show(props.items, { st: 1.5 });
    });
  });

  scene("Ab banao <b>chain</b>", "entry_hash = SHA-256( prev_hash + is row ka content )", (S) => {
    const gen = S.box({ x: 60, y: 420, w: 230, h: 200, t: "GENESIS", s: "0000…0000", c: "mute", sm: true });
    const blk = (i, x, id, content, ph, eh) => {
      const e = S.box({ x, y: 330, w: 440, h: 380, c: "audit" });
      e.innerHTML = `<div style="width:100%;text-align:left;font:600 23px 'JetBrains Mono',monospace;line-height:1.7"><div style="font:800 28px Inter;margin-bottom:6px">Row ${id}</div><div style="color:#9aa6d1">content:</div><div class="cnt">${content}</div><div style="color:#9aa6d1;margin-top:8px">prev_hash:</div><div class="ph" style="color:#6aa9ff">${ph}</div><div style="color:#9aa6d1;margin-top:8px">entry_hash:</div><div class="eh" style="color:#f5c542;font-weight:800">${eh}</div></div>`;
      return e;
    };
    const b1 = blk(0, 370, 101, "LOGIN prof.rao", "0000…0000", "a3f9…1c"), b2 = blk(1, 890, 102, "grade B → A", "a3f9…1c", "7be2…90"), b3 = blk(2, 1410, 103, "VIEW /results/", "7be2…90", "c44d…5e");
    const l0 = S.arrow(gen, b1, { c: "audit" }), l1 = S.arrow(b1, b2, { c: "audit", t: "⛓️" }), l2 = S.arrow(b2, b3, { c: "audit", t: "⛓️" });
    const fm = S.code({ x: 370, y: 780, w: 1480, size: 28, title: "audit_chain.py", lines: ['entry_hash = sha256(f"{prev_hash}\\n{canonical_json(row)}").hexdigest()'] });
    S.beat("अब असली trick। हर row के साथ हम उसका hash भी save करते हैं। लेकिन ये hash सिर्फ़ उस row के data का नहीं है।", (t) => {
      t.at(0.2).show(gen).at(0.5).draw(l0).show(b1);
    });
    S.beat("ये hash बनता है दो चीज़ों को मिलाकर: पिछली row का hash, plus इस row का content। तो row एक सौ दो के hash के अंदर row एक सौ एक का hash घुला हुआ है। और एक सौ तीन के अंदर एक सौ दो का।", (t) => {
      t.at(0.1).draw(l1).show(b2).at(0.3).flash(b1.querySelector(".eh"), "audit").flash(b2.querySelector(".ph"), "pg").at(0.6).draw(l2).show(b3).at(0.75).flash(b2.querySelector(".eh"), "audit").flash(b3.querySelector(".ph"), "pg");
    });
    S.beat("इस तरह सारी rows एक ज़ंजीर में बँध जाती हैं। हर कड़ी पिछली कड़ी से जुड़ी है। सबसे पहली row के लिए पिछला hash चौंसठ zeros माना जाता है, जिसे genesis कहते हैं। Blockchain और Git भी इसी idea पर चलते हैं।", (t) => {
      t.at(0.15).flash([b1, b2, b3], "audit").at(0.5).flash(gen, "audit").at(0.7).show(fm).type(fm);
    });
  });

  scene("Ab chhed-chhad karke dekho 😈", "verify = chain ko shuru se dobara chal kar check karna", (S) => {
    const blk = (x, id, content, ph, eh) => {
      const e = S.box({ x, y: 300, w: 520, h: 330, c: "audit" });
      e.innerHTML = `<div style="width:100%;text-align:left;font:600 24px 'JetBrains Mono',monospace;line-height:1.65"><div style="font:800 28px Inter;margin-bottom:4px">Row ${id}</div><div style="position:relative;height:40px"><span class="c1" style="position:absolute">${content[0]}</span><span class="c2" style="position:absolute;opacity:0;color:#ff5d73;font-weight:800">${content[1] || ""}</span></div><div style="color:#9aa6d1">prev_hash: <span style="color:#6aa9ff">${ph}</span></div><div style="color:#9aa6d1">entry_hash: <span style="color:#f5c542;font-weight:800">${eh}</span></div><div class="vr" style="margin-top:10px;font:800 26px Inter;height:36px;position:relative"><span class="ok" style="position:absolute;opacity:0;color:#4ade80">✓ hash match</span><span class="no" style="position:absolute;opacity:0;color:#ff5d73">✗ ${content[2] || ""}</span></div></div>`;
      return e;
    };
    const b1 = blk(90, 101, ["LOGIN prof.rao"], "0000…", "a3f9…1c");
    const b2 = blk(700, 102, ["grade B → A", "grade B → B  (edited!)", "content altered"], "a3f9…1c", "7be2…90");
    const b3 = blk(1310, 103, ["VIEW /results/", "", "broken link"], "7be2…90", "c44d…5e");
    const l1 = S.arrow(b1, b2, { c: "audit" }), l2 = S.arrow(b2, b3, { c: "audit" });
    const calc = S.text({ x: 500, y: 660, w: 920, t: "dobara calculate kiya: <b style='color:#ff5d73'>51aa…0d</b> ≠ stored <b style='color:#f5c542'>7be2…90</b>", size: 30, align: "center", mono: true });
    const out = S.list({ x: 160, y: 740, w: 1640, size: 31, gap: 12, items: [
      ["✏️", "<b>Row edit ki</b> → uska hash match nahi karega → <b>“content altered”</b>"],
      ["🧮", "<b>Hash bhi naya likh diya?</b> → agli row ka prev_hash toot gaya → poori chain dobara banani padegi"],
      ["🗑️", "<b>Row delete ki</b> → agli row ka prev_hash kisi se nahi milta → <b>“broken link”</b>"],
    ] });
    S.beat("अब मान लो किसी ने चुपके से row एक सौ दो को बदल दिया, ताकि लगे कि grade कभी बदला ही नहीं था।", (t) => {
      t.at(0.05).show([b1, b2, b3], { st: 0.15 }).draw([l1, l2]).at(0.6).to(b2.querySelector(".c1"), { opacity: 0 }, 0.3).to(b2.querySelector(".c2"), { opacity: 1 }, 0.3).hl(b2, "bad");
    });
    S.beat("Verify function chain को शुरू से चलता है, और हर row का hash दोबारा calculate करता है। Row एक सौ एक ठीक। Row एक सौ दो पर: content बदला है, तो नया hash, stored hash से match नहीं हुआ। चोरी पकड़ी गई।", (t) => {
      t.at(0.3).to(b1.querySelector(".ok"), { opacity: 1 }, 0.3).at(0.55).to(b2.querySelector(".no"), { opacity: 1 }, 0.3).shake(b2).show(calc).at(0.8).show(out.items[0]);
    });
    S.beat("अगर चोर चालाक है और row का hash भी नया लिख देता है? तब अगली row का prev hash match नहीं करेगा। उसे आगे की सारी rows दोबारा बनानी पड़ेंगी। और अगर कोई row delete कर दे, तो ज़ंजीर की कड़ी टूट जाती है, वो भी पकड़ में आ जाता है।", (t) => {
      t.at(0.02).hide(calc).at(0.15).show(out.items[1]).at(0.35).to(b3.querySelector(".no"), { opacity: 1 }, 0.3).hl(b3, "bad").to(l2.ln, { stroke: "#ff5d73", strokeDasharray: "6 14", strokeDashoffset: 0 }, 0.4).at(0.7).show(out.items[2]);
    });
  });

  scene("Asli engineering: <b>seal baad me</b> kyun lagti hai?", "concurrency ka problem", (S) => {
    const th = [0, 1, 2].map((i) => S.box({ x: 80, y: 280 + i * 150, w: 300, h: 125, ic: "🧵", t: "Thread " + (i + 1), s: "log likh raha hai", c: "guni", row: true, sm: true }));
    const tb = S.table({ x: 560, y: 270, w: 620, title: "audit_log", cols: ["id", "content", "entry_hash"], grid: "80px 1fr 200px", size: 24, rows: [["101", "LOGIN", "a3f9…1c ✓"], ["102", "UPDATE", "7be2…90 ✓"], ["103", "VIEW", "NULL"], ["104", "LOGIN", "NULL"], ["105", "UPDATE", "NULL"]] });
    const ta = th.map((x, i) => S.arrow(x, tb, { c: "guni", to: "l" }));
    const beat = S.box({ x: 1350, y: 280, w: 480, h: 200, ic: "⏰", t: "Celery Beat", s: "har 5 minute: seal task", c: "celery", row: true });
    const lock = S.box({ x: 1350, y: 520, w: 480, h: 180, ic: "🔐", t: "Advisory lock", s: "ek time par sirf EK sealer", c: "pg", row: true });
    const sa = S.arrow(beat, tb, { c: "celery", from: "l", to: "r" });
    const pts = S.list({ x: 110, y: 760, w: 1700, size: 29, gap: 10, items: [
      ["🏁", "Kai threads ek saath likhte hain → “pichhli row ka hash” par <b>race</b> → chain do hisso me phat sakti hai"],
      ["🧵", "Isliye rows pehle <b>bina hash</b> ke likhi jaati hain; ek akela sealer unhe <b>id ke order</b> me jodta hai"],
      ["📐", "Content ko <b>canonical JSON</b> (sorted keys) me badla jaata hai, taaki hash hamesha same aaye"],
    ] });
    S.beat("अब एक engineering सवाल, जो आपको बाकी candidates से अलग करेगा। Hash तभी क्यों नहीं लगाते जब row लिखी जाती है? क्योंकि Gunicorn के कई threads एक साथ log लिख रहे हैं।", (t) => {
      t.at(0.1).show(tb).at(0.4).show(th, { st: 0.15 }).draw(ta, { adv: 0.1 }).at(0.6).send(ta[0], "row", { d: 0.6, adv: 0.1 }).send(ta[1], "row", { d: 0.6, adv: 0.1 }).send(ta[2], "row", { d: 0.6 });
    });
    S.beat("अगर दो threads एक ही time पर पिछली row का hash पढ़ें, तो दोनों खुद को उसी के पीछे जोड़ लेंगे, और chain दो हिस्सों में फट जाएगी। ये वही race condition है।", (t) => {
      t.at(0.2).show(pts.items[0]).mark([tb.rows[2], tb.rows[3]], "bad");
    });
    S.beat("इसलिए rows पहले बिना hash के लिखी जाती हैं। फिर हर पाँच minute में Celery Beat एक seal task चलाता है। वो अकेला, I D के order में, सारी नई rows को chain में जोड़ देता है।", (t) => {
      t.at(0.02).unmark([tb.rows[2], tb.rows[3]]).show(pts.items[1]).at(0.35).pop(beat).draw(sa).send(sa, "seal", { c: "celery" }).at(0.7).mark([tb.rows[2], tb.rows[3], tb.rows[4]], "ok");
    });
    S.beat("और दो sealers गलती से एक साथ न चल जाएँ, इसके लिए PostgreSQL का advisory lock use होता है। वही transaction वाला lock, जो PgBouncer के साथ भी safe है। देखा, सारे chapters यहाँ आकर जुड़ गए।", (t) => {
      t.at(0.15).pop(lock).hl(lock, "pg").at(0.6).show(pts.items[2]).at(0.9).unhl(lock);
    });
  });

  scene("Imaandaar limits", "yeh bolna hi aapko senior dikhata hai", (S) => {
    const L = S.list({ x: 140, y: 280, w: 1660, size: 34, gap: 28, items: [
      ["🔎", "<b>Tamper-evident, tamper-proof nahi</b> <small>chhed-chhad rok nahi sakta — par chhupne nahi deta</small>"],
      ["⏳", "<b>Unsealed tail</b> — pichhle ~5 minute ki rows abhi chain me nahi hain <small>isliye sealer baar-baar chalta hai</small>"],
      ["🧨", "<b>Poora database jiske haath me ho</b> wo poori chain dobara bana sakta hai <small>ilaaj: latest hash ko bahar kahin save karo — off-site backup, alag server, ya publish</small>"],
      ["🪙", "<b>Blockchain se fark:</b> yahan ek hi server hai, koi distributed consensus nahi"],
    ] });
    const tip = S.tip("<b>One-liner:</b> “Har audit row ka SHA-256 hash pichhli row ke hash se juda hai; ek periodic single-writer sealer chain banata hai aur verify function edit ya delete dono pakad leta hai.”");
    S.beat("अब ईमानदारी से इसकी limits भी समझ लो। ये system छेड़छाड़ को रोकता नहीं है, बस उसे छुपने नहीं देता। अंग्रेज़ी में: tamper evident, tamper proof नहीं।", (t) => {
      t.at(0.2).show(L.items[0]);
    });
    S.beat("पिछले पाँच minute की rows अभी seal नहीं हुई होतीं। और अगर किसी के हाथ में पूरा database हो, तो वो पूरी chain दोबारा बना सकता है। इसका इलाज है: latest hash को कहीं बाहर भी save करना, जैसे off-site backup में।", (t) => {
      t.at(0.05).show(L.items[1]).at(0.35).show(L.items[2]).at(0.8).show(L.items[3]);
    });
    S.beat("Interview में सिर्फ़ feature मत बताना। उसकी limits और उनका इलाज भी बताना। यही junior और senior engineer का फ़र्क है।", (t) => {
      t.at(0.15).show(tip);
    });
  });

  scene("🧠 Quick Quiz 4 / 4", (S) => {
    S.quiz("Kisi ne sealed <b>row 102 delete</b> kar di. Verify kya bolega?", ["content altered (row 102)", "broken link (row 103)", "chain intact"], 1, "✅ Row 103 ka prev_hash ab kisi se match nahi karta → broken link.", "", "");
  });
});
