'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerRequest } from './auth.api';
import { RegisterPayload } from './auth.types';

export function useRegister() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function register(payload: RegisterPayload) {
    setLoading(true);
    setError(null);

    try {
      await registerRequest(payload);
      router.push('/login?registered=1');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return { register, error, loading };
}
