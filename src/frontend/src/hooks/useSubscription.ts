/**
 * Subscription Hook - Check game access based on subscription status
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { subscriptionApi } from '../services/subscriptionApi';

export function useSubscription() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [accessibleGames, setAccessibleGames] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const status = await subscriptionApi.getSubscriptionStatus(user.id);
        setHasActiveSubscription(status.hasActiveSubscription);
        
        if (status.hasActiveSubscription && status.accessibleGames) {
          setAccessibleGames(new Set(status.accessibleGames));
        }
      } catch (error) {
        console.error('Subscription check failed:', error);
        setHasActiveSubscription(false);
      } finally {
        setIsLoading(false);
      }
    };

    void checkSubscription();
  }, [user]);

  const canAccessGame = useCallback((gameId: string): boolean => {
    // No user = no access
    if (!user) return false;
    
    // No subscription = no access
    if (!hasActiveSubscription) return false;
    
    // Full annual = all games accessible
    if (accessibleGames.has('*')) return true;
    
    // Check if game is in accessible list
    return accessibleGames.has(gameId);
  }, [user, hasActiveSubscription, accessibleGames]);

  return { 
    canAccessGame, 
    hasActiveSubscription, 
    isLoading,
    isFullyAccessible: accessibleGames.has('*')
  };
}
