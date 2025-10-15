import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import OfflineIndicator from './OfflineIndicator';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout Component
 * Wraps pages with Navigation, Footer, and OfflineIndicator
 * Provides consistent structure for all authenticated pages
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <OfflineIndicator />
      <Navigation />
      <main className="layout-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
