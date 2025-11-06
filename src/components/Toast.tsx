import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Toast.css';

/**
 * Toast Component (Task 2.12 - Enhanced with warm styling and variants)
 *
 * Displays temporary notification messages for milestone celebrations and feedback.
 * Auto-dismisses after a configurable duration (default 3 seconds for success).
 *
 * Features:
 * - Variant support: success (sage green), error (warm red), info (terracotta)
 * - Slide-in animation from top
 * - Manual close button
 * - Auto-dismiss with cleanup
 * - Accessible with ARIA live region
 * - Positioned at top-center
 */

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  icon?: string;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'success',
  icon,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    // Set up auto-dismiss timer
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Cleanup function to clear timeout
    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  // Default icons for each variant
  const defaultIcons: Record<ToastVariant, string> = {
    success: '✓',
    error: '⚠️',
    info: 'ℹ️',
  };

  const displayIcon = icon || defaultIcons[variant];

  return (
    <div
      className={`toast toast--${variant} toast-enter`}
      role="alert"
      aria-live="polite"
    >
      <span className="toast-icon" aria-hidden="true">
        {displayIcon}
      </span>
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
        type="button"
      >
        <X size={16} />
      </button>
    </div>
  );
};
