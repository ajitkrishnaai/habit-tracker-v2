import React from 'react';
import './ErrorMessage.css';

export type ErrorType = 'auth' | 'sync' | 'validation' | 'general';

interface ErrorMessageProps {
  type: ErrorType;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Error Message Component
 * Tasks 7.25-7.27: Consistent error display for auth, sync, and validation errors with retry
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type,
  message,
  onRetry,
  onDismiss,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'auth':
        return '🔒';
      case 'sync':
        return '⚠️';
      case 'validation':
        return '⚠';
      default:
        return '❌';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'auth':
        return 'Authentication Error';
      case 'sync':
        return 'Sync Error';
      case 'validation':
        return 'Validation Error';
      default:
        return 'Error';
    }
  };

  return (
    <div className={`error-message error-message--${type}`} role="alert">
      <div className="error-message-content">
        <div className="error-message-header">
          <span className="error-message-icon" aria-hidden="true">
            {getIcon()}
          </span>
          <strong className="error-message-title">
            {getTitle()}
          </strong>
        </div>

        <p className="error-message-text">{message}</p>

        {/* Task 7.27: Include retry button where appropriate */}
        <div className="error-message-actions">
          {onRetry && (
            <button
              onClick={onRetry}
              className="error-message-button error-message-button--retry"
              aria-label="Retry action"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="error-message-button error-message-button--dismiss"
              aria-label="Dismiss error message"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
