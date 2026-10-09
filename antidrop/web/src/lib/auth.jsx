import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined — ещё загружаем
  const refresh = useCallback(() => api('/me').then((d) => setUser(d.user)).catch(() => setUser(null)), []);
  useEffect(() => { refresh(); }, [refresh]);
  const login = async (login, password) => { const d = await api('/auth/login', { method: 'POST', body: { login, password } }); setUser(d.user); return d.user; };
  const register = async (form) => { const d = await api('/auth/register', { method: 'POST', body: form }); setUser(d.user); return d.user; };
  const logout = async () => { await api('/auth/logout', { method: 'POST', body: {} }).catch(() => {}); setUser(null); };
  return <Ctx.Provider value={{ user, setUser, refresh, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);

export const ROLE_LABEL = { student: 'Ученик', teacher: 'Учитель', admin: 'Администратор' };
