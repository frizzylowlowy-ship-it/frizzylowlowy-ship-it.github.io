import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, GraduationCap, School, Award, Wifi, Activity, Search, Ban, KeyRound, Trash2, ShieldCheck, LayoutDashboard, BarChart3, CheckCircle2 } from 'lucide-react';
import { api, ago, fmtDate, fmtDateFull, colorFor, initials, isOnline } from '../lib/api.js';
import { useAuth, ROLE_LABEL } from '../lib/auth.jsx';
import { Loader, Modal, Icon, useToast, EASE } from '../components/ui.jsx';
import { byId } from '@shared/catalog.js';
import { Stat, Head, Status } from './Cabinet.jsx';

const TABS = [['overview', 'Обзор', LayoutDashboard], ['users', 'Пользователи', Users], ['classes', 'Классы', School]];

export default function Admin() {
  const { user } = useAuth();
  const loc = useLocation();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'overview';
  if (user === undefined) return <div className="container" style={{ padding: 40 }}><Loader h={400} /></div>;
  if (!user) return <Navigate to={'/voiti?next=' + encodeURIComponent(loc.pathname)} replace />;
  if (user.role !== 'admin') return <Navigate to="/kabinet" replace />;

  return (
    <div className="page">
      <div className="container" style={{ padding: '28px 24px 72px' }}>
        <Head title="Админ-панель" sub="Управление платформой «Антидроп»">
          <div className="tabs">
            {TABS.map(([k, l, I]) => (
              <button key={k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => setSp(k === 'overview' ? {} : { tab: k }, { replace: true })}>
                {tab === k && <motion.span layoutId="admin-tab" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="row" style={{ gap: 7 }}><I size={16} />{l}</span>
              </button>
            ))}
          </div>
        </Head>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .3, ease: EASE }}>
            {tab === 'overview' && <Overview />}
            {tab === 'users' && <UsersTab me={user} />}
            {tab === 'classes' && <ClassesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => { api('/admin/stats').then(setS); }, []);
  if (!s) return <Loader h={420} />;
  const max = Math.max(1, ...s.days.map((d) => Math.max(d.results, d.users)));
  const popMax = Math.max(1, ...s.popular.map((p) => p.n));
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <div className="grid g-4" style={{ gap: 14 }}>
        <Stat icon={Users} label="Пользователей" value={s.totalUsers} sub={`${s.users.student || 0} учеников · ${s.users.teacher || 0} учителей`} />
        <Stat icon={Wifi} label="Сейчас в сети" value={s.online} sub={`активны за 7 дней: ${s.active7}`} color="#0A7A57" bg="var(--mint-50)" />
        <Stat icon={CheckCircle2} label="Прохождений" value={s.results} sub={`классов: ${s.classes}`} color="#C98500" bg="var(--sun-50)" />
        <Stat icon={Award} label="Грамот" value={s.certificates} color="var(--coral)" bg="var(--coral-50)" />
      </div>
      <div className="detail-grid">
        <section className="card" style={{ padding: 24 }}>
          <div className="row between row-wrap" style={{ marginBottom: 18, gap: 10 }}>
            <h2 className="h3" style={{ fontSize: 19 }}>Активность за 14 дней</h2>
            <div className="row" style={{ gap: 14, fontSize: 13, fontWeight: 700 }}>
              <span className="row" style={{ gap: 6 }}><span className="dot" style={{ background: 'var(--brand)' }} />прохождения</span>
              <span className="row" style={{ gap: 6 }}><span className="dot" style={{ background: 'var(--sun)' }} />активные пользователи</span>
            </div>
          </div>
          <div className="bar-chart">
            {s.days.map((d, i) => (
              <div key={d.date} style={{ flex: 1, display: 'grid', gridTemplateRows: '1fr auto', height: '100%', gap: 6 }} title={`${fmtDate(d.date)}: ${d.results} прохождений, ${d.users} пользователей`}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: '100%' }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(2, (d.results / max) * 100)}%` }} transition={{ delay: i * .03, duration: .7, ease: EASE }} style={{ flex: 1, borderRadius: '6px 6px 2px 2px', background: 'var(--brand)' }} />
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(2, (d.users / max) * 100)}%` }} transition={{ delay: .1 + i * .03, duration: .7, ease: EASE }} style={{ flex: 1, borderRadius: '6px 6px 2px 2px', background: 'var(--sun)' }} />
                </div>
                <span className="muted" style={{ fontSize: 10.5, fontWeight: 700, textAlign: 'center' }}>{new Date(d.date).getDate()}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card" style={{ padding: 24 }}>
          <h2 className="h3" style={{ fontSize: 19, marginBottom: 16 }}>Популярные задания</h2>
          {!s.popular.length ? <p className="muted">Пока нет прохождений</p> : (
            <div style={{ display: 'grid', gap: 12 }}>
              {s.popular.slice(0, 8).map((p, i) => {
                const a = byId(p.id);
                return (
                  <div key={p.id} style={{ display: 'grid', gap: 6 }}>
                    <div className="row between" style={{ fontSize: 14 }}><span className="row" style={{ gap: 8, fontWeight: 700 }}><Icon name={a?.icon} size={16} color="var(--brand)" />{a?.title || p.id}</span><span className="muted" style={{ fontWeight: 700 }}>{p.n} · ср. {Math.round(p.avg * 100)}%</span></div>
                    <div className="progress"><motion.i initial={{ width: 0 }} animate={{ width: (p.n / popMax) * 100 + '%' }} transition={{ delay: i * .05, duration: .8, ease: EASE }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function UsersTab({ me }) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [list, setList] = useState(null);
  const [edit, setEdit] = useState(null);
  const [pass, setPass] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const load = () => api(`/admin/users?q=${encodeURIComponent(q)}&role=${role}`).then((d) => setList(d.users));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q, role]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = async (body, msg) => {
    try { const d = await api('/admin/users/' + edit.id, { method: 'PATCH', body }); setEdit(d.user); toast(msg); load(); }
    catch (e) { toast(e.message, 'err'); }
  };
  const counts = useMemo(() => (list ? { all: list.length, online: list.filter((u) => isOnline(u.lastSeen)).length } : null), [list]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="row row-wrap" style={{ gap: 10 }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 420 }}>
          <Search size={18} color="var(--muted)" style={{ position: 'absolute', left: 14, top: 15 }} />
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Имя, логин или школа" style={{ paddingLeft: 42 }} />
        </div>
        <select className="select" value={role} onChange={(e) => setRole(e.target.value)} style={{ width: 'auto' }} aria-label="Роль">
          <option value="">Все роли</option><option value="student">Ученики</option><option value="teacher">Учителя</option><option value="admin">Администраторы</option>
        </select>
        {counts && <span className="muted" style={{ fontWeight: 700, fontSize: 14 }}>Найдено: {counts.all} · в сети: {counts.online}</span>}
      </div>
      {!list ? <Loader h={300} /> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Пользователь</th><th>Роль</th><th>Школа</th><th>Был в сети</th><th>Баллы</th><th>Регистрация</th></tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="clickable" onClick={() => { setEdit(u); setPass(''); setConfirmDel(false); }} style={{ opacity: u.blocked ? .55 : 1 }}>
                  <td><div className="row" style={{ gap: 10 }}>
                    <span className="avatar" style={{ width: 34, height: 34, borderRadius: 11, fontSize: 12, background: colorFor(u.login) }}>{initials(u.name)}</span>
                    <div><div style={{ fontWeight: 800 }}>{u.name} {u.blocked && <span className="chip chip-danger" style={{ height: 20, fontSize: 11 }}>заблокирован</span>}</div><div className="muted" style={{ fontSize: 12.5 }}>@{u.login}{u.phone ? ' · ' + u.phone : ''}</div></div>
                  </div></td>
                  <td><span className={'chip ' + (u.role === 'admin' ? 'chip-danger' : u.role === 'teacher' ? 'chip-mint' : 'chip-brand')}>{ROLE_LABEL[u.role]}</span></td>
                  <td className="muted" style={{ fontSize: 13.5 }}>{[u.school, u.grade].filter(Boolean).join(', ') || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 13.5 }}><span className="row" style={{ gap: 8 }}><Status t={u.lastSeen} />{ago(u.lastSeen)}</span></td>
                  <td><b>{u.points}</b></td>
                  <td className="muted" style={{ fontSize: 13.5, whiteSpace: 'nowrap' }}>{fmtDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.name || ''} width={560}>
        {edit && (
          <div style={{ display: 'grid', gap: 18 }}>
            <div className="muted" style={{ fontWeight: 600, fontSize: 14 }}>@{edit.login}{edit.phone ? ' · ' + edit.phone : ''} · с {fmtDateFull(edit.createdAt)}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>Роль</div>
              <div className="tabs">
                {['student', 'teacher', 'admin'].map((r) => (
                  <button key={r} className={'tab' + (edit.role === r ? ' on' : '')} disabled={edit.id === me.id} onClick={() => edit.role !== r && patch({ role: r }, `Роль изменена: ${ROLE_LABEL[r]}`)}>
                    {edit.role === r && <motion.span layoutId="role-pill" className="tab-pill" />}<span>{ROLE_LABEL[r]}</span>
                  </button>
                ))}
              </div>
            </div>
            <form className="row" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); patch({ newPassword: pass }, 'Пароль сброшен, сессии завершены'); setPass(''); }}>
              <input className="input" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Новый пароль (от 8 символов)" minLength={8} required />
              <button className="btn btn-dark" disabled={pass.length < 8}><KeyRound size={17} />Сбросить</button>
            </form>
            {edit.id !== me.id && (
              <div className="row row-wrap" style={{ gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => patch({ blocked: !edit.blocked }, edit.blocked ? 'Пользователь разблокирован' : 'Пользователь заблокирован')}>
                  {edit.blocked ? <><ShieldCheck size={17} />Разблокировать</> : <><Ban size={17} />Заблокировать</>}
                </button>
                {!confirmDel
                  ? <button className="btn btn-danger" onClick={() => setConfirmDel(true)}><Trash2 size={17} />Удалить</button>
                  : <button className="btn btn-danger" onClick={async () => { await api('/admin/users/' + edit.id, { method: 'DELETE' }); toast('Пользователь удалён'); setEdit(null); load(); }}>Точно удалить со всеми данными?</button>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function ClassesTab() {
  const [list, setList] = useState(null);
  useEffect(() => { api('/admin/classes').then((d) => setList(d.classes)); }, []);
  if (!list) return <Loader h={300} />;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Класс</th><th>Учитель</th><th>Школа</th><th>Учеников</th><th>Код</th><th>Создан</th></tr></thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id}>
              <td style={{ fontWeight: 800 }}>{c.name}</td>
              <td>{c.teacher}</td>
              <td className="muted" style={{ fontSize: 13.5 }}>{c.school || '—'}</td>
              <td><b>{c.members}</b></td>
              <td><span className="kbd">{c.code}</span></td>
              <td className="muted" style={{ fontSize: 13.5 }}>{fmtDate(c.createdAt)}</td>
            </tr>
          ))}
          {!list.length && <tr><td colSpan={6} className="muted center" style={{ padding: 30 }}>Классов пока нет</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
