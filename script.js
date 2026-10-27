/* =========================================================
   CyberLab — Security+ SY0-701 Simulator
   Pure HTML/CSS/JS — no backend, no real attack code, no network calls.
   All data is fictional. Follows the C628 CompTIA Security+ Exam Prep labs.
   ========================================================= */

'use strict';

// ---------- Utilities ----------
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function pad(n) { return String(n).padStart(2, '0'); }
function byId(id) { return document.getElementById(id); }
const LABS = Array.isArray(window.LABS) ? window.LABS : [];
function lab(num) { return LABS.find(l => l.num === num); }
function labUrl(num) {
  const l = lab(num);
  return l ? `https://github.com/tertiarycourses/C628-CompTIA-SecurityPlus-Exam-Prep/tree/main/labs/lab-${pad(l.num)}-${l.slug}` : '#';
}

// ---------- Domains ----------
const DOMAINS = [
  { n: 1, name: 'General Security Concepts', weight: 12, color: 'var(--d1)' },
  { n: 2, name: 'Threats, Vulnerabilities & Mitigations', weight: 22, color: 'var(--d2)' },
  { n: 3, name: 'Security Architecture', weight: 18, color: 'var(--d3)' },
  { n: 4, name: 'Security Operations', weight: 28, color: 'var(--d4)' },
  { n: 5, name: 'Security Program Management & Oversight', weight: 20, color: 'var(--d5)' },
];

// ---------- Module registry (sim sections) ----------
const MODULES = [
  { id: 'controls',   icon: '🗂', nav: 'Control Classifier',   title: 'Control Classifier',          domain: 1, obj: '1.1', labs: [1] },
  { id: 'zerotrust',  icon: '🧭', nav: 'Zero Trust & Deception', title: 'Zero Trust & Deception',     domain: 1, obj: '1.2', labs: [2, 3] },
  { id: 'crypto',     icon: '🔐', nav: 'Crypto Workbench',      title: 'Crypto Workbench',            domain: 1, obj: '1.4', labs: [5, 6, 7] },
  { id: 'actors',     icon: '🎭', nav: 'Threat Actors',          title: 'Threat Actor Profiler',       domain: 2, obj: '2.1', labs: [8] },
  { id: 'phishing',   icon: '📧', nav: 'Phishing',               title: 'Phishing Simulator',          domain: 2, obj: '2.2', labs: [9, 52] },
  { id: 'sqli',       icon: '🔒', nav: 'SQL Injection',          title: 'SQL Injection Simulator',     domain: 2, obj: '2.3', labs: [10] },
  { id: 'xss',        icon: '💻', nav: 'XSS',                    title: 'XSS Simulator',               domain: 2, obj: '2.3', labs: [11] },
  { id: 'password',   icon: '🔑', nav: 'Password Lab',           title: 'Password Strength Lab',       domain: 2, obj: '2.4', labs: [13] },
  { id: 'weakpass',   icon: '⚠️', nav: 'Weak Passwords',         title: 'Weak Passwords',              domain: 2, obj: '2.4', labs: [13] },
  { id: 'malware',    icon: '🦠', nav: 'Malware',                title: 'Malware Visual Demo',         domain: 2, obj: '2.4', labs: [14] },
  { id: 'virus',      icon: '🦠', nav: 'Virus Spread',           title: 'Virus Spread Visualizer',     domain: 2, obj: '2.4', labs: [14] },
  { id: 'ransomware', icon: '🚫', nav: 'Ransomware',             title: 'Ransomware Demo',             domain: 2, obj: '2.4', labs: [14] },
  { id: 'social',     icon: '🤵', nav: 'Social Engineering',     title: 'Social Engineering',          domain: 2, obj: '2.2', labs: [9, 52] },
  { id: 'firewall',   icon: '🧱', nav: 'Firewall Builder',       title: 'Firewall Rule Builder',       domain: 3, obj: '3.2', labs: [19, 20, 21] },
  { id: 'dlp',        icon: '🔍', nav: 'Classification & DLP',   title: 'Data Classification & DLP',   domain: 3, obj: '3.3', labs: [23] },
  { id: 'leakage',    icon: '💬', nav: 'Data Leakage',           title: 'Data Leakage',                domain: 3, obj: '3.3', labs: [23] },
  { id: 'resilience', icon: '💾', nav: 'Resilience Planner',     title: 'Resilience Planner',          domain: 3, obj: '3.4', labs: [26, 27] },
  { id: 'cvss',       icon: '📊', nav: 'CVSS Calculator',        title: 'CVSS v3.1 Calculator',        domain: 4, obj: '4.3', labs: [31, 32] },
  { id: 'logs',       icon: '📜', nav: 'Log Investigator',       title: 'Log Investigator',            domain: 4, obj: '4.4', labs: [33, 44] },
  { id: 'mfa',        icon: '📱', nav: 'MFA & TOTP',             title: 'MFA & TOTP',                  domain: 4, obj: '4.6', labs: [38, 39] },
  { id: 'ir',         icon: '🚨', nav: 'Incident Response',      title: 'Incident Response',           domain: 4, obj: '4.8', labs: [41, 42] },
  { id: 'risk',       icon: '⚖️', nav: 'Risk & CVSS',            title: 'Risk Calculator & Register',  domain: 5, obj: '5.2', labs: [46] },
  { id: 'recon',      icon: '📡', nav: 'Recon Visualiser',       title: 'Recon Visualiser',            domain: 5, obj: '5.5', labs: [49, 50] },
];
const MODULE_IDS = MODULES.map(m => m.id);
function moduleById(id) { return MODULES.find(m => m.id === id); }

// ---------- State ----------
const STORAGE_KEY = 'cyberlab_sy0701_state_v2';
const THEME_KEY = 'cyberlab_sy0701_theme_v2';
const state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      s.explored = s.explored || {};
      s.labsViewed = s.labsViewed || {};
      s.completed = s.completed || {};
      s.miniQuiz = s.miniQuiz || {};
      s.groups = s.groups || {};
      return s;
    }
  } catch (e) { /* ignore */ }
  return { explored: {}, labsViewed: {}, completed: {}, miniQuiz: {}, groups: {}, finalScore: null, finalTotal: null };
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}
function markExplored(id) {
  if (MODULE_IDS.includes(id) && !state.explored[id]) { state.explored[id] = true; saveState(); refreshDashboard(); }
}
function markCompleted(key) {
  if (!state.completed[key]) { state.completed[key] = true; saveState(); refreshDashboard(); }
}

// ---------- Build sidebar navigation ----------
const sidebar = byId('sidebar');
const menuToggle = byId('menuToggle');
const navEl = byId('nav');

function buildNav() {
  let html = `<button class="nav-item active" data-section="dashboard" type="button"><span aria-hidden="true">🏠</span> Dashboard</button>`;
  html += `<button class="nav-item" data-section="companion" type="button"><span aria-hidden="true">🧪</span> Lab Companion</button>`;
  html += `<div class="nav-sep"></div>`;
  DOMAINS.forEach(d => {
    const expanded = state.groups['g' + d.n] !== false;
    const mods = MODULES.filter(m => m.domain === d.n);
    html += `<div class="nav-group">
      <button class="nav-group-btn" data-group="g${d.n}" aria-expanded="${expanded}" type="button">
        <span class="dot" style="background:${d.color}"></span>
        <span class="gname">D${d.n} · ${escapeHTML(d.name)}</span>
        <span class="gweight">${d.weight}%</span>
        <span class="chev" aria-hidden="true">▾</span>
      </button>
      <div class="nav-group-items" data-group-items="g${d.n}" ${expanded ? '' : 'hidden'}>
        ${mods.map(m => `<button class="nav-item" data-section="${m.id}" type="button"><span aria-hidden="true">${m.icon}</span> ${escapeHTML(m.nav)} <span class="obj">${m.obj}</span></button>`).join('')}
      </div></div>`;
  });
  html += `<div class="nav-sep"></div>`;
  html += `<button class="nav-item" data-section="quiz" type="button"><span aria-hidden="true">🎓</span> Final Quiz</button>`;
  navEl.innerHTML = html;

  navEl.querySelectorAll('.nav-item').forEach(btn =>
    btn.addEventListener('click', () => goTo(btn.dataset.section)));
  navEl.querySelectorAll('.nav-group-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      const items = navEl.querySelector(`[data-group-items="${btn.dataset.group}"]`);
      if (items) items.hidden = open;
      state.groups[btn.dataset.group] = !open;
      saveState();
    }));
}

menuToggle.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

const sections = document.querySelectorAll('.section');
function goTo(id, opts) {
  opts = opts || {};
  sections.forEach(s => s.classList.toggle('active', s.id === id));
  navEl.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.section === id));
  sidebar.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  if (!opts.noScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
  byId('main').focus({ preventScroll: true });
  markExplored(id);
}

// ---------- Inject module meta (domain tag + lab chips) ----------
function injectModuleMeta() {
  MODULES.forEach(m => {
    const sec = byId(m.id);
    if (!sec) return;
    const header = sec.querySelector('.page-header');
    if (!header || header.dataset.metaDone) return;
    const d = DOMAINS.find(x => x.n === m.domain);
    const chips = m.labs.map(n => {
      const l = lab(n);
      const t = l ? l.title : ('Lab ' + n);
      return `<a class="lab-chip" href="${labUrl(n)}" target="_blank" rel="noopener noreferrer" title="${escapeHTML(t)} — opens on GitHub">⛓ Practise in Lab ${n}</a>
              <button class="lab-chip ghost" type="button" data-open-lab="${n}">Companion ↗</button>`;
    }).join(' ');
    const meta = document.createElement('div');
    meta.className = 'module-meta';
    meta.style.marginBottom = '1rem';
    meta.innerHTML = `<span class="domain-tag" style="color:${d.color}">Domain ${m.domain} · ${m.obj}</span> ${chips}`;
    header.insertAdjacentElement('afterend', meta);
    header.dataset.metaDone = '1';
  });
  document.querySelectorAll('[data-open-lab]').forEach(b =>
    b.addEventListener('click', () => openLab(parseInt(b.dataset.openLab, 10))));
}

// ---------- Theme ----------
const themeToggle = byId('themeToggle');
let savedTheme = 'dark';
try { savedTheme = localStorage.getItem(THEME_KEY) || 'dark'; } catch (e) {}
document.body.dataset.theme = savedTheme;
themeToggle.addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
});

// ---------- Dashboard ----------
function refreshDashboard() {
  const grid = byId('domainGrid');
  if (grid) {
    grid.innerHTML = DOMAINS.map(d => {
      const mods = MODULES.filter(m => m.domain === d.n);
      const explored = mods.filter(m => state.explored[m.id]).length;
      const pct = mods.length ? Math.round((explored / mods.length) * 100) : 0;
      return `<div class="domain-card" style="--dc:${d.color}">
        <div class="bar-label"><span>Domain ${d.n}</span><span>${d.weight}% of exam</span></div>
        <h4>${escapeHTML(d.name)}</h4>
        <div class="weight">${d.weight}%</div>
        <div class="bar-label"><span>${explored} / ${mods.length} simulations</span><span>${pct}%</span></div>
        <div class="stat-bar"><div class="stat-fill" style="width:${pct}%"></div></div>
        <div class="mods">${mods.map(m => `<button class="mod-chip ${state.explored[m.id] ? 'is-explored' : ''}" data-go="${m.id}" type="button">${m.obj} ${escapeHTML(m.nav)}</button>`).join('')}</div>
      </div>`;
    }).join('');
    grid.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => goTo(b.dataset.go)));
  }

  const exploredCount = MODULES.filter(m => state.explored[m.id]).length;
  setText('exploredCount', `${exploredCount} / ${MODULES.length}`);
  setWidth('exploredBar', (exploredCount / MODULES.length) * 100);

  const labsSeen = Object.keys(state.labsViewed).length;
  setText('labsCount', `${labsSeen} / 52`);
  setWidth('labsBar', (labsSeen / 52) * 100);

  const completed = Object.keys(state.completed).length;
  setText('completedCount', String(completed));
  setWidth('completedBar', Math.min(100, (completed / 15) * 100));

  if (state.finalScore != null) {
    setText('quizScoreStat', `${state.finalScore}/${state.finalTotal}`);
    setWidth('quizScoreBar', (state.finalScore / state.finalTotal) * 100);
  } else {
    setText('quizScoreStat', '--'); setWidth('quizScoreBar', 0);
  }
}
function setText(id, t) { const el = byId(id); if (el) el.textContent = t; }
function setWidth(id, pct) { const el = byId(id); if (el) el.style.width = Math.min(100, pct) + '%'; }

function buildLabMap() {
  const wrap = byId('labMap');
  if (!wrap) return;
  wrap.innerHTML = DOMAINS.map(d => {
    const labs = LABS.filter(l => l.domain === d.n);
    return `<div class="labmap-domain">
      <h4><span class="dot" style="background:${d.color}"></span> Domain ${d.n} — ${escapeHTML(d.name)} <span class="muted small">(${d.weight}%)</span></h4>
      <div class="lab-grid">
        ${labs.map(l => `<button class="lab-card ${state.labsViewed[l.num] ? 'viewed' : ''}" style="--dc:${d.color}" data-lab="${l.num}" type="button">
          <span class="lab-num"><span>Lab ${pad(l.num)} · ${l.obj}</span></span>
          <span class="lab-title">${escapeHTML(l.title)}</span>
        </button>`).join('')}
      </div></div>`;
  }).join('');
  wrap.querySelectorAll('[data-lab]').forEach(b => b.addEventListener('click', () => openLab(parseInt(b.dataset.lab, 10))));
}

// ---------- Lab Companion ----------
const labSelect = byId('labSelect');
let currentLab = 1;
function buildLabSelect() {
  labSelect.innerHTML = LABS.map(l => `<option value="${l.num}">Lab ${pad(l.num)} · ${l.obj} — ${escapeHTML(l.title)}</option>`).join('');
  labSelect.addEventListener('change', () => openLab(parseInt(labSelect.value, 10), true));
  byId('labPrev').addEventListener('click', () => openLab(Math.max(1, currentLab - 1)));
  byId('labNext').addEventListener('click', () => openLab(Math.min(52, currentLab + 1)));
}
function openLab(num, stay) {
  const l = lab(num);
  if (!l) return;
  currentLab = num;
  labSelect.value = String(num);
  const d = DOMAINS.find(x => x.n === l.domain);
  const view = byId('labView');
  view.innerHTML = `
    <div class="card lab-hero" style="--dc:${d.color}">
      <span class="domain-tag" style="color:${d.color}">Domain ${l.domain} · ${l.obj}</span>
      <h3 style="margin:0.5rem 0 0.25rem;">Lab ${pad(l.num)} — ${escapeHTML(l.title)}</h3>
      <p class="muted" style="margin:0;">${escapeHTML(l.objective)}</p>
      <div class="lab-facts">
        <span class="fact"><b>Domain</b>${escapeHTML(d.name)}</span>
        <span class="fact"><b>Objective</b>${escapeHTML(l.obj)}</span>
        <span class="fact"><b>Environment</b>${escapeHTML(l.build || 'Killercoda')}</span>
        <span class="fact"><b>Est. time</b>${escapeHTML(String(l.mins || 45))} min</span>
      </div>
      <p>${escapeHTML(l.desc)}</p>
      <div class="btn-row"><a class="lab-chip" href="${labUrl(num)}" target="_blank" rel="noopener noreferrer">⛓ Open Lab ${num} on GitHub</a></div>
    </div>
    <div class="card">
      <h3>Steps</h3>
      <ol class="steps">
        ${(l.steps || []).map((s, i) => `<li><div>
          <div>${escapeHTML(s.t)}</div>
          ${s.cmd ? `<div class="term"><div class="term-bar"><i></i><i></i><i></i><span class="term-title">bash — lab ${pad(num)}</span><button class="copy-btn" type="button" data-copy="${i}">Copy</button></div><pre data-cmd="${i}"><span class="prompt">$ </span>${escapeHTML(s.cmd)}</pre></div>` : ''}
        </div></li>`).join('')}
      </ol>
    </div>
    <div class="card">
      <h3>✔ Verification</h3>
      <div class="verify-box">${escapeHTML(l.test || 'See the lab README for the verification steps.')}</div>
    </div>`;
  view.querySelectorAll('[data-copy]').forEach(btn => btn.addEventListener('click', () => {
    const i = btn.dataset.copy;
    const cmd = (l.steps[i] && l.steps[i].cmd) || '';
    const done = () => { btn.textContent = 'Copied!'; setTimeout(() => (btn.textContent = 'Copy'), 1200); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cmd).then(done, fallbackCopy);
    else fallbackCopy();
    function fallbackCopy() {
      const ta = document.createElement('textarea'); ta.value = cmd; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {} document.body.removeChild(ta);
    }
  }));
  if (!stay) goTo('companion', { noScroll: false });
  if (!state.labsViewed[num]) { state.labsViewed[num] = true; saveState(); }
  buildLabMap(); refreshDashboard();
}

/* =========================================================
   DOMAIN 1
   ========================================================= */

