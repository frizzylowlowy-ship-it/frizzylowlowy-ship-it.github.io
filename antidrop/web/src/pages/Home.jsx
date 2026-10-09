import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookCheck, Presentation, Gift, Check, Phone, Flag, ChevronLeft, Heart, Scale } from 'lucide-react';
import { Hills } from '../components/Art.jsx';
import { IlloCard, IlloBoard, IlloBell, IlloChat } from '../components/Illo.jsx';
import { Reveal, Stagger, Item, Counter, Icon, EASE, useToast } from '../components/ui.jsx';
import { LESSONS, GAMES } from '@shared/catalog.js';
import { GAME_COLORS } from '../games/colors.js';
import { LESSON_COLORS } from '../components/Cards.jsx';
import { useAuth } from '../lib/auth.jsx';

export default function Home() {
  return (
    <div className="page">
      <Hero />
      <Benefits />
      <Course />
      <Showcase />
      <Facts />
      <Audience />
      <Help />
    </div>
  );
}

/* ---------------- Герой с формой входа ---------------- */
function Hero() {
  return (
    <section style={{ padding: '8px 0 0' }}>
      <div className="container">
        <div className="hero-block">
          <Hills />
          <div className="hero-grid hero-grid-main" style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gap: 22, alignContent: 'center' }}>
              <motion.h1 className="h1" style={{ color: '#fff', fontSize: 'clamp(36px, 4.2vw, 56px)' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: EASE }}>
                Учим школьников не попадаться на уловки мошенников
              </motion.h1>
              <motion.p style={{ color: 'rgba(255,255,255,.92)', fontSize: 18, maxWidth: 480 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .1, ease: EASE }}>
                «Антидроп» — образовательная платформа о финансовой безопасности для учеников, их родителей и учителей
              </motion.p>
              <motion.div className="row row-wrap" style={{ gap: 18 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .2, ease: EASE }}>
                <Link to="/igry" className="btn btn-white btn-lg">Начать обучение</Link>
                <Link to="/uchitelyam" className="link" style={{ color: '#fff' }}>Я учитель <ArrowRight size={16} /></Link>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9, delay: .15, ease: EASE }} style={{ display: 'grid', justifyItems: 'end', position: 'relative' }}>
              <div className="hero-peek hide-m"><IlloChat size={190} /></div>
              <LoginCard />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LoginCard() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({ login: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <div className="login-card" style={{ display: 'grid', gap: 14, textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 21 }}>Здравствуйте, {user.name.split(' ')[0]}!</div>
        <p className="muted" style={{ fontSize: 14.5 }}>{user.role === 'student' ? 'Продолжите курс — задания учителя ждут в кабинете.' : 'Классы, задания и статистика — в личном кабинете.'}</p>
        <Link to={user.role === 'admin' ? '/admin' : '/kabinet'} className="btn btn-accent btn-block">Личный кабинет</Link>
        <Link to={user.role === 'student' ? '/igry' : '/uchitelyam'} className="link" style={{ justifyContent: 'center' }}>{user.role === 'student' ? 'Игры и уроки' : 'Материалы для занятий'}</Link>
      </div>
    );
  }
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try { const u = await login(f.login.trim(), f.password); toast(`Здравствуйте, ${u.name.split(' ')[0]}!`); nav(u.role === 'admin' ? '/admin' : '/kabinet'); }
    catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };
  return (
    <form className="login-card" onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
      <div style={{ fontWeight: 600, fontSize: 20, textAlign: 'center', marginBottom: 6 }}>Вход</div>
      <input className="input" placeholder="Логин или телефон" autoComplete="username" value={f.login} onChange={(e) => setF({ ...f, login: e.target.value })} required aria-label="Логин или телефон" />
      <input className="input" type="password" placeholder="Пароль" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required aria-label="Пароль" />
      {err && <div className="form-error" style={{ fontSize: 13 }}>{err}</div>}
      <button className="btn btn-accent btn-block" disabled={busy}>{busy ? 'Входим…' : 'Войти'}</button>
      <div style={{ display: 'grid', gap: 6, textAlign: 'center', fontSize: 13.5, marginTop: 4 }}>
        <Link to="/registraciya" className="muted">Регистрация</Link>
        <Link to="/join" className="muted">Вступить в класс по коду</Link>
      </div>
    </form>
  );
}

