/**
 * One-time migration utility to sync existing IndexedDB data to Supabase
 * Run this once to migrate habits and logs that were created before Supabase sync was fixed
 */

import { storageService } from '../services/storage';
import { supabaseDataService } from '../services/supabaseDataService';

export async function migrateExistingDataToSupabase(): Promise<{
  habitsCreated: number;
  logsCreated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let habitsCreated = 0;
  let logsCreated = 0;

  try {
    console.log('🔄 Starting migration of IndexedDB data to Supabase...');

    // 1. Migrate all habits
    console.log('📋 Fetching habits from IndexedDB...');
    const localHabits = await storageService.getHabits(); // Get ALL habits (active + inactive)
    console.log(`Found ${localHabits.length} habits in IndexedDB`);

    for (const habit of localHabits) {
      try {
        // Check if habit already exists in Supabase
        const existingHabit = await supabaseDataService.getHabit(habit.habit_id);

        if (!existingHabit) {
          // Create habit in Supabase
          await supabaseDataService.createHabit({
            habit_id: habit.habit_id,
            name: habit.name,
            category: habit.category,
            status: habit.status,
          });
          habitsCreated++;
          console.log(`✅ Created habit: ${habit.name}`);
        } else {
          console.log(`⏭️  Habit already exists in Supabase: ${habit.name}`);
        }
      } catch (error) {
        const errorMsg = `Failed to migrate habit "${habit.name}": ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // 2. Migrate all logs
    console.log('📝 Fetching logs from IndexedDB...');
    const localLogs = await storageService.getLogs();
    console.log(`Found ${localLogs.length} logs in IndexedDB`);

    for (const log of localLogs) {
      try {
        // Check if log already exists in Supabase (by checking if we can fetch it)
        const existingLogs = await supabaseDataService.getLogs(log.habit_id, log.date);
        const logExists = existingLogs.some(l => l.log_id === log.log_id);

        if (!logExists) {
          // Create log in Supabase
          await supabaseDataService.createLog({
            log_id: log.log_id,
            habit_id: log.habit_id,
            date: log.date,
            status: log.status,
            notes: log.notes || null,
          });
          logsCreated++;
          console.log(`✅ Created log: ${log.log_id} (${log.date})`);
        } else {
          console.log(`⏭️  Log already exists in Supabase: ${log.log_id}`);
        }
      } catch (error) {
        const errorMsg = `Failed to migrate log ${log.log_id}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log('✨ Migration complete!');
    console.log(`📊 Results: ${habitsCreated} habits, ${logsCreated} logs created`);

    if (errors.length > 0) {
      console.warn(`⚠️  ${errors.length} errors occurred during migration`);
    }

    return { habitsCreated, logsCreated, errors };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Export for use in browser console
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).migrateToSupabase = migrateExistingDataToSupabase;

console.log('💡 Migration utility loaded! Run: await migrateToSupabase()');
