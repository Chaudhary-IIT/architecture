chapter({ id: "c11", title: "Login & Security", c: "sec", icon: "🔐", tag: "Kaun ho tum? Aur kya kar sakte ho?", say: "अब देखते हैं कि login और security कैसे काम करती है।" }, () => {
  scene("Login: app <b>password store hi nahi karta</b>", "LDAP + session", (S) => {
    const br = S.box({ x: 70, y: 400, w: 280, h: 230, ic: "🧑‍🎓", t: "Student", s: "email + password", c: "web" });
    const dj = S.box({ x: 620, y: 400, w: 300, h: 230, ic: "🎸", t: "Django", s: "login view", c: "django" });
    const ld = S.box({ x: 1220, y: 250, w: 330, h: 200, ic: "📒", t: "LDAP server", s: "college ki central directory", c: "sec" });
    const pg = S.box({ x: 1220, y: 500, w: 330, h: 180, ic: "🐘", t: "PostgreSQL", s: "role kya hai?", c: "pg" });
    const rd = S.box({ x: 1220, y: 730, w: 330, h: 180, ic: "⚡", t: "Redis", s: "session save", c: "redis" });
    const a0 = S.arrow(br, dj, { c: "web", off: -40 }), a0b = S.arrow(dj, br, { c: "django", off: 40 });
    const a1 = S.arrow(dj, ld, { c: "sec", from: "r", to: "l" }), a2 = S.arrow(dj, pg, { c: "pg", from: "r", to: "l" }), a3 = S.arrow(dj, rd, { c: "redis", from: "r", to: "l" });
    const ck = S.pill({ x: 80, y: 690, t: "🍪 cookie: sessionid=ab12…", c: "redis" });
    const ses = S.code({ x: 1590, y: 740, w: 300, size: 20, title: "session", lines: ['role: "STUDENT"', 'roll_no: "b23101"'] });
    const tip = S.tip("<b>Authentication</b> = tum kaun ho? (LDAP). <b>Authorization</b> = tum kya kar sakte ho? (session ka role). Cookie me sirf random ID hoti hai, data server par.");
    S.beat("College में सबका एक ही email और password होता है, जो एक central directory में रखा है। उसे LDAP कहते हैं। तो हमारा app password अपने database में रखता ही नहीं।", (t) => {
      t.at(0.1).show([br, dj]).at(0.5).pop(ld);
    });
    S.beat("Login पर Django, LDAP से पूछता है: ये email और password सही है क्या? अगर LDAP हाँ बोले, तब Django अपने database में देखता है कि ये बंदा student है, faculty है, या admin।", (t) => {
      t.at(0.02).draw(a0).send(a0, "login", { d: 0.7 }).at(0.2).draw(a1).send(a1, "bind?", { d: 0.8 }).send(a1, "✓ sahi hai", { rev: true, c: "ok", d: 0.8 }).at(0.65).show(pg).draw(a2).send(a2, "role?", { d: 0.7 }).send(a2, "STUDENT", { rev: true, d: 0.7 });
    });
    S.beat("फिर Django एक session बनाता है। Session मतलब server की याददाश्त: ये user कौन है और उसका role क्या है। ये Redis में save होता है, और browser को सिर्फ़ एक random I D वाली cookie मिलती है।", (t) => {
      t.at(0.1).show(rd).draw(a3).send(a3, "save session", { d: 0.8 }).show(ses).type(ses).at(0.6).draw(a0b).send(a0b, "Set-Cookie", { c: "django", d: 0.8 }).show(ck);
    });
    S.beat("यहाँ दो शब्द याद रखो। Authentication: तुम कौन हो। Authorization: तुम क्या कर सकते हो। पहला LDAP करता है, दूसरा session का role।", (t) => {
      t.at(0.1).show(tip);
    });
  });

  scene("Har request par <b>guards ki line</b>", "middleware + decorators", (S) => {
    const G = [["🍪", "Session", "cookie se user pehchano"], ["🎭", "Role gate", "ADMIN pages sirf admin ko"], ["🛡️", "CSRF", "form me secret token"], ["😴", "Idle timeout", "45 min chup? logout"], ["🧾", "Audit log", "har request note"]];
    const bx = G.map(([ic, t, s], i) => S.box({ x: 90 + i * 355, y: 300, w: 320, h: 240, ic, t, s, c: "sec" }));
    const ar = bx.slice(1).map((b, i) => S.arrow(bx[i], b, { c: "sec" }));
    const roles = ["ADMIN", "CHAIR", "OFFICE", "FACULTY", "STUDENT"].map((r, i) => S.pill({ x: 250 + i * 290, y: 620, t: r, c: "web" }));
    const csrf = S.text({ x: 110, y: 720, w: 1700, t: "<b>CSRF</b> = koi doosri website chupke se aapke naam par form submit na kar de. Har form me ek secret token jaata hai jo sirf asli page ko pata hota hai.", size: 31, align: "center", c: "sec" });
    S.beat("Login के बाद हर request middleware की line से गुज़रती है। Session वाला guard cookie से user को पहचानता है। Role वाला guard देखता है कि ये page इस role के लिए है या नहीं।", (t) => {
      t.at(0.1).show(bx[0]).at(0.45).draw(ar[0]).show(bx[1]).at(0.7).show(roles, { st: 0.12 });
    });
    S.beat("CSRF guard हर form में एक secret token check करता है, ताकि कोई दूसरी website चुपके से आपके नाम पर form submit न कर दे।", (t) => {
      t.at(0.1).draw(ar[1]).show(bx[2]).hl(bx[2]).at(0.4).show(csrf);
    });
    S.beat("अगर आप बहुत देर तक कुछ नहीं करते, तो idle timeout आपको logout कर देता है। और last वाला guard हर request को audit log में लिख देता है।", (t) => {
      t.at(0.02).unhl(bx[2]).at(0.1).draw(ar[2]).show(bx[3]).at(0.6).draw(ar[3]).show(bx[4]).hl(bx[4], "audit");
    });
  });

  scene("Chhoti-chhoti <b>samajhdaar</b> cheezein", "jo interview me alag dikhati hain", (S) => {
    const L = S.list({ x: 140, y: 280, w: 1660, size: 33, gap: 24, items: [
      ["🚧", "<b>Rate limiting</b> — 10 minute me 5 galat password → block <small>brute-force attack se bachav; ginti Redis me TTL ke saath</small>"],
      ["🗑️", "<b>Soft delete</b> — student/course “delete” nahi hote, bas <code>is_deleted = True</code> <small>purana record aur transcript hamesha safe</small>"],
      ["🔁", "<b>Login par naya session</b> — purani session ID fenk do <small>session fixation attack se bachav</small>"],
      ["📑", "<b>CSV injection guard</b> — Excel me <code>=</code> se shuru hone wali value ko quote kar do"],
      ["🔒", "<b>HTTPS only</b> — HSTS, secure cookies, protected file downloads"],
    ] });
    S.beat("कुछ छोटी लेकिन समझदार चीज़ें। Rate limiting: बार-बार गलत password डालने वाले को रोक देना। Soft delete: student या course को सच में delete नहीं करते, बस एक flag लगा देते हैं, ताकि पुराना record कभी न खोए।", (t) => {
      t.at(0.1).show(L.items[0]).at(0.5).show(L.items[1]);
    });
    S.beat("Login पर हर बार नया session बनता है। Excel की खतरनाक values साफ़ की जाती हैं। और सब कुछ सिर्फ़ H T T P S पर चलता है। ऐसी चीज़ें बताओगे, तो लगेगा कि आपने production system पर काम किया है।", (t) => {
      t.at(0.05).show(L.items[2]).at(0.3).show(L.items[3]).at(0.55).show(L.items[4]);
    });
  });
});
