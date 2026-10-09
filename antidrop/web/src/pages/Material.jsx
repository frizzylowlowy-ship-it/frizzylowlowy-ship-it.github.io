import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MonitorPlay, Download, FileText, Clock, Users, Target, ListChecks, Lightbulb, ChevronLeft, ChevronRight, Printer, Send } from 'lucide-react';
import Slide, { Scaled } from '../components/Slide.jsx';
import { Icon, EASE, Reveal } from '../components/ui.jsx';
import { Mark } from '../components/Logo.jsx';
import { materialById, GROUP_CARDS } from '../content/materials.js';
import { GAME_COLORS } from '../games/colors.js';
import { useAuth } from '../lib/auth.jsx';
import NotFound from './NotFound.jsx';

const minLabel = (m) => (m < 1 ? '<1' : m) + ' мин';

export default function Material() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const m = materialById(id);
  const { user } = useAuth();
  const [cur, setCur] = useState(0);
  useEffect(() => { if (m) document.title = `${m.title} — материалы для учителя · Антидроп`; }, [m]);
  if (!m) return <NotFound />;
  if (sp.get('print') === 'slides') return <PrintSlides m={m} />;
  if (sp.get('print') === 'script') return <PrintScript m={m} />;

  const c = GAME_COLORS[m.color];
  const s = m.slides[cur];
  let t = 0; const starts = m.slides.map((x) => { const v = t; t += x.min; return v; });

  return (
    <div className="page">
      <section style={{ padding: '32px 0 20px' }}>
        <div className="container">
          <Link to="/uchitelyam" className="row muted" style={{ gap: 6, fontWeight: 700, fontSize: 14.5, width: 'fit-content' }}><ArrowLeft size={18} />Все материалы</Link>
          <div className="row between row-wrap" style={{ gap: 24, marginTop: 18, alignItems: 'flex-end' }}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="row row-wrap" style={{ gap: 8 }}>
                <span className="chip" style={{ background: c.bg, color: c.fg }}><Icon name={m.icon} size={14} />{m.format}</span>
                <span className="chip chip-brand"><Users size={14} />{m.audience}</span>
                <span className="chip chip-sun"><Clock size={14} />{m.minutes} минут</span>
              </div>
              <motion.h1 className="h1" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: EASE }}>{m.title}</motion.h1>
            </div>
            <div className="row row-wrap" style={{ gap: 10 }}>
              <Link to={`/uchitelyam/${m.id}/pokaz`} className="btn btn-primary btn-lg"><MonitorPlay size={20} />Показать на экране</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 40 }}>
        <div className="container mat-layout">
          {/* Слайд + сценарий */}
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="slide-thumb" style={{ boxShadow: 'var(--sh-3)', position: 'relative' }}>
              <AnimatePresence mode="wait">
                <motion.div key={cur} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .25 }}>
                  <Scaled><Slide slide={s} material={m} index={cur} total={m.slides.length} animated /></Scaled>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="row between">
              <button className="btn btn-ghost btn-sm" disabled={cur === 0} onClick={() => setCur(cur - 1)}><ChevronLeft size={18} />Назад</button>
              <span className="muted" style={{ fontWeight: 800, fontSize: 14 }}>Слайд {cur + 1} из {m.slides.length}</span>
              <button className="btn btn-ghost btn-sm" disabled={cur === m.slides.length - 1} onClick={() => setCur(cur + 1)}>Далее<ChevronRight size={18} /></button>
            </div>
            <div className="card" style={{ padding: 24 }}>
              <div className="row between" style={{ marginBottom: 12 }}>
                <div className="row" style={{ gap: 10 }}><FileText size={20} color="var(--brand)" /><b style={{ fontSize: 17 }}>Сценарий для учителя</b></div>
                <span className="chip chip-sun"><Clock size={13} />{starts[cur]}–{starts[cur] + s.min} мин</span>
              </div>
              <div className="script-text ink2" style={{ fontSize: 16.5, lineHeight: 1.6 }}>
                {s.script.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
              {s.tip && <div className="row" style={{ gap: 10, marginTop: 14, padding: '12px 14px', borderRadius: 14, background: 'var(--sun-50)', alignItems: 'flex-start', fontSize: 14.5, fontWeight: 600 }}><Lightbulb size={18} color="#C98500" style={{ flex: 'none', marginTop: 2 }} />{s.tip}</div>}
            </div>
            <div>
              <div style={{ fontWeight: 800, margin: '12px 0 12px' }}>Все слайды</div>
              <div className="thumbs">
                {m.slides.map((x, i) => (
                  <button key={i} className={'thumb-btn' + (i === cur ? ' on' : '')} onClick={() => { setCur(i); window.scrollTo({ top: 180, behavior: 'smooth' }); }}>
                    <div className="slide-thumb"><Scaled><Slide slide={x} material={m} index={i} total={m.slides.length} /></Scaled></div>
                    <div className="row between muted" style={{ fontSize: 12, fontWeight: 800, padding: '6px 4px 0' }}><span>{i + 1}</span><span>{minLabel(x.min)}</span></div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Боковая панель */}
          <aside style={{ display: 'grid', gap: 16, position: 'sticky', top: 92 }}>
            <div className="card" style={{ padding: 22, display: 'grid', gap: 10 }}>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>Скачать</div>
              <a className="btn btn-dark btn-block" href={`/materials/${m.id}-slaydy.pdf`} download><Download size={18} />Слайды, PDF</a>
              <a className="btn btn-ghost btn-block" href={`/materials/${m.id}-scenariy.pdf`} download><FileText size={18} />Сценарий учителя, PDF</a>
              <div className="row between" style={{ gap: 8, marginTop: 4, fontSize: 13.5 }}>
                <a className="row muted" style={{ gap: 6, fontWeight: 600 }} href={`/uchitelyam/${m.id}?print=slides`} target="_blank" rel="noreferrer"><Printer size={15} />Печать слайдов</a>
                <a className="row muted" style={{ gap: 6, fontWeight: 600 }} href={`/uchitelyam/${m.id}?print=script`} target="_blank" rel="noreferrer"><Printer size={15} />Печать сценария</a>
              </div>
            </div>
            <div className="card" style={{ padding: 22, display: 'grid', gap: 12 }}>
              <div className="row" style={{ gap: 10 }}><Target size={18} color="var(--brand)" /><b>Цель занятия</b></div>
              <p className="ink2" style={{ fontSize: 15 }}>{m.goal}</p>
              <div className="divider" />
              <div className="row" style={{ gap: 10 }}><ListChecks size={18} color="var(--brand)" /><b>Подготовка</b></div>
              <ul style={{ display: 'grid', gap: 6, paddingLeft: 18, fontSize: 14.5 }} className="ink2">{m.prep.map((p) => <li key={p} style={{ listStyle: 'disc' }}>{p}</li>)}</ul>
            </div>
            <div className="card" style={{ padding: 22 }}>
              <div style={{ fontWeight: 800, marginBottom: 12 }}>План по времени</div>
              <div style={{ display: 'flex', height: 12, borderRadius: 99, overflow: 'hidden', gap: 2 }}>
                {m.slides.map((x, i) => <button key={i} title={`Слайд ${i + 1}: ${x.min} мин`} onClick={() => setCur(i)} style={{ flex: x.min, background: i === cur ? c.fg : i < cur ? c.fg + '88' : 'var(--bg-2)', transition: 'background .3s' }} />)}
              </div>
              <div className="row between muted" style={{ fontSize: 12.5, fontWeight: 700, marginTop: 8 }}><span>0 мин</span><span>{m.minutes} мин</span></div>
            </div>
            {user && user.role !== 'student' && m.id !== 'roditelskoe-sobranie' && m.id !== 'pedsovet' && (
              <div className="card" style={{ padding: 22, background: 'var(--brand-50)', border: 0 }}>
                <b>Закрепите тему дома</b>
                <p className="ink2" style={{ fontSize: 14.5, margin: '6px 0 12px' }}>Назначьте классу уроки и игры — в кабинете будет видно, кто их прошёл.</p>
                <Link to="/kabinet" className="btn btn-primary btn-sm"><Send size={16} />Назначить задания</Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      {m.id === 'klassnyj-chas' && (
        <section className="section-sm" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal className="card" style={{ padding: 28 }}>
              <div className="row between row-wrap" style={{ gap: 12, marginBottom: 18 }}>
                <div><b style={{ fontSize: 19 }}>Карточки для групповой работы (слайд 9)</b><div className="muted" style={{ fontSize: 14.5 }}>Входят в PDF сценария — распечатайте и разрежьте. Ответы — для учителя.</div></div>
              </div>
              <div className="grid g-3" style={{ gap: 14 }}>
                {GROUP_CARDS.map((g, i) => (
                  <div key={i} style={{ padding: 16, borderRadius: 16, background: 'var(--bg)', border: '1px dashed var(--line-2)' }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>«{g.text}»</div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 8 }}>Ответ: {g.answer}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </div>
  );
}

// ---------- Версии для печати / PDF ----------
function usePrintPage(size) {
  useEffect(() => {
    const st = document.createElement('style');
    st.textContent = `@page { size: ${size}; margin: 0; } html, body { background: #fff !important; }`;
    document.head.appendChild(st);
    document.body.classList.add('printing');
    return () => { st.remove(); document.body.classList.remove('printing'); };
  }, [size]);
}

function PrintSlides({ m }) {
  usePrintPage('1280px 720px');
  return (
    <div className="print-doc">
      <PrintBar />
      {m.slides.map((s, i) => (
        <div key={i} className="print-slide"><Slide slide={s} material={m} index={i} total={m.slides.length} /></div>
      ))}
    </div>
  );
}

function PrintScript({ m }) {
  usePrintPage('A4');
  let t = 0;
  return (
    <div className="print-doc script-doc">
      <PrintBar />
      <div className="a4">
        <div className="row between" style={{ borderBottom: '2px solid #2B2A3D', paddingBottom: 14 }}>
          <div className="row" style={{ gap: 10 }}><Mark size={30} /><b style={{ fontFamily: 'var(--display)', fontSize: 18 }}>антидроп</b></div>
          <span style={{ fontSize: 12, color: '#6B6A85', fontWeight: 700 }}>Сценарий для учителя · антидроп.рф</span>
        </div>
        <h1 style={{ fontFamily: 'var(--display)', fontSize: 30, margin: '22px 0 6px' }}>{m.title}</h1>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#48476A' }}>{m.format} · {m.audience} · {m.minutes} минут · {m.slides.length} слайдов</div>
        <div className="script-box"><b>Цель.</b> {m.goal}</div>
        <div className="script-box"><b>Подготовка.</b> {m.prep.join('; ')}.</div>
        {m.slides.map((s, i) => {
          const from = t; t += s.min;
          return (
            <div key={i} className="script-row">
              <div style={{ width: 200, flex: 'none' }}>
                <div className="slide-thumb" style={{ borderRadius: 8, width: 200 }}><Scaled fixed={200}><Slide slide={s} material={m} index={i} total={m.slides.length} /></Scaled></div>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: '#6B6A85', marginTop: 6 }}>Слайд {i + 1} · {from}–{t} мин</div>
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>
                {s.script.split('\n\n').map((p, k) => <p key={k} style={{ margin: k ? '6px 0 0' : 0 }}>{p}</p>)}
                {s.tip && <p style={{ margin: '8px 0 0', padding: '6px 10px', background: '#FFF6DB', borderRadius: 8, fontSize: 12.5 }}><b>Совет:</b> {s.tip}</p>}
              </div>
            </div>
          );
        })}
        {m.id === 'klassnyj-chas' && (
          <div style={{ breakBefore: 'page', paddingTop: 10 }}>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 22, margin: '0 0 6px' }}>Карточки для групповой работы</h2>
            <p style={{ fontSize: 12.5, color: '#48476A', margin: '0 0 14px' }}>Распечатайте и разрежьте по пунктиру. По 3 карточки на группу. Ответы на отдельном листе — для учителя.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {GROUP_CARDS.map((g, i) => <div key={i} style={{ border: '1.5px dashed #9C9BB5', borderRadius: 10, padding: '18px 16px', fontSize: 15, fontWeight: 700, minHeight: 90 }}>«{g.text}»</div>)}
            </div>
            <h3 style={{ fontSize: 16, margin: '22px 0 8px', breakBefore: 'page' }}>Ответы для учителя</h3>
            <ol style={{ fontSize: 13, lineHeight: 1.6, paddingLeft: 18 }}>{GROUP_CARDS.map((g, i) => <li key={i} style={{ listStyle: 'decimal' }}>{g.answer}</li>)}</ol>
          </div>
        )}
        <div style={{ marginTop: 24, fontSize: 11.5, color: '#6B6A85' }}>Помощь: детский телефон доверия 8-800-2000-122 (бесплатно, анонимно) · полиция 102 · Банк России 300.</div>
      </div>
    </div>
  );
}

function PrintBar() {
  return (
    <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 5, background: '#2B2A3D', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span style={{ fontWeight: 700, fontSize: 14 }}>Версия для печати. Выберите «Сохранить как PDF» в окне печати.</span>
      <button className="btn btn-sun btn-sm" onClick={() => window.print()}><Printer size={16} />Печать / PDF</button>
    </div>
  );
}
