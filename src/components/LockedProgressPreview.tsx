import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LockedProgressPreview.css';

/**
 * LockedProgressPreview Component
 *
 * Displays a locked preview of progress analytics for demo users.
 * Shows a blurred fake chart to create curiosity and encourage sign-up.
 *
 * Features:
 * - Blurred background with animated fake chart bars
 * - Centered content card with feature list
 * - Sign-in CTA button
 * - Accessible and mobile-responsive
 */
export const LockedProgressPreview: React.FC = () => {
  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate('/');
  };

  return (
    <div className="locked-progress-wrapper">
      {/* Blurred background with fake chart */}
      <div className="locked-progress-background" aria-hidden="true">
        <div className="fake-chart">
          <div className="fake-chart-bar" style={{ height: '40%' }}></div>
          <div className="fake-chart-bar" style={{ height: '60%' }}></div>
          <div className="fake-chart-bar" style={{ height: '80%' }}></div>
          <div className="fake-chart-bar" style={{ height: '100%' }}></div>
          <div className="fake-chart-bar" style={{ height: '85%' }}></div>
          <div className="fake-chart-bar" style={{ height: '90%' }}></div>
          <div className="fake-chart-bar" style={{ height: '100%' }}></div>
        </div>
      </div>

      {/* Centered content card */}
      <div className="locked-progress-content">
        {/* Lock icon */}
        <div className="locked-progress-icon" aria-hidden="true">🔒</div>

        {/* Title */}
        <h2 className="locked-progress-title">
          Unlock Your Progress Analytics
        </h2>

        {/* Subtitle */}
        <p className="locked-progress-subtitle">Sign in to unlock:</p>

        {/* Feature list (REQ-37) */}
        <ul className="locked-progress-features">
          <li>7-day & 30-day streak tracking</li>
          <li>Completion trends over time</li>
          <li>Notes sentiment analysis (after 7+ notes)</li>
          <li>Pattern discovery and insights</li>
        </ul>

        {/* Sign-in button */}
        <button
          className="locked-progress-button"
          onClick={handleSignInClick}
        >
          Sign In to Unlock
        </button>
      </div>
    </div>
  );
};
