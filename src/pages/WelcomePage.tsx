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
import { initAuth, loginWithEmail, signUpWithEmail, isAuthenticated } from '../services/auth';
import { parseError, formatErrorMessage, logError } from '../utils/errorHandler';
import './WelcomePage.css';

export const WelcomePage = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Sign up with email/password
        await signUpWithEmail(email, password, name);
      } else {
        // Login with email/password
        await loginWithEmail(email, password);
      }

      // Navigate to daily log on successful auth
      navigate('/daily-log');
    } catch (err: any) {
      logError(`WelcomePage:${isSignUp ? 'signup' : 'login'}`, err);

      // Provide user-friendly error messages
      let errorMsg = err.message || 'Authentication failed';
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'Invalid email or password. Please try again.';
      } else if (errorMsg.includes('Email not confirmed')) {
        errorMsg = 'Please check your email and confirm your account before logging in.';
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = 'This email is already registered. Please log in instead.';
      }

      setError(errorMsg);
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
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

        {/* Call to Action - Email/Password Auth */}
        <section className="welcome-cta">
          <h2 className="welcome-auth-title">
            {isSignUp ? 'Create Your Account' : 'Sign In'}
          </h2>

          <form onSubmit={handleSubmit} className="welcome-form">
            {isSignUp && (
              <div className="welcome-form-field">
                <label htmlFor="name" className="welcome-label">
                  Name (optional)
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="welcome-input"
                  placeholder="Your name"
                  disabled={loading || !authInitialized}
                />
              </div>
            )}

            <div className="welcome-form-field">
              <label htmlFor="email" className="welcome-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="welcome-input"
                placeholder="your.email@example.com"
                required
                disabled={loading || !authInitialized}
                autoComplete="email"
              />
            </div>

            <div className="welcome-form-field">
              <label htmlFor="password" className="welcome-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="welcome-input"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={loading || !authInitialized}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              {isSignUp && (
                <p className="welcome-input-hint">
                  Minimum 6 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !authInitialized}
              className="welcome-button"
              aria-label={isSignUp ? 'Create account and start tracking habits' : 'Sign in to your account'}
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            {error && (
              <p className="welcome-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={toggleMode}
              className="welcome-toggle-mode"
              disabled={loading}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </form>

          <p className="welcome-privacy-note">
            Your habit data is private and secure. We use industry-standard encryption.
          </p>
        </section>

        {/* Benefits Section - Task 7.8 */}
        <section className="welcome-benefits">
          <h2 className="welcome-benefits-title">Why Habit Tracker?</h2>
          <ul className="welcome-benefits-list">
            <li>✓ Simple email/password authentication</li>
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
