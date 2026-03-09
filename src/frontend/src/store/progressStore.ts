import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useProfileStore } from './profileStore';

export interface LetterProgress {
  letter: string;
  attempts: number;
  bestAccuracy: number;
  mastered: boolean;
  lastAttemptDate: string;
}

export interface BatchProgress {
  batchIndex: number;
  unlocked: boolean;
  unlockedDate?: string;
}

export interface GamePlayHistoryEntry {
  gameId: string;
  lastPlayed: string;
  playCount: number;
  totalSeconds: number;
  bestScore: number;
  avgScore: number;
}

interface ProgressState {
  // Backward-compat profile pointer used by some legacy game pages
  currentProfile: { id: string } | null;
  // Per-language progress
  letterProgress: Record<string, LetterProgress[]>; // language -> progress array
  batchProgress: Record<string, BatchProgress[]>; // language -> batch array
  earnedBadges: string[];
  // Game play history for recommendations
  gameHistory: Record<string, GamePlayHistoryEntry[]>; // profileId -> history[]

  // Actions
  markLetterAttempt: (
    language: string,
    letter: string,
    accuracy: number,
  ) => void;
  isLetterMastered: (language: string, letter: string) => boolean;
  isBatchUnlocked: (language: string, batchIndex: number) => boolean;
  getUnlockedBatches: (language: string) => number;
  getMasteredLettersCount: (language: string) => number;
  getBatchMasteryCount: (language: string, batchIndex: number) => number;
  unlockAllBatches: (language: string, totalBatches: number) => void;
  resetProgress: (language: string) => void;
  addBadge: (badgeId: string) => void;
  hasBadge: (badgeId: string) => boolean;
  // Game history actions
  recordGamePlay: (
    profileId: string,
    gameId: string,
    durationSeconds: number,
    score: number,
  ) => void;
  getRecentGames: (profileId: string, limit: number) => GamePlayHistoryEntry[];
  getTopGames: (profileId: string, limit: number) => GamePlayHistoryEntry[];
  hasPlayedGame: (profileId: string, gameId: string) => boolean;
  getPlayedGameIds: (profileId: string) => string[];
}

