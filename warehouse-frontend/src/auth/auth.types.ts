export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIEN' | 'PENDING';

export type ActiveRole = Exclude<UserRole, 'PENDING'>;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  role: UserRole | null;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: UserRole | null;
}

export interface RegisterPayload {
  email: string;
  name?: string;
  password: string;
  address: string;
  phone: string;
  cin: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  cin: string;
  roles: UserRole;
}