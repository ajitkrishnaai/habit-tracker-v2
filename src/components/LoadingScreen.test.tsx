/**
 * LoadingScreen Component Tests
 * Task 2.1 - Test branded loading screen
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingScreen } from './LoadingScreen';

describe('LoadingScreen', () => {
  it('should render loading screen with default message', () => {
    render(<LoadingScreen />);

    // Check for default message
    expect(screen.getByText('Building your day...')).toBeInTheDocument();
  });

  it('should render loading screen with custom message', () => {
    render(<LoadingScreen message="Loading habits..." />);

    // Check for custom message
    expect(screen.getByText('Loading habits...')).toBeInTheDocument();
  });

  it('should render logo', () => {
    const { container } = render(<LoadingScreen />);

    // Check that logo container exists
    const logoContainer = container.querySelector('.loading-screen__logo');
    expect(logoContainer).toBeInTheDocument();
  });

  it('should apply pulse animation class', () => {
    const { container } = render(<LoadingScreen />);

    // Check that logo container has animation class
    const logoContainer = container.querySelector('.loading-screen__logo');
    expect(logoContainer).toHaveClass('loading-screen__logo');
  });

  it('should have warm gradient background', () => {
    const { container } = render(<LoadingScreen />);

    // Check that main container has loading-screen class
    const mainContainer = container.querySelector('.loading-screen');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('loading-screen');
  });

  it('should render with accessible structure', () => {
    const { container } = render(<LoadingScreen />);

    // Check that content is properly nested
    const content = container.querySelector('.loading-screen__content');
    expect(content).toBeInTheDocument();

    const message = content?.querySelector('.loading-message');
    expect(message).toBeInTheDocument();
  });
});
