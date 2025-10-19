/**
 * Supabase Authentication Service Tests
 *
 * Comprehensive tests for Supabase Auth including:
 * - Initialization and session management
 * - Email/password login and signup
 * - Google OAuth login flow
 * - Logout and state cleanup
 * - Authentication state listeners
 * - User profile and session getters
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initAuth,
  loginWithEmail,
  signUpWithEmail,
  login,
  logout,
  isAuthenticated,
  getUserProfile,
  getUserId,
  getAccessToken,
  getSession,
  getCurrentUser,
  onAuthChange,
} from './auth';
import type { Session, User, AuthError } from '@supabase/supabase-js';

// Mock the Supabase client
vi.mock('../lib/supabaseClient', () => {
  const mockAuth = {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  };

  return {
    supabase: {
      auth: mockAuth,
    },
  };
});

import { supabase } from '../lib/supabaseClient';

describe('Supabase Authentication Service', () => {
  // Mock data
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {
      name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
    },
  };

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  const mockAuthError: AuthError = {
    name: 'AuthApiError',
    message: 'Invalid credentials',
    status: 401,
  };

  // Store the auth state change callback
  let authStateChangeCallback: ((event: string, session: Session | null) => void) | null = null;

  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset auth state change callback
    authStateChangeCallback = null;

    // Mock console methods to reduce test noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Default mock implementations
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    });

    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authStateChangeCallback = callback as any;
      return {
        data: { subscription: { id: 'mock-subscription', unsubscribe: vi.fn() } },
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initAuth', () => {
    it('should initialize successfully with no existing session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      await expect(initAuth()).resolves.toBeUndefined();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Supabase Auth initialized',
        'without session'
      );
    });

    it('should initialize successfully with existing session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      await expect(initAuth()).resolves.toBeUndefined();

      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Supabase Auth initialized',
        'with existing session'
      );
    });

    it('should throw error if session check fails', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: mockAuthError,
      });

      await expect(initAuth()).rejects.toThrow();
      expect(console.error).toHaveBeenCalledWith('[Auth] Error getting session:', mockAuthError);
    });

    it('should set up auth state change listener', async () => {
      await initAuth();

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
      expect(authStateChangeCallback).not.toBeNull();
    });

    it('should update state when auth state changes', async () => {
      await initAuth();

      // Simulate sign in event
      authStateChangeCallback?.('SIGNED_IN', mockSession);

      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Auth state changed:',
        'SIGNED_IN',
        'authenticated'
      );
    });

    it('should notify listeners when auth state changes', async () => {
      await initAuth();

      const listener = vi.fn();
      onAuthChange(listener);

      // Simulate sign in (from null to authenticated)
      authStateChangeCallback?.('SIGNED_IN', mockSession);

      expect(listener).toHaveBeenCalledWith(true);

      // Simulate sign out (from authenticated to null)
      authStateChangeCallback?.('SIGNED_OUT', null);

      expect(listener).toHaveBeenCalledWith(false);
    });

    it('should not notify listeners if auth state does not change', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      await initAuth();

      const listener = vi.fn();
      onAuthChange(listener);

      // Simulate token refresh (still authenticated)
      authStateChangeCallback?.('TOKEN_REFRESHED', mockSession);

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('onAuthChange', () => {
    it('should add listener and return unsubscribe function', async () => {
      await initAuth();

      const listener = vi.fn();
      const unsubscribe = onAuthChange(listener);

      expect(typeof unsubscribe).toBe('function');

      // Trigger auth change
      authStateChangeCallback?.('SIGNED_IN', mockSession);
      expect(listener).toHaveBeenCalledWith(true);

      // Unsubscribe
      unsubscribe();

      // Should not be called after unsubscribe
      listener.mockClear();
      authStateChangeCallback?.('SIGNED_OUT', null);
      expect(listener).not.toHaveBeenCalled();
    });

    it('should support multiple listeners', async () => {
      await initAuth();

      const listener1 = vi.fn();
      const listener2 = vi.fn();

      onAuthChange(listener1);
      onAuthChange(listener2);

      authStateChangeCallback?.('SIGNED_IN', mockSession);

      expect(listener1).toHaveBeenCalledWith(true);
      expect(listener2).toHaveBeenCalledWith(true);
    });
  });

  describe('loginWithEmail', () => {
    beforeEach(async () => {
      await initAuth();
    });

    it('should successfully login with email and password', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await expect(loginWithEmail('test@example.com', 'password123')).resolves.toBeUndefined();

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(console.log).toHaveBeenCalledWith('[Auth] Login successful:', 'test@example.com');
    });

    it('should throw error on invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockAuthError,
      });

      await expect(loginWithEmail('test@example.com', 'wrongpassword')).rejects.toThrow();

      expect(console.error).toHaveBeenCalledWith('[Auth] Login error:', mockAuthError);
    });

    it('should update authentication state after successful login', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      expect(isAuthenticated()).toBe(false);

      await loginWithEmail('test@example.com', 'password123');

      expect(isAuthenticated()).toBe(true);
      expect(getUserId()).toBe('user-123');
      expect(getAccessToken()).toBe('mock-access-token');
    });
  });

  describe('signUpWithEmail', () => {
    beforeEach(async () => {
      await initAuth();
    });

    it('should successfully sign up new user with email and password', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await expect(signUpWithEmail('newuser@example.com', 'password123')).resolves.toBeUndefined();

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'newuser',
          },
        },
      });

      expect(console.log).toHaveBeenCalledWith('[Auth] Sign up successful:', 'test@example.com');
    });

    it('should use provided name in signup', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await signUpWithEmail('newuser@example.com', 'password123', 'John Doe');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'John Doe',
          },
        },
      });
    });

    it('should default to email prefix as name if not provided', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await signUpWithEmail('jane.smith@example.com', 'password123');

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'jane.smith@example.com',
        password: 'password123',
        options: {
          data: {
            name: 'jane.smith',
          },
        },
      });
    });

    it('should throw error on signup failure', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockAuthError,
      });

      await expect(signUpWithEmail('existing@example.com', 'password123')).rejects.toThrow();

      expect(console.error).toHaveBeenCalledWith('[Auth] Sign up error:', mockAuthError);
    });

    it('should handle email confirmation required scenario', async () => {
      // When email confirmation is required, session is null but user is created
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      await signUpWithEmail('pending@example.com', 'password123');

      expect(isAuthenticated()).toBe(false); // No session yet
    });
  });

  describe('login (Google OAuth)', () => {
    beforeEach(async () => {
      await initAuth();
    });

    it('should initiate Google OAuth flow', async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { provider: 'google', url: 'https://accounts.google.com/oauth' },
        error: null,
      });

      await expect(login()).resolves.toBeUndefined();

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/daily-log`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      expect(console.log).toHaveBeenCalledWith(
        '[Auth] Redirecting to Google OAuth...',
        expect.any(Object)
      );
    });

    it('should throw error if OAuth initiation fails', async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
        data: { provider: 'google', url: null },
        error: mockAuthError,
      });

      await expect(login()).rejects.toThrow();

      expect(console.error).toHaveBeenCalledWith('[Auth] OAuth login error:', mockAuthError);
    });
  });

  describe('logout', () => {
    beforeEach(async () => {
      await initAuth();
      // Set up authenticated state
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });
      await loginWithEmail('test@example.com', 'password123');
    });

    it('should successfully logout user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      expect(isAuthenticated()).toBe(true);

      await logout();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(isAuthenticated()).toBe(false);
      expect(console.log).toHaveBeenCalledWith('[Auth] User logged out');
    });

    it('should clear all authentication state on logout', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null,
      });

      await logout();

      expect(getUserProfile()).toBeNull();
      expect(getUserId()).toBeNull();
      expect(getAccessToken()).toBeNull();
      expect(getSession()).toBeNull();
      expect(getCurrentUser()).toBeNull();
    });

    it('should throw error if logout fails', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockAuthError,
      });

      await expect(logout()).rejects.toThrow();

      expect(console.error).toHaveBeenCalledWith('[Auth] Logout error:', mockAuthError);
    });
  });

  describe('isAuthenticated', () => {
    beforeEach(async () => {
      await initAuth();
    });

    it('should return false when not authenticated', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when authenticated', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await loginWithEmail('test@example.com', 'password123');

      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('getUserProfile', () => {
    beforeEach(async () => {
      await initAuth();
    });

    it('should return null when not authenticated', () => {
      expect(getUserProfile()).toBeNull();
    });

    it('should return user profile when authenticated', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await loginWithEmail('test@example.com', 'password123');

      const profile = getUserProfile();

      expect(profile).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg',
      });
    });

    it('should handle missing name in user metadata', async () => {
      const userWithoutName = {
        ...mockUser,
        user_metadata: {},
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: userWithoutName, session: mockSession },
        error: null,
      });

      await loginWithEmail('test@example.com', 'password123');

      const profile = getUserProfile();

      expect(profile?.name).toBe('test'); // Falls back to email prefix
    });

    it('should handle missing email', async () => {
      const userWithoutEmail = {
        ...mockUser,
        email: undefined,
        user_metadata: {},
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: userWithoutEmail, session: mockSession },
        error: null,
      });

      await loginWithEmail('test@example.com', 'password123');

      const profile = getUserProfile();

      expect(profile?.email).toBe('');
      expect(profile?.name).toBe('User'); // Falls back to 'User'
    });
  });

  describe('getUserId', () => {
    beforeEach(async () => {
      await initAuth();
    });

    it('should return null when not authenticated', () => {
      expect(getUserId()).toBeNull();
    });

    it('should return user ID when authenticated', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await loginWithEmail('test@example.com', 'password123');

      expect(getUserId()).toBe('user-123');
    });
  });

  describe('getAccessToken', () => {
    beforeEach(async () => {
      await initAuth();
    });

    it('should return null when not authenticated', () => {
      expect(getAccessToken()).toBeNull();
    });

    it('should return access token when authenticated', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await loginWithEmail('test@example.com', 'password123');

      expect(getAccessToken()).toBe('mock-access-token');
    });
  });

  describe('getSession', () => {
    beforeEach(async () => {
      await initAuth();
    });

    it('should return null when not authenticated', () => {
      expect(getSession()).toBeNull();
    });

    it('should return session when authenticated', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await loginWithEmail('test@example.com', 'password123');

      const session = getSession();

      expect(session).toEqual(mockSession);
      expect(session?.access_token).toBe('mock-access-token');
      expect(session?.user.email).toBe('test@example.com');
    });
  });

  describe('getCurrentUser', () => {
    beforeEach(async () => {
      await initAuth();
    });

    it('should return null when not authenticated', () => {
      expect(getCurrentUser()).toBeNull();
    });

    it('should return user when authenticated', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await loginWithEmail('test@example.com', 'password123');

      const user = getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(user?.id).toBe('user-123');
      expect(user?.email).toBe('test@example.com');
    });
  });

  describe('Integration: Full auth flow', () => {
    it('should handle complete login -> logout flow', async () => {
      await initAuth();

      // Start unauthenticated
      expect(isAuthenticated()).toBe(false);

      // Login
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });
      await loginWithEmail('test@example.com', 'password123');

      expect(isAuthenticated()).toBe(true);
      expect(getUserProfile()?.email).toBe('test@example.com');

      // Logout
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });
      await logout();

      expect(isAuthenticated()).toBe(false);
      expect(getUserProfile()).toBeNull();
    });

    it('should handle signup -> auto-login flow', async () => {
      await initAuth();

      // Sign up with auto-login (email confirmation disabled)
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await signUpWithEmail('newuser@example.com', 'password123', 'New User');

      expect(isAuthenticated()).toBe(true);
      expect(getUserId()).toBe('user-123');
    });

    it('should notify listeners throughout auth lifecycle', async () => {
      await initAuth();

      const listener = vi.fn();
      onAuthChange(listener);

      // Simulate sign in event (state changes from unauthenticated to authenticated)
      authStateChangeCallback?.('SIGNED_IN', mockSession);
      expect(listener).toHaveBeenCalledWith(true);

      // Clear the listener mock
      listener.mockClear();

      // Simulate sign out event (state changes from authenticated to unauthenticated)
      authStateChangeCallback?.('SIGNED_OUT', null);
      expect(listener).toHaveBeenCalledWith(false);
    });
  });
});
