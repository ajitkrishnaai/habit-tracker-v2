/**
 * AI Reflection Service
 *
 * Calls Supabase Edge Function to generate personalized habit reflections
 * using Claude AI (Amara Day personality).
 */

import { supabase } from '../lib/supabaseClient';
import type { ReflectionPayload } from '../types/reflection';

/**
 * Cache entry structure
 */
interface CacheEntry {
  text: string;
  timestamp: number;
}

/**
 * In-memory cache for reflection responses
 * Prevents duplicate API calls for the same payload within 1 hour
 */
const reflectionCache = new Map<string, CacheEntry>();

/**
 * Cache duration in milliseconds (1 hour)
 */
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fallback message returned when AI reflection fails
 */
const FALLBACK_REFLECTION = "Great work tracking your habits today. Keep building momentum! I'm still learning your patterns, so check back soon for more personalized insights.";

/**
 * Timeout duration for API calls (5 seconds)
 */
const API_TIMEOUT_MS = 5000;

/**
 * Clear the reflection cache (useful for testing)
 * @internal
 */
export function clearCache(): void {
  reflectionCache.clear();
}

/**
 * Generates an AI-powered reflection based on user's habit data
 * Results are cached for 1 hour to prevent duplicate API calls
 * Returns fallback message on error instead of throwing
 * Includes 5-second timeout for API calls
 *
 * @param payload - Habit data including today's habits, streaks, notes, and context
 * @returns Personalized reflection text (2-4 paragraphs) or fallback message
 */
export async function generateReflection(
  payload: ReflectionPayload
): Promise<string> {
  try {
    // Generate cache key from payload
    const cacheKey = JSON.stringify(payload);

    // Check if we have a cached result
    const cached = reflectionCache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_DURATION_MS) {
        // Cache hit - return cached reflection
        console.log('[AI Reflection] Cache hit, returning cached reflection');
        return cached.text;
      } else {
        // Cache expired - remove old entry
        reflectionCache.delete(cacheKey);
      }
    }

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('API request timeout')), API_TIMEOUT_MS);
    });

    // Create API call promise
    const apiPromise = supabase.functions.invoke('generate-reflection', {
      body: payload
    });

    // Race between API call and timeout
    const { data, error } = await Promise.race([apiPromise, timeoutPromise]);

    if (error) {
      console.error('[AI Reflection] Edge Function error:', error);
      return FALLBACK_REFLECTION;
    }

    // Validate response structure
    if (!data || typeof data.reflection !== 'string') {
      console.error('[AI Reflection] Invalid response structure:', data);
      return FALLBACK_REFLECTION;
    }

    const reflectionText = data.reflection;

    // Store in cache
    reflectionCache.set(cacheKey, {
      text: reflectionText,
      timestamp: Date.now()
    });

    return reflectionText;
  } catch (error) {
    // Catch any unexpected errors (network issues, parsing errors, timeouts, etc.)
    if (error instanceof Error && error.message === 'API request timeout') {
      console.error('[AI Reflection] Request timed out after', API_TIMEOUT_MS, 'ms');
    } else {
      console.error('[AI Reflection] Unexpected error:', error);
    }
    return FALLBACK_REFLECTION;
  }
}
