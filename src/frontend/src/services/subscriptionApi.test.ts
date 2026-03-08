import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './api';
import { subscriptionApi } from './subscriptionApi';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('subscriptionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('treats a 404 subscription lookup as no subscription', async () => {
    vi.mocked(api.get).mockRejectedValueOnce({
      response: { status: 404 },
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await subscriptionApi.getSubscriptionStatus('user-1');

    expect(result).toEqual({
      hasActiveSubscription: false,
      accessibleGames: null,
      source: 'no_subscription',
    });
    expect(consoleError).not.toHaveBeenCalled();
    expect(api.get).toHaveBeenCalledWith('/subscriptions/current');
    consoleError.mockRestore();
  });

  it('parses the backend current-subscription payload for full annual plans', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        has_active: true,
        days_remaining: 42,
        subscription: {
          id: 'sub-1',
          plan_type: 'full_annual',
          game_selections: [],
        },
        available_games: null,
      },
    });

    const result = await subscriptionApi.getSubscriptionStatus('user-1');

    expect(result).toEqual({
      hasActiveSubscription: true,
      accessibleGames: ['*'],
      planType: 'full_annual',
      daysRemaining: 42,
      source: 'active_subscription',
    });
  });

  it('parses selected game ids from pack subscriptions', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        has_active: true,
        days_remaining: 15,
        subscription: {
          id: 'sub-2',
          plan_type: 'game_pack_5',
          game_selections: [{ game_id: 'alphabet-tracing' }, { game_id: 'free-draw' }],
        },
        available_games: {
          game_limit: 5,
          selected_count: 2,
          remaining_slots: 3,
          swap_available: false,
          refresh_available: false,
          current_cycle_index: 1,
          total_cycles: 1,
          last_refresh_cycle_used: 0,
          next_refresh_at: null,
          refresh_window_label: null,
          renewal_prompt: 'At renewal you can keep the same 5 games or choose a new 5.',
        },
      },
    });

    const result = await subscriptionApi.getSubscriptionStatus('user-1');

    expect(result).toEqual({
      hasActiveSubscription: true,
      accessibleGames: ['alphabet-tracing', 'free-draw'],
      planType: 'game_pack_5',
      daysRemaining: 15,
      source: 'active_subscription',
    });
  });

  it('flags unsupported plan types as invalid plan data', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: {
        has_active: true,
        days_remaining: 356,
        subscription: {
          id: 'sub-legacy',
          plan_type: 'yearly',
          game_selections: [],
        },
        available_games: null,
      },
    });

    const result = await subscriptionApi.getSubscriptionStatus('user-1');

    expect(result).toEqual({
      hasActiveSubscription: false,
      accessibleGames: null,
      planType: 'yearly',
      source: 'invalid_plan',
      errorReason: 'Unsupported subscription plan type "yearly" found in account data.',
    });
  });

  it('returns an access denied reason for expected 403 responses', async () => {
    vi.mocked(api.get).mockRejectedValueOnce({
      response: {
        status: 403,
        data: { reason: 'Plan does not include this game' },
      },
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await subscriptionApi.checkGameAccess('user-1', 'game-1');

    expect(result).toEqual({
      hasAccess: false,
      reason: 'Plan does not include this game',
    });
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('keeps detailed errors for unexpected failures', async () => {
    vi.mocked(api.get).mockRejectedValueOnce({
      response: {
        status: 500,
        data: { detail: 'backend unavailable' },
      },
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await subscriptionApi.checkGameAccess('user-1', 'game-1');

    expect(result).toEqual({
      hasAccess: false,
      reason: 'Access check failed: HTTP 500: backend unavailable',
    });
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to check game access:',
      'HTTP 500: backend unavailable',
    );
    consoleError.mockRestore();
  });
});
