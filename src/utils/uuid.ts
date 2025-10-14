/**
 * UUID Generation Utility
 *
 * Provides functions to generate unique identifiers for entities.
 * Uses crypto.randomUUID() when available (modern browsers),
 * falls back to a custom implementation for older browsers.
 */

/**
 * Generate a UUID v4 (random UUID)
 * @returns A UUID string in the format xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
export function generateUUID(): string {
  // Use crypto.randomUUID() if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate a habit ID
 * Uses prefix "habit_" for easy identification
 * @returns A habit ID string
 */
export function generateHabitId(): string {
  return `habit_${generateUUID()}`;
}

/**
 * Generate a log entry ID
 * Uses prefix "log_" for easy identification
 * @returns A log entry ID string
 */
export function generateLogId(): string {
  return `log_${generateUUID()}`;
}

/**
 * Validate if a string is a valid UUID format
 * @param uuid String to validate
 * @returns True if valid UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate if a string is a valid habit ID
 * @param id String to validate
 * @returns True if valid habit ID format
 */
export function isValidHabitId(id: string): boolean {
  if (!id.startsWith('habit_')) {
    return false;
  }
  const uuid = id.substring(6); // Remove "habit_" prefix
  return isValidUUID(uuid);
}

/**
 * Validate if a string is a valid log ID
 * @param id String to validate
 * @returns True if valid log ID format
 */
export function isValidLogId(id: string): boolean {
  if (!id.startsWith('log_')) {
    return false;
  }
  const uuid = id.substring(4); // Remove "log_" prefix
  return isValidUUID(uuid);
}

/**
 * Generate a short ID for operations or temporary use
 * Not guaranteed to be globally unique but suitable for short-lived operations
 * @returns A short ID string
 */
export function generateShortId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
