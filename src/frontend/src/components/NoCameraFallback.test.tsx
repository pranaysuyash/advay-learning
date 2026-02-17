import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NoCameraFallback, CameraRequired } from './NoCameraFallback';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('NoCameraFallback', () => {
  it('should render default message when camera is not available', () => {
    renderWithRouter(<NoCameraFallback />);

    expect(screen.getByText('Camera Not Available')).toBeInTheDocument();
    expect(screen.getByText(/No camera\? No problem!/)).toBeInTheDocument();
  });

  it('should render camera-free game links', () => {
    renderWithRouter(<NoCameraFallback />);

    expect(screen.getByText('Try these games instead! 🎮')).toBeInTheDocument();
    expect(screen.getByText('Connect Dots')).toBeInTheDocument();
    expect(screen.getByText('Find Letters')).toBeInTheDocument();
    expect(screen.getByText('Draw Letters')).toBeInTheDocument();
  });

  it('should render custom title and description', () => {
    renderWithRouter(
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
    renderWithRouter(
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
    renderWithRouter(
      <NoCameraFallback
        actionLabel="Go Back"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render as inline message when fullScreen is false', () => {
    const { container } = renderWithRouter(
      <NoCameraFallback fullScreen={false} />
    );

    const wrapper = container.querySelector('.bg-gray-50');
    expect(wrapper).toHaveClass('border', 'border-gray-200', 'rounded-lg');
  });

  it('should render camera-off icon SVG', () => {
    const { container } = renderWithRouter(<NoCameraFallback />);
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

    renderWithRouter(
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

    renderWithRouter(
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
