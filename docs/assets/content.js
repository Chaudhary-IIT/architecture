/* Course content: one entry per chapter. Text is Roman Hinglish so it is easy to read on any device. */
window.COURSE = [
  {
    id: "c00", slug: "start", icon: "🚀", title: "Start here", color: "#7c9cff",
    tagline: "3,000 students, ek registration day — server crash kyun nahi hota?",
    points: [
      "Yeh course ek <b>real academic ERP</b> ke architecture par based hai: student registration, grading, timetable, bulk uploads.",
      "Tech stack: <b>Django + PostgreSQL + Gunicorn + Nginx + Docker + Redis + Celery + PgBouncer</b>, aur ek hash-chain wala audit log.",
      "Har chapter me: pehle <i>problem</i>, phir <i>tool</i>, phir <i>interview me kya bolna hai</i>.",
    ],
    body: `<p>Maan lo aapko sirf thodi coding aati hai. Koi baat nahi. Hum bilkul basic se shuru karenge — website kaam kaise karti hai — aur dheere-dheere wahan tak jayenge jahan aap ek production system ko whiteboard par explain kar sako.</p>
<p><b>Kaise padhein:</b> har chapter ka animation play karo (captions on rakho), neeche ke notes padho, quiz do, aur jo samajh na aaye wo <b>Ask a doubt</b> me pooch lo.</p>`,
    qa: [
      ["Apne project ka architecture 1 minute me batao.", "“Yeh ek Django monolith hai jo server-side HTML render karta hai. Aage ek reverse proxy (Nginx/Apache) hai jo TLS aur slow clients sambhalta hai. Gunicorn WSGI server Django ko multiple worker processes aur threads me chalata hai. Data PostgreSQL me hai, PgBouncer se connection pooling hoti hai. Redis cache, sessions, rate-limiting aur Celery ka broker hai. Bhaari kaam — bulk Excel import, PDF, email — Celery workers background me karte hain. Sab kuch Docker Compose se deploy hota hai. Har request aur data change ek hash-chained audit log me jaata hai.”"],
      ["Monolith kyun, microservices kyun nahi?", "Team chhoti hai, data strongly related hai (ek transaction me student + enrollment + grade), aur load predictable hai (kuch hazaar users). Monolith me ek codebase, ek deploy, ek database transaction — simple aur reliable. Microservices tab jab alag teams ho ya alag hisson ko alag scale karna ho; yahan woh sirf network calls, distributed transactions aur ops ka bojh badhate."],
    ],
    quiz: [],
  },
  {
    id: "c01", slug: "web-basics", icon: "🌐", title: "Web Basics", color: "#7c9cff",
    tagline: "Client, server, request, response",
    points: [
      "<b>Client</b> (browser) request bhejta hai, <b>server</b> response deta hai. Dono ki bhasha: <b>HTTP</b>.",
      "Request me method (GET/POST), path (/results/), headers aur cookies hoti hain. Response me status code (200, 404, 500) aur body (HTML).",
      "HTTP <b>stateless</b> hai — server ko har request nayi lagti hai. Isliye login yaad rakhne ke liye <b>cookie + session</b> chahiye.",
      "ERP ki 4 problems: related data, rush hours, zero galti, bhaari kaam. Poora stack inhi ka jawab hai.",
    ],
    body: `<p>Jab aap browser me URL kholte ho, browser ek <b>HTTP request</b> banata hai: <code>GET /results/</code>. Yeh request internet se hote hue server tak jaati hai. Server usko padhta hai, database se data nikalta hai, ek HTML page banata hai aur <b>HTTP response</b> me wapas bhej deta hai. Browser us HTML ko screen par draw kar deta hai.</p>
<p>Is ERP me page server par hi ban kar aata hai — isko <b>server-side rendering (SSR)</b> kehte hain. React jaisa alag frontend app nahi hai; Django templates + Bootstrap. Fayda: simple, fast first load, kam JavaScript.</p>
<table><tr><th>Status code</th><th>Matlab</th></tr><tr><td>200</td><td>Sab theek</td></tr><tr><td>302</td><td>Redirect (jaise login ke baad dashboard)</td></tr><tr><td>403</td><td>Permission nahi</td></tr><tr><td>404</td><td>Page nahi mila</td></tr><tr><td>500</td><td>Server ke code me error</td></tr><tr><td>503</td><td>Server abhi available nahi (maintenance)</td></tr></table>`,
    qa: [
      ["Browser me URL type karne se page dikhne tak kya hota hai?", "DNS se domain ka IP milta hai → TCP connection (+ TLS handshake agar HTTPS) → browser HTTP request bhejta hai → reverse proxy → app server → app code database se data laata hai → HTML response → browser HTML parse karke CSS/JS/images ke liye aur requests bhejta hai → page render."],
      ["HTTP stateless hai, iska matlab? Login kaise yaad rehta hai?", "Server do requests ke beech kuch yaad nahi rakhta. Login ke baad server ek session banata hai (server side storage, yahan Redis) aur browser ko ek random session ID wali cookie deta hai. Browser har request ke saath cookie bhejta hai, server usse session dhoondh leta hai."],
      ["GET aur POST me fark?", "GET data maangne ke liye — safe aur idempotent, parameters URL me. POST data badalne ke liye — body me data, CSRF token zaroori, refresh par dobara submit ho sakta hai. Rule: jo request database badalti hai woh GET kabhi nahi honi chahiye."],
      ["SSR vs SPA?", "SSR: server HTML bana kar bhejta hai (Django templates). Simple, SEO-friendly, kam JS. SPA: browser me React/Vue app chalta hai aur server sirf JSON API deta hai — rich interactivity par zyada complexity. Forms-heavy internal ERP ke liye SSR kaafi aur sasta hai."],
    ],
    quiz: [
      ["Server ko kaise pata chalta hai ki request kis logged-in user ki hai?", ["IP address se", "Cookie me session ID se", "Browser ke naam se", "URL se"], 1, "Cookie me ek random session ID hoti hai; asli data server par session store me hota hai."],
      ["Status code 500 ka matlab?", ["Page nahi mila", "Permission nahi", "Server ke code me error", "Redirect"], 2, "5xx = server ki galti. 4xx = client ki galti."],
    ],
  },
  {
    id: "c02", slug: "django", icon: "🎸", title: "Django", color: "#44d19a",
    tagline: "Batteries-included Python web framework",
    points: [
      "<b>Framework</b> = common kaam (routing, DB, security, sessions) pehle se bane hue.",
      "Request ka raasta: <b>urls.py → middleware → view → model (ORM) → template → response</b>.",
      "<b>MVT</b>: Model = data, View = logic, Template = HTML. Django ka View ≈ MVC ka Controller.",
      "<b>Middleware</b> = har request par chalne wali guards ki line (session, CSRF, role check, audit).",
    ],
    body: `<p>Django ek Python web framework hai jiska motto hai <i>“batteries included”</i>. ORM, migrations, templates, forms, sessions, CSRF protection, admin panel — sab box ke andar.</p>
<h4>Django kyun chuna?</h4>
<ul><li><b>Data-heavy app:</b> ~40 models, 200+ URLs, saikdon forms. ORM + migrations yahan sabse zyada time bachate hain.</li><li><b>Security defaults:</b> SQL injection, XSS, CSRF, clickjacking ke against built-in protection.</li><li><b>Python ecosystem:</b> Excel ke liye pandas/openpyxl, PDF ke liye WeasyPrint, LDAP library — sab Python me ready.</li><li><b>Chhoti team:</b> conventions fixed hain, to naya developer jaldi samajh jaata hai.</li></ul>
<h4>Ek request ke andar</h4>
<pre>path("results/", views.results)        # urls.py: URL → view function

@student_required                      # decorator: role check
def results(request):
    roll = request.session["roll_no"]  # session se pehchaan
    student = Student.objects.get(roll_no=roll)
    rows = student.enrollments.filter(status="CMP")
    return render(request, "results.html", {"rows": rows})</pre>
<p>Is app me views ko role ke hisaab se alag files me baanta gaya hai (admin, chair, faculty, student) — ek hi Django “app” ke andar ~20 view modules.</p>`,
    qa: [
      ["Django kyun, Flask ya FastAPI ya Node kyun nahi?", "Flask/FastAPI micro-frameworks hain: ORM, migrations, auth, forms sab khud jodna padta. Is project me relational data aur forms bahut hain, to Django ka integrated ORM + migrations + security sabse productive hai. FastAPI async JSON APIs ke liye best hai, par yahan server-rendered HTML chahiye. Node me bhi yahi sab alag libraries se jodna padta, aur Python ka data ecosystem (pandas, WeasyPrint) nahi milta."],
      ["MVT aur MVC me fark?", "Dono same idea hain: data, logic aur presentation alag rakho. MVC ka Controller = Django ka View (logic). MVC ka View = Django ka Template (HTML). Django framework khud URL routing karke sahi view ko call karta hai, isliye ‘controller’ ka kuch hissa framework ke paas hai."],
      ["Middleware kya hota hai? Ek example do.", "Middleware ek layer hai jo har request ke view tak pahunchne se pehle aur response ke bahar jaane se pehle chalti hai — pyaaz ki parton ki tarah. Example: is app ka IdleTimeoutMiddleware har request par session ka last_activity dekhta hai; role ke hisaab se limit (student 45 min, faculty 2 ghante) cross ho gayi to session flush karke login par bhej deta hai. Order important hai — SessionMiddleware pehle aana chahiye kyunki baaki sab session padhte hain."],
      ["Django request-response lifecycle batao.", "WSGI server request ko Django ke handler ko deta hai → middleware (request phase) upar se neeche → URL resolver sahi view dhoondhta hai → view chalta hai, ORM se data, template render → response middleware se ulte order me wapas → WSGI server client ko bhejta hai."],
      ["Decorator kya karta hai, jaise @student_required?", "Decorator ek function hai jo doosre function ko wrap karta hai. @student_required view chalne se pehle session ka role check karta hai; role STUDENT nahi hai to login par redirect. Isse har view me same check dobara likhna nahi padta."],
    ],
    quiz: [
      ["Django me URL ko view function se kaun jodta hai?", ["models.py", "urls.py", "settings.py", "Template"], 1, "urls.py me path() entries URL pattern → view function ka mapping hain."],
      ["Django ka ‘View’ MVC ke kis hisse jaisa hai?", ["Model", "View", "Controller", "Database"], 2, "Django View me business logic hota hai — MVC ka Controller."],
      ["Middleware kab chalta hai?", ["Sirf login par", "Har request/response par", "Sirf error aane par", "Sirf admin ke liye"], 1, "Middleware har request aur response ke raaste me hota hai."],
    ],
  },
  {
    id: "c03", slug: "orm", icon: "🧩", title: "Django ORM", color: "#44d19a",
    tagline: "Python objects ⇄ database tables",
    points: [
      "<b>Class = table, attribute = column, object = row.</b>",
      "QuerySet <b>lazy</b> hota hai — SQL tabhi chalti hai jab data sach me chahiye.",
      "<b>Migrations</b> = schema changes ka version-controlled record (database ka Git).",
      "<b>N+1 problem</b>: loop me har row ke liye alag query. Ilaaj: <code>select_related</code> (FK, JOIN) / <code>prefetch_related</code> (M2M).",
      "Bulk kaam ke liye <code>bulk_create</code> / <code>bulk_update</code> (yahan 500 ke batch).",
    ],
    body: `<p>ORM (Object Relational Mapper) Python aur SQL ke beech ka translator hai.</p>
<pre>class Student(models.Model):
    roll_no  = models.CharField(max_length=10, unique=True)
    branch   = models.ForeignKey(Branch, on_delete=models.PROTECT)
    semester = models.IntegerField(db_index=True)

Student.objects.filter(branch__code="CSE", semester=3)
# → SELECT … FROM student JOIN branch … WHERE branch.code='CSE' AND semester=3</pre>
<h4>N+1 problem</h4>
<pre># ❌ 1 + N queries
for s in Student.objects.all():
    print(s.branch.name)

# ✅ 1 query (JOIN)
for s in Student.objects.select_related("branch"):
    print(s.branch.name)</pre>
<p>Is app ke hot paths me <code>select_related</code>, <code>prefetch_related</code>, <code>.only()</code> aur pehle se bane lookup dictionaries use hote hain taaki 3000-row imports me har row par query na chale.</p>
<h4>on_delete ke options</h4>
<p><code>CASCADE</code> (parent gaya to child bhi), <code>PROTECT</code> (child ho to parent delete hi nahi hoga — yahan Course/Offering par), <code>SET_NULL</code> (link hata do, row rakho).</p>`,
    qa: [
      ["ORM ke fayde aur nuksan?", "Fayde: kam code, database-independent, SQL injection se bachav (parameterized queries), migrations, Python me type-safe relationships. Nuksan: chhupi hui queries (N+1), bahut complex reports me raw SQL zyada saaf/tez hota hai, aur ‘magic’ ki wajah se beginners ko pata nahi chalta kitni queries chal rahi hain."],
      ["select_related aur prefetch_related me fark?", "select_related SQL JOIN use karta hai — ek hi query — aur ForeignKey/OneToOne (single object) ke liye hai. prefetch_related alag query chalata hai (WHERE id IN (...)) aur Python me jodta hai — ManyToMany aur reverse ForeignKey (multiple objects) ke liye."],
      ["QuerySet lazy hai, iska matlab?", "Student.objects.filter(...) likhne se koi SQL nahi chalti. Query tab chalti hai jab aap iterate karo, list() banao, len() lo, ya slice/print karo. Fayda: aap filters chain kar sakte ho aur ant me ek hi optimized query chalti hai."],
      ["Migration kya hai? Production me kaise lagti hai?", "Migration ek Python file hai jo schema change describe karti hai (add column, create table, add constraint). makemigrations models se file banata hai; migrate use database par chalata hai aur django_migrations table me record rakhta hai. Is project me container start hote hi entrypoint pehle pg_dump backup leta hai, phir migrate chalata hai."],
      ["3000 rows insert karni hain — kaise?", "Loop me .save() = 3000 queries. bulk_create(objs, batch_size=500) = 6 queries. Saath me lookups (jaise branch code → Branch object) pehle hi ek dictionary me load kar lo. Note: bulk_create par save() aur signals nahi chalte, to audit ke liye alag se bulk diff log karna padta hai."],
      ["Soft delete kya hota hai?", "Row ko sach me delete nahi karte; is_deleted=True aur deleted_at set kar dete hain, aur model ka delete() override hota hai. Fayda: transcript aur history safe. Dhyan: har query me is_deleted=False filter chahiye (custom manager se asaan)."],
    ],
    quiz: [
      ["ForeignKey ke saath N+1 hatane ke liye?", ["prefetch_related", "select_related", ".all()", ".count()"], 1, "ForeignKey → select_related (JOIN)."],
      ["Student.objects.filter(semester=3) likhte hi kya hota hai?", ["SQL turant chalti hai", "Kuch nahi — QuerySet lazy hai", "Table lock ho jaati hai", "Cache me save hota hai"], 1, "Query tab chalegi jab data evaluate hoga."],
    ],
  },
  {
    id: "c04", slug: "postgresql", icon: "🐘", title: "PostgreSQL", color: "#6aa9ff",
    tagline: "Relational database: ACID, constraints, indexes",
    points: [
      "Data tables me, tables <b>foreign keys</b> se jude hue → relational database.",
      "<b>ACID</b>: Atomic, Consistent, Isolated, Durable. <code>transaction.atomic()</code> = sab ya kuch nahi.",
      "<b>Constraints</b> database ke andar ke rules hain — race condition me bhi nahi toot-te.",
      "<b>Index</b> (B-tree) read tez karta hai, write thoda slow. Sirf WHERE/JOIN wale columns par.",
    ],
    body: `<h4>PostgreSQL hi kyun?</h4>
<table><tr><th>Option</th><th>Kyun nahi / kyun haan</th></tr>
<tr><td>MongoDB</td><td>Data highly related hai (student ↔ enrollment ↔ offering ↔ course). JOINs aur multi-row transactions roz ka kaam hain; schema strict chahiye.</td></tr>
<tr><td>SQLite</td><td>Ek time par ek hi writer; network par multiple app servers se use nahi hota.</td></tr>
<tr><td>MySQL</td><td>Chal sakta tha, par Postgres me partial unique indexes, CHECK constraints, JSONB, advisory locks, behtar concurrency (MVCC) milti hai — aur yeh sab yahan use hue hain.</td></tr></table>
<h4>Is app ke asli constraints</h4>
<ul><li><code>UNIQUE(student, offering)</code> — ek course me do baar registration impossible.</li><li><b>Partial unique index</b>: <code>UNIQUE(is_active) WHERE is_active = true</code> — sirf ek academic session active.</li><li><code>CHECK(status IN (...))</code> — galat status string database me ja hi nahi sakti.</li><li><code>on_delete=PROTECT</code> — jis offering me enrollments hain wo delete nahi hogi.</li></ul>
<h4>Indexes</h4>
<p>Composite indexes jaise <code>(student, status)</code>, <code>(offering, status)</code> un queries ke liye hain jo dashboard par baar-baar chalti hain. Slow queries (1 second se zyada) log hoti hain: <code>log_min_duration_statement=1000</code>.</p>`,
    qa: [
      ["ACID samjhao, example ke saath.", "Atomicity: bulk grade upload ke 3000 rows ek transaction me — beech me error to sab rollback. Consistency: constraints (unique, FK, check) transaction ke ant me hamesha satisfied. Isolation: do log ek saath register karein to ek ka adha kaam doosre ko nahi dikhta. Durability: COMMIT ke baad data WAL (write-ahead log) me disk par hai — crash ke baad bhi rahega."],
      ["Validation code me hai to database constraint kyun?", "Kyunki application-level check ‘check then insert’ hai — do requests ek saath check pass kar sakti hain (race condition). Database constraint atomic hai aur har raaste (web, Celery task, admin shell, manual SQL) par lagu hota hai. Code validation achha error message deta hai; constraint aakhri guarantee."],
      ["Index kya hai? Har column par kyun nahi lagate?", "Index ek sorted data structure (B-tree) hai jo row ko O(log n) me dhoondhta hai, full table scan O(n) ke badle. Par har INSERT/UPDATE/DELETE par index bhi update hota hai, disk aur RAM leta hai. Isliye sirf un columns par jo WHERE, JOIN, ORDER BY me aate hain aur jinki selectivity achhi hai."],
      ["Partial index kya hota hai?", "Index jo sirf kuch rows par bana ho (WHERE clause ke saath). Example: UNIQUE index on is_active WHERE is_active=true → table me kitni bhi inactive sessions ho sakti hain, par active sirf ek. Yeh MySQL me seedha possible nahi."],
      ["Race condition kya hoti hai? Kaise rokte ho?", "Jab do operations ek saath chalein aur result unke order par depend kare. Rokne ke tareeke: database constraints, transaction + SELECT … FOR UPDATE (row lock), atomic conditional UPDATE (UPDATE … WHERE attempts < 5), ya advisory locks. Is app me admin force-enroll plan ko select_for_update ke andar dobara compute kiya jaata hai."],
      ["Isolation levels?", "Read Committed (Postgres default): sirf committed data dikhta hai. Repeatable Read: transaction ko shuru ka snapshot dikhta hai. Serializable: aisa result jaise transactions ek ke baad ek chale ho. Zyada isolation = zyada safety par zyada retries/locks."],
    ],
    quiz: [
      ["Double-click se do baar registration ko 100% kaun rokta hai?", ["JavaScript button disable", "Python if-check", "Database UNIQUE constraint", "Redis cache"], 2, "Sirf database constraint race condition me bhi guarantee deta hai."],
      ["Index ka nuksan?", ["Reads slow", "Writes thode slow + zyada disk", "Data corrupt", "Koi nahi"], 1, "Har write par index bhi update hota hai."],
      ["ACID ka ‘A’?", ["Available", "Atomic", "Async", "Authenticated"], 1, "Atomic = sab ya kuch nahi."],
    ],
  },
  {
    id: "c05", slug: "gunicorn", icon: "🦄", title: "Gunicorn", color: "#3fd0c9",
    tagline: "WSGI application server: master, workers, threads",
    points: [
      "<code>runserver</code> sirf development ke liye. Production me <b>WSGI server</b> chahiye.",
      "<b>WSGI</b> = Python web server aur framework ke beech ka standard interface.",
      "<b>Master</b> process workers ko manage karta hai; <b>workers</b> requests handle karte hain.",
      "Yahan: <code>workers = min(2×CPU+1, 6)</code>, <code>gthread</code>, <code>4 threads</code>, <code>timeout 120</code>, <code>max-requests 10000</code>.",
    ],
    body: `<pre>gunicorn erp.wsgi:application \\
  --workers 5 --worker-class gthread --threads 4 \\
  --timeout 120 --keep-alive 75 \\
  --max-requests 10000 --max-requests-jitter 1000</pre>
<h4>Process + thread dono kyun?</h4>
<p>Python ka <b>GIL</b> (Global Interpreter Lock) ek process me ek time par ek hi thread ko Python bytecode chalane deta hai. To CPU cores ka fayda uthane ke liye <b>multiple processes</b>. Par web request ka zyada time <b>I/O wait</b> (database, LDAP, Redis) me jaata hai, aur wait ke dauran GIL chhoot jaata hai — to <b>threads</b> us time me doosri request sambhal lete hain. 5 workers × 4 threads = 20 requests ek saath.</p>
<h4>Safety switches</h4>
<ul><li><b>timeout</b>: atka hua worker master maar ke naya banata hai.</li><li><b>max-requests + jitter</b>: workers periodically recycle → memory leak jama nahi hota; jitter se sab ek saath restart nahi hote.</li><li><b>keep-alive 75</b>: reverse proxy ke connection pool se zyada rakha gaya, warna proxy band ho chuke socket par request bhej deta tha (ek asli production bug!).</li></ul>`,
    qa: [
      ["WSGI kya hai? ASGI se fark?", "WSGI ek synchronous interface hai: server app ko callable(environ, start_response) ki tarah call karta hai — ek request, ek response. ASGI async version hai jo WebSockets aur long-lived connections support karta hai (Uvicorn/Daphne). Yeh app classic request-response hai, isliye WSGI + Gunicorn."],
      ["Gunicorn workers kitne rakhein? Formula ka logic?", "Rule of thumb (2 × cores) + 1: requests ka kaafi time I/O wait me jaata hai, to cores se zyada workers CPU ko busy rakhte hain; +1 isliye ki ek worker restart ho raha ho to capacity na gire. Par har worker poori Django ki copy RAM me rakhta hai, isliye yahan max 6 ka cap hai."],
      ["sync, gthread, gevent worker classes me fark?", "sync: ek worker = ek request; simple, par slow request worker ko block karti hai. gthread: har worker me thread pool; I/O-bound apps ke liye achha, code me koi badlav nahi. gevent/eventlet: green threads, hazaaron concurrent connections, par libraries cooperative honi chahiye (monkey-patching)."],
      ["GIL kya hai?", "CPython ka ek lock jo ek process me ek time par ek hi thread ko Python bytecode chalane deta hai. CPU-bound kaam threads se tez nahi hota (processes chahiye), par I/O-bound kaam me thread wait karte waqt GIL chhod deta hai, isliye threads web apps me useful hain."],
      ["max-requests kyun?", "Lambe time chalte Python processes me memory dheere-dheere badh sakti hai (leaks, fragmentation). N requests ke baad worker ko gracefully restart karne se memory reset ho jaati hai. Jitter random offset deta hai taaki saare workers ek saath recycle na hon."],
    ],
    quiz: [
      ["4 CPU cores par formula se kitne workers?", ["4", "8", "9", "16"], 2, "2 × 4 + 1 = 9 (is app me 6 ka cap hai)."],
      ["Threads web app me kyun kaam aate hain jab GIL hai?", ["GIL web me nahi hota", "I/O wait ke time GIL chhoot jaata hai", "Threads alag CPU par chalte hain", "Nahi aate"], 1, "DB/network ka wait karte waqt doosra thread chal sakta hai."],
    ],
  },
  {
    id: "c06", slug: "nginx", icon: "🚦", title: "Nginx (Reverse proxy)", color: "#35c46b",
    tagline: "Main gate ka guard: TLS, buffering, static, load balancing",
    points: [
      "Reverse proxy clients aur app server ke <b>beech</b> baithta hai.",
      "Kaam: <b>HTTPS/TLS</b>, <b>slow clients ko buffer</b>, <b>static files</b>, <b>load balancing</b>, compression, rate limiting.",
      "Asli user ka IP <code>X-Forwarded-For</code> header se aage jaata hai.",
      "<b>Note:</b> is ERP me yeh role Apache nibhata hai aur static files WhiteNoise — concept same.",
    ],
    body: `<p>Gunicorn ke workers mehenge hain (har ek me poori Django). Agar ek slow mobile client apni request 30 second me upload kare aur worker seedha us se juda ho, to worker 30 second block. Reverse proxy event-driven hota hai — hazaaron slow connections sasti tarah sambhal leta hai, poori request jama karta hai, phir fast local connection par Gunicorn ko deta hai.</p>
<pre>server {
  listen 443 ssl;
  location /static/ { alias /app/staticfiles/; expires 1y; }
  location / {
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
  }
}</pre>
<h4>Static files: WhiteNoise</h4>
<p>Is app me CSS/JS ko Django ke andar hi <b>WhiteNoise</b> serve karta hai: files compress (gzip/brotli) hoti hain aur naam me content hash lagta hai (<code>app.3f9a1c.css</code>) — to browser unhe hamesha ke liye cache kar sakta hai, aur file badalne par naam badal jaata hai.</p>`,
    qa: [
      ["Reverse proxy kyun chahiye jab Gunicorn HTTP samajhta hai?", "Gunicorn ke docs khud kehte hain ki use proxy ke peeche rakho. Reasons: slow-client buffering (workers free rehte hain), TLS termination, static files, connection limits/DoS se bachav, multiple backends me load balancing, zero-downtime deploys."],
      ["Forward proxy aur reverse proxy me fark?", "Forward proxy client ki taraf se internet par jaata hai (office proxy, VPN) — server ko asli client nahi dikhta. Reverse proxy server ke saamne khada hota hai — client ko asli server nahi dikhta."],
      ["X-Forwarded-For kya hai? Isme risk?", "Proxy ke peeche app ko har request proxy ke IP se aati dikhti hai. Proxy asli client IP is header me daal deta hai. Risk: client khud bhi yeh header bhej sakta hai, to sirf trusted proxy ki lagayi hui (last) value par bharosa karo — rate limiting aur audit log dono isi par depend karte hain."],
      ["TLS termination kya hota hai?", "HTTPS ka encryption/decryption proxy par khatam ho jaata hai; proxy se app tak plain HTTP (private network me). App ko X-Forwarded-Proto: https se pata chalta hai ki original request secure thi (Django: SECURE_PROXY_SSL_HEADER)."],
      ["Static files ko Django se serve karna theek hai?", "Plain Django se nahi (slow, har file par Python). WhiteNoise ke saath theek hai chhote-medium apps ke liye: compressed, cache-forever headers, hashed filenames. Bade scale par Nginx ya CDN."],
    ],
    quiz: [
      ["Slow client se Gunicorn worker ko kaun bachata hai?", ["Redis", "Reverse proxy ka buffering", "PgBouncer", "Celery"], 1, "Proxy poori request jama karke fast connection par aage deta hai."],
      ["Reverse proxy kis ki taraf se bolta hai?", ["Client", "Server", "Database", "DNS"], 1, "Reverse proxy server ke saamne khada hota hai."],
    ],
  },
  {
    id: "c07", slug: "docker", icon: "🐳", title: "Docker", color: "#4ab3ff",
    tagline: "Code + environment ek image me; Compose se poora stack",
    points: [
      "<b>Image</b> = frozen snapshot (OS files + Python + libraries + code). <b>Container</b> = chalti hui image.",
      "<b>Dockerfile</b> = image banane ki recipe. <b>Multi-stage build</b> se image chhoti.",
      "<b>docker-compose</b>: 5 services — django-web, db, redis, celery-worker, backup.",
      "Data <b>volumes</b> me (container disposable hai). <b>healthcheck + depends_on</b> se start order.",
    ],
    body: `<pre># Dockerfile (simplified)
FROM python:3.12-slim AS builder          # stage 1: compilers ke saath
RUN apt-get install -y build-essential libldap2-dev
RUN pip install -r requirements.txt       # venv me

FROM python:3.12-slim                     # stage 2: sirf runtime
RUN apt-get install -y libpango-1.0-0 libcairo2   # PDF ke liye
COPY --from=builder /venv /venv
COPY . /app
USER appuser                              # non-root
ENTRYPOINT ["docker/entrypoint.sh"]</pre>
<h4>Entrypoint flow</h4>
<ol><li>Database ready hone ka wait</li><li>Migration se pehle <code>pg_dump</code> backup</li><li><code>migrate</code></li><li>seed data + <code>collectstatic</code></li><li>Gunicorn start</li></ol>
<h4>Asli seekh (production gotchas)</h4>
<ul><li>Code image ke andar copy hota hai — code badla to <b>image rebuild</b> karni padti hai.</li><li>Web aur worker dono ki image rebuild karo; warna worker purane code par rehta hai aur naye task ko “unregistered task” bol kar <b>chupchaap fenk deta hai</b>.</li><li>Named volume image ke andar ki directory ko <b>chhupa deta</b> hai — isliye collectstatic start par dobara chalta hai.</li><li><code>shm_size: 256m</code>: gthread workers /dev/shm use karte hain; Docker ka default 64MB kam pad gaya tha.</li></ul>`,
    qa: [
      ["Container aur VM me fark?", "VM poora guest OS + kernel chalata hai hypervisor par — GBs, minute me boot. Container host ka kernel share karta hai aur sirf process ko isolate karta hai (namespaces + cgroups) — MBs, second me start. Container halka hai par isolation VM se kamzor."],
      ["Image aur container me fark?", "Image read-only template hai (layers). Container us image ka running instance hai jisme ek writable layer judti hai. Ek image se kai containers. Class vs object."],
      ["Multi-stage build kya hai, kyun?", "Dockerfile me kai FROM stages. Pehle stage me compilers/dev headers se dependencies build hoti hain; final stage me sirf built artifacts copy hote hain. Result: chhoti image, kam attack surface, tez pull."],
      ["Container delete ho gaya to database ka data?", "Agar data container ki writable layer me tha to gaya. Isliye Postgres ka data directory named volume (postgres_data) par mount hota hai — volume container se alag jeeta hai. Upar se roz ka pg_dump backup alag volume me."],
      ["depends_on kaafi hai start order ke liye?", "Akela depends_on sirf container start hone ka wait karta hai, service ready hone ka nahi. Isliye healthcheck (pg_isready) + condition: service_healthy, aur entrypoint me bhi DB ka wait loop."],
      ["Docker layers aur caching?", "Har Dockerfile instruction ek layer banata hai; layer cache hoti hai jab tak uska input na badle. Isliye pehle requirements.txt copy + pip install, baad me code copy — code badalne par dependencies dobara install nahi hoti."],
    ],
    quiz: [
      ["Database ka data kahan rakhna chahiye?", ["Container ke andar", "Image me", "Volume me", "Redis me"], 2, "Volume container ke delete hone par bhi rehta hai."],
      ["Image : Container :: ?", ["Object : Class", "Class : Object", "File : Folder", "RAM : Disk"], 1, "Image template hai, container running instance."],
    ],
  },
  {
    id: "c08", slug: "redis", icon: "⚡", title: "Redis", color: "#ff6b5e",
    tagline: "In-memory key-value store: cache, sessions, rate limit, queue",
    points: [
      "Data <b>RAM</b> me → sub-millisecond. Simple key → value, <b>TTL</b> (expiry) ke saath.",
      "4 kaam: <b>cache</b>, <b>sessions</b>, <b>rate limiting</b>, <b>Celery broker</b> (3 logical DBs: /0 broker, /1 cache+sessions, /2 results).",
      "<b>Cache-aside</b>: pehle cache → miss → DB → cache me rakho (TTL) → data badle to invalidate.",
      "<code>maxmemory 512mb</code>, <code>volatile-lru</code>, no persistence → <b>critical data sirf Redis me mat rakho</b>.",
    ],
    body: `<h4>Cache-aside, is app ka example</h4>
<pre>class SystemConfig(models.Model):        # singleton: pk hamesha 1
    @classmethod
    def load(cls):
        cfg = cache.get("system_config")
        if cfg is None:                   # MISS
            cfg, _ = cls.objects.get_or_create(pk=1)
            cache.set("system_config", cfg, 300)   # TTL 5 min
        return cfg

    def save(self, *a, **k):
        super().save(*a, **k)
        cache.delete("system_config")     # invalidation</pre>
<p>Yeh config (registration window khula hai ya nahi, credit limits, maintenance mode) lagbhag har request par padhi jaati hai — cache ke bina har request par ek extra DB query.</p>
<h4>Rate limiting</h4>
<pre>key = f"login_attempts:{ip}:{email}"
n = cache.get(key, 0)
if n >= 5: block()
cache.set(key, n + 1, timeout=600)   # 10 min baad apne aap saaf</pre>
<h4>Ek design decision jo interview me chamakta hai</h4>
<p>Email-OTP login ke attempts aur “code use ho chuka” wali state <b>Postgres</b> me hai, Redis me nahi. Kyun? <code>volatile-lru</code> me TTL wali keys hi sabse pehle evict hoti hain. Agar attempt counter evict ho gaya to attacker ko naye chances mil jaate — system <i>fail open</i> ho jaata. Security state ko durable store me rakho.</p>`,
    qa: [
      ["Redis itna fast kyun hai?", "Data RAM me hai (disk I/O nahi), data structures simple hain (hash table lookup O(1)), aur commands ek single thread par chalte hain — to locks ka overhead nahi. Network + I/O multiplexing (epoll) se hazaaron connections."],
      ["Cache invalidation kaise karte ho?", "Do tareeke saath me: (1) TTL — data apne aap expire ho jaata hai, to galti se bhi cache hamesha ke liye purana nahi rehta. (2) Write par explicit delete — model ke save()/delete() ya signals me cache key hata dete hain. Reference data (departments, branches) 1 ghante cache hota hai aur post_save signal se invalidate."],
      ["Sessions Redis me kyun, database me kyun nahi?", "Session har request par padha jaata hai. Redis me yeh ~0.2ms ka GET hai aur Postgres par load nahi padta. Expiry TTL se apne aap. Trade-off: Redis restart/eviction par log logout ho sakte hain — acceptable hai."],
      ["Redis ka data gaya to kya hoga?", "Is setup me persistence off hai (--save \"\"), to restart par cache aur sessions khatam: users ko dobara login karna padega, cache dobara garam hoga, pending Celery tasks kho sakte hain. Isiliye koi bhi ‘source of truth’ Redis me nahi hai."],
      ["Eviction policies? volatile-lru kya hai?", "maxmemory bharne par kya hatana hai: noeviction (error do), allkeys-lru (kisi bhi key me se least recently used), volatile-lru (sirf TTL wali keys me se LRU), allkeys-lfu, volatile-ttl… volatile-lru yahan isliye ki bina-TTL keys (Celery queue) safe rahein."],
      ["Cache stampede kya hota hai?", "Popular key expire hote hi saikdon requests ek saath DB par toot padti hain. Bachav: thoda random TTL (jitter), lock lekar ek hi request ko rebuild karne do, ya background refresh."],
      ["Redis vs Memcached?", "Memcached sirf simple string cache hai, multi-threaded. Redis me data structures (lists, sets, sorted sets, streams), pub/sub, TTL per key, persistence options, aur wo message broker bhi ban sakta hai — isliye ek hi tool se cache + sessions + queue."],
    ],
    quiz: [
      ["Admin ne settings badli. Cache ka kya karna chahiye?", ["Kuch nahi", "Key delete (invalidate) karo", "Redis restart", "TTL badha do"], 1, "Write par invalidation + TTL safety net."],
      ["OTP attempt counter Postgres me kyun rakha gaya?", ["Postgres tez hai", "Redis se evict ho sakta hai → fail open", "Redis numbers store nahi karta", "Random"], 1, "Security state durable store me honi chahiye."],
      ["TTL ka matlab?", ["Total Table Length", "Time To Live", "Thread Lock", "Token"], 1, "Kitni der baad key apne aap expire ho."],
    ],
  },
  {
    id: "c09", slug: "celery", icon: "🥬", title: "Celery", color: "#b9e34f",
    tagline: "Background task queue: bhaari kaam request ke bahar",
    points: [
      "Request ke andar lamba kaam = timeout + blocked worker. Ilaaj: <b>task queue</b>.",
      "Flow: view → <b>broker</b> (Redis) me message → turant task_id → <b>worker</b> kaam karta hai → progress <b>result backend</b> me → browser <b>polling</b>.",
      "Kaam: bulk Excel imports, PDF generation, emails. <b>Celery Beat</b> = scheduler (cron).",
      "Worker: <code>--concurrency=4</code>, <code>--max-tasks-per-child=50</code>, tasks <code>max_retries=3</code>.",
    ],
    body: `<pre>@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def process_students_bulk(self, file_path, ext):
    rows = read_file(file_path, ext)
    branches = {b.code: b for b in Branch.objects.all()}   # lookups pehle se
    batch = []
    for i, row in enumerate(rows):
        batch.append(Student(...))
        if len(batch) == 500:
            Student.objects.bulk_create(batch); batch = []
            self.update_state(state="PROGRESS", meta={"current": i, "total": len(rows)})
    return {"added_count": ..., "logs": [...]}

# view
task = process_students_bulk.delay(path, "xlsx")
return redirect("bulk_task_status", task.id)     # browser yahan poll karta hai</pre>
<h4>Celery Beat</h4>
<pre>CELERY_BEAT_SCHEDULE = {
  "seal-audit-log":           {"task": "…seal_audit_log_task",      "schedule": 300.0},
  "purge-expired-login-otps": {"task": "…purge_expired_login_otps", "schedule": 86400.0},
}</pre>
<h4>Chhoti par kaam ki baatein</h4>
<ul><li>CSV se aayi value agar <code>= + - @</code> se shuru ho to quote laga dete hain — <b>CSV/formula injection</b> se bachav.</li><li>Task arguments chhote rakho (file ka path, poori file nahi).</li><li>OTP email bhejte waqt <code>retry=False</code> + try/except + inline fallback: broker down ho to bhi login page 500 na de.</li></ul>`,
    qa: [
      ["Celery ka architecture samjhao.", "Teen hisse: (1) Producer — Django view jo task.delay() se message banata hai. (2) Broker — Redis (ya RabbitMQ), jahan messages queue me rehte hain. (3) Worker — alag process/container jo queue se message uthakar task function chalata hai. Optional: result backend (task ka status/result) aur Beat (scheduler)."],
      ["Background thread kyun nahi, Celery kyun?", "Thread web worker ke andar hota hai: worker restart/timeout/max-requests par kaam beech me mar jaata hai, retry nahi, progress track nahi, aur web capacity khaata hai. Celery me task broker me persist hai, fail ho to retry, workers alag machine/container par alag scale hote hain, concurrency control aur monitoring milti hai."],
      ["Idempotent task kya hota hai, kyun zaroori?", "Aisa task jise do baar chalane se result same rahe. Zaroori kyunki retries ya worker crash ke baad task dobara chal sakta hai (at-least-once delivery). Tareeke: get_or_create/upsert, unique constraints, ‘already processed’ flag check."],
      ["User ko progress kaise dikhta hai?", "Worker self.update_state(state='PROGRESS', meta={current,total}) se result backend (Redis) me likhta hai. Browser har ~2 sec me /bulk-task-status/<id> ko AJAX call karta hai, view AsyncResult(id) padh kar JSON deta hai, JS progress bar update karta hai. Isse polling kehte hain; alternative WebSockets/SSE."],
      ["Redis broker vs RabbitMQ?", "RabbitMQ asli message broker hai: acknowledgements, routing, durability behtar. Redis simple hai aur yahan pehle se hai (cache ke liye), to ek service kam. Trade-off: Redis me persistence off hai to restart par queued tasks kho sakte hain — yahan tasks user-triggered hain aur dobara chalaye ja sakte hain."],
      ["max-tasks-per-child kyun?", "pandas/WeasyPrint jaise bhaari tasks memory chhod-te nahi. 50 tasks ke baad worker child process recycle hota hai — memory wapas. Saath me per-child memory cap bhi hai."],
    ],
    quiz: [
      ["View task.delay() ke baad kya karta hai?", ["Task khatam hone ka wait", "Turant task_id ke saath response", "Database lock", "Worker ko HTTP call"], 1, "Request turant khatam; kaam worker karega."],
      ["Broker ka kaam?", ["HTML render", "Task messages ki queue rakhna", "Password check", "Static files"], 1, "Broker producer aur worker ke beech ki queue hai."],
    ],
  },
  {
    id: "c10", slug: "pgbouncer", icon: "🎱", title: "PgBouncer", color: "#b48cff",
    tagline: "Connection pooling aur transaction mode ke side-effects",
    points: [
      "Postgres ka har connection = <b>ek OS process</b> + RAM; <code>max_connections=100</code>.",
      "<b>Pooler</b> thode asli connections khule rakhta hai aur clients me baant-ta hai.",
      "<b>Transaction mode</b>: transaction khatam → connection pool me wapas.",
      "Side-effect: session state par bharosa nahi → <code>CONN_MAX_AGE=0</code>, <b>xact-scoped</b> advisory locks.",
    ],
    body: `<h4>Ganit</h4>
<p>Web: 6 workers × 4 threads = 24 possible connections. Celery: 4. Kai app servers ya spikes ho to yeh jaldi 100 ke paar. PgBouncer ke saath app ke 500 client connections bhi ho to Postgres par sirf ~20 asli.</p>
<table><tr><th>Mode</th><th>Connection kab wapas?</th><th>Kya toot-ta hai?</th></tr>
<tr><td>Session</td><td>Client disconnect par</td><td>Kuch nahi (par pooling ka fayda kam)</td></tr>
<tr><td><b>Transaction</b></td><td>Har transaction ke baad</td><td>Session-level advisory locks, SET, LISTEN/NOTIFY, kuch prepared statements</td></tr>
<tr><td>Statement</td><td>Har statement ke baad</td><td>Multi-statement transactions</td></tr></table>
<pre>DATABASES["default"]["CONN_MAX_AGE"] = 0   # persistent connections off

# audit sealer: sirf ek chale
cur.execute("SELECT pg_try_advisory_xact_lock(%s)", [728041])</pre>
<p><code>pg_try_advisory_<b>xact</b>_lock</code> transaction ke saath apne aap release hota hai — to chahe agli query kisi aur server connection par jaye, lock kabhi ‘latka’ nahi rehta.</p>`,
    qa: [
      ["Connection pooling kya hai, kyun chahiye?", "Connections ko baar-baar banane/todne ke bajaye khule rakh kar reuse karna. Postgres me har connection ek backend process hai (kai MB RAM, fork + auth ka kharcha) aur max_connections limited hai. Pooler saikdon client connections ko thode se server connections par multiplex karta hai."],
      ["Django me CONN_MAX_AGE kya karta hai? 0 kyun?", "Yeh batata hai Django ek DB connection kitni der reuse kare. 0 = har request ke ant me band. PgBouncer ke saath yahi sahi hai: PgBouncer tak ka connection sasta hai, aur asli pooling wahi kar raha hai. Persistent connections transaction-mode pooling ke saath server connections ko pin kar sakte the."],
      ["Transaction pooling me kya dhyan rakhna padta hai?", "Jo bhi cheez ‘session’ se judi ho uspe bharosa nahi: session-level advisory locks, SET search_path/timezone, temp tables, LISTEN/NOTIFY, server-side cursors, named prepared statements. Jo chahiye use ek transaction ke andar rakho (SET LOCAL, xact-scoped locks)."],
      ["Advisory lock kya hota hai?", "Postgres ka application-defined lock: aap ek number par lock lete ho, database use kisi table/row se nahi jodta. ‘Is kaam ko ek time par ek hi process kare’ jaise cases ke liye. pg_try_… turant true/false deta hai (wait nahi karta)."],
      ["PgBouncer vs application-side pool?", "App-side pool (SQLAlchemy pool, Django 5.1+ ka psycopg pool) har process ke andar hota hai — 6 processes × pool size. PgBouncer saare processes/servers ke liye ek global pool deta hai aur app restart par bhi connections garam rehte hain."],
    ],
    quiz: [
      ["Transaction mode me connection pool me kab wapas jaata hai?", ["App band hone par", "Har transaction ke baad", "Har 5 minute", "Kabhi nahi"], 1, "Isiliye session state par bharosa nahi kar sakte."],
      ["PgBouncer ke saath kaunsa lock safe hai?", ["pg_advisory_lock (session)", "pg_advisory_xact_lock (transaction)", "Python threading.Lock", "File lock"], 1, "xact-scoped lock transaction ke saath release ho jaata hai."],
    ],
  },
  {
    id: "c11", slug: "security", icon: "🔐", title: "Login & Security", color: "#ffb454",
    tagline: "Authentication, authorization, sessions aur defenses",
    points: [
      "<b>Authentication</b> (kaun ho?) = LDAP. <b>Authorization</b> (kya kar sakte ho?) = session ka role.",
      "App <b>koi password store nahi karta</b>. Login par LDAP ‘bind’ se check.",
      "Session Redis me; cookie me sirf random ID. 5 roles: ADMIN, CHAIR, OFFICE, FACULTY, STUDENT.",
      "Defenses: CSRF token, rate limiting, idle timeout, session flush on login, HTTPS/HSTS, soft delete, CSV injection guard.",
    ],
    body: `<h4>Login flow</h4>
<ol><li><b>Rate limit check</b>: (IP, identifier) par 10 min me 5 fail → block.</li><li><b>LDAP bind</b>: college directory se email/password verify.</li><li><b>Role lookup</b>: email ko tables me dhoondho — Admins → Chairperson → Faculty → Student. Pehla match role tay karta hai.</li><li><code>session.flush()</code> — purani session ID fenk do (session fixation se bachav), phir role + user id likho.</li><li>Dashboard par redirect.</li></ol>
<h4>Har request par</h4>
<pre>SecurityMiddleware → WhiteNoise → Session → AdminAccess → AuditLog
→ CSRF → IdleTimeout → … → CSP → PermissionsPolicy → MaintenanceMode</pre>
<h4>Email OTP (forgot-password path)</h4>
<p>LDAP-only ka matlab bhoola hua password = lockout. To ek optional email-OTP login hai. Dhyan dene layak design: code kabhi store nahi hota (sirf HMAC hash), throttling resolved email par hoti hai, aur unknown user ko bhi bilkul same response milta hai — taaki koi yeh pata na kar sake ki kaunsa email registered hai (<b>user enumeration</b> se bachav).</p>`,
    qa: [
      ["Authentication aur authorization me fark?", "Authentication: identity verify karna (LDAP bind se — ‘yeh sach me wahi insaan hai’). Authorization: us identity ko kya allowed hai (session role + middleware/decorators — ‘student admin page nahi khol sakta’)."],
      ["Session-based auth vs JWT?", "Session: server state rakhta hai (Redis), cookie me opaque ID; turant revoke/logout aasaan, server-rendered apps ke liye natural. JWT: token me hi signed data, server stateless; APIs/mobile/microservices ke liye achha par revoke mushkil. Yeh ek SSR monolith hai → sessions."],
      ["CSRF kya hai? Django kaise rokta hai?", "Cross-Site Request Forgery: aap logged in ho, aur koi doosri site aapke browser se chupke se POST karwa de — cookie apne aap chali jaati hai. Django har form me ek secret token daalta hai aur POST par cookie + form token match karta hai; doosri site woh token nahi jaan sakti. Saath me SameSite cookies."],
      ["Passwords kaise store karne chahiye?", "Kabhi plain text nahi. Salted, slow hash (PBKDF2, bcrypt, argon2) — salt se rainbow tables bekaar, slow hone se brute force mehenga. Is app me sabse achha option use hua: password store hi nahi karte, LDAP ko delegate. Sirf ek primary admin ka hash environment variable me hai."],
      ["Session fixation kya hai?", "Attacker pehle se ek session ID victim ke browser me set karwa deta hai; victim login kare to attacker ke paas logged-in session. Bachav: login success par purana session destroy karke nayi ID (session.flush())."],
      ["Brute force login kaise rokte ho?", "Rate limiting: Redis counter (ip, identifier) par TTL ke saath; 5 fail par 10 minute block. Saath me LDAP ka apna lockout, aur OTP path par per-email + per-IP throttles."],
      ["SQL injection aur XSS se bachav?", "SQL injection: ORM parameterized queries banata hai — user input kabhi SQL string me nahi judta. XSS: Django templates by default HTML auto-escape karte hain; saath me Content-Security-Policy header."],
    ],
    quiz: [
      ["Login ke baad cookie me kya hota hai?", ["Password", "Role aur email", "Random session ID", "LDAP token"], 2, "Data server par; cookie me sirf opaque ID."],
      ["CSRF token kis attack se bachata hai?", ["SQL injection", "Doosri site se forged form submit", "Password guessing", "DDoS"], 1, "Forged cross-site requests."],
    ],
  },
  {
    id: "c12", slug: "audit-hash-chain", icon: "⛓️", title: "Audit Hash Chain", color: "#f5c542",
    tagline: "Tamper-evident audit log: SHA-256 chain + periodic sealer",
    points: [
      "Har request (middleware) aur har data change (signals, old→new diff) <b>AuditLog</b> me.",
      "<code>entry_hash = SHA256(prev_hash + \"\\n\" + canonical_json(row))</code> — har row pichhli se judi.",
      "<b>Verify</b> chain ko dobara chal kar ‘content altered’ ya ‘broken link’ pakadta hai.",
      "Hash likhte waqt nahi, <b>baad me ek single sealer</b> lagata hai (Celery Beat, har 5 min, advisory lock).",
      "<b>Tamper-evident</b>, tamper-proof nahi. Latest hash ko bahar anchor karna best practice.",
    ],
    body: `<h4>Code (simplified from the real module)</h4>
<pre>GENESIS = "0" * 64

def _canonical(row):                     # deterministic JSON
    payload = {f: getattr(row, f) for f in CONTENT_FIELDS}
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)

def _entry_hash(prev_hash, row):
    return sha256(f"{prev_hash}\\n{_canonical(row)}".encode()).hexdigest()

def seal_audit_chain():
    with transaction.atomic():
        if not try_advisory_xact_lock(728041):   # koi aur sealer chal raha hai
            return
        prev = last_sealed_hash() or GENESIS
        for row in AuditLog.objects.filter(entry_hash__isnull=True).order_by("id"):
            row.prev_hash = prev
            row.entry_hash = prev = _entry_hash(prev, row)
        bulk_update(...)

def verify_audit_chain():
    prev = GENESIS
    for row in sealed_rows_in_id_order():
        if row.prev_hash != prev:              return "broken link"      # delete / reorder
        if _entry_hash(prev, row) != row.entry_hash: return "content altered"  # edit
        prev = row.entry_hash
    return "chain intact"</pre>
<h4>Design decisions (yahi interview me poochha jaata hai)</h4>
<ul><li><b>Seal alag pass me kyun?</b> Rows ko kai Gunicorn threads ek saath likhte hain. “Pichhli row ka hash” inline nikalne me race hoti aur chain fork ho jaati. Single sealer id-order me chalta hai → hamesha consistent. Bonus: request path par koi extra kaam nahi.</li><li><b>Canonical JSON kyun?</b> Same data ka hash tabhi same aayega jab bytes same ho — keys sorted, fixed separators.</li><li><b>Kaunse fields?</b> Row ke immutable content fields + timestamp. <code>prev_hash / entry_hash / sealed_at</code> khud content me nahi.</li><li><b>Advisory lock xact-scoped kyun?</b> PgBouncer transaction pooling ke saath safe.</li></ul>
<p>Neeche <a href="#/playground">Hash chain playground</a> me khud rows edit karke chain todo.</p>`,
    qa: [
      ["Hash function kya hai? Achhe cryptographic hash ki properties?", "Function jo kisi bhi size ke input ko fixed-size output (SHA-256: 256 bit / 64 hex chars) me badalta hai. Properties: deterministic; one-way (pre-image resistance); zara sa input change → poora output change (avalanche); collision dhoondhna practically impossible."],
      ["Aapka audit log tamper-evident kaise hai?", "Har sealed row me entry_hash = SHA256(prev_hash + canonical content). Row edit karo to uska recomputed hash stored se match nahi karega. Row delete karo to agli row ka prev_hash kisi se nahi milega. Verify function genesis se chain chal kar pehla mismatch aur uska reason bata deta hai."],
      ["Hash row insert ke time hi kyun nahi nikalte?", "Concurrency. Do threads ek saath ‘last hash’ padhenge aur dono usi par chain karenge → fork. Ise rokne ke liye har insert par global lock lena padta, jo har request ko serialize kar deta. Isliye write path lock-free hai (hash NULL), aur ek periodic single-writer sealer baad me id-order me link karta hai. Trade-off: last ≤5 min ki ‘unsealed tail’."],
      ["Attacker ke paas poora DB access ho to?", "Wo row badal kar us row se aage ki poori chain recompute kar sakta hai — hash chain akeli isse nahi rok sakti (isliye tamper-evident, tamper-proof nahi). Mitigation: latest entry_hash ko bahar anchor karo — off-site backups (roz ke pg_dump me purani chain hoti hai), alag log server/WORM storage, ya periodically publish/email. Phir recomputed chain anchor se match nahi karegi. Aur HMAC with a secret key use kar sakte ho taaki DB-only attacker hash bana hi na sake."],
      ["Yeh blockchain se kaise alag hai?", "Idea same (hash-linked records), par yahan ek hi trusted writer hai — koi distributed consensus, proof-of-work ya multiple nodes nahi. Yeh Git commits ya certificate-transparency logs ke zyada kareeb hai. Blockchain tab chahiye jab parties ek doosre par trust na karein."],
      ["Data changes ka diff kaise capture hota hai?", "Django signals: pre_save par purani row ka snapshot, post_save par naye se compare → {field: {old, new}} JSON. post_delete aur m2m_changed bhi. Request ki info (user, IP, request-id) middleware ek context variable me rakhta hai jise signal handler padhta hai — to ek request ke saare audit rows same request_id share karte hain."],
      ["bulk_create/bulk_update par signals nahi chalte — phir?", "Sahi. Isliye bulk tasks explicitly log_bulk_diffs(...) call karte hain jo saare diffs ek bulk_create se AuditLog me daalta hai. Sealing out-of-band hai, to bulk insert chain ko disturb nahi karta."],
      ["Audit log me kya nahi likhna chahiye?", "Secrets: passwords, OTP codes, tokens. Is app me LoginOtp model jaan-boojh kar audited models me nahi hai — warna har code ka hash aur har galat attempt ek audit row ban jaata."],
    ],
    quiz: [
      ["Row 102 edit hui. Verify kya bolega?", ["chain intact", "content altered (row 102)", "broken link (row 101)", "Kuch nahi"], 1, "Recomputed hash stored entry_hash se match nahi karega."],
      ["Row 102 delete hui. Verify kya bolega?", ["content altered (102)", "broken link (row 103)", "chain intact", "genesis error"], 1, "Row 103 ka prev_hash ab row 101 ke hash se match nahi karta."],
      ["Sealer single-writer kyun hai?", ["Tez hota hai", "Concurrent writers chain ko fork kar dete", "Redis ki limit", "Celery ki limit"], 1, "Ek hi sealer id-order me chalta hai → consistent chain."],
    ],
  },
  {
    id: "c13", slug: "full-journey", icon: "🗺️", title: "Poora Safar (Recap)", color: "#7c9cff",
    tagline: "Ek click → poora system → interview one-liners",
    points: [
      "Browser → <b>Nginx</b> (TLS, buffer) → <b>Gunicorn</b> (worker thread) → <b>Django</b> (middleware → view → ORM).",
      "Session/cache <b>Redis</b> se; SQL <b>PgBouncer</b> ke pool se <b>PostgreSQL</b> tak (transaction + constraints).",
      "Bhaari kaam <b>Celery</b> ko; har cheez <b>audit log</b> me, hash chain se sealed.",
      "Sab kuch <b>Docker Compose</b> ke containers me.",
    ],
    body: `<h4>One-liners</h4>
<table>
<tr><td>Django</td><td>Batteries-included Python framework: ORM, migrations, security built-in.</td></tr>
<tr><td>PostgreSQL</td><td>Relational + ACID + constraints → data kabhi galat nahi.</td></tr>
<tr><td>Gunicorn</td><td>WSGI server: master + worker processes + threads.</td></tr>
<tr><td>Nginx</td><td>Reverse proxy: TLS, buffering, static, load balancing.</td></tr>
<tr><td>Docker</td><td>Code + environment ek image me; Compose se poora stack.</td></tr>
<tr><td>Redis</td><td>In-memory store: cache, sessions, rate limiting, queue.</td></tr>
<tr><td>Celery</td><td>Task queue: bhaari kaam background me, retry ke saath.</td></tr>
<tr><td>PgBouncer</td><td>Connection pooling: thode connections, bahut clients.</td></tr>
<tr><td>Hash chain</td><td>Har row pichhli row ke hash se judi → tamper-evident audit log.</td></tr>
</table>
<h4>Scale karna ho to?</h4>
<ol><li><b>Pehle measure</b>: slow query log, load test (Locust).</li><li><b>Vertical</b>: zyada CPU/RAM → zyada workers.</li><li><b>Horizontal</b>: kai web containers load balancer ke peeche — possible hai kyunki app <i>stateless</i> hai (sessions Redis me, files volume/S3 me).</li><li><b>Database</b>: indexes, query tuning, read replicas, PgBouncer.</li><li><b>Zyada caching</b> aur zyada kaam Celery par.</li></ol>`,
    qa: [
      ["10x users aa jayein to kya karoge?", "Pehle bottleneck dhoondho (metrics, slow query log, load test). Phir: N+1 aur missing indexes fix; hot data cache; web tier horizontally scale (stateless hai — sessions Redis me); PgBouncer se connections control; reads ke liye replica; bhaari kaam Celery me aur workers badhao; static files CDN par."],
      ["Is system ka single point of failure kya hai?", "Ek hi Postgres, ek hi Redis, ek hi host. Mitigation: roz automated pg_dump + pre-migration backup (hai), aage: streaming replica + failover, Redis Sentinel/managed Redis, multiple hosts ke peeche load balancer."],
      ["Stateless app ka matlab?", "Web process apne andar koi user state nahi rakhta — session Redis me, data Postgres me, uploads volume/S3 me. To koi bhi request kisi bhi worker/container par ja sakti hai, aur containers ko kabhi bhi maar/bana sakte ho."],
      ["Deploy kaise hota hai? Downtime?", "Naya image build → docker compose up -d → entrypoint: backup, migrate, collectstatic, Gunicorn. Single host par kuch second ka restart gap hota hai. Zero-downtime ke liye: do web containers + rolling restart ya blue-green, aur backward-compatible migrations."],
      ["Monitoring/logging?", "Structured JSON logs (rotating files), slow-query log, health checks (compose), audit log (kaun-kya), aur ek maintenance-mode switch. Aage: metrics (Prometheus), error tracking (Sentry), uptime alerts."],
    ],
    quiz: [
      ["Kaunsa order sahi hai?", ["Browser → Django → Nginx → Gunicorn", "Browser → Nginx → Gunicorn → Django", "Browser → Gunicorn → Nginx → Django", "Browser → Redis → Django"], 1, "Reverse proxy → app server → framework."],
      ["App ko horizontally scale karna kyun possible hai?", ["Python fast hai", "Web tier stateless hai", "Docker magic", "Redis bada hai"], 1, "State bahar (Redis/Postgres) hai, to kitne bhi web containers chal sakte hain."],
    ],
  },
];
