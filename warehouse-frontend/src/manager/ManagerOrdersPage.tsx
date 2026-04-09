'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import ManagerSectionLayout from './ManagerSectionLayout';
import {
  approveOrder,
  getManagerOrders,
  ManagerOrder,
  markOrderDelivered,
  rejectOrder,
  requestRestock,
} from './manager.api';
import { getAdminWarehouses, WarehouseBloc } from '@/src/admin/WarehousesDashbord/WarehouseDashbord.admin.api';

type RejectForm = {
  reason: string;
  managerNote: string;
};

type RestockForm = {
  blocId: string;
  quantity: string;
  supplierName: string;
  trackingNumber: string;
  expectedAt: string;
  note: string;
};

const defaultRejectForm: RejectForm = { reason: '', managerNote: '' };
const defaultRestockForm: RestockForm = {
  blocId: '',
  quantity: '',
  supplierName: '',
  trackingNumber: '',
  expectedAt: '',
  note: '',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function getOrderBadge(order: ManagerOrder): { label: string; className: string } {
  const normalizedDelivery = order.deliveryStatus.toUpperCase();

  if (order.status === 'REJECTED' || normalizedDelivery.includes('DELAY')) {
    return {
      label: 'Delayed',
      className: 'bg-[var(--tint-error)] text-[var(--color-error)]',
    };
  }

  if (order.status === 'APPROVED' && normalizedDelivery === 'DELIVERED') {
    return {
      label: 'Completed',
      className: 'bg-[var(--tint-success)] text-[var(--color-success)]',
    };
  }

  return {
    label: 'Pending',
    className: 'bg-[var(--tint-warning)] text-[var(--color-warning)]',
  };
}

function getDeliveryDay(value: string | null): string {
  if (!value) return 'No deadline';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No deadline';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function ManagerOrdersPage() {
  const { token } = useAuth();

  const [orders, setOrders] = useState<ManagerOrder[]>([]);
  const [blocs, setBlocs] = useState<WarehouseBloc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [rejectOrderId, setRejectOrderId] = useState<number | null>(null);
  const [rejectForm, setRejectForm] = useState<RejectForm>(defaultRejectForm);

  const [restockOrderId, setRestockOrderId] = useState<number | null>(null);
  const [restockForm, setRestockForm] = useState<RestockForm>(defaultRestockForm);
  const [view, setView] = useState<'table' | 'kanban' | 'calendar'>('table');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'deadline' | 'quantity'>('latest');
  const [showNewOrderHint, setShowNewOrderHint] = useState(false);
  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'PENDING').length,
    [orders],
  );

  const visibleOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      if (statusFilter === 'ALL') return true;
      return order.status === statusFilter;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'quantity') {
        return b.quantity - a.quantity;
      }

      if (sortBy === 'deadline') {
        const timeA = a.deliveryDeadline ? new Date(a.deliveryDeadline).getTime() : Number.MAX_SAFE_INTEGER;
        const timeB = b.deliveryDeadline ? new Date(b.deliveryDeadline).getTime() : Number.MAX_SAFE_INTEGER;
        return timeA - timeB;
      }

      return b.id - a.id;
    });
  }, [orders, sortBy, statusFilter]);

  const calendarGroups = useMemo(() => {
    const grouped = new Map<string, ManagerOrder[]>();

    visibleOrders.forEach((order) => {
      const day = getDeliveryDay(order.deliveryDeadline);
      const current = grouped.get(day) || [];
      grouped.set(day, [...current, order]);
    });

    return Array.from(grouped.entries());
  }, [visibleOrders]);

  async function loadData(activeToken: string) {
    const [ordersData, warehouses] = await Promise.all([
      getManagerOrders(activeToken),
      getAdminWarehouses(activeToken),
    ]);

    setOrders(ordersData);
    setBlocs(warehouses.flatMap((warehouse) => warehouse.blocks));
  }

  useEffect(() => {
    if (!token) {
      setError('Missing auth token. Please login again.');
      setIsLoading(false);
      return;
    }

    let mounted = true;
    setIsLoading(true);
    setError(null);

    void loadData(token)
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  function onRejectInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setRejectForm((current) => ({ ...current, [name]: value }));
  }

  function onRestockInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setRestockForm((current) => ({ ...current, [name]: value }));
  }

  async function runAction(actionKey: string, action: (activeToken: string) => Promise<void>) {
    if (!token) {
      setError('Missing auth token. Please login again.');
      return;
    }

    setBusyAction(actionKey);
    setError(null);

    try {
      await action(token);
      await loadData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setBusyAction(null);
    }
  }

  async function submitReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejectOrderId) return;

    const reason = rejectForm.reason.trim();
    if (!reason) {
      setError('Reject reason is required.');
      return;
    }

    await runAction(`reject-${rejectOrderId}`, async (activeToken) => {
      await rejectOrder(activeToken, rejectOrderId, reason, rejectForm.managerNote.trim() || undefined);
      setRejectOrderId(null);
      setRejectForm(defaultRejectForm);
    });
  }

  async function submitRestock(event: FormEvent<HTMLFormElement>, order: ManagerOrder) {
    event.preventDefault();
    if (!restockOrderId) return;

    const blocId = Number(restockForm.blocId);
    if (!Number.isFinite(blocId) || blocId <= 0) {
      setError('Please select a valid bloc.');
      return;
    }

    const quantityText = restockForm.quantity.trim();
    const quantity = quantityText ? Number(quantityText) : undefined;
    if (quantity !== undefined && (!Number.isFinite(quantity) || quantity <= 0)) {
      setError('Restock quantity must be greater than 0.');
      return;
    }

    await runAction(`restock-${restockOrderId}`, async (activeToken) => {
      await requestRestock(activeToken, restockOrderId, {
        blocId,
        quantity,
        productName: order.productName,
        supplierName: restockForm.supplierName.trim() || undefined,
        trackingNumber: restockForm.trackingNumber.trim() || undefined,
        expectedAt: restockForm.expectedAt || undefined,
        note: restockForm.note.trim() || undefined,
      });
      setRestockOrderId(null);
      setRestockForm(defaultRestockForm);
    });
  }

  return (
    <ManagerSectionLayout
      title="Orders"
      description="Track and process order workflow from request to delivery."
    >
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNewOrderHint(true)}
            className="rounded-md bg-[#eef3ef] px-3 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[#e5eee6]"
          >
            New order
          </button>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED')}
            className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="ALL">Filter: All statuses</option>
            <option value="PENDING">Filter: Pending</option>
            <option value="APPROVED">Filter: Approved</option>
            <option value="REJECTED">Filter: Rejected</option>
          </select>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as 'latest' | 'deadline' | 'quantity')}
            className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="latest">Sort: Latest</option>
            <option value="deadline">Sort: Deadline</option>
            <option value="quantity">Sort: Quantity</option>
          </select>
        </div>

        <div className="inline-flex rounded-md bg-[#f3f3f1] p-1">
          {(['table', 'kanban', 'calendar'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={[
                'rounded px-3 py-1.5 text-sm capitalize transition-colors',
                view === mode
                  ? 'bg-white text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
              ].join(' ')}
            >
              {mode} view
            </button>
          ))}
        </div>
      </section>

      {showNewOrderHint && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-md bg-[#edf3ff] px-3 py-2 text-sm text-[#2d5cc0]">
          <p>Use the customer portal to create new orders, then process them here.</p>
          <button type="button" onClick={() => setShowNewOrderHint(false)} className="text-xs font-medium text-[#2d5cc0]">
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          <span aria-hidden="true">!</span>
          {error}
        </div>
      )}

      {pendingOrdersCount > 0 && (
        <div className="mb-6 flex items-start gap-2 rounded-md bg-[var(--tint-warning)] px-3 py-2 text-sm text-[var(--color-warning)]">
          <span aria-hidden="true">i</span>
          <p>
            {pendingOrdersCount} pending order{pendingOrdersCount > 1 ? 's' : ''} need your review.
          </p>
        </div>
      )}

      <section className="rounded-2xl bg-transparent">
        <h2 className="text-lg font-semibold tracking-tight">Order workflow</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Manage approvals, restocks, and deliveries with a lightweight view.</p>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading orders...</div>
        ) : (
          <>
            {view === 'table' && (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2 text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Deadline</th>
                      <th className="px-3 py-2">Customer</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((order) => {
                  const canApprove = order.status === 'PENDING';
                  const canReject = order.status === 'PENDING' || order.status === 'RESTOCK_REQUESTED';
                  const canRestock = order.status === 'PENDING' || order.status === 'RESTOCK_REQUESTED';
                  const canDeliver = order.status === 'APPROVED' && order.deliveryStatus !== 'DELIVERED';
                  const isRejectOpen = rejectOrderId === order.id;
                  const isRestockOpen = restockOrderId === order.id;
                  const badge = getOrderBadge(order);

                  return (
                    <tr
                      key={order.id}
                      className="align-top"
                    >
                      <td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[#496553]">#{order.id}</td>
                      <td className="bg-[var(--card)] px-3 py-3">
                        <p className="font-semibold">{order.productName}</p>
                        {order.managerNote && <p className="mt-1 text-xs text-[#6b705c]">Note: {order.managerNote}</p>}
                        {order.rejectionReason && <p className="mt-1 text-xs text-[var(--color-error)]">Reason: {order.rejectionReason}</p>}
                      </td>
                      <td className="bg-[var(--card)] px-3 py-3 text-[#496553]">{order.quantity}</td>
                      <td className="bg-[var(--card)] px-3 py-3">
                        <span className={[ 'inline-flex rounded-full px-2.5 py-1 text-xs font-medium', badge.className ].join(' ')}>
                          {badge.label}
                        </span>
                        <p className="mt-2 text-xs text-[#6b705c]">{order.status} / {order.deliveryStatus}</p>
                      </td>
                      <td className="bg-[var(--card)] px-3 py-3 text-xs text-[#5f6f59]">{formatDate(order.deliveryDeadline)}</td>
                      <td className="bg-[var(--card)] px-3 py-3 text-xs text-[#5f6f59]">
                        <p>{order.customerName}</p>
                        <p className="text-[#6b705c]">{order.customerPhone}</p>
                      </td>
                      <td className="rounded-r-lg bg-[var(--card)] px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => runAction(`approve-${order.id}`, (activeToken) => approveOrder(activeToken, order.id).then(() => undefined))}
                            disabled={!canApprove || busyAction !== null}
                            className="rounded-md bg-[var(--tint-success)] px-3 py-1.5 text-xs font-medium text-[var(--color-success)] disabled:opacity-40"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectOrderId(order.id);
                              setRejectForm(defaultRejectForm);
                            }}
                            disabled={!canReject || busyAction !== null}
                            className="rounded-md bg-[var(--tint-error)] px-3 py-1.5 text-xs font-medium text-[var(--color-error)] disabled:opacity-40"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setRestockOrderId(order.id);
                              setRestockForm({ ...defaultRestockForm, note: `Restock requested for ${order.productName}` });
                            }}
                            disabled={!canRestock || busyAction !== null}
                            className="rounded-md bg-[var(--tint-warning)] px-3 py-1.5 text-xs font-medium text-[var(--color-warning)] disabled:opacity-40"
                          >
                            Restock
                          </button>
                          <button
                            onClick={() =>
                              runAction(`deliver-${order.id}`, (activeToken) =>
                                markOrderDelivered(activeToken, order.id, 'Order delivered by manager').then(() => undefined),
                              )
                            }
                            disabled={!canDeliver || busyAction !== null}
                            className="rounded-md bg-[var(--tint-info)] px-3 py-1.5 text-xs font-medium text-[var(--color-info)] disabled:opacity-40"
                          >
                            Delivered
                          </button>
                        </div>

                        {isRejectOpen && (
                          <form onSubmit={submitReject} className="mt-3 space-y-2 rounded-md bg-[#f4f3ef] p-3">
                            <input
                              name="reason"
                              placeholder="Reject reason"
                              value={rejectForm.reason}
                              onChange={onRejectInputChange}
                              className="w-full rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[#344e41] outline-none"
                            />
                            <textarea
                              name="managerNote"
                              placeholder="Manager note (optional)"
                              value={rejectForm.managerNote}
                              onChange={onRejectInputChange}
                              rows={2}
                              className="w-full rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[#344e41] outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={busyAction !== null}
                                className="rounded-md bg-[var(--tint-error)] px-3 py-1 text-xs font-medium text-[var(--color-error)] disabled:opacity-40"
                              >
                                Confirm reject
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectOrderId(null)}
                                className="rounded-md border border-[var(--input)] bg-white px-3 py-1 text-xs text-[#5f6f59]"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}

                        {isRestockOpen && (
                          <form onSubmit={(event) => submitRestock(event, order)} className="mt-3 grid gap-2 rounded-md bg-[#f4f3ef] p-3">
                            <select
                              name="blocId"
                              value={restockForm.blocId}
                              onChange={onRestockInputChange}
                              className="rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[#344e41] outline-none"
                            >
                              <option value="">Select bloc</option>
                              {blocs.map((bloc) => (
                                <option key={bloc.id} value={String(bloc.id)}>
                                  {bloc.name} (usage {bloc.currentUsage}/{bloc.capacity})
                                </option>
                              ))}
                            </select>
                            <input
                              name="quantity"
                              placeholder="Restock quantity (optional)"
                              value={restockForm.quantity}
                              onChange={onRestockInputChange}
                              className="rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[#344e41] outline-none"
                            />
                            <input
                              name="supplierName"
                              placeholder="Supplier name"
                              value={restockForm.supplierName}
                              onChange={onRestockInputChange}
                              className="rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[#344e41] outline-none"
                            />
                            <input
                              name="trackingNumber"
                              placeholder="Tracking number"
                              value={restockForm.trackingNumber}
                              onChange={onRestockInputChange}
                              className="rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[#344e41] outline-none"
                            />
                            <input
                              type="datetime-local"
                              name="expectedAt"
                              value={restockForm.expectedAt}
                              onChange={onRestockInputChange}
                              className="rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[#344e41] outline-none"
                            />
                            <textarea
                              name="note"
                              placeholder="Restock note"
                              value={restockForm.note}
                              onChange={onRestockInputChange}
                              rows={2}
                              className="rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[#344e41] outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={busyAction !== null}
                                className="rounded-md bg-[var(--tint-warning)] px-3 py-1 text-xs font-medium text-[var(--color-warning)] disabled:opacity-40"
                              >
                                Create restock
                              </button>
                              <button
                                type="button"
                                onClick={() => setRestockOrderId(null)}
                                className="rounded-md border border-[var(--input)] bg-white px-3 py-1 text-xs text-[#5f6f59]"
                              >
                                Cancel
                              </button>
                            </div>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}

                    {visibleOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-[#6b705c]">
                      No orders found
                    </td>
                  </tr>
                )}
                  </tbody>
                </table>
              </div>
            )}

            {view === 'kanban' && (
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {[
                  { key: 'Pending', matcher: (order: ManagerOrder) => getOrderBadge(order).label === 'Pending' },
                  { key: 'Completed', matcher: (order: ManagerOrder) => getOrderBadge(order).label === 'Completed' },
                  { key: 'Delayed', matcher: (order: ManagerOrder) => getOrderBadge(order).label === 'Delayed' },
                ].map((lane) => {
                  const laneOrders = visibleOrders.filter(lane.matcher);
                  return (
                    <div key={lane.key} className="rounded-xl bg-[#f3f3f1] p-3">
                      <p className="mb-2 text-sm font-semibold">{lane.key}</p>
                      <div className="space-y-2">
                        {laneOrders.map((order) => (
                          <div key={order.id} className="rounded-lg bg-white p-3 shadow-sm">
                            <p className="text-sm font-semibold">#{order.id} {order.productName}</p>
                            <p className="mt-1 text-xs text-[var(--muted-foreground)]">Qty {order.quantity} • {getDeliveryDay(order.deliveryDeadline)}</p>
                            <p className="mt-1 text-xs text-[var(--muted-foreground)]">{order.customerName}</p>
                          </div>
                        ))}
                        {laneOrders.length === 0 && <p className="text-xs text-[var(--muted-foreground)]">No orders</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {view === 'calendar' && (
              <div className="mt-5 space-y-4">
                {calendarGroups.map(([day, dayOrders]) => (
                  <div key={day} className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold">{day}</p>
                    <div className="mt-2 space-y-2">
                      {dayOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between rounded-md bg-[#f7f7f5] px-3 py-2 text-sm">
                          <p>#{order.id} {order.productName} • Qty {order.quantity}</p>
                          <span className={[ 'rounded-full px-2 py-1 text-xs font-medium', getOrderBadge(order).className ].join(' ')}>
                            {getOrderBadge(order).label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {calendarGroups.length === 0 && (
                  <p className="text-sm text-[var(--muted-foreground)]">No scheduled orders in this filter.</p>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </ManagerSectionLayout>
  );
}
