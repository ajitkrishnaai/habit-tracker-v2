/**
 * Tests for UserInfo Component
 *
 * Tests user information display and sign-out functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserInfo } from './UserInfo';
import * as auth from '../services/auth';

// Mock the auth service
vi.mock('../services/auth', () => ({
  getUserProfile: vi.fn(),
  logout: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('UserInfo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when user is not authenticated', () => {
    vi.mocked(auth.getUserProfile).mockReturnValue(null);
    const { container } = render(<UserInfo />);
    expect(container).toBeEmptyDOMElement();
  });

  it('displays user email when authenticated', () => {
    vi.mocked(auth.getUserProfile).mockReturnValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });

    render(
      <BrowserRouter>
        <UserInfo />
      </BrowserRouter>
    );

    expect(screen.getByText(/logged in as/i)).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('displays sign out button when authenticated', () => {
    vi.mocked(auth.getUserProfile).mockReturnValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });

    render(
      <BrowserRouter>
        <UserInfo />
      </BrowserRouter>
    );

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
    expect(signOutButton).toHaveTextContent('sign out');
  });

  it('calls logout and navigates to home on sign out click', async () => {
    vi.mocked(auth.getUserProfile).mockReturnValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });
    vi.mocked(auth.logout).mockResolvedValue();

    render(
      <BrowserRouter>
        <UserInfo />
      </BrowserRouter>
    );

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    // Wait for async operations
    await waitFor(() => {
      expect(auth.logout).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('shows loading state during sign out', async () => {
    vi.mocked(auth.getUserProfile).mockReturnValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });

    // Make logout take some time
    vi.mocked(auth.logout).mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <BrowserRouter>
        <UserInfo />
      </BrowserRouter>
    );

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    // Should show loading state
    expect(signOutButton).toHaveTextContent('signing out...');
    expect(signOutButton).toBeDisabled();

    // Wait for logout to complete
    await waitFor(() => {
      expect(auth.logout).toHaveBeenCalled();
    });
  });

  it('handles logout error gracefully', async () => {
    vi.mocked(auth.getUserProfile).mockReturnValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });

    const logoutError = new Error('Logout failed');
    vi.mocked(auth.logout).mockRejectedValue(logoutError);

    // Mock console.error to avoid test output pollution
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <UserInfo />
      </BrowserRouter>
    );

    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[UserInfo] Sign out failed:',
        logoutError
      );
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to sign out. Please try again.');
    });

    // Should re-enable button after error
    expect(signOutButton).not.toBeDisabled();
    expect(signOutButton).toHaveTextContent('sign out');

    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('prevents double-click during logout', async () => {
    vi.mocked(auth.getUserProfile).mockReturnValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });

    vi.mocked(auth.logout).mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <BrowserRouter>
        <UserInfo />
      </BrowserRouter>
    );

    const signOutButton = screen.getByRole('button', { name: /sign out/i });

    // Click multiple times rapidly
    fireEvent.click(signOutButton);
    fireEvent.click(signOutButton);
    fireEvent.click(signOutButton);

    // Should only call logout once
    await waitFor(() => {
      expect(auth.logout).toHaveBeenCalledTimes(1);
    });
  });

  it('has proper accessibility attributes', () => {
    vi.mocked(auth.getUserProfile).mockReturnValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });

    render(
      <BrowserRouter>
        <UserInfo />
      </BrowserRouter>
    );

    // Check container has proper role and label
    const container = screen.getByRole('contentinfo', { name: /user information/i });
    expect(container).toBeInTheDocument();

    // Check button has aria-label
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toHaveAttribute('aria-label', 'Sign out');
  });
});
