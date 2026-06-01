const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type RestockPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type RestockAlertStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface RestockAlertWarehouseRef {
  id: number;
  name: string;
}

export interface RestockAlertBlocRef {
  id: number;
  name: string;
  capacity: number;
  currentUsage: number;
  warehouseId: number;
  warehouse: RestockAlertWarehouseRef;
}

export interface RestockAlertUserRef {
  id: number;
  name: string | null;
  email: string;
}

export interface RestockAlertProductRef {
  id: number;
  name: string;
  blocId: number;
}

export interface RestockAlertMovementRef {
  id: number;
  productName: string;
  quantity: number;
  operationType: string;
  createdAt: string;
  note: string | null;
}

export interface RestockAlert {
  id: number;
  productId: number | null;
  productName: string;
  currentStock: number;
  requestedQuantity: number;
  warehouseId: number;
  blocId: number;
  priority: RestockPriority;
  managerNote: string | null;
  status: RestockAlertStatus;
  managerId: number | null;
  technicianId: number | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  product: RestockAlertProductRef | null;
  warehouse: RestockAlertWarehouseRef;
  bloc: RestockAlertBlocRef;
  manager: RestockAlertUserRef | null;
  technician: RestockAlertUserRef | null;
  inventoryMovements: RestockAlertMovementRef[];
}

export interface UpdateRestockAlertLocationPayload {
  warehouseId: number;
  blocId: number;
  note?: string;
}

export interface ExecuteRestockAlertPayload {
  quantity?: number;
  destinationBlocId?: number;
  note?: string;
}

export interface CreateRestockAlertPayload {
  productId?: number;
  productName: string;
  currentStock: number;
  requestedQuantity: number;
  warehouseId: number;
  blocId: number;
  priority?: RestockPriority;
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

function normalizeUser(data: unknown): RestockAlertUserRef | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const raw = data as Record<string, unknown>;
  if (typeof raw.id !== 'number' || typeof raw.email !== 'string') {
    return null;
  }

  return {
    id: raw.id,
    name: typeof raw.name === 'string' ? raw.name : null,
    email: raw.email,
  };
}

function normalizeWarehouse(data: unknown): RestockAlertWarehouseRef {
  const raw = asRecord(data, 'restock alert warehouse');
  if (typeof raw.id !== 'number' || typeof raw.name !== 'string') {
    throw new Error('Invalid restock alert warehouse payload');
  }

  return { id: raw.id, name: raw.name };
}

function normalizeBloc(data: unknown): RestockAlertBlocRef {
  const raw = asRecord(data, 'restock alert bloc');
  if (
    typeof raw.id !== 'number' ||
    typeof raw.name !== 'string' ||
    typeof raw.capacity !== 'number' ||
    typeof raw.currentUsage !== 'number' ||
    typeof raw.warehouseId !== 'number' ||
    !raw.warehouse
  ) {
    throw new Error('Invalid restock alert bloc payload');
  }

  return {
    id: raw.id,
    name: raw.name,
    capacity: raw.capacity,
    currentUsage: raw.currentUsage,
    warehouseId: raw.warehouseId,
    warehouse: normalizeWarehouse(raw.warehouse),
  };
}

function normalizeProduct(data: unknown): RestockAlertProductRef | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const raw = data as Record<string, unknown>;
  if (typeof raw.id !== 'number' || typeof raw.name !== 'string' || typeof raw.blocId !== 'number') {
    return null;
  }

  return {
    id: raw.id,
    name: raw.name,
    blocId: raw.blocId,
  };
}

function normalizeMovement(data: unknown): RestockAlertMovementRef {
  const raw = asRecord(data, 'restock alert movement');
  if (
    typeof raw.id !== 'number' ||
    typeof raw.productName !== 'string' ||
    typeof raw.quantity !== 'number' ||
    typeof raw.operationType !== 'string' ||
    typeof raw.createdAt !== 'string'
  ) {
    throw new Error('Invalid restock alert movement payload');
  }

  return {
    id: raw.id,
    productName: raw.productName,
    quantity: raw.quantity,
    operationType: raw.operationType,
    createdAt: raw.createdAt,
    note: typeof raw.note === 'string' ? raw.note : null,
  };
}

