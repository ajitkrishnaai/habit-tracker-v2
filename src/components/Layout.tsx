import React from 'react';
import AppHeader from './AppHeader';
import Navigation from './Navigation';
import UserInfo from './UserInfo';
import Footer from './Footer';
import OfflineIndicator from './OfflineIndicator';
import { DemoBanner } from './DemoBanner';
import { ExpiryWarning } from './ExpiryWarning';
import { demoModeService } from '../services/demoMode';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout Component
 * Wraps pages with AppHeader, Navigation, UserInfo, Footer, OfflineIndicator, and demo mode UI
 * Provides consistent structure for all authenticated and demo mode pages
 * Task 4.2: Added demo banners (ExpiryWarning + DemoBanner) for demo mode
 * Updated: Added AppHeader for consistent "AMARA DAY" branding across all pages
 * Updated: Added UserInfo component to show "logged in as {email}"
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Check if user is in demo mode
  const isDemo = demoModeService.isDemoMode();

  return (
    <div className="layout">
      <OfflineIndicator />
      {isDemo && <ExpiryWarning />}
      {isDemo && <DemoBanner />}
      <AppHeader variant="compact" />
      <Navigation />
      <UserInfo />
      <main className="layout-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
