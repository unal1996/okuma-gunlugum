'use strict';
(() => {
/* ============ Yardımcılar ============ */
const LS = 'okuma-gunlugum:v1';
const LS_TIMER = 'okuma-gunlugum:timer';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = n => String(n).padStart(2, '0');
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const todayKey = () => keyOf(new Date());
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const diffDays = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 864e5);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const num = v => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : 0; };
const isKey = k => /^\d{4}-\d{2}-\d{2}$/.test(k || '');
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const DAYS = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
const hue = s => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };
const fmt = n => Number(n).toLocaleString('tr-TR', { maximumFractionDigits: 1 });
const lower = s => String(s || '').toLocaleLowerCase('tr');

function fmtDate(k, withYear) {
  const t = todayKey();
  if (k === t) return 'Bugün';
  if (k === addDays(t, -1)) return 'Dün';
  const d = parseKey(k);
  const y = (withYear || d.getFullYear() !== new Date().getFullYear()) ? ' ' + d.getFullYear() : '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]}${y}`;
}
function fmtLong(k) {
  const d = parseKey(k);
  const dn = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'][d.getDay()];
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${dn}`;
}
function fmtMin(m) {
  m = Math.round(m || 0);
  if (!m) return '0 dk';
  const h = Math.floor(m / 60), r = m % 60;
  return h ? (r ? `${h} sa ${r} dk` : `${h} sa`) : `${r} dk`;
}
function fmtHours(h) {
  if (h < 1) return `${Math.max(5, Math.round(h * 60 / 5) * 5)} dk`;
  return `${fmt(Math.round(h * 2) / 2)} saat`;
}

/* ============ İkonlar ============ */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01"/>',
  book: '<path d="M2.5 5.5C4.5 4.5 7.5 4 12 6c4.5-2 7.5-1.5 9.5-.5V19c-2-1-5-1.5-9.5.5-4.5-2-7.5-1.5-9.5-.5z"/><path d="M12 6v13.5"/>',
  note: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2h5"/>',
  pencil: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  flame: '<path d="M12 22c3.9 0 7-2.9 7-6.8 0-3.7-2.6-5.7-3.7-8.7-1.2 1.6-2.2 2.6-3.6 2.8.2-2.6-.6-5.1-2.6-7.3-.6 4.3-5.1 6.6-5.1 13.2C4 19.1 8.1 22 12 22z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 21h16"/>',
  more: '<path d="M5 12h.01M12 12h.01M19 12h.01"/>',
  bookOpen: '<path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
};
const icon = (n, s = 22, w = 1.8) => `<svg class="i" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

/* ============ Android (Capacitor) ============ */
const Cap = window.Capacitor;
const isNative = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
const plugins = {};
const plug = n => plugins[n] || (plugins[n] = Cap && Cap.registerPlugin ? Cap.registerPlugin(n) : (Cap && Cap.Plugins && Cap.Plugins[n]));

/* ============ Veri ============ */
function defaults() {
  return { v: 1, profile: { name: '', dailyGoal: 40, yearGoal: 12, theme: 'system', onboarded: false, lastBackup: null }, books: {}, entries: [] };
}
function load() {
  try {
    const raw = localStorage.getItem(LS);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) { console.warn(e); }
  return defaults();
}
function normalize(d) {
  const df = defaults();
  const out = { v: 1, profile: { ...df.profile, ...(d && d.profile) }, books: {}, entries: [] };
  for (const [id, b] of Object.entries((d && d.books) || {})) {
    if (b && b.title) out.books[id] = { ...b, id };
  }
  out.entries = ((d && d.entries) || []).filter(e => e && e.id && isKey(e.date) && e.bookId);
  return out;
}
let S = load();
let persistAsked = false;
function save() {
  try { localStorage.setItem(LS, JSON.stringify(S)); }
  catch (e) { toast('Kaydedilemedi: depolama dolu olabilir. Ayarlar’dan yedek alıp bazı kapak fotoğraflarını kaldır.'); }
  if (!persistAsked && navigator.storage && navigator.storage.persist) {
    persistAsked = true;
    navigator.storage.persist().catch(() => {});
  }
}

const ui = {
  view: 'home',
  calMonth: (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })(),
  booksTab: 'reading',
  notesBook: 'all',
};

/* ============ Hesaplamalar ============ */
const booksArr = () => Object.values(S.books);
function entriesByDate() {
  const m = {};
  for (const e of S.entries) (m[e.date] || (m[e.date] = [])).push(e);
  for (const k in m) m[k].sort((a, b) => (a.at || 0) - (b.at || 0));
  return m;
}
const sumPages = es => es.reduce((a, e) => a + (e.pages || 0), 0);
const sumMin = es => es.reduce((a, e) => a + (e.minutes || 0), 0);
const countsAsRead = es => es && es.some(e => (e.pages || 0) > 0 || (e.minutes || 0) > 0);

function streak(map) {
  let k = todayKey();
  if (!countsAsRead(map[k])) k = addDays(k, -1);
  let n = 0;
  while (countsAsRead(map[k])) { n++; k = addDays(k, -1); }
  return n;
}
function syncBook(id) {
  const b = S.books[id];
  if (!b) return;
  const es = S.entries.filter(e => e.bookId === id);
  let m = b.basePage || 0;
  for (const e of es) m = Math.max(m, e.to || 0);
  if (b.pages) m = Math.min(m, b.pages);
  b.currentPage = b.status === 'done' ? (b.pages || m) : m;
}
function bookStats(b) {
  const t = todayKey();
  const es = S.entries.filter(e => e.bookId === b.id);
  const pagesRead = sumPages(es);
  const minutes = sumMin(es);
  const days = new Set(es.filter(e => e.pages > 0 || e.minutes > 0).map(e => e.date)).size;
  // Tempo: son 14 gün (kitap daha yeni başladıysa başlangıçtan beri)
  const since = addDays(t, -13);
  let start = since;
  const firstDate = es.length ? es.reduce((a, e) => e.date < a ? e.date : a, es[0].date) : null;
  if (b.startedAt && b.startedAt > since) start = b.startedAt;
  if (firstDate && firstDate > start) start = firstDate;
  const recent = es.filter(e => e.date >= start);
  let perDay = sumPages(recent) / (diffDays(start, t) + 1);
  if (!perDay && pagesRead && firstDate) perDay = pagesRead / (diffDays(firstDate, t) + 1);
  // Hız: süre girilmiş kayıtlardan
  const timed = es.filter(e => e.minutes > 0 && e.pages > 0);
  const tMin = sumMin(timed), tPg = sumPages(timed);
  let speed = tMin >= 10 ? tPg / tMin * 60 : null; // sayfa/saat
  if (!speed) { // tüm kitaplardaki genel hız
    const all = S.entries.filter(e => e.minutes > 0 && e.pages > 0);
    const am = sumMin(all);
    if (am >= 20) speed = sumPages(all) / am * 60;
  }
  const left = Math.max(0, (b.pages || 0) - (b.currentPage || 0));
  const daysLeft = perDay > 0 && left > 0 ? Math.ceil(left / perDay) : null;
  return {
    es, pagesRead, minutes, days, perDay, speed, left, daysLeft,
    finishDate: daysLeft ? addDays(t, daysLeft) : null,
    hoursLeft: speed && left ? left / speed : null,
    pct: b.pages ? Math.min(100, Math.round((b.currentPage || 0) / b.pages * 100)) : 0,
  };
}
function finishedInYear(y) {
  return booksArr().filter(b => b.status === 'done' && (b.finishedAt || '').startsWith(String(y)));
}

/* ============ Kapak ============ */
function cover(b, cls = '') {
  const t = (b && b.title) || '?';
  const h = hue(t);
  if (b && b.cover) {
    return `<div class="cover ${cls}" style="--h:${h}"><img src="${esc(b.cover)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('fallback');this.remove()"><span class="ct">${esc(t)}</span></div>`;
  }
  return `<div class="cover fallback ${cls}" style="--h:${h}"><span class="ct">${esc(t)}</span></div>`;
}
const bookOf = e => S.books[e.bookId] || { id: e.bookId, title: e.bookTitle || 'Silinmiş kitap' };

