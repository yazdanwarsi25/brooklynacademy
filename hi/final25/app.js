/* NodeList.forEach polyfill for older browsers */
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

/* ══════════════════════════════════════════
   THEME (DARK / LIGHT)
══════════════════════════════════════════ */
function applyThemeIcon() {
  const theme = document.documentElement.getAttribute('data-theme');
  const btn = document.getElementById('themeToggle');
  const mobLabel = document.getElementById('mobThemeLabel');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  if (mobLabel) mobLabel.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('bae-theme', next);
  applyThemeIcon();
}

/* ══════════════════════════════════════════
   PRELOADER
══════════════════════════════════════════ */
function initPreloader() {
  const pre = document.getElementById('preloader');
  if (!pre) return;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { pre.remove(); return; }
  document.body.style.overflow = 'hidden';
  const minShow = 700;
  const start = performance.now();
  function reveal() {
    const wait = Math.max(0, minShow - (performance.now() - start));
    setTimeout(() => {
      pre.classList.add('preloader-hide');
      document.body.style.overflow = '';
      setTimeout(() => pre.remove(), 550);
    }, wait);
  }
  if (document.readyState === 'complete') reveal();
  else window.addEventListener('load', reveal);
}

/* ══════════════════════════════════════════
   SCROLL SHADOW + MOBILE NAV
══════════════════════════════════════════ */
window.addEventListener('scroll', () =>
  document.getElementById('mainNav').classList.toggle('scrolled', scrollY > 8), {passive:true});

/* ══════════════════════════════════════════
   SCROLL PROGRESS BAR
══════════════════════════════════════════ */
function updateScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  const h = document.documentElement;
  const scrolled = h.scrollTop || document.body.scrollTop;
  const max = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
  bar.style.width = (max > 0 ? Math.min(100, (scrolled / max) * 100) : 0) + '%';
}
window.addEventListener('scroll', updateScrollProgress, {passive:true});
window.addEventListener('resize', updateScrollProgress, {passive:true});

/* ══════════════════════════════════════════
   SMOOTH CROSS-PAGE TRANSITIONS
   This is a true multi-page site (separate HTML
   files), so we fake an SPA-style transition by
   fading the outgoing page out just before the
   browser navigates, and the incoming page already
   fades in via the .page pageIn animation.
══════════════════════════════════════════ */
function initPageTransitions() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    // Only intercept same-site plain .html navigations
    if (!/^[a-zA-Z0-9_-]+\.html(#.*)?$/.test(href)) return;
    if (a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    document.body.classList.add('page-exit');
    setTimeout(() => { window.location.href = href; }, 190);
  });
}

function toggleMob() {
  const d = document.getElementById('mobDraw');
  const h = document.getElementById('ham');
  d.classList.toggle('open'); h.classList.toggle('open');
  document.body.style.overflow = d.classList.contains('open') ? 'hidden' : '';
}

