/**
 * ProgressCard Component
 *
 * Expandable card showing habit progress statistics.
 * Displays: name, category, current streak, longest streak, completion percentage
 * When expanded: shows notes history and pattern analysis (if available)
 */

import React, { useState } from 'react';
import './ProgressCard.css';
import { Habit } from '../types/habit';
import { LogEntry } from '../types/logEntry';
import { calculateStreaks } from '../utils/streakCalculator';
import {
  calculateCompletionPercentage,
  formatCompletionStats,
} from '../utils/percentageCalculator';
import { analyzeNotes } from '../utils/notesAnalyzer';
import { NotesHistory } from './NotesHistory';

interface ProgressCardProps {
  habit: Habit;
  logs: LogEntry[];
}

/**
 * ProgressCard Component
 *
 * Displays habit progress with expandable details
 */
export const ProgressCard: React.FC<ProgressCardProps> = ({ habit, logs }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate statistics
  const streaks = calculateStreaks(logs);
  const completionStats = calculateCompletionPercentage(logs);
  const notesAnalysis = analyzeNotes(logs);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`progress-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="progress-card-header" onClick={toggleExpanded}>
        <div className="habit-info">
          <h3 className="habit-name">{habit.name}</h3>
          {habit.category && (
            <span className="habit-category">{habit.category}</span>
          )}
        </div>
        <button
          className="expand-button"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          aria-expanded={isExpanded}
        >
          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </button>
      </div>

      <div className="progress-summary">
        <div className="stat-item">
          <span className="stat-label">Current:</span>
          <span className="stat-value">{streaks.current} days</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Best:</span>
          <span className="stat-value">{streaks.longest} days</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completion:</span>
          <span className="stat-value">
            {formatCompletionStats(completionStats)}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="progress-details">
          {/* Pattern Analysis Section */}
          {notesAnalysis.hasEnoughData ? (
            <div className="pattern-analysis">
              <h4>Pattern Analysis</h4>
              <p className="correlation-text">{notesAnalysis.correlationText}</p>
              {notesAnalysis.keywords.length > 0 && (
                <div className="keywords">
                  <span className="keywords-label">Keywords:</span>
                  <div className="keywords-list">
                    {notesAnalysis.keywords.map((keyword, index) => (
                      <span key={index} className="keyword-badge">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="sentiment-summary">
                <div className="sentiment-item">
                  <span className="sentiment-icon positive">😊</span>
                  <span>{notesAnalysis.sentimentSummary.positive} positive</span>
                </div>
                <div className="sentiment-item">
                  <span className="sentiment-icon neutral">😐</span>
                  <span>{notesAnalysis.sentimentSummary.neutral} neutral</span>
                </div>
                <div className="sentiment-item">
                  <span className="sentiment-icon negative">😟</span>
                  <span>{notesAnalysis.sentimentSummary.negative} negative</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="pattern-analysis-placeholder">
              <p>
                Add notes to at least 7 logs to see pattern analysis and
                insights.
              </p>
              <p className="notes-count">
                Current notes: {notesAnalysis.totalNotes}/7
              </p>
            </div>
          )}

          {/* Notes History Section */}
          <NotesHistory logs={logs} />
        </div>
      )}
    </div>
  );
};
