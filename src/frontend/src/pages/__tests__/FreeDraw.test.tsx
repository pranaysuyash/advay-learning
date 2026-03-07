import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FreeDraw } from '../FreeDraw';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// default mocks that allow the game to run
vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: () => ({ canAccessGame: () => true, isLoading: false }),
}));

vi.mock('../../utils/hooks/useAudio', () => ({
  useAudio: () => ({
    playClick: () => {},
    playSuccess: () => {},
    playError: () => {},
    playCelebration: () => {},
  }),
}));

vi.mock('../../hooks/useGameDrops', () => ({
  useGameDrops: () => ({ onGameComplete: () => {} }),
}));

// stub progress store to avoid network calls
vi.mock('../../store', () => ({
  useProgressStore: () => ({ currentProfile: { id: 'test' } }),
}));

// no actual canvas drawing required

describe('FreeDraw page', () => {
  it('renders start menu and transitions to canvas', async () => {
    render(
      <MemoryRouter>
        <FreeDraw />
      </MemoryRouter>,
    );

    // start menu should be visible
    expect(screen.getByText(/Free Draw!/i)).toBeInTheDocument();
    const startButton = screen.getByRole('button', { name: /Start Drawing!/i });
    fireEvent.click(startButton);

    // after clicking, "Back" button should appear in canvas view
    expect(
      await screen.findByRole('button', { name: /Back/i }),
    ).toBeInTheDocument();
  });

  it('shows access denied screen when subscription fails', async () => {
    // reset modules so we can reinitialize mocks
    vi.resetModules();
    vi.doMock('../../hooks/useSubscription', () => ({
      useSubscription: () => ({ canAccessGame: () => false, isLoading: false }),
    }));

    const { FreeDraw: DeniedFreeDraw } = await import('../FreeDraw');

    render(
      <MemoryRouter>
        <DeniedFreeDraw />
      </MemoryRouter>,
    );

    // the component renders a premium game message when access is denied
    expect(screen.getByText(/Premium Game/i)).toBeInTheDocument();
  });
});
