/**
 * Subscription Hook - Check game access based on subscription status
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { subscriptionApi } from '../services/subscriptionApi';

export function useSubscription() {
  const { user, isGuest } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [accessibleGames, setAccessibleGames] = useState<Set<string>>(new Set());
  const [statusSource, setStatusSource] = useState<
    'active_subscription' | 'no_subscription' | 'api_error' | 'guest_demo' | 'invalid_plan' | null
  >(null);
  const [errorReason, setErrorReason] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setHasActiveSubscription(false);
        setAccessibleGames(new Set());
        setStatusSource(null);
        setErrorReason(null);
        setIsLoading(false);
        return;
      }

      if (isGuest) {
        setHasActiveSubscription(true);
        setAccessibleGames(new Set(['*']));
        setStatusSource('guest_demo');
        setErrorReason(null);
        setIsLoading(false);
        return;
      }

      try {
        const status = await subscriptionApi.getSubscriptionStatus(user.id);
        setHasActiveSubscription(status.hasActiveSubscription);
        setStatusSource(status.source ?? null);
        setErrorReason(status.errorReason ?? null);
        setAccessibleGames(new Set(status.accessibleGames ?? []));
      } catch (error) {
        console.error('Subscription check failed:', error);
        setHasActiveSubscription(false);
        setAccessibleGames(new Set());
        setStatusSource('api_error');
        setErrorReason('Unable to verify subscription status right now.');
      } finally {
        setIsLoading(false);
      }
    };

    void checkSubscription();
  }, [isGuest, user]);

  const canAccessGame = useCallback((gameId: string): boolean => {
    // No user = no access
    if (!user) return false;

    // Guest/demo users can access games without subscription checks
    if (isGuest) return true;
    
    // No subscription = no access
    if (!hasActiveSubscription) return false;
    
    // Full annual = all games accessible
    if (accessibleGames.has('*')) return true;
    
    // Check if game is in accessible list
    return accessibleGames.has(gameId);
  }, [accessibleGames, hasActiveSubscription, isGuest, user]);

  return { 
    canAccessGame, 
    hasActiveSubscription, 
    isLoading,
    isFullyAccessible: accessibleGames.has('*'),
    statusSource,
    errorReason,
  };
}
