# Testing Guide: Task 3.0 - Data Layer & Offline Storage

This guide shows you how to test the data layer implementation completed in Task 3.0.

## Quick Start

### 1. Run Automated Tests ✅

```bash
# Run all tests once
npm test -- --run

# Run tests in watch mode (auto-rerun on changes)
npm test

# Run tests with coverage report
npm run test:coverage
```

**Expected Result:** All 125 tests should pass
- ✓ Storage tests (23)
- ✓ Sync Queue tests (23)
- ✓ Validation tests (47)
- ✓ UUID tests (32)

---

## 2. Browser Console Testing 🧪

The app automatically loads test helpers in development mode. Here's how to use them:

### Step 1: Start the Dev Server

```bash
npm run dev
```

The app should open at `http://localhost:5173`

### Step 2: Open Browser DevTools

- **Chrome/Edge:** Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox:** Press `F12`
- **Safari:** Enable developer menu in preferences, then press `Cmd+Option+I`

### Step 3: Run Tests in Console

You'll see a welcome message with available commands. Try these:

#### Test Everything at Once

```javascript
await testAll()
```

This runs all tests and shows detailed output for each component.

#### Test Individual Components

```javascript
// Test IndexedDB storage operations
await testStorage()

// Test sync queue functionality
await testSyncQueue()

// Test validation functions
await testValidation()

// Test sync service state management
await testSyncService()

// Clear all test data
await clearTestData()
```

### Expected Output

Each test will show:
- ✓ Success messages in green
- ❌ Error messages if something fails
- Detailed logs of operations
- Sample data structures

**Example Console Output:**

```
🚀 Running all Task 3.0 tests...

🗄️ Testing Storage Service
  1. Initializing IndexedDB...
  ✓ Database initialized
  2. Saving habit...
  ✓ Habit saved: {habit_id: 'habit_...', name: 'Test Exercise', ...}
  3. Retrieving habits...
  ✓ Retrieved habits: [...]
  ...
🎉 All storage tests passed!

✅ ALL TESTS PASSED! 🎉
```

---

## 3. Inspect Browser Storage 🔍

### View IndexedDB Data

1. Open DevTools
2. Go to **Application** tab (Chrome/Edge) or **Storage** tab (Firefox)
3. Expand **IndexedDB** → **HabitTrackerDB**
4. You'll see three object stores:
   - `habits` - All habit data
   - `logs` - All log entries
   - `metadata` - App metadata

Click on each store to see the data in table format.

### View Sync Queue (localStorage)

1. In the **Application/Storage** tab
2. Go to **Local Storage** → `http://localhost:5173`
3. Look for key: `habitTracker_syncQueue`
4. Click to see queued operations in JSON format

---

## 4. Manual Testing Steps 📝

### Test Storage Service

```javascript
// 1. Create a habit
const { storageService } = await import('./src/services/storage');
const { generateHabitId } = await import('./src/utils/uuid');

const habit = {
  habit_id: generateHabitId(),
  name: 'Morning Run',
  category: 'Fitness',
  status: 'active',
  created_date: '2025-01-13',
  modified_date: '2025-01-13'
};

await storageService.initDB();
await storageService.saveHabit(habit);
console.log('Habit saved!');

// 2. Retrieve it
const habits = await storageService.getHabits();
console.log('All habits:', habits);

// 3. Update it
habit.name = 'Evening Run';
habit.modified_date = '2025-01-14';
await storageService.saveHabit(habit);

// 4. Mark as inactive (soft delete)
await storageService.deleteHabit(habit.habit_id);

// 5. Check it's marked inactive
const inactive = await storageService.getHabit(habit.habit_id);
console.log('Status:', inactive.status); // Should be 'inactive'
```

### Test Sync Queue

```javascript
const { syncQueueService } = await import('./src/services/syncQueue');

// Add operations
await syncQueueService.addToQueue('CREATE', 'habit', 'habit_123', {
  name: 'Test Habit'
});

await syncQueueService.addToQueue('UPDATE', 'log', 'log_456', {
  status: 'done'
});

// View queue
const queue = await syncQueueService.getQueue();
console.log('Queue:', queue);

// Check size
const size = await syncQueueService.getQueueSize();
console.log('Queue size:', size);

// Optimize (remove duplicates)
await syncQueueService.optimizeQueue();

// Clear queue
await syncQueueService.clearQueue();
```

### Test Validation

```javascript
const { validateHabitName, validateDate, validateNotes } =
  await import('./src/utils/dataValidation');

// Valid cases
await validateHabitName('Morning Exercise');
// { isValid: true }

validateDate('2025-01-13');
// { isValid: true }

validateNotes('Great workout!');
// { isValid: true }

// Invalid cases
await validateHabitName('');
// { isValid: false, error: 'Habit name cannot be empty' }

validateDate('2025-01-01'); // More than 5 days ago
// { isValid: false, error: 'Date cannot be more than 5 days in the past' }

validateNotes('x'.repeat(5001));
// { isValid: false, error: 'Notes cannot exceed 5000 characters' }
```

### Test UUID Generation

```javascript
const { generateHabitId, generateLogId, generateUUID, isValidHabitId } =
  await import('./src/utils/uuid');

// Generate IDs
const habitId = generateHabitId();
console.log('Habit ID:', habitId); // 'habit_550e8400-e29b-41d4-...'

const logId = generateLogId();
console.log('Log ID:', logId); // 'log_550e8400-e29b-41d4-...'

const uuid = generateUUID();
console.log('UUID:', uuid); // '550e8400-e29b-41d4-a716-...'

// Validate
console.log(isValidHabitId(habitId)); // true
console.log(isValidHabitId(logId)); // false (wrong prefix)
```

