import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameShell } from '../GameShell';
import { vi } from 'vitest';

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
      <GameShell gameId='loading' gameName='Test'>
        <div>child</div>
      </GameShell>,
    );
    expect(screen.getByText(/Loading Test/)).toBeInTheDocument();
  });

  it('shows access denied when no access', () => {
    render(
      <GameShell gameId='denied' gameName='Secret'>
        <div>child</div>
      </GameShell>,
    );
    expect(screen.getByText(/Premium Game/)).toBeInTheDocument();
    expect(screen.queryByText(/child/)).toBeNull();
  });

  it('renders children when access granted', () => {
    render(
      <GameShell gameId='ok' gameName='Fun'>
        <div>child</div>
      </GameShell>,
    );
    expect(screen.getByText(/child/)).toBeInTheDocument();
  });

  it('displays error UI when error occurs', () => {
    const TestComp = () => {
      throw new Error('boom');
    };
    render(
      <GameShell gameId='ok' gameName='Err'>
        <TestComp />
      </GameShell>,
    );
    expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
  });
});
