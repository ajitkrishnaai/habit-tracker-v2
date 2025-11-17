/**
 * Demo Mode Service
 *
 * Manages the shadow account onboarding flow that allows users to try the app
 * without authentication. Tracks engagement metrics, triggers conversion prompts,
 * and coordinates data migration when users sign up.
 *
 * Architecture:
 * - localStorage: Stores demo metrics (counters, timestamps, flags)
 * - IndexedDB: Stores actual habit/log data via existing storageService
 * - Migration: Leverages existing syncService.fullSync() on signup
 */

import { isAuthenticated } from './auth';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

/**
 * Demo metrics tracked in localStorage to optimize conversion triggers
 * and provide milestone celebrations
 */
export interface DemoMetrics {
  /** ISO 8601 timestamp when demo mode was initialized */
  demo_start_date: string;
  /** Number of habits added during demo session */
  demo_habits_added: number;
  /** Number of daily logs completed */
  demo_logs_completed: number;
  /** ISO 8601 timestamp of last activity (updated on every metric change) */
  demo_last_visit: string;
  /** Number of times user visited Progress page */
  demo_progress_visits: number;
  /** Whether conversion modal has been shown (only show once per session) */
  demo_conversion_shown: boolean;
}

/**
 * Conversion trigger types - each represents a moment of peak engagement
 * where we prompt the user to sign up
 */
export type ConversionTrigger = 'habits_threshold' | 'first_log' | 'progress_page';

/**
 * Milestone identifiers to prevent duplicate notifications
 */
export type MilestoneId = 'first_habit' | 'three_habits' | 'first_log' | 'three_days';

// ============================================================================
// Constants
// ============================================================================

/** localStorage key for demo metrics */
const DEMO_METRICS_KEY = 'habitTracker_demoMetrics';

/** localStorage key for shown milestones array */
const SHOWN_MILESTONES_KEY = 'habitTracker_shownMilestones';

/** Demo mode expiry duration in days */
const DEMO_EXPIRY_DAYS = 7;

// ============================================================================
// Demo Mode Service Class
// ============================================================================

/**
 * Singleton service for managing demo mode functionality
 *
 * @example
 * ```typescript
 * // Initialize demo mode on "Try Without Signing In" click
 * demoModeService.initializeDemoMode();
 *
 * // Track user engagement
 * demoModeService.trackHabitAdded();
 *
 * // Check for conversion triggers
 * const trigger = demoModeService.shouldShowConversionModal();
 * if (trigger) {
 *   showConversionModal(trigger);
 *   demoModeService.markConversionShown();
 * }
 * ```
 */
class DemoModeService {
  /**
   * Checks if the current session is in demo mode (not authenticated)
   *
   * @returns true if user is NOT authenticated (demo mode), false otherwise
   */
  isDemoMode(): boolean {
    return !isAuthenticated(); // Demo mode = no Supabase session
  }

  /**
   * Initializes demo mode by creating default metrics in localStorage
   * Called when user clicks "Begin Your Practice" button on Welcome page
   *
   * Important: This function is now IDEMPOTENT.
   * - If demo metrics already exist → user is resuming an existing session → preserve data
   * - If no metrics exist → user is starting a new session → clear IndexedDB and initialize
   *
   * This prevents data loss when users navigate back to welcome page via logo click.
   */
  async initializeDemoMode(): Promise<void> {
    const now = new Date().toISOString();

    // Check if there's an existing demo session
    const existingMetrics = this.getDemoMetrics();

    if (existingMetrics) {
      // User is returning to an existing demo session - preserve their data
      console.log('[DemoMode] Resuming existing demo session (data preserved)');

      // Just update last_visit timestamp to track activity
      this.updateDemoMetrics({
        demo_last_visit: now,
      });

      return; // Early exit - do not clear data!
    }

    // No existing metrics - this is a NEW demo session
    console.log('[DemoMode] Initializing new demo session - clearing all data');
    try {
      const { storageService } = await import('./storage');
      await storageService.clearAll();
      console.log('[DemoMode] IndexedDB cleared for fresh demo session');
    } catch (error) {
      console.error('[DemoMode] Failed to clear IndexedDB:', error);
      // Non-blocking - continue initialization
    }

    // Initialize fresh metrics for new session
    const metrics: DemoMetrics = {
      demo_start_date: now,
      demo_habits_added: 0,
      demo_logs_completed: 0,
      demo_last_visit: now,
      demo_progress_visits: 0,
      demo_conversion_shown: false,
    };

    try {
      localStorage.setItem(DEMO_METRICS_KEY, JSON.stringify(metrics));
      console.log('[DemoMode] Initialized demo mode with default metrics');
    } catch (error) {
      console.error('[DemoMode] Failed to initialize demo mode:', error);
      // Non-blocking - app can still function without metrics
    }
  }

