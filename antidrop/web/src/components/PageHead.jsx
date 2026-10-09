import { motion } from 'framer-motion';
import { Hills } from './Art.jsx';
import { EASE } from './ui.jsx';

// Шапка внутренней страницы: сиреневый блок, заголовок, подводка и иллюстрация справа
export default function PageHead({ eyebrow, title, lead, children, art }) {
  return (
    <section style={{ padding: '8px 0 32px' }}>
      <div className="container">
        <div className="hero-block page-hero">
          <Hills />
          <div className="page-head" style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gap: 18, alignContent: 'center' }}>
              {eyebrow && <motion.span className="eyebrow" style={{ color: 'rgba(255,255,255,.85)' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .6, ease: EASE }}>{eyebrow}</motion.span>}
              <motion.h1 className="h1" style={{ color: '#fff', fontSize: 'clamp(34px, 4.4vw, 56px)' }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: EASE, delay: .05 }}>{title}</motion.h1>
              {lead && <motion.p style={{ maxWidth: 560, color: 'rgba(255,255,255,.92)', fontSize: 17.5 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: EASE, delay: .15 }}>{lead}</motion.p>}
              {children && <motion.div className="on-violet" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: EASE, delay: .25 }}>{children}</motion.div>}
            </div>
            {art && (
              <motion.div className="page-head-art" initial={{ opacity: 0, scale: .94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: .15 }}>
                {art}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Заголовок секции
export function SectionTitle({ eyebrow, title, lead, center }) {
  return (
    <div style={{ display: 'grid', gap: 12, marginBottom: 36, justifyItems: center ? 'center' : 'start', textAlign: center ? 'center' : 'left' }}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="h2" style={{ maxWidth: 760 }}>{title}</h2>
      {lead && <p className="lead" style={{ maxWidth: 640 }}>{lead}</p>}
    </div>
  );
}

// Белая «подложка» для иллюстрации в шапке
export function ArtCircle({ children, size = 300 }) {
  return (
    <div style={{ width: size, height: size, maxWidth: '100%', borderRadius: '50%', background: 'rgba(255,255,255,.95)', display: 'grid', placeItems: 'center', boxShadow: '0 20px 50px rgba(30,20,90,.18)' }}>
      {children}
    </div>
  );
}
