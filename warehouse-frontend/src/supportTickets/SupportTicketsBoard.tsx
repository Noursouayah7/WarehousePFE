'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
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

const STATUS_OPTIONS: SupportTicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
}

export function SupportTicketsBoard({ canCreate, canUpdate }: { canCreate: boolean; canUpdate: boolean }) {
  const { token } = useAuth();
  const { query } = useWorkspaceSearch();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyTicketId, setBusyTicketId] = useState<number | null>(null);
  const [form, setForm] = useState<TicketForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadTickets(activeToken: string) {
    const data = canCreate ? await getMySupportTickets(activeToken) : await getAllSupportTickets(activeToken);
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

    return () => {
      mounted = false;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ticket');
    } finally {
      setBusyTicketId(null);
    }
  }

  return (
    <section className="mt-8 rounded-2xl bg-transparent">
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
            className="md:col-span-2 rounded-xl bg-[var(--role-technicien)] px-4 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#e4ecd8] disabled:text-[#8b857a]"
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
                  <td className="rounded-l-lg bg-[var(--card)] px-3 py-3 text-[#496553]">#{ticket.id}</td>
                  <td className="bg-[var(--card)] px-3 py-3">
                    <p className="font-semibold">{ticket.title}</p>
                    <p className="mt-1 text-xs text-[#6b705c]">{ticket.description}</p>
                  </td>
                  <td className="bg-[var(--card)] px-3 py-3 text-xs text-[#5f6f59]">{CATEGORY_LABELS[ticket.category]}</td>
                  <td className="bg-[var(--card)] px-3 py-3 text-xs text-[#5f6f59]">{PRIORITY_LABELS[ticket.priority]}</td>
                  <td className="bg-[var(--card)] px-3 py-3 text-xs text-[#5f6f59]">{ticket.status}</td>
                  <td className="bg-[var(--card)] px-3 py-3 text-xs text-[#5f6f59]">
                    <p>{ticket.createdBy.name ?? ticket.createdBy.email}</p>
                    <p className="text-[#6b705c]">{ticket.createdBy.roles}</p>
                  </td>
                  <td className="bg-[var(--card)] px-3 py-3 text-xs text-[#6b705c]">{ticket.managerNote || '—'}</td>
                  {canUpdate && (
                    <td className="rounded-r-lg bg-[var(--card)] px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={busyTicketId === ticket.id}
                            onClick={() => changeStatus(ticket.id, status, status === 'RESOLVED' ? 'Ticket resolved' : undefined)}
                            className="rounded-md bg-[var(--tint-info)] px-3 py-1.5 text-xs font-medium text-[var(--color-info)] disabled:opacity-40"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {visibleTickets.length === 0 && (
                <tr>
                  <td colSpan={canUpdate ? 8 : 7} className="px-3 py-8 text-center text-sm text-[#6b705c]">
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