/* ============ Tema ============ */
const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function applyTheme() {
  const t = S.profile.theme;
  const dark = t === 'dark' || (t === 'system' && mq && mq.matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = dark ? '#12151c' : '#f5f7fb';
}
if (mq && mq.addEventListener) mq.addEventListener('change', applyTheme);

/* ============ Sayaç (isteğe bağlı) ============ */
let timer = (() => { try { return JSON.parse(localStorage.getItem(LS_TIMER)) || null; } catch (e) { return null; } })();
function saveTimer() { try { timer ? localStorage.setItem(LS_TIMER, JSON.stringify(timer)) : localStorage.removeItem(LS_TIMER); } catch (e) {} }
const timerMs = () => timer ? timer.acc + (timer.running ? Date.now() - timer.start : 0) : 0;
function fmtClock(ms) {
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
  return h ? `${h}:${pad(m)}:${pad(x)}` : `${pad(m)}:${pad(x)}`;
}
setInterval(() => { if (timer) $$('[data-clock]').forEach(el => { el.textContent = fmtClock(timerMs()); }); }, 1000);

/* ============ Görünümler ============ */
function render() {
  applyTheme();
  const views = { home: viewHome, calendar: viewCalendar, books: viewBooks, notes: viewNotes, settings: viewSettings };
  $('#app').innerHTML = (views[ui.view] || viewHome)();
  renderNav();
  if (ui.view === 'settings' && isNative) {
    try { plug('App').getInfo().then(i => { const el = $('[data-ver]'); if (el) el.textContent = ` · Sürüm ${i.version}`; }).catch(() => {}); } catch (e) {}
  }
}
function renderNav() {
  const items = [['home', 'home', 'Ana Sayfa'], ['calendar', 'calendar', 'Takvim'], ['books', 'book', 'Kitaplar'], ['notes', 'note', 'Notlar']];
  $('#nav').innerHTML = `<div class="wrap">${items.map(([v, i, l]) =>
    `<button data-act="nav" data-view="${v}" class="${ui.view === v ? 'on' : ''}">${icon(i, 24)}<span>${l}</span></button>`).join('')}</div>`;
}

function timerChip() {
  if (!timer) return '';
  return `<button class="timer-chip" data-act="openTimer">${icon(timer.running ? 'timer' : 'pause', 20)}<span data-clock>${fmtClock(timerMs())}</span></button>`;
}

function viewHome() {
  const p = S.profile, map = entriesByDate(), t = todayKey();
  const todayEs = map[t] || [];
  const tp = sumPages(todayEs), tm = sumMin(todayEs);
  const st = streak(map);
  const h = new Date().getHours();
  const greet = h < 6 ? 'İyi geceler,' : h < 12 ? 'Günaydın,' : h < 18 ? 'İyi günler,' : 'İyi akşamlar,';

  // Hafta
  const now = new Date();
  const dow = (now.getDay() + 6) % 7;
  const mon = addDays(t, -dow);
  let week = '';
  for (let i = 0; i < 7; i++) {
    const k = addDays(mon, i);
    const read = countsAsRead(map[k]);
    const cls = read ? 'read' : k === t ? 'today' : k > t ? 'future' : 'past';
    week += `<button class="wd ${cls}" data-act="day" data-key="${k}"><span class="dot">${read ? icon('check', 20, 2.4) : ''}</span><span>${DAYS[i]}</span></button>`;
  }
  const weekEs = Object.keys(map).filter(k => k >= mon && k <= t).flatMap(k => map[k]);

  // Yıllık hedef
  const y = now.getFullYear();
  const done = finishedInYear(y).length;
  const goal = Math.max(1, p.yearGoal || 12);
  const pct = Math.min(100, Math.round(done / goal * 100));
  const doy = diffDays(`${y}-01-01`, t) + 1;
  const diy = diffDays(`${y}-01-01`, `${y + 1}-01-01`);
  const expected = goal * doy / diy;
  const diff = done - expected;
  const projected = Math.round(done / doy * diy);
  let pace;
  if (done >= goal) pace = `<div class="pace ahead">Hedefini tamamladın! 🎉</div>`;
  else if (diff >= 0.5) pace = `<div class="pace ahead">Planın ${fmt(Math.round(diff * 10) / 10)} kitap önündesin · bu tempoyla yıl sonu ~${projected} kitap</div>`;
  else if (diff <= -0.5) pace = `<div class="pace behind">Planın ${fmt(Math.round(-diff * 10) / 10)} kitap gerisindesin · bu tempoyla yıl sonu ~${projected} kitap</div>`;
  else pace = `<div class="pace ahead">Tam planındasın · bu tempoyla yıl sonu ~${projected} kitap</div>`;

  // Okunanlar
  const reading = booksArr().filter(b => b.status === 'reading').sort((a, b) => lastActivity(b) - lastActivity(a));
  const readingHTML = reading.length ? `<div class="reading-grid">${reading.map(readingCard).join('')}</div>` :
    `<div class="card empty">${icon('bookOpen', 26)}<div style="flex:1">Şu an okuduğun bir kitap yok. Kitap ekle, kayıtların burada görünsün.</div><button class="btn sm" data-act="addBook">${icon('plus', 18)}Ekle</button></div>`;

  // Son kayıtlar
  const recent = S.entries.slice().sort((a, b) => b.date.localeCompare(a.date) || (b.at || 0) - (a.at || 0)).slice(0, 6);

  // Yedek hatırlatma
  let backup = '';
  const lb = p.lastBackup;
  if (S.entries.length >= 15 && (!lb || diffDays(lb, t) > 30)) {
    backup = `<div class="banner">${icon('download', 20)}<span>Kayıtların sadece bu cihazda. Arada bir yedek almak iyi olur.</span><button class="btn sm" data-act="exportData">Yedek al</button></div>`;
  }

  const dGoal = Math.max(1, p.dailyGoal || 40);
  return `
  <header class="top">
    <div><div class="hello">${greet}</div><h1>${esc(p.name || 'Okur')}</h1></div>
    <div class="top-actions">${timerChip()}
      <button class="round" data-act="nav" data-view="calendar" aria-label="Takvim">${icon('calendar')}</button>
      <button class="round" data-act="nav" data-view="settings" aria-label="Ayarlar">${icon('gear')}</button>
    </div>
  </header>
  ${backup}
  <div class="stack">
    <div class="card">
      <div class="streak-head">
        <div class="flame">${icon('flame', 26)}</div>
        <div>${st ? `<div class="big">${st} gün</div><div class="sub">okuma serisi${!countsAsRead(todayEs) ? ' · bugün okuyup koru' : ''}</div>` : `<div class="big">Başla</div><div class="sub">bugün oku, seriyi kur</div>`}</div>
        <div class="today"><b>+${tp} sf</b><span class="mute">bugün</span></div>
      </div>
      <div class="week">${week}</div>
    </div>
    <div class="grid2">
      <button class="card stat" data-act="log" style="text-align:left">
        <div class="label">Bugün okunan</div>
        <div class="val">${tp} <small>/ ${dGoal} sf</small></div>
        <div class="bar ${tp >= dGoal ? 'good' : ''}"><i style="width:${Math.min(100, tp / dGoal * 100)}%"></i></div>
        <div class="note">${tp >= dGoal ? 'Günlük hedef tamam ✓' : `Hedefe ${dGoal - tp} sayfa`}</div>
      </button>
      <div class="card stat">
        <div class="label">Süre</div>
        <div class="val">${tm >= 60 ? `${Math.floor(tm / 60)} <small>sa</small> ${tm % 60 ? `${tm % 60} <small>dk</small>` : ''}` : `${tm} <small>dk</small>`}</div>
        <div class="bar"><i style="width:${Math.min(100, tm / 60 * 100)}%"></i></div>
        <div class="note">Bu hafta ${sumPages(weekEs)} sf · ${fmtMin(sumMin(weekEs))}</div>
      </div>
    </div>
    <div class="card">
      <div class="goal-head">${icon('book', 26, 1.5)}<h3>${y} okuma hedefi</h3><span class="n">${done} / ${goal}</span></div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="goal-sub">${done >= goal ? 'Hedefe ulaştın' : `Hedefe ${goal - done} kitap kaldı`} · %${pct}</div>
      ${pace}
    </div>
  </div>
  <div class="section-label"><span>Şu an okuyorum</span><button data-act="addBook">+ Kitap ekle</button></div>
  ${readingHTML}
  ${recent.length ? `<div class="section-label"><span>Son kayıtlar</span><button data-act="nav" data-view="calendar">Takvim</button></div>
  <div class="card">${recent.map(e => entryRow(e, true)).join('')}</div>` : ''}
  `;
}
function lastActivity(b) {
  let m = b.addedAt || 0;
  for (const e of S.entries) if (e.bookId === b.id) m = Math.max(m, parseKey(e.date).getTime() + 1);
  return m;
}
function readingCard(b) {
  const s = bookStats(b);
  const pills = [];
  if (s.daysLeft) pills.push(`<span class="pill">Günde ~${Math.round(s.perDay)} sf ile ${s.daysLeft} gün · ${fmtDate(s.finishDate)}</span>`);
  if (s.hoursLeft) pills.push(`<span class="pill flame">~${fmtHours(s.hoursLeft)} okuma kaldı</span>`);
  if (!pills.length && b.pages) pills.push(`<span class="pill">${s.left} sayfa kaldı</span>`);
  const running = timer && timer.bookId === b.id;
  return `<div class="card rcard">
    <div class="rtop" data-act="book" data-id="${b.id}" role="button">
      ${cover(b)}
      <div class="rinfo">
        <h3>${esc(b.title)}</h3>
        ${b.author ? `<div class="author">${esc(b.author)}</div>` : ''}
        <div class="pg">Sayfa <b>${b.currentPage || 0}</b>${b.pages ? `/${b.pages} · %${s.pct}` : ''}</div>
        ${b.pages ? `<div class="bar"><i style="width:${s.pct}%"></i></div>` : ''}
        <div class="est">${pills.join('')}</div>
      </div>
    </div>
    <div class="ractions">
      <button class="btn grow" data-act="log" data-id="${b.id}">${icon('pencil', 20)}Kayıt gir</button>
      <button class="btn ghost icon" data-act="${running ? 'openTimer' : 'startTimer'}" data-id="${b.id}" aria-label="Sayaç">${icon(running ? 'pause' : 'timer', 22)}</button>
    </div>
  </div>`;
}
function entryRow(e, showDate, opts = {}) {
  const b = bookOf(e);
  const meta = [];
  if (showDate) meta.push(fmtDate(e.date));
  if (e.pages) meta.push(`${e.pages} sf${e.from || e.to ? ` (${e.from}→${e.to})` : ''}`);
  if (e.minutes) meta.push(fmtMin(e.minutes));
  return `<div class="entry">
    <button data-act="book" data-id="${esc(e.bookId)}">${cover(b)}</button>
    <div class="body">
      <div class="t">${esc(b.title)}${e.auto ? '<span class="tag">dağıtıldı</span>' : ''}</div>
      <div class="m">${meta.join(' · ') || 'Not'}</div>
      ${e.quote ? `<div class="quote">“${esc(e.quote)}”</div>` : ''}
      ${e.note ? `<div class="notetext">${esc(e.note)}</div>` : ''}
    </div>
    <div class="acts">
      <button data-act="editEntry" data-id="${e.id}" aria-label="Düzenle">${icon('pencil', 18)}</button>
      ${opts.del ? `<button data-act="delEntry" data-id="${e.id}" aria-label="Sil">${icon('trash', 18)}</button>` : ''}
    </div>
  </div>`;
}

function mosaic(es) {
  const ids = [...new Set(es.map(e => e.bookId))];
  const books = ids.map(id => bookOf(es.find(e => e.bookId === id)));
  const n = books.length;
  if (!n) return '';
  if (n <= 3) return `<div class="mosaic m${n}">${books.map(b => cover(b)).join('')}</div>`;
  const shown = n === 4 ? books : books.slice(0, 3);
  return `<div class="mosaic m4">${shown.map(b => cover(b)).join('')}${n > 4 ? `<div class="more">+${n - 3}</div>` : ''}</div>`;
}

function viewCalendar() {
  const m = ui.calMonth, y = m.getFullYear(), mo = m.getMonth();
  const t = todayKey();
  const map = entriesByDate();
  const offset = (new Date(y, mo, 1).getDay() + 6) % 7;
  const daysIn = new Date(y, mo + 1, 0).getDate();
  let cells = '';
  for (let i = 0; i < offset; i++) cells += '<div class="cell blank"></div>';
  const monthEs = [];
  for (let d = 1; d <= daysIn; d++) {
    const k = `${y}-${pad(mo + 1)}-${pad(d)}`;
    const es = (map[k] || []).filter(e => e.pages > 0 || e.minutes > 0 || e.note || e.quote);
    monthEs.push(...es);
    const cls = [k === t ? 'today' : '', k > t ? 'future' : ''];
    if (es.length) {
      cells += `<button class="cell read ${cls.join(' ')}" data-act="day" data-key="${k}"><span class="num">${d}</span>${mosaic(es)}</button>`;
    } else {
      cells += `<button class="cell ${cls.join(' ')}" data-act="day" data-key="${k}" ${k > t ? 'disabled' : ''}>${d}</button>`;
    }
  }
  const readDays = new Set(monthEs.filter(e => e.pages > 0 || e.minutes > 0).map(e => e.date)).size;
  const mk = `${y}-${pad(mo + 1)}`;
  const finished = booksArr().filter(b => b.status === 'done' && (b.finishedAt || '').startsWith(mk));
  const isCur = y === new Date().getFullYear() && mo === new Date().getMonth();
  return `
  <div class="page-title"><h1>Okuma takvimi</h1>${timerChip()}<button class="round" data-act="log" aria-label="Kayıt gir">${icon('plus')}</button></div>
  <div class="cal-nav">
    <button data-act="calPrev" aria-label="Önceki ay">${icon('left', 26)}</button>
    <h2>${MONTHS[mo]} ${y}</h2>
    <button data-act="calNext" aria-label="Sonraki ay">${icon('right', 26)}</button>
  </div>
  <div class="cal-head">${DAYS.map(d => `<div>${d}</div>`).join('')}</div>
  <div class="cal-grid">${cells}</div>
  ${!isCur ? `<div style="text-align:center;margin-top:14px"><button class="btn sm soft" data-act="calToday">Bu aya dön</button></div>` : ''}
  <div class="card totals">
    <div><b>${fmt(sumPages(monthEs))}</b><span>sayfa</span></div>
    <div><b>${fmt(sumMin(monthEs))}</b><span>dakika</span></div>
    <div><b>${readDays}</b><span>gün</span></div>
    <div><b>${finished.length}</b><span>kitap bitti</span></div>
  </div>
  ${finished.length ? `<div class="section-label"><span>${MONTHS[mo]} ayında bitenler</span></div>
  <div class="finished-row">${finished.map(b => `<button data-act="book" data-id="${b.id}">${cover(b)}</button>`).join('')}</div>` : ''}
  `;
}

function viewBooks() {
  const all = booksArr();
  const groups = {
    reading: all.filter(b => b.status === 'reading').sort((a, b) => lastActivity(b) - lastActivity(a)),
    want: all.filter(b => b.status === 'want').sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)),
    done: all.filter(b => b.status === 'done').sort((a, b) => (b.finishedAt || '').localeCompare(a.finishedAt || '')),
  };
  const labels = { reading: 'Okuyorum', want: 'Okunacak', done: 'Bitti' };
  const list = groups[ui.booksTab];
  const tiles = list.map(b => {
    let sub = b.author ? esc(b.author) : '';
    let extra = '';
    if (b.status === 'reading' && b.pages) extra = `<div class="bar"><i style="width:${Math.round((b.currentPage || 0) / b.pages * 100)}%"></i></div>`;
    if (b.status === 'done' && b.finishedAt) sub = fmtDate(b.finishedAt, true);
    return `<button class="btile" data-act="book" data-id="${b.id}">${cover(b)}<div class="t">${esc(b.title)}</div>${sub ? `<div class="a">${sub}</div>` : ''}${extra}</button>`;
  }).join('');
  const emptyTxt = { reading: 'Şu an okuduğun kitap yok.', want: 'Okuma listen boş.', done: 'Henüz bitirdiğin kitap eklenmedi.' }[ui.booksTab];
  return `
  <div class="page-title"><h1>Kitaplarım</h1><button class="btn sm" data-act="addBook">${icon('plus', 18)}Kitap ekle</button></div>
  <div class="tabs">${Object.keys(labels).map(k => `<button data-act="booksTab" data-tab="${k}" class="${ui.booksTab === k ? 'on' : ''}">${labels[k]}<span class="cnt">${groups[k].length}</span></button>`).join('')}</div>
  ${list.length ? `<div class="book-grid">${tiles}</div>` : `<div class="card empty-big">${emptyTxt}<br><button class="btn" data-act="addBook">${icon('plus', 20)}Kitap ekle</button></div>`}
  `;
}

