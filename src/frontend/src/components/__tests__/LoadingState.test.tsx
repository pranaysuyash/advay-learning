import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingState, LoadingOverlay } from '../LoadingState';

describe('LoadingState', () => {
  describe('renders correctly', () => {
    it('renders with default props', () => {
      render(<LoadingState />);
      
      expect(screen.getByText('Loading hand tracking...')).toBeInTheDocument();
      expect(screen.getByText('🦊')).toBeInTheDocument();
    });

    it('renders with custom message', () => {
      render(<LoadingState message="Custom loading message" />);
      
      expect(screen.getByText('Custom loading message')).toBeInTheDocument();
    });

    it('renders animated dots', () => {
      render(<LoadingState />);
      
      // Check for animated dots container
      const dots = document.querySelectorAll('.bg-pip-orange');
      expect(dots.length).toBe(3);
    });

    it('renders fox emoji in animated container', () => {
      render(<LoadingState />);
      
      const foxEmoji = screen.getByText('🦊');
      expect(foxEmoji).toBeInTheDocument();
      expect(foxEmoji.parentElement?.classList.contains('relative')).toBe(true);
    });
  });

  describe('size variations', () => {
    it('renders small size correctly', () => {
      render(<LoadingState size="sm" />);
      
      const container = document.querySelector('.w-16.h-16');
      expect(container).toBeInTheDocument();
    });

    it('renders medium size correctly (default)', () => {
      render(<LoadingState size="md" />);
      
      const container = document.querySelector('.w-24.h-24');
      expect(container).toBeInTheDocument();
    });

    it('renders large size correctly', () => {
      render(<LoadingState size="lg" />);
      
      const container = document.querySelector('.w-32.h-32');
      expect(container).toBeInTheDocument();
    });

    it('uses medium size when size prop not specified', () => {
      render(<LoadingState />);
      
      const container = document.querySelector('.w-24.h-24');
      expect(container).toBeInTheDocument();
    });
  });

  describe('text size classes', () => {
    it('applies small text class for sm size', () => {
      render(<LoadingState size="sm" />);
      
      const textElement = screen.getByText('Loading hand tracking...');
      expect(textElement.classList.contains('text-sm')).toBe(true);
    });

    it('applies base text class for md size', () => {
      render(<LoadingState size="md" />);
      
      const textElement = screen.getByText('Loading hand tracking...');
      expect(textElement.classList.contains('text-base')).toBe(true);
    });

    it('applies large text class for lg size', () => {
      render(<LoadingState size="lg" />);
      
      const textElement = screen.getByText('Loading hand tracking...');
      expect(textElement.classList.contains('text-lg')).toBe(true);
    });
  });

  describe('layout structure', () => {
    it('has flex column layout centered', () => {
      render(<LoadingState />);
      
      const wrapper = document.querySelector('.flex.flex-col.items-center.justify-center');
      expect(wrapper).toBeInTheDocument();
    });

    it('has padding', () => {
      render(<LoadingState />);
      
      const wrapper = document.querySelector('.p-8');
      expect(wrapper).toBeInTheDocument();
    });

    it('renders glow effect behind fox', () => {
      render(<LoadingState />);
      
      const glow = document.querySelector('.bg-orange-400\\/20');
      expect(glow).toBeInTheDocument();
    });
  });
});

describe('LoadingOverlay', () => {
  it('renders children when not loading', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div data-testid="child">Content</div>
      </LoadingOverlay>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders children with overlay when loading', () => {
    render(
      <LoadingOverlay isLoading={true}>
        <div data-testid="child">Content</div>
      </LoadingOverlay>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Loading hand tracking...')).toBeInTheDocument();
  });

  it('renders with custom message when loading', () => {
    render(
      <LoadingOverlay isLoading={true} message="Custom overlay message">
        <div>Content</div>
      </LoadingOverlay>
    );
    
    expect(screen.getByText('Custom overlay message')).toBeInTheDocument();
  });

  it('has relative positioning', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div>Content</div>
      </LoadingOverlay>
    );
    
    const wrapper = document.querySelector('.relative');
    expect(wrapper).toBeInTheDocument();
  });

  it('overlay has absolute positioning with blur when loading', () => {
    render(
      <LoadingOverlay isLoading={true}>
        <div>Content</div>
      </LoadingOverlay>
    );
    
    const overlay = document.querySelector('.absolute.inset-0');
    expect(overlay).toBeInTheDocument();
    expect(overlay?.classList.contains('backdrop-blur-sm')).toBe(true);
  });

  it('does not render overlay when not loading', () => {
    render(
      <LoadingOverlay isLoading={false}>
        <div>Content</div>
      </LoadingOverlay>
    );
    
    const loadingMessage = screen.queryByText('Loading hand tracking...');
    expect(loadingMessage).not.toBeInTheDocument();
  });
});
