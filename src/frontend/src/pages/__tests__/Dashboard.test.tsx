import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { progressQueue } from '../../services/progressQueue';
import { useAuthStore, useProfileStore } from '../../store';

// mock navigate
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

describe('Dashboard page', () => {
  beforeEach(() => {
    const now = new Date().toISOString();

    // reset stores
    useAuthStore.setState({ isGuest: false, guestSession: null });
    useProfileStore.setState({
      profiles: [
        {
          id: 'P1',
          name: 'Tester',
          preferred_language: 'english',
          created_at: now,
          updated_at: now,
          parent_id: 'parent-1',
        },
      ],
      currentProfile: {
        id: 'P1',
        name: 'Tester',
        preferred_language: 'english',
        created_at: now,
        updated_at: now,
        parent_id: 'parent-1',
      },
      isLoading: false,
      error: null,
      fetchProfiles: vi.fn(),
      createProfile: vi.fn(),
      updateProfile: vi.fn(),
      updateCollectiblesSettings: vi.fn(),
      deleteProfile: vi.fn(),
      setCurrentProfile: vi.fn(),
      clearError: vi.fn(),
    });
    navigateMock.mockClear();
    // clear analytics storage
    window.localStorage.removeItem('advay.launch.analytics.v1');
  });

  it('renders badge counts and allows navigation, emitting analytics', async () => {
    // simulate queue counts
    vi.spyOn(progressQueue, 'getPending').mockReturnValue([
      {
        idempotency_key: 'x',
        profile_id: 'P1',
        activity_type: 'game_completion',
        content_id: 'test-game',
        score: 100,
        timestamp: new Date().toISOString(),
        status: 'pending',
        retryCount: 0,
      },
    ]);
    vi.spyOn(progressQueue, 'getDeadLetterCount').mockReturnValue(2);
    // render component
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const pendingBadge = await screen.findByText(/To Sync/i);
    const failedBadge = await screen.findByText(/Needs Retry/i);
    expect(pendingBadge).toBeInTheDocument();
    expect(failedBadge).toBeInTheDocument();

    fireEvent.click(pendingBadge);
    expect(navigateMock).toHaveBeenCalledWith('/progress', {
      state: { profileId: 'P1' },
    });
    let events = JSON.parse(
      window.localStorage.getItem('advay.launch.analytics.v1') || '[]',
    );
    expect(
      events.some(
        (e: any) =>
          e.name === 'pending_badge_clicked' &&
          e.metadata.profileId === 'P1' &&
          e.metadata.count === 1,
      ),
    ).toBeTruthy();

    fireEvent.click(failedBadge);
    expect(navigateMock).toHaveBeenCalledWith('/progress', {
      state: { profileId: 'P1' },
    });
    events = JSON.parse(
      window.localStorage.getItem('advay.launch.analytics.v1') || '[]',
    );
    expect(
      events.some(
        (e: any) =>
          e.name === 'failed_badge_clicked' &&
          e.metadata.profileId === 'P1' &&
          e.metadata.count === 2,
      ),
    ).toBeTruthy();
  });
});
