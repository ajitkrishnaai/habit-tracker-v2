# Task List: Supabase Database Migration

Based on PRD: `0002-prd-supabase-migration.md`

## Relevant Files

### Source Code
- `src/lib/supabaseClient.ts` - Supabase client singleton initialization
- `src/services/supabaseDataService.ts` - New data service for CRUD operations with Supabase
- `src/services/auth.ts` - **[REPLACE]** Authentication service using Supabase Auth
- `src/services/syncService.ts` - **[MODIFY]** Update to use Supabase instead of Google Sheets
- `src/services/storage.ts` - **[PRESERVE]** IndexedDB service (no changes)
- `src/services/syncQueue.ts` - **[PRESERVE]** Sync queue service (no changes)
- `src/services/googleSheets.ts` - **[DELETE]** Legacy Google Sheets service (Phase 8)
- `src/utils/tokenManager.ts` - **[DELETE]** Token manager (Supabase SDK handles this)
- `src/types/database.ts` - TypeScript types matching Supabase schema
- `src/components/ProtectedRoute.tsx` - **[MODIFY]** Update auth checks for Supabase
- `src/components/WelcomePage.tsx` - **[MODIFY]** Update OAuth flow for Supabase
- `src/components/Navigation.tsx` - **[MODIFY]** Update user profile display

### Testing
- `src/services/supabaseDataService.test.ts` - Unit tests for Supabase data service
- `src/services/auth.test.ts` - **[UPDATE]** Update auth tests with Supabase mocks
- `src/services/syncService.test.ts` - **[UPDATE]** Update sync tests with Supabase mocks
- `src/test/supabaseMocks.ts` - Mock utilities for Supabase SDK in tests

### Configuration & Infrastructure
- `.env.local` - Local environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- `.env.example` - Example environment file with new variables
- `package.json` - Add @supabase/supabase-js dependency
- `vite.config.ts` - No changes needed (Vite already configured)
- `supabase/migrations/001_initial_schema.sql` - **[CREATED]** Database schema and RLS policies
- `supabase/seed.sql` - **[CREATED]** Optional seed data for testing
- `SUPABASE_SETUP.md` - **[CREATED]** Complete Supabase setup documentation

### Documentation
- `CLAUDE.md` - **[UPDATE]** Replace Google Sheets architecture with Supabase
- `README.md` - **[UPDATE]** Add Supabase setup instructions
- `SUPABASE_SETUP.md` - New guide for Supabase project setup
- `MIGRATION_LOG.md` - Document migration process and decisions

### Notes
- All 254 existing tests must pass with updated mocks
- IndexedDB and sync queue remain unchanged (offline-first preserved)
- Zero data migration needed (no existing users)
- Supabase free tier: 500 MB storage, unlimited API requests
- RLS policies enforce user data isolation at database level

## Tasks

- [x] 1.0 Supabase Infrastructure Setup
  - [x] 1.1 Create Supabase project at supabase.com (free tier, select region)
  - [x] 1.2 Create database schema (habits, logs, metadata tables with columns, constraints, indexes)
  - [x] 1.3 Implement Row-Level Security (RLS) policies for all tables (user_id filtering)
  - [x] 1.4 Create database triggers (auto-update modified_date, auto-create metadata on user signup)
  - [x] 1.5 Configure email/password auth in Supabase (changed from Google OAuth to email/password)
  - [x] 1.6 Test database schema via Supabase Table Editor (verified tables, RLS, policies, triggers)
  - [x] 1.7 Document Supabase project URL and anon key for environment setup

- [x] 2.0 Frontend Dependencies & Configuration
  - [x] 2.1 Install @supabase/supabase-js package (npm install @supabase/supabase-js)
  - [x] 2.2 Create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
  - [x] 2.3 Update .env.example with new Supabase variables (remove VITE_GOOGLE_CLIENT_ID)
  - [x] 2.4 Create src/types/database.ts with TypeScript types matching Supabase schema
  - [x] 2.5 Create src/lib/supabaseClient.ts with client singleton initialization
  - [x] 2.6 Test Supabase client initialization in development (npm run dev, check console logs)

