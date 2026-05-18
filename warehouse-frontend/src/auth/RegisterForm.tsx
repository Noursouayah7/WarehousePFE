'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRegister } from './useRegister';

export function RegisterForm() {
  const { register, error, loading, fieldErrors, clearFieldError } = useRegister();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [cin, setCin] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!/^\d{8}$/.test(phone)) {
      setPhoneError('Phone must contain exactly 8 digits.');
      return;
    }

    setPhoneError(null);

    await register({
      name: name || undefined,
      email,
      password,
      address,
      phone: phone.trim(),
      cin,
    });
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative flex items-center overflow-hidden border-b border-[var(--border)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f6f3_100%)] px-6 py-12 lg:border-b-0 lg:border-r lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(88,129,87,0.11),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(188,108,37,0.08),transparent_28%)]" />
          <div className="relative max-w-xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-3 py-2 shadow-sm">
              <div
                className="h-8 w-8 rounded-md bg-[var(--role-customer)]"
                style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              />
              <span className="text-sm font-semibold tracking-tight">Cerebro WMS</span>
            </div>

            <p className="mb-3 text-xs font-medium text-[var(--muted-foreground)]">Open registration</p>
            <h1 className="text-4xl font-semibold tracking-tight lg:text-5xl">
              Create your account and wait for approval.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--muted-foreground)]">
              Anyone can register. New accounts stay pending until an admin approves and assigns the final role.
            </p>

            <div className="mt-8 grid max-w-lg gap-3 sm:grid-cols-3">
              {['Pending review', 'Admin approval', 'Profile autofill'].map((item) => (
                <div key={item} className="rounded-xl bg-white px-4 py-3 text-sm text-[var(--foreground)] shadow-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-12 lg:px-12">
          <div className="w-full max-w-[560px] rounded-2xl border border-[var(--border)] bg-white p-8 shadow-sm md:p-10">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Join the workspace</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Register</h2>
              </div>
              <div className="rounded-full bg-[var(--tint-success)] px-3 py-1 text-xs font-medium text-[var(--color-success)]">
                New account
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Full name (optional)</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)]"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    clearFieldError('email');
                    setEmail(e.target.value);
                  }}
                  required
                  placeholder="user@warehouse.com"
                  className={`rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)] ${fieldErrors.email ? 'border-[var(--color-error)]' : 'border-[var(--input)]'}`}
                />
                {fieldErrors.email && <p className="text-[11px] text-[var(--color-error)]">{fieldErrors.email}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Minimum 8 characters"
                  className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => {
                    setPhoneError(null);
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 8));
                  }}
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={8}
                  pattern="[0-9]{8}"
                  placeholder="12345678"
                  className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)]"
                />
                {phoneError && <p className="text-[11px] text-[var(--color-error)]">{phoneError}</p>}
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">Address</label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="City, street, number"
                  className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)]"
                />
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">CIN (8 digits)</label>
                <input
                  value={cin}
                  onChange={(e) => {
                    clearFieldError('cin');
                    setCin(e.target.value.replace(/\D/g, '').slice(0, 8));
                  }}
                  required
                  minLength={8}
                  maxLength={8}
                  pattern="[0-9]{8}"
                  placeholder="12345678"
                  className={`rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#94938d] focus:border-[var(--ring)] ${fieldErrors.cin ? 'border-[var(--color-error)]' : 'border-[var(--input)]'}`}
                />
                {fieldErrors.cin && <p className="text-[11px] text-[var(--color-error)]">{fieldErrors.cin}</p>}
              </div>

              {error && (
                <div className="md:col-span-2 rounded-xl bg-[var(--tint-error)] px-4 py-3 text-sm text-[var(--color-error)]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="md:col-span-2 mt-2 rounded-xl bg-[var(--role-customer)] px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#e4ecd8] disabled:text-[#8b857a]"
              >
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-[var(--primary)] underline underline-offset-4">
                Login
              </Link>
            </p>

            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Want to explore the company first?{' '}
              <Link href="/" className="font-medium text-[var(--role-manager)] underline underline-offset-4">
                Go to landing page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
