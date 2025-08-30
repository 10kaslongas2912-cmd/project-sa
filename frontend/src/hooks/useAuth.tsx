import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppUser = {
  name: string;
  avatar: string | null;
  role: 'admin' | 'volunteer' | 'adopter';
};

type AuthState = { token: string | null; type: string | null; };
type AuthContextType = {
  user: AppUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (p: { token: string; tokenType?: string; primeUser?: Partial<AppUser> }) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthCtx = createContext<AuthContextType | undefined>(undefined);
const API_BASE = import.meta.env?.VITE_API_URL || '/api';

function readAuthFromLS() {
  const token = localStorage.getItem('token');
  const type = localStorage.getItem('token_type') || localStorage.getItem('tokenType') || 'Bearer';
  const name = localStorage.getItem('username') || localStorage.getItem('user_name') || '';
  const avatar = localStorage.getItem('avatar') || null;
  const role = (localStorage.getItem('role') as AppUser['role'] | null) || null;
  return { token, type, name, avatar, role };
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ token: null, type: null });
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoggedIn = !!(auth.token && auth.type);

  async function fetchProfile(token: string, type: string) {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Content-Type': 'application/json', Authorization: `${type} ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('unauthorized');
      const data = await res.json();
      const nextUser: AppUser = {
        name: data.name ?? 'ผู้ใช้',
        avatar: data.avatar ?? null,
        role: (data.role as AppUser['role']) ?? 'volunteer',
      };
      setUser(nextUser);
      localStorage.setItem('username', nextUser.name);
      if (nextUser.avatar) localStorage.setItem('avatar', nextUser.avatar);
      localStorage.setItem('role', nextUser.role);
    } catch {
      // token ใช้ไม่ได้แล้ว -> ล็อกเอาท์
      logout();
    }
  }

  const refreshProfile = async () => {
    if (!auth.token || !auth.type) return;
    await fetchProfile(auth.token, auth.type);
  };

  const login: AuthContextType['login'] = ({ token, tokenType = 'Bearer', primeUser }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('token_type', tokenType);
    if (primeUser?.name) localStorage.setItem('username', primeUser.name);
    if (primeUser?.avatar) localStorage.setItem('avatar', primeUser.avatar);
    if (primeUser?.role) localStorage.setItem('role', primeUser.role);

    setAuth({ token, type: tokenType });
    // กระตุ้นผู้ฟังในแท็บเดียว/ข้ามแท็บ
    window.dispatchEvent(new Event('auth-change'));
    refreshProfile();
  };

  const logout = () => {
    ['token', 'token_type', 'tokenType', 'isLogin', 'id', 'user_name', 'username', 'avatar', 'role']
      .forEach((k) => localStorage.removeItem(k));
    setAuth({ token: null, type: null });
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
  };

  // init ครั้งแรก
  useEffect(() => {
    const a = readAuthFromLS();
    setAuth({ token: a.token, type: a.type });
    if (a.token && a.type) {
      fetchProfile(a.token, a.type).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // sync ข้ามแท็บ + อีเวนต์กำหนดเอง
  useEffect(() => {
    const sync = () => {
      const a = readAuthFromLS();
      setAuth({ token: a.token, type: a.type });
      if (a.name || a.role || a.avatar) {
        setUser((u) => ({
          name: a.name || u?.name || 'ผู้ใช้',
          avatar: (a.avatar as string | null) ?? u?.avatar ?? null,
          role: (a.role as AppUser['role']) ?? u?.role ?? 'volunteer',
        }));
      }
      if (a.token && a.type) fetchProfile(a.token, a.type);
    };
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (['token', 'token_type', 'tokenType', 'user_name', 'username', 'avatar', 'role', 'isLogin'].includes(e.key)) {
        sync();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth-change', sync as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth-change', sync as EventListener);
    };
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user, isLoggedIn, loading, login, logout, refreshProfile
  }), [user, isLoggedIn, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
