/**
 * ToastContext (Task 2.13)
 * Global toast notification management with queue system
 *
 * Features:
 * - Queue management (max 3 visible toasts)
 * - Auto-dismiss with configurable duration
 * - Manual dismiss support
 * - Type-safe toast variants (success, error, info)
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastVariant } from './Toast';

interface ToastData {
  id: string;
  message: string;
  variant?: ToastVariant;
  icon?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, duration?: number, icon?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((
    message: string,
    variant: ToastVariant = 'success',
    duration: number = 3000,
    icon?: string
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastData = { id, message, variant, icon, duration };

    setToasts((prev) => {
      // If queue exceeds 3, remove oldest toast
      const updatedToasts = prev.length >= 3 ? prev.slice(1) : prev;
      return [...updatedToasts, newToast];
    });
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Render active toasts */}
      <div
        style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              marginTop: index > 0 ? '0.5rem' : '0',
            }}
          >
            <Toast
              message={toast.message}
              variant={toast.variant}
              icon={toast.icon}
              duration={toast.duration}
              onClose={() => dismissToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

/**
 * useToast Hook
 * Access toast functionality from any component
 *
 * @example
 * const { showToast } = useToast();
 * showToast('Notes saved ✓', 'success');
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
