/**
 * Authentication Service - Supabase Edition
 *
 * Manages authentication using Supabase Auth with email/password.
 * Handles login, logout, session management, and authentication state.
 * Task 4.3: Added demo data migration on signup/login
 *
 * Migration Note: This replaces the previous Google OAuth implementation.
 * Supabase handles all token management, refresh, and session persistence automatically.
 */

import { supabase } from '../lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { demoModeService } from './demoMode';

/**
 * User profile interface matching the old auth.ts API
 * for backwards compatibility with existing components
 */
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

// Authentication state
let currentSession: Session | null = null;
let currentUser: User | null = null;
let authChangeListeners: Array<(authenticated: boolean) => void> = [];

/**
 * Initialize Supabase Auth
 * Sets up auth state change listener and checks for existing session
 * Must be called before any auth operations
 */
export const initAuth = async (): Promise<void> => {
  try {
    // Check for existing session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[Auth] Error getting session:', sessionError);
      throw sessionError;
    }

    // Update local state
    currentSession = session;
    currentUser = session?.user ?? null;

    // Set up auth state change listener
    supabase.auth.onAuthStateChange((_event, session) => {
      const wasAuthenticated = currentSession !== null;
      currentSession = session;
      currentUser = session?.user ?? null;
      const isAuthenticated = currentSession !== null;

      console.log('[Auth] Auth state changed:', _event, isAuthenticated ? 'authenticated' : 'not authenticated');

      // Notify listeners if auth state changed
      if (wasAuthenticated !== isAuthenticated) {
        authChangeListeners.forEach(listener => listener(isAuthenticated));
      }
    });

    console.log('[Auth] Supabase Auth initialized', currentSession ? 'with existing session' : 'without session');
  } catch (error) {
    console.error('[Auth] Failed to initialize auth:', error);
    throw error;
  }
};

/**
 * Subscribe to authentication state changes
 * @param callback Function to call when auth state changes (receives true/false for authenticated)
 * @returns Unsubscribe function
 */
export const onAuthChange = (callback: (authenticated: boolean) => void): (() => void) => {
  authChangeListeners.push(callback);
  return () => {
    authChangeListeners = authChangeListeners.filter(listener => listener !== callback);
  };
};

/**
 * Initiate email/password login
 * @param email User's email address
 * @param password User's password
 * Task 4.3: Added demo data migration after successful login
 */
export const loginWithEmail = async (email: string, password: string): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }

    currentSession = data.session;
    currentUser = data.user;

    console.log('[Auth] Login successful:', currentUser?.email);

    // Check for demo data and migrate if exists (REQ-44 to REQ-51)
    const demoMetrics = demoModeService.getDemoMetrics();
    if (demoMetrics) {
      console.log('[Auth] Demo data detected - migrating to authenticated account');
      try {
        await demoModeService.migrateDemoData();
        console.log('[Auth] Demo data migration complete');

        // Store flag to show migration success toast
        sessionStorage.setItem('demo_migration_success', 'true');
      } catch (migrationError) {
        console.error('[Auth] Demo data migration failed:', migrationError);
        // Don't block login on migration failure
        // User can manually sync later
      }
    }
  } catch (error) {
    console.error('[Auth] Failed to complete login:', error);
    throw error;
  }
};

/**
 * Sign up a new user with email/password
 * @param email User's email address
 * @param password User's password
 * @param name User's display name (optional)
 * Task 4.3: Added demo data migration after successful signup
 */
export const signUpWithEmail = async (email: string, password: string, name?: string): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0], // Use email prefix as default name
        },
      },
    });

    if (error) {
      console.error('[Auth] Sign up error:', error);
      throw error;
    }

    // Note: Depending on Supabase email confirmation settings,
    // the user might need to confirm their email before session is created
    currentSession = data.session;
    currentUser = data.user;

    console.log('[Auth] Sign up successful:', currentUser?.email);

    // Check for demo data and migrate if exists (REQ-44 to REQ-51)
    const demoMetrics = demoModeService.getDemoMetrics();
    if (demoMetrics) {
      console.log('[Auth] Demo data detected - migrating to new account');
      try {
        await demoModeService.migrateDemoData();
        console.log('[Auth] Demo data migration complete');

        // Store flag to show migration success toast
        sessionStorage.setItem('demo_migration_success', 'true');
      } catch (migrationError) {
        console.error('[Auth] Demo data migration failed:', migrationError);
        // Don't block signup on migration failure
      }
    }
  } catch (error) {
    console.error('[Auth] Failed to complete sign up:', error);
    throw error;
  }
};

/**
 * Initiate Google OAuth login flow (OPTIONAL - NOT USED BY DEFAULT)
 * Opens Google's consent screen
 *
 * Note: This requires Google OAuth to be configured in Supabase dashboard.
 * By default, the app uses email/password authentication (loginWithEmail).
 * This function is kept for backward compatibility or optional future use.
 */
export const login = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/daily-log`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[Auth] OAuth login error:', error);
      throw error;
    }

    // OAuth flow redirects to Google - session will be set on return
    console.log('[Auth] Redirecting to Google OAuth...', data);
  } catch (error) {
    console.error('[Auth] Failed to initiate OAuth login:', error);
    throw error;
  }
};

/**
 * Logout user and clear all authentication state
 * Also clears IndexedDB to prevent data leakage between users
 */
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('[Auth] Logout error:', error);
      throw error;
    }

    // Clear local state
    currentSession = null;
    currentUser = null;

    // Clear IndexedDB to prevent cross-user data leakage on shared devices
    try {
      const { storageService } = await import('./storage');
      await storageService.clearAll();
      console.log('[Auth] Cleared IndexedDB on logout');
    } catch (storageError) {
      console.error('[Auth] Failed to clear IndexedDB on logout:', storageError);
      // Non-blocking - logout still successful
    }

    // Clear demo mode data if any exists
    try {
      await demoModeService.clearDemoData();
      console.log('[Auth] Cleared demo data on logout');
    } catch (demoError) {
      console.error('[Auth] Failed to clear demo data on logout:', demoError);
      // Non-blocking - logout still successful
    }

    console.log('[Auth] User logged out');
  } catch (error) {
    console.error('[Auth] Failed to logout:', error);
    throw error;
  }
};

/**
 * Check if user is currently authenticated
 * @returns true if user has a valid session
 */
export const isAuthenticated = (): boolean => {
  return currentSession !== null && currentUser !== null;
};

/**
 * Get current user profile
 * Returns null if not authenticated
 * Maps Supabase user to UserProfile interface for compatibility
 */
export const getUserProfile = (): UserProfile | null => {
  if (!currentUser) {
    return null;
  }

  return {
    id: currentUser.id,
    email: currentUser.email || '',
    name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'User',
    picture: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture,
  };
};

/**
 * Get user ID for database queries
 * @returns User ID or null if not authenticated
 */
export const getUserId = (): string | null => {
  return currentUser?.id ?? null;
};

/**
 * Get current access token
 * Returns null if not authenticated or token expired
 */
export const getAccessToken = (): string | null => {
  return currentSession?.access_token ?? null;
};

/**
 * Get current session
 * Returns null if not authenticated
 */
export const getSession = (): Session | null => {
  return currentSession;
};

/**
 * Get current user object
 * Returns null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  return currentUser;
};
