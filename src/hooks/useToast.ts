/**
 * useToast Hook
 * Access toast functionality from any component
 *
 * @example
 * const { showToast } = useToast();
 * showToast('Notes saved ✓', 'success');
 */

import { useContext } from 'react';
import { ToastContext } from '../components/ToastContext';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
