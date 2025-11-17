/**
 * Unit tests for DemoModeService
 *
 * Tests cover:
 * - Core functions (initialization, detection, metric tracking)
 * - Conversion trigger logic
 * - Milestone detection
 * - Expiry logic
 * - Data migration coordination
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { demoModeService, DemoMetrics } from './demoMode';
import * as auth from './auth';

// ============================================================================
// Test Setup
// ============================================================================

// Mock the auth module
vi.mock('./auth', () => ({
  isAuthenticated: vi.fn(),
}));

// Mock syncService for migration tests
vi.mock('./syncService', () => ({
  syncService: {
    fullSync: vi.fn(),
    syncFromRemote: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock storageService for migration tests
vi.mock('./storage', () => ({
  storageService: {
    getHabits: vi.fn().mockResolvedValue([]),
    getLogs: vi.fn().mockResolvedValue([]),
    clearAll: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock supabaseDataService for migration tests
vi.mock('./supabaseDataService', () => ({
  supabaseDataService: {
    createHabit: vi.fn().mockResolvedValue(undefined),
    createLog: vi.fn().mockResolvedValue(undefined),
  },
}));

/**
 * Helper function to set demo metrics in localStorage
 */
function setMockDemoMetrics(metrics: Partial<DemoMetrics>): void {
  const defaultMetrics: DemoMetrics = {
    demo_start_date: new Date().toISOString(),
    demo_habits_added: 0,
    demo_logs_completed: 0,
    demo_last_visit: new Date().toISOString(),
    demo_progress_visits: 0,
    demo_conversion_shown: false,
    ...metrics,
  };
  localStorage.setItem('habitTracker_demoMetrics', JSON.stringify(defaultMetrics));
}

/**
 * Helper function to get demo metrics from localStorage
 */
function getMockDemoMetrics(): DemoMetrics | null {
  const json = localStorage.getItem('habitTracker_demoMetrics');
  return json ? JSON.parse(json) : null;
}

// ============================================================================
// Test Suite: Core Functions
// ============================================================================