function viewNotes() {
  const withNotes = S.entries.filter(e => (e.note && e.note.trim()) || (e.quote && e.quote.trim()));
  const bookIds = [...new Set(withNotes.map(e => e.bookId))];
  if (ui.notesBook !== 'all' && !bookIds.includes(ui.notesBook)) ui.notesBook = 'all';
  const list = withNotes.filter(e => ui.notesBook === 'all' || e.bookId === ui.notesBook)
    .sort((a, b) => b.date.localeCompare(a.date) || (b.at || 0) - (a.at || 0));
  return `
  <div class="page-title"><h1>Notlar ve alıntılar</h1></div>
  ${bookIds.length > 1 ? `<div class="chips" style="margin-bottom:16px">
    <button class="chip ${ui.notesBook === 'all' ? 'on' : ''}" data-act="notesBook" data-id="all">Tümü</button>
    ${bookIds.map(id => { const b = S.books[id] || bookOf(withNotes.find(e => e.bookId === id)); return `<button class="chip ${ui.notesBook === id ? 'on' : ''}" data-act="notesBook" data-id="${esc(id)}">${cover(b)}${esc(b.title)}</button>`; }).join('')}
  </div>` : ''}
  ${list.length ? `<div class="card">${list.map(e => entryRow(e, true)).join('')}</div>` :
    `<div class="card empty-big">Henüz not ya da alıntı yok.<br>Kayıt girerken altta not ve alıntı ekleyebilirsin.</div>`}
  `;
}