// ---------- 1.1 Control Classifier ----------
const CONTROLS = [
  { c: 'Locked server-room door', cat: 'physical', type: 'preventive' },
  { c: '"Beware of dog" / warning sign', cat: 'physical', type: 'deterrent' },
  { c: 'CCTV recording the lobby', cat: 'physical', type: 'detective' },
  { c: 'Acceptable Use Policy (AUP)', cat: 'managerial', type: 'directive' },
  { c: 'Background check on a new hire', cat: 'managerial', type: 'preventive' },
  { c: 'Quarterly user access review', cat: 'operational', type: 'detective' },
  { c: 'Security awareness training', cat: 'operational', type: 'preventive' },
  { c: 'Firewall rule dropping inbound Telnet', cat: 'technical', type: 'preventive' },
  { c: 'IDS alert on suspicious traffic', cat: 'technical', type: 'detective' },
  { c: 'Restore files from backup after an outage', cat: 'technical', type: 'corrective' },
  { c: 'Guard checking IDs at reception', cat: 'operational', type: 'preventive' },
  { c: 'Extra logging because a legacy app cannot enforce MFA', cat: 'technical', type: 'compensating' },
];
const CAT_OPTS = ['technical', 'managerial', 'operational', 'physical'];
const TYPE_OPTS = ['preventive', 'deterrent', 'detective', 'corrective', 'compensating', 'directive'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

function initControls() {
  const tbody = document.querySelector('#ctrlTable tbody');
  if (!tbody) return;
  function render() {
    tbody.innerHTML = CONTROLS.map((row, i) => `<tr data-i="${i}">
      <td>${escapeHTML(row.c)}</td>
      <td><select class="input" data-cat="${i}">${CAT_OPTS.map(o => `<option value="${o}">${cap(o)}</option>`).join('')}</select></td>
      <td><select class="input" data-type="${i}">${TYPE_OPTS.map(o => `<option value="${o}">${cap(o)}</option>`).join('')}</select></td>
      <td class="verdict"></td></tr>`).join('');
  }
  render();
  byId('ctrlCheck').addEventListener('click', () => {
    let correct = 0;
    CONTROLS.forEach((row, i) => {
      const catv = tbody.querySelector(`[data-cat="${i}"]`).value;
      const typev = tbody.querySelector(`[data-type="${i}"]`).value;
      const ok = catv === row.cat && typev === row.type;
      const tr = tbody.querySelector(`tr[data-i="${i}"]`);
      tr.classList.toggle('row-ok', ok); tr.classList.toggle('row-bad', !ok);
      tr.querySelector('.verdict').innerHTML = ok ? '✅' : `❌ <span class="explain">${cap(row.cat)} / ${cap(row.type)}</span>`;
      if (ok) correct++;
    });
    const r = byId('ctrlResult');
    r.className = 'result show ' + (correct === CONTROLS.length ? 'ok' : 'bad');
    r.textContent = `You classified ${correct} / ${CONTROLS.length} correctly.`;
    if (correct === CONTROLS.length) markCompleted('controls');
  });
  byId('ctrlReset').addEventListener('click', () => {
    render();
    byId('ctrlResult').className = 'result';
  });
}

// ---------- 1.2 Zero Trust + Deception ----------
function initZeroTrust() {
  const btn = byId('ztEval');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const v = {
      user: byId('ztUser').value, auth: byId('ztAuth').value, device: byId('ztDevice').value,
      loc: byId('ztLoc').value, time: byId('ztTime').value, res: byId('ztRes').value
    };
    const reasons = [];
    let deny = false, stepup = false;
    if (v.user === 'unknown') { deny = true; reasons.push('Subject is not a recognised identity — authentication fails.'); }
    if (v.loc === 'anon') { deny = true; reasons.push('Connection from an anonymising proxy/Tor is blocked by policy.'); }
    if (v.auth === 'password' && (v.res === 'payroll' || v.res === 'admin')) { stepup = true; reasons.push('Restricted resource requires MFA; only a password was presented.'); }
    if (v.auth === 'failed') { stepup = true; reasons.push('Several failed attempts preceded this login — risk score raised.'); }
    if (v.device === 'byod' && v.res !== 'wiki') { deny = true; reasons.push('Unmanaged device cannot reach a Restricted resource.'); }
    if (v.device === 'outdated') { stepup = true; reasons.push('Device is 60 days behind on patches — posture is weak.'); }
    if (v.loc === 'travel') { stepup = true; reasons.push('Login from a never-seen country — adaptive identity flags it.'); }
    if (v.time === 'after' && (v.res === 'payroll' || v.res === 'admin')) { stepup = true; reasons.push('Restricted access at 03:00 is outside normal business hours.'); }
    if ((v.res === 'admin') && v.user !== 'admin') { deny = true; reasons.push('Least privilege: only an administrator may reach the admin console.'); }

    let verdict, cls, pepcls;
    if (deny) { verdict = '⛔ DENY'; cls = 'bad'; pepcls = 'deny'; }
    else if (stepup) { verdict = '⚠️ ALLOW only after step-up (additional MFA / limited session)'; cls = 'warn'; pepcls = 'stepup'; }
    else { verdict = '✅ ALLOW'; cls = 'safe'; pepcls = 'allow'; reasons.push('Identity, device posture and context all meet policy.'); }

    const pep = byId('ztPep');
    pep.className = 'zt-node zt-pep ' + pepcls;
    byId('ztResult').innerHTML = `<div class="url-summary ${cls}">PDP decision → PEP: ${escapeHTML(verdict)}</div>
      <ul>${reasons.map(r => `<li>${escapeHTML(r)}</li>`).join('')}</ul>`;
    markCompleted('zerotrust');
  });

  // Honeytoken tripwire
  const FILES = [
    { name: 'Q3_marketing_plan.pptx', meta: 'real', honey: false },
    { name: 'team_photo.jpg', meta: 'real', honey: false },
    { name: 'passwords_backup.xlsx', meta: 'honeyfile', honey: true },
    { name: 'README.txt', meta: 'real', honey: false },
    { name: 'DomainAdmin_creds.txt', meta: 'honeytoken', honey: true },
    { name: 'lunch_menu.pdf', meta: 'real', honey: false },
  ];
  const list = byId('honeyFiles');
  const cons = byId('honeyConsole');
  function renderHoney() {
    list.innerHTML = FILES.map((f, i) => `<button class="file-item" type="button" data-f="${i}"><span aria-hidden="true">📄</span><span>${escapeHTML(f.name)}</span><span class="fmeta">open</span></button>`).join('');
    cons.innerHTML = '<div class="muted">SOC console — awaiting events…</div>';
    list.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
      const f = FILES[parseInt(b.dataset.f, 10)];
      b.classList.add('opened');
      const ts = new Date().toLocaleTimeString();
      if (f.honey) {
        b.classList.add('tripped');
        const line = document.createElement('div');
        line.className = 'red';
        line.textContent = `[${ts}] 🚨 ALERT: decoy "${f.name}" accessed (${f.meta}). No legitimate user touches this. Source isolated, IR notified.`;
        cons.appendChild(line);
        markCompleted('honeytoken');
      } else {
        const line = document.createElement('div');
        line.textContent = `[${ts}] file-read ${f.name} — normal activity, no alert.`;
        cons.appendChild(line);
      }
      cons.scrollTop = cons.scrollHeight;
    }));
  }
  renderHoney();
  byId('honeyReset').addEventListener('click', renderHoney);
}

// ---------- 1.4 Crypto Workbench ----------
const subtle = (window.crypto && window.crypto.subtle) ? window.crypto.subtle : null;
const enc = new TextEncoder();
function buf2hex(buf) { return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''); }
function buf2b64(buf) { let s = ''; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); }
function b642buf(s) { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }

async function sha(text, alg) {
  const map = { 'SHA-1': 'SHA-1', 'SHA-256': 'SHA-256', 'SHA-384': 'SHA-384', 'SHA-512': 'SHA-512' };
  const digest = await subtle.digest(map[alg] || 'SHA-256', enc.encode(text));
  return buf2hex(digest);
}

function initCrypto() {
  const sup = byId('cryptoSupport');
  if (!subtle) { if (sup) sup.textContent = '⚠️ Web Crypto API not available in this browser — live hashing/encryption is disabled.'; return; }
  if (sup) sup.textContent = 'Live crypto is running locally via the Web Crypto API. Nothing is sent anywhere.';

  // 1. Hashing + avalanche
  const hIn = byId('hashInput'), hAlg = byId('hashAlg');
  async function doHash() {
    const text = hIn.value;
    const alg = hAlg.value;
    const alt = text.length ? text.slice(0, -1) + nudge(text.slice(-1)) : 'X';
    byId('hashAltLabel').textContent = `last char → "${alt.slice(-1)}"`;
    const [h1, h2] = await Promise.all([sha(text, alg), sha(alt, alg)]);
    byId('hashOut').textContent = h1;
    byId('hashOut2').textContent = h2;
    // bit diff over first 256 bits (64 hex chars)
    const bits = byId('hashBits');
    const n = Math.min(64, h1.length, h2.length);
    let diff = 0;
    bits.innerHTML = '';
    for (let i = 0; i < n; i++) {
      const a = parseInt(h1[i], 16), b = parseInt(h2[i], 16);
      const d = (a ^ b);
      const changed = d !== 0;
      if (changed) diff += (d.toString(2).split('1').length - 1);
      const span = document.createElement('span');
      if (changed) span.className = 'diff';
      bits.appendChild(span);
    }
    byId('hashDiff').textContent = `Avalanche effect: ~${diff} of the first 256 bits flipped from a one-character change.`;
    markCompleted('crypto-hash');
  }
  function nudge(ch) { if (!ch) return 'X'; const c = ch.charCodeAt(0); return String.fromCharCode(c === 90 ? 65 : c + 1); }
  hIn.addEventListener('input', doHash);
  hAlg.addEventListener('change', doHash);
  doHash();

  // 2. Salting
  const saltUsers = [{ u: 'alice' }, { u: 'bob' }];
  function randSalt() { const a = new Uint8Array(6); crypto.getRandomValues(a); return buf2hex(a); }
  async function renderSalt() {
    const pw = byId('saltPw').value;
    const rows = await Promise.all(saltUsers.map(async x => {
      if (!x.salt) x.salt = randSalt();
      const un = await sha(pw, 'SHA-256');
      const sh = await sha(x.salt + pw, 'SHA-256');
      return `<tr><td>${x.u}</td><td class="mono small">${x.salt}</td><td class="mono small">${un.slice(0, 16)}…</td><td class="mono small">${sh.slice(0, 16)}…</td></tr>`;
    }));
    byId('saltTable').innerHTML = rows.join('');
  }
  byId('saltPw').addEventListener('input', renderSalt);
  byId('saltNew').addEventListener('click', () => { saltUsers.forEach(x => (x.salt = randSalt())); renderSalt(); markCompleted('crypto-salt'); });
  renderSalt();

  // 3. AES-GCM via PBKDF2
  let lastBlob = null;
  async function deriveKey(pass, salt) {
    const base = await subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
    return subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  byId('aesEnc').addEventListener('click', async () => {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(byId('aesPass').value, salt);
      const ct = await subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(byId('aesPlain').value));
      lastBlob = { salt: buf2b64(salt), iv: buf2b64(iv), ct: buf2b64(ct) };
      byId('aesOut').textContent = JSON.stringify(lastBlob, null, 2);
      byId('aesResult').className = 'result';
      markCompleted('crypto-aes');
    } catch (e) { showAes('bad', 'Encryption error: ' + e.message); }
  });
  byId('aesDec').addEventListener('click', async () => {
    if (!lastBlob) return showAes('bad', 'Encrypt something first.');
    try {
      const salt = b642buf(lastBlob.salt), iv = b642buf(lastBlob.iv), ct = b642buf(lastBlob.ct);
      const key = await deriveKey(byId('aesPass2').value, salt);
      const pt = await subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
      showAes('ok', '✅ Decrypted: ' + new TextDecoder().decode(pt));
    } catch (e) {
      showAes('bad', '❌ Decryption failed — wrong passphrase or the ciphertext was tampered with. GCM rejected it (authentication failure).');
    }
  });
  byId('aesTamper').addEventListener('click', () => {
    if (!lastBlob) return showAes('bad', 'Encrypt something first.');
    const u = b642buf(lastBlob.ct); u[0] ^= 0xff; lastBlob.ct = buf2b64(u);
    byId('aesOut').textContent = JSON.stringify(lastBlob, null, 2);
    showAes('warn', 'One byte of ciphertext flipped. Now try Decrypt — GCM will detect the tampering.');
  });
  function showAes(kind, msg) { const r = byId('aesResult'); r.className = 'result show ' + (kind === 'warn' ? 'bad' : kind); r.textContent = msg; }

  // 4. Toy RSA
  const RSA = { n: 3233n, e: 17n, d: 2753n };
  function modpow(base, exp, mod) { let r = 1n; base %= mod; while (exp > 0n) { if (exp & 1n) r = (r * base) % mod; exp >>= 1n; base = (base * base) % mod; } return r; }
  function digestSmall(msg) { let h = 0; for (let i = 0; i < msg.length; i++) h = (h * 31 + msg.charCodeAt(i)) % 3233; return BigInt(h); }
  let sig = null, signedMsg = null;
  byId('rsaSign').addEventListener('click', () => {
    signedMsg = byId('rsaMsg').value;
    const h = digestSmall(signedMsg);
    sig = modpow(h, RSA.d, RSA.n);
    byId('rsaOut').textContent = `digest(m) = ${h}\nsignature = digest^d mod n = ${h}^${RSA.d} mod ${RSA.n} = ${sig}`;
    byId('rsaResult').className = 'result';
    markCompleted('crypto-rsa');
  });
  byId('rsaVerify').addEventListener('click', () => {
    const r = byId('rsaResult');
    if (sig === null) { r.className = 'result show bad'; r.textContent = 'Sign a message first.'; return; }
    const current = byId('rsaMsg').value;
    const h = digestSmall(current);
    const recovered = modpow(sig, RSA.e, RSA.n);
    const ok = recovered === h;
    r.className = 'result show ' + (ok ? 'ok' : 'bad');
    r.innerHTML = ok
      ? `✅ Valid signature. sig^e mod n = ${recovered} = digest(m). The message is authentic and unaltered.`
      : `❌ Invalid. sig^e mod n = ${recovered} but digest of the current message is ${h}. The message changed since it was signed${current !== signedMsg ? ' (you edited it)' : ''}.`;
  });

  // 5. Certificate chain validator
  const today = new Date('2026-10-28');
  const CERT_CASES = [
    { site: 'shop.acme-lab.test', valid: true,
      chain: [{ t: 'Root CA', s: 'ACME Root CA', i: 'ACME Root CA', exp: '2035-01-01', cn: '' },
              { t: 'Intermediate', s: 'ACME TLS CA', i: 'ACME Root CA', exp: '2030-01-01', cn: '' },
              { t: 'Leaf', s: 'shop.acme-lab.test', i: 'ACME TLS CA', exp: '2027-02-01', cn: 'shop.acme-lab.test' }],
      answer: 'trust', why: 'Chain builds to a trusted root, every certificate is in date, and the leaf CN matches the site.' },
    { site: 'mail.acme-lab.test', valid: false,
      chain: [{ t: 'Root CA', s: 'ACME Root CA', i: 'ACME Root CA', exp: '2035-01-01', cn: '' },
              { t: 'Intermediate', s: 'ACME TLS CA', i: 'ACME Root CA', exp: '2030-01-01', cn: '' },
              { t: 'Leaf', s: 'mail.acme-lab.test', i: 'ACME TLS CA', exp: '2026-03-01', cn: 'mail.acme-lab.test' }],
      answer: 'expired', why: 'The leaf certificate expired on 2026-03-01, before today (2026-10-28).' },
    { site: 'secure.acme-lab.test', valid: false,
      chain: [{ t: 'Root CA', s: 'ACME Root CA', i: 'ACME Root CA', exp: '2035-01-01', cn: '' },
              { t: 'Intermediate', s: 'ACME TLS CA', i: 'ACME Root CA', exp: '2030-01-01', cn: '' },
              { t: 'Leaf', s: 'www.other-site.test', i: 'ACME TLS CA', exp: '2027-02-01', cn: 'www.other-site.test' }],
      answer: 'mismatch', why: 'The certificate is valid but its CN is www.other-site.test — it does not match secure.acme-lab.test.' },
    { site: 'vpn.acme-lab.test', valid: false,
      chain: [{ t: 'Intermediate', s: 'Rogue TLS CA', i: 'Unknown Root', exp: '2030-01-01', cn: '' },
              { t: 'Leaf', s: 'vpn.acme-lab.test', i: 'Rogue TLS CA', exp: '2027-02-01', cn: 'vpn.acme-lab.test' }],
      answer: 'untrusted', why: 'The chain ends at an intermediate signed by "Unknown Root" that is not in the trust store — the chain cannot be built to a trusted anchor.' },
    { site: 'portal.acme-lab.test', valid: false,
      chain: [{ t: 'Root CA', s: 'ACME Root CA', i: 'ACME Root CA', exp: '2035-01-01', cn: '' },
              { t: 'Intermediate', s: 'ACME TLS CA', i: 'ACME Root CA', exp: '2030-01-01', cn: '' },
              { t: 'Leaf (REVOKED)', s: 'portal.acme-lab.test', i: 'ACME TLS CA', exp: '2027-02-01', cn: 'portal.acme-lab.test', revoked: true }],
      answer: 'revoked', why: 'OCSP/CRL reports the leaf certificate as revoked — its key was compromised, so it must not be trusted even though dates and name are fine.' },
  ];
  const VERDICTS = [
    { k: 'trust', label: '✅ Trust' }, { k: 'expired', label: '⌛ Reject: expired' },
    { k: 'mismatch', label: '🔀 Reject: name mismatch' }, { k: 'untrusted', label: '🚫 Reject: untrusted issuer' },
    { k: 'revoked', label: '♻️ Reject: revoked' }
  ];
  let certIdx = 0, certScore = { c: 0, a: 0 };
  function renderCert() {
    const cse = CERT_CASES[certIdx];
    byId('certScenario').innerHTML = `
      <div class="visit-bar">🔒 https://${escapeHTML(cse.site)}</div>
      <div class="cert-chain">
        ${cse.chain.map((c, i) => `${i ? '<div class="cert-link">▲ signs ▲</div>' : ''}
          <div class="cert-box"><span class="ct">${escapeHTML(c.t)}</span>
            <dt>Subject</dt><dd>${escapeHTML(c.s)}</dd>
            <dt>Issuer</dt><dd>${escapeHTML(c.i)}</dd>
            ${c.cn ? `<dt>CN / SAN</dt><dd>${escapeHTML(c.cn)}</dd>` : ''}
            <dt>Expires</dt><dd>${escapeHTML(c.exp)}</dd>
            ${c.revoked ? '<dt>OCSP</dt><dd style="color:var(--danger)">REVOKED</dd>' : ''}
          </div>`).reverse().join('')}
      </div>
      <p class="muted small">Your trust store contains: ACME Root CA. Today is 2026-10-28.</p>`;
    const ch = byId('certChoices'); ch.innerHTML = '';
    VERDICTS.forEach(v => { const b = document.createElement('button'); b.className = 'btn'; b.type = 'button'; b.textContent = v.label; b.addEventListener('click', () => judgeCert(v.k, cse)); ch.appendChild(b); });
    byId('certResult').className = 'result';
    byId('certScore').textContent = `${certScore.c} / ${certScore.a}`;
  }
  function judgeCert(choice, cse) {
    certScore.a++;
    const ok = choice === cse.answer;
    if (ok) certScore.c++;
    const r = byId('certResult'); r.className = 'result show ' + (ok ? 'ok' : 'bad');
    r.innerHTML = (ok ? '✅ Correct. ' : `❌ Not quite (correct: ${VERDICTS.find(v => v.k === cse.answer).label}). `) + cse.why;
    byId('certScore').textContent = `${certScore.c} / ${certScore.a}`;
    byId('certChoices').querySelectorAll('button').forEach(b => (b.disabled = true));
    markCompleted('crypto-cert');
  }
  byId('certNext').addEventListener('click', () => { certIdx = (certIdx + 1) % CERT_CASES.length; renderCert(); });
  renderCert();
}

