import { motion } from 'framer-motion';

// Плоские предметные иллюстрации: простые геометрические формы, 3–4 цвета, без персонажей.
const C = { blue: '#6F61EC', blueL: '#E2DEFC', blueM: '#B3AAF6', orange: '#FA5A5A', yellow: '#FFC530', green: '#1FAA59', red: '#FA5A5A', ink: '#2B2A3D', gray: '#ECEAF5', white: '#FFFFFF' };

const float = (d = 0, a = 6, dur = 4) => ({ animate: { y: [0, -a, 0] }, transition: { duration: dur, repeat: Infinity, ease: 'easeInOut', delay: d } });

function Frame({ size, children, label }) {
  return <svg viewBox="0 0 240 200" width={size} height={size * 200 / 240} role="img" aria-label={label} style={{ overflow: 'visible' }}>{children}</svg>;
}

// Банковская карта и замок
export function IlloCard({ size = 240 }) {
  return (
    <Frame size={size} label="Банковская карта под защитой">
      <ellipse cx="120" cy="186" rx="80" ry="8" fill={C.gray} />
      <motion.g {...float(0, 5, 5)}>
        <g transform="rotate(-10 110 100)">
          <rect x="34" y="52" width="150" height="96" rx="14" fill={C.blue} />
          <rect x="34" y="72" width="150" height="16" fill={C.ink} opacity=".85" />
          <rect x="50" y="102" width="26" height="20" rx="4" fill={C.yellow} />
          <rect x="88" y="106" width="56" height="6" rx="3" fill={C.blueL} />
          <rect x="88" y="118" width="36" height="6" rx="3" fill={C.blueM} />
        </g>
      </motion.g>
      <motion.g {...float(.6, 7, 4.2)}>
        <path d="M156 104 v-14 a20 20 0 0 1 40 0 v14" fill="none" stroke={C.ink} strokeWidth="9" strokeLinecap="round" />
        <rect x="142" y="102" width="68" height="56" rx="12" fill={C.orange} />
        <circle cx="176" cy="126" r="7" fill={C.white} />
        <rect x="173" y="128" width="6" height="14" rx="3" fill={C.white} />
      </motion.g>
    </Frame>
  );
}

// Щит с галочкой и монеты
export function IlloShield({ size = 240 }) {
  return (
    <Frame size={size} label="Щит защиты">
      <ellipse cx="120" cy="186" rx="76" ry="8" fill={C.gray} />
      <motion.g {...float(.3, 4, 5)}>
        <circle cx="52" cy="140" r="20" fill={C.yellow} /><circle cx="52" cy="140" r="12" fill="none" stroke="#E5A800" strokeWidth="4" />
        <circle cx="190" cy="66" r="14" fill={C.yellow} /><circle cx="190" cy="66" r="7" fill="none" stroke="#E5A800" strokeWidth="3" />
      </motion.g>
      <motion.g {...float(0, 6, 4.5)}>
        <path d="M120 18 L178 40 V92 C178 132 152 158 120 172 C88 158 62 132 62 92 V40 Z" fill={C.blue} />
        <path d="M120 34 L162 50 V92 C162 122 144 142 120 154 Z" fill="#8478F0" />
        <motion.path d="M94 96 L113 115 L150 76" fill="none" stroke={C.white} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: .4, ease: 'easeOut' }} />
      </motion.g>
    </Frame>
  );
}

// Секундомер «15»
export function IlloTimer({ size = 240 }) {
  return (
    <Frame size={size} label="Пауза 15 минут">
      <ellipse cx="120" cy="188" rx="70" ry="8" fill={C.gray} />
      <motion.g {...float(0, 5, 4.6)}>
        <rect x="108" y="14" width="24" height="16" rx="5" fill={C.ink} />
        <rect x="160" y="34" width="16" height="12" rx="4" fill={C.ink} transform="rotate(40 168 40)" />
        <circle cx="120" cy="106" r="74" fill={C.blue} />
        <circle cx="120" cy="106" r="60" fill={C.white} />
        <motion.path d="M120 46 A60 60 0 0 1 180 106 L120 106 Z" fill={C.orange} opacity=".22"
          initial={{ scale: .6, opacity: 0 }} animate={{ scale: 1, opacity: .22 }} style={{ originX: '120px', originY: '106px' }} transition={{ duration: .8 }} />
        <text x="120" y="124" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="50" fill={C.ink}>15</text>
        <text x="120" y="146" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontWeight="700" fontSize="13" fill={C.ink} opacity=".6">МИНУТ</text>
      </motion.g>
    </Frame>
  );
}

