import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DemoBanner.css';

/**
 * DemoBanner Component
 *
 * Displays a persistent banner at the top of protected routes when in demo mode.
 * Reminds users they're trying the app and provides quick access to sign-in.
 *
 * Design:
 * - Sticky positioning (stays visible during scroll)
 * - Purple/blue gradient background
 * - Accessible with ARIA labels and WCAG AA contrast
 * - Mobile-responsive with full-width CTA on small screens
 */
export const DemoBanner: React.FC = () => {
  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate('/');
  };

  return (
    <div
      className="demo-banner"
      role="alert"
      aria-live="polite"
    >
      <div className="demo-banner-content">
        <span className="demo-banner-icon" aria-hidden="true">📍</span>
        <span className="demo-banner-text">
          You're trying Habit Tracker. Sign in to sync across devices.
        </span>
        <button
          className="demo-banner-button"
          onClick={handleSignInClick}
          aria-label="Sign in to save your progress"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
