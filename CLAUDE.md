# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Habit Tracker Web Application** - a mobile-first Progressive Web App (PWA) that allows users to track daily habits with complete data ownership. All user data is stored in the user's own Google Sheet on Google Drive, not on any backend server.

### Core Architecture

- **Frontend**: Single Page Application (SPA) with client-side routing
- **Authentication**: Google OAuth 2.0 with minimal permissions (access only to files created by this app)
- **Data Storage**: Dual-layer architecture
  - **Local**: IndexedDB/localStorage for offline-first functionality
  - **Remote**: Google Sheets API v4 as the persistent data store
- **Offline-First Design**: Service workers cache assets; sync queue manages offline changes
- **PWA**: Installable on mobile devices with offline capabilities

### Data Architecture

The application uses a three-entity data model stored in a single Google Sheet:

1. **Habits Tab** - User's tracked habits (habit_id, name, category, status, timestamps)
2. **Logs Tab** - Daily log entries (log_id, habit_id, date, status, notes, timestamp)
3. **Metadata Tab** - App metadata (sheet_version, last_sync, user_id)

**Sync Strategy**:
- Local-first: All operations write to local storage immediately (optimistic UI)
- Background sync: Changes are queued and synced to Google Sheets asynchronously
- Conflict resolution: Last-write-wins based on timestamps
- Auto-retry: Failed syncs retry with exponential backoff (30s, 60s, 120s)

### Key User Flows

1. **First-Time User**: Welcome page → Google OAuth → Sheet creation → Add habits → Daily logging
2. **Daily Logging**: View today's habits with toggle switches → Mark done/not done → Add optional notes → Auto-sync
3. **Progress Tracking**: View streaks (current & longest), completion percentages, notes pattern analysis (after 7+ notes)
4. **Back-Dating**: Navigate up to 5 days in the past to log missed habits

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
- `process-task-list.md` - Task completion protocol and maintenance rules

### `/tasks/`
Project planning and tracking:
- `0001-prd-habit-tracker.md` - Complete PRD with 46 functional requirements
- `tasks-0001-prd-habit-tracker.md` - 407 sub-tasks across 9 parent tasks for implementation

## Working with Task Lists

When implementing features, follow the completion protocol from `agents/process-task-list.md`:

### Sub-task Completion
1. Complete the sub-task implementation
2. Mark sub-task as `[x]` in the task list markdown file
3. Continue to next sub-task

### Parent Task Completion (when ALL sub-tasks are [x])
1. Run the full test suite (exact command TBD based on chosen framework)
2. Only if all tests pass:
   - Stage changes: `git add .`
   - Clean up temporary files/code
   - Commit with conventional format using multiple `-m` flags:
     ```bash
     git commit -m "feat: implement habit management" \
                -m "- Add ManageHabitsPage component" \
                -m "- Implement CRUD operations with validation" \
                -m "- Add tests for duplicate detection" \
                -m "Completes task 4.0 from PRD 0001"
     ```
3. Mark parent task as `[x]`
4. Stop and wait for user approval before starting next parent task

### Task List Maintenance
- Update task list after each significant work session
- Add newly discovered tasks as they emerge
- Keep "Relevant Files" section accurate with one-line descriptions

## PRD Reference

The PRD (`tasks/0001-prd-habit-tracker.md`) is the source of truth. Key requirements:

### Critical Technical Requirements
- **OAuth Scopes**: `https://www.googleapis.com/auth/drive.file` and `userinfo.profile` only (most restrictive scope - only files created by this app)
- **Token Storage**: OAuth tokens in memory only (never localStorage)
- **Performance**: <3s initial load on 4G; toggles respond immediately with optimistic UI
- **Offline**: App must function 100% offline with queued sync
- **Data Validation**:
  - Habit names: 1-100 chars, unique (case-insensitive)
  - Notes: max 5000 chars
  - Dates: ISO 8601 format, max 5 days in past

### Feature-Specific Notes

**Habit Management (Task 4.0)**:
- Never permanently delete habits - mark as 'inactive' to retain historical data
- Duplicate checking is case-insensitive
- Habits sorted by created_date

