import { create } from 'zustand';
import { profileApi } from '../services/api';

export interface CollectiblesProfileSettings {
  enableOlderBonus?: boolean;
  showRarityTextForOlder?: boolean;
}

export interface Profile {
  id: string;
  name: string;
  age?: number;
  preferred_language: string;
  created_at: string;
  updated_at: string;
  parent_id: string;
  settings?: {
    collectibles?: CollectiblesProfileSettings;
    avatar_config?: {
      type: 'platformer' | 'animal' | 'creature' | 'photo';
      character: string;
      animation?: string;
    };
    [key: string]: unknown;
  };
}

interface ProfileState {
  profiles: Profile[];
  currentProfile: Profile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProfiles: () => Promise<void>;
  createProfile: (data: { name: string; age?: number; preferred_language?: string }) => Promise<void>;
  updateProfile: (profileId: string, data: Partial<{ name: string; age?: number; preferred_language?: string; settings?: Record<string, unknown> }>) => Promise<void>;
  updateCollectiblesSettings: (settings: CollectiblesProfileSettings) => Promise<void>;
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

  updateProfile: async (profileId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileApi.updateProfile(profileId, data);
      set((state) => ({
        profiles: state.profiles.map(p => 
          p.id === profileId ? response.data : p
        ),
        currentProfile: state.currentProfile?.id === profileId 
          ? response.data 
          : state.currentProfile,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to update profile',
        isLoading: false,
      });
    }
  },

  updateCollectiblesSettings: async (collectibles) => {
    const state = useProfileStore.getState();
    const currentProfile = state.currentProfile;
    if (!currentProfile) return;

    const mergedSettings = {
      ...(currentProfile.settings ?? {}),
      collectibles: {
        ...((currentProfile.settings?.collectibles as CollectiblesProfileSettings | undefined) ?? {}),
        ...collectibles,
      },
    };

    await state.updateProfile(currentProfile.id, { settings: mergedSettings });
  },

  deleteProfile: async (profileId: string) => {
    set({ isLoading: true, error: null });
    try {
      await profileApi.deleteProfile(profileId);
      set((state) => ({
        profiles: state.profiles.filter(p => p.id !== profileId),
        currentProfile: state.currentProfile?.id === profileId 
          ? null 
          : state.currentProfile,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || 'Failed to delete profile',
        isLoading: false,
      });
    }
  },

  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  clearError: () => set({ error: null }),
}));
