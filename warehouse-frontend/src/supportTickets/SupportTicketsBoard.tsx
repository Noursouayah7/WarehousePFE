'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import { useWorkspaceSearch } from '@/src/common/WorkspaceShell';
import {
  createSupportTicket,
  getAllSupportTickets,
  getMySupportTickets,
  SupportTicket,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
  updateSupportTicket,
} from './supportTickets.api';

type TicketForm = {
  title: string;
  category: SupportTicketCategory;
  description: string;
  priority: SupportTicketPriority;
};

const emptyForm: TicketForm = {
  title: '',
  category: 'ALERT',
  description: '',
  priority: 'MEDIUM',
};

const CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  MACHINE_MALFUNCTION: 'Machine malfunction',
  PRODUCT_ISSUE: 'Product issue',
  DELAY: 'Delay',
  ALERT: 'Alert',
};

const PRIORITY_LABELS: Record<SupportTicketPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const STATUS_OPTIONS: SupportTicketStatus[] = ['RESOLVED', 'CLOSED'];

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const STATUS_CLASSES: Record<SupportTicketStatus, string> = {
  OPEN: 'bg-[var(--tint-warning)] text-[var(--color-warning)]',
  IN_PROGRESS: 'bg-[var(--tint-info)] text-[var(--color-info)]',
  RESOLVED: 'bg-[var(--tint-success)] text-[var(--color-success)]',
  CLOSED: 'bg-slate-100 text-slate-600',
};

const POLL_INTERVAL_MS = 5000;
const STATUS_TOAST_TIMEOUT_MS = 4000;

