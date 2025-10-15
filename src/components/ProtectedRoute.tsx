/**
 * Protected Route Component
 *
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to the welcome page.
 * Wraps authenticated content with Layout (Navigation + Footer)
 * Task 7.46: Uses LoadingSpinner for better loading states
 */

import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import Layout from './Layout';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component that checks authentication status
 * and redirects to welcome page if user is not authenticated
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

  // Redirect to welcome if not authenticated
  if (!authenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Render protected content wrapped in Layout
  return <Layout>{children}</Layout>;
};
