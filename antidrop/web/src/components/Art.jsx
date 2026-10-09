import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flag } from 'lucide-react';
import { EASE } from './ui.jsx';

/* ===================== Телефон с перепиской (герой) ===================== */
const SCRIPT = [
  { t: 0.6, who: 'them', text: 'Привет! Есть лёгкая подработка' },
  { t: 1.8, who: 'them', text: 'Просто прими перевод и перекинь дальше. 10% — твои', flag: 'Деньги за перевод' },
  { t: 3.2, who: 'them', text: 'Ответь за 10 минут, а то возьмём другого', flag: 'Спешка' },
  { t: 4.6, who: 'them', text: 'Всё легально, не парься', flag: '«Всё легально»' },
  { t: 6.6, who: 'me', text: 'Стоп. Беру паузу 15 минут' },
];

export function PhoneChat({ scale = 1 }) {
  const [cycle, setCycle] = useState(0);
  const [t, setT] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (n) => { const s = (n - start) / 1000; setT(s); if (s > 10.5) { setCycle((c) => c + 1); return; } raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cycle]);
  const visible = SCRIPT.filter((m) => t >= m.t);
  const typing = SCRIPT.find((m) => m.who === 'them' && t >= m.t - .9 && t < m.t);
  const blocked = t > 7.6;
  return (
    <div style={{ width: 330 * scale, height: 640 * scale, position: 'relative' }}>
      <div style={{ width: 330, height: 640, transform: `scale(${scale})`, transformOrigin: '0 0', borderRadius: 52, background: '#2E2A6B', padding: 11, boxShadow: '0 30px 60px rgba(30,20,90,.35)' }}>
        <div style={{ width: '100%', height: '100%', borderRadius: 42, background: '#F6F5FC', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 10, left: '50%', marginLeft: -48, width: 96, height: 26, borderRadius: 20, background: '#2E2A6B', zIndex: 3 }} />
          <div className="row" style={{ gap: 12, padding: '50px 18px 14px', borderBottom: '1px solid var(--line)', background: '#fff' }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#FFEDED', display: 'grid', placeItems: 'center', color: '#E54848', fontWeight: 800, fontSize: 18 }}>?</div>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Подработка</div>
              <div style={{ fontSize: 12.5, color: typing ? 'var(--brand)' : 'var(--mint)', fontWeight: 700 }}>{typing ? 'печатает…' : 'в сети'}</div>
            </div>
          </div>
          <div key={cycle} style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence>
              {visible.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 14, scale: .9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  style={{ alignSelf: m.who === 'me' ? 'flex-end' : 'flex-start', maxWidth: '84%', position: 'relative', transformOrigin: m.who === 'me' ? '100% 100%' : '0 100%' }}>
                  <div style={{ padding: '11px 14px', borderRadius: m.who === 'me' ? '18px 18px 6px 18px' : '18px 18px 18px 6px', fontSize: 14.5, fontWeight: 600, lineHeight: 1.35,
                    background: m.who === 'me' ? 'var(--brand)' : '#fff', color: m.who === 'me' ? '#fff' : 'var(--ink)', boxShadow: m.who === 'me' ? 'var(--sh-brand)' : 'var(--sh-1)', border: m.who === 'me' ? 0 : '1px solid var(--line)' }}>
                    {m.text}
                  </div>
                  {m.flag && t > m.t + .9 && (
                    <motion.span initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: -3 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}
                      style={{ position: 'absolute', right: -10, top: -12, background: 'var(--danger)', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 9px', borderRadius: 99, whiteSpace: 'nowrap', boxShadow: '0 6px 14px rgba(250,90,90,.35)' }}>
                      <Flag size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />{m.flag}
                    </motion.span>
                  )}
                </motion.div>
              ))}
              {typing && (
                <motion.div key="typing" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  style={{ alignSelf: 'flex-start', background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '10px 14px', display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map((d) => <motion.i key={d} animate={{ y: [0, -4, 0] }} transition={{ duration: .6, repeat: Infinity, delay: d * .12 }} style={{ width: 7, height: 7, borderRadius: 9, background: '#B8B6D0', display: 'block' }} />)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {blocked && (
              <motion.div initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .6, ease: EASE }}
                style={{ position: 'absolute', left: 12, right: 12, bottom: 14, background: 'var(--mint)', color: '#fff', borderRadius: 20, padding: '14px 16px', boxShadow: '0 14px 30px rgba(31,170,89,.35)' }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>3 красных флага найдено</div>
                <div style={{ fontSize: 13, opacity: .92, marginTop: 2 }}>Ты не ответил «да» — схема не сработала</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ===================== Фон героя: мягкие «холмы», как на плоских иллюстрациях ===================== */
export function Hills({ color = '#8A7EF2', color2 = '#9D93F5' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMax slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <motion.path d="M0 300 C120 220 220 260 320 200 C420 140 520 200 600 170 C700 130 760 60 880 90 C980 115 1060 60 1200 80 V520 H0 Z" fill={color}
        animate={{ y: [0, 6, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.path d="M0 420 C140 360 260 400 380 340 C500 280 600 350 720 320 C860 285 960 340 1200 260 V520 H0 Z" fill={color2}
        animate={{ y: [0, -5, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
    </svg>
  );
}

export const Blob = () => null;
export const GridBg = () => null;
