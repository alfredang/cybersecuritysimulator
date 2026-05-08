/* =========================================================
   Cybersecurity Threat Simulation Lab
   Pure HTML/CSS/JS — no backend, no real attack code.
   ========================================================= */

// ---------- State ----------
const STORAGE_KEY = 'cyberlab_state_v1';
const state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { explored: {}, miniQuiz: {}, finalScore: null, finalTotal: null };
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- Threat data ----------
const threats = [
  { id: 'phishing', icon: '📧', name: 'Phishing', risk: 'high', desc: 'Fake emails tricking users into revealing info.' },
  { id: 'xss', icon: '💻', name: 'XSS', risk: 'high', desc: 'Injected scripts running in the browser.' },
  { id: 'sqli', icon: '🔒', name: 'SQL Injection', risk: 'critical', desc: 'Manipulated queries that bypass logic.' },
  { id: 'password', icon: '🔑', name: 'Password Lab', risk: 'medium', desc: 'Test password strength conceptually.' },
  { id: 'malware', icon: '🦠', name: 'Malware', risk: 'high', desc: 'Software designed to harm or exploit.' },
  { id: 'virus', icon: '🦠', name: 'Virus', risk: 'high', desc: 'Self-propagating malicious code.' },
  { id: 'ransomware', icon: '🚫', name: 'Ransomware', risk: 'critical', desc: 'Encrypts files and demands payment.' },
  { id: 'social', icon: '🤵', name: 'Social Engineering', risk: 'high', desc: 'Manipulating people, not machines.' },
  { id: 'weakpass', icon: '⚠️', name: 'Weak Passwords', risk: 'medium', desc: 'Predictable passwords are easily cracked.' },
  { id: 'leakage', icon: '💬', name: 'Data Leakage', risk: 'high', desc: 'Unauthorized exposure of sensitive data.' },
];

// ---------- Navigation ----------
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.section');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');

menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

navItems.forEach(btn => {
  btn.addEventListener('click', () => goTo(btn.dataset.section));
});

function goTo(id) {
  sections.forEach(s => s.classList.toggle('active', s.id === id));
  navItems.forEach(b => b.classList.toggle('active', b.dataset.section === id));
  sidebar.classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id !== 'dashboard' && id !== 'quiz') {
    state.explored[id] = true;
    saveState();
    refreshDashboard();
  }
}

// ---------- Theme ----------
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('cyberlab_theme') || 'dark';
document.body.dataset.theme = savedTheme;
themeToggle.addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('cyberlab_theme', next);
});

// ---------- Dashboard ----------
function refreshDashboard() {
  const grid = document.getElementById('threatGrid');
  grid.innerHTML = threats.map(t => `
    <div class="threat-card" data-go="${t.id}">
      <div class="icon">${t.icon}</div>
      <h4>${t.name}</h4>
      <p>${t.desc}</p>
      <div style="margin-top:0.6rem;"><span class="risk-badge risk-${t.risk}">${t.risk}</span></div>
    </div>
  `).join('');
  grid.querySelectorAll('.threat-card').forEach(c =>
    c.addEventListener('click', () => goTo(c.dataset.go))
  );

  const exploredCount = Object.keys(state.explored).length;
  document.getElementById('exploredCount').textContent = exploredCount;
  document.getElementById('exploredBar').style.width = Math.min(100, (exploredCount / 10) * 100) + '%';

  if (state.finalScore != null) {
    document.getElementById('quizScoreStat').textContent = `${state.finalScore}/${state.finalTotal}`;
    document.getElementById('quizScoreBar').style.width = (state.finalScore / state.finalTotal) * 100 + '%';
  }
}
refreshDashboard();

