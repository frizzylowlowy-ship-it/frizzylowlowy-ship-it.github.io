import { useState } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Check, GripVertical, ArrowUp, ArrowDown, Bell } from 'lucide-react';
import GameShell, { Progress, Feedback } from './GameShell.jsx';
import { Icon, EASE } from '../components/ui.jsx';

const ACTIONS = [
  { id: 'freeze', icon: 'Hand', t: 'Не трогать деньги: не тратить и не переводить', ok: true, order: 0 },
  { id: 'bank', icon: 'Landmark', t: 'Позвонить в банк по номеру на обороте карты', ok: true, order: 1 },
  { id: 'parents', icon: 'Users', t: 'Рассказать родителям', ok: true, order: 2 },
  { id: 'screens', icon: 'Camera', t: 'Сохранить скриншоты сообщений', ok: true, order: 3 },
  { id: 'return', icon: 'Undo2', t: 'Вернуть деньги на карту, которую прислали в сообщении', ok: false, why: 'Перевод «обратно» на другую карту — это и есть работа дроппера.' },
  { id: 'cash', icon: 'Banknote', t: 'Снять наличные, чтобы «не пропали»', ok: false, why: 'Снимать чужие деньги нельзя — так ты становишься звеном схемы.' },
  { id: 'link', icon: 'Link', t: 'Вернуть деньги по ссылке из сообщения', ok: false, why: 'Ссылки от незнакомцев часто ведут на поддельные сайты банков.' },
  { id: 'delete', icon: 'Trash2', t: 'Удалить переписку и забыть', ok: false, why: 'Переписка — доказательство, что ты не участвовал в схеме. Её нужно сохранить.' },
];
const RIGHT = ACTIONS.filter((a) => a.ok).sort((a, b) => a.order - b.order);

export default function MoneyGame({ activity }) {
  return (
    <GameShell activity={activity} how={['На твою карту пришли 7 500 ₽ от незнакомца, а потом сообщение «верни, это ошибка».', 'Шаг 1: выбери все правильные действия.', 'Шаг 2: расставь их по порядку.']}>
      {({ finish, color }) => <Play finish={finish} c={color} />}
    </GameShell>
  );
}

