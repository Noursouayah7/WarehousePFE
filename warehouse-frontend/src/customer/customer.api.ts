const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type CustomerOrderStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESTOCK_REQUESTED'
  | 'COMPLETED';

export type CustomerDeliveryStatus = 'PENDING' | 'IN_DELIVERY' | 'DELIVERED';

export interface CustomerProductOption {
  id: number;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  blocId: number;
  blocName: string;
}

export interface CreateCustomerOrderItemPayload {
  productId: number;
  quantity: number;
}

export interface CreateCustomerOrderPayload {
  items: CreateCustomerOrderItemPayload[];
  deliveryDeadline: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
}

export interface CustomerOrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CustomerOrder {
  id: number;
  productName: string;
  quantity: number;
  totalAmount: number;
  deliveryDeadline: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  status: CustomerOrderStatus;
  deliveryStatus: CustomerDeliveryStatus;
  managerNote: string | null;
  rejectionReason: string | null;
  approvedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: CustomerOrderItem[];
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

function asRecord(data: unknown, label: string): Record<string, unknown> {
  if (!data || typeof data !== 'object') {
    throw new Error(`Invalid ${label} payload`);
  }
  return data as Record<string, unknown>;
}

function normalizeCustomerProduct(data: unknown): CustomerProductOption {
  const raw = asRecord(data, 'customer product');

  if (
    typeof raw.id !== 'number' ||
    typeof raw.name !== 'string' ||
    typeof raw.price !== 'number' ||
    typeof raw.quantity !== 'number' ||
    typeof raw.blocId !== 'number'
  ) {
    throw new Error('Invalid customer product payload');
  }

  return {
    id: raw.id,
    name: raw.name,
    description: typeof raw.description === 'string' ? raw.description : null,
    price: raw.price,
    quantity: raw.quantity,
    blocId: raw.blocId,
    blocName: typeof raw.blocName === 'string' ? raw.blocName : 'Unknown bloc',
  };
}

function normalizeCustomerOrderItem(data: unknown): CustomerOrderItem {
  const raw = asRecord(data, 'customer order item');

  if (
    typeof raw.id !== 'number' ||
    typeof raw.productId !== 'number' ||
    typeof raw.productName !== 'string' ||
    typeof raw.unitPrice !== 'number' ||
    typeof raw.quantity !== 'number' ||
    typeof raw.lineTotal !== 'number'
  ) {
    throw new Error('Invalid customer order item payload');
  }

  return {
    id: raw.id,
    productId: raw.productId,
    productName: raw.productName,
    unitPrice: raw.unitPrice,
    quantity: raw.quantity,
    lineTotal: raw.lineTotal,
  };
}

function normalizeCustomerOrder(data: unknown): CustomerOrder {
  const raw = asRecord(data, 'customer order');

  if (
    typeof raw.id !== 'number' ||
    typeof raw.productName !== 'string' ||
    typeof raw.quantity !== 'number' ||
    typeof raw.totalAmount !== 'number' ||
    typeof raw.deliveryDeadline !== 'string' ||
    typeof raw.deliveryAddress !== 'string' ||
    typeof raw.customerName !== 'string' ||
    typeof raw.customerPhone !== 'string' ||
    typeof raw.status !== 'string' ||
    typeof raw.deliveryStatus !== 'string' ||
    typeof raw.createdAt !== 'string' ||
    typeof raw.updatedAt !== 'string'
  ) {
    throw new Error('Invalid customer order payload');
  }

  return {
    id: raw.id,
    productName: raw.productName,
    quantity: raw.quantity,
    totalAmount: raw.totalAmount,
    deliveryDeadline: raw.deliveryDeadline,
    deliveryAddress: raw.deliveryAddress,
    customerName: raw.customerName,
    customerPhone: raw.customerPhone,
    status: raw.status as CustomerOrderStatus,
    deliveryStatus: raw.deliveryStatus as CustomerDeliveryStatus,
    managerNote: typeof raw.managerNote === 'string' ? raw.managerNote : null,
    rejectionReason: typeof raw.rejectionReason === 'string' ? raw.rejectionReason : null,
    approvedAt: typeof raw.approvedAt === 'string' ? raw.approvedAt : null,
    deliveredAt: typeof raw.deliveredAt === 'string' ? raw.deliveredAt : null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    items: Array.isArray(raw.items) ? raw.items.map(normalizeCustomerOrderItem) : [],
  };
}

export async function getCustomerProductOptions(accessToken: string): Promise<CustomerProductOption[]> {
  const data = await requestJson('/orders/products', 'GET', accessToken);
  if (!Array.isArray(data)) {
    throw new Error('Invalid products response');
  }
  return data.map(normalizeCustomerProduct);
}

export async function createCustomerOrder(
  accessToken: string,
  payload: CreateCustomerOrderPayload,
): Promise<CustomerOrder> {
  const data = await requestJson('/orders/create', 'POST', accessToken, payload);
  return normalizeCustomerOrder(data);
}

export async function getCustomerOrders(accessToken: string): Promise<CustomerOrder[]> {
  const data = await requestJson('/orders/my', 'GET', accessToken);
  if (!Array.isArray(data)) {
    throw new Error('Invalid orders response');
  }
  return data.map(normalizeCustomerOrder);
}
