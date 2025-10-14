/**
 * Google Sheets Service
 *
 * Manages all interactions with Google Sheets API v4.
 * Handles sheet creation, initialization, and data read/write operations.
 *
 * Sheet Structure:
 * - Habits tab: habit_id, name, category, status, created_date, modified_date
 * - Logs tab: log_id, habit_id, date, status, notes, timestamp
 * - Metadata tab: sheet_version, last_sync, user_id, sheet_id
 */

import { getAccessToken } from './auth';
import type { Habit } from '../types/habit';
import type { LogEntry } from '../types/logEntry';
import type { Metadata } from '../types/metadata';

// API Configuration
const SHEET_VERSION = '1.0';

/**
 * Initialize Google Sheets API client
 * Note: No initialization needed - we use OAuth tokens directly with REST API
 */
export const initGoogleSheetsAPI = async (): Promise<void> => {
  // OAuth tokens are handled by auth service
  // No additional initialization required for REST API calls
  console.log('[GoogleSheets] API ready (using OAuth tokens)');
  return Promise.resolve();
};

/**
 * Create a new Google Sheet in user's Drive
 * Returns the sheet ID
 */
export const createNewSheet = async (sheetName: string): Promise<string> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: sheetName,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create sheet: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[GoogleSheets] Created new sheet:', data.spreadsheetId);
    return data.spreadsheetId;
  } catch (error) {
    console.error('[GoogleSheets] Error creating sheet:', error);
    throw error;
  }
};

/**
 * Initialize sheet structure with three tabs and headers
 * Creates: Habits, Logs, and Metadata tabs
 */
export const initializeSheetStructure = async (sheetId: string): Promise<void> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    // Batch requests to set up all tabs
    const requests = [
      // Rename first sheet to "Habits"
      {
        updateSheetProperties: {
          properties: {
            sheetId: 0,
            title: 'Habits',
          },
          fields: 'title',
        },
      },
      // Add "Logs" sheet
      {
        addSheet: {
          properties: {
            title: 'Logs',
          },
        },
      },
      // Add "Metadata" sheet
      {
        addSheet: {
          properties: {
            title: 'Metadata',
          },
        },
      },
    ];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to initialize structure: ${response.statusText}`);
    }

    // Add headers to each tab
    await addHeaders(sheetId);

    console.log('[GoogleSheets] Sheet structure initialized');
  } catch (error) {
    console.error('[GoogleSheets] Error initializing structure:', error);
    throw error;
  }
};

/**
 * Add column headers to all tabs
 */
const addHeaders = async (sheetId: string): Promise<void> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headerData = [
    // Habits tab headers
    {
      range: 'Habits!A1:F1',
      values: [['habit_id', 'name', 'category', 'status', 'created_date', 'modified_date']],
    },
    // Logs tab headers
    {
      range: 'Logs!A1:F1',
      values: [['log_id', 'habit_id', 'date', 'status', 'notes', 'timestamp']],
    },
    // Metadata tab headers
    {
      range: 'Metadata!A1:D1',
      values: [['sheet_version', 'last_sync', 'user_id', 'sheet_id']],
    },
  ];

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          valueInputOption: 'RAW',
          data: headerData,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add headers: ${response.statusText}`);
    }

    console.log('[GoogleSheets] Headers added');
  } catch (error) {
    console.error('[GoogleSheets] Error adding headers:', error);
    throw error;
  }
};

/**
 * Check if sheet exists and is accessible
 */
export const checkSheetExists = async (sheetId: string): Promise<boolean> => {
  const token = getAccessToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error('[GoogleSheets] Error checking sheet:', error);
    return false;
  }
};

/**
 * Read all habits from the Habits tab
 */
export const readHabits = async (sheetId: string): Promise<Habit[]> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Habits!A2:F`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to read habits: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    const habits: Habit[] = rows.map((row: any[]) => ({
      habit_id: row[0] || '',
      name: row[1] || '',
      category: row[2] || undefined,
      status: (row[3] as 'active' | 'inactive') || 'active',
      created_date: row[4] || '',
      modified_date: row[5] || '',
    }));

    console.log('[GoogleSheets] Read', habits.length, 'habits');
    return habits;
  } catch (error) {
    console.error('[GoogleSheets] Error reading habits:', error);
    throw error;
  }
};

/**
 * Write habits to the Habits tab
 * Overwrites all existing habits
 */
export const writeHabits = async (sheetId: string, habits: Habit[]): Promise<void> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    // Convert habits to row format
    const values = habits.map((habit) => [
      habit.habit_id,
      habit.name,
      habit.category || '',
      habit.status,
      habit.created_date,
      habit.modified_date,
    ]);

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Habits!A2:F?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GoogleSheets] Habits write error:', errorText);
      throw new Error(`Failed to write habits: ${response.statusText}`);
    }

    console.log('[GoogleSheets] Wrote', habits.length, 'habits');
  } catch (error) {
    console.error('[GoogleSheets] Error writing habits:', error);
    throw error;
  }
};

/**
 * Read all logs from the Logs tab
 */
export const readLogs = async (sheetId: string): Promise<LogEntry[]> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Logs!A2:F`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to read logs: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    const logs: LogEntry[] = rows.map((row: any[]) => ({
      log_id: row[0] || '',
      habit_id: row[1] || '',
      date: row[2] || '',
      status: (row[3] as 'done' | 'not_done' | 'no_data') || 'no_data',
      notes: row[4] || undefined,
      timestamp: row[5] || '',
    }));

    console.log('[GoogleSheets] Read', logs.length, 'logs');
    return logs;
  } catch (error) {
    console.error('[GoogleSheets] Error reading logs:', error);
    throw error;
  }
};

/**
 * Write logs to the Logs tab
 * Overwrites all existing logs
 */
export const writeLogs = async (sheetId: string, logs: LogEntry[]): Promise<void> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    // Convert logs to row format
    const values = logs.map((log) => [
      log.log_id,
      log.habit_id,
      log.date,
      log.status,
      log.notes || '',
      log.timestamp,
    ]);

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Logs!A2:F?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GoogleSheets] Logs write error:', errorText);
      throw new Error(`Failed to write logs: ${response.statusText}`);
    }

    console.log('[GoogleSheets] Wrote', logs.length, 'logs');
  } catch (error) {
    console.error('[GoogleSheets] Error writing logs:', error);
    throw error;
  }
};

/**
 * Read metadata from the Metadata tab
 */
export const readMetadata = async (sheetId: string): Promise<Metadata | null> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Metadata!A2:D2`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to read metadata: ${response.statusText}`);
    }

    const data = await response.json();
    const rows = data.values || [];

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    const metadata: Metadata = {
      sheet_version: row[0] || SHEET_VERSION,
      last_sync: row[1] || new Date().toISOString(),
      user_id: row[2] || '',
      sheet_id: row[3] || sheetId,
    };

    console.log('[GoogleSheets] Read metadata');
    return metadata;
  } catch (error) {
    console.error('[GoogleSheets] Error reading metadata:', error);
    throw error;
  }
};

/**
 * Write metadata to the Metadata tab
 */
export const writeMetadata = async (sheetId: string, metadata: Metadata): Promise<void> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const values = [
      [metadata.sheet_version, metadata.last_sync, metadata.user_id, metadata.sheet_id],
    ];

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Metadata!A2:D2?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GoogleSheets] Metadata write error:', errorText);
      throw new Error(`Failed to write metadata: ${response.statusText}`);
    }

    console.log('[GoogleSheets] Wrote metadata');
  } catch (error) {
    console.error('[GoogleSheets] Error writing metadata:', error);
    throw error;
  }
};
