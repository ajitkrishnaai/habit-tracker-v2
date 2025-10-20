# GitHub Secrets Setup for E2E Tests

This document explains how to configure GitHub repository secrets for running E2E tests in GitHub Actions.

## Required Secrets

The E2E tests require Supabase credentials to authenticate test users and validate Row-Level Security (RLS) policies. These credentials must be configured as GitHub repository secrets.

### 1. VITE_SUPABASE_URL

**Description**: Your Supabase project URL
**Example**: `https://yzisfgxjyugfnqcaqlgw.supabase.co`
**Where to find**: Supabase Dashboard → Settings → API → Project URL

### 2. VITE_SUPABASE_ANON_KEY

**Description**: Your Supabase anonymous (public) key
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
**Where to find**: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`

### 3. SUPABASE_SERVICE_ROLE_KEY (Optional but Recommended)

**Description**: Your Supabase service role (admin) key
**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
**Where to find**: Supabase Dashboard → Settings → API → Project API keys → `service_role` `secret`

**⚠️ WARNING**: The service role key has **admin privileges** and can bypass RLS policies.
- **NEVER** commit this key to your repository
- **ONLY** use it in GitHub Actions secrets (encrypted)
- Without this key, test users will remain in your database after E2E tests complete

## How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `VITE_SUPABASE_URL`
     Value: `<your-supabase-url>`
   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: `<your-supabase-anon-key>`
   - Name: `SUPABASE_SERVICE_ROLE_KEY` (optional)
     Value: `<your-supabase-service-role-key>`
5. Click **Add secret** for each one

## How the E2E Tests Use These Secrets

### Local Development

- Reads credentials from `.env.local` (via `dotenv` package in `playwright.config.ts`)
- `.env.local` is in `.gitignore` and never committed
- Each developer maintains their own `.env.local` file

### GitHub Actions CI/CD

- Reads credentials from GitHub Actions environment variables
- Environment variables are injected in `.github/workflows/e2e-tests.yml`:
  ```yaml
  - name: Run E2E tests
    run: npm run test:e2e
    env:
      VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
      VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  ```
- Secrets are encrypted and never exposed in logs

## What Happens Without These Secrets?

If GitHub secrets are not configured:
- ❌ E2E tests will fail with: `Missing Supabase environment variables`
- ❌ GitHub Actions workflow will exit with code 1
- ❌ No test reports will be generated

## Verifying Secrets Are Set Correctly

After adding secrets:
1. Push a commit to trigger the GitHub Actions workflow
2. Check the workflow run in **Actions** tab
3. Look for the "Run E2E tests" step
4. If successful, you'll see test results and reports uploaded as artifacts
5. If failed with "Missing Supabase environment variables", check:
   - Secret names match exactly (case-sensitive)
   - Secret values don't have extra spaces or quotes
   - Secrets are in the correct repository (not a fork)

## Security Best Practices

✅ **DO**:
- Store all Supabase credentials as GitHub secrets
- Use the service role key only for test user cleanup
- Rotate your service role key periodically
- Use separate Supabase projects for development, staging, and production

❌ **DON'T**:
- Commit `.env.local` to git
- Share service role keys in Slack, email, or documentation
- Use production Supabase credentials for E2E tests
- Expose secrets in console.log or error messages

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Cause**: Secrets not configured or named incorrectly
**Fix**: Verify secret names match exactly: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Error: "Failed to sign in test user"

**Cause**: Email confirmation enabled in Supabase
**Fix**: Disable email confirmation in Supabase Dashboard → Authentication → Settings → Disable "Enable email confirmations"

### Warning: "Test users will remain in database"

**Cause**: `SUPABASE_SERVICE_ROLE_KEY` not set
**Fix**: Add the service role key as a GitHub secret (optional but recommended)

## Related Files

- `.github/workflows/e2e-tests.yml` - E2E test workflow definition
- `playwright.config.ts` - Playwright config that loads `.env.local`
- `e2e/utils/supabase-helpers.ts` - Test helpers that use these credentials
- `.env.local` (local only) - Local development environment variables
- `SUPABASE_SETUP.md` - Supabase project configuration guide

## Questions?

If you encounter issues with GitHub secrets setup:
1. Check this guide's Troubleshooting section
2. Review the GitHub Actions workflow logs
3. Verify your Supabase project settings
4. Check `.env.local` format matches the examples in `SUPABASE_SETUP.md`
