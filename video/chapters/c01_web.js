chapter({ id: "c01", title: "Web Basics", c: "web", icon: "🌐", tag: "Client, server, request, response", say: "सबसे पहले, website असल में काम कैसे करती है?" }, () => {
  scene("Website = do computers ki <b>baat-cheet</b>", (S) => {
    const cl = S.box({ x: 200, y: 400, w: 340, h: 260, ic: "💻", t: "Client", s: "aapka browser", c: "web" });
    const sv = S.box({ x: 1380, y: 400, w: 340, h: 260, ic: "🖥️", t: "Server", s: "door rakha computer", c: "django" });
    const a1 = S.arrow(cl, sv, { off: -45, c: "web", t: "HTTP request" });
    const a2 = S.arrow(sv, cl, { off: 45, c: "django", t: "HTTP response" });
    const req = S.code({ x: 640, y: 250, w: 640, size: 24, title: "request", lines: ["GET /results/ HTTP/1.1", "Cookie: sessionid=ab12…"] });
    const res = S.code({ x: 640, y: 720, w: 640, size: 24, title: "response", lines: ["HTTP/1.1 200 OK", "<html> …aapka result… </html>"] });
    S.beat("जब आप browser में कोई website खोलते हो, तो आपका browser होता है client, और दूर कहीं रखा एक computer होता है server।", (t) => {
      t.at(0.25).pop(cl).at(0.6).pop(sv);
    });
    S.beat("Client एक request भेजता है: मुझे results वाला page चाहिए। इस भाषा को कहते हैं HTTP।", (t) => {
      t.at(0.1).draw(a1).send(a1, "GET /results/").at(0.45).show(req).type(req);
    });
    S.beat("Server उस request को समझता है, database से data निकालता है, HTML page बनाता है, और response में वापस भेज देता है।", (t) => {
      t.at(0.1).flash(sv, "django").at(0.5).draw(a2).send(a2, "200 OK + HTML", { c: "django" }).at(0.7).show(res).type(res);
    });
  });

  scene("Ek academic ERP ko kya-kya karna hota hai?", (S) => {
    const roles = [["🧑‍🎓", "Student", "register, results"], ["🧑‍🏫", "Faculty", "marks, grades"], ["🪑", "Chair", "approve courses"], ["🏢", "Office", "course pool"], ["🛡️", "Admin", "sab kuch manage"]];
    const rb = roles.map(([ic, t, s], i) => S.box({ x: 90 + i * 355, y: 250, w: 320, h: 210, ic, t, s, c: "web" }));
    const needs = S.list({ x: 200, y: 540, w: 1500, size: 36, gap: 22, items: [
      ["🗂️", "<b>Bahut saara related data</b> — students, courses, enrollments, grades"],
      ["🚦", "<b>Rush hours</b> — registration day par hazaaron log ek saath"],
      ["🧾", "<b>Zero galti</b> — grade ya CGPA galat hua to bada issue"],
      ["🐢", "<b>Bhaari kaam</b> — 3000 rows ki Excel upload, PDF transcripts"],
    ] });
    S.beat("हमारे ERP में पाँच तरह के users हैं: Student, Faculty, Chairperson, Office staff और Admin। हर एक को अलग pages और अलग permissions चाहिए।", (t) => {
      t.at(0.1).show(rb, { st: 0.35 });
    });
    S.beat("Data बहुत सारा है और आपस में जुड़ा हुआ है। कभी-कभी बहुत भीड़ आती है। गलती की कोई गुंजाइश नहीं है। और कुछ काम बहुत भारी हैं, जैसे हज़ारों rows की Excel file upload करना।", (t) => {
      t.at(0.02).show(needs.items[0]).at(0.25).show(needs.items[1]).at(0.48).show(needs.items[2]).at(0.68).show(needs.items[3]);
    });
    S.beat("अब देखो, इन्हीं चार problems को solve करने के लिए हमारा पूरा tech stack चुना गया है। हर tool किसी एक problem का जवाब है।", (t) => {
      t.at(0.3).flash(needs.items, "audit");
    });
  });
});
