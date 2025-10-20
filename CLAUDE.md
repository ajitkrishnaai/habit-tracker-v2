# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Habit Tracker V2** is a mobile-first Progressive Web App (PWA) for tracking daily habits with complete data ownership. User data is stored in a Supabase PostgreSQL database with Row-Level Security (RLS) ensuring each user can only access their own data.

### Core Architecture

- **Frontend**: React 18.2 SPA with client-side routing (React Router 6.20)
- **Authentication**: Supabase Auth with email/password + Demo Mode for unauthenticated users
- **Database**: Supabase PostgreSQL with Row-Level Security (RLS)
- **Offline-First**: IndexedDB for local caching with background sync to Supabase
- **Build Tool**: Vite 5.0.8 with TypeScript 5.2.2
- **PWA**: Service workers for offline capability and mobile installation

### Data Architecture

**Supabase PostgreSQL Database** (3 tables with RLS policies):

1. **habits** - User's tracked habits
   - `habit_id` (TEXT PK), `user_id` (UUID FK), `name` (TEXT 1-100), `category` (TEXT), `status` ('active'|'inactive')
   - Unique constraint: `(user_id, LOWER(name))` - case-insensitive duplicate prevention
   - Soft delete: Mark as 'inactive' instead of removing

2. **logs** - Daily log entries
   - `log_id` (TEXT PK), `habit_id` (TEXT FK), `user_id` (UUID FK), `date` (DATE), `status` ('done'|'not_done'|'no_data'), `notes` (TEXT max 5000)
   - Unique constraint: `(habit_id, date)` - one log per habit per day
   - Cascade delete: Logs deleted when parent habit is deleted

3. **metadata** - App metadata per user
   - `user_id` (UUID PK), `sheet_version` (TEXT), `last_sync` (TIMESTAMPTZ)
   - Auto-created on user signup via database trigger

**Sync Strategy**:
- Local-first: All reads from IndexedDB; writes go to IndexedDB + background sync to Supabase
- Conflict resolution: Last-write-wins based on `modified_date` timestamps
- Auto-retry: Failed syncs retry with exponential backoff (30s, 60s, 120s)

### Key User Flows

1. **Demo Mode User**: Welcome page → Try without signing up → Add habits in demo mode → Receive conversion prompts at key milestones → Sign up to migrate data
2. **Authenticated User**: Welcome page → Email/password sign-in → Add habits → Daily logging
3. **Daily Logging**: View today's habits with toggle switches → Mark done/not done → Add optional notes → Auto-sync
4. **Progress Tracking**: View streaks, completion percentages, notes pattern analysis (requires 7+ notes)
5. **Back-Dating**: Navigate up to 5 days in the past to log missed habits

### Design Principles

- **Mobile-First**: Optimized for 320px+ screens, min 44x44px touch targets
- **Minimal & Clean**: Neutral grays with single accent color, generous white space
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Responsive**: Breakpoint at 768px; desktop uses max 800px centered layout

## Repository Structure

### `/agents/`
Agent rules for AI-assisted development:
- `create-prd.md` - Process for generating Product Requirements Documents
- `generate-tasks.md` - Process for breaking PRDs into implementation tasks
- `process-task-list-optimized.md` - PR-based task completion protocol with CI/CD workflow

### `/tasks/`
Project planning and tracking:
- `0001-prd-habit-tracker.md` - Complete PRD with 46 functional requirements
- `tasks-0001-prd-habit-tracker.md` - 407 sub-tasks across 9 parent tasks for implementation

### `/supabase/`
Database schema and migrations:
- `migrations/001_initial_schema.sql` - Creates tables, indexes, RLS policies, triggers
- `seed.sql` - Sample data for development/testing

## Essential Commands

### Development
```bash
# Start dev server on http://localhost:5173
npm run dev

# Build for production (outputs to /dist)
npm run build

# Preview production build
npm run preview

# Lint TypeScript/React code
npm run lint
```