  /**
   * Retrieves demo metrics from localStorage with validation
   *
   * @returns DemoMetrics object if valid data exists, null otherwise
   */
  getDemoMetrics(): DemoMetrics | null {
    try {
      const json = localStorage.getItem(DEMO_METRICS_KEY);
      if (!json) return null;

      const metrics = JSON.parse(json) as DemoMetrics;

      // Validate schema to prevent issues from corrupted data
      if (
        typeof metrics.demo_start_date !== 'string' ||
        typeof metrics.demo_habits_added !== 'number' ||
        typeof metrics.demo_logs_completed !== 'number' ||
        typeof metrics.demo_last_visit !== 'string' ||
        typeof metrics.demo_progress_visits !== 'number' ||
        typeof metrics.demo_conversion_shown !== 'boolean'
      ) {
        console.error('[DemoMode] Invalid metrics schema, clearing corrupted data');
        this.clearDemoData();
        return null;
      }

      // Validate counters are non-negative
      if (
        metrics.demo_habits_added < 0 ||
        metrics.demo_logs_completed < 0 ||
        metrics.demo_progress_visits < 0
      ) {
        console.error('[DemoMode] Invalid counter values (negative), clearing corrupted data');
        this.clearDemoData();
        return null;
      }

      return metrics;
    } catch (error) {
      console.error('[DemoMode] Failed to read demo metrics, clearing:', error);
      this.clearDemoData();
      return null;
    }
  }

