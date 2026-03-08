/**
 * Subscription API Service
 * Handles all subscription-related API calls
 */

import api from './api';
import { isFullAccessPlan, isSupportedSubscriptionPlan } from './subscriptionPlan';

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  accessibleGames: string[] | null;
  planType?: string;
  daysRemaining?: number;
  source?:
    | 'active_subscription'
    | 'no_subscription'
    | 'api_error'
    | 'guest_demo'
    | 'invalid_plan';
  errorReason?: string;
}

export interface SubscriptionGameAccess {
  hasAccess: boolean;
  reason: string;
}

type ApiErrorLike = {
  message?: string;
  response?: {
    status?: number;
    data?: {
      detail?: string;
      message?: string;
      reason?: string;
      error?: { message?: string };
    };
  };
};

function getApiErrorLike(error: unknown): ApiErrorLike | null {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  return error as ApiErrorLike;
}

function describeApiError(error: unknown): string {
  const maybeAxios = getApiErrorLike(error);
  if (!maybeAxios) {
    return 'Unknown error';
  }

  const status = maybeAxios.response?.status;
  const data = maybeAxios.response?.data;

  // New structured error format
  const detail =
    data?.error?.message || data?.detail || data?.message || data?.reason;

  if (status && detail) return `HTTP ${status}: ${detail}`;
  if (status) return `HTTP ${status}`;
  if (maybeAxios.message) return maybeAxios.message;
  return 'Unknown error';
}

export const subscriptionApi = {
  /**
   * Get subscription status for a user
   */
  async getSubscriptionStatus(_userId: string): Promise<SubscriptionStatus> {
    try {
      const response = await api.get('/subscriptions/current');
      const data = response.data;

      if (!data.has_active || !data.subscription) {
        return {
          hasActiveSubscription: false,
          accessibleGames: null,
          source: 'no_subscription',
        };
      }

      const planType = data.subscription.plan_type;
      if (!isSupportedSubscriptionPlan(planType)) {
        return {
          hasActiveSubscription: false,
          accessibleGames: null,
          planType,
          source: 'invalid_plan',
          errorReason: `Unsupported subscription plan type "${planType}" found in account data.`,
        };
      }

      // Full annual = all games (*)
      if (isFullAccessPlan(planType)) {
        return {
          hasActiveSubscription: true,
          accessibleGames: ['*'],
          planType,
          daysRemaining: data.days_remaining,
          source: 'active_subscription',
        };
      }

      // Pack plans = selected games only
      return {
        hasActiveSubscription: true,
        accessibleGames:
          data.subscription.game_selections?.map(
            (selection: { game_id: string }) => selection.game_id,
          ) || [],
        planType,
        daysRemaining: data.days_remaining,
        source: 'active_subscription',
      };
    } catch (error) {
      const status = getApiErrorLike(error)?.response?.status;
      if (status === 404) {
        return {
          hasActiveSubscription: false,
          accessibleGames: null,
          source: 'no_subscription',
        };
      }

      const errorReason = describeApiError(error);
      console.error('Failed to fetch subscription status:', errorReason);
      return {
        hasActiveSubscription: false,
        accessibleGames: null,
        source: 'api_error',
        errorReason,
      };
    }
  },

  /**
   * Check if user can access a specific game
   */
  async checkGameAccess(
    userId: string,
    gameId: string,
  ): Promise<SubscriptionGameAccess> {
    try {
      const response = await api.get(
        `/games/${gameId}/access?user_id=${userId}`,
      );
      return {
        hasAccess: response.data.has_access,
        reason: response.data.reason,
      };
    } catch (error) {
      const apiError = getApiErrorLike(error);
      const status = apiError?.response?.status;
      if (status === 403) {
        return {
          hasAccess: false,
          reason: apiError?.response?.data?.reason || 'Access denied',
        };
      }

      if (status === 404) {
        return {
          hasAccess: false,
          reason:
            apiError?.response?.data?.reason ||
            'Game or subscription not found',
        };
      }

      const errorReason = describeApiError(error);
      console.error('Failed to check game access:', errorReason);
      return {
        hasAccess: false,
        reason: `Access check failed: ${errorReason}`,
      };
    }
  },

  /**
   * Get available games for subscription selection
   */
  async getAvailableGames(subscriptionId: string) {
    const response = await api.get(
      `/subscriptions/games/available?subscription_id=${subscriptionId}`,
    );
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
