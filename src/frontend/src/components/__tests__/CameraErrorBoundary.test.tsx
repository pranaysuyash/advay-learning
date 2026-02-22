import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { CameraErrorBoundary } from '../errors/CameraErrorBoundary';

function Thrower() {
  throw new Error('camera permission denied by user');
  return null;
}

describe('CameraErrorBoundary', () => {
  it('catches camera errors and renders fallback UI', () => {
    render(
      <MemoryRouter>
        <CameraErrorBoundary gameName='Test Game'>
          <Thrower />
        </CameraErrorBoundary>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Camera Issue in Test Game/i)).toBeInTheDocument();
    expect(screen.getByText(/permission was blocked/i)).toBeInTheDocument();
  });

  it('invokes retry callback from fallback action', () => {
    const onRetry = vi.fn();

    render(
      <MemoryRouter>
        <CameraErrorBoundary gameName='Retry Game' onRetry={onRetry}>
          <Thrower />
        </CameraErrorBoundary>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: /retry camera/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
