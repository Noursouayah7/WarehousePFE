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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative flex items-center overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f6f3_100%)] px-6 py-12 lg:border-b-0 lg:border-r lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(58,90,64,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(47,118,246,0.10),transparent_30%)]" />
          <div className="relative max-w-xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-3 py-2 shadow-sm">
              <div
                className="h-8 w-8 rounded-md bg-[var(--role-admin)]"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              />
              <span className="text-sm font-semibold tracking-tight">Cerebro WMS</span>
            </div>

            <p className="mb-3 text-xs font-medium text-[var(--muted-foreground)]">Warehouse operations</p>
            <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">
              Sign in to a cleaner, faster workspace.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
              Access orders, shipments, inventory, and approvals from a calm business interface built for daily work.
            </p>

            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
              {[
                'Order workflow',
                'Inventory visibility',
                'Role-based access',
              ].map((item) => (
                <div key={item} className="rounded-xl bg-white px-4 py-3 text-sm text-[var(--foreground)] shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-[460px] rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm md:p-10">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Welcome back</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Sign in</h2>
              </div>
              {registered && (
                <div className="rounded-full bg-[var(--tint-success)] px-3 py-1 text-xs font-medium text-[var(--color-success)]">
                  Registered
                </div>
              )}
            </div>

            {registered && (
              <div className="mb-6 rounded-xl bg-[var(--tint-success)] px-4 py-3 text-sm text-[var(--color-success)]">
                Registration successful. Login to continue.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="user@warehouse.com"
                  className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)]"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-[var(--tint-error)] px-4 py-3 text-sm text-[var(--color-error)]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-xl bg-[var(--role-admin)] px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#e6ddd1] disabled:text-[#8b857a]"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              No account yet?{' '}
              <Link href="/register" className="font-medium text-[var(--primary)] underline underline-offset-4">
                Register
              </Link>
            </p>

            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Visiting first?{' '}
              <Link href="/" className="font-medium text-[var(--role-manager)] underline underline-offset-4">
                Open the public landing page
              </Link>
            </p>
          </div>
        </div>
      </div>

      <p className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted-foreground)] lg:px-12">
        Cerebro Solutions © 2026
      </p>
    </div>
  );
}