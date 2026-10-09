import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import GameShell, { Progress, Feedback } from './GameShell.jsx';

const ADS = [
  { src: 'Объявление в соцсети', text: 'Нужны ребята с картами любого банка. Платим 2000 за каждый принятый перевод. Без опыта!', danger: true, why: 'Платят за переводы через твою карту — это вербовка в дропперы.' },
  { src: 'Сайт кафе', text: 'Кафе «Маяк» ищет помощника на летний сезон. С 14 лет, оформление по трудовому договору с согласия родителей.', danger: false, why: 'Официальное оформление и согласие родителей — так работает честный работодатель.' },
  { src: 'Игровой чат', text: 'Купим твой аккаунт в банке. 5000 сразу, всё анонимно 😉', danger: true, why: 'Покупка доступа к банку — дропперство, за это есть уголовная статья.' },
  { src: 'Доска объявлений', text: 'Выгул собак по вечерам в вашем районе. Оплата наличными после прогулки.', danger: false, why: 'Обычная услуга, оплата за реальную работу.' },
  { src: 'Telegram-канал', text: 'Удалённая работа «финансовым агентом»: принимаешь деньги от клиентов и переводишь куратору. До 50 000 в неделю!', danger: true, why: '«Финансовый агент», который принимает и пересылает деньги, — это дроппер.' },
  { src: 'Школьная группа', text: 'Ищем ребят в волонтёрский отряд на субботник. Обед и сертификат волонтёра.', danger: false, why: 'Безопасно: никаких денег и карт.' },
  { src: 'Личные сообщения', text: 'Оформи карту в любом банке и отдай нам на месяц. Заплатим 3000, карту потом можно закрыть.', danger: true, why: 'Оформить карту и передать её — дропперство, даже если «потом закроешь».' },
  { src: 'Сайт библиотеки', text: 'Требуются помощники на летнюю площадку для младших школьников. С 15 лет, по договору.', danger: false, why: 'Официальная подработка с договором.' },
  { src: 'Комментарий под видео', text: 'Помоги с переводом для бабушки, у неё карта не работает. Скину 500 за помощь!', danger: true, why: 'Просьба провести чужие деньги через твою карту за вознаграждение.' },
  { src: 'Объявление у школы', text: 'Репетитор по математике для 5-классника, 2 раза в неделю. Оплата от родителей ученика.', danger: false, why: 'Реальная работа, деньги — за твой труд.' },
];

export default function SwipeGame({ activity }) {
  return (
    <GameShell activity={activity} how={['Перед тобой 10 объявлений о подработке.', 'Перетащи карточку вправо — «Опасно», влево — «Безопасно». Или нажми кнопку.', 'После каждого ответа — короткое объяснение.']}>
      {({ finish, color }) => <Play finish={finish} c={color} />}
    </GameShell>
  );
}

function Play({ finish, c }) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState(null); // true = «опасно»
  const [score, setScore] = useState(0);
  const card = ADS[i];

  const decide = (danger) => {
    if (ans !== null) return;
    setAns(danger);
    if (danger === card.danger) setScore((s) => s + 1);
  };
  const next = () => {
    if (i === ADS.length - 1) return finish(score, ADS.length);
    setI(i + 1); setAns(null);
  };
  useEffect(() => {
    const k = (e) => { if (ans !== null) return; if (e.key === 'ArrowRight') decide(true); if (e.key === 'ArrowLeft') decide(false); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  return (
    <div className="card game-card">
      <Progress i={i + (ans !== null ? 1 : 0)} n={ADS.length} c={c} label={`${i + 1} / ${ADS.length}`} />
      <div style={{ position: 'relative', height: 330, display: 'grid', placeItems: 'center', margin: '10px 0 6px' }}>
        {ADS[i + 1] && <div className="card" style={{ position: 'absolute', width: 'min(440px, 92%)', height: 270, transform: 'translateY(14px) scale(.95)', opacity: .6 }} />}
        <AnimatePresence mode="popLayout">
          <SwipeCard key={i} card={card} ans={ans} onDecide={decide} />
        </AnimatePresence>
      </div>
      {ans === null ? (
        <div className="row" style={{ gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-lg" style={{ background: 'var(--mint-50)', color: '#0A7A57', flex: 1, maxWidth: 220 }} onClick={() => decide(false)}><ShieldCheck size={20} />Безопасно</button>
          <button className="btn btn-lg" style={{ background: 'var(--danger-50)', color: 'var(--danger)', flex: 1, maxWidth: 220 }} onClick={() => decide(true)}><ShieldAlert size={20} />Опасно</button>
        </div>
      ) : (
        <Feedback ok={ans === card.danger} title={ans === card.danger ? 'Верно!' : card.danger ? 'Это ловушка' : 'Тут всё в порядке'} text={card.why} onNext={next} nextLabel={i === ADS.length - 1 ? 'Результат' : 'Дальше'} />
      )}
    </div>
  );
}

function SwipeCard({ card, ans, onDecide }) {
  const x = useMotionValue(0);
  const rot = useTransform(x, [-220, 220], [-14, 14]);
  const dangerOp = useTransform(x, [20, 120], [0, 1]);
  const safeOp = useTransform(x, [-120, -20], [1, 0]);
  useEffect(() => { if (ans !== null) animate(x, ans ? 520 : -520, { duration: .55, ease: [0.22, 1, 0.36, 1], delay: .9 }); }, [ans, x]);

  return (
    <motion.div className="card drag-item" drag={ans === null ? 'x' : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={.9}
      onDragEnd={(_, info) => { if (info.offset.x > 110) onDecide(true); else if (info.offset.x < -110) onDecide(false); }}
      style={{ x, rotate: rot, position: 'absolute', width: 'min(440px, 92%)', minHeight: 270, padding: 28, display: 'grid', alignContent: 'space-between', gap: 18, boxShadow: 'var(--sh-3)' }}
      initial={{ scale: .9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: .2 } }} transition={{ duration: .45, ease: [0.22, 1, 0.36, 1] }}>
      <motion.div style={{ opacity: dangerOp, position: 'absolute', top: 18, right: 18, padding: '6px 12px', borderRadius: 10, border: '3px solid var(--danger)', color: 'var(--danger)', fontWeight: 800, rotate: 10 }}>ОПАСНО</motion.div>
      <motion.div style={{ opacity: safeOp, position: 'absolute', top: 18, left: 18, padding: '6px 12px', borderRadius: 10, border: '3px solid var(--mint)', color: 'var(--mint)', fontWeight: 800, rotate: -10 }}>БЕЗОПАСНО</motion.div>
      <span className="chip" style={{ background: 'var(--bg-2)', color: 'var(--ink-2)', width: 'fit-content' }}>{card.src}</span>
      <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}>{card.text}</div>
      <div className="row between muted" style={{ fontSize: 13, fontWeight: 700 }}><span>← безопасно</span><span>опасно →</span></div>
    </motion.div>
  );
}
