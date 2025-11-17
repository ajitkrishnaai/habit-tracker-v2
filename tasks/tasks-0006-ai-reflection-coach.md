# Task List: AI Reflection Coach (Amara Day)

**Feature:** Immediate AI-Generated Reflections via Supabase Edge Functions
**Primary Goal:** Replace 7-day threshold with instant personalized reflections using Claude API
**Estimated Effort:** 8-11 days (1.5-2 weeks for one developer)
**Status:** Not Started

---

## Context & Motivation

### What We're Building

We are implementing **Amara Day**, an AI-powered reflection coach that provides immediate, personalized feedback to users after they log their daily habits. Instead of waiting 7 days to accumulate data for pattern analysis (the current implementation in `notesAnalyzer.ts`), we want to give users meaningful, warm reflections **on every save**, even from day one.

### The User Experience Problem

**Current State:**
- User logs habits and writes a reflection note (e.g., "Feeling great after meditation and walk!")
- System saves the data but provides no immediate feedback
- User must wait 7+ days before seeing any pattern analysis in the Progress page
- Early users feel like they're logging into a void - no acknowledgment, no encouragement

**Desired State (What We're Building):**
- User logs habits and writes their "I feel..." note
- User clicks "Save" → Brief "Saving..." animation (600ms)
- **NEW:** System shows "Amara is reflecting on your day..." with gentle loading animation (1-3 seconds)
- **NEW:** Amara (AI) responds with 2-4 warm, personalized paragraphs that:
  - Acknowledge how the user feels (mirrors their note in natural language)
  - Name 1-2 specific habits they completed today
  - Highlight any streaks or patterns (even if just "You're building momentum!")
  - Offer one gentle encouragement for tomorrow
- User reads reflection, feels seen and supported
- User clicks "Continue to Progress" → Navigates to progress page

**Example Reflection:**
> *"It sounds like today brought you some real clarity. Completing both meditation and your long walk—especially on the heels of a stressful week—shows you're prioritizing what helps you reset. I'm noticing you've kept up meditation for 4 days straight now, and that consistency might be part of why your head feels clearer. Tomorrow, even if you're short on time, consider keeping that meditation streak alive. Even a few minutes can carry that sense of calm forward."*

### Why This Matters

1. **Immediate Gratification:** Habit formation thrives on instant positive reinforcement. Waiting 7 days breaks the feedback loop.
2. **Personalization:** LLMs can interpret nuanced emotional notes (e.g., "stressed but pushed through") better than rule-based sentiment analysis.
3. **Encouragement for Beginners:** First-time users get warm feedback even with zero history ("I'm just getting to know your patterns, but I can already see you're committed!").
4. **Retention:** Users who feel "seen" by the app are more likely to return tomorrow.
5. **Brand Differentiation:** Most habit trackers just show checkmarks. Amara Day has a **personality** that cheers you on.

### Why Supabase Edge Functions (Not Client-Side API Calls)

**We chose Option B (Supabase Edge Functions) over Option A (direct browser API calls) because:**

1. **Security:** Anthropic API key stays server-side, never exposed in browser bundle
2. **Rate Limiting:** Can add user-level rate limits in Edge Function (prevent abuse)
3. **Cost Control:** Server can implement caching, batching, and fallback logic
4. **Future-Proof:** Easy to swap LLM providers (OpenAI, local Ollama, etc.) without frontend changes
5. **Monitoring:** Supabase logs show API usage, errors, and performance metrics

### Technical Architecture Overview

```
User saves habits
    ↓
DailyLogPage.tsx
    ↓
buildReflectionPayload() — Aggregates habit data (streaks, notes, stats)
    ↓
aiReflectionService.generateReflection() — Calls Supabase Edge Function
    ↓
Supabase Edge Function (supabase/functions/generate-reflection/index.ts)
    ↓
Anthropic Messages API (Claude 3.5 Sonnet)
    ↓
Returns 2-4 paragraph reflection
    ↓
ReflectionModal displays Amara's response
    ↓
User clicks "Continue to Progress"
```

### How Notes Are Associated with Habits

**Important Context for Implementation:**

In the current system, when a user saves habits in a session:
- User toggles multiple habits (e.g., Meditation ✓, Walk ✓, Run ✗)
- User writes **one reflection note** for the entire session
- Backend saves the **same note text** to all habits changed in that session

**Example:**
- **Session 1:** User marks "Meditation" and "Walk" as done, writes "Feeling energized today!"
  - Both `Meditation` and `Walk` log entries get `notes: "Feeling energized today!"`
- **Session 2:** User marks "Run" as done, writes "Legs sore but pushed through"
  - Only `Run` log entry gets `notes: "Legs sore but pushed through"`
- **Session 3:** User **unchecks** "Meditation" (changes to not_done), writes "Too tired after poor sleep"
  - `Meditation` log entry **updates** to `status: 'not_done'` with `notes: "Too tired after poor sleep"`

This is **already working correctly** in `DailyLogPage.tsx` (lines 215-234). The AI reflection should honor this: the user's note applies to **all habits changed in that session**, and Amara's reflection should acknowledge that holistic context (e.g., "It sounds like meditation and your walk both contributed to feeling energized today").

### Data We Have Available for Reflections

The `reflectionDataBuilder.ts` utility will aggregate:

1. **Today's Habits:**
   - Which habits were marked "done" or "not_done" in this session
   - Habit names and optional categories

2. **Streaks & Consistency:**
   - Current streak for each habit (via `streakCalculator.ts`)
   - Completion counts for last 7 days and last 30 days (via log filtering)

3. **User's Emotional Note:**
   - The free-text "I feel..." note the user just wrote

4. **Pattern Observations:**
   - Sentiment analysis of past notes per habit (via `notesAnalyzer.ts`)
   - Example: "User often mentions feeling calmer on days with meditation"

5. **Context Metadata:**
   - Date (ISO 8601)
   - Time of day (morning/afternoon/evening) - helps Amara be contextually aware

### AI Model Choice: Claude 3.5 Sonnet

**Why Claude instead of GPT-4?**
- **Tone:** Claude is known for warm, empathetic, non-judgmental responses (perfect for Amara)
- **Instruction Following:** Excellent at adhering to system prompts (no emojis, 2-4 paragraphs, etc.)
- **Cost:** $3/$15 per million tokens (comparable to GPT-4o, cheaper than GPT-4 Turbo)
- **Speed:** 1-3 second responses typical for 500-token outputs
- **Context Window:** 200K tokens (way more than we need, but useful for future enhancements)

### Cost & Scalability Considerations

**Per-reflection cost:** ~$0.004 USD
- Input: ~800 tokens (system prompt + JSON payload)
- Output: ~300 tokens (reflection text)

**Monthly costs:**
- 1 user (5 reflections/day): ~$0.60/month
- 100 users: ~$60/month
- 1000 users: ~$600/month

**Cost reduction strategies implemented:**
1. **Caching:** 1-hour in-memory cache prevents duplicate API calls for same session
2. **Payload optimization:** Truncate user notes to 1000 chars max (saves input tokens)
3. **Fallback:** If API fails, return static encouragement (no cost, no blocking)

**Future optimizations:**
- Use GPT-4o-mini for simpler reflections (~10x cheaper)
- Batch multiple users' reflections in one API call (if traffic grows)
- Self-hosted LLM (Ollama) for privacy-focused users (zero API cost)

### Development Philosophy

This feature is being built with:
- **Graceful Degradation:** If AI fails, user still gets encouragement (never a blocker)
- **Privacy First:** User notes sent to Anthropic API (documented in Privacy Policy)
- **Performance First:** 3-second max latency, <5KB payloads
- **Test Coverage:** Unit tests + E2E tests for all paths (success, error, caching, first-time user)
- **Accessibility:** ARIA live regions, screen reader announcements, keyboard navigation

---

## Relevant Files

### New Files - Supabase Edge Function

- `supabase/functions/generate-reflection/index.ts` - **NEW** - Edge function that calls Anthropic API (~200 lines)
- `supabase/functions/generate-reflection/deno.json` - **NEW** - Deno configuration for Edge function
- `supabase/.env.local` - **UPDATE** - Add ANTHROPIC_API_KEY for local testing
- `.github/workflows/deploy-edge-functions.yml` - **NEW** - CI/CD for Edge function deployment (optional)

### New Files - Frontend Services & Utilities

- `src/services/aiReflectionService.ts` - **NEW** - Service to call Supabase Edge Function (~150 lines)
- `src/services/aiReflectionService.test.ts` - **NEW** - Unit tests for AI service (~100 lines)
- `src/utils/reflectionDataBuilder.ts` - **NEW** - Builds JSON payload from habit data (~250 lines)
- `src/utils/reflectionDataBuilder.test.ts` - **NEW** - Unit tests for data builder (~150 lines)
- `src/types/reflection.ts` - **NEW** - TypeScript interfaces for reflection payloads and responses (~80 lines)

### Modified Files - UI Components

- `src/components/ReflectionModal.tsx` - **UPDATE** - Show Amara's AI-generated reflection after save
- `src/components/ReflectionModal.css` - **UPDATE** - Styling for reflection display section
- `src/pages/DailyLogPage.tsx` - **UPDATE** - Call AI service after saving habits
- `src/pages/DailyLogPage.css` - **UPDATE** - Styling for loading states

### Modified Files - Configuration

- `src/lib/supabaseClient.ts` - **UPDATE** - Add helper for Edge Function invocation (may not need changes)
- `.env.local.example` - **UPDATE** - Document ANTHROPIC_API_KEY for local Edge function testing

### Testing

- `src/services/aiReflectionService.test.ts` - Unit tests for API calls with mocked responses
- `src/utils/reflectionDataBuilder.test.ts` - Unit tests for data aggregation logic
- `e2e/09-ai-reflection.spec.ts` - **NEW** - E2E tests for full reflection flow (~150 lines)

### Documentation

- `README.md` - **UPDATE** - Document AI reflection feature and Supabase Edge Function setup
- `CLAUDE.md` - **UPDATE** - Update implementation status
- `docs/AI_REFLECTION_SETUP.md` - **NEW** - Guide for deploying Edge Function and configuring API keys

### Notes

- **API Key Security:** Stored in Supabase project secrets (never exposed to client)
- **Model:** claude-3-5-sonnet-20241022 (fast, empathetic, 200K context window)
- **Cost:** ~$0.004 per reflection (~$0.60/month for 1 user, 5 reflections/day)
- **Latency:** 1-3 seconds per reflection (streaming optional for future)
- **Caching:** Client-side cache for 1 hour to avoid duplicate API calls for same session
- **Fallback:** Generic encouragement message if API fails or times out (5s max)
- **Rate Limiting:** Supabase Edge Functions auto-scale, but consider user-level rate limits in future

---

## Tasks

### Phase 1: Supabase Edge Function Setup (2-3 days)

- [ ] **1.0 Set Up Supabase Edge Function Infrastructure**
  - [x] 1.1 Initialize Supabase Edge Function locally
    - Run `supabase functions new generate-reflection` in project root
    - Verify folder structure: `supabase/functions/generate-reflection/index.ts` created
    - Create `supabase/functions/generate-reflection/deno.json` with Deno configuration
    - Add import map for npm packages: `{ "imports": { "@anthropic-ai/sdk": "npm:@anthropic-ai/sdk@^0.30.0" } }`
    - **Acceptance:** Edge function scaffold exists, Deno config valid

  - [ ] 1.2 Configure local environment for Edge Function development
    - Install Supabase CLI if not present: `brew install supabase/tap/supabase` (macOS)
    - Start local Supabase: `supabase start` (this may take a few minutes on first run)
    - Verify local services running: `supabase status` (should show Functions URL)
    - Create `.env` file in `supabase/functions/` with `ANTHROPIC_API_KEY=sk-ant-xxxxx`
    - Test env loading: `supabase functions serve --env-file supabase/functions/.env`
    - **Acceptance:** Local Supabase running, Edge Functions accessible at http://localhost:54321/functions/v1/

  - [x] 1.3 Implement basic Edge Function structure
    - Create `supabase/functions/generate-reflection/index.ts` with Deno serve handler
    - Import Anthropic SDK: `import Anthropic from 'npm:@anthropic-ai/sdk@^0.30.0'`
    - Add CORS headers for frontend requests: `Access-Control-Allow-Origin: *` (restrict to domain in production)
    - Handle OPTIONS preflight: Return 200 with CORS headers for OPTIONS requests
    - Add basic request validation: Check for JSON body, return 400 if invalid
    - Add error handling: Try-catch with 500 status on unexpected errors
    - Return test response: `{ reflection: "Test reflection" }`
    - **Acceptance:** `curl -X POST http://localhost:54321/functions/v1/generate-reflection -d '{}'` returns 200 with test JSON

  - [x] 1.4 Implement Anthropic API integration in Edge Function
    - Initialize Anthropic client: `const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })`
    - Define Amara Day system prompt as constant (see Amara Prompt section below)
    - Parse request body to extract `payload` JSON object
    - Validate payload structure: Check for required fields (`date`, `note_text`, `habits`)
    - Call Anthropic Messages API:
      ```typescript
      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        temperature: 0.7,
        system: AMARA_SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: JSON.stringify(payload, null, 2)
        }]
      });
      ```
    - Extract text from response: `const reflectionText = message.content[0].text`
    - Return JSON: `{ reflection: reflectionText, usage: message.usage }` (usage optional, for debugging)
    - **Acceptance:** Function calls Anthropic API successfully, returns 2-4 paragraph reflection

  - [x] 1.5 Add error handling and fallback logic
    - Add timeout: Use `Promise.race()` with 5-second timeout
    - Catch Anthropic API errors: Network errors, rate limits (429), invalid API key (401)
    - Return fallback on error:
      ```json
      {
        "reflection": "Great work tracking your habits today. Keep building momentum! I'm still learning your patterns, so check back soon for more personalized insights.",
        "error": true,
        "error_type": "api_timeout" // or "rate_limit", "invalid_key", "network_error"
      }
      ```
    - Log errors to console: `console.error('[generate-reflection]', errorMessage)`
    - Return 200 status with fallback (don't fail request to user)
    - **Acceptance:** API failures return fallback within 5 seconds, errors logged

  - [x] 1.6 Test Edge Function locally with sample payloads
    - Create test JSON file: `test-payload.json` with sample habit data (see JSON structure below)
    - Test with curl:
      ```bash
      curl -X POST http://localhost:54321/functions/v1/generate-reflection \
        -H "Content-Type: application/json" \
        -d @test-payload.json
      ```
    - Verify reflection text matches Amara's tone (warm, encouraging, 2-4 paragraphs)
    - Test error cases:
      - Missing `ANTHROPIC_API_KEY` → Should return fallback with error flag
      - Invalid JSON body → Should return 400 error
      - Empty `habits` array → Should still return reflection ("Just getting started!")
    - **Acceptance:** All test cases pass, reflections match expected tone

  - [ ] 1.7 Deploy Edge Function to Supabase project
    - Authenticate Supabase CLI: `supabase login`
    - Link to project: `supabase link --project-ref <your-project-ref>`
    - Set production secret: `supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx`
    - Verify secret: `supabase secrets list` (should show `ANTHROPIC_API_KEY`)
    - Deploy function: `supabase functions deploy generate-reflection`
    - Test production endpoint:
      ```bash
      curl -X POST https://<project-ref>.supabase.co/functions/v1/generate-reflection \
        -H "Authorization: Bearer <anon-key>" \
        -H "Content-Type: application/json" \
        -d @test-payload.json
      ```
    - **Acceptance:** Function deployed, production endpoint responds correctly

---

### Phase 2: Data Builder Utility (1-2 days)

- [x] **2.0 Create Reflection Data Builder**
  - [x] 2.1 Define TypeScript interfaces for reflection data
    - Create `src/types/reflection.ts` file
    - Define `ReflectionHabit` interface:
      ```typescript
      interface ReflectionHabit {
        name: string;
        status: 'done' | 'not_done';
        streak_days: number;
        completed_last_7_days?: number;
        completed_last_30_days?: number;
        category?: string;
      }
      ```
    - Define `RecentSummary` interface:
      ```typescript
      interface RecentSummary {
        days_tracked_last_7: number;
        days_tracked_last_30: number;
        notable_observations: string[];
      }
      ```
    - Define `ReflectionPayload` interface:
      ```typescript
      interface ReflectionPayload {
        date: string; // ISO 8601 date (YYYY-MM-DD)
        time_of_day: 'morning' | 'afternoon' | 'evening';
        note_text: string;
        habits: ReflectionHabit[];
        recent_summary: RecentSummary;
      }
      ```
    - Define `ReflectionResponse` interface:
      ```typescript
      interface ReflectionResponse {
        reflection: string;
        error?: boolean;
        error_type?: string;
      }
      ```
    - Export all interfaces
    - **Acceptance:** TypeScript interfaces defined, match Edge Function expectations

  - [x] 2.2 Create reflection data builder utility
    - Create `src/utils/reflectionDataBuilder.ts` file
    - Import dependencies:
      - `storageService` from `../services/storage`
      - `calculateStreaks` from `./streakCalculator`
      - `calculateCompletionPercentage` from `./percentageCalculator`
      - `analyzeNotes` from `./notesAnalyzer`
      - `formatDateISO`, `getTodayAtMidnight` from `./dateHelpers`
      - Types from `../types/reflection` and `../types/logEntry`
    - Create function skeleton:
      ```typescript
      export async function buildReflectionPayload(
        pendingChanges: Map<string, PendingChange>,
        noteText: string
      ): Promise<ReflectionPayload>
      ```
    - **Acceptance:** File created with imports and function signature

  - [x] 2.3 Implement time of day detection
    - Create helper function: `getTimeOfDay(): 'morning' | 'afternoon' | 'evening'`
    - Get current hour: `const hour = new Date().getHours()`
    - Logic:
      - 5:00 - 11:59 → `'morning'`
      - 12:00 - 17:59 → `'afternoon'`
      - 18:00 - 4:59 → `'evening'`
    - Return time of day string
    - **Acceptance:** Function correctly identifies time of day based on system time

  - [x] 2.4 Implement per-habit data aggregation
    - For each habit in `pendingChanges`:
      - Get `habit_id` and `newStatus` from pending change
      - Fetch all logs from IndexedDB: `await storageService.getLogs()`
      - Filter logs for this habit: `logs.filter(log => log.habit_id === habitId)`
      - Calculate streaks: `const streaks = calculateStreaks(habitLogs)`
      - Calculate 7-day completion:
        - Filter logs from last 7 days
        - Count 'done' status: `habitLogsLast7.filter(log => log.status === 'done').length`
      - Calculate 30-day completion: Same logic for last 30 days
      - Build `ReflectionHabit` object:
        ```typescript
        {
          name: habitName,
          status: newStatus,
          streak_days: streaks.current,
          completed_last_7_days: completedLast7,
          completed_last_30_days: completedLast30,
          category: habitCategory || undefined
        }
        ```
    - Collect all habits into array
    - **Acceptance:** Each habit has accurate streak and completion counts

  - [x] 2.5 Implement recent summary generation
    - Calculate `days_tracked_last_7`:
      - Get unique dates from all logs in last 7 days
      - Count: `new Set(logsLast7.map(log => log.date)).size`
    - Calculate `days_tracked_last_30`: Same logic for last 30 days
    - Generate `notable_observations`:
      - For each habit with 3+ notes in last 30 days:
        - Run `analyzeNotes(habitLogs)` to get sentiment
        - If positive sentiment (averageScore > 1):
          - Add: `"User often mentions feeling <positive words> on days with <habit name>."`
        - If negative sentiment (averageScore < -1):
          - Add: `"User mentions challenges with <habit name>."`
      - Limit to top 3 observations
      - If no observations, return empty array
    - Build `RecentSummary` object
    - **Acceptance:** Summary includes accurate tracking days and meaningful observations

  - [x] 2.6 Assemble final payload
    - Get today's date: `formatDateISO(getTodayAtMidnight())`
    - Get time of day: `getTimeOfDay()`
    - Trim note text: `noteText.trim()`
    - Truncate note if >1000 chars (to save API tokens): `noteText.slice(0, 1000)`
    - Combine all data into `ReflectionPayload` object
    - Return payload
    - **Acceptance:** Payload matches TypeScript interface, ready for Edge Function

  - [x] 2.7 Add error handling and edge cases
    - Handle empty `pendingChanges`: Return payload with empty `habits` array
    - Handle missing notes: Set `note_text` to empty string
    - Handle IndexedDB read failures: Log error, return partial data
    - Add JSDoc comments for function parameters and return type
    - **Acceptance:** Builder handles edge cases gracefully, never throws errors

  - [x] 2.8 Write unit tests for data builder
    - Create `src/utils/reflectionDataBuilder.test.ts`
    - Mock `storageService.getLogs()` with fake log data
    - Test case: Single habit with 5-day streak
      - Verify `streak_days: 5`
      - Verify `completed_last_7_days` correct
    - Test case: Multiple habits with mixed completion
      - Verify each habit has independent stats
    - Test case: First-time user (no logs)
      - Verify payload still builds with zero stats
    - Test case: Time of day detection
      - Mock `Date()` to test morning/afternoon/evening
    - Test case: Notable observations
      - Mock logs with positive sentiment notes
      - Verify observation text generated
    - **Acceptance:** All test cases pass, 100% coverage for data builder

---

### Phase 3: Frontend Service Integration (1 day)

- [ ] **3.0 Create AI Reflection Service**
  - [ ] 3.1 Implement Supabase Edge Function caller
    - Create `src/services/aiReflectionService.ts` file
    - Import `supabase` from `../lib/supabaseClient`
    - Import types from `../types/reflection`
    - Create function:
      ```typescript
      export async function generateReflection(
        payload: ReflectionPayload
      ): Promise<string>
      ```
    - Call Supabase Edge Function:
      ```typescript
      const { data, error } = await supabase.functions.invoke('generate-reflection', {
        body: payload
      });
      ```
    - Handle errors: If `error` exists, throw custom error
    - Extract reflection text: `return data.reflection`
    - **Acceptance:** Function calls Edge Function successfully, returns reflection string

  - [ ] 3.2 Add caching to prevent duplicate API calls
    - Create in-memory cache: `const reflectionCache = new Map<string, { text: string, timestamp: number }>()`
    - Generate cache key from payload: `const cacheKey = JSON.stringify(payload)`
    - Before API call, check cache:
      - If cached and timestamp < 1 hour old, return cached reflection
    - After API call, store in cache with current timestamp
    - **Acceptance:** Duplicate calls within 1 hour return cached result

  - [ ] 3.3 Implement fallback message on error
    - Wrap API call in try-catch
    - On error, log to console: `console.error('[AI Reflection]', error)`
    - Return fallback message:
      ```typescript
      "Great work tracking your habits today. Keep building momentum! I'm still learning your patterns, so check back soon for more personalized insights."
      ```
    - **Acceptance:** API failures return fallback message within 3 seconds

  - [ ] 3.4 Add timeout handling
    - Use `Promise.race()` with 5-second timeout
    - If timeout, return fallback message
    - Log timeout event for monitoring
    - **Acceptance:** Slow API calls timeout gracefully

  - [ ] 3.5 Write unit tests for AI service
    - Create `src/services/aiReflectionService.test.ts`
    - Mock `supabase.functions.invoke()` using Vitest mocks
    - Test case: Successful API call
      - Mock response: `{ data: { reflection: "Test reflection" }, error: null }`
      - Verify function returns reflection text
    - Test case: API error
      - Mock response: `{ data: null, error: new Error('API error') }`
      - Verify function returns fallback message
    - Test case: Caching
      - Call function twice with same payload
      - Verify second call doesn't invoke Edge Function
    - Test case: Timeout
      - Mock slow response (>5 seconds)
      - Verify timeout returns fallback
    - **Acceptance:** All test cases pass, error paths covered

---

### Phase 4: UI Integration (2-3 days)

- [ ] **4.0 Integrate AI Reflection into User Flow**
  - [ ] 4.1 Update DailyLogPage to call AI service
    - Open `src/pages/DailyLogPage.tsx`
    - Import `buildReflectionPayload` from `../utils/reflectionDataBuilder`
    - Import `generateReflection` from `../services/aiReflectionService`
    - In `handleSaveWithReflection` function (after saving logs to database):
      - Build payload: `const payload = await buildReflectionPayload(pendingChanges, reflectionNotes || '')`
      - Call AI service: `const aiReflection = await generateReflection(payload)`
      - Store reflection in component state: `const [aiReflectionText, setAiReflectionText] = useState<string | null>(null)`
      - Set state: `setAiReflectionText(aiReflection)`
    - Pass reflection to `ReflectionModal` as prop: `<ReflectionModal aiReflection={aiReflectionText} ... />`
    - **Acceptance:** AI service called after saving, reflection text stored in state

  - [ ] 4.2 Add loading state for AI generation
    - Add loading state: `const [isGeneratingReflection, setIsGeneratingReflection] = useState(false)`
    - Set loading before API call: `setIsGeneratingReflection(true)`
    - Clear loading after API call: `setIsGeneratingReflection(false)`
    - Update modal to show loading indicator when `isGeneratingReflection === true`
    - Loading text: "Amara is reflecting on your day..."
    - Show spinning animation (reuse existing spinner CSS)
    - **Acceptance:** Loading state displays during API call (1-3 seconds)

  - [ ] 4.3 Update ReflectionModal to display AI reflection
    - Open `src/components/ReflectionModal.tsx`
    - Add new prop: `aiReflection?: string | null`
    - After user's note section, add new section:
      ```tsx
      {aiReflection && (
        <div className="reflection-modal__ai-section">
          <h3 className="reflection-modal__ai-title">Amara's Reflection</h3>
          <p className="reflection-modal__ai-text">{aiReflection}</p>
        </div>
      )}
      ```
    - Show loading state if `isGeneratingReflection` prop is true:
      ```tsx
      {isGeneratingReflection && (
        <div className="reflection-modal__ai-loading">
          <span className="spinner" aria-hidden="true" />
          <p>Amara is reflecting on your day...</p>
        </div>
      )}
      ```
    - **Acceptance:** Modal shows AI reflection after loading completes

  - [ ] 4.4 Style AI reflection section
    - Open `src/components/ReflectionModal.css`
    - Add styles for `.reflection-modal__ai-section`:
      - Soft background: `background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);` (light purple)
      - Border radius: `12px`
      - Padding: `20px`
      - Margin top: `24px`
    - Add styles for `.reflection-modal__ai-title`:
      - Font size: `16px`
      - Font weight: `600`
      - Color: `#6d28d9` (purple)
      - Margin bottom: `12px`
    - Add styles for `.reflection-modal__ai-text`:
      - Font size: `15px`
      - Line height: `1.6`
      - Color: `#374151` (dark gray)
      - White-space: `pre-wrap` (preserve line breaks)
    - Add styles for `.reflection-modal__ai-loading`:
      - Text align: center
      - Padding: `32px`
      - Color: `#9333ea` (purple)
    - **Acceptance:** Reflection section has warm, inviting design matching Amara.day brand

  - [ ] 4.5 Update "Continue to Progress" button behavior
    - Change button text from "Save" to "Continue to Progress" after reflection loads
    - Update `handleSave` function to wait for AI reflection before navigating:
      - Don't navigate immediately after clicking "Save"
      - Wait for `aiReflection` state to be set
      - Then enable "Continue to Progress" button
    - Button should be disabled while `isGeneratingReflection === true`
    - **Acceptance:** User sees reflection before navigating to Progress page

  - [ ] 4.6 Handle edge cases in UI
    - If AI service returns fallback (error case), still display it (don't show error to user)
    - If user has no habits in `pendingChanges`, skip AI call (show modal without reflection section)
    - If user skips note (empty string), still generate reflection based on habits alone
    - Add accessibility: ARIA live region for reflection announcement:
      ```tsx
      <div aria-live="polite" aria-atomic="true">
        {aiReflection && <p className="sr-only">Amara's reflection is ready</p>}
      </div>
      ```
    - **Acceptance:** All edge cases handled gracefully, accessible to screen readers

  - [ ] 4.7 Test UI flow manually
    - Start dev server: `npm run dev`
    - Navigate to Daily Log page
    - Toggle 2 habits as "done"
    - Click "Save Changes"
    - Enter reflection note: "Feeling great after meditation and walk!"
    - Click "Save"
    - Verify:
      - Modal shows "Saving..." briefly
      - Then shows "Amara is reflecting on your day..." with spinner
      - After 1-3 seconds, shows Amara's reflection text
      - Reflection mentions specific habits and user's note
      - "Continue to Progress" button enabled
    - Click "Continue to Progress"
    - Verify navigation to `/progress`
    - **Acceptance:** Full flow works smoothly, reflection appears as expected

---

### Phase 5: Testing & Polish (2 days)

- [ ] **5.0 Comprehensive Testing & Edge Cases**
  - [ ] 5.1 Write E2E test for AI reflection flow
    - Create `e2e/09-ai-reflection.spec.ts`
    - Test setup:
      - Create authenticated user
      - Add 2 test habits to database
      - Mock Supabase Edge Function response using Playwright route interception
    - Test case: "should generate reflection after saving habits"
      - Navigate to `/daily-log`
      - Toggle habit 1 as "done"
      - Toggle habit 2 as "done"
      - Click "Save Changes"
      - Enter note: "Feeling productive today!"
      - Click "Save"
      - Wait for loading indicator: `await page.waitForSelector('.reflection-modal__ai-loading')`
      - Wait for reflection text: `await page.waitForSelector('.reflection-modal__ai-text')`
      - Verify reflection contains habit names or note keywords
      - Click "Continue to Progress"
      - Verify URL is `/progress`
    - **Acceptance:** E2E test passes, full flow automated

  - [ ] 5.2 Test first-time user experience
    - Test case: User with zero habits logged (first save)
      - Create new user account
      - Add 1 habit
      - Save first log with note: "Starting my journey!"
      - Verify reflection says "I'm just getting to know your patterns" or similar
      - Verify no streak/completion stats mentioned (since no history)
    - **Acceptance:** First-time user gets encouraging reflection without stats

  - [ ] 5.3 Test API failure scenarios
    - Test case: Edge Function returns error
      - Mock Edge Function to return `{ error: true, error_type: 'api_timeout' }`
      - Verify UI shows fallback message within 3 seconds
      - Verify no error UI shown to user (seamless fallback)
    - Test case: Network offline
      - Disable network in browser DevTools
      - Verify fallback message appears
      - Verify user can still navigate after fallback
    - **Acceptance:** Errors handled gracefully, user never sees technical error

  - [ ] 5.4 Test caching behavior
    - Test case: Save habits twice in same session
      - Toggle habit, save with note
      - Wait for reflection to appear
      - Navigate away (don't refresh page)
      - Navigate back to Daily Log
      - Toggle same habit again, save with same note
      - Verify reflection appears instantly (from cache)
      - Check network tab: No second API call made
    - **Acceptance:** Caching works, reduces API costs

  - [ ] 5.5 Test with various habit counts
    - Test case: 1 habit
      - Verify reflection mentions single habit by name
    - Test case: 5 habits
      - Verify reflection doesn't list all 5 (focuses on key ones)
    - Test case: 0 habits (edge case)
      - User saves with no pending changes
      - Verify no AI call made (skip reflection)
    - **Acceptance:** Reflection quality good across different habit counts

  - [ ] 5.6 Test time-of-day variations
    - Test case: Morning reflection (8 AM)
      - Mock system time to 8:00 AM
      - Verify payload includes `time_of_day: 'morning'`
      - Verify reflection might reference morning (if Amara chooses to)
    - Test case: Evening reflection (8 PM)
      - Mock system time to 8:00 PM
      - Verify payload includes `time_of_day: 'evening'`
    - **Acceptance:** Time of day correctly detected and passed to API

  - [ ] 5.7 Performance testing
    - Test case: Measure API latency
      - Use browser DevTools Network tab
      - Record time from "Save" click to reflection display
      - Target: <3 seconds for 95% of requests
    - Test case: Check payload size
      - Inspect Edge Function request body
      - Verify payload is <5 KB (to minimize costs)
    - **Acceptance:** Performance meets targets, costs reasonable

  - [ ] 5.8 Add documentation
    - Create `docs/AI_REFLECTION_SETUP.md` with:
      - How to get Anthropic API key
      - How to set Supabase secrets
      - How to test Edge Function locally
      - How to deploy Edge Function
      - Troubleshooting common issues
    - Update `README.md` with AI reflection feature description
    - Update `CLAUDE.md` implementation status
    - **Acceptance:** Documentation complete, other developers can set up feature

  - [ ] 5.9 Review Amara's tone and quality
    - Manual review: Save 10 different reflection scenarios
    - Check for:
      - Warm, encouraging tone (no judgment)
      - Personal connection (uses habit names)
      - No emojis (per system prompt)
      - 2-4 paragraphs (not too long)
      - Gentle suggestions for tomorrow
    - If tone issues, adjust system prompt and redeploy Edge Function
    - **Acceptance:** Reflection tone matches "Amara Day" personality consistently

  - [ ] 5.10 Final integration test
    - Full user journey from welcome to progress:
      - Sign up new account
      - Add 3 habits
      - Save daily log with note (3 days in a row)
      - Verify reflections improve with more data (mentions streaks after day 2+)
      - Check Progress page analytics (unrelated to AI, but verify no conflicts)
    - Test on mobile viewport (375x667)
    - Test on desktop (1280x720)
    - **Acceptance:** Full app works seamlessly with AI feature integrated

---

## Amara Day System Prompt

**To be embedded in `supabase/functions/generate-reflection/index.ts`:**

```typescript
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
```

---

## Sample JSON Payload for Testing

**Save as `test-payload.json` for local testing:**

```json
{
  "date": "2025-11-16",
  "time_of_day": "evening",
  "note_text": "I feel great after my meditation and my long walk. It really helped me clear my head after a stressful week.",
  "habits": [
    {
      "name": "Meditation",
      "status": "done",
      "streak_days": 4,
      "completed_last_7_days": 6,
      "completed_last_30_days": 20,
      "category": "Mindfulness"
    },
    {
      "name": "Long walk",
      "status": "done",
      "streak_days": 2,
      "completed_last_7_days": 5,
      "completed_last_30_days": 18,
      "category": "Movement"
    }
  ],
  "recent_summary": {
    "days_tracked_last_7": 6,
    "days_tracked_last_30": 24,
    "notable_observations": [
      "User often mentions feeling calmer on days with meditation.",
      "User often mentions clearer thinking on days with movement."
    ]
  }
}
```

---

## Acceptance Criteria Summary

- ✅ **Edge Function deployed** and responds in <3 seconds
- ✅ **Reflection tone** matches Amara Day personality (warm, encouraging, no emojis)
- ✅ **Data accuracy** - Streaks, completion stats, and observations are correct
- ✅ **Error handling** - API failures return fallback message seamlessly
- ✅ **Caching** - Duplicate calls within 1 hour use cached result
- ✅ **UI/UX** - Loading state, smooth modal experience, accessible
- ✅ **Testing** - Unit tests + E2E tests pass, edge cases covered
- ✅ **Documentation** - Setup guide complete, README updated
- ✅ **Cost efficiency** - ~$0.004 per reflection, caching reduces unnecessary calls
- ✅ **Privacy** - API key never exposed to client, secure Supabase secrets

---

## Cost Estimation

**Assumptions:**
- 1 user, 5 reflections per day, 30 days = 150 reflections/month
- Claude Sonnet pricing: $3/million input tokens, $15/million output tokens
- ~800 input tokens per request (system prompt + JSON payload)
- ~300 output tokens per response (reflection text)

**Monthly cost for 1 user:**
- Input: (800 tokens × 150 requests) / 1M × $3 = $0.36
- Output: (300 tokens × 150 requests) / 1M × $15 = $0.68
- **Total: ~$1.04/month per user**

**For 100 users:** ~$104/month
**For 1000 users:** ~$1040/month

**Cost reduction strategies:**
- ✅ Caching (implemented) - reduces duplicate calls
- Future: Batch reflections for multiple habits in one API call
- Future: Use GPT-4o-mini (~10x cheaper) for simpler reflections

---

## Notes

- **Security:** API key stored in Supabase secrets, never exposed to browser
- **Privacy:** User notes and habit names sent to Anthropic API (document in Privacy Policy)
- **Fallback strategy:** Always return encouraging message if API fails (never block user)
- **Future enhancements:**
  - Streaming responses for faster perceived performance
  - Multi-language support (pass user language in payload)
  - More detailed observations (track mood patterns, time-of-day correlations)
  - Voice output (TTS for reflection text)
