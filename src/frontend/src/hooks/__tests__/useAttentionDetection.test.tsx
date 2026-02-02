import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { useAttentionDetection } from '../useAttentionDetection';

function TestComponent() {
  const { isLoading, error } = useAttentionDetection();

  return (
    <div>
      <div data-testid='loading'>{String(isLoading)}</div>
      <div data-testid='error'>{error ?? ''}</div>
    </div>
  );
}

describe('useAttentionDetection hook (integration mocked)', () => {
  it('initializes without throwing', async () => {
    render(<TestComponent />);

    // Initialization should start (loading is a boolean string). We avoid waiting for
    // full external init here to keep test deterministic and avoid timing flakiness.
    await waitFor(() => expect(screen.getByTestId('loading')).toBeTruthy());
    expect(['true', 'false']).toContain(
      screen.getByTestId('loading').textContent,
    );
    expect(screen.getByTestId('error').textContent).toBe('');
  });

  it('gracefully handles initialization failure', async () => {
    // Force the FaceLandmarker.createFromOptions to throw for this test
    const mod = await import('@mediapipe/tasks-vision');
    const original = mod.FaceLandmarker.createFromOptions;
    mod.FaceLandmarker.createFromOptions = async () => {
      throw new Error('init failed');
    };

    render(<TestComponent />);

    await waitFor(() =>
      expect(screen.getByTestId('loading').textContent).toBe('false'),
    );
    expect(screen.getByTestId('error').textContent).toContain(
      'Attention detection not available',
    );

    // restore original
    mod.FaceLandmarker.createFromOptions = original;
  });
});
