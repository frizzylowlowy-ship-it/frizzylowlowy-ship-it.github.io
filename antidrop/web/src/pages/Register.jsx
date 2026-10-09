import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Backpack, Check, Eye, EyeOff } from 'lucide-react';
import AuthLayout, { Field } from './AuthLayout.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useToast, EASE } from '../components/ui.jsx';

const TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
const translit = (s) => s.toLowerCase().split('').map((ch) => TR[ch] ?? ch).join('');
const suggestLogin = (name) => {
  const [a = '', b = ''] = name.trim().split(/\s+/);
  return translit(b ? `${a}.${b}` : a).replace(/[^a-z0-9_.-]/g, '').slice(0, 24);
};

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const toast = useToast();
  const [role, setRole] = useState(sp.get('role') === 'teacher' ? 'teacher' : 'student');
  const [f, setF] = useState({ name: '', login: '', password: '', phone: '', school: '', grade: '' });
  const [loginTouched, setLoginTouched] = useState(false);
  const [agree, setAgree] = useState(false);
  const [show, setShow] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => {
    const v = e.target.value;
    setF((x) => ({ ...x, [k]: v, ...(k === 'name' && !loginTouched ? { login: suggestLogin(v) } : {}) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!agree) return setErr('Нужно согласие на обработку персональных данных');
    setErr(''); setBusy(true);
    try {
      const u = await register({ ...f, role, phone: f.phone || undefined, grade: role === 'student' ? f.grade : '' });
      toast('Аккаунт создан! Добро пожаловать');
      nav(sp.get('next') || (u.role === 'teacher' ? '/kabinet?welcome=1' : '/kabinet'));
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <AuthLayout title="Регистрация" sub="Бесплатно. Займёт меньше минуты." art={role === 'teacher' ? 'teacher' : 'kid'}>
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <div className="grid g-2" style={{ gap: 10 }}>
          {[['student', Backpack, 'Я ученик', 'Игры, уроки, задания от учителя'], ['teacher', GraduationCap, 'Я учитель', 'Классы, задания, статистика']].map(([k, I, t, d]) => (
            <button type="button" key={k} className={'role-card' + (role === k ? ' on' : '')} onClick={() => setRole(k)}>
              <div className="row between"><I size={24} color={role === k ? 'var(--brand)' : 'var(--muted)'} />{role === k && <motion.span layoutId="role-check" style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--brand)', color: '#fff', display: 'grid', placeItems: 'center' }}><Check size={14} strokeWidth={3} /></motion.span>}</div>
              <b>{t}</b><span className="muted" style={{ fontSize: 13 }}>{d}</span>
            </button>
          ))}
        </div>

        <Field label={role === 'teacher' ? 'Фамилия, имя и отчество' : 'Имя и фамилия'}>
          <input className="input" value={f.name} onChange={set('name')} placeholder={role === 'teacher' ? 'Иванова Мария Петровна' : 'Иван Петров'} required autoComplete="name" />
        </Field>
        <div className="grid g-2" style={{ gap: 12 }}>
          <Field label="Логин" hint="Латиница, цифры, точка">
            <input className="input" value={f.login} onChange={(e) => { setLoginTouched(true); setF({ ...f, login: e.target.value.toLowerCase() }); }} required autoComplete="username" pattern="[a-z0-9_.\-]{3,32}" />
          </Field>
          <Field label="Пароль" hint="Не короче 8 символов">
            <div style={{ position: 'relative' }}>
              <input className="input" type={show ? 'text' : 'password'} value={f.password} onChange={set('password')} required minLength={8} autoComplete="new-password" style={{ paddingRight: 44 }} />
              <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label="Показать пароль" style={{ position: 'absolute', right: 2, top: 6 }}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
            </div>
          </Field>
        </div>
        <Field label="Телефон (необязательно)" hint={role === 'student' ? 'По номеру учитель сможет добавить тебя в класс. Можно войти по номеру вместо логина.' : 'Можно будет входить по номеру вместо логина.'}>
          <input className="input" type="tel" value={f.phone} onChange={set('phone')} placeholder="+7 900 000-00-00" autoComplete="tel" />
        </Field>
        <AnimatePresence initial={false}>
          <motion.div key={role} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: .35, ease: EASE }} className={role === 'student' ? 'grid g-2' : 'grid'} style={{ gap: 12, overflow: 'hidden' }}>
            <Field label="Школа"><input className="input" value={f.school} onChange={set('school')} placeholder="МБОУ СОШ № 4" /></Field>
            {role === 'student' && <Field label="Класс"><input className="input" value={f.grade} onChange={set('grade')} placeholder="8 Б" maxLength={10} /></Field>}
          </motion.div>
        </AnimatePresence>
        <label className="row" style={{ gap: 12, alignItems: 'flex-start', cursor: 'pointer', fontSize: 14 }}>
          <span className={'check-box' + (agree ? ' on' : '')} style={{ marginTop: 0 }}>{agree && <Check size={15} strokeWidth={3} />}</span>
          <input type="checkbox" className="visually-hidden" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
          <span className="ink2">Согласен(на) на обработку персональных данных для работы на платформе. {role === 'student' && 'Если мне меньше 14 лет — регистрируюсь с согласия родителей.'}</span>
        </label>
        {err && <div className="form-error">{err}</div>}
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Создаём…' : 'Создать аккаунт'}</button>
        <p className="muted center" style={{ fontSize: 14.5 }}>Уже есть аккаунт? <Link to={'/voiti' + (sp.get('next') ? '?next=' + encodeURIComponent(sp.get('next')) : '')} style={{ color: 'var(--brand)', fontWeight: 800 }}>Войти</Link></p>
      </form>
    </AuthLayout>
  );
}
