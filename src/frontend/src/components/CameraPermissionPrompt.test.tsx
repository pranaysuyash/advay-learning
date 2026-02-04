import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CameraPermissionPrompt, CameraPermissionWrapper } from './CameraPermissionPrompt';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('CameraPermissionPrompt', () => {
  let mockGetUserMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetUserMedia = vi.fn(() => ({
      getTracks: () => [{ stop: vi.fn() }],
    }));

    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders permission prompt with default title', () => {
      const onGranted = vi.fn();
      const onDenied = vi.fn();

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
        />,
      );

      expect(screen.getByText('Ready to Play?')).toBeInTheDocument();
      expect(
        screen.getByText(/We'd love to see your hands move!/),
      ).toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
      const onGranted = vi.fn();
      const onDenied = vi.fn();
      const customTitle = 'Camera Access Required';
      const customDesc = 'Custom description about camera usage';

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
          title={customTitle}
          description={customDesc}
        />,
      );

      expect(screen.getByText(customTitle)).toBeInTheDocument();
      expect(screen.getByText(customDesc)).toBeInTheDocument();
    });

    it('renders camera icon', () => {
      const onGranted = vi.fn();
      const onDenied = vi.fn();

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
        />,
      );

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      const onGranted = vi.fn();
      const onDenied = vi.fn();

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
        />,
      );

      expect(screen.getByLabelText('Request camera permission')).toBeInTheDocument();
      expect(screen.getByLabelText('Skip camera and play with touch')).toBeInTheDocument();
    });
  });

  describe('Camera Permission Flow', () => {
    it('requests camera permission when user clicks camera button', async () => {
      const onGranted = vi.fn();
      const onDenied = vi.fn();

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
        />,
      );

      const cameraButton = screen.getByLabelText('Request camera permission');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(mockGetUserMedia).toHaveBeenCalledWith({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      });
    });

    it('calls onPermissionGranted when camera access is granted', async () => {
      const onGranted = vi.fn();
      const onDenied = vi.fn();

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
        />,
      );

      const cameraButton = screen.getByLabelText('Request camera permission');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(onGranted).toHaveBeenCalled();
      });
    });

    it('handles NotAllowedError gracefully', async () => {
      mockGetUserMedia.mockRejectedValueOnce(
        Object.assign(new Error('Permission denied'), {
          name: 'NotAllowedError',
        }),
      );

      const onGranted = vi.fn();
      const onDenied = vi.fn();

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
        />,
      );

      const cameraButton = screen.getByLabelText('Request camera permission');
      fireEvent.click(cameraButton);

      await waitFor(
        () => {
          expect(
            screen.getByText(/Camera permission was denied/),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      await waitFor(
        () => {
          expect(onDenied).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );
    });

    it('handles NotFoundError gracefully', async () => {
      mockGetUserMedia.mockRejectedValueOnce(
        Object.assign(new Error('No camera found'), {
          name: 'NotFoundError',
        }),
      );

      const onGranted = vi.fn();
      const onDenied = vi.fn();

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
        />,
      );

      const cameraButton = screen.getByLabelText('Request camera permission');
      fireEvent.click(cameraButton);

      await waitFor(
        () => {
          expect(
            screen.getByText(/No camera found on this device/),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('handles NotReadableError gracefully', async () => {
      mockGetUserMedia.mockRejectedValueOnce(
        Object.assign(new Error('Camera in use'), {
          name: 'NotReadableError',
        }),
      );

      const onGranted = vi.fn();
      const onDenied = vi.fn();

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
        />,
      );

      const cameraButton = screen.getByLabelText('Request camera permission');
      fireEvent.click(cameraButton);

      await waitFor(
        () => {
          expect(
            screen.getByText(/Your camera is being used by another app/),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('calls onPermissionDenied when user clicks skip button', async () => {
      const onGranted = vi.fn();
      const onDenied = vi.fn();

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
        />,
      );

      const skipButton = screen.getByLabelText('Skip camera and play with touch');
      fireEvent.click(skipButton);

      expect(onDenied).toHaveBeenCalled();
      expect(onGranted).not.toHaveBeenCalled();
    });

    it('disables buttons while requesting permission', () => {
      mockGetUserMedia.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                getTracks: () => [{ stop: vi.fn() }],
              });
            }, 100);
          }),
      );

      const onGranted = vi.fn();
      const onDenied = vi.fn();

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
        />,
      );

      const cameraButton = screen.getByLabelText('Request camera permission');
      fireEvent.click(cameraButton);

      // Button should be disabled while loading
      expect(cameraButton).toBeDisabled();
    });
  });

  describe('Stream Management', () => {
    it('stops media stream after permission check', async () => {
      const mockStop = vi.fn();
      mockGetUserMedia.mockResolvedValueOnce({
        getTracks: () => [{ stop: mockStop }],
      });

      const onGranted = vi.fn();
      const onDenied = vi.fn();

      render(
        <CameraPermissionPrompt
          onPermissionGranted={onGranted}
          onPermissionDenied={onDenied}
        />,
      );

      const cameraButton = screen.getByLabelText('Request camera permission');
      fireEvent.click(cameraButton);

      await waitFor(() => {
        expect(mockStop).toHaveBeenCalled();
      });
    });
  });
});

describe('CameraPermissionWrapper', () => {
  let mockGetUserMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGetUserMedia = vi.fn(() => ({
      getTracks: () => [{ stop: vi.fn() }],
    }));

    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows children when skipPrompt is true', () => {
    render(
      <CameraPermissionWrapper skipPrompt={true}>
        <div data-testid='game-content'>Game Content</div>
      </CameraPermissionWrapper>,
    );

    expect(screen.getByTestId('game-content')).toBeInTheDocument();
  });

  it('shows permission prompt by default', () => {
    render(
      <CameraPermissionWrapper>
        <div data-testid='game-content'>Game Content</div>
      </CameraPermissionWrapper>,
    );

    expect(screen.getByText('Ready to Play?')).toBeInTheDocument();
    expect(screen.queryByTestId('game-content')).not.toBeInTheDocument();
  });

  it('calls onCameraGranted callback when permission granted', async () => {
    const onGranted = vi.fn();
    const onDenied = vi.fn();

    render(
      <CameraPermissionWrapper
        onCameraGranted={onGranted}
        onCameraDenied={onDenied}
      >
        <div data-testid='game-content'>Game Content</div>
      </CameraPermissionWrapper>,
    );

    const cameraButton = screen.getByLabelText('Request camera permission');
    fireEvent.click(cameraButton);

    await waitFor(() => {
      expect(onGranted).toHaveBeenCalled();
    });
  });

  it('shows children after permission is granted', async () => {
    render(
      <CameraPermissionWrapper>
        <div data-testid='game-content'>Game Content</div>
      </CameraPermissionWrapper>,
    );

    expect(screen.queryByTestId('game-content')).not.toBeInTheDocument();

    const cameraButton = screen.getByLabelText('Request camera permission');
    fireEvent.click(cameraButton);

    await waitFor(() => {
      expect(screen.getByTestId('game-content')).toBeInTheDocument();
    });
  });

  it('calls onCameraDenied callback when user skips', () => {
    const onGranted = vi.fn();
    const onDenied = vi.fn();

    render(
      <CameraPermissionWrapper
        onCameraGranted={onGranted}
        onCameraDenied={onDenied}
      >
        <div data-testid='game-content'>Game Content</div>
      </CameraPermissionWrapper>,
    );

    const skipButton = screen.getByLabelText('Skip camera and play with touch');
    fireEvent.click(skipButton);

    expect(onDenied).toHaveBeenCalled();
  });
});
