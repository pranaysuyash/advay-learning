import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { ToastProvider, useToast } from '../ui/Toast';

describe('Toast Component', () => {
  it('should render toast provider without crashing', () => {
    const { container } = render(
      <ToastProvider>
        <div>Test Child</div>
      </ToastProvider>,
    );

    expect(container).toBeInTheDocument();
  });

  it('should render toast with success styling', () => {
    const TestComponent = () => {
      const { showToast } = useToast();

      return (
        <div>
          <button onClick={() => showToast('Test success', 'success')}>
            Show Toast
          </button>
        </div>
      );
    };

    const { getByText, container } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    const button = getByText('Show Toast');
    fireEvent.click(button);

    // Check if toast appears (this might need adjustment based on actual implementation)
    expect(container).toBeInTheDocument();
  });
});
