/**
 * Welcome Page Component
 *
 * Landing page for unauthenticated users.
 * Explains the app and provides Google OAuth login.
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: '#f9fafb',
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
      }}>
        {/* Hero Section */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#111827',
        }}>
          Habit Tracker
        </h1>

        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          marginBottom: '2rem',
        }}>
          Simple, private habit tracking with complete data ownership
        </p>

        {/* Key Features */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'left',
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#111827',
          }}>
            Why Use Habit Tracker?
          </h2>

          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}>
            <li style={{ marginBottom: '0.75rem', color: '#374151' }}>
              ✓ <strong>Your Data, Your Control</strong> - All data stored in YOUR Google Drive
            </li>
            <li style={{ marginBottom: '0.75rem', color: '#374151' }}>
              ✓ <strong>Works Offline</strong> - Track habits even without internet
            </li>
            <li style={{ marginBottom: '0.75rem', color: '#374151' }}>
              ✓ <strong>Track Progress</strong> - View streaks, completion rates, and insights
            </li>
            <li style={{ marginBottom: '0.75rem', color: '#374151' }}>
              ✓ <strong>Simple & Clean</strong> - Minimal design focused on what matters
            </li>
          </ul>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading || !authInitialized}
          style={{
            backgroundColor: loading || !authInitialized ? '#9ca3af' : '#2563eb',
            color: 'white',
            padding: '1rem 2rem',
            fontSize: '1.125rem',
            fontWeight: '600',
            borderRadius: '8px',
            border: 'none',
            cursor: loading || !authInitialized ? 'not-allowed' : 'pointer',
            width: '100%',
            maxWidth: '300px',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            if (!loading && authInitialized) {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }
          }}
          onMouseOut={(e) => {
            if (!loading && authInitialized) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
        >
          {loading ? 'Setting up your account...' : 'Log in with Google'}
        </button>

        {/* Error Message */}
        {error && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#991b1b',
            whiteSpace: 'pre-line',
            textAlign: 'left',
          }}>
            {error}
          </div>
        )}

        {/* Privacy Note */}
        <p style={{
          marginTop: '2rem',
          fontSize: '0.875rem',
          color: '#6b7280',
        }}>
          By logging in, you agree to our{' '}
          <a href="/terms" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            Privacy Policy
          </a>
        </p>

        <p style={{
          marginTop: '1rem',
          fontSize: '0.875rem',
          color: '#6b7280',
        }}>
          <strong>Data Privacy:</strong> This app only requests access to Google Sheets
          in your Drive. We never store your data on our servers.
        </p>
      </div>
    </div>
  );
};
