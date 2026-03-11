'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginRequest } from './auth.api';
import { LoginCredentials, UserRole } from './auth.types';

const ROLE_ROUTES: Record<UserRole, string> = {
  ADMIN: '/admin',
  MANAGER: '/manager',
  TECHNICIEN: '/technicien',
};

export function useLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(credentials: LoginCredentials) {
    setLoading(true);
    setError(null);

    try {
      const { access_token, role } = await loginRequest(credentials);
      const destination = ROLE_ROUTES[role];
      if (!destination) {
        throw new Error('Unknown user role');
      }

      // Persist token and role in localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_role', role);

      // Redirect based on role
      router.push(destination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return { login, error, loading };
}