'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import WorkspaceShell from '@/src/common/WorkspaceShell';
import { useAuth } from '@/src/auth/AuthProvider';
import { AdminDashboardWarehouse, getAdminWarehouses } from '@/src/admin/WarehousesDashbord/WarehouseDashbord.admin.api';
import { TechnicianInventoryMovement, getTechnicianMovements } from './technicien.api';

function percent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

function movementLabel(operationType: TechnicianInventoryMovement['operationType']): string {
  switch (operationType) {
    case 'STOCK_IN':
      return 'Stock in';
    case 'STOCK_OUT':
      return 'Stock out';
    case 'TRANSFER':
      return 'Transfer';
    case 'DAMAGE':
      return 'Damaged items';
    case 'RESTOCK':
      return 'Restock';
    case 'SHIPMENT_CREATED':
      return 'Shipment created';
    case 'ORDER_APPROVED':
      return 'Order approved';
  }
}

export default function TechnicienPage() {
  const { token } = useAuth();
  const [warehouses, setWarehouses] = useState<AdminDashboardWarehouse[]>([]);
  const [movements, setMovements] = useState<TechnicianInventoryMovement[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    const refresh = async () => {
      try {
        const [warehouseData, movementData] = await Promise.all([
          getAdminWarehouses(token),
          getTechnicianMovements(token, 40),
        ]);

        if (!active) return;

        setWarehouses(warehouseData);
        setMovements(movementData);
        setError(null);
        setHasLoaded(true);
        setLastUpdated(new Date().toISOString());
      } catch (err: unknown) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load technician dashboard');
        setHasLoaded(true);
      }
    };

    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(interval);
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
  ];

  const warehouseCount = useMemo(() => warehouses.length, [warehouses]);
  const blocCount = useMemo(() => warehouses.reduce((sum, warehouse) => sum + warehouse.blocks.length, 0), [warehouses]);
  const highUsageBlocks = useMemo(
    () => warehouses.flatMap((warehouse) => warehouse.blocks).filter((bloc) => bloc.capacity > 0 && bloc.currentUsage / bloc.capacity >= 0.8),
    [warehouses],
  );
  const totalCapacity = useMemo(
    () => warehouses.reduce((sum, warehouse) => sum + warehouse.blocks.reduce((blocSum, bloc) => blocSum + bloc.capacity, 0), 0),
    [warehouses],
  );
  const totalUsage = useMemo(
    () => warehouses.reduce((sum, warehouse) => sum + warehouse.blocks.reduce((blocSum, bloc) => blocSum + bloc.currentUsage, 0), 0),
    [warehouses],
  );
  const occupancyRate = percent(totalUsage, totalCapacity);
  const stockInCount = useMemo(() => movements.filter((movement) => movement.operationType === 'STOCK_IN' || movement.operationType === 'RESTOCK').length, [movements]);
  const stockOutCount = useMemo(() => movements.filter((movement) => movement.operationType === 'STOCK_OUT' || movement.operationType === 'DAMAGE').length, [movements]);
  const transferCount = useMemo(() => movements.filter((movement) => movement.operationType === 'TRANSFER').length, [movements]);
  const restockRequests = useMemo(
    () => movements.filter((movement) => movement.operationType === 'SHIPMENT_CREATED' && (movement.note?.toLowerCase().includes('restock') ?? false)),
    [movements],
  );
  const latestMovement = movements[0] ?? null;

  return (
    <WorkspaceShell
      title="Technician"
      description="Track warehouse levels and real inventory movements in a live operational view."
      roleLabel="Technicien"
      roleColor="var(--role-technicien)"
      profileHref="/technicien/profile"
      navGroups={navGroups}
    >
      <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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
          <p className="mt-2 text-3xl font-semibold">{highUsageBlocks.length}</p>
        </div>
        <div className="rounded-xl bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Occupancy</p>
          <p className="mt-2 text-3xl font-semibold">{occupancyRate}%</p>
        </div>
        <div className="rounded-xl bg-[var(--card)] p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Movements</p>
          <p className="mt-2 text-3xl font-semibold">{movements.length}</p>
        </div>
      </section>

      {!token ? (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          <span aria-hidden="true">!</span>
          Missing auth token. Please login again.
        </div>
      ) : error ? (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          <span aria-hidden="true">!</span>
          {error}
        </div>
      ) : null}

      <section className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-[var(--card)] p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Warehouse levels</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">Read-only capacity overview for warehouses and blocs.</p>
            </div>
            <Link href="/technicien/tickets" className="rounded-md bg-[var(--role-technicien)] px-3 py-2 text-sm font-medium text-black">
              Report issue
            </Link>
          </div>

          {!hasLoaded && token ? (
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
        </div>

        <div className="grid gap-5">
          <div className="rounded-2xl bg-[var(--card)] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Real-time flow</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Latest movement</h2>
              </div>
              <span className="rounded-full bg-[var(--tint-success)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">Synced</span>
            </div>

            {latestMovement ? (
              <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-[#fbfbf8] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{movementLabel(latestMovement.operationType)}</p>
                <p className="mt-2 text-lg font-semibold text-[#22311b]">{latestMovement.productName}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Qty {latestMovement.quantity} · {latestMovement.sourceBloc?.name ?? '—'} → {latestMovement.destinationBloc?.name ?? (latestMovement.order ? `Order #${latestMovement.order.id}` : latestMovement.shipment ? `Shipment #${latestMovement.shipment.id}` : '—')}
                </p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">{formatDate(latestMovement.createdAt)}</p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">Responsible: {latestMovement.technician?.name || latestMovement.technician?.email || 'Unknown'}</p>
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-dashed border-[var(--border)] px-4 py-8 text-sm text-[var(--muted-foreground)]">
                No inventory movements yet.
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-[#f3f7ee] px-4 py-3 text-[#4b5f31]">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Stock in</p>
                <p className="mt-1 text-2xl font-semibold">{stockInCount}</p>
              </div>
              <div className="rounded-xl bg-[#f7f3ea] px-4 py-3 text-[#7e6a32]">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Stock out</p>
                <p className="mt-1 text-2xl font-semibold">{stockOutCount}</p>
              </div>
              <div className="rounded-xl bg-[#eef6f2] px-4 py-3 text-[#30533f]">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">Transfers</p>
                <p className="mt-1 text-2xl font-semibold">{transferCount}</p>
              </div>
            </div>

            {lastUpdated && <p className="mt-4 text-xs text-[var(--muted-foreground)]">Last synced: {formatDate(lastUpdated)}</p>}
          </div>

          <div className="rounded-2xl bg-[var(--card)] p-6 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Low stock alerts</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">High usage blocs</h2>
            <div className="mt-4 space-y-3">
              {highUsageBlocks.slice(0, 4).map((bloc) => {
                const warehouse = warehouses.find((item) => item.id === bloc.warehouseId);
                const usagePercent = percent(bloc.currentUsage, bloc.capacity);
                return (
                  <div key={bloc.id} className="rounded-xl border border-[var(--border)] bg-[#fbfbf8] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-[#22311b]">{bloc.name}</p>
                      <span className="text-xs text-[var(--muted-foreground)]">{usagePercent}%</span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{warehouse?.name || 'Unknown warehouse'}</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ece9e1]">
                      <div className="h-full rounded-full bg-[linear-gradient(90deg,_#c7923f_0%,_#6c3f1a_100%)]" style={{ width: `${usagePercent}%` }} />
                    </div>
                  </div>
                );
              })}
              {highUsageBlocks.length === 0 && (
                <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">No high usage blocs right now.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--card)] p-6 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Technician notifications</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Restock requests</h2>
            <div className="mt-4 space-y-3">
              {restockRequests.slice(0, 4).map((movement) => (
                <div key={movement.id} className="rounded-xl border border-[var(--border)] bg-[#fbfbf8] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-[#22311b]">{movement.productName}</p>
                    <span className="rounded-full bg-[var(--tint-warning)] px-3 py-1 text-xs font-semibold text-[var(--color-warning)]">Request</span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Quantity: {movement.quantity}</p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">{movement.note ?? 'Restock request received'}</p>
                  <p className="mt-2 text-xs text-[var(--muted-foreground)]">{formatDate(movement.createdAt)}</p>
                </div>
              ))}
              {restockRequests.length === 0 && (
                <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">No restock requests yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Movement history</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Real inventory operations</h2>
          </div>
          <span className="rounded-full bg-[var(--tint-info)] px-3 py-1 text-xs font-semibold text-[var(--color-info)]">Database-backed</span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Source bloc</th>
                <th className="px-3 py-2">Destination</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Operation</th>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Responsible</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => {
                const sourceBloc = movement.sourceBloc ? `${movement.sourceBloc.name} / ${movement.sourceBloc.warehouse.name}` : '—';
                const destination = movement.destinationBloc
                  ? `${movement.destinationBloc.name} / ${movement.destinationBloc.warehouse.name}`
                  : movement.order
                    ? `Order #${movement.order.id}`
                    : movement.shipment
                      ? `Shipment #${movement.shipment.id}`
                      : '—';

                return (
                  <tr key={movement.id}>
                    <td className="rounded-l-lg bg-[#f7f7f5] px-3 py-2 font-medium text-[#22311b]">{movement.productName}</td>
                    <td className="bg-[#f7f7f5] px-3 py-2">{sourceBloc}</td>
                    <td className="bg-[#f7f7f5] px-3 py-2">{destination}</td>
                    <td className="bg-[#f7f7f5] px-3 py-2">{movement.quantity}</td>
                    <td className="bg-[#f7f7f5] px-3 py-2">{movementLabel(movement.operationType)}</td>
                    <td className="bg-[#f7f7f5] px-3 py-2">{formatDate(movement.createdAt)}</td>
                    <td className="rounded-r-lg bg-[#f7f7f5] px-3 py-2">{movement.technician?.name || movement.technician?.email || 'Unknown'}</td>
                  </tr>
                );
              })}
              {movements.length === 0 && (
                <tr>
                  <td className="rounded-lg bg-[#f7f7f5] px-3 py-4 text-sm text-[var(--muted-foreground)]" colSpan={7}>
                    No operations recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </WorkspaceShell>
  );
}