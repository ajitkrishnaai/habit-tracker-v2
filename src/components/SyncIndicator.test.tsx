/**
 * SyncIndicator Component Tests
 *
 * Tests for sync status indicator with spinning icon, success checkmark, and error retry.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SyncIndicator from './SyncIndicator';

describe('SyncIndicator', () => {
  describe('Idle State', () => {
    it('should not render when status is idle', () => {
      const { container } = render(<SyncIndicator status="idle" />);

      expect(container.querySelector('.sync-indicator')).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should return null for idle status', () => {
      const { container } = render(<SyncIndicator status="idle" />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Syncing State', () => {
    it('should render syncing indicator with spinner', () => {
      const { container } = render(<SyncIndicator status="syncing" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(container.querySelector('.sync-indicator--syncing')).toBeInTheDocument();
      expect(container.querySelector('.sync-indicator-spinner')).toBeInTheDocument();
    });

    it('should display default syncing message', () => {
      render(<SyncIndicator status="syncing" />);

      expect(screen.getByText('Syncing...')).toBeInTheDocument();
    });

    it('should display custom syncing message', () => {
      render(<SyncIndicator status="syncing" message="Syncing your habits..." />);

      expect(screen.getByText('Syncing your habits...')).toBeInTheDocument();
    });

    it('should render spinning icon with proper accessibility', () => {
      const { container } = render(<SyncIndicator status="syncing" />);

      const spinner = container.querySelector('.sync-indicator-spinner');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
      expect(spinner).toHaveTextContent('⟳');
    });

    it('should not render retry button when syncing', () => {
      const onRetry = vi.fn();
      render(<SyncIndicator status="syncing" onRetry={onRetry} />);

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render success indicator with checkmark', () => {
      const { container } = render(<SyncIndicator status="success" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(container.querySelector('.sync-indicator--success')).toBeInTheDocument();
      expect(container.querySelector('.sync-indicator-icon--success')).toBeInTheDocument();
    });

    it('should display default success message', () => {
      render(<SyncIndicator status="success" />);

      expect(screen.getByText('Synced successfully')).toBeInTheDocument();
    });

    it('should display custom success message', () => {
      render(<SyncIndicator status="success" message="All changes saved!" />);

      expect(screen.getByText('All changes saved!')).toBeInTheDocument();
    });

    it('should render checkmark icon with proper accessibility', () => {
      const { container } = render(<SyncIndicator status="success" />);

      const icon = container.querySelector('.sync-indicator-icon--success');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveTextContent('✓');
    });

    it('should not render retry button when successful', () => {
      const onRetry = vi.fn();
      render(<SyncIndicator status="success" onRetry={onRetry} />);

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should render error indicator with warning icon', () => {
      const { container } = render(<SyncIndicator status="error" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(container.querySelector('.sync-indicator--error')).toBeInTheDocument();
      expect(container.querySelector('.sync-indicator-icon--error')).toBeInTheDocument();
    });

    it('should display default error message', () => {
      render(<SyncIndicator status="error" />);

      expect(screen.getByText('Sync failed')).toBeInTheDocument();
    });

    it('should display custom error message', () => {
      render(<SyncIndicator status="error" message="Unable to sync. Check connection." />);

      expect(screen.getByText('Unable to sync. Check connection.')).toBeInTheDocument();
    });

    it('should render warning icon with proper accessibility', () => {
      const { container } = render(<SyncIndicator status="error" />);

      const icon = container.querySelector('.sync-indicator-icon--error');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');
      expect(icon).toHaveTextContent('⚠');
    });

    it('should render retry button when onRetry provided', () => {
      const onRetry = vi.fn();
      render(<SyncIndicator status="error" onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry sync/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveClass('sync-indicator-retry');
    });

    it('should call onRetry when retry button clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(<SyncIndicator status="error" onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry sync/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should not render retry button when onRetry not provided', () => {
      render(<SyncIndicator status="error" />);

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should have accessible aria-label on retry button', () => {
      const onRetry = vi.fn();
      render(<SyncIndicator status="error" onRetry={onRetry} />);

      const retryButton = screen.getByRole('button', { name: /retry sync/i });
      expect(retryButton).toHaveAttribute('aria-label', 'Retry sync');
    });
  });

  describe('Accessibility', () => {
    it('should have role="status" for screen readers', () => {
      render(<SyncIndicator status="syncing" />);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
    });

    it('should have aria-live="polite" for non-intrusive updates', () => {
      render(<SyncIndicator status="success" />);

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should hide icons from screen readers', () => {
      const { container, rerender } = render(<SyncIndicator status="syncing" />);
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

      rerender(<SyncIndicator status="success" />);
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();

      rerender(<SyncIndicator status="error" />);
      expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    });

    it('should provide accessible text for all states', () => {
      const { rerender } = render(<SyncIndicator status="syncing" />);
      expect(screen.getByText(/syncing/i)).toBeInTheDocument();

      rerender(<SyncIndicator status="success" />);
      expect(screen.getByText(/synced successfully/i)).toBeInTheDocument();

      rerender(<SyncIndicator status="error" />);
      expect(screen.getByText(/sync failed/i)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should apply status-specific CSS class', () => {
      const { container, rerender } = render(<SyncIndicator status="syncing" />);
      expect(container.querySelector('.sync-indicator--syncing')).toBeInTheDocument();

      rerender(<SyncIndicator status="success" />);
      expect(container.querySelector('.sync-indicator--success')).toBeInTheDocument();

      rerender(<SyncIndicator status="error" />);
      expect(container.querySelector('.sync-indicator--error')).toBeInTheDocument();
    });

    it('should have proper CSS class hierarchy', () => {
      const { container } = render(<SyncIndicator status="syncing" />);

      expect(container.querySelector('.sync-indicator')).toBeInTheDocument();
      expect(container.querySelector('.sync-indicator-content')).toBeInTheDocument();
      expect(container.querySelector('.sync-indicator-text')).toBeInTheDocument();
    });

    it('should render icon/spinner before text', () => {
      const { container } = render(<SyncIndicator status="syncing" />);

      const content = container.querySelector('.sync-indicator-content');
      const children = Array.from(content?.children || []);

      // Spinner should be first
      expect(children[0]).toHaveClass('sync-indicator-spinner');
      // Text should be second
      expect(children[1]).toHaveClass('sync-indicator-text');
    });

    it('should render retry button after text in error state', () => {
      const onRetry = vi.fn();
      const { container } = render(
        <SyncIndicator status="error" onRetry={onRetry} />
      );

      const content = container.querySelector('.sync-indicator-content');
      const children = Array.from(content?.children || []);

      // Icon first, text second, button third
      expect(children[0]).toHaveClass('sync-indicator-icon--error');
      expect(children[1]).toHaveClass('sync-indicator-text');
      expect(children[2]).toHaveClass('sync-indicator-retry');
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should show syncing state during upload', () => {
      render(<SyncIndicator status="syncing" message="Uploading to Google Sheets..." />);

      expect(screen.getByText('Uploading to Google Sheets...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('sync-indicator--syncing');
    });

    it('should show success state after sync completes', () => {
      render(<SyncIndicator status="success" message="All habits synced" />);

      expect(screen.getByText('All habits synced')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('sync-indicator--success');
    });

    it('should show error state with retry when sync fails', async () => {
      const user = userEvent.setup();
      const handleRetry = vi.fn();

      render(
        <SyncIndicator
          status="error"
          message="Sync failed. Check your internet connection."
          onRetry={handleRetry}
        />
      );

      expect(screen.getByText(/Sync failed/)).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(handleRetry).toHaveBeenCalled();
    });

    it('should handle rapid state transitions', () => {
      const { rerender } = render(<SyncIndicator status="idle" />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();

      rerender(<SyncIndicator status="syncing" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/syncing/i)).toBeInTheDocument();

      rerender(<SyncIndicator status="success" />);
      expect(screen.getByText(/synced successfully/i)).toBeInTheDocument();

      rerender(<SyncIndicator status="idle" />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Props Combinations', () => {
    it('should work with all props for error state', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(
        <SyncIndicator
          status="error"
          message="Custom error message"
          onRetry={onRetry}
        />
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalled();
    });

    it('should work with minimal props', () => {
      const { container } = render(<SyncIndicator status="syncing" />);

      expect(container.querySelector('.sync-indicator--syncing')).toBeInTheDocument();
      expect(screen.getByText('Syncing...')).toBeInTheDocument();
    });

    it('should handle onRetry for non-error states gracefully', () => {
      const onRetry = vi.fn();

      // onRetry should be ignored for success state
      render(<SyncIndicator status="success" onRetry={onRetry} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();

      // onRetry should be ignored for syncing state
      render(<SyncIndicator status="syncing" onRetry={onRetry} />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
