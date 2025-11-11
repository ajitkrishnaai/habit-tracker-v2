/**
 * Habit List Item Component
 *
 * Displays a single habit with name, category badge, and action buttons (edit, remove).
 * Includes confirmation dialog for deletion.
 */

import { useState } from 'react';
import { storageService } from '../services/storage';
import { syncService } from '../services/syncService';
import { supabaseDataService } from '../services/supabaseDataService';
import { parseError, formatErrorMessage, logError } from '../utils/errorHandler';
import type { Habit } from '../types/habit';
import './HabitListItem.css';

interface HabitListItemProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: () => void;
}

export const HabitListItem = ({ habit, onEdit, onDelete }: HabitListItemProps): JSX.Element => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const habitNameId = `habit-name-${habit.habit_id}`;

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

      // Mark habit as inactive (soft delete) in IndexedDB
      await storageService.deleteHabit(habit.habit_id);

      // Also delete in Supabase
      try {
        await supabaseDataService.deleteHabit(habit.habit_id);
      } catch (supabaseError) {
        // Log error but don't block user - IndexedDB delete succeeded
        logError('HabitListItem:supabaseDelete', supabaseError);
      }

      // Trigger sync in background for any queued operations
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
    <li
      className={`card card--compact habit-list-item ${
        showConfirmDelete ? 'habit-list-item--confirm' : ''
      }`}
    >
      {/* Error Display */}
      {error && (
        <div className="habit-list-item__error" role="alert">
          {error}
        </div>
      )}

      {/* Habit Display or Confirmation Dialog */}
      {!showConfirmDelete ? (
        <>
          <div className="habit-list-item__info">
            <span id={habitNameId} className="habit-list-item__name">
              {habit.name}
            </span>
            {habit.category && (
              <span className="badge badge--warning">{habit.category}</span>
            )}
          </div>
          <div className="habit-list-item__actions" aria-label={`${habit.name} actions`}>
            <button
              onClick={handleEditClick}
              disabled={deleting}
              className="habit-list-item__icon-btn"
              aria-label="Edit"
              aria-describedby={habitNameId}
              title="Edit"
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>

            <button
              onClick={handleRemoveClick}
              disabled={deleting}
              className="habit-list-item__icon-btn habit-list-item__icon-btn--danger"
              aria-label="Remove"
              aria-describedby={habitNameId}
              title="Remove"
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        /* Confirmation Dialog */
        <div className="habit-list-item__confirm">
          <p className="habit-list-item__confirm-text">
            Are you sure you want to remove "<strong>{habit.name}</strong>"? This will mark it as inactive, but historical data will be preserved.
          </p>

          <div className="habit-list-item__confirm-actions">
            <button
              onClick={handleCancelDelete}
              disabled={deleting}
              className="btn-secondary btn-sm"
              type="button"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="btn-danger-primary btn-sm"
              type="button"
            >
              {deleting ? 'Removing...' : 'Yes, Remove'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
};
