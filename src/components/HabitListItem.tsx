/**
 * Habit List Item Component
 *
 * Displays a single habit with name, category badge, and action buttons (edit, remove).
 * Includes confirmation dialog for deletion.
 */

import { useState } from 'react';
import { storageService } from '../services/storage';
import { syncService } from '../services/syncService';
import { parseError, formatErrorMessage, logError } from '../utils/errorHandler';
import type { Habit } from '../types/habit';

interface HabitListItemProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: () => void;
}

export const HabitListItem = ({ habit, onEdit, onDelete }: HabitListItemProps): JSX.Element => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditClick = () => {
    onEdit(habit);
  };

  const handleRemoveClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      // Mark habit as inactive (soft delete)
      await storageService.deleteHabit(habit.habit_id);

      // Trigger sync in background
      syncService.syncToRemote().catch((err) => {
        logError('HabitListItem:backgroundSync', err);
      });

      // Notify parent component
      onDelete();
    } catch (err) {
      logError('HabitListItem:delete', err);
      const appError = parseError(err);
      setError(formatErrorMessage(appError));
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
    setError(null);
  };

  return (
    <div
      style={{
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      {/* Error Display */}
      {error && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '6px',
          color: '#991b1b',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      {/* Habit Display or Confirmation Dialog */}
      {!showConfirmDelete ? (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          {/* Habit Info */}
          <div style={{ flex: '1 1 0%', minWidth: '200px' }}>
            <div style={{
              fontSize: '1.125rem',
              fontWeight: '500',
              color: '#111827',
              marginBottom: '0.5rem',
            }}>
              {habit.name}
            </div>

            {habit.category && (
              <span style={{
                display: 'inline-block',
                fontSize: '0.875rem',
                padding: '0.25rem 0.75rem',
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                borderRadius: '9999px',
              }}>
                {habit.category}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexShrink: 0,
          }}>
            <button
              onClick={handleEditClick}
              disabled={deleting}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#2563eb',
                backgroundColor: 'transparent',
                border: '1px solid #2563eb',
                borderRadius: '6px',
                cursor: deleting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                minWidth: '44px', // Touch target size
                minHeight: '44px',
              }}
              onMouseOver={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                }
              }}
              onMouseOut={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Edit
            </button>

            <button
              onClick={handleRemoveClick}
              disabled={deleting}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#dc2626',
                backgroundColor: 'transparent',
                border: '1px solid #dc2626',
                borderRadius: '6px',
                cursor: deleting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                minWidth: '44px', // Touch target size
                minHeight: '44px',
              }}
              onMouseOver={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                }
              }}
              onMouseOut={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* Confirmation Dialog */
        <div>
          <p style={{
            fontSize: '1rem',
            color: '#111827',
            marginBottom: '1rem',
          }}>
            Are you sure you want to remove "<strong>{habit.name}</strong>"? This will mark it as inactive, but historical data will be preserved.
          </p>

          <div style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
          }}>
            <button
              onClick={handleCancelDelete}
              disabled={deleting}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: deleting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                minWidth: '44px',
                minHeight: '44px',
              }}
              onMouseOver={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseOut={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: 'white',
                backgroundColor: deleting ? '#9ca3af' : '#dc2626',
                border: 'none',
                borderRadius: '6px',
                cursor: deleting ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s',
                minWidth: '44px',
                minHeight: '44px',
              }}
              onMouseOver={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = '#b91c1c';
                }
              }}
              onMouseOut={(e) => {
                if (!deleting) {
                  e.currentTarget.style.backgroundColor = '#dc2626';
                }
              }}
            >
              {deleting ? 'Removing...' : 'Yes, Remove'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
