import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHead from '../components/PageHead.jsx';
import { GameCard, LessonCard } from '../components/Cards.jsx';
import { Ring } from '../components/ui.jsx';
import { LESSONS, GAMES, ACTIVITIES, COURSE_PASS_RATIO } from '@shared/catalog.js';
import { useBest } from '../lib/progress.js';

const FILTERS = [['all', 'Всё'], ['lesson', 'Уроки'], ['Легко', 'Легко'], ['Средне', 'Средне'], ['Сложно', 'Сложно']];

export default function Catalog() {
  const best = useBest();
  const [f, setF] = useState('all');
  const done = ACTIVITIES.filter((a) => best[a.id]?.ratio >= COURSE_PASS_RATIO).length;
  const games = GAMES.filter((g) => f === 'all' || g.level === f);

  return (
    <div className="page">
      <PageHead eyebrow="Игры и уроки" title={<>13 заданий, <span className="grad-text">которые учат не попасться</span></>}
        lead="Начни с уроков — они короткие. Потом закрепи в играх. Набери 60 % в каждом задании, чтобы получить грамоту."
        art={
          <div className="login-card" style={{ padding: 28, display: 'grid', justifyItems: 'center', gap: 12, width: 280 }}>
            <Ring value={done / ACTIVITIES.length} size={140} stroke={12} label={<span style={{ fontFamily: 'var(--condensed)', fontSize: 34 }}>{done}/{ACTIVITIES.length}</span>} />
            <b>Твой прогресс</b>
            <span className="muted" style={{ fontSize: 13.5 }}>{done === ACTIVITIES.length ? 'Курс пройден!' : `Осталось ${ACTIVITIES.length - done}`}</span>
          </div>
        } />

      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="tabs" style={{ marginBottom: 28 }}>
            {FILTERS.map(([k, l]) => (
              <button key={k} className={'tab' + (f === k ? ' on' : '')} onClick={() => setF(k)}>
                {f === k && <motion.span layoutId="cat-tab" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span>{l}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="popLayout">
            {(f === 'all' || f === 'lesson') && (
              <motion.div key="lessons" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ marginBottom: 40 }}>
                <h2 className="h3" style={{ marginBottom: 16 }}>Уроки курса</h2>
                <div className="grid g-2" style={{ gap: 12 }}>
                  {LESSONS.map((l) => <LessonCard key={l.id} l={l} best={best} />)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {f !== 'lesson' && (
            <>
              <h2 className="h3" style={{ marginBottom: 16 }}>Мини-игры</h2>
              <motion.div layout className="grid g-4">
                <AnimatePresence mode="popLayout">
                  {games.map((g) => (
                    <motion.div key={g.id} layout initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .94 }} transition={{ duration: .35 }}>
                      <GameCard g={g} best={best} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
