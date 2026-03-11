'use client';

import { useState } from 'react';
import { useLogin } from './uselogin';

export function LoginForm() {
  const { login, error, loading } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login({ email, password });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Mono', monospace",
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '420px',
        padding: '0 24px',
      }}>
        {/* Logo / Brand */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '12px',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '36px', height: '36px',
              background: '#f0c040',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }} />
            <span style={{ color: '#fff', fontSize: '20px', fontWeight: 700, letterSpacing: '0.15em' }}>
              CEREBRO WMS
            </span>
          </div>
          <p style={{ color: '#555', fontSize: '12px', letterSpacing: '0.2em', marginTop: '4px' }}>
            WAREHOUSE MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#111',
          border: '1px solid #222',
          padding: '40px',
        }}>
          <h1 style={{
            color: '#fff', fontSize: '14px',
            letterSpacing: '0.25em', marginBottom: '32px',
            textTransform: 'uppercase',
          }}>
            SYSTEM ACCESS
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#555', fontSize: '11px', letterSpacing: '0.2em' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="user@warehouse.com"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  color: '#fff',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#f0c040'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ color: '#555', fontSize: '11px', letterSpacing: '0.2em' }}>
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #2a2a2a',
                  color: '#fff',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#f0c040'}
                onBlur={e => e.target.style.borderColor = '#2a2a2a'}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#1a0a0a',
                border: '1px solid #5a1a1a',
                color: '#ff6b6b',
                padding: '12px 16px',
                fontSize: '12px',
                letterSpacing: '0.05em',
              }}>
                ⚠ {error.toUpperCase()}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#2a2a2a' : '#f0c040',
                color: loading ? '#555' : '#0a0a0a',
                border: 'none',
                padding: '14px',
                fontSize: '12px',
                fontFamily: 'inherit',
                fontWeight: 700,
                letterSpacing: '0.25em',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                marginTop: '8px',
              }}
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN →'}
            </button>
          </form>
        </div>

        <p style={{ color: '#333', fontSize: '11px', textAlign: 'center', marginTop: '24px', letterSpacing: '0.1em' }}>
          CEREBRO SOLUTIONS © 2026
        </p>
      </div>
    </div>
  );
}