import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../Home';
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
    render(<Home />);
    expect(screen.getByRole('button', { name: /Try Demo/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeDefined();
  });

  it('clicking Try Demo sets demoMode and does not request camera permission', async () => {
    // Mock getUserMedia to fail loudly if called
    const mockGetUserMedia = vi.fn(() =>
      Promise.reject(new Error('should not be called')),
    );
    // @ts-ignore - define minimal mediaDevices
    (globalThis as any).navigator = {
      mediaDevices: { getUserMedia: mockGetUserMedia },
    };

    render(<Home />);

    const btn = screen.getByRole('button', { name: /Try Demo/i });
    fireEvent.click(btn);

    // demo mode should be enabled in the settings store
    expect(useSettingsStore.getState().demoMode).toBe(true);

    // and camera should NOT have been requested
    expect(mockGetUserMedia).not.toHaveBeenCalled();
  });

  it('mascot is decorative (aria-hidden) and has hidden class for mobile', () => {
    const { container } = render(<Home />);

    // decorative mascot should be aria-hidden
    const ariaHiddenEl = container.querySelector('[aria-hidden="true"]');
    expect(ariaHiddenEl).toBeTruthy();

    // the mascot wrapper uses the 'hidden' class on small screens
    // check ancestor for hidden class
    const hiddenAncestor = ariaHiddenEl?.closest('.hidden');
    expect(hiddenAncestor).toBeTruthy();
  });
});
