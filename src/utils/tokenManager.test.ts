/**
 * Token Manager Tests
 *
 * Comprehensive tests for in-memory OAuth token management.
 * Covers token storage, retrieval, expiration, auto-refresh, and security.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setToken,
  getToken,
  hasValidToken,
  isTokenExpiringSoon,
  getTimeUntilExpiry,
  clearToken,
  setupAutoRefresh,
} from './tokenManager';

describe('tokenManager', () => {
  // Save original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  beforeEach(() => {
    // Mock console methods to avoid cluttering test output
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();

    // Use fake timers for consistent time-based testing
    vi.useFakeTimers();

    // Clear any existing token after timers are set up
    clearToken();
  });

  afterEach(() => {
    // Clear token before restoring timers
    clearToken();

    // Restore real timers
    vi.useRealTimers();

    // Restore console methods
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });

  describe('setToken', () => {
    it('should store access token in memory', () => {
      const token = 'test-access-token';
      const expiresIn = 3600; // 1 hour

      setToken(token, expiresIn);

      expect(getToken()).toBe(token);
    });

    it('should calculate correct expiration timestamp', () => {
      const token = 'test-token';
      const expiresIn = 3600; // 1 hour in seconds

      setToken(token, expiresIn);

      const timeUntilExpiry = getTimeUntilExpiry();

      // Time until expiry should be approximately expiresIn seconds
      expect(timeUntilExpiry).toBeGreaterThanOrEqual(expiresIn - 1);
      expect(timeUntilExpiry).toBeLessThanOrEqual(expiresIn);
    });

    it('should clear existing refresh timer when setting new token', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      // Set initial token with auto-refresh
      setToken('token1', 3600);
      const mockRefresh = vi.fn();
      setupAutoRefresh(mockRefresh);

      // Set new token (should clear old timer)
      setToken('token2', 3600);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should log token storage', () => {
      const expiresIn = 3600;
      setToken('test-token', expiresIn);

      expect(console.log).toHaveBeenCalledWith(
        '[TokenManager] Token stored, expires in',
        expiresIn,
        'seconds'
      );
    });
  });

  describe('getToken', () => {
    it('should return null when no token is stored', () => {
      expect(getToken()).toBeNull();
    });

    it('should return stored token when valid', () => {
      const token = 'valid-token';
      setToken(token, 3600);

      expect(getToken()).toBe(token);
    });

    it('should return null when token is expired', () => {
      const token = 'expiring-token';
      const expiresIn = 10; // 10 seconds

      setToken(token, expiresIn);

      // Fast-forward past expiration
      vi.advanceTimersByTime(11 * 1000);

      expect(getToken()).toBeNull();
    });

    it('should clear token when expired', () => {
      setToken('expiring-token', 10);

      // Fast-forward past expiration
      vi.advanceTimersByTime(11 * 1000);

      getToken(); // Triggers expiration check

      expect(getToken()).toBeNull();
    });

    it('should log warning when token is expired', () => {
      setToken('expiring-token', 10);
      vi.advanceTimersByTime(11 * 1000);

      getToken();

      expect(console.warn).toHaveBeenCalledWith('[TokenManager] Token expired');
    });

    it('should return token that expires exactly now as expired', () => {
      setToken('token', 10);

      // Fast-forward to exact expiration time
      vi.advanceTimersByTime(10 * 1000);

      expect(getToken()).toBeNull();
    });
  });

  describe('hasValidToken', () => {
    it('should return false when no token exists', () => {
      expect(hasValidToken()).toBe(false);
    });

    it('should return true when valid token exists', () => {
      setToken('valid-token', 3600);

      expect(hasValidToken()).toBe(true);
    });

    it('should return false when token is expired', () => {
      setToken('expiring-token', 10);
      vi.advanceTimersByTime(11 * 1000);

      expect(hasValidToken()).toBe(false);
    });
  });

  describe('isTokenExpiringSoon', () => {
    it('should return false when no token exists', () => {
      expect(isTokenExpiringSoon()).toBe(false);
    });

    it('should return false when token expires in more than 5 minutes', () => {
      const sixMinutes = 6 * 60; // 6 minutes in seconds
      setToken('long-lived-token', sixMinutes);

      expect(isTokenExpiringSoon()).toBe(false);
    });

    it('should return true when token expires in less than 5 minutes', () => {
      const fourMinutes = 4 * 60; // 4 minutes in seconds
      setToken('expiring-soon-token', fourMinutes);

      expect(isTokenExpiringSoon()).toBe(true);
    });

    it('should return true when token expires in exactly 5 minutes', () => {
      const fiveMinutes = 5 * 60; // 5 minutes in seconds
      setToken('boundary-token', fiveMinutes);

      expect(isTokenExpiringSoon()).toBe(true);
    });

    it('should return true when token expires in 1 minute', () => {
      const oneMinute = 60; // 1 minute in seconds
      setToken('almost-expired-token', oneMinute);

      expect(isTokenExpiringSoon()).toBe(true);
    });

    it('should return true when token is already expired', () => {
      setToken('expired-token', 10);
      vi.advanceTimersByTime(11 * 1000);

      expect(isTokenExpiringSoon()).toBe(true);
    });
  });

  describe('getTimeUntilExpiry', () => {
    it('should return 0 when no token exists', () => {
      expect(getTimeUntilExpiry()).toBe(0);
    });

    it('should return correct time in seconds until expiry', () => {
      const expiresIn = 3600; // 1 hour
      setToken('test-token', expiresIn);

      const timeUntilExpiry = getTimeUntilExpiry();

      expect(timeUntilExpiry).toBeGreaterThanOrEqual(expiresIn - 1);
      expect(timeUntilExpiry).toBeLessThanOrEqual(expiresIn);
    });

    it('should decrease over time', () => {
      const expiresIn = 3600; // 1 hour
      setToken('test-token', expiresIn);

      const initialTime = getTimeUntilExpiry();

      // Fast-forward 10 minutes
      vi.advanceTimersByTime(10 * 60 * 1000);

      const laterTime = getTimeUntilExpiry();

      expect(laterTime).toBeLessThan(initialTime);
      expect(laterTime).toBeCloseTo(expiresIn - 10 * 60, 0);
    });

    it('should return 0 when token is expired', () => {
      setToken('expiring-token', 10);
      vi.advanceTimersByTime(11 * 1000);

      expect(getTimeUntilExpiry()).toBe(0);
    });

    it('should never return negative values', () => {
      setToken('expiring-token', 10);
      vi.advanceTimersByTime(100 * 1000); // Way past expiration

      expect(getTimeUntilExpiry()).toBe(0);
    });
  });

  describe('clearToken', () => {
    it('should clear token from memory', () => {
      setToken('test-token', 3600);
      expect(getToken()).toBe('test-token');

      clearToken();

      expect(getToken()).toBeNull();
    });

    it('should clear refresh timer when token is cleared', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      setToken('test-token', 3600);
      const mockRefresh = vi.fn();
      setupAutoRefresh(mockRefresh);

      clearToken();

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should log when token is cleared', () => {
      setToken('test-token', 3600);
      clearToken();

      expect(console.log).toHaveBeenCalledWith('[TokenManager] Token cleared');
    });

    it('should handle clearing when no token exists', () => {
      expect(() => clearToken()).not.toThrow();
      expect(console.log).toHaveBeenCalledWith('[TokenManager] Token cleared');
    });
  });

  describe('setupAutoRefresh', () => {
    it('should schedule auto-refresh 5 minutes before expiry', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      const tenMinutes = 10 * 60; // 10 minutes in seconds
      setToken('test-token', tenMinutes);

      const mockRefresh = vi.fn();
      setupAutoRefresh(mockRefresh);

      // Should schedule for 5 minutes from now (10 min - 5 min buffer)
      const fiveMinutesMs = 5 * 60 * 1000;
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), fiveMinutesMs);
    });

    it('should call refresh callback at scheduled time', async () => {
      const tenMinutes = 10 * 60;
      setToken('test-token', tenMinutes);

      const mockRefresh = vi.fn().mockResolvedValue(undefined);
      setupAutoRefresh(mockRefresh);

      // Fast-forward to refresh time (5 minutes before expiry)
      vi.advanceTimersByTime(5 * 60 * 1000);

      // Wait for async callback
      await vi.runAllTimersAsync();

      expect(mockRefresh).toHaveBeenCalled();
    });

    it('should log when auto-refresh is triggered', async () => {
      const tenMinutes = 10 * 60;
      setToken('test-token', tenMinutes);

      const mockRefresh = vi.fn().mockResolvedValue(undefined);
      setupAutoRefresh(mockRefresh);

      vi.advanceTimersByTime(5 * 60 * 1000);
      await vi.runAllTimersAsync();

      expect(console.log).toHaveBeenCalledWith('[TokenManager] Auto-refreshing token...');
    });

    it('should clear token if refresh fails', async () => {
      const tenMinutes = 10 * 60;
      setToken('test-token', tenMinutes);

      const mockRefresh = vi.fn().mockRejectedValue(new Error('Refresh failed'));
      setupAutoRefresh(mockRefresh);

      vi.advanceTimersByTime(5 * 60 * 1000);
      await vi.runAllTimersAsync();

      expect(getToken()).toBeNull();
    });

    it('should log error when refresh fails', async () => {
      const tenMinutes = 10 * 60;
      setToken('test-token', tenMinutes);

      const error = new Error('Refresh failed');
      const mockRefresh = vi.fn().mockRejectedValue(error);
      setupAutoRefresh(mockRefresh);

      vi.advanceTimersByTime(5 * 60 * 1000);
      await vi.runAllTimersAsync();

      expect(console.error).toHaveBeenCalledWith('[TokenManager] Auto-refresh failed:', error);
    });

    it('should warn when setting up auto-refresh without token', () => {
      const mockRefresh = vi.fn();
      setupAutoRefresh(mockRefresh);

      expect(console.warn).toHaveBeenCalledWith(
        '[TokenManager] Cannot setup auto-refresh: no token'
      );
    });

    it('should not schedule refresh when no token exists', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');

      const mockRefresh = vi.fn();
      setupAutoRefresh(mockRefresh);

      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    it('should clear existing timer before setting new one', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
      const tenMinutes = 10 * 60;
      setToken('test-token', tenMinutes);

      const mockRefresh1 = vi.fn();
      setupAutoRefresh(mockRefresh1);

      const mockRefresh2 = vi.fn();
      setupAutoRefresh(mockRefresh2);

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should schedule immediately if token expires in less than 5 minutes', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      const threeMinutes = 3 * 60; // Less than 5-minute buffer
      setToken('test-token', threeMinutes);

      const mockRefresh = vi.fn();
      setupAutoRefresh(mockRefresh);

      // Should schedule with 0 delay (immediate)
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 0);
    });

    it('should log scheduled time', () => {
      const tenMinutes = 10 * 60;
      setToken('test-token', tenMinutes);

      const mockRefresh = vi.fn();
      setupAutoRefresh(mockRefresh);

      expect(console.log).toHaveBeenCalledWith(
        '[TokenManager] Auto-refresh scheduled in',
        5 * 60, // 5 minutes in seconds
        'seconds'
      );
    });
  });

  describe('security - in-memory storage', () => {
    it('should not persist token to localStorage', () => {
      const localStorageSpy = vi.spyOn(Storage.prototype, 'setItem');

      setToken('secret-token', 3600);

      expect(localStorageSpy).not.toHaveBeenCalled();
    });

    it('should not persist token to sessionStorage', () => {
      const sessionStorageSpy = vi.spyOn(Storage.prototype, 'setItem');

      setToken('secret-token', 3600);

      expect(sessionStorageSpy).not.toHaveBeenCalled();
    });

    it('should clear token completely on clearToken call', () => {
      setToken('secret-token', 3600);
      clearToken();

      // Token should be completely removed from memory
      expect(getToken()).toBeNull();
      expect(hasValidToken()).toBe(false);
      expect(getTimeUntilExpiry()).toBe(0);
      expect(isTokenExpiringSoon()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle very short expiry times (1 second)', () => {
      setToken('short-lived-token', 1);

      expect(getToken()).toBe('short-lived-token');

      vi.advanceTimersByTime(1000);

      expect(getToken()).toBeNull();
    });

    it('should handle very long expiry times (24 hours)', () => {
      const twentyFourHours = 24 * 60 * 60;
      setToken('long-lived-token', twentyFourHours);

      expect(getToken()).toBe('long-lived-token');
      expect(isTokenExpiringSoon()).toBe(false);

      // Fast-forward 23 hours (not expired yet)
      vi.advanceTimersByTime(23 * 60 * 60 * 1000);

      expect(getToken()).toBe('long-lived-token');
    });

    it('should handle zero expiry time (expires immediately)', () => {
      setToken('instant-expire-token', 0);

      // Token is expired immediately
      expect(getToken()).toBeNull();
    });

    it('should handle negative expiry time (already expired)', () => {
      setToken('negative-expire-token', -100);

      // Token is expired immediately
      expect(getToken()).toBeNull();
    });

    it('should handle multiple rapid token updates', () => {
      setToken('token1', 3600);
      setToken('token2', 3600);
      setToken('token3', 3600);

      expect(getToken()).toBe('token3');
    });

    it('should handle token update while auto-refresh is scheduled', async () => {
      const tenMinutes = 10 * 60;
      setToken('token1', tenMinutes);

      const mockRefresh1 = vi.fn().mockResolvedValue(undefined);
      setupAutoRefresh(mockRefresh1);

      // Update token before refresh triggers
      vi.advanceTimersByTime(2 * 60 * 1000); // 2 minutes
      setToken('token2', tenMinutes);

      const mockRefresh2 = vi.fn().mockResolvedValue(undefined);
      setupAutoRefresh(mockRefresh2);

      // Original refresh should not trigger
      vi.advanceTimersByTime(3 * 60 * 1000); // Total 5 minutes (original refresh time)
      await vi.runAllTimersAsync();

      expect(mockRefresh1).not.toHaveBeenCalled();
      expect(getToken()).toBe('token2');
    });
  });
});
