import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Users, ClipboardList, KeyRound, ArrowRight, Presentation, Link2, LineChart, School } from 'lucide-react';
import { api, plural } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { Loader, Modal, useToast, Icon, EASE } from '../components/ui.jsx';
import { IlloBoard } from '../components/Illo.jsx';
import { MATERIALS } from '../content/materials.js';
import { GAME_COLORS } from '../games/colors.js';
import { Stat, Head } from './Cabinet.jsx';

const TINTS = ['violet', 'teal', 'coral', 'blue', 'amber', 'pink', 'indigo'];

export default function TeacherHome() {
  const { user } = useAuth();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();
  const [classes, setClasses] = useState(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => api('/classes').then((d) => setClasses(d.classes)).catch((e) => toast(e.message, 'err'));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const create = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = await api('/classes', { method: 'POST', body: { name } });
      toast(`Класс «${name}» создан`);
      nav(`/kabinet/klass/${r.id}?tab=invite`);
    } catch (e2) { toast(e2.message, 'err'); } finally { setBusy(false); }
  };

  if (!classes) return <Loader h={420} />;
  const students = classes.reduce((s, c) => s + c.members, 0);
  const tasks = classes.reduce((s, c) => s + c.assignments, 0);
  const fresh = sp.get('welcome') || classes.length === 0;

  return (
    <div style={{ display: 'grid', gap: 28 }}>
      <Head title="Мои классы" sub={`${user.name}${user.school ? ' · ' + user.school : ''}`}>
        <button className="btn btn-primary" onClick={() => setOpen(true)}><Plus size={18} />Создать класс</button>
      </Head>

      {fresh && (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, ease: EASE }} className="card"
          style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', background: 'var(--bg)', border: 0 }}>
          <div style={{ padding: 28, display: 'grid', gap: 16 }}>
            <h2 className="h3">Начните за 3 шага</h2>
            {[[School, 'Создайте класс', 'Например, «8 Б». Классов может быть сколько угодно.'], [Link2, 'Пригласите учеников', 'Отправьте ссылку или код в чат класса — или добавьте по логину и телефону.'], [ClipboardList, 'Назначьте задания', 'Уроки и игры с дедлайном — и следите за результатами.']].map(([I, t, d], i) => (
              <div key={t} className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
                <span className="num-badge" style={{ background: '#fff', color: 'var(--brand)', boxShadow: 'var(--sh-1)' }}><I size={18} /></span>
                <div><b>{i + 1}. {t}</b><div className="muted" style={{ fontSize: 14.5 }}>{d}</div></div>
              </div>
            ))}
            <button className="btn btn-primary" style={{ width: 'fit-content' }} onClick={() => setOpen(true)}><Plus size={18} />Создать первый класс</button>
          </div>
          <div className="hide-m" style={{ alignSelf: 'center', padding: '0 30px' }}><IlloBoard size={220} /></div>
        </motion.section>
      )}

      {classes.length > 0 && (
        <>
          <div className="grid g-3" style={{ gap: 16 }}>
            <Stat icon={School} label="Классов" value={classes.length} />
            <Stat icon={Users} label="Учеников" value={students} color="#0A7A57" bg="var(--mint-50)" />
            <Stat icon={ClipboardList} label="Заданий" value={tasks} color="#C98500" bg="var(--sun-50)" />
          </div>
          <div className="grid g-3" style={{ gap: 16 }}>
            {classes.map((c, i) => {
              const t = GAME_COLORS[TINTS[i % TINTS.length]];
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05, duration: .5, ease: EASE }}>
                  <Link to={`/kabinet/klass/${c.id}`} className="card card-hover" style={{ display: 'block', overflow: 'hidden' }}>
                    <div style={{ background: t.bg, padding: '22px 22px 18px', position: 'relative' }}>
                      <div style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 34, color: t.fg }}>{c.name}</div>
                      <div className="row" style={{ gap: 6, marginTop: 6, fontWeight: 800, fontSize: 13, color: t.fg, opacity: .8 }}><KeyRound size={14} />{c.code}</div>
                    </div>
                    <div className="row between" style={{ padding: '16px 22px' }}>
                      <span className="row muted" style={{ gap: 14, fontSize: 14, fontWeight: 700 }}>
                        <span className="row" style={{ gap: 5 }}><Users size={15} />{c.members} {plural(c.members, 'ученик', 'ученика', 'учеников')}</span>
                        <span className="row" style={{ gap: 5 }}><ClipboardList size={15} />{c.assignments}</span>
                      </span>
                      <ArrowRight size={18} color="var(--muted)" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
            <button onClick={() => setOpen(true)} className="card card-hover" style={{ minHeight: 150, border: '2px dashed var(--line-2)', boxShadow: 'none', background: 'transparent', display: 'grid', placeItems: 'center', color: 'var(--muted)', fontWeight: 800 }}>
              <span className="row" style={{ gap: 8 }}><Plus size={20} />Новый класс</span>
            </button>
          </div>
        </>
      )}

      <section>
        <div className="row between" style={{ marginBottom: 14 }}>
          <h2 className="h3" style={{ fontSize: 21 }}>Готовые занятия</h2>
          <Link to="/uchitelyam" className="row" style={{ gap: 6, fontWeight: 800, color: 'var(--brand)', fontSize: 14.5 }}>Все материалы <ArrowRight size={16} /></Link>
        </div>
        <div className="grid g-3" style={{ gap: 12 }}>
          {MATERIALS.slice(0, 3).map((m) => {
            const c = GAME_COLORS[m.color];
            return (
              <Link key={m.id} to={`/uchitelyam/${m.id}`} className="card card-hover row" style={{ padding: 16, gap: 14 }}>
                <span style={{ width: 46, height: 46, borderRadius: 14, background: c.bg, color: c.fg, display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={m.icon} /></span>
                <div><b style={{ fontSize: 15 }}>{m.title}</b><div className="muted" style={{ fontSize: 13 }}>{m.format} · {m.minutes} мин</div></div>
              </Link>
            );
          })}
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)} title="Новый класс">
        <form onSubmit={create} style={{ display: 'grid', gap: 16 }}>
          <label className="field"><span>Название</span><input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Например, 8 Б" maxLength={60} required /></label>
          <p className="hint">После создания вы получите ссылку и код для приглашения учеников.</p>
          <button className="btn btn-primary btn-block" disabled={busy || !name.trim()}>{busy ? 'Создаём…' : 'Создать'}</button>
        </form>
      </Modal>
    </div>
  );
}
