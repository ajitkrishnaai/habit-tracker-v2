/**
 * Manage Habits Page Component
 *
 * Allows users to add, edit, and remove habits.
 * This is the main habit management interface.
 */

import { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storage';
import { parseError, formatErrorMessage, logError } from '../utils/errorHandler';
import { demoModeService } from '../services/demoMode';
import { triggerConfetti } from '../utils/confetti';
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

  // Confetti canvas ref (Task 2.6 - REQ for first habit creation)
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scroll to top and load habits on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
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

      // Sort habits alphabetically by name (case-insensitive)
      activeHabits.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

      setHabits(activeHabits);
    } catch (err) {
      logError('ManageHabitsPage:loadHabits', err);
      const appError = parseError(err);
      setError(formatErrorMessage(appError));
    } finally {
      setLoading(false);
    }
  };

  const handleHabitSaved = async () => {
    // Check if this is the first habit (before reloading)
    const isFirstHabit = habits.length === 0 && !editingHabit;

    // Reload habits after adding or updating
    await loadHabits();
    // Clear editing state and hide form
    setEditingHabit(null);
    setShowHabitForm(false);

    // Task 2.6: Trigger confetti on first habit creation
    if (isFirstHabit) {
      const confettiShown = localStorage.getItem('amaday_confetti_shown');
      if (confettiShown !== 'true' && confettiCanvasRef.current) {
        triggerConfetti(confettiCanvasRef.current);
        localStorage.setItem('amaday_confetti_shown', 'true');
      }
    }

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
      <div className="manage-habits-page manage-habits-page--loading">
        <div className="manage-habits-page__loading-text">
          Loading habits...
        </div>
      </div>
    );
  }

  return (
    <div className="manage-habits-page">
      <div className="manage-habits-page__container">
        {/* Page Header */}
        <header className="page-header">
          <h1 className="page-title">Manage Habits</h1>
        </header>

        {/* Error Display */}
        {error && (
          <div className="manage-habits-page__error" role="alert">
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
        {habits.length === 0 ? (
          <EmptyState
            iconName="Sunrise"
            title="Your habit garden awaits"
            message="Plant your first habit!"
            actionText="Add Habit"
            onAction={handleOpenHabitForm}
          />
        ) : (
          <ul className="habits-list">
            {habits.map((habit) => (
              <HabitListItem
                key={habit.habit_id}
                habit={habit}
                onEdit={handleEditHabit}
                onDelete={handleHabitDeleted}
              />
            ))}
          </ul>
        )}

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

      {/* Hidden canvas for confetti animation (Task 2.6) */}
      <canvas
        ref={confettiCanvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
        aria-hidden="true"
      />
    </div>
  );
};