describe('DemoModeService - Core Functions', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Clear all mocks
    vi.clearAllMocks();

    // Default: user is not authenticated (demo mode)
    vi.mocked(auth.isAuthenticated).mockReturnValue(false);
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('initializeDemoMode()', () => {
    it('should initialize demo metrics with default values', async () => {
      await demoModeService.initializeDemoMode();

      const metrics = getMockDemoMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics?.demo_habits_added).toBe(0);
      expect(metrics?.demo_logs_completed).toBe(0);
      expect(metrics?.demo_progress_visits).toBe(0);
      expect(metrics?.demo_conversion_shown).toBe(false);
      expect(metrics?.demo_start_date).toBeDefined();
      expect(metrics?.demo_last_visit).toBeDefined();
    });

    it('should set demo_start_date to current time', async () => {
      const beforeInit = new Date();
      await demoModeService.initializeDemoMode();
      const afterInit = new Date();

      const metrics = getMockDemoMetrics();
      const startDate = new Date(metrics!.demo_start_date);

      expect(startDate.getTime()).toBeGreaterThanOrEqual(beforeInit.getTime());
      expect(startDate.getTime()).toBeLessThanOrEqual(afterInit.getTime());
    });

    it('should set demo_last_visit equal to demo_start_date', async () => {
      await demoModeService.initializeDemoMode();

      const metrics = getMockDemoMetrics();
      expect(metrics?.demo_last_visit).toBe(metrics?.demo_start_date);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      // Should not throw - error is logged but not propagated
      expect(() => demoModeService.initializeDemoMode()).not.toThrow();

      // Restore original setItem
      localStorage.setItem = originalSetItem;
    });
  });

  describe('getDemoMetrics()', () => {
    it('should return null if no metrics exist', () => {
      const metrics = demoModeService.getDemoMetrics();
      expect(metrics).toBeNull();
    });

    it('should return parsed metrics if they exist', () => {
      const testMetrics: DemoMetrics = {
        demo_start_date: '2025-10-19T10:00:00.000Z',
        demo_habits_added: 5,
        demo_logs_completed: 3,
        demo_last_visit: '2025-10-19T12:00:00.000Z',
        demo_progress_visits: 2,
        demo_conversion_shown: true,
      };

      setMockDemoMetrics(testMetrics);

      const metrics = demoModeService.getDemoMetrics();
      expect(metrics).toEqual(testMetrics);
    });

    it('should validate schema and return null for invalid data', () => {
      // Set invalid data (missing required field)
      localStorage.setItem(
        'habitTracker_demoMetrics',
        JSON.stringify({ demo_habits_added: 5 })
      );

      const metrics = demoModeService.getDemoMetrics();
      expect(metrics).toBeNull();

      // Should have cleared corrupted data
      expect(localStorage.getItem('habitTracker_demoMetrics')).toBeNull();
    });

    it('should validate counter values are non-negative', () => {
      setMockDemoMetrics({ demo_habits_added: -1 });

      const metrics = demoModeService.getDemoMetrics();
      expect(metrics).toBeNull();

      // Should have cleared invalid data
      expect(localStorage.getItem('habitTracker_demoMetrics')).toBeNull();
    });

    it('should handle JSON parse errors', () => {
      // Set invalid JSON
      localStorage.setItem('habitTracker_demoMetrics', 'invalid json{');

      const metrics = demoModeService.getDemoMetrics();
      expect(metrics).toBeNull();

      // Should have cleared corrupted data
      expect(localStorage.getItem('habitTracker_demoMetrics')).toBeNull();
    });
  });

  describe('isDemoMode()', () => {
    it('should return true when user is not authenticated', () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(false);
      expect(demoModeService.isDemoMode()).toBe(true);
    });

    it('should return false when user is authenticated', () => {
      vi.mocked(auth.isAuthenticated).mockReturnValue(true);
      expect(demoModeService.isDemoMode()).toBe(false);
    });
  });

  describe('trackHabitAdded()', () => {
    it('should increment demo_habits_added counter', () => {
      setMockDemoMetrics({ demo_habits_added: 2 });

      demoModeService.trackHabitAdded();

      const metrics = getMockDemoMetrics();
      expect(metrics?.demo_habits_added).toBe(3);
    });

    it('should update demo_last_visit timestamp', () => {
      const oldTimestamp = new Date('2025-10-18T10:00:00.000Z').toISOString();
      setMockDemoMetrics({ demo_last_visit: oldTimestamp });

      const beforeTrack = new Date();
      demoModeService.trackHabitAdded();
      const afterTrack = new Date();

      const metrics = getMockDemoMetrics();
      const lastVisit = new Date(metrics!.demo_last_visit);

      expect(lastVisit.getTime()).toBeGreaterThanOrEqual(beforeTrack.getTime());
      expect(lastVisit.getTime()).toBeLessThanOrEqual(afterTrack.getTime());
    });

    it('should do nothing if no metrics exist', () => {
      // No metrics in localStorage
      demoModeService.trackHabitAdded();

      const metrics = getMockDemoMetrics();
      expect(metrics).toBeNull();
    });
  });

  describe('trackLogCompleted()', () => {
    it('should increment demo_logs_completed counter', () => {
      setMockDemoMetrics({ demo_logs_completed: 1 });

      demoModeService.trackLogCompleted();

      const metrics = getMockDemoMetrics();
      expect(metrics?.demo_logs_completed).toBe(2);
    });

    it('should update demo_last_visit timestamp', () => {
      const oldTimestamp = new Date('2025-10-18T10:00:00.000Z').toISOString();
      setMockDemoMetrics({ demo_last_visit: oldTimestamp });

      demoModeService.trackLogCompleted();

      const metrics = getMockDemoMetrics();
      expect(new Date(metrics!.demo_last_visit).getTime()).toBeGreaterThan(
        new Date(oldTimestamp).getTime()
      );
    });

    it('should do nothing if no metrics exist', () => {
      demoModeService.trackLogCompleted();
      expect(getMockDemoMetrics()).toBeNull();
    });
  });

  describe('trackProgressVisit()', () => {
    it('should increment demo_progress_visits counter', () => {
      setMockDemoMetrics({ demo_progress_visits: 0 });

      demoModeService.trackProgressVisit();

      const metrics = getMockDemoMetrics();
      expect(metrics?.demo_progress_visits).toBe(1);
    });

    it('should update demo_last_visit timestamp', () => {
      const oldTimestamp = new Date('2025-10-18T10:00:00.000Z').toISOString();
      setMockDemoMetrics({ demo_last_visit: oldTimestamp });

      demoModeService.trackProgressVisit();

      const metrics = getMockDemoMetrics();
      expect(new Date(metrics!.demo_last_visit).getTime()).toBeGreaterThan(
        new Date(oldTimestamp).getTime()
      );
    });

    it('should do nothing if no metrics exist', () => {
      demoModeService.trackProgressVisit();
      expect(getMockDemoMetrics()).toBeNull();
    });
  });

  describe('updateDemoMetrics()', () => {
    it('should merge updates with existing metrics', () => {
      setMockDemoMetrics({
        demo_habits_added: 2,
        demo_logs_completed: 1,
      });

      demoModeService.updateDemoMetrics({
        demo_habits_added: 3,
      });

      const metrics = getMockDemoMetrics();
      expect(metrics?.demo_habits_added).toBe(3);
      expect(metrics?.demo_logs_completed).toBe(1); // Should remain unchanged
    });

    it('should always update demo_last_visit', () => {
      const oldTimestamp = new Date('2025-10-18T10:00:00.000Z').toISOString();
      setMockDemoMetrics({ demo_last_visit: oldTimestamp });

      demoModeService.updateDemoMetrics({});

      const metrics = getMockDemoMetrics();
      expect(new Date(metrics!.demo_last_visit).getTime()).toBeGreaterThan(
        new Date(oldTimestamp).getTime()
      );
    });

    it('should handle QuotaExceededError gracefully', () => {
      setMockDemoMetrics({ demo_habits_added: 0 });

      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });

      // Should not throw
      expect(() =>
        demoModeService.updateDemoMetrics({ demo_habits_added: 1 })
      ).not.toThrow();

      // Restore original setItem
      localStorage.setItem = originalSetItem;
    });

    it('should do nothing if no metrics exist', () => {
      demoModeService.updateDemoMetrics({ demo_habits_added: 5 });
      expect(getMockDemoMetrics()).toBeNull();
    });
  });

  describe('clearDemoData()', () => {
    it('should remove demo metrics from localStorage', () => {
      setMockDemoMetrics({ demo_habits_added: 5 });

      demoModeService.clearDemoData();

      expect(localStorage.getItem('habitTracker_demoMetrics')).toBeNull();
    });

    it('should remove shown milestones from localStorage', () => {
      localStorage.setItem(
        'habitTracker_shownMilestones',
        JSON.stringify(['first_habit'])
      );

      demoModeService.clearDemoData();

      expect(localStorage.getItem('habitTracker_shownMilestones')).toBeNull();
    });

    it('should clear both metrics and milestones', () => {
      setMockDemoMetrics({ demo_habits_added: 5 });
      localStorage.setItem(
        'habitTracker_shownMilestones',
        JSON.stringify(['first_habit', 'three_habits'])
      );

      demoModeService.clearDemoData();

      expect(localStorage.getItem('habitTracker_demoMetrics')).toBeNull();
      expect(localStorage.getItem('habitTracker_shownMilestones')).toBeNull();
    });

    it('should not throw if data does not exist', () => {
      expect(() => demoModeService.clearDemoData()).not.toThrow();
    });
  });
});

