chapter({ id: "c07", title: "Docker", c: "docker", icon: "🐳", tag: "“Mere laptop par to chal raha tha!” ka ilaaj", say: "अब आता है Docker, जो deployment की सबसे बड़ी परेशानी खत्म करता है।" }, () => {
  scene("Problem: <b>“It works on my machine”</b>", (S) => {
    const lap = S.box({ x: 150, y: 300, w: 520, h: 330, ic: "💻", t: "Developer ka laptop", s: "Python 3.12 · sahi libraries · sab ✅", c: "ok" });
    const srv = S.box({ x: 1250, y: 300, w: 520, h: 330, ic: "🖥️", t: "Server", s: "Python 3.9 · PDF library gayab · 💥", c: "bad" });
    const ar = S.arrow(lap, srv, { c: "mute", t: "code copy kiya" });
    const need = S.text({ x: 150, y: 700, w: 1620, t: "Is ERP ko chahiye: Python 3.12 + 60 Python packages + PDF banane ki system libraries (pango, cairo) + LDAP libraries…", size: 32, color: "mute", align: "center" });
    S.beat("हर developer की सबसे पुरानी problem: मेरे laptop पर तो चल रहा था! Laptop पर Python का एक version है, server पर दूसरा। कोई library यहाँ है, वहाँ नहीं।", (t) => {
      t.at(0.15).pop(lap).at(0.45).draw(ar).send(ar, "code").at(0.6).pop(srv).shake(srv);
    });
    S.beat("और हमारे ERP को सिर्फ़ Python नहीं चाहिए। P D F बनाने के लिए system की कुछ खास libraries भी चाहिए। इन्हें हर server पर हाथ से install करना बहुत सिरदर्द है।", (t) => {
      t.at(0.2).show(need);
    });
  });

  scene("Image aur <b>Container</b>", "poora computer ek dabbe me", (S) => {
    const df = S.box({ x: 100, y: 380, w: 380, h: 280, ic: "📜", t: "Dockerfile", s: "recipe: kya-kya install karna hai", c: "docker" });
    const im = S.box({ x: 770, y: 380, w: 380, h: 280, ic: "📦", t: "Image", s: "frozen snapshot: OS + Python + libraries + code", c: "docker" });
    const cs = [0, 1, 2].map((i) => S.box({ x: 1440, y: 260 + i * 200, w: 380, h: 165, ic: "🚢", t: "Container", s: "chalti hui copy", c: "ok", row: true }));
    const a1 = S.arrow(df, im, { c: "docker", t: "docker build" });
    const a2 = cs.map((c) => S.arrow(im, c, { c: "ok" }));
    const lab = S.text({ x: 1160, y: 850, w: 400, t: "docker run", size: 26, mono: true, color: "ok" });
    const tip = S.tip("<b>Image = class, Container = object.</b> Container VM se halka hai kyunki wo host ka OS kernel share karta hai — poora OS boot nahi karta.");
    S.beat("Docker का idea simple है। अपने code के साथ उसका पूरा माहौल भी pack कर दो। Operating system की files, Python, सारी libraries, सब एक dabbe में।", (t) => {
      t.at(0.3).pop(im);
    });
    S.beat("ये dabba बनता है Dockerfile से। Dockerfile एक recipe है, जिसमें लिखा है कि क्या-क्या install करना है। Recipe से जो तैयार चीज़ बनती है, उसे image कहते हैं।", (t) => {
      t.at(0.1).show(df).at(0.4).draw(a1).send(a1, "build", { d: 1.2 }).at(0.8).flash(im);
    });
    S.beat("और जब image को चलाते हैं, तो वो बन जाता है container। एक image से जितने चाहो उतने containers बना लो। Programming की भाषा में: image है class, और container है उसका object।", (t) => {
      t.at(0.1).draw(a2, { adv: 0.1 }).show(cs, { st: 0.25 }).at(0.65).show(tip);
    });
  });

  scene("docker-compose — <b>poori team</b> ek command se", "is ERP ke 5 containers", (S) => {
    const zone = S.zone({ x: 70, y: 270, w: 1780, h: 520, t: "docker compose up -d", c: "docker" });
    const svc = [["🎸", "django-web", "Gunicorn + Django", "django"], ["🐘", "db", "PostgreSQL 17", "pg"], ["⚡", "redis", "cache + queue", "redis"], ["🥬", "celery-worker", "background jobs", "celery"], ["💾", "backup", "roz database backup", "mute"]];
    const bx = svc.map(([ic, t, s, c], i) => S.box({ x: 120 + i * 345, y: 330, w: 310, h: 230, ic, t, s, c }));
    const vol = [1, 0, 4].map((i, k) => S.pill({ x: 150 + i * 345, y: 610, t: ["🗄️ volume: postgres_data", "🗄️ volume: media, logs", "🗄️ volume: backups"][k], c: "sec" }));
    vol.forEach((v) => (v.style.fontSize = "20px"));
    const notes = S.list({ x: 150, y: 810, w: 1650, size: 30, gap: 8, items: [
      ["❤️‍🩹", "<b>healthcheck + depends_on</b> — Django tabhi start hota hai jab database “healthy” ho"],
      ["🧱", "<b>memory limits</b> — ek container poori machine ki RAM nahi kha sakta"],
    ] });
    S.beat("लेकिन हमारे ERP को एक नहीं, पाँच containers चाहिए। Django वाला web container, PostgreSQL, Redis, Celery worker, और एक backup container।", (t) => {
      t.at(0.1).show(zone).at(0.3).show(bx, { st: 0.45 });
    });
    S.beat("इन सबको एक साथ संभालता है docker compose। एक YAML file में सारे containers लिखे हैं, और एक command से पूरी team खड़ी हो जाती है।", (t) => {
      t.at(0.3).flash(bx, "docker");
    });
    S.beat("एक ज़रूरी बात: container temporary होता है। Delete किया, तो अंदर का सब कुछ गया। इसलिए database का data volume में रखा जाता है। Volume, container के बाहर की permanent जगह है।", (t) => {
      t.at(0.35).show(vol, { st: 0.25 });
    });
    S.beat("और compose ये भी देखता है कि database पूरी तरह तैयार हो, उसके बाद ही Django start हो। इसे health check कहते हैं।", (t) => {
      t.at(0.1).show(notes.items[0]).at(0.7).show(notes.items[1]);
    });
  });

  scene("Container start hote hi kya hota hai?", "entrypoint script", (S) => {
    const steps = [["⏳", "DB ka wait", "jab tak Postgres jawab na de"], ["💾", "Backup", "migration se pehle pg_dump"], ["🔁", "migrate", "naye schema changes lagao"], ["🎨", "collectstatic", "CSS/JS ek jagah jama"], ["🦄", "Gunicorn start", "ab requests aane do"]];
    const bx = steps.map(([ic, t, s], i) => S.box({ x: 80 + i * 360, y: 380, w: 320, h: 250, ic, t, s, c: i === 4 ? "guni" : "docker" }));
    const ar = bx.slice(1).map((b, i) => S.arrow(bx[i], b, { c: "docker" }));
    const tip = S.tip("<b>Multi-stage build:</b> pehle stage me compilers se packages bante hain, final image me sirf zaroori cheezein copy hoti hain → image chhoti aur safe. App <b>non-root user</b> se chalta hai.");
    S.beat("जब web container start होता है, तो एक script चलती है। पहले database का इंतज़ार। फिर safety के लिए एक backup। फिर migrate। फिर static files जमा करना। और सबसे last में Gunicorn start।", (t) => {
      t.at(0.08).show(bx[0]).at(0.25).draw(ar[0]).show(bx[1]).at(0.42).draw(ar[1]).show(bx[2]).at(0.58).draw(ar[2]).show(bx[3]).at(0.78).draw(ar[3]).show(bx[4]).hl(bx[4], "guni");
    });
    S.beat("Interview के लिए दो points और: image multi-stage build से बनती है, जिससे वो छोटी रहती है। और app, container के अंदर root user से नहीं चलता। ये security की अच्छी आदत है।", (t) => {
      t.at(0.05).unhl(bx[4]).at(0.15).show(tip);
    });
  });
});
