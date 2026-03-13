import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getCurrentSpy, purchaseSpy, upgradeSpy } = vi.hoisted(() => ({
  getCurrentSpy: vi.fn(async () => ({ data: { has_active: false, subscription: null, days_remaining: null, available_games: null } })),
  purchaseSpy: vi.fn(),
  upgradeSpy: vi.fn(),
}));

vi.mock('../../services/api', () => ({
  subscriptionApi: {
    getCurrent: getCurrentSpy,
    purchase: purchaseSpy,
    upgrade: upgradeSpy,
  },
}));

import Pricing from '../Pricing';

describe('Pricing page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentSpy.mockResolvedValue({
      data: { has_active: false, subscription: null, days_remaining: null, available_games: null },
    });
  });

  it('shows beta-free messaging alongside future plan ladder', async () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getCurrentSpy).toHaveBeenCalled();
    });

    expect(screen.getByText(/free during beta through March 31, 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Payments stay off until beta ends/i)).toBeInTheDocument();
    expect(screen.getAllByText(/I want this after beta/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/^30 days of play$/i)).toBeInTheDocument();
    expect(screen.getByText(/^No game-selection limits$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/During beta, every game is available without payment/i),
    ).toBeInTheDocument();
  });
});