// ============================================================================
// Test Suite: Conversion Triggers
// ============================================================================

describe('DemoModeService - Conversion Triggers', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(auth.isAuthenticated).mockReturnValue(false);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('shouldShowConversionModal()', () => {
    it('should return "habits_threshold" after adding 3 habits', () => {
      setMockDemoMetrics({
        demo_habits_added: 3,
        demo_logs_completed: 0,
        demo_progress_visits: 0,
        demo_conversion_shown: false,
      });

      const trigger = demoModeService.shouldShowConversionModal();
      expect(trigger).toBe('habits_threshold');
    });

    it('should return "first_log" after completing 1 log', () => {
      setMockDemoMetrics({
        demo_habits_added: 1,
        demo_logs_completed: 1,
        demo_progress_visits: 0,
        demo_conversion_shown: false,
      });

      const trigger = demoModeService.shouldShowConversionModal();
      expect(trigger).toBe('first_log');
    });

    it('should return "progress_page" after 1 progress visit', () => {
      setMockDemoMetrics({
        demo_habits_added: 1,
        demo_logs_completed: 0,
        demo_progress_visits: 1,
        demo_conversion_shown: false,
      });

      const trigger = demoModeService.shouldShowConversionModal();
      expect(trigger).toBe('progress_page');
    });

    it('should return null if no trigger conditions are met', () => {
      setMockDemoMetrics({
        demo_habits_added: 2,
        demo_logs_completed: 0,
        demo_progress_visits: 0,
        demo_conversion_shown: false,
      });

      const trigger = demoModeService.shouldShowConversionModal();
      expect(trigger).toBeNull();
    });

    it('should return null if conversion modal already shown', () => {
      setMockDemoMetrics({
        demo_habits_added: 5,
        demo_logs_completed: 2,
        demo_progress_visits: 1,
        demo_conversion_shown: true, // Already shown
      });

      const trigger = demoModeService.shouldShowConversionModal();
      expect(trigger).toBeNull();
    });

    it('should return null if no metrics exist', () => {
      const trigger = demoModeService.shouldShowConversionModal();
      expect(trigger).toBeNull();
    });

    it('should prioritize habits_threshold over first_log', () => {
      setMockDemoMetrics({
        demo_habits_added: 3,
        demo_logs_completed: 1, // Both triggers met
        demo_progress_visits: 0,
        demo_conversion_shown: false,
      });

      const trigger = demoModeService.shouldShowConversionModal();
      expect(trigger).toBe('habits_threshold'); // Should return higher priority
    });

    it('should prioritize first_log over progress_page', () => {
      setMockDemoMetrics({
        demo_habits_added: 2,
        demo_logs_completed: 1,
        demo_progress_visits: 1, // Both triggers met
        demo_conversion_shown: false,
      });

      const trigger = demoModeService.shouldShowConversionModal();
      expect(trigger).toBe('first_log'); // Should return higher priority
    });

    it('should trigger habits_threshold with exactly 3 habits', () => {
      setMockDemoMetrics({
        demo_habits_added: 3,
        demo_conversion_shown: false,
      });

      expect(demoModeService.shouldShowConversionModal()).toBe('habits_threshold');
    });

    it('should trigger habits_threshold with more than 3 habits', () => {
      setMockDemoMetrics({
        demo_habits_added: 10,
        demo_conversion_shown: false,
      });

      expect(demoModeService.shouldShowConversionModal()).toBe('habits_threshold');
    });

    it('should trigger first_log with exactly 1 log', () => {
      setMockDemoMetrics({
        demo_habits_added: 0,
        demo_logs_completed: 1,
        demo_conversion_shown: false,
      });

      expect(demoModeService.shouldShowConversionModal()).toBe('first_log');
    });

    it('should trigger progress_page with exactly 1 visit', () => {
      setMockDemoMetrics({
        demo_habits_added: 0,
        demo_logs_completed: 0,
        demo_progress_visits: 1,
        demo_conversion_shown: false,
      });

      expect(demoModeService.shouldShowConversionModal()).toBe('progress_page');
    });
  });

  describe('markConversionShown()', () => {
    it('should set demo_conversion_shown to true', () => {
      setMockDemoMetrics({ demo_conversion_shown: false });

      demoModeService.markConversionShown();

      const metrics = getMockDemoMetrics();
      expect(metrics?.demo_conversion_shown).toBe(true);
    });

    it('should update demo_last_visit timestamp', () => {
      const oldTimestamp = new Date('2025-10-18T10:00:00.000Z').toISOString();
      setMockDemoMetrics({
        demo_last_visit: oldTimestamp,
        demo_conversion_shown: false,
      });

      demoModeService.markConversionShown();

      const metrics = getMockDemoMetrics();
      expect(new Date(metrics!.demo_last_visit).getTime()).toBeGreaterThan(
        new Date(oldTimestamp).getTime()
      );
    });

    it('should work even if already marked as shown', () => {
      setMockDemoMetrics({ demo_conversion_shown: true });

      demoModeService.markConversionShown();

      const metrics = getMockDemoMetrics();
      expect(metrics?.demo_conversion_shown).toBe(true);
    });
  });
});

