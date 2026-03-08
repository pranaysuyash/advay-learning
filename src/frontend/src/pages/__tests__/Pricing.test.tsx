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

  it('shows the canonical prelaunch offer ladder', async () => {
    render(
      <MemoryRouter>
        <Pricing />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getCurrentSpy).toHaveBeenCalled();
    });

    expect(screen.getByText(/^30 days of play$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Fixed for the month$/i)).toBeInTheDocument();
    expect(screen.getByText(/^1 refresh window each month$/i)).toBeInTheDocument();
    expect(screen.getByText(/^No game-selection limits$/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Monthly renewals let you keep your current 5 games or pick a new set/i),
    ).toBeInTheDocument();
  });
});