// ---------- 2.1 Threat Actor Profiler ----------
const ACTOR_TYPES = [
  ['nation', 'Nation-state / APT'], ['unskilled', 'Unskilled attacker (script kiddie)'],
  ['hacktivist', 'Hacktivist'], ['insider', 'Insider threat'],
  ['crime', 'Organized crime'], ['shadow', 'Shadow IT']
];
const MOTIVES = [
  ['espionage', 'Espionage'], ['financial', 'Financial gain'], ['belief', 'Philosophical / political belief'],
  ['disruption', 'Disruption / chaos'], ['revenge', 'Revenge'], ['data', 'Data exfiltration'],
  ['service', 'Service availability (unsanctioned convenience)']
];
const ACTOR_SCENARIOS = [
  { text: 'A stealthy campaign uses custom zero-day malware, stays hidden for 9 months and steals defence research. Funding appears unlimited.', type: 'nation', motive: 'espionage' },
  { text: 'A ransomware gang encrypts a hospital and runs a leak site, demanding Bitcoin and threatening to publish stolen records.', type: 'crime', motive: 'financial' },
  { text: 'A group defaces a government site and leaks documents to protest an environmental policy, publicly claiming responsibility.', type: 'hacktivist', motive: 'belief' },
  { text: 'A sysadmin passed over for promotion plants a logic bomb to delete records the week after they resign.', type: 'insider', motive: 'revenge' },
  { text: 'A teenager runs a downloaded DDoS tool against a game server "for fun", with little understanding of how it works.', type: 'unskilled', motive: 'disruption' },
  { text: 'A sales team spins up an unapproved cloud database to move faster, bypassing IT and storing customer data outside policy.', type: 'shadow', motive: 'service' },
];
let actorIdx = 0, actorScore = { c: 0, a: 0 };
function initActors() {
  const typeSel = byId('actorType'), motSel = byId('actorMotive');
  if (!typeSel) return;
  typeSel.innerHTML = ACTOR_TYPES.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  motSel.innerHTML = MOTIVES.map(([v, l]) => `<option value="${v}">${l}</option>`).join('');
  function render() {
    byId('actorScenario').textContent = ACTOR_SCENARIOS[actorIdx].text;
    byId('actorResult').className = 'result';
    byId('actorScore').textContent = `${actorScore.c} / ${actorScore.a}`;
  }
  byId('actorCheck').addEventListener('click', () => {
    const s = ACTOR_SCENARIOS[actorIdx];
    const okType = typeSel.value === s.type, okMot = motSel.value === s.motive;
    actorScore.a++; if (okType && okMot) actorScore.c++;
    const r = byId('actorResult'); r.className = 'result show ' + (okType && okMot ? 'ok' : 'bad');
    r.innerHTML = `${okType ? '✅' : '❌'} Actor: <strong>${ACTOR_TYPES.find(a => a[0] === s.type)[1]}</strong>. ${okMot ? '✅' : '❌'} Motivation: <strong>${MOTIVES.find(m => m[0] === s.motive)[1]}</strong>.`;
    byId('actorScore').textContent = `${actorScore.c} / ${actorScore.a}`;
    markCompleted('actors');
  });
  byId('actorNext').addEventListener('click', () => { actorIdx = (actorIdx + 1) % ACTOR_SCENARIOS.length; render(); });
  render();
}

/* =========================================================
   EXISTING MODULES (Domain 2 & 3)
   ========================================================= */

// ---------- Phishing ----------
const emails = [
  { category: 'bank', isPhish: true, from: 'support@paypa1-secure.com',
    subject: 'URGENT: Your account will be suspended in 24h!',
    body: `Dear Customer,\n\nWe detected unusual activity. Verify your identity immediately or your account will be permanently closed.\n\nClick here: http://paypa1-secure.com/verify-now\n\nThank you,\nPayPaI Support Team`,
    suspicious: ['paypa1-secure.com', 'URGENT', 'permanently closed', 'verify-now', 'PayPaI', 'Dear Customer'] },
  { category: 'bank', isPhish: true, from: 'alerts@chase-bank-secure.us',
    subject: 'Wire transfer of $2,840.00 pending approval',
    body: `Dear Account Holder,\n\nA wire transfer of $2,840.00 to RECIPIENT-XJ12 is pending. If you did NOT authorize this, cancel immediately:\n\nhttp://chase-bank-secure.us/cancel?id=8821\n\nFailure to act will result in funds being released within 30 minutes.\n\nChase Banking Team`,
    suspicious: ['chase-bank-secure.us', 'pending approval', 'Dear Account Holder', '30 minutes', 'Failure to act'] },
  { category: 'bank', isPhish: false, from: 'statements@chase.com',
    subject: 'Your monthly statement is ready',
    body: `Hi Alex,\n\nYour March statement is now available. Sign in to chase.com to view it.\n\nWe'll never ask for your password by email.\n\n— Chase`, suspicious: [] },
  { category: 'tech', isPhish: false, from: 'no-reply@github.com',
    subject: 'New sign-in to your GitHub account',
    body: `Hi alex,\n\nWe noticed a new sign-in from Chrome on macOS.\nIf this was you, you can ignore this message.\n\nIf it wasn't you, please review your security settings at github.com/settings/security.\n\nThanks,\nGitHub Security`, suspicious: [] },
  { category: 'tech', isPhish: true, from: 'it-helpdesk@m1crosoft-support.com',
    subject: 'Your password expires today',
    body: `Hello user,\n\nYour password expires today. Reset now to avoid lockout.\n\nReset link: http://m1crosoft-support.com/reset\n\nIT Helpdesk`,
    suspicious: ['m1crosoft-support.com', 'expires today', 'avoid lockout', 'Hello user'] },
  { category: 'tech', isPhish: true, from: 'security@app1e-id.support',
    subject: 'Your Apple ID has been locked',
    body: `Dear Customer,\n\nDue to suspicious activity, your Apple ID has been locked. Unlock now:\n\nhttp://app1e-id.support/unlock\n\nFailure to verify within 12 hours will result in permanent deletion of your iCloud data.\n\nApple Support`,
    suspicious: ['app1e-id.support', 'Dear Customer', 'permanent deletion', '12 hours'] },
  { category: 'tech', isPhish: false, from: 'security@google.com',
    subject: 'Security alert: review recent activity',
    body: `Hi,\n\nWe saw a new sign-in from a Pixel 8 in San Francisco.\n\nIf this wasn't you, secure your account at myaccount.google.com.\n\nGoogle`, suspicious: [] },
  { category: 'work', isPhish: true, from: 'hr-department@yourc0mpany.co',
    subject: 'Salary Revision Notice — Open Attachment',
    body: `Hello,\n\nPlease review the attached salary revision document.\nOpen immediately: salary_2026.exe\n\nHR Department`,
    suspicious: ['yourc0mpany.co', 'salary_2026.exe', 'Open immediately'] },
  { category: 'work', isPhish: true, from: 'ceo@y0urcompany-corp.com',
    subject: 'Quick favor — need this done now',
    body: `Hey,\n\nI'm in a meeting and can't talk. Please buy 5x $200 Amazon gift cards and send the codes to me ASAP. I'll reimburse you later.\n\nDon't tell anyone — it's a surprise for the team.\n\nThanks,\nThe CEO`,
    suspicious: ['y0urcompany-corp.com', 'gift cards', 'ASAP', "Don't tell anyone", "I'll reimburse you later"] },
  { category: 'work', isPhish: false, from: 'noreply@slack.com',
    subject: 'You were added to #general',
    body: `Hi,\n\nYou've been added to the #general channel in your workspace.\n\nOpen Slack to start collaborating.\n\n— Slack`, suspicious: [] },
  { category: 'delivery', isPhish: true, from: 'tracking@dhl-redelivery.info',
    subject: 'Package delivery failed — pay $1.99 redelivery fee',
    body: `Dear Customer,\n\nYour package could not be delivered due to an unpaid customs fee of $1.99.\n\nPay now to release the package: http://dhl-redelivery.info/pay\n\nOtherwise, the package will be returned to sender within 24 hours.`,
    suspicious: ['dhl-redelivery.info', 'Dear Customer', '$1.99', 'returned to sender', '24 hours'] },
  { category: 'delivery', isPhish: true, from: 'orders@amaz0n-shipment.co',
    subject: 'Re: Order #842-A confirmation',
    body: `Hello,\n\nThank you for your order of an iPhone 15 Pro Max ($1,299).\n\nIf you did NOT place this order, click here to cancel: http://amaz0n-shipment.co/cancel-order\n\nThis action will refund your card immediately.`,
    suspicious: ['amaz0n-shipment.co', 'cancel-order', 'iPhone 15 Pro Max', 'did NOT place this order'] },
  { category: 'delivery', isPhish: false, from: 'shipment-tracking@amazon.com',
    subject: 'Your package has shipped',
    body: `Hi Alex,\n\nYour order of "Mechanical Keyboard" has shipped and is expected to arrive Friday.\n\nTrack at amazon.com/orders.\n\n— Amazon`, suspicious: [] },
  { category: 'social', isPhish: true, from: 'security@faceb00k-login.help',
    subject: 'Someone tried to log into your account',
    body: `Hi,\n\nWe noticed a sign-in attempt from Russia. Was this you?\n\nIf not, secure your account: http://faceb00k-login.help/secure\n\nYou have 1 hour to respond before your account is disabled.`,
    suspicious: ['faceb00k-login.help', '1 hour', 'disabled', 'sign-in attempt from Russia'] },
  { category: 'social', isPhish: true, from: 'instagram-verify@meta-support.tk',
    subject: 'Your application for the blue verification badge',
    body: `Dear Creator,\n\nCongratulations! Your account is eligible for the verification badge.\n\nConfirm your identity to receive your badge: http://meta-support.tk/verify\n\nYou must respond within 48 hours or your application will be cancelled.`,
    suspicious: ['meta-support.tk', 'Dear Creator', '48 hours', 'verification badge', 'Congratulations'] },
  { category: 'social', isPhish: false, from: 'no-reply@linkedin.com',
    subject: 'You appeared in 7 searches this week',
    body: `Hi Alex,\n\nYou appeared in 7 searches this week. See who's interested at linkedin.com.\n\n— LinkedIn`, suspicious: [] },
  { category: 'reward', isPhish: true, from: 'winner@global-lottery-2026.org',
    subject: 'CONGRATULATIONS!!! You won $850,000 USD',
    body: `Dear Lucky Winner,\n\nYour email was randomly selected in our annual draw. You have won $850,000 USD.\n\nTo claim, send your full name, address, phone, and a copy of your ID to: claims@global-lottery-2026.org\n\nA processing fee of $250 is required before disbursement.`,
    suspicious: ['global-lottery-2026.org', 'CONGRATULATIONS!!!', '$850,000', 'processing fee', 'copy of your ID', 'Dear Lucky Winner'] },
  { category: 'reward', isPhish: true, from: 'rewards@netfl1x-promo.shop',
    subject: 'Free 12-month Netflix subscription — claim now',
    body: `Hello valued user,\n\nYou've been selected for a FREE 12-month Netflix Premium subscription!\n\nClaim within 2 hours: http://netfl1x-promo.shop/claim\n\nJust confirm your card details to activate (no charge).`,
    suspicious: ['netfl1x-promo.shop', 'Hello valued user', '2 hours', 'card details', 'FREE 12-month'] },
  { category: 'reward', isPhish: false, from: 'newsletter@medium.com',
    subject: 'Top stories this week in technology',
    body: `Hi reader,\n\nHere are the most popular tech articles this week.\n\n— The Medium Team`, suspicious: [] },
];
let emailIdx = 0, emailFiltered = emails.slice();
const emailCategorySel = byId('emailCategory');
const phishCounter = byId('phishCounter');
emailCategorySel.addEventListener('change', () => {
  const cat = emailCategorySel.value;
  emailFiltered = cat === 'all' ? emails.slice() : emails.filter(e => e.category === cat);
  emailIdx = 0; renderEmail();
});
function renderEmail() {
  if (!emailFiltered.length) { byId('emailMock').innerHTML = '<p class="muted">No emails in this category.</p>'; phishCounter.textContent = ''; return; }
  const e = emailFiltered[emailIdx];
  let body = escapeHTML(e.body), from = escapeHTML(e.from);
  e.suspicious.forEach(s => { const h = escapeHTML(s); body = body.split(h).join(`<span class="suspicious">${h}</span>`); from = from.split(h).join(`<span class="suspicious">${h}</span>`); });
  byId('emailMock').innerHTML = `<div class="from">From: ${from}</div><div class="subject">${escapeHTML(e.subject)}</div><div class="body">${body}</div>`;
  phishCounter.textContent = `${emailIdx + 1} / ${emailFiltered.length}`;
  byId('phishResult').className = 'result';
  byId('phishResult').textContent = '';
}
document.querySelectorAll('[data-phish-answer]').forEach(btn => btn.addEventListener('click', () => {
  if (!emailFiltered.length) return;
  const ans = btn.dataset.phishAnswer, e = emailFiltered[emailIdx];
  const correct = (ans === 'phish' && e.isPhish) || (ans === 'safe' && !e.isPhish);
  const r = byId('phishResult'); r.className = 'result show ' + (correct ? 'ok' : 'bad');
  r.textContent = correct ? (e.isPhish ? '✅ Correct — this was phishing. Notice the highlighted red flags.' : '✅ Correct — this email is legitimate.')
    : (e.isPhish ? '❌ Incorrect — this was actually phishing. Look at the highlighted suspicious parts.' : '❌ Incorrect — this email was legitimate.');
  markCompleted('phishing');
}));
byId('nextEmail').addEventListener('click', () => { if (!emailFiltered.length) return; emailIdx = (emailIdx + 1) % emailFiltered.length; renderEmail(); });
renderEmail();

// Phishing walkthrough
const walkthroughEmail = {
  from: 'security-alert@app1e-id-verify.support',
  subject: 'URGENT: Your Apple ID has been compromised',
  body: `Dear Customer,\n\nWe have detected unusual sign-in activity on your Apple ID from an unrecognized device in Lagos, Nigeria.\n\nTo prevent permanent account suspension, please verify your identity within 6 hours by clicking the link below:\n\nhttp://app1e-id-verify.support/login.php?ref=urgent\n\nFailure to verify will result in deletion of all iCloud data, photos, and contacts.\n\nSincerely,\nApple Security Team`,
  steps: [
    { headline: 'Look at the sender domain', highlight: 'app1e-id-verify.support', explain: "Apple's real domain is apple.com. Here, 'app1e' uses a digit '1' to mimic the letter 'l', and the TLD is .support — a generic TLD often abused. Always inspect the part right before the final TLD." },
    { headline: 'Notice the generic greeting', highlight: 'Dear Customer', explain: "Real services that have your account usually address you by name. Generic greetings like 'Dear Customer' are a red flag — the sender doesn't actually know who you are." },
    { headline: 'Spot the urgency / fear language', highlight: 'URGENT', explain: "Phishing relies on emotional pressure: urgency, fear of loss, or fake deadlines. The goal is to make you act before you think." },
    { headline: 'Inspect the suspicious link', highlight: 'http://app1e-id-verify.support/login.php?ref=urgent', explain: "It's HTTP (not HTTPS), uses a lookalike domain, and points to a generic /login.php — typical of credential-harvesting kits. Hover before clicking." },
    { headline: 'The threat is exaggerated', highlight: 'deletion of all iCloud data', explain: "No real provider deletes your photos for missing an email. Threats this drastic exist to override your judgment. When in doubt, log in directly to the official site." },
    { headline: 'Verdict: phishing — what to do', highlight: null, explain: "Do NOT click. Do NOT reply. Report as phishing in your mail client, then delete. If unsure, sign in directly via apple.com (typed manually)." },
  ]
};
let walkStep = 0;
const walkEl = byId('walkthrough'), walkProgressFill = byId('walkProgressFill');
function renderWalkthrough() {
  const s = walkthroughEmail.steps[walkStep];
  let body = escapeHTML(walkthroughEmail.body), from = escapeHTML(walkthroughEmail.from), subject = escapeHTML(walkthroughEmail.subject);
  for (let i = 0; i <= walkStep; i++) {
    const clue = walkthroughEmail.steps[i].highlight; if (!clue) continue;
    const h = escapeHTML(clue), wrap = `<span class="clue-highlight">${h}</span>`;
    body = body.split(h).join(wrap); from = from.split(h).join(wrap); subject = subject.split(h).join(wrap);
  }
  walkEl.innerHTML = `<div class="step-label">Clue ${walkStep + 1} of ${walkthroughEmail.steps.length}</div>
    <div class="step-headline">${escapeHTML(s.headline)}</div>
    <div class="email-mock" style="margin:0.5rem 0;"><div class="from">From: ${from}</div><div class="subject">${subject}</div><div class="body">${body}</div></div>
    <div class="step-explain">${escapeHTML(s.explain)}</div>`;
  walkProgressFill.style.width = (((walkStep + 1) / walkthroughEmail.steps.length) * 100) + '%';
}
byId('walkNext').addEventListener('click', () => { walkStep = Math.min(walkthroughEmail.steps.length - 1, walkStep + 1); renderWalkthrough(); });
byId('walkPrev').addEventListener('click', () => { walkStep = Math.max(0, walkStep - 1); renderWalkthrough(); });
byId('walkRestart').addEventListener('click', () => { walkStep = 0; renderWalkthrough(); });
renderWalkthrough();