// ============================================================================
// Test Suite: Milestone Celebrations
// ============================================================================

describe('DemoModeService - Milestone Celebrations', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(auth.isAuthenticated).mockReturnValue(false);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getMilestoneMessage()', () => {
    it('should return "Great start!" message for first habit', () => {
      setMockDemoMetrics({ demo_habits_added: 1 });

      const message = demoModeService.getMilestoneMessage();
      expect(message).toBe('✓ Great start! Add 2 more to build your routine.');
    });

    it('should return "3 habits!" message for 3rd habit', () => {
      setMockDemoMetrics({ demo_habits_added: 3 });

      const message = demoModeService.getMilestoneMessage();
      expect(message).toBe("🎉 You've added 3 habits! Come back tomorrow to start your streak.");
    });

    it('should return "First log complete!" message for first log', () => {
      setMockDemoMetrics({ demo_logs_completed: 1 });

      const message = demoModeService.getMilestoneMessage();
      expect(message).toBe('🎉 First log complete! Come back tomorrow to build your streak.');
    });

    it('should return "Building momentum!" message after 3 days in demo', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      setMockDemoMetrics({ demo_start_date: threeDaysAgo.toISOString() });

      const message = demoModeService.getMilestoneMessage();
      expect(message).toBe("📈 You're building momentum! Sign in to unlock streak tracking.");
    });

    it('should return null if no new milestone reached', () => {
      setMockDemoMetrics({ demo_habits_added: 2 }); // Not at milestone threshold

      const message = demoModeService.getMilestoneMessage();
      expect(message).toBeNull();
    });

    it('should return null if no metrics exist', () => {
      const message = demoModeService.getMilestoneMessage();
      expect(message).toBeNull();
    });

    it('should not repeat first_habit milestone', () => {
      setMockDemoMetrics({ demo_habits_added: 1 });

      // First call should return message
      const message1 = demoModeService.getMilestoneMessage();
      expect(message1).toBe('✓ Great start! Add 2 more to build your routine.');

      // Second call should return null (already shown)
      const message2 = demoModeService.getMilestoneMessage();
      expect(message2).toBeNull();
    });

    it('should not repeat three_habits milestone', () => {
      setMockDemoMetrics({ demo_habits_added: 3 });

      // First call should return message
      const message1 = demoModeService.getMilestoneMessage();
      expect(message1).not.toBeNull();

      // Second call should return null
      const message2 = demoModeService.getMilestoneMessage();
      expect(message2).toBeNull();
    });

    it('should not repeat first_log milestone', () => {
      setMockDemoMetrics({ demo_logs_completed: 1 });

      const message1 = demoModeService.getMilestoneMessage();
      expect(message1).not.toBeNull();

      const message2 = demoModeService.getMilestoneMessage();
      expect(message2).toBeNull();
    });

    it('should not repeat three_days milestone', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      setMockDemoMetrics({ demo_start_date: threeDaysAgo.toISOString() });

      const message1 = demoModeService.getMilestoneMessage();
      expect(message1).not.toBeNull();

      const message2 = demoModeService.getMilestoneMessage();
      expect(message2).toBeNull();
    });

    it('should track shown milestones in localStorage', () => {
      setMockDemoMetrics({ demo_habits_added: 1 });

      demoModeService.getMilestoneMessage();

      const shown = JSON.parse(
        localStorage.getItem('habitTracker_shownMilestones') || '[]'
      );
      expect(shown).toContain('first_habit');
    });

    it('should persist shown milestones across service calls', () => {
      setMockDemoMetrics({ demo_habits_added: 1 });

      // First call shows milestone
      demoModeService.getMilestoneMessage();

      // Update metrics to add more habits
      setMockDemoMetrics({ demo_habits_added: 3 });

      // Should show three_habits milestone, not first_habit again
      const message = demoModeService.getMilestoneMessage();
      expect(message).toBe("🎉 You've added 3 habits! Come back tomorrow to start your streak.");
    });

    it('should handle multiple milestones in correct order', () => {
      // Start with 1 habit
      setMockDemoMetrics({ demo_habits_added: 1 });
      expect(demoModeService.getMilestoneMessage()).toBe(
        '✓ Great start! Add 2 more to build your routine.'
      );

      // Add 2 more habits (now at 3 total)
      setMockDemoMetrics({ demo_habits_added: 3 });
      expect(demoModeService.getMilestoneMessage()).toBe(
        "🎉 You've added 3 habits! Come back tomorrow to start your streak."
      );

      // Complete first log
      setMockDemoMetrics({ demo_habits_added: 3, demo_logs_completed: 1 });
      expect(demoModeService.getMilestoneMessage()).toBe(
        '🎉 First log complete! Come back tomorrow to build your streak.'
      );

      // Wait 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      setMockDemoMetrics({
        demo_start_date: threeDaysAgo.toISOString(),
        demo_habits_added: 3,
        demo_logs_completed: 1,
      });
      expect(demoModeService.getMilestoneMessage()).toBe(
        "📈 You're building momentum! Sign in to unlock streak tracking."
      );

      // No more milestones
      expect(demoModeService.getMilestoneMessage()).toBeNull();
    });

    it('should not show first_habit milestone if counter skips past 1', () => {
      // This can happen if we track incorrectly or data is corrupted
      setMockDemoMetrics({ demo_habits_added: 2 });

      const message = demoModeService.getMilestoneMessage();
      expect(message).toBeNull(); // No milestone for 2 habits
    });

    it('should handle exactly 4 days in demo (past three_days threshold)', () => {
      const fourDaysAgo = new Date();
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
      setMockDemoMetrics({ demo_start_date: fourDaysAgo.toISOString() });

      const message = demoModeService.getMilestoneMessage();
      expect(message).toBe("📈 You're building momentum! Sign in to unlock streak tracking.");
    });

    it('should not show three_days milestone before day 3', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      setMockDemoMetrics({ demo_start_date: twoDaysAgo.toISOString() });

      const message = demoModeService.getMilestoneMessage();
      expect(message).toBeNull();
    });
  });
});

