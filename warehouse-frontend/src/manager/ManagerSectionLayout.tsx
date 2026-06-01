'use client';

import { ReactNode } from 'react';
import WorkspaceShell from '@/src/common/WorkspaceShell';

type ManagerSectionLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  showHero?: boolean;
};

export default function ManagerSectionLayout({ title, description, children, showHero }: ManagerSectionLayoutProps) {
  const navGroups = [
    {
      label: 'General',
      items: [
        { label: 'Dashboard', href: '/manager', icon: 'dashboard' as const },
        { label: 'Assistant', href: '/assistant', icon: 'assistant' as const },
      ],
    },
    {
      label: 'Workflow',
      items: [
        { label: 'Orders', href: '/manager/orders', icon: 'orders' as const },
        { label: 'Shipments', href: '/manager/shipments', icon: 'shipments' as const },
        { label: 'Support tickets', href: '/manager/support-tickets', icon: 'users' as const },
        { label: 'Reclamations', href: '/manager/reclamations', icon: 'users' as const },
      ],
    },
    {
      label: 'Inventory',
      items: [
        { label: 'Products', href: '/manager/products', icon: 'products' as const },
        { label: 'Warehouses', href: '/manager/warehouses', icon: 'warehouses' as const },
      ],
    },
  ];

  return (
    <WorkspaceShell
      title={title}
      description={description}
      roleLabel="Manager"
      roleColor="var(--role-manager)"
      profileHref="/manager/profile"
      navGroups={navGroups}
      showHero={showHero}
    >
      {children}
    </WorkspaceShell>
  );
}
