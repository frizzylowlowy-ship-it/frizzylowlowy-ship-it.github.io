import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trophy, Star, Award, KeyRound, ChevronDown, Gamepad2, BookOpen } from 'lucide-react';
import PageHead, { SectionTitle, ArtCircle } from '../components/PageHead.jsx';
import { IlloChat, IlloCertificate } from '../components/Illo.jsx';
import { Reveal, Stagger, Item, EASE } from '../components/ui.jsx';
import { GameCard, LessonCard } from '../components/Cards.jsx';
import { LESSONS, GAMES, ACTIVITIES, COURSE_PASS_RATIO } from '@shared/catalog.js';
import { useBest } from '../lib/progress.js';
import { useAuth } from '../lib/auth.jsx';

const FAQ = [
  ['Мне написали с предложением «подработки». Что делать?', 'Ничего не отвечай 15 минут. Задай себе три вопроса: почему так легко, чьи это деньги, могу ли я рассказать об этом родителям. Если хоть что-то смущает — откажись коротко и заблокируй собеседника. Подробно — в уроке «Правило 15 минут».'],
  ['На мою карту пришли чужие деньги. Их можно вернуть самому?', 'Нет. Не переводи их никуда, даже «обратно». Позвони в банк по номеру на обороте карты и расскажи родителям. Если перевод правда ошибочный, банк вернёт деньги сам.'],
  ['Мне меньше 16 — значит, мне ничего не будет?', 'Это миф. Уголовная ответственность по ст. 187 УК РФ наступает с 16 лет, но и раньше карты блокируют, а потерпевшие могут потребовать деньги с семьи через суд.'],
  ['Я уже согласился. Что теперь?', 'Не паникуй и не молчи. Заблокируй карту в приложении банка, расскажи родителям или учителю, не удаляй переписку. Вместе со взрослыми обратитесь в полицию. Если угрожают — сразу звони 102.'],
  ['Мне страшно рассказывать родителям. Куда ещё можно обратиться?', 'Позвони на детский телефон доверия 8-800-2000-122. Это бесплатно и анонимно, там помогут спокойно разобраться и решить, как рассказать взрослым.'],
  ['Зачем регистрироваться на сайте?', 'Без регистрации можно проходить всё. С аккаунтом прогресс сохраняется, учитель видит выполненные задания, а за весь курс ты получишь именную грамоту с номером для проверки.'],
];

