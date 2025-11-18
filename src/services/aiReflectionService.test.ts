/**
 * Unit tests for AI Reflection Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateReflection, clearCache } from './aiReflectionService';
import type { ReflectionPayload } from '../types/reflection';

// Mock the supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

import { supabase } from '../lib/supabaseClient';

describe('aiReflectionService', () => {
  // Sample payload for testing
  const samplePayload: ReflectionPayload = {
    date: '2025-11-17',
    time_of_day: 'evening',
    note_text: 'Feeling great after meditation and walk',
    habits: [
      {
        name: 'Meditation',
        status: 'done',
        streak_days: 5,
        completed_last_7_days: 6,
        completed_last_30_days: 20,
        category: 'Mindfulness'
      }
    ],
    recent_summary: {
      days_tracked_last_7: 7,
      days_tracked_last_30: 28,
      notable_observations: ['User often mentions feeling calmer on days with meditation.']
    }
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Clear cache to ensure test isolation
    clearCache();
  });

  afterEach(() => {
    // Clear timers after each test
    vi.clearAllTimers();
  });

  describe('generateReflection', () => {
    it('should successfully call Edge Function and return reflection text', async () => {
      // Mock successful API response
      const mockReflection = 'Great work on your meditation today! Keep building that streak.';
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { reflection: mockReflection },
        error: null
      });

      const result = await generateReflection(samplePayload);

      expect(result).toBe(mockReflection);
      expect(supabase.functions.invoke).toHaveBeenCalledWith('generate-reflection', {
        body: samplePayload
      });
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
    });

    it('should return fallback message when Edge Function returns error', async () => {
      // Mock error response
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: new Error('API error')
      });

      const result = await generateReflection(samplePayload);

      expect(result).toBe(
        "Great work tracking your habits today. Keep building momentum! I'm still learning your patterns, so check back soon for more personalized insights."
      );
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
    });

    it('should return fallback message on network error', async () => {
      // Mock network error (promise rejection)
      vi.mocked(supabase.functions.invoke).mockRejectedValue(new Error('Network error'));

      const result = await generateReflection(samplePayload);

      expect(result).toBe(
        "Great work tracking your habits today. Keep building momentum! I'm still learning your patterns, so check back soon for more personalized insights."
      );
    });

    it('should cache successful responses and return cached result on second call', async () => {
      const mockReflection = 'Great work on your meditation today!';
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { reflection: mockReflection },
        error: null
      });

      // First call - should hit API
      const result1 = await generateReflection(samplePayload);
      expect(result1).toBe(mockReflection);
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);

      // Second call with same payload - should return cached result
      const result2 = await generateReflection(samplePayload);
      expect(result2).toBe(mockReflection);
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('should not use cache for different payloads', async () => {
      const mockReflection1 = 'Reflection for first payload';
      const mockReflection2 = 'Reflection for second payload';

      vi.mocked(supabase.functions.invoke)
        .mockResolvedValueOnce({
          data: { reflection: mockReflection1 },
          error: null
        })
        .mockResolvedValueOnce({
          data: { reflection: mockReflection2 },
          error: null
        });

      // First call
      const result1 = await generateReflection(samplePayload);
      expect(result1).toBe(mockReflection1);

      // Second call with different payload
      const differentPayload = { ...samplePayload, note_text: 'Different note' };
      const result2 = await generateReflection(differentPayload);
      expect(result2).toBe(mockReflection2);

      // Both payloads should have triggered API calls
      expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
    });

    it('should timeout after 5 seconds and return fallback message', async () => {
      vi.useFakeTimers();

      // Mock a slow API call that never resolves
      vi.mocked(supabase.functions.invoke).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ data: { reflection: 'Too slow' }, error: null });
            }, 10000); // 10 seconds - longer than timeout
          })
      );

      const resultPromise = generateReflection(samplePayload);

      // Fast-forward time by 6 seconds (past the 5-second timeout)
      await vi.advanceTimersByTimeAsync(6000);

      const result = await resultPromise;

      expect(result).toBe(
        "Great work tracking your habits today. Keep building momentum! I'm still learning your patterns, so check back soon for more personalized insights."
      );

      vi.useRealTimers();
    });

    it('should handle malformed response data gracefully', async () => {
      // Mock response with unexpected structure
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { unexpected: 'structure' },
        error: null
      } as any);

      const result = await generateReflection(samplePayload);

      // Should return fallback since data.reflection doesn't exist
      expect(result).toBe(
        "Great work tracking your habits today. Keep building momentum! I'm still learning your patterns, so check back soon for more personalized insights."
      );
    });
  });
});
