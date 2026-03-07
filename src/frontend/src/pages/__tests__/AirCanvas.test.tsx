import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AirCanvas } from '../AirCanvas';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// common mocks
vi.mock('../../hooks/useGameDrops', () => ({
  useGameDrops: () => ({
    onGameComplete: () => {},
    triggerEasterEgg: () => {},
  }),
}));
vi.mock('../../hooks/useGameHandTracking', () => ({
  useGameHandTracking: () => ({
    isLoading: false,
    isReady: true,
    startTracking: () => {},
  }),
}));
vi.mock('../../hooks/useGameSessionProgress', () => ({
  useGameSessionProgress: () => {},
}));
vi.mock('../../hooks/useSoundEffects', () => ({
  useSoundEffects: () => ({ playPop: () => {}, playSuccess: () => {} }),
}));
vi.mock('../../hooks/useTTS', () => ({
  useTTS: () => ({ speak: () => {}, isEnabled: false }),
}));

vi.mock('../../utils/assets', () => ({
  assetLoader: {
    loadImages: async () => {},
    loadSounds: async () => {},
    getImage: () => null,
    playSound: () => {},
  },
  PAINT_ASSETS: [],
  SOUND_ASSETS: {},
  WEATHER_BACKGROUNDS: { sunny: { id: 'sunny' } },
}));

vi.mock('../../utils/coordinateTransform', () => ({
  mapNormalizedPointToCover: (p: any) => p,
}));

// stub additional components
vi.mock('../components/game/CameraThumbnail', () => ({
  CameraThumbnail: () => <div data-testid='camera' />,
}));
vi.mock('../components/issue-reporting/IssueReportFlowModal', () => ({
  IssueReportFlowModal: () => <div />,
}));
vi.mock('../components/game/VoiceInstructions', () => ({
  VoiceInstructions: () => <div />,
}));

describe('AirCanvas page', () => {
  it('renders header and tools toggle', () => {
    render(
      <MemoryRouter>
        <AirCanvas />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Air Canvas/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Hide Tools|Show Tools/i }),
    ).toBeInTheDocument();
  });

  it('shows loading screen when hand tracking is loading', async () => {
    vi.resetModules();
    vi.doMock('../../hooks/useGameHandTracking', () => ({
      useGameHandTracking: () => ({ isLoading: true, isReady: false, startTracking: () => {} }),
    }));

    const { AirCanvas: LoadingCanvas } = await import('../AirCanvas');

    render(
      <MemoryRouter>
        <LoadingCanvas />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Loading Air Canvas/i)).toBeInTheDocument();
  });
});
