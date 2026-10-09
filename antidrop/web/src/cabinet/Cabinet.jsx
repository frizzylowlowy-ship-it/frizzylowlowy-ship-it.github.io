import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Settings as SettingsIcon, Shield, Users, Gamepad2, Presentation } from 'lucide-react';
import { useAuth, ROLE_LABEL } from '../lib/auth.jsx';
import { colorFor, initials } from '../lib/api.js';
import { Loader, EASE } from '../components/ui.jsx';
import StudentHome from './StudentHome.jsx';
import TeacherHome from './TeacherHome.jsx';
import ClassView from './ClassView.jsx';
import StudentDetail from './StudentDetail.jsx';
import Settings from './Settings.jsx';

export default function Cabinet() {
  const { user } = useAuth();
  const loc = useLocation();
  if (user === undefined) return <div className="container" style={{ padding: 40 }}><Loader h={400} /></div>;
  if (!user) return <Navigate to={'/voiti?next=' + encodeURIComponent(loc.pathname)} replace />;
  const teacher = user.role !== 'student';

  const nav = teacher
    ? [['/kabinet', 'Мои классы', Users, true], ['/uchitelyam', 'Материалы', Presentation], ['/kabinet/nastroyki', 'Настройки', SettingsIcon]]
    : [['/kabinet', 'Обзор', LayoutDashboard, true], ['/igry', 'Игры и уроки', Gamepad2], ['/kabinet/nastroyki', 'Настройки', SettingsIcon]];
  if (user.role === 'admin') nav.push(['/admin', 'Админ-панель', Shield]);

  return (
    <div className="page">
      <div className="container cab-grid" style={{ padding: '28px 24px 72px' }}>
        <aside className="cab-side">
          <div className="row" style={{ gap: 12, padding: '6px 6px 18px' }}>
            <span className="avatar" style={{ background: colorFor(user.login), width: 46, height: 46 }}>{initials(user.name)}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div className="muted" style={{ fontSize: 13 }}>{ROLE_LABEL[user.role]} · @{user.login}</div>
            </div>
          </div>
          <nav className="cab-nav">
            {nav.map(([to, label, I, end]) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => 'cab-link' + (isActive || (end && /^\/kabinet\/klass/.test(loc.pathname) && to === '/kabinet') ? ' on' : '')}>
                <I size={19} /><span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <AnimatePresence mode="wait">
          <motion.div key={loc.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .35, ease: EASE }} style={{ minWidth: 0 }}>
            <Routes location={loc}>
              <Route index element={teacher ? <TeacherHome /> : <StudentHome />} />
              <Route path="nastroyki" element={<Settings />} />
              {teacher && <Route path="klass/:id" element={<ClassView />} />}
              {teacher && <Route path="klass/:id/uchenik/:uid" element={<StudentDetail />} />}
              <Route path="*" element={<Navigate to="/kabinet" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Общие элементы кабинета
export function Stat({ icon: I, label, value, sub, color = 'var(--brand)', bg = 'var(--brand-50)' }) {
  return (
    <div className="card" style={{ padding: 20, display: 'grid', gap: 10 }}>
      <div className="row between">
        <span className="muted" style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: bg, color, display: 'grid', placeItems: 'center' }}><I size={18} /></span>
      </div>
      <div style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 34, lineHeight: 1 }}>{value}</div>
      {sub && <div className="muted" style={{ fontSize: 13.5, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

export function Head({ title, sub, children }) {
  return (
    <div className="row between row-wrap" style={{ gap: 16, marginBottom: 24, alignItems: 'flex-end' }}>
      <div>
        <h1 className="h2" style={{ fontSize: 'clamp(26px,3vw,36px)' }}>{title}</h1>
        {sub && <div className="muted" style={{ marginTop: 6, fontWeight: 600 }}>{sub}</div>}
      </div>
      {children && <div className="row row-wrap" style={{ gap: 10 }}>{children}</div>}
    </div>
  );
}

export function Status({ t }) {
  const on = t && Date.now() - t < 5 * 60e3;
  return <span className="dot" style={{ background: on ? 'var(--mint)' : 'var(--line-2)', boxShadow: on ? '0 0 0 4px rgba(16,183,131,.18)' : 'none' }} />;
}

export function Cell({ ratio }) {
  if (ratio == null) return <span className="cell-dot" title="Не выполнено" style={{ background: 'var(--bg-2)' }}>—</span>;
  const pass = ratio >= 0.6;
  return <span className="cell-dot" title={`${Math.round(ratio * 100)}%`} style={{ background: pass ? 'var(--mint-50)' : 'var(--sun-50)', color: pass ? '#0A7A57' : '#8A5B00' }}>{Math.round(ratio * 100)}</span>;
}
