// Test Data Generator for Manual Performance Testing
// Run this in browser console while signed in to generate test habits and logs

async function generateTestData(numHabits, numLogsPerHabit) {
  console.log(`Generating ${numHabits} habits with ~${numLogsPerHabit} logs each...`);

  const { supabase } = await import('./src/lib/supabaseClient.ts');

  // Generate habits
  const habits = [];
  for (let i = 1; i <= numHabits; i++) {
    habits.push({
      name: `Test Habit ${i}`,
      category: ['Health', 'Productivity', 'Learning', 'Fitness', 'Mindfulness'][i % 5],
      status: 'active'
    });
  }

  console.log('Creating habits...');
  const { data: createdHabits, error: habitsError } = await supabase
    .from('habits')
    .insert(habits)
    .select();

  if (habitsError) {
    console.error('Error creating habits:', habitsError);
    return;
  }

  console.log(`Created ${createdHabits.length} habits`);

  // Generate logs for each habit
  const logs = [];
  const today = new Date();

  for (const habit of createdHabits) {
    for (let dayOffset = 0; dayOffset < numLogsPerHabit; dayOffset++) {
      const logDate = new Date(today);
      logDate.setDate(today.getDate() - dayOffset);

      logs.push({
        habit_id: habit.habit_id,
        date: logDate.toISOString().split('T')[0],
        status: Math.random() > 0.3 ? 'done' : 'not_done', // 70% completion rate
        notes: dayOffset % 5 === 0 ? `Notes for day ${dayOffset}` : null
      });
    }
  }

  console.log(`Creating ${logs.length} logs...`);

  // Insert in batches of 100 to avoid payload limits
  const batchSize = 100;
  for (let i = 0; i < logs.length; i += batchSize) {
    const batch = logs.slice(i, i + batchSize);
    const { error: logsError } = await supabase
      .from('logs')
      .insert(batch);

    if (logsError) {
      console.error(`Error creating logs batch ${i / batchSize + 1}:`, logsError);
    } else {
      console.log(`Inserted batch ${i / batchSize + 1}/${Math.ceil(logs.length / batchSize)}`);
    }
  }

  console.log('✅ Test data generation complete!');
  console.log(`Total: ${createdHabits.length} habits, ${logs.length} logs`);
}

async function cleanupTestData() {
  console.log('Cleaning up test data...');
  const { supabase } = await import('./src/lib/supabaseClient.ts');

  // Delete all habits with "Test Habit" prefix (cascades to logs)
  const { error } = await supabase
    .from('habits')
    .delete()
    .like('name', 'Test Habit%');

  if (error) {
    console.error('Error cleaning up:', error);
  } else {
    console.log('✅ Cleanup complete!');
  }
}

// Usage:
// Small dataset: await generateTestData(10, 10)   // 10 habits, 10 logs each = 100 total logs
// Medium dataset: await generateTestData(50, 10)  // 50 habits, 10 logs each = 500 total logs
// Large dataset: await generateTestData(100, 10)  // 100 habits, 10 logs each = 1000 total logs
// Cleanup: await cleanupTestData()

console.log('Test data generator loaded!');
console.log('Usage:');
console.log('  await generateTestData(10, 10)   // Small: 10 habits, 100 logs');
console.log('  await generateTestData(50, 10)   // Medium: 50 habits, 500 logs');
console.log('  await generateTestData(100, 10)  // Large: 100 habits, 1000 logs');
console.log('  await cleanupTestData()          // Remove all test data');
