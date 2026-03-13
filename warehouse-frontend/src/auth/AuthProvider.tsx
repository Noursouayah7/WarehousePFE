'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LoginResponse } from './auth.types';
import { UserRole } from './auth.types';

interface AuthContextValue {
  token: string | null;
  role: UserRole | null;
  login: (payload: LoginResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  function login(payload: LoginResponse) {
    setAccessToken(payload.access_token);
    setRole(payload.role);
  }

  function logout() {
    setAccessToken(null);
    setRole(null);
    router.replace('/login');
  }

  return (
    <AuthContext.Provider
      value={{ token: accessToken, role, login, logout, isAuthenticated: !!accessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}