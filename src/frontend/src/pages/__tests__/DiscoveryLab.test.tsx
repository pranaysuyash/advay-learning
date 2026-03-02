import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DiscoveryLab } from '../DiscoveryLab';
import { MemoryRouter } from 'react-router-dom';
import { useInventoryStore } from '../../store';
import { findPartialRecipes } from '../../data/recipes';

// mock subscription to always allow access
vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: () => ({ canAccessGame: () => true, isLoading: false }),
}));

// stub audio so it doesn't try to play anything
vi.mock('../../utils/hooks/useAudio', () => ({
  useAudio: () => ({
    playClick: () => {},
    playSuccess: () => {},
    playError: () => {},
    playCelebration: () => {},
  }),
}));

// stub game drops hook
vi.mock('../../hooks/useGameDrops', () => ({
  useGameDrops: () => ({ onGameComplete: () => {} }),
}));

// helper to reset inventory store state between tests
function resetInventory() {
  useInventoryStore.setState({
    ownedItems: {},
    discoveredRecipes: [],
    craft: (_id: string) => ({ success: false }),
    getCraftableRecipes: () => [],
    getItemCount: (_: string) => 0,
  });
}

describe('DiscoveryLab', () => {
  beforeEach(() => {
    resetInventory();
  });

  it('findPartialRecipes returns recipes needing only one ingredient', () => {
    const inventory = { 'element-h': 1, 'element-o': 1 };
    const partial = findPartialRecipes(inventory, []);
    // should include water recipe but not others
    expect(partial.some((r) => r.id === 'recipe-water')).toBe(true);
    expect(partial.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "Almost There" section and displays hint when clicking a partial recipe', async () => {
    // configure store so that inventory will produce one partial recipe
    useInventoryStore.setState({
      ownedItems: {
        'element-h': { quantity: 1 },
        'element-o': { quantity: 1 },
      },
      discoveredRecipes: [],
      craft: (_id: string) => ({ success: false }),
      getCraftableRecipes: () => [],
      getItemCount: (id: string) => {
        const qty = { 'element-h': 1, 'element-o': 1 }[id];
        return qty || 0;
      },
    });

    render(
      <MemoryRouter>
        <DiscoveryLab />
      </MemoryRouter>,
    );

    // header should appear
    expect(await screen.findByText(/Almost There/i)).toBeInTheDocument();

    // find hint button inside a partial card
    const hintButtons = screen.getAllByRole('button', { name: /hint/i });
    expect(hintButtons.length).toBeGreaterThan(0);

    // click one and verify overlay message
    fireEvent.click(hintButtons[0]);
    expect(
      await screen.findByText(/You need a few more ingredients/i),
    ).toBeInTheDocument();

    // dismiss
    fireEvent.click(screen.getByRole('button', { name: /got it/i }));
    await waitFor(() => {
      expect(screen.queryByText(/You need a few more ingredients/i)).toBeNull();
    });
  });
});