// Phishing URL inspector
const KNOWN_BRANDS = ['paypal', 'apple', 'google', 'microsoft', 'amazon', 'facebook', 'meta', 'instagram', 'netflix', 'chase', 'dhl', 'fedex', 'ups', 'linkedin', 'github', 'dropbox', 'adobe', 'spotify'];
const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'cutt.ly', 'rb.gy', 'rebrand.ly'];
const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.zip', '.mov', '.country', '.support', '.help', '.shop', '.info', '.click', '.work', '.top'];
function analyzeURL(raw) {
  let url;
  try { url = new URL(raw); } catch (e) {
    return { score: 100, summary: 'bad', summaryText: 'Could not parse this URL — that itself is suspicious.', checks: [{ kind: 'fail', icon: '❌', label: 'Malformed URL', detail: 'A legitimate link should be a properly formatted URL.' }] };
  }
  let risk = 0; const checks = [];
  const host = url.hostname.toLowerCase(), protocol = url.protocol.replace(':', '');
  if (protocol === 'https') checks.push({ kind: 'ok', icon: '✅', label: 'Uses HTTPS', detail: 'Encrypted in transit. Note: HTTPS alone does NOT mean the site is trustworthy.' });
  else if (protocol === 'http') { risk += 25; checks.push({ kind: 'fail', icon: '❌', label: 'Plain HTTP (not encrypted)', detail: 'Sensitive data sent over HTTP can be read by anyone on the network.' }); }
  else { risk += 30; checks.push({ kind: 'fail', icon: '❌', label: `Unusual protocol: ${protocol}`, detail: 'Most safe links use https://.' }); }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) { risk += 35; checks.push({ kind: 'fail', icon: '❌', label: 'Host is a raw IP address', detail: 'Real services use named domains, not bare IPs.' }); }
  if (host.includes('xn--')) { risk += 30; checks.push({ kind: 'fail', icon: '❌', label: 'Punycode (xn--) in hostname', detail: 'Attackers use it to spell brand names with lookalike characters.' }); }
  const brandHit = KNOWN_BRANDS.find(b => {
    const obf = [b.replace('o', '0'), b.replace('i', '1'), b.replace('l', '1'), b.replace('e', '3'), b.replace('a', '@'), b.replace('s', '5'), b + '-secure', b + '-login', b + '-verify', b + '-support', 'secure-' + b];
    return obf.some(o => host.includes(o)) && !host.endsWith(b + '.com');
  });
  if (brandHit) { risk += 35; checks.push({ kind: 'fail', icon: '❌', label: `Possible brand impersonation: "${brandHit}"`, detail: `The hostname references "${brandHit}" but doesn't match ${brandHit}.com.` }); }
  const parts = host.split('.'), registrable = parts.slice(-2).join('.');
  const brandSub = KNOWN_BRANDS.find(b => host.includes(b) && !registrable.startsWith(b));
  if (brandSub && !brandHit) { risk += 30; checks.push({ kind: 'fail', icon: '❌', label: `Brand "${brandSub}" hidden as subdomain`, detail: `The real domain owner is "${registrable}" — not ${brandSub}.` }); }
  if (parts.length >= 4) { risk += 15; checks.push({ kind: 'warn', icon: '⚠️', label: `Many subdomains (${parts.length} parts)`, detail: 'Long chains are used to obscure the true domain.' }); }
  const tldHit = SUSPICIOUS_TLDS.find(t => host.endsWith(t));
  if (tldHit) { risk += 20; checks.push({ kind: 'warn', icon: '⚠️', label: `High-abuse TLD: ${tldHit}`, detail: 'Free/cheap TLDs are disproportionately used in phishing.' }); }
  const shortHit = SHORTENERS.find(s => host === s || host.endsWith('.' + s));
  if (shortHit) { risk += 25; checks.push({ kind: 'warn', icon: '⚠️', label: `URL shortener (${shortHit})`, detail: 'Shorteners hide the real destination.' }); }
  if (url.username || url.password) { risk += 35; checks.push({ kind: 'fail', icon: '❌', label: 'URL contains login credentials', detail: 'The part before "@" is ignored by the browser and can mask the real domain.' }); }
  if (/(login|verify|secure|update|account|signin|reset|wallet|bank|confirm)/i.test(url.pathname)) { risk += 5; checks.push({ kind: 'warn', icon: '⚠️', label: 'Sensitive keyword in path', detail: 'Words like "login" or "verify" are common in credential-harvesting pages.' }); }
  if (raw.length > 100) { risk += 10; checks.push({ kind: 'warn', icon: '⚠️', label: 'Very long URL', detail: 'Long URLs can hide the real destination.' }); }
  risk = Math.min(100, risk);
  let summary, summaryText;
  if (risk >= 60) { summary = 'bad'; summaryText = `🚩 HIGH RISK (${risk}/100) — multiple phishing indicators. Do NOT click.`; }
  else if (risk >= 25) { summary = 'warn'; summaryText = `⚠️ SUSPICIOUS (${risk}/100) — some red flags. Verify before clicking.`; }
  else { summary = 'safe'; summaryText = `✅ LOW RISK (${risk}/100) — no obvious red flags. Still confirm context before entering credentials.`; }
  if (!checks.length) checks.push({ kind: 'ok', icon: '✅', label: 'Nothing obviously wrong', detail: 'Looks structurally normal. Always verify the sender context.' });
  return { score: risk, summary, summaryText, checks };
}
function renderURLReport(raw) {
  const report = analyzeURL(raw), el = byId('urlReport');
  el.classList.add('show');
  el.innerHTML = `<div class="url-summary ${report.summary}">${escapeHTML(report.summaryText)}</div>
    <div class="url-checks">${report.checks.map(c => `<div class="url-check ${c.kind}"><div class="icon">${c.icon}</div><div><div class="label">${escapeHTML(c.label)}</div><div class="detail">${escapeHTML(c.detail)}</div></div></div>`).join('')}</div>`;
  markCompleted('phishing');
}
byId('urlAnalyze').addEventListener('click', () => { const v = byId('urlInput').value.trim(); if (v) renderURLReport(v); });
document.querySelectorAll('[data-url-example]').forEach(b => b.addEventListener('click', () => { byId('urlInput').value = b.dataset.urlExample; renderURLReport(b.dataset.urlExample); }));

// ---------- XSS ----------
const xssInput = byId('xssInput');
xssInput.addEventListener('input', () => {
  const v = xssInput.value;
  byId('xssUnsafe').textContent = v ? `<!-- vulnerable app would render --> ${v}` : '(type something above)';
  byId('xssSafe').textContent = v ? escapeHTML(v) : '(type something above)';
  if (v) markCompleted('xss');
});

