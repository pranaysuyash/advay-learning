/**
 * Subscription API Service
 * Handles all subscription-related API calls
 */

import api from './api';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  accessibleGames: string[] | null;
  planType?: string;
  daysRemaining?: number;
}

export interface SubscriptionGameAccess {
  hasAccess: boolean;
  reason: string;
}

export const subscriptionApi = {
  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const response = await api.get(`/subscriptions/current?user_id=${userId}`);
      const data = response.data;
      
      if (!data.subscription) {
        return {
          hasActiveSubscription: false,
          accessibleGames: null,
        };
      }

      // Full annual = all games (*)
      if (data.subscription.plan_type === 'full_annual') {
        return {
          hasActiveSubscription: true,
          accessibleGames: ['*'],
          planType: data.subscription.plan_type,
          daysRemaining: data.subscription.days_remaining,
        };
      }

      // Pack plans = selected games only
      return {
        hasActiveSubscription: true,
        accessibleGames: data.subscription.selected_games || [],
        planType: data.subscription.plan_type,
        daysRemaining: data.subscription.days_remaining,
      };
    } catch (error) {
      // No subscription or error
      return {
        hasActiveSubscription: false,
        accessibleGames: null,
      };
    }
  },

  /**
   * Check if user can access a specific game
   */
  async checkGameAccess(userId: string, gameId: string): Promise<SubscriptionGameAccess> {
    try {
      const response = await api.get(`/games/${gameId}/access?user_id=${userId}`);
      return {
        hasAccess: response.data.has_access,
        reason: response.data.reason,
      };
    } catch (error) {
      return {
        hasAccess: false,
        reason: 'Access check failed',
      };
    }
  },

  /**
   * Get available games for subscription selection
   */
  async getAvailableGames(subscriptionId: string) {
    const response = await api.get(`/subscriptions/games/available?subscription_id=${subscriptionId}`);
    return response.data;
  },

  /**
   * Update game selection
   */
  async updateGameSelection(subscriptionId: string, gameIds: string[]) {
    const response = await api.put(`/subscriptions/games`, {
      subscription_id: subscriptionId,
      game_ids: gameIds,
    });
    return response.data;
  },
};
