# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Habit Tracker Web Application** - a mobile-first Progressive Web App (PWA) that allows users to track daily habits with complete data ownership. All user data is stored in the user's own Google Sheet on Google Drive, not on any backend server.

### Core Architecture

- **Frontend**: Single Page Application (SPA) with client-side routing
- **Authentication**: Google OAuth 2.0 with minimal permissions (spreadsheet access only)
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
- **OAuth Scopes**: `https://www.googleapis.com/auth/spreadsheets` and `userinfo.profile` only
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

## Technology Stack Selection

The PRD allows developer choice for framework. When starting Task 1.0, select one and document it:

**Recommended Stack**:
- Build Tool: Vite (fast, modern, great PWA support)
- Language: TypeScript (type safety for complex sync logic)
- Framework: React or vanilla JavaScript (keep it simple for single-page needs)
- Date Library: date-fns or day.js (small, immutable)
- NLP: compromise.js or ml-sentiment (lightweight sentiment analysis)
- Testing: Vitest (unit/integration), Playwright (E2E)

**After Selection**: Update task list and create `package.json` as first step of Task 1.0

## Google Cloud Setup

Before Task 2.0 (Authentication), you'll need:

1. Create project at console.cloud.google.com
2. Enable APIs: Google Sheets API v4, Google Drive API (minimal)
3. Configure OAuth consent screen with scopes
4. Create OAuth 2.0 client ID for web application
5. Add authorized origins and redirect URIs
6. Set environment variables:
   - `VITE_GOOGLE_CLIENT_ID` (or equivalent for chosen build tool)
   - `VITE_GOOGLE_API_KEY`

## Deployment Target

**Google Cloud Platform** (Task 9.0):
- Option A: Cloud Run (containerized, recommended for flexibility)
- Option B: App Engine (simpler for static SPA)
- Must update OAuth authorized origins with production URL
- Requires HTTPS (provided automatically by both options)

## Testing Requirements

**Unit Tests** (Task 8.0, 85% coverage target):
- All services: auth, storage, sync, googleSheets
- All utilities: streakCalculator, percentageCalculator, notesAnalyzer, dataValidation
- Key components: ToggleSwitch, HabitForm, DateNavigator, ProgressCard

**Integration Tests**:
- Full auth flow including sheet creation
- Habit CRUD with Google Sheets sync
- Daily logging with notes
- Offline → online sync with conflict resolution

**E2E Tests** (critical paths):
- First-time user flow
- Daily logging flow
- Progress view with pattern analysis
- Back-dating (navigate 5 days, log, return to today)
- Offline sync (go offline, make changes, go online, verify sync)

**Accessibility Tests**:
- Lighthouse audit (target WCAG 2.1 AA)
- Keyboard-only navigation
- Screen reader compatibility (VoiceOver or NVDA)

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
