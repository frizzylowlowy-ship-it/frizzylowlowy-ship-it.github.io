import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Phone, Flag } from 'lucide-react';
import { Icon, EASE } from './ui.jsx';
import { Mark } from './Logo.jsx';
import { Hills } from './Art.jsx';
import { Illo } from './Illo.jsx';
import { GAME_COLORS } from '../games/colors.js';

export const SW = 1280, SH = 720;

// Масштабирует слайд 1280×720 под ширину контейнера (fixed — заранее известная ширина, например для печати)
export function Scaled({ children, style, className, fixed }) {
  const ref = useRef(null);
  const [k, setK] = useState(fixed ? fixed / SW : 0);
  useEffect(() => {
    if (fixed) return;
    const el = ref.current;
    const ro = new ResizeObserver(() => setK(el.clientWidth / SW));
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixed]);
  return (
    <div ref={ref} className={className} style={{ position: 'relative', width: fixed || '100%', aspectRatio: '16 / 9', overflow: 'hidden', ...style }}>
      <div style={fixed ? { width: SW, height: SH, zoom: k } : { position: 'absolute', left: 0, top: 0, width: SW, height: SH, transform: `scale(${k})`, transformOrigin: '0 0' }}>
        {k > 0 && children}
      </div>
    </div>
  );
}

const COVER_ILLO = { violet: 'timer', coral: 'chat', blue: 'shield', amber: 'bell', teal: 'board' };

