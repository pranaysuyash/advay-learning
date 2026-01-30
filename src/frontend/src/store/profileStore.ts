import { create } from 'zustand';
import { profileApi } from '../services/api';

export interface Profile {
  id: string;
  name: string;
  age?: number;
  preferred_language: string;
  created_at: string;
}

interface ProfileState {
  profiles: Profile[];
  currentProfile: Profile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProfiles: () => Promise<void>;
  createProfile: (data: { name: string; age?: number; preferred_language?: string }) => Promise<void>;
  setCurrentProfile: (profile: Profile | null) => void;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  profiles: [],
  currentProfile: null,
  isLoading: false,
  error: null,

  fetchProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.getProfiles();
      const profiles = response.data;
      set({
        profiles,
        currentProfile: profiles[0] || null,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch profiles',
        isLoading: false,
      });
    }
  },

  createProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.createProfile(data);
      set((state) => ({
        profiles: [...state.profiles, response.data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to create profile',
        isLoading: false,
      });
    }
  },

  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  clearError: () => set({ error: null }),
}));
