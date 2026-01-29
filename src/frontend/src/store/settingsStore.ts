import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Settings {
  language: string;
  gameLanguage: string;  // NEW: Separate game content language
  difficulty: string;
  cameraEnabled: boolean;
  soundEnabled: boolean;
  timeLimit: number;
  showHints: boolean;
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
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSettings: (newSettings) => {
        set((state) => ({ ...state, ...newSettings }));
      },

      resetSettings: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);
