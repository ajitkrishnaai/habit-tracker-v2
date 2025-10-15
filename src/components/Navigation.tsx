import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navigation.css';

/**
 * Top navigation bar component with main menu items
 * - Fixed/sticky at top on mobile
 * - Highlights active page
 * - Accessible with semantic HTML and ARIA labels
 */
const Navigation: React.FC = () => {
  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <div className="navigation-container">
        <div className="navigation-brand">
          <h1 className="navigation-title">Habit Tracker</h1>
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
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
