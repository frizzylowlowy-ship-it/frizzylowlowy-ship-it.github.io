import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import AuthLayout, { Field } from './AuthLayout.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useToast } from '../components/ui.jsx';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const toast = useToast();
  const [f, setF] = useState({ login: '', password: '' });
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const u = await login(f.login.trim(), f.password);
      toast(`Привет, ${u.name.split(' ')[0]}!`);
      nav(sp.get('next') || (u.role === 'admin' ? '/admin' : '/kabinet'));
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <AuthLayout title="Вход" sub="Для учеников, учителей и администраторов">
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <Field label="Логин или номер телефона">
          <input className="input" autoFocus autoComplete="username" value={f.login} onChange={(e) => setF({ ...f, login: e.target.value })} placeholder="ivan.petrov или +7 900 000-00-00" required />
        </Field>
        <Field label="Пароль">
          <div style={{ position: 'relative' }}>
            <input className="input" type={show ? 'text' : 'password'} autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required style={{ paddingRight: 48 }} />
            <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label={show ? 'Скрыть пароль' : 'Показать пароль'} style={{ position: 'absolute', right: 4, top: 6 }}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </Field>
        {err && <div className="form-error">{err}</div>}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}><LogIn size={20} />{busy ? 'Входим…' : 'Войти'}</button>
        <p className="muted center" style={{ fontSize: 14.5 }}>Нет аккаунта? <Link to={'/registraciya' + (sp.get('next') ? '?next=' + encodeURIComponent(sp.get('next')) : '')} style={{ color: 'var(--brand)', fontWeight: 800 }}>Зарегистрироваться</Link></p>
        <p className="hint center">Забыли пароль? Ученику его может сбросить учитель через администратора сайта.</p>
      </form>
    </AuthLayout>
  );
}
