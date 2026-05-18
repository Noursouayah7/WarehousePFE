const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type OrderStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESTOCK_REQUESTED'
  | 'COMPLETED';

export type DeliveryStatus = 'PENDING' | 'IN_DELIVERY' | 'DELIVERED';

export type ShipmentStatus = 'REQUESTED' | 'IN_TRANSIT' | 'RECEIVED';

export interface ManagerOrderShipment {
  id: number;
  status: ShipmentStatus;
  quantity: number;
  blocId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ManagerOrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface ManagerOrder {
  id: number;
  productName: string;
  quantity: number;
  deliveryDeadline: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  managerNote: string | null;
  rejectionReason: string | null;
  approvedAt: string | null;
  deliveredAt: string | null;
  restockAt: string | null;
  createdAt: string;
  updatedAt: string;
  shipments: ManagerOrderShipment[];
  items: ManagerOrderItem[];
}

export interface ShipmentOrderRef {
  id: number;
  status: OrderStatus;
  managerNote: string | null;
}

export interface ShipmentBlocRef {
  id: number;
  name: string;
  capacity: number;
  currentUsage: number;
}

export interface ManagerShipment {
  id: number;
  orderId: number | null;
  productName: string;
  quantity: number;
  blocId: number;
  supplierName: string | null;
  trackingNumber: string | null;
  expectedAt: string | null;
  receivedAt: string | null;
  status: ShipmentStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  order: ShipmentOrderRef | null;
  bloc: ShipmentBlocRef;
}

export interface RestockRequestPayload {
  blocId: number;
  quantity?: number;
  productName?: string;
  supplierName?: string;
  trackingNumber?: string;
  expectedAt?: string;
  note?: string;
}

export interface ReceiveShipmentPayload {
  receivedQuantity?: number;
  trackingNumber?: string;
  note?: string;
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

function normalizeOrderShipment(data: unknown): ManagerOrderShipment {
  const raw = asRecord(data, 'order shipment');

  if (
    typeof raw.id !== 'number' ||
    typeof raw.status !== 'string' ||
    typeof raw.quantity !== 'number' ||
    typeof raw.blocId !== 'number' ||
    typeof raw.createdAt !== 'string' ||
    typeof raw.updatedAt !== 'string'
  ) {
    throw new Error('Invalid order shipment payload');
  }

  return {
    id: raw.id,
    status: raw.status as ShipmentStatus,
    quantity: raw.quantity,
    blocId: raw.blocId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function normalizeOrder(data: unknown): ManagerOrder {
  const raw = asRecord(data, 'order');

  if (
    typeof raw.id !== 'number' ||
    typeof raw.productName !== 'string' ||
    typeof raw.quantity !== 'number' ||
    typeof raw.deliveryDeadline !== 'string' ||
    typeof raw.deliveryAddress !== 'string' ||
    typeof raw.customerName !== 'string' ||
    typeof raw.customerPhone !== 'string' ||
    typeof raw.status !== 'string' ||
    typeof raw.deliveryStatus !== 'string' ||
    typeof raw.createdAt !== 'string' ||
    typeof raw.updatedAt !== 'string' ||
    !Array.isArray(raw.shipments)
  ) {
    throw new Error('Invalid order payload');
  }

  return {
    id: raw.id,
    productName: raw.productName,
    quantity: raw.quantity,
    deliveryDeadline: raw.deliveryDeadline,
    deliveryAddress: raw.deliveryAddress,
    customerName: raw.customerName,
    customerPhone: raw.customerPhone,
    status: raw.status as OrderStatus,
    deliveryStatus: raw.deliveryStatus as DeliveryStatus,
    managerNote: typeof raw.managerNote === 'string' ? raw.managerNote : null,
    rejectionReason: typeof raw.rejectionReason === 'string' ? raw.rejectionReason : null,
    approvedAt: typeof raw.approvedAt === 'string' ? raw.approvedAt : null,
    deliveredAt: typeof raw.deliveredAt === 'string' ? raw.deliveredAt : null,
    restockAt: typeof raw.restockAt === 'string' ? raw.restockAt : null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    shipments: raw.shipments.map(normalizeOrderShipment),
    items: Array.isArray(raw.items)
      ? raw.items.map((item) => {
          const entry = asRecord(item, 'order item');
          if (
            typeof entry.id !== 'number' ||
            typeof entry.productId !== 'number' ||
            typeof entry.productName !== 'string' ||
            typeof entry.unitPrice !== 'number' ||
            typeof entry.quantity !== 'number' ||
            typeof entry.lineTotal !== 'number'
          ) {
            throw new Error('Invalid order item payload');
          }

          return {
            id: entry.id,
            productId: entry.productId,
            productName: entry.productName,
            unitPrice: entry.unitPrice,
            quantity: entry.quantity,
            lineTotal: entry.lineTotal,
          } satisfies ManagerOrderItem;
        })
      : [],
  };
}

function normalizeShipmentOrder(data: unknown): ShipmentOrderRef {
  const raw = asRecord(data, 'shipment order');
  if (typeof raw.id !== 'number' || typeof raw.status !== 'string') {
    throw new Error('Invalid shipment order payload');
  }

  return {
    id: raw.id,
    status: raw.status as OrderStatus,
    managerNote: typeof raw.managerNote === 'string' ? raw.managerNote : null,
  };
}

function normalizeShipmentBloc(data: unknown): ShipmentBlocRef {
  const raw = asRecord(data, 'shipment bloc');
  if (
    typeof raw.id !== 'number' ||
    typeof raw.name !== 'string' ||
    typeof raw.capacity !== 'number' ||
    typeof raw.currentUsage !== 'number'
  ) {
    throw new Error('Invalid shipment bloc payload');
  }

  return {
    id: raw.id,
    name: raw.name,
    capacity: raw.capacity,
    currentUsage: raw.currentUsage,
  };
}

function normalizeShipment(data: unknown): ManagerShipment {
  const raw = asRecord(data, 'shipment');

  if (
    typeof raw.id !== 'number' ||
    typeof raw.productName !== 'string' ||
    typeof raw.quantity !== 'number' ||
    typeof raw.blocId !== 'number' ||
    typeof raw.status !== 'string' ||
    typeof raw.createdAt !== 'string' ||
    typeof raw.updatedAt !== 'string' ||
    !raw.bloc ||
    typeof raw.bloc !== 'object'
  ) {
    throw new Error('Invalid shipment payload');
  }

  return {
    id: raw.id,
    orderId: typeof raw.orderId === 'number' ? raw.orderId : null,
    productName: raw.productName,
    quantity: raw.quantity,
    blocId: raw.blocId,
    supplierName: typeof raw.supplierName === 'string' ? raw.supplierName : null,
    trackingNumber: typeof raw.trackingNumber === 'string' ? raw.trackingNumber : null,
    expectedAt: typeof raw.expectedAt === 'string' ? raw.expectedAt : null,
    receivedAt: typeof raw.receivedAt === 'string' ? raw.receivedAt : null,
    status: raw.status as ShipmentStatus,
    note: typeof raw.note === 'string' ? raw.note : null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    order: raw.order && typeof raw.order === 'object' ? normalizeShipmentOrder(raw.order) : null,
    bloc: normalizeShipmentBloc(raw.bloc),
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

export async function getManagerOrders(accessToken: string): Promise<ManagerOrder[]> {
  const data = await requestJson('/orders', 'GET', accessToken);
  if (!Array.isArray(data)) {
    throw new Error('Invalid orders response');
  }
  return data.map(normalizeOrder);
}

export async function approveOrder(accessToken: string, orderId: number, managerNote?: string): Promise<ManagerOrder> {
  const data = await requestJson(`/orders/${orderId}/approve`, 'PATCH', accessToken, {
    managerNote: managerNote?.trim() || undefined,
  });
  return normalizeOrder(data);
}

export async function rejectOrder(
  accessToken: string,
  orderId: number,
  reason: string,
  managerNote?: string,
): Promise<ManagerOrder> {
  const data = await requestJson(`/orders/${orderId}/reject`, 'PATCH', accessToken, {
    reason,
    managerNote: managerNote?.trim() || undefined,
  });
  return normalizeOrder(data);
}

export async function requestRestock(
  accessToken: string,
  orderId: number,
  payload: RestockRequestPayload,
): Promise<ManagerShipment> {
  const data = await requestJson(`/orders/${orderId}/restock-request`, 'POST', accessToken, payload);
  return normalizeShipment(data);
}

export async function markOrderDelivered(
  accessToken: string,
  orderId: number,
  managerNote?: string,
): Promise<ManagerOrder> {
  const data = await requestJson(`/orders/${orderId}/delivered`, 'PATCH', accessToken, {
    managerNote: managerNote?.trim() || undefined,
  });
  return normalizeOrder(data);
}

export async function getManagerShipments(accessToken: string): Promise<ManagerShipment[]> {
  const data = await requestJson('/shipments', 'GET', accessToken);
  if (!Array.isArray(data)) {
    throw new Error('Invalid shipments response');
  }
  return data.map(normalizeShipment);
}

export async function markShipmentInTransit(accessToken: string, shipmentId: number): Promise<ManagerShipment> {
  const data = await requestJson(`/shipments/${shipmentId}/in-transit`, 'PATCH', accessToken);
  return normalizeShipment(data);
}

export async function receiveShipment(
  accessToken: string,
  shipmentId: number,
  payload: ReceiveShipmentPayload,
): Promise<ManagerShipment> {
  const data = await requestJson(`/shipments/${shipmentId}/receive`, 'PATCH', accessToken, payload);
  return normalizeShipment(data);
}