**Daily Logging (Task 5.0)**:
- Shared notes field applies to all habits in that session (not per-habit)
- Visual states: done (toggle on), not_done (toggle off), no_data (default)
- Must prompt if navigating away with unsaved notes

**Progress & Analytics (Task 6.0)**:
- Current streak: consecutive "done" days from today backward, resets on "not_done"
- Longest streak: maximum ever achieved in history
- Completion %: (done count / total logged days) × 100, excludes "no_data" days
- Notes analysis: Only shows after 7+ log entries with notes; uses simple NLP + sentiment

**UI/UX (Task 7.0)**:
- Base font: 16px (prevents iOS zoom on input focus)
- All touch targets: min 44x44px
- Top navigation: fixed/sticky with "Daily Log" (default), "Progress", "Manage Habits"
- Footer must link to Privacy Policy and Terms of Service

## Technology Stack (Implemented)

**Build & Framework**:
- **Build Tool**: Vite 5.0.8 with PWA plugin
- **Language**: TypeScript 5.2.2
- **Framework**: React 18.2 with React Router 6.20
- **State Management**: React hooks (useState, useEffect) - no external state library
- **Date Library**: date-fns 2.30.0
- **NLP/Sentiment**: sentiment 5.0.2 (lightweight sentiment analysis)
- **Testing**: Vitest 1.0.4 (unit/integration) with happy-dom environment

**Key Dependencies**:
- `@react-oauth/google` - Google OAuth integration
- `react-router-dom` - Client-side routing
- `vite-plugin-pwa` - PWA service worker generation

## Essential Commands

### Development
```bash
# Start development server (http://localhost:5173)
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
# Run all tests once
npm test -- --run

# Run tests in watch mode (default)
npm test

# Run specific test file
npm test -- src/utils/streakCalculator.test.ts

# Run tests with coverage report
npm run test:coverage
# Note: Requires @vitest/coverage-v8 to be installed first

# Run tests with UI (if @vitest/ui is installed)
npm test -- --ui
```