// ---------- Phishing ----------
const emails = [
  // Banking / Finance
  { category: 'bank', isPhish: true,
    from: 'support@paypa1-secure.com',
    subject: 'URGENT: Your account will be suspended in 24h!',
    body: `Dear Customer,

We detected unusual activity. Verify your identity immediately or your account will be permanently closed.

Click here: http://paypa1-secure.com/verify-now

Thank you,
PayPaI Support Team`,
    suspicious: ['paypa1-secure.com', 'URGENT', 'permanently closed', 'verify-now', 'PayPaI', 'Dear Customer']
  },
  { category: 'bank', isPhish: true,
    from: 'alerts@chase-bank-secure.us',
    subject: 'Wire transfer of $2,840.00 pending approval',
    body: `Dear Account Holder,

A wire transfer of $2,840.00 to RECIPIENT-XJ12 is pending. If you did NOT authorize this, cancel immediately:

http://chase-bank-secure.us/cancel?id=8821

Failure to act will result in funds being released within 30 minutes.

Chase Banking Team`,
    suspicious: ['chase-bank-secure.us', 'pending approval', 'Dear Account Holder', '30 minutes', 'Failure to act']
  },
  { category: 'bank', isPhish: false,
    from: 'statements@chase.com',
    subject: 'Your monthly statement is ready',
    body: `Hi Alex,

Your March statement is now available. Sign in to chase.com to view it.

We'll never ask for your password by email.

— Chase`,
    suspicious: []
  },

  // Tech / Account
  { category: 'tech', isPhish: false,
    from: 'no-reply@github.com',
    subject: 'New sign-in to your GitHub account',
    body: `Hi alex,

We noticed a new sign-in from Chrome on macOS.
If this was you, you can ignore this message.

If it wasn't you, please review your security settings at github.com/settings/security.

Thanks,
GitHub Security`,
    suspicious: []
  },
  { category: 'tech', isPhish: true,
    from: 'it-helpdesk@m1crosoft-support.com',
    subject: 'Your password expires today',
    body: `Hello user,

Your password expires today. Reset now to avoid lockout.

Reset link: http://m1crosoft-support.com/reset

IT Helpdesk`,
    suspicious: ['m1crosoft-support.com', 'expires today', 'avoid lockout', 'Hello user']
  },
  { category: 'tech', isPhish: true,
    from: 'security@app1e-id.support',
    subject: 'Your Apple ID has been locked',
    body: `Dear Customer,

Due to suspicious activity, your Apple ID has been locked. Unlock now:

http://app1e-id.support/unlock

Failure to verify within 12 hours will result in permanent deletion of your iCloud data.

Apple Support`,
    suspicious: ['app1e-id.support', 'Dear Customer', 'permanent deletion', '12 hours']
  },
  { category: 'tech', isPhish: false,
    from: 'security@google.com',
    subject: 'Security alert: review recent activity',
    body: `Hi,

We saw a new sign-in from a Pixel 8 in San Francisco.

If this wasn't you, secure your account at myaccount.google.com.

Google`,
    suspicious: []
  },

  // Workplace / HR
  { category: 'work', isPhish: true,
    from: 'hr-department@yourc0mpany.co',
    subject: 'Salary Revision Notice — Open Attachment',
    body: `Hello,

Please review the attached salary revision document.
Open immediately: salary_2026.exe

HR Department`,
    suspicious: ['yourc0mpany.co', 'salary_2026.exe', 'Open immediately']
  },
  { category: 'work', isPhish: true,
    from: 'ceo@y0urcompany-corp.com',
    subject: 'Quick favor — need this done now',
    body: `Hey,

I'm in a meeting and can't talk. Please buy 5x $200 Amazon gift cards and send the codes to me ASAP. I'll reimburse you later.

Don't tell anyone — it's a surprise for the team.

Thanks,
The CEO`,
    suspicious: ['y0urcompany-corp.com', 'gift cards', 'ASAP', "Don't tell anyone", 'I\'ll reimburse you later']
  },
  { category: 'work', isPhish: false,
    from: 'noreply@slack.com',
    subject: 'You were added to #general',
    body: `Hi,

You've been added to the #general channel in your workspace.

Open Slack to start collaborating.

— Slack`,
    suspicious: []
  },

  // Delivery / Shopping
  { category: 'delivery', isPhish: true,
    from: 'tracking@dhl-redelivery.info',
    subject: 'Package delivery failed — pay $1.99 redelivery fee',
    body: `Dear Customer,

Your package could not be delivered due to an unpaid customs fee of $1.99.

Pay now to release the package: http://dhl-redelivery.info/pay

Otherwise, the package will be returned to sender within 24 hours.`,
    suspicious: ['dhl-redelivery.info', 'Dear Customer', '$1.99', 'returned to sender', '24 hours']
  },
  { category: 'delivery', isPhish: true,
    from: 'orders@amaz0n-shipment.co',
    subject: 'Re: Order #842-A confirmation',
    body: `Hello,

Thank you for your order of an iPhone 15 Pro Max ($1,299).

If you did NOT place this order, click here to cancel: http://amaz0n-shipment.co/cancel-order

This action will refund your card immediately.`,
    suspicious: ['amaz0n-shipment.co', 'cancel-order', 'iPhone 15 Pro Max', 'did NOT place this order']
  },
  { category: 'delivery', isPhish: false,
    from: 'shipment-tracking@amazon.com',
    subject: 'Your package has shipped',
    body: `Hi Alex,

Your order of "Mechanical Keyboard" has shipped and is expected to arrive Friday.

Track at amazon.com/orders.

— Amazon`,
    suspicious: []
  },

  // Social Media
  { category: 'social', isPhish: true,
    from: 'security@faceb00k-login.help',
    subject: 'Someone tried to log into your account',
    body: `Hi,

We noticed a sign-in attempt from Russia. Was this you?

If not, secure your account: http://faceb00k-login.help/secure

You have 1 hour to respond before your account is disabled.`,
    suspicious: ['faceb00k-login.help', '1 hour', 'disabled', 'sign-in attempt from Russia']
  },
  { category: 'social', isPhish: true,
    from: 'instagram-verify@meta-support.tk',
    subject: 'Your application for the blue verification badge',
    body: `Dear Creator,

Congratulations! Your account is eligible for the verification badge.

Confirm your identity to receive your badge: http://meta-support.tk/verify

You must respond within 48 hours or your application will be cancelled.`,
    suspicious: ['meta-support.tk', 'Dear Creator', '48 hours', 'verification badge', 'Congratulations']
  },
  { category: 'social', isPhish: false,
    from: 'no-reply@linkedin.com',
    subject: 'You appeared in 7 searches this week',
    body: `Hi Alex,

You appeared in 7 searches this week. See who's interested at linkedin.com.

— LinkedIn`,
    suspicious: []
  },

  // Lottery / Reward
  { category: 'reward', isPhish: true,
    from: 'winner@global-lottery-2026.org',
    subject: 'CONGRATULATIONS!!! You won $850,000 USD',
    body: `Dear Lucky Winner,

Your email was randomly selected in our annual draw. You have won $850,000 USD.

To claim, send your full name, address, phone, and a copy of your ID to: claims@global-lottery-2026.org

A processing fee of $250 is required before disbursement.`,
    suspicious: ['global-lottery-2026.org', 'CONGRATULATIONS!!!', '$850,000', 'processing fee', 'copy of your ID', 'Dear Lucky Winner']
  },
  { category: 'reward', isPhish: true,
    from: 'rewards@netfl1x-promo.shop',
    subject: 'Free 12-month Netflix subscription — claim now',
    body: `Hello valued user,

You've been selected for a FREE 12-month Netflix Premium subscription!

Claim within 2 hours: http://netfl1x-promo.shop/claim

Just confirm your card details to activate (no charge).`,
    suspicious: ['netfl1x-promo.shop', 'Hello valued user', '2 hours', 'card details', 'FREE 12-month']
  },
  { category: 'reward', isPhish: false,
    from: 'newsletter@medium.com',
    subject: 'Top stories this week in technology',
    body: `Hi reader,

Here are the most popular tech articles this week.

— The Medium Team`,
    suspicious: []
  },
];

let emailIdx = 0;
let emailFiltered = emails.slice();
const emailCategorySel = document.getElementById('emailCategory');
const phishCounter = document.getElementById('phishCounter');

emailCategorySel.addEventListener('change', () => {
  const cat = emailCategorySel.value;
  emailFiltered = cat === 'all' ? emails.slice() : emails.filter(e => e.category === cat);
  emailIdx = 0;
  renderEmail();
});

