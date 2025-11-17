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

## Next Steps

After deploying the Edge Function:

1. ✅ Implement frontend data builder (`reflectionDataBuilder.ts`)
2. ✅ Create AI service caller (`aiReflectionService.ts`)
3. ✅ Update DailyLogPage to call AI service
4. ✅ Update ReflectionModal to display AI response
5. ✅ Write E2E tests for full flow

See `tasks/tasks-0006-ai-reflection-coach.md` for detailed task breakdown.

---

## References

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [Claude Model Pricing](https://www.anthropic.com/pricing)
- [Deno Deploy Docs](https://docs.deno.com/deploy/)
