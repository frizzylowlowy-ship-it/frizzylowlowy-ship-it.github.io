if (!DB.me()) location.replace('login.html');

function row(icon, label, value) {
  return `<div class="info-row">
    <div class="info-label"><i class="${icon}"></i> ${label}</div>
    <div class="info-value">${value}</div>
  </div>`;
}

function render() {
  const u = DB.me();
  if (!u) return location.replace('login.html');

  const hwid = u.hwid === 'Unknown' ? `<span class="muted">${t('cab.unlinked')}</span>` : esc(u.hwid);
  document.getElementById('info').innerHTML = [
    row('fa-solid fa-fingerprint', 'UID', u.uid),
    row('fa-solid fa-tag', t('cab.login'), esc(u.login)),
    row('fa-solid fa-hammer', t('cab.group'), u.group),
    row('fa-solid fa-calendar-days', t('cab.reg'), fmtDate(u.registeredAt)),
    row('fa-solid fa-calendar-days', t('cab.last'), fmtDate(u.lastLoginAt)),
    row('fa-brands fa-discord', 'Discord ID', esc(u.discordId)),
    row('fa-solid fa-desktop', 'HWID', hwid),
    row('fa-solid fa-star', t('cab.sub'), u.blocked ? `<span class="blocked">${t('cab.banned')}</span>` : `${u.sub} — ${t('cab.forever')}`),
    `<div class="info-row">
      <div class="info-label"><i class="fa-solid fa-key"></i> ${t('cab.key')}</div>
      <div class="info-value split">
        <span class="grow mono">${u.key}</span>
        <button class="btn btn-dark" id="copyKey" title="${t('cab.copy')}" aria-label="${t('cab.copy')}"><i class="fa-regular fa-copy"></i></button>
        <button class="btn" id="changeKey" ${u.blocked ? 'disabled' : ''}><i class="fa-solid fa-rotate"></i> ${t('cab.change')}</button>
      </div>
    </div>`,
  ].join('');

  document.getElementById('adminLink').hidden = u.group !== 'Admin';

  document.getElementById('copyKey').onclick = () => {
    navigator.clipboard.writeText(u.key).then(() => toast(t('key.copied')), () => toast(t('key.copyFail'), 'error'));
  };
  document.getElementById('changeKey').onclick = () => {
    DB.changeKey(u.uid);
    render();
    toast(t('key.changed'));
  };
}

document.getElementById('logoutBtn').onclick = () => {
  DB.logout();
  location.href = 'index.html';
};

const keyInput = document.getElementById('loaderKey');
const loaderErr = document.getElementById('loaderErr');

function openLoaderTest() {
  keyInput.value = DB.me().key;
  loaderErr.classList.remove('show');
  openModal('loaderModal');
}
const testLink = document.getElementById('loaderTest');
testLink.onclick = openLoaderTest;
testLink.onkeydown = (e) => { if (e.key === 'Enter') openLoaderTest(); };
document.getElementById('loaderCancel').onclick = () => closeModal('loaderModal');

function submitLoader() {
  const res = DB.loaderAuth(keyInput.value, 'DEMO-PC-' + navigator.platform.replace(/\W/g, '').toUpperCase());
  if (!res.ok) {
    loaderErr.textContent = t('err.' + res.error);
    loaderErr.classList.add('show');
    return;
  }
  closeModal('loaderModal');
  render();
  toast(t('loader.ok'));
}
document.getElementById('loaderOk').onclick = submitLoader;
keyInput.addEventListener('keydown', (e) => e.key === 'Enter' && submitLoader());

render();
