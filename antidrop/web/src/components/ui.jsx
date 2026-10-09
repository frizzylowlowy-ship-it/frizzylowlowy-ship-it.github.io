import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, animate } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import {
  AlertCircle, AlertTriangle, ArrowLeft, ArrowLeftRight, ArrowRight, BadgeCheck, Ban, Banknote, Bell, Camera, Circle, CircleHelp, ClipboardList, CreditCard, Download, EyeOff, FileText, Flag, Frown, Gift, Hand, HeartHandshake, HelpCircle, Inbox, Landmark, LayoutGrid, LifeBuoy, LineChart, Link, Lock, MessageCircle, MessageSquareOff, MessagesSquare, MonitorPlay, Phone, PhoneCall, PhoneOff, Presentation, Scale, Search, Shuffle, Siren, Target, Timer, Trash2, Undo2, User, UserX, Users, Wallet, Zap,
} from 'lucide-react';

// Только используемые иконки — чтобы не тянуть в сборку всю библиотеку
const Icons = { AlertCircle, AlertTriangle, ArrowLeft, ArrowLeftRight, ArrowRight, BadgeCheck, Ban, Banknote, Bell, Camera, Circle, CircleHelp, ClipboardList, CreditCard, Download, EyeOff, FileText, Flag, Frown, Gift, Hand, HeartHandshake, HelpCircle, Inbox, Landmark, LayoutGrid, LifeBuoy, LineChart, Link, Lock, MessageCircle, MessageSquareOff, MessagesSquare, MonitorPlay, Phone, PhoneCall, PhoneOff, Presentation, Scale, Search, Shuffle, Siren, Target, Timer, Trash2, Undo2, User, UserX, Users, Wallet, Zap };

export const EASE = [0.22, 1, 0.36, 1];

// Плавное появление при прокрутке
export function Reveal({ children, delay = 0, y = 28, as = 'div', className, style, once = true }) {
  const M = motion[as];
  return (
    <M className={className} style={style}
      initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }} transition={{ duration: 0.8, delay, ease: EASE }}>
      {children}
    </M>
  );
}

// Контейнер с поочерёдным появлением детей
export const stagger = (s = 0.08, d = 0) => ({ hidden: {}, show: { transition: { staggerChildren: s, delayChildren: d } } });
export const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };

export function Stagger({ children, className, style, s = 0.08, d = 0 }) {
  return (
    <motion.div className={className} style={style} variants={stagger(s, d)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }}>
      {children}
    </motion.div>
  );
}
export const Item = ({ children, className, style, ...p }) => <motion.div variants={fadeUp} className={className} style={style} {...p}>{children}</motion.div>;

// Счётчик, который набегает при появлении
export function Counter({ to, from = 0, decimals = 0, prefix = '', suffix = '', duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [v, setV] = useState(from);
  useEffect(() => {
    if (!inView) return;
    const c = animate(from, to, { duration, ease: EASE, onUpdate: setV });
    return () => c.stop();
  }, [inView, from, to, duration]);
  return <span ref={ref}>{prefix}{v.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

export function Icon({ name, size = 22, ...p }) {
  const C = Icons[name] || Icons.Circle;
  return <C size={size} strokeWidth={2} {...p} />;
}

// ---------- Уведомления ----------
const ToastCtx = createContext(() => {});
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((text, type = 'ok') => {
    const id = Math.random();
    setItems((x) => [...x, { id, text, type }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1000, display: 'grid', gap: 10 }}>
        <AnimatePresence>
          {items.map((t) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 16, background: '#2B2A3D', color: '#fff', boxShadow: 'var(--sh-3)', fontWeight: 700, fontSize: 14.5, maxWidth: 380 }}>
              {t.type === 'ok' ? <CheckCircle2 size={20} color="#3BE0A8" /> : <AlertCircle size={20} color="#FF8A9E" />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

// ---------- Модальное окно ----------
export function Modal({ open, onClose, title, children, width = 520 }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(19,18,43,.42)', backdropFilter: 'blur(6px)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <motion.div role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="card" style={{ width: '100%', maxWidth: width, padding: 28, maxHeight: '90vh', overflow: 'auto' }}>
            <div className="row between" style={{ marginBottom: 18 }}>
              <h3 className="h3" style={{ fontSize: 22 }}>{title}</h3>
              <button className="icon-btn" onClick={onClose} aria-label="Закрыть"><X size={20} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Empty({ icon = 'Inbox', title, text, action }) {
  return (
    <div className="center" style={{ padding: '48px 20px', display: 'grid', justifyItems: 'center', gap: 12 }}>
      <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--brand-50)', color: 'var(--brand)', display: 'grid', placeItems: 'center' }}><Icon name={icon} size={28} /></div>
      <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
      {text && <p className="muted" style={{ maxWidth: 420 }}>{text}</p>}
      {action}
    </div>
  );
}

export function Ring({ value = 0, size = 56, stroke = 6, color = 'var(--brand)', label }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-2)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.min(1, value)) }} transition={{ duration: 1.2, ease: EASE }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: size > 70 ? 18 : 13 }}>{label ?? Math.round(value * 100) + '%'}</div>
    </div>
  );
}

export function Loader({ h = 200 }) {
  return <div style={{ display: 'grid', gap: 12 }}><div className="skeleton" style={{ height: 40, width: '40%' }} /><div className="skeleton" style={{ height: h }} /></div>;
}
