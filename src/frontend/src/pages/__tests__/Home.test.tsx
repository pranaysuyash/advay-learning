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
    onboardingCompleted: false,
    demoMode: false,
  });
});

describe('Home landing', () => {
  it('renders Try Demo CTA and Get Started', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );
    expect(screen.getByRole('button', { name: /Try Demo/i })).toBeDefined();
    // multiple 'Get Started' variations may exist (onboarding + main CTA); ensure at least one exists
    const getStartedBtns = screen.getAllByRole('button', {
      name: /Get Started/i,
    });
    expect(getStartedBtns.length).toBeGreaterThanOrEqual(1);
  });

  it('clicking Try Demo sets demoMode and does not request camera permission', async () => {
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

    const btn = screen.getByRole('button', { name: /Try Demo/i });
    fireEvent.click(btn);

    // demo mode should be enabled in the settings store
    expect(useSettingsStore.getState().demoMode).toBe(true);

    // and camera should NOT have been requested
    expect(mockGetUserMedia).not.toHaveBeenCalled();
  });

  it('mascot is decorative (aria-hidden) and not hidden on mobile', () => {
    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    // decorative mascot should be aria-hidden
    const ariaHiddenEl = container.querySelector('[aria-hidden="true"]');
    expect(ariaHiddenEl).toBeTruthy();

    // mascot is now visible on mobile (it used to be `.hidden` on small screens)
    const hiddenAncestor = ariaHiddenEl?.closest('.hidden');
    expect(hiddenAncestor).toBeNull();
  });
});
