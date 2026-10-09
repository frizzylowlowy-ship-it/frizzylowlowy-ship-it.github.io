import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Target, Star, Award, CalendarClock, CheckCircle2, ArrowRight, KeyRound, LogOut, Users, Printer } from 'lucide-react';
import { api, fmtDate, fmtDateFull, plural } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { Loader, Empty, Icon, Ring, useToast, Modal, EASE } from '../components/ui.jsx';
import { ACTIVITIES, byId, COURSE_PASS_RATIO } from '@shared/catalog.js';
import { GAME_COLORS } from '../games/colors.js';
import { LESSON_COLORS } from '../components/Cards.jsx';
import { Stat, Head } from './Cabinet.jsx';

const hrefOf = (a) => (a.kind === 'lesson' ? `/igry/urok/${a.id}` : `/igry/${a.id}`);
const colorOf = (a) => GAME_COLORS[a.kind === 'lesson' ? LESSON_COLORS[a.id] : a.color];

export default function StudentHome() {
  const { user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const [d, setD] = useState(null);
  const [code, setCode] = useState('');
  const [leave, setLeave] = useState(null);
  const load = () => api('/student/overview').then(setD).catch((e) => toast(e.message, 'err'));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!d) return <Loader h={420} />;
  const s = d.summary;
  const todo = d.assignments.filter((a) => !a.done);
  const doneA = d.assignments.filter((a) => a.done);
  const hour = new Date().getHours();
  const hello = hour < 6 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';

  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <Head title={`${hello}, ${user.name.split(' ')[0]}!`} sub={todo.length ? `У тебя ${todo.length} ${plural(todo.length, 'невыполненное задание', 'невыполненных задания', 'невыполненных заданий')} от учителя` : 'Все задания учителя выполнены'}>
        <Link to="/igry" className="btn btn-primary">Продолжить обучение <ArrowRight size={18} /></Link>
      </Head>

      <div className="grid g-4" style={{ gap: 16 }}>
        <Stat icon={Target} label="Пройдено" value={`${s.done}/${s.total}`} sub="уроков и игр на 60 %+" />
        <Stat icon={Star} label="Баллы" value={s.points} sub="сумма лучших результатов" color="#C98500" bg="var(--sun-50)" />
        <Stat icon={Trophy} label="Средний" value={s.avg == null ? '—' : s.avg + '%'} sub="по всем попыткам" color="#0A7A57" bg="var(--mint-50)" />
        <Stat icon={Award} label="Грамоты" value={d.certificates.length} sub={s.done === s.total ? 'курс пройден' : `ещё ${s.total - s.done} до грамоты`} color="var(--coral)" bg="var(--coral-50)" />
      </div>

      {/* Задания */}
      <section className="card" style={{ padding: 24 }}>
        <div className="row between" style={{ marginBottom: 16 }}>
          <h2 className="h3" style={{ fontSize: 21 }}>Задания от учителя</h2>
          {doneA.length > 0 && <span className="chip chip-mint"><CheckCircle2 size={14} />выполнено {doneA.length}</span>}
        </div>
        {!d.assignments.length ? (
          <Empty icon="ClipboardList" title="Пока нет заданий" text={d.classes.length ? 'Когда учитель назначит задание, оно появится здесь.' : 'Вступи в класс по коду учителя — и здесь появятся задания.'} />
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {[...todo, ...doneA].map((as, i) => {
              const a = byId(as.activityId); if (!a) return null;
              const c = colorOf(a);
              const late = !as.done && as.dueAt && as.dueAt < Date.now();
              return (
                <motion.div key={as.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }}>
                  <Link to={hrefOf(a)} className="row card-hover" style={{ gap: 14, padding: 14, borderRadius: 18, background: as.done ? 'var(--bg)' : '#fff', boxShadow: 'inset 0 0 0 1.5px var(--line)' }}>
                    <span style={{ width: 48, height: 48, borderRadius: 15, background: c.bg, color: c.fg, display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={a.icon} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800 }}>{a.title}</div>
                      <div className="muted" style={{ fontSize: 13.5 }}>{as.className}{as.note ? ` · ${as.note}` : ''}</div>
                    </div>
                    {as.done
                      ? <span className="chip chip-mint"><CheckCircle2 size={14} />{Math.round(as.ratio * 100)}%</span>
                      : as.dueAt ? <span className={'chip ' + (late ? 'chip-danger' : 'chip-sun')}><CalendarClock size={14} />{late ? 'просрочено' : 'до ' + fmtDate(as.dueAt)}</span>
                        : <span className="chip chip-brand">новое</span>}
                    <ArrowRight size={18} color="var(--muted)" className="hide-m" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Прогресс по всем заданиям */}
      <section className="card" style={{ padding: 24 }}>
        <h2 className="h3" style={{ fontSize: 21, marginBottom: 16 }}>Мой прогресс</h2>
        <div className="grid g-3" style={{ gap: 12 }}>
          {ACTIVITIES.map((a) => {
            const b = s.best[a.id];
            const c = colorOf(a);
            return (
              <Link key={a.id} to={hrefOf(a)} className="row card-hover" style={{ gap: 12, padding: 12, borderRadius: 16, boxShadow: 'inset 0 0 0 1.5px var(--line)' }}>
                <Ring value={b?.ratio || 0} size={50} stroke={5} color={b && b.ratio >= COURSE_PASS_RATIO ? 'var(--mint)' : c.fg} label={b ? undefined : <Icon name={a.icon} size={18} color={c.fg} />} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.25 }}>{a.title}</div>
                  <div className="muted" style={{ fontSize: 12.5, fontWeight: 700 }}>{a.kind === 'lesson' ? 'Урок' : 'Игра'}{b ? ` · попыток: ${b.attempts}` : ' · не начато'}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid g-2" style={{ gap: 20 }}>
        {/* Грамоты */}
        <section className="card" style={{ padding: 24 }}>
          <h2 className="h3" style={{ fontSize: 21, marginBottom: 16 }}>Грамоты</h2>
          {!d.certificates.length ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <p className="ink2">Пройди все {s.total} заданий хотя бы на 60 % — и здесь появится именная грамота.</p>
              <div className="progress" style={{ height: 12 }}><motion.i initial={{ width: 0 }} animate={{ width: (s.done / s.total) * 100 + '%' }} transition={{ duration: 1, ease: EASE }} /></div>
              <span className="muted" style={{ fontSize: 13.5, fontWeight: 700 }}>{s.done} из {s.total}</span>
            </div>
          ) : d.certificates.map((c) => (
            <div key={c.code} className="row" style={{ gap: 14, padding: 14, borderRadius: 16, background: 'var(--sun-50)', marginBottom: 10 }}>
              <Award size={30} color="#C98500" style={{ flex: 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}><b style={{ fontSize: 14.5 }}>{c.title}</b><div className="muted" style={{ fontSize: 12.5 }}>{fmtDateFull(c.createdAt)} · № {c.code}</div></div>
              <Link to={`/gramota/${c.code}`} className="btn btn-dark btn-sm"><Printer size={15} />Открыть</Link>
            </div>
          ))}
        </section>

        {/* Классы */}
        <section className="card" style={{ padding: 24, display: 'grid', gap: 14, alignContent: 'start' }}>
          <h2 className="h3" style={{ fontSize: 21 }}>Мои классы</h2>
          {d.classes.map((c) => (
            <div key={c.id} className="row" style={{ gap: 12, padding: 12, borderRadius: 14, background: 'var(--bg)' }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand-50)', color: 'var(--brand)', display: 'grid', placeItems: 'center' }}><Users size={18} /></span>
              <div style={{ flex: 1 }}><b>{c.name}</b><div className="muted" style={{ fontSize: 13 }}>{c.teacher}</div></div>
              <button className="icon-btn" title="Выйти из класса" aria-label="Выйти из класса" onClick={() => setLeave(c)}><LogOut size={17} /></button>
            </div>
          ))}
          <form className="row" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); if (code.length >= 4) nav('/join/' + code); }}>
            <input className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} maxLength={8} placeholder="Код класса" style={{ fontFamily: 'var(--display)', letterSpacing: '.12em' }} aria-label="Код класса" />
            <button className="btn btn-soft" disabled={code.length < 4}><KeyRound size={17} />Вступить</button>
          </form>
        </section>
      </div>

      <Modal open={!!leave} onClose={() => setLeave(null)} title="Выйти из класса?">
        <p className="ink2">Ты перестанешь видеть задания класса «{leave?.name}», а учитель — твои результаты. Вернуться можно по коду.</p>
        <div className="row" style={{ gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setLeave(null)}>Отмена</button>
          <button className="btn btn-danger" onClick={async () => { await api('/student/classes/' + leave.id, { method: 'DELETE' }); setLeave(null); toast('Ты вышел из класса'); load(); }}>Выйти</button>
        </div>
      </Modal>
    </div>
  );
}