const BATCH_SIZE = 5;
// Note: MASTERY_THRESHOLD kept for backward compatibility but no longer used for gating
// All content is now always available (open playground model)
const MASTERY_THRESHOLD = 70;

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      currentProfile: null,
      letterProgress: {},
      batchProgress: {},
      earnedBadges: [],
      gameHistory: {},

      markLetterAttempt: (language, letter, accuracy) => {
        set((state) => {
          const langProgress = state.letterProgress[language] || [];
          const existingIndex = langProgress.findIndex(
            (p) => p.letter === letter,
          );

          let updatedProgress: LetterProgress[];

          if (existingIndex >= 0) {
            // Update existing
            updatedProgress = [...langProgress];
            const existing = updatedProgress[existingIndex];
            updatedProgress[existingIndex] = {
              ...existing,
              attempts: existing.attempts + 1,
              bestAccuracy: Math.max(existing.bestAccuracy, accuracy),
              mastered: existing.mastered || accuracy >= MASTERY_THRESHOLD,
              lastAttemptDate: new Date().toISOString(),
            };
          } else {
            // Create new
            updatedProgress = [
              ...langProgress,
              {
                letter,
                attempts: 1,
                bestAccuracy: accuracy,
                mastered: accuracy >= MASTERY_THRESHOLD,
                lastAttemptDate: new Date().toISOString(),
              },
            ];
          }

          // Note: All content is now always available (open playground model)
          // No batch unlocking needed - every letter available from start

          return {
            letterProgress: {
              ...state.letterProgress,
              [language]: updatedProgress,
            },
          };
        });
      },

      isLetterMastered: (language, letter) => {
        const langProgress = get().letterProgress[language] || [];
        const letterProg = langProgress.find((p) => p.letter === letter);
        return letterProg?.mastered || false;
      },

      isBatchUnlocked: () => {
        // All batches are always unlocked (open playground model)
        // Every letter available from the start - no gating
        return true;
      },

      getUnlockedBatches: (_language, totalBatches?: number) => {
        // All batches are always unlocked
        // Return total batches or a high number if not provided
        return totalBatches || 10;
      },

      getMasteredLettersCount: (language) => {
        const langProgress = get().letterProgress[language] || [];
        return langProgress.filter((p) => p.mastered).length;
      },

      getBatchMasteryCount: (language, batchIndex) => {
        const langProgress = get().letterProgress[language] || [];
        const batchStart = batchIndex * BATCH_SIZE;
        const batchEnd = batchStart + BATCH_SIZE;

        return langProgress
          .slice(batchStart, batchEnd)
          .filter((p) => p.mastered).length;
      },

      unlockAllBatches: (language, totalBatches) => {
        set((state) => {
          const batches: BatchProgress[] = [];
          for (let i = 1; i < totalBatches; i++) {
            batches.push({
              batchIndex: i,
              unlocked: true,
              unlockedDate: new Date().toISOString(),
            });
          }

          return {
            batchProgress: {
              ...state.batchProgress,
              [language]: batches,
            },
          };
        });
      },

      resetProgress: (language) => {
        set((state) => ({
          letterProgress: {
            ...state.letterProgress,
            [language]: [],
          },
          batchProgress: {
            ...state.batchProgress,
            [language]: [],
          },
        }));
      },

      addBadge: (badgeId) => {
        set((state) => {
          if (state.earnedBadges.includes(badgeId)) {
            return state;
          }
          return {
            earnedBadges: [...state.earnedBadges, badgeId],
          };
        });
      },

      hasBadge: (badgeId) => {
        return get().earnedBadges.includes(badgeId);
      },

      // Game play history for recommendations
      recordGamePlay: (profileId, gameId, durationSeconds, score) => {
        set((state) => {
          const profileHistory = state.gameHistory[profileId] || [];
          const existingIndex = profileHistory.findIndex((h) => h.gameId === gameId);
          const now = new Date().toISOString();

          let updatedHistory: GamePlayHistoryEntry[];

          if (existingIndex >= 0) {
            // Update existing entry
            updatedHistory = [...profileHistory];
            const existing = updatedHistory[existingIndex];
            updatedHistory[existingIndex] = {
              ...existing,
              lastPlayed: now,
              playCount: existing.playCount + 1,
              totalSeconds: existing.totalSeconds + durationSeconds,
              bestScore: Math.max(existing.bestScore, score),
              avgScore: Math.round(
                (existing.avgScore * existing.playCount + score) /
                  (existing.playCount + 1),
              ),
            };
          } else {
            // Create new entry
            updatedHistory = [
              ...profileHistory,
              {
                gameId,
                lastPlayed: now,
                playCount: 1,
                totalSeconds: durationSeconds,
                bestScore: score,
                avgScore: score,
              },
            ];
          }

          // Sort by last played (most recent first)
          updatedHistory.sort(
            (a, b) =>
              new Date(b.lastPlayed).getTime() -
              new Date(a.lastPlayed).getTime(),
          );

          // Keep only last 50 games per profile
          if (updatedHistory.length > 50) {
            updatedHistory = updatedHistory.slice(0, 50);
          }

          return {
            gameHistory: {
              ...state.gameHistory,
              [profileId]: updatedHistory,
            },
          };
        });
      },

      getRecentGames: (profileId, limit) => {
        const history = get().gameHistory[profileId] || [];
        return history.slice(0, limit);
      },

      getTopGames: (profileId, limit) => {
        const history = get().gameHistory[profileId] || [];
        return [...history]
          .sort((a, b) => b.playCount - a.playCount || b.bestScore - a.bestScore)
          .slice(0, limit);
      },

      hasPlayedGame: (profileId, gameId) => {
        const history = get().gameHistory[profileId] || [];
        return history.some((h) => h.gameId === gameId);
      },

      getPlayedGameIds: (profileId) => {
        const history = get().gameHistory[profileId] || [];
        return history.map((h) => h.gameId);
      },
    }),
    {
      name: 'progress-storage',
    },
  ),
);

// Keep legacy `currentProfile` in sync with canonical profile selection store.
const syncCurrentProfileFromProfileStore = () => {
  const selected = useProfileStore.getState().currentProfile;
  const next = selected ? { id: selected.id } : null;
  const current = useProgressStore.getState().currentProfile;

  if (current?.id !== next?.id) {
    useProgressStore.setState({ currentProfile: next });
  }
};

syncCurrentProfileFromProfileStore();
useProfileStore.subscribe(syncCurrentProfileFromProfileStore);

// Helper function to get available letters
// Note: All letters are now always available (open playground model)
export function getAvailableLetterIndices(
  _language: string,
  totalLetters: number,
): number[] {
  // Return all letter indices - no gating, everything available from start
  return Array.from({ length: totalLetters }, (_, i) => i);
}

export { BATCH_SIZE, MASTERY_THRESHOLD };
// Note: UNLOCK_THRESHOLD removed - all content now always available
