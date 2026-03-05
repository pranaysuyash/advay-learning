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
const MASTERY_THRESHOLD = 70;
const UNLOCK_THRESHOLD = 3; // Need 3/5 letters mastered to unlock next batch

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

          // Check if we should unlock next batch
          const batchIndex = Math.floor(
            (updatedProgress.length - 1) / BATCH_SIZE,
          );
          const langBatches = state.batchProgress[language] || [];

          // Count mastered letters in current batch
          const batchStart = batchIndex * BATCH_SIZE;
          const batchEnd = batchStart + BATCH_SIZE;
          const masteredInBatch = updatedProgress
            .slice(batchStart, batchEnd)
            .filter((p) => p.mastered).length;

          // Unlock next batch if threshold met
          const updatedBatches = [...langBatches];
          if (masteredInBatch >= UNLOCK_THRESHOLD) {
            const nextBatchIndex = batchIndex + 1;
            const nextBatchExists = updatedBatches.some(
              (b) => b.batchIndex === nextBatchIndex,
            );

            if (!nextBatchExists) {
              updatedBatches.push({
                batchIndex: nextBatchIndex,
                unlocked: true,
                unlockedDate: new Date().toISOString(),
              });
            }
          }

          return {
            letterProgress: {
              ...state.letterProgress,
              [language]: updatedProgress,
            },
            batchProgress: {
              ...state.batchProgress,
              [language]: updatedBatches,
            },
          };
        });
      },

      isLetterMastered: (language, letter) => {
        const langProgress = get().letterProgress[language] || [];
        const letterProg = langProgress.find((p) => p.letter === letter);
        return letterProg?.mastered || false;
      },

      isBatchUnlocked: (language, batchIndex) => {
        // Batch 0 is always unlocked
        if (batchIndex === 0) return true;

        const langBatches = get().batchProgress[language] || [];
        return langBatches.some(
          (b) => b.batchIndex === batchIndex && b.unlocked,
        );
      },

      getUnlockedBatches: (language) => {
        const langBatches = get().batchProgress[language] || [];
        // Count batch 0 (always unlocked) + unlocked batches
        return 1 + langBatches.filter((b) => b.unlocked).length;
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

// Helper function to get available letters based on unlocked batches
export function getAvailableLetterIndices(
  language: string,
  totalLetters: number,
): number[] {
  const { batchProgress } = useProgressStore.getState();
  const langBatches = batchProgress[language] || [];

  // Batch 0 is always unlocked
  const unlockedBatches = new Set([0]);
  langBatches.forEach((b) => {
    if (b.unlocked) unlockedBatches.add(b.batchIndex);
  });

  const indices: number[] = [];
  unlockedBatches.forEach((batchIndex) => {
    const start = batchIndex * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, totalLetters);
    for (let i = start; i < end; i++) {
      indices.push(i);
    }
  });

  return indices;
}

export { BATCH_SIZE, MASTERY_THRESHOLD, UNLOCK_THRESHOLD };
