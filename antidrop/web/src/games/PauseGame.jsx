import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Zap, MessageCircle } from 'lucide-react';
import GameShell from './GameShell.jsx';
import { EASE } from '../components/ui.jsx';

const MSGS = [
  { t: 'Скинь фотку домашки по русскому', d: false },
  { t: 'Нужна карта на 3 дня, плачу 3000', d: true },
  { t: 'Мама: купи хлеб по дороге домой', d: false },
  { t: 'Прими перевод и отправь дальше, 10% твои', d: true },
  { t: 'Тренировка перенесена на 18:00', d: false },
  { t: 'Скажи код из СМС, это для зарплаты', d: true },
  { t: 'Классный руководитель: завтра экскурсия', d: false },
  { t: 'Пришли деньги по ошибке — верни на эту карту', d: true },
  { t: 'Го в кино в субботу?', d: false },
  { t: 'Я из полиции, помоги поймать мошенников', d: true },
  { t: 'Папа: я задержусь на работе', d: false },
  { t: 'Оформи карту и отдай нам, заплатим сразу', d: true },
  { t: 'Скинь ссылку на конференцию по алгебре', d: false },
  { t: 'Только родителям не говори, ок?', d: true },
  { t: 'С днём рождения! 🎉', d: false },
  { t: 'Решай за 5 минут, потом место займут', d: true },
];

export default function PauseGame({ activity }) {
  return (
    <GameShell activity={activity} how={['Сообщения приходят одно за другим — всё быстрее.', 'Если сообщение опасное — жми «Пауза!» (или пробел), пока оно не исчезло.', 'Безопасные сообщения пропускай. Ошибка — минус балл за сообщение.']}>
      {({ finish, color }) => <Play finish={finish} c={color} />}
    </GameShell>
  );
}

function Play({ finish, c }) {
  const [order] = useState(() => [...MSGS].sort(() => Math.random() - .5));
  const [i, setI] = useState(-1);
  const [hit, setHit] = useState(null); // результат по текущему сообщению
  const [res, setRes] = useState([]); // true/false по каждому
  const [count, setCount] = useState(3);
  const timer = useRef(null);
  const pressed = useRef(false);
  const life = (k) => Math.max(1700, 3300 - k * 100);

  // Обратный отсчёт перед стартом
  useEffect(() => {
    if (count <= 0) { setI(0); return; }
    const t = setTimeout(() => setCount(count - 1), 700);
    return () => clearTimeout(t);
  }, [count]);

  const resolve = useCallback((pause) => {
    if (i < 0 || i >= order.length || hit) return;
    clearTimeout(timer.current);
    const ok = pause === order[i].d;
    setHit({ ok, pause });
    setRes((r) => [...r, ok]);
    setTimeout(() => { setHit(null); pressed.current = false; setI((k) => k + 1); }, 750);
  }, [i, hit, order]);

  useEffect(() => {
    if (i < 0) return;
    if (i >= order.length) return;
    timer.current = setTimeout(() => resolve(false), life(i));
    return () => clearTimeout(timer.current);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (i >= order.length && res.length === order.length) {
      const score = res.filter(Boolean).length;
      const t = setTimeout(() => finish(score, order.length, `Поймано опасных: ${order.filter((m, k) => m.d && res[k]).length} из ${order.filter((m) => m.d).length}. Пропущено безопасных верно: ${order.filter((m, k) => !m.d && res[k]).length} из ${order.filter((m) => !m.d).length}.`), 500);
      return () => clearTimeout(t);
    }
  }, [i, res]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const k = (e) => { if (e.code === 'Space') { e.preventDefault(); if (!pressed.current) { pressed.current = true; resolve(true); } } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [resolve]);

  const m = order[i];
  const score = res.filter(Boolean).length;
  const streak = (() => { let s = 0; for (let k = res.length - 1; k >= 0 && res[k]; k--) s++; return s; })();

  return (
    <div className="card game-card">
      <div className="row between" style={{ marginBottom: 14 }}>
        <span className="chip chip-brand" style={{ height: 34, fontSize: 14 }}>Счёт: {score}</span>
        <AnimatePresence>{streak >= 3 && <motion.span key={streak} initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="chip chip-sun" style={{ height: 34, fontSize: 14 }}><Zap size={15} />Серия ×{streak}</motion.span>}</AnimatePresence>
        <span className="muted" style={{ fontWeight: 800, fontSize: 14 }}>{Math.min(i + 1, order.length)} / {order.length}</span>
      </div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 22 }}>
        {order.map((_, k) => <div key={k} style={{ flex: 1, height: 6, borderRadius: 9, background: k < res.length ? (res[k] ? 'var(--mint)' : 'var(--danger)') : k === i ? c.fg : 'var(--bg-2)', transition: 'background .3s' }} />)}
      </div>

      <div style={{ height: 230, display: 'grid', placeItems: 'center', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {i < 0 && <motion.div key={'c' + count} initial={{ scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .6, opacity: 0 }} style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 96, color: c.fg }}>{count || 'Старт!'}</motion.div>}
          {m && (
            <motion.div key={i} initial={{ y: 60, opacity: 0, scale: .9 }} animate={{ y: 0, opacity: 1, scale: hit ? 1.03 : 1 }} exit={{ y: -40, opacity: 0, transition: { duration: .2 } }} transition={{ duration: .35, ease: EASE }}
              style={{ width: 'min(480px, 100%)', borderRadius: 24, background: hit ? (hit.ok ? 'var(--mint-50)' : 'var(--danger-50)') : '#fff', boxShadow: 'var(--sh-3)', padding: 22, position: 'relative', overflow: 'hidden' }}>
              <div className="row" style={{ gap: 10, marginBottom: 10 }}>
                <span style={{ width: 34, height: 34, borderRadius: '50%', background: c.bg, display: 'grid', placeItems: 'center', color: c.fg }}><MessageCircle size={17} /></span>
                <b className="muted" style={{ fontSize: 13 }}>Новое сообщение</b>
              </div>
              <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.35 }}>{m.t}</div>
              {hit && <div style={{ marginTop: 10, fontWeight: 800, color: hit.ok ? '#0A7A57' : 'var(--danger)' }}>{hit.ok ? (hit.pause ? '✓ Пауза! Флаг пойман' : '✓ Безопасно, пропущено') : (hit.pause ? '✕ Это было безопасное' : '✕ Пропущен флаг!')}</div>}
              {!hit && <motion.div key={'bar' + i} initial={{ width: '100%' }} animate={{ width: 0 }} transition={{ duration: life(i) / 1000, ease: 'linear' }} style={{ position: 'absolute', left: 0, bottom: 0, height: 5, background: c.fg }} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button whileTap={{ scale: .94 }} className="btn btn-lg btn-block" disabled={!m || !!hit} onClick={() => resolve(true)}
        style={{ marginTop: 22, height: 76, fontSize: 22, background: 'var(--danger)', color: '#fff', boxShadow: '0 14px 30px rgba(236,61,92,.35)', borderRadius: 22 }}>
        <Hand size={26} />Пауза! <span className="kbd hide-m" style={{ background: 'rgba(255,255,255,.2)', border: 0, color: '#fff' }}>пробел</span>
      </motion.button>
    </div>
  );
}
