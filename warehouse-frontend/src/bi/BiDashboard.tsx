import { useState, type ReactNode } from 'react';
import { useI18n } from '@/src/i18n/I18nProvider';
import { markContactRequestContacted, type BiSummary, type BiStatusCounts } from './bi.api';

type BiDashboardProps = {
  summary: BiSummary;
  mode: 'ADMIN' | 'MANAGER' | 'TECHNICIEN';
  accessToken?: string;
  onRefresh?: () => Promise<void>;
};

type KpiCard = {
  label: string;
  value: string | number;
  hint: string;
  tone: string;
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RESTOCK_REQUESTED: 'Restock requested',
  COMPLETED: 'Completed',
  REQUESTED: 'Requested',
  IN_TRANSIT: 'In transit',
  RECEIVED: 'Received',
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  STOCK_IN: 'Stock in',
  STOCK_OUT: 'Stock out',
  TRANSFER: 'Transfer',
  DAMAGE: 'Damage',
  RESTOCK: 'Restock',
  RESTOCK_ALERT: 'Restock alert',
  SHIPMENT_CREATED: 'Shipment created',
  ORDER_APPROVED: 'Order approved',
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

function labelFor(value: string, tx: (text: string) => string): string {
  return tx(statusLabels[value] ?? value.replaceAll('_', ' ').toLowerCase());
}

function percentBarClass(value: number): string {
  if (value >= 90) return 'bg-[var(--color-error)]';
  if (value >= 75) return 'bg-[var(--color-warning)]';
  return 'bg-[var(--color-success)]';
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const { tx } = useI18n();

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{tx(title)}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function KpiGrid({ cards }: { cards: KpiCard[] }) {
  const { tx } = useI18n();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="mb-4 h-7 w-[3px] rounded-full" style={{ background: card.tone }} />
          <p className="text-sm font-medium text-[var(--muted-foreground)]">{tx(card.label)}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{card.value}</p>
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{tx(card.hint)}</p>
        </div>
      ))}
    </div>
  );
}