/* ══════════════════════════════════════════
   MAGNETIC TILT (desktop hover only)
══════════════════════════════════════════ */
function initTilt() {
  if (window.matchMedia && (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !window.matchMedia('(hover: hover)').matches)) return;
  const targets = document.querySelectorAll('.subj-card, .cls-card, .pricing-card, .value-card, .t-card');
  targets.forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateX(${(-py*6).toFixed(2)}deg) rotateY(${(px*6).toFixed(2)}deg) translateY(-6px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

/* ══════════════════════════════════════════
   PAGE INIT (multi-page site)
   Each page loads app.js fresh; every render function
   below no-ops safely if its target element isn't on
   the current page, so we can just call all of them.
══════════════════════════════════════════ */
function initTransitionBeam() {
  if (document.getElementById('transitionBeam')) return;
  const beam = document.createElement('div');
  beam.className = 'transition-beam';
  beam.id = 'transitionBeam';
  document.body.appendChild(beam);
}

function initPage() {
  applyThemeIcon();
  initTransitionBeam();
  initPreloader();
  updateScrollProgress();
  initPageTransitions();
  renderWhyChoose();
  renderPricing();
  renderClassrooms();
  renderClasses();
  renderPolicies();
  renderCalendar();
  renderTestimonials();
  initCounters();
  renderFAQ();
  requestAnimationFrame(() => requestAnimationFrame(() => { initSR(); initTilt(); }));
}

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
function initSR() {
  if (typeof IntersectionObserver === 'undefined') {
    // Fallback for browsers without IntersectionObserver support
    document.querySelectorAll('.sr:not(.in)').forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.sr:not(.in)').forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════
   BUSINESS DATA — TEACHER LEVELS (PRICING)
══════════════════════════════════════════ */
const LEVELS = [
  { key:'silver',   name:'Silver',   price:720, desc:'Great for building strong fundamentals with a dedicated, qualified tutor.',
    features:['Certified tutor','Weekly 1-on-1 online sessions','Progress check-ins','Email support'] },
  { key:'gold',     name:'Gold',     price:840, desc:'Our most popular tier — experienced tutors with a proven track record.',
    features:['5+ years experienced tutor','Weekly 1-on-1 online sessions','Personalized study plan','Priority scheduling','Email & phone support'], featured:false },
  { key:'platinum', name:'Platinum', price:960, desc:'Elite instruction from our top-rated specialists for maximum results.',
    features:['Top-rated specialist tutor','Weekly 1-on-1 online sessions','Fully customized curriculum','Priority scheduling','Direct tutor messaging','Monthly progress report'], featured:true },
];
const SEAT_CAP = 8;
const MIN_STUDENTS = 4; // minimum students required to run a classroom

function levelByKey(k) { return LEVELS.find(l => l.key === k); }

/* ══════════════════════════════════════════
   CLASSROOM POLICIES
══════════════════════════════════════════ */
const POLICIES = [
  { icon:'👥', title:'Minimum Class Size', text:`A minimum of ${MIN_STUDENTS} students is required for a classroom to run as scheduled.` },
  { icon:'🎒', title:'Maximum Class Size', text:'Classrooms are capped at 6–8 students depending on grade level, to preserve individual attention.' },
  { icon:'🚫', title:'No Refunds', text:'All tuition payments are final. We do not offer refunds once a class or tutoring package is booked.' },
  { icon:'🎁', title:'Referral Rewards', text:'Refer a family and receive 10% credit toward your next class once they enroll.' },
  { icon:'💳', title:'Credit Terms', text:'Referral credit cannot be redeemed for cash and is non-transferable between accounts.' },
  { icon:'🤝', title:'Private & Semi-Private', text:'Private and semi-private sessions are available upon request for students who prefer 1-on-1 or small-group instruction.' },
];
function renderPolicies() {
  const wrap = document.getElementById('policyGrid');
  if (!wrap) return;
  wrap.innerHTML = POLICIES.map((p,i) => `
    <div class="policy-card sr sr-d${(i%6)+1}">
      <span class="policy-icon">${p.icon}</span>
      <h4>${p.title}</h4>
      <p>${p.text}</p>
    </div>`).join('');
}

/* ══════════════════════════════════════════
   CLASSROOMS — grade-tier group pricing
══════════════════════════════════════════ */
const CLASSROOMS = [
  { id:'room-k2', grade:'K–2', name:'K–2 Foundations Classroom', icon:'🧸',
    price:35, priceUnit:'/ hour', length:'1-hour class', cap:6,
    desc:'Playful, foundational small-group learning in early reading, math, and core skills — paced to how young learners grow best.' },
  { id:'room-35', grade:'Grades 3–5', name:'Grades 3–5 Classroom', icon:'📘',
    price:55, priceUnit:'/ 1.5-hr class', length:'1.5-hour class', cap:8,
    desc:'Small-group instruction that builds fluency, confidence, and strong study habits across core subjects.' },
  { id:'room-46', grade:'Grades 4–6', name:'Grades 4–6 Classroom', icon:'📗',
    price:60, priceUnit:'/ 1.5-hr class', length:'1.5-hour class', cap:8,
    desc:'Focused small-group work that sharpens critical thinking as students prepare for middle school.' },
];
function renderClassrooms() {
  const grid = document.getElementById('classroomGrid');
  if (!grid) return;
  grid.innerHTML = CLASSROOMS.map((r,i) => `
    <div class="classroom-card sr sr-d${i+1}">
      <div class="cr-medal"><span>${r.icon}</span></div>
      <span class="cr-grade">${r.grade}</span>
      <h3>${r.name}</h3>
      <div class="cr-price">$${r.price}<span>${r.priceUnit}</span></div>
      <div class="cr-tags">
        <span class="cls-tag">🕐 ${r.length}</span>
        <span class="cls-tag">🎒 Max ${r.cap} students</span>
      </div>
      <p>${r.desc}</p>
      <button class="btn-cart" onclick="openEnroll('${r.id}')">Enroll Now</button>
    </div>`).join('');
}

function renderPricing() {
  const grid = document.getElementById('pricingGrid');
  if (!grid) return;
  grid.innerHTML = LEVELS.map(l => `
    <div class="pricing-card ${l.featured ? 'featured' : ''} ${selectedLevel===l.key ? 'selected' : ''}" onclick="selectLevel('${l.key}')">
      ${l.featured ? '<span class="pl-ribbon">Most Popular</span>' : ''}
      <span class="pl-level">Teacher Level</span>
      <div class="pl-name">${l.name}</div>
      <div class="pl-price">$${l.price}<span>/course</span></div>
      <p class="pl-desc">${l.desc}</p>
      <ul class="pl-features">${l.features.map(f=>`<li>${f}</li>`).join('')}</ul>
      <button class="btn-select-level" onclick="event.stopPropagation();selectLevel('${l.key}')">${selectedLevel===l.key ? '✓ Selected' : 'Select Level'}</button>
    </div>`).join('');
}
let selectedLevel = 'gold';
function selectLevel(key) { selectedLevel = key; renderPricing(); }

/* ══════════════════════════════════════════
   CLASSES DATA (all online, seat-capped)
══════════════════════════════════════════ */
const CLASSES = [
  {id:4, name:'K–8th Grade Tutoring',  sub:'tutoring', private:true, grade:'Grades K–8',   duration:'Flexible scheduling', schedule:'Private or semi-private, scheduled at enrollment', desc:'One-on-one or semi-private tutoring across core subjects — reading, math, writing & more — matched to your child at any teacher level.', icon:'🎓', seatsTaken:4, cap:8},
  {id:5, name:'SAT Preparation',       sub:'sat',      private:true, grade:'Grades 10–11', duration:'Flexible scheduling', schedule:'Private or semi-private, scheduled at enrollment', desc:'Focused SAT strategy and practice with a dedicated tutor — full-length practice tests and personalized feedback.', icon:'📊', seatsTaken:3, cap:8},
  {id:6, name:'SHSAT Preparation',     sub:'shsat',    private:true, grade:'Grades 7–8',   duration:'Flexible scheduling', schedule:'Private or semi-private, scheduled at enrollment', desc:'In-depth SHSAT prep covering math and ELA, with timed practice sets and essay review.', icon:'🏫', seatsTaken:5, cap:8},
  {id:7, name:'HCHS Preparation',      sub:'hchs',     private:true, grade:'Grades 6–7',   duration:'Flexible scheduling', schedule:'Private or semi-private, scheduled at enrollment', desc:'Targeted preparation for the Hunter College High School entrance exam — reading, writing & math sections.', icon:'🏛️', seatsTaken:2, cap:8},
];
function isPrivate(c) { return !!c.private; }

function classById(id) { return CLASSES.find(c => c.id === id); }
function seatCap(c) { return c.cap || SEAT_CAP; }
function seatsRemaining(c) { return Math.max(0, seatCap(c) - c.seatsTaken); }
function seatBadge(c) {
  const rem = seatsRemaining(c);
  if (rem === 0) return `<span class="seat-badge full"><span class="dot"></span>Class Full</span>`;
  if (rem <= 2) return `<span class="seat-badge low"><span class="dot"></span>Only ${rem} seat${rem===1?'':'s'} remaining!</span>`;
  return `<span class="seat-badge"><span class="dot"></span>${rem} seats remaining</span>`;
}

let fSub = 'all';
function renderClasses() {
  const grid = document.getElementById('classesGrid');
  if (!grid) return;
  const list = CLASSES.filter(c => fSub==='all' || c.sub===fSub);
  if (!list.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-mute);font-size:16px">No courses match your filter.</p>';
    return;
  }
  grid.innerHTML = list.map((c,i) => {
    const full = seatsRemaining(c) === 0;
    return `<div class="cls-card sr" style="transition-delay:${i*.06}s">
      <div class="cls-head">
        <span class="cls-badge online">🌐 Online</span>
      </div>
      <div class="cls-body">
        <h3>${c.icon} ${c.name}</h3>
        <p>${c.desc}</p>
        <div class="cls-tags">
          <span class="cls-tag">📅 ${c.duration}</span>
          <span class="cls-tag">🕐 ${c.schedule}</span>
          <span class="cls-tag">🎒 ${c.grade}</span>
        </div>
        <div class="cls-price">${isPrivate(c) ? `Starting at $${LEVELS[0].price} <span>· choose your teacher level</span>` : `$${c.price}${c.priceUnit?`<span>${c.priceUnit}</span>`:` <span>/ course</span>`}`}</div>
        ${seatBadge(c)}
      </div>
      <div class="cls-foot">
        <button class="btn-cart ${full?'added':''}" ${full?'disabled style="opacity:.55;cursor:not-allowed"':''} onclick="openEnroll(${c.id})">
          ${full ? 'Class Full' : 'Enroll Now'}
        </button>
      </div>
    </div>`;
  }).join('');
  requestAnimationFrame(() => requestAnimationFrame(initSR));
}
function setFilter(val, btn) {
  fSub = val;
  btn.closest('aside').querySelectorAll('.f-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderClasses();
}

/* ══════════════════════════════════════════
   ENROLLMENT FORM
   One short form: plan + subject(s) + contact details.
   Every submission is emailed to ACADEMY_EMAIL.
   IMPORTANT (one-time): the very first submission makes
   FormSubmit email ACADEMY_EMAIL a confirmation link —
   open it and click "Activate" once. After that every
   submission is delivered automatically.
══════════════════════════════════════════ */
const ACADEMY_EMAIL = 'bkacademyofexcellence@gmail.com';
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + ACADEMY_EMAIL;

const SUBJECTS = ['Mathematics','ELA & Reading','Writing','Science','SHSAT Prep','HCHS Prep','SAT / ACT Prep','Gifted & Talented (K–2)','Not sure yet'];

function planOptions() {
  const rooms = CLASSROOMS.map(r => ({
    key: r.id, group: 'Classrooms',
    label: `${r.name} — $${r.price} ${r.priceUnit}`,
    name: r.name, priceText: `$${r.price} ${r.priceUnit}`
  }));
  const levels = LEVELS.map(l => ({
    key: l.key, group: 'Private / Semi-Private Tutoring',
    label: `${l.name} Level — $${l.price} per course`,
    name: `Private / Semi-Private Tutoring — ${l.name} Level`, priceText: `$${l.price} per course`
  }));
  return rooms.concat(levels);
}

let enroll = { plan:'gold', subjects:[], data:{}, submitting:false };

function esc(v) {
  return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function fieldVal(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

function openEnroll(ref) {
  let plan = selectedLevel || 'gold';
  let subjects = [];
  if (typeof ref === 'string' && planOptions().some(p => p.key === ref)) {
    plan = ref;
  } else if (typeof ref === 'number') {
    const cls = classById(ref);
    if (cls && seatsRemaining(cls) === 0) return;
    const bySub = { sat:'SAT / ACT Prep', shsat:'SHSAT Prep', hchs:'HCHS Prep' };
    if (cls && bySub[cls.sub]) subjects = [bySub[cls.sub]];
  }
  enroll = { plan, subjects, data:{}, submitting:false };
  document.getElementById('enrollOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderEnrollForm();
}
function closeEnroll() {
  document.getElementById('enrollOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderEnrollForm() {
  const d = enroll.data;
  const plans = planOptions();
  const groups = ['Classrooms', 'Private / Semi-Private Tutoring'];
  const dots = document.getElementById('stepDots');
  if (dots) dots.style.display = 'none';
  document.getElementById('modalTitle').textContent = 'Enroll Now';
  document.getElementById('modalBody').innerHTML = `
    <div class="step-title">Tell us about your student</div>
    <div class="step-sub">Choose a plan and subject, then share your contact details. Our team will reach out to you on WhatsApp.</div>

    <div class="form-section-title">1. Plan &amp; Subject</div>
    <div class="form-group">
      <label>Select Plan</label>
      <select id="f_plan">
        ${groups.map(g => `<optgroup label="${esc(g)}">${plans.filter(p => p.group === g).map(p =>
          `<option value="${esc(p.key)}" ${enroll.plan === p.key ? 'selected' : ''}>${esc(p.label)}</option>`).join('')}</optgroup>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Which subject(s)? Choose one or more</label>
      <div class="chip-row" id="f_subjects">
        ${SUBJECTS.map(s => `<label class="chip"><input type="checkbox" value="${esc(s)}" ${enroll.subjects.indexOf(s) > -1 ? 'checked' : ''}><span>${esc(s)}</span></label>`).join('')}
      </div>
    </div>

    <div class="form-section-title">2. Your Details</div>
    <div class="form-grid">
      <div class="form-group span2"><label>Student Name</label><input id="f_studentName" value="${esc(d.studentName)}" autocomplete="name"></div>
      <div class="form-group"><label>Email</label><input id="f_email" type="email" value="${esc(d.email)}" autocomplete="email"></div>
      <div class="form-group"><label>WhatsApp Number</label><input id="f_whatsapp" type="tel" value="${esc(d.whatsapp)}" placeholder="+1 646 413 8125" autocomplete="tel"></div>
      <div class="form-group"><label>Father's Name</label><input id="f_dadName" value="${esc(d.dadName)}"></div>
      <div class="form-group"><label>Mother's Name</label><input id="f_momName" value="${esc(d.momName)}"></div>
    </div>
    <p style="font-size:11.5px;color:var(--text-mute)">Please include your country code in the WhatsApp number. Father's or mother's name: at least one is required.</p>
    <p id="enrollFormMsg" style="color:var(--red);font-size:12.5px;margin-top:8px;min-height:16px"></p>`;
  document.getElementById('modalFooter').innerHTML =
    `<span></span><button class="btn-next" id="enrollSubmitBtn" onclick="enrollSubmit()">Submit</button>`;
}

function enrollSubmit() {
  if (enroll.submitting) return;
  const plans = planOptions();
  const plan = plans.find(p => p.key === fieldVal('f_plan')) || plans[0];
  const subjects = Array.prototype.map.call(document.querySelectorAll('#f_subjects input:checked'), i => i.value);
  const data = {
    studentName: fieldVal('f_studentName'),
    email: fieldVal('f_email'),
    whatsapp: fieldVal('f_whatsapp'),
    dadName: fieldVal('f_dadName'),
    momName: fieldVal('f_momName'),
  };
  enroll.plan = plan.key; enroll.subjects = subjects; enroll.data = data;

  const waDigits = data.whatsapp.replace(/\D/g, '');
  const checks = {
    f_studentName: !data.studentName,
    f_email: !isEmail(data.email),
    f_whatsapp: waDigits.length < 8 || waDigits.length > 15,
    f_dadName: !data.dadName && !data.momName,
    f_momName: !data.dadName && !data.momName,
  };
  let ok = true;
  Object.keys(checks).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('err', checks[id]);
    if (checks[id]) ok = false;
  });
  const chipRow = document.getElementById('f_subjects');
  chipRow.classList.toggle('err', subjects.length === 0);
  const msg = document.getElementById('enrollFormMsg');
  if (subjects.length === 0) ok = false;
  if (!ok) {
    msg.textContent = subjects.length === 0 && !Object.keys(checks).some(k => checks[k])
      ? 'Please choose at least one subject.'
      : 'Please complete the highlighted fields (a valid email, a WhatsApp number with country code, and a parent name).';
    return;
  }
  msg.textContent = '';

  // Plain, simple keys (no spaces/apostrophes) so FormSubmit always reads them.
  const fields = {
    _subject: `New Enrollment Request - ${plan.name} - ${data.studentName}`,
    _template: 'table',
    _captcha: 'false',
    Plan: plan.name,
    Plan_Price: plan.priceText,
    Subjects: subjects.join(', '),
    Student_Name: data.studentName,
    Fathers_Name: data.dadName || 'N/A',
    Mothers_Name: data.momName || 'N/A',
    WhatsApp_Number: data.whatsapp,
    WhatsApp_Chat_Link: 'https://wa.me/' + waDigits,
    email: data.email,
  };

  enroll.submitting = true;
  const btn = document.getElementById('enrollSubmitBtn');
  btn.disabled = true; btn.textContent = 'Submitting…';

  // Browsers block fetch() when the page is opened straight from a folder (file://),
  // so for local testing we use a plain form POST in a hidden frame instead.
  const send = location.protocol === 'file:' ? sendViaHiddenForm(fields)
    : sendViaAjax(fields).catch(err => {
        // FormSubmit explicitly refused the request: tell the user.
        if (err && err.kind === 'rejected') throw err;
        if (navigator.onLine === false) throw err;
        // Network/CORS/blocked request: retry with a plain form POST, which has no CORS limits.
        console.warn('AJAX send failed, retrying with a plain form POST:', err);
        return sendViaHiddenForm(fields);
      });
  send.then(() => {
    showEnrollDone(plan, subjects);
  }).catch(err => {
    console.error('Enrollment form could not be sent:', err);
    enroll.submitting = false;
    btn.disabled = false; btn.textContent = 'Submit';
    msg.textContent = 'Sorry, we couldn\u2019t send your request. Please check your connection and try again, or call/text us at 646-413-8125.' + (err && err.message ? ' [' + err.message + ']' : '');
  });
}

function sendViaAjax(fields) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => { if (ctrl) ctrl.abort(); }, 20000);
  // Send as form-encoded (same as a normal HTML form) instead of JSON.
  const body = new URLSearchParams();
  Object.keys(fields).forEach(k => body.append(k, fields[k]));
  return fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
    body: body.toString(),
    signal: ctrl ? ctrl.signal : undefined
  }).then(r => {
    clearTimeout(timer);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json().catch(() => ({}));
  }).then(res => {
    // FormSubmit answers 200 with success:"false" on problems. A first-time
    // "needs activation" reply is fine: the message is held and delivered once activated.
    const failed = res && (res.success === false || res.success === 'false');
    if (failed && !/activat/i.test(String(res.message || ''))) {
      const e = new Error('FormSubmit: ' + (res.message || 'unknown error'));
      e.kind = 'rejected';
      throw e;
    }
  }).catch(e => { clearTimeout(timer); if (!e.kind) e.kind = 'network'; throw e; });
}

function sendViaHiddenForm(fields) {
  return new Promise(resolve => {
    const name = 'bae_submit_' + Date.now();
    const iframe = document.createElement('iframe');
    iframe.name = name; iframe.style.display = 'none';
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formsubmit.co/' + ACADEMY_EMAIL;
    form.target = name; form.style.display = 'none';
    Object.keys(fields).forEach(k => {
      const i = document.createElement('input');
      i.type = 'hidden'; i.name = k; i.value = fields[k];
      form.appendChild(i);
    });
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setTimeout(() => { iframe.remove(); form.remove(); }, 500);
      resolve();
    };
    setTimeout(() => { iframe.addEventListener('load', finish); form.submit(); }, 150);
    setTimeout(finish, 12000);
  });
}

function showEnrollDone(plan, subjects) {
  document.getElementById('modalTitle').textContent = 'Request Received';
  document.getElementById('modalBody').innerHTML = `
    <div class="confirm-box">
      <span class="confirm-icon">🎉</span>
      <h3>Thank you, ${esc(enroll.data.studentName)}!</h3>
      <p>We\u2019ve received your request for <strong>${esc(plan.name)}</strong> (${esc(subjects.join(', '))}). Our team will contact you on WhatsApp at <strong>${esc(enroll.data.whatsapp)}</strong> soon to confirm the details.</p>
    </div>`;
  document.getElementById('modalFooter').innerHTML = `<span></span><button class="btn-next" onclick="closeEnroll()">Done</button>`;
}

/* ══════════════════════════════════════════
   LEGAL MODAL
══════════════════════════════════════════ */
function openLegal(kind) {
  document.getElementById('legalTitle').textContent = kind === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  document.getElementById('legalOverlay').classList.add('open');
}
function closeLegal() { document.getElementById('legalOverlay').classList.remove('open'); }

/* ══════════════════════════════════════════
   CALENDAR
══════════════════════════════════════════ */
let calDate = new Date(2026, 5, 1);
const CAL_EVENTS = {
  '2026-6-1':  [{t:'Writing Workshop',c:'ev-writing'}],
  '2026-6-6':  [{t:'Math Foundations',c:'ev-math'},{t:'SHSAT Prep',c:'ev-shsat'}],
  '2026-6-7':  [{t:'ELA Reading',c:'ev-reading'}],
  '2026-6-8':  [{t:'Algebra Mastery',c:'ev-math'}],
  '2026-6-13': [{t:'SAT Prep',c:'ev-sat'}],
  '2026-6-14': [{t:'SHSAT Weekend',c:'ev-shsat'}],
  '2026-6-15': [{t:'Writing Workshop',c:'ev-writing'}],
  '2026-6-20': [{t:'Math Foundations',c:'ev-math'}],
  '2026-6-21': [{t:'ELA Reading',c:'ev-reading'},{t:'SHSAT Prep',c:'ev-shsat'}],
  '2026-6-22': [{t:'SAT Prep',c:'ev-sat'}],
  '2026-6-27': [{t:'Essay Intensive',c:'ev-writing'}],
  '2026-6-28': [{t:'SHSAT Weekend',c:'ev-shsat'}],
  '2026-7-5':  [{t:'Math Camp',c:'ev-math'}],
  '2026-7-11': [{t:'SAT Prep',c:'ev-sat'}],
  '2026-7-12': [{t:'SHSAT Intensive',c:'ev-shsat'}],
  '2026-7-18': [{t:'Writing Seminar',c:'ev-writing'}],
  '2026-7-25': [{t:'ELA Workshop',c:'ev-reading'}],
  '2026-8-1':  [{t:'SAT Practice Test',c:'ev-sat'}],
  '2026-8-8':  [{t:'SHSAT Mock Exam',c:'ev-shsat'}],
  '2026-9-5':  [{t:'Fall Term Starts',c:'ev-math'}],
  '2026-9-6':  [{t:'SHSAT Fall Prep',c:'ev-shsat'},{t:'ELA Gr 5-7',c:'ev-reading'}],
  '2026-9-12': [{t:'SAT Fall Course',c:'ev-sat'}],
  '2026-9-13': [{t:'Writing Workshop',c:'ev-writing'}],
};
const UPCOMING = [
  {mon:'Jun',day:27,name:'Essay Intensive — Starts',       time:'Sat 10am–12pm · Online'},
  {mon:'Jul',day:5, name:'Math Summer Camp',               time:'Weekdays 9am–12pm'},
  {mon:'Jul',day:12,name:'SHSAT Summer Intensive',         time:'Sundays 10am–1pm'},
  {mon:'Aug',day:1, name:'SAT Full Practice Test',         time:'Sat 9am–1pm'},
  {mon:'Aug',day:8, name:'SHSAT Mock Exam',                time:'Sat 10am–1pm'},
  {mon:'Sep',day:5, name:'Fall Semester Begins',           time:'All programs — see schedule'},
  {mon:'Sep',day:12,name:'SAT Fall Prep — First Class',    time:'Sat 1pm–4pm'},
];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];

let calDir = 1;
function renderCalendar() {
  const titleEl = document.getElementById('calTitle');
  if (!titleEl) return;
  const y=calDate.getFullYear(), m=calDate.getMonth();
  titleEl.textContent = `${MONTHS[m]} ${y}`;
  const cells = document.getElementById('calCells');
  const today = new Date();
  const firstDay = new Date(y,m,1).getDay();
  const days = new Date(y,m+1,0).getDate();

  cells.style.opacity='0'; cells.style.transform=`translateX(${calDir>0?'24px':'-24px'})`;
  setTimeout(()=>{
    let html='';
    for(let i=0;i<firstDay;i++) html+='<div class="cal-cell empty"></div>';
    for(let d=1;d<=days;d++){
      const key=`${y}-${m+1}-${d}`;
      const evs=CAL_EVENTS[key]||[];
      const isToday=today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;
      html+=`<div class="cal-cell ${isToday?'today':''} ${evs.length?'has-ev':''}">
        <div class="cal-day-num">${d}</div>
        ${evs.map(e=>`<div class="cal-ev ${e.c}">${e.t}</div>`).join('')}
      </div>`;
    }
    cells.innerHTML=html;
    cells.style.transition='opacity .3s var(--ease-out), transform .3s var(--ease-out)';
    cells.style.opacity='1'; cells.style.transform='none';
  },150);

  document.getElementById('upcomingList').innerHTML = UPCOMING.map((s,i)=>`
    <div class="up-item sr" style="transition-delay:${i*.06}s">
      <div class="up-date"><span class="up-mon">${s.mon}</span><span class="up-day">${s.day}</span></div>
      <div class="up-info"><h4>${s.name}</h4><p>${s.time}</p></div>
      <a class="btn-enroll" href="classes.html">Enroll →</a>
    </div>`).join('');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ initSR(); initTilt(); }));
}
function changeMonth(dir) { calDir=dir; calDate.setMonth(calDate.getMonth()+dir); renderCalendar(); }

/* ══════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════ */
const TESTIS = [
  {i:'TJ',name:'Tamara Johnson',   role:'Parent of 8th grader',    type:'parent',  tag:'SHSAT Prep',       cats:['shsat'],      text:"My son went from a practice score of 490 to 558 after one semester. He got into Brooklyn Technical — our first choice. The instructors are demanding but so patient. Best investment we made."},
  {i:'MR',name:'Marcus Rivera',    role:'Student, Stuyvesant HS',  type:'student', tag:'SHSAT Prep',       cats:['shsat'],      text:"I prepped here in 8th grade and got into Stuyvesant. Now I recommend Brooklyn Academy to every 7th grader I know. The practice tests are harder than the real thing — which is exactly the point."},
  {i:'AC',name:'Angela Chen',      role:'Parent of 11th grader',   type:'parent',  tag:'SAT Prep',         cats:['sat'],        text:"My daughter improved 230 points in one semester. The SAT instructors break down every question type until it clicks. She went from overwhelmed to scoring in the 95th percentile."},
  {i:'KW',name:'Kevin Williams',   role:'Student, class of 2026',  type:'student', tag:'SAT / ACT',        cats:['sat'],        text:"I tried two other programs before Brooklyn Academy. Night and day difference. Here the teachers explain WHY the wrong answers are wrong. My reading score jumped 80 points in two months."},
  {i:'PD',name:'Patricia Diaz',    role:'Parent of twin 4th graders',type:'parent',tag:'ELA & Math',       cats:['ela','math'], text:"Both kids attend Saturday math and reading. Their state test scores went from Level 2 to Level 4. Staff communicate weekly and the homework is always targeted — never busy work."},
  {i:'SB',name:'Sandra Brown',     role:'Parent of 5-year-old',    type:'parent',  tag:'Gifted & Talented',cats:[],             text:"We started G&T prep in January and by May my daughter was fully ready for the screening. She's now in the G&T program at PS 321. The teachers make learning feel like a game."},
  {i:'JM',name:'James Mitchell',   role:'Parent of 9th grader',    type:'parent',  tag:'Algebra',          cats:['math'],       text:"My son was failing algebra. After 8 weeks of private tutoring here, he passed his Regents with an 82. His classroom teacher couldn't believe the turnaround. Now he actually likes math."},
  {i:'LN',name:'Lisa Nguyen',      role:'Student, college freshman',type:'student',tag:'Writing Workshop', cats:[],             text:"The essay workshop transformed how I write. My college essays were strong because of structure, voice, and specificity I learned here. I got into my top choice — Barnard College."},
  {i:'RA',name:'Robert Abreu',     role:'Parent of 7th grader',    type:'parent',  tag:'SHSAT Prep',       cats:['shsat'],      text:"We enrolled late — only 3 months before the SHSAT. The instructors created a focused game plan and my son got into Brooklyn Latin. Incredible. We're already enrolled for high school prep."},
];
let testiFilter = 'all';
let tcIndex = 0;

function filteredTestis() {
  return TESTIS.filter(t => {
    if (testiFilter === 'all') return true;
    if (testiFilter === 'parents') return t.type === 'parent';
    if (testiFilter === 'students') return t.type === 'student';
    return t.cats.includes(testiFilter);
  });
}

function renderTestimonials() {
  const gridEl = document.getElementById('testiGrid');
  if (!gridEl) return;
  const list = filteredTestis();
  tcIndex = 0;
  gridEl.innerHTML = list.map((t,i)=>`
    <div class="t-card sr" style="transition-delay:${i*.07}s">
      <div class="t-stars">★★★★★</div>
      <p class="t-text">${t.text}</p>
      <div class="t-author">
        <div class="t-avatar">${t.i}</div>
        <div>
          <span class="t-tag">${t.tag}</span>
          <div class="t-name">${t.name}</div>
          <div class="t-role">${t.role}</div>
        </div>
      </div>
    </div>`).join('');
  renderTcDots(list.length);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ initSR(); initTilt(); }));
}
function setTestiFilter(val, btn) {
  testiFilter = val;
  document.querySelectorAll('#testiFilters .tf-btn').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  renderTestimonials();
}
function renderTcDots(n) {
  const dotsEl = document.getElementById('tcDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = Array.from({length:n}).map((_,i)=>`<div class="tc-dot ${i===0?'on':''}"></div>`).join('');
}
function testiCarousel(dir) {
  const grid = document.getElementById('testiGrid');
  const cards = grid.querySelectorAll('.t-card');
  if (!cards.length) return;
  tcIndex = Math.max(0, Math.min(cards.length-1, tcIndex+dir));
  cards[tcIndex].scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
  document.querySelectorAll('#tcDots .tc-dot').forEach((d,i)=>d.classList.toggle('on', i===tcIndex));
}

/* Animated counters for results band */
let countersRun = false;
function initCounters() {
  if (countersRun) return;
  const nums = document.querySelectorAll('.res-num[data-count]');
  if (typeof IntersectionObserver === 'undefined') {
    countersRun = true;
    nums.forEach(el => {
      const target = el.getAttribute('data-count');
      el.textContent = (el.getAttribute('data-prefix')||'') + target + (el.getAttribute('data-suffix')||'');
    });
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !countersRun) {
        countersRun = true;
        nums.forEach(el => {
          const target = parseInt(el.getAttribute('data-count'), 10);
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const dur = 1400;
          const start = performance.now();
          function tick(now) {
            const p = Math.min(1, (now-start)/dur);
            const eased = 1 - Math.pow(1-p, 3);
            el.textContent = prefix + Math.round(target*eased) + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
        io.disconnect();
      }
    });
  }, {threshold:.3});
  const band = document.querySelector('.results-band');
  if (band) io.observe(band);
}

/* ══════════════════════════════════════════
   WHY CHOOSE US CARDS
══════════════════════════════════════════ */
const WHY_US = [
  {icon:'🎯', name:'Personalized Attention', desc:'Every plan built around your child'},
  {icon:'👤', name:'One-on-One Instruction', desc:'Dedicated tutor, full focus'},
  {icon:'🏅', name:'Experienced Tutors',     desc:'Credentialed, subject-matter experts'},
  {icon:'💻', name:'Flexible Online Learning', desc:'Learn from anywhere, on your schedule'},
  {icon:'📋', name:'Real Accountability',    desc:'Consistent progress check-ins'},
  {icon:'💪', name:'Confidence Building',    desc:'Skills that last beyond test day'},
  {icon:'📝', name:'Exam Preparation',       desc:'SHSAT, SAT/ACT & state exam ready'},
  {icon:'🎯', name:'Individual Learning Goals', desc:'Goals set and tracked with your family'},
];
function renderWhyChoose() {
  const grid = document.getElementById('whyChooseGrid');
  if (!grid) return;
  grid.innerHTML = WHY_US.map((w,i)=>`
    <div class="subj-card sr sr-d${(i%8)+1}"><span class="subj-icon">${w.icon}</span><h3>${w.name}</h3><p>${w.desc}</p></div>`).join('');
}

/* ══════════════════════════════════════════
   FAQ
══════════════════════════════════════════ */
const FAQS = [
  {q:'Are classes online?', a:'Yes — every class at Brooklyn Academy of Excellence is 100% online, taught live by our tutors.'},
  {q:'What are the teacher levels?', a:'For 1-on-1 private tutoring, we offer three teacher levels: Silver, Gold, and Platinum. Each level reflects tutor experience and the depth of support included. Group classes have their own set tuition and are not tiered by teacher level.'},
  {q:'How much does each teacher level cost?', a:'For private tutoring, Silver is $720, Gold is $840, and Platinum is $960 per course. Group class tuition is listed on each class in the Classes page.'},
  {q:'How many students can be in a class?', a:`Classrooms require a minimum of ${MIN_STUDENTS} students to run and are capped at 6–8 students depending on grade level, to preserve individual attention.`},
  {q:'What are your classroom rates?', a:'K–2 classrooms are $35 per 1-hour class. Grades 3–5 classrooms are $55 per 1.5-hour class. Grades 4–6 classrooms are $60 per 1.5-hour class. See the Classrooms section on our Classes page for details.'},
  {q:'What is your refund policy?', a:'All tuition payments are final — we do not offer refunds once a class or tutoring package is booked.'},
  {q:'Do you offer referral rewards?', a:'Yes — refer a family and receive 10% credit toward your next class once they enroll. Referral credit cannot be redeemed for cash and is non-transferable.'},
  {q:'Do you offer private or semi-private classes?', a:'Yes — private and semi-private sessions are available upon request for students who prefer 1-on-1 or small-group instruction.'},
  {q:'How do I enroll?', a:'Go to Classes and click Enroll Now. Select your plan and subject(s), then enter the student name, email, WhatsApp number, and parent name(s). Our team will contact you on WhatsApp.'},
  {q:'What happens after I submit the form?', a:'Our team receives your request right away and contacts you on WhatsApp to confirm your plan, schedule, and payment details.'},
  {q:'What information is required during enrollment?', a:"The student's name, email, WhatsApp number (with country code), and at least one parent's name — plus your chosen plan and subject(s)."},
  {q:'How can I contact the academy?', a:'Call or text 646-413-8125, email bkacademyofexcellence@gmail.com, or scan our WeChat QR code on the Contact page to add us directly.'},
];
function renderFAQ() {
  const wrap = document.getElementById('faqWrap');
  if (!wrap) return;
  wrap.innerHTML = FAQS.map((f,i)=>`
    <div class="faq-item sr" style="transition-delay:${i*.04}s" id="faq-${i}">
      <button class="faq-q" onclick="toggleFAQ(${i})"><span>${f.q}</span><span class="faq-icon">+</span></button>
      <div class="faq-a"><div class="faq-a-inner">${f.a}</div></div>
    </div>`).join('');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ initSR(); initTilt(); }));
}
function toggleFAQ(i) {
  document.getElementById('faq-'+i).classList.toggle('open');
}

/* ══════════════════════════════════════════
   CHATBOT — verified-info only
══════════════════════════════════════════ */
const CHAT_QUICK = ['Silver pricing?','Gold pricing?','Platinum pricing?','Available seats?','How do I enroll?','How do I pay?','Are classes online?','Contact info?'];

function chatAnswer(msg) {
  const q = msg.toLowerCase();
  if (q.includes('silver'))   return `Silver tuition is $${levelByKey('silver').price} per course. It includes a certified tutor with weekly 1-on-1 sessions.`;
  if (q.includes('gold'))     return `Gold tuition is $${levelByKey('gold').price} per course — our most popular level, with an experienced tutor and a personalized study plan.`;
  if (q.includes('platinum')) return `Platinum tuition is $${levelByKey('platinum').price} per course — our top-rated specialist tutors with a fully customized curriculum.`;
  if (q.includes('seat') || q.includes('spot') || q.includes('available')) {
    const open = CLASSES.filter(c => seatsRemaining(c) > 0).length;
    return `Classrooms need a minimum of ${MIN_STUDENTS} students to run and are capped at 6–8 depending on grade. Right now ${open} of our ${CLASSES.length} programs still have openings — check the Classes page for live seat counts.`;
  }
  if (q.includes('classroom') && (q.includes('price') || q.includes('rate') || q.includes('cost'))) {
    return 'K–2 classrooms are $35/hour. Grades 3–5 are $55 per 1.5-hour class. Grades 4–6 are $60 per 1.5-hour class. See the Classrooms section on our Classes page.';
  }
  if (q.includes('refund')) return 'All tuition payments are final — we do not offer refunds once a class or tutoring package is booked.';
  if (q.includes('referral')) return 'Refer a family and receive 10% credit toward your next class once they enroll. Referral credit cannot be redeemed for cash and is non-transferable.';
  if (q.includes('enroll')) return "To enroll: go to Classes and click Enroll Now. Pick your plan and subject(s), enter the student name, email, WhatsApp number and parent name, and submit. Our team will contact you on WhatsApp.";
  if (q.includes('wechat') || q.includes('we chat')) return "You can add us on WeChat by scanning the QR code on our Contact page. After you submit the enrollment form, we'll also reach out to you on WhatsApp.";
  if (q.includes('zelle') || q.includes('pay') || q.includes('credit') || q.includes('card') || q.includes('fee')) return 'After you submit the enrollment form, our team will contact you on WhatsApp to confirm your plan and share the payment details.';
  if (q.includes('online') || q.includes('in person') || q.includes('in-person')) return 'All Brooklyn Academy of Excellence classes are 100% online.';
  if (q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('call')) return 'You can reach us at 646-413-8125 or bkacademyofexcellence@gmail.com.';
  if (q.includes('testimonial') || q.includes('review')) return 'Check out our Testimonials page for stories from Brooklyn families — real reviews will be added there over time.';
  if (q.includes('faq')) return 'Our full FAQ page covers enrollment, pricing, payment, and more — you can find it via the footer Quick Links.';
  if (q.includes('class') || q.includes('course') || q.includes('subject')) return 'We offer K–2, Grades 3–5, and Grades 4–6 classrooms, plus K–8th Grade Tutoring, SAT Prep, SHSAT Prep, and HCHS Prep — all online. Visit the Classes page to browse and enroll.';
  return "I can help with pricing, enrollment, or contact info. Try one of the quick questions below, or call 646-413-8125 for anything else.";
}

let chatOpened = false;
function toggleChat() {
  const win = document.getElementById('chatWindow');
  win.classList.toggle('open');
  if (win.classList.contains('open') && !chatOpened) {
    chatOpened = true;
    initChat();
  }
}
function initChat() {
  addChatMsg('bot', "Hi! I'm the Brooklyn Academy assistant. Ask me about pricing, seats, enrollment, or payment.");
  const quick = document.getElementById('chatQuick');
  quick.innerHTML = CHAT_QUICK.map(q=>`<button onclick="chatQuickSend('${q.replace(/'/g,"\\'")}')">${q}</button>`).join('');
}
function addChatMsg(who, text) {
  const body = document.getElementById('chatBody');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + who;
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}
function chatQuickSend(q) {
  document.getElementById('chatInput').value = q;
  sendChat();
}
function sendChat() {
  const input = document.getElementById('chatInput');
  const val = input.value.trim();
  if (!val) return;
  addChatMsg('user', val);
  input.value = '';
  const body = document.getElementById('chatBody');
  const typing = document.createElement('div');
  typing.className = 'chat-typing';
  typing.innerHTML = '<span></span><span></span><span></span>';
  body.appendChild(typing);
  body.scrollTop = body.scrollHeight;
  setTimeout(() => {
    typing.remove();
    addChatMsg('bot', chatAnswer(val));
  }, 600 + Math.random()*400);
}

/* ══════════════════════════════════════════
   BOOT
══════════════════════════════════════════ */
initPage();
