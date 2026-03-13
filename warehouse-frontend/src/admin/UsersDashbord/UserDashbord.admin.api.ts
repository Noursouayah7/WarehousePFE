import { UserRole } from '@/src/auth/auth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface AdminDashboardUser {
	id: number;
	email: string;
	name: string | null;
	address: string | null;
	phone: string | null;
	cin: string;
	roles: UserRole;
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

function isUserRole(value: unknown): value is UserRole {
	return value === 'ADMIN' || value === 'MANAGER' || value === 'TECHNICIEN' || value === 'PENDING';
}

function normalizeUser(data: unknown): AdminDashboardUser {
	if (!data || typeof data !== 'object') {
		throw new Error('Invalid user payload');
	}

	const raw = data as Record<string, unknown>;

	if (
		typeof raw.id !== 'number' ||
		typeof raw.email !== 'string' ||
		typeof raw.cin !== 'string' ||
		!isUserRole(raw.roles)
	) {
		throw new Error('Invalid user payload');
	}

	return {
		id: raw.id,
		email: raw.email,
		name: typeof raw.name === 'string' ? raw.name : null,
		address: typeof raw.address === 'string' ? raw.address : null,
		phone: typeof raw.phone === 'string' ? raw.phone : null,
		cin: raw.cin,
		roles: raw.roles,
	};
}

export async function getAdminUsers(accessToken: string): Promise<AdminDashboardUser[]> {
	const response = await fetch(`${API_URL}/admin/users`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to load users'));
	}

	if (!Array.isArray(data)) {
		throw new Error('Invalid users response');
	}

	return data.map(normalizeUser);
}

export async function updateAdminUserRole(
	accessToken: string,
	userId: number,
	role: Exclude<UserRole, 'PENDING'>,
): Promise<AdminDashboardUser> {
	const response = await fetch(`${API_URL}/admin/users/${userId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${accessToken}`,
		},
		body: JSON.stringify({ roles: role }),
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to update role'));
	}

	return normalizeUser(data);
}

export async function deleteAdminUser(accessToken: string, userId: number): Promise<void> {
	const response = await fetch(`${API_URL}/admin/users/${userId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const data: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		throw new Error(parseErrorMessage(data, 'Failed to delete user'));
	}
}
