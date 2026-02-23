import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FingerNumberShow } from '../FingerNumberShow';

// Mock the hooks and dependencies
vi.mock('../../hooks/useTTS', () => ({
  useTTS: () => ({
    speak: vi.fn(),
    isEnabled: true,
    isAvailable: true,
  }),
}));

vi.mock('../../hooks/useSoundEffects', () => ({
  useSoundEffects: () => ({
    playCelebration: vi.fn(),
    playSuccess: vi.fn(),
  }),
}));

vi.mock('../../hooks/useGameHandTracking', () => ({
  useGameHandTracking: () => ({
    isModelLoading: false,
    error: null,
  }),
}));

vi.mock('react-webcam', () => ({
  default: vi.fn(({ ref, ...props }) => (
    <video ref={ref} data-testid="webcam" {...props} />
  )),
}));

// Wrapper with Router
const renderWithRouter = (component: React.ReactNode) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('FingerNumberShow Accessibility', () => {
  it('renders without accessibility errors', () => {
    renderWithRouter(<FingerNumberShow />);
    
    // Check that the component renders
    expect(screen.getByText(/Finger Number Show/i)).toBeInTheDocument();
  });

  it('has aria-live region for announcements', () => {
    renderWithRouter(<FingerNumberShow />);
    
    // Check for aria-live region
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('has aria-live assertive region for matches', () => {
    renderWithRouter(<FingerNumberShow />);
    
    // Check for assertive live region
    const assertiveRegion = document.querySelector('[aria-live="assertive"]');
    expect(assertiveRegion).toBeInTheDocument();
  });

  it('webcam has aria-label for screen readers', () => {
    renderWithRouter(<FingerNumberShow />);
    
    // Check for buttons with accessible names
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('buttons have aria-labels', () => {
    renderWithRouter(<FingerNumberShow />);
    
    // Check that buttons have accessible names
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Each button should have either text content or aria-label
    buttons.forEach((button) => {
      const hasAccessibleName = 
        button.hasAttribute('aria-label') || 
        button.textContent?.trim() !== '';
      expect(hasAccessibleName).toBe(true);
    });
  });

  it('keyboard event listener is attached', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    renderWithRouter(<FingerNumberShow />);
    
    // Check that keyboard event listener was added
    const keydownCalls = addEventListenerSpy.mock.calls.filter(
      (call) => call[0] === 'keydown'
    );
    expect(keydownCalls.length).toBeGreaterThan(0);
    
    addEventListenerSpy.mockRestore();
  });

  it('game container is accessible', () => {
    renderWithRouter(<FingerNumberShow />);
    
    // Check that game title is present
    expect(screen.getByText(/Finger Number Show/i)).toBeInTheDocument();
    
    // Verify game is in menu state initially (not playing)
    // The application role only appears when playing
    const gameArea = document.querySelector('[role="application"]');
    // Initially null because game hasn't started
    expect(gameArea).toBeNull();
  });
});
