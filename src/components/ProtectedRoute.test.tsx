/**
 * ProtectedRoute Component Tests
 *
 * Tests authentication guard, redirects, loading states, and Layout wrapping.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import * as auth from '../services/auth';
import { demoModeService } from '../services/demoMode';

// Mock the auth service
vi.mock('../services/auth');

// Mock the demoMode service
vi.mock('../services/demoMode', () => ({
  demoModeService: {
    getDemoMetrics: vi.fn(() => null), // Default: no metrics
    initializeDemoMode: vi.fn(),
    shouldExpireDemo: vi.fn(() => false),
    clearDemoData: vi.fn(),
  },
}));

// Mock child components
vi.mock('./Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-layout">{children}</div>
  ),
}));

vi.mock('./LoadingSpinner', () => ({
  default: ({ text }: { text?: string }) => (
    <div data-testid="loading-spinner">{text || 'Loading...'}</div>
  ),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication Check', () => {
    it('should check authentication status on mount', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // After mounting, content should appear (useEffect runs synchronously in test)
      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should call isAuthenticated to check auth status', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(auth.isAuthenticated).toHaveBeenCalled();
      });
    });

    it('should check authentication on each route render', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(auth.isAuthenticated).toHaveBeenCalled();
      });
    });
  });

  describe('Authenticated User Flow', () => {
    it('should render children when user is authenticated', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should wrap authenticated content with Layout', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
      });
    });

    it('should render children inside Layout', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="content">Test Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        const layout = screen.getByTestId('mock-layout');
        const content = screen.getByTestId('content');
        expect(layout).toContainElement(content);
      });
    });

    it('should not show loading spinner after authentication check completes', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });
  });

  describe('Unauthenticated User Flow', () => {
    it('should allow access with auto-initialized demo metrics', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(false);
      // Simulate auto-initialization behavior
      vi.mocked(demoModeService.getDemoMetrics)
        .mockReturnValueOnce(null) // First call returns null
        .mockReturnValue({ // After initializeDemoMode, returns metrics
          demo_start_date: new Date().toISOString(),
          demo_habits_added: 0,
          demo_logs_completed: 0,
          demo_last_visit: new Date().toISOString(),
          demo_progress_visits: 0,
          demo_conversion_shown: false,
        });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/" element={<div data-testid="welcome-page">Welcome</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Should auto-initialize and show protected content
      await waitFor(() => {
        expect(demoModeService.initializeDemoMode).toHaveBeenCalled();
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should render children in demo mode after auto-init', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(false);
      vi.mocked(demoModeService.getDemoMetrics)
        .mockReturnValueOnce(null)
        .mockReturnValue({
          demo_start_date: new Date().toISOString(),
          demo_habits_added: 0,
          demo_logs_completed: 0,
          demo_last_visit: new Date().toISOString(),
          demo_progress_visits: 0,
          demo_conversion_shown: false,
        });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/" element={<div>Welcome</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="protected-content">Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should render Layout in demo mode after auto-init', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(false);
      vi.mocked(demoModeService.getDemoMetrics)
        .mockReturnValueOnce(null)
        .mockReturnValue({
          demo_start_date: new Date().toISOString(),
          demo_habits_added: 0,
          demo_logs_completed: 0,
          demo_last_visit: new Date().toISOString(),
          demo_progress_visits: 0,
          demo_conversion_shown: false,
        });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/" element={<div>Welcome</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
      });
    });

    it('should wrap demo mode content with Layout', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(false);
      vi.mocked(demoModeService.getDemoMetrics)
        .mockReturnValueOnce(null)
        .mockReturnValue({
          demo_start_date: new Date().toISOString(),
          demo_habits_added: 0,
          demo_logs_completed: 0,
          demo_last_visit: new Date().toISOString(),
          demo_progress_visits: 0,
          demo_conversion_shown: false,
        });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/" element={<div data-testid="welcome">Welcome</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="content">Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Should show protected content wrapped in Layout
      await waitFor(() => {
        const layout = screen.getByTestId('mock-layout');
        const content = screen.getByTestId('content');
        expect(layout).toContainElement(content);
      });
    });
  });

  describe('Loading State', () => {
    it('should eventually show content after auth check', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="content">Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Content should appear after auth check
      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument();
      });
    });
  });

  describe('Content Rendering', () => {
    it('should render string children', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={<ProtectedRoute>Simple text content</ProtectedRoute>}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Simple text content')).toBeInTheDocument();
      });
    });

    it('should render multiple children', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="child-1">Child 1</div>
                  <div data-testid="child-2">Child 2</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('child-1')).toBeInTheDocument();
        expect(screen.getByTestId('child-2')).toBeInTheDocument();
      });
    });

    it('should render nested components', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      const NestedComponent = () => (
        <div data-testid="nested">
          <h1>Title</h1>
          <p>Paragraph</p>
        </div>
      );

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <NestedComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('nested')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /title/i })).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children gracefully when authenticated', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      const { container } = render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route
              path="/protected"
              element={<ProtectedRoute>{null}</ProtectedRoute>}
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-layout')).toBeInTheDocument();
      });

      expect(container).toBeInTheDocument();
    });

    it('should handle unauthenticated state with auto-init correctly', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(false);
      vi.mocked(demoModeService.getDemoMetrics)
        .mockReturnValueOnce(null)
        .mockReturnValue({
          demo_start_date: new Date().toISOString(),
          demo_habits_added: 0,
          demo_logs_completed: 0,
          demo_last_visit: new Date().toISOString(),
          demo_progress_visits: 0,
          demo_conversion_shown: false,
        });

      render(
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/" element={<div data-testid="welcome">Welcome</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div data-testid="content">Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      // Should auto-initialize and show content in demo mode
      await waitFor(() => {
        expect(screen.getByTestId('content')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('welcome')).not.toBeInTheDocument();
    });
  });

  describe('Integration with Router', () => {
    it('should preserve route parameters when authenticated', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/user/123']}>
          <Routes>
            <Route
              path="/user/:id"
              element={
                <ProtectedRoute>
                  <div data-testid="user-page">User Page</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-page')).toBeInTheDocument();
      });
    });

    it('should work with nested routes', async () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/app/settings']}>
          <Routes>
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route
                      path="settings"
                      element={<div data-testid="settings">Settings</div>}
                    />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('settings')).toBeInTheDocument();
      });
    });
  });
});
