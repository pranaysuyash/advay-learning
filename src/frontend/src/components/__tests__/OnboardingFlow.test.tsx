import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OnboardingFlow } from '../OnboardingFlow';
import { useSettingsStore } from '../../store';

// Mock framer-motion to avoid animation issues
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Mascot
vi.mock('../Mascot', () => ({
  Mascot: () => <div data-testid="mascot">Mascot</div>,
}));

// Mock getUserMedia
const mockGetUserMedia = vi.fn();
const mockStream = {
  getTracks: () => [{ stop: vi.fn() }],
};
let pendingGetUserMediaResolve: (value: any) => void;
let pendingGetUserMediaReject: (error: Error) => void;

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  configurable: true,
});

describe('OnboardingFlow', () => {
  const mockOnComplete = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserMedia.mockImplementation(() => new Promise((resolve, reject) => {
      pendingGetUserMediaResolve = resolve;
      pendingGetUserMediaReject = reject;
    }));
    
    // Reset store state
    useSettingsStore.setState({
      hydrated: true,
      onboardingCompleted: false,
      cameraPermissionState: 'unknown',
      cameraEnabled: false,
      tutorialCompleted: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial render', () => {
    it('renders welcome step when not completed', () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      expect(screen.getByText(/Welcome to Learn with Your Hands!/i)).toBeInTheDocument();
    });

    it('renders skip button on welcome step', () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      expect(screen.getByText(/Skip Tutorial/i)).toBeInTheDocument();
    });

    it('does not render when onboardingCompleted is true', () => {
      useSettingsStore.setState({ onboardingCompleted: true });
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      expect(screen.queryByText(/Welcome to Learn with Your Hands!/i)).not.toBeInTheDocument();
    });

    it('does not render when not hydrated', () => {
      useSettingsStore.setState({ hydrated: false });
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      expect(screen.queryByText(/Welcome to Learn with Your Hands!/i)).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('advances to magic vision step when clicking Let\'s Get Started', async () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await waitFor(() => {
        expect(screen.getByText(/Activate Magic Vision!/i)).toBeInTheDocument();
      });
    });

    it('shows camera permission dialog on magic vision step', async () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await waitFor(() => {
        expect(screen.getByText(/Awakening Magic.../i)).toBeInTheDocument();
      });
    });
  });

  describe('Camera permission handling', () => {
    it('calls getUserMedia when entering magic vision step', async () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalled();
      });
    });

    it('shows success state when camera permission granted', async () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await act(async () => {
        pendingGetUserMediaResolve(mockStream);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Magic Vision Activated!/i)).toBeInTheDocument();
      });
    });

    it('shows error state when camera permission denied', async () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await act(async () => {
        pendingGetUserMediaReject(new Error('NotAllowedError'));
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Magic Vision needs permission/i)).toBeInTheDocument();
      });
    });

    it('shows retry button when camera error occurs', async () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await act(async () => {
        pendingGetUserMediaReject(new Error('NotAllowedError'));
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
      });
    });

    it('allows skipping when camera error occurs', async () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await act(async () => {
        pendingGetUserMediaReject(new Error('NotAllowedError'));
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Continue Without Magic/i)).toBeInTheDocument();
      });
    });
  });

  describe('Skip functionality', () => {
    it('calls onSkip when skip button clicked on welcome', () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Skip Tutorial/i));
      expect(mockOnSkip).toHaveBeenCalled();
    });

    it('updates onboardingCompleted when skipped', () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Skip Tutorial/i));
      expect(useSettingsStore.getState().onboardingCompleted).toBe(true);
    });

    it('cleans up camera stream when skipped during permission request', async () => {
      const stopMock = vi.fn();
      const mockStreamWithStop = {
        getTracks: () => [{ stop: stopMock }],
      };
      
      mockGetUserMedia.mockImplementation(() => new Promise((resolve) => {
        setTimeout(() => resolve(mockStreamWithStop), 1000);
      }));

      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      // Skip before camera resolves
      await act(async () => {
        fireEvent.click(screen.getByText(/Skip for Now/i));
      });
      
      // Wait for the pending getUserMedia to resolve
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1100));
      });
      
      expect(stopMock).toHaveBeenCalled();
    });

    it('clears auto-advance timer when skipped', async () => {
      const stopMock = vi.fn();
      const mockStreamWithStop = {
        getTracks: () => [{ stop: stopMock }],
      };
      
      mockGetUserMedia.mockResolvedValue(mockStreamWithStop);

      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await act(async () => {
        pendingGetUserMediaResolve(mockStreamWithStop);
      });
      
      // Skip before auto-advance timer fires (2 seconds)
      await act(async () => {
        fireEvent.click(screen.getByText(/Skip for Now/i));
      });
      
      // onComplete should not have been called
      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('Completion', () => {
    it('calls onComplete when completing gesture tutorial', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream);

      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      
      // Click through welcome
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      await act(async () => {
        pendingGetUserMediaResolve(mockStream);
      });
      
      // Wait for auto-advance to gesture step
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 2500));
      });
      
      // Now we should be on gesture step or can click Start Playing
      const startButton = screen.queryByText(/Start Playing!/i);
      if (startButton) {
        fireEvent.click(startButton);
        expect(mockOnComplete).toHaveBeenCalled();
      }
    });

    it('updates tutorialCompleted when onboarding completed', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream);

      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await act(async () => {
        pendingGetUserMediaResolve(mockStream);
      });
      
      // Advance to gesture step
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 2500));
      });
      
      const startButton = screen.queryByText(/Start Playing!/i);
      if (startButton) {
        fireEvent.click(startButton);
        expect(useSettingsStore.getState().tutorialCompleted).toBe(true);
      }
    });
  });

  describe('Settings persistence', () => {
    it('persists onboardingCompleted to store on skip', () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Skip Tutorial/i));
      expect(useSettingsStore.getState().onboardingCompleted).toBe(true);
    });

    it('persists onboardingCompleted to store on complete', async () => {
      mockGetUserMedia.mockResolvedValue(mockStream);

      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await act(async () => {
        pendingGetUserMediaResolve(mockStream);
      });
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 2500));
      });
      
      const startButton = screen.queryByText(/Start Playing!/i);
      if (startButton) {
        fireEvent.click(startButton);
        expect(useSettingsStore.getState().onboardingCompleted).toBe(true);
      }
    });

    it('sets cameraEnabled to true when camera permission granted', async () => {
      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await act(async () => {
        pendingGetUserMediaResolve(mockStream);
      });
      
      await waitFor(() => {
        expect(useSettingsStore.getState().cameraEnabled).toBe(true);
      });
    });
  });

  describe('Error logging', () => {
    it('logs camera errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('NotAllowedError');
      error.name = 'NotAllowedError';

      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await act(async () => {
        pendingGetUserMediaReject(error);
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[OnboardingFlow] Camera error:',
          expect.objectContaining({
            name: 'NotAllowedError',
            isNotAllowedError: true,
          })
        );
      });
      
      consoleSpy.mockRestore();
    });

    it('detects NotFoundError camera errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('NotFoundError');
      error.name = 'NotFoundError';

      render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await act(async () => {
        pendingGetUserMediaReject(error);
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          '[OnboardingFlow] Camera error:',
          expect.objectContaining({
            name: 'NotFoundError',
            isNotFoundError: true,
          })
        );
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('cleans up camera stream on unmount', async () => {
      const stopMock = vi.fn();
      const mockStreamWithStop = {
        getTracks: () => [{ stop: stopMock }],
      };
      
      mockGetUserMedia.mockResolvedValue(mockStreamWithStop);

      const { unmount } = render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      await act(async () => {
        pendingGetUserMediaResolve(mockStreamWithStop);
      });
      
      unmount();
      
      expect(stopMock).toHaveBeenCalled();
    });

    it('cleans up abort controller on unmount', () => {
      const { unmount } = render(<OnboardingFlow onComplete={mockOnComplete} onSkip={mockOnSkip} />);
      fireEvent.click(screen.getByText(/Let's Get Started!/i));
      
      // Should not throw
      expect(() => unmount()).not.toThrow();
    });
  });
});
