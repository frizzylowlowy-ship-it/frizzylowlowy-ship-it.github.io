import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ExternalLink, Lightbulb, Flag } from 'lucide-react';
import GameShell, { Progress } from '../games/GameShell.jsx';
import { Icon, EASE } from '../components/ui.jsx';
import { Illo } from '../components/Illo.jsx';

const PERSON_ILLO = { kid: 'card', girl: 'chat', curly: 'timer', cap: 'bell', senior: 'law' };
import { byId } from '@shared/catalog.js';
import { LESSON_CONTENT } from '../content/lessons.js';
import { GAME_COLORS } from '../games/colors.js';
import NotFound from './NotFound.jsx';

export default function Lesson() {
  const { id } = useParams();
  const a = byId(id);
  const content = LESSON_CONTENT[id];
  useEffect(() => { if (a) document.title = `${a.title} — урок · Антидроп`; }, [a]);
  if (!a || a.kind !== 'lesson' || !content) return <NotFound />;
  const quizzes = content.cards.filter((c) => c.type === 'quiz').length;
  return (
    <GameShell key={id} activity={a} color={content.color}
      how={[`${content.cards.length} карточек: объяснения, примеры и схемы.`, `${quizzes} вопроса для проверки — баллы за верный ответ с первой попытки.`, 'Листай кнопками или стрелками на клавиатуре.']}>
      {({ finish }) => <Cards content={content} finish={finish} />}
    </GameShell>
  );
}

