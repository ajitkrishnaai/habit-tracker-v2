/**
 * Data Validation Utilities
 *
 * Provides validation functions for user inputs and data integrity.
 * Ensures data meets requirements defined in PRD.
 */

import { storageService } from '../services/storage';
import type { Habit } from '../types/habit';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate habit name
 * Requirements:
 * - 1-100 characters
 * - Cannot be empty or only whitespace
 * - Must be unique (case-insensitive)
 *
 * @param name Habit name to validate
 * @param existingHabitId Optional ID of habit being edited (to exclude from duplicate check)
 * @returns Validation result
 */
export async function validateHabitName(
  name: string,
  existingHabitId?: string
): Promise<ValidationResult> {
  // Check if empty or only whitespace
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: 'Habit name cannot be empty',
    };
  }

  const trimmedName = name.trim();

  // Check length (1-100 characters)
  if (trimmedName.length < 1) {
    return {
      isValid: false,
      error: 'Habit name cannot be empty',
    };
  }

  if (trimmedName.length > 100) {
    return {
      isValid: false,
      error: 'Habit name cannot exceed 100 characters',
    };
  }

  // Check for duplicates (case-insensitive)
  try {
    const habits = await storageService.getHabits(true); // Get only active habits
    const duplicate = habits.find(
      (habit) =>
        habit.name.toLowerCase() === trimmedName.toLowerCase() &&
        habit.habit_id !== existingHabitId
    );

    if (duplicate) {
      return {
        isValid: false,
        error: 'A habit with this name already exists',
      };
    }
  } catch (error) {
    console.error('Error checking for duplicate habits:', error);
    // Continue with validation even if duplicate check fails
  }

  return { isValid: true };
}

/**
 * Validate category name
 * @param category Category to validate
 * @returns Validation result
 */
export function validateCategory(category: string | undefined): ValidationResult {
  // Category is optional
  if (!category) {
    return { isValid: true };
  }

  const trimmedCategory = category.trim();

  // If provided, must not be empty
  if (trimmedCategory.length === 0) {
    return {
      isValid: false,
      error: 'Category cannot be empty if provided',
    };
  }

  // Reasonable max length
  if (trimmedCategory.length > 50) {
    return {
      isValid: false,
      error: 'Category cannot exceed 50 characters',
    };
  }

  return { isValid: true };
}

/**
 * Validate date
 * Requirements:
 * - ISO 8601 format (YYYY-MM-DD)
 * - Cannot be more than 5 days in the past
 * - Cannot be in the future
 *
 * @param date Date string to validate
 * @returns Validation result
 */
export function validateDate(date: string): ValidationResult {
  // Check ISO 8601 format (YYYY-MM-DD)
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(date)) {
    return {
      isValid: false,
      error: 'Date must be in ISO 8601 format (YYYY-MM-DD)',
    };
  }

  // Parse date
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return {
      isValid: false,
      error: 'Invalid date',
    };
  }

  // Get today's date at midnight (local time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get date at midnight for comparison
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  // Check if date is in the future
  if (checkDate > today) {
    return {
      isValid: false,
      error: 'Date cannot be in the future',
    };
  }

  // Check if date is more than 5 days in the past
  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  if (checkDate < fiveDaysAgo) {
    return {
      isValid: false,
      error: 'Date cannot be more than 5 days in the past',
    };
  }

  return { isValid: true };
}

/**
 * Validate notes
 * Requirements:
 * - Maximum 5000 characters
 * - Optional (can be empty)
 *
 * @param notes Notes string to validate
 * @returns Validation result
 */
export function validateNotes(notes: string | undefined): ValidationResult {
  // Notes are optional
  if (!notes) {
    return { isValid: true };
  }

  // Check max length
  if (notes.length > 5000) {
    return {
      isValid: false,
      error: 'Notes cannot exceed 5000 characters',
    };
  }

  return { isValid: true };
}

/**
 * Validate log status
 * @param status Status to validate
 * @returns Validation result
 */
export function validateLogStatus(
  status: string
): ValidationResult {
  const validStatuses = ['done', 'not_done', 'no_data'];

  if (!validStatuses.includes(status)) {
    return {
      isValid: false,
      error: 'Status must be one of: done, not_done, no_data',
    };
  }

  return { isValid: true };
}

/**
 * Validate habit status
 * @param status Status to validate
 * @returns Validation result
 */
export function validateHabitStatus(status: string): ValidationResult {
  const validStatuses = ['active', 'inactive'];

  if (!validStatuses.includes(status)) {
    return {
      isValid: false,
      error: 'Status must be one of: active, inactive',
    };
  }

  return { isValid: true };
}

/**
 * Validate UUID format
 * @param id UUID to validate
 * @returns Validation result
 */
export function validateUUID(id: string): ValidationResult {
  // Simple UUID validation - checks for reasonable format
  if (!id || id.trim().length === 0) {
    return {
      isValid: false,
      error: 'ID cannot be empty',
    };
  }

  // Check minimum length for UUID-like strings
  if (id.length < 10) {
    return {
      isValid: false,
      error: 'ID is too short',
    };
  }

  return { isValid: true };
}

/**
 * Validate full habit object
 * @param habit Habit to validate
 * @param isNew Whether this is a new habit (checks name uniqueness)
 * @returns Validation result
 */
export async function validateHabit(
  habit: Partial<Habit>,
  isNew: boolean = false
): Promise<ValidationResult> {
  // Validate required fields
  if (!habit.name) {
    return {
      isValid: false,
      error: 'Habit name is required',
    };
  }

  // Validate name
  const nameValidation = await validateHabitName(
    habit.name,
    isNew ? undefined : habit.habit_id
  );
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  // Validate category if provided
  if (habit.category) {
    const categoryValidation = validateCategory(habit.category);
    if (!categoryValidation.isValid) {
      return categoryValidation;
    }
  }

  // Validate status if provided
  if (habit.status) {
    const statusValidation = validateHabitStatus(habit.status);
    if (!statusValidation.isValid) {
      return statusValidation;
    }
  }

  // Validate dates if provided
  if (habit.created_date) {
    // Created date can be any valid date (not restricted to 5 days)
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(habit.created_date)) {
      return {
        isValid: false,
        error: 'Created date must be in ISO 8601 format (YYYY-MM-DD)',
      };
    }
  }

  if (habit.modified_date) {
    // Modified date can be any valid date
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(habit.modified_date)) {
      return {
        isValid: false,
        error: 'Modified date must be in ISO 8601 format (YYYY-MM-DD)',
      };
    }
  }

  return { isValid: true };
}

/**
 * Sanitize habit name (trim whitespace)
 * @param name Habit name to sanitize
 * @returns Sanitized name
 */
export function sanitizeHabitName(name: string): string {
  return name.trim();
}

/**
 * Sanitize category (trim whitespace)
 * @param category Category to sanitize
 * @returns Sanitized category or undefined
 */
export function sanitizeCategory(category: string | undefined): string | undefined {
  if (!category) return undefined;
  const trimmed = category.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Sanitize notes (trim whitespace)
 * @param notes Notes to sanitize
 * @returns Sanitized notes or undefined
 */
export function sanitizeNotes(notes: string | undefined): string | undefined {
  if (!notes) return undefined;
  const trimmed = notes.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
