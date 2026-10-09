import express from 'express';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { db, one, all, run, now } from './db.js';
import {
  hashPassword, checkPassword, createSession, destroySession, loadUser, requireAuth,
  publicUser, normPhone, rateLimit,
} from './auth.js';
import { ACTIVITIES, LESSONS, GAMES, byId, COURSE_PASS_RATIO } from '../shared/catalog.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '64kb' }));
app.use(cookieParser());

// ---------- заголовки безопасности ----------
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  next();
});

// ---------- защита от CSRF: изменяющие запросы — только с нашего фронтенда ----------
app.use('/api', (req, res, next) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('X-Antidrop') !== '1') {
    return res.status(403).json({ error: 'Запрос отклонён' });
  }
  next();
});
app.use('/api', loadUser);

const ip = (req) => req.ip || 'x';
const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });
const str = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const inviteCode = () => {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c = '';
  for (const b of crypto.randomBytes(6)) c += abc[b % abc.length];
  return c;
};
const log = (userId, type, activityId = null, meta = null) =>
  run('INSERT INTO activity_log (user_id, type, activity_id, meta, created_at) VALUES (?,?,?,?,?)',
    userId, type, activityId, meta ? JSON.stringify(meta) : null, now());

// Лучший результат по каждой активности
function bestResults(userId) {
  const rows = all(`SELECT activity_id, MAX(CAST(score AS REAL) / max_score) AS ratio, MAX(score) AS score,
                    MAX(max_score) AS max_score, COUNT(*) AS attempts, MAX(created_at) AS last_at
                    FROM results WHERE user_id = ? GROUP BY activity_id`, userId);
  const map = {};
  for (const r of rows) map[r.activity_id] = { ratio: r.ratio, score: r.score, max: r.max_score, attempts: r.attempts, lastAt: r.last_at };
  return map;
}
function summary(userId) {
  const best = bestResults(userId);
  const done = ACTIVITIES.filter((a) => best[a.id] && best[a.id].ratio >= COURSE_PASS_RATIO).length;
  const points = Object.values(best).reduce((s, r) => s + Math.round(r.ratio * 100), 0);
  const avg = Object.keys(best).length ? Math.round(Object.values(best).reduce((s, r) => s + r.ratio, 0) / Object.keys(best).length * 100) : null;
  return { best, done, total: ACTIVITIES.length, points, avg };
}

// =========================================================
// АВТОРИЗАЦИЯ
// =========================================================
app.post('/api/auth/register', (req, res) => {
  if (!rateLimit('reg:' + ip(req), 8, 3600e3)) return bad(res, 'Слишком много регистраций. Попробуйте через час.', 429);
  const role = req.body.role === 'teacher' ? 'teacher' : 'student';
  const name = str(req.body.name, 80);
  const login = str(req.body.login, 32).toLowerCase();
  const password = String(req.body.password || '');
  const phone = req.body.phone ? normPhone(req.body.phone) : null;
  const school = str(req.body.school, 120) || null;
  const grade = str(req.body.grade, 10) || null;
  if (name.length < 2) return bad(res, 'Укажите имя и фамилию');
  if (!/^[a-z0-9_.-]{3,32}$/.test(login)) return bad(res, 'Логин: от 3 символов, латиница, цифры, точка, _ или -');
  if (password.length < 8) return bad(res, 'Пароль — не короче 8 символов');
  if (req.body.phone && !phone) return bad(res, 'Проверьте номер телефона');
  if (one('SELECT 1 FROM users WHERE login = ?', login)) return bad(res, 'Такой логин уже занят');
  if (phone && one('SELECT 1 FROM users WHERE phone = ?', phone)) return bad(res, 'Этот телефон уже зарегистрирован');
  const r = run(`INSERT INTO users (role, login, phone, name, school, grade, password_hash, created_at, last_seen)
                 VALUES (?,?,?,?,?,?,?,?,?)`, role, login, phone, name, school, grade, hashPassword(password), now(), now());
  const id = Number(r.lastInsertRowid);
  log(id, 'register');
  createSession(res, id);
  res.json({ user: publicUser(one('SELECT * FROM users WHERE id = ?', id)) });
});

