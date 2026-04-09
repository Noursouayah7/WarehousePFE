'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';

type NavIcon = 'dashboard' | 'orders' | 'shipments' | 'products' | 'warehouses' | 'users';

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
  profileHref: string;
  navGroups: ShellNavGroup[];
  children: ReactNode;
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

  if (kind === 'warehouses') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={iconClass}>
        <path d="M3 10 12 4l9 6v10H3z" stroke="currentColor" />
        <path d="M9 20v-5h6v5" stroke="currentColor" />
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
}: WorkspaceShellProps) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState('');

  const breadcrumb = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return 'Dashboard';
    return ['Dashboard', ...parts.slice(1).map(formatSegment)].join(' / ');
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex min-h-screen">
        <aside
          className={[
            'sticky top-0 h-screen border-r border-[var(--border)] bg-[var(--sidebar)] p-3 transition-all duration-200',
            collapsed ? 'w-20' : 'w-64',
          ].join(' ')}
        >
          <div className="mb-5 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className="h-6 w-6 flex-shrink-0 rounded-md"
                style={{ backgroundColor: roleColor }}
              />
              {!collapsed && <p className="truncate text-sm font-semibold">Cerebro WMS</p>}
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((current) => !current)}
              className="rounded-md border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted-foreground)]"
            >
              {collapsed ? '>' : '<'}
            </button>
          </div>

          <nav className="space-y-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <p className="mb-1 px-2 text-[11px] font-medium text-[var(--muted-foreground)]">{group.label}</p>
                )}
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={`${group.label}-${item.href}-${item.label}`}>
                        <Link
                          href={item.href}
                          className={[
                            'flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors',
                            isActive
                              ? 'bg-[#eef3ef] text-[var(--foreground)]'
                              : 'text-[var(--muted-foreground)] hover:bg-[#f3f3f1] hover:text-[var(--foreground)]',
                            collapsed ? 'justify-center' : '',
                          ].join(' ')}
                          title={collapsed ? item.label : undefined}
                        >
                          <Icon kind={item.icon} />
                          {!collapsed && <span>{item.label}</span>}
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
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--card)] px-6 py-3 md:px-8">
            <p className="text-sm text-[var(--muted-foreground)]">{breadcrumb}</p>

            <div className="flex items-center gap-3">
              <input
                aria-label="Search"
                placeholder="Search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-52 rounded-md border border-[var(--input)] bg-white px-3 py-1.5 text-sm outline-none focus:border-[var(--ring)]"
              />
              <Link
                href={profileHref}
                className="rounded-md px-2 py-1 text-sm text-[var(--muted-foreground)] hover:bg-[#f3f3f1]"
              >
                Profile
              </Link>
              <button
                onClick={logout}
                className="rounded-md px-2 py-1 text-sm text-[var(--muted-foreground)] hover:bg-[#f3f3f1]"
              >
                Logout
              </button>
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: roleColor }}
                aria-label={roleLabel}
              >
                {roleLabel.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <WorkspaceSearchContext.Provider value={{ query }}>
            <main className="flex-1 px-6 py-8 md:px-10">
              <div className="mb-8">
                <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{description}</p>
              </div>

              {children}
            </main>
          </WorkspaceSearchContext.Provider>
        </div>
      </div>
    </div>
  );
}
