import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GameShell } from '../GameShell';
import { progressQueue } from '../../services/progressQueue';
import { vi } from 'vitest';

// mock navigation first (hoisted)
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// stub progressQueue with simple observable (inline to avoid hoisting problems)
vi.mock('../../services/progressQueue', () => ({
  progressQueue: {
    getPending: (id: string) => (id ? [{ id: 'x' }] : []),
    getDeadLetterCount: (_id?: string) => 0,
    subscribe: (cb: () => void) => {
      cb();
      return () => {};
    },
  },
}));

// mock subscription hook
vi.mock('../../hooks/useGameSubscription', () => ({
  useGameSubscription: (id: string) => ({
    hasAccess: id !== 'denied',
    isLoading: id === 'loading',
  }),
}));


describe('GameShell', () => {
  it('shows loading indicator when subscription is loading', () => {
    render(
      <MemoryRouter>
        <GameShell gameId='loading' gameName='Test'>
          <div>child</div>
        </GameShell>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Loading Test/)).toBeInTheDocument();
  });

  it('shows access denied when no access', () => {
    render(
      <MemoryRouter>
        <GameShell gameId='denied' gameName='Secret'>
          <div>child</div>
        </GameShell>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Premium Game/)).toBeInTheDocument();
    expect(screen.queryByText(/child/)).toBeNull();
  });

  it('renders children when access granted', () => {
    render(
      <MemoryRouter>
        <GameShell gameId='ok' gameName='Fun'>
          <div>child</div>
        </GameShell>
      </MemoryRouter>,
    );
    expect(screen.getByText(/child/)).toBeInTheDocument();
  });

  it('displays error UI when error occurs', () => {
    const TestComp = () => {
      throw new Error('boom');
    };
    render(
      <MemoryRouter>
        <GameShell gameId='ok' gameName='Err'>
          <TestComp />
        </GameShell>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
  });

  it('shows pending badge and navigates when clicked, logging analytics', () => {
    const profileId = 'P1';
    // clear any prior analytics events
    window.localStorage.removeItem('advay.launch.analytics.v1');
    // simulate one pending and one dead-letter by overriding mocks
    vi.spyOn(progressQueue, 'getPending').mockReturnValue([{ id: 'x' }]);
    vi.spyOn(progressQueue, 'getDeadLetterCount').mockReturnValue(2);

    render(
      <MemoryRouter initialEntries={[{ pathname: '/', state: { profileId } }]}>        
        <GameShell gameId='ok' gameName='Test'>
          <div>child</div>
        </GameShell>
      </MemoryRouter>,
    );

    const pendingBadge = screen.getByText(/Pending \(1\)/i);
    const failedBadge = screen.getByText(/Failed \(2\)/i);
    expect(pendingBadge).toBeInTheDocument();
    expect(failedBadge).toBeInTheDocument();

    fireEvent.click(pendingBadge);
    expect(navigateMock).toHaveBeenCalledWith('/progress', { state: { profileId } });
    // analytics stored in localStorage
    let events = JSON.parse(window.localStorage.getItem('advay.launch.analytics.v1') || '[]');
    expect(
      events.some((e: any) =>
        e.name === 'pending_badge_clicked' &&
        e.metadata.profileId === profileId &&
        e.metadata.count === 1 &&
        e.metadata.gameId === 'ok'
      )
    ).toBeTruthy();

    fireEvent.click(failedBadge);
    expect(navigateMock).toHaveBeenCalledWith('/progress', { state: { profileId } });
    events = JSON.parse(window.localStorage.getItem('advay.launch.analytics.v1') || '[]');
    expect(
      events.some((e: any) =>
        e.name === 'failed_badge_clicked' &&
        e.metadata.profileId === profileId &&
        e.metadata.count === 2 &&
        e.metadata.gameId === 'ok'
      )
    ).toBeTruthy();
  });
});
