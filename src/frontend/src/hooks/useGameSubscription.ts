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
export function useGameSubscription(gameId: string): UseGameSubscriptionReturn {
  const { canAccessGame, isLoading, statusSource, errorReason } = useSubscription();
  
  const hasAccess = useMemo(() => {
    if (isLoading) return false;
    return canAccessGame(gameId);
  }, [canAccessGame, gameId, isLoading]);
  
  return {
    hasAccess,
    isLoading,
    error:
      statusSource === 'api_error' || statusSource === 'invalid_plan'
        ? new Error(errorReason || 'Subscription service is temporarily unavailable.')
        : null,
    gameId,
  };
}

export default useGameSubscription;
