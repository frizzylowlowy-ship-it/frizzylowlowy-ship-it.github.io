import { motion } from 'framer-motion';
import { Hills } from '../components/Art.jsx';
import { Illo } from '../components/Illo.jsx';
import { EASE } from '../components/ui.jsx';

const ART = { kid: 'chat', teacher: 'board', senior: 'certificate' };

// Общий макет для входа и регистрации: сиреневый блок, белая карточка с формой и иллюстрация
export default function AuthLayout({ title, sub, children, art = 'kid', side }) {
  return (
    <div className="page" style={{ padding: '8px 0 64px' }}>
      <div className="container">
        <div className="hero-block" style={{ minHeight: 560 }}>
          <Hills />
          <div className="auth-grid" style={{ position: 'relative' }}>
            <motion.div className="login-card" style={{ width: '100%', padding: 'clamp(24px,4vw,40px)' }}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, ease: EASE }}>
              <h1 className="h2" style={{ fontSize: 'clamp(24px,2.6vw,30px)' }}>{title}</h1>
              {sub && <p className="muted" style={{ marginTop: 8, marginBottom: 4 }}>{sub}</p>}
              <div style={{ marginTop: 24 }}>{children}</div>
            </motion.div>
            <motion.div className="hide-m" style={{ display: 'grid', placeItems: 'center', gap: 20 }} initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .1, ease: EASE }}>
              {side}
              <div style={{ width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.95)', display: 'grid', placeItems: 'center', boxShadow: '0 20px 50px rgba(30,20,90,.18)' }}>
                <Illo name={ART[art] || 'shield'} size={240} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}
