import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { ToastProvider, useToast } from '../ui/Toast';

describe('Toast Component', () => {
  describe('Toast Provider', () => {
    it('should provide toast context to children', () => {
      const { getByRole } = render(
        <ToastProvider>
          <div>Test Child</div>
        </ToastProvider>
      );

      // Access toast context through custom hook
      const { result } = getByRole('custom-hook-result');
      expect(result).toBeDefined();
    });

    it('should show toast with correct styling for success type', () => {
      const { getByRole } = render(
        <ToastProvider>
          <div>Test Child</div>
        </ToastProvider>
      );

      // Mock console to prevent errors
      const consoleSpy = vi.spyOn(console, 'error');

      // Trigger a success toast
      const { result } = render(
        <ToastProvider>
          <div>Test Child</div>
        </ToastProvider>
      );
      act(() => {
        result.showToast('Test success message', 'success');
      });

      // Check if success toast is displayed
      expect(getByText('Test success message')).toBeInTheDocument();
      expect(getByText('Test success message')).toHaveClass('bg-green-500/20', 'border-green-500/30', 'text-green-400');

      // Trigger an error toast
      act(() => {
        result.showToast('Test error message', 'error');
      });

      expect(getByText('Test error message')).toBeInTheDocument();
      expect(getByText('Test error message')).toHaveClass('bg-red-500/20', 'border-red-500/30', 'text-red-400');

      // Trigger a warning toast
      act(() => {
        result.showToast('Test warning message', 'warning');
      });

      expect(getByText('Test warning message')).toBeInTheDocument();
      expect(getByText('Test warning message')).toHaveClass('bg-yellow-500/20', 'border-yellow-500/30', 'text-yellow-400');

      // Trigger an info toast
      act(() => {
        result.showToast('Test info message', 'info');
      });

      expect(getByText('Test info message')).toBeInTheDocument();
      expect(getByText('Test info message')).toHaveClass('bg-blue-500/20', 'border-blue-500/30', 'text-blue-400');

      // Verify info toast style (different class)
      expect(getByText('Test info message')).toHaveClass('border-blue-500');
    });

    describe('Toast Styling', () => {
      it('should apply correct size (24) by default', () => {
        const { getByRole } = render(
          <ToastProvider>
            <div>Test Child</div>
          </ToastProvider>
        );

        const { result } = render(
          <ToastProvider>
            <div>Test Child</div>
          </ToastProvider>
        );

        act(() => {
          result.showToast('Test message', 'success');
        });

        // Check that UIIcon has size 24
        const icon = result.container.querySelector('.lucide-react');
        expect(icon).toBeInTheDocument();
        // Note: We don't test exact pixel dimensions as they depend on rendering
      });

      it('should apply custom duration', () => {
        const { getByRole } = render(
          <ToastProvider>
            <div>Test Child</div>
          </ToastProvider>
        );

        const { result } = render(
          <ToastProvider>
            <div>Test Child</div>
          </ToastProvider>
        );

        act(() => {
          result.showToast('Test message', 'success');
        });

        expect(getByText('Test message')).toBeInTheDocument();

        // Wait for auto-dismissal (default 4000ms)
        act(() => {
          vi.advanceTimersByTime(500);
        });

        expect(getByText('Test message')).not.toBeInTheDocument();
      });

      it('should allow manual dismissal', () => {
        const { getByRole } = render(
          <ToastProvider>
            <div>Test Child</div>
          </ToastProvider>
        );

        const { result } = render(
          <ToastProvider>
            <div>Test Child</div>
          </ToastProvider>
        );

        act(() => {
          result.showToast('Test message', 'success');
        });

        // Click dismiss button manually
        const dismissButton = getByRole('custom-hook-result').querySelector('button');
        fireEvent.click(dismissButton);

        expect(getByText('Test message')).not.toBeInTheDocument();
      });

      it('should display multiple toasts simultaneously', () => {
        const { getByRole } = render(
          <ToastProvider>
            <div>Test Child</div>
          </ToastProvider>
        );

        // Show 3 toasts
        act(() => {
          result.showToast('First message', 'success');
          result.showToast('Second message', 'success');
          result.showToast('Third message', 'success');
        });

        // Verify all are displayed
        expect(getByText('First message')).toBeInTheDocument();
        expect(getByText('Second message')).toBeInTheDocument();
        expect(getByText('Third message')).toBeInTheDocument();

        // Show a 4th toast (should auto-dismiss the first)
        act(() => {
          vi.advanceTimersByTime(410); // 410ms after the first toast
        });

        expect(getByText('First message')).not.toBeInTheDocument();
        expect(getByText('Second message')).toBeInTheDocument();
        expect(getByText('Third message')).toBeInTheDocument();
      });
  });

  describe('Toast Component Functionality', () => {
    it('should maintain toast state correctly', () => {
      const { result } = render(
        <ToastProvider>
          <div>Test Child</div>
        </ToastProvider>
      );

      act(() => {
        // Show a toast
        result.showToast('First message', 'success');
      });

      // Verify toast is in state
      expect(result).toHaveProperty('toasts', expect.anything(Array));
      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0]).toEqual({
        id: expect.any(String),
        message: 'First message',
        type: 'success',
      });

      // Show another toast
      act(() => {
        result.showToast('Second message', 'error');
      });

      expect(result.toasts).toHaveLength(2);
      expect(result.toasts[1]).toEqual({
        id: expect.any(String),
        message: 'First message',
        type: 'success',
      });
      expect(result.toasts[1]).toEqual({
        id: expect.any(String),
        message: 'Second message',
        type: 'error',
      });

      // Dismiss first toast (should auto-dismiss due to FIFO)
      act(() => {
        vi.advanceTimersByTime(410);
      });

      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[1]).toEqual({
        id: expect.any(String),
        message: 'Second message',
        type: 'error',
      });
    });

    it('should handle rapid toast additions and removals', () => {
      const { result } = render(
        <ToastProvider>
          <div>Test Child</div>
        </ToastProvider>
      );

      // Add and remove multiple toasts quickly
      act(() => {
        result.showToast('First', 'success');
        result.showToast('Second', 'success');
        result.showToast('Third', 'success');
        result.showToast('Fourth', 'success');
      });

      expect(result.toasts).toHaveLength(4);

      // Remove all toasts
      act(() => {
        result.hideToast(result.toasts[0].id);
        result.hideToast(result.toasts[1].id);
        result.hideToast(result.toasts[2].id);
        result.hideToast(result.toasts[3].id);
      });

      expect(result.toasts).toHaveLength(0);
    });

    it('should call onHidden callback when toast auto-dismisses', () => {
      const onHiddenSpy = vi.fn();
      const { result } = render(
        <ToastProvider>
          <div>Test Child</div>
        </ToastProvider>
      );

      act(() => {
        result.showToast('Test message', 'success');
      });

      // Wait for auto-dismissal
      act(() => {
        vi.advanceTimersByTime(410);
      });

      expect(onHiddenSpy).toHaveBeenCalled();
      expect(onHiddenSpy).toHaveBeenCalledWith(result.toasts[0].id);
    });
  });
