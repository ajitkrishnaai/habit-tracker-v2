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
    <div className="habit-list-item">
      {/* Error Display */}
      {error && (
        <div className="habit-list-item__error">
          {error}
        </div>
      )}

      {/* Habit Display or Confirmation Dialog */}
      {!showConfirmDelete ? (
        <div className="habit-list-item__content">
          {/* Habit Info */}
          <div className="habit-list-item__info">
            <div className="habit-list-item__name">
              {habit.name}
            </div>

            {habit.category && (
              <span className="habit-list-item__category">
                {habit.category}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="habit-list-item__actions">
            <button
              onClick={handleEditClick}
              disabled={deleting}
              className="habit-list-item__edit-btn"
            >
              Edit
            </button>

            <button
              onClick={handleRemoveClick}
              disabled={deleting}
              className="habit-list-item__delete-btn"
            >
              Remove
            </button>
          </div>
        </div>
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
              className="habit-list-item__cancel-btn"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="habit-list-item__confirm-btn"
            >
              {deleting ? 'Removing...' : 'Yes, Remove'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
