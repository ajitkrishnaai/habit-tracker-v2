/**
 * Percentage Calculator Utility
 *
 * Calculates completion percentage for habit tracking.
 *
 * Formula: (done count / total logged days) × 100
 * - Only counts done and not_done days (excludes no_data)
 * - Returns both fraction format and percentage
 */

import { LogEntry } from '../types/logEntry';

export interface CompletionStats {
  doneCount: number;
  totalLoggedDays: number;
  percentage: number;
  fractionText: string; // e.g., "17/20 days"
  percentageText: string; // e.g., "85%"
}

/**
 * Calculate completion percentage for a habit
 *
 * @param logs - Array of log entries for a habit
 * @returns Completion statistics including percentage and fraction
 */
export const calculateCompletionPercentage = (
  logs: LogEntry[]
): CompletionStats => {
  if (!logs || logs.length === 0) {
    return {
      doneCount: 0,
      totalLoggedDays: 0,
      percentage: 0,
      fractionText: '0/0 days',
      percentageText: '0%',
    };
  }

  // Filter out "no_data" entries - only count actual logged days
  const loggedEntries = logs.filter(
    (log) => log.status === 'done' || log.status === 'not_done'
  );

  // Count "done" entries
  const doneCount = loggedEntries.filter((log) => log.status === 'done').length;
  const totalLoggedDays = loggedEntries.length;

  // Calculate percentage (handle division by zero)
  const percentage =
    totalLoggedDays > 0 ? (doneCount / totalLoggedDays) * 100 : 0;

  // Round to 1 decimal place
  const roundedPercentage = Math.round(percentage * 10) / 10;

  return {
    doneCount,
    totalLoggedDays,
    percentage: roundedPercentage,
    fractionText: `${doneCount}/${totalLoggedDays} days`,
    percentageText: `${roundedPercentage}%`,
  };
};

/**
 * Format completion stats for display
 *
 * @param stats - Completion statistics
 * @returns Formatted string (e.g., "17/20 days - 85%")
 */
export const formatCompletionStats = (stats: CompletionStats): string => {
  return `${stats.fractionText} - ${stats.percentageText}`;
};
