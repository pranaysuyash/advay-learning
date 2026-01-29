import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useProfileStore } from './profileStore';
import { profileApi } from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  profileApi: {
    getProfiles: vi.fn(),
    createProfile: vi.fn(),
  },
}));

describe('ProfileStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useProfileStore.setState({
      profiles: [],
      currentProfile: null,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchProfiles', () => {
    it('should fetch and set profiles', async () => {
      const mockProfiles = [
        { id: '1', name: 'Child 1', age: 5, preferred_language: 'english', created_at: '2024-01-01' },
        { id: '2', name: 'Child 2', age: 7, preferred_language: 'hindi', created_at: '2024-01-02' },
      ];
      vi.mocked(profileApi.getProfiles).mockResolvedValueOnce({ data: mockProfiles } as any);

      const store = useProfileStore.getState();
      await store.fetchProfiles();

      const state = useProfileStore.getState();
      expect(state.profiles).toEqual(mockProfiles);
      expect(state.currentProfile).toEqual(mockProfiles[0]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set currentProfile to null if no profiles', async () => {
      vi.mocked(profileApi.getProfiles).mockResolvedValueOnce({ data: [] } as any);

      const store = useProfileStore.getState();
      await store.fetchProfiles();

      const state = useProfileStore.getState();
      expect(state.profiles).toEqual([]);
      expect(state.currentProfile).toBeNull();
    });

    it('should set error on failed fetch', async () => {
      const error = {
        response: {
          data: { detail: 'Failed to fetch profiles' },
        },
      };
      vi.mocked(profileApi.getProfiles).mockRejectedValueOnce(error);

      const store = useProfileStore.getState();
      await store.fetchProfiles();

      const state = useProfileStore.getState();
      expect(state.error).toBe('Failed to fetch profiles');
      expect(state.isLoading).toBe(false);
    });

    it('should use default error message when detail not provided', async () => {
      const error = {
        response: {
          data: {},
        },
      };
      vi.mocked(profileApi.getProfiles).mockRejectedValueOnce(error);

      const store = useProfileStore.getState();
      await store.fetchProfiles();

      const state = useProfileStore.getState();
      expect(state.error).toBe('Failed to fetch profiles');
    });

    it('should set loading state during fetch', async () => {
      vi.mocked(profileApi.getProfiles).mockImplementation(() => new Promise(() => {}));

      const store = useProfileStore.getState();
      store.fetchProfiles();

      const state = useProfileStore.getState();
      expect(state.isLoading).toBe(true);
    });
  });

  describe('createProfile', () => {
    it('should create and add profile to list', async () => {
      const newProfile = {
        id: '3',
        name: 'New Child',
        age: 6,
        preferred_language: 'kannada',
        created_at: '2024-01-03',
      };
      vi.mocked(profileApi.createProfile).mockResolvedValueOnce({ data: newProfile } as any);

      const store = useProfileStore.getState();
      await store.createProfile({
        name: 'New Child',
        age: 6,
        preferred_language: 'kannada',
      });

      const state = useProfileStore.getState();
      expect(state.profiles).toContainEqual(newProfile);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error on failed creation', async () => {
      const error = {
        response: {
          data: { detail: 'Name is required' },
        },
      };
      vi.mocked(profileApi.createProfile).mockRejectedValueOnce(error);

      const store = useProfileStore.getState();
      await store.createProfile({ name: '' });

      const state = useProfileStore.getState();
      expect(state.error).toBe('Name is required');
      expect(state.isLoading).toBe(false);
    });

    it('should preserve existing profiles when adding new one', async () => {
      const existingProfile = {
        id: '1',
        name: 'Existing Child',
        age: 5,
        preferred_language: 'english',
        created_at: '2024-01-01',
      };
      useProfileStore.setState({ profiles: [existingProfile] });

      const newProfile = {
        id: '2',
        name: 'New Child',
        age: 7,
        preferred_language: 'hindi',
        created_at: '2024-01-02',
      };
      vi.mocked(profileApi.createProfile).mockResolvedValueOnce({ data: newProfile } as any);

      const store = useProfileStore.getState();
      await store.createProfile({
        name: 'New Child',
        age: 7,
        preferred_language: 'hindi',
      });

      const state = useProfileStore.getState();
      expect(state.profiles).toHaveLength(2);
      expect(state.profiles).toContainEqual(existingProfile);
      expect(state.profiles).toContainEqual(newProfile);
    });

    it('should handle optional fields', async () => {
      const newProfile = {
        id: '1',
        name: 'Child Without Optional',
        preferred_language: 'english',
        created_at: '2024-01-01',
      };
      vi.mocked(profileApi.createProfile).mockResolvedValueOnce({ data: newProfile } as any);

      const store = useProfileStore.getState();
      await store.createProfile({
        name: 'Child Without Optional',
      });

      const state = useProfileStore.getState();
      expect(state.profiles[0].name).toBe('Child Without Optional');
    });
  });

  describe('setCurrentProfile', () => {
    it('should set current profile', () => {
      const profile = {
        id: '1',
        name: 'Test Child',
        age: 5,
        preferred_language: 'english',
        created_at: '2024-01-01',
      };

      const store = useProfileStore.getState();
      store.setCurrentProfile(profile);

      const state = useProfileStore.getState();
      expect(state.currentProfile).toEqual(profile);
    });

    it('should allow setting current profile to null', () => {
      useProfileStore.setState({
        currentProfile: {
          id: '1',
          name: 'Test',
          preferred_language: 'english',
          created_at: '2024-01-01',
        },
      });

      const store = useProfileStore.getState();
      store.setCurrentProfile(null);

      const state = useProfileStore.getState();
      expect(state.currentProfile).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      useProfileStore.setState({ error: 'Some error' });

      const store = useProfileStore.getState();
      store.clearError();

      const state = useProfileStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useProfileStore.getState();
      expect(state.profiles).toEqual([]);
      expect(state.currentProfile).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
