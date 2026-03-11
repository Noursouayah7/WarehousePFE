'use client';

import { useAuth } from '@/app/src/auth/AuthProvider';

export default function AdminPage() {
  const { logout } = useAuth();

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a',
      fontFamily: "'DM Mono', monospace", color: '#fff',
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid #1a1a1a',
        padding: '16px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '24px', height: '24px', background: '#f0c040',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }} />
          <span style={{ fontSize: '13px', letterSpacing: '0.2em' }}>CEREBRO WMS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{
            background: '#f0c040', color: '#0a0a0a',
            padding: '4px 12px', fontSize: '10px',
            fontWeight: 700, letterSpacing: '0.2em',
          }}>
            ADMIN
          </span>
          <button onClick={logout} style={{
            background: 'none', border: '1px solid #2a2a2a',
            color: '#555', padding: '6px 16px',
            fontSize: '11px', letterSpacing: '0.15em',
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            LOGOUT
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '60px 40px' }}>
        <p style={{ color: '#333', fontSize: '11px', letterSpacing: '0.3em', marginBottom: '12px' }}>
          DASHBOARD
        </p>
        <h1 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '8px' }}>
          ADMIN PANEL
        </h1>
        <p style={{ color: '#555', fontSize: '13px', letterSpacing: '0.1em' }}>
          Full system access — users, warehouses, blocs, products
        </p>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '48px' }}>
          {[
            { label: 'USERS', value: '—', accent: '#f0c040' },
            { label: 'WAREHOUSES', value: '—', accent: '#4af0a0' },
            { label: 'BLOCS', value: '—', accent: '#4aa0f0' },
            { label: 'PRODUCTS', value: '—', accent: '#f04a4a' },
          ].map(card => (
            <div key={card.label} style={{
              background: '#111', border: '1px solid #1a1a1a',
              padding: '24px',
            }}>
              <div style={{ width: '3px', height: '24px', background: card.accent, marginBottom: '16px' }} />
              <p style={{ color: '#555', fontSize: '10px', letterSpacing: '0.25em', marginBottom: '8px' }}>
                {card.label}
              </p>
              <p style={{ fontSize: '28px', fontWeight: 700 }}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}