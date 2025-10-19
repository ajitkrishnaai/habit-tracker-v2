import React, { useEffect } from 'react';
import './Toast.css';

/**
 * Toast Component
 *
 * Displays temporary notification messages for milestone celebrations.
 * Auto-dismisses after a configurable duration (default 4 seconds).
 *
 * Features:
 * - Customizable icon and message
 * - Auto-dismiss with cleanup
 * - Accessible with ARIA live region
 * - Positioned at bottom-center (mobile-safe)
 */

interface ToastProps {
  message: string;
  icon?: string;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  icon = '🎉',
  duration = 4000,
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

  return (
    <div
      className="toast"
      role="alert"
      aria-live="polite"
    >
      <span className="toast-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="toast-message">{message}</span>
    </div>
  );
};
