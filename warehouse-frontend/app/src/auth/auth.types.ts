export type UserRole = 'ADMIN' | 'MANAGER' | 'TECHNICIEN';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  role: UserRole;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
}