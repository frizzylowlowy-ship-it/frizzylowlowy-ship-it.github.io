import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Check } from 'lucide-react';
import GameShell, { Progress, Feedback } from './GameShell.jsx';
import { EASE } from '../components/ui.jsx';

// Переписки: flag — сообщение подозрительное, why — объяснение
const ROUNDS = [
  {
    name: 'Незнакомец в соцсети', avatar: 'Н',
    msgs: [
      { text: 'Привет! Видел тебя в группе школы 👋', flag: false, why: 'Обычное приветствие — само по себе не флаг.' },
      { text: 'Есть подработка: 3000 за вечер, ничего делать не надо', flag: true, why: 'Деньги «за просто так» — главный флаг.' },
      { text: 'Тебе придёт перевод, отправишь его по реквизитам, 10% себе', flag: true, why: 'Просят провести чужие деньги через твою карту.' },
      { text: 'У тебя какой банк?', flag: true, why: 'Интерес к твоей карте — подготовка к схеме.' },
      { text: 'Только родакам не говори, они не поймут', flag: true, why: 'Секретность от родителей — сильный флаг.' },
    ],
  },
  {
    name: 'Одноклассник Дима', avatar: 'Д',
    msgs: [
      { text: 'Ты домашку по физике сделал?', flag: false, why: 'Обычный школьный вопрос.' },
      { text: 'Слушай, есть тема, мне брат скинул', flag: false, why: 'Пока ничего подозрительного.' },
      { text: 'Сдаёшь карту на неделю — получаешь 5000', flag: true, why: 'Аренда карты — классическая вербовка, даже через знакомых.' },
      { text: 'Все пацаны из 9 «А» уже так сделали, всё норм', flag: true, why: '«Все так делают» — давление группы.' },
      { text: 'Давай быстрее, до вечера надо ответить', flag: true, why: 'Спешка, чтобы не успел подумать.' },
    ],
  },
  {
    name: '«Служба безопасности банка»', avatar: 'Б',
    msgs: [
      { text: 'Здравствуйте! Вас беспокоит служба безопасности банка', flag: true, why: 'Банк не пишет клиентам в мессенджерах от имени «службы безопасности».' },
      { text: 'На вашу карту по ошибке зачислено 7 500 ₽', flag: true, why: '«Ошибочный перевод» — частый сценарий вовлечения.' },
      { text: 'Верните их на карту 2200 15** **** 4471', flag: true, why: 'Возврат на другую карту — это и есть работа дроппера.' },
      { text: 'Если не вернёте в течение часа, счёт будет заблокирован', flag: true, why: 'Угроза и спешка.' },
      { text: 'Спасибо, что пользуетесь нашим банком', flag: false, why: 'Вежливая фраза — не флаг, но не делает переписку честной.' },
    ],
  },
  {
    name: 'Канал «Работа для школьников»', avatar: 'К',
    msgs: [
      { text: 'Ищем промоутеров на выходные, раздача листовок у ТЦ', flag: false, why: 'Обычная подработка — если оформляют официально.' },
      { text: 'Оплата 1500 за смену, нужен паспорт и согласие родителей', flag: false, why: 'Согласие родителей и документы — признак честного работодателя.' },
      { text: 'Есть и удалёнка: принимать платежи от клиентов на свою карту', flag: true, why: '«Принимать платежи на свою карту» = быть дроппером.' },
      { text: 'Подробности — только в закрытом чате, ссылка в профиле', flag: true, why: 'Перевод в закрытый чат — попытка спрятаться.' },
    ],
  },
];

export default function FlagsGame({ activity }) {
  return (
    <GameShell activity={activity} how={['Читай переписку — это 4 разные ситуации.', 'Нажимай на сообщения, которые считаешь красными флагами.', 'Нажми «Проверить» — баллы за каждое верно оценённое сообщение.']}>
      {({ finish, color }) => <Play finish={finish} c={color} />}
    </GameShell>
  );
}

function Play({ finish, c }) {
  const [r, setR] = useState(0);
  const [sel, setSel] = useState([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const round = ROUNDS[r];
  const max = ROUNDS.reduce((s, x) => s + x.msgs.length, 0);
  const correctNow = round.msgs.filter((m, i) => m.flag === sel.includes(i)).length;

  const check = () => { setChecked(true); setScore((s) => s + correctNow); };
  const next = () => {
    if (r === ROUNDS.length - 1) return finish(score, max);
    setR(r + 1); setSel([]); setChecked(false);
  };

  return (
    <div className="card game-card">
      <Progress i={r + (checked ? 1 : 0)} n={ROUNDS.length} c={c} label={`${r + 1} / ${ROUNDS.length}`} />
      <div className="row between row-wrap" style={{ marginBottom: 14, gap: 10 }}>
        <div className="row" style={{ gap: 12 }}>
          <span style={{ width: 46, height: 46, borderRadius: '50%', background: c.bg, display: 'grid', placeItems: 'center', fontSize: 18, fontWeight: 700, color: c.fg }}>{round.avatar}</span>
          <div><b>{round.name}</b><div className="muted" style={{ fontSize: 13 }}>Найди все красные флаги</div></div>
        </div>
        <span className="chip chip-danger"><Flag size={14} />Отмечено: {sel.length}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={r} className="chat-shell" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: .4, ease: EASE }}>
          {round.msgs.map((m, i) => {
            const on = sel.includes(i);
            const right = m.flag === on;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 + i * .12, duration: .4, ease: EASE }} style={{ display: 'grid', gap: 6 }}>
                <motion.button disabled={checked} whileTap={{ scale: .98 }}
                  onClick={() => setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))}
                  style={{ justifySelf: 'start', maxWidth: '88%', textAlign: 'left', padding: '12px 16px', borderRadius: 18, borderBottomLeftRadius: 6, fontWeight: 600, fontSize: 15.5, lineHeight: 1.4,
                    background: on ? '#FDE8EC' : '#fff', boxShadow: on ? 'inset 0 0 0 2px var(--danger)' : '0 1px 2px rgba(19,18,43,.06)', display: 'flex', gap: 10, alignItems: 'center', transition: 'background .2s, box-shadow .2s' }}>
                  <span>{m.text}</span>
                  <AnimatePresence>{on && <motion.span initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} style={{ display: 'grid', color: 'var(--danger)' }}><Flag size={16} /></motion.span>}</AnimatePresence>
                </motion.button>
                {checked && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ delay: i * .08 }}
                    style={{ fontSize: 13.5, fontWeight: 700, color: right ? '#0A7A57' : 'var(--danger)', paddingLeft: 8, display: 'flex', gap: 6 }}>
                    {right ? <Check size={16} /> : '✕'} {m.flag ? (on ? 'Флаг найден. ' : 'Пропущен флаг! ') : (on ? 'Это не флаг. ' : '')}{m.why}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
      <div style={{ marginTop: 18 }}>
        {!checked
          ? <button className="btn btn-primary btn-lg btn-block" onClick={check}>Проверить</button>
          : <Feedback ok={correctNow === round.msgs.length} title={`Верно оценено ${correctNow} из ${round.msgs.length}`} onNext={next} nextLabel={r === ROUNDS.length - 1 ? 'Результат' : 'Следующая переписка'} />}
      </div>
    </div>
  );
}
