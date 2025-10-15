/**
 * ErrorMessage Component Tests
 *
 * Tests for consistent error display with different types and retry functionality.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorMessage, { ErrorType } from './ErrorMessage';

describe('ErrorMessage', () => {
  describe('Basic Rendering', () => {
    it('should render error message with text', () => {
      render(
        <ErrorMessage
          type="general"
          message="Something went wrong"
        />
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should have role="alert" for accessibility', () => {
      const { container } = render(
        <ErrorMessage type="general" message="Test error" />
      );

      const alert = container.querySelector('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it('should render with proper CSS class structure', () => {
      const { container } = render(
        <ErrorMessage type="sync" message="Sync failed" />
      );

      expect(container.querySelector('.error-message')).toBeInTheDocument();
      expect(container.querySelector('.error-message--sync')).toBeInTheDocument();
      expect(container.querySelector('.error-message-content')).toBeInTheDocument();
      expect(container.querySelector('.error-message-header')).toBeInTheDocument();
      expect(container.querySelector('.error-message-icon')).toBeInTheDocument();
      expect(container.querySelector('.error-message-title')).toBeInTheDocument();
      expect(container.querySelector('.error-message-text')).toBeInTheDocument();
      expect(container.querySelector('.error-message-actions')).toBeInTheDocument();
    });
  });

  describe('Error Types', () => {
    it('should render authentication error with correct icon and title', () => {
      const { container } = render(
        <ErrorMessage type="auth" message="Login failed" />
      );

      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      const icon = container.querySelector('.error-message-icon');
      expect(icon).toHaveTextContent('🔒');
      expect(icon).toHaveAttribute('aria-hidden', 'true');

      const errorDiv = container.querySelector('.error-message--auth');
      expect(errorDiv).toBeInTheDocument();
    });

    it('should render sync error with correct icon and title', () => {
      const { container } = render(
        <ErrorMessage type="sync" message="Sync failed" />
      );

      expect(screen.getByText('Sync Error')).toBeInTheDocument();
      const icon = container.querySelector('.error-message-icon');
      expect(icon).toHaveTextContent('⚠️');

      const errorDiv = container.querySelector('.error-message--sync');
      expect(errorDiv).toBeInTheDocument();
    });

    it('should render validation error with correct icon and title', () => {
      const { container } = render(
        <ErrorMessage type="validation" message="Invalid input" />
      );

      expect(screen.getByText('Validation Error')).toBeInTheDocument();
      const icon = container.querySelector('.error-message-icon');
      expect(icon).toHaveTextContent('⚠');

      const errorDiv = container.querySelector('.error-message--validation');
      expect(errorDiv).toBeInTheDocument();
    });

    it('should render general error with correct icon and title', () => {
      const { container } = render(
        <ErrorMessage type="general" message="An error occurred" />
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
      const icon = container.querySelector('.error-message-icon');
      expect(icon).toHaveTextContent('❌');

      const errorDiv = container.querySelector('.error-message--general');
      expect(errorDiv).toBeInTheDocument();
    });

    it('should apply type-specific CSS class for styling', () => {
      const types: ErrorType[] = ['auth', 'sync', 'validation', 'general'];

      types.forEach(type => {
        const { container } = render(
          <ErrorMessage type={type} message="Test" />
        );

        expect(container.querySelector(`.error-message--${type}`)).toBeInTheDocument();
      });
    });
  });

  describe('Retry Functionality', () => {
    it('should render retry button when onRetry provided', () => {
      const onRetry = vi.fn();
      render(
        <ErrorMessage
          type="sync"
          message="Failed to sync"
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveClass('error-message-button--retry');
    });

    it('should call onRetry when retry button clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();

      render(
        <ErrorMessage
          type="sync"
          message="Sync failed"
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should not render retry button when onRetry not provided', () => {
      render(
        <ErrorMessage type="general" message="Error message" />
      );

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should have accessible aria-label on retry button', () => {
      const onRetry = vi.fn();
      render(
        <ErrorMessage
          type="auth"
          message="Auth failed"
          onRetry={onRetry}
        />
      );

      const retryButton = screen.getByRole('button', { name: /retry action/i });
      expect(retryButton).toHaveAttribute('aria-label', 'Retry action');
    });
  });

  describe('Dismiss Functionality', () => {
    it('should render dismiss button when onDismiss provided', () => {
      const onDismiss = vi.fn();
      render(
        <ErrorMessage
          type="validation"
          message="Invalid data"
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      expect(dismissButton).toBeInTheDocument();
      expect(dismissButton).toHaveClass('error-message-button--dismiss');
    });

    it('should call onDismiss when dismiss button clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();

      render(
        <ErrorMessage
          type="general"
          message="Error occurred"
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not render dismiss button when onDismiss not provided', () => {
      render(
        <ErrorMessage type="general" message="Error message" />
      );

      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });

    it('should have accessible aria-label on dismiss button', () => {
      const onDismiss = vi.fn();
      render(
        <ErrorMessage
          type="sync"
          message="Sync error"
          onDismiss={onDismiss}
        />
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss error message/i });
      expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss error message');
    });
  });

  describe('Multiple Actions', () => {
    it('should render both retry and dismiss buttons when both provided', () => {
      const onRetry = vi.fn();
      const onDismiss = vi.fn();

      render(
        <ErrorMessage
          type="sync"
          message="Sync failed"
          onRetry={onRetry}
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should call correct handler for each button', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      const onDismiss = vi.fn();

      render(
        <ErrorMessage
          type="auth"
          message="Authentication failed"
          onRetry={onRetry}
          onDismiss={onDismiss}
        />
      );

      // Click retry
      await user.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onDismiss).not.toHaveBeenCalled();

      // Click dismiss
      await user.click(screen.getByRole('button', { name: /dismiss/i }));
      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should not render action buttons when neither handler provided', () => {
      render(
        <ErrorMessage type="general" message="Error" />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should mark icon as decorative with aria-hidden', () => {
      const { container } = render(
        <ErrorMessage type="sync" message="Sync error" />
      );

      const icon = container.querySelector('.error-message-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have role="alert" for screen readers', () => {
      render(
        <ErrorMessage type="auth" message="Login failed" />
      );

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      const onRetry = vi.fn();
      const onDismiss = vi.fn();

      render(
        <ErrorMessage
          type="general"
          message="Error"
          onRetry={onRetry}
          onDismiss={onDismiss}
        />
      );

      expect(screen.getByLabelText('Retry action')).toBeInTheDocument();
      expect(screen.getByLabelText('Dismiss error message')).toBeInTheDocument();
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should render authentication error with retry', () => {
      const handleRetry = vi.fn();
      render(
        <ErrorMessage
          type="auth"
          message="Failed to authenticate with Google. Please try again."
          onRetry={handleRetry}
        />
      );

      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to authenticate with Google/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should render sync error with retry and dismiss', () => {
      const handleRetry = vi.fn();
      const handleDismiss = vi.fn();

      render(
        <ErrorMessage
          type="sync"
          message="Unable to sync your data. Check your internet connection."
          onRetry={handleRetry}
          onDismiss={handleDismiss}
        />
      );

      expect(screen.getByText('Sync Error')).toBeInTheDocument();
      expect(screen.getByText(/Unable to sync your data/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should render validation error without actions', () => {
      render(
        <ErrorMessage
          type="validation"
          message="Habit name must be between 1 and 100 characters."
        />
      );

      expect(screen.getByText('Validation Error')).toBeInTheDocument();
      expect(screen.getByText(/Habit name must be between/)).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should render general error with dismiss only', () => {
      const handleDismiss = vi.fn();

      render(
        <ErrorMessage
          type="general"
          message="An unexpected error occurred. Please refresh the page."
          onDismiss={handleDismiss}
        />
      );

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should display long error messages correctly', () => {
      const longMessage = 'This is a very long error message that explains in detail what went wrong and provides helpful context to the user about how they might resolve the issue. It should wrap appropriately and remain readable.';

      render(
        <ErrorMessage
          type="general"
          message={longMessage}
        />
      );

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});
