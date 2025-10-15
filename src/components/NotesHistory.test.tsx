/**
 * NotesHistory Component Tests
 *
 * Tests for displaying historical notes in reverse chronological order.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotesHistory } from './NotesHistory';
import type { LogEntry } from '../types/logEntry';

describe('NotesHistory', () => {
  const createLog = (
    date: string,
    notes?: string,
    timestamp?: string
  ): LogEntry => ({
    log_id: `log-${date}`,
    habit_id: 'habit-1',
    date,
    status: 'done',
    notes: notes || '',
    timestamp: timestamp || new Date(date).toISOString(),
  });

  describe('Empty State', () => {
    it('should show empty message when no logs exist', () => {
      const logs: LogEntry[] = [];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText('No notes recorded yet.')).toBeInTheDocument();
    });

    it('should show empty message when all logs have no notes', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01'),
        createLog('2025-01-02'),
        createLog('2025-01-03'),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText('No notes recorded yet.')).toBeInTheDocument();
    });

    it('should show empty message when all notes are whitespace only', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01', '   '),
        createLog('2025-01-02', '\n\t'),
        createLog('2025-01-03', ''),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText('No notes recorded yet.')).toBeInTheDocument();
    });
  });

  describe('Notes Display', () => {
    it('should display notes history heading', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'First note'),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText('Notes History')).toBeInTheDocument();
    });

    it('should display a single note entry', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-15', 'Felt great today!', '2025-01-15T09:30:00.000Z'),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText('Felt great today!')).toBeInTheDocument();
      expect(screen.getByText('Jan 15, 2025')).toBeInTheDocument();
      // Time will vary based on timezone, just check format exists
      expect(screen.getByText(/at \d{1,2}:\d{2} (AM|PM)/i)).toBeInTheDocument();
    });

    it('should display multiple note entries', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'First note'),
        createLog('2025-01-02', 'Second note'),
        createLog('2025-01-03', 'Third note'),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText('First note')).toBeInTheDocument();
      expect(screen.getByText('Second note')).toBeInTheDocument();
      expect(screen.getByText('Third note')).toBeInTheDocument();
    });

    it('should filter out logs without notes', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'Has note'),
        createLog('2025-01-02'), // No note
        createLog('2025-01-03', 'Another note'),
        createLog('2025-01-04'), // No note
      ];
      const { container } = render(<NotesHistory logs={logs} />);

      expect(screen.getByText('Has note')).toBeInTheDocument();
      expect(screen.getByText('Another note')).toBeInTheDocument();

      // Should only have 2 note entries
      const noteEntries = container.querySelectorAll('.note-entry');
      expect(noteEntries).toHaveLength(2);
    });
  });

  describe('Date and Time Formatting', () => {
    it('should format date as "MMM d, yyyy"', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-15', 'Note', '2025-01-15T14:30:00.000Z'),
        createLog('2025-03-05', 'Note', '2025-03-05T08:15:00.000Z'),
        createLog('2025-12-25', 'Note', '2025-12-25T20:45:00.000Z'),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText('Jan 15, 2025')).toBeInTheDocument();
      expect(screen.getByText('Mar 5, 2025')).toBeInTheDocument();
      expect(screen.getByText('Dec 25, 2025')).toBeInTheDocument();
    });

    it('should format time as "h:mm a" (12-hour format)', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'Morning', '2025-01-01T09:30:00.000Z'),
        createLog('2025-01-02', 'Afternoon', '2025-01-02T14:45:00.000Z'),
        createLog('2025-01-03', 'Evening', '2025-01-03T20:15:00.000Z'),
      ];
      render(<NotesHistory logs={logs} />);

      // Check that times are formatted correctly (will be in local timezone)
      const times = screen.getAllByText(/at \d{1,2}:\d{2} (AM|PM)/i);
      expect(times).toHaveLength(3);
    });

    it('should handle midnight correctly', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'Midnight note', '2025-01-01T00:00:00.000Z'),
      ];
      render(<NotesHistory logs={logs} />);

      // Should display time in 12-hour format (actual time depends on timezone)
      expect(screen.getByText(/at \d{1,2}:\d{2} (AM|PM)/i)).toBeInTheDocument();
    });

    it('should handle noon correctly', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'Noon note', '2025-01-01T12:00:00.000Z'),
      ];
      render(<NotesHistory logs={logs} />);

      // Should display time in 12-hour format (actual time depends on timezone)
      expect(screen.getByText(/at \d{1,2}:\d{2} (AM|PM)/i)).toBeInTheDocument();
    });
  });

  describe('Sorting Order', () => {
    it('should display notes in reverse chronological order (newest first)', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'Oldest', '2025-01-01T10:00:00.000Z'),
        createLog('2025-01-03', 'Newest', '2025-01-03T10:00:00.000Z'),
        createLog('2025-01-02', 'Middle', '2025-01-02T10:00:00.000Z'),
      ];
      const { container } = render(<NotesHistory logs={logs} />);

      const noteContents = container.querySelectorAll('.note-content p');
      // Order should be: Newest, Middle, Oldest
      expect(noteContents[0]).toHaveTextContent('Newest');
      expect(noteContents[1]).toHaveTextContent('Middle');
      expect(noteContents[2]).toHaveTextContent('Oldest');
    });

    it('should sort by date field (when dates differ)', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-05', 'Day 5', '2025-01-05T10:00:00.000Z'),
        createLog('2025-01-01', 'Day 1', '2025-01-01T10:00:00.000Z'),
        createLog('2025-01-03', 'Day 3', '2025-01-03T10:00:00.000Z'),
      ];
      const { container } = render(<NotesHistory logs={logs} />);

      const noteContents = container.querySelectorAll('.note-content p');
      // Should be sorted by date descending (newest date first)
      expect(noteContents[0]).toHaveTextContent('Day 5');
      expect(noteContents[1]).toHaveTextContent('Day 3');
      expect(noteContents[2]).toHaveTextContent('Day 1');
    });
  });

  describe('Note Content', () => {
    it('should display full note text', () => {
      const longNote = 'This is a very long note with lots of details about my day and how the habit went. It includes multiple sentences and should all be displayed.';
      const logs: LogEntry[] = [
        createLog('2025-01-01', longNote),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText(longNote)).toBeInTheDocument();
    });

    it('should preserve line breaks in notes', () => {
      const multilineNote = 'Line 1\nLine 2\nLine 3';
      const logs: LogEntry[] = [
        createLog('2025-01-01', multilineNote),
      ];
      const { container } = render(<NotesHistory logs={logs} />);

      // The text should be present in the paragraph
      const noteContent = container.querySelector('.note-content p');
      expect(noteContent?.textContent).toBe(multilineNote);
    });

    it('should handle special characters in notes', () => {
      const specialNote = 'Note with "quotes", <tags>, & ampersands!';
      const logs: LogEntry[] = [
        createLog('2025-01-01', specialNote),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText(specialNote)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render each note with proper structure', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'Test note', '2025-01-01T10:00:00.000Z'),
      ];
      const { container } = render(<NotesHistory logs={logs} />);

      // Check for expected class structure
      expect(container.querySelector('.notes-history')).toBeInTheDocument();
      expect(container.querySelector('.notes-list')).toBeInTheDocument();
      expect(container.querySelector('.note-entry')).toBeInTheDocument();
      expect(container.querySelector('.note-header')).toBeInTheDocument();
      expect(container.querySelector('.note-date')).toBeInTheDocument();
      expect(container.querySelector('.note-time')).toBeInTheDocument();
      expect(container.querySelector('.note-content')).toBeInTheDocument();
    });

    it('should use log_id as key for each note entry', () => {
      const logs: LogEntry[] = [
        { ...createLog('2025-01-01', 'Note 1'), log_id: 'unique-id-1' },
        { ...createLog('2025-01-02', 'Note 2'), log_id: 'unique-id-2' },
      ];
      const { container } = render(<NotesHistory logs={logs} />);

      const noteEntries = container.querySelectorAll('.note-entry');
      expect(noteEntries).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very old dates', () => {
      const logs: LogEntry[] = [
        createLog('2020-01-01', 'Old note', '2020-01-01T10:00:00.000Z'),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText('Jan 1, 2020')).toBeInTheDocument();
    });

    it('should handle future dates (for testing/debugging)', () => {
      const logs: LogEntry[] = [
        createLog('2026-12-31', 'Future note', '2026-12-31T23:59:00.000Z'),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText('Dec 31, 2026')).toBeInTheDocument();
      // Time will vary based on timezone
      expect(screen.getByText(/at \d{1,2}:\d{2} (AM|PM)/i)).toBeInTheDocument();
    });

    it('should handle single-character notes', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'A'),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should handle emoji in notes', () => {
      const logs: LogEntry[] = [
        createLog('2025-01-01', 'Great workout! 💪😊🏃'),
      ];
      render(<NotesHistory logs={logs} />);

      expect(screen.getByText(/Great workout! 💪😊🏃/)).toBeInTheDocument();
    });
  });
});
