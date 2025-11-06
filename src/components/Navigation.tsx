import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getUserProfile, logout } from '../services/auth';
import { AmaraDayLogo } from './branding';
import './Navigation.css';

/**
 * Top navigation bar component with main menu items
 * - Fixed/sticky at top on mobile
 * - Highlights active page
 * - Shows user profile with logout option
 * - Accessible with semantic HTML and ARIA labels
 * Updated for Supabase: displays user info from Supabase Auth session
 *
 * Amara.day Redesign (PRD #0004 Phase 2):
 * - Uses AmaraDayLogo component for branding
 * - Warm colors and backdrop blur glassmorphism effect
 */
const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userProfile = getUserProfile();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <div className="navigation-container">
        <div className="navigation-brand">
          <AmaraDayLogo size={28} layout="horizontal" />
        </div>

        <ul className="navigation-menu">
          <li className="navigation-item">
            <NavLink
              to="/daily-log"
              className={({ isActive }) =>
                isActive ? 'navigation-link navigation-link--active' : 'navigation-link'
              }
            >
              Daily Log
            </NavLink>
          </li>

          <li className="navigation-item">
            <NavLink
              to="/progress"
              className={({ isActive }) =>
                isActive ? 'navigation-link navigation-link--active' : 'navigation-link'
              }
            >
              Progress
            </NavLink>
          </li>

          <li className="navigation-item">
            <NavLink
              to="/manage-habits"
              className={({ isActive }) =>
                isActive ? 'navigation-link navigation-link--active' : 'navigation-link'
              }
            >
              Manage Habits
            </NavLink>
          </li>

          {/* User Profile Menu */}
          {userProfile && (
            <li className="navigation-item navigation-user">
              <button
                className="navigation-user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                {userProfile.picture && (
                  <img
                    src={userProfile.picture}
                    alt={userProfile.name}
                    className="navigation-user-avatar"
                  />
                )}
                <span className="navigation-user-name">{userProfile.name}</span>
              </button>

              {showUserMenu && (
                <div className="navigation-user-menu">
                  <div className="navigation-user-info">
                    <div className="navigation-user-email">{userProfile.email}</div>
                  </div>
                  <button
                    className="navigation-user-logout"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
