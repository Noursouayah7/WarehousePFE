'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { useWorkspaceSearch } from '@/src/common/WorkspaceShell';
import ManagerSectionLayout from './ManagerSectionLayout';
import {
  AdminDashboardWarehouse,
  getAdminWarehouses,
} from '@/src/admin/WarehousesDashbord/WarehouseDashbord.admin.api';

export default function ManagerWarehousesPage() {
  const { token } = useAuth();
  const { query } = useWorkspaceSearch();

  const [warehouses, setWarehouses] = useState<AdminDashboardWarehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'surface' | 'blocs'>('name');

  useEffect(() => {
    if (!token) {
      setError('Missing auth token. Please login again.');
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);

    async function loadData(activeToken: string) {
      try {
        const warehousesData = await getAdminWarehouses(activeToken);
        if (mounted) {
          setWarehouses(warehousesData);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load warehouses');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData(token);

    return () => {
      mounted = false;
    };
  }, [token]);

  const visibleWarehouses = [...warehouses].sort((a, b) => {
    if (sortBy === 'surface') return b.surface - a.surface;
    if (sortBy === 'blocs') return b.blocks.length - a.blocks.length;
    return a.name.localeCompare(b.name);
  }).filter((warehouse) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;
    return [
      String(warehouse.id),
      warehouse.name,
      warehouse.description ?? '',
      String(warehouse.surface),
      String(warehouse.blocks.length),
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  return (
    <ManagerSectionLayout
      title="Warehouses"
      description="Review capacity and bloc allocation in a clean operational view."
      showHero={false}
    >
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as 'name' | 'surface' | 'blocs')}
          className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none"
        >
          <option value="name">Sort: Name</option>
          <option value="surface">Sort: Surface</option>
          <option value="blocs">Sort: Bloc count</option>
        </select>
        <p className="text-sm text-[var(--muted-foreground)]">{visibleWarehouses.length} warehouses</p>
      </section>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          <span aria-hidden="true">!</span>
          {error}
        </div>
      )}

      <section className="rounded-2xl bg-transparent">
        <h2 className="text-lg font-semibold tracking-tight">Warehouse overview</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">View warehouse details and bloc capacities.</p>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading warehouses...</div>
        ) : (
          <div className="mt-5 space-y-6">
            {visibleWarehouses.map((warehouse) => {
              const blocks = Array.isArray(warehouse.blocks) ? warehouse.blocks : [];

              return (
                <div key={warehouse.id} className="rounded-xl bg-[var(--card)] p-6 shadow-sm">
                  <div className="mb-4 h-6 w-[3px] bg-[var(--role-admin)]" />
                  <h3 className="mb-2 text-lg font-semibold">{warehouse.name}</h3>
                  <p className="mb-4 text-sm text-[var(--muted-foreground)]">{warehouse.description || 'No description'}</p>

                  <div className="mb-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-md bg-[var(--muted)] p-3">
                      <p className="text-xs text-[var(--muted-foreground)]">Surface</p>
                      <p className="text-2xl font-bold">{warehouse.surface} m²</p>
                    </div>
                    <div className="rounded-md bg-[var(--muted)] p-3">
                      <p className="text-xs text-[var(--muted-foreground)]">Bloc count</p>
                      <p className="text-2xl font-bold">{blocks.length}</p>
                    </div>
                  </div>

                  {blocks.length > 0 && (
                    <div>
                      <h4 className="mb-3 text-sm font-semibold text-[var(--muted-foreground)]">Blocs</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                          <thead>
                            <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                              <th className="px-3 py-2">ID</th>
                              <th className="px-3 py-2">NAME</th>
                              <th className="px-3 py-2">CAPACITY</th>
                              <th className="px-3 py-2">CURRENT USAGE</th>
                              <th className="px-3 py-2">AVAILABLE</th>
                            </tr>
                          </thead>
                          <tbody>
                            {blocks.map((bloc) => {
                              const available = bloc.capacity - bloc.currentUsage;
                              const usagePercent = bloc.capacity > 0 ? (bloc.currentUsage / bloc.capacity) * 100 : 0;

                              return (
                                <tr key={bloc.id}>
                                  <td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[var(--foreground)]">#{bloc.id}</td>
                                  <td className="bg-[var(--card)] px-3 py-3 font-semibold">{bloc.name}</td>
                                  <td className="bg-[var(--card)] px-3 py-3 text-[var(--muted-foreground)]">{bloc.capacity}</td>
                                  <td className="bg-[var(--card)] px-3 py-3">
                                    <div className="flex items-center gap-2">
                                      <span>{bloc.currentUsage}</span>
                                      <div className="h-2 w-32 overflow-hidden rounded-full bg-[var(--muted)]">
                                        <div
                                          className="h-full transition-all"
                                          style={{
                                            width: `${usagePercent}%`,
                                            background: usagePercent > 90 ? 'var(--color-error)' : usagePercent > 70 ? 'var(--color-warning)' : 'var(--color-success)',
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="rounded-r-lg bg-[var(--card)] px-3 py-3 text-[var(--muted-foreground)]">{available}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {visibleWarehouses.length === 0 && (
              <div className="rounded-lg bg-[var(--muted)] p-6 text-center text-sm text-[var(--muted-foreground)]">
                No warehouses found
              </div>
            )}
          </div>
        )}
      </section>
    </ManagerSectionLayout>
  );
}
