'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRegister } from './useRegister';

export function RegisterForm() {
  const { register, error, loading } = useRegister();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [cin, setCin] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await register({
      name: name || undefined,
      email,
      password,
      address,
      phone,
      cin,
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="fixed inset-0 z-0 bg-[length:40px_40px] bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

      <div className="relative z-10 w-full max-w-[560px] px-6 py-10">
        <div className="mb-10 text-center">
          <div className="mb-2 inline-flex items-center gap-3">
            <div
              className="h-9 w-9 bg-[#4aa0f0]"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
            />
            <span className="text-xl font-bold tracking-[0.15em] text-white">CEREBRO WMS</span>
          </div>
          <p className="mt-1 text-xs tracking-[0.2em] text-[#555]">CREATE YOUR ACCOUNT</p>
        </div>

        <div className="border border-[#222] bg-[#111] p-8">
          <h1 className="mb-8 text-sm uppercase tracking-[0.25em] text-white">REGISTER</h1>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[11px] tracking-[0.2em] text-[#555]">FULL NAME (OPTIONAL)</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#4aa0f0]"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[11px] tracking-[0.2em] text-[#555]">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="user@warehouse.com"
                className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#4aa0f0]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] tracking-[0.2em] text-[#555]">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#4aa0f0]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] tracking-[0.2em] text-[#555]">PHONE</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="06xxxxxxxx"
                className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#4aa0f0]"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[11px] tracking-[0.2em] text-[#555]">ADDRESS</label>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
                placeholder="City, street, number"
                className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#4aa0f0]"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[11px] tracking-[0.2em] text-[#555]">CIN (8 DIGITS)</label>
              <input
                value={cin}
                onChange={e => setCin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                required
                minLength={8}
                maxLength={8}
                pattern="[0-9]{8}"
                placeholder="12345678"
                className="border border-[#2a2a2a] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#666] focus:border-[#4aa0f0]"
              />
            </div>

            {error && (
              <div className="md:col-span-2 border border-[#5a1a1a] bg-[#1a0a0a] px-4 py-3 text-xs tracking-[0.05em] text-[#ff6b6b]">
                {error.toUpperCase()}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 mt-2 border-0 bg-[#4aa0f0] px-4 py-3 text-xs font-bold tracking-[0.25em] text-[#0a0a0a] transition-colors hover:bg-[#3f92de] disabled:cursor-not-allowed disabled:bg-[#2a2a2a] disabled:text-[#555]"
            >
              {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs tracking-[0.1em] text-[#777]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#4aa0f0] underline underline-offset-4">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
