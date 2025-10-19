import React, { useState, useEffect } from 'react';
import './MigrationToast.css';

/**
 * MigrationToast Component
 *
 * Displays a success message after demo data has been migrated to an authenticated account.
 * Shows green checkmark icon with welcome message.
 * Auto-dismisses after 6 seconds or can be manually closed.
 *
 * Features:
 * - Green gradient styling to indicate success
 * - Manual close button (X)
 * - Auto-dismiss after 6 seconds
 * - Slide-in animation from right
 * - Accessible with ARIA labels
 */
export const MigrationToast: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto-dismiss after 6 seconds (REQ-50)
    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000);

    // Cleanup
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  return (
    <div
      className="migration-toast"
      role="alert"
      aria-live="polite"
    >
      <div className="migration-toast-content">
        {/* Green checkmark icon */}
        <div className="migration-toast-icon" aria-hidden="true">
          <div className="migration-toast-checkmark">✓</div>
        </div>

        {/* Text content */}
        <div className="migration-toast-text">
          <div className="migration-toast-title">Welcome!</div>
          <div className="migration-toast-message">
            Your demo data has been saved. All your habits and logs are now synced to your account.
          </div>
        </div>

        {/* Close button */}
        <button
          className="migration-toast-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
