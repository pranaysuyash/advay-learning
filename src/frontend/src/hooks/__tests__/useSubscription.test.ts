import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSubscription } from '../useSubscription';
import { useAuthStore } from '../../store';
import { subscriptionApi } from '../../services/subscriptionApi';

vi.mock('../../services/subscriptionApi', () => ({
  subscriptionApi: {
    getSubscriptionStatus: vi.fn(),
  },
}));

describe('useSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(subscriptionApi.getSubscriptionStatus).mockReset();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isGuest: false,
      guestSession: null,
    });
  });

  it('grants guest/demo users full access without subscription API calls', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      isGuest: true,
      guestSession: {
        id: 'guest-1',
        childProfile: {
          id: 'guest-child-1',
          name: 'Guest Player',
          age: 5,
          preferredLanguage: 'english',
        },
        progress: {
          lettersLearned: 0,
          totalLetters: 26,
          averageAccuracy: 0,
          totalTime: 0,
        },
        createdAt: Date.now(),
      },
      user: {
        id: 'guest-1',
        email: 'guest@demo.local',
        role: 'guest',
        is_active: true,
      },
    });

    const { result } = renderHook(() => useSubscription());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.canAccessGame('alphabet-tracing')).toBe(true);
    expect(result.current.hasActiveSubscription).toBe(true);
    expect(subscriptionApi.getSubscriptionStatus).not.toHaveBeenCalled();
  });
});
