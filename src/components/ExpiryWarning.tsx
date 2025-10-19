import React from 'react';
import { useNavigate } from 'react-router-dom';
import { demoModeService } from '../services/demoMode';
import './ExpiryWarning.css';

/**
 * ExpiryWarning Component
 *
 * Displays a warning banner when demo data is approaching expiry (2 or fewer days remaining).
 * Shows countdown of days remaining and provides urgent CTA to sign in.
 *
 * Features:
 * - Orange/yellow gradient background to indicate urgency
 * - Pulsing warning icon animation
 * - Dynamic day count (singular/plural)
 * - Only shows in last 2 days of demo period
 * - Accessible with ARIA alert role
 */
export const ExpiryWarning: React.FC = () => {
  const navigate = useNavigate();

  // Calculate days in demo and days remaining
  const daysInDemo = demoModeService.getDaysInDemo();
  const daysLeft = 7 - daysInDemo;

  // Only show warning if 2 or fewer days remain (REQ-42)
  if (daysLeft > 2) {
    return null;
  }

  const handleSignInClick = () => {
    navigate('/');
  };

  // Format day count (singular vs plural)
  const dayText = daysLeft === 1 ? 'day' : 'days';

  return (
    <div className="expiry-warning" role="alert">
      <div className="expiry-warning-content">
        {/* Warning icon with pulsing animation */}
        <span className="expiry-warning-icon" aria-hidden="true">⚠️</span>

        {/* Warning text with day count (REQ-43) */}
        <span className="expiry-warning-text">
          Your demo data will be deleted in {daysLeft} {dayText}. Sign in to save your progress permanently.
        </span>

        {/* Sign-in button */}
        <button
          className="expiry-warning-button"
          onClick={handleSignInClick}
        >
          Sign In Now
        </button>
      </div>
    </div>
  );
};