### Environment Setup
Create `.env.local` for local development:
```env
VITE_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

**Note**: OAuth tokens are NEVER stored in localStorage - only in memory via tokenManager

## Code Architecture (Implemented)

### Service Layer (`src/services/`)
The app uses a layered architecture with three core services:

1. **storageService** (`storage.ts`) - IndexedDB operations
   - Single source of truth for local data
   - Three object stores: `habits`, `logs`, `metadata`
   - All operations are async, return Promises
   - Handles initialization, CRUD, and bulk operations
   - Methods: `initDB()`, `saveHabit()`, `getHabits()`, `saveLogs()`, `getLogs()`, etc.

2. **syncQueueService** (`syncQueue.ts`) - Offline operation queue
   - Queues operations when offline: `CREATE_HABIT`, `UPDATE_HABIT`, `CREATE_LOG`, `UPDATE_LOG`
   - Stores queue in localStorage (not IndexedDB for simplicity)
   - Deduplicates operations (e.g., multiple updates to same habit collapse into one)
   - Methods: `queueOperation()`, `getQueue()`, `removeOperation()`, `clearQueue()`

3. **syncService** (`syncService.ts`) - Sync coordinator
   - Orchestrates bi-directional sync between IndexedDB and Google Sheets
   - Implements retry logic with exponential backoff (30s, 60s, 120s)
   - Listens to online/offline events
   - Conflict resolution: last-write-wins based on `modified_date` timestamps
   - Methods: `syncToRemote()`, `syncFromRemote()`, `subscribe()` for state updates

4. **googleSheetsService** (`googleSheets.ts`) - Google Sheets API wrapper
   - Creates/finds user's habit tracking spreadsheet
   - Uses batch operations for efficiency
   - Three tabs: Habits, Logs, Metadata
   - Methods: `initializeSheet()`, `saveHabits()`, `getHabits()`, `saveLogs()`, `getLogs()`

5. **authService** (`auth.ts`) - Google OAuth manager
   - Uses `@react-oauth/google` for OAuth flow
   - Token storage: in-memory only via `tokenManager.ts`
   - Scopes: `drive.file` (most restrictive), `userinfo.profile`
   - Methods: `initAuth()`, `signIn()`, `signOut()`, `getAccessToken()`

### Component Structure (`src/components/`)
**Reusable UI Components**:
- `ToggleSwitch.tsx` - Accessible toggle for habit logging (44x44px min, keyboard navigable)
- `DateNavigator.tsx` - Date picker for navigating up to 5 days in past
- `HabitForm.tsx` - Add/edit habit form with validation and character counters
- `HabitListItem.tsx` - Habit card with edit/delete actions
- `ProgressCard.tsx` - Expandable card showing streaks, percentages, pattern analysis
- `NotesHistory.tsx` - Chronological display of notes with timestamps
- `EmptyState.tsx` - Placeholder UI when no data exists
- `ProtectedRoute.tsx` - Route guard requiring authentication

### Pages (`src/pages/`)
**Main Views** (all wrapped in ProtectedRoute except Welcome):
- `WelcomePage.tsx` - Landing page with Google sign-in
- `ManageHabitsPage.tsx` - CRUD interface for habits
- `DailyLogPage.tsx` - Daily logging with toggle switches and shared notes
- `ProgressPage.tsx` - Analytics dashboard with streaks, percentages, pattern analysis

### Utilities (`src/utils/`)
**Pure Functions** (all have corresponding `.test.ts` files):
- `streakCalculator.ts` - Calculates current and longest streaks from log history
- `percentageCalculator.ts` - Computes completion percentage (done/total logged days)
- `notesAnalyzer.ts` - Extracts keywords, sentiment, correlations from notes (requires 7+ entries)
- `dataValidation.ts` - Validates and sanitizes all user inputs (names, categories, dates, notes)
- `uuid.ts` - Generates unique IDs with prefixes (`habit_`, `log_`)
- `dateHelpers.ts` - Date formatting and calculations (uses date-fns)
- `errorHandler.ts` - Centralized error handling and logging
- `tokenManager.ts` - In-memory OAuth token storage (never persisted)

### Routing (`src/router.tsx`)
Uses React Router 6 with these routes:
- `/` - WelcomePage (public)
- `/daily-log` - DailyLogPage (protected, default after login)
- `/progress` - ProgressPage (protected)
- `/manage-habits` - ManageHabitsPage (protected)
- `/privacy` - Privacy Policy (placeholder)
- `/terms` - Terms of Service (placeholder)

### Data Flow Pattern
**Write Operations** (optimistic UI):
1. User action (e.g., toggle habit, edit name)
2. Immediate UI update (optimistic)
3. Write to IndexedDB (`storageService.saveHabit()`)
4. Queue operation (`syncQueueService.queueOperation()`)
5. Background sync to Google Sheets (`syncService.syncToRemote()`)
6. On success: remove from queue; On failure: retry with backoff

**Read Operations**:
1. Always read from IndexedDB (single source of truth)
2. Never read directly from Google Sheets during normal usage
3. Sync from remote only on: app load, manual refresh, or after network reconnection

### Testing Strategy
**Test Organization** (see `TESTING_TASKS_1-6.md`):
- Unit tests colocated: `*.test.ts` next to `*.ts` files
- Test environment: happy-dom (lightweight DOM simulation)
- Setup: `src/test/setup.ts` configures fake-indexeddb
- Coverage target: 85%+ (currently 254/260 tests passing - 97.7%)
- Test utilities: `testHelpers.ts` provides mock data generators

## Google Cloud Setup

Before Task 2.0 (Authentication), you'll need:

1. Create project at console.cloud.google.com
2. Enable APIs: Google Sheets API v4, Google Drive API (minimal)
3. Configure OAuth consent screen with scopes
4. Create OAuth 2.0 client ID for web application
5. Add authorized origins and redirect URIs
6. Set environment variables:
   - `VITE_GOOGLE_CLIENT_ID` (or equivalent for chosen build tool)
   - Note: API key not required - app uses OAuth tokens directly

## Deployment Target

**Google Cloud Platform** (Task 9.0):
- Option A: Cloud Run (containerized, recommended for flexibility)
- Option B: App Engine (simpler for static SPA)
- Must update OAuth authorized origins with production URL
- Requires HTTPS (provided automatically by both options)

## Testing Requirements & Status

**Current Test Status**: 254/260 passing (97.7%)
- **6 known failures**: 4 HabitForm validation tests (timing issues), 2 date validation tests (timezone bugs)
- See `TEST_REPORT_TASKS_1-6.md` for detailed failure analysis

**Unit Tests** (85% coverage target):
- ✅ All services: auth, storage, syncQueue (23+23 tests)
- ✅ All utilities: streakCalculator (21), percentageCalculator (14), notesAnalyzer (14), dataValidation (47), uuid (32), dateHelpers (21)
- ✅ Key components: ToggleSwitch (12), HabitForm (12/16 passing), DateNavigator (10), HabitListItem (9)

**Integration Tests** (TODO - Task 8.0):
- Full auth flow including sheet creation
- Habit CRUD with Google Sheets sync
- Daily logging with notes
- Offline → online sync with conflict resolution

**E2E Tests** (TODO - Task 8.0, critical paths):
- First-time user flow
- Daily logging flow
- Progress view with pattern analysis
- Back-dating (navigate 5 days, log, return to today)
- Offline sync (go offline, make changes, go online, verify sync)

**Accessibility Tests** (TODO - Task 7.0):
- Lighthouse audit (target WCAG 2.1 AA)
- Keyboard-only navigation
- Screen reader compatibility (VoiceOver or NVDA)

**Running Tests**:
```bash
# All tests (watch mode)
npm test

