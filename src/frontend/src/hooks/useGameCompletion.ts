/**
 * useGameCompletion Hook
 *
 * Provides a unified way to handle game completion across all games.
 * Combines progress saving and game drop completion into a single call.
 *
 * @ticket GQ-002, GQ-003, GQ-004, GQ-005, GQ-007
 */

import { useCallback } from 'react';
import { useGameDrops } from './useGameDrops';
import { useGameProgress } from './useGameProgress';

export interface GameCompletionOptions {
  score: number;
  level?: number;
  completed?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Hook for handling game completion with consistent progress saving and drop completion.
 *
 * @example
 * ```tsx
 * const { completeGame } = useGameCompletion('my-game');
 *
 * // When game completes:
 * await completeGame({ score: 100, level: 1 });
 *
 * // With metadata:
 * await completeGame({ score: 150, level: 2, metadata: { stars: 3 } });
 * ```
 */
export function useGameCompletion(gameId: string) {
  const { onGameComplete, triggerEasterEgg, isEggFound } = useGameDrops(gameId);
  const { saveProgress } = useGameProgress(gameId);

  /**
   * Complete the game with progress saving and drop completion.
   * This is the primary method - use this for normal game completion.
   */
  const completeGame = useCallback(
    async ({ score, level = 1, completed = true, metadata }: GameCompletionOptions) => {
      await saveProgress({ score, completed, level, metadata });
      onGameComplete(score);
    },
    [saveProgress, onGameComplete],
  );

  /**
   * Save progress without triggering game completion (for partial progress).
   */
  const savePartialProgress = useCallback(
    async ({ score, level = 1, completed = false, metadata }: GameCompletionOptions) => {
      await saveProgress({ score, completed, level, metadata });
    },
    [saveProgress],
  );

  return {
    completeGame,
    savePartialProgress,
    onGameComplete, // Exposed for backward compatibility
    saveProgress,   // Exposed for backward compatibility
    triggerEasterEgg,
    isEggFound,
  };
}
