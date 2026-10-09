import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Users, Presentation, FileText, MonitorPlay, Link2, ListChecks, LineChart, Award, Download, CheckCircle2 } from 'lucide-react';
import PageHead, { SectionTitle } from '../components/PageHead.jsx';
import { Reveal, Stagger, Item, Icon, EASE } from '../components/ui.jsx';
import Slide, { Scaled } from '../components/Slide.jsx';
import { MATERIALS } from '../content/materials.js';
import { GAME_COLORS } from '../games/colors.js';
import { useAuth } from '../lib/auth.jsx';

export default function Teachers() {
  const { user } = useAuth();
  const isTeacher = user && user.role !== 'student';
  return (
    <div className="page">
      <PageHead eyebrow="Учителям"
        title={<>Готовые занятия <span className="grad-text">о финансовой безопасности</span></>}
        lead="Презентации для проектора и интерактивной доски, сценарий к каждому слайду с таймингом, задания для класса и статистика по каждому ученику."
                art={<TeachersArt />}>
        <div className="row row-wrap" style={{ gap: 12 }}>
          <a href="#materials" className="btn btn-primary btn-lg">Выбрать занятие <ArrowRight size={20} /></a>
          {isTeacher
            ? <Link to="/kabinet" className="btn btn-ghost btn-lg"><Users size={20} /> Мои классы</Link>
            : <Link to="/registraciya?role=teacher" className="btn btn-ghost btn-lg"><Users size={20} /> Создать класс</Link>}
        </div>
      </PageHead>

      {/* ---------- Что внутри ---------- */}
      <section className="section-sm" style={{ paddingTop: 8 }}>
        <div className="container">
          <Stagger className="grid g-4">
            {[
              ['MonitorPlay', 'Режим показа', 'Слайды на весь экран, управление стрелками или касанием доски.'],
              ['FileText', 'Сценарий учителя', 'Что сказать на каждом слайде, сколько минут и что спросить у класса.'],
              ['Download', 'PDF для печати', 'Слайды и сценарий отдельно — можно распечатать или открыть без интернета.'],
              ['LineChart', 'Статистика класса', 'Кто прошёл задания, с каким результатом и когда был в сети.'],
            ].map(([ic, t, d]) => (
              <Item key={t} style={{ display: 'grid', gap: 10, padding: 26, borderRadius: 24, background: 'var(--bg)', alignContent: 'start' }}>
                <div style={{ color: 'var(--brand)' }}><Icon name={ic} size={28} /></div>
                <div style={{ fontWeight: 800, fontSize: 17.5 }}>{t}</div>
                <div className="muted" style={{ fontSize: 14.5 }}>{d}</div>
              </Item>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---------- Материалы ---------- */}
      <section className="section-sm" id="materials" style={{ scrollMarginTop: 80 }}>
        <div className="container">
          <SectionTitle eyebrow="Материалы" title="5 занятий под разные форматы" lead="От 5-минутного выступления на родительском собрании до полноценного урока ОБЗР. Всё основано на официальных данных Банка России, МВД и Росфинмониторинга." />
          <div style={{ display: 'grid', gap: 20 }}>
            {MATERIALS.map((m, i) => <MaterialRow key={m.id} m={m} i={i} />)}
          </div>
        </div>
      </section>

      {/* ---------- Как работать с классом ---------- */}
      <section className="section">
        <div className="container split">
          <div>
            <SectionTitle eyebrow="Классы и задания" title="Вся статистика класса — на одном экране" />
            <div style={{ display: 'grid', gap: 18 }}>
              {[
                [Link2, 'Пригласите учеников', 'Ссылкой, 6-значным кодом или добавьте вручную по логину или номеру телефона.'],
                [ListChecks, 'Назначьте задания', 'Уроки и игры с дедлайном и комментарием. Можно сразу несколько.'],
                [LineChart, 'Смотрите прогресс', 'Кто выполнил, какой балл, сколько попыток, когда ученик был в сети и что делал.'],
                [Award, 'Наградите грамотой', 'Грамоты с уникальным номером — их можно распечатать и проверить на сайте.'],
              ].map(([I, t, d], i) => (
                <Reveal key={t} delay={i * .06} className="row" style={{ gap: 16, alignItems: 'flex-start' }}>
                  <span className="num-badge" style={{ background: 'var(--brand-50)', color: 'var(--brand)' }}><I size={18} /></span>
                  <div><div style={{ fontWeight: 800, fontSize: 17.5 }}>{t}</div><div className="muted" style={{ marginTop: 2 }}>{d}</div></div>
                </Reveal>
              ))}
            </div>
            <div className="row row-wrap" style={{ gap: 12, marginTop: 30 }}>
              {isTeacher
                ? <Link to="/kabinet" className="btn btn-primary">Открыть кабинет <ArrowRight size={18} /></Link>
                : <Link to="/registraciya?role=teacher" className="btn btn-primary">Зарегистрироваться как учитель <ArrowRight size={18} /></Link>}
            </div>
          </div>
          <Reveal><DashboardMock /></Reveal>
        </div>
      </section>
    </div>
  );
}

function MaterialRow({ m, i }) {
  const c = GAME_COLORS[m.color];
  return (
    <Reveal delay={i * .04}>
      <Link to={`/uchitelyam/${m.id}`} className="card card-hover mat-row" style={{ display: 'grid', gridTemplateColumns: '320px 1fr auto', gap: 28, padding: 18, alignItems: 'center' }}>
        <div className="slide-thumb"><Scaled><Slide slide={m.slides[0]} material={m} index={0} total={m.slides.length} /></Scaled></div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div className="row row-wrap" style={{ gap: 8 }}>
            <span className="chip" style={{ background: c.bg, color: c.fg }}><Icon name={m.icon} size={14} />{m.format}</span>
            <span className="chip chip-brand">{m.audience}</span>
            <span className="row muted" style={{ gap: 5, fontSize: 13.5, fontWeight: 700 }}><Clock size={14} />{m.minutes} мин</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 22 }}>{m.title}</div>
          <div className="ink2" style={{ fontSize: 15, maxWidth: 620 }}>{m.goal}</div>
          <div className="row row-wrap muted" style={{ gap: 16, fontSize: 13.5, fontWeight: 700 }}>
            <span className="row" style={{ gap: 6 }}><Presentation size={15} />{m.slides.length} слайдов</span>
            <span className="row" style={{ gap: 6 }}><FileText size={15} />Сценарий к каждому слайду</span>
          </div>
        </div>
        <span className="btn btn-soft hide-m">Открыть <ArrowRight size={18} /></span>
      </Link>
    </Reveal>
  );
}

