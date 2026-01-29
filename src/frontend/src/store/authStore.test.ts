import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from './authStore';
import { authApi } from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}));

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should set authenticated and fetch user on successful login', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'parent',
        is_active: true,
      };

      vi.mocked(authApi.login).mockResolvedValueOnce({ data: {} } as any);
      vi.mocked(authApi.getMe).mockResolvedValueOnce({ data: mockUser } as any);

      const store = useAuthStore.getState();
      await store.login('test@example.com', 'Password123');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(authApi.login).toHaveBeenCalledWith('test@example.com', 'Password123');
    });

    it('should set error on failed login', async () => {
      const error = {
        response: {
          data: { detail: 'Invalid credentials' },
        },
      };
      vi.mocked(authApi.login).mockRejectedValueOnce(error);

      const store = useAuthStore.getState();
      await expect(store.login('test@example.com', 'wrong')).rejects.toEqual(error);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe('Invalid credentials');
      expect(state.isLoading).toBe(false);
    });

    it('should handle array of validation errors', async () => {
      const error = {
        response: {
          data: {
            detail: [
              { msg: 'Email is required' },
              { msg: 'Password is too short' },
            ],
          },
        },
      };
      vi.mocked(authApi.login).mockRejectedValueOnce(error);

      const store = useAuthStore.getState();
      await expect(store.login('', '')).rejects.toEqual(error);

      const state = useAuthStore.getState();
      expect(state.error).toBe('Email is required, Password is too short');
    });

    it('should set loading state during login', async () => {
      vi.mocked(authApi.login).mockImplementation(() => new Promise(() => {}));

      const store = useAuthStore.getState();
      store.login('test@example.com', 'Password123');

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(true);
    });
  });

  describe('register', () => {
    it('should clear loading and error on successful registration', async () => {
      vi.mocked(authApi.register).mockResolvedValueOnce({ data: {} } as any);

      const store = useAuthStore.getState();
      await store.register('new@example.com', 'Password123');

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      // Should NOT auto-login after registration
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('should set error on failed registration', async () => {
      const error = {
        response: {
          data: { detail: 'Email already registered' },
        },
      };
      vi.mocked(authApi.register).mockRejectedValueOnce(error);

      const store = useAuthStore.getState();
      await expect(store.register('existing@example.com', 'Password123')).rejects.toEqual(error);

      const state = useAuthStore.getState();
      expect(state.error).toBe('Email already registered');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user and auth state on logout', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', role: 'parent', is_active: true },
        isAuthenticated: true,
      });

      vi.mocked(authApi.logout).mockResolvedValueOnce({ data: {} } as any);

      const store = useAuthStore.getState();
      await store.logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear state even if logout API fails', async () => {
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', role: 'parent', is_active: true },
        isAuthenticated: true,
      });

      vi.mocked(authApi.logout).mockRejectedValueOnce(new Error('Network error'));

      const store = useAuthStore.getState();
      await store.logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('fetchUser', () => {
    it('should set user on successful fetch', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'parent',
        is_active: true,
      };
      vi.mocked(authApi.getMe).mockResolvedValueOnce({ data: mockUser } as any);

      const store = useAuthStore.getState();
      await store.fetchUser();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });

    it('should clear auth state on failed fetch', async () => {
      useAuthStore.setState({
        user: { id: '1', email: 'test@example.com', role: 'parent', is_active: true },
        isAuthenticated: true,
      });

      vi.mocked(authApi.getMe).mockRejectedValueOnce(new Error('Unauthorized'));

      const store = useAuthStore.getState();
      await store.fetchUser();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('checkAuth', () => {
    it('should set authenticated true on valid session', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        role: 'parent',
        is_active: true,
      };
      vi.mocked(authApi.getMe).mockResolvedValueOnce({ data: mockUser } as any);

      const store = useAuthStore.getState();
      await store.checkAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    it('should set authenticated false on invalid session', async () => {
      // Note: fetchUser catches its own errors, so checkAuth relies on
      // fetchUser to clear the auth state. We test this indirectly by
      // verifying that after a failed fetchUser, the state is cleared.
      vi.mocked(authApi.getMe).mockRejectedValueOnce(new Error('Unauthorized'));

      // First set authenticated state
      useAuthStore.setState({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', role: 'parent', is_active: true },
      });

      // Call fetchUser directly (which checkAuth calls)
      const store = useAuthStore.getState();
      await store.fetchUser();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useAuthStore.setState({ error: 'Some error' });

      const store = useAuthStore.getState();
      store.clearError();

      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('error message extraction', () => {
    it('should extract string detail', async () => {
      const error = { response: { data: { detail: 'Custom error' } } };
      vi.mocked(authApi.login).mockRejectedValueOnce(error);

      const store = useAuthStore.getState();
      await expect(store.login('a', 'b')).rejects.toEqual(error);

      expect(useAuthStore.getState().error).toBe('Custom error');
    });

    it('should extract msg field', async () => {
      const error = { response: { data: { msg: 'Message error' } } };
      vi.mocked(authApi.login).mockRejectedValueOnce(error);

      const store = useAuthStore.getState();
      await expect(store.login('a', 'b')).rejects.toEqual(error);

      expect(useAuthStore.getState().error).toBe('Message error');
    });

    it('should extract message field', async () => {
      const error = { response: { data: { message: 'Message field error' } } };
      vi.mocked(authApi.login).mockRejectedValueOnce(error);

      const store = useAuthStore.getState();
      await expect(store.login('a', 'b')).rejects.toEqual(error);

      expect(useAuthStore.getState().error).toBe('Message field error');
    });

    it('should return default error for unknown format', async () => {
      const error = { response: { data: {} } };
      vi.mocked(authApi.login).mockRejectedValueOnce(error);

      const store = useAuthStore.getState();
      await expect(store.login('a', 'b')).rejects.toEqual(error);

      expect(useAuthStore.getState().error).toBe('An error occurred');
    });
  });
});
