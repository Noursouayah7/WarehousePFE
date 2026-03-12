'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginRequest } from './auth.api';
import { ActiveRole, LoginCredentials, UserRole } from './auth.types';

const ROLE_ROUTES: Record<ActiveRole, string> = {
  ADMIN: '/admin',
  MANAGER: '/manager',
  TECHNICIEN: '/technicien',
};

function resolveDestination(role: UserRole | null): string {
  if (!role || role === 'PENDING') {
    return '/pending';
  }

  return ROLE_ROUTES[role] ?? '/pending';
}

export function useLogin() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(credentials: LoginCredentials) {
    setLoading(true);
    setError(null);

    try {
      const { access_token, role } = await loginRequest(credentials);
      const destination = resolveDestination(role);

      // Persist token and role in localStorage
      localStorage.setItem('access_token', access_token);
      if (role) {
        localStorage.setItem('user_role', role);
      } else {
        localStorage.removeItem('user_role');
      }

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