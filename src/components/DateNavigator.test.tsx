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

  it('should render today button', () => {
    render(<DateNavigator {...defaultProps} />);

    const todayButton = screen.getByLabelText('Go to today');
    expect(todayButton).toBeInTheDocument();
  });

  it('should disable today button when already on today', () => {
    render(<DateNavigator {...defaultProps} currentDate={today} />);

    const todayButton = screen.getByLabelText('Go to today');
    expect(todayButton).toBeDisabled();
  });

  it('should enable today button when not on today', () => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    render(<DateNavigator {...defaultProps} currentDate={yesterday} />);

    const todayButton = screen.getByLabelText('Go to today');
    expect(todayButton).not.toBeDisabled();
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

  it('should call onDateChange when today button clicked', async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    render(<DateNavigator {...defaultProps} currentDate={threeDaysAgo} onDateChange={onDateChange} />);

    const todayButton = screen.getByLabelText('Go to today');
    await user.click(todayButton);

    expect(onDateChange).toHaveBeenCalledTimes(1);
    const newDate = onDateChange.mock.calls[0][0];
    // Should be today's date at midnight
    expect(newDate.getHours()).toBe(0);
    expect(newDate.getMinutes()).toBe(0);
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
    render(<DateNavigator {...defaultProps} disabled={true} />);

    const prevButton = screen.getByLabelText('Go to previous day');
    const todayButton = screen.getByLabelText('Go to today');

    expect(prevButton).toBeDisabled();
    expect(todayButton).toBeDisabled();
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
    render(<DateNavigator {...defaultProps} />);

    const prevButton = screen.getByLabelText('Go to previous day');
    const todayButton = screen.getByLabelText('Go to today');

    // Check that buttons have classes which apply CSS variables for min dimensions
    // The actual CSS variable value (44px) is defined in main.css
    expect(prevButton).toHaveClass('date-navigator__btn');
    expect(todayButton).toHaveClass('date-navigator__btn');
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

    // Tab to today button
    await user.tab();
    expect(screen.getByLabelText('Go to today')).toHaveFocus();

    // Activate with Enter
    await user.keyboard('{Enter}');
    expect(onDateChange).toHaveBeenCalled();
  });
});
