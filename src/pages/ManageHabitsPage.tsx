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
import { FloatingActionButton } from '../components/FloatingActionButton';
import type { Habit } from '../types/habit';
import './ManageHabitsPage.css';

export const ManageHabitsPage = (): JSX.Element => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showHabitForm, setShowHabitForm] = useState(false);

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
    // Clear editing state and hide form
    setEditingHabit(null);
    setShowHabitForm(false);

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
    // Set habit to edit mode and show form
    setEditingHabit(habit);
    setShowHabitForm(true);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenHabitForm = () => {
    // Open form in add mode (not editing)
    setEditingHabit(null);
    setShowHabitForm(true);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    // Clear editing state and hide form
    setEditingHabit(null);
    setShowHabitForm(false);
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

        {/* Habit Form Modal (Task 1.22 - shown only when showHabitForm is true) */}
        {showHabitForm && (
          <div
            className="habit-form-modal-backdrop"
            onClick={handleCancelEdit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="habit-form-title"
          >
            <div
              className="habit-form-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="habit-form-modal__header">
                <h2 id="habit-form-title" className="habit-form-modal__title">
                  {editingHabit ? 'Edit Habit' : 'Add New Habit'}
                </h2>
                <button
                  className="habit-form-modal__close"
                  onClick={handleCancelEdit}
                  aria-label="Close form"
                  type="button"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <HabitForm
                editingHabit={editingHabit}
                onSuccess={handleHabitSaved}
                onCancel={handleCancelEdit}
              />
            </div>
          </div>
        )}

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
            <div className="habits-grid">
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

      {/* Floating Action Button for adding habits (Task 1.21) */}
      <FloatingActionButton
        onClick={handleOpenHabitForm}
        aria-label="Add new habit"
      />
    </div>
  );
};
