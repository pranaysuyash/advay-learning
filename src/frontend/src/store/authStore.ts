import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';

export enum UserRole {
  PARENT = 'parent',
  ADMIN = 'admin',
  GUEST = 'guest',
}

interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  email_verified?: boolean;
}

interface GuestSession {
  id: string;
  childProfile: {
    id: string;
    name: string;
    age: number;
    preferredLanguage: string;
  };
  progress: {
    lettersLearned: number;
    totalLetters: number;
    averageAccuracy: number;
    totalTime: number;
  };
  createdAt: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isGuest: boolean;
  guestSession: GuestSession | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  loginAsGuest: () => void;
  clearGuestSession: () => void;
}

// Helper to extract error message from various error formats
function getErrorMessage(error: any): string {
  if (!error.response?.data) return 'An error occurred';

  const data = error.response.data;

  // Simple string detail
  if (typeof data.detail === 'string') return data.detail;

  // Array of validation errors
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((err: any) => err.msg || err.message || 'Invalid input')
      .join(', ');
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
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isGuest: false,
      guestSession: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.login(email, password);

          // Tokens are now stored in httpOnly cookies by the backend
          // We just need to update the auth state
          set({
            isAuthenticated: true,
            isLoading: false,
          });

          // Fetch user data
          await get().fetchUser();
        } catch (error: any) {
          set({
            error: getErrorMessage(error),
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(email, password);
          // Don't auto-login after registration - user needs to verify email first
          set({
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: getErrorMessage(error),
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        const { isGuest } = get();
        
        if (!isGuest) {
          try {
            // Call logout endpoint to clear cookies on server
            await authApi.logout();
          } catch (error) {
            // Ignore errors, still clear local state
            console.error('Logout error:', error);
          }
        }

        set({
          user: null,
          isAuthenticated: false,
          isGuest: false,
          guestSession: null,
          error: null,
        });
      },

      loginAsGuest: () => {
        // Create a temporary guest session for demo/trial
        const guestSession: GuestSession = {
          id: `guest-${Date.now()}`,
          childProfile: {
            id: `guest-child-${Date.now()}`,
            name: 'Guest Player',
            age: 5,
            preferredLanguage: 'english',
          },
          progress: {
            lettersLearned: 0,
            totalLetters: 26,
            averageAccuracy: 0,
            totalTime: 0,
          },
          createdAt: Date.now(),
        };

        set({
          isGuest: true,
          isAuthenticated: true,
          guestSession,
          user: {
            id: guestSession.id,
            email: 'guest@demo.local',
            role: UserRole.GUEST,
            is_active: true,
          },
          error: null,
        });
      },

      clearGuestSession: () => {
        set({
          isGuest: false,
          guestSession: null,
          isAuthenticated: false,
          user: null,
        });
      },

      fetchUser: async () => {
        try {
          const response = await authApi.getMe();
          set({ user: response.data });
        } catch (error: any) {
          // If fetching user fails, clear auth state
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      checkAuth: async () => {
        // Check if user is authenticated by trying to fetch user data
        // Cookies are automatically sent with the request
        try {
          await get().fetchUser();
          set({ isAuthenticated: true });
        } catch (error) {
          set({ isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Only persist user data and auth state, NOT tokens
      // Tokens are in httpOnly cookies
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        guestSession: state.guestSession,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    },
  ),
);
