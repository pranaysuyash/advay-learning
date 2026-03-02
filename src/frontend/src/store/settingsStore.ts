import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { FeatureFlags } from '../config/features';

interface Settings {
  /** Feature flag user overrides */
  features?: Partial<FeatureFlags>;
  language: string;
  gameLanguage: string; // NEW: Separate game content language
  difficulty: string;
  cameraEnabled: boolean;
  soundEnabled: boolean;
  ttsEngine: 'auto' | 'kokoro' | 'web-speech'; // TTS engine preference
  timeLimit: number;
  showHints: boolean;
  handTrackingDelegate: 'GPU' | 'CPU'; // NEW: Hand tracking delegate preference
  cameraPermissionState: 'granted' | 'denied' | 'prompt' | 'unknown';
  tutorialCompleted: boolean;
  onboardingCompleted: boolean;
  calmMode: boolean; // NEW: Calm Mode for sensory-sensitive children
}

interface SettingsState extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  features: {}, // Feature flags default to empty (use system defaults)
  language: 'en',
  gameLanguage: 'en', // Default game language (2-letter codes for consistency with profiles)
  difficulty: 'medium', // Default to medium (more letters than easy)
  cameraEnabled: false, // Default to off for privacy
  soundEnabled: true,
  ttsEngine: 'auto', // Auto: try Kokoro neural TTS, fallback to Web Speech API
  timeLimit: 0, // No limit
  showHints: true,
  handTrackingDelegate: 'GPU', // NEW: Default to GPU for best performance
  cameraPermissionState: 'unknown',
  tutorialCompleted: false,
  onboardingCompleted: false,
  calmMode: false, // NEW: Default to off (full experience)
};

interface SettingsState extends Settings {
  hydrated: boolean; // whether persisted state has been rehydrated
  setHydrated: () => void;
  demoMode: boolean; // transient demo mode (not persisted)
  setDemoMode: (v: boolean) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      hydrated: false,
      demoMode: false,

      setHydrated: () => set({ hydrated: true }),
      setDemoMode: (v: boolean) => set({ demoMode: v }),

      updateSettings: (newSettings) => {
        set((state) => {
          // If language is updated and gameLanguage isn't explicitly provided,
          // keep gameLanguage in sync with language for game content localization.
          const merged = { ...state, ...newSettings } as SettingsState;
          if (newSettings.language && newSettings.gameLanguage === undefined) {
            merged.gameLanguage = newSettings.language;
          }
          return merged;
        });
      },

      resetSettings: () => {
        set({
          ...defaultSettings,
          hydrated: true, // preserve hydrated when resetting
          demoMode: false,
        });
      },
    }),
    {
      name: 'advay-settings',
      // Do not persist transient demoMode or setter functions
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { demoMode, setDemoMode, setHydrated, ...rest } = state as any;
        return rest as Partial<SettingsState>;
      },
      onRehydrateStorage: () => (state) => {
        // When rehydration completes, mark the store as hydrated
        state?.setHydrated?.();
      },
    },
  ),
);