// reveal — показать флаги/ответ (в режиме показа включается учителем), animated — анимация появления
export default function Slide({ slide: s, material: m, index, total, reveal = true, animated = false }) {
  const c = GAME_COLORS[m.color];
  const A = animated ? motion.div : 'div';
  const anim = (i = 0) => animated ? { initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 }, transition: { duration: .7, delay: .1 + i * .09, ease: EASE } } : {};

  if (s.type === 'cover') {
    return (
      <div className="slide" style={{ background: '#7B6EF0', color: '#fff' }}>
        <Hills />
        <div style={{ position: 'absolute', left: 88, top: 76, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ display: 'grid', background: '#fff', borderRadius: 14, padding: 4 }}><Mark size={46} /></span>
          <span style={{ fontWeight: 800, fontSize: 28, textTransform: 'uppercase', letterSpacing: '-.01em' }}>Антидроп</span>
        </div>
        <A {...anim(0)} style={{ position: 'absolute', left: 88, top: 220, width: 700 }}>
          <div style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 12, background: '#fff', color: 'var(--ink)', fontWeight: 700, fontSize: 21, textTransform: 'uppercase', letterSpacing: '.04em' }}>{s.tag}</div>
          <div style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 104, lineHeight: 1.02, marginTop: 30 }}>{s.title}</div>
          <div style={{ fontSize: 30, color: 'rgba(255,255,255,.92)', marginTop: 22, fontWeight: 500, lineHeight: 1.3 }}>{s.sub}</div>
        </A>
        <A {...anim(1)} style={{ position: 'absolute', right: 90, top: 170, width: 380, height: 380, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', boxShadow: '0 30px 70px rgba(30,20,90,.25)' }}>
          <Illo name={COVER_ILLO[m.color]} size={300} />
        </A>
        <Foot light index={index} total={total} />
      </div>
    );
  }

  const body = (() => {
    switch (s.type) {
      case 'statement':
        return (
          <div style={{ display: 'grid', alignContent: 'center', height: '100%', gap: 28, maxWidth: 1000 }}>
            <A {...anim(0)}><Kicker c={c}>{s.kicker}</Kicker></A>
            <A {...anim(1)} style={{ fontWeight: 700, fontSize: 58, lineHeight: 1.15 }}>{s.title}</A>
            {s.text && <A {...anim(2)} style={{ fontSize: 30, color: 'var(--ink-2)', fontWeight: 600, lineHeight: 1.4 }}>{s.text}</A>}
          </div>
        );
      case 'big':
        return (
          <div style={{ display: 'grid', alignContent: 'center', height: '100%', gap: 20 }}>
            <A {...anim(0)} style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 190, lineHeight: .95, color: c.fg }}>{s.num}</A>
            <A {...anim(1)} style={{ fontSize: 42, fontWeight: 700, lineHeight: 1.25, maxWidth: 980 }}>{s.label}</A>
            {s.source && <A {...anim(2)} style={{ fontSize: 22, color: 'var(--muted)', fontWeight: 700 }}>Источник: {s.source}</A>}
          </div>
        );
      case 'bullets':
        return (
          <>
            <Title s={s} anim={anim} A={A} />
            <div style={{ display: 'grid', gridTemplateColumns: s.cols === 2 ? '1fr 1fr' : '1fr', gap: s.cols === 2 ? '18px 28px' : 16, marginTop: 36 }}>
              {s.items.map((t, i) => (
                <A key={i} {...anim(i + 1)} style={{ display: 'flex', gap: 18, alignItems: 'center', padding: s.items.length > 6 || s.cols === 1 ? '16px 22px' : '22px 24px', borderRadius: 22, background: '#F6F5FC', fontSize: s.items.length > 6 ? 25 : 27, fontWeight: 700, lineHeight: 1.3 }}>
                  <span style={{ width: 44, height: 44, borderRadius: 14, background: c.bg, color: c.fg, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 20, flex: 'none' }}>{i + 1}</span>
                  {t}
                </A>
              ))}
            </div>
          </>
        );
      case 'steps':
        return (
          <>
            <Title s={s} anim={anim} A={A} />
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${s.items.length}, 1fr)`, gap: 22, marginTop: 56 }}>
              {s.items.map((it, i) => (
                <A key={i} {...anim(i + 1)} style={{ position: 'relative', padding: '34px 28px', borderRadius: 30, background: '#F6F5FC', display: 'grid', gap: 16, alignContent: 'start', minHeight: 300 }}>
                  <div style={{ width: 76, height: 76, borderRadius: 24, background: '#fff', color: c.fg, display: 'grid', placeItems: 'center', boxShadow: '0 10px 24px rgba(19,18,43,.08)' }}><Icon name={it.icon} size={38} /></div>
                  <div style={{ fontSize: 18, color: c.fg, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em' }}>Шаг {i + 1}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15 }}>{it.t}</div>
                  <div style={{ fontSize: 23, color: 'var(--ink-2)', fontWeight: 600, lineHeight: 1.35 }}>{it.d}</div>
                  {i < s.items.length - 1 && <div style={{ position: 'absolute', right: -19, top: 70, width: 16, height: 16, borderRadius: '50%', background: c.fg, zIndex: 2, boxShadow: '0 0 0 6px #fff' }} />}
                </A>
              ))}
            </div>
          </>
        );
      case 'chat':
        return (
          <>
            <Title s={s} anim={anim} A={A} />
            <div style={{ display: 'grid', gap: 18, marginTop: 34, maxWidth: 1060 }}>
              {s.messages.map((msg, i) => (
                <A key={i} {...anim(i + 1)} style={{ display: 'flex', alignItems: 'center', gap: 22, justifyContent: msg.who === 'me' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ padding: '20px 28px', borderRadius: 28, borderBottomLeftRadius: 8, background: msg.who === 'me' ? 'var(--brand)' : '#F1F2F8', color: msg.who === 'me' ? '#fff' : 'var(--ink)', fontSize: 28, fontWeight: 600, maxWidth: 720, lineHeight: 1.35,
                    boxShadow: reveal && msg.flag ? '0 0 0 4px #FA5A5A' : 'none', transition: 'box-shadow .4s' }}>{msg.text}</div>
                  <AnimatePresence>
                    {reveal && msg.flag && (
                      <motion.div initial={animated ? { opacity: 0, x: -16, scale: .9 } : false} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .5, delay: animated ? i * .25 : 0, ease: EASE }}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 99, background: '#FFEDED', color: '#E54848', fontWeight: 700, fontSize: 22, whiteSpace: 'nowrap' }}>
                        <Flag size={20} />{msg.flag}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </A>
              ))}
            </div>
          </>
        );
      case 'quiz':
        return (
          <>
            <A {...anim(0)}><Kicker c={c}>Вопрос классу</Kicker></A>
            <A {...anim(1)} style={{ fontWeight: 700, fontSize: 42, lineHeight: 1.22, marginTop: 22, maxWidth: 1080 }}>{s.q}</A>
            <div style={{ display: 'grid', gap: 16, marginTop: 34 }}>
              {s.options.map((o, i) => {
                const ok = reveal && i === s.correct;
                return (
                  <A key={i} {...anim(i + 2)} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 26px', borderRadius: 24, fontSize: 28, fontWeight: 700,
                    background: ok ? '#E5F6EC' : '#F6F5FC', boxShadow: ok ? 'inset 0 0 0 3px #1FAA59' : 'none', opacity: reveal && !ok ? .55 : 1, transition: 'all .5s' }}>
                    <span style={{ width: 48, height: 48, borderRadius: 16, background: ok ? '#1FAA59' : '#fff', color: ok ? '#fff' : 'var(--ink)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 22, flex: 'none' }}>
                      {ok ? <Check size={28} /> : 'АБВГ'[i]}
                    </span>
                    {o}
                  </A>
                );
              })}
            </div>
            {reveal && s.explain && <motion.div initial={animated ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 24, fontSize: 24, fontWeight: 700, color: '#127A3E' }}>{s.explain}</motion.div>}
          </>
        );
      case 'two':
        return (
          <>
            <Title s={s} anim={anim} A={A} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, marginTop: 40 }}>
              {[s.left, s.right].map((col, j) => (
                <A key={j} {...anim(j + 1)} style={{ padding: 36, borderRadius: 32, background: j ? '#FFEDED' : '#E5F6EC', minHeight: 340 }}>
                  <div style={{ fontWeight: 700, fontSize: 34, color: j ? '#D94040' : '#127A3E', marginBottom: 22 }}>{col.t}</div>
                  <div style={{ display: 'grid', gap: 16 }}>
                    {col.items.map((t) => (
                      <div key={t} style={{ display: 'flex', gap: 14, fontSize: col.items.length > 3 ? 25 : 28, fontWeight: 700, lineHeight: 1.3 }}>
                        <span style={{ color: j ? '#E54848' : '#1FAA59', flex: 'none' }}>{j ? '✕' : '✓'}</span>{t}
                      </div>
                    ))}
                  </div>
                </A>
              ))}
            </div>
          </>
        );
      case 'task':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 40, height: '100%', alignItems: 'center' }}>
            <div>
              <A {...anim(0)}><Kicker c={c}>Задание · {s.time}</Kicker></A>
              <A {...anim(1)} style={{ fontWeight: 700, fontSize: 48, lineHeight: 1.15, margin: '22px 0 30px' }}>{s.title}</A>
              <div style={{ display: 'grid', gap: 14 }}>
                {s.items.map((t, i) => (
                  <A key={t} {...anim(i + 2)} style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 27, fontWeight: 700 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 12, background: c.fg, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 18, flex: 'none' }}>{i + 1}</span>{t}
                  </A>
                ))}
              </div>
            </div>
            <A {...anim(2)} style={{ display: 'grid', placeItems: 'center', position: 'relative', height: 520 }}>
              <div style={{ width: 440, height: 440, borderRadius: '50%', background: c.bg, display: 'grid', placeItems: 'center' }}><Illo name="board" size={320} /></div>
              <div style={{ position: 'absolute', top: 10, right: 10, padding: '16px 24px', borderRadius: 18, background: '#fff', boxShadow: '0 14px 30px rgba(43,42,61,.1)', fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 36, color: c.fg }}>{s.time}</div>
            </A>
          </div>
        );
      case 'end':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: s.phones ? '1.25fr .75fr' : '1fr', gap: 36, height: '100%', alignItems: 'center' }}>
            <div>
              <A {...anim(0)} style={{ fontWeight: 700, fontSize: 50, lineHeight: 1.15, marginBottom: 30 }}>{s.title}</A>
              <div style={{ display: 'grid', gap: 14 }}>
                {s.items.map((t, i) => (
                  <A key={t} {...anim(i + 1)} style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 27, fontWeight: 700, lineHeight: 1.3 }}>
                    <span style={{ width: 38, height: 38, borderRadius: 12, background: '#1FAA59', color: '#fff', display: 'grid', placeItems: 'center', flex: 'none' }}><Check size={22} /></span>{t}
                  </A>
                ))}
              </div>
            </div>
            {s.phones && (
              <A {...anim(3)} style={{ padding: 34, borderRadius: 32, background: '#7B6EF0', color: '#fff', display: 'grid', gap: 22 }}>
                <div style={{ fontWeight: 700, fontSize: 24 }}>Если нужна помощь</div>
                {[['8-800-2000-122', 'Детский телефон доверия'], ['102', 'Полиция'], ['300', 'Банк России']].map(([n, t]) => (
                  <div key={n} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ width: 48, height: 48, borderRadius: 14, background: '#fff', display: 'grid', placeItems: 'center' }}><Phone size={24} color="#6F61EC" /></span>
                    <div><div style={{ fontWeight: 700, fontSize: 30 }}>{n}</div><div style={{ color: 'rgba(255,255,255,.88)', fontSize: 19, fontWeight: 500 }}>{t}</div></div>
                  </div>
                ))}
              </A>
            )}
          </div>
        );
      default:
        return null;
    }
  })();

  return (
    <div className="slide" style={{ background: '#fff', color: 'var(--ink)' }}>
      <div style={{ position: 'absolute', right: -120, top: -120, width: 360, height: 360, borderRadius: '50%', background: c.bg }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, background: c.fg }} />
      <div style={{ position: 'absolute', inset: '70px 88px 96px 96px' }}>{body}</div>
      <Foot index={index} total={total} title={m.title} />
    </div>
  );
}

function Kicker({ c, children }) {
  return <span style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 12, background: c.bg, color: c.fg, fontWeight: 700, fontSize: 21, textTransform: 'uppercase', letterSpacing: '.05em' }}>{children}</span>;
}

function Title({ s, anim, A }) {
  return <A {...anim(0)} style={{ fontWeight: 700, fontSize: 48, lineHeight: 1.15, maxWidth: 1000 }}>{s.title}</A>;
}

function Foot({ index, total, title, light }) {
  const col = light ? 'rgba(255,255,255,.8)' : 'var(--muted)';
  return (
    <div style={{ position: 'absolute', left: 96, right: 88, bottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 18, fontWeight: 700, color: col }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{!light && <Mark size={26} />}{light ? '' : 'антидроп.рф'}{title ? ` · ${title}` : ''}</span>
      <span>{index + 1} / {total}</span>
    </div>
  );
}