  /**
   * Updates demo metrics in localStorage (merges with existing data)
   * Automatically updates demo_last_visit timestamp
   *
   * @param updates - Partial metrics to update
   */
  updateDemoMetrics(updates: Partial<DemoMetrics>): void {
    try {
      const current = this.getDemoMetrics();
      if (!current) {
        console.warn('[DemoMode] No metrics to update, skipping');
        return;
      }

      const updated: DemoMetrics = {
        ...current,
        ...updates,
        demo_last_visit: new Date().toISOString(), // Always update last visit
      };

      localStorage.setItem(DEMO_METRICS_KEY, JSON.stringify(updated));
    } catch (error) {
      // Handle quota exceeded error gracefully
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('[DemoMode] localStorage quota exceeded, cannot update metrics');
      } else {
        console.error('[DemoMode] Failed to update metrics:', error);
      }
      // Non-blocking - don't throw, just log
    }
  }

  /**
   * Clears all demo data from localStorage and IndexedDB
   * Called on expiry or after successful migration
   */
  async clearDemoData(): Promise<void> {
    try {
      // Clear localStorage
      localStorage.removeItem(DEMO_METRICS_KEY);
      localStorage.removeItem(SHOWN_MILESTONES_KEY);
      console.log('[DemoMode] Cleared all demo data from localStorage');

      // Clear IndexedDB to prevent stale data in future demo sessions
      const { storageService } = await import('./storage');
      await storageService.clearAll();
      console.log('[DemoMode] Cleared all demo data from IndexedDB');
    } catch (error) {
      console.error('[DemoMode] Failed to clear demo data:', error);
    }
  }

  /**
   * Tracks when a habit is added in demo mode
   * Increments demo_habits_added counter
   */
  trackHabitAdded(): void {
    const metrics = this.getDemoMetrics();
    if (!metrics) return;

    this.updateDemoMetrics({
      demo_habits_added: metrics.demo_habits_added + 1,
    });

    console.log(`[DemoMode] Habit added (total: ${metrics.demo_habits_added + 1})`);
  }

  /**
   * Tracks when a daily log is completed in demo mode
   * Increments demo_logs_completed counter
   */
  trackLogCompleted(): void {
    const metrics = this.getDemoMetrics();
    if (!metrics) return;

    this.updateDemoMetrics({
      demo_logs_completed: metrics.demo_logs_completed + 1,
    });

    console.log(`[DemoMode] Log completed (total: ${metrics.demo_logs_completed + 1})`);
  }

  /**
   * Tracks when user visits Progress page in demo mode
   * Increments demo_progress_visits counter
   */
  trackProgressVisit(): void {
    const metrics = this.getDemoMetrics();
    if (!metrics) return;

    this.updateDemoMetrics({
      demo_progress_visits: metrics.demo_progress_visits + 1,
    });

    console.log(`[DemoMode] Progress page visited (total: ${metrics.demo_progress_visits + 1})`);
  }

  /**
   * Checks if conversion modal should be shown based on engagement triggers
   *
   * @returns Trigger type if modal should be shown, null otherwise
   *
   * Priority order:
   * 1. habits_threshold (3+ habits added)
   * 2. first_log (1+ log completed)
   * 3. progress_page (1+ progress visit)
   */
  shouldShowConversionModal(): ConversionTrigger | null {
    const metrics = this.getDemoMetrics();
    if (!metrics) return null;

    // Only show modal once per session
    if (metrics.demo_conversion_shown) return null;

    // Check triggers in priority order
    if (metrics.demo_habits_added >= 3) {
      return 'habits_threshold';
    }

    if (metrics.demo_logs_completed >= 1) {
      return 'first_log';
    }

    if (metrics.demo_progress_visits >= 1) {
      return 'progress_page';
    }

    return null;
  }

  /**
   * Marks that the conversion modal has been shown
   * Prevents showing the modal multiple times
   */
  markConversionShown(): void {
    this.updateDemoMetrics({
      demo_conversion_shown: true,
    });

    console.log('[DemoMode] Conversion modal marked as shown');
  }

  /**
   * Checks if a new milestone was reached and returns appropriate message
   * Each milestone only shows once (tracked in localStorage)
   *
   * @returns Milestone message if new milestone reached, null otherwise
   *
   * Milestones:
   * - first_habit: "✓ Great start! Add 2 more to build your routine."
   * - three_habits: "🎉 You've added 3 habits! Come back tomorrow to start your streak."
   * - first_log: "🎉 First log complete! Come back tomorrow to build your streak."
   * - three_days: "📈 You're building momentum! Sign in to unlock streak tracking."
   */
  getMilestoneMessage(): string | null {
    const metrics = this.getDemoMetrics();
    if (!metrics) return null;

    // Get list of already-shown milestones
    const shownMilestones = this.getShownMilestones();

    // Check for first habit milestone
    if (metrics.demo_habits_added === 1 && !shownMilestones.includes('first_habit')) {
      this.markMilestoneShown('first_habit');
      return '✓ Great start! Add 2 more to build your routine.';
    }

    // Check for 3 habits milestone
    if (metrics.demo_habits_added === 3 && !shownMilestones.includes('three_habits')) {
      this.markMilestoneShown('three_habits');
      return "🎉 You've added 3 habits! Come back tomorrow to start your streak.";
    }

    // Check for first log milestone
    if (metrics.demo_logs_completed === 1 && !shownMilestones.includes('first_log')) {
      this.markMilestoneShown('first_log');
      return '🎉 First log complete! Come back tomorrow to build your streak.';
    }

    // Check for 3 days in demo milestone
    const daysInDemo = this.getDaysInDemo();
    if (daysInDemo >= 3 && !shownMilestones.includes('three_days')) {
      this.markMilestoneShown('three_days');
      return "📈 You're building momentum! Sign in to unlock streak tracking.";
    }

    return null;
  }

  /**
   * Retrieves the list of milestones that have already been shown
   *
   * @returns Array of milestone IDs
   */
  private getShownMilestones(): MilestoneId[] {
    try {
      const json = localStorage.getItem(SHOWN_MILESTONES_KEY);
      if (!json) return [];

      const milestones = JSON.parse(json);
      if (!Array.isArray(milestones)) return [];

      return milestones as MilestoneId[];
    } catch (error) {
      console.error('[DemoMode] Failed to read shown milestones:', error);
      return [];
    }
  }

  /**
   * Marks a milestone as shown to prevent duplicate notifications
   *
   * @param milestoneId - The milestone identifier to mark as shown
   */
  private markMilestoneShown(milestoneId: MilestoneId): void {
    try {
      const shown = this.getShownMilestones();
      if (!shown.includes(milestoneId)) {
        shown.push(milestoneId);
        localStorage.setItem(SHOWN_MILESTONES_KEY, JSON.stringify(shown));
        console.log(`[DemoMode] Milestone marked as shown: ${milestoneId}`);
      }
    } catch (error) {
      console.error('[DemoMode] Failed to mark milestone as shown:', error);
    }
  }

  /**
   * Calculates the number of days elapsed since demo mode started
   *
   * @returns Number of days in demo mode (0 if invalid start date)
   */
  getDaysInDemo(): number {
    const metrics = this.getDemoMetrics();
    if (!metrics) return 0;

    const start = new Date(metrics.demo_start_date);
    if (isNaN(start.getTime())) {
      console.error('[DemoMode] Invalid demo_start_date');
      return 0;
    }

    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Checks if demo data should expire (7+ days elapsed)
   *
   * @returns true if demo has expired, false otherwise
   */
  shouldExpireDemo(): boolean {
    const daysInDemo = this.getDaysInDemo();
    return daysInDemo >= DEMO_EXPIRY_DAYS;
  }

  /**
   * Migrates demo data to authenticated account
   * Called automatically after successful signup/login if demo metrics exist
   *
   * Process:
   * 1. Calls existing syncService.fullSync() to sync IndexedDB → Supabase
   * 2. Clears demo data from localStorage AND IndexedDB
   * 3. Re-syncs from Supabase to repopulate IndexedDB with authenticated data
   * 4. Propagates errors to caller for error handling
   *
   * @throws Error if migration fails (caller should handle)
   */
  async migrateDemoData(): Promise<void> {
    console.log('[DemoMode] Starting data migration...');

    try {
      // Import services dynamically to avoid circular dependencies
      const { syncService } = await import('./syncService');
      const { storageService } = await import('./storage');
      const { supabaseDataService } = await import('./supabaseDataService');

      // DEBUG: Check what data exists before migration
      const preHabits = await storageService.getHabits();
      const preLogs = await storageService.getLogs();
      console.log(`[DemoMode] Pre-migration check: ${preHabits.length} habits, ${preLogs.length} logs in IndexedDB`);

      // Step 1: Manually upload ALL IndexedDB data to Supabase
      // (fullSync only processes queued operations, but demo data was never queued)
      console.log('[DemoMode] Step 1: Uploading all habits and logs to Supabase...');

      // Upload habits
      for (const habit of preHabits) {
        try {
          await supabaseDataService.createHabit({
            habit_id: habit.habit_id,
            name: habit.name,
            category: habit.category,
            status: habit.status,
          });
        } catch (error) {
          console.error(`[DemoMode] Failed to upload habit ${habit.habit_id}:`, error);
          // Continue with other habits
        }
      }
      console.log(`[DemoMode] Uploaded ${preHabits.length} habits to Supabase`);

      // Upload logs
      for (const log of preLogs) {
        try {
          await supabaseDataService.createLog({
            log_id: log.log_id,
            habit_id: log.habit_id,
            date: log.date,
            status: log.status,
            notes: log.notes || null,
          });
        } catch (error) {
          console.error(`[DemoMode] Failed to upload log ${log.log_id}:`, error);
          // Continue with other logs
        }
      }
      console.log(`[DemoMode] Uploaded ${preLogs.length} logs to Supabase`);
      console.log('[DemoMode] Step 1 complete: Demo data uploaded to Supabase');

      // Step 2: Clear demo data (localStorage + IndexedDB)
      console.log('[DemoMode] Step 2: Clearing local demo data...');
      await this.clearDemoData();
      console.log('[DemoMode] Step 2 complete: Local demo data cleared');

      // DEBUG: Verify IndexedDB is empty
      const postClearHabits = await storageService.getHabits();
      const postClearLogs = await storageService.getLogs();
      console.log(`[DemoMode] Post-clear check: ${postClearHabits.length} habits, ${postClearLogs.length} logs in IndexedDB`);

      // Step 3: Pull data back from Supabase to repopulate IndexedDB
      // This ensures data comes from single source of truth (Supabase)
      console.log('[DemoMode] Step 3: Pulling data from Supabase...');
      await syncService.syncFromRemote();
      console.log('[DemoMode] Step 3 complete: Data re-synced from Supabase');

      // DEBUG: Final verification
      const finalHabits = await storageService.getHabits();
      const finalLogs = await storageService.getLogs();
      console.log(`[DemoMode] Final check: ${finalHabits.length} habits, ${finalLogs.length} logs in IndexedDB`);
      console.log('[DemoMode] Migration complete!');
    } catch (error) {
      console.error('[DemoMode] Migration failed at some step:', error);
      // Re-throw error - caller will handle (show error banner, retry, etc.)
      throw error;
    }
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

/**
 * Singleton instance of DemoModeService
 * Import this in components and services
 */
export const demoModeService = new DemoModeService();
