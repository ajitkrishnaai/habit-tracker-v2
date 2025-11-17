/**
 * DailyLogPage Component
 *
 * The main daily logging interface where users mark habits as done/not done.
 * Features:
 * - Date navigation (today + 5 days back)
 * - Toggle switches for each habit
 * - Shared notes field for all habits on a given date
 * - Optimistic UI with background sync
 * - Unsaved changes detection
 */

import { useState, useEffect } from 'react';
import { DateNavigator } from '../components/DateNavigator';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { EmptyState } from '../components/EmptyState';
import { ReflectionModal } from '../components/ReflectionModal';
import { storageService } from '../services/storage';
import { syncService } from '../services/syncService';
import { supabaseDataService } from '../services/supabaseDataService';
import { demoModeService } from '../services/demoMode';
import { Toast } from '../components/Toast';
import { MigrationToast } from '../components/MigrationToast';
import type { Habit } from '../types/habit';
import type { LogEntry } from '../types/logEntry';
import {
  formatDateISO,
  getTodayAtMidnight,
  getCurrentTimestamp,
} from '../utils/dateHelpers';
import { generateUUID } from '../utils/uuid';
import { validateNotes } from '../utils/dataValidation';
import './DailyLogPage.css';

interface HabitLogState {
  habit: Habit;
  logEntry: LogEntry | null;
  status: 'done' | 'not_done' | 'no_data';
}

export interface PendingChange {
  habitId: string;
  habitName: string;
  category?: string;
  newStatus: 'done' | 'not_done';
  previousStatus: 'done' | 'not_done' | 'no_data';
}