# Single run
npm test -- --run

# Specific file
npm test -- src/utils/streakCalculator.test.ts

# With coverage (requires @vitest/coverage-v8)
npm run test:coverage
```

## Open Questions from PRD

Before implementing certain features, consider these unresolved questions (PRD Section 15):

1. **Notes Analysis**: Third-party NLP library vs. in-house keyword extraction?
2. **Streak Logic**: Should back-dating a missed habit affect current streak?
3. **Performance**: With 1000+ logs, should progress screen use pagination?
4. **Category Management**: Free-form input or suggested categories?

If you encounter these during implementation, document the decision in git commit messages.

## Important Constraints

- **No Backend Server**: This is a pure client-side app; all data in user's Google Drive
- **No Real-time Multi-device Sync**: Out of scope (data in Google Sheets, but app doesn't poll)
- **No Push Notifications**: No reminders or notifications system
- **Single Log Per Day**: Each habit can only be logged once per day (done/not done)

## Current Implementation Status

**Completed Tasks** (as of latest commit):
- ✅ **Task 1.0**: Project Setup & Configuration (Vite, TypeScript, React, PWA)
- ✅ **Task 2.0**: Authentication & Google Integration (OAuth 2.0, token management)
- ✅ **Task 3.0**: Data Layer & Offline Storage (IndexedDB, sync queue, conflict resolution)
- ✅ **Task 4.0**: Core Features - Habit Management (CRUD, validation, soft delete)
- ✅ **Task 5.0**: Core Features - Daily Logging Interface (toggles, date navigation, shared notes)
- ✅ **Task 6.0**: Core Features - Progress & Analytics (streaks, percentages, sentiment analysis)

**In Progress**:
- 🔄 **Task 7.0**: UI/UX & Responsive Design (navigation, footer, accessibility polish)

**Not Started**:
- ⏳ **Task 8.0**: Testing & Quality Assurance (integration tests, E2E tests)
- ⏳ **Task 9.0**: Deployment & Documentation (GCP deployment, user guide)

**Known Issues**:
1. 6 failing tests (4 validation display tests, 2 date validation edge cases) - non-blocking
2. Privacy Policy and Terms of Service pages are placeholders
3. Coverage reporting requires `@vitest/coverage-v8` installation
4. No navigation component yet (Task 7.0)
5. No offline indicator UI (Task 7.0)

**Testing the App Locally**:
1. Start dev server: `npm run dev`
2. Open http://localhost:5173
3. Mock auth bypass (no OAuth setup needed):
   ```javascript
   localStorage.setItem('habitTracker_mockAuth', 'true');
   window.location.href = '/daily-log';
   ```
4. Test habit management at `/manage-habits`
5. Test daily logging at `/daily-log`
6. Test progress analytics at `/progress`

**Comprehensive Testing Guide**: See `TESTING_TASKS_1-6.md` for full manual testing procedures