type StatusNotice = {
  ticketId: number;
  title: string;
  status: SupportTicketStatus;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

export function SupportTicketsBoard({ canCreate, canUpdate }: { canCreate: boolean; canUpdate: boolean }) {
  const { token } = useAuth();
  const { query } = useWorkspaceSearch();
  const previousStatusMapRef = useRef<Record<number, SupportTicketStatus>>({});
  const hasLoadedRef = useRef(false);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyTicketId, setBusyTicketId] = useState<number | null>(null);
  const [form, setForm] = useState<TicketForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusNotice, setStatusNotice] = useState<StatusNotice | null>(null);

  useEffect(() => {
    if (!statusNotice) return;

    const timeoutId = window.setTimeout(() => {
      setStatusNotice(null);
    }, STATUS_TOAST_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [statusNotice]);

  async function loadTickets(activeToken: string) {
    const data = canCreate ? await getMySupportTickets(activeToken) : await getAllSupportTickets(activeToken);
    const nextStatusMap = data.reduce<Record<number, SupportTicketStatus>>((accumulator, ticket) => {
      accumulator[ticket.id] = ticket.status;
      return accumulator;
    }, {});

    if (hasLoadedRef.current) {
      for (const ticket of data) {
        const previousStatus = previousStatusMapRef.current[ticket.id];

        if (
          previousStatus !== ticket.status &&
          (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED')
        ) {
          setStatusNotice({
            ticketId: ticket.id,
            title: ticket.title,
            status: ticket.status,
          });
          break;
        }
      }
    } else {
      hasLoadedRef.current = true;
    }

    previousStatusMapRef.current = nextStatusMap;
    setTickets(data);
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

    void loadTickets(token)
      .catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load support tickets');
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoading(false);
      });

    const pollId = window.setInterval(() => {
      void loadTickets(token).catch((err: unknown) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load support tickets');
      });
    }, POLL_INTERVAL_MS);

    return () => {
      mounted = false;
      window.clearInterval(pollId);
    };
  }, [token, canCreate]);

  const visibleTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return tickets;

    return tickets.filter((ticket) => {
      return [
        String(ticket.id),
        ticket.title,
        ticket.description,
        ticket.status,
        ticket.priority,
        ticket.category,
        ticket.managerNote ?? '',
        ticket.createdBy.email,
        ticket.createdBy.name ?? '',
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [query, tickets]);

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError('Missing auth token. Please login again.');
      return;
    }

    const title = form.title.trim();
    const description = form.description.trim();

    if (!title || !description) {
      setFormError('Title and description are required.');
      return;
    }

    setSaving(true);
    setError(null);
    setFormError(null);

    try {
      const created = await createSupportTicket(token, {
        title,
        category: form.category,
        description,
        priority: form.priority,
      });

      setTickets((current) => [created, ...current]);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create support ticket');
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(ticketId: number, status: SupportTicketStatus, managerNote?: string) {
    if (!token) {
      setError('Missing auth token. Please login again.');
      return;
    }

    setBusyTicketId(ticketId);
    setError(null);

    try {
      const updated = await updateSupportTicket(token, ticketId, { status, managerNote });
      setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? updated : ticket)));
      previousStatusMapRef.current = {
        ...previousStatusMapRef.current,
        [ticketId]: updated.status,
      };

      if (updated.status === 'RESOLVED' || updated.status === 'CLOSED') {
        setStatusNotice({
          ticketId: updated.id,
          title: updated.title,
          status: updated.status,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
    } finally {
      setBusyTicketId(null);
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-transparent">
      {statusNotice && (
        <div className="fixed right-4 top-4 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <div
              className={[
                'mt-0.5 flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold',
                statusNotice.status === 'RESOLVED'
                  ? 'bg-[var(--tint-success)] text-[var(--color-success)]'
                  : 'bg-slate-100 text-slate-600',
              ].join(' ')}
            >
              {statusNotice.status === 'RESOLVED' ? 'R' : 'C'}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Ticket updated</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                #{statusNotice.ticketId} {statusNotice.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Marked as {STATUS_LABELS[statusNotice.status].toLowerCase()}.
                {statusNotice.status === 'RESOLVED' ? ' The issue is resolved.' : ' The ticket is closed.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStatusNotice(null)}
              className="rounded-full px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Support tickets</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{visibleTickets.length} tickets</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md bg-[var(--tint-error)] px-3 py-2 text-sm text-[var(--color-error)]">
          <span aria-hidden="true">!</span>
          {error}
        </div>
      )}

      {canCreate && (
        <form onSubmit={submitTicket} className="mb-8 grid gap-3 rounded-2xl bg-[var(--card)] p-5 shadow-sm md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Title</label>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--ring)]"
              placeholder="Issue summary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Category</label>
            <select
              value={form.category}
              onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as SupportTicketCategory }))}
              className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--ring)]"
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Priority</label>
            <select
              value={form.priority}
              onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as SupportTicketPriority }))}
              className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--ring)]"
            >
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Description</label>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              rows={4}
              className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--ring)]"
              placeholder="Explain the malfunction, delay, alert, or product issue"
            />
          </div>

          {formError && (
            <div className="md:col-span-2 rounded-xl bg-[var(--tint-error)] px-4 py-3 text-sm text-[var(--color-error)]">
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="md:col-span-2 rounded-xl bg-[var(--role-technicien)] px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--muted)] disabled:text-[var(--muted-foreground)]"
          >
            {saving ? 'Creating ticket...' : 'Submit ticket'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">Loading tickets...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-[var(--muted-foreground)]">
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">TITLE</th>
                <th className="px-3 py-2">CATEGORY</th>
                <th className="px-3 py-2">PRIORITY</th>
                <th className="px-3 py-2">STATUS</th>
                <th className="px-3 py-2">CREATED BY</th>
                <th className="px-3 py-2">NOTE</th>
                {canUpdate && <th className="px-3 py-2">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {visibleTickets.map((ticket) => (
                <tr key={ticket.id} className="align-top">
                  <td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[var(--foreground)]">#{ticket.id}</td>
                  <td className="bg-[var(--card)] px-3 py-3">
                    <p className="font-semibold">{ticket.title}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{ticket.description}</p>
                  </td>
                  <td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">{CATEGORY_LABELS[ticket.category]}</td>
                  <td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">{PRIORITY_LABELS[ticket.priority]}</td>
                  <td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">
                    <span className={["inline-flex rounded-full px-2.5 py-1 font-medium", STATUS_CLASSES[ticket.status]].join(' ')}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                  </td>
                  <td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">
                    <p>{ticket.createdBy.name ?? ticket.createdBy.email}</p>
                    <p className="text-[var(--muted-foreground)]">{ticket.createdBy.roles}</p>
                  </td>
                  <td className="bg-[var(--card)] px-3 py-3 text-xs text-[var(--muted-foreground)]">{ticket.managerNote || '—'}</td>
                  {canUpdate && (
                    <td className="rounded-r-lg bg-[var(--card)] px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={busyTicketId === ticket.id}
                            onClick={() => changeStatus(ticket.id, status, status === 'RESOLVED' ? 'Ticket resolved' : undefined)}
                            className="rounded-md bg-[var(--tint-info)] px-3 py-1.5 text-xs font-medium text-[var(--color-info)] transition-opacity hover:opacity-90 disabled:opacity-40"
                          >
                            {status === 'RESOLVED' ? 'Mark resolved' : 'Mark closed'}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {visibleTickets.length === 0 && (
                <tr>
                  <td colSpan={canUpdate ? 8 : 7} className="px-3 py-8 text-center text-sm text-[var(--muted-foreground)]">
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}