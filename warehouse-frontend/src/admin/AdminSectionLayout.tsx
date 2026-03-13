'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';

type AdminSectionLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const adminCards = [
  { label: 'USERS', href: '/admin/users', accent: '#f0c040' },
  { label: 'WAREHOUSES', href: '/admin/warehouses', accent: '#4af0a0' },
  { label: 'PRODUCTS', href: '/admin/products', accent: '#f04a4a' },
];

export default function AdminSectionLayout({ title, description, children }: AdminSectionLayoutProps) {
  const { logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-10 py-4">
        <div className="flex items-center gap-3">
          <div
            className="h-6 w-6 bg-[#f0c040]"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          />
          <span className="text-[13px] tracking-[0.2em]">CEREBRO WMS</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="bg-[#f0c040] px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-[#0a0a0a]">
            ADMIN
          </span>
          <button
            onClick={logout}
            className="cursor-pointer border border-[#2a2a2a] bg-transparent px-4 py-1.5 text-[11px] tracking-[0.15em] text-[#555] transition-colors hover:border-[#3a3a3a] hover:text-[#888]"
          >
            LOGOUT
          </button>
        </div>
      </div>

      <div className="px-[40px] py-[60px]">
        <p className="mb-3 text-[11px] tracking-[0.3em] text-[#333]">DASHBOARD</p>
        <h1 className="mb-2 text-4xl font-bold tracking-[0.05em]">{title}</h1>
        <p className="text-[13px] tracking-[0.1em] text-[#555]">{description}</p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {adminCards.map((card) => {
            const isActive = pathname === card.href;

            return (
              <Link
                key={card.label}
                href={card.href}
                className={[
                  'block border p-6 transition-colors',
                  isActive
                    ? 'border-[#3a3a3a] bg-[#171717]'
                    : 'border-[#1a1a1a] bg-[#111] hover:border-[#2a2a2a] hover:bg-[#141414]',
                ].join(' ')}
              >
                <div className="mb-4 h-6 w-[3px]" style={{ background: card.accent }} />
                <p className="mb-2 text-[10px] tracking-[0.25em] text-[#555]">{card.label}</p>
                <p className="text-sm tracking-[0.12em] text-[#aaa]">OPEN</p>
              </Link>
            );
          })}
        </div>

        {children}
      </div>
    </div>
  );
}
