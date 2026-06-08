'use client';

import { ReactNode } from 'react';
import WorkspaceShell from '@/src/common/WorkspaceShell';

type CustomerSectionLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function CustomerSectionLayout({ title, description, children }: CustomerSectionLayoutProps) {
  const navGroups = [
    {
      label: 'Workspace',
      items: [
        { label: 'My Orders', href: '/customer/orders', icon: 'orders' as const },
        { label: 'Shipment Tracking', href: '/customer/shipment-tracking', icon: 'shipments' as const },
        { label: 'Reclamations', href: '/customer/reclamations', icon: 'users' as const },
      ],
    },
  ];

  return (
    <WorkspaceShell
      title={title}
      description={description}
      roleLabel="Customer"
      roleColor="var(--role-customer)"
      navGroups={navGroups}
    >
      {children}
    </WorkspaceShell>
  );
}