app.post('/api/auth/login', (req, res) => {
  const id = str(req.body.login, 40).toLowerCase();
  if (!rateLimit('login:' + ip(req), 20, 15 * 60e3) || !rateLimit('login:' + id, 10, 15 * 60e3)) {
    return bad(res, 'Слишком много попыток. Подождите 15 минут.', 429);
  }
  const phone = normPhone(id);
  const u = one('SELECT * FROM users WHERE login = ? OR (phone IS NOT NULL AND phone = ?)', id, phone || '-');
  if (!u || !checkPassword(String(req.body.password || ''), u.password_hash)) return bad(res, 'Неверный логин или пароль', 401);
  if (u.blocked) return bad(res, 'Аккаунт заблокирован. Обратитесь к администратору.', 403);
  createSession(res, u.id);
  run('UPDATE users SET last_seen = ? WHERE id = ?', now(), u.id);
  log(u.id, 'login');
  res.json({ user: publicUser(u) });
});

app.post('/api/auth/logout', (req, res) => { destroySession(req, res); res.json({ ok: true }); });

app.get('/api/me', (req, res) => res.json({ user: publicUser(req.user) || null }));

app.patch('/api/me', requireAuth(), (req, res) => {
  const name = str(req.body.name, 80);
  const school = str(req.body.school, 120);
  const grade = str(req.body.grade, 10);
  if (name && name.length >= 2) run('UPDATE users SET name = ? WHERE id = ?', name, req.user.id);
  run('UPDATE users SET school = ?, grade = ? WHERE id = ?', school || null, grade || null, req.user.id);
  if (req.body.newPassword) {
    if (!checkPassword(String(req.body.password || ''), req.user.password_hash)) return bad(res, 'Текущий пароль неверный');
    if (String(req.body.newPassword).length < 8) return bad(res, 'Новый пароль — не короче 8 символов');
    run('UPDATE users SET password_hash = ? WHERE id = ?', hashPassword(String(req.body.newPassword)), req.user.id);
  }
  res.json({ user: publicUser(one('SELECT * FROM users WHERE id = ?', req.user.id)) });
});

// =========================================================
// РЕЗУЛЬТАТЫ И ЖУРНАЛ (ученик)
// =========================================================
app.post('/api/log', requireAuth(), (req, res) => {
  const type = ['start', 'open'].includes(req.body.type) ? req.body.type : null;
  const a = byId(req.body.activityId);
  if (!type || !a) return bad(res, 'Некорректное событие');
  if (rateLimit('log:' + req.user.id, 120, 60e3)) log(req.user.id, type, a.id);
  res.json({ ok: true });
});

app.post('/api/results', requireAuth(), (req, res) => {
  const a = byId(req.body.activityId);
  const max = Math.max(1, Math.min(1000, parseInt(req.body.max, 10) || 0));
  const score = Math.max(0, Math.min(max, parseInt(req.body.score, 10) || 0));
  const dur = Math.max(0, Math.min(36000, parseInt(req.body.durationSec, 10) || 0));
  if (!a) return bad(res, 'Неизвестное задание');
  if (!rateLimit('res:' + req.user.id, 30, 60e3)) return bad(res, 'Слишком часто', 429);
  run('INSERT INTO results (user_id, activity_id, score, max_score, duration_sec, created_at) VALUES (?,?,?,?,?,?)',
    req.user.id, a.id, score, max, dur, now());
  log(req.user.id, 'result', a.id, { score, max });

  // Автоматическая грамота за весь курс
  let certificate = null;
  const s = summary(req.user.id);
  if (s.done === s.total && !one("SELECT 1 FROM certificates WHERE user_id = ? AND reason = 'course'", req.user.id)) {
    const code = 'AD-' + inviteCode();
    run('INSERT INTO certificates (code, user_id, title, reason, issued_by, created_at) VALUES (?,?,?,?,?,?)',
      code, req.user.id, 'За прохождение курса «Антидроп: финансовая безопасность»', 'course', null, now());
    log(req.user.id, 'certificate', null, { code });
    certificate = { code };
  }
  res.json({ ok: true, summary: s, certificate });
});