// ============================================================================
// Test Suite: Demo Expiry
// ============================================================================

describe('DemoModeService - Demo Expiry', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(auth.isAuthenticated).mockReturnValue(false);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getDaysInDemo()', () => {
    it('should return 0 on day 1', () => {
      const now = new Date();
      setMockDemoMetrics({ demo_start_date: now.toISOString() });

      const days = demoModeService.getDaysInDemo();
      expect(days).toBe(0);
    });

    it('should return 0 if no metrics exist', () => {
      const days = demoModeService.getDaysInDemo();
      expect(days).toBe(0);
    });

    it('should calculate correct days after time passes (3 days)', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      setMockDemoMetrics({ demo_start_date: threeDaysAgo.toISOString() });

      const days = demoModeService.getDaysInDemo();
      expect(days).toBe(3);
    });

    it('should calculate correct days after time passes (7 days)', () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      setMockDemoMetrics({ demo_start_date: sevenDaysAgo.toISOString() });

      const days = demoModeService.getDaysInDemo();
      expect(days).toBe(7);
    });

    it('should calculate correct days after time passes (10 days)', () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      setMockDemoMetrics({ demo_start_date: tenDaysAgo.toISOString() });

      const days = demoModeService.getDaysInDemo();
      expect(days).toBe(10);
    });

    it('should handle invalid demo_start_date and return 0', () => {
      setMockDemoMetrics({ demo_start_date: 'invalid-date' });

      const days = demoModeService.getDaysInDemo();
      expect(days).toBe(0);
    });

    it('should handle empty string demo_start_date and return 0', () => {
      setMockDemoMetrics({ demo_start_date: '' });

      const days = demoModeService.getDaysInDemo();
      expect(days).toBe(0);
    });

    it('should use floor() to round down partial days', () => {
      // 1.5 days ago
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 36); // 36 hours = 1.5 days

      setMockDemoMetrics({ demo_start_date: oneDayAgo.toISOString() });

      const days = demoModeService.getDaysInDemo();
      expect(days).toBe(1); // Should floor to 1, not round to 2
    });

    it('should handle exactly 24 hours as 1 day', () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      setMockDemoMetrics({ demo_start_date: oneDayAgo.toISOString() });

      const days = demoModeService.getDaysInDemo();
      expect(days).toBe(1);
    });
  });

  describe('shouldExpireDemo()', () => {
    it('should return false before day 7', () => {
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

      setMockDemoMetrics({ demo_start_date: sixDaysAgo.toISOString() });

      expect(demoModeService.shouldExpireDemo()).toBe(false);
    });

    it('should return false on day 1', () => {
      const now = new Date();
      setMockDemoMetrics({ demo_start_date: now.toISOString() });

      expect(demoModeService.shouldExpireDemo()).toBe(false);
    });

    it('should return false on day 3', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      setMockDemoMetrics({ demo_start_date: threeDaysAgo.toISOString() });

      expect(demoModeService.shouldExpireDemo()).toBe(false);
    });

    it('should return false on day 6', () => {
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

      setMockDemoMetrics({ demo_start_date: sixDaysAgo.toISOString() });

      expect(demoModeService.shouldExpireDemo()).toBe(false);
    });

    it('should return true on day 7', () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      setMockDemoMetrics({ demo_start_date: sevenDaysAgo.toISOString() });

      expect(demoModeService.shouldExpireDemo()).toBe(true);
    });

    it('should return true after day 7', () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      setMockDemoMetrics({ demo_start_date: tenDaysAgo.toISOString() });

      expect(demoModeService.shouldExpireDemo()).toBe(true);
    });

    it('should return false if no metrics exist', () => {
      expect(demoModeService.shouldExpireDemo()).toBe(false);
    });

    it('should return false if demo_start_date is invalid', () => {
      setMockDemoMetrics({ demo_start_date: 'invalid-date' });

      expect(demoModeService.shouldExpireDemo()).toBe(false);
    });
  });
});

