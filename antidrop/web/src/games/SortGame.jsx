import { useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { UserRound, Flag, Check, X } from 'lucide-react';
import GameShell, { Progress, Feedback } from './GameShell.jsx';
import { EASE } from '../components/ui.jsx';

// risk — фактор риска (что делает подростка уязвимым), flag — красный флаг (признак в предложении)
const CARDS = [
  { t: 'Не хватает карманных денег', k: 'risk' },
  { t: '«Ответь в течение 10 минут»', k: 'flag' },
  { t: 'Не знает, что за передачу карты есть уголовная статья', k: 'risk' },
  { t: '«Только родителям не говори»', k: 'flag' },
  { t: 'Много времени проводит в игровых чатах с незнакомцами', k: 'risk' },
  { t: 'Просят фото карты с двух сторон', k: 'flag' },
  { t: 'Редко обсуждает с родителями, что происходит в сети', k: 'risk' },
  { t: '«Всё легально, у нас договор»', k: 'flag' },
  { t: 'Хочет казаться взрослым и самостоятельным', k: 'risk' },
  { t: 'Зовут в закрытый канал «узнать схему»', k: 'flag' },
  { t: 'Недавно получил свою первую карту', k: 'risk' },
  { t: '«Пришли деньги по ошибке — верни на другую карту»', k: 'flag' },
];
const LABEL = { risk: 'Фактор риска', flag: 'Красный флаг' };

export default function SortGame({ activity }) {
  return (
    <GameShell activity={activity} how={['Фактор риска — то, что делает подростка уязвимым (о нём самом и его жизни).', 'Красный флаг — признак вербовки в сообщении или предложении.', 'Перетащи карточку в нужную корзину или нажми на корзину.']}>
      {({ finish, color }) => <Play finish={finish} c={color} />}
    </GameShell>
  );
}

function Play({ finish, c }) {
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState([]); // {t, k, put}
  const [last, setLast] = useState(null);
  const left = useRef(null), right = useRef(null);
  const x = useMotionValue(0), y = useMotionValue(0);
  const card = CARDS[i];
  const score = placed.filter((p) => p.k === p.put).length;

  const put = (k) => {
    if (!card || last) return;
    setPlaced((p) => [...p, { ...card, put: k }]);
    setLast({ ok: card.k === k, k });
  };
  const next = () => {
    x.set(0); y.set(0); setLast(null);
    if (i === CARDS.length - 1) return finish(score, CARDS.length);
    setI(i + 1);
  };
  const onDragEnd = (_, info) => {
    const hit = (ref) => { const r = ref.current.getBoundingClientRect(); return info.point.x >= r.left && info.point.x <= r.right && info.point.y >= r.top - 40 && info.point.y <= r.bottom; };
    if (hit(left)) put('risk');
    else if (hit(right)) put('flag');
    else { animate(x, 0, { duration: .4, ease: EASE }); animate(y, 0, { duration: .4, ease: EASE }); }
  };

  return (
    <div className="card game-card">
      <Progress i={i + (last ? 1 : 0)} n={CARDS.length} c={c} label={`${i + 1} / ${CARDS.length}`} />
      <div style={{ height: 170, display: 'grid', placeItems: 'center', position: 'relative', zIndex: 3 }}>
        <AnimatePresence mode="wait">
          {card && !last && (
            <motion.div key={i} className="drag-item" drag dragMomentum={false} onDragEnd={onDragEnd} style={{ x, y }}
              initial={{ opacity: 0, scale: .85, y: -20 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .6, transition: { duration: .25 } }}
              whileDrag={{ scale: 1.05, rotate: 2, boxShadow: '0 24px 50px rgba(19,18,43,.2)' }} transition={{ duration: .4, ease: EASE }}>
              <div style={{ width: 'min(420px, 80vw)', padding: '24px 26px', borderRadius: 24, background: '#fff', boxShadow: 'var(--sh-3)', border: `2px solid ${c.fg}33`, fontWeight: 800, fontSize: 19, textAlign: 'center', lineHeight: 1.35 }}>
                {card.t}
              </div>
            </motion.div>
          )}
          {last && (
            <motion.div key={'fb' + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%' }}>
              <Feedback ok={last.ok} title={last.ok ? `Верно: ${LABEL[card.k].toLowerCase()}` : `Это ${LABEL[card.k].toLowerCase()}`}
                text={card.k === 'risk' ? 'Это о самом подростке и его жизни — делает его уязвимее для вербовщика.' : 'Это признак в сообщении или предложении — сигнал, что тебя вербуют.'}
                onNext={next} nextLabel={i === CARDS.length - 1 ? 'Результат' : 'Дальше'} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="grid g-2" style={{ gap: 14, marginTop: 10 }}>
        {[['risk', left, UserRound, 'var(--sky)', 'var(--sky-50)', 'Что делает подростка уязвимым'], ['flag', right, Flag, 'var(--danger)', 'var(--danger-50)', 'Признак вербовки в предложении']].map(([k, ref, I, col, bg, sub]) => (
          <motion.button key={k} ref={ref} onClick={() => put(k)} disabled={!!last}
            animate={last?.k === k ? { scale: [1, 1.04, 1] } : {}} transition={{ duration: .4 }}
            style={{ minHeight: 230, borderRadius: 24, border: `2.5px dashed ${col}`, background: bg, padding: 16, display: 'grid', alignContent: 'start', gap: 10, textAlign: 'left' }}>
            <div className="row" style={{ gap: 10 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', color: col, display: 'grid', placeItems: 'center' }}><I size={20} /></span>
              <div><b style={{ fontSize: 16.5 }}>{LABEL[k]}</b><div className="muted" style={{ fontSize: 12.5 }}>{sub}</div></div>
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              <AnimatePresence>
                {placed.filter((p) => p.put === k).map((p) => (
                  <motion.div key={p.t} initial={{ opacity: 0, scale: .8, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .35, ease: EASE }}
                    className="row" style={{ gap: 8, padding: '8px 10px', borderRadius: 12, background: '#fff', fontSize: 13.5, fontWeight: 700, alignItems: 'flex-start' }}>
                    {p.k === p.put ? <Check size={16} color="var(--mint)" style={{ flex: 'none', marginTop: 1 }} /> : <X size={16} color="var(--danger)" style={{ flex: 'none', marginTop: 1 }} />}
                    {p.t}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