// Переписка с красным флагом
export function IlloChat({ size = 240 }) {
  return (
    <Frame size={size} label="Переписка с красным флагом">
      <ellipse cx="120" cy="188" rx="80" ry="8" fill={C.gray} />
      <motion.g {...float(0, 5, 4.4)}>
        <path d="M22 34 h132 a14 14 0 0 1 14 14 v42 a14 14 0 0 1 -14 14 h-96 l-22 18 v-18 h-14 a14 14 0 0 1 -14 -14 v-42 a14 14 0 0 1 14 -14z" fill={C.white} stroke={C.gray} strokeWidth="3" />
        <rect x="40" y="56" width="96" height="9" rx="4.5" fill={C.blueM} />
        <rect x="40" y="74" width="64" height="9" rx="4.5" fill={C.gray} />
        <g transform="translate(150 22)">
          <circle cx="16" cy="16" r="22" fill={C.red} />
          <path d="M9 6 v22" stroke={C.white} strokeWidth="4" strokeLinecap="round" />
          <path d="M9 7 h14 l-4 5 l4 5 h-14z" fill={C.white} />
        </g>
      </motion.g>
      <motion.g {...float(.7, 6, 4.8)}>
        <path d="M218 118 h-110 a14 14 0 0 0 -14 14 v24 a14 14 0 0 0 14 14 h86 l18 14 v-14 h6 a14 14 0 0 0 14 -14 v-24 a14 14 0 0 0 -14 -14z" fill={C.blue} />
        <rect x="112" y="136" width="70" height="9" rx="4.5" fill={C.white} opacity=".9" />
        <rect x="112" y="152" width="44" height="9" rx="4.5" fill={C.white} opacity=".55" />
        <circle cx="204" cy="148" r="10" fill={C.green} />
        <path d="M199 148 l4 4 l7 -8" stroke={C.white} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </Frame>
  );
}

