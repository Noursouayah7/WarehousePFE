'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegisterRequestError, registerRequest } from './auth.api';
import { RegisterPayload } from './auth.types';

type RegisterFieldErrors = {
  email: string | null;
  cin: string | null;
};

export function useRegister() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({
    email: null,
    cin: null,
  });

  function clearFieldError(field: keyof RegisterFieldErrors) {
    setFieldErrors((current) => ({ ...current, [field]: null }));
  }

  async function register(payload: RegisterPayload) {
    setLoading(true);
    setError(null);
    setFieldErrors({ email: null, cin: null });

    try {
      await registerRequest(payload);
      router.push('/login?registered=1');
    } catch (err: unknown) {
      if (err instanceof RegisterRequestError && err.field) {
        const field = err.field;
        setFieldErrors((current) => ({ ...current, [field]: err.message }));
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }

  return { register, error, loading, fieldErrors, clearFieldError };
}
