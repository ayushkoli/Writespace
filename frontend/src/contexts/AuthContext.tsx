import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';
import { authApi } from '../api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: FormData) => Promise<string | undefined>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const stored = localStorage.getItem('user');

      // Guests on landing/login don't need an API call — avoids proxy errors when backend is off
      if (!stored) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('user');
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data } = await authApi.getCurrentUser();
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
      } catch {
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (identifier: string, password: string) => {
    const trimmed = identifier.trim();
    const payload =
      trimmed.includes('@')
        ? { email: trimmed.toLowerCase(), password }
        : { username: trimmed.toLowerCase(), password };
    const { data } = await authApi.login(payload);
    const loggedInUser = data.data.user;
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const register = async (formData: FormData) => {
    const { data } = await authApi.register(formData);
    const uploadWarning = data.uploadWarning as string | undefined;

    const username = String(formData.get('username') || '').trim();
    const password = String(formData.get('password') || '');
    if (username && password) {
      await login(username, password);
    }

    return uploadWarning;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
