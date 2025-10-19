/**
 * Habit Form Component
 *
 * Form for adding and editing habits with validation.
 * Includes character counter, duplicate detection, and inline error messages.
 */

import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { syncService } from '../services/syncService';
import { supabaseDataService } from '../services/supabaseDataService';
import { generateUUID } from '../utils/uuid';
import {
  validateHabitName,
  validateCategory,
  sanitizeHabitName,
  sanitizeCategory,
} from '../utils/dataValidation';
import { parseError, formatErrorMessage, logError } from '../utils/errorHandler';
import type { Habit } from '../types/habit';

interface HabitFormProps {
  editingHabit?: Habit | null; // If provided, form is in edit mode
  onSuccess?: () => void; // Callback when habit is saved successfully
  onCancel?: () => void; // Callback when edit is cancelled
}

export const HabitForm = ({ editingHabit, onSuccess, onCancel }: HabitFormProps): JSX.Element => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = !!editingHabit;

  // Populate form when editing
  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setCategory(editingHabit.category || '');
    }
  }, [editingHabit]);

  // Character counters
  const nameLength = name.length;
  const nameRemaining = 100 - nameLength;

  // Clear error when user types
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameError(null);
    setGeneralError(null);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategory(e.target.value);
    setCategoryError(null);
    setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setNameError(null);
    setCategoryError(null);
    setGeneralError(null);

    try {
      setSubmitting(true);

      // Sanitize inputs
      const sanitizedName = sanitizeHabitName(name);
      const sanitizedCategory = sanitizeCategory(category);

      // Validate habit name
      const nameValidation = await validateHabitName(
        sanitizedName,
        editingHabit?.habit_id
      );
      if (!nameValidation.isValid) {
        setNameError(nameValidation.error || 'Invalid habit name');
        setSubmitting(false);
        return;
      }

      // Validate category if provided
      if (sanitizedCategory) {
        const categoryValidation = validateCategory(sanitizedCategory);
        if (!categoryValidation.isValid) {
          setCategoryError(categoryValidation.error || 'Invalid category');
          setSubmitting(false);
          return;
        }
      }

      // Get current date in ISO 8601 format (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];

      // Create or update habit
      const habit: Habit = {
        habit_id: editingHabit?.habit_id || generateUUID(),
        name: sanitizedName,
        category: sanitizedCategory,
        status: 'active',
        created_date: editingHabit?.created_date || today,
        modified_date: today,
      };

      // Save to local storage (IndexedDB)
      await storageService.saveHabit(habit);

      // Also save to Supabase if online
      try {
        if (editingHabit) {
          // Update existing habit
          // @ts-expect-error - Type mismatch between local and Supabase Habit types
          await supabaseDataService.updateHabit({
            habit_id: habit.habit_id,
            name: habit.name,
            category: habit.category,
            status: habit.status,
          });
        } else {
          // Create new habit
          await supabaseDataService.createHabit({
            habit_id: habit.habit_id,
            name: habit.name,
            category: habit.category,
            status: habit.status,
          });
        }
      } catch (supabaseError) {
        // Log error but don't block user - IndexedDB save succeeded
        logError('HabitForm:supabaseSync', supabaseError);
      }

      // Trigger background sync for any queued operations
      syncService.syncToRemote().catch((err) => {
        logError('HabitForm:backgroundSync', err);
      });

      // Clear form and notify parent
      setName('');
      setCategory('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      logError('HabitForm:submit', err);
      const appError = parseError(err);
      setGeneralError(formatErrorMessage(appError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    // Clear form
    setName('');
    setCategory('');
    setNameError(null);
    setCategoryError(null);
    setGeneralError(null);

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* General Error */}
      {generalError && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '6px',
          color: '#991b1b',
          fontSize: '0.875rem',
        }}>
          {generalError}
        </div>
      )}

      {/* Habit Name Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label
          htmlFor="habit-name"
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem',
            color: '#374151',
          }}
        >
          Habit Name *
        </label>

        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={handleNameChange}
          placeholder="e.g., Morning Exercise"
          maxLength={100}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: `1px solid ${nameError ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '6px',
            outline: 'none',
            backgroundColor: submitting ? '#f3f4f6' : 'white',
            color: '#111827',
          }}
          onFocus={(e) => {
            if (!nameError) {
              e.target.style.borderColor = '#2563eb';
            }
          }}
          onBlur={(e) => {
            if (!nameError) {
              e.target.style.borderColor = '#d1d5db';
            }
          }}
        />

        {/* Character Counter */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.25rem',
        }}>
          {nameError ? (
            <span style={{
              fontSize: '0.875rem',
              color: '#dc2626',
            }}>
              {nameError}
            </span>
          ) : (
            <span style={{ fontSize: '0.875rem', color: 'transparent' }}>
              &nbsp;
            </span>
          )}

          <span style={{
            fontSize: '0.875rem',
            color: nameRemaining < 20 ? '#dc2626' : '#6b7280',
          }}>
            {nameLength}/100
          </span>
        </div>
      </div>

      {/* Category Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          htmlFor="habit-category"
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem',
            color: '#374151',
          }}
        >
          Category (Optional)
        </label>

        <input
          id="habit-category"
          type="text"
          value={category}
          onChange={handleCategoryChange}
          placeholder="e.g., Health, Productivity"
          maxLength={50}
          disabled={submitting}
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            border: `1px solid ${categoryError ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '6px',
            outline: 'none',
            backgroundColor: submitting ? '#f3f4f6' : 'white',
            color: '#111827',
          }}
          onFocus={(e) => {
            if (!categoryError) {
              e.target.style.borderColor = '#2563eb';
            }
          }}
          onBlur={(e) => {
            if (!categoryError) {
              e.target.style.borderColor = '#d1d5db';
            }
          }}
        />

        {categoryError && (
          <span style={{
            display: 'block',
            fontSize: '0.875rem',
            color: '#dc2626',
            marginTop: '0.25rem',
          }}>
            {categoryError}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
      }}>
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: submitting || !name.trim() ? '#9ca3af' : '#2563eb',
            border: 'none',
            borderRadius: '6px',
            cursor: submitting || !name.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            if (!submitting && name.trim()) {
              e.currentTarget.style.backgroundColor = '#1d4ed8';
            }
          }}
          onMouseOut={(e) => {
            if (!submitting && name.trim()) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
        >
          {submitting ? 'Saving...' : (isEditing ? 'Update Habit' : 'Add Habit')}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleCancelEdit}
            disabled={submitting}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseOut={(e) => {
              if (!submitting) {
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
