const SITE_NAME = 'ECLYPSE';
const DISCORD_URL = '#';

function renderLayout() {
  const nav = document.getElementById('nav');
  if (nav) {
    nav.className = 'nav';
    nav.innerHTML = `
      <div class="container">
        <a href="index.html" class="logo">${SITE_NAME}</a>
        <span class="nav-sep"></span>
        <div class="lang">
          <button class="lang-btn" type="button"><span class="flag">🇷🇺</span> Русский <i class="fa-solid fa-chevron-down"></i></button>
          <div class="lang-menu">
            <div><span>🇷🇺</span> Русский</div>
            <div class="off"><span>🇺🇸</span> English (скоро)</div>
          </div>
        </div>
        <button class="nav-burger" type="button" aria-label="Меню"><i class="fa-solid fa-bars"></i></button>
        <nav class="nav-links">
          <a href="${DISCORD_URL}"><i class="fa-solid fa-headset"></i> Поддержка</a>
          <a href="#" data-download><i class="fa-solid fa-download"></i> Скачать лоадер</a>
          <a href="buy.html"><i class="fa-solid fa-bag-shopping"></i> Купить лицензию</a>
          <a href="cabinet.html" class="btn"><i class="fa-solid fa-user"></i> Личный кабинет</a>
        </nav>
      </div>`;
    const lang = nav.querySelector('.lang');
    lang.querySelector('.lang-btn').onclick = (e) => { e.stopPropagation(); lang.classList.toggle('open'); };
    document.addEventListener('click', () => lang.classList.remove('open'));
    nav.querySelector('.nav-burger').onclick = () => nav.querySelector('.nav-links').classList.toggle('open');
  }

  const footer = document.getElementById('footer');
  if (footer) {
    footer.className = 'footer';
    footer.innerHTML = `
      <div class="container">
        <span>© ${new Date().getFullYear()} ${SITE_NAME}</span>
        <a href="${DISCORD_URL}"><i class="fa-brands fa-discord"></i> Discord</a>
      </div>`;
  }

  document.querySelectorAll('[data-download]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      DB.download();
      toast('Лоадер пока в разработке — скоро здесь будет файл');
    });
  });

  DB.heartbeat();
}

function toast(text) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove('show'), 2500);
}

function fmtDate(ts) {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

document.addEventListener('DOMContentLoaded', renderLayout);
