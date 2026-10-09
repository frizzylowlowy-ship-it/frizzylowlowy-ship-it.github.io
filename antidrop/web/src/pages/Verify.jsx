import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, Search, Printer } from 'lucide-react';
import AuthLayout from './AuthLayout.jsx';
import { api, fmtDateFull } from '../lib/api.js';
import { Loader, EASE } from '../components/ui.jsx';

// Проверка подлинности грамоты по номеру
export default function Verify() {
  const { code } = useParams();
  const nav = useNavigate();
  const [input, setInput] = useState(code || 'AD-');
  const [cert, setCert] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    setCert(null); setErr('');
    if (code) api('/certificates/' + encodeURIComponent(code)).then((d) => setCert(d.certificate)).catch((e) => setErr(e.message));
  }, [code]);

  return (
    <AuthLayout title="Проверка грамоты" sub="Введите номер с грамоты — например, AD-7KQ2MX" art="senior">
      <form onSubmit={(e) => { e.preventDefault(); nav('/proverka/' + input.trim().toUpperCase()); }} className="row" style={{ gap: 10 }}>
        <input className="input" value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} maxLength={12} style={{ fontFamily: 'var(--display)', letterSpacing: '.1em' }} aria-label="Номер грамоты" />
        <button className="btn btn-primary" disabled={input.length < 6}><Search size={18} />Проверить</button>
      </form>
      <div style={{ marginTop: 20 }}>
        {code && !cert && !err && <Loader h={120} />}
        {err && <div className="form-error">{err}</div>}
        {cert && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ease: EASE }}
            style={{ padding: 22, borderRadius: 22, background: 'var(--mint-50)', display: 'grid', gap: 10 }}>
            <div className="row" style={{ gap: 10, color: '#0A7A57', fontWeight: 800, fontSize: 18 }}><BadgeCheck size={24} />Грамота подлинная</div>
            <div style={{ fontWeight: 800, fontSize: 22 }}>{cert.name}</div>
            <div className="ink2">{cert.title}</div>
            <div className="muted" style={{ fontSize: 14 }}>{[cert.school, cert.grade && `${cert.grade} класс`].filter(Boolean).join(', ')}</div>
            <div className="muted" style={{ fontSize: 14 }}>Выдана {fmtDateFull(cert.createdAt)}{cert.issuer ? ` · ${cert.issuer}` : ' · автоматически за прохождение курса'}</div>
            <Link to={`/gramota/${cert.code}`} className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }}><Printer size={16} />Открыть грамоту</Link>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}
