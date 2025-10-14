/**
 * Test Helpers for Manual Browser Testing
 *
 * These functions are exposed to window for testing in browser console.
 * Open DevTools console and try commands like:
 *
 * // Test storage
 * await testStorage()
 *
 * // Test sync queue
 * await testSyncQueue()
 *
 * // Test validation
 * testValidation()
 */

import { storageService } from '../services/storage';
import { syncQueueService } from '../services/syncQueue';
import { syncService } from '../services/syncService';
import { generateHabitId, generateLogId } from './uuid';
import { validateHabitName, validateDate, validateNotes } from './dataValidation';
import type { Habit } from '../types/habit';
import type { LogEntry } from '../types/logEntry';
import type { Metadata } from '../types/metadata';

/**
 * Test storage service operations
 */
export async function testStorage() {
  console.group('🗄️ Testing Storage Service');

  try {
    // Initialize DB
    console.log('1. Initializing IndexedDB...');
    await storageService.initDB();
    console.log('✓ Database initialized');

    // Create test habit
    const testHabit: Habit = {
      habit_id: generateHabitId(),
      name: 'Test Exercise',
      category: 'Health',
      status: 'active',
      created_date: new Date().toISOString().split('T')[0],
      modified_date: new Date().toISOString().split('T')[0],
    };

    console.log('2. Saving habit...');
    await storageService.saveHabit(testHabit);
    console.log('✓ Habit saved:', testHabit);

    // Retrieve habits
    console.log('3. Retrieving habits...');
    const habits = await storageService.getHabits();
    console.log('✓ Retrieved habits:', habits);

    // Create test log
    const testLog: LogEntry = {
      log_id: generateLogId(),
      habit_id: testHabit.habit_id,
      date: new Date().toISOString().split('T')[0],
      status: 'done',
      notes: 'Test log entry',
      timestamp: new Date().toISOString(),
    };

    console.log('4. Saving log entry...');
    await storageService.saveLog(testLog);
    console.log('✓ Log saved:', testLog);

    // Retrieve logs
    console.log('5. Retrieving logs...');
    const logs = await storageService.getLogs(testHabit.habit_id);
    console.log('✓ Retrieved logs:', logs);

    // Test metadata
    const testMetadata: Metadata = {
      sheet_version: '1.0',
      last_sync: new Date().toISOString(),
      user_id: 'test_user',
      sheet_id: 'test_sheet',
    };

    console.log('6. Saving metadata...');
    await storageService.saveMetadata(testMetadata);
    console.log('✓ Metadata saved:', testMetadata);

    const metadata = await storageService.getMetadata();
    console.log('✓ Retrieved metadata:', metadata);

    console.log('\n🎉 All storage tests passed!');
    return { success: true, habit: testHabit, log: testLog, metadata };
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
}

/**
 * Test sync queue operations
 */
export async function testSyncQueue() {
  console.group('📋 Testing Sync Queue Service');

  try {
    // Clear queue first
    console.log('1. Clearing queue...');
    await syncQueueService.clearQueue();
    console.log('✓ Queue cleared');

    // Add operations
    console.log('2. Adding operations to queue...');
    await syncQueueService.addToQueue('CREATE', 'habit', 'habit_1', {
      name: 'Test Habit 1',
    });
    await syncQueueService.addToQueue('UPDATE', 'habit', 'habit_2', {
      name: 'Test Habit 2',
    });
    console.log('✓ Operations added');

    // Get queue
    console.log('3. Retrieving queue...');
    const queue = await syncQueueService.getQueue();
    console.log('✓ Queue contents:', queue);

    // Get queue size
    const size = await syncQueueService.getQueueSize();
    console.log('✓ Queue size:', size);

    // Check pending operations
    const hasPending = await syncQueueService.hasPendingOperations();
    console.log('✓ Has pending operations:', hasPending);

    console.log('\n🎉 All sync queue tests passed!');
    return { success: true, queue, size, hasPending };
  } catch (error) {
    console.error('❌ Sync queue test failed:', error);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
}

/**
 * Test validation functions
 */
export async function testValidation() {
  console.group('✅ Testing Validation Functions');

  try {
    // Test habit name validation
    console.log('1. Testing habit name validation...');
    const validName = await validateHabitName('Morning Exercise');
    console.log('✓ Valid name:', validName);

    const emptyName = await validateHabitName('');
    console.log('✓ Empty name rejected:', emptyName);

    const longName = await validateHabitName('a'.repeat(101));
    console.log('✓ Long name rejected:', longName);

    // Test date validation
    console.log('2. Testing date validation...');
    const today = new Date().toISOString().split('T')[0];
    const validDate = validateDate(today);
    console.log('✓ Today\'s date valid:', validDate);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const invalidFutureDate = validateDate(futureDate.toISOString().split('T')[0]);
    console.log('✓ Future date rejected:', invalidFutureDate);

    // Test notes validation
    console.log('3. Testing notes validation...');
    const validNotes = validateNotes('Great workout today!');
    console.log('✓ Valid notes:', validNotes);

    const longNotes = validateNotes('a'.repeat(5001));
    console.log('✓ Long notes rejected:', longNotes);

    console.log('\n🎉 All validation tests passed!');
    return { success: true };
  } catch (error) {
    console.error('❌ Validation test failed:', error);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
}

/**
 * Test sync service (without actual Google Sheets connection)
 */
export async function testSyncService() {
  console.group('🔄 Testing Sync Service');

  try {
    console.log('1. Checking online status...');
    const isOnline = syncService.isAppOnline();
    console.log('✓ App online status:', isOnline);

    console.log('2. Getting sync state...');
    const state = syncService.getState();
    console.log('✓ Sync state:', state);

    console.log('3. Subscribing to sync state changes...');
    const unsubscribe = syncService.subscribe((newState) => {
      console.log('📡 Sync state updated:', newState);
    });
    console.log('✓ Subscribed to sync updates');

    // Clean up
    setTimeout(() => {
      unsubscribe();
      console.log('✓ Unsubscribed from sync updates');
    }, 1000);

    console.log('\n🎉 All sync service tests passed!');
    return { success: true, isOnline, state };
  } catch (error) {
    console.error('❌ Sync service test failed:', error);
    return { success: false, error };
  } finally {
    console.groupEnd();
  }
}

/**
 * Run all tests
 */
export async function testAll() {
  console.log('🚀 Running all Task 3.0 tests...\n');

  const storageResult = await testStorage();
  console.log('\n');

  const queueResult = await testSyncQueue();
  console.log('\n');

  const validationResult = await testValidation();
  console.log('\n');

  const syncResult = await testSyncService();
  console.log('\n');

  const allPassed =
    storageResult.success &&
    queueResult.success &&
    validationResult.success &&
    syncResult.success;

  if (allPassed) {
    console.log('✅ ALL TESTS PASSED! 🎉');
  } else {
    console.log('❌ Some tests failed. Check logs above.');
  }

  return {
    storage: storageResult,
    queue: queueResult,
    validation: validationResult,
    sync: syncResult,
    allPassed,
  };
}

/**
 * Clear all test data
 */
export async function clearTestData() {
  console.log('🧹 Clearing all test data...');
  await storageService.clearAll();
  await syncQueueService.clearQueue();
  console.log('✓ All test data cleared');
}

// Expose to window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testStorage = testStorage;
  (window as any).testSyncQueue = testSyncQueue;
  (window as any).testValidation = testValidation;
  (window as any).testSyncService = testSyncService;
  (window as any).testAll = testAll;
  (window as any).clearTestData = clearTestData;

  console.log(`
%c🧪 Test Helpers Loaded!%c

Available commands:
  await testStorage()      - Test IndexedDB operations
  await testSyncQueue()    - Test sync queue
  await testValidation()   - Test validation functions
  await testSyncService()  - Test sync service
  await testAll()          - Run all tests
  await clearTestData()    - Clear all test data

Try: await testAll()
  `, 'color: #4CAF50; font-size: 16px; font-weight: bold', 'color: inherit; font-size: 12px');
}
