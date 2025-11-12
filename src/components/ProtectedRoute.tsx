/**
 * Protected Route Component
 *
 * Wraps routes that require authentication OR demo mode.
 * Redirects unauthenticated users (not in demo mode) to the welcome page.
 * Wraps authenticated content with Layout (Navigation + Footer)
 * Task 7.46: Uses LoadingSpinner for better loading states
 * Task 4.1: Allows demo mode access and handles expiry
 */

import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import { demoModeService } from '../services/demoMode';
import Layout from './Layout';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component that checks authentication status OR demo mode
 * and redirects to welcome page if user is neither authenticated nor in demo mode
 * Also handles demo data expiry (7 days)
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      setChecking(false);
    };

    checkAuth();
  }, [location]);

  // Show loading state while checking - Task 7.46
  if (checking) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  // Get demo metrics to check if user is in demo mode
  let demoMetrics = demoModeService.getDemoMetrics();

  // Auto-initialize demo metrics for unauthenticated users (Task 2.1)
  // This ensures all unauthenticated users have tracking metrics, not just those
  // who clicked "Begin Your Practice" on the welcome page
  if (!authenticated && !demoMetrics) {
    console.log('[ProtectedRoute] Auto-initializing demo mode for unauthenticated user');
    demoModeService.initializeDemoMode();
    demoMetrics = demoModeService.getDemoMetrics(); // Refresh after initialization
  }

  // This should never happen after auto-initialization, but keeping as safety check
  if (!authenticated && !demoMetrics) {
    console.error('[ProtectedRoute] Failed to initialize demo mode, redirecting to welcome');
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Check for demo expiry (7 days) - Task 4.1 (REQ-39 to REQ-41)
  if (!authenticated && demoModeService.shouldExpireDemo()) {
    console.log('[ProtectedRoute] Demo data expired, clearing and redirecting');
    demoModeService.clearDemoData();
    return <Navigate to="/" replace />;
  }

  // Render protected content wrapped in Layout
  return <Layout>{children}</Layout>;
};