app.get('/api/student/overview', requireAuth(), (req, res) => {
  const uid = req.user.id;
  const classes = all(`SELECT c.id, c.name, u.name AS teacher FROM class_members m
                       JOIN classes c ON c.id = m.class_id JOIN users u ON u.id = c.teacher_id
                       WHERE m.user_id = ? ORDER BY m.joined_at DESC`, uid);
  const s = summary(uid);
  const assignments = all(`SELECT a.*, c.name AS class_name FROM assignments a
                           JOIN class_members m ON m.class_id = a.class_id AND m.user_id = ?
                           JOIN classes c ON c.id = a.class_id ORDER BY COALESCE(a.due_at, 9e15), a.created_at DESC`, uid)
    .map((a) => {
      const done = one('SELECT MAX(CAST(score AS REAL)/max_score) AS r FROM results WHERE user_id = ? AND activity_id = ? AND created_at >= ?', uid, a.activity_id, a.created_at);
      return { id: a.id, activityId: a.activity_id, className: a.class_name, note: a.note, dueAt: a.due_at, createdAt: a.created_at,
        done: done?.r != null, ratio: done?.r ?? null };
    });
  const certificates = all('SELECT code, title, created_at AS createdAt FROM certificates WHERE user_id = ? ORDER BY created_at DESC', uid);
  res.json({ classes, summary: s, assignments, certificates });
});

// =========================================================
// ВСТУПЛЕНИЕ В КЛАСС ПО ССЫЛКЕ / КОДУ
// =========================================================
app.get('/api/join/:code', (req, res) => {
  const c = one(`SELECT c.id, c.name, u.name AS teacher, u.school FROM classes c JOIN users u ON u.id = c.teacher_id
                 WHERE c.invite_code = ?`, str(req.params.code, 12).toUpperCase());
  if (!c) return bad(res, 'Класс по этому коду не найден', 404);
  const members = one('SELECT COUNT(*) AS n FROM class_members WHERE class_id = ?', c.id).n;
  res.json({ class: { ...c, members } });
});

app.post('/api/join/:code', requireAuth('student'), (req, res) => {
  if (!rateLimit('join:' + req.user.id, 20, 3600e3)) return bad(res, 'Слишком много попыток', 429);
  const c = one('SELECT * FROM classes WHERE invite_code = ?', str(req.params.code, 12).toUpperCase());
  if (!c) return bad(res, 'Класс по этому коду не найден', 404);
  run('INSERT OR IGNORE INTO class_members (class_id, user_id, joined_at) VALUES (?,?,?)', c.id, req.user.id, now());
  log(req.user.id, 'join_class', null, { classId: c.id, name: c.name });
  res.json({ ok: true, classId: c.id, name: c.name });
});

app.delete('/api/student/classes/:id', requireAuth('student'), (req, res) => {
  run('DELETE FROM class_members WHERE class_id = ? AND user_id = ?', Number(req.params.id), req.user.id);
  res.json({ ok: true });
});

// =========================================================
// УЧИТЕЛЬ: КЛАССЫ
// =========================================================
const ownClass = (req, res) => {
  const c = one('SELECT * FROM classes WHERE id = ?', Number(req.params.id));
  if (!c || (c.teacher_id !== req.user.id && req.user.role !== 'admin')) { bad(res, 'Класс не найден', 404); return null; }
  return c;
};

app.get('/api/classes', requireAuth('teacher', 'admin'), (req, res) => {
  const rows = all(`SELECT c.*, (SELECT COUNT(*) FROM class_members m WHERE m.class_id = c.id) AS members,
                    (SELECT COUNT(*) FROM assignments a WHERE a.class_id = c.id) AS assignments
                    FROM classes c WHERE c.teacher_id = ? ORDER BY c.created_at DESC`, req.user.id);
  res.json({ classes: rows.map((c) => ({ id: c.id, name: c.name, code: c.invite_code, members: c.members, assignments: c.assignments, createdAt: c.created_at })) });
});