function renderEmail() {
  if (!emailFiltered.length) {
    document.getElementById('emailMock').innerHTML = '<p class="muted">No emails in this category.</p>';
    phishCounter.textContent = '';
    return;
  }
  const e = emailFiltered[emailIdx];
  let body = e.body;
  e.suspicious.forEach(s => {
    body = body.replaceAll(s, `<span class="suspicious">${s}</span>`);
  });
  let from = e.from;
  e.suspicious.forEach(s => {
    if (e.from.includes(s)) from = e.from.replaceAll(s, `<span class="suspicious">${s}</span>`);
  });
  document.getElementById('emailMock').innerHTML = `
    <div class="from">From: ${from}</div>
    <div class="subject">${escapeHTML(e.subject)}</div>
    <div class="body">${body}</div>
  `;
  phishCounter.textContent = `${emailIdx + 1} / ${emailFiltered.length}`;
  document.getElementById('phishResult').classList.remove('show', 'ok', 'bad');
  document.getElementById('phishResult').textContent = '';
}
document.querySelectorAll('[data-phish-answer]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!emailFiltered.length) return;
    const ans = btn.dataset.phishAnswer;
    const e = emailFiltered[emailIdx];
    const correct = (ans === 'phish' && e.isPhish) || (ans === 'safe' && !e.isPhish);
    const r = document.getElementById('phishResult');
    r.classList.add('show', correct ? 'ok' : 'bad');
    r.textContent = correct
      ? (e.isPhish ? '✅ Correct — this was phishing. Notice the highlighted red flags.' : '✅ Correct — this email is legitimate.')
      : (e.isPhish ? '❌ Incorrect — this was actually phishing. Look at the highlighted suspicious parts.' : '❌ Incorrect — this email was legitimate.');
  });
});
document.getElementById('nextEmail').addEventListener('click', () => {
  if (!emailFiltered.length) return;
  emailIdx = (emailIdx + 1) % emailFiltered.length;
  renderEmail();
});
renderEmail();

// ---------- Phishing: Annotated Walkthrough ----------
const walkthroughEmail = {
  from: 'security-alert@app1e-id-verify.support',
  subject: 'URGENT: Your Apple ID has been compromised',
  body: `Dear Customer,

We have detected unusual sign-in activity on your Apple ID from an unrecognized device in Lagos, Nigeria.

To prevent permanent account suspension, please verify your identity within 6 hours by clicking the link below:

http://app1e-id-verify.support/login.php?ref=urgent

Failure to verify will result in deletion of all iCloud data, photos, and contacts.

Sincerely,
Apple Security Team`,
  steps: [
    { headline: 'Look at the sender domain',
      highlight: 'app1e-id-verify.support',
      explain: "Apple's real domain is apple.com. Here, 'app1e' uses a digit '1' to mimic the letter 'l', and the TLD is .support — a generic TLD often abused. Always inspect the part right before the final TLD." },
    { headline: 'Notice the generic greeting',
      highlight: 'Dear Customer',
      explain: "Real services that have your account usually address you by name. Generic greetings like 'Dear Customer' or 'Hello user' are a red flag — the sender doesn't actually know who you are." },
    { headline: 'Spot the urgency / fear language',
      highlight: 'URGENT',
      explain: "Phishing relies on emotional pressure: urgency, fear of loss, or fake deadlines. The goal is to make you act before you think. A legitimate company will never give you 6 hours to avoid 'permanent deletion'." },
    { headline: 'Inspect the suspicious link',
      highlight: 'http://app1e-id-verify.support/login.php?ref=urgent',
      explain: "It's HTTP (not HTTPS), uses a lookalike domain, and points to a generic /login.php — typical of credential-harvesting kits. Hover before clicking; if the visible text and the actual URL differ, that's a phishing tell." },
    { headline: 'The threat is exaggerated',
      highlight: 'deletion of all iCloud data',
      explain: "No real provider deletes your photos for missing an email. Threats this drastic exist to override your judgment. When in doubt, log in directly to the official site — never via the email link." },
    { headline: 'Verdict: phishing — what to do',
      highlight: null,
      explain: "Do NOT click. Do NOT reply. Forward to your IT team or report as phishing in your mail client, then delete. If you're unsure whether your account is OK, sign in directly via apple.com (typed manually) and check." },
  ]
};

let walkStep = 0;
const walkEl = document.getElementById('walkthrough');
const walkProgressFill = document.getElementById('walkProgressFill');

function renderWalkthrough() {
  const s = walkthroughEmail.steps[walkStep];
  let body = walkthroughEmail.body;
  let from = walkthroughEmail.from;
  let subject = walkthroughEmail.subject;

  // Highlight clues from the current step and all prior steps (cumulative).
  for (let i = 0; i <= walkStep; i++) {
    const clue = walkthroughEmail.steps[i].highlight;
    if (!clue) continue;
    const wrap = `<span class="clue-highlight">${clue}</span>`;
    body = body.split(clue).join(wrap);
    from = from.split(clue).join(wrap);
    subject = subject.split(clue).join(wrap);
  }

  walkEl.innerHTML = `
    <div class="step-label">Clue ${walkStep + 1} of ${walkthroughEmail.steps.length}</div>
    <div class="step-headline">${escapeHTML(s.headline)}</div>
    <div class="email-mock" style="margin:0.5rem 0;">
      <div class="from">From: ${from}</div>
      <div class="subject">${subject}</div>
      <div class="body">${body}</div>
    </div>
    <div class="step-explain">${s.explain}</div>
  `;
  walkProgressFill.style.width = (((walkStep + 1) / walkthroughEmail.steps.length) * 100) + '%';
}
document.getElementById('walkNext').addEventListener('click', () => {
  walkStep = Math.min(walkthroughEmail.steps.length - 1, walkStep + 1);
  renderWalkthrough();
});
document.getElementById('walkPrev').addEventListener('click', () => {
  walkStep = Math.max(0, walkStep - 1);
  renderWalkthrough();
});
document.getElementById('walkRestart').addEventListener('click', () => {
  walkStep = 0;
  renderWalkthrough();
});
renderWalkthrough();

// ---------- Phishing: URL Inspector ----------
const KNOWN_BRANDS = ['paypal','apple','google','microsoft','amazon','facebook','meta','instagram','netflix','chase','dhl','fedex','ups','linkedin','github','dropbox','adobe','spotify'];
const SHORTENERS = ['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','buff.ly','cutt.ly','rb.gy','rebrand.ly'];
const SUSPICIOUS_TLDS = ['.tk','.ml','.ga','.cf','.gq','.zip','.mov','.country','.support','.help','.shop','.info','.click','.work','.top'];

