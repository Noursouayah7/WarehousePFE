const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface AdminDashboardProduct {
	id: number;
	name: string;
	description: string | null;
	blocId: number;
	price: number;
	quantity: number;
}

export interface ProductPayload {
	name: string;
	description?: string;
	blocId: number;
	price: number;
	quantity: number;
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

function normalizeProduct(data: unknown): AdminDashboardProduct {
	if (!data || typeof data !== 'object') {
		throw new Error('Invalid product payload');
	}

	const raw = data as Record<string, unknown>;

	if (
		typeof raw.id !== 'number' ||
		typeof raw.name !== 'string' ||
		typeof raw.blocId !== 'number' ||
		typeof raw.price !== 'number' ||
		typeof raw.quantity !== 'number'
	) {
		throw new Error('Invalid product payload');
	}

	return {
		id: raw.id,
		name: raw.name,
		description: typeof raw.description === 'string' ? raw.description : null,
		blocId: raw.blocId,
		price: raw.price,
		quantity: raw.quantity,
	};
}

export async function getAdminProducts(accessToken: string): Promise<AdminDashboardProduct[]> {
	const response = await fetch(`${API_URL}/product`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to load products'));
	}

	if (!Array.isArray(data)) {
		throw new Error('Invalid products response');
	}

	return data.map(normalizeProduct);
}

export async function createAdminProduct(accessToken: string, payload: ProductPayload): Promise<AdminDashboardProduct> {
	const response = await fetch(`${API_URL}/product`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(payload),
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to create product'));
	}

	return normalizeProduct(data);
}

export async function updateAdminProduct(
	accessToken: string,
	productId: number,
	payload: ProductPayload,
): Promise<AdminDashboardProduct> {
	const response = await fetch(`${API_URL}/product/${productId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify(payload),
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to update product'));
	}

	return normalizeProduct(data);
}

export async function deleteAdminProduct(accessToken: string, productId: number): Promise<void> {
	const response = await fetch(`${API_URL}/product/${productId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to delete product'));
	}
}
