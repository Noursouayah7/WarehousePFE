'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import LanguageSwitcher from '@/src/i18n/LanguageSwitcher';
import { useI18n } from '@/src/i18n/I18nProvider';

type NavIcon = 'dashboard' | 'orders' | 'shipments' | 'products' | 'warehouses' | 'users' | 'assistant' | 'movements' | 'alerts';

type ShellNavItem = {
  label: string;
  href: string;
  icon: NavIcon;
};

type ShellNavGroup = {
  label: string;
  items: ShellNavItem[];
};

type WorkspaceShellProps = {
  title: string;
  description: string;
  roleLabel: string;
  roleColor: string;
  profileHref?: string;
  navGroups: ShellNavGroup[];
  children: ReactNode;
  showHero?: boolean;
};

type WorkspaceSearchContextValue = {
  query: string;
};

const WorkspaceSearchContext = createContext<WorkspaceSearchContextValue>({ query: '' });

export function useWorkspaceSearch() {
  return useContext(WorkspaceSearchContext);
}

function formatSegment(segment: string): string {
  if (!segment) return 'Dashboard';
  return segment
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function labelKey(label: string): string {
  return label
    .replace(/'s/g, '')
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, character: string) => character.toUpperCase())
    .replace(/^[A-Z]/, (character) => character.toLowerCase());
}

function Icon({ kind }: { kind: NavIcon }) {
  const iconClass = 'h-4 w-4 stroke-[1.8]';

  if (kind === 'dashboard') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
        <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" stroke="currentColor" />
      </svg>
    );
  }

  if (kind === 'orders') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
        <path d="M6 4h9l3 3v13H6z" stroke="currentColor" />
        <path d="M9 11h6M9 15h6" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'shipments') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
        <path d="M3 7h13v10H3zM16 10h3l2 2v5h-5z" stroke="currentColor" />
        <circle cx="7" cy="18" r="1.5" fill="currentColor" />
        <circle cx="18" cy="18" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  if (kind === 'products') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
        <path d="M12 3 4 7l8 4 8-4-8-4zM4 7v10l8 4 8-4V7" stroke="currentColor" />
      </svg>
    );
  }

  if (kind === 'movements') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
        <path d="M5 8h14M5 12h9M5 16h14" stroke="currentColor" strokeLinecap="round" />
        <path d="m14 6 3 2-3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === 'alerts') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
        <path d="M12 4 4 18h16z" stroke="currentColor" />
        <path d="M12 9v4M12 16h.01" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  if (kind === 'warehouses') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
        <path d="M3 10 12 4l9 6v10H3z" stroke="currentColor" />
        <path d="M9 20v-5h6v5" stroke="currentColor" />
      </svg>
    );
  }

  if (kind === 'users') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
        <path d="M16 20a4 4 0 0 0-8 0" stroke="currentColor" />
        <circle cx="12" cy="8" r="4" stroke="currentColor" />
      </svg>
    );
  }

  if (kind === 'assistant') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
        <path d="M6 7.5A3.5 3.5 0 0 1 9.5 4h5A3.5 3.5 0 0 1 18 7.5v5A3.5 3.5 0 0 1 14.5 16H11l-4 4v-4H9.5A3.5 3.5 0 0 1 6 12.5z" stroke="currentColor" />
        <path d="M10 8.5h4M10 11h2.5" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
      <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" />
      <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" />
    </svg>
  );
}

export default function WorkspaceShell({
  title,
  description,
  roleLabel,
  roleColor,
  profileHref,
  navGroups,
  children,
  showHero = true,
}: WorkspaceShellProps) {
  const { logout } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');

  const breadcrumb = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return t('common.dashboard');
    return [t('common.dashboard'), ...parts.slice(1).map((part) => t(`nav.${labelKey(formatSegment(part))}`, formatSegment(part)))].join(' / ');
  }, [pathname, t]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(47,118,246,0.14),transparent_30%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.10),transparent_28%)]" />
      <div className="relative flex min-h-screen">
        <aside
          className={[
            'self-stretch border-r border-[var(--border)] bg-[var(--sidebar)]/95 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-200',
            collapsed ? 'w-20' : 'w-64',
          ].join(' ')}
        >
          <div className="mb-5 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className="h-7 w-7 flex-shrink-0 rounded-xl shadow-[0_12px_30px_rgba(37,99,235,0.22)]"
                style={{ backgroundColor: roleColor }}
              />
              {!collapsed && <p className="truncate text-sm font-semibold tracking-[0.08em] text-slate-900">WMS</p>}
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((current) => !current)}
              className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-xs text-slate-500 transition hover:bg-white"
            >
              {collapsed ? '>' : '<'}
            </button>
          </div>

          <nav className="space-y-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t(`nav.${labelKey(group.label)}`, group.label)}</p>
                )}
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={`${group.label}-${item.href}-${item.label}`}>
                        <Link
                          href={item.href}
                          className={[
                            'flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm transition-all duration-200',
                            isActive
                              ? 'bg-white text-slate-950 shadow-[0_12px_30px_rgba(15,23,42,0.08)] ring-1 ring-slate-200'
                              : 'text-slate-500 hover:bg-white/75 hover:text-slate-900',
                            collapsed ? 'justify-center' : '',
                          ].join(' ')}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon kind={item.icon} />
                          {!collapsed && <span>{t(`nav.${labelKey(item.label)}`, item.label)}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] px-6 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl md:mx-6 md:px-8">
            <p className="text-sm font-medium text-slate-500">{breadcrumb}</p>

            <div className="flex items-center gap-3">
              <input
                aria-label="Search"
                placeholder={t('common.search')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-52 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-[var(--ring)] focus:ring-2 focus:ring-[color:var(--ring)]/15"
              />
              <LanguageSwitcher />
              {profileHref && (
                <Link
                  href={profileHref}
                  className="rounded-full px-3 py-2 text-sm text-slate-500 transition hover:bg-white hover:text-slate-900"
                >
                  {t('common.profile')}
                </Link>
              )}
              <button
                onClick={logout}
                className="rounded-full px-3 py-2 text-sm text-slate-500 transition hover:bg-white hover:text-slate-900"
              >
                {t('common.logout')}
              </button>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)]"
                style={{ backgroundColor: roleColor }}
                aria-label={roleLabel}
              >
                {roleLabel.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <WorkspaceSearchContext.Provider value={{ query }}>
            <main className="flex flex-1 px-4 py-8 md:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8">
                {showHero && (
                  <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] px-6 py-7 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl md:px-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('common.workspace')}</p>
                    <h1 className="mt-2 font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                      {title}
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-6">
                  {children}
                </div>
              </div>
            </main>
          </WorkspaceSearchContext.Provider>
        </div>
      </div>
    </div>
  );
}
