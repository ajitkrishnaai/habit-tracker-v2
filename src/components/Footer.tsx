import React from 'react';
import { Link } from 'react-router-dom';
import { AmaraDayLogo } from './branding/AmaraDayLogo';
import './Footer.css';

/**
 * Footer component (Task 2.14 - Updated with Amara.day branding)
 * Features:
 * - Amara.day logo and branding
 * - Links to Privacy Policy and Terms of Service
 * - Copyright notice with current year
 * - Warm styling consistent with design system
 * - Accessible with semantic HTML
 */
const Footer: React.FC = () => {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        {/* Branding */}
        <div className="footer-branding">
          <AmaraDayLogo size={16} />
        </div>

        {/* Navigation */}
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

        {/* Copyright */}
        <p className="footer-copyright">
          © {new Date().getFullYear()} Amara.day
        </p>
      </div>
    </footer>
  );
};

export default Footer;
