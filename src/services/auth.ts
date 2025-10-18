/**
 * Authentication Service
 *
 * Manages Google OAuth authentication using Google Identity Services.
 * Handles login, logout, token management, and authentication state.
 *
 * Required Scopes:
 * - https://www.googleapis.com/auth/drive.file (access only to files created by this app)
 * - https://www.googleapis.com/auth/userinfo.profile (user profile info)
 */

import {
  setToken,
  getToken,
  clearToken,
  hasValidToken,
  setupAutoRefresh,
} from '../utils/tokenManager';

// Google Identity Services types
interface GoogleAuthResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// Authentication state
let userProfile: UserProfile | null = null;
let tokenClient: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any -- Google Identity Services token client

// Required OAuth scopes
// Using drive.file for security: only access files created by this app
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

/**
 * Initialize Google Identity Services
 * Must be called before any auth operations
 */
export const initAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId === 'your-google-client-id-here.apps.googleusercontent.com') {
      reject(new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env.local'));
      return;
    }

    // Load Google Identity Services library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Initialize token client for OAuth flow
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({ // eslint-disable-line @typescript-eslint/no-explicit-any
        client_id: clientId,
        scope: SCOPES,
        callback: '', // Will be set per-request
      });

      console.log('[Auth] Google Identity Services initialized');
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services'));
    };

    document.head.appendChild(script);
  });
};

/**
 * Initiate Google OAuth login flow
 * Opens Google's consent screen in a popup
 */
export const login = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Auth not initialized. Call initAuth() first.'));
      return;
    }

    // Set callback for this specific request
    tokenClient.callback = async (response: GoogleAuthResponse) => {
      if (response.error) {
        console.error('[Auth] Login error:', response.error, response.error_description);
        reject(new Error(response.error_description || response.error));
        return;
      }

      try {
        // Store token
        setToken(response.access_token, response.expires_in);

        // Set up automatic token refresh
        setupAutoRefresh(refreshToken);

        // Fetch user profile
        await fetchUserProfile(response.access_token);

        console.log('[Auth] Login successful');
        resolve();
      } catch (error) {
        console.error('[Auth] Failed to complete login:', error);
        clearToken();
        reject(error);
      }
    };

    // Request access token (opens Google OAuth popup)
    try {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      console.error('[Auth] Failed to request access token:', error);
      reject(error);
    }
  });
};

/**
 * Refresh the access token
 * Called automatically before token expiration
 */
const refreshToken = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Auth not initialized'));
      return;
    }

    tokenClient.callback = (response: GoogleAuthResponse) => {
      if (response.error) {
        console.error('[Auth] Token refresh error:', response.error);
        reject(new Error(response.error_description || response.error));
        return;
      }

      // Store new token
      setToken(response.access_token, response.expires_in);

      // Set up next auto-refresh
      setupAutoRefresh(refreshToken);

      console.log('[Auth] Token refreshed successfully');
      resolve();
    };

    // Request new token (should not show popup if user already consented)
    try {
      tokenClient.requestAccessToken({ prompt: '' });
    } catch (error) {
      console.error('[Auth] Failed to refresh token:', error);
      reject(error);
    }
  });
};

/**
 * Fetch user profile information from Google
 */
const fetchUserProfile = async (accessToken: string): Promise<void> => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    const data = await response.json();

    userProfile = {
      id: data.id,
      email: data.email,
      name: data.name,
      picture: data.picture,
    };

    console.log('[Auth] User profile loaded:', userProfile.email);
  } catch (error) {
    console.error('[Auth] Failed to fetch user profile:', error);
    throw error;
  }
};

/**
 * Logout user and clear all authentication state
 */
export const logout = (): void => {
  // Clear token from memory
  clearToken();

  // Clear user profile
  userProfile = null;

  // Revoke Google token (optional - best practice for security)
  const token = getToken();
  if (token) {
    fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).catch((error) => {
      console.warn('[Auth] Failed to revoke token:', error);
    });
  }

  console.log('[Auth] User logged out');
};

/**
 * Get current access token
 * Returns null if not authenticated or token expired
 */
export const getAccessToken = (): string | null => {
  return getToken();
};

/**
 * Check if user is currently authenticated
 */
export const isAuthenticated = (): boolean => {
  return hasValidToken() && userProfile !== null;
};

/**
 * Get current user profile
 * Returns null if not authenticated
 */
export const getUserProfile = (): UserProfile | null => {
  return userProfile;
};

/**
 * Get user ID (sub) for metadata storage
 */
export const getUserId = (): string | null => {
  return userProfile?.id || null;
};
