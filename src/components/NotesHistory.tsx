/**
 * NotesHistory Component
 *
 * Displays historical notes for a habit in reverse chronological order.
 * Shows date and time alongside each note entry.
 */

import React from 'react';
import './NotesHistory.css';
import { LogEntry } from '../types/logEntry';
import { format } from 'date-fns';

interface NotesHistoryProps {
  logs: LogEntry[];
}

/**
 * NotesHistory Component
 *
 * Displays all notes from log entries in reverse chronological order
 */
export const NotesHistory: React.FC<NotesHistoryProps> = ({ logs }) => {
  // Filter logs that have notes and sort by date (newest first)
  const logsWithNotes = logs
    .filter(log => log.notes && log.notes.trim().length > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (logsWithNotes.length === 0) {
    return (
      <div className="notes-history-empty">
        <p>No notes recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="notes-history">
      <h4>Notes History</h4>
      <div className="notes-list">
        {logsWithNotes.map(log => {
          // Format the date and timestamp
          const date = new Date(log.timestamp);
          const formattedDate = format(date, 'MMM d, yyyy');
          const formattedTime = format(date, 'h:mm a');

          return (
            <div key={log.log_id} className="note-entry">
              <div className="note-header">
                <span className="note-date">{formattedDate}</span>
                <span className="note-time">at {formattedTime}</span>
              </div>
              <div className="note-content">
                <p>{log.notes}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
