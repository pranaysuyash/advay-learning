import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoCameraFallback, CameraRequired } from './NoCameraFallback';

describe('NoCameraFallback', () => {
  it('should render default message when camera is not available', () => {
    render(<NoCameraFallback />);

    expect(screen.getByText('Camera Not Available')).toBeInTheDocument();
    expect(screen.getByText(/This game requires a camera to play/)).toBeInTheDocument();
  });

  it('should render custom title and description', () => {
    render(
      <NoCameraFallback
        title="Custom Title"
        description="Custom description text"
      />
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
  });

  it('should render action button with callback', () => {
    const mockCallback = vi.fn();
    render(
      <NoCameraFallback
        actionLabel="Custom Button"
        onAction={mockCallback}
      />
    );

    const button = screen.getByRole('button', { name: 'Custom Button' });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should not render button if onAction is not provided', () => {
    render(
      <NoCameraFallback
        actionLabel="Go Back"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render as inline message when fullScreen is false', () => {
    const { container } = render(
      <NoCameraFallback fullScreen={false} />
    );

    const wrapper = container.querySelector('.bg-gray-50');
    expect(wrapper).toHaveClass('border', 'border-gray-200', 'rounded-lg');
  });

  it('should render camera icon SVG', () => {
    const { container } = render(<NoCameraFallback />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-16', 'h-16');
  });
});

describe('CameraRequired', () => {
  // Mock navigator.mediaDevices
  const originalNavigator = window.navigator;

  afterEach(() => {
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  it('should render children when camera is supported', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        mediaDevices: {
          getUserMedia: vi.fn(),
        },
      },
      configurable: true,
    });

    render(
      <CameraRequired>
        <div>Camera Game Content</div>
      </CameraRequired>
    );

    expect(screen.getByText('Camera Game Content')).toBeInTheDocument();
  });

  it('should render fallback when camera is not supported', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        mediaDevices: undefined,
      },
      configurable: true,
    });

    render(
      <CameraRequired
        fallback={<div>No Camera Fallback</div>}
      >
        <div>Camera Game Content</div>
      </CameraRequired>
    );

    expect(screen.getByText('No Camera Fallback')).toBeInTheDocument();
    expect(screen.queryByText('Camera Game Content')).not.toBeInTheDocument();
  });

  it('should render default fallback when camera not supported and no fallback provided', () => {
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        mediaDevices: undefined,
      },
      configurable: true,
    });

    render(
      <CameraRequired>
        <div>Camera Game Content</div>
      </CameraRequired>
    );

    expect(screen.getByText('Camera Not Available')).toBeInTheDocument();
  });

  it('should call onNoCameraDetected callback when camera is not available', () => {
    const mockCallback = vi.fn();

    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        mediaDevices: undefined,
      },
      configurable: true,
    });

    render(
      <CameraRequired onNoCameraDetected={mockCallback}>
        <div>Camera Game Content</div>
      </CameraRequired>
    );

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it('should not call onNoCameraDetected when camera is supported', () => {
    const mockCallback = vi.fn();

    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        mediaDevices: {
          getUserMedia: vi.fn(),
        },
      },
      configurable: true,
    });

    render(
      <CameraRequired onNoCameraDetected={mockCallback}>
        <div>Camera Game Content</div>
      </CameraRequired>
    );

    expect(mockCallback).not.toHaveBeenCalled();
  });
});
