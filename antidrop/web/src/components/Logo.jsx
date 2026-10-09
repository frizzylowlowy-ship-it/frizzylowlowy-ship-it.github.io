// Знак: щит с «оборванной» стрелкой перевода — перевод остановлен
export function Mark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#6F61EC" />
      <path d="M20 8.5l9.5 3.6v7.2c0 6.3-4 10.8-9.5 12.6-5.5-1.8-9.5-6.3-9.5-12.6v-7.2L20 8.5z" fill="#fff" />
      <path d="M14.8 20.4h7.4" stroke="#6F61EC" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M24.6 20.4h.6" stroke="#6F61EC" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="30.5" cy="9.5" r="4" fill="#FA5A5A" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}

export default function Logo({ size = 36, light = false }) {
  return (
    <span className="row" style={{ gap: 10 }}>
      <Mark size={size} />
      <span style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: size * 0.62, letterSpacing: '-.02em', color: light ? '#fff' : '#2E2A6B', textTransform: 'uppercase' }}>
        Антидроп
      </span>
    </span>
  );
}
