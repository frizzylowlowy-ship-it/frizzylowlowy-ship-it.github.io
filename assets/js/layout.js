const SITE_NAME = 'ECLYPSE';
const DISCORD_URL = '#';

// Inline SVG flags: emoji flags render as plain letters on Windows.
const FLAGS = {
  ru: '<svg class="flag" viewBox="0 0 9 6" aria-hidden="true"><rect width="9" height="2" fill="#fff"/><rect y="2" width="9" height="2" fill="#0039a6"/><rect y="4" width="9" height="2" fill="#d52b1e"/></svg>',
  en: '<svg class="flag" viewBox="0 0 19 10" aria-hidden="true"><rect width="19" height="10" fill="#b22234"/><path d="M0 1.15h19M0 2.7h19M0 4.23h19M0 5.77h19M0 7.3h19M0 8.85h19" stroke="#fff" stroke-width=".77"/><rect width="7.6" height="5.38" fill="#3c3b6e"/></svg>',
};
const LANG_NAMES = { ru: 'Русский', en: 'English' };

function renderNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const lang = getLang();
  const page = location.pathname.split('/').pop() || 'index.html';
  const link = (href, icon, key) =>
    `<a href="${href}" class="${page === href ? 'active' : ''}"><i class="${icon}"></i> <span>${t(key)}</span></a>`;

  nav.className = 'nav';
  nav.innerHTML = `
    <div class="container">
      <a href="index.html" class="logo">${SITE_NAME}</a>
      <span class="nav-sep"></span>
      <div class="lang">
        <button class="lang-btn" type="button" aria-haspopup="true" aria-expanded="false">
          ${FLAGS[lang]} <span>${LANG_NAMES[lang]}</span> <i class="fa-solid fa-chevron-down"></i>
        </button>
        <div class="lang-menu" role="menu">
          ${Object.keys(LANG_NAMES).map((l) => `
            <button type="button" role="menuitem" data-lang="${l}" class="${l === lang ? 'current' : ''}">
              ${FLAGS[l]} ${LANG_NAMES[l]}
            </button>`).join('')}
        </div>
      </div>
      <button class="nav-burger" type="button" aria-label="${t('nav.menu')}" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>
      <nav class="nav-links">
        <a href="${DISCORD_URL}"><i class="fa-solid fa-headset"></i> <span>${t('nav.support')}</span></a>
        <a href="#" data-download><i class="fa-solid fa-download"></i> <span>${t('nav.download')}</span></a>
        ${link('buy.html', 'fa-solid fa-bag-shopping', 'nav.buy')}
        <a href="cabinet.html" class="btn"><i class="fa-solid fa-user"></i> ${t('nav.account')}</a>
      </nav>
    </div>`;

  const langBox = nav.querySelector('.lang');
  const langBtn = langBox.querySelector('.lang-btn');
  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = langBox.classList.toggle('open');
    langBtn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', () => {
    langBox.classList.remove('open');
    langBtn.setAttribute('aria-expanded', 'false');
  });
  langBox.querySelectorAll('[data-lang]').forEach((b) => {
    b.addEventListener('click', () => { if (b.dataset.lang !== lang) setLang(b.dataset.lang); });
  });

  const burger = nav.querySelector('.nav-burger');
  burger.addEventListener('click', () => {
    const open = nav.querySelector('.nav-links').classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-brand">
        <span class="logo">${SITE_NAME}</span>
        <span>© ${new Date().getFullYear()} ${SITE_NAME}. ${t('footer.rights')}</span>
      </div>
      <nav class="footer-links">
        <a href="${DISCORD_URL}">${t('nav.support')}</a>
        <a href="buy.html">${t('nav.buy')}</a>
        <a href="cabinet.html">${t('nav.account')}</a>
      </nav>
      <a href="${DISCORD_URL}" class="footer-social" aria-label="Discord"><i class="fa-brands fa-discord"></i></a>
    </div>`;
}

// FAQ accordion: animated, only one item open at a time.
function initAccordions() {
  document.querySelectorAll('[data-acc]').forEach((acc) => {
    const items = acc.querySelectorAll('.acc-item');
    items.forEach((item) => {
      const head = item.querySelector('.acc-head');
      head.addEventListener('click', () => {
        const willOpen = !item.classList.contains('open');
        items.forEach((other) => {
          other.classList.remove('open');
          other.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          item.classList.add('open');
          head.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el) => io.observe(el));
}

function openModal(id) {
  const m = document.getElementById(id);
  m.classList.add('show');
  const first = m.querySelector('input, select, button');
  if (first) setTimeout(() => first.focus(), 50);
}
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}
function initModals() {
  document.querySelectorAll('.modal-bg').forEach((bg) => {
    bg.addEventListener('mousedown', (e) => { if (e.target === bg) bg.classList.remove('show'); });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.querySelectorAll('.modal-bg.show').forEach((m) => m.classList.remove('show'));
  });
}

function toast(text, type = 'ok') {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-check'}"></i> <span></span>`;
  el.querySelector('span').textContent = text;
  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
}

function fmtDate(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

applyI18n();
renderNav();
renderFooter();
initAccordions();
initReveal();
initModals();

document.querySelectorAll('[data-download]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    DB.download();
    toast(t('toast.loaderSoon'));
  });
});

DB.heartbeat();
