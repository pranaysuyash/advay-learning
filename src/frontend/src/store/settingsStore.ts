import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  language: string;
  gameLanguage: string; // NEW: Separate game content language
  difficulty: string;
  cameraEnabled: boolean;
  soundEnabled: boolean;
  timeLimit: number;
  showHints: boolean;
  handTrackingDelegate: 'GPU' | 'CPU'; // NEW: Hand tracking delegate preference
}

interface SettingsState extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  language: 'english',
  gameLanguage: 'english', // NEW: Default game language
  difficulty: 'medium', // Default to medium (more letters than easy)
  cameraEnabled: false, // Default to off for privacy
  soundEnabled: true,
  timeLimit: 0, // No limit
  showHints: true,
  handTrackingDelegate: 'GPU', // NEW: Default to GPU for best performance
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSettings: (newSettings) => {
        set((state) => {
          // If language is updated and gameLanguage isn't explicitly provided,
          // keep gameLanguage in sync with language for game content localization.
          const merged = { ...state, ...newSettings };
          if (newSettings.language && newSettings.gameLanguage === undefined) {
            merged.gameLanguage = newSettings.language;
          }
          return merged;
        });
      },

      resetSettings: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'advay-settings',
    },
  ),
);
