const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type AssistantIntent =
  | 'stock_quantity'
  | 'stock_check'
  | 'inventory_summary'
  | 'product_location'
  | 'low_stock'
  | 'order_status'
  | 'warehouse_capacity'
  | 'clarification'
  | 'unsupported'
  | 'forbidden';

export interface AssistantMatch {
  id: number;
  productName: string;
  quantity: number;
  warehouseName: string;
  blocName: string;
}

export interface AssistantQueryState {
  productName: string | null;
  warehouseName: string | null;
  blocName: string | null;
  orderId?: string | null;
  wantsInventorySummary: boolean;
}

export interface AssistantHistoryEntry {
  role: 'user' | 'assistant';
  message: string;
  intent?: string;
  timestamp: string;
}

export interface AssistantResponse {
  intent: AssistantIntent;
  message: string;
  query: AssistantQueryState;
  totalQuantity?: number;
  matches?: AssistantMatch[];
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') {
    throw new Error('Invalid assistant response');
  }

  return value as Record<string, unknown>;
}

function parseQuery(data: unknown): AssistantQueryState {
  const raw = asRecord(data);

  return {
    productName: typeof raw.productName === 'string' ? raw.productName : null,
    warehouseName: typeof raw.warehouseName === 'string' ? raw.warehouseName : null,
    blocName: typeof raw.blocName === 'string' ? raw.blocName : null,
    orderId: typeof raw.orderId === 'string' ? raw.orderId : null,
    wantsInventorySummary: Boolean(raw.wantsInventorySummary),
  };
}

function normalizeHistoryEntry(data: unknown): AssistantHistoryEntry {
  const raw = asRecord(data);

  if (
    (raw.role !== 'user' && raw.role !== 'assistant') ||
    typeof raw.message !== 'string' ||
    typeof raw.timestamp !== 'string'
  ) {
    throw new Error('Invalid assistant history entry payload');
  }

  return {
    role: raw.role,
    message: raw.message,
    intent: typeof raw.intent === 'string' ? raw.intent : undefined,
    timestamp: raw.timestamp,
  };
}

function normalizeMatch(data: unknown): AssistantMatch {
  const raw = asRecord(data);

  if (
    typeof raw.id !== 'number' ||
    typeof raw.productName !== 'string' ||
    typeof raw.quantity !== 'number' ||
    typeof raw.warehouseName !== 'string' ||
    typeof raw.blocName !== 'string'
  ) {
    throw new Error('Invalid assistant match payload');
  }

  return {
    id: raw.id,
    productName: raw.productName,
    quantity: raw.quantity,
    warehouseName: raw.warehouseName,
    blocName: raw.blocName,
  };
}

export async function askAssistant(accessToken: string, message: string): Promise<AssistantResponse> {
  const response = await fetch(`${API_URL}/assistant/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const raw = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const messageValue = raw && typeof raw.message === 'string' ? raw.message : 'Assistant request failed';
    throw new Error(messageValue);
  }

  const raw = asRecord(data);

  if (typeof raw.intent !== 'string' || typeof raw.message !== 'string' || !raw.query) {
    throw new Error('Invalid assistant response');
  }

  return {
    intent: raw.intent as AssistantIntent,
    message: raw.message,
    query: parseQuery(raw.query),
    totalQuantity: typeof raw.totalQuantity === 'number' ? raw.totalQuantity : undefined,
    matches: Array.isArray(raw.matches) ? raw.matches.map(normalizeMatch) : undefined,
  };
}

export async function getAssistantHistory(accessToken: string): Promise<AssistantHistoryEntry[]> {
  const response = await fetch(`${API_URL}/assistant/history`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const raw = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
    const messageValue = raw && typeof raw.message === 'string' ? raw.message : 'Assistant history request failed';
    throw new Error(messageValue);
  }

  const raw = asRecord(data);
  if (!Array.isArray(raw.history)) {
    return [];
  }

  return raw.history.map(normalizeHistoryEntry);
}