function analyzeURL(raw) {
  const checks = [];
  let url;
  try { url = new URL(raw); }
  catch (e) {
    return { score: 100, summary: 'bad', summaryText: 'Could not parse this URL — that itself is suspicious.', checks: [
      { kind: 'fail', icon: '❌', label: 'Malformed URL', detail: 'A legitimate link should be a properly formatted URL.' }
    ]};
  }

  let risk = 0;
  const host = url.hostname.toLowerCase();
  const protocol = url.protocol.replace(':','');

  // 1. Protocol
  if (protocol === 'https') {
    checks.push({ kind: 'ok', icon: '✅', label: 'Uses HTTPS', detail: 'Encrypted in transit. Note: HTTPS alone does NOT mean the site is trustworthy.' });
  } else if (protocol === 'http') {
    risk += 25;
    checks.push({ kind: 'fail', icon: '❌', label: 'Plain HTTP (not encrypted)', detail: 'Sensitive data sent over HTTP can be read by anyone on the network. Real banks/apps always use HTTPS.' });
  } else {
    risk += 30;
    checks.push({ kind: 'fail', icon: '❌', label: `Unusual protocol: ${protocol}`, detail: 'Most safe links use https://.' });
  }

  // 2. IP address as host
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    risk += 35;
    checks.push({ kind: 'fail', icon: '❌', label: 'Host is a raw IP address', detail: 'Real services use named domains (e.g. apple.com), not bare IPs like 185.34.12.99.' });
  }

  // 3. Punycode / IDN homograph
  if (host.includes('xn--')) {
    risk += 30;
    checks.push({ kind: 'fail', icon: '❌', label: 'Punycode (xn--) in hostname', detail: 'Punycode encodes non-Latin letters. Attackers use it to spell brand names with lookalike characters (e.g. Cyrillic "а" instead of Latin "a").' });
  }

  // 4. Brand impersonation: lookalike (digit substitution, dash insertions)
  const brandHit = KNOWN_BRANDS.find(b => {
    const obfuscations = [
      b.replace('o','0'), b.replace('i','1'), b.replace('l','1'),
      b.replace('e','3'), b.replace('a','@'), b.replace('s','5'),
      b + '-secure', b + '-login', b + '-verify', b + '-support', 'secure-' + b
    ];
    return obfuscations.some(o => host.includes(o)) && !host.endsWith(b + '.com');
  });
  if (brandHit) {
    risk += 35;
    checks.push({ kind: 'fail', icon: '❌', label: `Possible brand impersonation: "${brandHit}"`, detail: `The hostname references "${brandHit}" but doesn't match the real ${brandHit}.com domain. Lookalike domains are a top phishing technique.` });
  }

  // 5. Brand name embedded as a SUBDOMAIN of an unrelated domain
  const parts = host.split('.');
  const registrable = parts.slice(-2).join('.');
  const brandSubdomain = KNOWN_BRANDS.find(b => host.includes(b) && !registrable.startsWith(b));
  if (brandSubdomain && !brandHit) {
    risk += 30;
    checks.push({ kind: 'fail', icon: '❌', label: `Brand "${brandSubdomain}" hidden as subdomain`, detail: `The real domain owner is "${registrable}" — not ${brandSubdomain}. Attackers put brand names on the LEFT to fool casual readers.` });
  }

  // 6. Excessive subdomains
  if (parts.length >= 4) {
    risk += 15;
    checks.push({ kind: 'warn', icon: '⚠️', label: `Many subdomains (${parts.length} parts)`, detail: 'Long chains like "login.account.verify.example.com" are commonly used to obscure the true domain.' });
  }

  // 7. Suspicious TLD
  const tldHit = SUSPICIOUS_TLDS.find(t => host.endsWith(t));
  if (tldHit) {
    risk += 20;
    checks.push({ kind: 'warn', icon: '⚠️', label: `High-abuse TLD: ${tldHit}`, detail: 'Free or cheap TLDs are disproportionately used in phishing campaigns. Treat with caution.' });
  }

  // 8. URL shortener
  const shortHit = SHORTENERS.find(s => host === s || host.endsWith('.' + s));
  if (shortHit) {
    risk += 25;
    checks.push({ kind: 'warn', icon: '⚠️', label: `URL shortener (${shortHit})`, detail: "Shorteners hide the real destination. Expand the link with a preview tool before clicking." });
  }

  // 9. Credentials in URL
  if (url.username || url.password) {
    risk += 35;
    checks.push({ kind: 'fail', icon: '❌', label: 'URL contains login credentials', detail: 'A URL of the form https://user:pass@host can mask the real domain — the part before "@" is ignored by the browser.' });
  }

  // 10. Suspicious path keywords
  if (/(login|verify|secure|update|account|signin|reset|wallet|bank|confirm)/i.test(url.pathname)) {
    checks.push({ kind: 'warn', icon: '⚠️', label: 'Sensitive keyword in path', detail: 'Words like "login", "verify", "secure" in the path are common in credential-harvesting pages. Not always bad, but combined with other flags, raises risk.' });
    risk += 5;
  }

  // 11. Excessive length
  if (raw.length > 100) {
    risk += 10;
    checks.push({ kind: 'warn', icon: '⚠️', label: 'Very long URL', detail: 'Long URLs can hide the real destination beyond the visible portion of the address bar.' });
  }

  // Clamp & summarize
  risk = Math.min(100, risk);
  let summary, summaryText;
  if (risk >= 60) { summary = 'bad';  summaryText = `🚩 HIGH RISK (${risk}/100) — multiple phishing indicators. Do NOT click.`; }
  else if (risk >= 25) { summary = 'warn'; summaryText = `⚠️ SUSPICIOUS (${risk}/100) — some red flags. Verify before clicking.`; }
  else { summary = 'safe'; summaryText = `✅ LOW RISK (${risk}/100) — no obvious red flags. Still: confirm context before entering credentials.`; }

  if (!checks.length) checks.push({ kind: 'ok', icon: '✅', label: 'Nothing obviously wrong', detail: 'Looks structurally normal. Always verify the sender context regardless.' });
  return { score: risk, summary, summaryText, checks };
}

