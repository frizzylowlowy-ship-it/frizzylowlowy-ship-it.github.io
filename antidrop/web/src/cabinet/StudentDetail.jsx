import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Award, Target, Star, Clock, UserMinus, Printer, LogIn, Play, CheckCircle2, UserPlus, Users, Activity } from 'lucide-react';
import { api, ago, fmtTime, fmtDate, fmtDateFull, isOnline, colorFor, initials } from '../lib/api.js';
import { Loader, Modal, Empty, Icon, Ring, useToast } from '../components/ui.jsx';
import { ACTIVITIES, byId, COURSE_PASS_RATIO } from '@shared/catalog.js';
import { GAME_COLORS } from '../games/colors.js';
import { LESSON_COLORS } from '../components/Cards.jsx';
import { Stat, Status } from './Cabinet.jsx';

const colorOf = (a) => GAME_COLORS[a.kind === 'lesson' ? LESSON_COLORS[a.id] : a.color];
const EV = {
  register: ['Зарегистрировался', UserPlus, 'var(--brand)', 'var(--brand-50)'],
  login: ['Вошёл на сайт', LogIn, 'var(--ink-2)', 'var(--bg-2)'],
  start: ['Начал', Play, '#1667B8', 'var(--sky-50)'],
  open: ['Открыл', Play, '#1667B8', 'var(--sky-50)'],
  result: ['Завершил', CheckCircle2, '#0A7A57', 'var(--mint-50)'],
  join_class: ['Вступил в класс', Users, '#C98500', 'var(--sun-50)'],
  certificate: ['Получил грамоту', Award, 'var(--coral)', 'var(--coral-50)'],
};
const TITLES = ['За активное участие в курсе «Антидроп»', 'За лучший результат в классе', 'За внимательность и умение замечать красные флаги', 'За успешное прохождение курса финансовой безопасности'];

