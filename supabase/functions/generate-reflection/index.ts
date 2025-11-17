// Supabase Edge Function for AI-powered habit reflections
// Uses Anthropic Claude API to generate personalized, encouraging reflections

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Anthropic from "@anthropic-ai/sdk";

// ============================================================================
// CONFIGURATION
// ============================================================================

const AMARA_SYSTEM_PROMPT = `You are Amara Day, a warm and encouraging habit reflection coach.

A user has just saved their habits for today in a habit tracking app and written a short note about how they feel.

You will receive a single JSON payload with:
- today's date
- an array of habits for today with completion status and simple stats
- the user's free text "I feel..." note
- optional lightweight history summaries

Your job is to write a short reflection that:
- Feels personal, kind, and grounded in the actual data provided
- Mirrors back how they say they feel, in your own natural words
- Explicitly names one or two key habits they completed or struggled with today
- Gently highlights any clear patterns or streaks that show up in the data
- Connects their feelings to their behaviors when it makes sense, without making strong causal claims
- Ends with one small encouragement or suggestion for tomorrow

Tone:
- Warm, non judgmental, and supportive
- Celebrate effort and consistency over perfection
- Never shame or scold
- Speak in simple, human language

Length and style:
- 2 to 4 short paragraphs
- No bullet lists
- No headings
- No emojis

Instructions:

1. Read the JSON and understand:
   - Which habits were done today
   - Any streaks or consistency that stand out
   - What the user said in their note about how they feel
   - Any recent observations if present

2. In your reflection:
   - Start by acknowledging how they feel in your own words.
   - Name one or two specific habits from today, especially those marked as "done" or those with meaningful streaks.
   - If the data suggests a pattern, describe it gently, using language like:
     - "I am noticing that on days when you ___, you often mention ___."
     - "It seems that this habit might be helping with ___."
   - If the data is sparse or this is an early entry, say so in a kind way and focus on the effort they are making today.

3. End with one small encouragement or suggestion for tomorrow, for example:
   - "Tomorrow, even a shorter version of this habit could help you stay connected to how you want to feel."
   - "If tomorrow feels busy, consider keeping just one small moment for this habit."

4. Do not invent data that is not in the JSON.
   - If a field is missing, simply ignore it.
   - If there is not enough history to see patterns, say that you are still getting to know their patterns.

Output:
- Return only the reflection text as 2 to 4 short paragraphs.
- Do not restate the JSON, and do not label sections.`;

const FALLBACK_REFLECTION =
  "Great work tracking your habits today. Keep building momentum! " +
  "I'm still learning your patterns, so check back soon for more personalized insights.";

const API_TIMEOUT_MS = 5000; // 5 seconds
const MAX_TOKENS = 500;
const TEMPERATURE = 0.7;
const MODEL = "claude-3-5-sonnet-20241022";

// ============================================================================
// TYPES
// ============================================================================

interface ReflectionHabit {
  name: string;
  status: 'done' | 'not_done';
  streak_days: number;
  completed_last_7_days?: number;
  completed_last_30_days?: number;
  category?: string;
}

interface RecentSummary {
  days_tracked_last_7: number;
  days_tracked_last_30: number;
  notable_observations: string[];
}

interface ReflectionPayload {
  date: string;
  time_of_day: 'morning' | 'afternoon' | 'evening';
  note_text: string;
  habits: ReflectionHabit[];
  recent_summary: RecentSummary;
}

interface ReflectionResponse {
  reflection: string;
  error?: boolean;
  error_type?: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * CORS headers for cross-origin requests
 */
function getCorsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

/**
 * Validate the reflection payload structure
 */
function validatePayload(payload: unknown): payload is ReflectionPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const p = payload as Partial<ReflectionPayload>;

  // Check required fields
  if (!p.date || typeof p.date !== 'string') return false;
  if (!p.time_of_day || !['morning', 'afternoon', 'evening'].includes(p.time_of_day)) return false;
  if (p.note_text === undefined || typeof p.note_text !== 'string') return false;
  if (!Array.isArray(p.habits)) return false;

  return true;
}

/**
 * Create fallback response for error cases
 */
function createFallbackResponse(errorType: string): ReflectionResponse {
  console.error(`[generate-reflection] Error: ${errorType}`);
  return {
    reflection: FALLBACK_REFLECTION,
    error: true,
    error_type: errorType,
  };
}

/**
 * Call Anthropic API with timeout
 */
async function generateReflectionWithAI(payload: ReflectionPayload): Promise<ReflectionResponse> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');

  if (!apiKey) {
    return createFallbackResponse('missing_api_key');
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('API timeout')), API_TIMEOUT_MS);
    });

    // Race between API call and timeout
    const message = await Promise.race([
      anthropic.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: TEMPERATURE,
        system: AMARA_SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: JSON.stringify(payload, null, 2)
        }]
      }),
      timeoutPromise
    ]);

    // Extract reflection text from response
    const reflectionText = message.content[0].type === 'text'
      ? message.content[0].text
      : FALLBACK_REFLECTION;

    return {
      reflection: reflectionText,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      }
    };

  } catch (error) {
    // Determine error type
    let errorType = 'unknown_error';

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorType = 'api_timeout';
      } else if (error.message.includes('401')) {
        errorType = 'invalid_api_key';
      } else if (error.message.includes('429')) {
        errorType = 'rate_limit';
      } else if (error.message.includes('network')) {
        errorType = 'network_error';
      }
    }

    return createFallbackResponse(errorType);
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: getCorsHeaders(),
      status: 200
    });
  }

  try {
    // Parse request body
    const body = await req.json();

    // Validate payload
    if (!validatePayload(body)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid payload structure. Expected ReflectionPayload.'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...getCorsHeaders()
          }
        }
      );
    }

    // Generate reflection
    const result = await generateReflectionWithAI(body);

    // Return response (always 200, even on AI errors - we use fallback)
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders()
        }
      }
    );

  } catch (error) {
    // Unexpected error (e.g., malformed JSON)
    console.error('[generate-reflection] Unexpected error:', error);

    return new Response(
      JSON.stringify(createFallbackResponse('unexpected_error')),
      {
        status: 200, // Still return 200 with fallback
        headers: {
          'Content-Type': 'application/json',
          ...getCorsHeaders()
        }
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (requires Docker Desktop)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-reflection' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data @test-payload.json

*/
