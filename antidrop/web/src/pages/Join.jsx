import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, School, UserRound, ArrowRight, KeyRound } from 'lucide-react';
import AuthLayout from './AuthLayout.jsx';
import { api, plural } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import { useToast, Loader, EASE } from '../components/ui.jsx';
import { Confetti } from '../games/GameShell.jsx';

export default function Join() {
  const { code } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [cls, setCls] = useState(null);
  const [err, setErr] = useState('');
  const [input, setInput] = useState(code || '');
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!code) return;
    setCls(null); setErr('');
    api('/join/' + encodeURIComponent(code)).then((d) => setCls(d.class)).catch((e) => setErr(e.message));
  }, [code]);

  const join = async () => {
    setBusy(true);
    try {
      await api('/join/' + encodeURIComponent(code), { method: 'POST', body: {} });
      setJoined(true);
      toast(`Ты в классе «${cls.name}»`);
      setTimeout(() => nav('/kabinet'), 1800);
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  if (!code) {
    return (
      <AuthLayout title="Вступить в класс" sub="Введи код, который дал учитель">
        <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) nav('/join/' + input.trim().toUpperCase()); }} style={{ display: 'grid', gap: 14 }}>
          <input className="input" autoFocus value={input} onChange={(e) => setInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} maxLength={8} placeholder="ABC123"
            style={{ height: 68, fontWeight: 700, fontSize: 30, letterSpacing: '.3em', textAlign: 'center' }} aria-label="Код класса" />
          <button className="btn btn-primary btn-lg btn-block" disabled={input.length < 4}><KeyRound size={20} />Продолжить</button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={joined ? 'Готово!' : 'Приглашение в класс'} sub={joined ? 'Переходим в кабинет…' : `Код ${code.toUpperCase()}`}>
      {joined && <Confetti />}
      {!cls && !err && <Loader h={140} />}
      {err && !cls && (
        <div style={{ display: 'grid', gap: 14 }}>
          <div className="form-error">{err}</div>
          <Link to="/join" className="btn btn-ghost">Ввести другой код</Link>
        </div>
      )}
      {cls && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ease: EASE }} style={{ display: 'grid', gap: 18 }}>
          <div style={{ padding: 22, borderRadius: 22, background: 'var(--brand-50)', display: 'grid', gap: 12 }}>
            <div style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 40, color: 'var(--brand-700)' }}>{cls.name}</div>
            <div className="row" style={{ gap: 10, fontWeight: 700 }}><UserRound size={18} color="var(--brand)" />{cls.teacher}</div>
            {cls.school && <div className="row" style={{ gap: 10, fontWeight: 700 }}><School size={18} color="var(--brand)" />{cls.school}</div>}
            <div className="row" style={{ gap: 10, fontWeight: 700 }}><Users size={18} color="var(--brand)" />{cls.members} {plural(cls.members, 'ученик', 'ученика', 'учеников')}</div>
          </div>
          {err && <div className="form-error">{err}</div>}
          {user === undefined ? null : !user ? (
            <div style={{ display: 'grid', gap: 10 }}>
              <p className="ink2">Чтобы вступить, зарегистрируйся как ученик или войди в свой аккаунт.</p>
              <Link to={`/registraciya?next=/join/${code}`} className="btn btn-primary btn-lg btn-block">Зарегистрироваться <ArrowRight size={20} /></Link>
              <Link to={`/voiti?next=/join/${code}`} className="btn btn-ghost btn-lg btn-block">У меня есть аккаунт</Link>
            </div>
          ) : user.role !== 'student' ? (
            <p className="ink2">Это ссылка-приглашение для учеников. Учитель и администратор не могут вступить в класс.</p>
          ) : !joined && (
            <button className="btn btn-primary btn-lg btn-block" onClick={join} disabled={busy}>{busy ? 'Вступаем…' : `Вступить как ${user.name}`}</button>
          )}
        </motion.div>
      )}
    </AuthLayout>
  );
}
