'use client';

import BiDashboardPanel from '@/src/bi/BiDashboardPanel';

export default function ManagerPage() {
  return (
    <div className="min-h-screen bg-[var(--muted)] text-[var(--foreground)]">
      <div className="px-[40px] py-[60px]">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Manager overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">Manager&apos;s Dashboard</h1>
        </div>

        <BiDashboardPanel role="MANAGER" />
      </div>
    </div>
  );
}
