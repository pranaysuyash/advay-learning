import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ConnectTheDots } from '../ConnectTheDots';
import { vi } from 'vitest';

// mocks for hooks used by the component (hand tracking, audio, tts, game drops)
vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: () => ({ canAccessGame: () => true, isLoading: false }),
}));
vi.mock('../../hooks/useAudio', () => ({
  useAudio: () => ({ playFanfare: () => {}, playPop: () => {} }),
}));
vi.mock('../../hooks/useTTS', () => ({
  useTTS: () => ({ speak: () => {}, isEnabled: false }),
}));
vi.mock('../../hooks/useGameDrops', () => ({
  useGameDrops: () => ({
    onGameComplete: () => {},
    triggerEasterEgg: () => {},
  }),
}));
vi.mock('../../hooks/useGameHandTracking', () => ({
  useGameHandTracking: () => ({
    isReady: false,
    cursor: null,
    pinch: { isPinching: false, distance: 0, transition: 'none' },
    startTracking: () => Promise.resolve(),
    stopTracking: () => {},
    resetTracking: () => {},
    reinitialize: () => Promise.resolve(),
    fps: 0,
    averageFps: 0,
    error: null,
    isLoading: false,
    webcamRef: { current: null },
    isPinching: false,
    handVisible: false,
    attentionLevel: 0,
  }),
}));

// Basic smoke/regression tests for dot click behavior
describe('ConnectTheDots component - regression', () => {
  it('clicking the first dot connects it and advances the next-dot indicator', async () => {
    render(
      <MemoryRouter>
        <ConnectTheDots />
      </MemoryRouter>,
    );

    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);

    // Wait for dots to render and pick the first circle from the overlay SVG.
    await waitFor(() => {
      expect(
        document.querySelector('svg[viewBox="0 0 800 600"] circle'),
      ).toBeTruthy();
    });

    // Find the canvas and stub its getBoundingClientRect so clicks map cleanly
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();

    // Ensure bounding rect matches the canvas internal resolution used by the component
    canvas.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: () => {},
      }) as DOMRect;

    const circle = document.querySelector('svg[viewBox="0 0 800 600"] circle');
    expect(circle).toBeTruthy();

    const cx = Number(circle!.getAttribute('cx'));
    const cy = Number(circle!.getAttribute('cy'));

    // Click at the dot coordinates on the canvas
    fireEvent.click(canvas, { clientX: cx, clientY: cy });

    // The Next Dot indicator should advance to #2
    await waitFor(() => {
      const indicator = screen.getByText(/Next Dot/i).parentElement;
      expect(indicator).toBeTruthy();
      expect(indicator!.textContent).toMatch(/#2/);
    });

    // Re-query to ensure a dot circle still exists after state update.
    const updatedCircle = document.querySelector(
      'svg[viewBox="0 0 800 600"] circle',
    );
    expect(updatedCircle).toBeTruthy();
    // Visual fill style may depend on CSS variables in the test environment;
    // the key regression is the index advancement which we already assert above.
  });

  it('rapid successive clicks do not create inconsistent state (no duplicate connects)', async () => {
    render(
      <MemoryRouter>
        <ConnectTheDots />
      </MemoryRouter>,
    );
    const startButton = screen.getByRole('button', { name: /start game/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(
        document.querySelector('svg[viewBox="0 0 800 600"] circle'),
      ).toBeTruthy();
    });
    const circle = document.querySelector('svg[viewBox="0 0 800 600"] circle')!;
    const cx = Number(circle.getAttribute('cx'));
    const cy = Number(circle.getAttribute('cy'));

    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    canvas.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        right: 800,
        bottom: 600,
        x: 0,
        y: 0,
        toJSON: () => {},
      }) as DOMRect;

    // Fire multiple quick clicks at the same position
    fireEvent.click(canvas, { clientX: cx, clientY: cy });
    fireEvent.click(canvas, { clientX: cx, clientY: cy });
    fireEvent.click(canvas, { clientX: cx, clientY: cy });

    // Expect index to have advanced to at most 2 (only one connect should be consumed per dot)
    await waitFor(() => {
      const indicator = screen.getByText(/Next Dot/i).parentElement!;
      // Should have advanced at least to #2
      expect(indicator.textContent).toMatch(/#2/);
      // It should not have skipped ahead multiple indices in one burst
      expect(indicator.textContent).not.toMatch(/#3/);
    });
  });

  // Permission handling tests

  describe('ConnectTheDots camera permissions', () => {
    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
      warnSpy.mockRestore();
      delete (navigator as any).permissions;
    });

    it('does not warn when permissions API is absent', () => {
      delete (navigator as any).permissions;
      render(
        <MemoryRouter>
          <ConnectTheDots />
        </MemoryRouter>,
      );
      expect(console.warn).not.toHaveBeenCalled();
      // component rendered; check for the Start Game button rather than ambiguous title
      expect(
        screen.getByRole('button', { name: /start game/i }),
      ).toBeInTheDocument();
    });

    it('displays warning banner when permission state is denied', async () => {
      const fakeStatus = {
        state: 'denied',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };
      (navigator as any).permissions = {
        query: vi.fn().mockResolvedValue(fakeStatus),
      };
      render(
        <MemoryRouter>
          <ConnectTheDots />
        </MemoryRouter>,
      );
      expect(
        await screen.findByText(/Camera permission denied/i),
      ).toBeInTheDocument();
    });
  });

  // close top-level regression suite
});
