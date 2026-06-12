'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import WorkspaceShell from '@/src/common/WorkspaceShell';
import { useAuth } from '@/src/auth/AuthProvider';
import BiDashboardPanel from '@/src/bi/BiDashboardPanel';
import { useI18n } from '@/src/i18n/I18nProvider';
import { AdminDashboardWarehouse, getAdminWarehouses } from '@/src/admin/WarehousesDashbord/WarehouseDashbord.admin.api';
import {
  completeRestockAlert,
  getRestockAlerts,
  markRestockAlertInTransit,
  RestockAlert,
} from '@/src/common/restock-alerts.api';
import { TechnicianInventoryMovement, getTechnicianMovements, TechnicianProduct, getTechnicianProducts, transferProduct } from './technicien.api';

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
    case 'RESTOCK_ALERT':
      return 'Restock alert';
  }
}

function restockStatusMeta(status: RestockAlert['status']): { label: string; className: string } {
  if (status === 'COMPLETED') {
    return { label: 'Completed', className: 'bg-[var(--tint-success)] text-[var(--color-success)]' };
  }

  if (status === 'IN_PROGRESS') {
    return { label: 'In progress', className: 'bg-[var(--tint-info)] text-[var(--color-info)]' };
  }

  return { label: 'Pending', className: 'bg-[var(--tint-warning)] text-[var(--color-warning)]' };
}

