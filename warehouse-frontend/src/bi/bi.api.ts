const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type BiRole = 'ADMIN' | 'MANAGER' | 'TECHNICIEN';

export type BiStatusCounts = Record<string, number>;

export type BiLowStockProduct = {
  id: number;
  name: string;
  quantity: number;
  blocName: string;
  warehouseName: string;
};

export type BiBlockUsage = {
  id: number;
  name: string;
  warehouseName: string;
  capacity: number;
  currentUsage: number;
  usagePercent: number;
  productCount: number;
  stockQuantity: number;
};

export type BiWarehouseUsage = {
  id: number;
  name: string;
  capacity: number;
  currentUsage: number;
  usagePercent: number;
  blockCount: number;
};

export type BiRecentMovement = {
  id: number;
  productName: string;
  quantity: number;
  operationType: string;
  createdAt: string;
  sourceBlocName: string | null;
  sourceWarehouseName: string | null;
  destinationBlocName: string | null;
  destinationWarehouseName: string | null;
  technicianName: string | null;
};

export type BiContactRequest = {
  id: number;
  email: string;
  phone: string;
  reason: string;
  status: 'NEW' | 'CONTACTED' | 'ARCHIVED';
  managerNote: string | null;
  createdAt: string;
};

export type BiSummary = {
  role: BiRole;
  generatedAt: string;
  lowStockThreshold: number;
  inventory: {
    totalProducts: number;
    totalStockQuantity: number;
    lowStockProductsCount: number;
    lowStockProducts: BiLowStockProduct[];
    totalInventoryMovements: number;
    transferMovements: number;
    movementTypeCounts: BiStatusCounts;
    recentMovements: BiRecentMovement[];
  };
  warehouse: {
    totalWarehouses: number;
    totalBlocks: number;
    totalCapacity: number;
    totalUsage: number;
    capacityUsagePercent: number;
    highUsageBlocks: BiBlockUsage[];
    blockUsage: BiBlockUsage[];
    warehouseUsage: BiWarehouseUsage[];
  };
  users: {
    totalUsers: number;
    totalCustomers: number;
  };
  orders: {
    totalOrders: number;
    approvedOrders: number;
    rejectedOrders: number;
    pendingOrders: number;
    completedOrders: number;
    restockRequestedOrders: number;
    statusCounts: BiStatusCounts;
  };
  shipments: {
    activeShipments: number;
    receivedShipments: number;
    statusCounts: BiStatusCounts;
  };
  support: {
    totalSupportTickets: number;
    totalReclamations: number;
    openSupportTickets: number;
    openReclamations: number;
    myOpenTickets: number;
    newContactRequests: number;
    latestContactRequests: BiContactRequest[];
    ticketStatusCounts: BiStatusCounts;
    reclamationStatusCounts: BiStatusCounts;
  };
};

function parseErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const message = (data as Record<string, unknown>).message;
  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join(', ');
  }

  return fallback;
}

export async function getBiSummary(accessToken: string, role: BiRole): Promise<BiSummary> {
  const endpoint = role === 'ADMIN'
    ? '/bi/admin-summary'
    : role === 'MANAGER'
      ? '/bi/manager-summary'
      : '/bi/technician-summary';

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, 'Failed to load BI dashboard'));
  }

  return data as BiSummary;
}

export async function markContactRequestContacted(accessToken: string, requestId: number): Promise<BiContactRequest> {
  const response = await fetch(`${API_URL}/contact-requests/${requestId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ status: 'CONTACTED' }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, 'Failed to update contact request'));
  }

  return data as BiContactRequest;
}
