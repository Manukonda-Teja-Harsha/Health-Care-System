import { apiRequest } from './api';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponseData {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  role?: string;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    const res = await apiRequest<AuthResponseData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error('Invalid response from server.');
    return res.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const res = await apiRequest<AuthResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.data) throw new Error('Invalid response from server.');
    return res.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await apiRequest<{ user: User }>('/auth/me', {
      method: 'GET',
    });
    if (!res.data?.user) throw new Error('No user data returned.');
    return res.data.user;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
  },
};