app.post('/api/classes', requireAuth('teacher', 'admin'), (req, res) => {
  const name = str(req.body.name, 60);
  if (name.length < 1) return bad(res, 'Введите название класса, например «8 Б»');
  if (one('SELECT COUNT(*) AS n FROM classes WHERE teacher_id = ?', req.user.id).n >= 50) return bad(res, 'Слишком много классов');
  const r = run('INSERT INTO classes (teacher_id, name, invite_code, created_at) VALUES (?,?,?,?)', req.user.id, name, inviteCode(), now());
  res.json({ id: Number(r.lastInsertRowid) });
});

app.patch('/api/classes/:id', requireAuth('teacher', 'admin'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  if (req.body.name) run('UPDATE classes SET name = ? WHERE id = ?', str(req.body.name, 60), c.id);
  if (req.body.regenerateCode) run('UPDATE classes SET invite_code = ? WHERE id = ?', inviteCode(), c.id);
  res.json({ ok: true });
});

app.delete('/api/classes/:id', requireAuth('teacher', 'admin'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  run('DELETE FROM classes WHERE id = ?', c.id);
  res.json({ ok: true });
});

app.get('/api/classes/:id', requireAuth('teacher', 'admin'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  const assignments = all('SELECT * FROM assignments WHERE class_id = ? ORDER BY created_at DESC', c.id);
  const members = all(`SELECT u.*, m.joined_at FROM class_members m JOIN users u ON u.id = m.user_id
                       WHERE m.class_id = ? ORDER BY u.name`, c.id).map((u) => {
    const s = summary(u.id);
    const asg = assignments.map((a) => {
      const r = one('SELECT MAX(CAST(score AS REAL)/max_score) AS r FROM results WHERE user_id = ? AND activity_id = ? AND created_at >= ?', u.id, a.activity_id, a.created_at);
      return { id: a.id, ratio: r?.r ?? null };
    });
    return { ...publicUser(u), joinedAt: u.joined_at, done: s.done, total: s.total, points: s.points, avg: s.avg, assignments: asg };
  });
  res.json({
    class: { id: c.id, name: c.name, code: c.invite_code, createdAt: c.created_at },
    members,
    assignments: assignments.map((a) => ({
      id: a.id, activityId: a.activity_id, note: a.note, dueAt: a.due_at, createdAt: a.created_at,
      doneCount: members.filter((m) => m.assignments.find((x) => x.id === a.id)?.ratio != null).length,
    })),
  });
});

app.post('/api/classes/:id/members', requireAuth('teacher', 'admin'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  const q = str(req.body.query, 40).toLowerCase();
  const phone = normPhone(q);
  const u = one("SELECT * FROM users WHERE role = 'student' AND (login = ? OR (phone IS NOT NULL AND phone = ?))", q, phone || '-');
  if (!u) return bad(res, 'Ученик не найден. Проверьте логин или телефон — ученик должен быть зарегистрирован.', 404);
  run('INSERT OR IGNORE INTO class_members (class_id, user_id, joined_at) VALUES (?,?,?)', c.id, u.id, now());
  log(u.id, 'join_class', null, { classId: c.id, name: c.name, by: 'teacher' });
  res.json({ ok: true, user: publicUser(u) });
});

app.delete('/api/classes/:id/members/:uid', requireAuth('teacher', 'admin'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  run('DELETE FROM class_members WHERE class_id = ? AND user_id = ?', c.id, Number(req.params.uid));
  res.json({ ok: true });
});

app.post('/api/classes/:id/assignments', requireAuth('teacher', 'admin'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  const ids = (Array.isArray(req.body.activityIds) ? req.body.activityIds : [req.body.activityId]).filter((x) => byId(x));
  if (!ids.length) return bad(res, 'Выберите хотя бы одно задание');
  const due = req.body.dueAt ? Number(new Date(req.body.dueAt)) : null;
  const note = str(req.body.note, 300) || null;
  for (const id of ids) run('INSERT INTO assignments (class_id, activity_id, note, due_at, created_at) VALUES (?,?,?,?,?)', c.id, id, note, Number.isFinite(due) ? due : null, now());
  res.json({ ok: true, count: ids.length });
});

