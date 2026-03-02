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
    consoleError.mockRestore();
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
