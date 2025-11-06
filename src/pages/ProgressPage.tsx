/**
 * ProgressPage Component
 *
 * Displays progress analytics for all active habits:
 * - Current streak, longest streak, completion percentage
 * - Expandable cards with notes history and pattern analysis
 */

import React, { useEffect, useState } from 'react';
import './ProgressPage.css';
import { Habit } from '../types/habit';
import { LogEntry } from '../types/logEntry';
import { storageService } from '../services/storage';
import { demoModeService } from '../services/demoMode';
import { ProgressCard } from '../components/ProgressCard';
import { EmptyState } from '../components/EmptyState';
import { LockedProgressPreview } from '../components/LockedProgressPreview';
import { ConversionModal } from '../components/ConversionModal';
import LoadingSpinner from '../components/LoadingSpinner';

interface HabitWithLogs {
  habit: Habit;
  logs: LogEntry[];
}

export const ProgressPage: React.FC = () => {
  const [habitsWithLogs, setHabitsWithLogs] = useState<HabitWithLogs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo mode state (Task 3.6 - REQ-17, REQ-35, AC-8)
  const isDemo = demoModeService.isDemoMode();
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [conversionTrigger, setConversionTrigger] = useState<'habits_threshold' | 'first_log' | 'progress_page'>('progress_page');

  useEffect(() => {
    // Demo mode tracking (Task 3.6 - REQ-17)
    if (isDemo) {
      demoModeService.trackProgressVisit();

      // Check for conversion trigger
      const trigger = demoModeService.shouldShowConversionModal();
      if (trigger) {
        setShowConversionModal(true);
        setConversionTrigger(trigger as 'habits_threshold' | 'first_log' | 'progress_page');
        demoModeService.markConversionShown();
      }
    }

    loadHabitsAndLogs();
  }, [isDemo]);

  const loadHabitsAndLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all active habits
      const allHabits = await storageService.getHabits();
      const activeHabits = allHabits.filter((habit: Habit) => habit.status === 'active');

      // Fetch logs for each habit
      const habitsData: HabitWithLogs[] = await Promise.all(
        activeHabits.map(async (habit: Habit) => {
          const logs = await storageService.getLogs(habit.habit_id);
          return { habit, logs };
        })
      );

      setHabitsWithLogs(habitsData);
    } catch (err) {
      console.error('Error loading habits and logs:', err);
      setError('Failed to load progress data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Task 7.46: Use LoadingSpinner for better loading state
  if (isLoading) {
    return (
      <div className="progress-page">
        <header className="page-header">
          <h1 className="page-title">Progress</h1>
        </header>
        <LoadingSpinner text="Loading your progress..." />
      </div>
    );
  }

  // Demo mode locked preview (Task 3.6 - REQ-35 to REQ-38, AC-8)
  if (isDemo && !isLoading) {
    return (
      <div className="progress-page">
        <header className="page-header">
          <h1 className="page-title">Progress</h1>
        </header>
        <LockedProgressPreview />
        {showConversionModal && (
          <ConversionModal
            trigger={conversionTrigger}
            onClose={() => setShowConversionModal(false)}
          />
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page">
        <header className="page-header">
          <h1 className="page-title">Progress</h1>
        </header>
        <div className="error-state">
          <p>{error}</p>
          <button onClick={loadHabitsAndLogs} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (habitsWithLogs.length === 0) {
    return (
      <div className="progress-page">
        <header className="page-header">
          <h1 className="page-title">Progress</h1>
        </header>
        <EmptyState
          iconName="TrendingUp"
          title="No progress yet"
          message="Start tracking habits to see your progress bloom."
          actionText="Add Your First Habit"
          actionLink="/manage-habits"
        />
      </div>
    );
  }

  return (
    <div className="progress-page">
      <header className="page-header">
        <h1 className="page-title">Progress</h1>
        <p className="page-subtitle">Track your habits and discover patterns</p>
      </header>

      <div className="progress-list">
        {habitsWithLogs.map(({ habit, logs }) => (
          <ProgressCard key={habit.habit_id} habit={habit} logs={logs} />
        ))}
      </div>
    </div>
  );
};