function StatusBars({ counts }: { counts: BiStatusCounts }) {
  const { tx } = useI18n();
  const entries = Object.entries(counts).filter(([, value]) => value > 0);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  if (entries.length === 0) {
    return <p className="text-sm text-[var(--muted-foreground)]">{tx('No data yet.')}</p>;
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => {
        const width = total > 0 ? Math.max((value / total) * 100, 6) : 0;

        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-800">{labelFor(key, tx)}</span>
              <span className="text-[var(--muted-foreground)]">{value}</span>
            </div>
            <div className="h-2.5 rounded-full bg-[var(--muted)]">
              <div className="h-2.5 rounded-full bg-[var(--color-info)]" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CapacityBars({ summary, mode }: BiDashboardProps) {
  const { tx } = useI18n();
  const rows = mode === 'TECHNICIEN'
    ? summary.warehouse.blockUsage.slice(0, 8)
    : summary.warehouse.warehouseUsage.slice(0, 8);

  if (rows.length === 0) {
    return <p className="text-sm text-[var(--muted-foreground)]">{tx('No warehouse capacity data yet.')}</p>;
  }

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.id}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800">
                {'warehouseName' in row ? `${row.name} · ${row.warehouseName}` : row.name}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {formatNumber(Math.round(row.currentUsage))} / {formatNumber(Math.round(row.capacity))} {tx('occupied')}
              </p>
            </div>
            <span className="font-semibold text-slate-900">{row.usagePercent}%</span>
          </div>
          <div className="h-3 rounded-full bg-[var(--muted)]">
            <div className={`h-3 rounded-full ${percentBarClass(row.usagePercent)}`} style={{ width: `${Math.min(row.usagePercent, 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LowStockList({ summary }: { summary: BiSummary }) {
  const { tx } = useI18n();
  const products = summary.inventory.lowStockProducts;

  if (products.length === 0) {
    return <p className="text-sm text-[var(--muted-foreground)]">{tx('No products below the low-stock threshold.')}</p>;
  }

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--muted)] px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
            <p className="truncate text-xs text-[var(--muted-foreground)]">{product.warehouseName} · {product.blocName}</p>
          </div>
          <span className="rounded-full bg-[var(--tint-warning)] px-2.5 py-1 text-xs font-semibold text-[var(--color-warning)]">
            {product.quantity}
          </span>
        </div>
      ))}
    </div>
  );
}

function RecentMovements({ summary }: { summary: BiSummary }) {
  const { tx } = useI18n();
  const movements = summary.inventory.recentMovements;

  if (movements.length === 0) {
    return <p className="text-sm text-[var(--muted-foreground)]">{tx('No inventory movements recorded yet.')}</p>;
  }

  return (
    <div className="space-y-3">
      {movements.slice(0, 6).map((movement) => (
        <div key={movement.id} className="rounded-xl border border-[var(--border)] bg-white px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{movement.productName}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {labelFor(movement.operationType, tx)} · {movement.quantity} {tx('units')}
              </p>
            </div>
            <span className="shrink-0 text-xs text-[var(--muted-foreground)]">{formatDate(movement.createdAt)}</span>
          </div>
          <p className="mt-2 truncate text-xs text-[var(--muted-foreground)]">
            {movement.sourceBlocName ?? tx('External')} → {movement.destinationBlocName ?? tx('External')}
          </p>
        </div>
      ))}
    </div>
  );
}

function ContactRequestsAlert({
  summary,
  accessToken,
  onRefresh,
}: {
  summary: BiSummary;
  accessToken?: string;
  onRefresh?: () => Promise<void>;
}) {
  const { tx } = useI18n();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requests = summary.support.latestContactRequests ?? [];

  async function markContacted(requestId: number) {
    if (!accessToken) return;

    setBusyId(requestId);
    setError(null);

    try {
      await markContactRequestContacted(accessToken, requestId);
      await onRefresh?.();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : tx('Failed to update contact request'));
    } finally {
      setBusyId(null);
    }
  }

  if (requests.length === 0) {
    return (
      <Section title="Public contact requests">
        <p className="text-sm text-[var(--muted-foreground)]">{tx('No contact requests yet.')}</p>
      </Section>
    );
  }

  return (
    <Section title="Public contact requests">
      <div className="mb-4 rounded-2xl bg-[var(--tint-warning)] px-4 py-3 text-sm text-[var(--color-warning)]">
        {summary.support.newContactRequests} {tx('new visitor inquiries need follow-up.')}
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          {tx(error)}
        </div>
      )}

      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="rounded-xl border border-[var(--border)] bg-white px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">{tx(request.reason)}</p>
                <p className="mt-1 break-all text-xs text-[var(--muted-foreground)]">{request.email}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{request.phone}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{formatDate(request.createdAt)}</p>
              </div>

              <button
                type="button"
                disabled={busyId === request.id}
                onClick={() => void markContacted(request.id)}
                className="w-fit rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyId === request.id ? tx('Saving...') : tx('Mark contacted')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function cardsFor(summary: BiSummary, mode: BiDashboardProps['mode'], tx: (text: string) => string): KpiCard[] {
  if (mode === 'TECHNICIEN') {
    return [
      { label: 'Total products', value: formatNumber(summary.inventory.totalProducts), hint: 'Registered products in stock', tone: 'var(--color-info)' },
      { label: 'Stock quantity', value: formatNumber(summary.inventory.totalStockQuantity), hint: 'Total product units across blocs', tone: 'var(--color-success)' },
      { label: 'Capacity usage', value: `${summary.warehouse.capacityUsagePercent}%`, hint: 'Occupied warehouse capacity', tone: 'var(--color-warning)' },
      { label: 'My open tickets', value: summary.support.myOpenTickets, hint: 'Technician tickets still active', tone: 'var(--color-error)' },
    ];
  }

  return [
    { label: 'Total products', value: formatNumber(summary.inventory.totalProducts), hint: 'Registered products in platform', tone: 'var(--color-info)' },
    { label: 'Total stock', value: formatNumber(summary.inventory.totalStockQuantity), hint: 'All product quantities combined', tone: 'var(--color-success)' },
      { label: 'Low stock', value: summary.inventory.lowStockProductsCount, hint: `${tx('Products at or below')} ${summary.lowStockThreshold}`, tone: 'var(--color-warning)' },
    { label: 'Capacity usage', value: `${summary.warehouse.capacityUsagePercent}%`, hint: 'Occupied storage capacity', tone: 'var(--color-error)' },
    { label: 'Warehouses', value: summary.warehouse.totalWarehouses, hint: `${summary.warehouse.totalBlocks} ${tx('storage blocks')}`, tone: 'var(--role-manager)' },
    { label: 'Customers', value: summary.users.totalCustomers, hint: 'Registered customer accounts', tone: 'var(--role-customer)' },
    { label: 'Orders', value: summary.orders.totalOrders, hint: `${summary.orders.approvedOrders} ${tx('approved')}, ${summary.orders.rejectedOrders} ${tx('rejected')}`, tone: 'var(--role-admin)' },
    { label: 'Active issues', value: summary.support.openSupportTickets + summary.support.openReclamations, hint: 'Open tickets and reclamations', tone: 'var(--color-warning)' },
    { label: 'Visitor inquiries', value: summary.support.newContactRequests ?? 0, hint: 'New visitor inquiries', tone: 'var(--role-customer)' },
  ];
}

function combineCounts(...groups: BiStatusCounts[]): BiStatusCounts {
  return groups.reduce<BiStatusCounts>((acc, group) => {
    for (const [key, value] of Object.entries(group)) {
      acc[key] = (acc[key] ?? 0) + value;
    }

    return acc;
  }, {});
}

export default function BiDashboard({ summary, mode, accessToken, onRefresh }: BiDashboardProps) {
  const { tx } = useI18n();

  return (
    <div className="space-y-6">
      <KpiGrid cards={cardsFor(summary, mode, tx)} />

      {mode !== 'TECHNICIEN' && (
        <ContactRequestsAlert summary={summary} accessToken={accessToken} onRefresh={onRefresh} />
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Section title={mode === 'TECHNICIEN' ? 'Block Capacity Usage' : 'Warehouse Capacity Usage'}>
          <CapacityBars summary={summary} mode={mode} />
        </Section>

        <Section title="Low Stock Products">
          <LowStockList summary={summary} />
        </Section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {mode !== 'TECHNICIEN' && (
          <Section title="Order Status">
            <StatusBars counts={summary.orders.statusCounts} />
          </Section>
        )}

        <Section title={mode === 'TECHNICIEN' ? 'Movement Types' : 'Shipment Status'}>
          <StatusBars counts={mode === 'TECHNICIEN' ? summary.inventory.movementTypeCounts : summary.shipments.statusCounts} />
        </Section>

        <Section title="Support & Reclamations">
          <StatusBars counts={combineCounts(summary.support.ticketStatusCounts, summary.support.reclamationStatusCounts)} />
        </Section>

        <Section title="Recent Movements">
          <RecentMovements summary={summary} />
        </Section>
      </div>
    </div>
  );
}
