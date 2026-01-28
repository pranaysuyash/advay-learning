import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, userApi } from '../services/api';

interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

// Helper to extract error message from various error formats
function getErrorMessage(error: any): string {
  if (!error.response?.data) return 'An error occurred';
  
  const data = error.response.data;
  
  // Simple string detail
  if (typeof data.detail === 'string') return data.detail;
  
  // Array of validation errors
  if (Array.isArray(data.detail)) {
    return data.detail.map((err: any) => err.msg || err.message || 'Invalid input').join(', ');
  }
  
  // Object with msg
  if (data.msg) return data.msg;
  
  // Object with message
  if (data.message) return data.message;
  
  return 'An error occurred';
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login(email, password);
          const { access_token, refresh_token } = response.data;
          
          // Store tokens
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Fetch user data
          await get().fetchUser();
        } catch (error: any) {
          set({
            error: getErrorMessage(error),
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(email, password);
          // Auto-login after registration
          await get().login(email, password);
        } catch (error: any) {
          set({
            error: getErrorMessage(error),
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      fetchUser: async () => {
        try {
          const response = await userApi.getMe();
          set({ user: response.data });
        } catch (error: any) {
          // If fetching user fails, logout
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
