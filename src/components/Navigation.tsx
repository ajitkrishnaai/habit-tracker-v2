import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

/**
 * Top navigation bar component with main menu items
 * - Fixed/sticky at top on mobile
 * - Highlights active page
 * - Simple inline layout with pipe separators
 * - Accessible with semantic HTML and ARIA labels
 * Updated for Supabase: displays user info from Supabase Auth session
 *
 * Amara.day Redesign (PRD #0004 Phase 2):
 * - Simplified navigation with inline menu items
 * - Warm colors and backdrop blur glassmorphism effect
 * - Pipe separators between menu items
 */
const Navigation: React.FC = () => {
  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <div className="navigation-container">
        <ul className="navigation-menu">
          <li className="navigation-item">
            <NavLink
              to="/daily-log"
              className={({ isActive }) =>
                isActive ? 'navigation-link navigation-link--active' : 'navigation-link'
              }
            >
              Daily
            </NavLink>
          </li>

          <li className="navigation-separator" aria-hidden="true">|</li>

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

          <li className="navigation-separator" aria-hidden="true">|</li>

          <li className="navigation-item">
            <NavLink
              to="/manage-habits"
              className={({ isActive }) =>
                isActive ? 'navigation-link navigation-link--active' : 'navigation-link'
              }
            >
              Manage
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
