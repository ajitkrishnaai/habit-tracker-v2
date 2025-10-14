/**
 * Date Helper Utilities
 *
 * Provides date manipulation and formatting functions for the habit tracker.
 * Uses date-fns for reliable date operations.
 */

import { format, subDays, addDays, differenceInDays, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Maximum number of days a user can navigate backward from today
 */
export const MAX_PAST_DAYS = 5;

/**
 * Format a date as ISO 8601 (YYYY-MM-DD)
 * Used for storing dates in database
 */
export const formatDateISO = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Format a date for display to the user
 * Examples: "Today, October 13" or "October 12, 2025"
 */
export const formatDateDisplay = (date: Date): string => {
  if (isToday(date)) {
    return `Today, ${format(date, 'MMMM d')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'MMMM d')}`;
  }
  return format(date, 'MMMM d, yyyy');
};

/**
 * Get the date N days before the given date
 */
export const getPreviousDate = (date: Date, days: number = 1): Date => {
  return subDays(date, days);
};

/**
 * Get the date N days after the given date
 */
export const getNextDate = (date: Date, days: number = 1): Date => {
  return addDays(date, days);
};

/**
 * Check if a date is within the allowed past range (5 days)
 */
export const isWithinAllowedPastRange = (date: Date): boolean => {
  const today = new Date();
  const daysInPast = differenceInDays(today, date);
  return daysInPast >= 0 && daysInPast <= MAX_PAST_DAYS;
};

/**
 * Check if navigating to previous day is allowed
 */
export const canNavigateToPreviousDay = (currentDate: Date): boolean => {
  const previousDay = getPreviousDate(currentDate);
  return isWithinAllowedPastRange(previousDay);
};

/**
 * Check if the given date is today
 */
export const isTodayDate = (date: Date): boolean => {
  return isToday(date);
};

/**
 * Parse an ISO date string to a Date object
 */
export const parseISODate = (dateString: string): Date => {
  return parseISO(dateString);
};

/**
 * Get today's date at midnight (00:00:00)
 */
export const getTodayAtMidnight = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Get current timestamp as ISO 8601 string with timezone
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
