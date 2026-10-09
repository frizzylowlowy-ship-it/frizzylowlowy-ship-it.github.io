import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import qrcode from 'qrcode-generator';
import { Printer, ArrowLeft } from 'lucide-react';
import { api, fmtDateFull } from '../lib/api.js';
import { Loader, EASE } from '../components/ui.jsx';
import { Mark } from '../components/Logo.jsx';

export default function CertificatePage() {
  const { code } = useParams();
  const [c, setC] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/certificates/' + encodeURIComponent(code)).then((d) => setC(d.certificate)).catch((e) => setErr(e.message)); }, [code]);
  useEffect(() => {
    const st = document.createElement('style');
    st.textContent = '@page { size: A4 landscape; margin: 0; }';
    document.head.appendChild(st);
    return () => st.remove();
  }, []);
  const verifyUrl = `${window.location.origin}/proverka/${code}`;
  const qr = useMemo(() => {
    const q = qrcode(0, 'M'); q.addData(verifyUrl); q.make();
    return q.createSvgTag({ cellSize: 3, margin: 0, scalable: true });
  }, [verifyUrl]);

  return (
    <div style={{ minHeight: '100vh', background: '#E9EAF3', padding: '24px 16px 48px' }} className="cert-page">
      <div className="no-print row between" style={{ maxWidth: 1123, margin: '0 auto 18px', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/kabinet" className="btn btn-ghost btn-sm"><ArrowLeft size={16} />В кабинет</Link>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()} disabled={!c}><Printer size={16} />Распечатать / сохранить PDF</button>
      </div>
      {err && <div className="container" style={{ maxWidth: 600 }}><div className="form-error">{err}</div></div>}
      {!c && !err && <div className="container" style={{ maxWidth: 900 }}><Loader h={500} /></div>}
      {c && (
        <div style={{ overflowX: 'auto' }}>
          <motion.div className="cert" initial={{ opacity: 0, y: 30, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: .9, ease: EASE }}>
            <svg className="cert-bg" viewBox="0 0 1123 794" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#6F61EC" /><stop offset="1" stopColor="#8A7EF2" /></linearGradient>
              </defs>
              <circle cx="1040" cy="90" r="160" fill="#EFEDFF" />
              <circle cx="70" cy="760" r="140" fill="#FFF6DB" />
              <path d="M 0 640 Q 280 560 560 640 T 1123 620 L 1123 794 L 0 794 Z" fill="#F6F7FB" />
              <rect x="22" y="22" width="1079" height="750" rx="26" fill="none" stroke="url(#cg)" strokeWidth="6" />
              <rect x="40" y="40" width="1043" height="714" rx="18" fill="none" stroke="#E1DDFF" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
            </svg>
            <div style={{ position: 'relative', height: '100%', padding: '70px 90px 60px', display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
              <div className="row between">
                <div className="row" style={{ gap: 12 }}><Mark size={46} /><span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 24 }}>антидроп</span></div>
                <span style={{ fontWeight: 800, color: '#85849E', letterSpacing: '.08em', fontSize: 13 }}>№ {c.code}</span>
              </div>
              <div style={{ display: 'grid', alignContent: 'center', justifyItems: 'center', textAlign: 'center', gap: 14 }}>
                <div style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 92, letterSpacing: '.06em', lineHeight: 1 }} className="grad-text">ГРАМОТА</div>
                <div style={{ fontWeight: 700, color: '#85849E', fontSize: 18 }}>награждается</div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 44, letterSpacing: '-.01em', marginTop: 4 }}>{c.name}</div>
                {(c.school || c.grade) && <div style={{ fontWeight: 700, fontSize: 18, color: '#48476A' }}>{[c.grade && `${c.grade} класс`, c.school].filter(Boolean).join(' · ')}</div>}
                <div style={{ width: 120, height: 4, borderRadius: 4, background: 'var(--accent)', margin: '10px 0' }} />
                <div style={{ fontSize: 22, fontWeight: 700, maxWidth: 720, lineHeight: 1.35 }}>{c.title}</div>
              </div>
              <div className="row between" style={{ alignItems: 'flex-end' }}>
                <div style={{ display: 'grid', gap: 4 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{c.issuer || 'Платформа «Антидроп»'}</div>
                  <div style={{ width: 220, height: 1.5, background: '#2B2A3D' }} />
                  <div style={{ fontSize: 13, color: '#85849E', fontWeight: 700 }}>{c.issuer ? 'Учитель' : 'Выдана автоматически за прохождение курса'}</div>
                </div>
                <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, color: '#48476A' }}>{fmtDateFull(c.createdAt)}</div>
                <div className="row" style={{ gap: 12 }}>
                  <div style={{ textAlign: 'right', fontSize: 12, color: '#85849E', fontWeight: 700, lineHeight: 1.4 }}>Проверить подлинность:<br />антидроп.рф/proverka</div>
                  <div style={{ width: 84, height: 84, padding: 6, background: '#fff', borderRadius: 10, boxShadow: '0 0 0 1px #E5E6F0' }} dangerouslySetInnerHTML={{ __html: qr }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
