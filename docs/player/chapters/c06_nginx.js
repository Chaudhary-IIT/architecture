chapter({ id: "c06", title: "Nginx", c: "nginx", icon: "🚦", tag: "Reverse proxy — building ka main gate", say: "Gunicorn के आगे एक और server खड़ा होता है: Nginx।" }, () => {
  scene("Reverse proxy = <b>main gate ka guard</b>", (S) => {
    const us = [0, 1, 2].map((i) => S.box({ x: 80, y: 280 + i * 215, w: 230, h: 180, ic: ["📱", "💻", "🐌"][i], t: ["Mobile", "Laptop", "Slow WiFi"][i], c: "web", sm: true }));
    const ng = S.box({ x: 640, y: 440, w: 340, h: 280, ic: "🚦", t: "Nginx", s: "reverse proxy", c: "nginx" });
    const gu = S.box({ x: 1300, y: 440, w: 300, h: 280, ic: "🦄", t: "Gunicorn", s: "+ Django", c: "guni" });
    const ua = us.map((u) => S.arrow(u, ng, { c: "web" }));
    const ga = S.arrow(ng, gu, { c: "nginx", t: "sirf saaf requests" });
    const zone = S.zone({ x: 560, y: 330, w: 1130, h: 500, t: "Server ke andar — bahar se sirf Nginx dikhta hai", c: "nginx" });
    S.beat("Gunicorn Python चलाने में अच्छा है, लेकिन internet की भीड़ सीधे संभालने के लिए नहीं बना। इसलिए उसके आगे एक reverse proxy रखते हैं, जैसे Nginx।", (t) => {
      t.at(0.2).show(gu).at(0.6).pop(ng);
    });
    S.beat("इसे समझो building के main gate का guard। बाहर के सारे लोग सिर्फ़ guard से मिलते हैं। Guard तय करता है कि किसे अंदर भेजना है, और अंदर वाले को बाहर की दुनिया से बचाकर रखता है।", (t) => {
      t.at(0.05).show(us, { st: 0.2 }).draw(ua).at(0.4).send(ua[0], "req", { d: 0.8, adv: 0.2 }).send(ua[1], "req", { d: 0.8, adv: 0.2 }).send(ua[2], "req", { d: 1.6 }).at(0.7).show(zone).draw(ga).send(ga, "req", { c: "nginx" });
    });
  });

  scene("Nginx ke <b>4 kaam</b>", (S) => {
    const J = [
      ["🔒", "HTTPS / TLS", "encryption-decryption ka kaam yahin — Django ko plain request milti hai"],
      ["🐌", "Slow clients ko buffer", "dheere network wala user Gunicorn ke worker ko atka kar nahi rakhta"],
      ["🖼️", "Static files", "CSS, JS, images seedha disk se — Python ko jagaye bina"],
      ["⚖️", "Load balancing", "kai Gunicorn servers ho to requests baant deta hai"],
    ];
    const bx = J.map(([ic, t, s], i) => S.box({ x: 110 + (i % 2) * 870, y: 270 + Math.floor(i / 2) * 290, w: 830, h: 250, ic, t, s, c: "nginx", row: true }));
    const note = S.text({ x: 110, y: 850, w: 1700, t: "ℹ️ Is ERP me yahi role <b>Apache</b> reverse proxy nibhata hai, aur static files <b>WhiteNoise</b> (compressed + cache-friendly naam). Concept bilkul same hai.", size: 28, color: "mute", align: "center", c: "nginx" });
    const tip = S.tip("<b>Forward vs Reverse proxy:</b> Forward proxy client ki taraf se bolta hai (jaise VPN). Reverse proxy server ki taraf se. <b>X-Forwarded-For</b> header se asli user ka IP aage jaata hai.");
    S.beat("Nginx के चार बड़े काम हैं। पहला: HTTPS। Data को encrypt और decrypt करने की मेहनत Nginx करता है।", (t) => {
      t.at(0.2).show(bx[0]);
    });
    S.beat("दूसरा, और सबसे ज़रूरी: slow clients। मान लो किसी का hostel WiFi बहुत धीमा है। अगर वो सीधा Gunicorn से जुड़ा, तो एक worker उसी के लिए अटका रहेगा। Nginx पूरी request खुद जमा करता है, और फिर एक झटके में आगे देता है।", (t) => {
      t.at(0.05).show(bx[1]).at(0.5).flash(bx[1]);
    });
    S.beat("तीसरा: static files, जैसे CSS और images, Nginx सीधे disk से दे देता है। और चौथा: अगर servers एक से ज़्यादा हैं, तो load balancing।", (t) => {
      t.at(0.05).show(bx[2]).at(0.6).show(bx[3]);
    });
    S.beat("एक ईमानदार बात: इस ERP में यही काम Apache नाम का reverse proxy करता है, और static files के लिए WhiteNoise use हुआ है। Tool अलग है, लेकिन concept बिल्कुल वही। Interview में concept पूछा जाता है।", (t) => {
      t.at(0.1).show(note).at(0.55).show(tip);
    });
  });
});
