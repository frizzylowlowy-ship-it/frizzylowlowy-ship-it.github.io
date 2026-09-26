// Russian text lives in the HTML as the default; English replaces it via data-i18n keys.
const I18N = {
  ru: {
    'meta.home': 'ECLYPSE — лучший трейнер для комфортной игры',
    'meta.login': 'Авторизация — ECLYPSE',
    'meta.cabinet': 'Личный кабинет — ECLYPSE',
    'meta.buy': 'Купить лицензию — ECLYPSE',
    'meta.admin': 'Админ-панель — ECLYPSE',
    'meta.404': 'Страница не найдена — ECLYPSE',

    'nav.support': 'Поддержка',
    'nav.download': 'Скачать лоадер',
    'nav.buy': 'Купить лицензию',
    'nav.account': 'Личный кабинет',
    'nav.menu': 'Меню',
    'footer.rights': 'Все права защищены.',
    'toast.loaderSoon': 'Лоадер пока в разработке — скоро здесь появится файл',

    'common.cancel': 'Отмена',
    'common.signin': 'Войти',
    'common.save': 'Сохранить',
    'common.delete': 'Удалить',
    'common.logout': 'Выйти',

    'cab.forever': 'навсегда',
    'cab.banned': 'Заблокирован',
    'cab.unlinked': 'Не привязан',
    'cab.copy': 'Скопировать',
    'cab.change': 'Сменить',
    'cab.login': 'Логин',
    'cab.group': 'Группа',
    'cab.reg': 'Дата регистрации',
    'cab.last': 'Последний вход',
    'cab.sub': 'Подписка',
    'cab.key': 'Ключ',
    'key.copied': 'Ключ скопирован',
    'key.copyFail': 'Не удалось скопировать',
    'key.changed': 'Ключ изменён',
    'loader.ok': 'Лоадер авторизован — ключ заменён на новый',
    'err.invalid_key': 'Неверный или уже использованный ключ',
    'err.banned': 'Аккаунт заблокирован',
    'err.hwid_mismatch': 'Ключ привязан к другому устройству',
    'demo.err': 'Введите ник',

    'admin.online': 'Онлайн',
    'admin.offline': 'Оффлайн',
    'admin.edit': 'Редактировать',
    'admin.ban': 'Заблокировать',
    'admin.unban': 'Разблокировать',
    'admin.empty': 'Никого не найдено',
    'admin.saved': 'Сохранено',
    'admin.deleted': 'Пользователь удалён',
    'admin.bannedToast': '{name} заблокирован',
    'admin.unbannedToast': '{name} разблокирован',
    'admin.delQ': 'Удалить пользователя {name}?',
  },

  en: {
    'meta.home': 'ECLYPSE — the best trainer for comfortable gaming',
    'meta.login': 'Sign in — ECLYPSE',
    'meta.cabinet': 'Personal account — ECLYPSE',
    'meta.buy': 'Buy license — ECLYPSE',
    'meta.admin': 'Admin panel — ECLYPSE',
    'meta.404': 'Page not found — ECLYPSE',

    'nav.support': 'Support',
    'nav.download': 'Download loader',
    'nav.buy': 'Buy license',
    'nav.account': 'Personal account',
    'nav.menu': 'Menu',
    'footer.rights': 'All rights reserved.',
    'toast.loaderSoon': 'The loader is still in development — the download will appear here soon',

    'common.cancel': 'Cancel',
    'common.signin': 'Sign in',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.logout': 'Log out',

    'hero.text': 'A trainer for single-player games. Free access, Discord sign-in and a personal key for the loader.',
    'hero.get': 'Get it',
    'hero.more': 'Read more',

    'adv.title': 'Our advantages',
    'adv.sub': 'Everything you are guaranteed to get with ECLYPSE, in one place.',
    'adv.1.t': 'Clean interface',
    'adv.1.d': 'A minimal trainer menu with everything you need at hand and nothing extra. You can also adjust its look to your taste.',
    'adv.2.t': 'Customizability',
    'adv.2.d': 'Almost every feature can be tuned to your liking, and configs can be saved and loaded in one click.',
    'adv.3.t': 'Performance',
    'adv.3.d': 'We keep optimizing the trainer, so it stays light on resources and runs even on low-end computers.',
    'adv.4.t': 'Frequent updates',
    'adv.4.d': 'We regularly add new features and improve existing ones. The loader always fetches the latest version on its own.',
    'adv.5.t': 'Best support',
    'adv.5.d': 'Our team knows the product inside out and will help you with any issue on our Discord server.',

    'steps.title': 'How to start',
    'steps.sub': 'Three steps and the trainer is ready to go.',
    'steps.1.t': 'Sign in with Discord',
    'steps.1.d': 'Your account is created automatically on the first sign-in.',
    'steps.2.t': 'Copy your key',
    'steps.2.d': 'The loader key is waiting for you in your personal account.',
    'steps.3.t': 'Run the loader',
    'steps.3.d': 'Paste the key — after sign-in it is replaced with a new one.',

    'pricing.title': 'Pricing',
    'pricing.sub': 'A free subscription is available right now.',
    'plan.forever': 'Forever',
    'plan.f1': 'Trainer access',
    'plan.f2': 'Loader key',
    'plan.f3': 'Updates',
    'plan.soon': 'Soon',
    'plan.p1': 'Everything in Free',
    'plan.p2': 'Extra features',
    'plan.p3': 'Priority support',
    'plan.current': 'Available now',

    'faq.title': 'FAQ',
    'faq.sub': "Didn't find an answer? Contact our support.",
    'faq.q1': 'Is it really free?',
    'faq.a1': 'Yes. Right now there is only the Free subscription, and it is issued forever after you sign in with Discord.',
    'faq.q2': 'Where do I get the loader key?',
    'faq.a2': 'In your personal account, in the “Key” row. You can copy it or generate a new one with the “Change” button.',
    'faq.q3': 'Why did my key change?',
    'faq.a3': 'The key is single-use: a new one is issued after every loader sign-in. The current key is always shown in your personal account.',
    'faq.q4': 'Can I use it in online games?',
    'faq.a4': 'No. The trainer is designed for single-player games only.',

    'login.title': 'Sign in',
    'login.text': 'Sign-in and registration are available via Discord only.',
    'login.btn': 'Sign in with Discord',
    'login.note': 'Demo mode: real Discord sign-in will arrive together with the backend.',
    'demo.title': 'Demo sign-in',
    'demo.nick': 'Discord username',
    'demo.ph': 'e.g. fri213',
    'demo.err': 'Enter a username',

    'cab.title': 'Personal account',
    'cab.login': 'Login',
    'cab.group': 'Group',
    'cab.reg': 'Date of registration',
    'cab.last': 'Last logged in',
    'cab.sub': 'Subscription',
    'cab.key': 'Key',
    'cab.forever': 'forever',
    'cab.banned': 'Banned',
    'cab.unlinked': 'Not linked',
    'cab.copy': 'Copy',
    'cab.change': 'Change',
    'cab.admin': 'Admin panel',
    'cab.note': 'The key is single-use: it is replaced automatically after every loader sign-in.',
    'cab.test': 'Test loader sign-in (demo)',
    'key.copied': 'Key copied',
    'key.copyFail': "Couldn't copy the key",
    'key.changed': 'Key changed',
    'loader.title': 'Loader sign-in (demo)',
    'loader.ok': 'Loader signed in — the key has been replaced',
    'err.invalid_key': 'Invalid or already used key',
    'err.banned': 'This account is banned',
    'err.hwid_mismatch': 'The key is bound to another device',

    'buy.title': 'Buy license',

    'admin.title': 'Admin panel',
    'admin.pass': 'Password',
    'admin.wrong': 'Wrong password',
    'admin.users': 'Users',
    'admin.onlineNow': 'Online now',
    'admin.downloads': 'Downloads',
    'admin.launches': 'Launches',
    'admin.search': 'Search: login, UID, HWID',
    'admin.all': 'All',
    'admin.bannedF': 'Banned',
    'admin.th.login': 'Login',
    'admin.th.group': 'Group',
    'admin.th.status': 'Status',
    'admin.th.dl': 'Downloads',
    'admin.th.launch': 'Launches',
    'admin.th.last': 'Last login',
    'admin.th.reg': 'Registered',
    'admin.editTitle': 'Edit user',
    'admin.online': 'Online',
    'admin.offline': 'Offline',
    'admin.edit': 'Edit',
    'admin.ban': 'Ban',
    'admin.unban': 'Unban',
    'admin.empty': 'No users found',
    'admin.saved': 'Saved',
    'admin.deleted': 'User deleted',
    'admin.bannedToast': '{name} has been banned',
    'admin.unbannedToast': '{name} has been unbanned',
    'admin.delQ': 'Delete user {name}?',

    'nf.title': 'Page not found',
    'nf.text': "This page doesn't exist or has been moved.",
    'nf.home': 'Back to home',
  },
};

const LANG_KEY = 'site_lang';

function getLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'ru' || saved === 'en') return saved;
  } catch {}
  return 'ru';
}

function setLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch {}
  location.reload();
}

function t(key, vars) {
  const lang = getLang();
  let s = (I18N[lang] && I18N[lang][key]) ?? I18N.ru[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

function applyI18n(root = document) {
  const lang = getLang();
  document.documentElement.lang = lang;
  const titleKey = document.body.dataset.title;
  if (titleKey) document.title = t(titleKey);
  if (lang === 'ru') return;
  const dict = I18N[lang];
  root.querySelectorAll('[data-i18n]').forEach((el) => {
    if (dict[el.dataset.i18n] !== undefined) el.textContent = dict[el.dataset.i18n];
  });
  root.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    if (dict[el.dataset.i18nPh] !== undefined) el.placeholder = dict[el.dataset.i18nPh];
  });
  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    if (dict[el.dataset.i18nTitle] !== undefined) el.title = dict[el.dataset.i18nTitle];
  });
}
