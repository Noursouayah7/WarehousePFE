"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import BiDashboard from './BiDashboard';
import type { BiRole, BiSummary } from './bi.api';
import { getBiSummary } from './bi.api';

type BiDashboardPanelProps = {
  role: BiRole;
};

export default function BiDashboardPanel({ role }: BiDashboardPanelProps) {
  const { token } = useAuth();
  const [summary, setSummary] = useState<BiSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    void getBiSummary(token, role)
      .then((data) => {
        if (!active) return;
        setError(null);
        setSummary(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load BI dashboard');
      });

    return () => {
      active = false;
    };
  }, [role, token]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-[var(--color-error)] bg-[var(--tint-error)] p-4 text-sm text-[var(--color-error)]">
        Missing auth token. Please login again.
      </div>
    );
  }

  if (!summary && !error) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)] shadow-sm">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--color-error)] bg-[var(--tint-error)] p-4 text-sm text-[var(--color-error)]">
        {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted-foreground)] shadow-sm">
        No BI data available yet.
      </div>
    );
  }

  return <BiDashboard summary={summary} mode={role} />;
}
