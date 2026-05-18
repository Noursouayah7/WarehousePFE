const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type TechnicianWarehouse = {
	id: number;
	name: string;
	description: string | null;
	surface: number;
	blocks: Array<{
		id: number;
		name: string;
		capacity: number;
		currentUsage: number;
		warehouseId: number;
		createdAt: string;
		updatedAt: string;
	}>;
};

export type TechnicianInventoryMovement = {
	id: number;
	productName: string;
	quantity: number;
	operationType: 'STOCK_IN' | 'STOCK_OUT' | 'TRANSFER' | 'DAMAGE' | 'RESTOCK' | 'SHIPMENT_CREATED' | 'ORDER_APPROVED';
	createdAt: string;
	note: string | null;
	product: { id: number; name: string; blocId: number } | null;
	sourceBloc: { id: number; name: string; warehouse: { id: number; name: string } } | null;
	destinationBloc: { id: number; name: string; warehouse: { id: number; name: string } } | null;
	order: { id: number; status: string; managerNote: string | null } | null;
	shipment: { id: number; status: string } | null;
	technician: { id: number; name: string | null; email: string } | null;
};

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

function normalizeMovement(data: unknown): TechnicianInventoryMovement {
	if (!data || typeof data !== 'object') {
		throw new Error('Invalid movement payload');
	}

	const raw = data as Record<string, unknown>;

	if (
		typeof raw.id !== 'number' ||
		typeof raw.productName !== 'string' ||
		typeof raw.quantity !== 'number' ||
		typeof raw.operationType !== 'string' ||
		typeof raw.createdAt !== 'string'
	) {
		throw new Error('Invalid movement payload');
	}

	return {
		id: raw.id,
		productName: raw.productName,
		quantity: raw.quantity,
		operationType: raw.operationType as TechnicianInventoryMovement['operationType'],
		createdAt: raw.createdAt,
		note: typeof raw.note === 'string' ? raw.note : null,
		product: raw.product && typeof raw.product === 'object' && typeof (raw.product as Record<string, unknown>).id === 'number'
			? {
				id: (raw.product as Record<string, unknown>).id as number,
				name: typeof (raw.product as Record<string, unknown>).name === 'string' ? (raw.product as Record<string, unknown>).name as string : raw.productName,
				blocId: typeof (raw.product as Record<string, unknown>).blocId === 'number' ? (raw.product as Record<string, unknown>).blocId as number : 0,
			}
			: null,
		sourceBloc: raw.sourceBloc && typeof raw.sourceBloc === 'object' && typeof (raw.sourceBloc as Record<string, unknown>).id === 'number'
			? {
				id: (raw.sourceBloc as Record<string, unknown>).id as number,
				name: typeof (raw.sourceBloc as Record<string, unknown>).name === 'string' ? (raw.sourceBloc as Record<string, unknown>).name as string : 'Unknown bloc',
				warehouse: {
					id: typeof ((raw.sourceBloc as Record<string, unknown>).warehouse as Record<string, unknown> | undefined)?.id === 'number'
						? (((raw.sourceBloc as Record<string, unknown>).warehouse as Record<string, unknown>).id as number)
						: 0,
					name: typeof ((raw.sourceBloc as Record<string, unknown>).warehouse as Record<string, unknown> | undefined)?.name === 'string'
						? (((raw.sourceBloc as Record<string, unknown>).warehouse as Record<string, unknown>).name as string)
						: 'Unknown warehouse',
				},
			}
			: null,
		destinationBloc: raw.destinationBloc && typeof raw.destinationBloc === 'object' && typeof (raw.destinationBloc as Record<string, unknown>).id === 'number'
			? {
				id: (raw.destinationBloc as Record<string, unknown>).id as number,
				name: typeof (raw.destinationBloc as Record<string, unknown>).name === 'string' ? (raw.destinationBloc as Record<string, unknown>).name as string : 'Unknown bloc',
				warehouse: {
					id: typeof ((raw.destinationBloc as Record<string, unknown>).warehouse as Record<string, unknown> | undefined)?.id === 'number'
						? (((raw.destinationBloc as Record<string, unknown>).warehouse as Record<string, unknown>).id as number)
						: 0,
					name: typeof ((raw.destinationBloc as Record<string, unknown>).warehouse as Record<string, unknown> | undefined)?.name === 'string'
						? (((raw.destinationBloc as Record<string, unknown>).warehouse as Record<string, unknown>).name as string)
						: 'Unknown warehouse',
				},
			}
			: null,
		order: raw.order && typeof raw.order === 'object' && typeof (raw.order as Record<string, unknown>).id === 'number'
			? {
				id: (raw.order as Record<string, unknown>).id as number,
				status: typeof (raw.order as Record<string, unknown>).status === 'string' ? (raw.order as Record<string, unknown>).status as string : 'UNKNOWN',
				managerNote: typeof (raw.order as Record<string, unknown>).managerNote === 'string' ? (raw.order as Record<string, unknown>).managerNote as string : null,
			}
			: null,
		shipment: raw.shipment && typeof raw.shipment === 'object' && typeof (raw.shipment as Record<string, unknown>).id === 'number'
			? {
				id: (raw.shipment as Record<string, unknown>).id as number,
				status: typeof (raw.shipment as Record<string, unknown>).status === 'string' ? (raw.shipment as Record<string, unknown>).status as string : 'UNKNOWN',
			}
			: null,
		technician: raw.technician && typeof raw.technician === 'object' && typeof (raw.technician as Record<string, unknown>).id === 'number'
			? {
				id: (raw.technician as Record<string, unknown>).id as number,
				name: typeof (raw.technician as Record<string, unknown>).name === 'string' ? (raw.technician as Record<string, unknown>).name as string : null,
				email: typeof (raw.technician as Record<string, unknown>).email === 'string' ? (raw.technician as Record<string, unknown>).email as string : '',
			}
			: null,
	};
}

export async function getTechnicianMovements(accessToken: string, limit = 30): Promise<TechnicianInventoryMovement[]> {
	const response = await fetch(`${API_URL}/inventory/movements?limit=${limit}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to load inventory movements'));
	}

	if (!Array.isArray(data)) {
		throw new Error('Invalid inventory movements response');
	}

	return data.map(normalizeMovement);
}