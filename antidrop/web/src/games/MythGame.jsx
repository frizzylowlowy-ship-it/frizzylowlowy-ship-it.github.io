import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleHelp } from 'lucide-react';
import GameShell, { Progress, Feedback } from './GameShell.jsx';
import { EASE } from '../components/ui.jsx';

const ITEMS = [
  { t: 'Если мне меньше 16 лет, за передачу карты мне ничего не будет.', truth: false, why: 'Миф. Уголовной ответственности по ст. 187 до 16 лет нет, но карты блокируют, а потерпевшие могут взыскать деньги с семьи.' },
  { t: 'Банк никогда не просит перевести «ошибочный» платёж на другую карту.', truth: true, why: 'Правда. Ошибочный перевод возвращают только через банк, а не вручную по реквизитам из сообщения.' },
  { t: 'Сдать карту в аренду знакомому — законно, это же моя карта.', truth: false, why: 'Миф. Передача карты или доступа к ней за вознаграждение — преступление по ст. 187 УК РФ.' },
  { t: 'Каждый пятый выявленный дроппер в России — несовершеннолетний.', truth: true, why: 'Правда. Такие данные приводит Банк России.' },
  { t: 'Настоящий полицейский может попросить подростка помочь поймать мошенников переводом денег.', truth: false, why: 'Миф. Полиция не проводит «операций» через детские карты. Это приём «синдром пионера».' },
  { t: 'С 1 августа 2025 года подростку 14–18 лет карту выдают только с письменного согласия родителей.', truth: true, why: 'Правда. Это требование закона № 178-ФЗ.' },
  { t: 'Если я просто перевёл деньги дальше и ничего себе не оставил, я не участвовал в схеме.', truth: false, why: 'Миф. Перевод чужих денег по указанию других людей — это и есть роль дроппера.' },
  { t: 'Код из СМС от банка можно сообщить «сотруднику банка», если он сам позвонил.', truth: false, why: 'Миф. Коды из СМС не сообщают никому, даже настоящим сотрудникам банка.' },
  { t: 'Детский телефон доверия 8-800-2000-122 — бесплатный и анонимный.', truth: true, why: 'Правда. Можно позвонить с любого телефона, имя называть не нужно.' },
  { t: 'Если удалить переписку с вербовщиком, никто ничего не докажет.', truth: false, why: 'Миф. Переводы видны в банке. А переписка, наоборот, может помочь доказать, что тебя обманули.' },
  { t: 'За покупку и передачу чужих карт грозит до 6 лет лишения свободы.', truth: true, why: 'Правда. Это предусматривает ст. 187 УК РФ в редакции 2025 года.' },
  { t: 'Тот, кто впервые оступился и сам помог раскрыть схему, может быть освобождён от ответственности.', truth: true, why: 'Правда. Закон предусматривает такую возможность — поэтому важно не молчать, а рассказать взрослым и полиции.' },
];

export default function MythGame({ activity }) {
  return (
    <GameShell activity={activity} how={['12 утверждений о картах, законе и «лёгком заработке».', 'Реши, правда это или миф. Можно стрелками ← →.', 'Карточка перевернётся и покажет объяснение.']}>
      {({ finish, color }) => <Play finish={finish} c={color} />}
    </GameShell>
  );
}

function Play({ finish, c }) {
  const [i, setI] = useState(0);
  const [ans, setAns] = useState(null);
  const [score, setScore] = useState(0);
  const it = ITEMS[i];
  const choose = (v) => { if (ans !== null) return; setAns(v); if (v === it.truth) setScore((s) => s + 1); };
  const next = () => { if (i === ITEMS.length - 1) return finish(score, ITEMS.length); setI(i + 1); setAns(null); };
  useEffect(() => {
    const k = (e) => { if (ans === null && e.key === 'ArrowLeft') choose(true); if (ans === null && e.key === 'ArrowRight') choose(false); };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  });

  return (
    <div className="card game-card">
      <Progress i={i + (ans !== null ? 1 : 0)} n={ITEMS.length} c={c} label={`${i + 1} / ${ITEMS.length}`} />
      <div style={{ perspective: 1200, margin: '10px auto 20px', maxWidth: 620 }}>
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: .4, ease: EASE }}>
            <motion.div animate={{ rotateY: ans === null ? 0 : 180 }} transition={{ duration: .7, ease: EASE }}
              style={{ position: 'relative', height: 250, transformStyle: 'preserve-3d' }}>
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: 28, background: c.bg, display: 'grid', placeItems: 'center', padding: 32, textAlign: 'center' }}>
                <div>
                  <div style={{ display: 'grid', placeItems: 'center', marginBottom: 12, color: c.fg }}><CircleHelp size={36} /></div>
                  <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.35 }}>{it.t}</div>
                </div>
              </div>
              <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: 28, background: it.truth ? 'var(--mint-50)' : 'var(--danger-50)', display: 'grid', placeItems: 'center', padding: 32, textAlign: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 38, color: it.truth ? '#0A7A57' : 'var(--danger)' }}>{it.truth ? 'ПРАВДА' : 'МИФ'}</div>
                  <div className="ink2" style={{ fontSize: 16.5, fontWeight: 600, marginTop: 10, lineHeight: 1.45 }}>{it.why}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      {ans === null ? (
        <div className="row" style={{ gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-lg" style={{ background: 'var(--mint-50)', color: '#0A7A57', flex: 1, maxWidth: 240 }} onClick={() => choose(true)}>✓ Правда</button>
          <button className="btn btn-lg" style={{ background: 'var(--danger-50)', color: 'var(--danger)', flex: 1, maxWidth: 240 }} onClick={() => choose(false)}>✕ Миф</button>
        </div>
      ) : <Feedback ok={ans === it.truth} onNext={next} nextLabel={i === ITEMS.length - 1 ? 'Результат' : 'Дальше'} />}
    </div>
  );
}