/* ---------------- Три преимущества ---------------- */
function Benefits() {
  const items = [
    [BookCheck, <>Материалы основаны на данных <b>Банка России</b>, МВД и Росфинмониторинга</>],
    [Presentation, <>Готовые занятия: <b>классный час</b>, урок ОБЗР, родительское собрание</>],
    [Gift, <>Бесплатно для школ, учеников и родителей</>],
  ];
  return (
    <section style={{ padding: '24px 0 0' }}>
      <div className="container">
        <Stagger className="grid g-3" style={{ gap: 20 }}>
          {items.map(([I, t], i) => (
            <Item key={i} className="row" style={{ gap: 16, padding: '24px 26px', borderRadius: 24, background: 'var(--bg)', minHeight: 96 }}>
              <I size={26} color="var(--brand)" style={{ flex: 'none' }} />
              <span style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.45 }}>{t}</span>
            </Item>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- Курс: уроки + игры ---------------- */
function Course() {
  return (
    <section style={{ padding: '24px 0 0' }}>
      <div className="container">
        <Reveal className="panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: 'clamp(28px,4vw,56px) clamp(20px,4vw,56px) 36px' }}>
            <h2 className="h2 center">Интерактивный курс о финансовой безопасности</h2>
            <div className="lesson-list">
              {LESSONS.map((l) => {
                const c = GAME_COLORS[LESSON_COLORS[l.id]];
                return (
                  <Link key={l.id} to={`/igry/urok/${l.id}`} className="row lesson-link" style={{ gap: 12 }}>
                    <span style={{ width: 34, height: 34, borderRadius: 9, background: c.fg, color: '#fff', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={l.icon} size={18} /></span>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{l.title}</span>
                  </Link>
                );
              })}
            </div>
            <h3 className="center" style={{ fontWeight: 500, fontSize: 'clamp(18px,2vw,22px)', margin: '44px 0 24px' }}>А ещё <b>8 мини-игр</b>, в которых тренируешь то, что узнал</h3>
            <div className="grid g-4" style={{ gap: 16 }}>
              {GAMES.map((g) => {
                const c = GAME_COLORS[g.color];
                return (
                  <Link key={g.id} to={`/igry/${g.id}`} className="game-mini">
                    <span style={{ color: c.fg }}><Icon name={g.icon} size={22} /></span>
                    <b style={{ fontSize: 16, fontWeight: 700 }}>{g.title}</b>
                    <span className="muted" style={{ fontSize: 13.5, lineHeight: 1.45 }}>{g.short}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <Link to="/igry" className="panel-band">Начать заниматься <ArrowRight size={16} /></Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Витрина заданий ---------------- */
const SHOW = [
  { id: 'g-flags', tab: 'Найди флаг', caption: 'Найди флаг · переписка с незнакомцем' },
  { id: 'g-swipe', tab: 'Опасно или нет?', caption: 'Опасно или нет? · объявления о подработке' },
  { id: 'l3', tab: 'Правило 15 минут', caption: 'Правило 15 минут · урок курса' },
];
function Showcase() {
  const [i, setI] = useState(0);
  const s = SHOW[i];
  return (
    <section className="section">
      <div className="container">
        <h2 className="h2 center">Задания в игровой форме</h2>
        <div className="row" style={{ justifyContent: 'center', gap: 28, margin: '24px 0 36px', flexWrap: 'wrap' }}>
          {SHOW.map((x, k) => (
            <button key={x.id} className="nav-link" onClick={() => setI(k)} style={{ color: i === k ? 'var(--ink)' : 'var(--muted)' }}>
              {x.tab}
              {i === k && <motion.span layoutId="show-line" style={{ position: 'absolute', left: 0, right: 0, bottom: -2, height: 3, borderRadius: 3, background: 'var(--brand)' }} />}
            </button>
          ))}
        </div>
        <div className="screen">
          <div className="screen-bar">
            <span className="row muted" style={{ gap: 4, fontSize: 12.5, fontWeight: 600 }}><ChevronLeft size={16} />Назад</span>
            <span className="row" style={{ gap: 5 }}>{Array.from({ length: 8 }, (_, k) => <i key={k} style={{ width: 9, height: 9, borderRadius: 9, background: k < 3 ? 'var(--mint)' : k === 3 ? 'var(--brand)' : 'var(--line-2)' }} />)}</span>
            <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{i + 4} / 12</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={i} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: .45, ease: EASE }} className="screen-body">
              {i === 0 && <ShowFlags />}
              {i === 1 && <ShowSwipe />}
              {i === 2 && <ShowRule />}
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="center muted" style={{ marginTop: 18, fontSize: 14 }}>{s.caption}</p>
        <div className="center" style={{ marginTop: 18 }}><Link to={s.id.startsWith('l') ? `/igry/urok/${s.id}` : `/igry/${s.id}`} className="btn btn-primary">Попробовать</Link></div>
      </div>
    </section>
  );
}

function ShowFlags() {
  const msgs = [['Привет! Есть подработка: 3000 за вечер', true], ['Тебе придёт перевод, отправишь его дальше', true], ['Кстати, ты в какой школе учишься?', false], ['Только родителям не говори', true]];
  return (
    <div style={{ display: 'grid', gap: 10, maxWidth: 520, margin: '0 auto', width: '100%' }}>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Нажми на сообщения с красными флагами</div>
      {msgs.map(([t, f], k) => (
        <motion.div key={t} className="row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 + k * .12 }}
          style={{ justifyContent: 'space-between', padding: '12px 16px', borderRadius: 14, background: f ? '#FFEDED' : '#fff', boxShadow: f ? 'inset 0 0 0 2px var(--accent)' : 'inset 0 0 0 1px var(--line)', fontSize: 15, fontWeight: 500 }}>
          {t}{f && <Flag size={16} color="var(--accent)" style={{ flex: 'none' }} />}
        </motion.div>
      ))}
    </div>
  );
}
function ShowSwipe() {
  return (
    <div style={{ display: 'grid', justifyItems: 'center', gap: 18 }}>
      <motion.div animate={{ rotate: [0, 6, 0], x: [0, 30, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 'min(400px, 90%)', padding: 24, borderRadius: 20, background: '#fff', boxShadow: 'var(--sh-3)', display: 'grid', gap: 12 }}>
        <span className="chip" style={{ width: 'fit-content' }}>Объявление в соцсети</span>
        <div style={{ fontWeight: 600, fontSize: 18, lineHeight: 1.4 }}>Нужны ребята с картами любого банка. Платим 2000 за каждый принятый перевод</div>
      </motion.div>
      <div className="row" style={{ gap: 12 }}>
        <span className="btn btn-sm" style={{ background: 'var(--mint-50)', color: '#127A3E' }}>← Безопасно</span>
        <span className="btn btn-sm" style={{ background: '#FFEDED', color: '#D94040' }}>Опасно →</span>
      </div>
    </div>
  );
}
function ShowRule() {
  return (
    <div className="row" style={{ gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ width: 200 }}><IlloCard size={200} /></div>
      <div style={{ maxWidth: 380, display: 'grid', gap: 10 }}>
        <div style={{ fontWeight: 700, fontSize: 19 }}>Почему за перевод платят так много — и именно мне?</div>
        {['Это лёгкие деньги, соглашусь', 'Это признак схемы — беру паузу'].map((t, k) => (
          <div key={t} className="row" style={{ gap: 10, padding: '12px 14px', borderRadius: 12, background: k ? 'var(--mint-50)' : '#fff', boxShadow: k ? 'inset 0 0 0 2px var(--mint)' : 'inset 0 0 0 1px var(--line)', fontWeight: 500 }}>
            {k ? <Check size={18} color="var(--mint)" /> : <span style={{ width: 18 }} />}{t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Цифры ---------------- */
function Facts() {
  const items = [
    [<><Counter to={1} /> из 5</>, 'выявленных дропперов в России — несовершеннолетние', 'Банк России'],
    [<Counter to={70} suffix=" %" />, 'молодых людей 14–35 лет сталкивались с предложениями «быстрого заработка»', 'НАФИ'],
    ['½', 'молодёжи не знает, что такое «дропперство»', 'НАФИ'],
    [<><Counter to={85.6} decimals={1} prefix="+" /> %</>, 'рост IT-преступлений несовершеннолетних в Приморье за 4 года', 'PrimaMedia'],
  ];
  return (
    <section style={{ paddingBottom: 88 }}>
      <div className="container">
        <h2 className="h2 center" style={{ maxWidth: 760, margin: '0 auto' }}>Почему об этом важно говорить в школе</h2>
        <Stagger className="grid g-4" style={{ marginTop: 40, gap: 20 }}>
          {items.map(([n, t, s], k) => (
            <Item key={k} style={{ padding: '26px 24px', borderRadius: 24, background: 'var(--bg)', display: 'grid', gap: 10, alignContent: 'start' }}>
              <div style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 44, lineHeight: 1, color: 'var(--brand)' }}>{n}</div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{t}</div>
              <div className="muted" style={{ fontSize: 12.5 }}>Источник: {s}</div>
            </Item>
          ))}
        </Stagger>
        <Reveal className="row" style={{ marginTop: 20, padding: '22px 26px', borderRadius: 24, background: '#FFEDED', gap: 18, flexWrap: 'wrap' }}>
          <Scale size={30} color="#D94040" style={{ flex: 'none' }} />
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>«Мне нет 16 — ничего не будет» — опасный миф</div>
            <div className="ink2" style={{ fontSize: 14.5, marginTop: 2 }}>До 16 лет — блокировка карт, база Банка России и иски к семье. С 16 лет — уголовная ответственность по ст. 187 УК РФ: до 3 лет за свою карту, до 6 — за чужие.</div>
          </div>
          <Link to="/igry/urok/l5" className="btn btn-accent">Подробнее</Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Для кого ---------------- */
function Audience() {
  const items = [
    { to: '/uchenikam', t: 'Ученикам', d: '5 коротких уроков и 8 игр. Баллы за каждое задание и именная грамота за весь курс.', I: IlloChat, bg: '#F1EFFE' },
    { to: '/uchitelyam', t: 'Учителям', d: 'Презентации для проектора и сценарий к каждому слайду. Классы, задания и статистика.', I: IlloBoard, bg: '#E8F1FF' },
    { to: '/roditelyam', t: 'Родителям', d: 'Что делать, если на карту ребёнка пришли деньги, и как поговорить с ним без крика.', I: IlloBell, bg: '#FFF4D6' },
  ];
  return (
    <section style={{ paddingBottom: 88 }}>
      <div className="container">
        <h2 className="h2 center row" style={{ justifyContent: 'center', gap: 12 }}><Heart size={26} fill="var(--accent)" color="var(--accent)" />Для всей школы</h2>
        <div className="grid g-3" style={{ marginTop: 40, gap: 28 }}>
          {items.map(({ to, t, d, I, bg }, k) => (
            <Reveal key={to} delay={k * .08}>
              <Link to={to} className="aud-card">
                <div style={{ background: bg, borderRadius: 20, height: 190, display: 'grid', placeItems: 'center' }}><I size={190} /></div>
                <div style={{ fontWeight: 700, fontSize: 18, marginTop: 18 }}>{t}</div>
                <p className="ink2" style={{ fontSize: 14.5, marginTop: 6 }}>{d}</p>
                <span className="link" style={{ marginTop: 12 }}>Подробнее <ArrowRight size={15} /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Помощь ---------------- */
function Help() {
  return (
    <section style={{ paddingBottom: 48 }}>
      <div className="container">
        <Reveal className="panel help-grid" style={{ padding: 'clamp(28px,4vw,52px)', alignItems: 'center' }}>
          <div style={{ display: 'grid', gap: 14 }}>
            <h2 className="h2">Если тебе уже написали</h2>
            {['Ничего не переводи и не отдавай карту', 'Не удаляй переписку', 'Расскажи родителям или учителю', 'Пришли деньги — звони в банк по номеру на карте'].map((t) => (
              <div key={t} className="row" style={{ gap: 10, fontWeight: 600 }}><span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--brand)', display: 'grid', placeItems: 'center', flex: 'none' }}><Check size={14} color="#fff" strokeWidth={3} /></span>{t}</div>
            ))}
            <Link to="/igry/urok/l4" className="btn btn-primary" style={{ width: 'fit-content', marginTop: 8 }}>План действий по шагам</Link>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[['8-800-2000-122', 'Детский телефон доверия — бесплатно и анонимно, круглосуточно'], ['102', 'Полиция — если угрожают или давят'], ['300', 'Банк России — короткий номер с мобильного']].map(([n, t]) => (
              <a key={n} href={'tel:' + n.replace(/-/g, '')} className="row" style={{ gap: 14, padding: '16px 18px', borderRadius: 18, background: '#fff' }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--brand-50)', display: 'grid', placeItems: 'center', flex: 'none' }}><Phone size={19} color="var(--brand)" /></span>
                <span><b style={{ fontSize: 18, display: 'block' }}>{n}</b><span className="muted" style={{ fontSize: 13.5 }}>{t}</span></span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
