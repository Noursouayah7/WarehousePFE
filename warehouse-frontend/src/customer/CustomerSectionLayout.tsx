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
        { label: 'Products', href: '/customer/products', icon: 'products' as const },
        { label: 'My Orders', href: '/customer/orders', icon: 'orders' as const },
        { label: 'Shipment Tracking', href: '/customer/shipment-tracking', icon: 'shipments' as const },
        { label: 'Reclamations', href: '/customer/reclamations', icon: 'users' as const },
        { label: 'Profile', href: '/customer/profile', icon: 'users' as const },
      ],
    },
  ];

  return (
    <WorkspaceShell
      title={title}
      description={description}
      roleLabel="Customer"
      roleColor="var(--role-customer)"
      profileHref="/customer/profile"
      navGroups={navGroups}
    >
      {children}
    </WorkspaceShell>
  );
}
