'use client';

import WorkspaceShell from '@/src/common/WorkspaceShell';

export default function TechnicienPage() {
  const navGroups = [
    {
      label: 'General',
      items: [{ label: 'Dashboard', href: '/technicien', icon: 'dashboard' as const }],
    },
    {
      label: 'Workflow',
      items: [{ label: 'Products', href: '/technicien', icon: 'products' as const }],
    },
  ];

  return (
    <WorkspaceShell
      title="Technician"
      description="Manage products and keep inventory healthy."
      roleLabel="Technicien"
      roleColor="var(--role-technicien)"
      profileHref="/technicien/profile"
      navGroups={navGroups}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: 'My products', value: '—', accent: '#4aa0f0' },
          { label: 'Low stock', value: '—', accent: '#f04a4a' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl bg-[var(--card)] p-6 shadow-sm">
            <div className="mb-4 h-6 w-[3px]" style={{ background: card.accent }} />
            <p className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">{card.label}</p>
            <p className="text-[28px] font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}