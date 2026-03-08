import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ToastProvider, ToastContext } from '../Toast';
import { useContext } from 'react';

// Mock useAudio hook
vi.mock('../../../utils/hooks/useAudio', () => ({
  useAudio: () => ({
    playSuccess: vi.fn(),
    playError: vi.fn(),
    playPop: vi.fn(),
    playClick: vi.fn(),
  }),
}));

// Test component to access context
function TestComponent() {
  const context = useContext(ToastContext);
  return (
    <div>
      <button onClick={() => context?.showToast('Test message')}>Show Default</button>
      <button onClick={() => context?.showToast('Success!', 'success')}>Show Success</button>
      <button onClick={() => context?.showToast('Error!', 'error')}>Show Error</button>
      <button onClick={() => context?.showToast('Warning!', 'warning')}>Show Warning</button>
      <button onClick={() => context?.showToast('Info!', 'info')}>Show Info</button>
      <button onClick={() => context?.showToast('No auto-hide', 'info', 0)}>No Auto Hide</button>
      {context && <span data-testid="has-context">true</span>}
    </div>
  );
}

describe('ToastProvider', () => {
  describe('context provider', () => {
    it('provides context to children', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      expect(screen.getByTestId('has-context')).toBeInTheDocument();
    });

    it('renders children', () => {
      render(
        <ToastProvider>
          <div data-testid="child">Child content</div>
        </ToastProvider>
      );
      
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('showToast functionality', () => {
    it('shows a toast when showToast is called', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Default'));
      
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('shows success toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Success'));
      
      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument();
      });
    });

    it('shows error toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Error'));
      
      await waitFor(() => {
        expect(screen.getByText('Error!')).toBeInTheDocument();
      });
    });

    it('shows warning toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Warning'));
      
      await waitFor(() => {
        expect(screen.getByText('Warning!')).toBeInTheDocument();
      });
    });

    it('shows info toast (default type)', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Info'));
      
      await waitFor(() => {
        expect(screen.getByText('Info!')).toBeInTheDocument();
      });
    });

    it('shows multiple toasts', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Success'));
      fireEvent.click(screen.getByText('Show Error'));
      fireEvent.click(screen.getByText('Show Warning'));
      
      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument();
        expect(screen.getByText('Error!')).toBeInTheDocument();
        expect(screen.getByText('Warning!')).toBeInTheDocument();
      });
    });
  });

  describe('manual dismiss', () => {
    it('dismisses toast when close button clicked', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Default'));
      
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
      
      const closeButton = screen.getByLabelText('Dismiss notification');
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });

    it('has dismiss button for each toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Success'));
      fireEvent.click(screen.getByText('Show Error'));
      
      await waitFor(() => {
        const dismissButtons = screen.getAllByLabelText('Dismiss notification');
        expect(dismissButtons.length).toBe(2);
      });
    });

    it('dismisses only clicked toast', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Success'));
      fireEvent.click(screen.getByText('Show Error'));
      
      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument();
        expect(screen.getByText('Error!')).toBeInTheDocument();
      });
      
      const dismissButtons = screen.getAllByLabelText('Dismiss notification');
      fireEvent.click(dismissButtons[0]);
      
      await waitFor(() => {
        expect(screen.queryByText('Success!')).not.toBeInTheDocument();
      });
      
      // Other toast should still be there
      expect(screen.getByText('Error!')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has aria-live polite on container', () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('has aria-atomic true on container', () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      const liveRegion = container.querySelector('[aria-atomic="true"]');
      expect(liveRegion).toBeInTheDocument();
    });

    it('error toast has alert role', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Error'));
      
      await waitFor(() => {
        const toast = screen.getByRole('alert');
        expect(toast).toBeInTheDocument();
      });
    });

    it('warning toast has alert role', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Warning'));
      
      await waitFor(() => {
        const toast = screen.getByRole('alert');
        expect(toast).toBeInTheDocument();
      });
    });

    it('success toast has status role', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Success'));
      
      await waitFor(() => {
        const toast = screen.getByRole('status');
        expect(toast).toBeInTheDocument();
      });
    });

    it('dismiss button has aria-label', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Default'));
      
      await waitFor(() => {
        expect(screen.getByLabelText('Dismiss notification')).toBeInTheDocument();
      });
    });
  });

  describe('positioning', () => {
    it('renders in fixed position at top right', () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      const toastContainer = container.querySelector('.fixed.top-4.right-4');
      expect(toastContainer).toBeInTheDocument();
    });

    it('has high z-index', () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      const toastContainer = container.querySelector('.z-50');
      expect(toastContainer).toBeInTheDocument();
    });

    it('container is pointer-events-none', () => {
      const { container } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      const toastContainer = container.querySelector('.pointer-events-none');
      expect(toastContainer).toBeInTheDocument();
    });

    it('individual toasts are pointer-events-auto', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      
      fireEvent.click(screen.getByText('Show Default'));
      
      await waitFor(() => {
        const toast = screen.getByText('Test message').closest('.pointer-events-auto');
        expect(toast).toBeInTheDocument();
      });
    });
  });
});