function viewSettings() {
  const p = S.profile;
  const total = S.entries.length;
  const seg = (name, val, opts) => `<div class="seg">${opts.map(([v, l]) => `<button data-act="setPref" data-k="${name}" data-v="${v}" class="${val === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  return `
  <div class="page-title"><button class="round" data-act="nav" data-view="home" aria-label="Geri">${icon('left')}</button><h1>Ayarlar</h1></div>
  <div class="stack">
    <div class="card">
      <div class="set-row"><span>Adın</span><input class="input" style="width:200px;text-align:left" data-pref="name" value="${esc(p.name)}" placeholder="Adın"></div>
      <div class="set-row"><span>Günlük sayfa hedefi</span><input class="input" type="number" inputmode="numeric" min="1" data-pref="dailyGoal" value="${p.dailyGoal}"></div>
      <div class="set-row"><span>${new Date().getFullYear()} kitap hedefi</span><input class="input" type="number" inputmode="numeric" min="1" data-pref="yearGoal" value="${p.yearGoal}"></div>
      <div class="set-row"><span>Tema</span>${seg('theme', p.theme, [['system', 'Otomatik'], ['light', 'Açık'], ['dark', 'Koyu']])}</div>
    </div>
    <div class="card">
      <div class="set-row"><div><b>Yedek al</b><div class="mute small">Tüm kitaplar, kayıtlar ve notlar tek dosyada.${p.lastBackup ? ` Son yedek: ${fmtDate(p.lastBackup, true)}.` : ''}</div></div><button class="btn sm" data-act="exportData">${icon('download', 18)}İndir</button></div>
      <div class="set-row"><div><b>Yedekten geri yükle</b><div class="mute small">Mevcut verilerin yerine yedekteki gelir.</div></div><label class="btn sm ghost filebtn">${icon('upload', 18)}Dosya seç<input type="file" accept="application/json,.json" data-act-change="importData"></label></div>
      <div class="set-row"><div><b>Tüm verileri sil</b><div class="mute small">${booksArr().length} kitap, ${total} kayıt.</div></div><button class="btn sm danger" data-act="wipe">Sil</button></div>
    </div>
    <p class="mute small" style="text-align:center">Okuma Günlüğüm<span data-ver></span> · Veriler yalnızca bu cihazda saklanır.<br>Kitap arama: Google Books ve Open Library.</p>
  </div>`;
}

/* ============ Sayfa altı pencereler ============ */
function openSheet(html) {
  const root = $('#sheet');
  root.innerHTML = `<div class="backdrop" data-act="closeSheet"></div><div class="panel" role="dialog" aria-modal="true">${html}</div>`;
  root.classList.add('open');
  document.body.classList.add('noscroll');
  return $('.panel', root);
}
function closeSheet() {
  const root = $('#sheet');
  root.classList.remove('open');
  root.innerHTML = '';
  document.body.classList.remove('noscroll');
}
const head = title => `<div class="panel-head"><h2>${title}</h2><button class="xbtn" data-act="closeSheet" aria-label="Kapat">${icon('x', 20)}</button></div>`;

function confirmBox(msg, ok = 'Tamam', danger = false) {
  return new Promise(res => {
    const root = $('#confirm');
    root.innerHTML = `<div class="backdrop"></div><div class="panel"><div style="font-size:17px;line-height:1.5">${msg}</div>
      <div class="panel-foot"><button class="btn ghost grow" data-c="0">Vazgeç</button><button class="btn grow ${danger ? 'danger' : ''}" data-c="1">${ok}</button></div></div>`;
    root.classList.add('open');
    root.onclick = e => {
      const b = e.target.closest('[data-c]');
      if (!b && !e.target.classList.contains('backdrop')) return;
      root.classList.remove('open'); root.innerHTML = ''; root.onclick = null;
      res(!!b && b.dataset.c === '1');
    };
  });
}
let toastT;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------- Gün detayı ---------- */
function openDay(k) {
  const es = (entriesByDate()[k] || []);
  const panel = openSheet(`${head(fmtLong(k))}
    ${es.length ? `<div class="kv" style="margin-top:0">
      <div><b>${sumPages(es)}</b><span>sayfa</span></div>
      <div><b>${fmtMin(sumMin(es))}</b><span>süre</span></div>
      <div><b>${new Set(es.map(e => e.bookId)).size}</b><span>kitap</span></div></div>
      <div class="card">${es.map(e => entryRow(e, false, { del: true })).join('')}</div>`
      : `<div class="card empty-big">Bu gün için kayıt yok.</div>`}
    <div class="panel-foot"><button class="btn grow" data-act="log" data-date="${k}">${icon('plus', 20)}Bu güne kayıt ekle</button></div>`);
  panel.dataset.day = k;
}

/* ---------- Kayıt gir / düzenle ---------- */
const DURS = [0, 15, 30, 45, 60, 90, 120];
function openLog({ entryId, bookId, date, minutes, fromTimer } = {}) {
  const editing = entryId ? S.entries.find(e => e.id === entryId) : null;
  let choices = booksArr().filter(b => b.status === 'reading').sort((a, b) => lastActivity(b) - lastActivity(a));
  const forced = editing ? editing.bookId : bookId;
  if (forced && S.books[forced] && !choices.some(b => b.id === forced)) choices.unshift(S.books[forced]);
  if (!editing && !choices.length) {
    toast('Önce okuduğun bir kitabı ekle');
    openAddBook();
    return;
  }
  const st = editing ? {
    bookId: editing.bookId, date: editing.date, from: editing.from || 0, to: editing.to || '', pages: editing.pages || '',
    minutes: editing.minutes || 0, note: editing.note || '', quote: editing.quote || '', finish: false,
  } : {
    bookId: forced || choices[0].id, date: date || todayKey(), from: 0, to: '', pages: '',
    minutes: minutes || 0, note: '', quote: '', finish: false,
  };
  if (!editing) st.from = (S.books[st.bookId] && S.books[st.bookId].currentPage) || 0;
  let showCustom = !DURS.includes(st.minutes);
  let error = '';
  const panel = openSheet('');

  const draw = () => {
    const b = S.books[st.bookId] || bookOf({ bookId: st.bookId, bookTitle: editing && editing.bookTitle });
    const t = todayKey(), y = addDays(t, -1);
    const canFinish = b.status !== 'done' && b.pages;
    panel.innerHTML = `${head(editing ? 'Kaydı düzenle' : 'Okuma kaydı')}
      ${editing ? `<div class="entry" style="margin-bottom:16px">${cover(b)}<div class="body"><div class="t">${esc(b.title)}</div><div class="m">${esc(b.author || '')}</div></div></div>` :
      `<div class="book-pick">${choices.map(c => `<button data-pick="${c.id}" class="${c.id === st.bookId ? 'on' : ''}">${cover(c)}<span>${esc(c.title)}</span></button>`).join('')}</div>`}
      <div class="field"><span class="flabel">Tarih</span>
        <div class="row" style="align-items:center">
          <div class="chips" style="flex:none">
            <button class="chip ${st.date === t ? 'on' : ''}" data-date="${t}">Bugün</button>
            <button class="chip ${st.date === y ? 'on' : ''}" data-date="${y}">Dün</button>
          </div>
          <input class="input" type="date" name="date" value="${st.date}" max="${t}">
        </div>
      </div>
      <div class="from-line"><span>Başladığın sayfa</span><input type="number" inputmode="numeric" min="0" name="from" value="${st.from}"></div>
      <div class="row">
        <div class="field"><label>Şimdi kaçıncı sayfadasın?</label><input class="input big" type="number" inputmode="numeric" min="0" name="to" value="${st.to}" placeholder="${st.from}"></div>
        <div class="field"><label>Okunan sayfa</label><input class="input big" type="number" inputmode="numeric" min="0" name="pages" value="${st.pages}" placeholder="0"></div>
      </div>
      ${b.pages ? `<div class="mute small" style="margin:-8px 0 14px">Kitap ${b.pages} sayfa${b.pages - num(st.to || st.from) > 0 ? ` · ${b.pages - num(st.to || st.from)} sayfa kaldı` : ''}</div>` : ''}
      <div class="field"><span class="flabel">Süre (isteğe bağlı)</span>
        <div class="chips">${DURS.map(m => `<button class="chip ${!showCustom && st.minutes === m ? 'on' : ''}" data-min="${m}">${m === 0 ? 'Girme' : fmtMin(m).replace(' sa', ' saat').replace('1 saat 30 dk', '1,5 saat')}</button>`).join('')}
          <button class="chip ${showCustom ? 'on' : ''}" data-min="custom">Diğer</button></div>
        ${showCustom ? `<input class="input" style="margin-top:8px" type="number" inputmode="numeric" min="0" name="minutes" value="${st.minutes || ''}" placeholder="Dakika">` : ''}
      </div>
      <div class="field"><label>Alıntı</label><textarea class="input" name="quote" rows="2" placeholder="Altını çizdiğin bir cümle…">${esc(st.quote)}</textarea></div>
      <div class="field"><label>Not</label><textarea class="input" name="note" rows="2" placeholder="Bugünkü okumaya dair düşüncelerin…">${esc(st.note)}</textarea></div>
      ${canFinish && !editing ? `<label class="check"><input type="checkbox" name="finish" ${st.finish ? 'checked' : ''}><span><b>Kitabı bitirdim</b><span class="hint">Kitap “Bitti” listesine geçer ve yıllık hedefe sayılır.</span></span></label>` : ''}
      ${error ? `<div class="err">${error}</div>` : ''}
      <div class="panel-foot">${editing ? `<button class="btn danger icon" data-act="delEntry" data-id="${editing.id}" aria-label="Sil">${icon('trash')}</button>` : ''}
        <button class="btn grow" data-save>${icon('check', 20)}Kaydet</button></div>`;
  };
  draw();

  panel.addEventListener('click', e => {
    const pick = e.target.closest('[data-pick]');
    if (pick) { st.bookId = pick.dataset.pick; st.from = S.books[st.bookId].currentPage || 0; st.to = ''; st.pages = ''; st.finish = false; draw(); return; }
    const dt = e.target.closest('[data-date]');
    if (dt) { st.date = dt.dataset.date; draw(); return; }
    const mn = e.target.closest('[data-min]');
    if (mn) {
      if (mn.dataset.min === 'custom') { showCustom = true; }
      else { showCustom = false; st.minutes = num(mn.dataset.min); }
      draw();
      if (showCustom) { const i = $('[name=minutes]', panel); if (i) i.focus(); }
      return;
    }
    if (e.target.closest('[data-save]')) doSave();
  });
  panel.addEventListener('input', e => {
    const n = e.target.name;
    if (!n) return;
    const v = e.target.value;
    if (n === 'date') { if (isKey(v)) st.date = v; return; }
    if (n === 'note' || n === 'quote') { st[n] = v; return; }
    if (n === 'finish') { st.finish = e.target.checked; return; }
    if (n === 'minutes') { st.minutes = num(v); return; }
    if (n === 'from') {
      st.from = num(v);
      if (st.to !== '') { st.pages = Math.max(0, num(st.to) - st.from); const p = $('[name=pages]', panel); if (p) p.value = st.pages; }
      return;
    }
    if (n === 'to') {
      st.to = v === '' ? '' : num(v);
      st.pages = v === '' ? '' : Math.max(0, num(v) - num(st.from));
      const p = $('[name=pages]', panel); if (p) p.value = st.pages;
      autoFinish();
      return;
    }
    if (n === 'pages') {
      st.pages = v === '' ? '' : num(v);
      st.to = v === '' ? '' : num(st.from) + num(v);
      const tt = $('[name=to]', panel); if (tt) tt.value = st.to;
      autoFinish();
    }
  });
  panel.addEventListener('change', e => { if (e.target.name === 'finish') st.finish = e.target.checked; });
  function autoFinish() {
    const b = S.books[st.bookId];
    const cb = $('[name=finish]', panel);
    if (b && b.pages && cb && st.to !== '' && num(st.to) >= b.pages && !cb.checked) { cb.checked = true; st.finish = true; }
  }
  function fail(msg) { error = msg; draw(); const er = $('.err', panel); if (er) er.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  function doSave() {
    const b = S.books[st.bookId];
    const from = num(st.from);
    const to = st.to === '' ? from : num(st.to);
    if (!isKey(st.date) || st.date > todayKey()) return fail('Geçerli bir tarih seç.');
    if (to < from) return fail('Şu anki sayfa, başladığın sayfadan küçük olamaz.');
    if (b && b.pages && to > b.pages) return fail(`Bu kitap ${b.pages} sayfa. Sayfa sayısı yanlışsa kitabı düzenleyebilirsin.`);
    const pages = to - from;
    if (!pages && !st.minutes && !st.note.trim() && !st.quote.trim() && !st.finish) return fail('Okuduğun sayfayı ya da süreyi gir.');
    const entry = {
      ...(editing || { id: uid(), at: Date.now() }),
      bookId: st.bookId, bookTitle: (b && b.title) || (editing && editing.bookTitle) || '',
      date: st.date, from, to, pages, minutes: st.minutes || 0,
      note: st.note.trim(), quote: st.quote.trim(), auto: false,
    };
    if (editing) S.entries[S.entries.indexOf(editing)] = entry;
    else S.entries.push(entry);
    if (b) {
      if (b.status === 'want') { b.status = 'reading'; b.startedAt = b.startedAt || st.date; }
      if (!b.startedAt || st.date < b.startedAt) b.startedAt = st.date;
      if (st.finish) { b.status = 'done'; b.finishedAt = st.date; }
      syncBook(b.id);
    }
    if (fromTimer) { timer = null; saveTimer(); }
    save();
    closeSheet();
    render();
    if (st.finish && b) celebrate(b);
    else toast(editing ? 'Kayıt güncellendi' : `Kaydedildi${pages ? ` · +${pages} sayfa` : ''}`);
  }
}
function celebrate(b) {
  const y = new Date().getFullYear();
  const n = finishedInYear(y).length;
  toast(`🎉 “${b.title}” bitti! ${y} için ${n}/${S.profile.yearGoal} kitap.`);
}

async function deleteEntry(id) {
  const e = S.entries.find(x => x.id === id);
  if (!e) return;
  if (!await confirmBox('Bu kayıt silinsin mi?', 'Sil', true)) return;
  S.entries = S.entries.filter(x => x.id !== id);
  syncBook(e.bookId);
  save();
  const pn = $('#sheet .panel');
  const day = pn && pn.dataset.day, bk = pn && pn.dataset.book;
  render();
  if (day) openDay(day); else if (bk && S.books[bk]) openBook(bk); else closeSheet();
  toast('Kayıt silindi');
}

/* ---------- Kitap ekle: arama ---------- */
let searchSeq = 0;
async function searchBooks(q) {
  const enc = encodeURIComponent(q);
  const g = fetch(`https://www.googleapis.com/books/v1/volumes?q=${enc}&maxResults=20&printType=books`)
    .then(r => r.ok ? r.json() : {}).then(d => (d.items || []).map(it => {
      const v = it.volumeInfo || {};
      let img = (v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)) || '';
      img = img.replace(/^http:/, 'https:').replace('&edge=curl', '');
      if (img && img.includes('books.google')) img += '&fife=w300-h450';
      return { title: [v.title, v.subtitle].filter(Boolean).join(': '), author: (v.authors || []).join(', '), pages: v.pageCount || 0, cover: img, year: (v.publishedDate || '').slice(0, 4), publisher: v.publisher || '' };
    })).catch(() => null);
  const o = fetch(`https://openlibrary.org/search.json?q=${enc}&limit=12&fields=title,author_name,number_of_pages_median,cover_i,first_publish_year`)
    .then(r => r.ok ? r.json() : {}).then(d => (d.docs || []).map(x => ({
      title: x.title || '', author: (x.author_name || []).slice(0, 3).join(', '), pages: x.number_of_pages_median || 0,
      cover: x.cover_i ? `https://covers.openlibrary.org/b/id/${x.cover_i}-M.jpg` : '', year: x.first_publish_year ? String(x.first_publish_year) : '', publisher: '',
    }))).catch(() => null);
  const [a, b] = await Promise.all([g, o]);
  if (a === null && b === null) throw new Error('offline');
  const seen = new Map();
  for (const r of [...(a || []), ...(b || [])]) {
    if (!r.title) continue;
    const key = lower(r.title).replace(/[^a-zçğıöşü0-9]/g, '') + '|' + lower(r.author).split(',')[0].replace(/[^a-zçğıöşü]/g, '');
    const prev = seen.get(key);
    if (!prev) seen.set(key, r);
    else { if (!prev.cover && r.cover) prev.cover = r.cover; if (!prev.pages && r.pages) prev.pages = r.pages; }
  }
  const list = [...seen.values()];
  return list.map((r, i) => [r, i]).sort((x, y) => ((y[0].cover ? 1 : 0) - (x[0].cover ? 1 : 0)) * 6 + (x[1] - y[1])).map(x => x[0]).slice(0, 24);
}
function openAddBook() {
  let results = [], q = '', state = 'idle';
  const panel = openSheet('');
  panel.innerHTML = `${head('Kitap ekle')}
    <div class="search-box">${icon('search')}<input class="input" name="q" type="search" placeholder="Kitap adı ya da yazar…" autocomplete="off" enterkeyhint="search"></div>
    <div class="results"></div>
    <div class="panel-foot"><button class="btn ghost grow" data-manual>${icon('pencil', 20)}Elle ekle</button></div>`;
  const box = $('.results', panel);
  const input = $('[name=q]', panel);
  const drawResults = () => {
    if (state === 'loading') box.innerHTML = `<div class="search-state"><div class="spinner"></div>Aranıyor…</div>`;
    else if (state === 'error') box.innerHTML = `<div class="search-state">Arama yapılamadı. İnternet bağlantını kontrol et ya da kitabı elle ekle.</div>`;
    else if (state === 'done' && !results.length) box.innerHTML = `<div class="search-state">Sonuç bulunamadı. Farklı yaz ya da elle ekle.</div>`;
    else if (state === 'idle') box.innerHTML = `<div class="search-state">Kitabın adını yaz, kapağı ve sayfa sayısıyla birlikte gelsin.</div>`;
    else box.innerHTML = results.map((r, i) => `<button class="result" data-r="${i}">${cover(r)}<div><div class="t">${esc(r.title)}</div><div class="m">${esc([r.author, r.year, r.pages ? r.pages + ' sf' : ''].filter(Boolean).join(' · '))}</div></div></button>`).join('');
  };
  drawResults();
  let deb;
  input.addEventListener('input', () => {
    q = input.value.trim();
    clearTimeout(deb);
    if (q.length < 2) { state = 'idle'; results = []; drawResults(); return; }
    deb = setTimeout(async () => {
      const my = ++searchSeq;
      state = 'loading'; drawResults();
      try { const r = await searchBooks(q); if (my !== searchSeq) return; results = r; state = 'done'; }
      catch (e) { if (my !== searchSeq) return; state = 'error'; }
      drawResults();
    }, 450);
  });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') input.blur(); });
  setTimeout(() => input.focus(), 50);
  panel.addEventListener('click', e => {
    const r = e.target.closest('[data-r]');
    if (r) { openBookForm({ prefill: results[num(r.dataset.r)] }); return; }
    if (e.target.closest('[data-manual]')) openBookForm({ prefill: { title: q } });
  });
}

