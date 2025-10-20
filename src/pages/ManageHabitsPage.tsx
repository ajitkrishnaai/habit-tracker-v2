/**
 * Manage Habits Page Component
 *
 * Allows users to add, edit, and remove habits.
 * This is the main habit management interface.
 */

import { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { parseError, formatErrorMessage, logError } from '../utils/errorHandler';
import { demoModeService } from '../services/demoMode';
import { ConversionModal } from '../components/ConversionModal';
import { Toast } from '../components/Toast';
import { HabitForm } from '../components/HabitForm';
import { HabitListItem } from '../components/HabitListItem';
import { EmptyState } from '../components/EmptyState';
import type { Habit } from '../types/habit';

export const ManageHabitsPage = (): JSX.Element => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Demo mode state (Task 3.4 - REQ-15, REQ-28, REQ-29)
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [conversionTrigger, setConversionTrigger] = useState<'habits_threshold' | 'first_log' | 'progress_page'>('habits_threshold');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Load habits on component mount
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize storage if needed
      await storageService.initDB();

      // Get only active habits
      const activeHabits = await storageService.getHabits(true);
      setHabits(activeHabits);
    } catch (err) {
      logError('ManageHabitsPage:loadHabits', err);
      const appError = parseError(err);
      setError(formatErrorMessage(appError));
    } finally {
      setLoading(false);
    }
  };

  const handleHabitSaved = () => {
    // Reload habits after adding or updating
    loadHabits();
    // Clear editing state
    setEditingHabit(null);

    // Demo mode tracking (Task 3.4 - REQ-15, REQ-28, REQ-29)
    if (demoModeService.isDemoMode()) {
      demoModeService.trackHabitAdded();

      // Check for milestone toast
      const milestoneMsg = demoModeService.getMilestoneMessage();
      if (milestoneMsg) {
        setToastMessage(milestoneMsg);
        setShowToast(true);
      }

      // Check for conversion trigger
      const trigger = demoModeService.shouldShowConversionModal();
      if (trigger) {
        setShowConversionModal(true);
        setConversionTrigger(trigger as 'habits_threshold' | 'first_log' | 'progress_page');
        demoModeService.markConversionShown();
      }
    }
  };

  const handleHabitDeleted = () => {
    // Reload habits after deleting one
    loadHabits();
  };

  const handleEditHabit = (habit: Habit) => {
    // Set habit to edit mode
    setEditingHabit(habit);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    // Clear editing state
    setEditingHabit(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          Loading habits...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem 1rem',
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        {/* Page Header */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          color: '#111827',
        }}>
          Manage Habits
        </h1>

        <p style={{
          fontSize: '1rem',
          color: '#6b7280',
          marginBottom: '2rem',
        }}>
          Add, edit, or remove your tracked habits
        </p>

        {/* Error Display */}
        {error && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#991b1b',
          }}>
            {error}
          </div>
        )}

        {/* Habit Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#111827',
          }}>
            {editingHabit ? 'Edit Habit' : 'Add New Habit'}
          </h2>
          <HabitForm
            editingHabit={editingHabit}
            onSuccess={handleHabitSaved}
            onCancel={editingHabit ? handleCancelEdit : undefined}
          />
        </div>

        {/* Habits List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#111827',
          }}>
            Your Habits
          </h2>

          {habits.length === 0 ? (
            <EmptyState
              title="No habits yet"
              message="Use the form above to add your first habit and start tracking your progress"
            />
          ) : (
            <div>
              {habits.map((habit) => (
                <HabitListItem
                  key={habit.habit_id}
                  habit={habit}
                  onEdit={handleEditHabit}
                  onDelete={handleHabitDeleted}
                />
              ))}
            </div>
          )}
        </div>

        {/* Demo Mode Modals and Toasts (Task 3.4) */}
        {showConversionModal && (
          <ConversionModal
            trigger={conversionTrigger}
            onClose={() => setShowConversionModal(false)}
          />
        )}
        {showToast && (
          <Toast
            message={toastMessage}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
};