export const DailyLogPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(getTodayAtMidnight());
  const [habitLogs, setHabitLogs] = useState<HabitLogState[]>([]);
  const [pendingChanges, setPendingChanges] = useState<Map<string, PendingChange>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Demo mode state (Task 3.5 - REQ-16, REQ-30)
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showMigrationToast, setShowMigrationToast] = useState(false);

  // Computed: check if there are unsaved changes
  const hasUnsavedChanges = pendingChanges.size > 0;

  // Load habits and logs for the selected date
  useEffect(() => {
    loadDataForDate(currentDate);
    // Clear pending changes when date changes
    setPendingChanges(new Map());
  }, [currentDate]);

  // Check for migration success toast (Task 3.5 - REQ-50)
  useEffect(() => {
    const migrationSuccess = sessionStorage.getItem('demo_migration_success');
    if (migrationSuccess) {
      setShowMigrationToast(true);
      sessionStorage.removeItem('demo_migration_success');
    }
  }, []);

  /**
   * Load habits and their log entries for the given date
   */
  const loadDataForDate = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);

      // Initialize storage
      await storageService.initDB();

      // Get all active habits
      const habits = await storageService.getHabits();
      const activeHabits = habits.filter((h) => h.status === 'active');

      if (activeHabits.length === 0) {
        setHabitLogs([]);
        setLoading(false);
        return;
      }

      // Get logs for the selected date
      const dateString = formatDateISO(date);
      const allLogs = await storageService.getLogs();
      const logsForDate = allLogs.filter((log) => log.date === dateString);

      // Create habit log state for each habit
      const habitLogStates: HabitLogState[] = activeHabits.map((habit) => {
        const logEntry = logsForDate.find((log) => log.habit_id === habit.habit_id);
        return {
          habit,
          logEntry: logEntry || null,
          status: logEntry?.status || 'no_data',
        };
      });

      // Sort habits alphabetically by name (case-insensitive)
      habitLogStates.sort((a, b) =>
        a.habit.name.toLowerCase().localeCompare(b.habit.name.toLowerCase())
      );

      setHabitLogs(habitLogStates);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data for date:', err);
      setError('Failed to load habits. Please try again.');
      setLoading(false);
    }
  };

  /**
   * Handle date change with unsaved changes warning
   */
  const handleDateChange = (newDate: Date) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to change the date? Your changes will be lost.'
      );
      if (!confirmed) return;
    }

    setCurrentDate(newDate);
  };

  /**
   * Handle toggle change for a habit (pending state only - no save yet)
   */
  const handleToggleChange = (habitId: string, newStatus: boolean) => {
    // Find the habit
    const habitLog = habitLogs.find((hl) => hl.habit.habit_id === habitId);
    if (!habitLog) return;

    const status: 'done' | 'not_done' = newStatus ? 'done' : 'not_done';

    // Update UI optimistically
    setHabitLogs((prev) =>
      prev.map((hl) =>
        hl.habit.habit_id === habitId ? { ...hl, status } : hl
      )
    );

    // Track pending change
    setPendingChanges((prev) => {
      const newPending = new Map(prev);
      newPending.set(habitId, {
        habitId,
        habitName: habitLog.habit.name,
        category: habitLog.habit.category,
        newStatus: status,
        previousStatus: habitLog.logEntry?.status || 'no_data',
      });
      return newPending;
    });
  };

  /**
   * Handle "Save Changes" button click - show brief animation then modal
   */
  const handleSaveChangesClick = () => {
    if (!hasUnsavedChanges) return;

    // Show "Saving..." state briefly
    setIsSaving(true);

    // After brief animation, show reflection modal
    setTimeout(() => {
      setIsSaving(false);
      setShowReflectionModal(true);
    }, 600);
  };

  /**
   * Save all pending changes with optional reflection notes
   */
  const handleSaveWithReflection = async (reflectionNotes?: string) => {
    try {
      setError(null);
      const dateString = formatDateISO(currentDate);
      const timestamp = getCurrentTimestamp();

      // Validate notes if provided
      if (reflectionNotes) {
        const validation = validateNotes(reflectionNotes);
        if (!validation.isValid) {
          setError(validation.error || 'Invalid notes');
          return;
        }
      }

      // Save each pending change
      const updatedLogs: LogEntry[] = [];

      for (const [habitId, change] of pendingChanges.entries()) {
        const habitLog = habitLogs.find((hl) => hl.habit.habit_id === habitId);
        if (!habitLog) continue;

        // Create or update log entry
        const logEntry: LogEntry = habitLog.logEntry
          ? {
              ...habitLog.logEntry,
              status: change.newStatus,
              timestamp,
              notes: reflectionNotes || undefined,
            }
          : {
              log_id: generateUUID(),
              habit_id: habitId,
              date: dateString,
              status: change.newStatus,
              timestamp,
              notes: reflectionNotes || undefined,
            };

        updatedLogs.push(logEntry);

        // Save to IndexedDB
        await storageService.saveLog(logEntry);

        // Save to Supabase
        try {
          const existingLogs = await supabaseDataService.getLogs(logEntry.habit_id, logEntry.date);
          const logExistsInSupabase = existingLogs.some(
            (l) => l.log_id === logEntry.log_id || (l.habit_id === logEntry.habit_id && l.date === logEntry.date)
          );

          if (logExistsInSupabase) {
            const existingLog = existingLogs.find(
              (l) => l.log_id === logEntry.log_id || (l.habit_id === logEntry.habit_id && l.date === logEntry.date)
            );
            if (existingLog) {
              await supabaseDataService.updateLog({
                ...existingLog,
                status: logEntry.status,
                notes: logEntry.notes || null,
              });
            }
          } else {
            await supabaseDataService.createLog({
              log_id: logEntry.log_id,
              habit_id: logEntry.habit_id,
              date: logEntry.date,
              status: logEntry.status,
              notes: logEntry.notes || null,
            });
          }
        } catch (supabaseError) {
          console.error('Supabase sync error:', supabaseError);
        }
      }

      // Update state
      setHabitLogs((prev) =>
        prev.map((hl) => {
          const updatedLog = updatedLogs.find((log) => log.habit_id === hl.habit.habit_id);
          return updatedLog ? { ...hl, logEntry: updatedLog } : hl;
        })
      );

      // Clear pending changes
      setPendingChanges(new Map());

      // Close modal
      setShowReflectionModal(false);

      // Trigger background sync
      triggerSync();

      // Demo mode tracking (Task 3.5 - REQ-16, REQ-30)
      if (demoModeService.isDemoMode()) {
        demoModeService.trackLogCompleted();

        const milestoneMsg = demoModeService.getMilestoneMessage();
        if (milestoneMsg) {
          setToastMessage(milestoneMsg);
          setShowToast(true);
        }
      }
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save changes. Please try again.');
    }
  };

  /**
   * Trigger background sync
   */
  const triggerSync = async () => {
    setSyncing(true);
    try {
      await syncService.syncToRemote();
    } catch (err) {
      console.error('Sync error:', err);
      // Don't show error to user - sync will retry automatically
    } finally {
      setSyncing(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="daily-log-page">
        <div className="daily-log-page__loading">
          <p>Loading habits...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no habits
  if (habitLogs.length === 0) {
    return (
      <div className="daily-log-page">
        <EmptyState
          iconName="Calendar"
          title="No habits yet"
          message="Add your first habit to get started!"
          actionText="Add Habit"
          actionLink="/manage-habits?add=true"
        />
      </div>
    );
  }

  return (
    <div className="daily-log-page">
      {/* Page Header */}
      <header className="page-header">
        <h1 className="page-title">Daily Tracker</h1>
        <p className="page-subtitle">Track your mindful practice</p>
      </header>

      {/* Date Navigator */}
      <DateNavigator
        currentDate={currentDate}
        onDateChange={handleDateChange}
        disabled={loading}
      />

      {/* Error message */}
      {error && (
        <div className="daily-log-page__error" role="alert">
          {error}
        </div>
      )}

      {/* Sync indicator */}
      {syncing && (
        <div className="daily-log-page__sync-indicator">
          <span className="daily-log-page__sync-spinner animate-spin" aria-hidden="true" />
          <span>Syncing...</span>
        </div>
      )}

      {/* Habits list */}
      <div className="daily-log-page__habits">
        <ul className="daily-log-page__habits-list">
          {habitLogs.map(({ habit, status }) => (
            <li key={habit.habit_id} className="card card--compact daily-log-page__habit-item">
              <div className="daily-log-page__habit-info">
                <span className="daily-log-page__habit-name">{habit.name}</span>
                {habit.category && (
                  <span className="badge badge--warning">{habit.category}</span>
                )}
              </div>
              <ToggleSwitch
                id={`toggle-${habit.habit_id}`}
                label={habit.name}
                checked={status === 'done'}
                onChange={(checked) => handleToggleChange(habit.habit_id, checked)}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Save Changes Button - fixed to bottom */}
      {hasUnsavedChanges && (
        <div className="daily-log-page__save-changes-container animate-slide-up-bounce">
          <button
            type="button"
            className={`daily-log-page__save-changes-btn animate-button-pulse ${isSaving ? 'daily-log-page__save-changes-btn--saving' : ''}`}
            onClick={handleSaveChangesClick}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="daily-log-page__save-spinner animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      )}

      {/* Reflection Modal */}
      {showReflectionModal && (
        <ReflectionModal
          pendingChanges={pendingChanges}
          onSave={handleSaveWithReflection}
          onSkip={() => handleSaveWithReflection(undefined)}
        />
      )}

      {/* Demo Mode Toasts (Task 3.5) */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
      {showMigrationToast && <MigrationToast />}
    </div>
  );
};