// ---------- SQL Injection ----------
const mockUsers = [{ username: 'admin', password: 'S3cure!Pass' }, { username: 'alice', password: 'wonderland' }];
byId('sqlLogin').addEventListener('click', () => {
  const u = byId('sqlUser').value, p = byId('sqlPass').value;
  byId('sqlQueryDisplay').textContent = `SELECT * FROM users WHERE username='${u}' AND password='${p}'`;
  const r = byId('sqlResult'); r.className = 'result show';
  const injPattern = /('|").*(or|=).*('|"|=)/i;
  if (injPattern.test(p) || injPattern.test(u)) {
    r.classList.add('bad');
    r.innerHTML = '⚠️ <strong>Login bypassed (simulated).</strong> The app naively concatenated input into SQL, so the attacker logged in without valid credentials. Fix: use parameterized queries.';
  } else {
    const match = mockUsers.find(x => x.username === u && x.password === p);
    if (match) { r.classList.add('ok'); r.textContent = `✅ Login successful for ${u} (mock data).`; }
    else { r.classList.add('bad'); r.textContent = '❌ Invalid credentials (mock data).'; }
  }
  markCompleted('sqli');
});

// ---------- Password Strength ----------
const pwInput = byId('pwInput');
const commonWeak = ['123456', 'password', 'qwerty', '111111', 'letmein', 'iloveyou', 'admin', 'welcome', 'abc123'];
pwInput.addEventListener('input', () => {
  const v = pwInput.value;
  if (!v) { byId('strengthFill').style.width = '0%'; byId('strengthLabel').textContent = 'Strength: --'; byId('crackTime').textContent = '--'; byId('entropyValue').textContent = '--'; byId('pwSuggestions').innerHTML = ''; return; }
  const tips = []; let pool = 0;
  if (/[a-z]/.test(v)) pool += 26; else tips.push('Add lowercase letters');
  if (/[A-Z]/.test(v)) pool += 26; else tips.push('Add uppercase letters');
  if (/[0-9]/.test(v)) pool += 10; else tips.push('Add digits');
  if (/[^A-Za-z0-9]/.test(v)) pool += 32; else tips.push('Add symbols');
  let entropy = v.length * Math.log2(pool || 1);
  if (commonWeak.includes(v.toLowerCase())) { entropy = Math.min(entropy, 8); tips.unshift('This password is in common breach lists'); }
  if (v.length < 12) tips.push('Use at least 12–16 characters');
  const seconds = Math.pow(2, entropy) / 1e10;
  byId('crackTime').textContent = humanTime(seconds);
  byId('entropyValue').textContent = entropy.toFixed(1);
  let pct, label, color;
  if (entropy < 28) { pct = 15; label = 'Very Weak'; color = 'var(--danger)'; }
  else if (entropy < 50) { pct = 40; label = 'Weak'; color = '#ff8c5a'; }
  else if (entropy < 70) { pct = 65; label = 'Moderate'; color = 'var(--warning)'; }
  else if (entropy < 90) { pct = 85; label = 'Strong'; color = 'var(--good)'; }
  else { pct = 100; label = 'Very Strong'; color = 'var(--accent)'; }
  byId('strengthFill').style.width = pct + '%'; byId('strengthFill').style.background = color;
  byId('strengthLabel').textContent = `Strength: ${label}`;
  byId('pwSuggestions').innerHTML = tips.length ? `<p class="muted small"><strong>Suggestions:</strong></p><ul>${tips.map(t => `<li>${escapeHTML(t)}</li>`).join('')}</ul>` : '<p class="muted small">✅ Looks great!</p>';
  markCompleted('password');
});
function humanTime(sec) {
  if (sec < 1) return 'Instant';
  if (sec < 60) return Math.round(sec) + ' seconds';
  if (sec < 3600) return Math.round(sec / 60) + ' minutes';
  if (sec < 86400) return Math.round(sec / 3600) + ' hours';
  if (sec < 31536000) return Math.round(sec / 86400) + ' days';
  const years = sec / 31536000;
  if (years < 1e3) return years.toFixed(1) + ' years';
  if (years < 1e6) return (years / 1e3).toFixed(1) + ' thousand years';
  if (years < 1e9) return (years / 1e6).toFixed(1) + ' million years';
  return (years / 1e9).toFixed(1) + ' billion years';
}

// ---------- Malware terminal ----------
const malwareLines = [
  { t: 'Initializing system scan...', c: '' },
  { t: '[scan] /Users/demo/Documents .... OK', c: '' },
  { t: '[scan] /Users/demo/Downloads ....', c: '' },
  { t: '⚠ Detected: trojan.fake_demo.exe (SIMULATED)', c: 'red' },
  { t: '⚠ Suspicious process: keylogger.demo (SIMULATED)', c: 'red' },
  { t: 'Attempting auto-quarantine...', c: 'yellow' },
  { t: '✓ Quarantined 2 simulated threats', c: '' },
  { t: '✓ System stable. Remember: this was a visual demo only.', c: '' },
];
byId('malwareStart').addEventListener('click', async () => {
  const screen = byId('malwareScreen'), term = byId('malwareTerminal');
  screen.classList.add('active'); term.innerHTML = '';
  for (const line of malwareLines) {
    await delay(600);
    const span = document.createElement('div');
    if (line.c) span.classList.add(line.c);
    span.textContent = '> ' + line.t;
    term.appendChild(span); term.scrollTop = term.scrollHeight;
  }
  markCompleted('malware');
});

// ---------- Virus spread ----------
const virusGrid = byId('virusGrid');
const ROWS = 8, COLS = 12;
let virusCells = [];
function buildVirusGrid() {
  virusGrid.innerHTML = ''; virusCells = [];
  for (let i = 0; i < ROWS * COLS; i++) { const cell = document.createElement('div'); cell.className = 'virus-cell'; virusGrid.appendChild(cell); virusCells.push(cell); }
}
buildVirusGrid();
let virusInterval = null;
byId('virusStart').addEventListener('click', () => {
  if (virusInterval) return;
  virusCells[Math.floor(Math.random() * virusCells.length)].classList.add('infected');
  virusInterval = setInterval(() => {
    const infected = virusCells.filter(c => c.classList.contains('infected'));
    if (infected.length >= virusCells.length) { clearInterval(virusInterval); virusInterval = null; return; }
    infected.forEach(c => {
      const idx = virusCells.indexOf(c);
      [idx - 1, idx + 1, idx - COLS, idx + COLS].forEach(n => { if (n >= 0 && n < virusCells.length && Math.random() < 0.35) virusCells[n].classList.add('infected'); });
    });
  }, 350);
  markCompleted('virus');
});
byId('virusReset').addEventListener('click', () => { if (virusInterval) { clearInterval(virusInterval); virusInterval = null; } virusCells.forEach(c => c.classList.remove('infected')); });

// ---------- Ransomware overlay ----------
const ransomOverlay = byId('ransomOverlay'), ransomTimer = byId('ransomTimer');
let ransomInt = null;
byId('ransomStart').addEventListener('click', () => {
  ransomOverlay.classList.remove('hidden');
  byId('ransomClose').focus();
  let total = 24 * 3600 - 1;
  const tick = () => { ransomTimer.textContent = `Time left: ${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`; total = total > 0 ? total - 1 : 0; };
  tick(); ransomInt = setInterval(tick, 1000);
  markCompleted('ransomware');
});
byId('ransomClose').addEventListener('click', () => { ransomOverlay.classList.add('hidden'); if (ransomInt) { clearInterval(ransomInt); ransomInt = null; } });

// ---------- Social engineering ----------
const scenarios = [
  { tactic: 'vishing', risk: 'high', text: '📞 "Hi, this is John from IT. We\'re running urgent maintenance and I need your password to update your account."',
    options: [{ text: 'Give him the password — he sounds legit', correct: false }, { text: 'Refuse and verify by calling IT directly using a known number', correct: true }, { text: 'Send the password by email instead', correct: false }],
    explain: 'Real IT will never ask for your password. Verify identities via known channels — caller ID can be spoofed.' },
  { tactic: 'baiting', risk: 'medium', text: '🎁 You find a USB stick labeled "Confidential — Q4 Bonuses" in the office parking lot.',
    options: [{ text: 'Plug it in to find the owner', correct: false }, { text: 'Hand it to security or IT without plugging it in', correct: true }, { text: 'Take it home and check it on your personal laptop', correct: false }],
    explain: 'Baiting (a "USB drop") can auto-execute payloads or pose as a keyboard (HID attack). Never plug in unknown devices.' },
  { tactic: 'tailgating', risk: 'high', text: '🚪 A stranger in a delivery uniform with a stack of boxes asks you to hold the secure door open behind you.',
    options: [{ text: 'Hold the door — they look busy and friendly', correct: false }, { text: 'Politely ask them to badge in or call reception to escort them', correct: true }, { text: 'Walk away and ignore them', correct: false }],
    explain: 'Tailgating bypasses physical access controls. Politeness should never override security policy.' },
  { tactic: 'bec', risk: 'critical', text: '✉️ The "CEO" emails you urgently from a Gmail address asking you to buy 10x $200 Apple gift cards and send the codes immediately. "Don\'t mention this to anyone."',
    options: [{ text: 'Do it quickly — the CEO is in a hurry', correct: false }, { text: 'Verify with the CEO via a known phone number first', correct: true }, { text: 'Reply to the email asking for confirmation', correct: false }],
    explain: 'BEC costs companies billions. Red flags: external email, urgency, secrecy, gift cards. Always verify out-of-band.' },
  { tactic: 'smishing', risk: 'high', text: '📱 SMS: "DHL: Your package is held at customs. Pay $1.99 fee here: dhl-pay.tk/x82 — failure returns the parcel in 24h."',
    options: [{ text: 'Pay the small fee — it\'s only $1.99', correct: false }, { text: 'Ignore and check the official DHL app directly using your tracking number', correct: true }, { text: 'Reply STOP to unsubscribe', correct: false }],
    explain: 'Smishing uses a tiny amount to make you act before thinking. The real goal is your card details.' },
  { tactic: 'pretexting', risk: 'high', text: '📧 An "external auditor" emails: "I need a list of all employees, titles, and direct phone numbers for our annual review. Send by EOD."',
    options: [{ text: 'Send the list — auditors need this info', correct: false }, { text: 'Verify with your manager or compliance team via internal channels first', correct: true }, { text: 'Send only the names to be safe', correct: false }],
    explain: 'Pretexting builds a believable story. Employee directories fuel follow-up spear-phishing and vishing.' },
  { tactic: 'quid', risk: 'medium', text: '🆓 A caller offers free tech support: "Your computer is running slowly — let me remote in and fix it, just install this small tool."',
    options: [{ text: 'Accept — free help is great', correct: false }, { text: 'Refuse politely and never install software requested by unsolicited callers', correct: true }, { text: 'Install it but only let them look', correct: false }],
    explain: 'Quid pro quo offers a "service" for access. The "tool" is usually a Remote Access Trojan.' },
  { tactic: 'watering', risk: 'high', text: '🌐 A trade-association website you visit weekly suddenly prompts: "Your Adobe Flash Player is out of date. Click here to update."',
    options: [{ text: 'Click and install — you trust this site', correct: false }, { text: 'Close the prompt and report it; never install software from a popup', correct: true }, { text: 'Install only if it asks for admin password', correct: false }],
    explain: 'Watering-hole attacks compromise trusted sites to serve fake updates. Flash is also long-deprecated.' },
  { tactic: 'vishing', risk: 'critical', text: '📞 Your bank "fraud team" calls about a $499 charge and asks you to read back the SMS code they just sent to "cancel the transaction".',
    options: [{ text: 'Read the code — it\'s the bank, after all', correct: false }, { text: 'Hang up and call the number on the back of your card', correct: true }, { text: 'Read just the last 3 digits', correct: false }],
    explain: 'The "code" is a real 2FA code FOR the attacker logging in. No bank asks you to read a code aloud.' },
  { tactic: 'pretexting', risk: 'medium', text: '👤 A LinkedIn "recruiter" with a great role wants you to fill a Google Form with your full address, ID number and bank details for "background check setup".',
    options: [{ text: 'Fill it out — recruiters need this info', correct: false }, { text: 'Refuse and verify the recruiter and company through the company\'s official site', correct: true }, { text: 'Send only the ID number', correct: false }],
    explain: 'Real recruiters don\'t collect IDs and bank details before interviews. Verify through official channels.' },
  { tactic: 'baiting', risk: 'medium', text: '🎬 A pop-up offers a "FREE Premium Netflix Account — 12 months, no credit card!" after a short survey.',
    options: [{ text: 'Try it — there\'s no credit card needed', correct: false }, { text: 'Close the ad. Free premium accounts are bait for credentials and tracking', correct: true }, { text: 'Try with a fake email', correct: false }],
    explain: 'If something is "free with no catch", you are the product.' },
  { tactic: 'bec', risk: 'critical', text: '🏦 A vendor you regularly pay emails: "We changed banks. Please update our wire details to this new account for next week\'s invoice."',
    options: [{ text: 'Update the details — you\'ve worked with them for years', correct: false }, { text: 'Call the vendor at the phone number you already have on file to verify', correct: true }, { text: 'Reply to the email to confirm', correct: false }],
    explain: 'Vendor-impersonation is a top BEC pattern. Verify bank-detail changes by a phone number you already trust.' },
];
let socialFiltered = scenarios.slice(), scenIdx = 0, socialScore = { correct: 0, answered: 0 }, scenarioAnswered = false;
const socialFilterSel = byId('socialFilter'), socialCounter = byId('socialCounter'), socialScoreEl = byId('socialScore');
socialFilterSel.addEventListener('change', () => { const t = socialFilterSel.value; socialFiltered = t === 'all' ? scenarios.slice() : scenarios.filter(s => s.tactic === t); scenIdx = 0; renderScenario(); });
byId('resetSocial').addEventListener('click', () => { socialScore = { correct: 0, answered: 0 }; updateSocialScore(); });
function updateSocialScore() { socialScoreEl.textContent = `${socialScore.correct} / ${socialScore.answered}`; }
function renderScenario() {
  if (!socialFiltered.length) { byId('socialScenario').innerHTML = '<p class="muted">No scenarios in this category.</p>'; byId('socialChoices').innerHTML = ''; socialCounter.textContent = ''; return; }
  const s = socialFiltered[scenIdx]; scenarioAnswered = false;
  const tacticName = { pretexting: 'Pretexting', baiting: 'Baiting', tailgating: 'Tailgating', vishing: 'Vishing', smishing: 'Smishing', bec: 'BEC / CEO Fraud', quid: 'Quid Pro Quo', watering: 'Watering Hole' }[s.tactic] || s.tactic;
  byId('socialScenario').innerHTML = `<div class="scenario-meta"><span class="scenario-tag">${escapeHTML(tacticName)}</span><span class="risk-badge risk-${s.risk}">${s.risk}</span></div><div>${escapeHTML(s.text)}</div>`;
  socialCounter.textContent = `${scenIdx + 1} / ${socialFiltered.length}`;
  const choices = byId('socialChoices'); choices.innerHTML = '';
  s.options.forEach(o => {
    const b = document.createElement('button'); b.className = 'btn'; b.type = 'button'; b.textContent = o.text;
    b.addEventListener('click', () => {
      if (scenarioAnswered) return; scenarioAnswered = true;
      socialScore.answered++; if (o.correct) socialScore.correct++; updateSocialScore();
      const r = byId('socialResult'); r.className = 'result show ' + (o.correct ? 'ok' : 'bad');
      r.innerHTML = (o.correct ? '✅ Good choice. ' : '❌ Risky choice. ') + escapeHTML(s.explain);
      Array.from(choices.children).forEach((btnEl, idx) => { btnEl.disabled = true; if (s.options[idx].correct) btnEl.classList.add('correct'); else if (btnEl === b && !o.correct) btnEl.classList.add('wrong'); });
      markCompleted('social');
    });
    choices.appendChild(b);
  });
  byId('socialResult').className = 'result'; byId('socialResult').innerHTML = '';
}
byId('nextScenario').addEventListener('click', () => { if (!socialFiltered.length) return; scenIdx = (scenIdx + 1) % socialFiltered.length; renderScenario(); });
renderScenario(); updateSocialScore();

// ---------- Data leakage estimator ----------
const leakChecklist = byId('leakChecklist');
function updateLeak() {
  let safety = 0, total = 0;
  leakChecklist.querySelectorAll('input').forEach(i => { const pts = parseInt(i.dataset.points, 10); total += pts; if (i.checked) safety += pts; });
  const risk = 100 - Math.round((safety / total) * 100);
  byId('leakFill').style.width = risk + '%';
  let label, color;
  if (risk < 25) { label = 'Low Risk'; color = 'var(--good)'; }
  else if (risk < 55) { label = 'Medium Risk'; color = 'var(--warning)'; }
  else { label = 'High Risk'; color = 'var(--danger)'; }
  byId('leakFill').style.background = color;
  byId('leakLabel').textContent = `Risk: ${label} (${risk}%)`;
}
leakChecklist.addEventListener('change', () => { updateLeak(); markCompleted('leakage'); });
updateLeak();

/* =========================================================
   DOMAIN 3 (new sims)
   ========================================================= */

// ---------- 3.2 Firewall Rule Builder ----------
function ipToLong(ip) { const p = ip.split('.').map(Number); if (p.length !== 4 || p.some(x => isNaN(x) || x < 0 || x > 255)) return null; return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]; }
function matchHost(pattern, ip) {
  pattern = (pattern || '').trim().toLowerCase();
  if (pattern === 'any' || pattern === '*' || pattern === '') return true;
  if (pattern.includes('/')) {
    const [net, bitsStr] = pattern.split('/'); const bits = parseInt(bitsStr, 10);
    const netL = ipToLong(net), ipL = ipToLong(ip); if (netL == null || ipL == null || isNaN(bits)) return false;
    const mask = bits === 0 ? 0 : (~((1 << (32 - bits)) - 1)) >>> 0;
    return (netL & mask) === (ipL & mask);
  }
  return pattern === ip;
}
function matchPort(pattern, port, proto, pproto) {
  pattern = (pattern || 'any').toString().trim().toLowerCase();
  if (pproto !== 'any' && proto !== 'any' && pproto !== proto) return false;
  if (pattern === 'any' || pattern === '') return true;
  return pattern === String(port);
}
const FW_STARTER = [
  { action: 'ALLOW', proto: 'tcp', src: 'any', dst: '10.0.10.10', port: '443' },
  { action: 'ALLOW', proto: 'tcp', src: 'any', dst: '10.0.20.5', port: '3306' },
  { action: 'ALLOW', proto: 'tcp', src: '10.0.30.0/24', dst: 'any', port: '22' },
  { action: 'ALLOW', proto: 'tcp', src: '10.0.30.0/24', dst: 'any', port: '443' },
];
// Correct reference set (for the auto-grader "goal"):
const FW_PACKETS = [
  { label: 'Public → web server HTTPS', proto: 'tcp', src: '203.0.113.9', dst: '10.0.10.10', port: 443, goal: 'ALLOW' },
  { label: 'Public → web server SSH', proto: 'tcp', src: '203.0.113.9', dst: '10.0.10.10', port: 22, goal: 'DENY' },
  { label: 'Web server → database MySQL', proto: 'tcp', src: '10.0.10.10', dst: '10.0.20.5', port: 3306, goal: 'ALLOW' },
  { label: 'User LAN → database MySQL', proto: 'tcp', src: '10.0.30.15', dst: '10.0.20.5', port: 3306, goal: 'DENY' },
  { label: 'Jump host → database MySQL', proto: 'tcp', src: '10.0.40.5', dst: '10.0.20.5', port: 3306, goal: 'ALLOW' },
  { label: 'Jump host → server SSH', proto: 'tcp', src: '10.0.40.5', dst: '10.0.20.5', port: 22, goal: 'ALLOW' },
  { label: 'User LAN → server SSH', proto: 'tcp', src: '10.0.30.15', dst: '10.0.20.5', port: 22, goal: 'DENY' },
  { label: 'User LAN → Internet HTTPS', proto: 'tcp', src: '10.0.30.15', dst: '198.51.100.7', port: 443, goal: 'ALLOW' },
  { label: 'User LAN → internal DNS', proto: 'udp', src: '10.0.30.15', dst: '10.0.20.53', port: 53, goal: 'ALLOW' },
];
let fwRules = JSON.parse(JSON.stringify(FW_STARTER));
function initFirewall() {
  const tbody = document.querySelector('#fwTable tbody');
  if (!tbody) return;
  function render() {
    tbody.innerHTML = fwRules.map((r, i) => `<tr data-i="${i}">
      <td>${i + 1}</td>
      <td><select class="input" data-k="action"><option ${r.action === 'ALLOW' ? 'selected' : ''}>ALLOW</option><option ${r.action === 'DENY' ? 'selected' : ''}>DENY</option></select></td>
      <td><select class="input" data-k="proto"><option ${r.proto === 'tcp' ? 'selected' : ''}>tcp</option><option ${r.proto === 'udp' ? 'selected' : ''}>udp</option><option value="any" ${r.proto === 'any' ? 'selected' : ''}>any</option></select></td>
      <td><input class="input" data-k="src" value="${escapeHTML(r.src)}"></td>
      <td><input class="input" data-k="dst" value="${escapeHTML(r.dst)}"></td>
      <td><input class="input" data-k="port" value="${escapeHTML(r.port)}"></td>
      <td><div class="order-btns"><button class="icon-btn" data-up="${i}" type="button" aria-label="Move up">▲</button><button class="icon-btn" data-down="${i}" type="button" aria-label="Move down">▼</button><button class="icon-btn" data-del="${i}" type="button" aria-label="Delete">✕</button></div></td>
    </tr>`).join('');
    tbody.querySelectorAll('select,input').forEach(el => el.addEventListener('change', e => {
      const tr = e.target.closest('tr'); const i = parseInt(tr.dataset.i, 10);
      fwRules[i][e.target.dataset.k] = e.target.value;
    }));
    tbody.querySelectorAll('[data-up]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.up; if (i > 0) { [fwRules[i - 1], fwRules[i]] = [fwRules[i], fwRules[i - 1]]; render(); } }));
    tbody.querySelectorAll('[data-down]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.down; if (i < fwRules.length - 1) { [fwRules[i + 1], fwRules[i]] = [fwRules[i], fwRules[i + 1]]; render(); } }));
    tbody.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { fwRules.splice(+b.dataset.del, 1); render(); }));
  }
  render();
  byId('fwAdd').addEventListener('click', () => { fwRules.push({ action: 'ALLOW', proto: 'tcp', src: 'any', dst: 'any', port: 'any' }); render(); });
  byId('fwReset').addEventListener('click', () => { fwRules = JSON.parse(JSON.stringify(FW_STARTER)); render(); byId('fwResult').className = 'result'; document.querySelector('#fwPackets tbody').innerHTML = ''; });
  byId('fwRun').addEventListener('click', () => {
    let pass = 0;
    const rows = FW_PACKETS.map(pk => {
      let matched = -1, action = 'DENY';
      for (let i = 0; i < fwRules.length; i++) {
        const r = fwRules[i];
        if (matchHost(r.src, pk.src) && matchHost(r.dst, pk.dst) && matchPort(r.port, pk.port, pk.proto, r.proto)) { matched = i; action = r.action; break; }
      }
      const ok = action === pk.goal;
      if (ok) pass++;
      return `<tr class="${ok ? 'row-ok' : 'row-bad'}"><td>${escapeHTML(pk.label)}<br><span class="mono small muted">${pk.src} → ${pk.dst}</span></td><td class="mono">${pk.proto}/${pk.port}</td><td>${pk.goal}</td><td>${matched < 0 ? 'implicit deny' : '#' + (matched + 1)}</td><td class="${ok ? 'ok-cell' : 'bad-cell'}">${action} ${ok ? '✔' : '✘'}</td></tr>`;
    });
    document.querySelector('#fwPackets tbody').innerHTML = rows.join('');
    const r = byId('fwResult'); r.className = 'result show ' + (pass === FW_PACKETS.length ? 'ok' : 'bad');
    r.textContent = pass === FW_PACKETS.length ? `✅ All ${FW_PACKETS.length} packets handled correctly. Specific ALLOWs above the implicit deny — well ordered!` : `${pass} / ${FW_PACKETS.length} packets match the goal. Check rule order (first match wins) and tighten sources/destinations.`;
    if (pass === FW_PACKETS.length) markCompleted('firewall');
  });

  // WAF
  const WAF = [
    { label: "Search: ' OR 1=1 --", rule: 'SQLi (942100)', why: 'SQL meta-characters and a tautology — blocked by the SQL-injection ruleset.' },
    { label: 'Comment: <script>steal()</script>', rule: 'XSS (941100)', why: 'A <script> tag in user input — blocked by the XSS ruleset.' },
    { label: 'Path: /../../etc/passwd', rule: 'Path traversal (930110)', why: 'Directory traversal sequence — blocked by the LFI/traversal ruleset.' },
    { label: 'Normal: /products?id=42', rule: 'No match (allowed)', why: 'A clean request with a numeric parameter — passes to the application.' },
  ];
  const wc = byId('wafChoices'); wc.innerHTML = '';
  WAF.forEach(w => { const b = document.createElement('button'); b.className = 'btn'; b.type = 'button'; b.textContent = w.label; b.addEventListener('click', () => { const r = byId('wafResult'); const allowed = w.rule.includes('No match'); r.className = 'result show ' + (allowed ? 'ok' : 'bad'); r.innerHTML = `<strong>${escapeHTML(w.rule)}</strong> — ${escapeHTML(w.why)}`; markCompleted('firewall'); }); wc.appendChild(b); });
}

// ---------- 3.3 DLP ----------
const DLP_SAMPLES = {
  hr: `Welcome aboard! Please confirm your details.\nName: Jane Tan\nNRIC: S1234567D\nPersonal email: jane.tan@example.com\nCorporate card issued: 4111 1111 1111 1111\nStart date: 3 Nov 2026`,
  sales: `customer,email,card,nric\nAcme Pte Ltd,ops@acme.example,5500 0000 0000 0004,S7654321J\nBeta LLP,finance@beta.example,4012 8888 8888 1881,T0123456A`,
  memo: `FOR IMMEDIATE RELEASE\nTertiary Infotech launches a new Security+ lab platform.\nContact: press@example.com for media enquiries. No customer data is included in this notice.`,
  mixed: `Ticket #5521: customer says card 4111-1111-1111-1111 was declined.\nHe also typed 1234 5678 9012 3456 which is NOT a valid card (fails Luhn).\nHis NRIC is S1234567D, order ref ORD-S9999999Z (looks like an NRIC but is an order id).\nReach him at user@example.com.`
};
function luhnValid(num) { const d = num.replace(/\D/g, ''); if (d.length < 13 || d.length > 19) return false; let sum = 0, alt = false; for (let i = d.length - 1; i >= 0; i--) { let n = parseInt(d[i], 10); if (alt) { n *= 2; if (n > 9) n -= 9; } sum += n; alt = !alt; } return sum % 10 === 0; }
function nricValid(s) {
  const m = /^([STFG])(\d{7})([A-Z])$/.exec(s); if (!m) return false;
  const w = [2, 7, 6, 5, 4, 3, 2], digits = m[2].split('').map(Number);
  let sum = digits.reduce((a, d, i) => a + d * w[i], 0);
  if (m[1] === 'T' || m[1] === 'G') sum += 4;
  const stTable = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const fgTable = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
  const idx = sum % 11;
  const expected = (m[1] === 'S' || m[1] === 'T') ? stTable[idx] : fgTable[idx];
  return expected === m[3];
}
function initDLP() {
  const ta = byId('dlpText'); if (!ta) return;
  const sel = byId('dlpSample');
  function load() { ta.value = DLP_SAMPLES[sel.value]; byId('dlpReport').innerHTML = ''; }
  sel.addEventListener('change', load); load();
  byId('dlpScan').addEventListener('click', () => {
    const text = ta.value;
    const mode = (document.querySelector('input[name="dlpMode"]:checked') || {}).value || 'mask';
    const hits = [];
    // emails
    text.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, (m, off) => { hits.push({ s: off, e: off + m.length, type: 'Email', valid: true, v: m }); return m; });
    // card candidates (13-19 digits with optional separators)
    text.replace(/\b(?:\d[ -]?){13,19}\b/g, (m, off) => { const valid = luhnValid(m); hits.push({ s: off, e: off + m.length, type: valid ? 'Payment card (Luhn-valid)' : 'Card-like (fails Luhn)', valid, card: true, v: m }); return m; });
    // NRIC candidates
    text.replace(/\b[STFG]\d{7}[A-Z]\b/g, (m, off) => { const valid = nricValid(m); hits.push({ s: off, e: off + m.length, type: valid ? 'NRIC (valid checksum)' : 'NRIC-format (bad checksum)', valid, nric: true, v: m }); return m; });
    hits.sort((a, b) => a.s - b.s);
    // dedupe overlaps (keep first)
    const kept = []; let lastEnd = -1;
    hits.forEach(h => { if (h.s >= lastEnd) { kept.push(h); lastEnd = h.e; } });
    // highlight + transform
    let out = '', cursor = 0;
    function transform(h) {
      const raw = h.v;
      if (h.card && !h.valid) return raw; // not real data; leave
      if (mode === 'redact') return '█'.repeat(Math.min(raw.length, 12));
      if (mode === 'token') { let hsh = 0; for (let i = 0; i < raw.length; i++) hsh = (hsh * 131 + raw.charCodeAt(i)) >>> 0; return `tok_${(h.card ? 'PAN' : h.nric ? 'NRIC' : 'EMAIL')}_${hsh.toString(36).toUpperCase()}`; }
      // mask
      const digits = raw.replace(/\D/g, '');
      if (h.card && h.valid) return '•••• •••• •••• ' + digits.slice(-4);
      if (h.nric) return raw[0] + '•••••' + raw.slice(-2);
      const at = raw.indexOf('@'); return at > 1 ? raw[0] + '•••' + raw.slice(at) : raw;
    }
    kept.forEach(h => { out += escapeHTML(text.slice(cursor, h.s)); out += `<span class="dlp-hit" title="${escapeHTML(h.type)}">${escapeHTML(transform(h))}</span>`; cursor = h.e; });
    out += escapeHTML(text.slice(cursor));
    // classification
    const sensitive = kept.filter(h => h.valid);
    let cls = 'public', clsName = 'PUBLIC';
    if (sensitive.some(h => h.card || h.nric)) { cls = 'restricted'; clsName = 'RESTRICTED'; }
    else if (sensitive.some(h => h.type === 'Email')) { cls = 'confidential'; clsName = 'CONFIDENTIAL'; }
    const counts = {};
    kept.forEach(h => { counts[h.type] = (counts[h.type] || 0) + 1; });
    byId('dlpReport').innerHTML = `
      <p style="margin-top:0.75rem;">Suggested classification: <span class="class-badge class-${cls}">${clsName}</span></p>
      <div class="url-checks" style="margin:0.5rem 0;">${Object.keys(counts).length ? Object.entries(counts).map(([t, c]) => `<div class="url-check ${t.includes('bad') || t.includes('fails') ? 'warn' : (t === 'Email' ? 'warn' : 'fail')}"><div class="icon">${t.includes('fails') || t.includes('bad') ? '⚠️' : '🔎'}</div><div><div class="label">${escapeHTML(t)} ×${c}</div></div></div>`).join('') : '<div class="url-check ok"><div class="icon">✅</div><div><div class="label">No sensitive patterns detected</div></div></div>'}</div>
      <p class="small muted">Transformed (${mode}):</p>
      <pre class="code-block dlp-out">${out}</pre>`;
    markCompleted('dlp');
  });
}

