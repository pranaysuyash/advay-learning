import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ConnectTheDots } from '../ConnectTheDots';

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

    // Wait for the dots to render (dot number '1' should be present)
    const firstDotText = await screen.findByText('1');
    expect(firstDotText).toBeTruthy();

    // Find the canvas and stub its getBoundingClientRect so clicks map cleanly
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    expect(canvas).toBeTruthy();

    // Ensure bounding rect matches the canvas internal resolution used by the component
    canvas.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    // Locate the circle for dot 1 via its text's parent <g>
    const group = firstDotText.closest('g');
    expect(group).toBeTruthy();
    const circle = group!.querySelector('circle');
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

    // Re-query the circle after state update to ensure it still exists
    const updatedGroup = screen.getByText('1').closest('g');
    const updatedCircle = updatedGroup!.querySelector('circle');
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

    // Wait for dots
    const firstDotText = await screen.findByText('1');
    const group = firstDotText.closest('g');
    const circle = group!.querySelector('circle')!;
    const cx = Number(circle.getAttribute('cx'));
    const cy = Number(circle.getAttribute('cy'));

    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    canvas.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

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
});
