/**
 * OfflineIndicator Component Tests
 *
 * Tests for offline banner that shows when offline and hides when online.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import OfflineIndicator from './OfflineIndicator';

describe('OfflineIndicator', () => {
  let onlineGetter: vi.SpyInstance;

  beforeEach(() => {
    // Mock navigator.onLine
    onlineGetter = vi.spyOn(navigator, 'onLine', 'get');
  });

  afterEach(() => {
    onlineGetter.mockRestore();
  });

  describe('Initial Render', () => {
    it('should not render when online', () => {
      onlineGetter.mockReturnValue(true);

      const { container } = render(<OfflineIndicator />);

      expect(container.querySelector('.offline-indicator')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should render when offline', () => {
      onlineGetter.mockReturnValue(false);

      const { container } = render(<OfflineIndicator />);

      expect(container.querySelector('.offline-indicator')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should respect initial navigator.onLine state', () => {
      onlineGetter.mockReturnValue(false);

      render(<OfflineIndicator />);

      expect(screen.getByText(/You're offline/)).toBeInTheDocument();
    });
  });

  describe('Offline State Display', () => {
    beforeEach(() => {
      onlineGetter.mockReturnValue(false);
    });

    it('should display offline message', () => {
      render(<OfflineIndicator />);

      expect(screen.getByText("You're offline. Changes will sync when you're back online.")).toBeInTheDocument();
    });

    it('should display offline icon', () => {
      const { container } = render(<OfflineIndicator />);

      const icon = container.querySelector('.offline-indicator-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('📡');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have role="alert" for accessibility', () => {
      render(<OfflineIndicator />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have aria-live="assertive" for immediate announcement', () => {
      const { container } = render(<OfflineIndicator />);

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<OfflineIndicator />);

      expect(container.querySelector('.offline-indicator')).toBeInTheDocument();
      expect(container.querySelector('.offline-indicator-content')).toBeInTheDocument();
      expect(container.querySelector('.offline-indicator-icon')).toBeInTheDocument();
      expect(container.querySelector('.offline-indicator-text')).toBeInTheDocument();
    });
  });

  describe('Online/Offline Events', () => {
    it('should show indicator when going offline', async () => {
      onlineGetter.mockReturnValue(true);

      render(<OfflineIndicator />);

      // Initially online - should not be visible
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Simulate going offline
      onlineGetter.mockReturnValue(false);
      window.dispatchEvent(new Event('offline'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should hide indicator when going online', async () => {
      onlineGetter.mockReturnValue(false);

      const { container } = render(<OfflineIndicator />);

      // Initially offline - should be visible
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Simulate going online
      onlineGetter.mockReturnValue(true);
      window.dispatchEvent(new Event('online'));

      await waitFor(() => {
        expect(container.querySelector('.offline-indicator')).not.toBeInTheDocument();
      });
    });

    it('should handle multiple offline/online transitions', async () => {
      onlineGetter.mockReturnValue(true);

      const { container } = render(<OfflineIndicator />);

      // Start online
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Go offline
      onlineGetter.mockReturnValue(false);
      window.dispatchEvent(new Event('offline'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Back online
      onlineGetter.mockReturnValue(true);
      window.dispatchEvent(new Event('online'));

      await waitFor(() => {
        expect(container.querySelector('.offline-indicator')).not.toBeInTheDocument();
      });

      // Offline again
      onlineGetter.mockReturnValue(false);
      window.dispatchEvent(new Event('offline'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Event Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      onlineGetter.mockReturnValue(true);

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<OfflineIndicator />);

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should add event listeners on mount', () => {
      onlineGetter.mockReturnValue(true);

      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      render(<OfflineIndicator />);

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should not leak memory after multiple mount/unmount cycles', () => {
      onlineGetter.mockReturnValue(true);

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount: unmount1 } = render(<OfflineIndicator />);
      unmount1();

      const { unmount: unmount2 } = render(<OfflineIndicator />);
      unmount2();

      const { unmount: unmount3 } = render(<OfflineIndicator />);
      unmount3();

      // Should have cleaned up 3 times
      expect(removeEventListenerSpy).toHaveBeenCalledTimes(6); // 2 listeners × 3 unmounts

      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      onlineGetter.mockReturnValue(false);
    });

    it('should have alert role for immediate attention', () => {
      render(<OfflineIndicator />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have assertive aria-live for critical information', () => {
      const { container } = render(<OfflineIndicator />);

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('should hide icon from screen readers', () => {
      const { container } = render(<OfflineIndicator />);

      const icon = container.querySelector('.offline-indicator-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should provide accessible text content', () => {
      render(<OfflineIndicator />);

      expect(screen.getByText(/You're offline/)).toBeInTheDocument();
      expect(screen.getByText(/Changes will sync when you're back online/)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    beforeEach(() => {
      onlineGetter.mockReturnValue(false);
    });

    it('should wrap content in container div', () => {
      const { container } = render(<OfflineIndicator />);

      const indicator = container.querySelector('.offline-indicator');
      const content = container.querySelector('.offline-indicator-content');

      expect(indicator).toBeInTheDocument();
      expect(content).toBeInTheDocument();
      expect(indicator?.contains(content)).toBe(true);
    });

    it('should render icon before text', () => {
      const { container } = render(<OfflineIndicator />);

      const content = container.querySelector('.offline-indicator-content');
      const children = Array.from(content?.children || []);

      // Icon should be first
      expect(children[0]).toHaveClass('offline-indicator-icon');
      // Text should be second
      expect(children[1]).toHaveClass('offline-indicator-text');
    });
  });

  describe('Real-World Usage', () => {
    it('should alert user when connection is lost', async () => {
      onlineGetter.mockReturnValue(true);

      render(<OfflineIndicator />);

      // User is working online
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Connection drops
      onlineGetter.mockReturnValue(false);
      window.dispatchEvent(new Event('offline'));

      // Banner appears
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/You're offline/)).toBeInTheDocument();
      });
    });

    it('should hide when connection restored', async () => {
      onlineGetter.mockReturnValue(false);

      const { container } = render(<OfflineIndicator />);

      // User is offline, banner is visible
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Connection restored
      onlineGetter.mockReturnValue(true);
      window.dispatchEvent(new Event('online'));

      // Banner disappears
      await waitFor(() => {
        expect(container.querySelector('.offline-indicator')).not.toBeInTheDocument();
      });
    });

    it('should inform user that changes will sync later', () => {
      onlineGetter.mockReturnValue(false);

      render(<OfflineIndicator />);

      expect(screen.getByText(/Changes will sync when you're back online/)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid connection changes', async () => {
      onlineGetter.mockReturnValue(true);

      const { container } = render(<OfflineIndicator />);

      // Rapid offline/online
      onlineGetter.mockReturnValue(false);
      window.dispatchEvent(new Event('offline'));

      onlineGetter.mockReturnValue(true);
      window.dispatchEvent(new Event('online'));

      await waitFor(() => {
        expect(container.querySelector('.offline-indicator')).not.toBeInTheDocument();
      });
    });

    it('should handle component mounted while offline', () => {
      onlineGetter.mockReturnValue(false);

      render(<OfflineIndicator />);

      // Should immediately show offline state
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should handle component mounted while online', () => {
      onlineGetter.mockReturnValue(true);

      render(<OfflineIndicator />);

      // Should not show anything
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should return null when online (no DOM elements)', () => {
      onlineGetter.mockReturnValue(true);

      const { container } = render(<OfflineIndicator />);

      expect(container.firstChild).toBeNull();
    });
  });
});
