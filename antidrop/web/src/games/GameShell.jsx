import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, ArrowRight, Clock, Trophy, Award, LogIn, Gamepad2, Check, X } from 'lucide-react';
import { Icon, Ring, EASE } from '../components/ui.jsx';
import { Illo, ACTIVITY_ILLO } from '../components/Illo.jsx';
import { GAME_COLORS } from './colors.js';
import { useAuth } from '../lib/auth.jsx';
import { submitResult, logStart } from '../lib/submit.js';
import { ACTIVITIES, COURSE_PASS_RATIO } from '@shared/catalog.js';

// Обёртка любой активности: вступление → игра → результат
export default function GameShell({ activity: a, color, how = [], children, wide }) {
  const { user } = useAuth();
  const [stage, setStage] = useState('intro');
  const [result, setResult] = useState(null);
  const [run, setRun] = useState(0);
  const t0 = useRef(0);
  const c = GAME_COLORS[color || a.color];

  const start = () => { setStage('play'); setRun((r) => r + 1); t0.current = Date.now(); logStart(user, a.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const finish = async (score, max, extra) => {
    const dur = Math.round((Date.now() - t0.current) / 1000);
    setResult({ score, max, extra, dur, saving: true });
    setStage('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const r = await submitResult(user, a.id, score, max, dur);
    setResult({ score, max, extra, dur, ...r, saving: false });
  };

  return (
    <div className="page">
      <section style={{ padding: '24px 0 64px', position: 'relative' }}>
                <div className="container" style={{ position: 'relative', maxWidth: wide ? 1100 : 920 }}>
          <div className="row between" style={{ marginBottom: 20 }}>
            <Link to="/igry" className="row muted" style={{ gap: 6, fontWeight: 700, fontSize: 14.5 }}><ArrowLeft size={18} />Все игры и уроки</Link>
            {stage === 'play' && <button className="btn btn-ghost btn-sm" onClick={() => setStage('intro')}>Выйти</button>}
          </div>
          <AnimatePresence mode="wait">
            {stage === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .5, ease: EASE }}
                className="card game-intro">
                <div style={{ padding: 'clamp(24px,4vw,44px)', display: 'grid', gap: 18, alignContent: 'center' }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="chip" style={{ background: c.bg, color: c.fg }}><Icon name={a.icon} size={14} />{a.kind === 'lesson' ? 'Урок' : 'Игра'}</span>
                    {a.level && <span className="chip chip-brand">{a.level}</span>}
                    <span className="row muted" style={{ gap: 5, fontSize: 13.5, fontWeight: 700 }}><Clock size={14} />{a.minutes} мин</span>
                  </div>
                  <h1 className="h1" style={{ fontSize: 'clamp(32px,4vw,50px)' }}>{a.title}</h1>
                  <p className="lead">{a.short}</p>
                  {how.length > 0 && (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {how.map((h, i) => (
                        <div key={i} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                          <span className="num-badge" style={{ width: 28, height: 28, borderRadius: 9, fontSize: 13, background: c.bg, color: c.fg }}>{i + 1}</span>
                          <span className="ink2" style={{ fontWeight: 600 }}>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="row row-wrap" style={{ gap: 12, marginTop: 6 }}>
                    <button className="btn btn-primary btn-lg" onClick={start}><Play size={20} />Начать</button>
                    {!user && <span className="muted" style={{ fontSize: 14 }}>Без входа результат сохранится только в этом браузере</span>}
                  </div>
                </div>
                <div className="hide-m" style={{ background: c.bg, display: 'grid', placeItems: 'center', position: 'relative', minHeight: 340 }}>
                  <div style={{ width: 280, height: 280, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center' }}>
                    <Illo name={ACTIVITY_ILLO[a.id]} size={220} />
                  </div>
                </div>
              </motion.div>
            )}
            {stage === 'play' && (
              <motion.div key={'play' + run} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: .5, ease: EASE }}>
                {children({ finish, color: c })}
              </motion.div>
            )}
            {stage === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .5, ease: EASE }}>
                <Result a={a} r={result} onAgain={start} user={user} c={c} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

function Result({ a, r, onAgain, user, c }) {
  const ratio = r.score / r.max;
  const pass = ratio >= COURSE_PASS_RATIO;
  const next = useMemo(() => {
    const i = ACTIVITIES.findIndex((x) => x.id === a.id);
    return ACTIVITIES[(i + 1) % ACTIVITIES.length];
  }, [a.id]);
  const msg = ratio === 1 ? 'Идеально! Тебя не провести.' : ratio >= .8 ? 'Отличный результат!' : pass ? 'Хорошо! Задание засчитано.' : 'Почти! Попробуй ещё раз — нужно 60 %.';
  return (
    <div className="card" style={{ padding: 'clamp(24px,4vw,48px)', textAlign: 'center', display: 'grid', gap: 18, justifyItems: 'center', position: 'relative', overflow: 'hidden' }}>
      {pass && <Confetti />}
      <Ring value={ratio} size={150} stroke={12} color={pass ? 'var(--mint)' : 'var(--sun)'} label={<span style={{ fontFamily: 'var(--condensed)', fontSize: 40 }}>{Math.round(ratio * 100)}%</span>} />
      <h2 className="h2" style={{ fontSize: 'clamp(26px,3vw,38px)' }}>{msg}</h2>
      <div className="row row-wrap" style={{ gap: 10, justifyContent: 'center' }}>
        <span className="chip chip-brand" style={{ height: 34, fontSize: 14 }}><Trophy size={15} />{r.score} из {r.max}</span>
        <span className="chip chip-sun" style={{ height: 34, fontSize: 14 }}><Clock size={15} />{Math.floor(r.dur / 60)}:{String(r.dur % 60).padStart(2, '0')}</span>
        {pass && <span className="chip chip-mint" style={{ height: 34, fontSize: 14 }}>+{Math.round(ratio * 100)} баллов</span>}
      </div>
      {r.extra && <div className="ink2" style={{ maxWidth: 560 }}>{r.extra}</div>}
      {r.certificate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .6 }} className="card" style={{ padding: '18px 22px', background: 'var(--sun-50)', border: 0, display: 'flex', gap: 14, alignItems: 'center', textAlign: 'left' }}>
          <Award size={36} color="#C98500" />
          <div><b>Курс пройден! Тебе выдана грамота</b><div className="muted" style={{ fontSize: 14 }}>Номер {r.certificate.code}</div></div>
          <Link to={`/gramota/${r.certificate.code}`} className="btn btn-dark btn-sm">Открыть</Link>
        </motion.div>
      )}
      {!user && (
        <div className="row" style={{ gap: 10, padding: '12px 16px', borderRadius: 14, background: 'var(--bg)', fontSize: 14.5, fontWeight: 600 }}>
          <LogIn size={18} color="var(--brand)" />Войди или зарегистрируйся, чтобы результат увидел учитель и ты получил грамоту.
          <Link to="/registraciya" className="btn btn-soft btn-sm">Регистрация</Link>
        </div>
      )}
      {user?.role === 'student' && <div className="muted" style={{ fontSize: 13.5 }}>{r.saving ? 'Сохраняем результат…' : r.saved ? '✓ Результат сохранён в кабинете' : 'Не удалось сохранить результат на сервере'}</div>}
      <div className="row row-wrap" style={{ gap: 10, justifyContent: 'center', marginTop: 6 }}>
        <button className="btn btn-ghost" onClick={onAgain}><RotateCcw size={18} />Ещё раз</button>
        <Link to={next.kind === 'lesson' ? `/igry/urok/${next.id}` : `/igry/${next.id}`} className="btn btn-primary">Дальше: {next.title} <ArrowRight size={18} /></Link>
        <Link to="/igry" className="btn btn-soft"><Gamepad2 size={18} />Все задания</Link>
      </div>
    </div>
  );
}

export function Confetti({ n = 70 }) {
  const parts = useMemo(() => Array.from({ length: n }, (_, i) => ({
    x: Math.random() * 100, d: Math.random() * .6, r: Math.random() * 720 - 360, s: 6 + Math.random() * 8,
    c: ['#6F61EC', '#FFC530', '#1FAA59', '#FA5A5A', '#2F74E0', '#B3AAF6'][i % 6], sh: i % 3,
  })), [n]);
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {parts.map((p, i) => (
        <motion.span key={i} initial={{ y: -30, x: 0, opacity: 1, rotate: 0 }} animate={{ y: 620, x: (Math.random() - .5) * 160, opacity: [1, 1, 0], rotate: p.r }}
          transition={{ duration: 2.2 + Math.random(), delay: p.d, ease: [0.2, 0.6, 0.4, 1] }}
          style={{ position: 'absolute', left: p.x + '%', top: 0, width: p.s, height: p.sh === 2 ? p.s : p.s * .5, borderRadius: p.sh === 1 ? '50%' : 2, background: p.c }} />
      ))}
    </div>
  );
}

// Полоса прогресса внутри игры
export function Progress({ i, n, c, label }) {
  return (
    <div className="row" style={{ gap: 14, marginBottom: 18 }}>
      <div style={{ flex: 1, height: 10, borderRadius: 99, background: 'rgba(19,18,43,.06)', overflow: 'hidden' }}>
        <motion.div animate={{ width: `${(i / n) * 100}%` }} transition={{ duration: .5, ease: EASE }} style={{ height: '100%', borderRadius: 99, background: c.fg }} />
      </div>
      <b style={{ fontSize: 14, minWidth: 54, textAlign: 'right' }}>{label ?? `${Math.min(i + 1, n)} / ${n}`}</b>
    </div>
  );
}

// Плашка обратной связи после ответа
export function Feedback({ ok, title, text, onNext, nextLabel = 'Дальше' }) {
  useEffect(() => {
    const k = (e) => { if (e.key === 'Enter' && onNext) { e.preventDefault(); onNext(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onNext]);
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, ease: EASE }}
      style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '16px 18px', borderRadius: 18, background: ok ? 'var(--mint-50)' : 'var(--danger-50)', flexWrap: 'wrap' }}>
      <span style={{ width: 36, height: 36, borderRadius: '50%', background: ok ? 'var(--mint)' : 'var(--danger)', color: '#fff', display: 'grid', placeItems: 'center', flex: 'none' }}>{ok ? <Check size={20} strokeWidth={3} /> : <X size={20} strokeWidth={3} />}</span>
      <div style={{ flex: 1, minWidth: 200 }}>
        <b style={{ color: ok ? '#0A7A57' : 'var(--danger)' }}>{title ?? (ok ? 'Верно!' : 'Не совсем')}</b>
        {text && <div className="ink2" style={{ fontSize: 14.5, marginTop: 2 }}>{text}</div>}
      </div>
      {onNext && <button className="btn btn-dark btn-sm" onClick={onNext}>{nextLabel} <ArrowRight size={16} /></button>}
    </motion.div>
  );
}
