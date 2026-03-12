'use client';

import { useAuth } from '@/src/auth/AuthProvider';

export default function TechnicienPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-10 py-4">
        <div className="flex items-center gap-3">
          <div
            className="h-6 w-6 bg-[#4aa0f0]"
            style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
          />
          <span className="text-[13px] tracking-[0.2em]">CEREBRO WMS</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="bg-[#4aa0f0] px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-[#0a0a0a]">
            TECHNICIEN
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
        <p className="mb-3 text-[11px] tracking-[0.3em] text-[#333]">
          DASHBOARD
        </p>
        <h1 className="mb-2 text-4xl font-bold tracking-[0.05em]">
          TECHNICIEN PANEL
        </h1>
        <p className="text-[13px] tracking-[0.1em] text-[#555]">
          Product management — inventory operations
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {[
            { label: 'MY PRODUCTS', value: '—', accent: '#4aa0f0' },
            { label: 'LOW STOCK', value: '—', accent: '#f04a4a' },
          ].map(card => (
            <div key={card.label} className="border border-[#1a1a1a] bg-[#111] p-6">
              <div className="mb-4 h-6 w-[3px]" style={{ background: card.accent }} />
              <p className="mb-2 text-[10px] tracking-[0.25em] text-[#555]">
                {card.label}
              </p>
              <p className="text-[28px] font-bold">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}