/**
 * Token Manager Utility
 *
 * Manages OAuth tokens securely in memory (never in localStorage for security).
 * Handles automatic token refresh before expiration.
 *
 * Security: Tokens are stored only in memory to prevent XSS attacks from accessing
 * long-lived credentials. They are cleared on logout or page refresh.
 */

interface TokenData {
  accessToken: string;
  expiresAt: number; // Unix timestamp in milliseconds
  refreshTimer?: NodeJS.Timeout;
}

// In-memory storage only - cleared on page refresh
let tokenData: TokenData | null = null;

/**
 * Store access token in memory with expiration time
 */
export const setToken = (accessToken: string, expiresIn: number): void => {
  // Clear any existing refresh timer
  if (tokenData?.refreshTimer) {
    clearTimeout(tokenData.refreshTimer);
  }

  // Calculate expiration timestamp (expiresIn is in seconds)
  const expiresAt = Date.now() + expiresIn * 1000;

  tokenData = {
    accessToken,
    expiresAt,
  };

  console.log('[TokenManager] Token stored, expires in', expiresIn, 'seconds');
};

/**
 * Get the current access token
 * Returns null if no token or token is expired
 */
export const getToken = (): string | null => {
  if (!tokenData) {
    return null;
  }

  // Check if token is expired
  if (Date.now() >= tokenData.expiresAt) {
    console.warn('[TokenManager] Token expired');
    clearToken();
    return null;
  }

  return tokenData.accessToken;
};

/**
 * Check if token exists and is valid
 */
export const hasValidToken = (): boolean => {
  return getToken() !== null;
};

/**
 * Check if token will expire soon (within 5 minutes)
 * Used to trigger proactive token refresh
 */
export const isTokenExpiringSoon = (): boolean => {
  if (!tokenData) {
    return false;
  }

  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  const timeUntilExpiry = tokenData.expiresAt - Date.now();

  return timeUntilExpiry <= fiveMinutes;
};

/**
 * Get time until token expiration in seconds
 */
export const getTimeUntilExpiry = (): number => {
  if (!tokenData) {
    return 0;
  }

  const timeInMs = tokenData.expiresAt - Date.now();
  return Math.max(0, Math.floor(timeInMs / 1000));
};

/**
 * Clear token from memory
 */
export const clearToken = (): void => {
  if (tokenData?.refreshTimer) {
    clearTimeout(tokenData.refreshTimer);
  }
  tokenData = null;
  console.log('[TokenManager] Token cleared');
};

/**
 * Set up automatic token refresh callback
 * The callback will be called when token is about to expire (5 min before)
 */
export const setupAutoRefresh = (refreshCallback: () => Promise<void>): void => {
  if (!tokenData) {
    console.warn('[TokenManager] Cannot setup auto-refresh: no token');
    return;
  }

  // Clear any existing timer
  if (tokenData.refreshTimer) {
    clearTimeout(tokenData.refreshTimer);
  }

  // Calculate when to trigger refresh (5 minutes before expiry)
  const fiveMinutes = 5 * 60 * 1000;
  const timeUntilRefresh = Math.max(0, tokenData.expiresAt - Date.now() - fiveMinutes);

  tokenData.refreshTimer = setTimeout(async () => {
    console.log('[TokenManager] Auto-refreshing token...');
    try {
      await refreshCallback();
    } catch (error) {
      console.error('[TokenManager] Auto-refresh failed:', error);
      clearToken();
    }
  }, timeUntilRefresh);

  console.log('[TokenManager] Auto-refresh scheduled in', Math.floor(timeUntilRefresh / 1000), 'seconds');
};