---

## 5. Test Offline Functionality 🔌

### Simulate Offline Mode

1. Open DevTools
2. Go to **Network** tab
3. Click the dropdown that says "Online"
4. Select "Offline"
5. Run operations:

```javascript
// This should add to queue instead of syncing
await syncQueueService.addToQueue('CREATE', 'habit', 'habit_test', {
  name: 'Offline Habit'
});

// Check queue
const queue = await syncQueueService.getQueue();
console.log('Queued operations:', queue.length);

// Check sync service knows we're offline
const { syncService } = await import('./src/services/syncService');
console.log('Online?', syncService.isAppOnline()); // false
```

6. Go back online and watch console for auto-sync messages

---

## 6. Test Coverage Report 📊

Generate a detailed coverage report:

```bash
npm run test:coverage
```

This creates an HTML report in `coverage/` directory. Open `coverage/index.html` in your browser to see:

- Line coverage
- Branch coverage
- Function coverage
- Uncovered code paths

**Target:** 85%+ coverage for Task 3.0 components

---

## 7. Integration Testing with Existing App

The data layer is already integrated with your app. Test the full flow:

```javascript
// This simulates what the UI will do
const { storageService } = await import('./src/services/storage');
const { syncQueueService } = await import('./src/services/syncQueue');
const { generateHabitId, generateLogId } = await import('./src/utils/uuid');
const { validateHabitName } = await import('./src/utils/dataValidation');

// 1. User adds a habit
const habitName = 'Morning Meditation';
const validation = await validateHabitName(habitName);

if (validation.isValid) {
  const newHabit = {
    habit_id: generateHabitId(),
    name: habitName,
    status: 'active',
    created_date: new Date().toISOString().split('T')[0],
    modified_date: new Date().toISOString().split('T')[0]
  };

  // Save to local storage (instant)
  await storageService.saveHabit(newHabit);

  // Queue for sync to Google Sheets (background)
  await syncQueueService.addToQueue('CREATE', 'habit', newHabit.habit_id, newHabit);

  console.log('✓ Habit added locally and queued for sync');
}

// 2. User logs a habit for today
const habits = await storageService.getHabits(true); // active only
const firstHabit = habits[0];

const logEntry = {
  log_id: generateLogId(),
  habit_id: firstHabit.habit_id,
  date: new Date().toISOString().split('T')[0],
  status: 'done',
  notes: 'Felt great today!',
  timestamp: new Date().toISOString()
};

await storageService.saveLog(logEntry);
await syncQueueService.addToQueue('CREATE', 'log', logEntry.log_id, logEntry);

console.log('✓ Log entry saved and queued for sync');

// 3. View all logs for this habit
const logs = await storageService.getLogs(firstHabit.habit_id);
console.log('Habit logs:', logs);
```

---

## Common Issues & Solutions 🔧

### Issue: "indexedDB is not defined"

**Cause:** Running in Node.js instead of browser
**Solution:** Tests need browser environment (already configured with `happy-dom`)

### Issue: Tests pass but browser console fails

**Cause:** Need to start dev server
**Solution:** Run `npm run dev` first

### Issue: Can't see test helpers in console

**Cause:** Not in development mode or helpers didn't load
**Solution:**
1. Check you're on `localhost:5173`
2. Refresh the page
3. Check console for the welcome message
4. Try importing manually: `await import('./src/utils/testHelpers')`

### Issue: Data persists between test runs

**Solution:** Clear test data:
```javascript
await clearTestData()
```

Or manually clear in DevTools:
- Application → IndexedDB → Delete HabitTrackerDB
- Application → Local Storage → Clear all

---

## What's Being Tested ✅

### Storage Service
- ✓ IndexedDB initialization
- ✓ Creating/reading/updating/deleting habits
- ✓ Creating/reading logs with filters
- ✓ Saving/retrieving metadata
- ✓ Soft-delete (marking habits as inactive)
- ✓ Sorting by created date
- ✓ Filtering by status

### Sync Queue Service
- ✓ Adding operations to queue
- ✓ Retrieving queue
- ✓ Removing operations
- ✓ Clearing queue
- ✓ Retry count management
- ✓ Queue optimization (deduplication)
- ✓ Failed operation tracking

### Sync Service
- ✓ Network status detection
- ✓ State management and subscriptions
- ✓ Conflict resolution (last-write-wins)
- ✓ Exponential backoff retry
- ✓ Auto-sync on reconnect

### Validation
- ✓ Habit name: length, empty, duplicates
- ✓ Date: format, past limit (5 days), future
- ✓ Notes: max length (5000 chars)
- ✓ Status: valid values
- ✓ Sanitization functions

### UUID Generation
- ✓ UUID v4 format
- ✓ Uniqueness
- ✓ Prefixed IDs (habit_, log_)
- ✓ Validation functions

---

## Next Steps ➡️

After verifying Task 3.0 works correctly:

1. ✅ Review test results
2. ✅ Test in browser console
3. ✅ Check IndexedDB in DevTools
4. 🎯 Ready to proceed to **Task 4.0: Habit Management UI**

Task 4.0 will build the UI components that use these data layer services!

---

## Quick Reference

```javascript
// Available in browser console (development mode only):
await testAll()           // Run all tests
await testStorage()       // Test storage service
await testSyncQueue()     // Test sync queue
await testValidation()    // Test validation
await testSyncService()   // Test sync service
await clearTestData()     // Clear all test data
```

**Test Files:**
- `src/services/storage.test.ts`
- `src/services/syncQueue.test.ts`
- `src/utils/dataValidation.test.ts`
- `src/utils/uuid.test.ts`

**Coverage Report:**
`npm run test:coverage` → Open `coverage/index.html`
