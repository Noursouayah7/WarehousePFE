'use client';

import { ReactNode } from 'react';
import WorkspaceShell from '@/src/common/WorkspaceShell';

type AdminSectionLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function AdminSectionLayout({ title, description, children }: AdminSectionLayoutProps) {
  const navGroups = [
    {
      label: 'General',
      items: [{ label: 'Dashboard', href: '/admin', icon: 'dashboard' as const }],
    },
    {
      label: 'Administration',
      items: [
        { label: 'Users', href: '/admin/users', icon: 'users' as const },
        { label: 'Support tickets', href: '/admin/support-tickets', icon: 'users' as const },
      ],
    },
    {
      label: 'Inventory',
      items: [
        { label: 'Warehouses', href: '/admin/warehouses', icon: 'warehouses' as const },
        { label: 'Products', href: '/admin/products', icon: 'products' as const },
      ],
    },
  ];

  return (
    <WorkspaceShell
      title={title}
      description={description}
      roleLabel="Admin"
      roleColor="var(--role-admin)"
      profileHref="/admin/profile"
      navGroups={navGroups}
    >
      {children}
    </WorkspaceShell>
  );
}
