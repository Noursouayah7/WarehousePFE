'use client';

import BiDashboardPanel from '@/src/bi/BiDashboardPanel';
import { useI18n } from '@/src/i18n/I18nProvider';

export default function ManagerPage() {
  const { tx } = useI18n();

  return (
    <div className="min-h-screen bg-[var(--muted)] text-[var(--foreground)]">
      <div className="px-[40px] py-[60px]">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">{tx('Manager overview')}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{tx("Manager's Dashboard")}</h1>
        </div>

        <BiDashboardPanel role="MANAGER" />
      </div>
    </div>
  );
}