app.delete('/api/classes/:id/assignments/:aid', requireAuth('teacher', 'admin'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  run('DELETE FROM assignments WHERE id = ? AND class_id = ?', Number(req.params.aid), c.id);
  res.json({ ok: true });
});

app.get('/api/classes/:id/students/:uid', requireAuth('teacher', 'admin'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  const u = one(`SELECT u.* FROM class_members m JOIN users u ON u.id = m.user_id WHERE m.class_id = ? AND u.id = ?`, c.id, Number(req.params.uid));
  if (!u) return bad(res, 'Ученик не найден в этом классе', 404);
  const results = all('SELECT activity_id AS activityId, score, max_score AS max, duration_sec AS durationSec, created_at AS createdAt FROM results WHERE user_id = ? ORDER BY created_at DESC LIMIT 200', u.id);
  const events = all('SELECT type, activity_id AS activityId, meta, created_at AS createdAt FROM activity_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 100', u.id)
    .map((e) => ({ ...e, meta: e.meta ? JSON.parse(e.meta) : null }));
  const certificates = all('SELECT code, title, created_at AS createdAt FROM certificates WHERE user_id = ? ORDER BY created_at DESC', u.id);
  res.json({ student: publicUser(u), summary: summary(u.id), results, events, certificates, className: c.name });
});

// =========================================================
// ГРАМОТЫ
// =========================================================
app.post('/api/certificates', requireAuth('teacher', 'admin'), (req, res) => {
  const uid = Number(req.body.userId);
  const ok = req.user.role === 'admin' || one(`SELECT 1 FROM class_members m JOIN classes c ON c.id = m.class_id
                                             WHERE m.user_id = ? AND c.teacher_id = ?`, uid, req.user.id);
  if (!ok) return bad(res, 'Можно награждать только учеников своих классов', 403);
  const title = str(req.body.title, 140) || 'За активное участие в курсе «Антидроп»';
  const code = 'AD-' + inviteCode();
  run('INSERT INTO certificates (code, user_id, title, reason, issued_by, created_at) VALUES (?,?,?,?,?,?)', code, uid, title, 'teacher', req.user.id, now());
  log(uid, 'certificate', null, { code, by: req.user.name });
  res.json({ code });
});

app.get('/api/certificates/:code', (req, res) => {
  const c = one(`SELECT c.code, c.title, c.created_at AS createdAt, u.name, u.school, u.grade, t.name AS issuer
                 FROM certificates c JOIN users u ON u.id = c.user_id LEFT JOIN users t ON t.id = c.issued_by
                 WHERE c.code = ?`, str(req.params.code, 20).toUpperCase());
  if (!c) return bad(res, 'Грамота с таким номером не найдена', 404);
  res.json({ certificate: c });
});

// =========================================================
// АДМИН-ПАНЕЛЬ
// =========================================================
app.get('/api/admin/stats', requireAuth('admin'), (_req, res) => {
  const t = now();
  const byRole = Object.fromEntries(all('SELECT role, COUNT(*) AS n FROM users GROUP BY role').map((r) => [r.role, r.n]));
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - i);
    const to = Number(from) + 864e5;
    days.push({
      date: Number(from),
      results: one('SELECT COUNT(*) AS n FROM results WHERE created_at >= ? AND created_at < ?', Number(from), to).n,
      users: one('SELECT COUNT(DISTINCT user_id) AS n FROM activity_log WHERE created_at >= ? AND created_at < ?', Number(from), to).n,
    });
  }
  const popular = all('SELECT activity_id AS id, COUNT(*) AS n, AVG(CAST(score AS REAL)/max_score) AS avg FROM results GROUP BY activity_id ORDER BY n DESC');
  res.json({
    users: byRole, totalUsers: Object.values(byRole).reduce((a, b) => a + b, 0),
    classes: one('SELECT COUNT(*) AS n FROM classes').n,
    results: one('SELECT COUNT(*) AS n FROM results').n,
    certificates: one('SELECT COUNT(*) AS n FROM certificates').n,
    active7: one('SELECT COUNT(*) AS n FROM users WHERE last_seen > ?', t - 7 * 864e5).n,
    online: one('SELECT COUNT(*) AS n FROM users WHERE last_seen > ?', t - 5 * 60e3).n,
    days, popular,
  });
});