export function normalizeRestockAlert(data: unknown): RestockAlert {
  const raw = asRecord(data, 'restock alert');

  if (
    typeof raw.id !== 'number' ||
    typeof raw.productName !== 'string' ||
    typeof raw.currentStock !== 'number' ||
    typeof raw.requestedQuantity !== 'number' ||
    typeof raw.warehouseId !== 'number' ||
    typeof raw.blocId !== 'number' ||
    typeof raw.priority !== 'string' ||
    typeof raw.status !== 'string' ||
    typeof raw.createdAt !== 'string' ||
    typeof raw.updatedAt !== 'string' ||
    !raw.warehouse ||
    !raw.bloc
  ) {
    throw new Error('Invalid restock alert payload');
  }

  return {
    id: raw.id,
    productId: typeof raw.productId === 'number' ? raw.productId : null,
    productName: raw.productName,
    currentStock: raw.currentStock,
    requestedQuantity: raw.requestedQuantity,
    warehouseId: raw.warehouseId,
    blocId: raw.blocId,
    priority: raw.priority as RestockPriority,
    managerNote: typeof raw.managerNote === 'string' ? raw.managerNote : null,
    status: raw.status as RestockAlertStatus,
    managerId: typeof raw.managerId === 'number' ? raw.managerId : null,
    technicianId: typeof raw.technicianId === 'number' ? raw.technicianId : null,
    completedAt: typeof raw.completedAt === 'string' ? raw.completedAt : null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    product: normalizeProduct(raw.product),
    warehouse: normalizeWarehouse(raw.warehouse),
    bloc: normalizeBloc(raw.bloc),
    manager: normalizeUser(raw.manager),
    technician: normalizeUser(raw.technician),
    inventoryMovements: Array.isArray(raw.inventoryMovements)
      ? raw.inventoryMovements.map(normalizeMovement)
      : [],
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

export async function getRestockAlerts(accessToken: string): Promise<RestockAlert[]> {
  const data = await requestJson('/restock-alerts', 'GET', accessToken);
  if (!Array.isArray(data)) {
    throw new Error('Invalid restock alerts response');
  }

  return data.map(normalizeRestockAlert);
}

export async function createRestockAlert(
  accessToken: string,
  payload: CreateRestockAlertPayload,
): Promise<RestockAlert> {
  const data = await requestJson('/restock-alerts', 'POST', accessToken, payload);
  return normalizeRestockAlert(data);
}

export async function updateRestockAlertLocation(
  accessToken: string,
  alertId: number,
  payload: UpdateRestockAlertLocationPayload,
): Promise<RestockAlert> {
  const data = await requestJson(`/restock-alerts/${alertId}/location`, 'PATCH', accessToken, payload);
  return normalizeRestockAlert(data);
}

export async function confirmRestockAlert(
  accessToken: string,
  alertId: number,
  payload: ExecuteRestockAlertPayload,
): Promise<RestockAlert> {
  const data = await requestJson(`/restock-alerts/${alertId}/confirm-restock`, 'PATCH', accessToken, payload);
  return normalizeRestockAlert(data);
}

export async function transferRestockAlert(
  accessToken: string,
  alertId: number,
  payload: ExecuteRestockAlertPayload,
): Promise<RestockAlert> {
  const data = await requestJson(`/restock-alerts/${alertId}/transfer`, 'PATCH', accessToken, payload);
  return normalizeRestockAlert(data);
}

export async function completeRestockAlert(accessToken: string, alertId: number): Promise<RestockAlert> {
  const data = await requestJson(`/restock-alerts/${alertId}/complete`, 'PATCH', accessToken);
  return normalizeRestockAlert(data);
}