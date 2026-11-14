chapter({ id: "c03", title: "Django ORM", c: "django", icon: "🧩", tag: "Python objects ⇄ database tables", say: "अब समझते हैं ORM, जो Django का सबसे powerful हिस्सा है।" }, () => {
  scene("ORM = <b>translator</b>", "Object Relational Mapper", (S) => {
    const py = S.code({ x: 80, y: 270, w: 800, size: 28, title: "models.py  (Python)", lines: [
      "class Student(models.Model):",
      "    roll_no  = CharField(unique=True)",
      "    name     = CharField(max_length=80)",
      "    semester = IntegerField()",
      "    branch   = ForeignKey(Branch)",
    ] });
    const tb = S.table({ x: 1060, y: 270, w: 780, title: "student  (database table)", cols: ["id", "roll_no", "name", "sem", "branch_id"], grid: "70px 150px 1fr 80px 150px", size: 25, hideRows: true,
      rows: [["1", "b23101", "Aarav", "3", "2"], ["2", "b23102", "Diya", "3", "2"], ["3", "b24017", "Kabir", "1", "5"]] });
    const ar = S.arrow(py, tb, { c: "django", t: "ORM" });
    const map = S.list({ x: 200, y: 690, w: 1500, size: 36, gap: 14, items: [["🏷️", "<b>Class</b> = table"], ["📏", "<b>Attribute</b> = column"], ["👤", "<b>Object</b> = ek row"]] });
    S.beat("Database सिर्फ़ SQL भाषा समझता है। और हम code लिखते हैं Python में। ORM इन दोनों के बीच का translator है।", (t) => {
      t.at(0.1).show(py).type(py, { st: 0.25 }).at(0.5).show(tb).at(0.75).draw(ar);
    });
    S.beat("आप Python में एक class लिखते हो, और Django उससे database में table बना देता है। Class मतलब table। Attribute मतलब column। और class का हर object मतलब table की एक row।", (t) => {
      t.at(0.4).show(map.items[0]).at(0.58).show(map.items[1]).at(0.75).show(map.items[2]).show(tb.rows, { st: 0.2 });
    });
  });

  scene("Python likho, <b>SQL</b> apne aap banta hai", (S) => {
    const py = S.code({ x: 110, y: 270, w: 1700, size: 34, title: "Python (QuerySet)", lines: ['Student.objects.filter(branch__code="CSE", semester=3).order_by("roll_no")'] });
    const sql = S.code({ x: 110, y: 560, w: 1700, size: 32, lang: "sql", title: "SQL jo database ko jaata hai", lines: [
      "SELECT * FROM student JOIN branch ON student.branch_id = branch.id",
      "WHERE branch.code = 'CSE' AND student.semester = 3",
      "ORDER BY student.roll_no;",
    ] });
    const ar = S.arrow({ x: 960, y: 420 }, { x: 960, y: 550 }, { c: "django", t: "ORM translate karta hai", pad: 0 });
    const tip = S.tip("<b>ORM ke 3 fayde:</b> ① kam code ② SQL injection se bachav (values alag se bheji jaati hain) ③ database badalna aasaan. <b>Lazy:</b> query tabhi chalti hai jab data chahiye.");
    S.beat("मान लो हमें C S E branch के third semester के सारे students चाहिए। Python में बस ये एक line लिखनी है।", (t) => {
      t.at(0.15).show(py).type(py);
    });
    S.beat("ORM इसे अपने आप SQL में बदल देता है, JOIN के साथ। आपको SQL याद रखने की ज़रूरत नहीं, और typing की गलती का chance भी कम।", (t) => {
      t.at(0.1).draw(ar).at(0.3).show(sql).type(sql, { st: 0.5 });
    });
    S.beat("इसके तीन बड़े फ़ायदे हैं। कम code। SQL injection नाम के attack से बचाव। और एक मज़ेदार बात: QuerySet lazy होता है, मतलब query तभी चलती है जब सच में data की ज़रूरत पड़े।", (t) => {
      t.at(0.1).show(tip);
    });
  });

  scene("Migrations = database ka <b>Git</b>", (S) => {
    const y = 400;
    const m = S.box({ x: 90, y, w: 340, h: 220, ic: "✏️", t: "models.py badla", s: "naya field: status", c: "django" });
    const mm = S.box({ x: 560, y, w: 340, h: 220, ic: "📝", t: "makemigrations", s: "change ki file banti hai", c: "sec" });
    const f = S.box({ x: 1030, y, w: 340, h: 220, ic: "📦", t: "0088_status.py", s: "Git me commit hoti hai", c: "web" });
    const mg = S.box({ x: 1500, y, w: 340, h: 220, ic: "🐘", t: "migrate", s: "ALTER TABLE chalta hai", c: "pg" });
    const a = [S.arrow(m, mm), S.arrow(mm, f), S.arrow(f, mg)];
    const tip = S.tip("<b>Migration</b> = schema change ka version-controlled record. Har developer aur server par database ka structure same rehta hai.");
    S.beat("अब मान लो आपने Student model में एक नया field जोड़ा: status। लेकिन database की table में तो वो column है ही नहीं।", (t) => {
      t.at(0.2).pop(m);
    });
    S.beat("तो आप चलाते हो makemigrations। Django आपके change को देखकर एक छोटी सी file बनाता है। फिर migrate command उस file को पढ़कर database में असली बदलाव करती है।", (t) => {
      t.at(0.1).draw(a[0]).show(mm).at(0.4).draw(a[1]).show(f).at(0.7).draw(a[2]).show(mg).flash(mg, "pg");
    });
    S.beat("Migrations को समझो database का Git। हर बदलाव का record, sequence में। इस ERP में ऐसी लगभग सौ migration files हैं।", (t) => {
      t.at(0.2).show(tip);
    });
  });

  scene("Sabse famous galti: <b>N+1 query</b> problem", (S) => {
    const bad = S.code({ x: 70, y: 260, w: 860, size: 27, title: "❌ slow", lines: [
      "students = Student.objects.all()",
      "for s in students:",
      "    print(s.branch.name)   # har baar nayi query!",
    ] });
    const good = S.code({ x: 990, y: 260, w: 860, size: 27, title: "✅ fast", lines: [
      "students = Student.objects",
      '       .select_related("branch")',
      "for s in students:",
      "    print(s.branch.name)   # koi nayi query nahi",
    ] });
    const n1 = S.text({ x: 70, y: 560, w: 860, t: "0", size: 150, weight: 900, color: "bad", align: "center", mono: true });
    const l1 = S.text({ x: 70, y: 740, w: 860, t: "queries (1 + 3000)", size: 34, color: "mute", align: "center" });
    const n2 = S.text({ x: 990, y: 560, w: 860, t: "1", size: 150, weight: 900, color: "ok", align: "center", mono: true });
    const l2 = S.text({ x: 990, y: 740, w: 860, t: "query (JOIN ke saath)", size: 34, color: "mute", align: "center" });
    const tip = S.tip("<b>select_related</b> → ForeignKey ke liye, SQL JOIN (1 query). <b>prefetch_related</b> → ManyToMany ke liye, 2 queries + Python me jodna.");
    S.beat("ORM इतना आसान है कि एक गलती बहुत common है। देखो ये code: सारे students लाओ, और हर student की branch का नाम print करो।", (t) => {
      t.at(0.15).show(bad).type(bad);
    });
    S.beat("यहाँ एक query students लाने के लिए चली, और फिर loop में हर student की branch के लिए एक और query। तीन हज़ार students, तो तीन हज़ार एक queries। इसे कहते हैं N plus one problem।", (t) => {
      t.at(0.1).mark(bad.lines[2], "bad").at(0.3).show([n1, l1]).count(n1, 1, 3001, { d: 3 });
    });
    S.beat("इलाज है select_related। ये Django को बोलता है: branch को भी उसी query में JOIN करके ले आओ। अब सिर्फ़ एक query। Page कई गुना तेज़।", (t) => {
      t.at(0.1).show(good).type(good).at(0.45).mark(good.lines[1], "ok").at(0.6).show([n2, l2]);
    });
    S.beat("ये interview का favourite सवाल है। Foreign key के लिए select_related, और many-to-many के लिए prefetch_related। ये याद रखना।", (t) => {
      t.at(0.1).show(tip);
    });
  });
});
