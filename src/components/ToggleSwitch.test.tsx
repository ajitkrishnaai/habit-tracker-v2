/**
 * ToggleSwitch Component Tests
 *
 * Tests for accessibility, keyboard navigation, and state management.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToggleSwitch } from './ToggleSwitch';

describe('ToggleSwitch', () => {
  const defaultProps = {
    id: 'test-toggle',
    label: 'Test Habit',
    checked: false,
    onChange: vi.fn(),
  };

  it('should render with correct ARIA attributes', () => {
    render(<ToggleSwitch {...defaultProps} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toHaveAttribute('aria-label', 'Test Habit');
  });

  it('should show checked state when checked prop is true', () => {
    render(<ToggleSwitch {...defaultProps} checked={true} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveClass('toggle-switch--on');
  });

  it('should show unchecked state when checked prop is false', () => {
    render(<ToggleSwitch {...defaultProps} checked={false} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toHaveClass('toggle-switch--off');
  });

  it('should call onChange with new value when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleSwitch {...defaultProps} onChange={onChange} />);

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should toggle from checked to unchecked when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleSwitch {...defaultProps} checked={true} onChange={onChange} />);

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('should be keyboard accessible with Space key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleSwitch {...defaultProps} onChange={onChange} />);

    const toggle = screen.getByRole('switch');
    toggle.focus();
    await user.keyboard(' ');

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should be keyboard accessible with Enter key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleSwitch {...defaultProps} onChange={onChange} />);

    const toggle = screen.getByRole('switch');
    toggle.focus();
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('should be focusable via tab navigation', async () => {
    const user = userEvent.setup();
    render(<ToggleSwitch {...defaultProps} />);

    await user.tab();

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveFocus();
  });

  it('should not call onChange when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ToggleSwitch {...defaultProps} disabled={true} onChange={onChange} />);

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should have disabled styling when disabled', () => {
    render(<ToggleSwitch {...defaultProps} disabled={true} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveClass('toggle-switch--disabled');
  });

  it('should provide screen reader text for state', () => {
    const { rerender } = render(<ToggleSwitch {...defaultProps} checked={false} />);

    expect(screen.getByText('Test Habit is not done')).toBeInTheDocument();

    rerender(<ToggleSwitch {...defaultProps} checked={true} />);

    expect(screen.getByText('Test Habit is done')).toBeInTheDocument();
  });

  it('should update local state when checked prop changes', () => {
    const { rerender } = render(<ToggleSwitch {...defaultProps} checked={false} />);

    let toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    rerender(<ToggleSwitch {...defaultProps} checked={true} />);

    toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('should have minimum touch target size set in CSS', () => {
    render(<ToggleSwitch {...defaultProps} />);

    const toggle = screen.getByRole('switch');

    // Check that toggle has the class which applies CSS variables for min dimensions
    // The actual CSS variable value (44px) is defined in main.css
    expect(toggle).toHaveClass('toggle-switch');
  });
});
