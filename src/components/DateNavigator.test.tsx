/**
 * DateNavigator Component Tests
 *
 * Tests for date navigation functionality and UI states.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateNavigator } from './DateNavigator';

describe('DateNavigator', () => {
  // Use actual current date for tests
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const defaultProps = {
    currentDate: today,
    onDateChange: vi.fn(),
  };

  it('should render current date prominently', () => {
    render(<DateNavigator {...defaultProps} />);

    // Should contain "Today" in the date display area
    const dateDisplay = screen.getByText(/Today,/i);
    expect(dateDisplay).toBeInTheDocument();
  });

  it('should render previous day button', () => {
    render(<DateNavigator {...defaultProps} />);

    const prevButton = screen.getByLabelText('Go to previous day');
    expect(prevButton).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();
  });

  it('should render placeholder when viewing today (no next button)', () => {
    render(<DateNavigator {...defaultProps} />);

    // When viewing today, there should be no "next" button, just a placeholder for spacing
    expect(screen.queryByLabelText('Go to next day')).not.toBeInTheDocument();
    // The placeholder div should exist for layout purposes
    const placeholder = document.querySelector('.date-navigator__btn--placeholder');
    expect(placeholder).toBeInTheDocument();
  });

  it('should show next button when not viewing today', () => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    render(<DateNavigator {...defaultProps} currentDate={yesterday} />);

    // When viewing a past date, the next button should be visible
    const nextButton = screen.getByLabelText('Go to next day');
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).not.toBeDisabled();
  });

  it('should call onDateChange when next button clicked', async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    render(<DateNavigator {...defaultProps} currentDate={yesterday} onDateChange={onDateChange} />);

    const nextButton = screen.getByLabelText('Go to next day');
    await user.click(nextButton);

    expect(onDateChange).toHaveBeenCalledTimes(1);
    const newDate = onDateChange.mock.calls[0][0];
    // Should advance one day forward
    expect(newDate.getDate()).toBe(today.getDate());
  });

  it('should call onDateChange when previous button clicked', async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    render(<DateNavigator {...defaultProps} onDateChange={onDateChange} />);

    const prevButton = screen.getByLabelText('Go to previous day');
    await user.click(prevButton);

    expect(onDateChange).toHaveBeenCalledTimes(1);
    const newDate = onDateChange.mock.calls[0][0];
    // Should be one day before today
    expect(newDate.getDate()).toBe(today.getDate() - 1);
  });

  it('should advance day by day with next button', async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    render(<DateNavigator {...defaultProps} currentDate={threeDaysAgo} onDateChange={onDateChange} />);

    const nextButton = screen.getByLabelText('Go to next day');
    await user.click(nextButton);

    expect(onDateChange).toHaveBeenCalledTimes(1);
    const newDate = onDateChange.mock.calls[0][0];
    // Should advance by one day (from 3 days ago to 2 days ago)
    expect(newDate.getDate()).toBe(threeDaysAgo.getDate() + 1);
  });

  it('should disable previous button when at 5-day limit', () => {
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    render(<DateNavigator {...defaultProps} currentDate={fiveDaysAgo} />);

    const prevButton = screen.getByLabelText('Go to previous day');
    expect(prevButton).toBeDisabled();
  });

  it('should enable previous button when less than 5 days back', () => {
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    render(<DateNavigator {...defaultProps} currentDate={threeDaysAgo} />);

    const prevButton = screen.getByLabelText('Go to previous day');
    expect(prevButton).not.toBeDisabled();
  });

  it('should disable all buttons when disabled prop is true', () => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    render(<DateNavigator {...defaultProps} currentDate={yesterday} disabled={true} />);

    const prevButton = screen.getByLabelText('Go to previous day');
    const nextButton = screen.getByLabelText('Go to next day');

    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('should not call onDateChange when disabled', async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    render(<DateNavigator {...defaultProps} disabled={true} onDateChange={onDateChange} />);

    const prevButton = screen.getByLabelText('Go to previous day');
    await user.click(prevButton);

    expect(onDateChange).not.toHaveBeenCalled();
  });

  it('should display "Yesterday" for one day back', () => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    render(<DateNavigator {...defaultProps} currentDate={yesterday} />);

    expect(screen.getByText(/Yesterday/i)).toBeInTheDocument();
  });

  it('should display full date for dates more than one day back', () => {
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    render(<DateNavigator {...defaultProps} currentDate={threeDaysAgo} />);

    // Should show the year
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
  });

  it('should have minimum touch targets for buttons', () => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    render(<DateNavigator {...defaultProps} currentDate={yesterday} />);

    const prevButton = screen.getByLabelText('Go to previous day');
    const nextButton = screen.getByLabelText('Go to next day');

    // Check that buttons have classes which apply CSS variables for min dimensions
    // The actual CSS variable value (44px) is defined in main.css
    expect(prevButton).toHaveClass('date-navigator__btn');
    expect(nextButton).toHaveClass('date-navigator__btn');
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    render(<DateNavigator {...defaultProps} currentDate={threeDaysAgo} onDateChange={onDateChange} />);

    // Tab to previous button
    await user.tab();
    expect(screen.getByLabelText('Go to previous day')).toHaveFocus();

    // Tab to next button
    await user.tab();
    expect(screen.getByLabelText('Go to next day')).toHaveFocus();

    // Activate with Enter
    await user.keyboard('{Enter}');
    expect(onDateChange).toHaveBeenCalled();
  });
});
