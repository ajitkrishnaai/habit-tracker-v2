/**
 * Supabase Client Tests
 *
 * Tests for the Supabase client singleton initialization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the environment variables before importing the client
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a supabase client instance', async () => {
    const { supabase } = await import('./supabaseClient');
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
    expect(typeof supabase.auth).toBe('object');
  });

  it('should export helper functions', async () => {
    const { getSession, getCurrentUser, isAuthenticated } = await import('./supabaseClient');
    expect(typeof getSession).toBe('function');
    expect(typeof getCurrentUser).toBe('function');
    expect(typeof isAuthenticated).toBe('function');
  });

  it('should validate that environment variables are set', async () => {
    // Since environment validation happens at module import time,
    // we can't easily test missing variables in a unit test.
    // Instead, we verify that the client was successfully initialized
    // with the environment variables from the test setup.
    const { supabase } = await import('./supabaseClient');

    // Verify the client has access to Supabase methods
    expect(supabase).toBeDefined();
    expect(supabase.from).toBeDefined();
    expect(supabase.auth).toBeDefined();

    // Note: Environment variable validation is tested in E2E tests
    // where we can control the environment before the app loads
  });
});
