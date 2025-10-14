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
import { ProgressCard } from '../components/ProgressCard';
import { EmptyState } from '../components/EmptyState';

interface HabitWithLogs {
  habit: Habit;
  logs: LogEntry[];
}

export const ProgressPage: React.FC = () => {
  const [habitsWithLogs, setHabitsWithLogs] = useState<HabitWithLogs[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHabitsAndLogs();
  }, []);

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

  if (isLoading) {
    return (
      <div className="progress-page">
        <div className="page-header">
          <h1>Progress</h1>
        </div>
        <div className="loading-state">
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page">
        <div className="page-header">
          <h1>Progress</h1>
        </div>
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
        <div className="page-header">
          <h1>Progress</h1>
        </div>
        <EmptyState
          title="No habits to display"
          message="Add some habits in the Manage Habits page to see your progress here."
          actionText="Go to Manage Habits"
          actionLink="/manage-habits"
        />
      </div>
    );
  }

  return (
    <div className="progress-page">
      <div className="page-header">
        <h1>Progress</h1>
        <p className="page-subtitle">
          Track your habits and see insights from your notes
        </p>
      </div>

      <div className="progress-list">
        {habitsWithLogs.map(({ habit, logs }) => (
          <ProgressCard key={habit.habit_id} habit={habit} logs={logs} />
        ))}
      </div>
    </div>
  );
};
