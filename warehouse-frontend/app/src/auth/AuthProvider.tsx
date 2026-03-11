'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from './auth.types';

interface AuthContextValue {
  token: string | null;
  role: UserRole | null;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function parseStoredRole(value: string | null): UserRole | null {
  if (value === 'ADMIN' || value === 'MANAGER' || value === 'TECHNICIEN') {
    return value;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('access_token');
  });

  const [role, setRole] = useState<UserRole | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return parseStoredRole(localStorage.getItem('user_role'));
  });

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    setToken(null);
    setRole(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ token, role, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}