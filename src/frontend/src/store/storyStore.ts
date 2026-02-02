import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getIslandById, isIslandUnlocked, type Island } from '../data/quests';

interface QuestProgress {
  questId: string;
  completedAt: number;
  accuracy: number;
}

interface StoryState {
  currentQuest: string | null;
  unlockedIslands: string[];
  badges: string[];
  completedQuests: QuestProgress[];
  totalXp: number;
  
  startQuest: (id: string) => void;
  completeQuest: (id: string, accuracy?: number) => void;
  unlockIsland: (id: string) => void;
  reset: () => void;
  
  // Helper methods
  getUnlockedIslands: () => Island[];
  isQuestCompleted: (questId: string) => boolean;
  getNextUnlockableIsland: () => Island | null;
}

export const useStoryStore = create<StoryState>()(
  persist(
    (set, get) => ({
      currentQuest: null,
      unlockedIslands: ['alphabet-lighthouse'],
      badges: [],
      completedQuests: [],
      totalXp: 0,

      startQuest: (id: string) => set({ currentQuest: id }),

      completeQuest: (id: string, accuracy = 0) =>
        set((state) => {
          return {
            currentQuest: null,
            badges: state.badges.includes(`badge:${id}`)
              ? state.badges
              : [...state.badges, `badge:${id}`],
            completedQuests: [
              ...state.completedQuests,
              { questId: id, completedAt: Date.now(), accuracy },
            ],
            totalXp: state.totalXp + 10,
          };
        }),

      unlockIsland: (id: string) =>
        set((state) => ({
          unlockedIslands: [...new Set([...state.unlockedIslands, id])],
        })),

      reset: () =>
        set({
          currentQuest: null,
          unlockedIslands: ['alphabet-lighthouse'],
          badges: [],
          completedQuests: [],
          totalXp: 0,
        }),

      getUnlockedIslands: () => {
        const { unlockedIslands } = get();
        return unlockedIslands
          .map((id) => getIslandById(id))
          .filter((island): island is Island => island !== undefined);
      },

      isQuestCompleted: (questId: string) => {
        const { completedQuests } = get();
        return completedQuests.some((q) => q.questId === questId);
      },

      getNextUnlockableIsland: () => {
        const { unlockedIslands } = get();
        const allIslands = ['alphabet-lighthouse', 'number-nook', 'treasure-bay', 'star-studio'];
        for (const islandId of allIslands) {
          if (!unlockedIslands.includes(islandId)) {
            const island = getIslandById(islandId);
            if (island && isIslandUnlocked(islandId, unlockedIslands)) {
              return island;
            }
          }
        }
        return null;
      },
    }),
    {
      name: 'advay-story',
    },
  ),
);