// ---------- 3.4 Resilience ----------
function initResilience() {
  const row = byId('raidRow'); if (!row) return;
  let failed = {};
  function raidInfo(level, n) {
    switch (level) {
      case '0': return { usable: n, tol: 0, min: 2, layout: Array(n).fill('data') };
      case '1': return { usable: 1, tol: n - 1, min: 2, layout: Array(n).fill('mirror') };
      case '5': return { usable: n - 1, tol: 1, min: 3, layout: Array(n).fill('data').map((x, i) => i === n - 1 ? 'parity' : 'data') };
      case '6': return { usable: n - 2, tol: 2, min: 4, layout: Array(n).fill('data').map((x, i) => i >= n - 2 ? 'parity' : 'data') };
      case '10': return { usable: Math.floor(n / 2), tol: Math.floor(n / 2), min: 4, layout: Array(n).fill('mirror') };
      default: return { usable: n, tol: 0, min: 2, layout: Array(n).fill('data') };
    }
  }
  function render() {
    const level = byId('raidLevel').value;
    const n = Math.max(2, Math.min(12, parseInt(byId('raidDisks').value, 10) || 2));
    const size = Math.max(1, parseInt(byId('raidSize').value, 10) || 1);
    const info = raidInfo(level, n);
    byId('raidStats').innerHTML = `
      <div class="stat-card"><div class="stat-label">Usable capacity</div><div class="stat-value">${(info.usable * size)} TB</div></div>
      <div class="stat-card"><div class="stat-label">Efficiency</div><div class="stat-value">${Math.round((info.usable / n) * 100)}%</div></div>
      <div class="stat-card"><div class="stat-label">Disks tolerated</div><div class="stat-value">${info.tol}</div></div>
      <div class="stat-card"><div class="stat-label">Minimum disks</div><div class="stat-value">${info.min}</div></div>`;
    row.innerHTML = Array.from({ length: n }, (_, i) => `<button class="disk ${failed[i] ? 'failed' : ''}" data-d="${i}" type="button">
      <div class="dlabel">${failed[i] ? '✕' : '●'} D${i + 1}</div>
      <div class="blk ${info.layout[i]}">${info.layout[i] === 'parity' ? 'P' : info.layout[i] === 'mirror' ? 'M' : 'DATA'}</div>
      <div class="blk ${info.layout[i] === 'parity' ? 'data' : info.layout[i]}">${info.layout[i] === 'mirror' ? 'M' : 'DATA'}</div></button>`).join('');
    row.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.d; failed[i] = !failed[i]; render(); }));
    const nf = Object.values(failed).filter(Boolean).length;
    const st = byId('raidStatus');
    let survives;
    if (level === '1') survives = nf <= n - 1;
    else if (level === '10') survives = nf <= Math.floor(n / 2); // optimistic (no two in same mirror)
    else survives = nf <= info.tol;
    st.className = 'result show ' + (nf === 0 ? 'ok' : survives ? 'ok' : 'bad');
    st.innerHTML = nf === 0 ? `✅ Array healthy. RAID ${level} tolerates ${info.tol} disk failure(s).`
      : survives ? `⚠️ ${nf} disk(s) failed — array still online and rebuilding. RAID ${level} tolerates ${info.tol}${level === '10' ? ' (if not both halves of a mirror)' : ''}.`
      : `❌ ${nf} disk(s) failed — DATA LOST. RAID ${level} tolerates only ${info.tol}. This is why RAID is not a backup.`;
    markCompleted('resilience');
  }
  ['raidLevel', 'raidDisks', 'raidSize'].forEach(id => byId(id).addEventListener('change', () => { failed = {}; render(); }));
  render();

  // backup plan
  function bkReport() {
    const freq = +byId('bkFreq').value, rpo = +byId('bkRpo').value, restore = +byId('bkRestore').value, rto = +byId('bkRto').value;
    const copies = +byId('bkCopies').value, media = +byId('bkMedia').value, off = +byId('bkOffsite').value;
    const checks = [];
    checks.push(freq <= rpo ? { k: 'ok', i: '✅', l: `Backup interval ${freq}h ≤ RPO ${rpo}h`, d: 'You will not lose more data than the RPO allows.' } : { k: 'fail', i: '❌', l: `Backup interval ${freq}h > RPO ${rpo}h`, d: `Back up at least every ${rpo}h to meet the RPO.` });
    checks.push(restore <= rto ? { k: 'ok', i: '✅', l: `Restore time ${restore}h ≤ RTO ${rto}h`, d: 'Recovery fits inside the agreed downtime.' } : { k: 'fail', i: '❌', l: `Restore time ${restore}h > RTO ${rto}h`, d: 'Speed up recovery (warm site, faster media) or relax the RTO.' });
    checks.push(copies >= 3 ? { k: 'ok', i: '✅', l: `${copies} copies (3-2-1: ≥3)`, d: 'Enough copies of the data.' } : { k: 'warn', i: '⚠️', l: `${copies} copies (3-2-1 wants ≥3)`, d: 'Keep the original plus two backups.' });
    checks.push(media >= 2 ? { k: 'ok', i: '✅', l: `${media} media types (3-2-1: ≥2)`, d: 'Spreads risk across technologies.' } : { k: 'warn', i: '⚠️', l: `${media} media type (3-2-1 wants ≥2)`, d: 'Use at least two different storage media.' });
    checks.push(off >= 1 ? { k: 'ok', i: '✅', l: `${off} copy off-site (3-2-1: ≥1)`, d: 'Survives a site disaster.' } : { k: 'fail', i: '❌', l: `No off-site copy (3-2-1 wants ≥1)`, d: 'Keep at least one copy off-site.' });
    checks.push(byId('bkImmutable').checked ? { k: 'ok', i: '✅', l: 'Offline / immutable copy present', d: 'Protects against ransomware deleting backups.' } : { k: 'warn', i: '⚠️', l: 'No offline / immutable copy', d: 'Add an air-gapped or immutable copy (the "1-0" in 3-2-1-1-0).' });
    checks.push(byId('bkTested').checked ? { k: 'ok', i: '✅', l: 'Restores tested (0 errors)', d: 'An untested backup is not a backup.' } : { k: 'warn', i: '⚠️', l: 'Restores not tested', d: 'Schedule regular restore drills.' });
    byId('bkReport').innerHTML = checks.map(c => `<div class="url-check ${c.k}"><div class="icon">${c.i}</div><div><div class="label">${escapeHTML(c.l)}</div><div class="detail">${escapeHTML(c.d)}</div></div></div>`).join('');
    markCompleted('resilience');
  }
  ['bkFreq', 'bkRpo', 'bkRestore', 'bkRto', 'bkCopies', 'bkMedia', 'bkOffsite'].forEach(id => byId(id).addEventListener('input', bkReport));
  ['bkImmutable', 'bkTested'].forEach(id => byId(id).addEventListener('change', bkReport));
  bkReport();

  // backup sets needed
  function bsReport() {
    const strat = byId('bsStrategy').value, day = +byId('bsDay').value;
    const sets = [{ n: 'Sun FULL', need: true, cls: 'need' }];
    for (let d = 1; d <= 6; d++) {
      const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d - 1];
      let need = false, cls = 'skip';
      if (d <= day) {
        if (strat === 'inc') { need = true; cls = 'need'; } // every incremental up to failure
        else { need = (d === day); cls = need ? 'need' : 'skip'; } // only the latest differential
      }
      sets.push({ n: `${dayName} ${strat === 'inc' ? 'INC' : 'DIFF'}`, need, cls });
    }
    const count = sets.filter(s => s.need).length;
    byId('bsOut').innerHTML = `<p class="small muted" style="flex-basis:100%">Restore sets required: <strong>${count}</strong> ${strat === 'inc' ? '(full + every incremental up to the failure — slower restore, faster backups)' : '(full + only the latest differential — faster restore, larger backups)'}.</p>` + sets.map(s => `<div class="bset ${s.cls}">${escapeHTML(s.n)}</div>`).join('');
    markCompleted('resilience');
  }
  byId('bsStrategy').addEventListener('change', bsReport); byId('bsDay').addEventListener('change', bsReport);
  bsReport();
}

/* =========================================================
   DOMAIN 4 & 5 (new sims)
   ========================================================= */

// ---------- 4.3 CVSS v3.1 ----------
const CVSS_METRICS = [
  { id: 'AV', name: 'Attack Vector', opts: [['N', 'Network', 0.85], ['A', 'Adjacent', 0.62], ['L', 'Local', 0.55], ['P', 'Physical', 0.2]] },
  { id: 'AC', name: 'Attack Complexity', opts: [['L', 'Low', 0.77], ['H', 'High', 0.44]] },
  { id: 'PR', name: 'Privileges Required', opts: [['N', 'None', 0.85], ['L', 'Low', 0.62], ['H', 'High', 0.27]] },
  { id: 'UI', name: 'User Interaction', opts: [['N', 'None', 0.85], ['R', 'Required', 0.62]] },
  { id: 'S', name: 'Scope', opts: [['U', 'Unchanged', 0], ['C', 'Changed', 1]] },
  { id: 'C', name: 'Confidentiality', opts: [['H', 'High', 0.56], ['L', 'Low', 0.22], ['N', 'None', 0]] },
  { id: 'I', name: 'Integrity', opts: [['H', 'High', 0.56], ['L', 'Low', 0.22], ['N', 'None', 0]] },
  { id: 'A', name: 'Availability', opts: [['H', 'High', 0.56], ['L', 'Low', 0.22], ['N', 'None', 0]] },
];
const CVSS_PRESETS = {
  'Custom': null,
  'Unauthenticated RCE (web)': { AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'C', C: 'H', I: 'H', A: 'H' },
  'Stored XSS': { AV: 'N', AC: 'L', PR: 'L', UI: 'R', S: 'C', C: 'L', I: 'L', A: 'N' },
  'Local privilege escalation': { AV: 'L', AC: 'L', PR: 'L', UI: 'N', S: 'U', C: 'H', I: 'H', A: 'H' },
  'Phishing-triggered malware': { AV: 'N', AC: 'L', PR: 'N', UI: 'R', S: 'U', C: 'H', I: 'H', A: 'H' },
};
let cvssSel = { AV: 'N', AC: 'L', PR: 'N', UI: 'N', S: 'U', C: 'H', I: 'H', A: 'H' };
function roundUp1(x) { const i = Math.round(x * 100000); return (i % 10000 === 0) ? i / 100000 : (Math.floor(i / 10000) + 1) / 10; }
function cvssBase(v) {
  const val = (id, code) => CVSS_METRICS.find(m => m.id === id).opts.find(o => o[0] === code)[2];
  const iscBase = 1 - ((1 - val('C', v.C)) * (1 - val('I', v.I)) * (1 - val('A', v.A)));
  const scopeChanged = v.S === 'C';
  const impact = scopeChanged ? 7.52 * (iscBase - 0.029) - 3.25 * Math.pow(iscBase - 0.02, 15) : 6.42 * iscBase;
  let pr = val('PR', v.PR);
  if (scopeChanged && v.PR === 'L') pr = 0.68; else if (scopeChanged && v.PR === 'H') pr = 0.5;
  const exploit = 8.22 * val('AV', v.AV) * val('AC', v.AC) * pr * val('UI', v.UI);
  if (impact <= 0) return 0;
  const base = scopeChanged ? Math.min(1.08 * (impact + exploit), 10) : Math.min(impact + exploit, 10);
  return roundUp1(base);
}
function sevOf(score) { if (score === 0) return ['None', 'sev-none']; if (score < 4) return ['Low', 'sev-low']; if (score < 7) return ['Medium', 'sev-medium']; if (score < 9) return ['High', 'sev-high']; return ['Critical', 'sev-critical']; }
function initCVSS() {
  const wrap = byId('cvssMetrics'); if (!wrap) return;
  const preset = byId('cvssPreset');
  preset.innerHTML = Object.keys(CVSS_PRESETS).map(k => `<option>${k}</option>`).join('');
  wrap.innerHTML = CVSS_METRICS.map(m => `<div class="metric"><fieldset><legend>${m.name} (${m.id})</legend><div class="seg">
    ${m.opts.map(o => `<label><input type="radio" name="cv_${m.id}" value="${o[0]}" ${cvssSel[m.id] === o[0] ? 'checked' : ''}><span>${o[1]}</span></label>`).join('')}
  </div></fieldset></div>`).join('');
  function recompute() {
    const score = cvssBase(cvssSel);
    const [sev, cls] = sevOf(score);
    const el = byId('cvssScore'); el.textContent = score.toFixed(1); el.className = 'cvss-score ' + cls;
    byId('cvssSev').innerHTML = `<span class="sev-pill ${cls}">${sev}</span>`;
    byId('cvssVector').textContent = `CVSS:3.1/${CVSS_METRICS.map(m => m.id + ':' + cvssSel[m.id]).join('/')}`;
    byId('cvssDetail').textContent = score >= 9 ? 'Critical — patch on an emergency timeline.' : score >= 7 ? 'High — prioritise remediation.' : score >= 4 ? 'Medium — schedule remediation.' : score > 0 ? 'Low — remediate as resources allow.' : 'No impact.';
    markCompleted('cvss');
  }
  wrap.querySelectorAll('input[type=radio]').forEach(r => r.addEventListener('change', () => { cvssSel[r.name.slice(3)] = r.value; preset.value = 'Custom'; recompute(); }));
  preset.addEventListener('change', () => { const p = CVSS_PRESETS[preset.value]; if (p) { cvssSel = Object.assign({}, p); syncRadios(); recompute(); } });
  function syncRadios() { CVSS_METRICS.forEach(m => { const r = wrap.querySelector(`input[name="cv_${m.id}"][value="${cvssSel[m.id]}"]`); if (r) r.checked = true; }); }
  byId('cvssParseBtn').addEventListener('click', () => {
    const str = byId('cvssParse').value.trim(); const r = byId('cvssParseResult');
    const parsed = {}; let okAll = true;
    str.replace(/(AV|AC|PR|UI|S|C|I|A):([A-Z])/g, (mm, k, val) => { parsed[k] = val; return mm; });
    CVSS_METRICS.forEach(m => { const o = m.opts.find(x => x[0] === parsed[m.id]); if (!o) okAll = false; });
    if (okAll) { cvssSel = Object.assign({}, parsed); syncRadios(); preset.value = 'Custom'; recompute(); r.className = 'result show ok'; r.textContent = 'Vector loaded.'; }
    else { r.className = 'result show bad'; r.textContent = 'Could not parse all eight base metrics from that string.'; }
  });
  recompute();

  // Vuln management prioritisation
  const VM = [
    { f: 'OpenSSL RCE on public API gateway', cvss: 9.8, inet: true, kev: true },
    { f: 'Outdated jQuery on internal wiki', cvss: 6.1, inet: false, kev: false },
    { f: 'SMB vuln on internal file server', cvss: 8.1, inet: false, kev: true },
    { f: 'Verbose errors on marketing site', cvss: 4.3, inet: true, kev: false },
  ];
  byId('vmTable') && (document.querySelector('#vmTable tbody').innerHTML = VM.map(v => {
    let pr = 'Low', sla = '90 days';
    const high = v.cvss >= 7;
    if (v.kev && v.inet) { pr = 'Critical'; sla = '24–72 hours'; }
    else if (v.kev || (high && v.inet)) { pr = 'High'; sla = '7 days'; }
    else if (high || v.inet) { pr = 'Medium'; sla = '30 days'; }
    const cls = pr === 'Critical' ? 'sev-critical' : pr === 'High' ? 'sev-high' : pr === 'Medium' ? 'sev-medium' : 'sev-low';
    return `<tr><td>${escapeHTML(v.f)}</td><td>${v.cvss.toFixed(1)}</td><td>${v.inet ? 'Yes' : 'No'}</td><td>${v.kev ? 'Yes (KEV)' : 'No'}</td><td><span class="sev-pill ${cls}">${pr}</span></td><td>${sla}</td></tr>`;
  }).join(''));
}

