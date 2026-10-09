import { useEffect, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './auth.jsx';

// Прогресс гостя хранится в браузере, прогресс ученика — на сервере.
const KEY = 'ad_local_results';

export function localBest() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}

export function saveLocal(activityId, score, max) {
  try {
    const all = localBest();
    const ratio = score / max;
    const prev = all[activityId];
    if (!prev || ratio > prev.ratio) all[activityId] = { ratio, score, max, lastAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch { /* хранилище недоступно — не страшно */ }
}

// Лучшие результаты текущего пользователя: { [activityId]: { ratio, score, max } }
export function useBest() {
  const { user } = useAuth();
  const [best, setBest] = useState(() => localBest());
  useEffect(() => {
    if (user?.role !== 'student') { setBest(localBest()); return; }
    let alive = true;
    api('/student/overview').then((d) => alive && setBest({ ...localBest(), ...d.summary.best })).catch(() => {});
    return () => { alive = false; };
  }, [user]);
  return best;
}
