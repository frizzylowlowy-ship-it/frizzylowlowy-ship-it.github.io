import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Check, X, Phone, AlertTriangle, MessageCircle, ShieldCheck, BookOpen, Eye, LifeBuoy } from 'lucide-react';
import PageHead, { ArtCircle } from '../components/PageHead.jsx';
import { IlloBell } from '../components/Illo.jsx';
import { Reveal, Icon, EASE } from '../components/ui.jsx';
import { Accordion } from './Students.jsx';

const TABS = [
  { id: 'pamyatka', label: 'Коротко о главном', icon: BookOpen },
  { id: 'priznaki', label: 'Тревожные признаки', icon: Eye },
  { id: 'dengi', label: 'Если деньги пришли', icon: LifeBuoy },
  { id: 'razgovor', label: 'Как поговорить', icon: MessageCircle },
  { id: 'checklist', label: 'Чек-лист настроек', icon: ShieldCheck },
];

const CHECK = [
  ['Включить уведомления об операциях по карте ребёнка', 'В приложении банка: уведомления о каждом списании и зачислении.'],
  ['Поставить лимиты на переводы и снятие наличных', 'Большинство банков позволяют настроить лимиты для детской карты в приложении родителя.'],
  ['Знать, какие карты есть у ребёнка', 'С 1 августа 2025 года карту подростку 14–18 лет выдают только с вашего письменного согласия.'],
  ['Договориться о «правиле 15 минут»', 'Любое предложение про деньги, карту или перевод — пауза и разговор с вами.'],
  ['Записать важные номера в телефон ребёнка', '102 — полиция, 8-800-2000-122 — детский телефон доверия, номер банка с обратной стороны карты.'],
  ['Обсудить: карту и коды не передают никому', 'Ни друзьям, ни «работодателям», ни «сотрудникам полиции или банка».'],
  ['Проверить настройки приватности в соцсетях', 'Закрытый профиль и ограничение сообщений от незнакомцев снижают число «предложений».'],
  ['Пройти с ребёнком 1–2 игры на сайте', 'Это 5 минут и хороший повод начать разговор без нотаций.'],
];

export default function Parents() {
  const [tab, setTab] = useState(() => (location.hash.slice(1) && TABS.some((t) => t.id === location.hash.slice(1)) ? location.hash.slice(1) : 'pamyatka'));
  useEffect(() => { history.replaceState(null, '', '#' + tab); }, [tab]);

  return (
    <div className="page">
      <PageHead eyebrow="Родителям"
        title={<>Как защитить ребёнка <span className="grad-text">от вербовки в дропперы</span></>}
        lead="Короткая памятка: что это за схема, по каким признакам её заметить, что делать, если на карту уже пришли деньги, и как поговорить с подростком без крика."
        art={<ParentsArt />}>
        <div className="row row-wrap" style={{ gap: 12 }}>
          <button className="btn btn-primary btn-lg" onClick={() => setTab('dengi')}><LifeBuoy size={20} />Деньги уже пришли</button>
          <button className="btn btn-ghost btn-lg" onClick={() => window.print()}><Printer size={20} />Распечатать памятку</button>
        </div>
      </PageHead>

      <section className="section-sm no-print" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ overflowX: 'auto', paddingBottom: 6 }}>
            <div className="tabs" role="tablist" style={{ flexWrap: 'nowrap' }}>
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} className={'tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)} style={{ whiteSpace: 'nowrap' }}>
                  {tab === t.id && <motion.span layoutId="parents-tab" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                  <span className="row" style={{ gap: 8 }}><t.icon size={16} />{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .4, ease: EASE }} style={{ marginTop: 28 }}>
              <Panel id={tab} />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Для печати — все разделы подряд */}
      <div className="print-only container">
        {TABS.map((t) => <div key={t.id} style={{ marginBottom: 24 }}><h2 className="h3" style={{ margin: '12px 0' }}>{t.label}</h2><Panel id={t.id} print /></div>)}
      </div>

      <section className="section-sm no-print">
        <div className="container" style={{ maxWidth: 880 }}>
          <h2 className="h2 center" style={{ marginBottom: 28 }}>Вопросы родителей</h2>
          <Accordion items={[
            ['Ребёнку 12–13 лет. Не рано ли об этом говорить?', 'Нет. Вербовщики пишут подросткам в соцсетях и играх задолго до 14 лет, а первую карту многие дети получают раньше. Лучше, если о схеме ребёнок впервые услышит от вас, а не от вербовщика.'],
            ['Может, просто запретить ребёнку иметь карту?', 'Запрет не учит распознавать обман и часто приводит к тому, что подросток прячет телефон и переписку. Надёжнее — уведомления, лимиты и договорённость, что с любым «предложением» он придёт к вам.'],
            ['Ребёнок уже перевёл деньги. Его посадят?', 'Уголовная ответственность по ст. 187 УК РФ наступает с 16 лет. Закон позволяет освободить от ответственности того, кто совершил это впервые и активно помог раскрыть схему. Поэтому важно не скрывать произошедшее: заблокируйте карту, сохраните переписку и обратитесь в полицию вместе с ребёнком. При необходимости проконсультируйтесь с юристом.'],
            ['Где пройти обучение вместе с ребёнком?', 'На этом сайте — 5 уроков и 8 игр, их можно пройти вместе за полчаса. Ещё полезные ресурсы: fincult.info (портал Банка России о финансовой культуре) и онлайн-уроки финансовой грамотности dni-fg.ru.'],
          ]} />
        </div>
      </section>
    </div>
  );
}

