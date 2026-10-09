// Единый каталог активностей: уроки курса и мини-игры.
// Используется и сервером (проверка id, названия), и сайтом.

export const LESSONS = [
  { id: 'l1', kind: 'lesson', order: 1, title: 'Кто такие дропперы', short: 'Что это за схема и почему в неё втягивают подростков', minutes: 7, icon: 'Users' },
  { id: 'l2', kind: 'lesson', order: 2, title: 'Красные флаги', short: '8 сигналов, по которым видно вербовку', minutes: 8, icon: 'Flag' },
  { id: 'l3', kind: 'lesson', order: 3, title: 'Правило 15 минут', short: 'Как взять паузу и задать себе 3 вопроса', minutes: 6, icon: 'Timer' },
  { id: 'l4', kind: 'lesson', order: 4, title: 'Если деньги уже пришли', short: 'Пошаговый план без паники', minutes: 6, icon: 'LifeBuoy' },
  { id: 'l5', kind: 'lesson', order: 5, title: 'Закон и последствия', short: 'Почему «мне нет 16 — ничего не будет» не работает', minutes: 7, icon: 'Scale' },
];

export const GAMES = [
  { id: 'g-flags', kind: 'game', title: 'Найди флаг', short: 'Найди в переписке все подозрительные фразы', minutes: 4, icon: 'Search', level: 'Легко', color: 'violet' },
  { id: 'g-swipe', kind: 'game', title: 'Опасно или нет?', short: 'Свайпай объявления: где подработка, а где ловушка', minutes: 3, icon: 'Hand', level: 'Легко', color: 'coral' },
  { id: 'g-chat', kind: 'game', title: 'Разговор с вербовщиком', short: 'Интерактивная переписка: выбери, что ответить', minutes: 5, icon: 'MessageCircle', level: 'Средне', color: 'blue' },
  { id: 'g-chain', kind: 'game', title: 'Собери цепочку', short: 'Расставь шаги: как подростка затягивают в схему', minutes: 4, icon: 'Link', level: 'Средне', color: 'teal' },
  { id: 'g-money', kind: 'game', title: 'Деньги пришли по ошибке', short: 'Выбери правильные действия и их порядок', minutes: 4, icon: 'Wallet', level: 'Средне', color: 'amber' },
  { id: 'g-myth', kind: 'game', title: 'Правда или миф', short: '12 утверждений о картах, законе и «лёгком заработке»', minutes: 4, icon: 'CircleHelp', level: 'Легко', color: 'pink' },
  { id: 'g-sort', kind: 'game', title: 'Разложи по полочкам', short: 'Отличи фактор риска от красного флага', minutes: 4, icon: 'LayoutGrid', level: 'Сложно', color: 'indigo' },
  { id: 'g-pause', kind: 'game', title: 'Реакция: пауза!', short: 'Сообщения сыплются — успей нажать «Пауза» на опасных', minutes: 2, icon: 'Zap', level: 'Сложно', color: 'red' },
];

export const ACTIVITIES = [...LESSONS, ...GAMES];
export const byId = (id) => ACTIVITIES.find((a) => a.id === id);

// Курс считается пройденным, когда все уроки и игры выполнены хотя бы на 60 %.
export const COURSE_PASS_RATIO = 0.6;
