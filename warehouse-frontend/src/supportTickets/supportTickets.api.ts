const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type SupportTicketCategory = 'MACHINE_MALFUNCTION' | 'PRODUCT_ISSUE' | 'DELAY' | 'ALERT';
export type SupportTicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportTicketCreator {
  id: number;
  email: string;
  name: string | null;
  roles: string;
}

export interface SupportTicket {
  id: number;
  title: string;
  category: SupportTicketCategory;
  description: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  managerNote: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: SupportTicketCreator;
}

export interface SupportTicketPayload {
  title: string;
  category: SupportTicketCategory;
  description: string;
  priority?: SupportTicketPriority;
}

export interface UpdateSupportTicketPayload {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  managerNote?: string;
}

function parseErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const raw = data as Record<string, unknown>;
  const message = raw.message;

  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join(', ');
  }

  return fallback;
}

function asRecord(data: unknown, label: string): Record<string, unknown> {
  if (!data || typeof data !== 'object') {
    throw new Error(`Invalid ${label} payload`);
  }
  return data as Record<string, unknown>;
}

function normalizeCreator(data: unknown): SupportTicketCreator {
  const raw = asRecord(data, 'ticket creator');

  if (
    typeof raw.id !== 'number' ||
    typeof raw.email !== 'string' ||
    typeof raw.roles !== 'string'
  ) {
    throw new Error('Invalid support ticket creator payload');
  }

  return {
    id: raw.id,
    email: raw.email,
    name: typeof raw.name === 'string' ? raw.name : null,
    roles: raw.roles,
  };
}

function normalizeTicket(data: unknown): SupportTicket {
  const raw = asRecord(data, 'support ticket');

  if (
    typeof raw.id !== 'number' ||
    typeof raw.title !== 'string' ||
    typeof raw.category !== 'string' ||
    typeof raw.description !== 'string' ||
    typeof raw.priority !== 'string' ||
    typeof raw.status !== 'string' ||
    typeof raw.createdAt !== 'string' ||
    typeof raw.updatedAt !== 'string' ||
    !raw.createdBy
  ) {
    throw new Error('Invalid support ticket payload');
  }

  return {
    id: raw.id,
    title: raw.title,
    category: raw.category as SupportTicketCategory,
    description: raw.description,
    priority: raw.priority as SupportTicketPriority,
    status: raw.status as SupportTicketStatus,
    managerNote: typeof raw.managerNote === 'string' ? raw.managerNote : null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    createdBy: normalizeCreator(raw.createdBy),
  };
}

async function requestJson(path: string, method: string, accessToken: string, body?: unknown): Promise<unknown> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, `Request failed: ${method} ${path}`));
  }

  return data;
}

export async function getMySupportTickets(accessToken: string): Promise<SupportTicket[]> {
  const data = await requestJson('/support-tickets/my', 'GET', accessToken);
  if (!Array.isArray(data)) {
    throw new Error('Invalid support tickets response');
  }
  return data.map(normalizeTicket);
}

export async function getAllSupportTickets(accessToken: string): Promise<SupportTicket[]> {
  const data = await requestJson('/support-tickets', 'GET', accessToken);
  if (!Array.isArray(data)) {
    throw new Error('Invalid support tickets response');
  }
  return data.map(normalizeTicket);
}

export async function createSupportTicket(accessToken: string, payload: SupportTicketPayload): Promise<SupportTicket> {
  const data = await requestJson('/support-tickets', 'POST', accessToken, payload);
  return normalizeTicket(data);
}

export async function updateSupportTicket(
  accessToken: string,
  ticketId: number,
  payload: UpdateSupportTicketPayload,
): Promise<SupportTicket> {
  const data = await requestJson(`/support-tickets/${ticketId}`, 'PATCH', accessToken, payload);
  return normalizeTicket(data);
}