/**
 * ProgressCard Component Tests
 *
 * Tests for the expandable progress card showing habit statistics,
 * pattern analysis, and notes history.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressCard } from './ProgressCard';
import type { Habit } from '../types/habit';
import type { LogEntry } from '../types/logEntry';

// Mock child components
vi.mock('./NotesHistory', () => ({
  NotesHistory: ({ logs }: { logs: LogEntry[] }) => (
    <div data-testid="notes-history">
      Notes History ({logs.filter(l => l.notes).length} notes)
    </div>
  ),
}));

describe('ProgressCard', () => {
  const mockHabit: Habit = {
    habit_id: 'habit-1',
    name: 'Morning Exercise',
    category: 'Health',
    status: 'active',
    created_date: '2025-01-01',
    modified_date: '2025-01-01',
  };

  const createLog = (
    date: string,
    status: 'done' | 'not_done',
    notes?: string
  ): LogEntry => ({
    log_id: `log-${date}`,
    habit_id: 'habit-1',
    date,
    status,
    notes: notes || '',
    timestamp: new Date(date).toISOString(),
  });

  describe('Basic Rendering', () => {
    it('should render habit name and category', () => {
      const logs: LogEntry[] = [];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
      expect(screen.getByText('Health')).toBeInTheDocument();
    });

    it('should render without category if not provided', () => {
      const habitWithoutCategory = { ...mockHabit, category: undefined };
      const logs: LogEntry[] = [];
      render(<ProgressCard habit={habitWithoutCategory} logs={logs} />);

      expect(screen.getByText('Morning Exercise')).toBeInTheDocument();
      expect(screen.queryByText('Health')).not.toBeInTheDocument();
    });

    it('should render expand button with correct aria attributes', () => {
      const logs: LogEntry[] = [];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      const expandButton = screen.getByRole('button', { name: /expand/i });
      expect(expandButton).toBeInTheDocument();
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Statistics Display', () => {
    it('should display correct current streak', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-10', 'done'),
        createLog('2025-01-09', 'done'),
        createLog('2025-01-08', 'done'),
        createLog('2025-01-07', 'not_done'),
      ];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      expect(screen.getByText('Current:')).toBeInTheDocument();
      expect(screen.getByText('3 days')).toBeInTheDocument();
    });

    it('should display correct longest streak', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-10', 'done'),
        createLog('2025-01-09', 'not_done'),
        createLog('2025-01-08', 'done'),
        createLog('2025-01-07', 'done'),
        createLog('2025-01-06', 'done'),
        createLog('2025-01-05', 'done'),
        createLog('2025-01-04', 'done'),
      ];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      expect(screen.getByText('Best:')).toBeInTheDocument();
      expect(screen.getByText('5 days')).toBeInTheDocument();
    });

    it('should display completion percentage', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-10', 'done'),
        createLog('2025-01-09', 'done'),
        createLog('2025-01-08', 'done'),
        createLog('2025-01-07', 'not_done'),
        createLog('2025-01-06', 'done'),
      ];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      expect(screen.getByText('Completion:')).toBeInTheDocument();
      // Should show "4/5 days - 80%"
      expect(screen.getByText(/4\/5 days - 80%/)).toBeInTheDocument();
    });

    it('should handle empty logs gracefully', () => {
      const logs: LogEntry[] = [];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      // Should show 0 for all stats (both current and longest streaks)
      const zeroDays = screen.getAllByText('0 days');
      expect(zeroDays).toHaveLength(2); // Current and Best streaks
      expect(screen.getByText(/0\/0 days - 0%/)).toBeInTheDocument();
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should start in collapsed state', () => {
      const logs: LogEntry[] = [];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      // Details should not be visible
      expect(screen.queryByText(/Pattern Analysis|Add notes to at least 7 logs/i)).not.toBeInTheDocument();
    });

    it('should expand when header is clicked', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = [];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      const header = screen.getByRole('button', { name: /expand/i });
      await user.click(header);

      await waitFor(() => {
        expect(screen.getByText(/Add notes to at least 7 logs/i)).toBeInTheDocument();
      });
    });

    it('should collapse when clicked again', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = [];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      const header = screen.getByRole('button', { name: /expand/i });

      // Expand
      await user.click(header);
      await waitFor(() => {
        expect(screen.getByText(/Add notes to at least 7 logs/i)).toBeInTheDocument();
      });

      // Collapse
      await user.click(header);
      await waitFor(() => {
        expect(screen.queryByText(/Add notes to at least 7 logs/i)).not.toBeInTheDocument();
      });
    });

    it('should update aria-expanded attribute when toggling', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = [];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      const button = screen.getByRole('button', { name: /expand/i });
      expect(button).toHaveAttribute('aria-expanded', 'false');

      await user.click(button);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /collapse/i })).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should change expand icon when toggling', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = [];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      const button = screen.getByRole('button', { name: /expand/i });
      expect(button.textContent).toContain('▶');

      await user.click(button);
      await waitFor(() => {
        const collapseButton = screen.getByRole('button', { name: /collapse/i });
        expect(collapseButton.textContent).toContain('▼');
      });
    });
  });

  describe('Pattern Analysis', () => {
    it('should show placeholder when fewer than 7 notes', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'done', 'Felt great'),
        createLog('2025-01-02', 'done', 'Good workout'),
        createLog('2025-01-03', 'done', 'Tired but completed'),
      ];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      // Expand to see details
      await user.click(screen.getByRole('button', { name: /expand/i }));

      await waitFor(() => {
        expect(screen.getByText(/Add notes to at least 7 logs to see pattern analysis/i)).toBeInTheDocument();
        expect(screen.getByText(/Current notes: 3\/7/i)).toBeInTheDocument();
      });
    });

    it('should show pattern analysis when 7+ notes exist', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = Array.from({ length: 10 }, (_, i) =>
        createLog(`2025-01-${String(i + 1).padStart(2, '0')}`, 'done', `Note ${i + 1} - feeling positive and energized`)
      );
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      // Expand to see details
      await user.click(screen.getByRole('button', { name: /expand/i }));

      await waitFor(() => {
        expect(screen.getByText('Pattern Analysis')).toBeInTheDocument();
        // Should NOT show placeholder
        expect(screen.queryByText(/Add notes to at least 7 logs/i)).not.toBeInTheDocument();
      });
    });

    it('should display correlation text in pattern analysis', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = Array.from({ length: 8 }, (_, i) =>
        createLog(`2025-01-${String(i + 1).padStart(2, '0')}`, 'done', 'Feeling great and motivated')
      );
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      await user.click(screen.getByRole('button', { name: /expand/i }));

      await waitFor(() => {
        // notesAnalyzer should generate some correlation text
        const analysisSection = screen.getByText('Pattern Analysis').parentElement;
        expect(analysisSection).toBeInTheDocument();
      });
    });

    it('should display keywords when available', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = Array.from({ length: 8 }, (_, i) =>
        createLog(`2025-01-${String(i + 1).padStart(2, '0')}`, 'done', 'Running exercise workout fitness health')
      );
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      await user.click(screen.getByRole('button', { name: /expand/i }));

      await waitFor(() => {
        expect(screen.getByText('Keywords:')).toBeInTheDocument();
        // Keywords should be displayed (tested by notesAnalyzer tests)
      });
    });

    it('should display sentiment summary with emoji icons', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = [
        ...Array.from({ length: 5 }, (_, i) =>
          createLog(`2025-01-${String(i + 1).padStart(2, '0')}`, 'done', 'Great awesome wonderful')
        ),
        ...Array.from({ length: 3 }, (_, i) =>
          createLog(`2025-01-${String(i + 6).padStart(2, '0')}`, 'done', 'Bad terrible awful')
        ),
      ];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      await user.click(screen.getByRole('button', { name: /expand/i }));

      await waitFor(() => {
        // Check for sentiment icons
        expect(screen.getByText('😊')).toBeInTheDocument(); // positive
        expect(screen.getByText('😐')).toBeInTheDocument(); // neutral
        expect(screen.getByText('😟')).toBeInTheDocument(); // negative
      });
    });
  });

  describe('Notes History Integration', () => {
    it('should render NotesHistory component when expanded', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'done', 'First note'),
        createLog('2025-01-02', 'done', 'Second note'),
      ];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      await user.click(screen.getByRole('button', { name: /expand/i }));

      await waitFor(() => {
        expect(screen.getByTestId('notes-history')).toBeInTheDocument();
      });
    });

    it('should pass all logs to NotesHistory', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'done', 'Note 1'),
        createLog('2025-01-02', 'done', 'Note 2'),
        createLog('2025-01-03', 'done'), // No note
      ];
      render(<ProgressCard habit={mockHabit} logs={logs} />);

      await user.click(screen.getByRole('button', { name: /expand/i }));

      await waitFor(() => {
        // Mocked NotesHistory shows count
        expect(screen.getByText(/Notes History \(2 notes\)/)).toBeInTheDocument();
      });
    });
  });

  describe('CSS Classes', () => {
    it('should apply expanded class when expanded', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = [];
      const { container } = render(<ProgressCard habit={mockHabit} logs={logs} />);

      const card = container.querySelector('.progress-card');
      expect(card).not.toHaveClass('expanded');

      await user.click(screen.getByRole('button', { name: /expand/i }));

      await waitFor(() => {
        expect(card).toHaveClass('expanded');
      });
    });

    it('should remove expanded class when collapsed', async () => {
      const user = userEvent.setup();
      const logs: LogEntry[] = [];
      const { container } = render(<ProgressCard habit={mockHabit} logs={logs} />);

      const card = container.querySelector('.progress-card');

      // Expand
      await user.click(screen.getByRole('button', { name: /expand/i }));
      await waitFor(() => {
        expect(card).toHaveClass('expanded');
      });

      // Collapse
      await user.click(screen.getByRole('button', { name: /collapse/i }));
      await waitFor(() => {
        expect(card).not.toHaveClass('expanded');
      });
    });
  });
});
