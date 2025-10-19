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

  it('should throw error if VITE_SUPABASE_URL is missing', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

    // Clear module cache to force re-import
    vi.resetModules();

    await expect(async () => {
      await import('./supabaseClient');
    }).rejects.toThrow('Missing VITE_SUPABASE_URL');
  });

  it('should throw error if VITE_SUPABASE_ANON_KEY is missing', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');

    // Clear module cache to force re-import
    vi.resetModules();

    await expect(async () => {
      await import('./supabaseClient');
    }).rejects.toThrow('Missing VITE_SUPABASE_ANON_KEY');
  });
});