export default function Students() {
  const best = useBest();
  const { user } = useAuth();
  const nav = useNavigate();
  const [code, setCode] = useState('');
  const done = ACTIVITIES.filter((a) => best[a.id]?.ratio >= COURSE_PASS_RATIO).length;
  const next = LESSONS.find((l) => !(best[l.id]?.ratio >= COURSE_PASS_RATIO)) || GAMES.find((g) => !(best[g.id]?.ratio >= COURSE_PASS_RATIO));

  return (
    <div className="page">
      <PageHead eyebrow="Ученикам"
        title={<>Учись замечать ловушку <span className="grad-text">раньше, чем она сработает</span></>}
        lead="Пять коротких уроков и восемь игр. Узнаешь, как вербуют в дропперы, научишься видеть красные флаги и поймёшь, что делать, если уже написали."
        art={<StudentsArt done={done} />}>
        <div className="row row-wrap" style={{ gap: 12 }}>
          <Link to={next ? (next.kind === 'lesson' ? `/igry/urok/${next.id}` : `/igry/${next.id}`) : '/igry'} className="btn btn-primary btn-lg">
            {done ? 'Продолжить' : 'Начать с первого урока'} <ArrowRight size={20} />
          </Link>
          <Link to="/igry" className="btn btn-ghost btn-lg"><Gamepad2 size={20} /> Все игры</Link>
        </div>
      </PageHead>

      {/* ---------- Прогресс ---------- */}
      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className="card" style={{ padding: 28, display: 'grid', gap: 18 }}>
            <div className="row between row-wrap" style={{ gap: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20 }}>Твой прогресс: {done} из {ACTIVITIES.length}</div>
                <div className="muted" style={{ fontSize: 14.5, marginTop: 4 }}>
                  {user?.role === 'student' ? 'Результаты сохраняются в твоём кабинете.' : 'Прогресс сохраняется в этом браузере. Зарегистрируйся, чтобы получить грамоту и видеть задания учителя.'}
                </div>
              </div>
              {!user && <Link to="/registraciya" className="btn btn-soft">Создать аккаунт</Link>}
              {user?.role === 'student' && <Link to="/kabinet" className="btn btn-soft">Мой кабинет</Link>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${ACTIVITIES.length}, 1fr)`, gap: 6 }}>
              {ACTIVITIES.map((a, i) => {
                const ok = best[a.id]?.ratio >= COURSE_PASS_RATIO;
                return (
                  <motion.div key={a.id} title={a.title} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                    transition={{ delay: i * .05, duration: .6, ease: EASE }}
                    style={{ height: 10, borderRadius: 99, background: ok ? 'var(--brand)' : 'var(--bg-2)', transformOrigin: 'left' }} />
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Уроки ---------- */}
      <section className="section-sm">
        <div className="container split" style={{ alignItems: 'start' }}>
          <div style={{ position: 'sticky', top: 100 }}>
            <SectionTitle eyebrow="Курс" title="5 уроков по 6–8 минут" lead="Карточки с примерами и вопросами. Ответил верно — получил баллы. Ошибся — увидишь объяснение." />
            <div className="row" style={{ gap: 10 }}>
              <span className="chip chip-brand"><BookOpen size={14} />Теория + проверка</span>
              <span className="chip chip-sun"><Star size={14} />Баллы за ответы</span>
            </div>
          </div>
          <Stagger style={{ display: 'grid', gap: 12 }}>
            {LESSONS.map((l) => <Item key={l.id}><LessonCard l={l} best={best} /></Item>)}
          </Stagger>
        </div>
      </section>

      {/* ---------- Игры ---------- */}
      <section className="section-sm">
        <div className="container">
          <div className="row between row-wrap" style={{ alignItems: 'end' }}>
            <SectionTitle eyebrow="Игры" title="Тренируйся на практике" lead="Перетаскивай, ищи, выбирай ответы в переписке. Каждая игра — 2–5 минут." />
            <Link to="/igry" className="btn btn-ghost" style={{ marginBottom: 40 }}>Каталог <ArrowRight size={18} /></Link>
          </div>
          <Stagger className="grid g-4">
            {GAMES.slice(0, 4).map((g) => <Item key={g.id}><GameCard g={g} best={best} /></Item>)}
          </Stagger>
        </div>
      </section>

      {/* ---------- Баллы и грамоты + код класса ---------- */}
      <section className="section-sm">
        <div className="container grid g-2">
          <Reveal className="card" style={{ padding: 32, background: 'var(--bg)', border: 0, position: 'relative', overflow: 'hidden' }}>
            <div aria-hidden className="hide-m" style={{ position: 'absolute', right: -20, bottom: -30 }}><IlloCertificate size={200} /></div>
            <div style={{ position: 'relative', display: 'grid', gap: 16 }}>
              <span className="chip chip-sun" style={{ width: 'fit-content' }}><Trophy size={14} />Награды</span>
              <h3 className="h3" style={{ fontSize: 26 }}>Пройди всё — получи грамоту</h3>
              <p className="ink2" style={{ maxWidth: 360 }}>Набери хотя бы 60 % в каждом уроке и игре — и в кабинете появится именная грамота. У каждой есть номер: её подлинность можно проверить на сайте.</p>
              <div className="row row-wrap" style={{ gap: 10 }}>
                {[['до 100', 'баллов за задание'], ['13', 'заданий в курсе'], ['1', 'грамота']].map(([n, t]) => (
                  <div key={t} style={{ padding: '10px 14px', borderRadius: 12, background: '#fff' }}>
                    <b style={{ fontSize: 18, color: 'var(--brand)' }}>{n}</b> <span style={{ fontSize: 13 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={.1} className="card" style={{ padding: 32, display: 'grid', gap: 16, alignContent: 'start' }}>
            <span className="chip chip-mint" style={{ width: 'fit-content' }}><KeyRound size={14} />Класс</span>
            <h3 className="h3" style={{ fontSize: 28 }}>Учитель дал код класса?</h3>
            <p className="ink2">Введи его — и ты увидишь задания от учителя, а учитель — твои результаты.</p>
            <form className="row" style={{ gap: 10 }} onSubmit={(e) => { e.preventDefault(); if (code.trim()) nav('/join/' + code.trim().toUpperCase()); }}>
              <input className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} maxLength={8}
                placeholder="Например, 8UHKFW" style={{ letterSpacing: '.16em', fontSize: 18, fontWeight: 700 }} aria-label="Код класса" />
              <button className="btn btn-primary" disabled={code.length < 4}>Войти</button>
            </form>
            <p className="hint">Код из 6 символов: латинские буквы и цифры.</p>
          </Reveal>
        </div>
      </section>

      {/* ---------- Вопросы ---------- */}
      <section className="section-sm">
        <div className="container" style={{ maxWidth: 880 }}>
          <SectionTitle eyebrow="Частые вопросы" title="Если коротко" center />
          <Accordion items={FAQ} />
        </div>
      </section>
    </div>
  );
}

export function Accordion({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {items.map(([q, a], i) => (
        <div key={q} style={{ borderTop: i ? '1px solid var(--line)' : 0 }}>
          <button className="acc-btn" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            {q}
            <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: .3 }} style={{ flex: 'none', color: 'var(--muted)' }}><ChevronDown /></motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .4, ease: EASE }} style={{ overflow: 'hidden' }}>
                <p className="ink2" style={{ padding: '0 24px 22px', maxWidth: 720 }}>{a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function StudentsArt({ done }) {
  return (
    <div style={{ position: 'relative', width: 360, maxWidth: '100%', display: 'grid', placeItems: 'center' }}>
      <ArtCircle size={300}><IlloChat size={230} /></ArtCircle>
      <motion.div className="card" style={{ position: 'absolute', top: 10, right: -10, padding: '12px 16px', boxShadow: 'var(--sh-3)', border: 0 }}
        animate={{ y: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="row" style={{ gap: 10 }}><Trophy color="#F5A100" /><div><div style={{ fontWeight: 700 }}>{done} / 13</div><div className="muted" style={{ fontSize: 12 }}>заданий пройдено</div></div></div>
      </motion.div>
    </div>
  );
}
