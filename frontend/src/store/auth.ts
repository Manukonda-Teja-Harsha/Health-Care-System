import { create } from 'zustand';
import { authService, type User } from '../services/auth';

export type Role = 'patient' | 'doctor' | 'admin' | null;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  login: (email: string, password: string, role?: Role) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Read initial cache from localStorage for instant initial render
  const storedToken = localStorage.getItem('token');
  const storedUserRaw = localStorage.getItem('user');
  let initialUser: User | null = null;
  try {
    initialUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  } catch {
    initialUser = null;
  }

  return {
    user: initialUser,
    token: storedToken,
    isAuthenticated: !!storedToken && !!initialUser,
    isLoading: false,
    isCheckingAuth: !!storedToken,
    error: null,

    clearError: () => set({ error: null }),

    initAuth: async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ isCheckingAuth: false, isAuthenticated: false, user: null, token: null });
        return;
      }

      set({ isCheckingAuth: true });
      try {
        const user = await authService.getCurrentUser();
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isCheckingAuth: false, error: null });
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, isCheckingAuth: false });
      }
    },

    login: async (email: string, password: string, role?: Role) => {
      set({ isLoading: true, error: null });
      try {
        const { token, user } = await authService.login({
          email,
          password,
          role: role || undefined,
        });

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return user;
      } catch (err: any) {
        const message = err?.message || 'Login failed. Please check your credentials.';
        set({ isLoading: false, error: message });
        throw err;
      }
    },

    register: async (name: string, email: string, password: string) => {
      set({ isLoading: true, error: null });
      try {
        const { token, user } = await authService.register({
          name,
          email,
          password,
          role: 'patient',
        });

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return user;
      } catch (err: any) {
        const message = err?.message || 'Registration failed. Please try again.';
        set({ isLoading: false, error: message });
        throw err;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await authService.logout();
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    },
  };
});
