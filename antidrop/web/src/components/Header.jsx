import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import Logo from './Logo.jsx';
import { useAuth } from '../lib/auth.jsx';
import { colorFor, initials } from '../lib/api.js';
import { EASE } from './ui.jsx';
import { DEMO } from '../lib/demo.js';

const NAV = [
  { to: '/uchenikam', label: 'Ученикам' },
  { to: '/igry', label: 'Игры и уроки' },
  { to: '/uchitelyam', label: 'Учителям' },
  { to: '/roditelyam', label: 'Родителям' },
  { to: '/o-proekte', label: 'О проекте' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 12));
  const loc = useLocation();
  const nav = useNavigate();
  useEffect(() => { setOpen(false); setMenu(false); }, [loc.pathname]);

  return (
    <header className="no-print" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {DEMO && <div style={{ background: 'var(--sun-50)', color: '#6B4A00', fontSize: 13, fontWeight: 600, textAlign: 'center', padding: '7px 16px' }}>Демо-версия: уроки, игры и материалы для учителя работают полностью. Вход, классы и кабинеты — в версии на сервере.</div>}
      <motion.div
        animate={{ boxShadow: scrolled ? '0 1px 0 rgba(43,42,61,.08)' : '0 1px 0 rgba(43,42,61,0)' }}
        transition={{ duration: 0.3 }}
        style={{ background: '#fff' }}>
        <div className="container row between" style={{ height: 72 }}>
          <Link to="/" aria-label="Антидроп — на главную"><Logo size={34} /></Link>

          <nav className="hide-m row" style={{ gap: 26 }}>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className="nav-link">
                {({ isActive }) => (<>
                  <span style={{ color: isActive ? 'var(--brand)' : 'var(--ink)' }}>{n.label}</span>
                  {isActive && <motion.span layoutId="nav-line" transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    style={{ position: 'absolute', left: 0, right: 0, bottom: -2, height: 3, borderRadius: 3, background: 'var(--brand)' }} />}
                </>)}
              </NavLink>
            ))}
          </nav>

          <div className="row" style={{ gap: 8 }}>
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setMenu((m) => !m)} className="row" style={{ gap: 10, padding: '5px 5px 5px 14px', borderRadius: 12, background: 'var(--bg)' }}>
                  <span className="hide-m" style={{ fontWeight: 700, fontSize: 14.5 }}>{user.name.split(' ')[0]}</span>
                  <span className="avatar" style={{ width: 34, height: 34, fontSize: 13, background: colorFor(user.login) }}>{initials(user.name)}</span>
                </button>
                <AnimatePresence>
                  {menu && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: .25, ease: EASE }} className="card"
                      style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 240, padding: 8, boxShadow: 'var(--sh-3)' }}>
                      <div style={{ padding: '10px 12px 12px' }}>
                        <div style={{ fontWeight: 800 }}>{user.name}</div>
                        <div className="muted" style={{ fontSize: 13 }}>@{user.login}</div>
                      </div>
                      <MenuItem icon={<LayoutDashboard size={18} />} onClick={() => nav('/kabinet')}>Личный кабинет</MenuItem>
                      {user.role === 'admin' && <MenuItem icon={<Shield size={18} />} onClick={() => nav('/admin')}>Админ-панель</MenuItem>}
                      <MenuItem icon={<LogOut size={18} />} onClick={async () => { await logout(); nav('/'); }}>Выйти</MenuItem>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/registraciya" className="nav-link hide-m" style={{ marginRight: 8 }}>Регистрация</Link>
                <Link to="/voiti" className="btn btn-accent btn-sm">Вход</Link>
              </>
            )}
            <button className="icon-btn show-m" onClick={() => setOpen(true)} aria-label="Меню"><Menu /></button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 200, padding: 16 }}>
            <div className="row between" style={{ height: 56 }}>
              <Logo size={32} />
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Закрыть меню"><X /></button>
            </div>
            <motion.nav initial="h" animate="s" variants={{ s: { transition: { staggerChildren: .05 } } }} style={{ display: 'grid', gap: 4, marginTop: 24 }}>
              {NAV.map((n) => (
                <motion.div key={n.to} variants={{ h: { opacity: 0, y: 16 }, s: { opacity: 1, y: 0 } }}>
                  <Link to={n.to} style={{ display: 'block', fontWeight: 700, fontSize: 22, padding: '14px 4px', borderBottom: '1px solid var(--line)' }}>{n.label}</Link>
                </motion.div>
              ))}
              {!user && <Link to="/registraciya" className="btn btn-ghost btn-lg" style={{ marginTop: 20 }}>Регистрация</Link>}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MenuItem({ icon, children, onClick }) {
  return (
    <button onClick={onClick} className="row" style={{ width: '100%', gap: 12, padding: '11px 12px', borderRadius: 12, fontWeight: 700, fontSize: 14.5, color: 'var(--ink-2)' }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-2)')} onMouseLeave={(e) => (e.currentTarget.style.background = '')}>
      {icon}{children}
    </button>
  );
}
