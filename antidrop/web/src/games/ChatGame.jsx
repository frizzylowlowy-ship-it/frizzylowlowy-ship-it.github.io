import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import GameShell, { Progress } from './GameShell.jsx';
import { EASE } from '../components/ui.jsx';

// Каждый шаг: сообщения вербовщика и варианты ответа (pts: 2 — лучший, 1 — нормально, 0 — опасно)
const STEPS = [
  {
    them: ['Привет! 👋 Я Макс, набираю ребят в команду', 'Есть удалённая подработка, 15 минут в день, от 2000 ₽'],
    opts: [
      { text: 'А что за работа? Расскажи подробнее', pts: 1, note: 'Любопытство понятно, но вербовщик только этого и ждёт. Лучше сразу насторожиться: кто это и откуда он тебя знает?' },
      { text: 'Мы знакомы? Откуда у тебя мой контакт?', pts: 2, note: 'Отличный вопрос! Незнакомец с предложением денег — первый повод насторожиться.' },
      { text: 'Давай! Что делать? 💸', pts: 0, note: 'Соглашаться, не зная деталей, опасно — особенно когда обещают деньги «за 15 минут».' },
    ],
  },
  {
    them: ['Да мне друг посоветовал, неважно 😅', 'Короче, тебе на карту приходят деньги от клиентов, ты переводишь их куратору. 10% оставляешь себе'],
    opts: [
      { text: 'Это же дропперство. Нет, спасибо', pts: 2, note: 'Точно! Ты узнал схему: чужие деньги через твою карту.' },
      { text: 'А почему клиенты не переводят куратору сами?', pts: 1, note: 'Правильный вопрос себе. Ответ простой: чтобы запутать след украденных денег.' },
      { text: 'Окей, 10% — норм. Какая карта нужна?', pts: 0, note: 'Это и есть согласие стать дроппером. За такое — уголовная ответственность с 16 лет.' },
    ],
  },
  {
    them: ['Да ты чего, всё легально! У нас ИП, договор есть 📄', 'Решай быстрее, у меня ещё 20 желающих. Место держу 10 минут ⏳'],
    opts: [
      { text: 'Возьму паузу и посоветуюсь с родителями', pts: 2, note: 'Правило 15 минут в действии! Спешка — главный инструмент вербовщика.' },
      { text: 'Ну раз есть договор, то ладно…', pts: 0, note: '«Всё легально» и «договор» — частые слова вербовщиков. Никакой договор не делает перевод чужих денег законным.' },
      { text: 'Пришли договор, я почитаю', pts: 1, note: 'Хотя бы не соглашаешься сразу. Но главное — не попадать под давление «10 минут».' },
    ],
  },
  {
    them: ['Родителям не говори, они старой закалки, не поймут 🙄', 'Это наш маленький секрет. Скинь фото карты с двух сторон и код из СМС, чтобы я тебя оформил'],
    opts: [
      { text: 'Скидываю фото карты 📸', pts: 0, note: 'Фото карты и код из СМС — это полный доступ к твоим деньгам и счёту. Никогда никому не отправляй.' },
      { text: 'Коды из СМС не сообщаю никому. Разговор окончен', pts: 2, note: 'Супер! Твёрдое «нет» без объяснений — лучшая тактика.' },
      { text: 'Только фото, без кода, можно?', pts: 0, note: 'Даже данные карты без кода — уже риск. Просьба держать всё в секрете от родителей — сильнейший флаг.' },
    ],
  },
  {
    them: ['Слушай, ты меня подставляешь 😠', 'Я уже записал тебя в систему. Если откажешься — напишу твоим родителям, что ты мошенник'],
    opts: [
      { text: 'Блокирую и рассказываю родителям сам', pts: 2, note: 'Правильно. Угрозы — это манипуляция. Расскажи взрослым первым, а если давят дальше — 102.' },
      { text: 'Ладно-ладно, только не пиши им…', pts: 0, note: 'Вербовщик на это и рассчитывает. Угроза «расскажу родителям» работает, только пока ты молчишь.' },
      { text: 'Сам ты мошенник! (и спорю дальше)', pts: 1, note: 'Ты не поддался, но спор даёт вербовщику время найти новые аргументы. Лучше просто заблокировать.' },
    ],
  },
];

export default function ChatGame({ activity }) {
  return (
    <GameShell activity={activity} how={['Тебе пишет незнакомец. Это симуляция настоящей вербовки.', 'Выбирай ответ — после каждого увидишь, насколько он безопасен.', 'Чем увереннее ты отказываешься, тем больше баллов.']}>
      {({ finish, color }) => <Play finish={finish} c={color} />}
    </GameShell>
  );
}