function Panel({ id, print }) {
  if (id === 'pamyatka') return (
    <div className="grid g-2" style={{ alignItems: 'start' }}>
      <div className="card card-pad" style={{ display: 'grid', gap: 14 }}>
        <h3 className="h3">Что такое дропперство</h3>
        <p className="ink2">Мошенники обманывают людей и получают деньги, которые нужно быстро «спрятать». Для этого они используют чужие банковские карты — карты дропперов. Подростку пишут в соцсетях или играх и предлагают «подработку»: принять перевод и отправить дальше, сдать карту «в аренду» или оформить новую и передать её.</p>
        <p className="ink2">Ребёнку кажется, что он просто помогает с переводом. На самом деле он становится участником преступления, а все следы ведут к нему.</p>
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        {[
          ['Каждый 5-й', 'выявленный дроппер — несовершеннолетний', 'Банк России', 'var(--brand)'],
          ['с 16 лет', 'уголовная ответственность по ст. 187 УК РФ: до 3 лет за передачу своей карты, до 6 — за чужие', 'Федеральный закон № 176-ФЗ', 'var(--danger)'],
          ['с 1.08.2025', 'карту подростку 14–18 лет выдают только с письменного согласия родителей', 'Федеральный закон № 178-ФЗ', '#0A7A57'],
        ].map(([n, t, s, col]) => (
          <div key={n} className="card" style={{ padding: '20px 24px', display: 'flex', gap: '8px 18px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 30, color: col, minWidth: 130 }}>{n}</div>
            <div style={{ flex: '1 1 200px' }}><div style={{ fontWeight: 600 }}>{t}</div><div className="src" style={{ marginTop: 2 }}>{s}</div></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (id === 'priznaki') return (
    <div className="grid g-2" style={{ alignItems: 'start' }}>
      <div className="grid g-2" style={{ gap: 14 }}>
        {[
          ['Banknote', 'Деньги непонятного происхождения', 'Новые покупки, наличные, которые сложно объяснить.'],
          ['ArrowLeftRight', 'Много переводов', 'Частые зачисления и сразу же списания по карте.'],
          ['CreditCard', 'Новая карта', 'Просит срочно оформить карту или у него появилась карта, о которой вы не знали.'],
          ['EyeOff', 'Скрытность', 'Прячет экран, удаляет переписку, нервничает при сообщениях.'],
          ['MessagesSquare', 'Новые «знакомые»', 'Общение в закрытых чатах и каналах с незнакомыми взрослыми.'],
          ['Frown', 'Тревога и страх', 'Подавлен, плохо спит, боится телефонных звонков.'],
        ].map(([ic, t, d]) => (
          <div key={t} className="card" style={{ padding: 18, display: 'grid', gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--coral-50)', color: 'var(--coral)', display: 'grid', placeItems: 'center' }}><Icon name={ic} size={20} /></div>
            <b>{t}</b><span className="muted" style={{ fontSize: 14 }}>{d}</span>
          </div>
        ))}
      </div>
      <div className="card card-pad" style={{ background: 'var(--sun-50)', border: 0, display: 'grid', gap: 12 }}>
        <div className="row" style={{ gap: 10 }}><AlertTriangle color="#C98500" /><b style={{ fontSize: 18 }}>Заметили признаки?</b></div>
        <p className="ink2">Один признак ещё ничего не значит. Но если их несколько — не устраивайте допрос. Выберите спокойный момент и начните разговор с вопроса, а не с обвинения. Подсказки — во вкладке «Как поговорить».</p>
        <p className="ink2">Если подросток уже вовлечён, ему, скорее всего, страшно: вербовщики часто запугивают тем, что он «уже соучастник». Ваша задача — показать, что вы на его стороне.</p>
      </div>
    </div>
  );

  if (id === 'dengi') return (
    <div className="grid g-2" style={{ alignItems: 'start' }}>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>На карту ребёнка пришёл непонятный перевод</div>
        {[
          ['Не ругайте и не паникуйте', 'Ребёнку и так страшно. Спокойствие поможет быстрее понять, что произошло.'],
          ['Ничего не переводите', 'Ни «обратно», ни на карту, которую называют в сообщении. Не снимайте наличные.'],
          ['Позвоните в банк', 'По номеру на обратной стороне карты или через приложение. Сообщите о подозрительном поступлении — если перевод ошибочный, банк вернёт его сам.'],
          ['Сохраните переписку', 'Сделайте скриншоты сообщений, номеров и реквизитов. Ничего не удаляйте.'],
          ['Если угрожают — 102', 'Угрозы и давление — повод сразу обратиться в полицию.'],
        ].map(([t, d], i) => <Step key={t} n={i + 1} t={t} d={d} />)}
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Ребёнок уже переводил деньги или отдал карту</div>
        {[
          ['Заблокируйте карту', 'В приложении или по телефону банка. Смените пароли от банка и почты.'],
          ['Расспросите спокойно', 'Кто писал, что обещали, сколько было переводов. Запишите.'],
          ['Обратитесь в полицию вместе', 'Закон позволяет освободить от ответственности того, кто впервые совершил такое и активно помог раскрыть схему. Молчание только ухудшает положение.'],
          ['Поддержите ребёнка', 'Детский телефон доверия 8-800-2000-122 и школьный психолог помогут пережить стресс.'],
        ].map(([t, d], i) => <Step key={t} n={i + 1} t={t} d={d} danger />)}
      </div>
    </div>
  );

  if (id === 'razgovor') return (
    <div className="grid g-2" style={{ alignItems: 'start' }}>
      <div className="card card-pad" style={{ display: 'grid', gap: 12 }}>
        <div className="row" style={{ gap: 10 }}><span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--mint-50)', color: 'var(--mint)', display: 'grid', placeItems: 'center' }}><Check size={18} /></span><b style={{ fontSize: 18 }}>Помогает</b></div>
        {['«Тебе когда-нибудь предлагали заработать на переводах? Мне правда интересно, как это выглядит».', '«Если с тобой такое случится, я не буду ругать. Мы вместе решим, что делать».', '«Давай договоримся: любое предложение про деньги — 15 минут паузы и ко мне».', '«Я сам(а) недавно узнал(а), что за это дают реальный срок. Ты слышал?»'].map((t) => <div key={t} className="quote" style={{ borderColor: 'var(--mint)' }}>{t}</div>)}
      </div>
      <div className="card card-pad" style={{ display: 'grid', gap: 12 }}>
        <div className="row" style={{ gap: 10 }}><span style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--danger-50)', color: 'var(--danger)', display: 'grid', placeItems: 'center' }}><X size={18} /></span><b style={{ fontSize: 18 }}>Мешает</b></div>
        {['«Ты что, совсем? Как можно было так глупо попасться?»', '«Всё, телефон отбираю, карту закрываю навсегда».', '«Только попробуй связаться с такими — пеняй на себя».', 'Читать переписку тайком и потом предъявлять её.'].map((t) => <div key={t} className="quote" style={{ borderColor: 'var(--danger)' }}>{t}</div>)}
        <p className="muted" style={{ fontSize: 14.5 }}>Угрозы и запреты учат ребёнка скрывать проблемы, а не решать их. Вербовщики рассчитывают именно на это: «родителям не говори».</p>
      </div>
    </div>
  );

  if (id === 'checklist') return <Checklist print={print} />;
  return null;
}

function Step({ n, t, d, danger }) {
  return (
    <div className="card" style={{ padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <span className="num-badge" style={{ background: danger ? 'var(--danger-50)' : 'var(--brand-50)', color: danger ? 'var(--danger)' : 'var(--brand)' }}>{n}</span>
      <div><b>{t}</b><div className="ink2" style={{ fontSize: 14.5, marginTop: 2 }}>{d}</div></div>
    </div>
  );
}

function Checklist({ print }) {
  const [done, setDone] = useState(() => { try { return JSON.parse(localStorage.getItem('ad_parent_check') || '[]'); } catch { return []; } });
  useEffect(() => { try { localStorage.setItem('ad_parent_check', JSON.stringify(done)); } catch { /* */ } }, [done]);
  const toggle = (i) => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]));
  const pct = done.length / CHECK.length;
  return (
    <div className="grid g-2" style={{ alignItems: 'start', gridTemplateColumns: print ? '1fr' : undefined }}>
      <div className="card" style={{ padding: 10 }}>
        {CHECK.map(([t, d], i) => (
          <div key={t} className="check-row" onClick={() => toggle(i)} role="checkbox" aria-checked={done.includes(i)} tabIndex={0} onKeyDown={(e) => e.key === ' ' && (e.preventDefault(), toggle(i))}>
            <span className={'check-box' + (done.includes(i) ? ' on' : '')}>{done.includes(i) && <Check size={16} strokeWidth={3} />}</span>
            <div><div style={{ fontWeight: 800, textDecoration: done.includes(i) ? 'line-through' : 'none', color: done.includes(i) ? 'var(--muted)' : 'var(--ink)' }}>{t}</div><div className="muted" style={{ fontSize: 14 }}>{d}</div></div>
          </div>
        ))}
      </div>
      {!print && (
        <Reveal className="card card-pad" style={{ display: 'grid', gap: 16, justifyItems: 'center', textAlign: 'center', position: 'sticky', top: 100 }}>
          <div style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 60, color: pct === 1 ? 'var(--mint)' : 'var(--brand)' }}>{done.length}/{CHECK.length}</div>
          <div className="progress" style={{ width: '100%', height: 12 }}><motion.i animate={{ width: pct * 100 + '%' }} transition={{ duration: .6, ease: EASE }} style={pct === 1 ? { background: 'var(--mint)' } : {}} /></div>
          <p className="ink2">{pct === 1 ? 'Отлично! Вы сделали всё, что советуют специалисты.' : 'Отмечайте пункты — прогресс сохранится в этом браузере.'}</p>
          <div style={{ display: 'grid', gap: 8, width: '100%' }}>
            {[['102', 'Полиция'], ['8-800-2000-122', 'Детский телефон доверия'], ['300', 'Банк России']].map(([n, t]) => (
              <a key={n} href={'tel:' + n.replace(/-/g, '')} className="row between" style={{ padding: '12px 16px', borderRadius: 14, background: 'var(--bg)' }}>
                <span className="row" style={{ gap: 10 }}><Phone size={16} color="var(--brand)" /><b>{n}</b></span><span className="muted" style={{ fontSize: 13.5 }}>{t}</span>
              </a>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}

function ParentsArt() {
  return (
    <div style={{ position: 'relative', width: 360, maxWidth: '100%', display: 'grid', placeItems: 'center' }}>
      <ArtCircle size={300}><IlloBell size={230} /></ArtCircle>
      <motion.div className="card" style={{ position: 'absolute', bottom: 0, left: -20, padding: '10px 14px', boxShadow: 'var(--sh-3)', border: 0 }}
        animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
        <div className="row" style={{ gap: 8, fontWeight: 700, fontSize: 13.5 }}><ShieldCheck size={18} color="var(--mint)" />Уведомления включены</div>
      </motion.div>
    </div>
  );
}