function TeachersArt() {
  const m = MATERIALS[0];
  return (
    <div style={{ position: 'relative', width: 420, maxWidth: '100%', height: 300 }}>
      <motion.div className="slide-thumb" style={{ position: 'absolute', right: 0, top: 0, width: 330, boxShadow: '0 20px 50px rgba(30,20,90,.25)' }}
        animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
        <Scaled><Slide slide={m.slides[9]} material={m} index={9} total={m.slides.length} /></Scaled>
      </motion.div>
      <motion.div className="card" style={{ position: 'absolute', left: 0, bottom: 10, padding: '14px 16px', boxShadow: 'var(--sh-3)', width: 250, border: 0 }}
        animate={{ y: [0, 8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: .8 }}>
        <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Сценарий · слайд 10 · 3 мин</div>
        <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 6, lineHeight: 1.45 }}>«Мошенники выигрывают за счёт спешки. Поэтому главное правило занятия — правило 15 минут…»</div>
      </motion.div>
    </div>
  );
}

// Иллюстрация: так выглядит таблица класса в кабинете учителя
export function DashboardMock() {
  const rows = [
    ['Алина К.', 'в сети', 1, 92, '#C04BF2'],
    ['Тимур Б.', '12 мин назад', .8, 78, '#2F9BFF'],
    ['Соня Р.', 'вчера', .6, 64, '#10B783'],
    ['Миша Л.', '3 дн назад', .2, 30, '#FF6A55'],
  ];
  return (
    <div className="card" style={{ padding: 22, boxShadow: 'var(--sh-3)', border: 0 }}>
      <div className="row between" style={{ marginBottom: 16 }}>
        <div><div style={{ fontWeight: 800, fontSize: 18 }}>8 «Б»</div><div className="muted" style={{ fontSize: 13 }}>24 ученика · 3 задания</div></div>
        <span className="chip chip-mint"><span className="dot" style={{ background: 'var(--mint)' }} />5 в сети</span>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {rows.map(([n, s, p, sc, col], i) => (
          <motion.div key={n} className="row" style={{ gap: 12, padding: '10px 12px', borderRadius: 14, background: '#F8F8FD' }}
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: .2 + i * .1, duration: .6, ease: EASE }}>
            <span className="avatar" style={{ width: 34, height: 34, borderRadius: 11, fontSize: 12, background: col }}>{n.split(' ').map((w) => w[0]).join('')}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{n}</div>
              <div style={{ fontSize: 12.5, color: s === 'в сети' ? 'var(--mint)' : 'var(--muted)', fontWeight: 700 }}>{s}</div>
            </div>
            <div style={{ width: 90 }} className="progress"><motion.i initial={{ width: 0 }} whileInView={{ width: p * 100 + '%' }} viewport={{ once: true }} transition={{ delay: .4 + i * .1, duration: 1, ease: EASE }} /></div>
            <b style={{ width: 34, textAlign: 'right', fontSize: 14 }}>{sc}</b>
            {p === 1 ? <CheckCircle2 size={18} color="var(--mint)" /> : <span style={{ width: 18 }} />}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