function Play({ finish, c }) {
  const [step, setStep] = useState(0);
  const [log, setLog] = useState([]); // {who, text, note?, pts?}
  const [typing, setTyping] = useState(false);
  const [score, setScore] = useState(0);
  const [canAnswer, setCanAnswer] = useState(false);
  const box = useRef(null);
  const max = STEPS.length * 2;

  // Вербовщик «печатает» свои сообщения по очереди
  useEffect(() => {
    if (step >= STEPS.length) return;
    let alive = true;
    setCanAnswer(false);
    (async () => {
      for (const t of STEPS[step].them) {
        setTyping(true);
        await wait(700 + t.length * 12);
        if (!alive) return;
        setTyping(false);
        setLog((l) => [...l, { who: 'them', text: t }]);
        await wait(250);
      }
      if (alive) setCanAnswer(true);
    })();
    return () => { alive = false; };
  }, [step]);

  useEffect(() => { box.current?.scrollTo({ top: box.current.scrollHeight, behavior: 'smooth' }); }, [log, typing, canAnswer]);

  const answer = (o) => {
    setCanAnswer(false);
    setScore((s) => s + o.pts);
    setLog((l) => [...l, { who: 'me', text: o.text }, { who: 'note', text: o.note, pts: o.pts }]);
    setTimeout(() => setStep((s) => s + 1), 900);
  };
  const done = step >= STEPS.length;

  return (
    <div className="card game-card">
      <Progress i={Math.min(step, STEPS.length)} n={STEPS.length} c={c} label={`${Math.min(step + 1, STEPS.length)} / ${STEPS.length}`} />
      <div style={{ maxWidth: 560, margin: '0 auto', borderRadius: 32, background: '#2E2A6B', padding: 10, boxShadow: 'var(--sh-3)' }}>
        <div style={{ borderRadius: 24, background: '#EEF0F8', overflow: 'hidden' }}>
          <div className="row" style={{ gap: 10, padding: '12px 16px', background: '#fff', borderBottom: '1px solid var(--line)' }}>
            <span style={{ width: 38, height: 38, borderRadius: '50%', background: '#FA5A5A', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800 }}>М</span>
            <div><b style={{ fontSize: 15 }}>Макс | Работа</b><div style={{ fontSize: 12, color: typing ? 'var(--brand)' : 'var(--muted)', fontWeight: 700 }}>{typing ? 'печатает…' : 'был(а) недавно'}</div></div>
          </div>
          <div ref={box} style={{ height: 420, overflowY: 'auto', padding: 14, display: 'grid', gap: 8, alignContent: 'start' }}>
            <AnimatePresence initial={false}>
              {log.map((m, i) => m.who === 'note' ? (
                <motion.div key={i} initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .35 }}
                  style={{ justifySelf: 'center', maxWidth: '92%', padding: '10px 14px', borderRadius: 14, fontSize: 13.5, fontWeight: 600, lineHeight: 1.4,
                    background: m.pts === 2 ? '#E2F8F0' : m.pts === 1 ? '#FFF6DB' : '#FDE8EC', color: m.pts === 2 ? '#0A7A57' : m.pts === 1 ? '#8A5B00' : '#C42746' }}>
                  <b>{m.pts === 2 ? '+2 · ' : m.pts === 1 ? '+1 · ' : '0 · '}</b>{m.text}
                </motion.div>
              ) : (
                <motion.div key={i} className={'bubble ' + m.who} initial={{ opacity: 0, y: 10, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .3, ease: EASE }}>{m.text}</motion.div>
              ))}
              {typing && (
                <motion.div key="typing" className="bubble them" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: 4, padding: '14px 16px' }}>
                  {[0, 1, 2].map((d) => <motion.span key={d} animate={{ y: [0, -4, 0] }} transition={{ duration: .6, repeat: Infinity, delay: d * .15 }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#9C9BB5' }} />)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div style={{ padding: 12, background: '#fff', borderTop: '1px solid var(--line)', display: 'grid', gap: 8, minHeight: 72 }}>
            {done ? (
              <button className="btn btn-primary btn-block" onClick={() => finish(score, max, 'Ты прошёл весь сценарий вербовки: от «лёгкой подработки» до угроз. В жизни лучший ход — заблокировать на первом же флаге.')}>Посмотреть результат</button>
            ) : canAnswer ? STEPS[step].opts.map((o, k) => (
              <motion.button key={o.text} className="opt" style={{ padding: '11px 14px', fontSize: 14.5 }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * .07 }} onClick={() => answer(o)}>
                <Send size={16} color="var(--brand)" style={{ flex: 'none' }} />{o.text}
              </motion.button>
            )) : <div className="muted center" style={{ fontSize: 13.5, alignSelf: 'center' }}>…</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
