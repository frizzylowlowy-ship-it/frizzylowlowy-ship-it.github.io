import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import Logo from './Logo.jsx';

const COLS = [
  { title: 'Платформа', links: [['/uchenikam', 'Ученикам'], ['/igry', 'Игры и уроки'], ['/uchitelyam', 'Учителям'], ['/roditelyam', 'Родителям']] },
  { title: 'Проект', links: [['/o-proekte', 'О проекте'], ['/o-proekte#istochniki', 'Источники'], ['/proverka', 'Проверить грамоту']] },
  { title: 'Аккаунт', links: [['/registraciya', 'Регистрация'], ['/voiti', 'Вход'], ['/join', 'Вступить в класс']] },
];

export default function Footer() {
  return (
    <footer className="no-print" style={{ background: '#fff', marginTop: 40 }}>
      <div className="container">
        <div style={{ height: 1, background: 'var(--line)' }} />
        <div className="footer-grid" style={{ padding: '48px 0 36px' }}>
          <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
            <Logo size={32} />
            <p className="muted" style={{ maxWidth: 320, fontSize: 14 }}>
              Образовательная платформа о финансовой безопасности для школьников, учителей и родителей.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title} style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{c.title}</div>
              {c.links.map(([to, l]) => <Link key={to} to={to} className="foot-link">{l}</Link>)}
            </div>
          ))}
          <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Если нужна помощь</div>
            <Hot num="8-800-2000-122" text="Детский телефон доверия, бесплатно" href="tel:88002000122" />
            <Hot num="102" text="Полиция" href="tel:102" />
            <Hot num="300" text="Банк России, с мобильного" href="tel:300" />
          </div>
        </div>
        <div className="row between row-wrap" style={{ gap: 12, fontSize: 13, color: 'var(--muted)', padding: '20px 0 32px', borderTop: '1px solid var(--line)' }}>
          <span>© {new Date().getFullYear()} «Антидроп». Команда «Бетонный файрвол», МБОУ СОШ № 4 г. Большой Камень</span>
          <span>Не является официальным ресурсом государственных органов</span>
        </div>
      </div>
    </footer>
  );
}

function Hot({ num, text, href }) {
  return (
    <a href={href} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--brand-50)', display: 'grid', placeItems: 'center', flex: 'none' }}><Phone size={15} color="var(--brand)" /></span>
      <span><b style={{ display: 'block', fontSize: 15 }}>{num}</b><span className="muted" style={{ fontSize: 13 }}>{text}</span></span>
    </a>
  );
}
