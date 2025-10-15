/**
 * Welcome Page Component
 *
 * Landing page for unauthenticated users.
 * Explains the app and provides Google OAuth login.
 * Tasks 7.6-7.10: Hero section, features, CTA with "All data stored in YOUR Google Drive" emphasis
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initAuth, login, isAuthenticated, getUserId } from '../services/auth';
import {
  initGoogleSheetsAPI,
  createNewSheet,
  initializeSheetStructure,
  writeMetadata,
} from '../services/googleSheets';
import { parseError, formatErrorMessage, logError } from '../utils/errorHandler';
import type { Metadata } from '../types/metadata';
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
      // Step 1: Authenticate with Google
      await login();

      // Step 2: Initialize Google Sheets API
      await initGoogleSheetsAPI();

      // Step 3: Create new habit tracker sheet
      const sheetName = `Habit Tracker - ${new Date().toLocaleDateString()}`;
      const sheetId = await createNewSheet(sheetName);

      // Step 4: Initialize sheet structure
      await initializeSheetStructure(sheetId);

      // Step 5: Write initial metadata
      const userId = getUserId();
      if (!userId) {
        throw new Error('Failed to get user ID');
      }

      const metadata: Metadata = {
        sheet_version: '1.0',
        last_sync: new Date().toISOString(),
        user_id: userId,
        sheet_id: sheetId,
      };

      await writeMetadata(sheetId, metadata);

      // Step 6: Store sheet ID in localStorage for future use
      localStorage.setItem('habitTrackerSheetId', sheetId);

      // Step 7: Navigate to daily log page
      navigate('/daily-log');
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
              {/* Task 7.9: Clearly state "All data stored in YOUR Google Drive" */}
              <strong>All data stored in YOUR Google Drive.</strong> No backend servers, no third-party databases.
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
            We only access files created by this app. Your existing Drive files remain private.
          </p>
        </section>

        {/* Benefits Section - Task 7.8 */}
        <section className="welcome-benefits">
          <h2 className="welcome-benefits-title">Why Habit Tracker?</h2>
          <ul className="welcome-benefits-list">
            <li>✓ No account creation required - just sign in with Google</li>
            <li>✓ Completely free and open source</li>
            <li>✓ Mobile-first design optimized for daily use</li>
            <li>✓ Back-date up to 5 days if you miss a log</li>
            <li>✓ Export your data anytime - it's just a Google Sheet</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
