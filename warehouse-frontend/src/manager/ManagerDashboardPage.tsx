'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import PriceForecastWidget from '@/src/components/PriceForecastWidget';
import { useAuth } from '@/src/auth/AuthProvider';
import {
  approveOrder,
  getManagerOrders,
  getManagerShipments,
  ManagerOrder,
  ManagerShipment,
  markOrderDelivered,
  markShipmentInTransit,
  receiveShipment,
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

type ReceiveForm = {
  receivedQuantity: string;
  trackingNumber: string;
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
const defaultReceiveForm: ReceiveForm = { receivedQuantity: '', trackingNumber: '', note: '' };

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

function formatOrderStatus(status: ManagerOrder['status']): string {
  if (status === 'PENDING') return 'Pending';
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  if (status === 'RESTOCK_REQUESTED') return 'Restock requested';
  return 'Completed';
}

function formatShipmentStatus(status: ManagerShipment['status']): string {
  if (status === 'REQUESTED') return 'Requested';
  if (status === 'IN_TRANSIT') return 'In transit';
  return 'Received';
}

export default function ManagerPage() {
  const { logout, token } = useAuth();

  const [orders, setOrders] = useState<ManagerOrder[]>([]);
  const [shipments, setShipments] = useState<ManagerShipment[]>([]);
  const [blocs, setBlocs] = useState<WarehouseBloc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [rejectOrderId, setRejectOrderId] = useState<number | null>(null);
  const [rejectForm, setRejectForm] = useState<RejectForm>(defaultRejectForm);

  const [restockOrderId, setRestockOrderId] = useState<number | null>(null);
  const [restockForm, setRestockForm] = useState<RestockForm>(defaultRestockForm);

  const [receiveShipmentId, setReceiveShipmentId] = useState<number | null>(null);
  const [receiveForm, setReceiveForm] = useState<ReceiveForm>(defaultReceiveForm);

  async function loadData(activeToken: string) {
    const [ordersData, shipmentsData, warehouses] = await Promise.all([
      getManagerOrders(activeToken),
      getManagerShipments(activeToken),
      getAdminWarehouses(activeToken),
    ]);

    setOrders(ordersData);
    setShipments(shipmentsData);
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
        setError(err instanceof Error ? err.message : 'Failed to load manager dashboard');
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  const orderCount = useMemo(() => orders.length, [orders]);
  const shipmentCount = useMemo(() => shipments.length, [shipments]);
  const waitingShipmentCount = useMemo(
    () => shipments.filter((shipment) => shipment.status !== 'RECEIVED').length,
    [shipments],
  );

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

  function onReceiveInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setReceiveForm((current) => ({ ...current, [name]: value }));
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

    const selectedBloc = blocs.find((bloc) => bloc.id === blocId);
    const warehouseId = selectedBloc?.warehouseId ?? 0;

    await runAction(`restock-${restockOrderId}`, async (activeToken) => {
      await requestRestock(activeToken, restockOrderId, {
        productName: order.productName,
        currentStock: order.quantity,
        requestedQuantity: quantity ?? order.quantity,
        warehouseId,
        blocId,
        priority: 'MEDIUM',
        note: restockForm.note.trim() || undefined,
      });
      setRestockOrderId(null);
      setRestockForm(defaultRestockForm);
    });
  }

  async function submitReceive(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!receiveShipmentId) return;

    const quantityText = receiveForm.receivedQuantity.trim();
    const receivedQuantity = quantityText ? Number(quantityText) : undefined;
    if (receivedQuantity !== undefined && (!Number.isFinite(receivedQuantity) || receivedQuantity <= 0)) {
      setError('Received quantity must be greater than 0.');
      return;
    }

    await runAction(`receive-${receiveShipmentId}`, async (activeToken) => {
      await receiveShipment(activeToken, receiveShipmentId, {
        receivedQuantity,
        trackingNumber: receiveForm.trackingNumber.trim() || undefined,
        note: receiveForm.note.trim() || undefined,
      });
      setReceiveShipmentId(null);
      setReceiveForm(defaultReceiveForm);
    });
  }

  return (
    <div className="min-h-screen bg-[var(--muted)] text-[var(--foreground)]">
      <div className="px-[40px] py-[60px]">
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { label: 'Orders', value: String(orderCount), accent: 'var(--tint-success)' },
            { label: 'Shipments', value: String(shipmentCount), accent: 'var(--tint-info)' },
            { label: 'Waiting receive', value: String(waitingShipmentCount), accent: 'var(--tint-warning)' },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm">
              <div className="mb-4 h-6 w-[3px]" style={{ background: card.accent }} />
              <p className="mb-2 text-sm font-medium text-[var(--muted-foreground)]">{card.label}</p>
              <p className="text-[28px] font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-[var(--color-error)] bg-[var(--tint-error)] px-4 py-3 text-sm text-[var(--color-error)]">
            {error}
          </div>
        )}

        <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--muted)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold tracking-tight">Orders operations</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Approve, reject, and request restock</p>

          {isLoading ? (
            <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading orders...</div>
          ) : (
            <div className="mt-5 overflow-x-auto">
                <table className="min-w-full border border-[var(--border)] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs font-medium text-[var(--muted-foreground)]">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">PRODUCT</th>
                    <th className="px-3 py-2">QTY</th>
                    <th className="px-3 py-2">STATUS</th>
                    <th className="px-3 py-2">DEADLINE</th>
                    <th className="px-3 py-2">CUSTOMER</th>
                    <th className="px-3 py-2">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const canApprove = order.status === 'PENDING';
                    const canReject = order.status === 'PENDING' || order.status === 'RESTOCK_REQUESTED';
                    const canRestock = order.status === 'PENDING' || order.status === 'RESTOCK_REQUESTED';
                    const isRejectOpen = rejectOrderId === order.id;
                    const isRestockOpen = restockOrderId === order.id;

                      return (
                      <tr key={order.id} className="border-b border-[var(--border)] align-top">
                        <td className="px-3 py-3 text-[var(--foreground)]">#{order.id}</td>
                        <td className="px-3 py-3">
                          <p className="font-semibold">{order.productName}</p>
                          {order.managerNote && <p className="mt-1 text-xs text-[var(--muted-foreground)]">Note: {order.managerNote}</p>}
                          {order.rejectionReason && <p className="mt-1 text-xs text-[var(--color-error)]">Reason: {order.rejectionReason}</p>}
                        </td>
                        <td className="px-3 py-3 text-[var(--foreground)]">{order.quantity}</td>
                        <td className="px-3 py-3">
                          <span className="border border-[var(--border)] px-2 py-1 text-xs">{formatOrderStatus(order.status)}</span>
                        </td>
                        <td className="px-3 py-3 text-xs text-[var(--muted-foreground)]">{formatDate(order.deliveryDeadline)}</td>
                        <td className="px-3 py-3 text-xs text-[var(--muted-foreground)]">
                          <p>{order.customerName}</p>
                          <p className="text-[var(--muted-foreground)]">{order.customerPhone}</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => runAction(`approve-${order.id}`, (activeToken) => approveOrder(activeToken, order.id).then(() => undefined))}
                              disabled={!canApprove || busyAction !== null}
                              className="border border-[var(--color-success)] bg-[var(--tint-success)] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[var(--color-success)] disabled:opacity-40"
                            >
                              APPROVE
                            </button>
                            <button
                              onClick={() => {
                                setRejectOrderId(order.id);
                                setRejectForm(defaultRejectForm);
                              }}
                              disabled={!canReject || busyAction !== null}
                              className="border border-[var(--color-error)] bg-[var(--tint-error)] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[var(--color-error)] disabled:opacity-40"
                            >
                              REJECT
                            </button>
                            <button
                              onClick={() => {
                                setRestockOrderId(order.id);
                                setRestockForm({ ...defaultRestockForm, note: `Restock requested for ${order.productName}` });
                              }}
                              disabled={!canRestock || busyAction !== null}
                              className="border border-[var(--color-warning)] bg-[var(--tint-warning)] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[var(--color-warning)] disabled:opacity-40"
                            >
                              RESTOCK REQUEST
                            </button>
                          </div>

                            {isRejectOpen && (
                            <form onSubmit={submitReject} className="mt-3 space-y-2 border border-[var(--border)] bg-[var(--muted)] p-3">
                              <input
                                name="reason"
                                placeholder="Reject reason"
                                value={rejectForm.reason}
                                onChange={onRejectInputChange}
                                className="w-full border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                              />
                              <textarea
                                name="managerNote"
                                placeholder="Manager note (optional)"
                                value={rejectForm.managerNote}
                                onChange={onRejectInputChange}
                                rows={2}
                                className="w-full border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={busyAction !== null}
                                  className="border border-[var(--color-error)] bg-[var(--tint-error)] px-3 py-1 text-xs text-[var(--color-error)] disabled:opacity-40"
                                >
                                  CONFIRM REJECT
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectOrderId(null)}
                                  className="border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]"
                                >
                                  CANCEL
                                </button>
                              </div>
                            </form>
                          )}

                          {isRestockOpen && (
                            <form onSubmit={(event) => submitRestock(event, order)} className="mt-3 grid gap-2 border border-[var(--border)] bg-[var(--muted)] p-3">
                              <select
                                name="blocId"
                                value={restockForm.blocId}
                                onChange={onRestockInputChange}
                                className="border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
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
                                className="border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                              />
                              <input
                                name="supplierName"
                                placeholder="Supplier name"
                                value={restockForm.supplierName}
                                onChange={onRestockInputChange}
                                className="border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                              />
                              <input
                                name="trackingNumber"
                                placeholder="Tracking number"
                                value={restockForm.trackingNumber}
                                onChange={onRestockInputChange}
                                className="border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                              />
                              <input
                                type="datetime-local"
                                name="expectedAt"
                                value={restockForm.expectedAt}
                                onChange={onRestockInputChange}
                                className="border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                              />
                              <textarea
                                name="note"
                                placeholder="Restock note"
                                value={restockForm.note}
                                onChange={onRestockInputChange}
                                rows={2}
                                className="border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={busyAction !== null}
                                  className="border border-[var(--color-warning)] bg-[var(--tint-warning)] px-3 py-1 text-xs text-[var(--color-warning)] disabled:opacity-40"
                                >
                                  CREATE RESTOCK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRestockOrderId(null)}
                                  className="border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]"
                                >
                                  CANCEL
                                </button>
                              </div>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-[12px] tracking-[0.12em] text-[var(--muted-foreground)]">
                        NO ORDERS FOUND
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-10 rounded border border-[var(--border)] bg-[var(--muted)] p-6">
          <h2 className="text-xl font-bold tracking-[0.08em]">SHIPMENTS OPERATIONS</h2>
          <p className="mt-1 text-[12px] tracking-[0.1em] text-[var(--muted-foreground)]">Move shipment to transit and receive inbound stock</p>

          {isLoading ? (
            <div className="py-10 text-center text-[12px] tracking-[0.12em] text-[var(--muted-foreground)]">LOADING SHIPMENTS...</div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border border-[var(--border)] text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-[11px] tracking-[0.18em] text-[var(--muted-foreground)]">
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">PRODUCT</th>
                    <th className="px-3 py-2">ORDER</th>
                    <th className="px-3 py-2">BLOC</th>
                    <th className="px-3 py-2">STATUS</th>
                    <th className="px-3 py-2">ETA / RECEIVED</th>
                    <th className="px-3 py-2">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((shipment) => {
                    const canTransit = shipment.status === 'REQUESTED';
                    const canReceive = shipment.status !== 'RECEIVED';
                    const isReceiveOpen = receiveShipmentId === shipment.id;

                    return (
                      <tr key={shipment.id} className="border-b border-[var(--border)] align-top">
                        <td className="px-3 py-3 text-[var(--foreground)]">#{shipment.id}</td>
                        <td className="px-3 py-3">
                          <p className="font-semibold">{shipment.productName}</p>
                          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Qty: {shipment.quantity}</p>
                          {shipment.note && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{shipment.note}</p>}
                        </td>
                        <td className="px-3 py-3 text-xs text-[var(--muted-foreground)]">
                          {shipment.order ? `#${shipment.order.id} (${shipment.order.status})` : '—'}
                        </td>
                        <td className="px-3 py-3 text-xs text-[var(--muted-foreground)]">
                          <p>{shipment.bloc.name}</p>
                          <p className="text-[var(--muted-foreground)]">usage {shipment.bloc.currentUsage}/{shipment.bloc.capacity}</p>
                        </td>
                        <td className="px-3 py-3">
                          <span className="border border-[var(--border)] px-2 py-1 text-xs">{formatShipmentStatus(shipment.status)}</span>
                        </td>
                        <td className="px-3 py-3 text-xs text-[var(--muted-foreground)]">
                          <p>ETA: {formatDate(shipment.expectedAt)}</p>
                          <p>Received: {formatDate(shipment.receivedAt)}</p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                runAction(`transit-${shipment.id}`, (activeToken) =>
                                  markShipmentInTransit(activeToken, shipment.id).then(() => undefined),
                                )
                              }
                              disabled={!canTransit || busyAction !== null}
                              className="border border-[var(--color-info)] bg-[var(--tint-info)] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[var(--color-info)] disabled:opacity-40"
                            >
                              IN TRANSIT
                            </button>
                            <button
                              onClick={() => {
                                setReceiveShipmentId(shipment.id);
                                setReceiveForm({
                                  ...defaultReceiveForm,
                                  receivedQuantity: String(shipment.quantity),
                                  trackingNumber: shipment.trackingNumber ?? '',
                                });
                              }}
                              disabled={!canReceive || busyAction !== null}
                              className="border border-[var(--color-success)] bg-[var(--tint-success)] px-3 py-1.5 text-[11px] tracking-[0.12em] text-[var(--color-success)] disabled:opacity-40"
                            >
                              RECEIVE
                            </button>
                          </div>

                          {isReceiveOpen && (
                            <form onSubmit={submitReceive} className="mt-3 space-y-2 border border-[var(--border)] bg-[var(--muted)] p-3">
                              <input
                                name="receivedQuantity"
                                placeholder="Received quantity"
                                value={receiveForm.receivedQuantity}
                                onChange={onReceiveInputChange}
                                className="w-full border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                              />
                              <input
                                name="trackingNumber"
                                placeholder="Tracking number"
                                value={receiveForm.trackingNumber}
                                onChange={onReceiveInputChange}
                                className="w-full border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                              />
                              <textarea
                                name="note"
                                placeholder="Receive note"
                                value={receiveForm.note}
                                onChange={onReceiveInputChange}
                                rows={2}
                                className="w-full border border-[var(--border)] bg-[var(--muted)] px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={busyAction !== null}
                                  className="border border-[var(--color-success)] bg-[var(--tint-success)] px-3 py-1 text-xs text-[var(--color-success)] disabled:opacity-40"
                                >
                                  CONFIRM RECEIVE
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReceiveShipmentId(null)}
                                  className="border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)]"
                                >
                                  CANCEL
                                </button>
                              </div>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {shipments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-[12px] tracking-[0.12em] text-[var(--muted-foreground)]">
                        NO SHIPMENTS FOUND
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
