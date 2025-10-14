/**
 * Tests for Notes Analyzer Utility
 */

import { describe, it, expect } from 'vitest';
import { analyzeNotes } from './notesAnalyzer';
import { LogEntry } from '../types/logEntry';

describe('notesAnalyzer', () => {
  const createLog = (
    id: string,
    status: 'done' | 'not_done',
    notes?: string
  ): LogEntry => ({
    log_id: id,
    habit_id: 'habit-1',
    date: '2025-01-01',
    status,
    notes,
    timestamp: new Date().toISOString(),
  });

  describe('analyzeNotes', () => {
    it('should return hasEnoughData: false when fewer than 7 notes', () => {
      const logs = [
        createLog('1', 'done', 'Felt good today'),
        createLog('2', 'done', 'Great progress'),
        createLog('3', 'done', 'Feeling motivated'),
      ];
      const result = analyzeNotes(logs);
      expect(result.hasEnoughData).toBe(false);
      expect(result.totalNotes).toBe(3);
      expect(result.keywords).toEqual([]);
      expect(result.correlationText).toBe('');
    });

    it('should return hasEnoughData: true when 7+ notes available', () => {
      const logs = [
        createLog('1', 'done', 'Felt great and energized'),
        createLog('2', 'done', 'Amazing progress today'),
        createLog('3', 'done', 'Feeling really motivated'),
        createLog('4', 'done', 'Great workout session'),
        createLog('5', 'done', 'Energized and happy'),
        createLog('6', 'done', 'Wonderful progress'),
        createLog('7', 'done', 'Feeling accomplished'),
      ];
      const result = analyzeNotes(logs);
      expect(result.hasEnoughData).toBe(true);
      expect(result.totalNotes).toBe(7);
    });

    it('should ignore empty notes', () => {
      const logs = [
        createLog('1', 'done', 'Felt great'),
        createLog('2', 'done', ''),
        createLog('3', 'done', '   '),
        createLog('4', 'done', 'Good progress'),
      ];
      const result = analyzeNotes(logs);
      expect(result.totalNotes).toBe(2); // Only counts non-empty notes
    });

    it('should ignore logs without notes', () => {
      const logs = [
        createLog('1', 'done', 'Felt great'),
        createLog('2', 'done'),
        createLog('3', 'done', 'Good progress'),
      ];
      const result = analyzeNotes(logs);
      expect(result.totalNotes).toBe(2);
    });

    it('should extract keywords from notes', () => {
      const logs = [
        createLog('1', 'done', 'Felt great and energized today'),
        createLog('2', 'done', 'Amazing energy and motivation'),
        createLog('3', 'done', 'Feeling really energized and motivated'),
        createLog('4', 'done', 'Great energy levels today'),
        createLog('5', 'done', 'Very energized after workout'),
        createLog('6', 'done', 'Wonderful energy and progress'),
        createLog('7', 'done', 'Feeling accomplished and energized'),
      ];
      const result = analyzeNotes(logs);
      expect(result.keywords).toContain('energized');
    });

    it('should filter out stop words from keywords', () => {
      const logs = [
        createLog('1', 'done', 'I felt great today'),
        createLog('2', 'done', 'The workout was amazing'),
        createLog('3', 'done', 'This is really good'),
        createLog('4', 'done', 'I am feeling motivated'),
        createLog('5', 'done', 'It was a great session'),
        createLog('6', 'done', 'The progress is wonderful'),
        createLog('7', 'done', 'I felt accomplished today'),
      ];
      const result = analyzeNotes(logs);
      // Stop words like 'i', 'the', 'was', 'is' should not appear
      expect(result.keywords).not.toContain('the');
      expect(result.keywords).not.toContain('was');
      expect(result.keywords).not.toContain('is');
    });

    it('should analyze sentiment as positive', () => {
      const logs = [
        createLog('1', 'done', 'Wonderful and amazing experience'),
        createLog('2', 'done', 'Great success today'),
        createLog('3', 'done', 'Feeling fantastic and happy'),
        createLog('4', 'done', 'Excellent progress made'),
        createLog('5', 'done', 'Love this habit'),
        createLog('6', 'done', 'Brilliant workout'),
        createLog('7', 'done', 'Outstanding results'),
      ];
      const result = analyzeNotes(logs);
      expect(result.sentimentSummary.positive).toBeGreaterThan(
        result.sentimentSummary.negative
      );
      expect(result.sentimentSummary.averageScore).toBeGreaterThan(0);
    });

    it('should analyze sentiment as negative', () => {
      const logs = [
        createLog('1', 'done', 'Terrible and difficult experience'),
        createLog('2', 'done', 'Awful day today'),
        createLog('3', 'done', 'Feeling horrible and sad'),
        createLog('4', 'done', 'Bad progress made'),
        createLog('5', 'done', 'Hate this habit'),
        createLog('6', 'done', 'Painful workout'),
        createLog('7', 'done', 'Disappointing results'),
      ];
      const result = analyzeNotes(logs);
      expect(result.sentimentSummary.negative).toBeGreaterThan(
        result.sentimentSummary.positive
      );
      expect(result.sentimentSummary.averageScore).toBeLessThan(0);
    });

    it('should analyze sentiment as neutral/mixed', () => {
      const logs = [
        createLog('1', 'done', 'Completed the task'),
        createLog('2', 'done', 'Did the workout'),
        createLog('3', 'done', 'Went for a run'),
        createLog('4', 'done', 'Finished today'),
        createLog('5', 'done', 'Did my habit'),
        createLog('6', 'done', 'Completed it'),
        createLog('7', 'done', 'Done for today'),
      ];
      const result = analyzeNotes(logs);
      // Neutral notes should have sentiment score close to 0
      expect(Math.abs(result.sentimentSummary.averageScore)).toBeLessThan(2);
    });

    it('should generate correlation text for positive completion', () => {
      const logs = [
        createLog('1', 'done', 'Felt amazing and accomplished'),
        createLog('2', 'done', 'Great success today'),
        createLog('3', 'done', 'Feeling fantastic'),
        createLog('4', 'done', 'Excellent progress'),
        createLog('5', 'done', 'Love this'),
        createLog('6', 'done', 'Brilliant'),
        createLog('7', 'done', 'Outstanding'),
      ];
      const result = analyzeNotes(logs);
      expect(result.correlationText).toContain('positive');
      expect(result.correlationText.length).toBeGreaterThan(0);
    });

    it('should generate correlation text for negative completion', () => {
      const logs = [
        createLog('1', 'done', 'Terrible experience'),
        createLog('2', 'done', 'Awful today'),
        createLog('3', 'done', 'Feeling horrible'),
        createLog('4', 'done', 'Bad progress'),
        createLog('5', 'done', 'Hate this'),
        createLog('6', 'done', 'Painful'),
        createLog('7', 'done', 'Disappointing'),
      ];
      const result = analyzeNotes(logs);
      expect(result.correlationText).toContain('challenging');
      expect(result.correlationText.length).toBeGreaterThan(0);
    });

    it('should handle mixed completion statuses', () => {
      const logs = [
        createLog('1', 'done', 'Felt great today'),
        createLog('2', 'not_done', 'Too tired'),
        createLog('3', 'done', 'Better today'),
        createLog('4', 'not_done', 'Struggled'),
        createLog('5', 'done', 'Good progress'),
        createLog('6', 'done', 'Feeling motivated'),
        createLog('7', 'done', 'Accomplished'),
      ];
      const result = analyzeNotes(logs);
      expect(result.hasEnoughData).toBe(true);
      expect(result.correlationText).toBeTruthy();
    });

    it('should return empty analysis for logs with no notes at all', () => {
      const logs = [
        createLog('1', 'done'),
        createLog('2', 'done'),
        createLog('3', 'done'),
        createLog('4', 'done'),
        createLog('5', 'done'),
        createLog('6', 'done'),
        createLog('7', 'done'),
      ];
      const result = analyzeNotes(logs);
      expect(result.hasEnoughData).toBe(false);
      expect(result.totalNotes).toBe(0);
    });

    it('should handle case sensitivity in keyword extraction', () => {
      const logs = [
        createLog('1', 'done', 'GREAT workout today'),
        createLog('2', 'done', 'Great progress made'),
        createLog('3', 'done', 'great feeling'),
        createLog('4', 'done', 'GREAT session'),
        createLog('5', 'done', 'great results'),
        createLog('6', 'done', 'Great energy'),
        createLog('7', 'done', 'GREAT day'),
      ];
      const result = analyzeNotes(logs);
      // 'great' should be counted as one keyword regardless of case
      expect(result.keywords).toContain('great');
    });
  });
});
