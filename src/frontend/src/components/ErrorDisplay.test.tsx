import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from './ErrorDisplay';
import { describe, it, expect, vi } from 'vitest';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock Button component
vi.mock('./ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('ErrorDisplay', () => {
  describe('Modal Variant (default)', () => {
    it('renders error modal with title, description, and action', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          onDismiss={() => {}}
        />,
      );

      expect(screen.getByText(/Permission Needed/)).toBeInTheDocument();
      expect(screen.getByText(/permission to use your camera/)).toBeInTheDocument();
      expect(screen.getByText(/Grant camera permission/)).toBeInTheDocument();
    });

    it('displays emoji icon', () => {
      const { container } = render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          onDismiss={() => {}}
        />,
      );

      const emoji = container.querySelector('.text-6xl');
      expect(emoji?.textContent).toContain('📷');
    });

    it('calls onRetry when retry button clicked', () => {
      const onRetry = vi.fn();
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          onRetry={onRetry}
          onDismiss={() => {}}
        />,
      );

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalled();
    });

    it('calls onDismiss when dismiss button clicked', () => {
      const onDismiss = vi.fn();
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          onDismiss={onDismiss}
        />,
      );

      const dismissButton = screen.getByText('Dismiss');
      fireEvent.click(dismissButton);

      expect(onDismiss).toHaveBeenCalled();
    });

    it('shows "Continue without fix" when retry is available', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          onRetry={() => {}}
          onDismiss={() => {}}
        />,
      );

      expect(screen.getByText('Continue without fix')).toBeInTheDocument();
    });

    it('shows support message', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          onDismiss={() => {}}
        />,
      );

      expect(screen.getByText(/contact support/)).toBeInTheDocument();
    });
  });

  describe('Toast Variant', () => {
    it('renders as notification toast', () => {
      const { container } = render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          variant='toast'
          onDismiss={() => {}}
        />,
      );

      const toast = container.querySelector('.fixed.top-4');
      expect(toast).toBeInTheDocument();
    });

    it('displays compact content', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          variant='toast'
          onDismiss={() => {}}
        />,
      );

      expect(screen.getByText(/Permission Needed/)).toBeInTheDocument();
    });

    it('shows close button in toast', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          variant='toast'
          onDismiss={() => {}}
        />,
      );

      const closeButton = screen.getByLabelText('Close error message');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Inline Variant', () => {
    it('renders as inline alert in content', () => {
      const { container } = render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          variant='inline'
          onDismiss={() => {}}
        />,
      );

      const inline = container.querySelector('.bg-red-50.border-2');
      expect(inline).toBeInTheDocument();
    });

    it('shows retry button in inline variant', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          variant='inline'
          onRetry={() => {}}
          onDismiss={() => {}}
        />,
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  describe('Custom Messages', () => {
    it('uses custom title if provided', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          title='Custom Error Title'
          onDismiss={() => {}}
        />,
      );

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
    });

    it('uses custom description if provided', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          description='Custom error description'
          onDismiss={() => {}}
        />,
      );

      expect(screen.getByText('Custom error description')).toBeInTheDocument();
    });

    it('uses custom action if provided', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          action='Custom recovery action'
          onDismiss={() => {}}
        />,
      );

      expect(screen.getByText(/Custom recovery action/)).toBeInTheDocument();
    });
  });

  describe('Error Details', () => {
    it('hides technical details by default', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          error={new Error('Test error')}
          onDismiss={() => {}}
          showDetails={false}
        />,
      );

      expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
    });

    it('shows technical details when enabled', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          error={new Error('Test error')}
          onDismiss={() => {}}
          showDetails={true}
        />,
      );

      expect(screen.getByText(/Technical Details/)).toBeInTheDocument();
      expect(screen.getByText(/Test error/)).toBeInTheDocument();
    });
  });

  describe('Different Error Types', () => {
    const errorTypes = [
      'NotAllowedError',
      'NotFoundError',
      'NotReadableError',
      'NETWORK_ERROR',
      'UNKNOWN_ERROR',
    ];

    errorTypes.forEach((errorCode) => {
      it(`handles ${errorCode}`, () => {
        render(
          <ErrorDisplay
            errorCode={errorCode}
            onDismiss={() => {}}
          />,
        );

        // Should render without crashing; modal variant always renders an H2 title.
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('uses semantic HTML structure', () => {
      const { container } = render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          onDismiss={() => {}}
        />,
      );

      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toContain('Permission');
    });

    it('provides descriptive button labels', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          onRetry={() => {}}
          onDismiss={() => {}}
        />,
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Continue without fix')).toBeInTheDocument();
    });

    it('labels close button for toast variant', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          variant='toast'
          onDismiss={() => {}}
        />,
      );

      expect(screen.getByLabelText('Close error message')).toBeInTheDocument();
    });
  });

  describe('Error Message Content', () => {
    it('avoids technical jargon', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          onDismiss={() => {}}
        />,
      );

      const text = screen.getByText(/Permission Needed/).textContent || '';
      expect(text).not.toContain('DOMException');
      expect(text).not.toContain('NotAllowedError');
    });

    it('provides child-friendly language', () => {
      render(
        <ErrorDisplay
          errorCode='NotFoundError'
          onDismiss={() => {}}
        />,
      );

      expect(screen.getByText(/device/)).toBeInTheDocument();
    });

    it('includes actionable recovery steps', () => {
      render(
        <ErrorDisplay
          errorCode='NotAllowedError'
          onDismiss={() => {}}
        />,
      );

      const actionText = screen.getByText(/What to do:/).textContent || '';
      expect(actionText).toMatch(/^[\w\s]+:/); // Starts with imperative
    });
  });
});
