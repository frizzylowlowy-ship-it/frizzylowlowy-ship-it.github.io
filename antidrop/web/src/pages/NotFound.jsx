import { Link } from 'react-router-dom';
import { IlloSearch } from '../components/Illo.jsx';

export default function NotFound() {
  return (
    <div className="page container" style={{ display: 'grid', placeItems: 'center', textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ display: 'grid', gap: 16, justifyItems: 'center' }}>
        <IlloSearch size={220} />
        <div style={{ fontFamily: 'var(--condensed)', fontWeight: 700, fontSize: 96, lineHeight: 1, color: 'var(--brand)' }}>404</div>
        <h1 className="h3">Такой страницы нет</h1>
        <p className="muted" style={{ maxWidth: 420 }}>Возможно, ссылка устарела или в ней опечатка.</p>
        <Link to="/" className="btn btn-primary">На главную</Link>
      </div>
    </div>
  );
}
