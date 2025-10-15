import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

/**
 * Footer component with links to legal pages
 * - Privacy Policy and Terms of Service
 * - Accessible with semantic HTML
 */
const Footer: React.FC = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <nav className="footer-nav" aria-label="Legal information">
          <ul className="footer-links">
            <li className="footer-item">
              <Link to="/privacy" className="footer-link">
                Privacy Policy
              </Link>
            </li>
            <li className="footer-separator" aria-hidden="true">•</li>
            <li className="footer-item">
              <Link to="/terms" className="footer-link">
                Terms of Service
              </Link>
            </li>
          </ul>
        </nav>

        <p className="footer-copyright">
          © {new Date().getFullYear()} Habit Tracker. Your data stays in your Google Drive.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
