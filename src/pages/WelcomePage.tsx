/**
 * Welcome Page Component
 *
 * Landing page for unauthenticated users.
 * Explains the app and provides authentication (Google OAuth via Supabase or email/password).
 * Tasks 7.6-7.10: Hero section, features, CTA
 * Updated for Supabase migration - data now stored in Supabase database
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initAuth, login, isAuthenticated } from '../services/auth';
import { parseError, formatErrorMessage, logError } from '../utils/errorHandler';
import './WelcomePage.css';

export const WelcomePage = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth on component mount
    const init = async () => {
      try {
        await initAuth();
        setAuthInitialized(true);

        // Check if already authenticated
        if (isAuthenticated()) {
          navigate('/daily-log');
        }
      } catch (err) {
        logError('WelcomePage:init', err);
        const appError = parseError(err);
        setError(formatErrorMessage(appError));
      }
    };

    init();
  }, [navigate]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      // Initiate Google OAuth via Supabase
      // Note: This will redirect to Google's consent screen
      // After successful auth, user will be redirected back to /daily-log
      await login();

      // The login() function redirects to Google OAuth
      // When user returns, they'll land on /daily-log automatically
      // No need to manually navigate - Supabase handles the redirect
    } catch (err) {
      logError('WelcomePage:login', err);
      const appError = parseError(err);
      setError(formatErrorMessage(appError));
      setLoading(false);
    }
  };

  return (
    <div className="welcome-page">
      <div className="welcome-container">
        {/* Hero Section - Tasks 7.7-7.9 */}
        <header className="welcome-hero">
          <h1 className="welcome-title">Track Your Habits, Simply</h1>
          <p className="welcome-subtitle">
            A minimal habit tracker that puts you in control of your data
          </p>
        </header>

        {/* Key Features - Task 7.7 */}
        <section className="welcome-features">
          <div className="welcome-feature">
            <div className="welcome-feature-icon" aria-hidden="true">📊</div>
            <h2 className="welcome-feature-title">Track Daily Habits</h2>
            <p className="welcome-feature-description">
              Simple toggle switches to log your habits. Add notes to track your progress and patterns.
            </p>
          </div>

          <div className="welcome-feature">
            <div className="welcome-feature-icon" aria-hidden="true">🔒</div>
            <h2 className="welcome-feature-title">Your Data, Your Control</h2>
            <p className="welcome-feature-description">
              <strong>Secure cloud storage with Supabase.</strong> Your data is protected with row-level security and encrypted at rest.
            </p>
          </div>

          <div className="welcome-feature">
            <div className="welcome-feature-icon" aria-hidden="true">📱</div>
            <h2 className="welcome-feature-title">Works Offline</h2>
            <p className="welcome-feature-description">
              Progressive web app that works offline. Changes sync automatically when you're back online.
            </p>
          </div>

          <div className="welcome-feature">
            <div className="welcome-feature-icon" aria-hidden="true">📈</div>
            <h2 className="welcome-feature-title">Insights & Analytics</h2>
            <p className="welcome-feature-description">
              View streaks, completion percentages, and discover patterns in your notes with sentiment analysis.
            </p>
          </div>
        </section>

        {/* Call to Action - Task 7.10 */}
        <section className="welcome-cta">
          <button
            onClick={handleLogin}
            disabled={loading || !authInitialized}
            className="welcome-button"
            aria-label="Sign in with Google to start tracking habits"
          >
            {loading ? 'Setting up your account...' : 'Log in with Google'}
          </button>

          {error && (
            <p className="welcome-error" role="alert">
              {error}
            </p>
          )}

          <p className="welcome-privacy-note">
            Sign in with Google or create an account with email. Your habit data is private and secure.
          </p>
        </section>

        {/* Benefits Section - Task 7.8 */}
        <section className="welcome-benefits">
          <h2 className="welcome-benefits-title">Why Habit Tracker?</h2>
          <ul className="welcome-benefits-list">
            <li>✓ Quick sign in with Google or email</li>
            <li>✓ Completely free and open source</li>
            <li>✓ Mobile-first design optimized for daily use</li>
            <li>✓ Back-date up to 5 days if you miss a log</li>
            <li>✓ Secure cloud sync across all your devices</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
