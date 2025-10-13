/**
 * Error Handler Utility
 *
 * Provides user-friendly error messages for various error types.
 * Handles OAuth errors, network errors, API errors, etc.
 */

export type ErrorType =
  | 'auth'
  | 'network'
  | 'permission'
  | 'validation'
  | 'sync'
  | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  retryable: boolean;
}

/**
 * Parse and categorize errors into user-friendly AppError objects
 */
export const parseError = (error: any): AppError => {
  // Handle OAuth/Authentication errors
  if (error.message?.includes('auth') || error.message?.includes('token')) {
    return {
      type: 'auth',
      message: 'Authentication failed',
      details: getAuthErrorMessage(error),
      retryable: true,
    };
  }

  // Handle permission errors
  if (error.message?.includes('permission') || error.message?.includes('403')) {
    return {
      type: 'permission',
      message: 'Permission denied',
      details: 'Please ensure you granted all required permissions when signing in.',
      retryable: true,
    };
  }

  // Handle network errors
  if (
    error.message?.includes('network') ||
    error.message?.includes('fetch') ||
    error.message?.includes('NetworkError')
  ) {
    return {
      type: 'network',
      message: 'Network error',
      details: 'Please check your internet connection and try again.',
      retryable: true,
    };
  }

  // Handle validation errors
  if (error.message?.includes('validation') || error.message?.includes('invalid')) {
    return {
      type: 'validation',
      message: 'Validation error',
      details: error.message,
      retryable: false,
    };
  }

  // Handle sync errors
  if (error.message?.includes('sync')) {
    return {
      type: 'sync',
      message: 'Sync failed',
      details: 'Your changes are saved locally and will sync when connection is restored.',
      retryable: true,
    };
  }

  // Unknown error
  return {
    type: 'unknown',
    message: 'Something went wrong',
    details: error.message || 'An unexpected error occurred. Please try again.',
    retryable: true,
  };
};

/**
 * Get user-friendly message for OAuth errors
 */
const getAuthErrorMessage = (error: any): string => {
  const errorString = error.message?.toLowerCase() || '';

  if (errorString.includes('popup_closed_by_user') || errorString.includes('user closed')) {
    return 'Sign-in was cancelled. Please try again.';
  }

  if (errorString.includes('popup_blocked')) {
    return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
  }

  if (errorString.includes('access_denied') || errorString.includes('consent')) {
    return 'Access was denied. Please grant the required permissions to continue.';
  }

  if (errorString.includes('insufficient')) {
    return 'Insufficient permissions. Please sign in again and grant all required permissions.';
  }

  if (errorString.includes('invalid_grant') || errorString.includes('token')) {
    return 'Your session has expired. Please sign in again.';
  }

  if (errorString.includes('not initialized')) {
    return 'Authentication system is initializing. Please wait a moment and try again.';
  }

  return 'Authentication failed. Please try signing in again.';
};

/**
 * Log error to console with context
 */
export const logError = (context: string, error: any): void => {
  console.error(`[${context}]`, error);

  // In production, you could send errors to an error tracking service
  // like Sentry, LogRocket, or Google Cloud Error Reporting
  if (import.meta.env.PROD) {
    // TODO: Send to error tracking service
  }
};

/**
 * Format error for display to user
 */
export const formatErrorMessage = (error: AppError): string => {
  let message = error.message;

  if (error.details) {
    message += `\n${error.details}`;
  }

  if (error.retryable) {
    message += '\n\nPlease try again.';
  }

  return message;
};
