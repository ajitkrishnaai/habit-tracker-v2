import React, { useState, useEffect } from 'react';
import './OfflineIndicator.css';

/**
 * Offline Indicator Component
 * Tasks 7.22-7.24: Shows banner when offline, hides when back online
 */
const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Task 7.24: Hide indicator when back online
  if (isOnline) {
    return null;
  }

  // Task 7.23: Display banner when app is offline
  return (
    <div className="offline-indicator" role="alert" aria-live="assertive">
      <div className="offline-indicator-content">
        <span className="offline-indicator-icon" aria-hidden="true">📡</span>
        <span className="offline-indicator-text">
          You're offline. Changes will sync when you're back online.
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