// Телефон с уведомлением о зачислении
export function IlloBell({ size = 240 }) {
  return (
    <Frame size={size} label="Уведомление о переводе">
      <ellipse cx="120" cy="190" rx="70" ry="7" fill={C.gray} />
      <rect x="72" y="8" width="96" height="176" rx="18" fill={C.ink} />
      <rect x="79" y="16" width="82" height="160" rx="12" fill={C.blueL} />
      <rect x="104" y="22" width="32" height="6" rx="3" fill={C.ink} />
      <rect x="88" y="120" width="64" height="8" rx="4" fill={C.white} />
      <rect x="88" y="134" width="44" height="8" rx="4" fill={C.white} />
      <motion.g {...float(0, 6, 4)}>
        <rect x="24" y="52" width="150" height="54" rx="14" fill={C.white} stroke={C.gray} strokeWidth="3" />
        <circle cx="50" cy="79" r="14" fill={C.green} />
        <path d="M50 71 v16 M43 78 l7 -7 l7 7" stroke={C.white} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="72" y="68" width="66" height="8" rx="4" fill={C.ink} />
        <rect x="72" y="83" width="88" height="7" rx="3.5" fill={C.gray} />
      </motion.g>
      <motion.g {...float(.5, 5, 3.6)} >
        <motion.g animate={{ rotate: [0, 14, -12, 8, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }} style={{ originX: '196px', originY: '120px' }}>
          <path d="M178 150 a18 18 0 0 1 36 0 v-18 a18 18 0 0 0 -36 0z" fill={C.yellow} />
          <path d="M174 150 h44" stroke="#E5A800" strokeWidth="6" strokeLinecap="round" />
          <circle cx="196" cy="158" r="6" fill="#E5A800" />
        </motion.g>
      </motion.g>
    </Frame>
  );
}

// Доска с презентацией
export function IlloBoard({ size = 240 }) {
  return (
    <Frame size={size} label="Презентация на доске">
      <ellipse cx="120" cy="190" rx="80" ry="7" fill={C.gray} />
      <path d="M120 140 v44 M96 186 l24 -34 l24 34" stroke={C.ink} strokeWidth="7" strokeLinecap="round" fill="none" />
      <rect x="20" y="20" width="200" height="124" rx="14" fill={C.ink} />
      <rect x="28" y="28" width="184" height="108" rx="9" fill={C.white} />
      <rect x="42" y="42" width="80" height="10" rx="5" fill={C.ink} />
      <rect x="42" y="58" width="56" height="7" rx="3.5" fill={C.gray} />
      {[[50, 40, C.blueM], [74, 58, C.blue], [98, 30, C.blueM], [122, 72, C.orange]].map(([x, h, f], i) => (
        <motion.rect key={i} x={x + 30} width="16" rx="4" fill={f} initial={{ y: 126, height: 0 }} animate={{ y: 126 - h, height: h }} transition={{ delay: .3 + i * .12, duration: .7, ease: 'easeOut' }} />
      ))}
      <motion.g {...float(.4, 6, 4)}>
        <circle cx="204" cy="34" r="18" fill={C.green} />
        <path d="M196 34 l6 6 l10 -12" stroke={C.white} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>
    </Frame>
  );
}

// Грамота с медалью
export function IlloCertificate({ size = 240 }) {
  return (
    <Frame size={size} label="Грамота">
      <ellipse cx="120" cy="188" rx="80" ry="7" fill={C.gray} />
      <motion.g {...float(0, 4, 5)}>
        <rect x="30" y="26" width="170" height="134" rx="12" fill={C.white} stroke={C.gray} strokeWidth="3" transform="rotate(-4 115 93)" />
        <g transform="rotate(-4 115 93)">
          <rect x="62" y="50" width="104" height="12" rx="6" fill={C.blue} />
          <rect x="74" y="74" width="80" height="7" rx="3.5" fill={C.gray} />
          <rect x="62" y="88" width="104" height="7" rx="3.5" fill={C.gray} />
          <rect x="80" y="102" width="68" height="7" rx="3.5" fill={C.gray} />
        </g>
      </motion.g>
      <motion.g {...float(.6, 6, 4)}>
        <path d="M168 132 l-12 40 l14 -8 l8 14 l8 -40z" fill={C.red} />
        <path d="M190 132 l12 40 l-14 -8 l-8 14 l-8 -40z" fill="#D94040" />
        <circle cx="179" cy="124" r="26" fill={C.yellow} />
        <circle cx="179" cy="124" r="17" fill="none" stroke="#E5A800" strokeWidth="4" />
        <path d="M179 112 l4 8 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 l9 -1z" fill="#E5A800" />
      </motion.g>
    </Frame>
  );
}

// Весы
export function IlloLaw({ size = 240 }) {
  return (
    <Frame size={size} label="Закон">
      <ellipse cx="120" cy="190" rx="66" ry="7" fill={C.gray} />
      <rect x="114" y="34" width="12" height="140" rx="6" fill={C.ink} />
      <rect x="82" y="168" width="76" height="16" rx="8" fill={C.ink} />
      <circle cx="120" cy="30" r="12" fill={C.orange} />
      <motion.g animate={{ rotate: [-4, 4, -4] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} style={{ originX: '120px', originY: '48px' }}>
        <rect x="36" y="44" width="168" height="10" rx="5" fill={C.blue} />
        <path d="M50 54 l-22 56 M50 54 l22 56 M190 54 l-22 56 M190 54 l22 56" stroke={C.blueM} strokeWidth="3" />
        <path d="M18 110 h64 a32 22 0 0 1 -64 0z" fill={C.blue} />
        <path d="M158 110 h64 a32 22 0 0 1 -64 0z" fill={C.blue} />
      </motion.g>
    </Frame>
  );
}

// Лупа над документом
export function IlloSearch({ size = 240 }) {
  return (
    <Frame size={size} label="Поиск">
      <ellipse cx="120" cy="188" rx="76" ry="7" fill={C.gray} />
      <rect x="40" y="20" width="120" height="156" rx="12" fill={C.white} stroke={C.gray} strokeWidth="3" />
      {[44, 62, 80, 98, 116].map((y, i) => <rect key={y} x="58" y={y} width={i % 2 ? 60 : 84} height="8" rx="4" fill={i === 2 ? C.red : C.gray} />)}
      <motion.g animate={{ x: [0, -18, 0], y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
        <circle cx="150" cy="104" r="40" fill={C.blueL} fillOpacity=".55" stroke={C.blue} strokeWidth="12" />
        <path d="M180 134 l34 34" stroke={C.ink} strokeWidth="16" strokeLinecap="round" />
      </motion.g>
    </Frame>
  );
}

export const ILLO = { card: IlloCard, shield: IlloShield, timer: IlloTimer, chat: IlloChat, bell: IlloBell, board: IlloBoard, certificate: IlloCertificate, law: IlloLaw, search: IlloSearch };
export function Illo({ name, size }) { const I = ILLO[name] || IlloShield; return <I size={size} />; }

// Иллюстрация для каждого урока и игры
export const ACTIVITY_ILLO = {
  l1: 'card', l2: 'chat', l3: 'timer', l4: 'bell', l5: 'law',
  'g-flags': 'chat', 'g-swipe': 'card', 'g-chat': 'chat', 'g-chain': 'shield', 'g-money': 'bell', 'g-myth': 'law', 'g-sort': 'search', 'g-pause': 'timer',
};
