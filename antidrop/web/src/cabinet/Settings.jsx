import { useState } from 'react';
import { Save, KeyRound } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth, ROLE_LABEL } from '../lib/auth.jsx';
import { useToast } from '../components/ui.jsx';
import { Head } from './Cabinet.jsx';

export default function Settings() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: user.name, school: user.school || '', grade: user.grade || '' });
  const [p, setP] = useState({ password: '', newPassword: '', repeat: '' });
  const [err, setErr] = useState('');

  const save = async (e) => {
    e.preventDefault();
    try { const d = await api('/me', { method: 'PATCH', body: f }); setUser(d.user); toast('Профиль сохранён'); }
    catch (e2) { toast(e2.message, 'err'); }
  };
  const changePass = async (e) => {
    e.preventDefault(); setErr('');
    if (p.newPassword !== p.repeat) return setErr('Пароли не совпадают');
    try { await api('/me', { method: 'PATCH', body: { ...f, password: p.password, newPassword: p.newPassword } }); setP({ password: '', newPassword: '', repeat: '' }); toast('Пароль изменён'); }
    catch (e2) { setErr(e2.message); }
  };

  return (
    <div>
      <Head title="Настройки" sub={`${ROLE_LABEL[user.role]} · @${user.login}${user.phone ? ' · ' + user.phone : ''}`} />
      <div className="grid g-2" style={{ gap: 18, alignItems: 'start' }}>
        <form className="card" style={{ padding: 26, display: 'grid', gap: 14 }} onSubmit={save}>
          <b style={{ fontSize: 18 }}>Профиль</b>
          <label className="field"><span>Имя и фамилия</span><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required minLength={2} maxLength={80} /></label>
          <label className="field"><span>Школа</span><input className="input" value={f.school} onChange={(e) => setF({ ...f, school: e.target.value })} maxLength={120} /></label>
          {user.role === 'student' && <label className="field"><span>Класс</span><input className="input" value={f.grade} onChange={(e) => setF({ ...f, grade: e.target.value })} maxLength={10} /></label>}
          <button className="btn btn-primary" style={{ width: 'fit-content' }}><Save size={17} />Сохранить</button>
        </form>
        <form className="card" style={{ padding: 26, display: 'grid', gap: 14 }} onSubmit={changePass}>
          <b style={{ fontSize: 18 }}>Смена пароля</b>
          <label className="field"><span>Текущий пароль</span><input className="input" type="password" autoComplete="current-password" value={p.password} onChange={(e) => setP({ ...p, password: e.target.value })} required /></label>
          <label className="field"><span>Новый пароль</span><input className="input" type="password" autoComplete="new-password" minLength={8} value={p.newPassword} onChange={(e) => setP({ ...p, newPassword: e.target.value })} required /></label>
          <label className="field"><span>Повторите новый пароль</span><input className="input" type="password" autoComplete="new-password" value={p.repeat} onChange={(e) => setP({ ...p, repeat: e.target.value })} required /></label>
          {err && <div className="form-error">{err}</div>}
          <button className="btn btn-dark" style={{ width: 'fit-content' }}><KeyRound size={17} />Изменить пароль</button>
        </form>
      </div>
    </div>
  );
}
