/**
 * Reflection Data Builder
 * Aggregates habit data, streaks, and notes for AI reflection generation
 */

import { storageService } from '../services/storage';
import { calculateStreaks } from './streakCalculator';
import { analyzeNotes } from './notesAnalyzer';
import { formatDateISO, getTodayAtMidnight } from './dateHelpers';
import type { ReflectionPayload, ReflectionHabit, RecentSummary } from '../types/reflection';
import type { LogEntry } from '../types/logEntry';
import type { Habit } from '../types/habit';

/**
 * Represents a pending change to a habit (from DailyLogPage)
 */
export interface PendingChange {
  habitId: string;
  habitName: string;
  habitCategory?: string;
  newStatus: 'done' | 'not_done';
  previousStatus?: 'done' | 'not_done' | 'no_data';
}

/**
 * Determine time of day based on current hour
 * @returns 'morning' | 'afternoon' | 'evening'
 */
export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';
  } else {
    return 'evening';
  }
}

/**
 * Filter logs to those within last N days
 */
function getLogsFromLastNDays(logs: LogEntry[], days: number): LogEntry[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  return logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= cutoffDate;
  });
}

/**
 * Get unique dates from logs
 */
function getUniqueDates(logs: LogEntry[]): string[] {
  const dates = new Set(logs.map(log => log.date));
  return Array.from(dates);
}

/**
 * Build reflection data for a single habit
 */
async function buildHabitReflectionData(
  pendingChange: PendingChange,
  allLogs: LogEntry[]
): Promise<ReflectionHabit> {
  const { habitId, habitName, habitCategory, newStatus } = pendingChange;

  // Filter logs for this specific habit
  const habitLogs = allLogs.filter(log => log.habit_id === habitId);

  // Calculate streaks
  const streaks = calculateStreaks(habitLogs);

  // Calculate completion stats for last 7 days
  const logsLast7 = getLogsFromLastNDays(habitLogs, 7);
  const completedLast7 = logsLast7.filter(log => log.status === 'done').length;

  // Calculate completion stats for last 30 days
  const logsLast30 = getLogsFromLastNDays(habitLogs, 30);
  const completedLast30 = logsLast30.filter(log => log.status === 'done').length;

  return {
    name: habitName,
    status: newStatus,
    streak_days: streaks.current,
    completed_last_7_days: completedLast7,
    completed_last_30_days: completedLast30,
    category: habitCategory || undefined
  };
}

/**
 * Generate notable observations from habit patterns
 */
function generateNotableObservations(
  habits: Habit[],
  allLogs: LogEntry[]
): string[] {
  const observations: string[] = [];
  const logsLast30 = getLogsFromLastNDays(allLogs, 30);

  for (const habit of habits) {
    const habitLogs = logsLast30.filter(log => log.habit_id === habit.habit_id);
    const logsWithNotes = habitLogs.filter(log => log.notes && log.notes.trim().length > 0);

    // Only analyze if habit has 3+ notes in last 30 days
    if (logsWithNotes.length >= 3) {
      try {
        const analysis = analyzeNotes(logsWithNotes);

        // Check for positive sentiment
        if (analysis.sentimentSummary.averageScore > 1) {
          // Extract common positive keywords
          const positiveKeywords = analysis.keywords.slice(0, 2);

          if (positiveKeywords.length > 0) {
            observations.push(
              `User often mentions feeling ${positiveKeywords.join(' and ')} on days with ${habit.name}.`
            );
          } else {
            observations.push(
              `User often mentions positive feelings on days with ${habit.name}.`
            );
          }
        }

        // Check for negative sentiment
        if (analysis.sentimentSummary.averageScore < -1) {
          observations.push(
            `User mentions challenges with ${habit.name}.`
          );
        }

        // Limit to top 3 observations
        if (observations.length >= 3) {
          break;
        }
      } catch (error) {
        // Silently skip if notes analysis fails
        console.warn(`[reflectionDataBuilder] Failed to analyze notes for habit ${habit.name}:`, error);
      }
    }
  }

  return observations;
}

/**
 * Build complete reflection payload from pending changes and user note
 * @param pendingChanges - Map of habitId → PendingChange from DailyLogPage
 * @param noteText - User's free-text "I feel..." note
 * @returns ReflectionPayload ready to send to Edge Function
 */
export async function buildReflectionPayload(
  pendingChanges: Map<string, PendingChange>,
  noteText: string
): Promise<ReflectionPayload> {
  try {
    // Get all logs from IndexedDB
    const allLogs = await storageService.getLogs();
    const allHabits = await storageService.getHabits();

    // Get today's date
    const date = formatDateISO(getTodayAtMidnight());
    const time_of_day = getTimeOfDay();

    // Trim and truncate note text (max 1000 chars to save API tokens)
    const trimmedNote = noteText.trim();
    const truncatedNote = trimmedNote.length > 1000
      ? trimmedNote.slice(0, 1000)
      : trimmedNote;

    // Build habit data for each pending change
    const habits: ReflectionHabit[] = [];
    for (const pendingChange of pendingChanges.values()) {
      const habitData = await buildHabitReflectionData(pendingChange, allLogs);
      habits.push(habitData);
    }

    // Build recent summary
    const logsLast7 = getLogsFromLastNDays(allLogs, 7);
    const logsLast30 = getLogsFromLastNDays(allLogs, 30);

    const days_tracked_last_7 = getUniqueDates(logsLast7).length;
    const days_tracked_last_30 = getUniqueDates(logsLast30).length;

    const notable_observations = generateNotableObservations(allHabits, allLogs);

    const recent_summary: RecentSummary = {
      days_tracked_last_7,
      days_tracked_last_30,
      notable_observations
    };

    // Assemble final payload
    return {
      date,
      time_of_day,
      note_text: truncatedNote,
      habits,
      recent_summary
    };

  } catch (error) {
    // On error, return minimal payload (Edge Function will still generate reflection)
    console.error('[reflectionDataBuilder] Error building payload:', error);

    return {
      date: formatDateISO(getTodayAtMidnight()),
      time_of_day: getTimeOfDay(),
      note_text: noteText.trim().slice(0, 1000),
      habits: [],
      recent_summary: {
        days_tracked_last_7: 0,
        days_tracked_last_30: 0,
        notable_observations: []
      }
    };
  }
}
