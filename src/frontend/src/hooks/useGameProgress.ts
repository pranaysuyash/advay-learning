/**
 * useGameProgress Hook
 *
 * Standardized progress tracking for games.
 * Ensures consistent progress saving across all games.
 *
 * @see docs/audit/GAME_QUALITY_REMEDIATION_PLAN.md
 * @ticket GQ-003
 */

import { useCallback, useMemo } from 'react';
import { trackLaunchEvent } from '../analytics/launch';
import { progressQueue } from '../services/progressQueue';
import { useProgressStore } from '../store/progressStore';

export interface GameProgressData {
  /** Game score (0-100 or custom) */
  score: number;
  /** Whether game/level was completed */
  completed: boolean;
  /** Optional: current level */
  level?: number;
  /** Optional: additional metadata */
  metadata?: Record<string, unknown>;
}

export interface UseGameProgressReturn {
  /** Save game progress (throws on failure) */
  saveProgress: (data: GameProgressData) => Promise<void>;
  /** Save game completion (convenience wrapper) */
  saveCompletion: (score: number, level?: number) => Promise<void>;
  /** Whether progress can be saved (has profile) */
  canSave: boolean;
  /** Current profile ID */
  profileId: string | null;
  /** Game ID */
  gameId: string;
}

/**
 * Track and save game progress
 *
 * @example
 * ```tsx
 * function MyGame() {
 *   const { saveProgress, saveCompletion, canSave } = useGameProgress('my-game');
 *
 *   const handleGameComplete = async (score: number) => {
 *     await saveCompletion(score);
 *   };
 *
 *   return <Game onComplete={handleGameComplete} />;
 * }
 * ```
 */
export function useGameProgress(gameId: string): UseGameProgressReturn {
  const { currentProfile } = useProgressStore();

  const canSave = useMemo(() => {
    return currentProfile !== null;
  }, [currentProfile]);

  const profileId = useMemo(() => {
    return currentProfile?.id ?? null;
  }, [currentProfile]);

  const saveProgress = useCallback(async (data: GameProgressData) => {
    if (!currentProfile) {
      // Guest user or no profile - silently skip progress saving
      // This prevents unhandled promise rejections that cause React hooks order issues
      console.debug('[useGameProgress] Skipping progress save: no profile selected (guest user)');
      return;
    }

    const enqueueResult = progressQueue.add({
      profileId: currentProfile.id,
      gameId,
      score: data.score,
      completed: data.completed,
      duration_seconds: undefined,
      metadata: {
        ...data.metadata,
        ...(data.level !== undefined ? { level: data.level } : {}),
      },
      timestamp: new Date().toISOString(),
    });

    if (enqueueResult.success) {
      trackLaunchEvent('progress_queued', {
        gameId,
        profileId: currentProfile.id,
        score: data.score,
        completed: data.completed,
      });
    } else {
      trackLaunchEvent('progress_queue_failed', {
        gameId,
        profileId: currentProfile.id,
        reason: enqueueResult.error ?? 'unknown',
      });
      throw new Error(enqueueResult.error ?? 'Failed to queue progress');
    }
  }, [currentProfile, gameId]);

  const saveCompletion = useCallback(async (score: number, level?: number) => {
    await saveProgress({
      score,
      completed: true,
      ...(level !== undefined ? { level } : {}),
    });
  }, [saveProgress]);

  return {
    saveProgress,
    saveCompletion,
    canSave,
    profileId,
    gameId,
  };
}

export default useGameProgress;
