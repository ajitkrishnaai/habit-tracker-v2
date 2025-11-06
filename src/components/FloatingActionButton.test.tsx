/**
 * FloatingActionButton Component Tests
 * Task 1.20 - Test FAB renders and handles clicks
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FloatingActionButton } from './FloatingActionButton';

describe('FloatingActionButton', () => {
  it('renders FAB button', () => {
    const handleClick = vi.fn();
    render(<FloatingActionButton onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /add new habit/i });
    expect(button).toBeInTheDocument();
  });

  it('renders with custom aria-label', () => {
    const handleClick = vi.fn();
    render(
      <FloatingActionButton
        onClick={handleClick}
        aria-label="Create habit"
      />
    );

    const button = screen.getByRole('button', { name: /create habit/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<FloatingActionButton onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /add new habit/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders plus icon inside button', () => {
    const handleClick = vi.fn();
    render(<FloatingActionButton onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /add new habit/i });
    const svg = button.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('fab__icon');
  });

  it('has correct CSS class for styling', () => {
    const handleClick = vi.fn();
    render(<FloatingActionButton onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /add new habit/i });
    expect(button).toHaveClass('fab');
  });

  it('is keyboard accessible', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<FloatingActionButton onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /add new habit/i });

    // Focus the button
    await user.tab();
    expect(button).toHaveFocus();

    // Activate with Enter key
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Activate with Space key
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
