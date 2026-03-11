import { LoginCredentials, LoginResponse } from './auth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function isUserRole(value: string): value is LoginResponse['role'] {
  return value === 'ADMIN' || value === 'MANAGER' || value === 'TECHNICIEN';
}

function normalizeLoginResponse(data: unknown): LoginResponse {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid login response from server');
  }

  const raw = data as Record<string, unknown>;
  const token = raw.access_token;
  const roleCandidate = raw.role ?? raw.roles;

  if (typeof token !== 'string' || typeof roleCandidate !== 'string' || !isUserRole(roleCandidate)) {
    throw new Error('Invalid login response from server');
  }

  return {
    access_token: token,
    role: roleCandidate,
  };
}

export async function loginRequest(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message ?? 'Login failed');
  }

  const data: unknown = await response.json();
  return normalizeLoginResponse(data);
}