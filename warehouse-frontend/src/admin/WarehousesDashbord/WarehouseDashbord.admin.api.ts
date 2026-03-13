const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface WarehouseBloc {
	id: number;
	name: string;
	capacity: number;
	currentUsage: number;
	warehouseId: number;
	createdAt: string;
	updatedAt: string;
}

export interface AdminDashboardWarehouse {
	id: number;
	name: string;
	description: string | null;
	surface: number;
	blocks: WarehouseBloc[];
}

export interface WarehousePayload {
	name: string;
	surface: number;
	description?: string;
}

export interface BlocPayload {
	name: string;
	capacity: number;
}

export interface BlocProduct {
	id: number;
	name: string;
	description: string | null;
	price: number;
	quantity: number;
	blocId: number;
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

function normalizeBloc(data: unknown): WarehouseBloc {
	if (!data || typeof data !== 'object') {
		throw new Error('Invalid bloc payload');
	}

	const raw = data as Record<string, unknown>;

	if (
		typeof raw.id !== 'number' ||
		typeof raw.name !== 'string' ||
		typeof raw.capacity !== 'number' ||
		typeof raw.currentUsage !== 'number' ||
		typeof raw.warehouseId !== 'number' ||
		typeof raw.createdAt !== 'string' ||
		typeof raw.updatedAt !== 'string'
	) {
		throw new Error('Invalid bloc payload');
	}

	return {
		id: raw.id,
		name: raw.name,
		capacity: raw.capacity,
		currentUsage: raw.currentUsage,
		warehouseId: raw.warehouseId,
		createdAt: raw.createdAt,
		updatedAt: raw.updatedAt,
	};
}

function normalizeWarehouse(data: unknown): AdminDashboardWarehouse {
	if (!data || typeof data !== 'object') {
		throw new Error('Invalid warehouse payload');
	}

	const raw = data as Record<string, unknown>;

	if (
		typeof raw.id !== 'number' ||
		typeof raw.name !== 'string' ||
		typeof raw.surface !== 'number' ||
		!Array.isArray(raw.blocks)
	) {
		throw new Error('Invalid warehouse payload');
	}

	return {
		id: raw.id,
		name: raw.name,
		description: typeof raw.description === 'string' ? raw.description : null,
		surface: raw.surface,
		blocks: raw.blocks.map(normalizeBloc),
	};
}

function normalizeBlocProduct(data: unknown): BlocProduct {
	if (!data || typeof data !== 'object') {
		throw new Error('Invalid bloc product payload');
	}

	const raw = data as Record<string, unknown>;

	if (
		typeof raw.id !== 'number' ||
		typeof raw.name !== 'string' ||
		typeof raw.price !== 'number' ||
		typeof raw.quantity !== 'number' ||
		typeof raw.blocId !== 'number'
	) {
		throw new Error('Invalid bloc product payload');
	}

	return {
		id: raw.id,
		name: raw.name,
		description: typeof raw.description === 'string' ? raw.description : null,
		price: raw.price,
		quantity: raw.quantity,
		blocId: raw.blocId,
	};
}

export async function getAdminWarehouses(accessToken: string): Promise<AdminDashboardWarehouse[]> {
	const response = await fetch(`${API_URL}/warehouse`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to load warehouses'));
	}

	if (!Array.isArray(data)) {
		throw new Error('Invalid warehouses response');
	}

	return data.map(normalizeWarehouse);
}

export async function getAdminWarehouseById(accessToken: string, warehouseId: number): Promise<AdminDashboardWarehouse> {
	const response = await fetch(`${API_URL}/warehouse/${warehouseId}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to load warehouse'));
	}

	return normalizeWarehouse(data);
}

export async function createAdminWarehouse(accessToken: string, payload: WarehousePayload): Promise<AdminDashboardWarehouse> {
	const response = await fetch(`${API_URL}/warehouse`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(payload),
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to create warehouse'));
	}

	return normalizeWarehouse(data);
}

export async function updateAdminWarehouse(
	accessToken: string,
	warehouseId: number,
	payload: WarehousePayload,
): Promise<AdminDashboardWarehouse> {
	const response = await fetch(`${API_URL}/warehouse/${warehouseId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(payload),
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to update warehouse'));
	}

	return normalizeWarehouse(data);
}

export async function deleteAdminWarehouse(accessToken: string, warehouseId: number): Promise<void> {
	const response = await fetch(`${API_URL}/warehouse/${warehouseId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to delete warehouse'));
	}
}

export async function getWarehouseBlocs(accessToken: string, warehouseId: number): Promise<WarehouseBloc[]> {
	const response = await fetch(`${API_URL}/warehouses/${warehouseId}/blocs`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to load blocs'));
	}

	if (!Array.isArray(data)) {
		throw new Error('Invalid blocs response');
	}

	return data.map(normalizeBloc);
}

export async function createWarehouseBloc(
	accessToken: string,
	warehouseId: number,
	payload: BlocPayload,
): Promise<WarehouseBloc> {
	const response = await fetch(`${API_URL}/warehouses/${warehouseId}/blocs`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(payload),
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to create bloc'));
	}

	return normalizeBloc(data);
}

export async function updateWarehouseBloc(
	accessToken: string,
	warehouseId: number,
	blocId: number,
	payload: BlocPayload,
): Promise<WarehouseBloc> {
	const response = await fetch(`${API_URL}/warehouses/${warehouseId}/blocs/${blocId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(payload),
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to update bloc'));
	}

	return normalizeBloc(data);
}

export async function deleteWarehouseBloc(accessToken: string, warehouseId: number, blocId: number): Promise<void> {
	const response = await fetch(`${API_URL}/warehouses/${warehouseId}/blocs/${blocId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to delete bloc'));
	}
}

export async function getBlocProducts(accessToken: string, blocId: number): Promise<BlocProduct[]> {
	const response = await fetch(`${API_URL}/product/bloc/${blocId}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to load bloc products'));
	}

	if (!Array.isArray(data)) {
		throw new Error('Invalid bloc products response');
	}

	return data.map(normalizeBlocProduct);
}
