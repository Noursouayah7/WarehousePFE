'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { useWorkspaceSearch } from '@/src/common/WorkspaceShell';
import ManagerSectionLayout from './ManagerSectionLayout';
import {
  getManagerShipments,
  ManagerShipment,
  markShipmentInTransit,
  receiveShipment,
} from './manager.api';

type ReceiveForm = {
  receivedQuantity: string;
  trackingNumber: string;
  note: string;
};

const defaultReceiveForm: ReceiveForm = { receivedQuantity: '', trackingNumber: '', note: '' };

function getShipmentBadge(status: ManagerShipment['status']): { label: string; className: string } {
  if (status === 'RECEIVED') {
    return {
      label: 'Delivered',
      className: 'bg-[var(--tint-success)] text-[var(--color-success)]',
    };
  }

  if (status === 'IN_TRANSIT') {
    return {
      label: 'In Transit',
      className: 'bg-[var(--tint-info)] text-[var(--color-info)]',
    };
  }

  return {
    label: 'Requested',
    className: 'bg-[var(--tint-warning)] text-[var(--color-warning)]',
  };
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

export default function ManagerShipmentsPage() {
  const { token } = useAuth();
  const { query } = useWorkspaceSearch();

  const [shipments, setShipments] = useState<ManagerShipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [receiveShipmentId, setReceiveShipmentId] = useState<number | null>(null);
  const [receiveForm, setReceiveForm] = useState<ReceiveForm>(defaultReceiveForm);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'REQUESTED' | 'IN_TRANSIT' | 'RECEIVED'>('ALL');

  const visibleShipments = shipments.filter((shipment) => {
    if (statusFilter === 'ALL') return true;
    return shipment.status === statusFilter;
  }).filter((shipment) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;
    return [
      String(shipment.id),
      shipment.productName,
      shipment.status,
      shipment.note ?? '',
      shipment.trackingNumber ?? '',
      shipment.order ? String(shipment.order.id) : '',
      shipment.order?.status ?? '',
      shipment.bloc.name,
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  async function loadData(activeToken: string) {
    const shipmentsData = await getManagerShipments(activeToken);
    setShipments(shipmentsData);
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
        setError(err instanceof Error ? err.message : 'Failed to load shipments');
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  function onReceiveInputChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setReceiveForm((current) => ({ ...current, [name]: value }));
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

  async function handleMarkInTransit(shipmentId: number) {
    if (!token) {
      setError('Missing auth token. Please login again.');
      return;
    }

    setBusyAction(`transit-${shipmentId}`);
    setError(null);

    try {
      const updatedShipment = await markShipmentInTransit(token, shipmentId);
      setShipments((current) => current.map((shipment) => (shipment.id === shipmentId ? updatedShipment : shipment)));
      setStatusFilter((current) => (current === 'REQUESTED' ? 'IN_TRANSIT' : current));
      await loadData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setBusyAction(null);
    }
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
    <ManagerSectionLayout
      title="Shipments"
      description="Track inbound flow and receive inventory with minimal friction."
      showHero={false}
    >
      <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'ALL' | 'REQUESTED' | 'IN_TRANSIT' | 'RECEIVED')}
            className="rounded-md border border-[var(--input)] bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="ALL">Filter: All statuses</option>
            <option value="REQUESTED">Filter: Requested</option>
            <option value="IN_TRANSIT">Filter: In Transit</option>
            <option value="RECEIVED">Filter: Delivered</option>
          </select>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">{visibleShipments.length} visible shipments</p>
      </section>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          <span aria-hidden="true">!</span>
          {error}
        </div>
      )}

      <section className="rounded-2xl bg-transparent">
        <h2 className="text-lg font-semibold tracking-tight">Shipment workflow</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Move shipments from Requested to In Transit and close them as Delivered.</p>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading shipments...</div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">PRODUCT</th>
                  <th className="px-3 py-2">ORDER</th>
                  <th className="px-3 py-2">BLOC</th>
                  <th className="px-3 py-2">STATUS</th>
                  <th className="px-3 py-2">ETA / DELIVERY</th>
                  <th className="px-3 py-2">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {visibleShipments.map((shipment) => {
                  const canTransit = shipment.status === 'REQUESTED';
                  const canDeliver = shipment.status !== 'RECEIVED';
                  const isReceiveOpen = receiveShipmentId === shipment.id;
                  const badge = getShipmentBadge(shipment.status);

                  return (
                    <tr key={shipment.id} className="align-top">
                      <td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[var(--foreground)]">#{shipment.id}</td>
                      <td className="bg-[var(--card)] px-3 py-3">
                        <p className="font-semibold">{shipment.productName}</p>
                        <p className="mt-1 text-xs text-[var(--muted-foreground)]">Qty: {shipment.quantity}</p>
                        {shipment.note && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{shipment.note}</p>}
                      </td>
                      <td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">
                        {shipment.order ? `#${shipment.order.id} (${shipment.order.status})` : '—'}
                      </td>
                      <td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">
                        <p>{shipment.bloc.name}</p>
                        <p className="text-[var(--muted-foreground)]">usage {shipment.bloc.currentUsage}/{shipment.bloc.capacity}</p>
                      </td>
                      <td className="bg-[var(--card)] px-3 py-3">
                        <span className={[ 'inline-flex rounded-full px-2.5 py-1 text-xs font-medium', badge.className ].join(' ')}>{badge.label}</span>
                      </td>
                      <td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">
                        <p>ETA: {formatDate(shipment.expectedAt)}</p>
                        <p>Delivered: {formatDate(shipment.receivedAt)}</p>
                      </td>
                      <td className="rounded-r-lg bg-[var(--card)] px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => void handleMarkInTransit(shipment.id)}
                            disabled={!canTransit || busyAction !== null}
                            className="rounded-md bg-[var(--tint-info)] px-3 py-1.5 text-xs font-medium text-[var(--color-info)] disabled:opacity-40"
                          >
                            Mark in transit
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
                            disabled={!canDeliver || busyAction !== null}
                            className="rounded-md bg-[var(--tint-success)] px-3 py-1.5 text-xs font-medium text-[var(--color-success)] disabled:opacity-40"
                          >
                            Mark delivered
                          </button>
                        </div>

                        {isReceiveOpen && (
                          <form onSubmit={submitReceive} className="mt-3 space-y-2 rounded-md bg-[var(--muted)] p-3">
                            <input
                              name="receivedQuantity"
                              placeholder="Delivered quantity"
                              value={receiveForm.receivedQuantity}
                              onChange={onReceiveInputChange}
                              className="w-full rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                            />
                            <input
                              name="trackingNumber"
                              placeholder="Tracking number"
                              value={receiveForm.trackingNumber}
                              onChange={onReceiveInputChange}
                              className="w-full rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                            />
                            <textarea
                              name="note"
                              placeholder="Delivery note"
                              value={receiveForm.note}
                              onChange={onReceiveInputChange}
                              rows={2}
                              className="w-full rounded-md border border-[var(--input)] bg-white px-2 py-1.5 text-xs text-[var(--foreground)] outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={busyAction !== null}
                                className="rounded-md bg-[var(--tint-success)] px-3 py-1 text-xs font-medium text-[var(--color-success)] disabled:opacity-40"
                              >
                                Confirm delivery
                              </button>
                              <button
                                type="button"
                                onClick={() => setReceiveShipmentId(null)}
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

                {visibleShipments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-8 text-center text-sm text-[var(--muted-foreground)]">
                      No shipments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </ManagerSectionLayout>
  );
}