### Testing
```bash
# Vitest unit tests (watch mode)
npm test

# Run unit tests once
npm test -- --run

# Run specific test file
npm test -- src/utils/streakCalculator.test.ts

# Run with coverage (requires @vitest/coverage-v8)
npm run test:coverage

# Run with Vitest UI
npm test -- --ui
```

### E2E Testing (Playwright)
```bash
# Run E2E tests (starts dev server automatically)
npm run test:e2e

# E2E tests with interactive UI
npm run test:e2e:ui

# E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests with Playwright Inspector
npm run test:e2e:debug

# View E2E test report
npm run test:e2e:report
```

### Environment Setup

Create `.env.local` with:
```env
# Supabase Configuration (get from Supabase dashboard: Settings → API)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

**See `SUPABASE_SETUP.md` for complete Supabase project configuration.**

## Technology Stack

**Core**:
- **Build Tool**: Vite 5.0.8 with `vite-plugin-pwa` for PWA support
- **Language**: TypeScript 5.2.2
- **Framework**: React 18.2 with React Router 6.20
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth with email/password

**Libraries**:
- `@supabase/supabase-js` 2.75.1 - Supabase client SDK
- `date-fns` 2.30.0 - Date manipulation
- `sentiment` 5.0.2 - Lightweight sentiment analysis for notes
- `react-router-dom` 6.20 - Client-side routing

**Testing**:
- **Unit/Integration**: Vitest 1.0.4 with happy-dom environment
- **E2E**: Playwright 1.56.0 (Chrome, Firefox, Safari)
- **Coverage**: @vitest/coverage-v8

**Development**:
- ESLint with TypeScript/React plugins
- Prettier 3.1.1 for code formatting
- fake-indexeddb for testing IndexedDB operations

## Code Architecture

### Service Layer (`src/services/`)

**Supabase Services** (primary data layer):

1. **supabaseDataService** (`supabaseDataService.ts`) - CRUD operations for habits, logs, metadata
   - Type-safe operations using `Database` schema types from `src/types/database.ts`
   - Automatic `user_id` injection from authenticated session
   - Enforces RLS policies (users can only access their own data)
   - Comprehensive error handling with `SupabaseDataError` class
   - Methods: `getHabits(activeOnly?)`, `createHabit()`, `updateHabit()`, `deleteHabit()`, `getLogs()`, `createLog()`, `updateLog()`, `deleteLog()`, `getMetadata()`, `updateMetadata()`

2. **supabaseClient** (`src/lib/supabaseClient.ts`) - Singleton Supabase client
   - Configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Auto-refresh tokens, persistent sessions (localStorage)
   - Helper functions: `getCurrentSession()`, `getCurrentUser()`, `onAuthStateChange()`

**Supporting Services** (offline-first architecture):

3. **storageService** (`storage.ts`) - IndexedDB operations for offline caching
   - Three object stores: `habits`, `logs`, `metadata`
   - Methods: `initDB()`, `saveHabit()`, `getHabits()`, `saveLogs()`, `getLogs()`

4. **syncQueueService** (`syncQueue.ts`) - Offline operation queue
   - Queues operations when offline: `CREATE_HABIT`, `UPDATE_HABIT`, `CREATE_LOG`, `UPDATE_LOG`
   - Stores queue in localStorage for simplicity
   - Deduplicates operations (e.g., multiple updates collapse into one)

5. **syncService** (`syncService.ts`) - Sync coordinator
   - Orchestrates bi-directional sync between IndexedDB and Supabase
   - Retry logic with exponential backoff (30s, 60s, 120s)
   - Conflict resolution: last-write-wins based on `modified_date` timestamps

6. **demoMode** (`demoMode.ts`) - Demo mode "shadow account" system
   - Allows users to try the app without authentication
   - Stores demo data in IndexedDB (same as authenticated users)
   - Tracks engagement metrics in localStorage: habits added, logs completed, progress visits
   - Triggers conversion prompts at key milestones (first habit, 3 habits, first log, progress page visit)
   - Seamless data migration on signup via `syncService.fullSync()`
   - Methods: `isDemoMode()`, `initDemoMode()`, `trackHabitAdded()`, `trackLogCompleted()`, `trackProgressVisit()`, `shouldShowConversion()`, `exitDemoMode()`

**Note**: Legacy Google Sheets and Google OAuth services have been removed. All data operations now go through Supabase.

### Data Flow Pattern

**Write Operations** (optimistic UI):
1. User action (e.g., toggle habit status)
2. Immediate UI update (optimistic)
3. Write to IndexedDB (`storageService`)
4. Queue operation if offline (`syncQueueService`)
5. Background sync to Supabase (`supabaseDataService`) - only for authenticated users
6. On success: remove from queue; On failure: retry with exponential backoff

**Read Operations**:
1. Read from IndexedDB (fast, offline-capable)
2. Background sync from Supabase on: app load, manual refresh, network reconnection (authenticated users only)
3. Never block UI waiting for remote data

**Demo Mode Data Flow**:
1. Demo users write to IndexedDB only (no Supabase sync)
2. Engagement metrics tracked in localStorage
3. On signup: `syncService.fullSync()` migrates all demo data to Supabase under new user ID
4. Demo metrics cleared after successful migration

### Component Architecture

**Pages** (`src/pages/`):
- `WelcomePage.tsx` - Landing page with sign-in and "Try without signing up" option (public)
- `ManageHabitsPage.tsx` - CRUD interface for habits (protected)
- `DailyLogPage.tsx` - Daily logging with toggles and shared notes field (protected)
- `ProgressPage.tsx` - Analytics dashboard with streaks, percentages, pattern analysis (protected)
- `PrivacyPolicyPage.tsx` / `TermsOfServicePage.tsx` - Legal pages (public)

**Reusable Components** (`src/components/`):
- `ToggleSwitch.tsx` - Accessible toggle (44x44px touch target, keyboard navigable)
- `HabitForm.tsx` - Add/edit habit form with validation and character counters
- `DateNavigator.tsx` - Navigate backward up to 5 days
- `ProgressCard.tsx` - Expandable card showing streaks and analytics
- `Navigation.tsx` - Top nav bar (sticky on mobile, active state highlighting)
- `Footer.tsx` - Footer with Privacy/Terms links
- `Layout.tsx` - Wrapper for protected routes (includes Navigation + Footer + OfflineIndicator)
- `SyncIndicator.tsx` - Shows sync status (spinning/success/error with retry)
- `OfflineIndicator.tsx` - Banner when offline
- `ErrorMessage.tsx` - Unified error display with retry buttons
- `ProtectedRoute.tsx` - Route guard requiring Supabase authentication (allows demo mode)
- `DemoBanner.tsx` - Persistent banner shown to demo users encouraging signup

**Utility Functions** (`src/utils/`):

All utilities are pure functions with corresponding `.test.ts` files:
- `streakCalculator.ts` - Calculates current and longest streaks from log history
- `percentageCalculator.ts` - Computes completion percentage (done/total logged days)
- `notesAnalyzer.ts` - Extracts keywords, sentiment, correlations (requires 7+ entries with notes)
- `dataValidation.ts` - Validates habit names, categories, dates, notes
- `dateHelpers.ts` - Date formatting and calculations (uses date-fns)
- `uuid.ts` - Generates unique IDs with prefixes (`habit_`, `log_`)
- `errorHandler.ts` - Centralized error handling and logging

### Routing (`src/router.tsx`)

React Router 6 routes:
- `/` - WelcomePage (public)
- `/daily-log` - DailyLogPage (protected, default after login, allows demo mode)
- `/progress` - ProgressPage (protected, allows demo mode)
- `/manage-habits` - ManageHabitsPage (protected, allows demo mode)
- `/privacy` - PrivacyPolicyPage (public)
- `/terms` - TermsOfServicePage (public)

All protected routes wrapped with `Layout` component and allow demo mode access.

## Database Schema & Migrations

**Schema Files**:
- `supabase/migrations/001_initial_schema.sql` - Creates tables, indexes, RLS policies, triggers
- `supabase/seed.sql` - Sample data for testing
- `src/types/database.ts` - TypeScript types generated from Supabase schema

**Key Database Features**:
- **RLS Policies**: All tables enforce `auth.uid() = user_id` for SELECT/INSERT/UPDATE/DELETE
- **Triggers**:
  - Auto-update `modified_date` on UPDATE (all tables)
  - Auto-create metadata row on user signup
- **Indexes**: Optimized for queries by `user_id`, `date`, `status`, `created_date`
- **Cascade Deletes**: Logs deleted when parent habit is deleted
- **Check Constraints**: Validate habit name length (1-100), status values, notes length (max 5000)

## Testing Strategy

**Test Organization**:
- **Unit tests**: Colocated `*.test.ts` files next to source files (Vitest + happy-dom)
- **E2E tests**: `e2e/*.spec.ts` files (Playwright)
- **Test setup**: `src/test/setup.ts` configures fake-indexeddb
- **Coverage target**: 85%+ (currently 99.7% with 747/749 tests passing)
- **Test utilities**: `src/utils/testHelpers.ts` provides mock data generators

**E2E Test Projects** (Playwright config in `playwright.config.ts`):
- **Mobile Chrome** (375x667 viewport) - Primary target
- **Desktop Chrome** (1280x720) - Desktop layout testing
- **Mobile Safari** (iPhone 13) - iOS compatibility
- **Firefox** (1280x720) - Cross-browser testing

**Known Test Failures** (2 tests, non-blocking):
- 2 date validation edge case tests (timezone handling bugs)
- See `TEST_REPORT_TASKS_1-6.md` for detailed analysis

## Working with Task Lists

Follow the PR-based completion protocol from `agents/process-task-list-optimized.md`:

### Sub-task Completion
1. Complete sub-task implementation
2. Mark as `[x]` in task list markdown file
3. Continue to next sub-task

### Parent Task Completion (when ALL sub-tasks are [x])

1. **Run tests**: `npm test -- --run`
2. **Create feature branch**: `git checkout -b feature/task-X.X-description`
3. **Stage and commit** (only if tests pass):
   ```bash
   git add .
   git commit -m "feat: implement habit management" \
              -m "- Add ManageHabitsPage component" \
              -m "- Implement CRUD operations" \
              -m "Completes task 4.0 from PRD 0001"
   ```
4. **Push branch**: `git push origin feature/task-X.X-description`
5. **Create PR**: `gh pr create --title "..." --body "..."`
6. **Wait for CI checks** to pass
7. **Merge PR**: `gh pr merge --squash --delete-branch`
8. **Update local main**: `git checkout main && git pull origin main`
9. **Mark parent task** as `[x]` in task list
10. **Stop and wait** for user approval before next parent task

**See `agents/process-task-list-optimized.md` for complete workflow details.**

## PRD Reference

The PRD (`tasks/0001-prd-habit-tracker.md`) is the source of truth. Key requirements:

### Critical Technical Requirements

**Data Validation**:
- Habit names: 1-100 chars, unique per user (case-insensitive)
- Notes: max 5000 chars
- Dates: ISO 8601 format, max 5 days in past
- Categories: optional, max 50 chars

**Soft Delete**:
- Never permanently delete habits - mark as 'inactive' to retain historical data
- Inactive habits don't show in daily logging but appear in progress analytics

**Performance**:
- <3s initial load on 4G
- Toggle switches respond immediately (optimistic UI)
- Progress view loads within 2 seconds

**Offline Support**:
- App must function 100% offline with queued sync
- Retry failed syncs with exponential backoff (30s, 60s, 120s)

**Design Requirements**:
- Mobile-first (320px+ screens)
- Min 44x44px touch targets
- 16px base font (prevents iOS zoom on input focus)
- 768px breakpoint for desktop layout (max 800px centered)
- WCAG 2.1 AA compliance

### Feature-Specific Notes

**Habit Management**:
- Duplicate checking is case-insensitive (enforced by database unique index)
- Habits sorted by `created_date`

**Daily Logging**:
- Shared notes field applies to all habits in that session (not per-habit)
- Visual states: done (toggle on), not_done (toggle off), no_data (default)
- Must prompt if navigating away with unsaved notes

**Progress & Analytics**:
- Current streak: consecutive "done" days from today backward, resets on "not_done"
- Longest streak: maximum ever achieved in history
- Completion %: (done count / total logged days) × 100, excludes "no_data" days
- Notes analysis: Only shows after 7+ log entries with notes; uses simple NLP + sentiment

**UI/UX**:
- Top navigation: fixed/sticky with "Daily Log" (default), "Progress", "Manage Habits"
- Footer must link to Privacy Policy and Terms of Service

**Demo Mode**:
- Users can try the app without signing up
- Demo data stored locally in IndexedDB
- Conversion prompts triggered at: first habit added, 3 habits added, first log completed, progress page visit
- Seamless migration: demo data automatically synced to Supabase on signup
- Demo banner displayed on all pages to encourage signup

## Current Implementation Status

**Completed Tasks**:
- ✅ **Task 1.0**: Supabase Infrastructure Setup (database schema, migrations, RLS policies)
- ✅ **Task 2.0**: Supabase Frontend Dependencies (client initialization, environment config)
- ✅ **Task 3.0**: Authentication Migration (Supabase Auth with email/password)
- ✅ **Task 4.0**: Data Service Implementation (supabaseDataService with CRUD operations)
- ✅ **Task 5.0**: Frontend Migration to Supabase (all components updated to use Supabase)
- ✅ **Task 6.0**: Offline Sync Migration (syncService updated for Supabase)
- ✅ **Task 7.0**: UI/UX & Responsive Design (accessibility testing, polish)
- ✅ **Task 8.0**: Testing & Quality Assurance (comprehensive test suite)
- ✅ **Demo Mode Implementation**: Shadow account system with conversion prompts and data migration

**Ready for Deployment**:
- Core habit tracking functionality complete
- Demo mode fully integrated
- 99.7% test coverage
- All Supabase migration tasks complete

**Future Enhancements** (post-MVP):
- Additional features (TBD)
- PWA enhancements (push notifications, background sync improvements)
- Production deployment and monitoring

## Migration Notes

**Supabase Migration Status**:
- ✅ **Backend**: Complete (Auth + Database + Data Service)
- ✅ **Frontend**: Complete (all components migrated to Supabase)
- ✅ **Legacy Code Cleanup**: Complete (Google Sheets and Google OAuth removed)
- ✅ **Demo Mode**: Complete (shadow account system with data migration)
- 📋 **Next Steps**: Production deployment, user documentation

**Migration Testing**:
- ✅ Supabase Auth verified with email/password
- ✅ RLS policies prevent cross-user data access
- ✅ IndexedDB → Supabase sync with conflict resolution
- ✅ Offline queue works with Supabase backend
- ✅ Demo mode data migration to authenticated accounts

## Important Constraints

- **No Custom Backend Server**: Pure client-side app; Supabase handles all backend logic via RLS
- **No Real-time Multi-device Sync**: Out of scope (data in Supabase but no realtime subscriptions)
- **No Push Notifications**: No reminders or notification system
- **Single Log Per Day**: Each habit can only be logged once per day (done/not done)
- **RLS Enforced**: All database operations automatically enforce `user_id = auth.uid()`
- **Demo Mode Limitations**: Demo users cannot sync to Supabase until they sign up

## Open Questions from PRD

Before implementing certain features, consider these unresolved questions (PRD Section 15):

1. **Notes Analysis**: Third-party NLP library vs. in-house keyword extraction? (Currently using `sentiment` package)
2. **Streak Logic**: Should back-dating a missed habit affect current streak? (Currently: no, streaks calculated from real-time logging)
3. **Performance**: With 1000+ logs, should progress screen use pagination? (Currently: loads all data, no pagination)
4. **Category Management**: Free-form input or suggested categories? (Currently: free-form text input)

Document decisions in git commit messages when implementing.