app.get('/api/admin/users', requireAuth('admin'), (req, res) => {
  const q = '%' + str(req.query.q, 60) + '%';
  const role = ['student', 'teacher', 'admin'].includes(req.query.role) ? req.query.role : null;
  const rows = all(`SELECT * FROM users WHERE (name LIKE ? OR login LIKE ? OR IFNULL(school,'') LIKE ?) ${role ? 'AND role = ?' : ''}
                    ORDER BY created_at DESC LIMIT 300`, ...(role ? [q, q, q, role] : [q, q, q]));
  res.json({ users: rows.map((u) => ({ ...publicUser(u), points: summary(u.id).points })) });
});

app.patch('/api/admin/users/:id', requireAuth('admin'), (req, res) => {
  const u = one('SELECT * FROM users WHERE id = ?', Number(req.params.id));
  if (!u) return bad(res, 'Пользователь не найден', 404);
  if (u.id === req.user.id && (req.body.role || req.body.blocked)) return bad(res, 'Нельзя менять роль или блокировать себя');
  if (['student', 'teacher', 'admin'].includes(req.body.role)) run('UPDATE users SET role = ? WHERE id = ?', req.body.role, u.id);
  if (typeof req.body.blocked === 'boolean') {
    run('UPDATE users SET blocked = ? WHERE id = ?', req.body.blocked ? 1 : 0, u.id);
    if (req.body.blocked) run('DELETE FROM sessions WHERE user_id = ?', u.id);
  }
  if (req.body.newPassword) {
    if (String(req.body.newPassword).length < 8) return bad(res, 'Пароль — не короче 8 символов');
    run('UPDATE users SET password_hash = ? WHERE id = ?', hashPassword(String(req.body.newPassword)), u.id);
    run('DELETE FROM sessions WHERE user_id = ?', u.id);
  }
  res.json({ user: publicUser(one('SELECT * FROM users WHERE id = ?', u.id)) });
});

app.delete('/api/admin/users/:id', requireAuth('admin'), (req, res) => {
  if (Number(req.params.id) === req.user.id) return bad(res, 'Нельзя удалить себя');
  run('DELETE FROM users WHERE id = ?', Number(req.params.id));
  res.json({ ok: true });
});

app.get('/api/admin/classes', requireAuth('admin'), (_req, res) => {
  res.json({ classes: all(`SELECT c.id, c.name, c.invite_code AS code, c.created_at AS createdAt, u.name AS teacher, u.school,
                           (SELECT COUNT(*) FROM class_members m WHERE m.class_id = c.id) AS members
                           FROM classes c JOIN users u ON u.id = c.teacher_id ORDER BY c.created_at DESC LIMIT 500`) });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', (_req, res) => bad(res, 'Не найдено', 404));

// ---------- первый администратор ----------
if (process.env.ADMIN_LOGIN && process.env.ADMIN_PASSWORD && !one("SELECT 1 FROM users WHERE role = 'admin'")) {
  run(`INSERT INTO users (role, login, name, password_hash, created_at) VALUES ('admin', ?, ?, ?, ?)`,
    process.env.ADMIN_LOGIN.toLowerCase(), 'Администратор', hashPassword(process.env.ADMIN_PASSWORD), now());
  console.log('Создан администратор:', process.env.ADMIN_LOGIN);
}

// ---------- статика сайта (SPA) ----------
const DIST = path.resolve(import.meta.dirname, '../web/dist');
if (fs.existsSync(DIST)) {
  app.use('/assets', express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '365d' }));
  app.use(express.static(DIST, { maxAge: '1h', index: false }));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(DIST, 'index.html')));
}

const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, () => console.log(`Антидроп запущен: http://localhost:${PORT}`));
export { db, LESSONS, GAMES };
