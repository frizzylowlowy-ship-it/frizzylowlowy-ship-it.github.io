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
  if (u.blocked) return `<span class="blocked">${t('cab.banned')}</span>`;
  return DB.isOnline(u) ? `<span class="online">● ${t('admin.online')}</span>` : `<span class="muted">${t('admin.offline')}</span>`;
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
      <td class="mono">${u.hwid === 'Unknown' ? '<span class="muted">—</span>' : esc(u.hwid)}</td>
      <td>${u.downloads}</td>
      <td>${u.launches}</td>
      <td>${fmtDate(u.lastLoginAt)}</td>
      <td>${fmtDate(u.registeredAt).slice(0, 10)}</td>
      <td>
        <button class="btn btn-dark" data-act="edit" title="${t('admin.edit')}" aria-label="${t('admin.edit')}"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-dark" data-act="block" title="${t(u.blocked ? 'admin.unban' : 'admin.ban')}" aria-label="${t(u.blocked ? 'admin.unban' : 'admin.ban')}"><i class="fa-solid ${u.blocked ? 'fa-lock-open' : 'fa-ban'}"></i></button>
        <button class="btn" data-act="delete" title="${t('common.delete')}" aria-label="${t('common.delete')}"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('') : `<tr class="empty"><td colspan="10">${t('admin.empty')}</td></tr>`;
}

$('rows').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const u = DB.byUid(Number(btn.closest('tr').dataset.uid));
  if (!u) return;
  if (btn.dataset.act === 'block') {
    DB.update(u.uid, { blocked: !u.blocked });
    toast(t(u.blocked ? 'admin.unbannedToast' : 'admin.bannedToast', { name: u.login }));
    render();
  } else if (btn.dataset.act === 'edit') {
    editing = u.uid;
    $('eLogin').value = u.login;
    $('eGroup').value = u.group;
    $('eSub').value = u.sub;
    $('eHwid').value = u.hwid;
    openModal('editModal');
  } else {
    deleting = u.uid;
    $('delTitle').textContent = t('admin.delQ', { name: u.login });
    openModal('delModal');
  }
});

$('eCancel').onclick = () => closeModal('editModal');
$('eSave').onclick = () => {
  DB.update(editing, {
    login: $('eLogin').value.trim() || DB.byUid(editing).login,
    group: $('eGroup').value,
    sub: $('eSub').value,
    hwid: $('eHwid').value.trim() || 'Unknown',
  });
  closeModal('editModal');
  toast(t('admin.saved'));
  render();
};

$('dCancel').onclick = () => closeModal('delModal');
$('dOk').onclick = () => {
  DB.remove(deleting);
  closeModal('delModal');
  toast(t('admin.deleted'));
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
