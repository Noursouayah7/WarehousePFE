const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type ReclamationProblemType = 'PRODUCT_ISSUE' | 'SHIPMENT_ISSUE' | 'ORDER_ISSUE';
export type ReclamationStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type ReclamationUpdatePayload = {
	status?: ReclamationStatus;
	managerNote?: string;
};

export type ReclamationCustomer = {
	id: number;
	name: string | null;
	email: string;
};

export type Reclamation = {
	id: number;
	customerId: number;
	orderId: number | null;
	shipmentId: number | null;
	problemType: ReclamationProblemType;
	description: string;
	attachmentUrl: string | null;
	status: ReclamationStatus;
	managerNote: string | null;
	resolvedAt: string | null;
	createdAt: string;
	updatedAt: string;
	customer?: ReclamationCustomer;
	order?: {
		id: number;
		productName: string;
		quantity: number;
		status: string;
	} | null;
	shipment?: {
		id: number;
		productName: string;
		quantity: number;
		status: string;
		trackingNumber: string | null;
	} | null;
};

function asRecord(data: unknown, label: string): Record<string, unknown> {
	if (!data || typeof data !== 'object') {
		throw new Error(`Invalid ${label} payload`);
	}

	return data as Record<string, unknown>;
}

function normalizeCustomer(data: unknown): ReclamationCustomer | undefined {
	if (!data || typeof data !== 'object') {
		return undefined;
	}

	const raw = data as Record<string, unknown>;

	if (typeof raw.id !== 'number' || typeof raw.email !== 'string') {
		return undefined;
	}

	return {
		id: raw.id,
		name: typeof raw.name === 'string' ? raw.name : null,
		email: raw.email,
	};
}

function normalizeOrder(data: unknown): Reclamation['order'] {
	if (!data || typeof data !== 'object') {
		return null;
	}

	const raw = data as Record<string, unknown>;

	if (
		typeof raw.id !== 'number' ||
		typeof raw.productName !== 'string' ||
		typeof raw.quantity !== 'number' ||
		typeof raw.status !== 'string'
	) {
		return null;
	}

	return {
		id: raw.id,
		productName: raw.productName,
		quantity: raw.quantity,
		status: raw.status,
	};
}

function normalizeShipment(data: unknown): Reclamation['shipment'] {
	if (!data || typeof data !== 'object') {
		return null;
	}

	const raw = data as Record<string, unknown>;

	if (
		typeof raw.id !== 'number' ||
		typeof raw.productName !== 'string' ||
		typeof raw.quantity !== 'number' ||
		typeof raw.status !== 'string'
	) {
		return null;
	}

	return {
		id: raw.id,
		productName: raw.productName,
		quantity: raw.quantity,
		status: raw.status,
		trackingNumber: typeof raw.trackingNumber === 'string' ? raw.trackingNumber : null,
	};
}

function normalizeReclamation(data: unknown): Reclamation {
	const raw = asRecord(data, 'reclamation');

	if (
		typeof raw.id !== 'number' ||
		typeof raw.customerId !== 'number' ||
		typeof raw.problemType !== 'string' ||
		typeof raw.description !== 'string' ||
		typeof raw.status !== 'string' ||
		typeof raw.createdAt !== 'string' ||
		typeof raw.updatedAt !== 'string'
	) {
		throw new Error('Invalid reclamation payload');
	}

	return {
		id: raw.id,
		customerId: raw.customerId,
		orderId: typeof raw.orderId === 'number' ? raw.orderId : null,
		shipmentId: typeof raw.shipmentId === 'number' ? raw.shipmentId : null,
		problemType: raw.problemType as ReclamationProblemType,
		description: raw.description,
		attachmentUrl: typeof raw.attachmentUrl === 'string' ? raw.attachmentUrl : null,
		status: raw.status as ReclamationStatus,
		managerNote: typeof raw.managerNote === 'string' ? raw.managerNote : null,
		resolvedAt: typeof raw.resolvedAt === 'string' ? raw.resolvedAt : null,
		createdAt: raw.createdAt,
		updatedAt: raw.updatedAt,
		customer: normalizeCustomer(raw.customer),
		order: normalizeOrder(raw.order),
		shipment: normalizeShipment(raw.shipment),
	};
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

async function requestJson(endpoint: string, method: string, accessToken: string, body?: object): Promise<unknown> {
	const options: RequestInit = {
		method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
	};

	if (body) {
		options.body = JSON.stringify(body);
	}

	const response = await fetch(`${API_URL}${endpoint}`, options);
	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, `Request failed with status ${response.status}`));
	}

	return data;
}

export async function getMyReclamations(accessToken: string): Promise<Reclamation[]> {
	const data = await requestJson('/reclamation/my-reclamations', 'GET', accessToken);

	if (!Array.isArray(data)) {
		throw new Error('Invalid reclamations response');
	}

	return data.map(normalizeReclamation);
}

export async function getAllReclamations(accessToken: string): Promise<Reclamation[]> {
	const data = await requestJson('/reclamation', 'GET', accessToken);

	if (!Array.isArray(data)) {
		throw new Error('Invalid reclamations response');
	}

	return data.map(normalizeReclamation);
}

export async function createReclamation(
	accessToken: string,
	problemType: ReclamationProblemType,
	description: string,
	orderId?: number,
	shipmentId?: number,
	attachmentUrl?: string,
): Promise<Reclamation> {
	const body = {
		problemType,
		description,
		...(orderId && { orderId }),
		...(shipmentId && { shipmentId }),
		...(attachmentUrl && { attachmentUrl }),
	};

	const data = await requestJson('/reclamation', 'POST', accessToken, body);
	return normalizeReclamation(data);
}

export async function updateReclamation(
	accessToken: string,
	reclamationId: number,
	payload: ReclamationUpdatePayload,
): Promise<Reclamation> {
	const data = await requestJson(`/reclamation/${reclamationId}`, 'PATCH', accessToken, payload);
	return normalizeReclamation(data);
}

export function getProblemTypeLabel(type: ReclamationProblemType): string {
	const labels: Record<ReclamationProblemType, string> = {
		PRODUCT_ISSUE: 'Product Issue',
		SHIPMENT_ISSUE: 'Shipment Issue',
		ORDER_ISSUE: 'Order Issue',
	};

	return labels[type];
}

export function getStatusLabel(status: ReclamationStatus): string {
	const labels: Record<ReclamationStatus, string> = {
		PENDING: 'Pending',
		IN_PROGRESS: 'In Progress',
		RESOLVED: 'Resolved',
		CLOSED: 'Closed',
	};

	return labels[status];
}

export function getStatusColor(status: ReclamationStatus): string {
	const colors: Record<ReclamationStatus, string> = {
		PENDING: 'text-yellow-600',
		IN_PROGRESS: 'text-blue-600',
		RESOLVED: 'text-green-600',
		CLOSED: 'text-gray-600',
	};

	return colors[status];
}