- [ ] 3.0 Authentication Migration (Google OAuth via Supabase Auth)
  - [ ] 3.1 Create new src/services/auth.ts with Supabase Auth implementation
  - [ ] 3.2 Implement initAuth() - initialize auth and set up state change listener
  - [ ] 3.3 Implement login() - initiate Google OAuth via supabase.auth.signInWithOAuth()
  - [ ] 3.4 Implement logout() - sign out via supabase.auth.signOut()
  - [ ] 3.5 Implement isAuthenticated() - check session via supabase.auth.getSession()
  - [ ] 3.6 Implement getUserProfile() - extract profile from session.user
  - [ ] 3.7 Implement getUserId() - return session.user.id
  - [ ] 3.8 Implement getAccessToken() - return session.access_token
  - [ ] 3.9 Delete src/utils/tokenManager.ts (no longer needed)
  - [ ] 3.10 Update src/components/ProtectedRoute.tsx to use Supabase session checks
  - [ ] 3.11 Update src/components/WelcomePage.tsx to call new login() function
  - [ ] 3.12 Update src/components/Navigation.tsx to display user profile from getUserProfile()
  - [ ] 3.13 Test authentication flow (sign in, session persistence, sign out)

- [ ] 4.0 Data Layer Migration (Supabase Data Service)
  - [ ] 4.1 Create src/services/supabaseDataService.ts with base structure
  - [ ] 4.2 Implement getHabits(activeOnly?) - fetch habits with optional status filter
  - [ ] 4.3 Implement getHabit(habitId) - fetch single habit by ID
  - [ ] 4.4 Implement createHabit(habit) - insert habit with user_id auto-injected
  - [ ] 4.5 Implement updateHabit(habit) - update habit by ID
  - [ ] 4.6 Implement deleteHabit(habitId) - soft delete (mark status='inactive')
  - [ ] 4.7 Implement getLogs(habitId?, date?) - fetch logs with optional filters
  - [ ] 4.8 Implement createLog(log) - insert log with unique (habit_id, date) constraint
  - [ ] 4.9 Implement updateLog(log) - update log by ID
  - [ ] 4.10 Implement deleteLog(logId) - hard delete log entry
  - [ ] 4.11 Implement getMetadata() - fetch metadata for authenticated user
  - [ ] 4.12 Implement updateMetadata(metadata) - upsert metadata
  - [ ] 4.13 Add error handling for all operations (catch Supabase errors, log, rethrow)
  - [ ] 4.14 Test all CRUD operations in development (create test data, verify in Supabase dashboard)

- [ ] 5.0 Sync Service Integration
  - [ ] 5.1 Update src/services/syncService.ts imports (replace googleSheetsService with supabaseDataService)
  - [ ] 5.2 Update syncFromRemote() to call supabaseData.getHabits(), getLogs(), getMetadata()
  - [ ] 5.3 Update processOperation() for CREATE_HABIT to call supabaseData.createHabit(data)
  - [ ] 5.4 Update processOperation() for UPDATE_HABIT to call supabaseData.updateHabit(data)
  - [ ] 5.5 Update processOperation() for DELETE_HABIT to call supabaseData.deleteHabit(data.habit_id)
  - [ ] 5.6 Update processOperation() for CREATE_LOG to call supabaseData.createLog(data)
  - [ ] 5.7 Update processOperation() for UPDATE_LOG to call supabaseData.updateLog(data)
  - [ ] 5.8 Update processOperation() for DELETE_LOG to call supabaseData.deleteLog(data.log_id)
  - [ ] 5.9 Update processOperation() for UPDATE_METADATA to call supabaseData.updateMetadata(data)
  - [ ] 5.10 Preserve conflict resolution logic (resolveConflicts() method unchanged)
  - [ ] 5.11 Preserve retry logic with exponential backoff (scheduleRetry() unchanged)
  - [ ] 5.12 Test sync service integration (queue operations, trigger sync, verify Supabase updates)

