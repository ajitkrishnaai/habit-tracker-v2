import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

/**
 * Loading Spinner Component
 * Task 7.46: Loading states with spinners for async operations
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text,
  fullScreen = false,
}) => {
  const containerClass = fullScreen
    ? 'loading-spinner-container loading-spinner-container--fullscreen'
    : 'loading-spinner-container';

  return (
    <div className={containerClass} role="status" aria-live="polite">
      <div className={`loading-spinner loading-spinner--${size}`} aria-hidden="true"></div>
      {text && <p className="loading-spinner-text">{text}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
