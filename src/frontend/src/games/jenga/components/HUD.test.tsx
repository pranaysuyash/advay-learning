import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createTower } from '../utils/generateTower';
import { JengaGameState } from '../domain/GameState';
import { HUD } from './HUD';

describe('Jenga HUD', () => {
  it('shows roll guidance before a target exists', () => {
    const state = new JengaGameState(createTower(), 'math', 1);

    render(<HUD gameState={state} onRestart={vi.fn()} onRollDice={vi.fn()} />);

    expect(screen.getByText('Roll Dice')).toBeInTheDocument();
    expect(screen.getByText('Roll to pick your block numbers')).toBeInTheDocument();
    expect(screen.getByText(/Roll the dice first/i)).toBeInTheDocument();
  });

  it('renders active target numbers after a roll', () => {
    const state = new JengaGameState(createTower(), 'math', 1);
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.4);
    state.generateNewTarget();

    render(<HUD gameState={state} onRestart={vi.fn()} onRollDice={vi.fn()} />);

    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText(/Try 2, 3 with \+, -, ×, exact ÷, or by joining the digits/i)).toBeInTheDocument();
  });
});
