// Демо-данные для показа: учитель, класс, ученики с результатами.
// Запуск: npm run seed  (повторный запуск ничего не дублирует)
import crypto from 'node:crypto';
import { one, run, now } from './db.js';
import { hashPassword } from './auth.js';
import { ACTIVITIES, COURSE_PASS_RATIO } from '../shared/catalog.js';

const PASS = process.env.DEMO_PASSWORD || 'demo12345';
const DAY = 864e5;
const t = now();
const rnd = (a, b) => a + Math.random() * (b - a);

function user(role, login, name, extra = {}) {
  const ex = one('SELECT id FROM users WHERE login = ?', login);
  if (ex) return ex.id;
  const r = run(`INSERT INTO users (role, login, phone, name, school, grade, password_hash, created_at, last_seen) VALUES (?,?,?,?,?,?,?,?,?)`,
    role, login, extra.phone || null, name, extra.school || 'МБОУ СОШ № 4', extra.grade || null, hashPassword(PASS), t - 14 * DAY, extra.lastSeen || t);
  return Number(r.lastInsertRowid);
}

const teacher = user('teacher', 'demo.uchitel', 'Смирнова Ольга Викторовна');
let cls = one('SELECT id FROM classes WHERE teacher_id = ? AND name = ?', teacher, '8 Б');
if (!cls) {
  const r = run('INSERT INTO classes (teacher_id, name, invite_code, created_at) VALUES (?,?,?,?)', teacher, '8 Б', 'DEMO8B', t - 12 * DAY);
  cls = { id: Number(r.lastInsertRowid) };
  const asg = [['l1', 10], ['l2', 9], ['g-flags', 7], ['l3', 5], ['g-swipe', 3], ['g-money', 1]];
  for (const [a, d] of asg) run('INSERT INTO assignments (class_id, activity_id, note, due_at, created_at) VALUES (?,?,?,?,?)', cls.id, a, d === 10 ? 'Перед классным часом' : null, t + (7 - d) * DAY, t - 11.5 * DAY + (10 - d) * 60e3);
}

const STUDENTS = [
  ['alina.k', 'Алина Ковалёва', 1.0, 0], ['timur.b', 'Тимур Борисов', .85, 12 * 60e3], ['sofia.r', 'София Романова', .7, 3 * 3600e3],
  ['maksim.l', 'Максим Лебедев', .35, 3 * DAY], ['eva.n', 'Ева Новикова', .9, 2 * 60e3], ['artem.s', 'Артём Соколов', .6, DAY],
  ['polina.m', 'Полина Морозова', .55, 5 * 3600e3], ['kirill.v', 'Кирилл Волков', .2, 6 * DAY], ['daria.p', 'Дарья Павлова', .8, 40 * 60e3],
  ['ivan.f', 'Иван Фёдоров', .45, 2 * DAY], ['vera.z', 'Вера Зайцева', .75, 20 * 3600e3], ['gleb.o', 'Глеб Орлов', 0, 9 * DAY],
];

for (const [login, name, skill, seenAgo] of STUDENTS) {
  if (one('SELECT 1 FROM users WHERE login = ?', login)) continue;
  const id = user('student', login, name, { grade: '8 Б', lastSeen: t - seenAgo });
  run('INSERT OR IGNORE INTO class_members (class_id, user_id, joined_at) VALUES (?,?,?)', cls.id, id, t - rnd(10, 12) * DAY);
  run('INSERT INTO activity_log (user_id, type, created_at) VALUES (?,?,?)', id, 'register', t - 13 * DAY);
  run('INSERT INTO activity_log (user_id, type, meta, created_at) VALUES (?,?,?,?)', id, 'join_class', JSON.stringify({ classId: cls.id, name: '8 Б' }), t - 11 * DAY);
  const count = Math.round(ACTIVITIES.length * skill);
  ACTIVITIES.slice(0, count).forEach((a, i) => {
    const at = t - (10 - i * .7) * DAY + rnd(0, 6) * 3600e3;
    const max = a.kind === 'lesson' ? 3 : 10;
    const tries = Math.random() < .3 ? 2 : 1;
    for (let k = 0; k < tries; k++) {
      const ratio = Math.min(1, Math.max(.3, skill + rnd(-.25, .2) + k * .2));
      const score = Math.round(ratio * max);
      const when = Math.min(t - seenAgo, at + k * 3600e3);
      run('INSERT INTO activity_log (user_id, type, activity_id, created_at) VALUES (?,?,?,?)', id, 'start', a.id, when - 300e3);
      run('INSERT INTO results (user_id, activity_id, score, max_score, duration_sec, created_at) VALUES (?,?,?,?,?,?)', id, a.id, score, max, Math.round(rnd(90, 320)), when);
      run('INSERT INTO activity_log (user_id, type, activity_id, meta, created_at) VALUES (?,?,?,?,?)', id, 'result', a.id, JSON.stringify({ score, max }), when);
    }
  });
  if (skill === 1) {
    const ok = ACTIVITIES.every((a) => one('SELECT MAX(CAST(score AS REAL)/max_score) AS r FROM results WHERE user_id = ? AND activity_id = ?', id, a.id)?.r >= COURSE_PASS_RATIO);
    if (ok) {
      const code = 'AD-' + crypto.randomBytes(3).toString('hex').toUpperCase();
      run('INSERT INTO certificates (code, user_id, title, reason, issued_by, created_at) VALUES (?,?,?,?,?,?)', code, id, 'За прохождение курса «Антидроп: финансовая безопасность»', 'course', null, t - DAY);
    }
  }
}

console.log(`Демо готово. Учитель: demo.uchitel / ${PASS}. Ученик: alina.k / ${PASS}. Код класса: DEMO8B`);
