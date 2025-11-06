import React, { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal';
import './DemoBanner.css';

const DISMISSAL_KEY = 'demo-banner-dismissed';

/**
 * DemoBanner Component
 *
 * Displays a dismissible banner at the top of protected routes when in demo mode.
 * Reminds users to sign in to save their progress.
 *
 * Design (Amara.day Redesign - PRD #0004):
 * - Sticky positioning (stays visible during scroll)
 * - Warm gradient background using design system colors
 * - Accessible with ARIA labels and WCAG AA contrast
 * - Mobile-responsive layout
 * - Smooth slide-down entrance animation
 * - Dismissible with session-based persistence
 * - Opens AuthModal for sign-up flow
 */
export const DemoBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check if banner was dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISSAL_KEY);
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleSignInClick = () => {
    setShowAuthModal(true);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem(DISMISSAL_KEY, 'true');
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  // Don't render if dismissed
  if (isDismissed) {
    return null;
  }

  return (
    <>
      <div
        className="demo-banner"
        role="alert"
        aria-live="polite"
      >
        <div className="demo-banner-content">
          <span className="demo-banner-text">
            <button
              className="demo-banner-link"
              onClick={handleSignInClick}
              aria-label="Sign in to save your progress"
            >
              Sign in
            </button>
            {' '}to save your progress.
          </span>
          <button
            className="demo-banner-dismiss"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            type="button"
          >
            ×
          </button>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal onClose={handleCloseAuthModal} initialMode="signup" />
      )}
    </>
  );
};
