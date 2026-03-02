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
  /** Save game progress */
  saveProgress: (data: GameProgressData) => Promise<void>;
  /** Save game completion */
  saveCompletion: (score: number) => Promise<void>;
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
 *     if (canSave) {
 *       await saveCompletion(score);
 *     }
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
      console.warn(`[useGameProgress] Cannot save progress: no profile selected`);
      return;
    }
    
    try {
      await progressQueue.add({
        profileId: currentProfile.id,
        gameId,
        score: data.score,
        completed: data.completed,
        metadata: { ...(data.level !== undefined ? { level: data.level } : {}), ...data.metadata },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`[useGameProgress] Failed to save progress:`, error);
      // Don't throw - progress queue handles retry
    }
  }, [currentProfile, gameId]);
  
  const saveCompletion = useCallback(async (score: number) => {
    await saveProgress({ score, completed: true });
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
