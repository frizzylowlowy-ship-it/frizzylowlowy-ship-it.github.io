if (!DB.me()) location.replace('login.html');

const LOADER_ERRORS = {
  invalid_key: 'Неверный или уже использованный ключ',
  banned: 'Аккаунт заблокирован',
  hwid_mismatch: 'Ключ привязан к другому устройству',
};

function row(icon, label, value) {
  return `<div class="info-row">
    <div class="info-label"><i class="${icon}"></i> ${label}</div>
    <div class="info-value">${value}</div>
  </div>`;
}

function render() {
  const u = DB.me();
  if (!u) return location.replace('login.html');

  document.getElementById('info').innerHTML = [
    row('fa-solid fa-fingerprint', 'UID', u.uid),
    row('fa-solid fa-tag', 'Логин', esc(u.login)),
    row('fa-solid fa-hammer', 'Группа', u.group),
    row('fa-solid fa-calendar-days', 'Дата регистрации', fmtDate(u.registeredAt)),
    row('fa-solid fa-calendar-days', 'Последний вход', fmtDate(u.lastLoginAt)),
    row('fa-brands fa-discord', 'Discord ID', u.discordId),
    row('fa-solid fa-desktop', 'HWID', u.hwid),
    row('fa-solid fa-star', 'Подписка', u.blocked ? 'Заблокирован' : `${u.sub} — навсегда`),
    `<div class="info-row">
      <div class="info-label"><i class="fa-solid fa-key"></i> Ключ</div>
      <div class="info-value split">
        <span class="grow mono">${u.key}</span>
        <button class="btn btn-dark" id="copyKey" title="Скопировать"><i class="fa-regular fa-copy"></i></button>
        <button class="btn" id="changeKey" ${u.blocked ? 'disabled' : ''}><i class="fa-solid fa-rotate"></i> Сменить</button>
      </div>
    </div>`,
  ].join('');

  document.getElementById('adminLink').hidden = u.group !== 'Admin';

  document.getElementById('copyKey').onclick = () => {
    navigator.clipboard.writeText(u.key).then(() => toast('Ключ скопирован'), () => toast('Не удалось скопировать'));
  };
  document.getElementById('changeKey').onclick = () => {
    DB.changeKey(u.uid);
    render();
    toast('Ключ изменён');
  };
}

document.getElementById('logoutBtn').onclick = () => {
  DB.logout();
  location.href = 'index.html';
};

const modal = document.getElementById('loaderModal');
const keyInput = document.getElementById('loaderKey');
const err = document.getElementById('loaderErr');

document.getElementById('loaderTest').onclick = () => {
  keyInput.value = DB.me().key;
  err.classList.remove('show');
  modal.classList.add('show');
};
document.getElementById('loaderCancel').onclick = () => modal.classList.remove('show');
document.getElementById('loaderOk').onclick = () => {
  const res = DB.loaderAuth(keyInput.value, 'DEMO-PC-' + navigator.platform.replace(/\W/g, '').toUpperCase());
  if (!res.ok) {
    err.textContent = LOADER_ERRORS[res.error];
    err.classList.add('show');
    return;
  }
  modal.classList.remove('show');
  render();
  toast('Лоадер авторизован — ключ заменён на новый');
};

render();