/* ---------- Kitap formu ---------- */
function resizeImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const W = 300, H = 450;
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const ctx = c.getContext('2d');
      const s = Math.max(W / img.width, H / img.height);
      const w = img.width * s, h = img.height * s;
      ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
    img.src = url;
  });
}
function distribute(b, fromPage, toPage, startK, endK) {
  const n = diffDays(startK, endK) + 1;
  const total = toPage - fromPage;
  if (n < 1 || total <= 0) return 0;
  const base = Math.floor(total / n), rem = total % n;
  let cur = fromPage, made = 0;
  for (let i = 0; i < n; i++) {
    const p = base + (i < rem ? 1 : 0);
    if (p <= 0) continue;
    S.entries.push({ id: uid(), bookId: b.id, bookTitle: b.title, date: addDays(startK, i), from: cur, to: cur + p, pages: p, minutes: 0, note: '', quote: '', auto: true, at: Date.now() + i });
    cur += p; made++;
  }
  return made;
}
function openBookForm({ bookId, prefill } = {}) {
  const editing = bookId ? S.books[bookId] : null;
  const t = todayKey();
  const f = editing ? {
    title: editing.title, author: editing.author || '', pages: editing.pages || '', cover: editing.cover || '',
    status: editing.status, start: editing.startedAt || t, end: editing.finishedAt || t, current: '', spread: false,
  } : {
    title: (prefill && prefill.title) || '', author: (prefill && prefill.author) || '', pages: (prefill && prefill.pages) || '',
    cover: (prefill && prefill.cover) || '', status: 'reading', start: t, end: t, current: '', spread: true,
  };
  let error = '';
  const panel = openSheet('');
  const draw = () => {
    const statusSeg = `<div class="seg" style="margin-bottom:16px">${[['reading', 'Okuyorum'], ['want', 'Okunacak'], ['done', 'Bitirdim']].map(([v, l]) => `<button data-status="${v}" class="${f.status === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
    let extra = '';
    if (f.status === 'reading') {
      if (!editing) {
        const cur = num(f.current);
        extra = `<div class="row">
          <div class="field"><label>Şu an kaçıncı sayfadasın?</label><input class="input" type="number" inputmode="numeric" min="0" name="current" value="${f.current}" placeholder="0 (yeni başlıyorum)"></div>
          <div class="field"><label>Ne zaman başladın?</label><input class="input" type="date" name="start" value="${f.start}" max="${t}"></div></div>
          <label class="check ${cur > 0 ? '' : 'hidden'}" data-spreadbox><input type="checkbox" name="spread" ${f.spread ? 'checked' : ''}><span><b>Bu <span data-spreadn>${cur}</span> sayfayı takvime dağıt</b><span class="hint">${f.start < t ? `${fmtDate(f.start)} ile dün arasındaki günlere eşit bölünür.` : 'Bugünkü okumaya yazılır.'} İşaretlemezsen sadece kaldığın sayfa kaydedilir.</span></span></label>`;
      } else {
        extra = `<div class="field"><label>Başlama tarihi</label><input class="input" type="date" name="start" value="${f.start}" max="${t}"></div>`;
      }
    } else if (f.status === 'done') {
      extra = `<div class="row">
        <div class="field"><label>Başlama tarihi</label><input class="input" type="date" name="start" value="${f.start}" max="${t}"></div>
        <div class="field"><label>Bitirme tarihi</label><input class="input" type="date" name="end" value="${f.end}" max="${t}"></div></div>
        ${!editing ? `<label class="check"><input type="checkbox" name="spread" ${f.spread ? 'checked' : ''}><span><b>Sayfaları bu günlere eşit dağıt</b><span class="hint">Takvimde bu tarihler arasında kitabın kapağı görünür.</span></span></label>` : ''}`;
    }
    panel.innerHTML = `${head(editing ? 'Kitabı düzenle' : 'Kitap ekle')}
      <div class="cover-edit">${cover({ title: f.title || 'Kitap', cover: f.cover }, 'lg')}
        <div class="acts">
          <label class="btn sm ghost filebtn">${icon('image', 18)}Kapak fotoğrafı<input type="file" accept="image/*" name="coverFile"></label>
          ${f.cover ? `<button class="btn sm ghost" data-rmcover>Kapağı kaldır</button>` : ''}
          ${!editing ? `<button class="linkbtn small" data-back>← Aramaya dön</button>` : ''}
        </div></div>
      <div class="field"><label>Kitap adı</label><input class="input" name="title" value="${esc(f.title)}" placeholder="Kitap adı"></div>
      <div class="row">
        <div class="field"><label>Yazar</label><input class="input" name="author" value="${esc(f.author)}" placeholder="Yazar"></div>
        <div class="field" style="flex:.6"><label>Sayfa sayısı</label><input class="input" type="number" inputmode="numeric" min="1" name="pages" value="${f.pages}" placeholder="Örn. 264"></div>
      </div>
      <span class="flabel">Durum</span>${statusSeg}
      ${extra}
      ${error ? `<div class="err">${error}</div>` : ''}
      <div class="panel-foot">${editing ? `<button class="btn danger icon" data-del aria-label="Kitabı sil">${icon('trash')}</button>` : ''}<button class="btn grow" data-save>${icon('check', 20)}${editing ? 'Kaydet' : 'Kitabı ekle'}</button></div>`;
  };
  draw();
  panel.addEventListener('input', e => {
    const n = e.target.name; if (!n || n === 'coverFile' || n === 'spread') return;
    f[n] = e.target.value;
    if (n === 'current') {
      const cur = num(f.current);
      const box = $('[data-spreadbox]', panel);
      if (box) { box.classList.toggle('hidden', !(cur > 0)); const b = $('[data-spreadn]', panel); if (b) b.textContent = cur; }
    }
  });
  panel.addEventListener('change', async e => {
    if (e.target.name === 'spread') { f.spread = e.target.checked; return; }
    if (e.target.name === 'start' || e.target.name === 'end') { f[e.target.name] = e.target.value; draw(); return; }
    if (e.target.name === 'coverFile' && e.target.files && e.target.files[0]) {
      try { f.cover = await resizeImage(e.target.files[0]); draw(); }
      catch (err) { toast('Fotoğraf açılamadı'); }
    }
  });
  panel.addEventListener('click', async e => {
    const s = e.target.closest('[data-status]');
    if (s) { f.status = s.dataset.status; error = ''; draw(); return; }
    if (e.target.closest('[data-rmcover]')) { f.cover = ''; draw(); return; }
    if (e.target.closest('[data-back]')) { openAddBook(); return; }
    if (e.target.closest('[data-del]')) { deleteBook(editing.id); return; }
    if (e.target.closest('[data-save]')) save_();
  });
  function fail(m) { error = m; draw(); const er = $('.err', panel); if (er) er.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  function save_() {
    const title = f.title.trim();
    const pages = num(f.pages);
    if (!title) return fail('Kitap adını yaz.');
    if (f.status !== 'want' && !pages) return fail('Sayfa sayısını gir; ilerleme ve tahminler buna göre hesaplanıyor.');
    if (!isKey(f.start) || f.start > t) return fail('Geçerli bir başlama tarihi seç.');
    if (f.status === 'done' && (!isKey(f.end) || f.end > t || f.end < f.start)) return fail('Bitirme tarihi, başlama tarihinden önce olamaz.');
    if (editing) {
      const b = editing;
      b.title = title; b.author = f.author.trim(); b.pages = pages || 0; b.cover = f.cover;
      if (b.status !== f.status) {
        if (f.status === 'done') b.finishedAt = f.end || t;
        else b.finishedAt = null;
        if (f.status === 'reading' && !b.startedAt) b.startedAt = f.start;
      }
      b.status = f.status;
      if (f.status !== 'want') b.startedAt = f.start;
      if (f.status === 'done') b.finishedAt = f.end;
      S.entries.forEach(e => { if (e.bookId === b.id) e.bookTitle = b.title; });
      syncBook(b.id);
      save(); closeSheet(); render(); toast('Kitap güncellendi');
      return;
    }
    const cur = Math.min(num(f.current), pages || num(f.current));
    const b = { id: uid(), title, author: f.author.trim(), pages, cover: f.cover, status: f.status, addedAt: Date.now(), startedAt: null, finishedAt: null, basePage: 0, currentPage: 0 };
    S.books[b.id] = b;
    let msg = 'Kitap eklendi';
    if (f.status === 'reading') {
      b.startedAt = f.start;
      if (cur > 0) {
        if (f.spread) {
          const endK = f.start < t ? addDays(t, -1) : t;
          const n = distribute(b, 0, cur, f.start, endK);
          msg = `Kitap eklendi · ${cur} sayfa ${n} güne dağıtıldı`;
        } else b.basePage = cur;
      }
    } else if (f.status === 'done') {
      b.startedAt = f.start; b.finishedAt = f.end;
      if (f.spread) { const n = distribute(b, 0, pages, f.start, f.end); msg = `Kitap eklendi · ${n} güne dağıtıldı`; }
      else b.basePage = pages;
    }
    syncBook(b.id);
    save(); closeSheet();
    ui.booksTab = f.status;
    render(); toast(msg);
  }
}
async function deleteBook(id) {
  const b = S.books[id]; if (!b) return;
  const n = S.entries.filter(e => e.bookId === id).length;
  if (!await confirmBox(`“${esc(b.title)}” silinsin mi?${n ? `<br><span class="mute">Bu kitaba ait ${n} kayıt da silinecek.</span>` : ''}`, 'Sil', true)) return;
  delete S.books[id];
  S.entries = S.entries.filter(e => e.bookId !== id);
  if (timer && timer.bookId === id) { timer = null; saveTimer(); }
  save(); closeSheet(); render(); toast('Kitap silindi');
}

/* ---------- Kitap detayı ---------- */
function openBook(id) {
  const b = S.books[id];
  if (!b) { toast('Bu kitap silinmiş'); return; }
  const s = bookStats(b);
  const statusTxt = { reading: 'Okuyorum', want: 'Okunacak', done: 'Bitti' }[b.status];
  const dates = [];
  if (b.startedAt) dates.push(`Başlangıç: ${fmtDate(b.startedAt, true)}`);
  if (b.status === 'done' && b.finishedAt) dates.push(`Bitiş: ${fmtDate(b.finishedAt, true)}`);
  const es = s.es.slice().sort((a, c) => c.date.localeCompare(a.date) || (c.at || 0) - (a.at || 0));
  let kv = '';
  if (b.status === 'reading') {
    kv = `<div class="kv">
      <div><b>${s.left}</b><span>sayfa kaldı</span></div>
      <div><b>${s.perDay ? Math.round(s.perDay) : '–'}</b><span>günlük ort. sayfa</span></div>
      <div><b>${s.finishDate ? fmtDate(s.finishDate) : '–'}</b><span>tahmini bitiş</span></div>
      <div><b>${s.hoursLeft ? fmtHours(s.hoursLeft) : '–'}</b><span>tahmini kalan süre</span></div>
      <div><b>${s.speed ? Math.round(s.speed) : '–'}</b><span>sayfa / saat</span></div>
      <div><b>${s.days}</b><span>okuma günü</span></div></div>`;
  } else if (b.status === 'done') {
    const span = b.startedAt && b.finishedAt ? diffDays(b.startedAt, b.finishedAt) + 1 : s.days;
    kv = `<div class="kv">
      <div><b>${span || '–'}</b><span>günde bitti</span></div>
      <div><b>${s.minutes ? fmtMin(s.minutes) : '–'}</b><span>toplam süre</span></div>
      <div><b>${span && b.pages ? Math.round(b.pages / span) : '–'}</b><span>günlük ort. sayfa</span></div></div>`;
  }
  const panel = openSheet(`${head(statusTxt)}
    <div class="bk-hero">${cover(b, 'lg')}
      <div style="flex:1;min-width:0"><h2>${esc(b.title)}</h2>
        ${b.author ? `<div class="mute">${esc(b.author)}</div>` : ''}
        <div class="mute small" style="margin-top:8px">${b.pages ? `${b.pages} sayfa` : ''}${dates.length ? ' · ' + dates.join(' · ') : ''}</div>
        ${b.status === 'reading' && b.pages ? `<div style="margin-top:12px" class="mute">Sayfa <b style="color:var(--ink)">${b.currentPage || 0}</b>/${b.pages} · %${s.pct}</div><div class="bar" style="margin-top:6px"><i style="width:${s.pct}%"></i></div>` : ''}
      </div></div>
    ${kv}
    <div class="btn-row">
      ${b.status !== 'done' ? `<button class="btn grow" data-act="log" data-id="${b.id}">${icon('pencil', 20)}Kayıt gir</button>` : ''}
      ${b.status === 'reading' ? `<button class="btn soft" data-act="finishBook" data-id="${b.id}">${icon('check', 20)}Bitirdim</button>` : ''}
      ${b.status === 'want' ? `<button class="btn soft" data-act="startBook" data-id="${b.id}">${icon('bookOpen', 20)}Okumaya başla</button>` : ''}
      <button class="btn ghost" data-act="editBook" data-id="${b.id}">${icon('pencil', 18)}Düzenle</button>
    </div>
    ${es.length ? `<div class="section-label"><span>Kayıtlar</span><span>${s.pagesRead} sf${s.minutes ? ' · ' + fmtMin(s.minutes) : ''}</span></div>
      <div class="card">${es.map(e => entryRow(e, true, { del: true })).join('')}</div>` : ''}
  `);
  panel.dataset.book = id;
}
async function finishBook(id) {
  const b = S.books[id]; if (!b) return;
  if (!await confirmBox(`“${esc(b.title)}” bugün bitti olarak işaretlensin mi?<br><span class="mute small">Tarihi sonra “Düzenle”den değiştirebilirsin.</span>`, 'Bitirdim')) return;
  b.status = 'done'; b.finishedAt = todayKey(); b.startedAt = b.startedAt || todayKey();
  syncBook(id); save(); closeSheet(); render(); celebrate(b);
}
function startBook(id) {
  const b = S.books[id]; if (!b) return;
  b.status = 'reading'; b.startedAt = todayKey(); syncBook(id); save(); closeSheet(); render(); toast('Okuyorum listesine eklendi');
}

/* ---------- Sayaç ---------- */
function startTimer(bookId) {
  if (timer && timer.bookId !== bookId) {
    confirmBox('Başka bir kitap için açık bir sayaç var. Onu kapatıp bu kitap için başlatayım mı?', 'Başlat').then(ok => { if (ok) { timer = null; startTimer(bookId); } });
    return;
  }
  timer = { bookId, start: Date.now(), acc: 0, running: true };
  saveTimer(); render(); openTimer();
}
function openTimer() {
  if (!timer) return;
  const b = S.books[timer.bookId] || { title: 'Kitap' };
  const panel = openSheet('');
  const draw = () => {
    panel.innerHTML = `${head('Okuma sayacı')}
      <div class="entry" style="justify-content:center">${cover(b)}<div class="body" style="flex:none"><div class="t">${esc(b.title)}</div><div class="m">${esc(b.author || '')}</div></div></div>
      <div class="clock" data-clock>${fmtClock(timerMs())}</div>
      <div class="clock-sub">${timer.running ? 'Sayaç çalışıyor · uygulamayı kapatsan da sayar' : 'Duraklatıldı'}</div>
      <div class="btn-row">
        <button class="btn ghost grow" data-t="toggle">${icon(timer.running ? 'pause' : 'play', 20)}${timer.running ? 'Duraklat' : 'Devam et'}</button>
        <button class="btn grow" data-t="finish">${icon('check', 20)}Bitir ve kaydet</button>
      </div>
      <div style="text-align:center;margin-top:14px"><button class="linkbtn small" data-t="cancel" style="color:var(--danger)">Sayacı iptal et</button></div>`;
  };
  draw();
  panel.addEventListener('click', async e => {
    const a = e.target.closest('[data-t]'); if (!a || !timer) return;
    const k = a.dataset.t;
    if (k === 'toggle') {
      if (timer.running) { timer.acc += Date.now() - timer.start; timer.running = false; }
      else { timer.start = Date.now(); timer.running = true; }
      saveTimer(); draw(); render();
    } else if (k === 'finish') {
      if (timer.running) { timer.acc += Date.now() - timer.start; timer.running = false; saveTimer(); }
      const mins = Math.max(5, Math.round(timer.acc / 60000 / 5) * 5);
      render();
      openLog({ bookId: timer.bookId, minutes: mins, fromTimer: true });
    } else if (k === 'cancel') {
      if (await confirmBox('Sayaç iptal edilsin mi? Süre kaydedilmez.', 'İptal et', true)) { timer = null; saveTimer(); closeSheet(); render(); }
    }
  });
}

/* ---------- Yedek ---------- */
async function exportData() {
  const data = JSON.stringify({ app: 'okuma-gunlugum', exportedAt: new Date().toISOString(), ...S }, null, 1);
  const name = `okuma-gunlugum-yedek-${todayKey()}.json`;
  if (isNative) {
    try {
      const r = await plug('Filesystem').writeFile({ path: name, data, directory: 'CACHE', encoding: 'utf8' });
      try {
        await plug('Share').share({ title: 'Okuma Günlüğüm yedeği', files: [r.uri], dialogTitle: 'Yedeği kaydet ya da gönder' });
      } catch (e) {
        if (!/cancel/i.test(String(e && e.message))) throw e;
        return;
      }
    } catch (e) {
      toast('Yedek oluşturulamadı');
      return;
    }
  } else {
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  S.profile.lastBackup = todayKey();
  save(); render();
  toast(isNative ? 'Yedek hazır' : 'Yedek dosyası indirildi');
}
async function importData(file) {
  try {
    const d = JSON.parse(await file.text());
    if (!d || typeof d !== 'object' || !d.books || !Array.isArray(d.entries)) throw new Error('format');
    const nb = Object.keys(d.books).length;
    if (!await confirmBox(`Yedekte ${nb} kitap ve ${d.entries.length} kayıt var. Mevcut verilerin yerine yüklensin mi?`, 'Yükle')) return;
    S = normalize(d);
    S.profile.onboarded = true;
    save(); render(); toast('Yedek yüklendi');
  } catch (e) { toast('Bu dosya okunamadı'); }
}
async function wipe() {
  if (!await confirmBox('Tüm kitaplar, kayıtlar ve notlar silinsin mi? Bu geri alınamaz. Önce yedek almak isteyebilirsin.', 'Hepsini sil', true)) return;
  const prof = { ...S.profile };
  S = defaults(); S.profile = { ...S.profile, name: prof.name, dailyGoal: prof.dailyGoal, yearGoal: prof.yearGoal, theme: prof.theme, onboarded: true };
  timer = null; saveTimer(); save(); render(); toast('Tüm veriler silindi');
}

/* ---------- İlk açılış ---------- */
function onboarding() {
  const panel = openSheet(`<div class="panel-head"><h2>Okuma Günlüğüm’e hoş geldin 📚</h2></div>
    <p class="mute" style="margin-top:-6px">Okuduğun sayfaları gir, gerisini uygulama hesaplasın. Önce birkaç küçük ayar:</p>
    <div class="field"><label>Adın</label><input class="input" name="name" placeholder="Adın" value="${esc(S.profile.name)}"></div>
    <div class="row">
      <div class="field"><label>${new Date().getFullYear()} için kaç kitap hedefliyorsun?</label><input class="input" type="number" inputmode="numeric" min="1" name="yearGoal" placeholder="Örn. 12"></div>
      <div class="field"><label>Günlük sayfa hedefi</label><input class="input" type="number" inputmode="numeric" min="1" name="dailyGoal" value="${S.profile.dailyGoal}"></div>
    </div>
    <div class="err hidden"></div>
    <div class="panel-foot"><button class="btn grow" data-go>Başla</button></div>`);
  $('#sheet .backdrop').removeAttribute('data-act');
  panel.addEventListener('click', e => {
    if (!e.target.closest('[data-go]')) return;
    const yg = num($('[name=yearGoal]', panel).value), dg = num($('[name=dailyGoal]', panel).value);
    const er = $('.err', panel);
    if (yg < 1) { er.textContent = 'Yıllık kitap hedefini yaz (sonra Ayarlar’dan değiştirebilirsin).'; er.classList.remove('hidden'); return; }
    S.profile.name = $('[name=name]', panel).value.trim();
    S.profile.yearGoal = yg;
    S.profile.dailyGoal = dg > 0 ? dg : 40;
    S.profile.onboarded = true;
    save(); closeSheet(); render();
    if (!booksArr().length) setTimeout(openAddBook, 250);
  });
}

/* ============ Olaylar ============ */
const actions = {
  nav: el => { ui.view = el.dataset.view; closeSheet(); render(); window.scrollTo(0, 0); },
  day: el => openDay(el.dataset.key),
  log: el => openLog({ bookId: el.dataset.id, date: el.dataset.date }),
  editEntry: el => openLog({ entryId: el.dataset.id }),
  delEntry: el => deleteEntry(el.dataset.id),
  addBook: () => openAddBook(),
  book: el => openBook(el.dataset.id),
  editBook: el => openBookForm({ bookId: el.dataset.id }),
  finishBook: el => finishBook(el.dataset.id),
  startBook: el => startBook(el.dataset.id),
  startTimer: el => startTimer(el.dataset.id),
  openTimer: () => openTimer(),
  closeSheet: () => closeSheet(),
  calPrev: () => { ui.calMonth = new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() - 1, 1); render(); },
  calNext: () => { ui.calMonth = new Date(ui.calMonth.getFullYear(), ui.calMonth.getMonth() + 1, 1); render(); },
  calToday: () => { const d = new Date(); ui.calMonth = new Date(d.getFullYear(), d.getMonth(), 1); render(); },
  booksTab: el => { ui.booksTab = el.dataset.tab; render(); },
  notesBook: el => { ui.notesBook = el.dataset.id; render(); },
  setPref: el => { S.profile[el.dataset.k] = el.dataset.v; save(); render(); },
  exportData: () => exportData(),
  wipe: () => wipe(),
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.actChange === 'importData' && el.files && el.files[0]) { importData(el.files[0]); el.value = ''; return; }
  if (el.dataset.pref) {
    const k = el.dataset.pref;
    if (k === 'name') S.profile.name = el.value.trim();
    else { const n = num(el.value); if (n > 0) S.profile[k] = n; }
    save(); render(); toast('Kaydedildi');
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#sheet').classList.contains('open') && !$('#confirm').classList.contains('open') && S.profile.onboarded) closeSheet();
});
// Gün değişince (uygulama gece açık kalırsa) yenile
let lastDay = todayKey();
document.addEventListener('visibilitychange', () => { if (!document.hidden && todayKey() !== lastDay) { lastDay = todayKey(); render(); } });

/* ============ Başlat ============ */
render();
if (!S.profile.onboarded) onboarding();
if (isNative) {
  try {
    plug('App').addListener('backButton', () => {
      if ($('#confirm').classList.contains('open')) { const bd = $('#confirm .backdrop'); if (bd) bd.click(); return; }
      if ($('#sheet').classList.contains('open')) { if (S.profile.onboarded) closeSheet(); return; }
      if (ui.view !== 'home') { ui.view = 'home'; render(); window.scrollTo(0, 0); return; }
      plug('App').exitApp();
    });
  } catch (e) {}
} else if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
})();
