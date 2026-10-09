import { useMemo, useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import GameShell, { Progress, Feedback } from './GameShell.jsx';
import { Icon } from '../components/ui.jsx';

const ROUNDS = [
  {
    title: 'Как подростка затягивают в схему',
    hint: 'Расставь этапы вербовки по порядку — сверху первый.',
    items: [
      { id: 'a', icon: 'MessageCircle', t: 'Незнакомец пишет в соцсети или игре' },
      { id: 'b', icon: 'Gift', t: 'Предлагает «лёгкую подработку» за процент' },
      { id: 'c', icon: 'Timer', t: 'Торопит: «ответь за 10 минут»' },
      { id: 'd', icon: 'CreditCard', t: 'Просит данные карты или принять перевод' },
      { id: 'e', icon: 'Lock', t: 'Требует молчать и удалить переписку' },
      { id: 'f', icon: 'AlertTriangle', t: 'Угрожает: «ты уже соучастник»' },
    ],
  },
  {
    title: 'Путь украденных денег',
    hint: 'Как деньги проходят по схеме — от обмана до последствий.',
    items: [
      { id: 'a', icon: 'PhoneCall', t: 'Мошенник обманывает человека по телефону' },
      { id: 'b', icon: 'Banknote', t: 'Человек переводит деньги «на безопасный счёт»' },
      { id: 'c', icon: 'CreditCard', t: 'Деньги приходят на карту дроппера' },
      { id: 'd', icon: 'Shuffle', t: 'Дроппер переводит их дальше или снимает' },
      { id: 'e', icon: 'Search', t: 'Банк и полиция находят владельца карты' },
      { id: 'f', icon: 'Scale', t: 'Дроппер отвечает по закону, организатор скрылся' },
    ],
  },
];

const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  if (r.every((x, i) => x.id === a[i].id)) [r[0], r[1]] = [r[1], r[0]];
  return r;
};

export default function ChainGame({ activity }) {
  return (
    <GameShell activity={activity} how={['Две цепочки по 6 шагов.', 'Перетаскивай карточки за ручку или двигай стрелками.', 'Балл — за каждый шаг на своём месте.']}>
      {({ finish, color }) => <Play finish={finish} c={color} />}
    </GameShell>
  );
}

function Play({ finish, c }) {
  const [r, setR] = useState(0);
  const round = ROUNDS[r];
  const initial = useMemo(() => shuffle(round.items), [round]);
  const [order, setOrder] = useState(initial);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const max = ROUNDS.reduce((s, x) => s + x.items.length, 0);
  const right = order.filter((x, i) => x.id === round.items[i].id).length;

  const move = (i, d) => {
    const j = i + d; if (j < 0 || j >= order.length) return;
    const n = [...order]; [n[i], n[j]] = [n[j], n[i]]; setOrder(n);
  };
  const check = () => { setChecked(true); setScore((s) => s + right); };
  const next = () => {
    if (r === ROUNDS.length - 1) return finish(score, max);
    const nr = r + 1; setR(nr); setOrder(shuffle(ROUNDS[nr].items)); setChecked(false);
  };

  return (
    <div className="card game-card">
      <Progress i={r + (checked ? 1 : 0)} n={ROUNDS.length} c={c} label={`${r + 1} / ${ROUNDS.length}`} />
      <h2 className="h3">{round.title}</h2>
      <p className="muted" style={{ margin: '4px 0 18px' }}>{round.hint}</p>
      <Reorder.Group axis="y" values={order} onReorder={checked ? () => {} : setOrder} style={{ display: 'grid', gap: 10 }}>
        {order.map((it, i) => {
          const ok = checked && it.id === round.items[i].id;
          const bad = checked && !ok;
          return (
            <Reorder.Item key={it.id} value={it} dragListener={!checked} className="drag-item"
              whileDrag={{ scale: 1.03, boxShadow: '0 20px 40px rgba(19,18,43,.16)', zIndex: 5 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 14px 14px 10px', borderRadius: 18, background: ok ? 'var(--mint-50)' : bad ? 'var(--danger-50)' : '#fff',
                boxShadow: `inset 0 0 0 2px ${ok ? 'var(--mint)' : bad ? 'var(--danger)' : 'var(--line)'}`, position: 'relative', listStyle: 'none' }}>
              <GripVertical size={20} color="var(--muted)" style={{ flex: 'none' }} />
              <span className="num-badge" style={{ background: c.bg, color: c.fg }}>{i + 1}</span>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg)', display: 'grid', placeItems: 'center', flex: 'none', color: c.fg }}><Icon name={it.icon} size={20} /></span>
              <span style={{ fontWeight: 700, flex: 1 }}>{it.t}</span>
              {!checked && (
                <span className="row" style={{ gap: 2 }} onPointerDown={(e) => e.stopPropagation()}>
                  <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => move(i, -1)} aria-label="Выше" disabled={i === 0}><ArrowUp size={16} /></button>
                  <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => move(i, 1)} aria-label="Ниже" disabled={i === order.length - 1}><ArrowDown size={16} /></button>
                </span>
              )}
              {bad && <span className="muted" style={{ fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap' }}>место {round.items.findIndex((x) => x.id === it.id) + 1}</span>}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      <div style={{ marginTop: 18 }}>
        <AnimatePresence mode="wait">
          {!checked
            ? <motion.button key="c" className="btn btn-primary btn-lg btn-block" onClick={check}>Проверить порядок</motion.button>
            : <Feedback key="f" ok={right === order.length} title={`На своём месте: ${right} из ${order.length}`} text={r === 0 ? 'Чем раньше заметишь вербовку — тем легче выйти. Лучший момент — первое же сообщение.' : 'Организаторы прячутся за цепочкой карт, а следы приводят к дропперу.'} onNext={next} nextLabel={r === ROUNDS.length - 1 ? 'Результат' : 'Следующая цепочка'} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
