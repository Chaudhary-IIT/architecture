chapter({ id: "c08", title: "Redis", c: "redis", icon: "⚡", tag: "RAM me rehne wala super-fast store", say: "अब मिलते हैं हमारे stack के सबसे तेज़ member से: Redis।" }, () => {
  scene("Redis = <b>RAM</b> me key-value store", (S) => {
    const disk = S.box({ x: 180, y: 300, w: 640, h: 300, ic: "💽", t: "PostgreSQL (disk)", s: "permanent, powerful queries", c: "pg" });
    const ram = S.box({ x: 1100, y: 300, w: 640, h: 300, ic: "⚡", t: "Redis (RAM)", s: "sirf key → value, par bijli jaisa tez", c: "redis" });
    const t1 = S.text({ x: 180, y: 630, w: 640, t: "~ 5 ms", size: 80, weight: 900, color: "pg", align: "center", mono: true });
    const t2 = S.text({ x: 1100, y: 630, w: 640, t: "~ 0.2 ms", size: 80, weight: 900, color: "redis", align: "center", mono: true });
    const kv = S.code({ x: 560, y: 800, w: 800, size: 28, title: "redis", lines: ['SET  system_config  "{…}"  EX 300', "GET  system_config"] });
    S.beat("PostgreSQL data को disk पर रखता है। Safe है, powerful है, लेकिन हर query में थोड़ा time लगता है।", (t) => {
      t.at(0.1).pop(disk).at(0.5).show(t1);
    });
    S.beat("Redis data को सीधे RAM में रखता है। और बहुत simple तरीके से: बस key और value। जैसे Python की dictionary। इसलिए ये बहुत ज़्यादा तेज़ है।", (t) => {
      t.at(0.05).pop(ram).at(0.3).show(t2).at(0.5).show(kv).type(kv, { st: 0.6 });
    });
  });

  scene("Is ERP me Redis ke <b>4 kaam</b>", (S) => {
    const J = [
      ["🗃️", "Cache", "baar-baar chahiye wala data — settings, departments list", "DB /1"],
      ["🍪", "Sessions", "kaun logged in hai — har request par check hota hai", "DB /1"],
      ["🚧", "Rate limiting", "5 galat password / 10 min → login band", "DB /1"],
      ["📬", "Celery ka queue", "background jobs ki line (agla chapter)", "DB /0, /2"],
    ];
    const bx = J.map(([ic, t, s], i) => S.box({ x: 110 + (i % 2) * 870, y: 280 + Math.floor(i / 2) * 290, w: 830, h: 250, ic, t, s, c: "redis", row: true }));
    S.beat("इस ERP में Redis चार काम करता है। पहला: cache। जो data बार-बार चाहिए और कम बदलता है, उसकी एक copy Redis में रख लेते हैं।", (t) => {
      t.at(0.2).show(bx[0]);
    });
    S.beat("दूसरा: sessions। Login के बाद server को याद रखना होता है कि आप कौन हो। ये जानकारी Redis में रहती है, क्योंकि ये हर एक request पर पढ़ी जाती है।", (t) => {
      t.at(0.1).show(bx[1]);
    });
    S.beat("तीसरा: rate limiting। कोई दस minute में पाँच बार गलत password डाले, तो उसे रोक दो। ये गिनती Redis में रहती है, और अपने आप expire हो जाती है। और चौथा: Celery की queue, जो अगले chapter में आएगी।", (t) => {
      t.at(0.05).show(bx[2]).at(0.7).show(bx[3]);
    });
  });

  scene("Cache kaise kaam karta hai?", "cache-aside pattern", (S) => {
    const dj = S.box({ x: 120, y: 420, w: 320, h: 240, ic: "🎸", t: "Django", s: "settings chahiye", c: "django" });
    const rd = S.box({ x: 820, y: 260, w: 320, h: 220, ic: "⚡", t: "Redis", s: "cache", c: "redis" });
    const pg = S.box({ x: 820, y: 620, w: 320, h: 220, ic: "🐘", t: "PostgreSQL", s: "asli data", c: "pg" });
    const a1 = S.arrow(dj, rd, { c: "redis", from: "r", to: "l" });
    const a2 = S.arrow(dj, pg, { c: "pg", from: "r", to: "l" });
    const st = S.list({ x: 1240, y: 290, w: 620, size: 30, gap: 26, items: [
      ["1️⃣", "Pehle Redis se poocho"],
      ["2️⃣", "<b>MISS</b> → database se lao"],
      ["3️⃣", "Redis me rakh do, <b>TTL 5 min</b>"],
      ["4️⃣", "Agli baar: <b>HIT</b> — DB ko chheda hi nahi"],
      ["🧹", "Data badla? Cache <b>delete</b> karo (invalidation)"],
    ] });
    const tip = S.tip("<b>Line:</b> “Cache sirf ek copy hai, sach hamesha database me hai.” TTL + save par invalidation se cache purana nahi rehta.");
    S.beat("Cache कैसे काम करता है? मान लो Django को system की settings चाहिए। ये हर request पर लगती हैं। Django पहले Redis से पूछता है: तुम्हारे पास है क्या?", (t) => {
      t.at(0.1).show([dj, rd, pg]).at(0.6).draw(a1).send(a1, "GET config").show(st.items[0]);
    });
    S.beat("पहली बार Redis के पास नहीं होगा। इसे कहते हैं cache miss। तब Django database से data लाता है, और उसकी एक copy Redis में रख देता है, पाँच minute की expiry के साथ। इस expiry को T T L कहते हैं।", (t) => {
      t.at(0.1).send(a1, "MISS ✗", { rev: true, c: "bad" }).show(st.items[1]).at(0.4).draw(a2).send(a2, "SELECT…").send(a2, "data", { rev: true }).at(0.7).send(a1, "SET (5 min)").show(st.items[2]);
    });
    S.beat("अगली बार से Redis तुरंत जवाब दे देता है। इसे कहते हैं cache hit। Database को छूने की ज़रूरत ही नहीं पड़ी। हज़ारों queries बच गईं।", (t) => {
      t.at(0.1).send(a1, "GET config", { d: 0.6 }).send(a1, "HIT ✓", { rev: true, c: "ok", d: 0.6 }).show(st.items[3]).at(0.6).send(a1, "GET", { d: 0.5 }).send(a1, "HIT ✓", { rev: true, c: "ok", d: 0.5 });
    });
    S.beat("लेकिन अगर admin ने settings बदल दीं, तो? तब code उसी time Redis से पुरानी copy delete कर देता है। इसे कहते हैं cache invalidation। Interview में ये शब्द ज़रूर use करना।", (t) => {
      t.at(0.2).show(st.items[4]).flash(rd, "bad").at(0.6).show(tip);
    });
  });

  scene("RAM bhar gayi to?", "aur ek zaroori sabak", (S) => {
    const cfg = S.code({ x: 110, y: 270, w: 1700, size: 31, title: "docker-compose.yml", lines: ['redis-server --maxmemory 512mb --maxmemory-policy volatile-lru --save ""'] });
    const pts = S.list({ x: 150, y: 470, w: 1650, size: 34, gap: 26, items: [
      ["🧠", "<b>maxmemory 512mb</b> — isse zyada RAM nahi lega"],
      ["🗑️", "<b>volatile-lru</b> — bhar gaya to expiry wali keys me se sabse purani use hui key hata do"],
      ["⚠️", "<b>Sabak:</b> jo data khona afford nahi kar sakte, use sirf Redis me mat rakho<small>Is app me login-OTP ki ginti Postgres me hai — Redis se evict ho jaati to attacker ko extra chances mil jaate</small>"],
    ] });
    S.beat("RAM सीमित होती है। तो Redis को बोला गया है: पाँच सौ बारह M B से ज़्यादा मत लेना। भर जाए, तो जो keys सबसे पुरानी use हुई हैं, उन्हें हटा दो। इस policy को कहते हैं L R U: least recently used।", (t) => {
      t.at(0.05).show(cfg).type(cfg).at(0.35).show(pts.items[0]).at(0.6).show(pts.items[1]);
    });
    S.beat("इससे एक बड़ा सबक मिलता है। Redis से data कभी भी गायब हो सकता है। इसलिए जो चीज़ खोना afford नहीं कर सकते, उसे सिर्फ़ Redis में मत रखो। इस app में O T P की गिनती इसी वजह से PostgreSQL में रखी गई है।", (t) => {
      t.at(0.3).show(pts.items[2]);
    });
  });

  scene("🧠 Quick Quiz 3 / 4", (S) => {
    S.quiz("Admin ne settings badal di. Cache me padi <b>purani copy</b> ka kya karein?", ["Kuch nahi, TTL ka wait karo", "Usi waqt delete kar do", "Redis restart kar do"], 1, "✅ Cache invalidation: data badalte hi purani copy hatao. TTL sirf safety net hai.", "", "");
  });
});