function renderURLReport(raw) {
  const report = analyzeURL(raw);
  const el = document.getElementById('urlReport');
  el.classList.add('show');
  el.innerHTML = `
    <div class="url-summary ${report.summary}">${escapeHTML(report.summaryText)}</div>
    <div class="url-checks">
      ${report.checks.map(c => `
        <div class="url-check ${c.kind}">
          <div class="icon">${c.icon}</div>
          <div>
            <div class="label">${escapeHTML(c.label)}</div>
            <div class="detail">${escapeHTML(c.detail)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

document.getElementById('urlAnalyze').addEventListener('click', () => {
  const v = document.getElementById('urlInput').value.trim();
  if (!v) return;
  renderURLReport(v);
});
document.querySelectorAll('[data-url-example]').forEach(b => {
  b.addEventListener('click', () => {
    document.getElementById('urlInput').value = b.dataset.urlExample;
    renderURLReport(b.dataset.urlExample);
  });
});

// ---------- XSS ----------
const xssInput = document.getElementById('xssInput');
const xssUnsafe = document.getElementById('xssUnsafe');
const xssSafe = document.getElementById('xssSafe');
function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}
xssInput.addEventListener('input', () => {
  const v = xssInput.value;
  // We always show the SOURCE only — never executed.
  xssUnsafe.textContent = v ? `<!-- vulnerable app would render --> ${v}` : '(type something above)';
  xssSafe.textContent = v ? escapeHTML(v) : '(type something above)';
});

// ---------- SQL Injection ----------
const mockUsers = [
  { username: 'admin', password: 'S3cure!Pass' },
  { username: 'alice', password: 'wonderland' },
];
document.getElementById('sqlLogin').addEventListener('click', () => {
  const u = document.getElementById('sqlUser').value;
  const p = document.getElementById('sqlPass').value;
  const query = `SELECT * FROM users WHERE username='${u}' AND password='${p}'`;
  document.getElementById('sqlQueryDisplay').textContent = query;
  const r = document.getElementById('sqlResult');
  r.classList.remove('ok', 'bad');
  r.classList.add('show');

  // Conceptual simulation: detect injection-style patterns; never executes anything.
  const injPattern = /('|").*(or|=).*('|"|=)/i;
  if (injPattern.test(p) || injPattern.test(u)) {
    r.classList.add('bad');
    r.innerHTML = '⚠️ <strong>Login bypassed (simulated).</strong> The app naively concatenated input into SQL, so the attacker logged in without valid credentials. Fix: use parameterized queries.';
    return;
  }
  const match = mockUsers.find(x => x.username === u && x.password === p);
  if (match) {
    r.classList.add('ok');
    r.textContent = `✅ Login successful for ${u} (mock data).`;
  } else {
    r.classList.add('bad');
    r.textContent = '❌ Invalid credentials (mock data).';
  }
});

// ---------- Password Strength ----------
const pwInput = document.getElementById('pwInput');
const strengthFill = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');
const crackTime = document.getElementById('crackTime');
const entropyEl = document.getElementById('entropyValue');
const pwSugg = document.getElementById('pwSuggestions');

const commonWeak = ['123456', 'password', 'qwerty', '111111', 'letmein', 'iloveyou', 'admin', 'welcome', 'abc123'];

pwInput.addEventListener('input', () => {
  const v = pwInput.value;
  if (!v) {
    strengthFill.style.width = '0%';
    strengthLabel.textContent = 'Strength: --';
    crackTime.textContent = '--';
    entropyEl.textContent = '--';
    pwSugg.innerHTML = '';
    return;
  }
  const tips = [];
  let pool = 0;
  if (/[a-z]/.test(v)) pool += 26; else tips.push('Add lowercase letters');
  if (/[A-Z]/.test(v)) pool += 26; else tips.push('Add uppercase letters');
  if (/[0-9]/.test(v)) pool += 10; else tips.push('Add digits');
  if (/[^A-Za-z0-9]/.test(v)) pool += 32; else tips.push('Add symbols');

  let entropy = v.length * Math.log2(pool || 1);
  if (commonWeak.includes(v.toLowerCase())) {
    entropy = Math.min(entropy, 8);
    tips.unshift('This password is in common breach lists');
  }
  if (v.length < 12) tips.push('Use at least 12–16 characters');

  // Assume 1e10 guesses/sec offline brute-force.
  const guesses = Math.pow(2, entropy);
  const seconds = guesses / 1e10;
  crackTime.textContent = humanTime(seconds);
  entropyEl.textContent = entropy.toFixed(1);

  let pct, label, color;
  if (entropy < 28)      { pct = 15; label = 'Very Weak';  color = 'var(--danger)'; }
  else if (entropy < 50) { pct = 40; label = 'Weak';       color = '#ff8c5a'; }
  else if (entropy < 70) { pct = 65; label = 'Moderate';   color = 'var(--warning)'; }
  else if (entropy < 90) { pct = 85; label = 'Strong';     color = 'var(--good)'; }
  else                   { pct = 100; label = 'Very Strong'; color = 'var(--accent)'; }

  strengthFill.style.width = pct + '%';
  strengthFill.style.background = color;
  strengthLabel.textContent = `Strength: ${label}`;
  pwSugg.innerHTML = tips.length ? `<p class="muted small"><strong>Suggestions:</strong></p><ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>` : '<p class="muted small">✅ Looks great!</p>';
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

// ---------- Malware terminal animation ----------
const malwareBtn = document.getElementById('malwareStart');
const malwareScreen = document.getElementById('malwareScreen');
const malwareTerm = document.getElementById('malwareTerminal');
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
malwareBtn.addEventListener('click', async () => {
  malwareScreen.classList.add('active');
  malwareTerm.innerHTML = '';
  for (const line of malwareLines) {
    await delay(700);
    const span = document.createElement('div');
    if (line.c) span.classList.add(line.c);
    span.textContent = '> ' + line.t;
    malwareTerm.appendChild(span);
    malwareTerm.scrollTop = malwareTerm.scrollHeight;
  }
});
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ---------- Virus spread visualization ----------
const virusGrid = document.getElementById('virusGrid');
const ROWS = 8, COLS = 12;
let virusCells = [];
function buildVirusGrid() {
  virusGrid.innerHTML = '';
  virusCells = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'virus-cell';
    virusGrid.appendChild(cell);
    virusCells.push(cell);
  }
}
buildVirusGrid();

let virusInterval = null;
document.getElementById('virusStart').addEventListener('click', () => {
  if (virusInterval) return;
  // Patient zero
  const start = Math.floor(Math.random() * virusCells.length);
  virusCells[start].classList.add('infected');
  virusInterval = setInterval(() => {
    const infected = virusCells.filter(c => c.classList.contains('infected'));
    if (infected.length >= virusCells.length) { clearInterval(virusInterval); virusInterval = null; return; }
    infected.forEach(c => {
      const idx = virusCells.indexOf(c);
      const neighbors = [idx - 1, idx + 1, idx - COLS, idx + COLS];
      neighbors.forEach(n => {
        if (n >= 0 && n < virusCells.length && Math.random() < 0.35) {
          virusCells[n].classList.add('infected');
        }
      });
    });
  }, 350);
});
document.getElementById('virusReset').addEventListener('click', () => {
  if (virusInterval) { clearInterval(virusInterval); virusInterval = null; }
  virusCells.forEach(c => c.classList.remove('infected'));
});

// ---------- Ransomware overlay ----------
const ransomOverlay = document.getElementById('ransomOverlay');
const ransomTimer = document.getElementById('ransomTimer');
let ransomInt = null;
document.getElementById('ransomStart').addEventListener('click', () => {
  ransomOverlay.classList.remove('hidden');
  let total = 24 * 3600 - 1;
  const tick = () => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    ransomTimer.textContent = `Time left: ${pad(h)}:${pad(m)}:${pad(s)}`;
    total = total > 0 ? total - 1 : 0;
  };
  tick();
  ransomInt = setInterval(tick, 1000);
});
document.getElementById('ransomClose').addEventListener('click', () => {
  ransomOverlay.classList.add('hidden');
  if (ransomInt) { clearInterval(ransomInt); ransomInt = null; }
});
function pad(n) { return String(n).padStart(2, '0'); }

// ---------- Social engineering scenarios ----------
const scenarios = [
  { tactic: 'vishing', risk: 'high',
    text: '📞 "Hi, this is John from IT. We\'re running urgent maintenance and I need your password to update your account."',
    options: [
      { text: 'Give him the password — he sounds legit', correct: false },
      { text: 'Refuse and verify by calling IT directly using a known number', correct: true },
      { text: 'Send the password by email instead', correct: false },
    ],
    explain: 'Real IT will never ask for your password. Verify identities via known channels — don\'t trust caller ID alone, it can be spoofed.'
  },
  { tactic: 'baiting', risk: 'medium',
    text: '🎁 You find a USB stick labeled "Confidential — Q4 Bonuses" in the office parking lot.',
    options: [
      { text: 'Plug it in to find the owner', correct: false },
      { text: 'Hand it to security or IT without plugging it in', correct: true },
      { text: 'Take it home and check it on your personal laptop', correct: false },
    ],
    explain: 'Baiting (a.k.a. "USB drop") is well-documented. The stick can auto-execute payloads or pose as a keyboard (HID attack). Never plug in unknown devices.'
  },
  { tactic: 'tailgating', risk: 'high',
    text: '🚪 A stranger in a delivery uniform with a stack of boxes asks you to hold the secure door open behind you.',
    options: [
      { text: 'Hold the door — they look busy and friendly', correct: false },
      { text: 'Politely ask them to badge in or call reception to escort them', correct: true },
      { text: 'Walk away and ignore them', correct: false },
    ],
    explain: 'Tailgating bypasses physical access controls. Politeness should never override security policy — every person needs their own badge or escort.'
  },
  { tactic: 'bec', risk: 'critical',
    text: '✉️ The "CEO" emails you urgently from a Gmail address asking you to buy 10x $200 Apple gift cards and send the codes immediately. "Don\'t mention this to anyone — it\'s a surprise."',
    options: [
      { text: 'Do it quickly — the CEO is in a hurry', correct: false },
      { text: 'Verify with the CEO via a known phone number first', correct: true },
      { text: 'Reply to the email asking for confirmation', correct: false },
    ],
    explain: 'BEC (Business Email Compromise) costs companies billions per year. Red flags: external email, urgency, secrecy, gift cards. Always verify out-of-band.'
  },
  { tactic: 'smishing', risk: 'high',
    text: '📱 SMS: "DHL: Your package is held at customs. Pay $1.99 fee here: dhl-pay.tk/x82 — failure to pay returns the parcel in 24h."',
    options: [
      { text: 'Pay the small fee — it\'s only $1.99', correct: false },
      { text: 'Ignore and check the official DHL site/app directly using your tracking number', correct: true },
      { text: 'Reply STOP to unsubscribe', correct: false },
    ],
    explain: 'Smishing exploits the small dollar amount to make you act before thinking. The real goal is harvesting your card details. Always verify via the official app or website.'
  },
  { tactic: 'pretexting', risk: 'high',
    text: '📧 An "external auditor" emails: "I need a list of all employees, their job titles, and direct phone numbers for our annual compliance review. Please send by EOD."',
    options: [
      { text: 'Send the list — auditors need this info', correct: false },
      { text: 'Verify with your manager or compliance team via internal channels first', correct: true },
      { text: 'Send only the names to be safe', correct: false },
    ],
    explain: 'Pretexting builds a believable story to extract information. Employee directories are gold for follow-up spear-phishing and vishing. Always verify identity through internal escalation.'
  },
  { tactic: 'quid', risk: 'medium',
    text: '🆓 A caller offers free tech support: "I noticed your computer is running slowly — let me remote in and fix it for free, just need you to install this small tool."',
    options: [
      { text: 'Accept — free help is great', correct: false },
      { text: 'Refuse politely and never install software requested by unsolicited callers', correct: true },
      { text: 'Install it but only let them look, not change anything', correct: false },
    ],
    explain: 'Quid pro quo offers a "service" in exchange for access. The "tool" is usually a Remote Access Trojan. Legitimate support never cold-calls you.'
  },
  { tactic: 'watering', risk: 'high',
    text: '🌐 A trade-association website you visit weekly suddenly prompts: "Your Adobe Flash Player is out of date. Click here to update."',
    options: [
      { text: 'Click and install — you trust this site', correct: false },
      { text: 'Close the prompt and report it; never install software from a popup', correct: true },
      { text: 'Install only if it asks for admin password', correct: false },
    ],
    explain: 'Watering-hole attacks compromise sites a target group already trusts, then serve fake update prompts. Flash is also long-deprecated — a sure sign of a fake.'
  },
  { tactic: 'vishing', risk: 'critical',
    text: '📞 Your bank "fraud team" calls about a $499 charge and asks you to read back the SMS code they\'re sending you to "cancel the transaction".',
    options: [
      { text: 'Read the code — it\'s the bank, after all', correct: false },
      { text: 'Hang up and call the number on the back of your card', correct: true },
      { text: 'Read just the last 3 digits to be safe', correct: false },
    ],
    explain: 'This is one of the most common bank scams. The "code" is a real 2FA code FOR the attacker logging in. No bank will ever ask you to read a code aloud.'
  },
  { tactic: 'pretexting', risk: 'medium',
    text: '👤 Someone messages you on LinkedIn claiming to be a recruiter for a great role, but first wants you to fill out a Google Form with your full address, SSN, and bank details for "background check setup".',
    options: [
      { text: 'Fill it out — recruiters need this info', correct: false },
      { text: 'Refuse and verify the recruiter and company through the company\'s official site', correct: true },
      { text: 'Send only the SSN', correct: false },
    ],
    explain: 'Real recruiters don\'t collect SSNs and bank details before any interviews. Job-offer scams target people actively looking for work. Verify through the company\'s official channels.'
  },
  { tactic: 'baiting', risk: 'medium',
    text: '🎬 A pop-up ad offers a "FREE Premium Netflix Account — 12 months, no credit card!" if you complete a short survey.',
    options: [
      { text: 'Try it — there\'s no credit card needed', correct: false },
      { text: 'Close the ad. Free premium accounts are bait for credentials and tracking', correct: true },
      { text: 'Try with a fake email', correct: false },
    ],
    explain: 'Bait offers either harvest credentials, install adware, or sell your personal info. If something is "free with no catch", you are the product.'
  },
  { tactic: 'bec', risk: 'critical',
    text: '🏦 A vendor you regularly pay emails: "We changed banks. Please update our wire details to this new account for next week\'s invoice."',
    options: [
      { text: 'Update the details — you\'ve worked with them for years', correct: false },
      { text: 'Call the vendor at the phone number you already have on file to verify', correct: true },
      { text: 'Reply to the email to confirm the change', correct: false },
    ],
    explain: 'Vendor-impersonation is a top BEC pattern. Bank-detail changes must always be verified by phone using a number you already trust — never the one in the email.'
  },
];

let socialFiltered = scenarios.slice();
let scenIdx = 0;
let socialScore = { correct: 0, answered: 0 };
let scenarioAnswered = false;

const socialFilterSel = document.getElementById('socialFilter');
const socialCounter = document.getElementById('socialCounter');
const socialScoreEl = document.getElementById('socialScore');

socialFilterSel.addEventListener('change', () => {
  const t = socialFilterSel.value;
  socialFiltered = t === 'all' ? scenarios.slice() : scenarios.filter(s => s.tactic === t);
  scenIdx = 0;
  renderScenario();
});

document.getElementById('resetSocial').addEventListener('click', () => {
  socialScore = { correct: 0, answered: 0 };
  updateSocialScore();
});

function updateSocialScore() {
  socialScoreEl.textContent = `${socialScore.correct} / ${socialScore.answered}`;
}

function renderScenario() {
  if (!socialFiltered.length) {
    document.getElementById('socialScenario').innerHTML = '<p class="muted">No scenarios in this category.</p>';
    document.getElementById('socialChoices').innerHTML = '';
    socialCounter.textContent = '';
    return;
  }
  const s = socialFiltered[scenIdx];
  scenarioAnswered = false;
  const tacticName = {
    pretexting:'Pretexting', baiting:'Baiting', tailgating:'Tailgating',
    vishing:'Vishing', smishing:'Smishing', bec:'BEC / CEO Fraud',
    quid:'Quid Pro Quo', watering:'Watering Hole'
  }[s.tactic] || s.tactic;

  document.getElementById('socialScenario').innerHTML = `
    <div class="scenario-meta">
      <span class="scenario-tag">${escapeHTML(tacticName)}</span>
      <span class="risk-badge risk-${s.risk}">${s.risk}</span>
    </div>
    <div>${escapeHTML(s.text)}</div>
  `;
  socialCounter.textContent = `${scenIdx + 1} / ${socialFiltered.length}`;

  const choices = document.getElementById('socialChoices');
  choices.innerHTML = '';
  s.options.forEach((o) => {
    const b = document.createElement('button');
    b.className = 'btn';
    b.textContent = o.text;
    b.addEventListener('click', () => {
      if (scenarioAnswered) return;
      scenarioAnswered = true;
      socialScore.answered++;
      if (o.correct) socialScore.correct++;
      updateSocialScore();
      const r = document.getElementById('socialResult');
      r.classList.add('show');
      r.classList.remove('ok', 'bad');
      r.classList.add(o.correct ? 'ok' : 'bad');
      r.innerHTML = (o.correct ? '✅ Good choice. ' : '❌ Risky choice. ') + s.explain;
      // Mark buttons
      Array.from(choices.children).forEach((btnEl, idx) => {
        btnEl.disabled = true;
        if (s.options[idx].correct) btnEl.classList.add('correct');
        else if (btnEl === b && !o.correct) btnEl.classList.add('wrong');
      });
    });
    choices.appendChild(b);
  });
  const r = document.getElementById('socialResult');
  r.classList.remove('show', 'ok', 'bad');
  r.innerHTML = '';
}
document.getElementById('nextScenario').addEventListener('click', () => {
  if (!socialFiltered.length) return;
  scenIdx = (scenIdx + 1) % socialFiltered.length;
  renderScenario();
});
renderScenario();
updateSocialScore();

// ---------- Data leakage estimator ----------
const leakChecklist = document.getElementById('leakChecklist');
const leakFill = document.getElementById('leakFill');
const leakLabel = document.getElementById('leakLabel');
function updateLeak() {
  let safety = 0;
  let total = 0;
  leakChecklist.querySelectorAll('input').forEach(i => {
    const pts = parseInt(i.dataset.points, 10);
    total += pts;
    if (i.checked) safety += pts;
  });
  const risk = 100 - Math.round((safety / total) * 100);
  leakFill.style.width = risk + '%';
  let label, color;
  if (risk < 25) { label = 'Low Risk'; color = 'var(--good)'; }
  else if (risk < 55) { label = 'Medium Risk'; color = 'var(--warning)'; }
  else if (risk < 80) { label = 'High Risk'; color = 'var(--danger)'; }
  else { label = 'Critical Risk'; color = 'var(--danger)'; }
  leakFill.style.background = color;
  leakLabel.textContent = `Risk: ${label} (${risk}%)`;
}
leakChecklist.addEventListener('change', updateLeak);
updateLeak();

// ---------- Mini-quiz handling (per topic) ----------
document.querySelectorAll('.quiz-options').forEach(group => {
  const correctIdx = parseInt(group.dataset.answer, 10);
  group.querySelectorAll('.quiz-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const i = parseInt(opt.dataset.i, 10);
      group.querySelectorAll('.quiz-opt').forEach(o => o.classList.remove('correct', 'wrong'));
      if (i === correctIdx) opt.classList.add('correct');
      else {
        opt.classList.add('wrong');
        group.querySelectorAll('.quiz-opt')[correctIdx].classList.add('correct');
      }
      state.miniQuiz[group.dataset.quiz] = (i === correctIdx);
      saveState();
    });
  });
});

