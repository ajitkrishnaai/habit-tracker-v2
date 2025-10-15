import React from 'react';
import './SyncIndicator.css';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncIndicatorProps {
  status: SyncStatus;
  onRetry?: () => void;
  message?: string;
}

/**
 * Sync Indicator Component
 * Tasks 7.18-7.21: Shows sync status with spinning icon, success checkmark, or error with retry
 */
const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  status,
  onRetry,
  message,
}) => {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className={`sync-indicator sync-indicator--${status}`} role="status" aria-live="polite">
      <div className="sync-indicator-content">
        {/* Task 7.19: Spinning icon for in-progress */}
        {status === 'syncing' && (
          <>
            <div className="sync-indicator-spinner" aria-hidden="true">
              ⟳
            </div>
            <span className="sync-indicator-text">
              {message || 'Syncing...'}
            </span>
          </>
        )}

        {/* Task 7.20: Success checkmark when sync completes */}
        {status === 'success' && (
          <>
            <div className="sync-indicator-icon sync-indicator-icon--success" aria-hidden="true">
              ✓
            </div>
            <span className="sync-indicator-text">
              {message || 'Synced successfully'}
            </span>
          </>
        )}

        {/* Task 7.21: Error state with retry button */}
        {status === 'error' && (
          <>
            <div className="sync-indicator-icon sync-indicator-icon--error" aria-hidden="true">
              ⚠
            </div>
            <span className="sync-indicator-text">
              {message || 'Sync failed'}
            </span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="sync-indicator-retry"
                aria-label="Retry sync"
              >
                Retry
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SyncIndicator;
