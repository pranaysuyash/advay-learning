import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GamePage } from './GamePage';
import { useProgressStore } from '../store';
import { progressQueue } from '../services/progressQueue';

// most hooks are mocked in test/setup.ts; we only need to override
vi.mock('../hooks/useGameDrops', () => ({
  useGameDrops: (_gameId: string) => ({
    onGameComplete: vi.fn(),
  }),
}));

describe('GamePage component', () => {
  beforeEach(() => {
    // ensure a profile exists so handleGameComplete proceeds
    useProgressStore.setState({
      currentProfile: { id: '123e4567-e89b-42d3-a456-426614174000' },
    });
  });

  it('renders children and exposes score/level context', async () => {
    const spyAdd = vi.spyOn(progressQueue, 'add');

    render(
      <MemoryRouter>
        <GamePage title='Test' gameId='test-game'>
          {({
            score,
            setScore,
            currentLevel,
            setCurrentLevel,
            handleFinish,
          }) => (
            <>
              <div data-testid='score'>{score}</div>
              <div data-testid='level'>{currentLevel}</div>
              <button onClick={() => setScore((s) => s + 5)}>inc</button>
              <button onClick={() => setCurrentLevel((l) => l + 1)}>lvl</button>
              <button onClick={() => void handleFinish()}>finish</button>
            </>
          )}
        </GamePage>
      </MemoryRouter>,
    );

    // initial values
    expect(screen.getByTestId('score').textContent).toBe('0');
    expect(screen.getByTestId('level').textContent).toBe('1');

    fireEvent.click(screen.getByText('inc'));
    expect(screen.getByTestId('score').textContent).toBe('5');

    fireEvent.click(screen.getByText('lvl'));
    expect(screen.getByTestId('level').textContent).toBe('2');

    fireEvent.click(screen.getByText('finish'));
    await waitFor(() => {
      expect(spyAdd).toHaveBeenCalledWith(
        expect.objectContaining({ score: 5, gameId: 'test-game' } as any),
      );
    });
  });
});
