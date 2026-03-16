import {
  LoginCredentials,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  UserRole,
} from './auth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class RegisterRequestError extends Error {
  constructor(
    message: string,
    public readonly field: 'email' | 'cin' | null = null,
  ) {
    super(message);
    this.name = 'RegisterRequestError';
  }
}

function isUserRole(value: string): value is UserRole {
  return value === 'ADMIN' || value === 'MANAGER' || value === 'TECHNICIEN' || value === 'PENDING';
}

function normalizeLoginResponse(data: unknown): LoginResponse {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid login response from server');
  }

  const raw = data as Record<string, unknown>;
  const token = raw.access_token;
  const roleCandidate = raw.role ?? raw.roles ?? null;

  if (typeof token !== 'string') {
    throw new Error('Invalid login response from server');
  }

  const role = typeof roleCandidate === 'string' && isUserRole(roleCandidate) ? roleCandidate : null;

  return {
    access_token: token,
    role,
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

function normalizeRegisterResponse(data: unknown): RegisterResponse {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid register response from server');
  }

  const raw = data as Record<string, unknown>;

  if (
    typeof raw.id !== 'number' ||
    typeof raw.email !== 'string' ||
    typeof raw.cin !== 'string' ||
    typeof raw.roles !== 'string' ||
    !isUserRole(raw.roles)
  ) {
    throw new Error('Invalid register response from server');
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

export async function registerRequest(payload: RegisterPayload): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message =
      error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : 'Registration failed';
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('email already exists') || normalizedMessage.includes('email already used')) {
      throw new RegisterRequestError('Email already exists', 'email');
    }

    if (normalizedMessage.includes('cin already exists') || normalizedMessage.includes('cin already used')) {
      throw new RegisterRequestError('CIN already exists', 'cin');
    }

    throw new RegisterRequestError(message);
  }

  const data: unknown = await response.json();
  return normalizeRegisterResponse(data);
}