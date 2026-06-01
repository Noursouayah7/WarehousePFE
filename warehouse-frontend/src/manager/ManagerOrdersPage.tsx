'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { useWorkspaceSearch } from '@/src/common/WorkspaceShell';
import ManagerSectionLayout from './ManagerSectionLayout';
import {
  approveOrder,
  getManagerOrders,
  ManagerOrder,
  rejectOrder,
  requestRestock,
} from './manager.api';
import { AdminDashboardProduct, getAdminProducts } from '@/src/admin/ProductsDashbord/ProductDashbord.admin.api';
import { AdminDashboardWarehouse, getAdminWarehouses, WarehouseBloc } from '@/src/admin/WarehousesDashbord/WarehouseDashbord.admin.api';

type RejectForm = {
  reason: string;
  managerNote: string;
};

type RestockForm = {
  productId: string;
  productName: string;
  currentStock: string;
  requestedQuantity: string;
  warehouseId: string;
  blocId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  note: string;
};

const defaultRejectForm: RejectForm = { reason: '', managerNote: '' };
const defaultRestockForm: RestockForm = {
  productId: '',
  productName: '',
  currentStock: '',
  requestedQuantity: '',
  warehouseId: '',
  blocId: '',
  priority: 'MEDIUM',
  note: '',
};

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function getOrderBadge(order: ManagerOrder): { label: string; className: string } {
  if (order.status === 'REJECTED') {
    return {
      label: 'Rejected',
      className: 'bg-[var(--tint-error)] text-[var(--color-error)]',
    };
  }

  if (order.status === 'APPROVED') {
    return {
      label: 'Approved',
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
  const { query } = useWorkspaceSearch();

  const [orders, setOrders] = useState<ManagerOrder[]>([]);
  const [products, setProducts] = useState<AdminDashboardProduct[]>([]);
  const [warehouses, setWarehouses] = useState<AdminDashboardWarehouse[]>([]);
  const [blocs, setBlocs] = useState<WarehouseBloc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [rejectOrderId, setRejectOrderId] = useState<number | null>(null);
  const [rejectForm, setRejectForm] = useState<RejectForm>(defaultRejectForm);

  const [restockOrderId, setRestockOrderId] = useState<number | null>(null);
  const [restockForm, setRestockForm] = useState<RestockForm>(defaultRestockForm);
  const [view, setView] = useState<'table' | 'kanban' | 'calendar'>('table');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [sortBy, setSortBy] = useState<'latest' | 'deadline' | 'quantity'>('latest');
  const pendingOrdersCount = useMemo(
    () => orders.filter((order) => order.status === 'PENDING').length,
    [orders],
  );

  const visibleOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = orders.filter((order) => {
      if (order.status === 'COMPLETED') return false;
      if (statusFilter === 'ALL') return true;
      return order.status === statusFilter;
    }).filter((order) => {
      if (!normalizedQuery) return true;
      return [
        String(order.id),
        order.productName,
        order.customerName,
        order.customerPhone,
        order.status,
        order.deliveryStatus,
        order.managerNote ?? '',
        order.rejectionReason ?? '',
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
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

  const stockReviewOrder = useMemo(
    () => orders.find((order) => order.id === restockOrderId) ?? null,
    [orders, restockOrderId],
  );

  const stockReviewLines = useMemo(() => {
    if (!stockReviewOrder) return [];

    const lineItems = stockReviewOrder.items.length > 0
      ? stockReviewOrder.items
      : [{ id: 0, productId: 0, productName: stockReviewOrder.productName, quantity: stockReviewOrder.quantity, unitPrice: 0, lineTotal: 0 }];

    return lineItems.map((line) => {
      const product = products.find((candidate) => {
        if (line.productId > 0) {
          return candidate.id === line.productId;
        }

        return candidate.name.toLowerCase() === line.productName.toLowerCase();
      }) ?? null;

      const reservedQuantity = orders
        .filter((order) => ['PENDING', 'APPROVED', 'RESTOCK_REQUESTED'].includes(order.status))
        .reduce((sum, order) => {
          const matchingItems = order.items.filter((item) => {
            if (line.productId > 0) {
              return item.productId === line.productId;
            }

            return item.productName.toLowerCase() === line.productName.toLowerCase();
          });

          if (matchingItems.length > 0) {
            return sum + matchingItems.reduce((itemSum, item) => itemSum + item.quantity, 0);
          }

          if (line.productId <= 0 && order.productName.toLowerCase() === line.productName.toLowerCase()) {
            return sum + order.quantity;
          }

          return sum;
        }, 0);

      const currentStock = product?.quantity ?? 0;
      const availableQuantity = currentStock - reservedQuantity;
      const location = product ? blocs.find((bloc) => bloc.id === product.blocId) : null;
      const warehouse = location ? warehouses.find((item) => item.blocks.some((bloc) => bloc.id === location.id)) : null;

      return {
        line,
        product,
        reservedQuantity,
        currentStock,
        availableQuantity,
        location,
        warehouse,
      };
    });
  }, [blocs, orders, products, stockReviewOrder, warehouses]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => setSuccessMessage(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  async function loadData(activeToken: string) {
    const [ordersData, warehouseData, productData] = await Promise.all([
      getManagerOrders(activeToken),
      getAdminWarehouses(activeToken),
      getAdminProducts(activeToken),
    ]);

    setOrders(ordersData);
    setWarehouses(warehouseData);
    setBlocs(warehouseData.flatMap((warehouse) => warehouse.blocks));
    setProducts(productData);
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

  async function submitRestock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stockReviewOrder) return;

    const productId = Number(restockForm.productId);
    const currentStock = Number(restockForm.currentStock);
    const requestedQuantity = Number(restockForm.requestedQuantity);
    const warehouseId = Number(restockForm.warehouseId);
    const blocId = Number(restockForm.blocId);

    if (!Number.isFinite(productId) || productId <= 0) {
      setError('Please select a valid product.');
      return;
    }

    if (!Number.isFinite(currentStock) || currentStock < 0) {
      setError('Current stock must be a valid number.');
      return;
    }

    if (!Number.isFinite(requestedQuantity) || requestedQuantity <= 0) {
      setError('Requested quantity must be greater than 0.');
      return;
    }

    if (!Number.isFinite(warehouseId) || warehouseId <= 0) {
      setError('Please select a valid warehouse.');
      return;
    }

    if (!Number.isFinite(blocId) || blocId <= 0) {
      setError('Please select a valid bloc.');
      return;
    }

    await runAction(`restock-${stockReviewOrder.id}`, async (activeToken) => {
      await requestRestock(activeToken, stockReviewOrder.id, {
        productId,
        productName: restockForm.productName,
        currentStock,
        requestedQuantity,
        warehouseId,
        blocId,
        priority: restockForm.priority,
        note: restockForm.note.trim() || undefined,
      });
      setSuccessMessage('Restock request successfully sent to technician.');
      setRestockOrderId(null);
      setRestockForm(defaultRestockForm);
    });
  }

  return (
    <ManagerSectionLayout
      title="Orders"
      description="Track customer orders and send restock alerts when stock is low."
      showHero={false}
    >
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
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

        <div className="inline-flex rounded-md bg-[var(--muted)] p-1">
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

      {successMessage && (
        <div className="fixed right-6 top-6 z-[60] max-w-sm rounded-2xl border border-[var(--color-success)] bg-[var(--tint-success)] px-4 py-3 text-sm font-medium text-[var(--color-success)] shadow-lg">
          {successMessage}
        </div>
      )}

      {stockReviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-6 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">Restock request</p>
                <h3 className="mt-1 text-2xl font-semibold tracking-tight">{stockReviewOrder.productName}</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRestockOrderId(null);
                  setRestockForm(defaultRestockForm);
                }}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-sm text-[var(--muted-foreground)]"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitRestock} className="grid gap-4 overflow-y-auto px-6 py-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                {stockReviewLines.map((entry) => (
                  <div key={entry.line.id || entry.line.productName} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-[var(--foreground)]">{entry.line.productName}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${entry.availableQuantity <= 0 ? 'bg-[var(--tint-error)] text-[var(--color-error)]' : entry.availableQuantity < entry.line.quantity ? 'bg-[var(--tint-warning)] text-[var(--color-warning)]' : 'bg-[var(--tint-success)] text-[var(--color-success)]'}`}>
                        {entry.availableQuantity <= 0 ? 'Low stock' : entry.availableQuantity < entry.line.quantity ? 'Limited stock' : 'Healthy'}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-white px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Current stock</p>
                        <p className="mt-1 text-2xl font-semibold">{entry.currentStock}</p>
                      </div>
                      <div className="rounded-xl bg-white px-4 py-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Requested</p>
                        <p className="mt-1 text-2xl font-semibold">{entry.line.quantity}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-[var(--muted-foreground)] sm:grid-cols-2">
                      <p>Warehouse: {entry.warehouse?.name ?? 'Unknown warehouse'}</p>
                      <p>Bloc: {entry.location?.name ?? 'Unknown bloc'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--tint-warning)] p-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--muted-foreground)]">Restock alert form</p>
                <div className="mt-4 grid gap-3">
                  <input
                    name="productName"
                    value={restockForm.productName}
                    readOnly
                    className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                  />
                  <input
                    name="currentStock"
                    value={restockForm.currentStock}
                    readOnly
                    className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                  />
                  <input
                    name="requestedQuantity"
                    type="number"
                    min="1"
                    value={restockForm.requestedQuantity}
                    onChange={onRestockInputChange}
                    className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                  />
                  <select
                    name="warehouseId"
                    value={restockForm.warehouseId}
                    onChange={(event) => {
                      const value = event.target.value;
                      setRestockForm((current) => ({ ...current, warehouseId: value, blocId: '' }));
                    }}
                    className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                  >
                    <option value="">Target warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={String(warehouse.id)}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="blocId"
                    value={restockForm.blocId}
                    onChange={onRestockInputChange}
                    className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none"
                  >
                    <option value="">Target bloc</option>
                    {blocs
                      .filter((bloc) => !restockForm.warehouseId || bloc.warehouseId === Number(restockForm.warehouseId))
                      .map((bloc) => (
                        <option key={bloc.id} value={String(bloc.id)}>
                          {bloc.name} (usage {bloc.currentUsage}/{bloc.capacity})
                        </option>
                      ))}
                  </select>
                  <select
                    name="priority"
                    value={restockForm.priority}
                    onChange={onRestockInputChange}
                    className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none"
                  >
                    <option value="LOW">Low priority</option>
                    <option value="MEDIUM">Medium priority</option>
                    <option value="HIGH">High priority</option>
                  </select>
                  <textarea
                    name="note"
                    placeholder="Optional note for the technician"
                    value={restockForm.note}
                    onChange={onRestockInputChange}
                    rows={4}
                    className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={busyAction !== null}
                      className="rounded-md bg-[var(--tint-warning)] px-4 py-2 text-sm font-medium text-[var(--color-warning)] disabled:opacity-40"
                    >
                      Send Restock Alert
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRestockOrderId(null);
                        setRestockForm(defaultRestockForm);
                      }}
                      className="rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--muted-foreground)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="rounded-2xl bg-transparent">
        <h2 className="text-lg font-semibold tracking-tight">Order workflow</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Manage approvals, restock requests, and shipment handoff with a lightweight view.</p>

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
                    const isRejectOpen = rejectOrderId === order.id;
                    const badge = getOrderBadge(order);

                  return (
                    <tr
                      key={order.id}
                      className="align-top"
                    >
                      <td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[var(--foreground)]">#{order.id}</td>
                      <td className="bg-[var(--card)] px-3 py-3">
                        <p className="font-semibold">{order.productName}</p>
                        {order.managerNote && <p className="mt-1 text-xs text-[var(--muted-foreground)]">Note: {order.managerNote}</p>}
                        {order.rejectionReason && <p className="mt-1 text-xs text-[var(--color-error)]">Reason: {order.rejectionReason}</p>}
                      </td>
                      <td className="bg-[var(--card)] px-3 py-3 text-[var(--foreground)]">{order.quantity}</td>
                      <td className="bg-[var(--card)] px-3 py-3">
                        <span className={[ 'inline-flex rounded-full px-2.5 py-1 text-xs font-medium', badge.className ].join(' ')}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">{formatDate(order.deliveryDeadline)}</td>
                      <td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">
                        <p>{order.customerName}</p>
                        <p className="text-[var(--muted-foreground)]">{order.customerPhone}</p>
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
                              const matchedProduct = products.find((candidate) => {
                                if (order.items[0]?.productId > 0) {
                                  return candidate.id === order.items[0].productId;
                                }

                                return candidate.name.toLowerCase() === order.productName.toLowerCase();
                              }) ?? null;
                              const matchedLocation = matchedProduct ? blocs.find((bloc) => bloc.id === matchedProduct.blocId) : null;
                              const matchedWarehouse = matchedLocation ? warehouses.find((item) => item.id === matchedLocation.warehouseId) : null;

                              setRestockOrderId(order.id);
                              setRestockForm({
                                ...defaultRestockForm,
                                productId: matchedProduct ? String(matchedProduct.id) : String(order.items[0]?.productId ?? ''),
                                productName: matchedProduct?.name ?? order.productName,
                                currentStock: String(matchedProduct?.quantity ?? 0),
                                requestedQuantity: String(order.quantity),
                                warehouseId: matchedWarehouse ? String(matchedWarehouse.id) : '',
                                blocId: matchedLocation ? String(matchedLocation.id) : '',
                                priority: 'MEDIUM',
                                note: `Restock request for ${matchedProduct?.name ?? order.productName}`,
                              });
                            }}
                            disabled={busyAction !== null}
                            className="rounded-md bg-[var(--tint-warning)] px-3 py-1.5 text-xs font-medium text-[var(--color-warning)] disabled:opacity-40"
                          >
                            Restock Request
                          </button>
                        </div>

                        {isRejectOpen && (
                            <form onSubmit={submitReject} className="mt-3 space-y-2 rounded-md bg-[var(--muted)] p-3">
                            <input
                              name="reason"
                              placeholder="Reject reason"
                              value={rejectForm.reason}
                              onChange={onRejectInputChange}
                              className="w-full rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                            />
                            <textarea
                              name="managerNote"
                              placeholder="Manager note (optional)"
                              value={rejectForm.managerNote}
                              onChange={onRejectInputChange}
                              rows={2}
                              className="w-full rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
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
                                className="rounded-md border border-[var(--input)] bg-white px-3 py-1 text-xs text-[var(--muted-foreground)]"
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
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-[var(--muted-foreground)]">
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
                  { key: 'Approved', matcher: (order: ManagerOrder) => getOrderBadge(order).label === 'Approved' },
                  { key: 'Rejected', matcher: (order: ManagerOrder) => getOrderBadge(order).label === 'Rejected' },
                ].map((lane) => {
                  const laneOrders = visibleOrders.filter(lane.matcher);
                  return (
                    <div key={lane.key} className="rounded-xl bg-[var(--muted)] p-3">
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
                        <div key={order.id} className="flex items-center justify-between rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
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