// ---------- Final Quiz ----------
const finalQuiz = [
  { q: 'Which of these is a sign of a phishing email?', opts: ['Personalized greeting', 'Urgent threats and suspicious links', 'Company logo', 'Long signature'], a: 1 },
  { q: 'How can XSS attacks be prevented?', opts: ['Disabling cookies', 'Escaping/encoding output', 'Using shorter URLs', 'Hiding the source code'], a: 1 },
  { q: 'What is the safest defense against SQL injection?', opts: ['Hiding the URL', 'Renaming the database', 'Parameterized queries', 'Disabling logs'], a: 2 },
  { q: 'Which password is strongest?', opts: ['password1', 'JohnDoe2000', 'qwerty', 'pine-Robot-Lake-77!'], a: 3 },
  { q: 'Malware can spread via:', opts: ['Email attachments', 'Infected USB drives', 'Unpatched software', 'All of the above'], a: 3 },
  { q: 'The best defense against ransomware is:', opts: ['Paying quickly', 'Tested offline backups', 'Hiding files', 'Using more antivirus tools at once'], a: 1 },
  { q: 'A stranger asks you to hold a secure door open. You should:', opts: ['Hold it open to be polite', 'Ignore them and walk away', 'Ask them to badge in or check with security', 'Call the police'], a: 2 },
  { q: 'Which is NOT a strong password practice?', opts: ['Using a password manager', 'Reusing the same password everywhere', 'Enabling MFA', '16+ character passphrases'], a: 1 },
  { q: 'Data leakage is most often caused by:', opts: ['Hackers only', 'Misconfigurations and human error', 'Power outages', 'Old hardware'], a: 1 },
  { q: 'Multi-factor authentication (MFA) protects against:', opts: ['Earthquakes', 'Stolen passwords', 'Slow internet', 'Bad UI'], a: 1 },
];

