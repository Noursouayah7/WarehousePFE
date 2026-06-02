"use client";

import Link from 'next/link';
import { useAuth } from '@/src/auth/AuthProvider';
import AdminUsersDashbord from './UsersDashbord/AdminUsersDashbord';

export default function AdminPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-10 py-4">
        <div className="flex items-center gap-3">
          <div
            className="h-6 w-6 bg-[var(--role-admin)]"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          />
          <span className="text-sm font-medium tracking-[0.04em]">Cerebro WMS</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="rounded-full bg-[var(--role-admin)] px-3 py-1 text-[11px] font-semibold tracking-[0.04em] text-black">
            Admin
          </span>
          <Link
            href="/admin/profile"
            className="cursor-pointer rounded-lg border border-[var(--border)] bg-transparent px-4 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
          >
            Profile
          </Link>
          <button
            onClick={logout}
            className="cursor-pointer rounded-lg border border-[var(--border)] bg-transparent px-4 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:border-[var(--border)] hover:text-[var(--foreground)]"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-[40px] py-[60px]">
        <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">Dashboard</p>
        <h1 className="mb-2 text-4xl font-semibold tracking-tight">Admin panel</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Full system access — users, warehouses, blocs, products
        </p>

        {/* Stat cards */}
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Users', value: '—', accent: 'var(--color-warning)' },
            { label: 'Warehouses', value: '—', accent: 'var(--color-success)' },
            { label: 'Blocs', value: '—', accent: 'var(--color-info)' },
            { label: 'Products', value: '—', accent: 'var(--color-error)' },
          ].map(card => (
            <div key={card.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="mb-4 h-6 w-[3px]" style={{ background: card.accent }} />
              <p className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">{card.label}</p>
              <p className="text-[28px] font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        <AdminUsersDashbord />
      </div>
    </div>
  );
}