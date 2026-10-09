import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import qrcode from 'qrcode-generator';
import { ArrowLeft, Users, Wifi, CheckCircle2, Trophy, Plus, Trash2, Copy, RefreshCw, UserPlus, Search, CalendarClock, ChevronDown, Pencil, ClipboardList, Check, Share2 } from 'lucide-react';
import { api, ago, fmtDate, isOnline, colorFor, initials, plural } from '../lib/api.js';
import { Loader, Modal, Empty, Icon, useToast, EASE } from '../components/ui.jsx';
import { LESSONS, GAMES, byId } from '@shared/catalog.js';
import { GAME_COLORS } from '../games/colors.js';
import { LESSON_COLORS } from '../components/Cards.jsx';
import { Stat, Head, Status, Cell } from './Cabinet.jsx';

const TABS = [['students', 'Ученики', Users], ['tasks', 'Задания', ClipboardList], ['invite', 'Пригласить', UserPlus], ['settings', 'Настройки', Pencil]];
const colorOf = (a) => GAME_COLORS[a.kind === 'lesson' ? LESSON_COLORS[a.id] : a.color];

export default function ClassView() {
  const { id } = useParams();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') || 'students';
  const toast = useToast();
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');
  const load = () => api('/classes/' + id).then(setD).catch((e) => setErr(e.message));
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (err) return <Empty icon="AlertCircle" title={err} action={<Link to="/kabinet" className="btn btn-ghost">К списку классов</Link>} />;
  if (!d) return <Loader h={460} />;
  const online = d.members.filter((m) => isOnline(m.lastSeen)).length;

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <Link to="/kabinet" className="row muted" style={{ gap: 6, fontWeight: 700, fontSize: 14.5, width: 'fit-content' }}><ArrowLeft size={18} />Все классы</Link>
      <Head title={d.class.name} sub={`${d.members.length} ${plural(d.members.length, 'ученик', 'ученика', 'учеников')} · код ${d.class.code}`}>
        <span className="chip chip-mint" style={{ height: 34 }}><Status t={online ? Date.now() : 0} />{online} в сети</span>
      </Head>

      <div className="tabs" role="tablist">
        {TABS.map(([k, l, I]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={'tab' + (tab === k ? ' on' : '')} onClick={() => setSp(k === 'students' ? {} : { tab: k }, { replace: true })}>
            {tab === k && <motion.span layoutId="class-tab" className="tab-pill" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
            <span className="row" style={{ gap: 7 }}><I size={16} />{l}{k === 'tasks' && d.assignments.length > 0 && <span className="chip chip-brand" style={{ height: 20, padding: '0 7px', fontSize: 11.5 }}>{d.assignments.length}</span>}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .3, ease: EASE }}>
          {tab === 'students' && <StudentsTab d={d} online={online} goInvite={() => setSp({ tab: 'invite' })} />}
          {tab === 'tasks' && <TasksTab d={d} reload={load} toast={toast} />}
          {tab === 'invite' && <InviteTab d={d} reload={load} toast={toast} />}
          {tab === 'settings' && <SettingsTab d={d} reload={load} toast={toast} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------------- Ученики ----------------
function StudentsTab({ d, online, goInvite }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('name');
  const asg = d.assignments.slice(0, 8);
  const rows = useMemo(() => {
    const r = d.members.filter((m) => (m.name + m.login).toLowerCase().includes(q.toLowerCase()));
    const k = { name: (a, b) => a.name.localeCompare(b.name, 'ru'), progress: (a, b) => b.done - a.done || (b.avg ?? 0) - (a.avg ?? 0), seen: (a, b) => (b.lastSeen || 0) - (a.lastSeen || 0), points: (a, b) => b.points - a.points };
    return [...r].sort(k[sort]);
  }, [d, q, sort]);
  const allDone = d.members.filter((m) => m.assignments.length && m.assignments.every((x) => x.ratio != null)).length;
  const avgs = d.members.filter((m) => m.avg != null);
  const avg = avgs.length ? Math.round(avgs.reduce((s, m) => s + m.avg, 0) / avgs.length) : null;

  if (!d.members.length) return (
    <Empty icon="Users" title="В классе пока никого" text="Отправьте ученикам ссылку-приглашение или код класса — или добавьте их по логину и номеру телефона."
      action={<button className="btn btn-primary" onClick={goInvite}><UserPlus size={18} />Пригласить учеников</button>} />
  );

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div className="grid g-4" style={{ gap: 14 }}>
        <Stat icon={Users} label="Учеников" value={d.members.length} />
        <Stat icon={Wifi} label="Сейчас в сети" value={online} color="#0A7A57" bg="var(--mint-50)" sub="за последние 5 минут" />
        <Stat icon={CheckCircle2} label="Все задания" value={d.assignments.length ? `${allDone}/${d.members.length}` : '—'} sub="выполнили всё назначенное" color="#C98500" bg="var(--sun-50)" />
        <Stat icon={Trophy} label="Средний балл" value={avg == null ? '—' : avg + '%'} sub="по всем попыткам" color="var(--coral)" bg="var(--coral-50)" />
      </div>
      <div className="row between row-wrap" style={{ gap: 10 }}>
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <Search size={18} color="var(--muted)" style={{ position: 'absolute', left: 14, top: 15 }} />
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск ученика" style={{ paddingLeft: 42 }} />
        </div>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 'auto' }} aria-label="Сортировка">
          <option value="name">По имени</option><option value="progress">По прогрессу</option><option value="points">По баллам</option><option value="seen">По активности</option>
        </select>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Ученик</th><th>Был в сети</th><th>Курс</th><th>Баллы</th>
              {asg.map((a) => { const x = byId(a.activityId); return <th key={a.id} title={`${x?.title}${a.dueAt ? ' · до ' + fmtDate(a.dueAt) : ''}`} style={{ textAlign: 'center' }}><Icon name={x?.icon} size={16} /></th>; })}
            </tr>
          </thead>
          <tbody>
            {rows.map((m, i) => (
              <motion.tr key={m.id} className="clickable" onClick={() => nav(`/kabinet/klass/${d.class.id}/uchenik/${m.id}`)}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * .02 }}>
                <td>
                  <div className="row" style={{ gap: 12 }}>
                    <span className="avatar" style={{ width: 36, height: 36, borderRadius: 12, fontSize: 13, background: colorFor(m.login) }}>{initials(m.name)}</span>
                    <div style={{ whiteSpace: 'nowrap' }}><div style={{ fontWeight: 800 }}>{m.name}</div><div className="muted" style={{ fontSize: 12.5 }}>@{m.login}{m.grade ? ` · ${m.grade}` : ''}</div></div>
                  </div>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}><span className="row" style={{ gap: 8, fontWeight: 700, fontSize: 13.5, color: isOnline(m.lastSeen) ? '#0A7A57' : 'var(--ink-2)' }}><Status t={m.lastSeen} />{ago(m.lastSeen)}</span></td>
                <td style={{ minWidth: 130 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <div className="progress" style={{ flex: 1 }}><i style={{ width: (m.done / m.total) * 100 + '%', background: m.done === m.total ? 'var(--mint)' : undefined }} /></div>
                    <b style={{ fontSize: 13 }}>{m.done}/{m.total}</b>
                  </div>
                </td>
                <td><b>{m.points}</b></td>
                {asg.map((a) => <td key={a.id} style={{ textAlign: 'center' }}><Cell ratio={m.assignments.find((x) => x.id === a.id)?.ratio} /></td>)}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint">Колонки с иконками — последние назначенные задания: процент лучшего результата после назначения. Зелёный — засчитано (60 %+), жёлтый — нужно улучшить, «—» — не выполнено. Нажмите на ученика, чтобы увидеть подробности.</p>
    </div>
  );
}

// ---------------- Задания ----------------
function TasksTab({ d, reload, toast }) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState([]);
  const [due, setDue] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [exp, setExp] = useState(null);
  const [del, setDel] = useState(null);

  const assign = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = await api(`/classes/${d.class.id}/assignments`, { method: 'POST', body: { activityIds: sel, dueAt: due ? new Date(due + 'T23:59').getTime() : null, note } });
      toast(`Назначено: ${r.count} ${plural(r.count, 'задание', 'задания', 'заданий')}`);
      setOpen(false); setSel([]); setDue(''); setNote(''); reload();
    } catch (e2) { toast(e2.message, 'err'); } finally { setBusy(false); }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="row between row-wrap" style={{ gap: 10 }}>
        <p className="muted" style={{ fontWeight: 600 }}>Задание засчитывается, когда ученик проходит его после назначения.</p>
        <button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={18} />Назначить задание</button>
      </div>
      {!d.assignments.length ? (
        <Empty icon="ClipboardList" title="Заданий пока нет" text="Назначьте уроки и игры — ученики увидят их в своём кабинете, а вы — кто и как их выполнил." action={<button className="btn btn-soft" onClick={() => setOpen(true)}>Назначить первое задание</button>} />
      ) : d.assignments.map((a, i) => {
        const x = byId(a.activityId); if (!x) return null;
        const c = colorOf(x);
        const late = a.dueAt && a.dueAt < Date.now();
        const notDone = d.members.filter((m) => m.assignments.find((y) => y.id === a.id)?.ratio == null);
        const doneM = d.members.filter((m) => m.assignments.find((y) => y.id === a.id)?.ratio != null);
        const pct = d.members.length ? a.doneCount / d.members.length : 0;
        return (
          <motion.div key={a.id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .04 }} style={{ overflow: 'hidden' }}>
            <div className="row" style={{ gap: 14, padding: 16, cursor: 'pointer', flexWrap: 'wrap' }} onClick={() => setExp(exp === a.id ? null : a.id)}>
              <span style={{ width: 48, height: 48, borderRadius: 15, background: c.bg, color: c.fg, display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={x.icon} /></span>
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <div style={{ fontWeight: 800 }}>{x.title} <span className="muted" style={{ fontWeight: 700, fontSize: 13 }}>· {x.kind === 'lesson' ? 'урок' : 'игра'}</span></div>
                <div className="muted" style={{ fontSize: 13 }}>Назначено {fmtDate(a.createdAt)}{a.note ? ` · «${a.note}»` : ''}</div>
              </div>
              {a.dueAt && <span className={'chip ' + (late ? 'chip-danger' : 'chip-sun')}><CalendarClock size={14} />{late ? 'срок прошёл ' : 'до '}{fmtDate(a.dueAt)}</span>}
              <div style={{ width: 150 }}>
                <div className="row between" style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 6 }}><span className="muted">Выполнили</span><span>{a.doneCount}/{d.members.length}</span></div>
                <div className="progress"><motion.i initial={{ width: 0 }} animate={{ width: pct * 100 + '%' }} transition={{ duration: .8, ease: EASE }} style={pct === 1 ? { background: 'var(--mint)' } : {}} /></div>
              </div>
              <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setDel(a); }} aria-label="Удалить задание" title="Удалить задание"><Trash2 size={17} /></button>
              <motion.span animate={{ rotate: exp === a.id ? 180 : 0 }} style={{ color: 'var(--muted)' }}><ChevronDown size={20} /></motion.span>
            </div>
            <AnimatePresence>
              {exp === a.id && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: .35, ease: EASE }} style={{ overflow: 'hidden' }}>
                  <div className="grid g-2" style={{ gap: 16, padding: '4px 16px 18px', borderTop: '1px solid var(--line)' }}>
                    <div><div style={{ fontWeight: 800, fontSize: 13.5, margin: '12px 0 8px', color: 'var(--danger)' }}>Не выполнили ({notDone.length})</div>
                      <div className="row row-wrap" style={{ gap: 6 }}>{notDone.length ? notDone.map((m) => <span key={m.id} className="chip" style={{ background: 'var(--bg-2)', color: 'var(--ink-2)' }}>{m.name}</span>) : <span className="muted" style={{ fontSize: 14 }}>Все выполнили</span>}</div></div>
                    <div><div style={{ fontWeight: 800, fontSize: 13.5, margin: '12px 0 8px', color: '#0A7A57' }}>Выполнили ({doneM.length})</div>
                      <div className="row row-wrap" style={{ gap: 6 }}>{doneM.map((m) => { const r = m.assignments.find((y) => y.id === a.id).ratio; return <span key={m.id} className={'chip ' + (r >= .6 ? 'chip-mint' : 'chip-sun')}>{m.name} · {Math.round(r * 100)}%</span>; })}</div></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      <Modal open={open} onClose={() => setOpen(false)} title="Назначить задание" width={720}>
        <form onSubmit={assign} style={{ display: 'grid', gap: 18 }}>
          {[['Уроки', LESSONS], ['Игры', GAMES]].map(([t, list]) => (
            <div key={t}>
              <div className="row between" style={{ marginBottom: 10 }}>
                <b>{t}</b>
                <button type="button" className="btn btn-soft btn-sm" onClick={() => { const ids = list.map((x) => x.id); const all = ids.every((x) => sel.includes(x)); setSel((s) => (all ? s.filter((x) => !ids.includes(x)) : [...new Set([...s, ...ids])])); }}>
                  {list.every((x) => sel.includes(x.id)) ? 'Снять все' : 'Выбрать все'}
                </button>
              </div>
              <div className="grid g-2" style={{ gap: 8 }}>
                {list.map((x) => {
                  const on = sel.includes(x.id); const c = colorOf(x);
                  return (
                    <button type="button" key={x.id} className={'opt' + (on ? ' sel' : '')} style={{ padding: '10px 12px', fontSize: 14.5 }} onClick={() => setSel((s) => (on ? s.filter((y) => y !== x.id) : [...s, x.id]))}>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: c.bg, color: c.fg, display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={x.icon} size={17} /></span>
                      <span style={{ flex: 1 }}>{x.title}<span className="muted" style={{ display: 'block', fontSize: 12, fontWeight: 700 }}>{x.minutes} мин</span></span>
                      <span className="check-box" style={on ? { background: 'var(--brand)', borderColor: 'var(--brand)', color: '#fff' } : {}}>{on && <Check size={14} strokeWidth={3} />}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="grid g-2" style={{ gap: 12 }}>
            <label className="field"><span>Срок (необязательно)</span><input className="input" type="date" value={due} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDue(e.target.value)} /></label>
            <label className="field"><span>Комментарий</span><input className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder="Например, к классному часу" /></label>
          </div>
          <button className="btn btn-primary btn-lg btn-block" disabled={busy || !sel.length}>{busy ? 'Назначаем…' : sel.length ? `Назначить ${sel.length} ${plural(sel.length, 'задание', 'задания', 'заданий')}` : 'Выберите задания'}</button>
        </form>
      </Modal>

      <Modal open={!!del} onClose={() => setDel(null)} title="Удалить задание?">
        <p className="ink2">Задание «{del && byId(del.activityId)?.title}» пропадёт у учеников. Их результаты сохранятся.</p>
        <div className="row" style={{ gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setDel(null)}>Отмена</button>
          <button className="btn btn-danger" onClick={async () => { await api(`/classes/${d.class.id}/assignments/${del.id}`, { method: 'DELETE' }); setDel(null); toast('Задание удалено'); reload(); }}>Удалить</button>
        </div>
      </Modal>
    </div>
  );
}

// ---------------- Приглашение ----------------
function InviteTab({ d, reload, toast }) {
  const link = `${window.location.origin}/join/${d.class.code}`;
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const qr = useMemo(() => { const x = qrcode(0, 'M'); x.addData(link); x.make(); return x.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); }, [link]);
  const copy = (t, msg) => navigator.clipboard?.writeText(t).then(() => toast(msg)).catch(() => toast('Не удалось скопировать', 'err'));
  const msg = `Ребята, вступайте в наш класс «${d.class.name}» на платформе «Антидроп»: ${link}\nИли введите код класса: ${d.class.code}`;

  const add = async (e) => {
    e.preventDefault(); setBusy(true);
    try { const r = await api(`/classes/${d.class.id}/members`, { method: 'POST', body: { query: q } }); toast(`${r.user.name} добавлен(а) в класс`); setQ(''); reload(); }
    catch (e2) { toast(e2.message, 'err'); } finally { setBusy(false); }
  };

  return (
    <div className="grid g-2" style={{ gap: 18, alignItems: 'start' }}>
      <div className="card" style={{ padding: 26, display: 'grid', gap: 18 }}>
        <div>
          <div className="muted" style={{ fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.05em' }}>Код класса</div>
          <div className="row between" style={{ gap: 10 }}>
            <motion.div key={d.class.code} className="code-big" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{d.class.code}</motion.div>
            <button className="icon-btn" onClick={() => copy(d.class.code, 'Код скопирован')} aria-label="Скопировать код"><Copy size={20} /></button>
          </div>
        </div>
        <div className="row" style={{ gap: 18, alignItems: 'center' }}>
          <div style={{ width: 132, height: 132, padding: 10, borderRadius: 16, background: '#fff', boxShadow: 'inset 0 0 0 1.5px var(--line)', flex: 'none' }} dangerouslySetInnerHTML={{ __html: qr }} />
          <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
            <b>QR-код для доски</b>
            <span className="muted" style={{ fontSize: 14 }}>Покажите его на проекторе — ученики отсканируют камерой телефона.</span>
          </div>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Ссылка-приглашение</span>
          <div className="row" style={{ gap: 8 }}>
            <input className="input" readOnly value={link} onFocus={(e) => e.target.select()} style={{ fontSize: 14 }} />
            <button className="btn btn-primary" onClick={() => copy(link, 'Ссылка скопирована')}><Copy size={17} /></button>
          </div>
        </div>
        <div className="row row-wrap" style={{ gap: 8 }}>
          <button className="btn btn-soft btn-sm" onClick={() => copy(msg, 'Сообщение для чата скопировано')}><Share2 size={16} />Скопировать сообщение для чата</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirm(true)}><RefreshCw size={16} />Новый код</button>
        </div>
      </div>

      <div className="card" style={{ padding: 26, display: 'grid', gap: 14 }}>
        <div className="row" style={{ gap: 12 }}><span className="num-badge" style={{ background: 'var(--mint-50)', color: '#0A7A57' }}><UserPlus size={18} /></span><b style={{ fontSize: 18 }}>Добавить вручную</b></div>
        <p className="ink2" style={{ fontSize: 15 }}>Если ученик уже зарегистрирован, найдите его по логину или номеру телефона, который он указал при регистрации.</p>
        <form onSubmit={add} className="row" style={{ gap: 8 }}>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ivan.petrov или 8 900 123-45-67" required />
          <button className="btn btn-primary" disabled={busy || q.trim().length < 3}>{busy ? '…' : 'Добавить'}</button>
        </form>
        <div className="divider" />
        <div style={{ display: 'grid', gap: 8, fontSize: 14.5 }} className="ink2">
          <b style={{ color: 'var(--ink)' }}>Как ученику вступить самому</b>
          <span>1. Зарегистрироваться на сайте как ученик.</span>
          <span>2. Открыть ссылку-приглашение или ввести код в кабинете.</span>
          <span>3. Готово — задания класса появятся в кабинете.</span>
        </div>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Создать новый код?">
        <p className="ink2">Старая ссылка и код перестанут работать. Ученики, которые уже в классе, останутся в нём.</p>
        <div className="row" style={{ gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Отмена</button>
          <button className="btn btn-primary" onClick={async () => { await api('/classes/' + d.class.id, { method: 'PATCH', body: { regenerateCode: true } }); setConfirm(false); toast('Новый код создан'); reload(); }}>Создать</button>
        </div>
      </Modal>
    </div>
  );
}

// ---------------- Настройки ----------------
function SettingsTab({ d, reload, toast }) {
  const nav = useNavigate();
  const [name, setName] = useState(d.class.name);
  const [del, setDel] = useState(false);
  return (
    <div className="grid g-2" style={{ gap: 18, alignItems: 'start' }}>
      <form className="card" style={{ padding: 26, display: 'grid', gap: 14 }} onSubmit={async (e) => { e.preventDefault(); await api('/classes/' + d.class.id, { method: 'PATCH', body: { name } }); toast('Название сохранено'); reload(); }}>
        <b style={{ fontSize: 18 }}>Название класса</b>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
        <button className="btn btn-primary" style={{ width: 'fit-content' }} disabled={!name.trim() || name === d.class.name}>Сохранить</button>
      </form>
      <div className="card" style={{ padding: 26, display: 'grid', gap: 14, borderColor: '#F8C9D3' }}>
        <b style={{ fontSize: 18, color: 'var(--danger)' }}>Удалить класс</b>
        <p className="ink2" style={{ fontSize: 15 }}>Класс и задания будут удалены. Аккаунты учеников и их результаты сохранятся.</p>
        <button className="btn btn-danger" style={{ width: 'fit-content' }} onClick={() => setDel(true)}><Trash2 size={17} />Удалить класс</button>
      </div>
      <Modal open={del} onClose={() => setDel(false)} title={`Удалить класс «${d.class.name}»?`}>
        <p className="ink2">Это действие нельзя отменить.</p>
        <div className="row" style={{ gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={() => setDel(false)}>Отмена</button>
          <button className="btn btn-danger" onClick={async () => { await api('/classes/' + d.class.id, { method: 'DELETE' }); toast('Класс удалён'); nav('/kabinet'); }}>Удалить навсегда</button>
        </div>
      </Modal>
    </div>
  );
}