const quizContainer = document.getElementById('quizContainer');
const certificateCard = document.getElementById('certificateCard');

function renderFinalQuiz() {
  certificateCard.classList.add('hidden');
  quizContainer.classList.remove('hidden');
  quizContainer.innerHTML = `
    <h3>Answer all questions:</h3>
    ${finalQuiz.map((q, qi) => `
      <div class="quiz-card" style="margin-top:1rem;">
        <p><strong>Q${qi + 1}.</strong> ${escapeHTML(q.q)}</p>
        <div class="quiz-options" data-q="${qi}">
          ${q.opts.map((o, oi) => `<button class="quiz-opt" data-i="${oi}">${escapeHTML(o)}</button>`).join('')}
        </div>
      </div>
    `).join('')}
    <div style="margin-top:1.25rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
      <button class="btn btn-primary" id="submitFinal">Submit Quiz</button>
      <input class="input" id="learnerName" placeholder="Your name (for certificate)" style="max-width:280px; margin-top:0;" />
    </div>
    <div class="result" id="finalResult"></div>
  `;

  const answers = {};
  quizContainer.querySelectorAll('.quiz-options').forEach(group => {
    group.querySelectorAll('.quiz-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        group.querySelectorAll('.quiz-opt').forEach(o => o.style.borderColor = '');
        opt.style.borderColor = 'var(--primary)';
        answers[group.dataset.q] = parseInt(opt.dataset.i, 10);
      });
    });
  });

  document.getElementById('submitFinal').addEventListener('click', () => {
    let score = 0;
    quizContainer.querySelectorAll('.quiz-options').forEach(group => {
      const qi = parseInt(group.dataset.q, 10);
      const correct = finalQuiz[qi].a;
      const chosen = answers[qi];
      group.querySelectorAll('.quiz-opt').forEach((o, i) => {
        if (i === correct) o.classList.add('correct');
        if (chosen === i && chosen !== correct) o.classList.add('wrong');
      });
      if (chosen === correct) score++;
    });
    const total = finalQuiz.length;
    state.finalScore = score;
    state.finalTotal = total;
    saveState();
    refreshDashboard();

    const r = document.getElementById('finalResult');
    r.classList.add('show', score >= total * 0.7 ? 'ok' : 'bad');
    r.innerHTML = `You scored <strong>${score} / ${total}</strong>. ${score >= total * 0.7 ? '🎉 Great job — certificate unlocked below!' : 'Review the topics and try again.'}`;

    if (score >= total * 0.7) {
      const name = (document.getElementById('learnerName').value || 'Cybersecurity Learner').trim();
      document.getElementById('certName').textContent = name || 'Cybersecurity Learner';
      document.getElementById('certScore').textContent = score;
      document.getElementById('certTotal').textContent = total;
      document.getElementById('certDate').textContent = 'Awarded ' + new Date().toLocaleDateString();
      certificateCard.classList.remove('hidden');
      certificateCard.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
renderFinalQuiz();

document.getElementById('retryQuiz').addEventListener('click', () => {
  state.finalScore = null;
  state.finalTotal = null;
  saveState();
  refreshDashboard();
  renderFinalQuiz();
});

// ---------- Init ----------
goTo('dashboard');
