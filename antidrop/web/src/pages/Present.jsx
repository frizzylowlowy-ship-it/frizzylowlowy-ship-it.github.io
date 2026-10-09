import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize, Minimize, FileText, Eye, Clock } from 'lucide-react';
import Slide, { SW, SH } from '../components/Slide.jsx';
import { EASE } from '../components/ui.jsx';
import { materialById } from '../content/materials.js';
import NotFound from './NotFound.jsx';

// Режим показа: слайды на весь экран + (по желанию) сценарий справа.
// Управление: → / пробел — дальше (на слайдах с флагами и вопросами сначала открывается ответ), ← — назад,
// F — полный экран, S — сценарий, Esc — выйти.
export default function Present() {
  const { id } = useParams();
  const m = materialById(id);
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [notes, setNotes] = useState(false);
  const [full, setFull] = useState(false);
  const [dir, setDir] = useState(1);
  const [vw, setVw] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [start] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [idle, setIdle] = useState(false);

  const total = m?.slides.length || 0;
  const needsReveal = (k) => m && ['chat', 'quiz'].includes(m.slides[k].type);

  const next = useCallback(() => {
    if (needsReveal(i) && !reveal) return setReveal(true);
    if (i < total - 1) { setDir(1); setI(i + 1); setReveal(false); }
  }, [i, reveal, total]); // eslint-disable-line react-hooks/exhaustive-deps
  const prev = useCallback(() => {
    if (reveal && needsReveal(i)) return setReveal(false);
    if (i > 0) { setDir(-1); setI(i - 1); setReveal(needsReveal(i - 1)); }
  }, [i, reveal]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFull = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.();
  };

  useEffect(() => {
    const onKey = (e) => {
      if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
      else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
      else if (e.key === 'f' || e.key === 'а') toggleFull();
      else if (e.key === 's' || e.key === 'ы') setNotes((n) => !n);
      else if (e.key === 'Home') { setI(0); setReveal(false); }
      else if (e.key === 'End') { setI(total - 1); setReveal(false); }
      else if (e.key === 'Escape' && !document.fullscreenElement) nav(`/uchitelyam/${id}`);
    };
    const onResize = () => setVw({ w: window.innerWidth, h: window.innerHeight });
    const onFs = () => setFull(!!document.fullscreenElement);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    document.addEventListener('fullscreenchange', onFs);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); document.removeEventListener('fullscreenchange', onFs); };
  }, [next, prev, id, nav, total]);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    let t; const wake = () => { setIdle(false); clearTimeout(t); t = setTimeout(() => setIdle(true), 2500); };
    wake(); window.addEventListener('mousemove', wake);
    return () => { clearTimeout(t); window.removeEventListener('mousemove', wake); };
  }, []);
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  if (!m) return <NotFound />;
  const s = m.slides[i];
  const panel = notes && vw.w > 900 ? 400 : 0;
  const k = Math.min((vw.w - panel - 48) / SW, (vw.h - 96) / SH);
  const el = Math.floor((now - start) / 1000);
  const planned = m.slides.slice(0, i).reduce((a, x) => a + x.min, 0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0B0A1C', color: '#fff', display: 'flex', userSelect: 'none', cursor: idle ? 'none' : 'default' }}>
      <div style={{ flex: 1, position: 'relative', display: 'grid', placeItems: 'center' }}
        onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); (e.clientX - r.left > r.width / 3 ? next : prev)(); }}>
        <div style={{ width: SW * k, height: SH * k, position: 'relative' }}>
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            <motion.div key={i} custom={dir}
              initial={{ opacity: 0, x: dir * 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: .5, ease: EASE }}
              style={{ position: 'absolute', inset: 0, borderRadius: 18, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,.5)' }}>
              <div style={{ transform: `scale(${k})`, transformOrigin: 'top left', width: SW, height: SH, position: 'absolute', left: 0, top: 0 }}>
                <Slide slide={s} material={m} index={i} total={total} reveal={reveal || !needsReveal(i)} animated />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Панель управления */}
        <motion.div animate={{ opacity: idle ? 0 : 1, y: idle ? 10 : 0 }} transition={{ duration: .3 }} onClick={(e) => e.stopPropagation()}
          style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, padding: 6, borderRadius: 18, background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(12px)' }}>
          <Btn onClick={() => nav(`/uchitelyam/${id}`)} label="Выйти (Esc)"><X size={20} /></Btn>
          <Btn onClick={prev} label="Назад (←)"><ChevronLeft size={22} /></Btn>
          <span style={{ fontWeight: 800, fontSize: 14, minWidth: 64, textAlign: 'center' }}>{i + 1} / {total}</span>
          <Btn onClick={next} label="Дальше (→)"><ChevronRight size={22} /></Btn>
          {needsReveal(i) && <Btn onClick={() => setReveal((r) => !r)} label={s.type === 'chat' ? 'Показать флаги' : 'Показать ответ'} on={reveal}><Eye size={20} /><span style={{ fontSize: 13.5, fontWeight: 800 }}>{s.type === 'chat' ? 'Флаги' : 'Ответ'}</span></Btn>}
          <Btn onClick={() => setNotes((n) => !n)} label="Сценарий (S)" on={notes}><FileText size={20} /></Btn>
          <Btn onClick={toggleFull} label="Полный экран (F)">{full ? <Minimize size={20} /> : <Maximize size={20} />}</Btn>
        </motion.div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: 'rgba(255,255,255,.08)' }}>
          <motion.div animate={{ width: `${((i + 1) / total) * 100}%` }} transition={{ duration: .5, ease: EASE }} style={{ height: '100%', background: '#FFC93C' }} />
        </div>
      </div>

      <AnimatePresence>
        {panel > 0 && (
          <motion.aside initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} transition={{ duration: .45, ease: EASE }}
            style={{ width: 400, background: '#15142E', borderLeft: '1px solid rgba(255,255,255,.08)', padding: 24, overflow: 'auto', display: 'grid', alignContent: 'start', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 15, color: '#FFC93C' }}>Сценарий · слайд {i + 1}</b>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#C9C8DF' }}><Clock size={14} />{s.min} мин</span>
            </div>
            <div style={{ fontSize: 17, lineHeight: 1.6, color: '#E8E7F5' }}>{s.script.split('\n\n').map((p, n) => <p key={n} style={{ marginTop: n ? 12 : 0 }}>{p}</p>)}</div>
            {s.tip && <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,201,60,.12)', color: '#FFE08A', fontSize: 14, fontWeight: 600 }}>Совет: {s.tip}</div>}
            <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: '#C9C8DF', fontWeight: 700 }}>
              <span>Прошло: {String(Math.floor(el / 60)).padStart(2, '0')}:{String(el % 60).padStart(2, '0')}</span>
              <span>По плану: {planned} мин из {m.minutes}</span>
            </div>
            {i < total - 1 && <div style={{ fontSize: 13, color: '#8F8EAB' }}>Далее: {m.slides[i + 1].title || m.slides[i + 1].q || m.slides[i + 1].num}</div>}
            <div style={{ fontSize: 12.5, color: '#8F8EAB', lineHeight: 1.6 }}>Клавиши: → пробел — дальше · ← — назад · F — полный экран · S — сценарий · Esc — выход. На доске: касание справа — дальше, слева — назад.</div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

function Btn({ children, onClick, label, on }) {
  return (
    <button onClick={onClick} title={label} aria-label={label}
      style={{ height: 42, minWidth: 42, padding: '0 10px', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#fff', background: on ? 'rgba(255,201,60,.22)' : 'transparent', transition: 'background .2s' }}
      onMouseEnter={(e) => { if (!on) e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }} onMouseLeave={(e) => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
      {children}
    </button>
  );
}
