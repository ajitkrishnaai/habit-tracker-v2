/**
 * LoadingSpinner Component Tests
 *
 * Tests for loading spinner with different sizes and full-screen mode.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(<LoadingSpinner />);

      expect(container.querySelector('.loading-spinner-container')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should have role="status" for accessibility', () => {
      render(<LoadingSpinner />);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
    });

    it('should have aria-live="polite" for screen readers', () => {
      render(<LoadingSpinner />);

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should have sr-only text for screen readers', () => {
      const { container } = render(<LoadingSpinner />);

      const srOnly = container.querySelector('.sr-only');
      expect(srOnly).toBeInTheDocument();
      expect(srOnly).toHaveTextContent('Loading...');
    });

    it('should mark spinner as decorative with aria-hidden', () => {
      const { container } = render(<LoadingSpinner />);

      const spinner = container.querySelector('.loading-spinner');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Size Variants', () => {
    it('should render with small size', () => {
      const { container } = render(<LoadingSpinner size="small" />);

      const spinner = container.querySelector('.loading-spinner--small');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with medium size by default', () => {
      const { container } = render(<LoadingSpinner />);

      const spinner = container.querySelector('.loading-spinner--medium');
      expect(spinner).toBeInTheDocument();
    });

    it('should render with large size', () => {
      const { container } = render(<LoadingSpinner size="large" />);

      const spinner = container.querySelector('.loading-spinner--large');
      expect(spinner).toBeInTheDocument();
    });

    it('should apply only one size class', () => {
      const { container } = render(<LoadingSpinner size="small" />);

      const spinner = container.querySelector('.loading-spinner');
      expect(spinner).toHaveClass('loading-spinner--small');
      expect(spinner).not.toHaveClass('loading-spinner--medium');
      expect(spinner).not.toHaveClass('loading-spinner--large');
    });
  });

  describe('Custom Text', () => {
    it('should render custom loading text when provided', () => {
      render(<LoadingSpinner text="Loading your habits..." />);

      expect(screen.getByText('Loading your habits...')).toBeInTheDocument();
    });

    it('should not render text element when text not provided', () => {
      const { container } = render(<LoadingSpinner />);

      expect(container.querySelector('.loading-spinner-text')).not.toBeInTheDocument();
    });

    it('should render text with proper class', () => {
      const { container } = render(<LoadingSpinner text="Please wait" />);

      const text = container.querySelector('.loading-spinner-text');
      expect(text).toBeInTheDocument();
      expect(text?.tagName).toBe('P');
      expect(text).toHaveTextContent('Please wait');
    });

    it('should maintain screen reader text even with custom text', () => {
      const { container } = render(<LoadingSpinner text="Custom loading text" />);

      // Custom text visible
      expect(screen.getByText('Custom loading text')).toBeInTheDocument();

      // Screen reader text still present
      const srOnly = container.querySelector('.sr-only');
      expect(srOnly).toHaveTextContent('Loading...');
    });
  });

  describe('Full Screen Mode', () => {
    it('should render in inline mode by default', () => {
      const { container } = render(<LoadingSpinner />);

      const containerEl = container.querySelector('.loading-spinner-container');
      expect(containerEl).not.toHaveClass('loading-spinner-container--fullscreen');
    });

    it('should render in full screen mode when specified', () => {
      const { container } = render(<LoadingSpinner fullScreen={true} />);

      const containerEl = container.querySelector('.loading-spinner-container');
      expect(containerEl).toHaveClass('loading-spinner-container--fullscreen');
    });

    it('should apply both base and fullscreen classes', () => {
      const { container } = render(<LoadingSpinner fullScreen={true} />);

      const containerEl = container.querySelector('.loading-spinner-container');
      expect(containerEl).toHaveClass('loading-spinner-container');
      expect(containerEl).toHaveClass('loading-spinner-container--fullscreen');
    });

    it('should not apply fullscreen class when explicitly false', () => {
      const { container } = render(<LoadingSpinner fullScreen={false} />);

      const containerEl = container.querySelector('.loading-spinner-container');
      expect(containerEl).not.toHaveClass('loading-spinner-container--fullscreen');
    });
  });

  describe('Component Structure', () => {
    it('should have proper CSS class hierarchy', () => {
      const { container } = render(
        <LoadingSpinner size="large" text="Loading..." fullScreen={true} />
      );

      expect(container.querySelector('.loading-spinner-container')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-container--fullscreen')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner--large')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-text')).toBeInTheDocument();
      expect(container.querySelector('.sr-only')).toBeInTheDocument();
    });

    it('should render spinner before text', () => {
      const { container } = render(<LoadingSpinner text="Loading data" />);

      const statusDiv = container.querySelector('[role="status"]');
      const children = Array.from(statusDiv?.children || []);

      // Spinner should be first child
      expect(children[0]).toHaveClass('loading-spinner');
      // Text should be second
      expect(children[1]).toHaveClass('loading-spinner-text');
      // SR-only should be last
      expect(children[2]).toHaveClass('sr-only');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<LoadingSpinner />);

      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should provide screen reader text', () => {
      render(<LoadingSpinner />);

      // Screen reader users should hear "Loading..."
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should hide visual spinner from screen readers', () => {
      const { container } = render(<LoadingSpinner />);

      const spinner = container.querySelector('.loading-spinner');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('should be keyboard accessible (no interactive elements)', () => {
      const { container } = render(<LoadingSpinner />);

      // Should not have any interactive elements
      expect(container.querySelector('button')).not.toBeInTheDocument();
      expect(container.querySelector('input')).not.toBeInTheDocument();
      expect(container.querySelector('a')).not.toBeInTheDocument();
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should render as inline loading indicator', () => {
      const { container } = render(
        <LoadingSpinner size="small" text="Saving..." />
      );

      expect(container.querySelector('.loading-spinner--small')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-container--fullscreen')).not.toBeInTheDocument();
    });

    it('should render as full-screen loading overlay', () => {
      const { container } = render(
        <LoadingSpinner
          size="large"
          text="Loading your habits..."
          fullScreen={true}
        />
      );

      expect(container.querySelector('.loading-spinner--large')).toBeInTheDocument();
      expect(screen.getByText('Loading your habits...')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-container--fullscreen')).toBeInTheDocument();
    });

    it('should render minimal spinner without text', () => {
      const { container } = render(<LoadingSpinner size="medium" />);

      expect(container.querySelector('.loading-spinner--medium')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-text')).not.toBeInTheDocument();
      // But screen reader text should still be present
      expect(container.querySelector('.sr-only')).toHaveTextContent('Loading...');
    });

    it('should render for sync operation', () => {
      render(
        <LoadingSpinner
          size="small"
          text="Syncing with Google Sheets..."
        />
      );

      expect(screen.getByText('Syncing with Google Sheets...')).toBeInTheDocument();
    });

    it('should render for initial app load', () => {
      render(
        <LoadingSpinner
          size="large"
          text="Loading Habit Tracker..."
          fullScreen={true}
        />
      );

      expect(screen.getByText('Loading Habit Tracker...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('loading-spinner-container--fullscreen');
    });
  });

  describe('Props Combinations', () => {
    it('should work with all props provided', () => {
      const { container } = render(
        <LoadingSpinner
          size="large"
          text="Processing request..."
          fullScreen={true}
        />
      );

      expect(container.querySelector('.loading-spinner--large')).toBeInTheDocument();
      expect(screen.getByText('Processing request...')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-container--fullscreen')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should work with no optional props', () => {
      const { container } = render(<LoadingSpinner />);

      expect(container.querySelector('.loading-spinner--medium')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-text')).not.toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-container--fullscreen')).not.toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should work with only size specified', () => {
      const { container } = render(<LoadingSpinner size="small" />);

      expect(container.querySelector('.loading-spinner--small')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-text')).not.toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-container--fullscreen')).not.toBeInTheDocument();
    });

    it('should work with only text specified', () => {
      const { container } = render(<LoadingSpinner text="Please wait..." />);

      expect(container.querySelector('.loading-spinner--medium')).toBeInTheDocument();
      expect(screen.getByText('Please wait...')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-container--fullscreen')).not.toBeInTheDocument();
    });

    it('should work with only fullScreen specified', () => {
      const { container } = render(<LoadingSpinner fullScreen={true} />);

      expect(container.querySelector('.loading-spinner--medium')).toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-text')).not.toBeInTheDocument();
      expect(container.querySelector('.loading-spinner-container--fullscreen')).toBeInTheDocument();
    });
  });
});
