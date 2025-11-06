/**
 * ToastContext Tests (Task 2.13)
 * Test global toast management functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

// Test component that uses the toast hook
const TestComponent = () => {
  const { showToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast('Test message', 'success', 1000)}>
        Show Toast
      </button>
      <button onClick={() => showToast('Error message', 'error', 1000)}>
        Show Error
      </button>
      <button onClick={() => showToast('Info message', 'info', 1000)}>
        Show Info
      </button>
    </div>
  );
};

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('ToastProvider', () => {
    it('should render children', () => {
      render(
        <ToastProvider>
          <div>Test Content</div>
        </ToastProvider>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should provide toast context to children', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      expect(screen.getByText('Show Toast')).toBeInTheDocument();
    });
  });

  describe('useToast hook', () => {
    it('should throw error when used outside ToastProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useToast must be used within a ToastProvider');

      consoleError.mockRestore();
    });

    it('should provide showToast function', () => {
      const { getByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      expect(getByText('Show Toast')).toBeInTheDocument();
    });
  });

  describe('showToast functionality', () => {
    it('should display toast when showToast is called', async () => {
      const { getByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = getByText('Show Toast');
      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('should display toast with success variant', async () => {
      const { getByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = getByText('Show Toast');
      act(() => {
        button.click();
      });

      await waitFor(() => {
        const toast = screen.getByText('Test message').closest('.toast');
        expect(toast).toHaveClass('toast--success');
      });
    });

    it('should display toast with error variant', async () => {
      const { getByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = getByText('Show Error');
      act(() => {
        button.click();
      });

      await waitFor(() => {
        const toast = screen.getByText('Error message').closest('.toast');
        expect(toast).toHaveClass('toast--error');
      });
    });

    it('should display toast with info variant', async () => {
      const { getByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = getByText('Show Info');
      act(() => {
        button.click();
      });

      await waitFor(() => {
        const toast = screen.getByText('Info message').closest('.toast');
        expect(toast).toHaveClass('toast--info');
      });
    });

    it('should auto-dismiss toast after duration', async () => {
      const { getByText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = getByText('Show Toast');
      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      // Fast-forward time by duration (1000ms)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });

    it('should dismiss toast when close button is clicked', async () => {
      const { getByText, getByLabelText } = render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      const button = getByText('Show Toast');
      act(() => {
        button.click();
      });

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });

      const closeButton = getByLabelText('Close notification');
      act(() => {
        closeButton.click();
      });

      await waitFor(() => {
        expect(screen.queryByText('Test message')).not.toBeInTheDocument();
      });
    });

    it('should limit visible toasts to 3 maximum', async () => {
      const MultiToastComponent = () => {
        const { showToast } = useToast();
        return (
          <button onClick={() => {
            showToast('Toast 1', 'success', 5000);
            showToast('Toast 2', 'success', 5000);
            showToast('Toast 3', 'success', 5000);
            showToast('Toast 4', 'success', 5000);
          }}>
            Show Multiple Toasts
          </button>
        );
      };

      const { getByText } = render(
        <ToastProvider>
          <MultiToastComponent />
        </ToastProvider>
      );

      const button = getByText('Show Multiple Toasts');
      act(() => {
        button.click();
      });

      await waitFor(() => {
        // Should only show 3 toasts (oldest removed)
        expect(screen.queryByText('Toast 1')).not.toBeInTheDocument();
        expect(screen.getByText('Toast 2')).toBeInTheDocument();
        expect(screen.getByText('Toast 3')).toBeInTheDocument();
        expect(screen.getByText('Toast 4')).toBeInTheDocument();
      });
    });
  });
});