function Play({ finish, c }) {
  const [phase, setPhase] = useState(1); // 1 — выбор, 2 — проверка выбора, 3 — порядок, 4 — проверка порядка
  const [sel, setSel] = useState([]);
  const [score1, setScore1] = useState(0);
  const [order, setOrder] = useState(() => [...RIGHT].sort(() => Math.random() - .5));
  const max = ACTIONS.length + RIGHT.length;

  const check1 = () => { setScore1(ACTIONS.filter((a) => a.ok === sel.includes(a.id)).length); setPhase(2); };
  const right2 = order.filter((a, i) => a.id === RIGHT[i].id).length;
  const move = (i, d) => { const j = i + d; if (j < 0 || j >= order.length) return; const n = [...order]; [n[i], n[j]] = [n[j], n[i]]; setOrder(n); };

  return (
    <div className="card game-card">
      <Progress i={phase >= 3 ? (phase === 4 ? 2 : 1) : 0} n={2} c={c} label={`Шаг ${phase >= 3 ? 2 : 1} / 2`} />
      <motion.div className="row" style={{ gap: 14, padding: '14px 16px', borderRadius: 18, background: '#2B2A3D', color: '#fff', marginBottom: 18 }}
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .6, ease: EASE }}>
        <span style={{ width: 42, height: 42, borderRadius: 12, background: '#10B783', display: 'grid', placeItems: 'center', flex: 'none' }}><Bell size={20} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800 }}>Зачисление +7 500 ₽</div>
          <div style={{ fontSize: 13.5, color: '#C9C8DF' }}>Перевод от Андрей Викторович К. · Через минуту: «Ой, ошибся! Верни на карту 2200 70** **** 1934, пожалуйста, срочно!»</div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {phase <= 2 ? (
          <motion.div key="p1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .4, ease: EASE }}>
            <h2 className="h3" style={{ marginBottom: 14 }}>Что ты сделаешь? Выбери все правильные действия</h2>
            <div className="grid g-2" style={{ gap: 10 }}>
              {ACTIONS.map((a) => {
                const on = sel.includes(a.id);
                const cls = phase === 2 ? (a.ok === on ? (on ? ' ok' : '') : ' bad') : on ? ' sel' : '';
                return (
                  <div key={a.id} style={{ display: 'grid', gap: 4 }}>
                    <button className={'opt' + cls} disabled={phase === 2} onClick={() => setSel((s) => (on ? s.filter((x) => x !== a.id) : [...s, a.id]))}>
                      <span className="check-box" style={on ? { background: 'var(--brand)', borderColor: 'var(--brand)', color: '#fff' } : {}}>{on && <Check size={15} strokeWidth={3} />}</span>
                      <Icon name={a.icon} size={20} color={c.fg} style={{ flex: 'none' }} />
                      <span style={{ fontSize: 15 }}>{a.t}</span>
                    </button>
                    {phase === 2 && !a.ok && <div style={{ fontSize: 13, fontWeight: 600, color: on ? 'var(--danger)' : 'var(--muted)', padding: '0 6px' }}>{a.why}</div>}
                    {phase === 2 && a.ok && !on && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', padding: '0 6px' }}>Это нужно было выбрать</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 18 }}>
              {phase === 1
                ? <button className="btn btn-primary btn-lg btn-block" onClick={check1} disabled={!sel.length}>Проверить</button>
                : <Feedback ok={score1 === ACTIONS.length} title={`Верно: ${score1} из ${ACTIONS.length}`} text="Теперь расставь правильные действия по порядку." onNext={() => setPhase(3)} nextLabel="Шаг 2" />}
            </div>
          </motion.div>
        ) : (
          <motion.div key="p2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: .4, ease: EASE }}>
            <h2 className="h3" style={{ marginBottom: 14 }}>В каком порядке? Сверху — первое действие</h2>
            <Reorder.Group axis="y" values={order} onReorder={phase === 4 ? () => {} : setOrder} style={{ display: 'grid', gap: 10 }}>
              {order.map((a, i) => {
                const ok = phase === 4 && a.id === RIGHT[i].id;
                const bad = phase === 4 && !ok;
                return (
                  <Reorder.Item key={a.id} value={a} dragListener={phase !== 4} className="drag-item" whileDrag={{ scale: 1.03, boxShadow: '0 20px 40px rgba(19,18,43,.16)' }}
                    style={{ listStyle: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px', borderRadius: 18, background: ok ? 'var(--mint-50)' : bad ? 'var(--danger-50)' : '#fff', boxShadow: `inset 0 0 0 2px ${ok ? 'var(--mint)' : bad ? 'var(--danger)' : 'var(--line)'}` }}>
                    <GripVertical size={20} color="var(--muted)" />
                    <span className="num-badge" style={{ background: c.bg, color: c.fg }}>{i + 1}</span>
                    <Icon name={a.icon} size={20} color={c.fg} />
                    <span style={{ fontWeight: 700, flex: 1 }}>{a.t}</span>
                    {phase !== 4 && <span className="row" style={{ gap: 2 }} onPointerDown={(e) => e.stopPropagation()}>
                      <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => move(i, -1)} aria-label="Выше"><ArrowUp size={16} /></button>
                      <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => move(i, 1)} aria-label="Ниже"><ArrowDown size={16} /></button>
                    </span>}
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
            <div style={{ marginTop: 18 }}>
              {phase === 3
                ? <button className="btn btn-primary btn-lg btn-block" onClick={() => setPhase(4)}>Проверить порядок</button>
                : <Feedback ok={right2 === RIGHT.length} title={`На своём месте: ${right2} из ${RIGHT.length}`}
                    text="Сначала — ничего не трогать, затем — банк. Если перевод правда ошибочный, банк вернёт его отправителю сам. Потом — родители и скриншоты (их можно сделать и параллельно)."
                    onNext={() => finish(score1 + right2, max)} nextLabel="Результат" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
