'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLogin } from './uselogin';

export function LoginForm() {
  const { login, error, loading } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRegistered(params.get('registered') === '1');
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login({ email, password });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f5f1e8]">
      {/* Background grid */}
      <div className="fixed inset-0 z-0 bg-[length:40px_40px] bg-[linear-gradient(rgba(58,90,64,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(58,90,64,0.08)_1px,transparent_1px)]" />

      <div className="relative z-10 w-full max-w-[440px] px-6">
        {/* Logo / Brand */}
        <div className="mb-12 text-center">
          <div className="mb-2 inline-flex items-center gap-3">
            <div
              className="h-9 w-9 bg-[var(--role-admin)]"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            />
            <span className="text-xl font-semibold tracking-[0.04em] text-[#344e41]">
              Cerebro WMS
            </span>
          </div>
          <p className="mt-1 text-sm text-[#6b705c]">
            Warehouse management system
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#b7c2a0] bg-[#f5f1e8] p-8 shadow-xl md:p-10">
          <h1 className="mb-8 text-lg font-semibold tracking-tight text-[#344e41]">
            Sign in
          </h1>

          {registered && (
            <div className="mb-6 rounded-lg border border-[var(--color-success)] bg-[#edf3ea] px-4 py-3 text-sm text-[var(--color-success)]">
              Registration successful. Login to continue.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#6b705c]">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="user@warehouse.com"
                className="rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-4 py-3 text-sm text-[#344e41] outline-none transition-colors placeholder:text-[#6b705c] focus:border-[var(--role-admin)]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#6b705c]">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-4 py-3 text-sm text-[#344e41] outline-none transition-colors placeholder:text-[#6b705c] focus:border-[var(--role-admin)]"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-[var(--color-error)] bg-[#f8efe9] px-4 py-3 text-sm text-[var(--color-error)]">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl border-0 px-3.5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-[#cfd7bf] disabled:text-[#6b705c] bg-[var(--role-admin)] text-black hover:opacity-90"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#6b705c]">
            No account yet?{' '}
            <Link href="/register" className="text-[var(--role-admin)] underline underline-offset-4">
              Register
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-[#6b705c]">
          Cerebro Solutions © 2026
        </p>
      </div>
    </div>
  );
}