// ---------- 4.4 / 4.9 Log Investigator ----------
const LOGS = {
  auth: [
    'Oct 28 02:14:03 web01 sshd[2211]: Failed password for invalid user admin from 198.51.100.23 port 51002 ssh2',
    'Oct 28 02:14:05 web01 sshd[2213]: Failed password for root from 198.51.100.23 port 51010 ssh2',
    'Oct 28 02:14:07 web01 sshd[2215]: Failed password for root from 198.51.100.23 port 51018 ssh2',
    'Oct 28 02:14:09 web01 sshd[2217]: Failed password for admin from 198.51.100.23 port 51026 ssh2',
    'Oct 28 02:14:11 web01 sshd[2219]: Failed password for admin from 198.51.100.23 port 51034 ssh2',
    'Oct 28 02:14:13 web01 sshd[2221]: Failed password for deploy from 198.51.100.23 port 51042 ssh2',
    'Oct 28 02:14:20 web01 sshd[2240]: Accepted password for deploy from 198.51.100.23 port 51050 ssh2',
    'Oct 28 02:15:01 web01 sudo:   deploy : TTY=pts/0 ; PWD=/home/deploy ; USER=root ; COMMAND=/usr/bin/apt install netcat',
    'Oct 28 02:16:44 web01 sshd[2301]: Accepted publickey for alice from 203.0.113.5 port 44002 ssh2',
    'Oct 28 08:02:10 web01 sshd[4120]: Accepted password for bob from 203.0.113.9 port 44510 ssh2',
  ],
  web: [
    '198.51.100.23 - - [28/Oct/2026:02:20:01] "GET /login HTTP/1.1" 200 812',
    '198.51.100.23 - - [28/Oct/2026:02:20:05] "GET /products?id=10 HTTP/1.1" 200 1204',
    "198.51.100.23 - - [28/Oct/2026:02:20:09] \"GET /products?id=10' HTTP/1.1\" 500 540",
    "198.51.100.23 - - [28/Oct/2026:02:20:14] \"GET /products?id=10' OR '1'='1 HTTP/1.1\" 200 9951",
    '198.51.100.23 - - [28/Oct/2026:02:20:20] "GET /products?id=10 UNION SELECT username,password FROM users HTTP/1.1" 200 10420',
    '203.0.113.5 - - [28/Oct/2026:08:05:00] "GET / HTTP/1.1" 200 1532',
    '203.0.113.5 - - [28/Oct/2026:08:05:02] "GET /about HTTP/1.1" 200 980',
    '198.51.100.77 - - [28/Oct/2026:09:11:00] "GET /../../etc/passwd HTTP/1.1" 403 210',
  ]
};
const LOG_QUESTIONS = {
  auth: [
    { q: 'Which source IP is brute-forcing SSH?', check: v => v.trim() === '198.51.100.23', ans: '198.51.100.23', tl: '02:14 — brute-force from 198.51.100.23 (multiple failed logins)' },
    { q: 'Which account did the attacker finally log in as?', check: v => v.trim().toLowerCase() === 'deploy', ans: 'deploy', tl: '02:14:20 — successful login as "deploy" after repeated failures' },
    { q: 'What command did they run with sudo after getting in?', check: v => /apt\s+install\s+netcat/i.test(v), ans: 'apt install netcat', tl: '02:15 — "deploy" uses sudo to install netcat (possible tooling)' },
  ],
  web: [
    { q: 'Which parameter value first triggered a 500 error (the SQLi probe)?', check: v => v.includes("'"), ans: "id=10' (a single quote)", tl: "02:20:09 — single-quote probe on /products?id causes HTTP 500" },
    { q: 'What SQL keyword appears in the data-exfiltration request?', check: v => /union/i.test(v), ans: 'UNION', tl: '02:20:20 — UNION SELECT against users table (data exfiltration attempt)' },
  ]
};
let logTab = 'auth';
function initLogs() {
  const view = byId('logView'); if (!view) return;
  const tabs = document.querySelectorAll('#logs .tab');
  const timelineItems = [];
  function renderView() {
    const filter = byId('logFilter').value.toLowerCase();
    const lines = LOGS[logTab];
    view.innerHTML = lines.map((l, i) => {
      const show = !filter || l.toLowerCase().includes(filter);
      if (!show) return '';
      let html = escapeHTML(l);
      if (filter) html = html.replace(new RegExp('(' + filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<span class="hl">$1</span>');
      return `<div><span class="ln">${pad(i + 1)}</span> ${html}</div>`;
    }).join('') || '<div class="muted">No lines match the filter.</div>';
  }
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); });
    t.classList.add('active'); t.setAttribute('aria-selected', 'true');
    logTab = t.dataset.log; byId('logAgg').hidden = true; renderQuestions(); renderView();
  }));
  byId('logFilter').addEventListener('input', renderView);
  byId('logChips').innerHTML = ['Failed password', 'Accepted', 'sudo', '198.51.100.23', 'UNION', "'"].map(c => `<button class="chip" type="button" data-chip="${escapeHTML(c)}">${escapeHTML(c)}</button>`).join('');
  byId('logChips').querySelectorAll('[data-chip]').forEach(b => b.addEventListener('click', () => { byId('logFilter').value = b.dataset.chip; renderView(); }));
  byId('logCount').addEventListener('click', () => {
    const counts = {};
    LOGS[logTab].forEach(l => { const m = l.match(/(\d+\.\d+\.\d+\.\d+)/); if (m) counts[m[1]] = (counts[m[1]] || 0) + 1; });
    const agg = byId('logAgg'); agg.hidden = false;
    agg.innerHTML = 'Requests by source IP:\n' + Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([ip, c]) => `${ip.padEnd(18)} ${c}`).join('\n');
  });
  function addTimeline(text) {
    if (timelineItems.includes(text)) return;
    timelineItems.push(text);
    const [t, ...rest] = text.split(' — ');
    const tl = byId('logTimeline');
    if (timelineItems.length === 1) tl.innerHTML = '';
    const li = document.createElement('li'); li.innerHTML = `<span class="tt">${escapeHTML(t)}</span>${escapeHTML(rest.join(' — '))}`;
    tl.appendChild(li);
  }
  function renderQuestions() {
    const wrap = byId('logQuestions');
    wrap.innerHTML = LOG_QUESTIONS[logTab].map((q, i) => `<div class="log-q" data-i="${i}">
      <label for="lq_${logTab}_${i}">${escapeHTML(q.q)}</label>
      <div class="q-row"><input class="input" id="lq_${logTab}_${i}" placeholder="Type your answer"><button class="btn btn-primary" type="button" data-ans="${i}">Check</button></div>
      <div class="q-fb"></div></div>`).join('');
    wrap.querySelectorAll('[data-ans]').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.ans; const q = LOG_QUESTIONS[logTab][i];
      const box = b.closest('.log-q'); const val = box.querySelector('input').value;
      const fb = box.querySelector('.q-fb');
      if (q.check(val)) { box.classList.add('solved'); fb.style.color = 'var(--good)'; fb.textContent = '✅ Correct. Added to the timeline.'; addTimeline(q.tl); markCompleted('logs'); }
      else { fb.style.color = 'var(--danger)'; fb.textContent = `❌ Not quite. Hint: look at the highlighted lines. (Expected: ${q.ans})`; }
    }));
  }
  renderQuestions(); renderView();
}

// ---------- 4.6 MFA / TOTP ----------
function base32Decode(s) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  s = s.replace(/=+$/, '').toUpperCase().replace(/\s/g, '');
  let bits = 0, value = 0; const out = [];
  for (const ch of s) { const idx = alphabet.indexOf(ch); if (idx < 0) continue; value = (value << 5) | idx; bits += 5; if (bits >= 8) { bits -= 8; out.push((value >> bits) & 0xff); } }
  return new Uint8Array(out);
}
function base32Encode(bytes) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits = 0, value = 0, out = '';
  for (const b of bytes) { value = (value << 8) | b; bits += 8; while (bits >= 5) { out += alphabet[(value >> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) out += alphabet[(value << (5 - bits)) & 31];
  return out;
}
async function totpAt(secretB32, epochSeconds, step, digits) {
  step = step || 30; digits = digits || 6;
  const key = base32Decode(secretB32);
  if (!key.length) return { code: '------', counter: 0 };
  const counter = Math.floor(epochSeconds / step);
  const msg = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) { msg[i] = c & 0xff; c = Math.floor(c / 256); }
  const ck = await subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const hmac = new Uint8Array(await subtle.sign('HMAC', ck, msg));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3];
  const code = (bin % Math.pow(10, digits)).toString().padStart(digits, '0');
  return { code, counter };
}
function initMFA() {
  const codeEl = byId('totpCode'); if (!codeEl) return;
  if (!subtle) { codeEl.textContent = 'n/a'; byId('totpSteps').textContent = 'Web Crypto API not available.'; return; }
  const step = 30;
  async function tick() {
    const secret = byId('totpSecret').value.trim();
    const now = Date.now() / 1000;
    const { code, counter } = await totpAt(secret, now, step, 6);
    codeEl.textContent = code.replace(/(\d{3})(\d{3})/, '$1 $2');
    const left = step - Math.floor(now % step);
    byId('totpLeft').textContent = left + 's';
    byId('totpBar').style.width = (left / step * 100) + '%';
    byId('totpSteps').textContent = `T0=0, step=${step}s\ncounter = floor(unixtime / ${step}) = ${counter}\nHMAC-SHA1(secret, counter) → dynamic truncation → ${code}`;
    byId('totpUri').textContent = `otpauth://totp/CyberLab:demo@acme-lab.test?secret=${secret}&issuer=CyberLab`;
  }
  tick(); setInterval(tick, 1000);
  byId('totpRandom').addEventListener('click', () => { const r = new Uint8Array(10); crypto.getRandomValues(r); byId('totpSecret').value = base32Encode(r); tick(); });
  byId('totpVerify').addEventListener('click', async () => {
    const secret = byId('totpSecret').value.trim();
    const entered = byId('totpVerifyInput').value.trim();
    const now = Date.now() / 1000;
    let ok = false;
    for (const d of [-1, 0, 1]) { const { code } = await totpAt(secret, now + d * step, step, 6); if (code === entered) ok = true; }
    const r = byId('totpResult'); r.className = 'result show ' + (ok ? 'ok' : 'bad');
    r.textContent = ok ? '✅ Code accepted (within the ±1 step window the server allows for clock drift).' : '❌ Code rejected. It may have expired — enter the current code, or check the secret.';
    if (ok) markCompleted('mfa');
  });

  // factor classifier
  const FACTORS = [
    { name: 'Password / PIN', type: 'know' }, { name: 'TOTP authenticator app', type: 'have' },
    { name: 'FIDO2 security key', type: 'have' }, { name: 'Fingerprint', type: 'are' },
    { name: 'Face recognition', type: 'are' }, { name: 'Security question', type: 'know' },
    { name: 'Geofencing / GPS location', type: 'where' }, { name: 'SMS one-time code', type: 'have' },
  ];
  const TYPES = [['know', 'Something you know'], ['have', 'Something you have'], ['are', 'Something you are'], ['where', 'Somewhere you are']];
  byId('factorList').innerHTML = FACTORS.map((f, i) => `<div class="factor-row" data-i="${i}"><span class="fname">${escapeHTML(f.name)}</span><select class="input" data-f="${i}"><option value="">— choose —</option>${TYPES.map(t => `<option value="${t[0]}">${t[1]}</option>`).join('')}</select><span class="fb"></span></div>`).join('');
  byId('factorCheck').addEventListener('click', () => {
    let c = 0; FACTORS.forEach((f, i) => { const sel = byId('factorList').querySelector(`[data-f="${i}"]`); const row = sel.closest('.factor-row'); const ok = sel.value === f.type; row.classList.toggle('ok', ok); row.classList.toggle('bad', !ok); row.querySelector('.fb').textContent = ok ? '✓' : `→ ${TYPES.find(t => t[0] === f.type)[1]}`; if (ok) c++; });
    const r = byId('factorResult'); r.className = 'result show ' + (c === FACTORS.length ? 'ok' : 'bad'); r.textContent = `${c} / ${FACTORS.length} correct.`;
    if (c === FACTORS.length) markCompleted('mfa');
  });
  const COMBOS = [
    { c: 'Password + TOTP app', mfa: true }, { c: 'Password + security question', mfa: false },
    { c: 'Fingerprint + FIDO2 key', mfa: true }, { c: 'PIN + password', mfa: false },
  ];
  byId('mfaCombos').innerHTML = COMBOS.map((x, i) => `<div class="factor-row" data-c="${i}"><span class="fname">${escapeHTML(x.c)}</span><button class="btn" type="button" data-mfa="${i}" data-v="true">Real MFA</button><button class="btn" type="button" data-mfa="${i}" data-v="false">Not MFA</button><span class="fb"></span></div>`).join('');
  byId('mfaCombos').querySelectorAll('[data-mfa]').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.mfa; const chose = b.dataset.v === 'true'; const x = COMBOS[i];
    const row = b.closest('.factor-row'); const ok = chose === x.mfa;
    row.classList.toggle('ok', ok); row.classList.toggle('bad', !ok);
    row.querySelector('.fb').textContent = ok ? '✓' : (x.mfa ? 'Different factor types → real MFA' : 'Same factor type twice → not true MFA');
    markCompleted('mfa');
  }));
}

// ---------- 4.8 Incident Response ----------
const IR_PHASES = [
  { t: 'Preparation', d: 'Plans, playbooks, tools, training' },
  { t: 'Detection', d: 'Identify a possible incident' },
  { t: 'Analysis', d: 'Validate, scope and triage' },
  { t: 'Containment', d: 'Limit the spread' },
  { t: 'Eradication', d: 'Remove the threat' },
  { t: 'Recovery', d: 'Restore to normal operations' },
  { t: 'Lessons learned', d: 'Post-incident review & improve' },
];
const OV_ORDER = [
  { t: 'CPU registers & cache', d: 'Nanoseconds' },
  { t: 'RAM (memory) & routing/ARP table', d: 'Volatile, lost on power-off' },
  { t: 'Network connections & running processes', d: 'Live state' },
  { t: 'Temporary file systems / swap', d: 'Short-lived' },
  { t: 'Disk (drive) contents', d: 'Persistent' },
  { t: 'Remote logging & backups', d: 'Archived' },
  { t: 'Physical configuration / printouts', d: 'Most stable' },
];
function makeSorter(containerId, items, resultId, key) {
  const ol = byId(containerId); if (!ol) return;
  let order = items.map((_, i) => i);
  function shuffle() { for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } render(); }
  function render() {
    ol.innerHTML = order.map((idx, pos) => `<li draggable="true" data-pos="${pos}"><span class="stext"><strong>${escapeHTML(items[idx].t)}</strong><small>${escapeHTML(items[idx].d)}</small></span>
      <span class="order-btns"><button class="icon-btn" data-mv="up" data-pos="${pos}" type="button" aria-label="Move up">▲</button><button class="icon-btn" data-mv="down" data-pos="${pos}" type="button" aria-label="Move down">▼</button></span></li>`).join('');
    let dragPos = null;
    ol.querySelectorAll('li').forEach(li => {
      li.addEventListener('dragstart', () => { dragPos = +li.dataset.pos; li.classList.add('dragging'); });
      li.addEventListener('dragend', () => { li.classList.remove('dragging'); ol.querySelectorAll('li').forEach(x => x.classList.remove('over')); });
      li.addEventListener('dragover', e => { e.preventDefault(); li.classList.add('over'); });
      li.addEventListener('dragleave', () => li.classList.remove('over'));
      li.addEventListener('drop', e => { e.preventDefault(); const to = +li.dataset.pos; if (dragPos === null || dragPos === to) return; const m = order.splice(dragPos, 1)[0]; order.splice(to, 0, m); render(); });
    });
    ol.querySelectorAll('[data-mv]').forEach(b => b.addEventListener('click', () => { const pos = +b.dataset.pos; const to = b.dataset.mv === 'up' ? pos - 1 : pos + 1; if (to < 0 || to >= order.length) return; [order[pos], order[to]] = [order[to], order[pos]]; render(); }));
  }
  render();
  return {
    check() {
      let ok = true;
      ol.querySelectorAll('li').forEach((li, pos) => { const correct = order[pos] === pos; li.classList.toggle('ok', correct); li.classList.toggle('bad', !correct); if (!correct) ok = false; });
      const r = byId(resultId); r.className = 'result show ' + (ok ? 'ok' : 'bad');
      r.textContent = ok ? '✅ Correct order!' : 'Not yet — green rows are in the right place. Keep adjusting.';
      if (ok) markCompleted(key);
    }, shuffle
  };
}
function initIR() {
  const ir = makeSorter('irSorter', IR_PHASES, 'irResult', 'ir');
  const ov = makeSorter('ovSorter', OV_ORDER, 'ovResult', 'ir');
  if (ir) { byId('irCheck').addEventListener('click', ir.check); byId('irShuffle').addEventListener('click', ir.shuffle); }
  if (ov) { byId('ovCheck').addEventListener('click', ov.check); byId('ovShuffle').addEventListener('click', ov.shuffle); }
}

