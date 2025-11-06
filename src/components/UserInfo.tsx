import React from 'react';
import { getUserProfile } from '../services/auth';
import './UserInfo.css';

/**
 * UserInfo Component
 *
 * Displays the logged-in user's email address below the navigation.
 * Shows "logged in as {email}" in small, italicized text.
 *
 * Design:
 * - Small font size (0.875rem)
 * - Italic style for subtle emphasis
 * - Muted stone-600 color
 * - Centered text alignment
 * - Appears on all authenticated pages via Layout
 */
export const UserInfo: React.FC = () => {
  const userProfile = getUserProfile();

  // Don't render if not authenticated
  if (!userProfile) {
    return null;
  }

  return (
    <div className="user-info" role="contentinfo" aria-label="User information">
      <p className="user-info-text">
        logged in as <span className="user-info-email">{userProfile.email}</span>
      </p>
    </div>
  );
};

export default UserInfo;