function Cards({ content, finish }) {
  const c = GAME_COLORS[content.color];
  const cards = content.cards;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState({}); // индекс карточки → выбранный вариант
  const card = cards[i];
  const locked = card.type === 'quiz' && answers[i] === undefined;
  const max = cards.filter((x) => x.type === 'quiz').length;

  const go = (d) => {
    if (d > 0 && locked) return;
    if (d > 0 && i === cards.length - 1) {
      const score = cards.reduce((s, x, k) => s + (x.type === 'quiz' && answers[k] === x.correct ? 1 : 0), 0);
      return finish(score, max);
    }
    const n = i + d; if (n < 0 || n >= cards.length) return;
    setDir(d); setI(n);
  };
  useEffect(() => {
    const k = (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });

  return (
    <div className="card game-card" style={{ overflow: 'hidden' }}>
      <Progress i={i + 1} n={cards.length} c={c} label={`${i + 1} / ${cards.length}`} />
      <div style={{ minHeight: 400, position: 'relative' }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={i} custom={dir} initial={{ opacity: 0, x: dir * 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -50 }} transition={{ duration: .4, ease: EASE }}>
            <CardView card={card} c={c} answer={answers[i]} onAnswer={(v) => setAnswers((a) => (a[i] === undefined ? { ...a, [i]: v } : a))} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="row between" style={{ marginTop: 24, borderTop: '1px solid var(--line)', paddingTop: 18 }}>
        <button className="btn btn-ghost" onClick={() => go(-1)} disabled={i === 0}><ArrowLeft size={18} />Назад</button>
        <button className="btn btn-primary" onClick={() => go(1)} disabled={locked}>{i === cards.length - 1 ? 'Завершить урок' : locked ? 'Выбери ответ' : 'Дальше'}<ArrowRight size={18} /></button>
      </div>
    </div>
  );
}

const H = ({ children }) => <h2 className="h2" style={{ fontSize: 'clamp(24px,3vw,34px)', marginBottom: 14 }}>{children}</h2>;

function CardView({ card, c, answer, onAnswer }) {
  switch (card.type) {
    case 'intro':
      return (
        <div className="split" style={{ gap: 24 }}>
          <div style={{ display: 'grid', gap: 14 }}>
            <span className="chip" style={{ background: c.bg, color: c.fg, width: 'fit-content' }}>Урок</span>
            <h2 className="h2">{card.title}</h2>
            <p className="lead">{card.text}</p>
          </div>
          <div style={{ display: 'grid', placeItems: 'center', background: c.bg, borderRadius: 28, minHeight: 300 }}>
            <Illo name={PERSON_ILLO[card.person]} size={240} />
          </div>
        </div>
      );
    case 'text':
      return (
        <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
          <span style={{ width: 60, height: 60, borderRadius: 20, background: c.bg, color: c.fg, display: 'grid', placeItems: 'center' }}><Icon name={card.icon} size={28} /></span>
          <H>{card.title}</H>
          {card.text && <p className="lead" style={{ marginTop: -6 }}>{card.text}</p>}
          {card.list && (
            <div style={{ display: 'grid', gap: 10 }}>
              {card.list.map((t, k) => (
                <motion.div key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .15 + k * .08 }} className="row" style={{ gap: 12, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 16, background: 'var(--bg)' }}>
                  <span style={{ width: 24, height: 24, borderRadius: 8, background: c.fg, color: '#fff', display: 'grid', placeItems: 'center', flex: 'none', marginTop: 1 }}><Check size={14} strokeWidth={3} /></span>
                  <span style={{ fontWeight: 600, fontSize: 16 }}>{t}</span>
                </motion.div>
              ))}
            </div>
          )}
          {card.phrases && (
            <div style={{ display: 'grid', gap: 8 }}>
              {card.phrases.map((p, k) => <motion.div key={p} className="bubble me" style={{ justifySelf: 'start' }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 + k * .15 }}>{p}</motion.div>)}
            </div>
          )}
          {card.note && <div className="row" style={{ gap: 10, padding: '12px 14px', borderRadius: 14, background: 'var(--sun-50)', alignItems: 'flex-start', fontWeight: 600 }}><Lightbulb size={20} color="#C98500" style={{ flex: 'none' }} />{card.note}</div>}
          {card.source && <a className="src row" style={{ gap: 6 }} href={card.href} target="_blank" rel="noopener noreferrer">Источник: {card.source}<ExternalLink size={12} /></a>}
        </div>
      );
    case 'steps':
      return (
        <div style={{ display: 'grid', gap: 18 }}>
          <H>{card.title}</H>
          <div className={'grid ' + (card.items.length === 3 ? 'g-3' : 'g-4')} style={{ gap: 14 }}>
            {card.items.map((it, k) => (
              <motion.div key={it.t} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 + k * .12, duration: .5, ease: EASE }}
                style={{ padding: 20, borderRadius: 22, background: 'var(--bg)', display: 'grid', gap: 10, alignContent: 'start', position: 'relative' }}>
                <div className="row between">
                  <span style={{ width: 48, height: 48, borderRadius: 15, background: '#fff', color: c.fg, display: 'grid', placeItems: 'center', boxShadow: 'var(--sh-1)' }}><Icon name={it.icon} size={24} /></span>
                  <span style={{ fontFamily: 'var(--condensed)', fontWeight: 700, color: c.fg, opacity: .45, fontSize: 30 }}>{k + 1}</span>
                </div>
                <b style={{ fontSize: 17 }}>{it.t}</b>
                <span className="ink2" style={{ fontSize: 14.5 }}>{it.d}</span>
              </motion.div>
            ))}
          </div>
          {card.note && <div className="row" style={{ gap: 10, padding: '12px 14px', borderRadius: 14, background: c.bg, fontWeight: 700, color: c.fg }}><Lightbulb size={20} />{card.note}</div>}
        </div>
      );
    case 'flags':
      return (
        <div style={{ display: 'grid', gap: 16 }}>
          <H>8 красных флагов</H>
          <div className="grid g-4" style={{ gap: 12 }}>
            {card.items.map((it, k) => (
              <motion.div key={it.t} initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .05 + k * .06, duration: .4 }}
                style={{ padding: 16, borderRadius: 18, background: 'var(--danger-50)', display: 'grid', gap: 6, alignContent: 'start' }}>
                <span style={{ color: 'var(--danger)' }}><Icon name={it.icon} size={22} /></span>
                <b style={{ fontSize: 15 }}>{it.t}</b>
                <span className="ink2" style={{ fontSize: 13.5 }}>{it.d}</span>
              </motion.div>
            ))}
          </div>
        </div>
      );
    case 'chat':
      return <ChatCard card={card} />;
    case 'fact':
      return (
        <div style={{ display: 'grid', gap: 16, justifyItems: 'center', textAlign: 'center', padding: '30px 0' }}>
          <motion.div initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .7, ease: EASE }}
            style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 'clamp(60px,10vw,120px)', lineHeight: 1, color: c.fg }}>{card.big}</motion.div>
          <p style={{ fontSize: 'clamp(19px,2.4vw,26px)', fontWeight: 700, maxWidth: 620 }}>{card.label}</p>
          <a className="src row" style={{ gap: 6 }} href={card.href} target="_blank" rel="noopener noreferrer">Источник: {card.source}<ExternalLink size={12} /></a>
        </div>
      );
    case 'rule':
      return (
        <div className="split" style={{ gap: 30 }}>
          <div style={{ display: 'grid', placeItems: 'center' }}>
            <div style={{ position: 'relative', width: 230, height: 230 }}>
              <svg viewBox="0 0 100 100" width="230" height="230" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="44" fill="none" stroke="var(--bg-2)" strokeWidth="8" />
                <motion.circle cx="50" cy="50" r="44" fill="none" stroke={c.fg} strokeWidth="8" strokeLinecap="round" strokeDasharray="276.5"
                  initial={{ strokeDashoffset: 276.5 }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 2.2, ease: EASE }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div><div style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 80, lineHeight: 1, color: c.fg }}>{card.big}</div><b className="muted">{card.unit}</b></div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 12 }}><H>Правило</H><p className="lead">{card.text}</p></div>
        </div>
      );
    case 'quiz':
      return (
        <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
          <span className="chip chip-sun" style={{ width: 'fit-content' }}>Проверь себя</span>
          <h2 className="h3" style={{ fontSize: 'clamp(20px,2.4vw,26px)', lineHeight: 1.3 }}>{card.q}</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {card.options.map((o, k) => {
              const done = answer !== undefined;
              const cls = done ? (k === card.correct ? ' ok' : k === answer ? ' bad' : '') : '';
              return (
                <motion.button key={o} className={'opt' + cls} disabled={done} onClick={() => onAnswer(k)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 + k * .07 }}>
                  <span className="opt-key">{'АБВГ'[k]}</span>{o}
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {answer !== undefined && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '14px 16px', borderRadius: 16, background: answer === card.correct ? 'var(--mint-50)' : 'var(--danger-50)' }}>
                <b style={{ color: answer === card.correct ? '#0A7A57' : 'var(--danger)' }}>{answer === card.correct ? 'Верно! +1 балл' : 'Неверно'}</b>
                <div className="ink2" style={{ marginTop: 4 }}>{card.explain}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    case 'summary':
      return (
        <div style={{ display: 'grid', gap: 16, maxWidth: 760 }}>
          <H>{card.title}</H>
          {card.items.map((t, k) => (
            <motion.div key={t} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .15 + k * .15, duration: .5, ease: EASE }}
              className="row" style={{ gap: 14, padding: '16px 18px', borderRadius: 18, background: c.bg }}>
              <span className="num-badge" style={{ background: '#fff', color: c.fg }}>{k + 1}</span><b style={{ fontSize: 16.5 }}>{t}</b>
            </motion.div>
          ))}
          <p className="muted">Нажми «Завершить урок», чтобы получить баллы.</p>
        </div>
      );
    default:
      return null;
  }
}

function ChatCard({ card }) {
  const [shown, setShown] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <H>{card.title}</H>
      <div className="chat-shell" style={{ maxWidth: 680 }}>
        {card.messages.map((m, k) => (
          <motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 + k * .35 }} style={{ display: 'grid', gap: 4, justifyItems: m.who === 'me' ? 'end' : 'start' }}>
            <div className={'bubble ' + m.who} style={{ boxShadow: shown && m.flag ? '0 0 0 2.5px var(--danger)' : undefined, transition: 'box-shadow .3s' }}>{m.text}</div>
            <AnimatePresence>{shown && m.flag && <motion.span initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: k * .12 }} className="chip chip-danger"><Flag size={12} />{m.flag}</motion.span>}</AnimatePresence>
          </motion.div>
        ))}
      </div>
      {!shown && <button className="btn btn-soft" style={{ width: 'fit-content' }} onClick={() => setShown(true)}>Показать красные флаги</button>}
    </div>
  );
}