// ---------- 5.2 Risk ----------
function initRisk() {
  const out = byId('rkOut'); if (!out) return;
  function money(n) { return 'SGD ' + Math.round(n).toLocaleString('en-SG'); }
  function recompute() {
    const av = +byId('rkAv').value, ef = +byId('rkEf').value / 100, aro = +byId('rkAro').value, aro2 = +byId('rkAro2').value, cost = +byId('rkCost').value;
    const sle = av * ef, ale = sle * aro, ale2 = sle * aro2, benefit = (ale - ale2) - cost;
    out.innerHTML = `
      <div class="stat-card"><div class="stat-label">SLE = AV × EF</div><div class="stat-value">${money(sle)}</div></div>
      <div class="stat-card"><div class="stat-label">ALE = SLE × ARO</div><div class="stat-value">${money(ale)}</div></div>
      <div class="stat-card"><div class="stat-label">ALE after control</div><div class="stat-value">${money(ale2)}</div></div>
      <div class="stat-card"><div class="stat-label">Net benefit / year</div><div class="stat-value" style="color:${benefit >= 0 ? 'var(--good)' : 'var(--danger)'}">${money(benefit)}</div></div>`;
    markCompleted('risk');
  }
  ['rkAv', 'rkEf', 'rkAro', 'rkAro2', 'rkCost'].forEach(id => byId(id).addEventListener('input', recompute));
  recompute();

  const RISKS = [
    { r: 'Ransomware encrypts file servers', l: 3, i: 5, treat: 'Mitigate (immutable backups, EDR)' },
    { r: 'Laptop with client data lost', l: 4, i: 3, treat: 'Mitigate (disk encryption)' },
    { r: 'Cloud bucket misconfiguration', l: 3, i: 4, treat: 'Mitigate (CSPM, least privilege)' },
    { r: 'Office power outage', l: 2, i: 2, treat: 'Transfer/Accept (UPS, insurance)' },
    { r: 'Key supplier goes bankrupt', l: 2, i: 4, treat: 'Transfer (second source, contract)' },
  ];
  document.querySelector('#rrTable tbody').innerHTML = RISKS.map((x, i) => `<tr data-r="${i}"><td>${escapeHTML(x.r)}</td><td>${x.l}</td><td>${x.i}</td><td><strong>${x.l * x.i}</strong></td><td>${escapeHTML(x.treat)}</td></tr>`).join('');
  // heatmap
  const hm = byId('heatmap');
  let html = '';
  for (let l = 5; l >= 1; l--) {
    html += `<div class="hlabel">${l}</div>`;
    for (let imp = 1; imp <= 5; imp++) {
      const score = l * imp;
      const cls = score >= 15 ? 'h-crit' : score >= 10 ? 'h-high' : score >= 5 ? 'h-med' : 'h-low';
      const marks = RISKS.map((x, i) => (x.l === l && x.i === imp) ? `<span class="hmark" title="${escapeHTML(x.r)}">${i + 1}</span>` : '').join('');
      html += `<div class="hcell ${cls}" data-l="${l}" data-i="${imp}"><span class="sc">${score}</span>${marks}</div>`;
    }
  }
  html += `<div class="hlabel"></div>` + [1, 2, 3, 4, 5].map(imp => `<div class="hlabel">${imp}</div>`).join('');
  hm.innerHTML = html;
  document.querySelectorAll('#rrTable tbody tr').forEach(tr => tr.addEventListener('click', () => {
    const x = RISKS[+tr.dataset.r];
    const r = byId('rrResult'); r.className = 'result show ' + (x.l * x.i >= 15 ? 'bad' : 'ok');
    r.innerHTML = `<strong>${escapeHTML(x.r)}</strong>: likelihood ${x.l} × impact ${x.i} = <strong>${x.l * x.i}</strong>. Treatment: ${escapeHTML(x.treat)}. ${x.l * x.i >= 15 ? 'Above risk appetite — must not simply be accepted.' : 'Within tolerance with the stated treatment.'}`;
    markCompleted('risk');
  }));
}

// ---------- 5.5 Recon ----------
function initRecon() {
  const hs = byId('handshake'); if (!hs) return;
  const tabs = document.querySelectorAll('#recon .tab');
  function renderHS(kind) {
    if (kind === 'syn') {
      hs.innerHTML = `<div class="hs-head">Scanner</div><div class="hs-head">Packets</div><div class="hs-head">Target</div>
        <div></div><div class="hs-msg r">SYN →</div><div></div>
        <div></div><div class="hs-msg l">← SYN/ACK</div><div></div>
        <div></div><div class="hs-msg r">RST → (abort)</div><div></div>
        <div class="hs-note">SYN (half-open) scan never completes the handshake — it sends RST after SYN/ACK. Faster and historically "stealthier", since the full connection is never established or logged by the app.</div>`;
    } else {
      hs.innerHTML = `<div class="hs-head">Scanner</div><div class="hs-head">Packets</div><div class="hs-head">Target</div>
        <div></div><div class="hs-msg r">SYN →</div><div></div>
        <div></div><div class="hs-msg l">← SYN/ACK</div><div></div>
        <div></div><div class="hs-msg r">ACK → (established)</div><div></div>
        <div class="hs-note">TCP connect scan finishes the three-way handshake (SYN, SYN/ACK, ACK). Needs no special privileges but is more likely to be logged by the target application.</div>`;
    }
  }
  tabs.forEach(t => t.addEventListener('click', () => { tabs.forEach(x => { x.classList.remove('active'); x.setAttribute('aria-selected', 'false'); }); t.classList.add('active'); t.setAttribute('aria-selected', 'true'); renderHS(t.dataset.scan); markCompleted('recon'); }));
  renderHS('syn');

  const PORTS = [
    { port: 22, state: 'open', svc: 'SSH', ver: 'OpenSSH 7.4', risk: 'medium', note: 'Remote admin. Risk is moderate if password auth is allowed or the version is old. Harden: keys only, no root login, Fail2ban (Lab 35).' },
    { port: 23, state: 'open', svc: 'Telnet', ver: 'Linux telnetd', risk: 'high', note: 'Cleartext remote login — credentials travel unencrypted. Should be disabled entirely and replaced by SSH.' },
    { port: 80, state: 'open', svc: 'HTTP', ver: 'Apache 2.4.29', risk: 'medium', note: 'Unencrypted web. Redirect to HTTPS and patch the server version (banner reveals it is outdated).' },
    { port: 443, state: 'open', svc: 'HTTPS', ver: 'Apache 2.4.29 (TLS 1.2)', risk: 'low', note: 'Encrypted web — expected on a web host. Check certificate and disable weak ciphers / old TLS (Lab 25).' },
    { port: 3306, state: 'open', svc: 'MySQL', ver: 'MySQL 5.7', risk: 'high', note: 'A database exposed to the network is dangerous. Bind to localhost or restrict by firewall/segmentation (Lab 19-20).' },
    { port: 445, state: 'filtered', svc: 'SMB', ver: '—', risk: 'low', note: 'Filtered = a firewall is dropping probes; the scanner cannot tell if it is open. Good that it is not openly exposed.' },
  ];
  const riskPill = r => `<span class="sev-pill ${r === 'high' ? 'sev-high' : r === 'medium' ? 'sev-medium' : 'sev-low'}">${r}</span>`;
  const tbody = document.querySelector('#reconTable tbody');
  tbody.innerHTML = PORTS.map((p, i) => `<tr data-p="${i}"><td>${p.port}/tcp</td><td>${p.state}</td><td>${escapeHTML(p.svc)}</td><td class="mono small">${escapeHTML(p.ver)}</td><td>${riskPill(p.risk)}</td></tr>`).join('');
  tbody.querySelectorAll('tr').forEach(tr => tr.addEventListener('click', () => {
    tbody.querySelectorAll('tr').forEach(x => x.classList.remove('sel')); tr.classList.add('sel');
    const p = PORTS[+tr.dataset.p];
    byId('reconDetail').innerHTML = `<p><strong>${p.port}/tcp — ${escapeHTML(p.svc)}</strong> ${riskPill(p.risk)}</p><p class="small">${escapeHTML(p.note)}</p>`;
    markCompleted('recon');
  }));

  const PVA = [
    { a: 'Reading a company\'s public LinkedIn staff list', passive: true },
    { a: 'Running nmap -sS against the target', passive: false },
    { a: 'Looking up WHOIS and DNS records', passive: true },
    { a: 'Querying crt.sh for issued certificates', passive: true },
    { a: 'Banner-grabbing a live service', passive: false },
    { a: 'Browsing cached pages on a search engine', passive: true },
  ];
  byId('pvaList').innerHTML = PVA.map((x, i) => `<div class="factor-row" data-i="${i}"><span class="fname">${escapeHTML(x.a)}</span><select class="input" data-p="${i}"><option value="">—</option><option value="passive">Passive</option><option value="active">Active</option></select><span class="fb"></span></div>`).join('');
  byId('pvaCheck').addEventListener('click', () => {
    let c = 0; PVA.forEach((x, i) => { const sel = byId('pvaList').querySelector(`[data-p="${i}"]`); const row = sel.closest('.factor-row'); const ok = sel.value === (x.passive ? 'passive' : 'active'); row.classList.toggle('ok', ok); row.classList.toggle('bad', !ok); row.querySelector('.fb').textContent = ok ? '✓' : (x.passive ? '→ Passive' : '→ Active'); if (ok) c++; });
    const r = byId('pvaResult'); r.className = 'result show ' + (c === PVA.length ? 'ok' : 'bad'); r.textContent = `${c} / ${PVA.length} correct. Passive recon never touches the target; active recon interacts with it.`;
    if (c === PVA.length) markCompleted('recon');
  });
}

// ---------- Mini-quiz handling (per topic) ----------
document.querySelectorAll('.quiz-options[data-quiz]').forEach(group => {
  const correctIdx = parseInt(group.dataset.answer, 10);
  group.querySelectorAll('.quiz-opt').forEach(opt => opt.addEventListener('click', () => {
    const i = parseInt(opt.dataset.i, 10);
    group.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('correct', 'wrong'));
    if (i === correctIdx) opt.classList.add('correct');
    else { opt.classList.add('wrong'); group.querySelectorAll('.quiz-opt')[correctIdx].classList.add('correct'); }
    state.miniQuiz[group.dataset.quiz] = (i === correctIdx); saveState();
  }));
});

// ---------- Final Quiz ----------
const finalQuiz = [
  { d: 1, q: 'A "Beware of dog" sign at a fence is best categorised as which control type?', opts: ['Preventive', 'Deterrent', 'Corrective', 'Compensating'], a: 1 },
  { d: 1, q: 'Which goal of the CIA triad is primarily protected by hashing a downloaded file and comparing the digest?', opts: ['Confidentiality', 'Integrity', 'Availability', 'Non-repudiation'], a: 1 },
  { d: 1, q: 'In a Zero Trust architecture, which component makes the allow/deny decision?', opts: ['Policy Enforcement Point', 'Policy Decision Point', 'Certificate Authority', 'Load balancer'], a: 1 },
  { d: 1, q: 'Why is a unique salt added before hashing each stored password?', opts: ['To encrypt the password', 'So identical passwords produce different hashes, defeating rainbow tables', 'To shorten the hash', 'To enable password recovery'], a: 1 },
  { d: 2, q: 'A stealthy, well-funded group steals research over many months without detection. The most likely threat actor is:', opts: ['Unskilled attacker', 'Hacktivist', 'Nation-state (APT)', 'Shadow IT'], a: 2 },
  { d: 2, q: 'A login form builds SQL by concatenating user input directly. The strongest fix is:', opts: ['Hide the login URL', 'Use parameterized queries / prepared statements', 'Rename the tables', 'Disable cookies'], a: 1 },
  { d: 2, q: 'The most reliable way to stop reflected and stored XSS is to:', opts: ['Block all JavaScript', 'Context-aware output encoding plus input validation', 'Use longer passwords', 'Disable HTTPS'], a: 1 },
  { d: 2, q: 'An attacker emails the finance clerk posing as the CEO, demanding urgent gift-card purchases. This is:', opts: ['Business Email Compromise', 'Watering hole', 'SQL injection', 'Tailgating'], a: 0 },
  { d: 2, q: 'Which is the best defence against ransomware?', opts: ['Pay quickly', 'Tested, offline/immutable backups', 'More antivirus products at once', 'Hide the files'], a: 1 },
  { d: 3, q: 'A firewall evaluates its rule list and applies the:', opts: ['Lowest-risk rule', 'First rule that matches, then implicit deny', 'Last rule in the list', 'Rule with the widest scope'], a: 1 },
  { d: 3, q: 'Tokenisation of credit-card numbers primarily helps an organisation by:', opts: ['Making cards unreadable to the cardholder', 'Reducing systems in scope for PCI DSS by removing real card data', 'Encrypting the whole database', 'Speeding up checkout'], a: 1 },
  { d: 3, q: 'Which statement about RAID is correct?', opts: ['RAID 5 survives two simultaneous disk failures', 'RAID is a replacement for backups', 'RAID 1 mirrors data and survives a single disk failure', 'RAID 0 has the best fault tolerance'], a: 2 },
  { d: 3, q: 'In the 3-2-1 backup rule, the "1" refers to:', opts: ['One backup per year', 'One off-site copy', 'One media type', 'One administrator'], a: 1 },
  { d: 4, q: 'A CVSS v3.1 base score of 9.8 falls into which severity band?', opts: ['Low', 'Medium', 'High', 'Critical'], a: 3 },
  { d: 4, q: 'Auth logs show many failures then one success from a single IP. This pattern indicates:', opts: ['A successful brute-force / password attack', 'Normal user behaviour', 'A DNS misconfiguration', 'A backup job'], a: 0 },
  { d: 4, q: 'A TOTP code is derived from:', opts: ['The user\'s fingerprint', 'A shared secret and the current time', 'The device IP address', 'The password hash'], a: 1 },
  { d: 4, q: 'Which correctly orders two early incident-response phases?', opts: ['Recovery before Containment', 'Detection before Analysis', 'Eradication before Detection', 'Lessons learned before Preparation'], a: 1 },
  { d: 4, q: 'Following the order of volatility, which evidence should be collected first?', opts: ['Disk image', 'Contents of RAM', 'Backup tapes', 'Printed documents'], a: 1 },
  { d: 5, q: 'Given AV = SGD 200,000, EF = 40% and ARO = 0.5, the ALE is:', opts: ['SGD 40,000', 'SGD 80,000', 'SGD 100,000', 'SGD 400,000'], a: 0 },
  { d: 5, q: 'Reading a target\'s public DNS and WHOIS records without touching its systems is an example of:', opts: ['Active reconnaissance', 'Passive reconnaissance', 'Exploitation', 'Privilege escalation'], a: 1 },
];
const quizContainer = byId('quizContainer');
const certificateCard = byId('certificateCard');
function renderFinalQuiz() {
  certificateCard.classList.add('hidden');
  quizContainer.classList.remove('hidden');
  quizContainer.innerHTML = `
    <h3>Answer all ${finalQuiz.length} questions (spread across the five domains):</h3>
    ${finalQuiz.map((q, qi) => `<div class="quiz-card" style="margin-top:1rem;">
      <p><strong>Q${qi + 1}.</strong> <span class="domain-tag" style="color:${DOMAINS[q.d - 1].color}">D${q.d}</span> ${escapeHTML(q.q)}</p>
      <div class="quiz-options" data-q="${qi}">${q.opts.map((o, oi) => `<button class="quiz-opt" type="button" data-i="${oi}">${escapeHTML(o)}</button>`).join('')}</div>
    </div>`).join('')}
    <div style="margin-top:1.25rem; display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
      <button class="btn btn-primary" id="submitFinal" type="button">Submit Quiz</button>
      <label class="sr-only" for="learnerName">Your name for the certificate</label>
      <input class="input" id="learnerName" placeholder="Your name (for certificate)" style="max-width:280px; margin-top:0;" />
    </div>
    <div class="result" id="finalResult" role="status"></div>`;
  const answers = {};
  quizContainer.querySelectorAll('.quiz-options').forEach(group => {
    group.querySelectorAll('.quiz-opt').forEach(opt => opt.addEventListener('click', () => {
      group.querySelectorAll('.quiz-opt').forEach(o => (o.style.borderColor = ''));
      opt.style.borderColor = 'var(--primary)';
      answers[group.dataset.q] = parseInt(opt.dataset.i, 10);
    }));
  });
  byId('submitFinal').addEventListener('click', () => {
    let score = 0;
    quizContainer.querySelectorAll('.quiz-options').forEach(group => {
      const qi = parseInt(group.dataset.q, 10), correct = finalQuiz[qi].a, chosen = answers[qi];
      group.querySelectorAll('.quiz-opt').forEach((o, i) => { if (i === correct) o.classList.add('correct'); if (chosen === i && chosen !== correct) o.classList.add('wrong'); });
      if (chosen === correct) score++;
    });
    const total = finalQuiz.length;
    state.finalScore = score; state.finalTotal = total; saveState(); refreshDashboard();
    const r = byId('finalResult'); r.className = 'result show ' + (score >= total * 0.7 ? 'ok' : 'bad');
    r.innerHTML = `You scored <strong>${score} / ${total}</strong> (${Math.round(score / total * 100)}%). ${score >= total * 0.7 ? '🎉 Pass — certificate unlocked below!' : 'Below 70% — review the domains and try again.'}`;
    if (score >= total * 0.7) {
      const name = (byId('learnerName').value || 'Security+ Learner').trim();
      byId('certName').textContent = name || 'Security+ Learner';
      byId('certScore').textContent = score; byId('certTotal').textContent = total;
      byId('certDate').textContent = 'Awarded ' + new Date().toLocaleDateString();
      certificateCard.classList.remove('hidden'); certificateCard.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
renderFinalQuiz();
byId('retryQuiz').addEventListener('click', () => { state.finalScore = null; state.finalTotal = null; saveState(); refreshDashboard(); renderFinalQuiz(); });
byId('printCert').addEventListener('click', () => window.print());

// ---------- Init ----------
buildNav();
injectModuleMeta();
buildLabSelect();
buildLabMap();
openLab(1, true);
refreshDashboard();
initControls();
initZeroTrust();
initCrypto();
initActors();
initFirewall();
initDLP();
initResilience();
initCVSS();
initLogs();
initMFA();
initIR();
initRisk();
initRecon();
goTo('dashboard', { noScroll: true });
