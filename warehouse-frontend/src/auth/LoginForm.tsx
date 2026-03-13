'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useLogin } from './uselogin';

export function LoginForm() {
  const { login, error, loading } = useLogin();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const registered = searchParams.get('registered') === '1';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login({ email, password });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      {/* Background grid */}
      <div className="fixed inset-0 z-0 bg-[length:40px_40px] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

      <div className="relative z-10 w-full max-w-[420px] px-6">
        {/* Logo / Brand */}
        <div className="mb-12 text-center">
          <div className="mb-2 inline-flex items-center gap-3">
            <div
              className="h-9 w-9 bg-[#f0c040]"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            />
            <span className="text-xl font-bold tracking-[0.15em] text-white">
              CEREBRO WMS
            </span>
          </div>
          <p className="mt-1 text-xs tracking-[0.2em] text-[#555]">
            WAREHOUSE MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Card */}
        <div className="border border-[#222] bg-[#111] p-10">
          <h1 className="mb-8 text-sm uppercase tracking-[0.25em] text-white">
            SYSTEM ACCESS
          </h1>

          {registered && (
            <div className="mb-6 border border-[#2f5f2f] bg-[#0f1f0f] px-4 py-3 text-xs tracking-[0.05em] text-[#7be37b]">
              REGISTRATION SUCCESSFUL. LOGIN TO CONTINUE.
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] tracking-[0.2em] text-[#555]">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="user@warehouse.com"
                className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#f0c040]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] tracking-[0.2em] text-[#555]">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#f0c040]"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="border border-[#5a1a1a] bg-[#1a0a0a] px-4 py-3 text-xs tracking-[0.05em] text-[#ff6b6b]">
                ⚠ {error.toUpperCase()}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 border-0 px-3.5 py-3 text-xs font-bold tracking-[0.25em] transition-colors disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#555] bg-[#f0c040] text-[#0a0a0a] hover:bg-[#e6b93a]"
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN →'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs tracking-[0.1em] text-[#777]">
            No account yet?{' '}
            <Link href="/register" className="text-[#f0c040] underline underline-offset-4">
              Register
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] tracking-[0.1em] text-[#333]">
          CEREBRO SOLUTIONS © 2026
        </p>
      </div>
    </div>
  );
}