export default function TechnicienPage() {
  const { token } = useAuth();
  const { tx } = useI18n();
  const pathname = usePathname();
  const isMovementsPage = pathname.endsWith('/technicien/mouvements');
  const isRestockAlertsPage = pathname.endsWith('/technicien/restock-alerts');
  const isDashboardPage = pathname === '/technicien';
  const [warehouses, setWarehouses] = useState<AdminDashboardWarehouse[]>([]);
  const [restockAlerts, setRestockAlerts] = useState<RestockAlert[]>([]);
  const [movements, setMovements] = useState<TechnicianInventoryMovement[]>([]);
  const [products, setProducts] = useState<TechnicianProduct[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveForm, setMoveForm] = useState<{ productId: string; quantity: string; destinationBlocId: string; note: string }>({ productId: '', quantity: '', destinationBlocId: '', note: '' });
  const [isMoveLoading, setIsMoveLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    const refresh = async () => {
      try {
        let warehouseData: AdminDashboardWarehouse[] = [];
        let movementData: TechnicianInventoryMovement[] = [];
        let alertData: RestockAlert[] = [];
        let productData: TechnicianProduct[] = [];

        if (isMovementsPage) {
          [warehouseData, movementData, productData] = await Promise.all([
            getAdminWarehouses(token),
            getTechnicianMovements(token, 40),
            getTechnicianProducts(token),
          ]);
        } else if (isRestockAlertsPage) {
          [warehouseData, alertData] = await Promise.all([getAdminWarehouses(token), getRestockAlerts(token)]);
        } else {
          [warehouseData, movementData] = await Promise.all([getAdminWarehouses(token), getTechnicianMovements(token, 40)]);
        }

        if (!active) return;

        setWarehouses(warehouseData);
        setMovements(movementData);
        setRestockAlerts(alertData);
        setProducts(productData);
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
  }, [token, isMovementsPage, isRestockAlertsPage]);

  const navGroups = [
    {
      label: 'General',
      items: [
        { label: 'Dashboard', href: '/technicien', icon: 'dashboard' as const },
        { label: 'Support tickets', href: '/technicien/tickets', icon: 'users' as const },
      ],
    },
    {
      label: 'Warehouse inventory',
      items: [
        { label: 'Movements', href: '/technicien/mouvements', icon: 'movements' as const },
        { label: 'Restock alerts', href: '/technicien/restock-alerts', icon: 'alerts' as const },
      ],
    },
  ];

  const highUsageBlocks = useMemo(
    () => warehouses.flatMap((warehouse) => warehouse.blocks).filter((bloc) => bloc.capacity > 0 && bloc.currentUsage / bloc.capacity >= 0.8),
    [warehouses],
  );
  const stockInCount = useMemo(() => movements.filter((movement) => movement.operationType === 'STOCK_IN' || movement.operationType === 'RESTOCK').length, [movements]);
  const stockOutCount = useMemo(() => movements.filter((movement) => movement.operationType === 'STOCK_OUT' || movement.operationType === 'DAMAGE').length, [movements]);
  const transferCount = useMemo(() => movements.filter((movement) => movement.operationType === 'TRANSFER').length, [movements]);
  const latestMovement = movements[0] ?? null;

  async function handleMoveProduct() {
    if (!token || !moveForm.productId || !moveForm.quantity || !moveForm.destinationBlocId) {
      setError('Select product, quantity, and destination bloc');
      return;
    }

    setIsMoveLoading(true);

    try {
      await transferProduct(token, Number(moveForm.productId), Number(moveForm.destinationBlocId), Number(moveForm.quantity), moveForm.note || undefined);
      
      const [warehouseData, movementData, alertData, productData] = await Promise.all([
        getAdminWarehouses(token),
        getTechnicianMovements(token, 40),
        getRestockAlerts(token),
        getTechnicianProducts(token),
      ]);

      setWarehouses(warehouseData);
      setMovements(movementData);
      setRestockAlerts(alertData);
      setProducts(productData);
      
      setSuccessMessage('Product moved successfully');
      setIsMoveModalOpen(false);
      setMoveForm({ productId: '', quantity: '', destinationBlocId: '', note: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to move product');
    } finally {
      setIsMoveLoading(false);
    }
  }

  async function runAlertAction(alertId: number, action: (activeToken: string) => Promise<void>) {
    if (!token) {
      setError('Missing auth token. Please login again.');
      return;
    }

    try {
      await action(token);
      await Promise.all([getAdminWarehouses(token), getTechnicianMovements(token, 40), getRestockAlerts(token)]).then(
        ([warehouseData, movementData, alertData]) => {
          setWarehouses(warehouseData);
          setMovements(movementData);
          setRestockAlerts(alertData);
        },
      );
      setSuccessMessage(`Alert #${alertId} updated successfully.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update restock alert');
    }
  }

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setSuccessMessage(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  return (
    <WorkspaceShell
      title={isMovementsPage ? 'Movements' : isRestockAlertsPage ? 'Restock alerts' : 'Technician'}
      description={
        isMovementsPage
          ? 'Review product stock and move inventory between blocs.'
          : isRestockAlertsPage
            ? 'Track and process restock alerts in one focused queue.'
          : 'Track warehouse levels and real inventory movements in a live operational view.'
      }
      roleLabel="Technicien"
      roleColor="var(--role-technicien)"
      profileHref="/technicien/profile"
      navGroups={navGroups}
    >
      {isDashboardPage && (
        <div className="mb-8">
          <BiDashboardPanel role="TECHNICIEN" />
        </div>
      )}

      {!token ? (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          <span aria-hidden="true">!</span>
          {tx('Missing auth token. Please login again.')}
        </div>
      ) : error ? (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          <span aria-hidden="true">!</span>
          {error}
        </div>
      ) : null}

      {successMessage && (
        <div className="fixed right-6 top-6 z-[60] max-w-sm rounded-2xl border border-[var(--color-success)] bg-[var(--tint-success)] px-4 py-3 text-sm font-medium text-[var(--color-success)] shadow-lg">
          {successMessage}
        </div>
      )}

      {isDashboardPage && (
      <section className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl bg-[var(--card)] p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{tx('Warehouse levels')}</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{tx('Read-only capacity overview for warehouses and blocs.')}</p>
            </div>
            <Link href="/technicien/tickets" className="rounded-md bg-[var(--role-technicien)] px-3 py-2 text-sm font-medium text-black">
              {tx('Report issue')}
            </Link>
          </div>

          {!hasLoaded && token ? (
            <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">{tx('Loading warehouse levels...')}</div>
          ) : (
            <div className="mt-5 space-y-5">
              {warehouses.map((warehouse) => (
                <div key={warehouse.id} className="rounded-xl border border-[var(--border)] p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{warehouse.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{warehouse.description || tx('No description')}</p>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">{tx('Surface')}: {warehouse.surface} m²</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                      <thead>
                        <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                          <th className="px-3 py-2">{tx('Bloc')}</th>
                          <th className="px-3 py-2">{tx('Capacity')}</th>
                          <th className="px-3 py-2">{tx('Usage')}</th>
                          <th className="px-3 py-2">{tx('Available')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {warehouse.blocks.map((bloc) => {
                          const available = bloc.capacity - bloc.currentUsage;
                          const usagePercent = bloc.capacity > 0 ? (bloc.currentUsage / bloc.capacity) * 100 : 0;

                          return (
                            <tr key={bloc.id}>
                                <td className="rounded-l-lg bg-[var(--muted)] px-3 py-2">{bloc.name}</td>
                                  <td className="bg-[var(--muted)] px-3 py-2">{bloc.capacity}</td>
                                  <td className="bg-[var(--muted)] px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <span>{bloc.currentUsage}</span>
                                  <div className="h-2 w-32 overflow-hidden rounded-full bg-[var(--muted)]">
                                    <div
                                      className="h-full"
                                      style={{
                                        width: `${usagePercent}%`,
                                        background: usagePercent > 90 ? 'var(--color-error)' : usagePercent > 70 ? 'var(--color-warning)' : 'var(--color-success)',
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="rounded-r-lg bg-[var(--muted)] px-3 py-2">{available}</td>
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
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">{tx('Real-time flow')}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{tx('Latest movement')}</h2>
              </div>
              <span className="rounded-full bg-[var(--tint-success)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">{tx('Synced')}</span>
            </div>

            {latestMovement ? (
              <div className="mt-5 rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{tx(movementLabel(latestMovement.operationType))}</p>
                <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{latestMovement.productName}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {tx('Qty')} {latestMovement.quantity} · {latestMovement.sourceBloc?.name ?? '—'} → {latestMovement.destinationBloc?.name ?? (latestMovement.order ? `${tx('Order')} #${latestMovement.order.id}` : latestMovement.shipment ? `${tx('Shipment')} #${latestMovement.shipment.id}` : '—')}
                </p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">{formatDate(latestMovement.createdAt)}</p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">{tx('Responsible')}: {latestMovement.technician?.name || latestMovement.technician?.email || tx('Unknown')}</p>
              </div>
            ) : (
              <div className="mt-5 rounded-[22px] border border-dashed border-[var(--border)] px-4 py-8 text-sm text-[var(--muted-foreground)]">
                {tx('No inventory movements yet.')}
              </div>
            )}

              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-[var(--tint-success)] px-4 py-3 text-[var(--color-success)]">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">{tx('Stock in')}</p>
                <p className="mt-1 text-2xl font-semibold">{stockInCount}</p>
              </div>
              <div className="rounded-xl bg-[var(--tint-warning)] px-4 py-3 text-[var(--color-warning)]">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">{tx('Stock out')}</p>
                <p className="mt-1 text-2xl font-semibold">{stockOutCount}</p>
              </div>
              <div className="rounded-xl bg-[var(--tint-info)] px-4 py-3 text-[var(--color-info)]">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70">{tx('Transfers')}</p>
                <p className="mt-1 text-2xl font-semibold">{transferCount}</p>
              </div>
            </div>

            {lastUpdated && <p className="mt-4 text-xs text-[var(--muted-foreground)]">{tx('Last synced')}: {formatDate(lastUpdated)}</p>}
          </div>

          <div className="rounded-2xl bg-[var(--card)] p-6 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">{tx('Low stock alerts')}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{tx('High usage blocs')}</h2>
            <div className="mt-4 space-y-3">
              {highUsageBlocks.slice(0, 4).map((bloc) => {
                const warehouse = warehouses.find((item) => item.id === bloc.warehouseId);
                const usagePercent = percent(bloc.currentUsage, bloc.capacity);
                return (
                  <div key={bloc.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-[var(--foreground)]">{bloc.name}</p>
                      <span className="text-xs text-[var(--muted-foreground)]">{usagePercent}%</span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{warehouse?.name || tx('Unknown warehouse')}</p>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                            <div className="h-full rounded-full bg-[linear-gradient(90deg,_var(--color-warning)_0%,_var(--role-admin)_100%)]" style={{ width: `${usagePercent}%` }} />
                    </div>
                  </div>
                );
              })}
              {highUsageBlocks.length === 0 && (
                <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--muted-foreground)]">{tx('No high usage blocs right now.')}</p>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {isMovementsPage && (
      <section id="warehouse-inventory" className="mb-8 rounded-2xl bg-[var(--card)] p-6 shadow-sm scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">{tx('Warehouse inventory')}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{tx('Products')}</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMoveModalOpen(true)}
            className="rounded-md bg-[var(--tint-info)] px-3 py-2 text-xs font-semibold text-[var(--color-info)]"
          >
            {tx('Move product')}
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                <th className="px-3 py-2">{tx('Product')}</th>
                <th className="px-3 py-2">{tx('Qty')}</th>
                <th className="px-3 py-2">{tx('Price')}</th>
                <th className="px-3 py-2">{tx('Warehouse')}</th>
                <th className="px-3 py-2">{tx('Bloc')}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="rounded-l-lg bg-[var(--muted)] px-3 py-2 font-medium text-[var(--foreground)]">{product.name}</td>
                  <td className="bg-[var(--muted)] px-3 py-2">{product.quantity}</td>
                  <td className="bg-[var(--muted)] px-3 py-2">${product.price.toFixed(2)}</td>
                  <td className="bg-[var(--muted)] px-3 py-2">{product.warehouseName}</td>
                  <td className="rounded-r-lg bg-[var(--muted)] px-3 py-2">{product.blocName}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td className="rounded-lg bg-[var(--muted)] px-3 py-4 text-sm text-[var(--muted-foreground)]" colSpan={5}>
                    {tx('No products in warehouse.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {isRestockAlertsPage && (
      <section className="mb-8 rounded-2xl bg-[var(--card)] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">{tx('Technician alerts')}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{tx('Restock Alerts')}</h2>
          </div>
          <span className="rounded-full bg-[var(--tint-warning)] px-3 py-1 text-xs font-semibold text-[var(--color-warning)]">{tx('Live queue')}</span>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {restockAlerts.map((alert) => {
            const status = restockStatusMeta(alert.status);

            return (
              <div key={alert.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{alert.productName}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{tx('Warehouse')}: {alert.warehouse.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{tx('Bloc')}: {alert.bloc.name}</p>
                  </div>
                  <span className={[ 'rounded-full px-3 py-1 text-xs font-semibold', status.className ].join(' ')}>{tx(status.label)}</span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-white px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{tx('Requested quantity')}</p>
                    <p className="mt-1 text-xl font-semibold">{alert.requestedQuantity}</p>
                  </div>
                  <div className="rounded-xl bg-white px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">{tx('Priority')}</p>
                    <p className="mt-1 text-xl font-semibold">{alert.priority}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-[var(--muted-foreground)]">
                  <p className="font-medium text-[var(--foreground)]">{tx('Manager note')}</p>
                  <p className="mt-1">{alert.managerNote ?? tx('No note provided.')}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void runAlertAction(alert.id, async (activeToken) => {
                      await markRestockAlertInTransit(activeToken, alert.id);
                    })}
                    disabled={alert.status !== 'PENDING'}
                    className="rounded-md bg-[var(--tint-info)] px-3 py-2 text-xs font-semibold text-[var(--color-info)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {tx('In transit')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void runAlertAction(alert.id, async (activeToken) => {
                      await completeRestockAlert(activeToken, alert.id);
                    })}
                    disabled={alert.status === 'COMPLETED'}
                    className="rounded-md bg-[var(--tint-success)] px-3 py-2 text-xs font-semibold text-[var(--color-success)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {tx('Mark completed')}
                  </button>
                </div>
              </div>
            );
          })}

          {restockAlerts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-sm text-[var(--muted-foreground)] lg:col-span-2">
              {tx('No restock alerts yet.')}
            </div>
          )}
        </div>
      </section>
      )}

      {isDashboardPage && (
      <section id="movements" className="rounded-2xl bg-[var(--card)] p-6 shadow-sm scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">{tx('Movement history')}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{tx('Real inventory operations')}</h2>
          </div>
          <span className="rounded-full bg-[var(--tint-info)] px-3 py-1 text-xs font-semibold text-[var(--color-info)]">{tx('Database-backed')}</span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                <th className="px-3 py-2">{tx('Product')}</th>
                <th className="px-3 py-2">{tx('Source bloc')}</th>
                <th className="px-3 py-2">{tx('Destination')}</th>
                <th className="px-3 py-2">{tx('Qty')}</th>
                <th className="px-3 py-2">{tx('Operation')}</th>
                <th className="px-3 py-2">{tx('Timestamp')}</th>
                <th className="px-3 py-2">{tx('Responsible')}</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => {
                const sourceBloc = movement.sourceBloc ? `${movement.sourceBloc.name} / ${movement.sourceBloc.warehouse.name}` : '—';
                const destination = movement.destinationBloc
                  ? `${movement.destinationBloc.name} / ${movement.destinationBloc.warehouse.name}`
                  : movement.order
                    ? `${tx('Order')} #${movement.order.id}`
                    : movement.shipment
                      ? `${tx('Shipment')} #${movement.shipment.id}`
                      : '—';

                return (
                  <tr key={movement.id}>
                        <td className="rounded-l-lg bg-[var(--card)] px-3 py-2 font-medium text-[var(--foreground)]">{movement.productName}</td>
                        <td className="bg-[var(--card)] px-3 py-2">{sourceBloc}</td>
                        <td className="bg-[var(--card)] px-3 py-2">{destination}</td>
                        <td className="bg-[var(--card)] px-3 py-2">{movement.quantity}</td>
                        <td className="bg-[var(--card)] px-3 py-2">{tx(movementLabel(movement.operationType))}</td>
                        <td className="bg-[var(--card)] px-3 py-2">{formatDate(movement.createdAt)}</td>
                        <td className="rounded-r-lg bg-[var(--card)] px-3 py-2">{movement.technician?.name || movement.technician?.email || tx('Unknown')}</td>
                      </tr>
                );
              })}
              {movements.length === 0 && (
                <tr>
                  <td className="rounded-lg bg-[var(--card)] px-3 py-4 text-sm text-[var(--muted-foreground)]" colSpan={7}>
                    {tx('No operations recorded yet.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}

      {/* Move Product Modal */}
      {isMovementsPage && isMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--popover-foreground)]/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">{tx('Move product between blocs')}</h3>
              <button
                type="button"
                onClick={() => setIsMoveModalOpen(false)}
                className="rounded-lg border border-[var(--input)] bg-white px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]"
              >
                {tx('Close')}
              </button>
            </div>

            <div className="grid gap-3">
              <select
                value={moveForm.productId}
                onChange={(event) => setMoveForm((current) => ({ ...current, productId: event.target.value }))}
                className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-info)]"
              >
                <option value="">{tx('Select product')}</option>
                {products.map((product) => (
                  <option key={product.id} value={String(product.id)}>
                    {product.name} ({product.quantity} {tx('available in')} {product.blocName})
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={moveForm.quantity}
                onChange={(event) => setMoveForm((current) => ({ ...current, quantity: event.target.value }))}
                placeholder={tx('Quantity')}
                min={1}
                className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-info)]"
              />

              <select
                value={moveForm.destinationBlocId}
                onChange={(event) => setMoveForm((current) => ({ ...current, destinationBlocId: event.target.value }))}
                className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-info)]"
              >
                <option value="">{tx('Select destination bloc')}</option>
                {warehouses.flatMap((warehouse) =>
                  warehouse.blocks.map((bloc) => (
                    <option key={bloc.id} value={String(bloc.id)}>
                      {warehouse.name} → {bloc.name} (usage {bloc.currentUsage}/{bloc.capacity})
                    </option>
                  ))
                )}
              </select>

              <textarea
                value={moveForm.note}
                onChange={(event) => setMoveForm((current) => ({ ...current, note: event.target.value }))}
                placeholder={tx('Optional note')}
                className="w-full rounded-lg border border-[var(--input)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--color-info)]"
                rows={3}
              />

              <button
                type="button"
                onClick={() => void handleMoveProduct()}
                disabled={isMoveLoading}
                className="mt-2 rounded-lg border border-[var(--color-info)] bg-[var(--secondary)] px-4 py-2 text-sm font-medium text-[var(--color-info)] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isMoveLoading ? tx('Moving product...') : tx('Execute move')}
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}
