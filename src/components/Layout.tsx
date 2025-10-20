import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import OfflineIndicator from './OfflineIndicator';
import DemoBanner from './DemoBanner';
import ExpiryWarning from './ExpiryWarning';
import { demoModeService } from '../services/demoMode';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout Component
 * Wraps pages with Navigation, Footer, OfflineIndicator, and demo mode UI
 * Provides consistent structure for all authenticated and demo mode pages
 * Task 4.2: Added demo banners (ExpiryWarning + DemoBanner) for demo mode
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Check if user is in demo mode
  const isDemo = demoModeService.isDemoMode();

  return (
    <div className="layout">
      <OfflineIndicator />
      {isDemo && <ExpiryWarning />}
      {isDemo && <DemoBanner />}
      <Navigation />
      <main className="layout-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
