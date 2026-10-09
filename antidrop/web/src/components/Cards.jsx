import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Icon } from './ui.jsx';
import { GAME_COLORS } from '../games/colors.js';
import { Illo, ACTIVITY_ILLO } from './Illo.jsx';
import { COURSE_PASS_RATIO } from '@shared/catalog.js';

const LESSON_COLORS = { l1: 'violet', l2: 'coral', l3: 'amber', l4: 'teal', l5: 'indigo' };

// Обложка карточки: пастельный фон и предметная иллюстрация задания
export function Cover({ color = 'violet', id, icon, h = 150, children }) {
  const c = GAME_COLORS[color];
  return (
    <div style={{ position: 'relative', height: h, background: c.bg, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
      {id && ACTIVITY_ILLO[id] ? <motion.div className="cover-illo" style={{ display: 'grid' }}><Illo name={ACTIVITY_ILLO[id]} size={h * 1.05} /></motion.div>
        : <span style={{ color: c.fg }}><Icon name={icon} size={40} /></span>}
      {children}
    </div>
  );
}

function Done({ r }) {
  if (!r) return null;
  const ok = r.ratio >= COURSE_PASS_RATIO;
  return (
    <span className={'chip ' + (ok ? 'chip-mint' : 'chip-sun')} style={{ position: 'absolute', top: 14, left: 14 }}>
      {ok && <CheckCircle2 size={14} />}{Math.round(r.ratio * 100)}%
    </span>
  );
}

export function GameCard({ g, best }) {
  const c = GAME_COLORS[g.color];
  return (
    <motion.div whileHover="hover" style={{ height: '100%' }}>
      <Link to={`/igry/${g.id}`} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
        <Cover color={g.color} id={g.id} icon={g.icon}><Done r={best?.[g.id]} /></Cover>
        <div style={{ padding: '20px 22px 22px', display: 'grid', gap: 8, flex: 1, alignContent: 'start' }}>
          <div className="row" style={{ gap: 8 }}>
            <span className="chip" style={{ background: c.bg, color: c.fg }}>{g.level}</span>
            <span className="row muted" style={{ gap: 5, fontSize: 13, fontWeight: 700 }}><Clock size={14} />{g.minutes} мин</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 17.5, lineHeight: 1.25 }}>{g.title}</div>
          <div className="muted" style={{ fontSize: 14.5, lineHeight: 1.45 }}>{g.short}</div>
        </div>
      </Link>
    </motion.div>
  );
}

export function LessonCard({ l, best, index }) {
  const color = LESSON_COLORS[l.id];
  const c = GAME_COLORS[color];
  const r = best?.[l.id];
  return (
    <Link to={`/igry/urok/${l.id}`} className="card card-hover" style={{ display: 'flex', gap: 18, padding: 18, alignItems: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: c.bg, color: c.fg, display: 'grid', placeItems: 'center', flex: 'none', position: 'relative' }}>
        <Icon name={l.icon} size={28} />
        {r && r.ratio >= COURSE_PASS_RATIO && <span style={{ position: 'absolute', right: -6, top: -6, width: 24, height: 24, borderRadius: '50%', background: 'var(--mint)', color: '#fff', display: 'grid', placeItems: 'center', border: '3px solid #fff' }}><CheckCircle2 size={14} /></span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="muted" style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '.04em', textTransform: 'uppercase' }}>Урок {index ?? l.order} · {l.minutes} мин</div>
        <div style={{ fontWeight: 800, fontSize: 17.5, marginTop: 2 }}>{l.title}</div>
        <div className="muted" style={{ fontSize: 14, marginTop: 2 }}>{l.short}</div>
      </div>
      <ArrowRight size={20} color="var(--muted)" style={{ flex: 'none' }} />
    </Link>
  );
}

export { LESSON_COLORS };
