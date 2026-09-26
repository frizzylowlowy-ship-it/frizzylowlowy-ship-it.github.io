// Demo data layer. GitHub Pages is static, so users, keys and stats live in
// this browser's localStorage. Every page talks only to DB.*, so swapping these
// bodies for fetch() calls to a real API is the only change needed later.
const DB = (() => {
  const K_USERS = 'site_users';
  const K_SESSION = 'site_session';
  const K_STATS = 'site_stats';
  const K_ADMIN = 'site_admin';
  const ADMIN_PASSWORD = 'admin';
  const ONLINE_MS = 5 * 60 * 1000;

  const read = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
  const now = () => Date.now();

  function genKey() {
    const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const part = () => Array.from({ length: 5 }, () => abc[Math.floor(Math.random() * abc.length)]).join('');
    return `${part()}-${part()}-${part()}-${part()}`;
  }

  function nextUid(users) {
    return users.reduce((m, u) => Math.max(m, u.uid), 1000) + 1;
  }

  function seed() {
    const names = ['pixel_dan', 'shadowfox', 'luna', 'ghostwire', 'kirill', 'stormbyte'];
    const users = names.map((login, i) => ({
      uid: 1001 + i,
      discordId: String(300000000000000000 + i * 7919),
      login,
      group: i === 0 ? 'Admin' : 'User',
      sub: 'Free',
      blocked: i === 3,
      key: genKey(),
      hwid: i % 2 ? 'Unknown' : Math.random().toString(16).slice(2, 14).toUpperCase(),
      registeredAt: now() - (40 - i * 5) * 86400000,
      lastLoginAt: now() - i * 3 * 3600000,
      lastSeenAt: now() - (i < 2 ? 60000 : i * 3 * 3600000),
      downloads: 1 + ((i * 7) % 9),
      launches: 3 + ((i * 13) % 40),
    }));
    write(K_USERS, users);
    write(K_STATS, { downloads: users.reduce((s, u) => s + u.downloads, 0), launches: users.reduce((s, u) => s + u.launches, 0) });
    return users;
  }

  const users = () => read(K_USERS, null) || seed();
  const saveUsers = (list) => write(K_USERS, list);
  const stats = () => (users(), read(K_STATS, { downloads: 0, launches: 0 }));
  const bump = (field) => { const s = stats(); s[field]++; write(K_STATS, s); };

  const byUid = (uid) => users().find((u) => u.uid === uid) || null;

  function update(uid, patch) {
    const list = users();
    const i = list.findIndex((u) => u.uid === uid);
    if (i < 0) return null;
    list[i] = { ...list[i], ...patch };
    saveUsers(list);
    return list[i];
  }

  // --- auth ---
  // Real flow later: Discord OAuth2 (scope=identify) -> backend exchanges the
  // code, reads /users/@me and returns a session. Here the profile is typed in.
  function loginDiscord(profile) {
    const list = users();
    let u = list.find((x) => x.discordId === profile.discordId);
    if (!u) {
      u = {
        uid: nextUid(list), discordId: profile.discordId, login: profile.login,
        group: 'User', sub: 'Free', blocked: false, key: genKey(), hwid: 'Unknown',
        registeredAt: now(), lastLoginAt: now(), lastSeenAt: now(), downloads: 0, launches: 0,
      };
      list.push(u);
    } else {
      Object.assign(u, { lastLoginAt: now(), lastSeenAt: now() });
    }
    saveUsers(list);
    write(K_SESSION, { uid: u.uid });
    return u;
  }

  function me() {
    const s = read(K_SESSION, null);
    const u = s && byUid(s.uid);
    if (s && !u) localStorage.removeItem(K_SESSION);
    return u || null;
  }

  const logout = () => localStorage.removeItem(K_SESSION);

  function heartbeat() {
    const u = me();
    if (u) update(u.uid, { lastSeenAt: now() });
  }

  // --- keys / loader API ---
  const changeKey = (uid) => update(uid, { key: genKey() });

  // What the loader will call: POST /api/loader/auth { key, hwid }.
  // A valid key is consumed and replaced, so the key shown in the cabinet
  // changes after every loader login.
  function loaderAuth(key, hwid) {
    const u = users().find((x) => x.key === key.trim().toUpperCase());
    if (!u) return { ok: false, error: 'invalid_key' };
    if (u.blocked) return { ok: false, error: 'banned' };
    if (u.hwid !== 'Unknown' && hwid && u.hwid !== hwid) return { ok: false, error: 'hwid_mismatch' };
    bump('launches');
    const updated = update(u.uid, {
      key: genKey(),
      hwid: u.hwid === 'Unknown' && hwid ? hwid : u.hwid,
      launches: u.launches + 1,
      lastSeenAt: now(),
    });
    return { ok: true, uid: updated.uid, login: updated.login, sub: updated.sub, nextKey: updated.key };
  }

  function download() {
    bump('downloads');
    const u = me();
    if (u) update(u.uid, { downloads: u.downloads + 1 });
  }

  const isOnline = (u) => now() - u.lastSeenAt < ONLINE_MS;

  // --- admin ---
  function remove(uid) {
    saveUsers(users().filter((u) => u.uid !== uid));
  }
  const adminOk = () => sessionStorage.getItem(K_ADMIN) === '1';
  function adminLogin(pass) {
    if (pass !== ADMIN_PASSWORD) return false;
    sessionStorage.setItem(K_ADMIN, '1');
    return true;
  }
  const adminLogout = () => sessionStorage.removeItem(K_ADMIN);

  return {
    users, stats, byUid, update, remove, me, loginDiscord, logout, heartbeat,
    changeKey, loaderAuth, download, isOnline, adminOk, adminLogin, adminLogout,
  };
})();
