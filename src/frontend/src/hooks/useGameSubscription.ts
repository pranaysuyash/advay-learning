/**
 * useGameSubscription Hook
 *
 * Standardized subscription check for games.
 * Ensures consistent access control across all games.
 *
 * @see docs/audit/GAME_QUALITY_REMEDIATION_PLAN.md
 * @ticket GQ-002
 */

import { useMemo } from 'react';
import { useSubscription } from './useSubscription';

export interface UseGameSubscriptionReturn {
  /** Whether user has access to this game */
  hasAccess: boolean;
  /** Whether subscription status is loading */
  isLoading: boolean;
  /** Error if subscription check failed */
  error: Error | null;
  /** Game ID being checked */
  gameId: string;
}

/**
 * Check if user can access a specific game
 *
 * @example
 * ```tsx
 * function MyGame() {
 *   const { hasAccess, isLoading } = useGameSubscription('my-game');
 *
 *   if (isLoading) return <Loading />;
 *   if (!hasAccess) return <AccessDenied game="My Game" />;
 *
 *   return <GameContent />;
 * }
 * ```
 */
// DECISION-2026-03-09: hasAccess returns false during loading
// RATIONALE: Maintains simple boolean API (hasAccess: boolean)
//            Callers should check isLoading first anyway
// REVISIT: If callers need to distinguish "loading" vs "denied",
//          change to hasAccess: boolean | null
//
// DECISION-2026-03-09: Error object wrapped in useMemo for stability
// RATIONALE: Prevents unnecessary re-renders in consumers using error as dependency
// FIXES: FIND-001 (error object identity instability)
export function useGameSubscription(gameId: string): UseGameSubscriptionReturn {
  const { canAccessGame, isLoading, statusSource, errorReason } = useSubscription();

  const hasAccess = useMemo(() => {
    if (isLoading) return false;
    return canAccessGame(gameId);
  }, [canAccessGame, gameId, isLoading]);

  // FIND-001 FIX: Stable error object - only recreates when error state actually changes
  const error = useMemo(() => {
    if (statusSource === 'api_error' || statusSource === 'invalid_plan') {
      return new Error(errorReason || 'Subscription service is temporarily unavailable.');
    }
    return null;
  }, [statusSource, errorReason]);

  return {
    hasAccess,
    isLoading,
    error,
    gameId,
  };
}

export default useGameSubscription;
