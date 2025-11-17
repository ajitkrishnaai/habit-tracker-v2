import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, logout } from '../services/auth';
import './UserInfo.css';

/**
 * UserInfo Component
 *
 * Displays the logged-in user's email address below the navigation.
 * Shows "logged in as {email}" with a sign-out link.
 *
 * Design:
 * - Small font size (0.875rem)
 * - Italic style for subtle emphasis
 * - Muted stone-600 color
 * - Centered text alignment
 * - Sign-out link on the right with hover effect
 * - Appears on all authenticated pages via Layout
 */
export const UserInfo: React.FC = () => {
  const userProfile = getUserProfile();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Don't render if not authenticated
  if (!userProfile) {
    return null;
  }

  const handleSignOut = async () => {
    if (isLoggingOut) return; // Prevent double-click

    try {
      setIsLoggingOut(true);
      await logout();
      // Redirect to welcome page after successful logout
      navigate('/');
    } catch (error) {
      console.error('[UserInfo] Sign out failed:', error);
      setIsLoggingOut(false);
      // Show error to user
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="user-info" role="contentinfo" aria-label="User information">
      <p className="user-info-text">
        logged in as <span className="user-info-email">{userProfile.email}</span>
        {' · '}
        <button
          className="user-info-signout"
          onClick={handleSignOut}
          disabled={isLoggingOut}
          aria-label="Sign out"
        >
          {isLoggingOut ? 'signing out...' : 'sign out'}
        </button>
      </p>
    </div>
  );
};

export default UserInfo;
