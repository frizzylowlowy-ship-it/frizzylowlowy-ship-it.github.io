const $ = (id) => document.getElementById(id);
let editing = null;
let deleting = null;

function showPanel() {
  $('gate').hidden = true;
  $('panel').hidden = false;
  render();
  setInterval(render, 15000);
}

function status(u) {
  if (u.blocked) return '<span class="blocked">Заблокирован</span>';
  return DB.isOnline(u) ? '<span class="online">● Онлайн</span>' : 'Оффлайн';
}

function render() {
  const users = DB.users();
  const s = DB.stats();
  $('sUsers').textContent = users.length;
  $('sOnline').textContent = users.filter(DB.isOnline).length;
  $('sDownloads').textContent = s.downloads;
  $('sLaunches').textContent = s.launches;

  const q = $('search').value.trim().toLowerCase();
  const f = $('filter').value;
  const list = users.filter((u) => {
    if (f === 'online' && !DB.isOnline(u)) return false;
    if (f === 'blocked' && !u.blocked) return false;
    return !q || [u.login, u.uid, u.hwid].some((v) => String(v).toLowerCase().includes(q));
  });

  $('rows').innerHTML = list.length ? list.map((u) => `
    <tr data-uid="${u.uid}">
      <td>${u.uid}</td>
      <td>${esc(u.login)}</td>
      <td>${u.group}</td>
      <td>${status(u)}</td>
      <td class="mono">${esc(u.hwid)}</td>
      <td>${u.downloads}</td>
      <td>${u.launches}</td>
      <td>${fmtDate(u.lastLoginAt)}</td>
      <td>${fmtDate(u.registeredAt).slice(0, 10)}</td>
      <td>
        <button class="btn btn-dark" data-act="edit" title="Редактировать"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-dark" data-act="block" title="${u.blocked ? 'Разблокировать' : 'Заблокировать'}"><i class="fa-solid ${u.blocked ? 'fa-lock-open' : 'fa-ban'}"></i></button>
        <button class="btn" data-act="delete" title="Удалить"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('') : '<tr class="empty"><td colspan="10">Никого не найдено</td></tr>';
}

$('rows').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const u = DB.byUid(Number(btn.closest('tr').dataset.uid));
  if (!u) return;
  if (btn.dataset.act === 'block') {
    DB.update(u.uid, { blocked: !u.blocked });
    toast(u.blocked ? `${u.login} разблокирован` : `${u.login} заблокирован`);
    render();
  } else if (btn.dataset.act === 'edit') {
    editing = u.uid;
    $('eLogin').value = u.login;
    $('eGroup').value = u.group;
    $('eSub').value = u.sub;
    $('eHwid').value = u.hwid;
    $('editModal').classList.add('show');
  } else {
    deleting = u.uid;
    $('delName').textContent = u.login;
    $('delModal').classList.add('show');
  }
});

$('eCancel').onclick = () => $('editModal').classList.remove('show');
$('eSave').onclick = () => {
  DB.update(editing, {
    login: $('eLogin').value.trim() || DB.byUid(editing).login,
    group: $('eGroup').value,
    sub: $('eSub').value,
    hwid: $('eHwid').value.trim() || 'Unknown',
  });
  $('editModal').classList.remove('show');
  toast('Сохранено');
  render();
};

$('dCancel').onclick = () => $('delModal').classList.remove('show');
$('dOk').onclick = () => {
  DB.remove(deleting);
  $('delModal').classList.remove('show');
  toast('Пользователь удалён');
  render();
};

$('search').addEventListener('input', render);
$('filter').addEventListener('change', render);
$('adminLogout').onclick = () => { DB.adminLogout(); location.reload(); };

function tryLogin() {
  if (DB.adminLogin($('pass').value)) showPanel();
  else $('passErr').classList.add('show');
}
$('passOk').onclick = tryLogin;
$('pass').addEventListener('keydown', (e) => e.key === 'Enter' && tryLogin());

if (DB.adminOk()) showPanel();
else $('gate').hidden = false;
