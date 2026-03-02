import React from 'react';
import { render, screen } from '@testing-library/react';
import { Inventory } from '../Inventory';
import { MemoryRouter } from 'react-router-dom';
import { useInventoryStore } from '../../store';
import { ALL_ITEMS } from '../../data/collectibles';
import { vi } from 'vitest';

let originalItems: any[] = [];

// stub inventory store to control data
function setStore(
  state: Partial<ReturnType<typeof useInventoryStore.getState>>,
) {
  useInventoryStore.setState(state as any);
}

describe('Inventory page', () => {
  beforeEach(() => {
    // reset to minimal state
    setStore({
      ownedItems: {},
      discoveredRecipes: [],
      foundEasterEggs: [],
      getEggHints: () => [],
      getUniqueItemCount: () => 0,
      getTotalItemCount: () => 0,
    });
    // temporarily remove all static items so category buttons fall back to disabled
    // stash original contents and clear array
    originalItems = [...ALL_ITEMS];
    ALL_ITEMS.length = 0;
  });

  afterEach(() => {
    // restore ALL_ITEMS
    ALL_ITEMS.length = 0;
    ALL_ITEMS.push(...originalItems);
  });

  it('renders disabled category tabs when no items are available', () => {
    render(
      <MemoryRouter>
        <Inventory />
      </MemoryRouter>,
    );

    // expect at least one disabled category button (aria-disabled true)
    const allButtons = screen.getAllByRole('button');
    const disabledButtons = allButtons.filter(
      (btn) => btn.getAttribute('aria-disabled') === 'true' || btn.disabled,
    );
    expect(disabledButtons.length).toBeGreaterThan(0);
    disabledButtons.forEach((btn) => {
      expect(btn).toHaveAttribute('aria-disabled', 'true');
      expect(btn).toBeDisabled();
      // title attribute should hint why
      expect(btn).toHaveAttribute('title', 'No items yet');
    });
  });
});
