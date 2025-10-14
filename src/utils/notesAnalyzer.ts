/**
 * Notes Analyzer Utility
 *
 * Analyzes notes from log entries to identify patterns and correlations.
 * Uses simple NLP (keyword extraction) and sentiment analysis.
 *
 * Requirements:
 * - Only show analysis if habit has 7+ log entries with notes
 * - Extract keywords (word frequency, remove stop words)
 * - Perform sentiment analysis (positive/negative/neutral)
 * - Identify correlations between habit completion and sentiment
 */

import Sentiment from 'sentiment';
import { LogEntry } from '../types/logEntry';

const sentiment = new Sentiment();

// Common English stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'i', 'me', 'my', 'you', 'your',
  'this', 'but', 'had', 'have', 'were', 'been', 'am', 'not',
  'so', 'if', 'or', 'when', 'where', 'why', 'how', 'all', 'can',
  'do', 'does', 'did', 'just', 'should', 'could', 'would',
]);

export interface NotesAnalysis {
  hasEnoughData: boolean; // True if 7+ notes available
  totalNotes: number;
  keywords: string[]; // Top keywords found
  sentimentSummary: {
    positive: number; // Count of positive notes
    negative: number; // Count of negative notes
    neutral: number; // Count of neutral notes
    averageScore: number; // Average sentiment score
  };
  correlationText: string; // Human-readable correlation summary
}

/**
 * Extract keywords from notes using simple word frequency analysis
 *
 * @param notes - Array of note strings
 * @returns Top 5 keywords by frequency
 */
const extractKeywords = (notes: string[]): string[] => {
  const wordFrequency = new Map<string, number>();

  notes.forEach(note => {
    // Convert to lowercase, remove punctuation, split into words
    const words = note
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !STOP_WORDS.has(word));

    words.forEach(word => {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    });
  });

  // Sort by frequency and return top 5
  return Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
};

/**
 * Analyze sentiment of notes
 *
 * @param notes - Array of note strings
 * @returns Sentiment summary with counts and average score
 */
const analyzeSentiment = (notes: string[]): {
  positive: number;
  negative: number;
  neutral: number;
  averageScore: number;
} => {
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  let totalScore = 0;

  notes.forEach(note => {
    const result = sentiment.analyze(note);
    totalScore += result.score;

    if (result.score > 0) {
      positive++;
    } else if (result.score < 0) {
      negative++;
    } else {
      neutral++;
    }
  });

  return {
    positive,
    negative,
    neutral,
    averageScore: notes.length > 0 ? totalScore / notes.length : 0,
  };
};

/**
 * Generate correlation text based on habit completion status and sentiment
 *
 * @param logs - Array of log entries with notes
 * @param sentimentSummary - Sentiment analysis summary
 * @param keywords - Extracted keywords
 * @returns Human-readable correlation summary
 */
const generateCorrelationText = (
  logs: LogEntry[],
  sentimentSummary: { positive: number; negative: number; averageScore: number },
  keywords: string[]
): string => {
  // Analyze correlation between completion and sentiment
  const doneEntries = logs.filter(log => log.status === 'done' && log.notes);
  const notDoneEntries = logs.filter(log => log.status === 'not_done' && log.notes);

  let donePositive = 0;
  let doneNegative = 0;
  let notDonePositive = 0;
  let notDoneNegative = 0;

  doneEntries.forEach(log => {
    const result = sentiment.analyze(log.notes || '');
    if (result.score > 0) donePositive++;
    if (result.score < 0) doneNegative++;
  });

  notDoneEntries.forEach(log => {
    const result = sentiment.analyze(log.notes || '');
    if (result.score > 0) notDonePositive++;
    if (result.score < 0) notDoneNegative++;
  });

  // Generate insight based on the data
  const keywordText = keywords.length > 0
    ? ` Common themes include: ${keywords.slice(0, 3).join(', ')}.`
    : '';

  if (doneEntries.length === 0) {
    return `You haven't completed this habit recently. Your notes show ${sentimentSummary.positive > sentimentSummary.negative ? 'mostly positive' : 'mixed'} feelings about it.${keywordText}`;
  }

  const donePositiveRate = doneEntries.length > 0 ? donePositive / doneEntries.length : 0;
  const overallPositiveRate = sentimentSummary.positive / logs.length;

  if (donePositiveRate > 0.6) {
    return `When you complete this habit, you often mention feeling positive and accomplished.${keywordText} Keep up the great work!`;
  } else if (donePositiveRate < 0.3 && doneNegative > donePositive) {
    return `Your notes suggest completing this habit has been challenging.${keywordText} Consider adjusting your approach or setting smaller goals.`;
  } else if (sentimentSummary.averageScore > 1) {
    return `Your notes show an overall positive attitude toward this habit.${keywordText} This positive mindset is a great foundation for success.`;
  } else if (sentimentSummary.averageScore < -1) {
    return `Your notes indicate some frustration or difficulty with this habit.${keywordText} Consider what obstacles might be in your way.`;
  } else {
    return `You're tracking this habit consistently.${keywordText} Your notes show a mix of experiences, which is perfectly normal for building new habits.`;
  }
};

/**
 * Analyze notes from log entries to identify patterns
 *
 * @param logs - Array of log entries for a habit
 * @returns Notes analysis with insights and correlations
 */
export const analyzeNotes = (logs: LogEntry[]): NotesAnalysis => {
  // Filter logs that have notes
  const logsWithNotes = logs.filter(log => log.notes && log.notes.trim().length > 0);

  // Check if we have enough data (minimum 7 notes)
  if (logsWithNotes.length < 7) {
    return {
      hasEnoughData: false,
      totalNotes: logsWithNotes.length,
      keywords: [],
      sentimentSummary: {
        positive: 0,
        negative: 0,
        neutral: 0,
        averageScore: 0,
      },
      correlationText: '',
    };
  }

  // Extract all notes text
  const notes = logsWithNotes.map(log => log.notes || '');

  // Extract keywords
  const keywords = extractKeywords(notes);

  // Analyze sentiment
  const sentimentSummary = analyzeSentiment(notes);

  // Generate correlation text
  const correlationText = generateCorrelationText(
    logsWithNotes,
    sentimentSummary,
    keywords
  );

  return {
    hasEnoughData: true,
    totalNotes: logsWithNotes.length,
    keywords,
    sentimentSummary,
    correlationText,
  };
};
