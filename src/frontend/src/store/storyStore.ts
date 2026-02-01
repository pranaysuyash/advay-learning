import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoryState {
  currentQuest: string | null;
  unlockedIslands: string[];
  badges: string[];
  startQuest: (id: string) => void;
  completeQuest: (id: string) => void;
  unlockIsland: (id: string) => void;
  reset: () => void;
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set) => ({
      currentQuest: null,
      unlockedIslands: [],
      badges: [],

      startQuest: (id: string) => set({ currentQuest: id }),

      completeQuest: (id: string) =>
        set((state) => ({
          currentQuest: null,
          badges: [...state.badges, `badge:${id}`],
        })),

      unlockIsland: (id: string) =>
        set((state) => ({ unlockedIslands: [...new Set([...state.unlockedIslands, id])] })),

      reset: () => set({ currentQuest: null, unlockedIslands: [], badges: [] }),
    }),
    {
      name: 'advay-story',
    },
  ),
);
