'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import WorkspaceShell from '@/src/common/WorkspaceShell';
import AdminProductsDashbord from '@/src/admin/ProductsDashbord/AdminProductsDashbord';
import { getAdminWarehouses, AdminDashboardWarehouse } from '@/src/admin/WarehousesDashbord/WarehouseDashbord.admin.api';
import { useAuth } from '@/src/auth/AuthProvider';

export default function TechnicienPage() {
  const { token } = useAuth();
  const [warehouses, setWarehouses] = useState<AdminDashboardWarehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Missing auth token. Please login again.');
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);

    void getAdminWarehouses(token)
      .then((data) => {
        if (mounted) {
          setWarehouses(data);
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load warehouse levels');
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const navGroups = [
    {
      label: 'General',
      items: [
        { label: 'Dashboard', href: '/technicien', icon: 'dashboard' as const },
        { label: 'Support tickets', href: '/technicien/tickets', icon: 'users' as const },
      ],
    },
    {
      label: 'Workflow',
      items: [
        { label: 'Products', href: '/technicien', icon: 'products' as const },
        { label: 'Tickets', href: '/technicien/tickets', icon: 'users' as const },
      ],
    },
  ];

  const warehouseCount = useMemo(() => warehouses.length, [warehouses]);
  const blocCount = useMemo(() => warehouses.reduce((sum, warehouse) => sum + warehouse.blocks.length, 0), [warehouses]);
  const lowCapacityBlocks = useMemo(
    () =>
      warehouses.flatMap((warehouse) => warehouse.blocks).filter((bloc) => bloc.capacity > 0 && bloc.currentUsage / bloc.capacity >= 0.8),
    [warehouses],
  );

  return (
    <WorkspaceShell
      title="Technician"
      description="Track warehouse levels, manage products, and raise support tickets."
      roleLabel="Technicien"
      roleColor="var(--role-technicien)"
      profileHref="/technicien/profile"
      navGroups={navGroups}
    >
      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Warehouses</p>
          <p className="mt-2 text-3xl font-semibold">{warehouseCount}</p>
        </div>
        <div className="rounded-xl bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Blocs</p>
          <p className="mt-2 text-3xl font-semibold">{blocCount}</p>
        </div>
        <div className="rounded-xl bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">High usage blocs</p>
          <p className="mt-2 text-3xl font-semibold">{lowCapacityBlocks.length}</p>
        </div>
      </section>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          <span aria-hidden="true">!</span>
          {error}
        </div>
      )}

      <section className="mb-8 rounded-2xl bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Warehouse levels</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Read-only capacity overview for warehouses and blocs.</p>
          </div>
          <Link
            href="/technicien/tickets"
            className="rounded-md bg-[var(--role-technicien)] px-3 py-2 text-sm font-medium text-black"
          >
            Report issue
          </Link>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading warehouse levels...</div>
        ) : (
          <div className="mt-5 space-y-5">
            {warehouses.map((warehouse) => (
              <div key={warehouse.id} className="rounded-xl border border-[var(--border)] p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{warehouse.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{warehouse.description || 'No description'}</p>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">Surface: {warehouse.surface} m²</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                        <th className="px-3 py-2">Bloc</th>
                        <th className="px-3 py-2">Capacity</th>
                        <th className="px-3 py-2">Usage</th>
                        <th className="px-3 py-2">Available</th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehouse.blocks.map((bloc) => {
                        const available = bloc.capacity - bloc.currentUsage;
                        const usagePercent = bloc.capacity > 0 ? (bloc.currentUsage / bloc.capacity) * 100 : 0;

                        return (
                          <tr key={bloc.id}>
                            <td className="rounded-l-lg bg-[#f7f7f5] px-3 py-2">{bloc.name}</td>
                            <td className="bg-[#f7f7f5] px-3 py-2">{bloc.capacity}</td>
                            <td className="bg-[#f7f7f5] px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span>{bloc.currentUsage}</span>
                                <div className="h-2 w-32 overflow-hidden rounded-full bg-[#ebeae6]">
                                  <div
                                    className="h-full"
                                    style={{
                                      width: `${usagePercent}%`,
                                      background: usagePercent > 90 ? '#d64545' : usagePercent > 70 ? '#b26b00' : '#2f8f5b',
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="rounded-r-lg bg-[#f7f7f5] px-3 py-2">{available}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-transparent">
        <AdminProductsDashbord />
      </section>
    </WorkspaceShell>
  );
}