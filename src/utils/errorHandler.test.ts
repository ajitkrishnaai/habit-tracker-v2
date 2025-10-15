/**
 * Error Handler Tests
 *
 * Comprehensive tests for error parsing, categorization, and user-friendly messaging.
 * Covers all error types: auth, network, permission, validation, sync, and unknown.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  parseError,
  logError,
  formatErrorMessage,
  type AppError,
  type ErrorType,
} from './errorHandler';

describe('errorHandler', () => {
  // Save original console methods
  const originalError = console.error;

  beforeEach(() => {
    // Mock console.error to avoid cluttering test output
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore console.error
    console.error = originalError;
  });

  describe('parseError', () => {
    describe('authentication errors', () => {
      it('should parse auth errors', () => {
        const error = new Error('Failed to auth user');
        const result = parseError(error);

        expect(result.type).toBe('auth');
        expect(result.message).toBe('Authentication failed');
        expect(result.retryable).toBe(true);
      });

      it('should parse token errors', () => {
        const error = new Error('Invalid token provided');
        const result = parseError(error);

        expect(result.type).toBe('auth');
        expect(result.message).toBe('Authentication failed');
        expect(result.retryable).toBe(true);
      });

      it('should provide user-friendly message for popup_closed_by_user', () => {
        const error = new Error('auth error: popup_closed_by_user');
        const result = parseError(error);

        expect(result.type).toBe('auth');
        expect(result.details).toBe('Sign-in was cancelled. Please try again.');
      });

      it('should provide user-friendly message for popup_blocked', () => {
        const error = new Error('auth error: popup_blocked by browser');
        const result = parseError(error);

        expect(result.type).toBe('auth');
        expect(result.details).toBe('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      });

      it('should provide user-friendly message for access_denied', () => {
        const error = new Error('auth error: access_denied by user');
        const result = parseError(error);

        expect(result.type).toBe('auth');
        expect(result.details).toBe('Access was denied. Please grant the required permissions to continue.');
      });

      it('should provide user-friendly message for consent required', () => {
        const error = new Error('auth error: user consent required');
        const result = parseError(error);

        expect(result.type).toBe('auth');
        expect(result.details).toBe('Access was denied. Please grant the required permissions to continue.');
      });

      it('should provide user-friendly message for insufficient permissions', () => {
        const error = new Error('auth error: insufficient permissions granted');
        const result = parseError(error);

        expect(result.type).toBe('auth');
        expect(result.details).toBe('Insufficient permissions. Please sign in again and grant all required permissions.');
      });

      it('should provide user-friendly message for invalid_grant', () => {
        const error = new Error('auth error: invalid_grant occurred');
        const result = parseError(error);

        expect(result.type).toBe('auth');
        expect(result.details).toBe('Your session has expired. Please sign in again.');
      });

      it('should provide user-friendly message for expired token', () => {
        const error = new Error('token expired');
        const result = parseError(error);

        expect(result.type).toBe('auth');
        expect(result.details).toBe('Your session has expired. Please sign in again.');
      });

      it('should provide user-friendly message for not initialized', () => {
        const error = new Error('auth service not initialized');
        const result = parseError(error);

        expect(result.type).toBe('auth');
        expect(result.details).toBe('Authentication system is initializing. Please wait a moment and try again.');
      });
    });

    describe('permission errors', () => {
      it('should parse permission errors', () => {
        const error = new Error('permission denied to access resource');
        const result = parseError(error);

        expect(result.type).toBe('permission');
        expect(result.message).toBe('Permission denied');
        expect(result.details).toBe('Please ensure you granted all required permissions when signing in.');
        expect(result.retryable).toBe(true);
      });

      it('should parse 403 errors', () => {
        const error = new Error('HTTP 403 forbidden');
        const result = parseError(error);

        expect(result.type).toBe('permission');
        expect(result.message).toBe('Permission denied');
      });
    });

    describe('network errors', () => {
      it('should parse network errors', () => {
        const error = new Error('network error occurred');
        const result = parseError(error);

        expect(result.type).toBe('network');
        expect(result.message).toBe('Network error');
        expect(result.details).toBe('Please check your internet connection and try again.');
        expect(result.retryable).toBe(true);
      });

      it('should parse fetch errors', () => {
        const error = new Error('fetch failed');
        const result = parseError(error);

        expect(result.type).toBe('network');
        expect(result.message).toBe('Network error');
      });

      it('should parse NetworkError', () => {
        const error = new Error('NetworkError: connection refused');
        const result = parseError(error);

        expect(result.type).toBe('network');
        expect(result.message).toBe('Network error');
      });
    });

    describe('validation errors', () => {
      it('should parse validation errors', () => {
        const error = new Error('validation failed for input');
        const result = parseError(error);

        expect(result.type).toBe('validation');
        expect(result.message).toBe('Validation error');
        expect(result.details).toBe('validation failed for input');
        expect(result.retryable).toBe(false);
      });

      it('should parse invalid input errors', () => {
        const error = new Error('invalid habit name provided');
        const result = parseError(error);

        expect(result.type).toBe('validation');
        expect(result.message).toBe('Validation error');
        expect(result.details).toBe('invalid habit name provided');
      });

      it('should mark validation errors as not retryable', () => {
        const error = new Error('validation error');
        const result = parseError(error);

        expect(result.retryable).toBe(false);
      });
    });

    describe('sync errors', () => {
      it('should parse sync errors', () => {
        const error = new Error('sync operation failed');
        const result = parseError(error);

        expect(result.type).toBe('sync');
        expect(result.message).toBe('Sync failed');
        expect(result.details).toBe('Your changes are saved locally and will sync when connection is restored.');
        expect(result.retryable).toBe(true);
      });
    });

    describe('unknown errors', () => {
      it('should parse unknown errors', () => {
        const error = new Error('Something unexpected happened');
        const result = parseError(error);

        expect(result.type).toBe('unknown');
        expect(result.message).toBe('Something went wrong');
        expect(result.details).toBe('Something unexpected happened');
        expect(result.retryable).toBe(true);
      });

      it('should handle errors without message', () => {
        const error = {};
        const result = parseError(error);

        expect(result.type).toBe('unknown');
        expect(result.message).toBe('Something went wrong');
        expect(result.details).toBe('An unexpected error occurred. Please try again.');
      });

      it('should handle null errors', () => {
        const result = parseError({ message: null });

        expect(result.type).toBe('unknown');
        expect(result.message).toBe('Something went wrong');
      });

      it('should handle string errors', () => {
        const result = parseError({ message: 'Something went wrong' });

        expect(result.type).toBe('unknown');
        expect(result.message).toBe('Something went wrong');
      });
    });

    describe('error priority and matching', () => {
      it('should prioritize auth over validation for "invalid token"', () => {
        const error = new Error('invalid token');
        const result = parseError(error);

        expect(result.type).toBe('auth');
      });

      it('should prioritize permission over network for "403"', () => {
        const error = new Error('403 forbidden');
        const result = parseError(error);

        expect(result.type).toBe('permission');
      });

      it('should match auth errors before sync errors', () => {
        const error = new Error('auth sync failed');
        const result = parseError(error);

        expect(result.type).toBe('auth');
      });
    });
  });

  describe('logError', () => {
    it('should log error to console with context', () => {
      const error = new Error('Test error');
      const context = 'TestContext';

      logError(context, error);

      expect(console.error).toHaveBeenCalledWith('[TestContext]', error);
    });

    it('should log with different contexts', () => {
      const error = new Error('Auth failure');

      logError('AuthService', error);
      expect(console.error).toHaveBeenCalledWith('[AuthService]', error);

      logError('SyncService', error);
      expect(console.error).toHaveBeenCalledWith('[SyncService]', error);
    });

    it('should handle non-Error objects', () => {
      const errorObj = { message: 'Custom error object' };

      logError('CustomContext', errorObj);

      expect(console.error).toHaveBeenCalledWith('[CustomContext]', errorObj);
    });

    it('should handle string errors', () => {
      logError('StringContext', 'Simple error string');

      expect(console.error).toHaveBeenCalledWith('[StringContext]', 'Simple error string');
    });

    it('should handle null errors', () => {
      logError('NullContext', null);

      expect(console.error).toHaveBeenCalledWith('[NullContext]', null);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format error with message only', () => {
      const error: AppError = {
        type: 'network',
        message: 'Network error',
        retryable: false,
      };

      const result = formatErrorMessage(error);

      expect(result).toBe('Network error');
    });

    it('should format error with message and details', () => {
      const error: AppError = {
        type: 'auth',
        message: 'Authentication failed',
        details: 'Please sign in again',
        retryable: false,
      };

      const result = formatErrorMessage(error);

      expect(result).toBe('Authentication failed\nPlease sign in again');
    });

    it('should add retry message for retryable errors', () => {
      const error: AppError = {
        type: 'sync',
        message: 'Sync failed',
        retryable: true,
      };

      const result = formatErrorMessage(error);

      expect(result).toBe('Sync failed\n\nPlease try again.');
    });

    it('should format error with all fields', () => {
      const error: AppError = {
        type: 'network',
        message: 'Network error',
        details: 'Check your connection',
        retryable: true,
      };

      const result = formatErrorMessage(error);

      expect(result).toBe('Network error\nCheck your connection\n\nPlease try again.');
    });

    it('should not add retry message for non-retryable errors', () => {
      const error: AppError = {
        type: 'validation',
        message: 'Validation error',
        details: 'Invalid input',
        retryable: false,
      };

      const result = formatErrorMessage(error);

      expect(result).toBe('Validation error\nInvalid input');
      expect(result).not.toContain('Please try again');
    });

    it('should handle empty details', () => {
      const error: AppError = {
        type: 'unknown',
        message: 'Something went wrong',
        details: '',
        retryable: false,
      };

      const result = formatErrorMessage(error);

      expect(result).toBe('Something went wrong');
    });
  });

  describe('comprehensive error type coverage', () => {
    const errorTypes: ErrorType[] = ['auth', 'network', 'permission', 'validation', 'sync', 'unknown'];

    it('should handle all defined error types', () => {
      errorTypes.forEach((type) => {
        const error = new Error(`${type} error occurred`);
        const result = parseError(error);

        expect(result).toBeDefined();
        expect(result.message).toBeDefined();
        expect(typeof result.retryable).toBe('boolean');
      });
    });

    it('should produce valid AppError objects for all types', () => {
      errorTypes.forEach((type) => {
        const error = new Error(`${type} error`);
        const result = parseError(error);

        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('retryable');
        expect(typeof result.type).toBe('string');
        expect(typeof result.message).toBe('string');
        expect(typeof result.retryable).toBe('boolean');
      });
    });
  });

  describe('real-world error scenarios', () => {
    it('should handle Google OAuth popup closure gracefully', () => {
      const error = new Error('auth error: user closed the popup');
      const result = parseError(error);

      expect(result.type).toBe('auth');
      expect(result.details).toContain('Sign-in was cancelled');
    });

    it('should handle offline scenario', () => {
      const error = new Error('fetch failed: network error');
      const result = parseError(error);

      expect(result.type).toBe('network');
      expect(result.details).toContain('internet connection');
    });

    it('should handle habit name too long', () => {
      const error = new Error('validation failed: habit name exceeds 100 characters');
      const result = parseError(error);

      expect(result.type).toBe('validation');
      expect(result.retryable).toBe(false);
      expect(result.details).toContain('100 characters');
    });

    it('should handle duplicate habit name', () => {
      const error = new Error('invalid operation: duplicate habit name');
      const result = parseError(error);

        expect(result.type).toBe('validation');
      expect(result.retryable).toBe(false);
    });

    it('should handle Google Sheets API 403 (insufficient permissions)', () => {
      const error = new Error('Google Sheets API error: 403 forbidden');
      const result = parseError(error);

      expect(result.type).toBe('permission');
      expect(result.details).toContain('permissions');
    });

    it('should handle sync queue conflict', () => {
      const error = new Error('sync conflict detected');
      const result = parseError(error);

      expect(result.type).toBe('sync');
      expect(result.details).toContain('saved locally');
    });

    it('should handle expired session during sync', () => {
      const error = new Error('token expired during sync');
      const result = parseError(error);

      // Auth takes priority over sync
      expect(result.type).toBe('auth');
      expect(result.details).toContain('session has expired');
    });
  });

  describe('edge cases', () => {
    it('should handle errors with undefined message property', () => {
      const error = { message: undefined };
      const result = parseError(error);

      expect(result.type).toBe('unknown');
      expect(result.details).toBeDefined();
    });

    it('should handle errors with null message property', () => {
      const error = { message: null };
      const result = parseError(error);

      expect(result.type).toBe('unknown');
    });

    it('should handle errors with numeric message', () => {
      const error = { message: '404' };
      const result = parseError(error);

      expect(result).toBeDefined();
      expect(result.type).toBe('unknown');
    });

    it('should handle very long error messages', () => {
      const longMessage = 'Error: ' + 'x'.repeat(1000);
      const error = new Error(longMessage);
      const result = parseError(error);

      expect(result.details).toBe(longMessage);
    });

    it('should handle error messages with special characters', () => {
      const error = new Error('Error: <script>alert("xss")</script>');
      const result = parseError(error);

      expect(result.details).toContain('<script>');
    });

    it('should handle errors with multiple matching keywords', () => {
      const error = new Error('Network validation auth error');
      const result = parseError(error);

      // Should match first pattern (auth)
      expect(result.type).toBe('auth');
    });
  });

  describe('integration with formatErrorMessage', () => {
    it('should produce user-readable output for auth errors', () => {
      const error = new Error('auth error: popup_closed_by_user');
      const parsed = parseError(error);
      const formatted = formatErrorMessage(parsed);

      expect(formatted).toContain('Authentication failed');
      expect(formatted).toContain('Sign-in was cancelled');
      expect(formatted).toContain('Please try again');
    });

    it('should produce user-readable output for network errors', () => {
      const error = new Error('fetch failed');
      const parsed = parseError(error);
      const formatted = formatErrorMessage(parsed);

      expect(formatted).toContain('Network error');
      expect(formatted).toContain('internet connection');
      expect(formatted).toContain('Please try again');
    });

    it('should produce user-readable output for validation errors', () => {
      const error = new Error('Validation failed: invalid input');
      const parsed = parseError(error);
      const formatted = formatErrorMessage(parsed);

      expect(formatted).toContain('Validation error');
      expect(formatted).toContain('invalid input');
      expect(formatted).not.toContain('Please try again');
    });

    it('should produce complete error flow for sync errors', () => {
      const error = new Error('sync to Google Sheets failed');
      const parsed = parseError(error);

      expect(parsed.type).toBe('sync');
      expect(parsed.retryable).toBe(true);

      const formatted = formatErrorMessage(parsed);
      expect(formatted).toContain('Sync failed');
      expect(formatted).toContain('saved locally');
      expect(formatted).toContain('Please try again');
    });
  });
});