export default function StudentDetail() {
  const { id, uid } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const [cert, setCert] = useState(false);
  const [title, setTitle] = useState(TITLES[0]);
  const [rm, setRm] = useState(false);
  const load = () => api(`/classes/${id}/students/${uid}`).then(setD).catch((e) => setErr(e.message));
  useEffect(() => { load(); }, [id, uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const perActivity = useMemo(() => {
    if (!d) return [];
    return ACTIVITIES.map((a) => {
      const rs = d.results.filter((r) => r.activityId === a.id);
      const best = rs.reduce((m, r) => Math.max(m, r.score / r.max), -1);
      const time = rs.reduce((s, r) => s + r.durationSec, 0);
      return { a, attempts: rs.length, best: best < 0 ? null : best, last: rs[0]?.createdAt, time };
    });
  }, [d]);

  // Активность по дням за 14 дней
  const days = useMemo(() => {
    if (!d) return [];
    const out = [];
    for (let i = 13; i >= 0; i--) {
      const from = new Date(); from.setHours(0, 0, 0, 0); from.setDate(from.getDate() - i);
      const to = +from + 864e5;
      out.push({ d: from, n: d.events.filter((e) => e.createdAt >= +from && e.createdAt < to && e.type !== 'login').length });
    }
    return out;
  }, [d]);

  if (err) return <Empty icon="AlertCircle" title={err} action={<Link to={`/kabinet/klass/${id}`} className="btn btn-ghost">Назад к классу</Link>} />;
  if (!d) return <Loader h={460} />;
  const s = d.student, sum = d.summary;
  const maxDay = Math.max(1, ...days.map((x) => x.n));
  const totalTime = perActivity.reduce((t, x) => t + x.time, 0);

  const issue = async (e) => {
    e.preventDefault();
    try { const r = await api('/certificates', { method: 'POST', body: { userId: s.id, title } }); toast('Грамота выдана'); setCert(false); load(); nav(`/gramota/${r.code}`); }
    catch (e2) { toast(e2.message, 'err'); }
  };

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <Link to={`/kabinet/klass/${id}`} className="row muted" style={{ gap: 6, fontWeight: 700, fontSize: 14.5, width: 'fit-content' }}><ArrowLeft size={18} />{d.className}</Link>

      <div className="card" style={{ padding: 24, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="avatar" style={{ width: 72, height: 72, borderRadius: 22, fontSize: 24, background: colorFor(s.login) }}>{initials(s.name)}</span>
        <div style={{ flex: '1 1 220px' }}>
          <h1 className="h2" style={{ fontSize: 'clamp(24px,3vw,32px)' }}>{s.name}</h1>
          <div className="muted" style={{ fontWeight: 600, marginTop: 4 }}>@{s.login}{s.phone ? ` · ${s.phone}` : ''}{s.grade ? ` · ${s.grade}` : ''}{s.school ? ` · ${s.school}` : ''}</div>
          <div className="row row-wrap" style={{ gap: 8, marginTop: 10, fontWeight: 800, fontSize: 14, color: isOnline(s.lastSeen) ? '#0A7A57' : 'var(--ink-2)' }}>
            <span className="row" style={{ gap: 8, whiteSpace: 'nowrap' }}><Status t={s.lastSeen} />{isOnline(s.lastSeen) ? 'Сейчас в сети' : `Был в сети: ${ago(s.lastSeen)}`}</span>
            <span className="muted" style={{ fontWeight: 600 }}>· с нами с {fmtDateFull(s.createdAt)}</span>
          </div>
        </div>
        <div className="row row-wrap" style={{ gap: 8 }}>
          <button className="btn btn-sun" onClick={() => setCert(true)}><Award size={18} />Выдать грамоту</button>
          <button className="btn btn-ghost" onClick={() => setRm(true)}><UserMinus size={18} />Убрать из класса</button>
        </div>
      </div>

      <div className="grid g-4" style={{ gap: 14 }}>
        <Stat icon={Target} label="Пройдено" value={`${sum.done}/${sum.total}`} sub="на 60 % и выше" />
        <Stat icon={Star} label="Баллы" value={sum.points} color="#C98500" bg="var(--sun-50)" />
        <Stat icon={CheckCircle2} label="Средний" value={sum.avg == null ? '—' : sum.avg + '%'} color="#0A7A57" bg="var(--mint-50)" />
        <Stat icon={Clock} label="Время" value={totalTime < 60 ? totalTime + ' с' : Math.round(totalTime / 60) + ' мин'} sub="в играх и уроках" color="var(--coral)" bg="var(--coral-50)" />
      </div>

      <div className="detail-grid">
        <section className="card" style={{ padding: 22 }}>
          <h2 className="h3" style={{ fontSize: 19, marginBottom: 14 }}>Результаты по заданиям</h2>
          <div className="table-wrap" style={{ border: 0 }}>
            <table className="table">
              <thead><tr><th>Задание</th><th>Лучший</th><th>Попыток</th><th>Когда</th></tr></thead>
              <tbody>
                {perActivity.map(({ a, attempts, best, last }) => {
                  const c = colorOf(a);
                  return (
                    <tr key={a.id}>
                      <td><div className="row" style={{ gap: 10 }}><span style={{ width: 32, height: 32, borderRadius: 10, background: c.bg, color: c.fg, display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={a.icon} size={16} /></span><span style={{ fontWeight: 700 }}>{a.title}</span></div></td>
                      <td>{best == null ? <span className="muted">—</span> : <span className={'chip ' + (best >= COURSE_PASS_RATIO ? 'chip-mint' : 'chip-sun')}>{Math.round(best * 100)}%</span>}</td>
                      <td>{attempts || <span className="muted">0</span>}</td>
                      <td className="muted" style={{ whiteSpace: 'nowrap', fontSize: 13 }}>{last ? fmtDate(last) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <section className="card" style={{ padding: 22 }}>
            <div className="row between" style={{ marginBottom: 14 }}><h2 className="h3" style={{ fontSize: 19 }}>Активность</h2><span className="muted" style={{ fontSize: 13, fontWeight: 700 }}>14 дней</span></div>
            <div className="bar-chart" style={{ height: 90 }}>
              {days.map((x, i) => (
                <div key={i} title={`${x.d.toLocaleDateString('ru-RU')}: ${x.n}`} style={{ flex: 1, display: 'grid', alignItems: 'end', height: '100%' }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, (x.n / maxDay) * 100)}%` }} transition={{ delay: i * .03, duration: .6 }}
                    style={{ borderRadius: 6, background: x.n ? 'var(--brand)' : 'var(--bg-2)' }} />
                </div>
              ))}
            </div>
          </section>
          <section className="card" style={{ padding: 22 }}>
            <h2 className="h3" style={{ fontSize: 19, marginBottom: 10 }}>Журнал действий</h2>
            {!d.events.length ? <p className="muted">Пока нет событий</p> : (
              <div className="timeline" style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 6 }}>
                {d.events.slice(0, 60).map((e, i) => {
                  const [label, I, col, bg] = EV[e.type] || [e.type, Activity, 'var(--ink-2)', 'var(--bg-2)'];
                  const a = e.activityId && byId(e.activityId);
                  return (
                    <div key={i} className="tl-item">
                      <span className="tl-ic" style={{ background: bg, color: col }}><I size={17} /></span>
                      <div style={{ fontSize: 14 }}>
                        <b>{label}</b>{a ? ` «${a.title}»` : ''}
                        {e.type === 'result' && e.meta && <span className={'chip ' + (e.meta.score / e.meta.max >= COURSE_PASS_RATIO ? 'chip-mint' : 'chip-sun')} style={{ marginLeft: 6, height: 22 }}>{e.meta.score}/{e.meta.max}</span>}
                        {e.type === 'join_class' && e.meta?.name && <span> «{e.meta.name}»{e.meta.by === 'teacher' ? ' (добавил учитель)' : ''}</span>}
                        {e.type === 'certificate' && e.meta?.code && <span className="muted"> № {e.meta.code}</span>}
                      </div>
                      <span className="muted" style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtTime(e.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          <section className="card" style={{ padding: 22 }}>
            <h2 className="h3" style={{ fontSize: 19, marginBottom: 12 }}>Грамоты</h2>
            {!d.certificates.length ? <p className="muted">Грамот пока нет</p> : d.certificates.map((c) => (
              <div key={c.code} className="row" style={{ gap: 12, padding: 12, borderRadius: 14, background: 'var(--sun-50)', marginBottom: 8 }}>
                <Award size={24} color="#C98500" style={{ flex: 'none' }} />
                <div style={{ flex: 1, minWidth: 0, fontSize: 14 }}><b>{c.title}</b><div className="muted" style={{ fontSize: 12.5 }}>№ {c.code} · {fmtDateFull(c.createdAt)}</div></div>
                <Link to={`/gramota/${c.code}`} className="icon-btn" aria-label="Открыть грамоту"><Printer size={18} /></Link>
              </div>
            ))}
          </section>
        </div>
      </div>

      <Modal open={cert} onClose={() => setCert(false)} title="Выдать грамоту">
        <form onSubmit={issue} style={{ display: 'grid', gap: 14 }}>
          <div className="row" style={{ gap: 14, padding: 14, borderRadius: 16, background: 'var(--bg)' }}>
            <Ring value={sum.done / sum.total} size={52} stroke={5} />
            <div><b>{s.name}</b><div className="muted" style={{ fontSize: 13.5 }}>Пройдено {sum.done} из {sum.total} · {sum.points} баллов</div></div>
          </div>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Формулировка</span>
          <div style={{ display: 'grid', gap: 6 }}>
            {TITLES.map((t) => <button type="button" key={t} className={'opt' + (title === t ? ' sel' : '')} style={{ padding: '10px 14px', fontSize: 14.5 }} onClick={() => setTitle(t)}>{t}</button>)}
          </div>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} aria-label="Своя формулировка" />
          <button className="btn btn-sun btn-lg btn-block" disabled={!title.trim()}><Award size={20} />Выдать и открыть для печати</button>
        </form>
      </Modal>
      <Modal open={rm} onClose={() => setRm(false)} title="Убрать ученика из класса?">
        <p className="ink2">{s.name} перестанет видеть задания класса. Аккаунт и результаты сохранятся.</p>
        <div className="row" style={{ gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setRm(false)}>Отмена</button>
          <button className="btn btn-danger" onClick={async () => { await api(`/classes/${id}/members/${s.id}`, { method: 'DELETE' }); toast('Ученик убран из класса'); nav(`/kabinet/klass/${id}`); }}>Убрать</button>
        </div>
      </Modal>
    </div>
  );
}
