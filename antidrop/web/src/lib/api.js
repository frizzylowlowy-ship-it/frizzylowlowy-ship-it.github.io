import { DEMO, DEMO_MSG } from './demo.js';

// Обёртка над fetch: JSON, куки сессии, защитный заголовок
export async function api(path, { method = 'GET', body } = {}) {
  if (DEMO) { const e = new Error(DEMO_MSG); e.status = 0; throw e; }
  const res = await fetch('/api' + path, {
    method,
    credentials: 'same-origin',
    headers: { 'X-Antidrop': '1', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* пустой ответ */ }
  if (!res.ok) {
    const err = new Error(data?.error || 'Что-то пошло не так. Попробуйте ещё раз.');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const fmtDate = (t) => t ? new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) : '—';
export const fmtDateFull = (t) => t ? new Date(t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
export const fmtTime = (t) => t ? new Date(t).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export function ago(t) {
  if (!t) return 'ещё не заходил';
  const s = (Date.now() - t) / 1000;
  if (s < 300) return 'в сети';
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
  if (s < 86400) return `${Math.floor(s / 3600)} ч назад`;
  if (s < 86400 * 2) return 'вчера';
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} дн назад`;
  return fmtDate(t);
}
export const isOnline = (t) => t && Date.now() - t < 5 * 60e3;

export function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const COLORS = ['#4B3CF0', '#10B783', '#FF6A55', '#2F9BFF', '#F5A100', '#C04BF2', '#E8436B', '#0FA3B1'];
export const colorFor = (s = '') => COLORS[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];
export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
