# AI Reflection Setup Guide

This guide explains how to set up and deploy the AI-powered reflection feature (Amara Day) for the Habit Tracker app.

## Overview

The AI reflection feature uses:
- **Supabase Edge Functions** (serverless functions running on Deno)
- **Anthropic Claude API** (claude-3-5-sonnet-20241022)
- **Cost**: ~$0.004 per reflection (~$1/month for 1 user logging 5x/day)

---

## Prerequisites

1. **Supabase CLI** installed (macOS: `brew install supabase/tap/supabase`)
2. **Docker Desktop** installed (for local testing only - optional)
3. **Anthropic API Key** (get from https://console.anthropic.com/)

---

## Step 1: Get an Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-...`)
6. **Store it securely** - you won't see it again!

**Cost Management:**
- Anthropic charges per token (input + output)
- Claude 3.5 Sonnet: $3/1M input tokens, $15/1M output tokens
- Typical reflection: 800 input + 300 output tokens = ~$0.004
- Set up usage alerts in Anthropic Console to avoid surprises

---

## Step 2: Deploy Edge Function to Supabase

### 2.1 Authenticate Supabase CLI

```bash
# Login to Supabase (opens browser for authentication)
supabase login
```

### 2.2 Link to Your Supabase Project

```bash
# Link CLI to your project (replace with your project ref from .env.local)
supabase link --project-ref yzisfgxjyugfnqcaqlgw
```

**Where to find your project ref:**
- It's in your `.env.local` file: `VITE_SUPABASE_URL=https://[project-ref].supabase.co`
- Or in Supabase Dashboard → Settings → General → Reference ID

### 2.3 Set the Anthropic API Key as a Supabase Secret

```bash
# Set the secret (replace sk-ant-xxxxx with your actual key)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**Verify the secret was set:**
```bash
supabase secrets list
```

You should see:
```
ANTHROPIC_API_KEY
```

**Important:**
- Secrets are **environment variables** available to Edge Functions
- They are **never exposed** to the client/browser
- Each Supabase project has separate secrets (dev, staging, prod)

### 2.4 Deploy the Edge Function

```bash
# Deploy the function to production
supabase functions deploy generate-reflection
```

**Expected output:**
```
Bundling generate-reflection
Deploying generate-reflection (project ref: yzisfgxjyugfnqcaqlgw)
Deployed generate-reflection
  version : xxxxx
  url     : https://yzisfgxjyugfnqcaqlgw.supabase.co/functions/v1/generate-reflection
```

---

## Step 3: Test the Deployed Function

### 3.1 Test with curl

```bash
# Replace <anon-key> with your VITE_SUPABASE_ANON_KEY from .env.local
curl -i --location --request POST 'https://yzisfgxjyugfnqcaqlgw.supabase.co/functions/v1/generate-reflection' \
  --header 'Authorization: Bearer <anon-key>' \
  --header 'Content-Type: application/json' \
  --data @supabase/functions/generate-reflection/test-payload.json
```

**Expected response:**
```json
HTTP/2 200 OK
{
  "reflection": "It sounds like today brought you some real clarity. Completing both meditation and your long walk—especially on the heels of a stressful week—shows you're prioritizing what helps you reset...",
  "usage": {
    "input_tokens": 823,
    "output_tokens": 287
  }
}
```

### 3.2 Test Error Cases

**Test missing API key (should return fallback):**
```bash
# Temporarily unset the secret
supabase secrets unset ANTHROPIC_API_KEY

# Test the function
curl ... (same as above)

# You should get:
{
  "reflection": "Great work tracking your habits today. Keep building momentum! I'm still learning your patterns, so check back soon for more personalized insights.",
  "error": true,
  "error_type": "missing_api_key"
}

# Re-set the secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxx
```

---

## Step 4: Local Testing (Optional)

If you want to test the Edge Function locally before deploying:

### 4.1 Start Local Supabase

```bash
# Requires Docker Desktop running
supabase start
```

**Wait 2-5 minutes** for all services to start. You should see:
```
Started supabase local development setup.
         API URL: http://localhost:54321
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4.2 Create Local Environment File

```bash
# Create .env file for local testing
echo "ANTHROPIC_API_KEY=sk-ant-xxxxx" > supabase/functions/.env
```

**Important:** This file is **git-ignored** - never commit API keys!

### 4.3 Serve the Function Locally

```bash
# Serve with environment variables loaded
supabase functions serve --env-file supabase/functions/.env
```

**You should see:**
```
Serving generate-reflection at http://localhost:54321/functions/v1/generate-reflection
```

### 4.4 Test Locally

```bash
# Use local anon key from `supabase start` output
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-reflection' \
  --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
  --header 'Content-Type: application/json' \
  --data @supabase/functions/generate-reflection/test-payload.json
```

---

## Troubleshooting

### Error: "Cannot find module '@anthropic-ai/sdk'"

**Cause:** Deno hasn't installed the npm package yet.

**Fix:** The first request will download the package (takes 10-30 seconds). Retry the request.

### Error: "Missing API key" or "Invalid API key"

**Cause:** Secret not set or incorrect.

**Fix:**
```bash
# List secrets to verify
supabase secrets list

# Re-set the secret
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-actual-key

# Redeploy function (required after changing secrets)
supabase functions deploy generate-reflection
```

### Error: "API timeout"

**Cause:** Anthropic API is slow or unreachable.

**Fix:** The function will automatically return a fallback message. Check Anthropic API status at https://status.anthropic.com/

### TypeScript Errors in VS Code

**Cause:** VS Code treats Edge Function as Node.js code (it's actually Deno).

**Fix:** These are IDE-only errors - the function will work correctly when deployed. To suppress them, you can install the Deno VS Code extension.

---

## Cost Monitoring

### Track Usage in Anthropic Console

1. Go to https://console.anthropic.com/
2. Navigate to **Usage** section
3. View token consumption and costs

### Set Up Alerts

1. In Anthropic Console → **Settings** → **Billing**
2. Set **Monthly Spend Limit** (e.g., $50)
3. Enable **Email Alerts** at 50%, 75%, 90%

### Estimated Monthly Costs

| Users | Reflections/Day | Monthly Cost |
|-------|----------------|--------------|
| 1     | 5              | ~$1          |
| 10    | 5              | ~$10         |
| 100   | 5              | ~$100        |
| 1000  | 5              | ~$1000       |

**Cost reduction strategies:**
- Caching (already implemented) - reduces duplicate API calls
- Shorter system prompts (save input tokens)
- Shorter max_tokens (currently 500)
- Switch to cheaper model (e.g., claude-3-haiku-20240307) for simple cases

---

## Security Notes

- ✅ **API key stored in Supabase secrets** - never exposed to client
- ✅ **CORS configured** - allows frontend to call Edge Function
- ✅ **Rate limiting** - Supabase auto-scales, but consider user-level rate limits in future
- ✅ **Fallback on errors** - users never see technical errors

**Privacy considerations:**
- User notes and habit names are sent to Anthropic API
- Anthropic's Data Usage Policy (as of 2024): API data is **not used for training**
- Document this in your Privacy Policy (see Phase 5)

---

## Phase 5: Testing & Quality Assurance

### Manual Testing Checklist

This comprehensive checklist covers all testing scenarios from Task 5.0 (Phase 5) of the AI Reflection feature implementation.

#### Task 5.2: First-Time User Experience

**Scenario:** User with no habit history

1. Sign up a new account or use demo mode
2. Add 1 habit: "Morning Meditation"
3. Toggle habit as "done"
4. Click "Save Changes"
5. In modal, enter note: "Starting my journey today!"
6. Click "Save"

**Expected Behavior:**
- ✅ Reflection loads within 3-5 seconds
- ✅ Reflection acknowledges effort without mentioning stats
- ✅ Example: "I'm just getting to know your patterns, but I can already see you're committed!"
- ✅ Tone is warm and encouraging
- ✅ No emojis in reflection text
- ✅ 2-4 paragraphs
- ✅ Navigates to Progress page after reflection loads

#### Task 5.3: API Failure Scenarios

**Test 1: Network Offline**

1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Complete habit logging flow
4. Click "Save" in reflection modal

**Expected:**
- ✅ Fallback message appears within 5 seconds
- ✅ Message: "Great work tracking your habits today. Keep building momentum!"
- ✅ No error UI shown to user
- ✅ User can still navigate to Progress page

**Test 2: Invalid API Key**

1. Temporarily set wrong API key: `supabase secrets set ANTHROPIC_API_KEY=invalid`
2. Complete habit logging flow
3. Restore correct key after test

**Expected:**
- ✅ Edge Function returns fallback message
- ✅ Error logged to Supabase Functions logs
- ✅ User flow not blocked

**Test 3: API Timeout**

1. Mock slow API response by adding `await new Promise(r => setTimeout(r, 12000))` to Edge Function
2. Complete habit logging flow

**Expected:**
- ✅ Timeout triggers fallback message
- ✅ User sees fallback within 10 seconds max

#### Task 5.4: Caching Behavior

**Test 1: Same Session, Same Data**

1. Toggle habit as "done", save with note "Test 1"
2. Wait for reflection to appear
3. Navigate back to Daily Log (don't refresh page)
4. Toggle same habit again, save with **same note** "Test 1"

**Expected:**
- ✅ Second reflection appears **instantly** (from cache)
- ✅ No second API call made (check Network tab)

**Test 2: Cache Expiration**

1. Save habit with note "Test 1"
2. Wait 61 minutes (or mock time in test)
3. Save again with note "Test 1"

**Expected:**
- ✅ Second reflection makes a new API call (cache expired)

#### Task 5.5: Various Habit Counts

**Test 1: Single Habit**
- Add 1 habit, toggle as done, save with note
- Verify reflection mentions the habit by name

**Test 2: 5 Habits**
- Add 5 habits, toggle all as done, save with note
- Verify reflection doesn't list all 5 (focuses on key ones)
- Verify reflection feels cohesive, not overwhelming

**Test 3: Mixed Status**
- Add 3 habits: 2 done, 1 not_done
- Verify reflection acknowledges both achievements and challenges

#### Task 5.6: Time-of-Day Variations

**Test Scenarios:**
1. **Morning (8 AM):** Complete habits at 8:00 AM
2. **Afternoon (2 PM):** Complete habits at 2:00 PM
3. **Evening (8 PM):** Complete habits at 8:00 PM

**Verification:**
- Check Network tab → `generate-reflection` request → Payload
- Verify `time_of_day` field is correct: `morning`, `afternoon`, or `evening`
- Reflection MAY reference time contextually (optional)

#### Task 5.7: Performance Testing

**Latency Test:**

1. Open DevTools → Network tab
2. Complete habit logging flow
3. Measure time from clicking "Save" in modal to reflection appearing

**Expected Performance:**
- ✅ <3 seconds for 95% of requests (production)
- ✅ <5 seconds for 99% of requests
- ✅ Timeout at 10 seconds with fallback

**Payload Size Test:**

1. Open DevTools → Network tab
2. Find `generate-reflection` request
3. Check request payload size

**Expected:**
- ✅ <5 KB per request
- ✅ Notes truncated to 1000 chars max

**Cost Estimation:**

| Users | Reflections/Day | Monthly Cost (Haiku) |
|-------|----------------|----------------------|
| 1     | 5              | $0.15 - $0.60       |
| 100   | 5              | $15 - $60           |
| 1000  | 5              | $150 - $600         |

#### Task 5.9: Review Amara's Tone and Quality

Save 10 different reflection scenarios and verify:

1. ✅ **Warm, encouraging tone** (no judgment or shaming)
2. ✅ **Personal connection** (uses habit names)
3. ✅ **No emojis** (per system prompt)
4. ✅ **2-4 paragraphs** (not too long)
5. ✅ **Gentle suggestions** for tomorrow
6. ✅ **Acknowledges feelings** (mirrors user's note)
7. ✅ **Mentions streaks** when applicable
8. ✅ **Graceful for beginners** (no stats pressure if no history)

**Sample Scenarios:**

| Scenario | User Note | Expected Themes |
|----------|-----------|-----------------|
| First-time user | "Starting my journey!" | Encouragement, no stats, "getting to know you" |
| 5-day streak | "Keeping it up!" | Acknowledge streak, celebrate consistency |
| Skipped habit | "Too tired to meditate today" | Empathy, no judgment, tomorrow is a new day |
| Multiple habits | "Meditation and walk felt amazing!" | Connect both habits, holistic view |
| No note (empty) | (empty) | Focus on habits completed, general encouragement |
| Long note (500 chars) | "Detailed story..." | Acknowledge key themes, not overwhelmed |
| Negative sentiment | "Stressed and overwhelmed" | Empathy, recognize effort despite challenges |
| Positive sentiment | "Best day ever!" | Celebrate, amplify positive momentum |

**If Tone Issues Found:**
1. Adjust system prompt in `supabase/functions/generate-reflection/index.ts`
2. Redeploy: `supabase functions deploy generate-reflection`
3. Re-test with same scenarios

#### Task 5.10: Final Integration Test

**Full User Journey:**

1. **Sign Up** → Enter email/password → Verify redirect to Daily Log
2. **Add 3 Habits** → "Morning Meditation", "Evening Walk", "Journal Writing"
3. **Day 1: First Log** → Toggle 2 habits done → Save with note → Verify reflection → Navigate to Progress
4. **Day 2: Build Streak** → Toggle all 3 habits done → Save with note "Great momentum!" → Verify reflection mentions streak
5. **Day 3: Break Streak** → Skip 1 habit → Save with empathetic note → Verify reflection is supportive, not judgmental
6. **Progress Page Check** → Verify streaks calculated correctly → No conflicts with AI feature

**Mobile Viewport Test:**
- Repeat steps 1-6 on mobile viewport (375x667)
- Verify modal is responsive
- Verify touch targets ≥ 44x44px
- Verify keyboard navigation works

### Troubleshooting

#### Issue: "Amara is reflecting..." never completes

**Debug Steps:**
```bash
# Check Edge Function logs
supabase functions logs generate-reflection --limit 50

# Test Edge Function directly
curl -X POST https://yzisfgxjyugfnqcaqlgw.supabase.co/functions/v1/generate-reflection \
  -H "Authorization: Bearer <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"date":"2025-11-17","time_of_day":"morning","note_text":"test","habits":[],"recent_summary":{"days_tracked_last_7":0,"days_tracked_last_30":0,"notable_observations":[]}}'

# Verify API key is set
supabase secrets list
```

#### Issue: Reflection is generic (not personalized)

**Debug:**
1. Open DevTools → Network tab
2. Find `generate-reflection` request
3. Check payload - verify `habits` array is populated
4. If payload is correct, adjust system prompt for more specificity

#### Issue: Reflection has emojis

**Fix:**
- Update system prompt to emphasize "No emojis"
- Redeploy Edge Function

#### Issue: Cost is too high

**Optimization:**
1. Already using cheaper model (Haiku instead of Sonnet)
2. Reduce input tokens: Truncate notes to 500 chars
3. Reduce output tokens: Lower `max_tokens` to 300
4. Extend cache duration to 24 hours
5. Consider rate limiting per user (e.g., max 10 reflections/day)

---

## Next Steps

After deploying and testing:

1. ✅ Implement frontend data builder (`reflectionDataBuilder.ts`)
2. ✅ Create AI service caller (`aiReflectionService.ts`)
3. ✅ Update DailyLogPage to call AI service
4. ✅ Update ReflectionModal to display AI response
5. ✅ Complete Phase 5 testing checklist
6. 📝 Update Privacy Policy with AI data usage disclosure
7. 📝 Add user opt-out option (future enhancement)

See `tasks/tasks-0006-ai-reflection-coach.md` for detailed task breakdown.

---

## References

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Claude Model Pricing](https://www.anthropic.com/pricing)
- [Deno Deploy Docs](https://docs.deno.com/deploy/)
- [Anthropic Privacy Policy](https://www.anthropic.com/privacy)
