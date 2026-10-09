import { api } from './api.js';
import { saveLocal } from './progress.js';

// Сохраняет результат: всегда в браузере, а для ученика — ещё и на сервере.
export async function submitResult(user, activityId, score, max, durationSec) {
  saveLocal(activityId, score, max);
  if (user?.role !== 'student') return { saved: false };
  try {
    const r = await api('/results', { method: 'POST', body: { activityId, score, max, durationSec } });
    return { saved: true, certificate: r.certificate };
  } catch (e) {
    return { saved: false, error: e.message };
  }
}

export function logStart(user, activityId) {
  if (user?.role === 'student') api('/log', { method: 'POST', body: { type: 'start', activityId } }).catch(() => {});
}