- [ ] 6.0 Component Updates & Testing
  - [ ] 6.1 Run existing test suite (npm test -- --run) to identify failing tests
  - [ ] 6.2 Create src/test/supabaseMocks.ts with mock Supabase client for tests
  - [ ] 6.3 Update src/services/auth.test.ts with Supabase Auth mocks
  - [ ] 6.4 Update src/services/syncService.test.ts with Supabase data service mocks
  - [ ] 6.5 Create src/services/supabaseDataService.test.ts with comprehensive CRUD tests
  - [ ] 6.6 Run test suite again - ensure 254+ tests passing
  - [ ] 6.7 Test authentication flow end-to-end (sign in with Google, verify session, sign out)
  - [ ] 6.8 Test habit CRUD operations (create, read, update, soft delete, verify RLS isolation)
  - [ ] 6.9 Test log CRUD operations (create, read, update, delete, verify unique constraint)
  - [ ] 6.10 Test offline functionality (disconnect WiFi, make changes, verify queue, reconnect, verify sync)
  - [ ] 6.11 Test multi-device sync (make changes on "Device A", refresh "Device B", verify updates appear)
  - [ ] 6.12 Test conflict resolution (make conflicting changes offline, reconnect, verify last-write-wins)
  - [ ] 6.13 Measure sync latency with browser DevTools Network tab (target <500ms for typical operations)
  - [ ] 6.14 Test with various data sizes (10 habits, 50 habits, 100 habits; 100 logs, 1000 logs)
  - [ ] 6.15 Test RLS security (attempt to access other user's data via Supabase SQL editor, verify blocked)
  - [ ] 6.16 Test error handling (invalid data, network errors, duplicate constraints, verify error messages)

- [ ] 7.0 Deployment & Production Readiness
  - [ ] 7.1 Create production Supabase project (or use staging project for now)
  - [ ] 7.2 Run database migrations on production project (copy schema from development)
  - [ ] 7.3 Verify RLS policies active on production database
  - [ ] 7.4 Configure production environment variables in hosting platform (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  - [ ] 7.5 Update Google Cloud OAuth redirect URIs with production domain
  - [ ] 7.6 Add production domain to Supabase Auth allowed redirect URLs
  - [ ] 7.7 Build production bundle (npm run build)
  - [ ] 7.8 Deploy to hosting platform (Google Cloud Run, Vercel, Netlify, etc.)
  - [ ] 7.9 Test production authentication (sign in, verify session, sign out)
  - [ ] 7.10 Test production sync operations (create habit, verify in Supabase dashboard)
  - [ ] 7.11 Measure production sync latency (target <500ms)
  - [ ] 7.12 Set up Supabase monitoring (enable database logs, set up billing alerts at 80% free tier)
  - [ ] 7.13 Monitor error rates for first 24 hours (Supabase dashboard logs, frontend error tracking)
  - [ ] 7.14 Document rollback plan (revert code, redeploy previous version with Google Sheets)

- [ ] 8.0 Legacy Code Cleanup & Documentation
  - [ ] 8.1 Delete src/services/googleSheets.ts (571 lines removed)
  - [ ] 8.2 Delete src/utils/tokenManager.ts (if not already deleted in 3.9)
  - [ ] 8.3 Remove @react-oauth/google and gapi-script from package.json dependencies
  - [ ] 8.4 Remove VITE_GOOGLE_CLIENT_ID from .env.example
  - [ ] 8.5 Update CLAUDE.md - replace Google Sheets architecture with Supabase
  - [ ] 8.6 Update CLAUDE.md - document new authentication flow (Supabase Auth)
  - [ ] 8.7 Update CLAUDE.md - update service layer documentation
  - [ ] 8.8 Update CLAUDE.md - update data flow diagrams
  - [ ] 8.9 Update README.md - add Supabase setup instructions (project creation, schema setup, OAuth config)
  - [ ] 8.10 Update README.md - update environment variables section
  - [ ] 8.11 Create SUPABASE_SETUP.md - detailed guide for setting up Supabase project
  - [ ] 8.12 Create MIGRATION_LOG.md - document migration decisions and lessons learned
  - [ ] 8.13 Update package.json scripts (ensure test commands work with new setup)
  - [ ] 8.14 Run final test suite (npm test -- --run) - ensure 100% pass rate
  - [ ] 8.15 Run linter (npm run lint) - ensure no errors
  - [ ] 8.16 Git commit with conventional format: "feat: migrate from Google Sheets to Supabase"

