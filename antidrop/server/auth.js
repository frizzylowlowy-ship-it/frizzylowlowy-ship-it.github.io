import crypto from 'node:crypto';
import { one, run, now } from './db.js';

const SESSION_DAYS = 30;
export const COOKIE = 'ad_session';

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function checkPassword(pw, stored) {
  const [alg, s, h] = String(stored).split('$');
  if (alg !== 'scrypt') return false;
  const hash = crypto.scryptSync(pw, Buffer.from(s, 'base64'), 64, { N: 16384, r: 8, p: 1 });
  const ref = Buffer.from(h, 'base64');
  return ref.length === hash.length && crypto.timingSafeEqual(ref, hash);
}

export function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  const t = now();
  run('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?,?,?,?)', token, userId, t, t + SESSION_DAYS * 864e5);
  res.cookie(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DAYS * 864e5, path: '/',
  });
}

export function destroySession(req, res) {
  const token = req.cookies?.[COOKIE];
  if (token) run('DELETE FROM sessions WHERE token = ?', token);
  res.clearCookie(COOKIE, { path: '/' });
}

// Подгружает пользователя из сессии и обновляет «был в сети»
export function loadUser(req, _res, next) {
  const token = req.cookies?.[COOKIE];
  if (token) {
    const row = one(`SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
                     WHERE s.token = ? AND s.expires_at > ?`, token, now());
    if (row && !row.blocked) {
      req.user = row;
      if (!row.last_seen || now() - row.last_seen > 60_000) run('UPDATE users SET last_seen = ? WHERE id = ?', now(), row.id);
    }
  }
  next();
}

export const requireAuth = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Нужно войти в аккаунт' });
  if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ error: 'Недостаточно прав' });
  next();
};

export const publicUser = (u) => u && ({
  id: u.id, role: u.role, login: u.login, phone: u.phone ? maskPhone(u.phone) : null,
  name: u.name, school: u.school, grade: u.grade, createdAt: u.created_at, lastSeen: u.last_seen, blocked: !!u.blocked,
});

export const maskPhone = (p) => p.replace(/^(\+7)(\d{3})(\d{3})(\d{2})(\d{2})$/, '$1 $2 ***-**-$5');

// Нормализация телефона к виду +7XXXXXXXXXX
export function normPhone(p) {
  if (!p) return null;
  let d = String(p).replace(/\D/g, '');
  if (d.length === 11 && (d[0] === '8' || d[0] === '7')) d = '7' + d.slice(1);
  if (d.length === 10) d = '7' + d;
  return /^7\d{10}$/.test(d) ? '+' + d : null;
}

// Простой лимит попыток (в памяти): ключ → [время попыток]
const buckets = new Map();
export function rateLimit(key, max, windowMs) {
  const t = now();
  const arr = (buckets.get(key) || []).filter((x) => t - x < windowMs);
  arr.push(t);
  buckets.set(key, arr);
  return arr.length <= max;
}
setInterval(() => { const t = now(); for (const [k, v] of buckets) if (!v.some((x) => t - x < 3600e3)) buckets.delete(k); }, 600e3).unref();
