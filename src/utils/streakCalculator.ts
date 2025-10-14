/**
 * Streak Calculator Utility
 *
 * Calculates current and longest streaks for habit tracking.
 *
 * Current Streak: Consecutive "done" days from today backward
 * - Resets to 0 when "not_done" is encountered
 * - Stops counting at first "no_data" gap
 *
 * Longest Streak: Maximum consecutive "done" days in all history
 */

import { LogEntry } from '../types/logEntry';

/**
 * Calculate the current streak (consecutive done days from today backward)
 *
 * @param logs - Array of log entries for a habit, sorted by date
 * @returns Current streak count in days
 */
export const calculateCurrentStreak = (logs: LogEntry[]): number => {
  if (!logs || logs.length === 0) {
    return 0;
  }

  // Sort logs by date in descending order (newest first)
  const sortedLogs = [...logs].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from today and work backward
  for (let daysBack = 0; daysBack < sortedLogs.length; daysBack++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - daysBack);
    const checkDateStr = checkDate.toISOString().split('T')[0];

    // Find log entry for this date
    const logForDate = sortedLogs.find(log => log.date === checkDateStr);

    if (!logForDate) {
      // No data for this date - stop counting (gap in tracking)
      break;
    }

    if (logForDate.status === 'done') {
      currentStreak++;
    } else if (logForDate.status === 'not_done') {
      // Streak is broken by a "not_done" entry
      break;
    } else {
      // 'no_data' status - stop counting
      break;
    }
  }

  return currentStreak;
};

/**
 * Calculate the longest streak in all history
 *
 * @param logs - Array of log entries for a habit
 * @returns Longest streak count in days
 */
export const calculateLongestStreak = (logs: LogEntry[]): number => {
  if (!logs || logs.length === 0) {
    return 0;
  }

  // Sort logs by date in ascending order (oldest first)
  const sortedLogs = [...logs].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let longestStreak = 0;
  let currentStreakCount = 0;
  let previousDate: Date | null = null;

  for (const log of sortedLogs) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);

    if (log.status === 'done') {
      // Check if this is consecutive with previous date
      if (previousDate) {
        const dayDifference = Math.floor(
          (logDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDifference === 1) {
          // Consecutive day
          currentStreakCount++;
        } else {
          // Gap in dates - reset streak
          currentStreakCount = 1;
        }
      } else {
        // First "done" entry
        currentStreakCount = 1;
      }

      // Update longest streak if current is greater
      longestStreak = Math.max(longestStreak, currentStreakCount);
      previousDate = logDate;
    } else if (log.status === 'not_done') {
      // Streak is broken
      currentStreakCount = 0;
      previousDate = logDate;
    }
    // 'no_data' doesn't affect streak calculation (treated as gap)
  }

  return longestStreak;
};

/**
 * Calculate both current and longest streaks
 *
 * @param logs - Array of log entries for a habit
 * @returns Object with current and longest streak counts
 */
export const calculateStreaks = (logs: LogEntry[]): {
  current: number;
  longest: number;
} => {
  return {
    current: calculateCurrentStreak(logs),
    longest: calculateLongestStreak(logs),
  };
};
