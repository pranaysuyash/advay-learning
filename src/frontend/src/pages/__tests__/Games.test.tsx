import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// mock translation to avoid needing i18next instance
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

// we will mock the data registry to supply a bad vibe
vi.mock('../data/gameRegistry', () => {
  const original = vi.importActual('../data/gameRegistry');
  return {
    ...original,
    getListedGames: () => [
      {
        id: 'fake-game',
        name: 'Fake Game',
        tagline: 'A test game',
        path: '/fake',
        icon: '🎮',
        ageRange: '5-7',
        worldId: 'test-world',
        vibe: 'nonexistent', // not present in VIBE_CONFIG
        isNew: false,
        listed: true,
        // minimal other fields to satisfy type
        cv: [],
        drops: [],
        easterEggs: [],
      },
    ],
    getAllWorlds: () => ['test-world'],
  };
});

// also make sure VIBE_CONFIG doesn't include our fake label, the real one likely doesn't either

import { Games } from '../Games';

function renderInRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Games page', () => {
  it('renders even when a game has missing vibe label and shows Unknown difficulty', () => {
    expect(() => renderInRouter(<Games />)).not.toThrow();
    // our fake game should appear with name
    expect(screen.getByText('Fake Game')).toBeTruthy();
    // difficulty label fallback
    expect(screen.getByText(/Unknown/i)).toBeTruthy();
  });
});
