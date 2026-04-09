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
    <div className="relative flex min-h-screen items-center justify-center bg-[#f5f1e8]">
      <div className="fixed inset-0 z-0 bg-[length:40px_40px] bg-[linear-gradient(rgba(58,90,64,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(58,90,64,0.08)_1px,transparent_1px)]" />

      <div className="relative z-10 w-full max-w-[560px] px-6 py-10">
        <div className="mb-10 text-center">
          <div className="mb-2 inline-flex items-center gap-3">
            <div
              className="h-9 w-9 bg-[var(--role-customer)]"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            />
            <span className="text-xl font-semibold tracking-[0.04em] text-[#344e41]">Cerebro WMS</span>
          </div>
          <p className="mt-1 text-sm text-[#6b705c]">Create your account</p>
        </div>

        <div className="rounded-2xl border border-[#b7c2a0] bg-[#f5f1e8] p-8 shadow-xl">
          <h1 className="mb-8 text-lg font-semibold tracking-tight text-[#344e41]">Register</h1>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-medium text-[#6b705c]">Full name (optional)</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-4 py-3 text-sm text-[#344e41] outline-none transition-colors placeholder:text-[#6b705c] focus:border-[var(--role-customer)]"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-medium text-[#6b705c]">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => {
                  clearFieldError('email');
                  setEmail(e.target.value);
                }}
                required
                placeholder="user@warehouse.com"
                className={`rounded-lg border bg-[#f5f1e8] px-4 py-3 text-sm text-[#344e41] outline-none transition-colors placeholder:text-[#6b705c] focus:border-[var(--role-customer)] ${fieldErrors.email ? 'border-[var(--color-error)]' : 'border-[#b7c2a0]'}`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-[var(--color-error)]">{fieldErrors.email}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#6b705c]">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                className="rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-4 py-3 text-sm text-[#344e41] outline-none transition-colors placeholder:text-[#6b705c] focus:border-[var(--role-customer)]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#6b705c]">Phone</label>
              <input
                value={phone}
                onChange={e => {
                  setPhoneError(null);
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 8));
                }}
                required
                type="tel"
                inputMode="numeric"
                maxLength={8}
                pattern="[0-9]{8}"
                placeholder="12345678"
                className="rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-4 py-3 text-sm text-[#344e41] outline-none transition-colors placeholder:text-[#6b705c] focus:border-[var(--role-customer)]"
              />
              {phoneError && <p className="text-[11px] text-[var(--color-error)]">{phoneError}</p>}
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-medium text-[#6b705c]">Address</label>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                placeholder="City, street, number"
                className="rounded-lg border border-[#b7c2a0] bg-[#f5f1e8] px-4 py-3 text-sm text-[#344e41] outline-none transition-colors placeholder:text-[#6b705c] focus:border-[var(--role-customer)]"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-medium text-[#6b705c]">CIN (8 digits)</label>
              <input
                value={cin}
                onChange={e => {
                  clearFieldError('cin');
                  setCin(e.target.value.replace(/\D/g, '').slice(0, 8));
                }}
                required
                minLength={8}
                maxLength={8}
                pattern="[0-9]{8}"
                placeholder="12345678"
                className={`rounded-lg border bg-[#f5f1e8] px-4 py-3 text-sm text-[#344e41] outline-none transition-colors placeholder:text-[#6b705c] focus:border-[var(--role-customer)] ${fieldErrors.cin ? 'border-[var(--color-error)]' : 'border-[#b7c2a0]'}`}
              />
              {fieldErrors.cin && (
                <p className="text-[11px] text-[var(--color-error)]">{fieldErrors.cin}</p>
              )}
            </div>

            {error && (
              <div className="md:col-span-2 rounded-lg border border-[var(--color-error)] bg-[#f8efe9] px-4 py-3 text-sm text-[var(--color-error)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 mt-2 rounded-xl border-0 bg-[var(--role-customer)] px-4 py-3 text-sm font-semibold text-black transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#cfd7bf] disabled:text-[#6b705c]"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[#6b705c]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--role-customer)] underline underline-offset-4">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
