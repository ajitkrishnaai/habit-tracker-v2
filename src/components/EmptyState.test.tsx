/**
 * EmptyState Component Tests
 *
 * Tests for the reusable empty state component with customizable messages and CTAs.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { EmptyState } from './EmptyState';

// Wrapper component to provide router context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('EmptyState', () => {
  describe('Basic Rendering', () => {
    it('should render with default icon when no props provided', () => {
      const { container } = render(<EmptyState />, { wrapper: Wrapper });

      const icon = container.querySelector('.empty-state-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent('📋');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render with custom icon', () => {
      const { container } = render(<EmptyState icon="🎯" />, { wrapper: Wrapper });

      const icon = container.querySelector('.empty-state-icon');
      expect(icon).toHaveTextContent('🎯');
    });

    it('should render with title', () => {
      render(<EmptyState title="No Habits Found" />, { wrapper: Wrapper });

      expect(screen.getByText('No Habits Found')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('No Habits Found');
    });

    it('should render with message', () => {
      render(
        <EmptyState message="Start tracking your daily habits by adding your first habit." />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText(/Start tracking your daily habits/)).toBeInTheDocument();
    });

    it('should render with both title and message', () => {
      render(
        <EmptyState
          title="No Habits Yet"
          message="Get started by creating your first habit."
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('No Habits Yet')).toBeInTheDocument();
      expect(screen.getByText(/Get started by creating/)).toBeInTheDocument();
    });

    it('should not render title when not provided', () => {
      const { container } = render(<EmptyState />, { wrapper: Wrapper });

      expect(container.querySelector('.empty-state-title')).not.toBeInTheDocument();
    });

    it('should not render message when not provided', () => {
      const { container } = render(<EmptyState />, { wrapper: Wrapper });

      expect(container.querySelector('.empty-state-message')).not.toBeInTheDocument();
    });
  });

  describe('Call-to-Action with Link', () => {
    it('should render link button when actionText and actionLink provided', () => {
      render(
        <EmptyState
          actionText="Add Your First Habit"
          actionLink="/manage-habits"
        />,
        { wrapper: Wrapper }
      );

      const link = screen.getByRole('link', { name: /add your first habit/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/manage-habits');
      expect(link).toHaveClass('empty-state-button');
    });

    it('should not render button when only actionText provided', () => {
      render(<EmptyState actionText="Click Me" />, { wrapper: Wrapper });

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not render button when only actionLink provided', () => {
      render(<EmptyState actionLink="/somewhere" />, { wrapper: Wrapper });

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Call-to-Action with onClick Handler', () => {
    it('should render button when actionText and onAction provided', () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          actionText="Refresh"
          onAction={onAction}
        />,
        { wrapper: Wrapper }
      );

      const button = screen.getByRole('button', { name: /refresh/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('empty-state-button');
    });

    it('should call onAction when button is clicked', async () => {
      const user = userEvent.setup();
      const onAction = vi.fn();
      render(
        <EmptyState
          actionText="Try Again"
          onAction={onAction}
        />,
        { wrapper: Wrapper }
      );

      const button = screen.getByRole('button', { name: /try again/i });
      await user.click(button);

      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('should prioritize actionLink over onAction when both provided', () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          actionText="Go Somewhere"
          actionLink="/target"
          onAction={onAction}
        />,
        { wrapper: Wrapper }
      );

      // Should render Link, not button
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have proper CSS classes', () => {
      const { container } = render(
        <EmptyState
          title="Test Title"
          message="Test Message"
          actionText="Test Action"
          actionLink="/test"
          icon="🧪"
        />,
        { wrapper: Wrapper }
      );

      expect(container.querySelector('.empty-state')).toBeInTheDocument();
      expect(container.querySelector('.empty-state-icon')).toBeInTheDocument();
      expect(container.querySelector('.empty-state-title')).toBeInTheDocument();
      expect(container.querySelector('.empty-state-message')).toBeInTheDocument();
      expect(container.querySelector('.empty-state-button')).toBeInTheDocument();
    });

    it('should render as a complete empty state with all props', () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          title="No Data Available"
          message="There's nothing to display right now."
          actionText="Load Data"
          onAction={onAction}
          icon="📊"
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
      expect(screen.getByText(/There's nothing to display/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /load data/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should mark icon as decorative with aria-hidden', () => {
      const { container } = render(<EmptyState icon="🎨" />, { wrapper: Wrapper });

      const icon = container.querySelector('.empty-state-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have accessible heading for title', () => {
      render(<EmptyState title="Empty State Title" />, { wrapper: Wrapper });

      const heading = screen.getByRole('heading', { level: 3, name: /empty state title/i });
      expect(heading).toBeInTheDocument();
    });

    it('should have accessible link when using actionLink', () => {
      render(
        <EmptyState
          actionText="Navigate Here"
          actionLink="/destination"
        />,
        { wrapper: Wrapper }
      );

      const link = screen.getByRole('link', { name: /navigate here/i });
      expect(link).toBeInTheDocument();
    });

    it('should have accessible button when using onAction', () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          actionText="Perform Action"
          onAction={onAction}
        />,
        { wrapper: Wrapper }
      );

      const button = screen.getByRole('button', { name: /perform action/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Real-World Usage Scenarios', () => {
    it('should render for empty habits list', () => {
      render(
        <EmptyState
          title="No Habits Yet"
          message="Start tracking your daily habits by adding your first habit."
          actionText="Add Habit"
          actionLink="/manage-habits"
          icon="📝"
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('No Habits Yet')).toBeInTheDocument();
      expect(screen.getByText(/Start tracking your daily habits/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /add habit/i })).toHaveAttribute('href', '/manage-habits');
    });

    it('should render for empty logs list', () => {
      render(
        <EmptyState
          title="No Logs Available"
          message="You haven't logged any habits yet. Mark your first habit as done!"
          icon="📅"
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('No Logs Available')).toBeInTheDocument();
      expect(screen.getByText(/You haven't logged any habits yet/)).toBeInTheDocument();
    });

    it('should render for sync error with retry', async () => {
      const user = userEvent.setup();
      const handleRetry = vi.fn();

      render(
        <EmptyState
          title="Sync Failed"
          message="Unable to sync your data. Please check your connection and try again."
          actionText="Retry Sync"
          onAction={handleRetry}
          icon="⚠️"
        />,
        { wrapper: Wrapper }
      );

      expect(screen.getByText('Sync Failed')).toBeInTheDocument();
      expect(screen.getByText(/Unable to sync your data/)).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /retry sync/i });
      await user.click(retryButton);

      expect(handleRetry).toHaveBeenCalledTimes(1);
    });

    it('should render minimal empty state with just icon', () => {
      const { container } = render(<EmptyState />, { wrapper: Wrapper });

      expect(container.querySelector('.empty-state')).toBeInTheDocument();
      expect(container.querySelector('.empty-state-icon')).toHaveTextContent('📋');
      expect(container.querySelector('.empty-state-title')).not.toBeInTheDocument();
      expect(container.querySelector('.empty-state-message')).not.toBeInTheDocument();
    });
  });
});