// ============================================================================
// Test Suite: Data Migration
// ============================================================================

describe('DemoModeService - Data Migration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.mocked(auth.isAuthenticated).mockReturnValue(false);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('migrateDemoData()', () => {
    it('should call syncService.syncFromRemote() to pull data after upload', async () => {
      setMockDemoMetrics({ demo_habits_added: 3 });

      // Import the mocked services
      const { syncService } = await import('./syncService');
      const { storageService } = await import('./storage');

      // Mock empty data in IndexedDB
      vi.mocked(storageService.getHabits).mockResolvedValue([]);
      vi.mocked(storageService.getLogs).mockResolvedValue([]);

      await demoModeService.migrateDemoData();

      expect(syncService.syncFromRemote).toHaveBeenCalledTimes(1);
    });

    it('should clear demo data after successful sync', async () => {
      setMockDemoMetrics({ demo_habits_added: 5 });
      localStorage.setItem(
        'habitTracker_shownMilestones',
        JSON.stringify(['first_habit'])
      );

      // Import the mocked services
      const { syncService } = await import('./syncService');
      const { storageService } = await import('./storage');

      // Mock empty data in IndexedDB
      vi.mocked(storageService.getHabits).mockResolvedValue([]);
      vi.mocked(storageService.getLogs).mockResolvedValue([]);
      vi.mocked(syncService.syncFromRemote).mockResolvedValueOnce(undefined);

      await demoModeService.migrateDemoData();

      // Should have cleared both localStorage keys
      expect(localStorage.getItem('habitTracker_demoMetrics')).toBeNull();
      expect(localStorage.getItem('habitTracker_shownMilestones')).toBeNull();
    });

    it('should propagate errors if sync fails', async () => {
      setMockDemoMetrics({ demo_habits_added: 3 });

      // Import the mocked services
      const { syncService } = await import('./syncService');
      const { storageService } = await import('./storage');

      // Mock empty data in IndexedDB
      vi.mocked(storageService.getHabits).mockResolvedValue([]);
      vi.mocked(storageService.getLogs).mockResolvedValue([]);

      const syncError = new Error('Network error');
      vi.mocked(syncService.syncFromRemote).mockRejectedValueOnce(syncError);

      await expect(demoModeService.migrateDemoData()).rejects.toThrow('Network error');
    });

    it('should clear demo data in Step 2 even if Step 3 (syncFromRemote) fails', async () => {
      setMockDemoMetrics({ demo_habits_added: 5 });

      // Import the mocked services
      const { syncService } = await import('./syncService');
      const { storageService } = await import('./storage');

      // Mock empty data in IndexedDB
      vi.mocked(storageService.getHabits).mockResolvedValue([]);
      vi.mocked(storageService.getLogs).mockResolvedValue([]);

      vi.mocked(syncService.syncFromRemote).mockRejectedValueOnce(new Error('Sync failed'));

      try {
        await demoModeService.migrateDemoData();
      } catch (error) {
        // Expected to fail at Step 3
      }

      // Demo data was cleared in Step 2, before Step 3 failed
      // Note: This means users cannot retry migration if Step 3 fails
      expect(localStorage.getItem('habitTracker_demoMetrics')).toBeNull();
    });

    it('should log appropriate messages during migration', async () => {
      setMockDemoMetrics({ demo_habits_added: 3 });

      // Spy on console.log
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Import the mocked services
      const { syncService } = await import('./syncService');
      const { storageService } = await import('./storage');

      // Mock empty data in IndexedDB
      vi.mocked(storageService.getHabits).mockResolvedValue([]);
      vi.mocked(storageService.getLogs).mockResolvedValue([]);
      vi.mocked(syncService.syncFromRemote).mockResolvedValueOnce(undefined);

      await demoModeService.migrateDemoData();

      expect(consoleSpy).toHaveBeenCalledWith('[DemoMode] Starting data migration...');
      expect(consoleSpy).toHaveBeenCalledWith('[DemoMode] Migration complete!');

      consoleSpy.mockRestore();
    });

    it('should log error message if migration fails', async () => {
      setMockDemoMetrics({ demo_habits_added: 3 });

      // Spy on console.error
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Import the mocked services
      const { syncService } = await import('./syncService');
      const { storageService } = await import('./storage');

      // Mock empty data in IndexedDB
      vi.mocked(storageService.getHabits).mockResolvedValue([]);
      vi.mocked(storageService.getLogs).mockResolvedValue([]);

      const syncError = new Error('Network timeout');
      vi.mocked(syncService.syncFromRemote).mockRejectedValueOnce(syncError);

      try {
        await demoModeService.migrateDemoData();
      } catch (error) {
        // Expected to fail
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[DemoMode] Migration failed at some step:',
        syncError
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
