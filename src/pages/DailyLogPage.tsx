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

import { useState, useEffect, useRef } from 'react';
import { DateNavigator } from '../components/DateNavigator';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { EmptyState } from '../components/EmptyState';
import { storageService } from '../services/storage';
import { syncService } from '../services/syncService';
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

export const DailyLogPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(getTodayAtMidnight());
  const [habitLogs, setHabitLogs] = useState<HabitLogState[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [hasUnsavedNotes, setHasUnsavedNotes] = useState<boolean>(false);

  const initialNotesRef = useRef<string>('');

  // Load habits and logs for the selected date
  useEffect(() => {
    loadDataForDate(currentDate);
  }, [currentDate]);

  // Track unsaved notes
  useEffect(() => {
    setHasUnsavedNotes(notes !== initialNotesRef.current);
  }, [notes]);

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
        setNotes('');
        initialNotesRef.current = '';
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

      setHabitLogs(habitLogStates);

      // Set notes from the first log entry that has notes
      const logWithNotes = logsForDate.find((log) => log.notes);
      const notesValue = logWithNotes?.notes || '';
      setNotes(notesValue);
      initialNotesRef.current = notesValue;

      setLoading(false);
    } catch (err) {
      console.error('Error loading data for date:', err);
      setError('Failed to load habits. Please try again.');
      setLoading(false);
    }
  };

  /**
   * Handle date change with unsaved notes warning
   */
  const handleDateChange = (newDate: Date) => {
    if (hasUnsavedNotes) {
      const confirmed = window.confirm(
        'You have unsaved notes. Are you sure you want to change the date? Your notes will be lost.'
      );
      if (!confirmed) return;
    }

    setCurrentDate(newDate);
  };

  /**
   * Handle toggle change for a habit
   */
  const handleToggleChange = async (habitId: string, newStatus: boolean) => {
    try {
      // Optimistic update
      setHabitLogs((prev) =>
        prev.map((hl) =>
          hl.habit.habit_id === habitId
            ? { ...hl, status: newStatus ? 'done' : 'not_done' }
            : hl
        )
      );

      // Find the habit log
      const habitLog = habitLogs.find((hl) => hl.habit.habit_id === habitId);
      if (!habitLog) return;

      const dateString = formatDateISO(currentDate);
      const timestamp = getCurrentTimestamp();
      const status = newStatus ? 'done' : 'not_done';

      // Create or update log entry
      const logEntry: LogEntry = habitLog.logEntry
        ? {
            ...habitLog.logEntry,
            status,
            timestamp,
            notes: notes || undefined,
          }
        : {
            log_id: generateUUID(),
            habit_id: habitId,
            date: dateString,
            status,
            timestamp,
            notes: notes || undefined,
          };

      // Save to local storage
      await storageService.saveLog(logEntry);

      // Update state with new log entry
      setHabitLogs((prev) =>
        prev.map((hl) =>
          hl.habit.habit_id === habitId ? { ...hl, logEntry, status } : hl
        )
      );

      // Trigger background sync
      triggerSync();
    } catch (err) {
      console.error('Error saving log entry:', err);
      setError('Failed to save. Changes will sync when possible.');

      // Revert optimistic update on error
      await loadDataForDate(currentDate);
    }
  };

  /**
   * Handle notes change
   */
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;

    // Validate notes length
    const validation = validateNotes(newNotes);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid notes');
      return;
    }

    setNotes(newNotes);
    setError(null);
  };

  /**
   * Save notes to all logged habits for this date
   */
  const handleNotesSave = async () => {
    try {
      const dateString = formatDateISO(currentDate);
      const timestamp = getCurrentTimestamp();

      // Update all log entries for this date with the notes
      const updatedLogs: LogEntry[] = [];

      for (const habitLog of habitLogs) {
        if (habitLog.status !== 'no_data') {
          const logEntry: LogEntry = habitLog.logEntry
            ? {
                ...habitLog.logEntry,
                notes: notes || undefined,
                timestamp,
              }
            : {
                log_id: generateUUID(),
                habit_id: habitLog.habit.habit_id,
                date: dateString,
                status: habitLog.status,
                timestamp,
                notes: notes || undefined,
              };

          updatedLogs.push(logEntry);
          await storageService.saveLog(logEntry);
        }
      }

      initialNotesRef.current = notes;
      setHasUnsavedNotes(false);

      // Update state
      setHabitLogs((prev) =>
        prev.map((hl) => {
          const updatedLog = updatedLogs.find((log) => log.habit_id === hl.habit.habit_id);
          return updatedLog ? { ...hl, logEntry: updatedLog } : hl;
        })
      );

      // Trigger background sync
      triggerSync();
    } catch (err) {
      console.error('Error saving notes:', err);
      setError('Failed to save notes. Please try again.');
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
          message="You haven't added any habits yet"
          actionText="Go to Manage Habits"
          actionLink="/manage-habits"
        />
      </div>
    );
  }

  return (
    <div className="daily-log-page">
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
          <span className="daily-log-page__sync-spinner" aria-hidden="true" />
          <span>Syncing...</span>
        </div>
      )}

      {/* Habits list */}
      <div className="daily-log-page__habits">
        <h2 className="daily-log-page__section-title">Today's Habits</h2>
        <ul className="daily-log-page__habits-list">
          {habitLogs.map(({ habit, status }) => (
            <li key={habit.habit_id} className="daily-log-page__habit-item">
              <div className="daily-log-page__habit-info">
                <span className="daily-log-page__habit-name">{habit.name}</span>
                {habit.category && (
                  <span className="daily-log-page__habit-category">{habit.category}</span>
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

      {/* Shared notes - Task 7.45: Ensure textarea has associated label */}
      <div className="daily-log-page__notes">
        <div className="daily-log-page__notes-header">
          <label htmlFor="daily-notes" className="daily-log-page__section-title">
            Notes
          </label>
          <span className="daily-log-page__notes-counter">
            {notes.length} / 5000
          </span>
        </div>
        <textarea
          id="daily-notes"
          className="daily-log-page__notes-textarea"
          placeholder="Add notes about your day (optional)..."
          value={notes}
          onChange={handleNotesChange}
          maxLength={5000}
          rows={4}
          aria-label="Daily notes for all habits"
        />
        {hasUnsavedNotes && (
          <button
            type="button"
            className="daily-log-page__notes-save-btn"
            onClick={handleNotesSave}
          >
            Save Notes
          </button>
        )}
      </div>
    </div>
  );
};
