import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Home } from '../Home';
import { useAuthStore, useSettingsStore } from '../../store';

beforeEach(() => {
  // Reset stores to deterministic state
  useAuthStore.setState({ isAuthenticated: false });
  useSettingsStore.setState({
    hydrated: true,
    onboardingCompleted: true,
    demoMode: false,
  });
});

describe('Home landing', () => {
  it('renders primary CTAs', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /Create a Profile/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Try The Magic/i })).toBeDefined();
  });

  it('clicking Try The Magic sets demoMode and does not request camera permission', async () => {
    // Mock getUserMedia to fail loudly if called
    const mockGetUserMedia = vi.fn(() =>
      Promise.reject(new Error('should not be called')),
    );
    // @ts-expect-error - define minimal mediaDevices
    (globalThis as any).navigator = {
      mediaDevices: { getUserMedia: mockGetUserMedia },
    };

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const btn = screen.getByRole('button', { name: /Try The Magic/i });
    fireEvent.click(btn);

    // demo mode should be enabled in the settings store
    expect(useSettingsStore.getState().demoMode).toBe(true);

    // and camera should NOT have been requested
    expect(mockGetUserMedia).not.toHaveBeenCalled();
  });

  it('renders feature section heading', () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const featuresHeading = Array.from(container.querySelectorAll('h2')).find((el) =>
      /Digital Magic, Physical Reality/i.test(el.textContent ?? ''),
    );
    expect(featuresHeading).toBeTruthy();
  });
});
