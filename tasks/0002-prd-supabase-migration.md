# PRD 0002: Supabase Database Migration

**Feature Name**: Migrate from Google Sheets to Supabase PostgreSQL
**PRD Number**: 0002
**Author**: System Generated from Migration Plan
**Date Created**: 2025-10-14
**Status**: Draft
**Priority**: P1 (High Priority)
**Target Release**: TBD

---

## 1. Introduction/Overview

### Problem Statement
The Habit Tracker application currently uses Google Sheets as its remote data storage layer. Before launching to users, we need to address significant performance and scalability limitations:

- **Slow sync operations**: 2-5 seconds per sync operation
- **Rate limiting**: 100 requests per 100 seconds per user
- **No transactions**: Cannot perform atomic operations
- **Manual security**: Requires client-side user_id filtering
- **No real-time sync**: Multi-device sync requires manual refresh
- **Limited querying**: All operations require array filtering in JavaScript

### Solution
Replace Google Sheets with Supabase PostgreSQL before launch while maintaining the existing offline-first architecture. This will improve performance 5-10x, add real-time multi-device sync, simplify authentication, and provide enterprise-grade security through Row-Level Security (RLS).

**Key Advantage**: With zero current users, we can make this architectural change cleanly without data migration complexity or backward compatibility concerns.

### Goal
Complete a production-ready backend replacement that:
1. Improves sync performance from 2-5 seconds to <500ms
2. Maintains 100% offline functionality (IndexedDB local cache)
3. Adds real-time multi-device synchronization
4. Reduces codebase complexity (net -100 lines of code)
5. Keeps cost at $0/month for <1000 users
6. Launches with proper database from day one

---

## 2. Goals

### Primary Goals
1. **Performance Improvement**: Reduce sync latency from 2-5s to <500ms (5-10x faster)
2. **Feature Parity**: Maintain all existing functionality (offline-first, optimistic UI, conflict resolution)
3. **Enhanced Security**: Implement Row-Level Security (RLS) for automatic user data isolation
4. **Cost Efficiency**: Stay within free tier ($0/month) for <1000 users
5. **Pre-Launch Completion**: Deploy with proper database before first user signs up

### Secondary Goals
6. **Real-time Sync**: Add real-time multi-device synchronization (bonus feature)
7. **Code Simplification**: Reduce codebase by ~100 lines (delete 571, add 470)
8. **Improved Authentication**: Simplify auth implementation using Supabase Auth
9. **Scalability**: Support 10,000+ users without performance degradation
10. **Maintainability**: Reduce technical debt by replacing Google Sheets workarounds

### Success Metrics
- Sync latency measured at <500ms (target) vs 2-5s (baseline)
- Zero increase in error rates post-implementation
- All 254 existing tests continue passing (with updated mocks)
- Ready for production launch with first user

---

## 3. User Stories

### As a new user
1. **US-001**: As a new user, I want fast sync times (<500ms) so that my changes appear immediately across devices
2. **US-002**: As a new user, I want seamless offline functionality so that I can log habits without internet connection
3. **US-003**: As a new user, I want secure authentication via Google OAuth so that I can trust my data is protected
4. **US-004**: As a new user, I want data isolated from other users so that my habits remain private

### As a developer
5. **US-005**: As a developer, I want to replace Google Sheets API calls with Supabase SDK calls so that code is simpler and more maintainable
6. **US-006**: As a developer, I want Row-Level Security policies so that I don't have to manually filter data by user_id
7. **US-007**: As a developer, I want clean implementation without backward compatibility so that the codebase is simpler
8. **US-008**: As a developer, I want comprehensive tests so that the new backend is production-ready

### As a product owner
9. **US-009**: As a product owner, I want cost to remain $0 for small user bases so that the product remains economically viable
10. **US-010**: As a product owner, I want real-time sync capabilities so that we can offer multi-device collaboration from launch
11. **US-011**: As a product owner, I want to launch with proper infrastructure so that we don't need to migrate users later

---

## 4. Functional Requirements

### Phase 1: Supabase Infrastructure Setup

#### FR-001: Supabase Project Creation
The system must allow the developer to create a Supabase project with:
- Project name: `habit-tracker-prod`
- Database region selection (e.g., `us-east-1`)
- Free tier pricing plan selection
- Automatic provisioning within 2-3 minutes
- Access to Project URL and Anon Key from dashboard

#### FR-002: Database Schema Implementation
The system must create the following PostgreSQL tables:

**habits table**:
- `habit_id` (TEXT, PRIMARY KEY)
- `user_id` (UUID, FOREIGN KEY to auth.users)
- `name` (TEXT, 1-100 characters, NOT NULL)
- `category` (TEXT, optional)
- `status` (TEXT, CHECK: 'active' or 'inactive', NOT NULL)
- `created_date` (DATE, NOT NULL)
- `modified_date` (DATE, NOT NULL)
- Indexes: `user_id`, `(user_id, status)`, `created_date`

**logs table**:
- `log_id` (TEXT, PRIMARY KEY)
- `habit_id` (TEXT, FOREIGN KEY to habits, CASCADE DELETE)
- `date` (DATE, NOT NULL)
- `status` (TEXT, CHECK: 'done', 'not_done', or 'no_data', NOT NULL)
- `notes` (TEXT, max 5000 characters, optional)
- `timestamp` (TIMESTAMPTZ, NOT NULL)
- UNIQUE constraint: `(habit_id, date)` - one log per habit per day
- Indexes: `habit_id`, `date`, `timestamp`, unique index on `(habit_id, date)`

**metadata table**:
- `user_id` (UUID, PRIMARY KEY, FOREIGN KEY to auth.users)
- `last_sync` (TIMESTAMPTZ, NOT NULL)
- `db_version` (TEXT, NOT NULL, default '1.0')

#### FR-003: Row-Level Security (RLS) Policies
The system must implement RLS policies that:
- **Habits SELECT**: Users can only view their own habits (`auth.uid() = user_id`)
- **Habits INSERT**: Users can only insert habits with their own user_id
- **Habits UPDATE**: Users can only update their own habits
- **Habits DELETE**: Blocked (soft delete via status='inactive' only)
- **Logs SELECT**: Users can only view logs for their own habits
- **Logs INSERT/UPDATE/DELETE**: Users can only modify logs for their own habits
- **Metadata**: Users can only view/modify their own metadata

#### FR-004: Database Triggers
The system must implement automatic triggers for:
- Auto-update `modified_date` on habit UPDATE operations
- Auto-create metadata row when new user signs up (via auth.users INSERT trigger)

#### FR-005: Google OAuth Configuration
The system must configure Supabase Auth with:
- Google OAuth provider enabled
- Google Cloud OAuth Client ID and Secret configured
- Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
- Redirect to `/daily-log` after successful authentication

### Phase 2: Frontend Dependencies

#### FR-006: Supabase SDK Installation
The system must install `@supabase/supabase-js` npm package as a dependency

#### FR-007: Environment Variables
The system must configure environment variables:
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (public)
- Remove/deprecate: `VITE_GOOGLE_CLIENT_ID` (no longer needed)

#### FR-008: TypeScript Type Definitions
The system must create TypeScript types matching database schema:
- `Database` interface with `public.Tables` definitions
- `Row`, `Insert`, `Update` types for each table
- Type safety for all database operations

### Phase 3: Authentication Migration

#### FR-009: Supabase Client Initialization
The system must create a Supabase client singleton with:
- Auto-refresh token enabled
- Persistent session storage (localStorage)
- Session detection from URL (OAuth redirect)
- Type-safe database operations via TypeScript generics

#### FR-010: Authentication Service Replacement
The system must replace `src/services/auth.ts` with Supabase Auth implementation:
- `initAuth()`: Initialize auth and set up auth state listener
- `login()`: Initiate Google OAuth flow via Supabase (redirect to Google consent)
- `logout()`: Sign out user and clear session
- `isAuthenticated()`: Check if valid session exists
- `getUserProfile()`: Return user profile (id, email, name, picture)
- `getUserId()`: Return current user ID
- `getAccessToken()`: Return session access token (for future use)

#### FR-011: Token Management Removal
The system must delete `src/utils/tokenManager.ts` as Supabase SDK handles token management automatically

#### FR-012: Protected Route Update
The system must update `ProtectedRoute` component to:
- Check auth state via `supabase.auth.getSession()`
- Listen to auth state changes via `supabase.auth.onAuthStateChange()`
- Show loading state while checking authentication
- Redirect to welcome page if not authenticated
- Render protected content with Layout wrapper if authenticated

### Phase 4: Data Layer Migration

#### FR-013: Supabase Data Service Creation
The system must create `src/services/supabaseDataService.ts` with CRUD operations:

**Habits Operations**:
- `getHabits(activeOnly?)`: Fetch all habits for authenticated user (optionally filter by status)
- `getHabit(habitId)`: Fetch single habit by ID
- `createHabit(habit)`: Insert new habit with user_id auto-injected
- `updateHabit(habit)`: Update existing habit
- `deleteHabit(habitId)`: Soft delete (mark as inactive)

**Logs Operations**:
- `getLogs(habitId?, date?)`: Fetch logs with optional filters
- `createLog(log)`: Insert new log entry
- `updateLog(log)`: Update existing log
- `deleteLog(logId)`: Delete log entry

**Metadata Operations**:
- `getMetadata()`: Fetch metadata for authenticated user
- `updateMetadata(metadata)`: Upsert metadata

**Real-time Subscriptions** (Bonus Feature):
- `subscribeToHabits(callback)`: Subscribe to real-time habit changes
- `subscribeToLogs(callback)`: Subscribe to real-time log changes

#### FR-014: Sync Service Update
The system must update `src/services/syncService.ts` to:
- Replace `googleSheetsService` imports with `supabaseDataService`
- Update `syncFromRemote()` to call `supabaseData.getHabits()`, `getLogs()`, `getMetadata()`
- Update `processOperation()` to use individual CRUD operations instead of bulk read-filter-write:
  - CREATE habit: `await supabaseData.createHabit(data)`
  - UPDATE habit: `await supabaseData.updateHabit(data)`
  - DELETE habit: `await supabaseData.deleteHabit(data.habit_id)`
  - CREATE log: `await supabaseData.createLog(data)`
  - UPDATE log: `await supabaseData.updateLog(data)`
  - DELETE log: `await supabaseData.deleteLog(data.log_id)`
  - UPDATE metadata: `await supabaseData.updateMetadata(data)`

#### FR-015: Sync Queue Preservation
The system must keep `src/services/syncQueue.ts` unchanged (sync queue logic remains identical)

#### FR-016: Local Storage Preservation
The system must keep `src/services/storage.ts` unchanged (IndexedDB remains the local cache)

### Phase 5: Component Updates

#### FR-017: Welcome Page Update
The system must update `WelcomePage.tsx` to:
- Call `login()` from updated auth service
- Remove manual navigation (Supabase redirects automatically)
- Handle OAuth redirect flow

#### FR-018: Navigation Component Update
The system must update `Navigation.tsx` to:
- Call `logout()` from updated auth service
- Display user profile from `getUserProfile()`

#### FR-019: Component Compatibility
The system must ensure all existing components work without changes due to preserved auth service API

### Phase 6: Testing

#### FR-022: Authentication Testing
The system must verify:
- Google OAuth sign-in works and redirects to `/daily-log`
- User profile displays correctly
- Sign-out works
- Session persists across page refreshes

#### FR-023: Data Operations Testing
The system must verify:
- Create, read, update, delete operations work for habits
- Create, read, update, delete operations work for logs
- Only user's own data is visible (RLS working)
- Multi-user isolation (User A cannot see User B's data)

#### FR-024: Offline Functionality Testing
The system must verify:
- App works offline (reads from IndexedDB)
- Offline changes are queued in sync queue
- Reconnecting triggers automatic sync
- Queued operations are processed successfully
- Changes appear in Supabase after sync

#### FR-025: Multi-Device Sync Testing
The system must verify:
- Changes on Device A appear on Device B (after refresh or real-time)
- Concurrent changes trigger conflict resolution (last-write-wins)

#### FR-026: Performance Testing
The system must measure:
- Sync latency: <500ms target (vs 2-5s baseline)
- Query performance: <10ms for indexed queries
- Test with various data sizes: 10 habits, 50 habits, 100 habits; 100 logs, 1000 logs, 10,000 logs

#### FR-027: Existing Test Suite
The system must ensure:
- Run `npm test -- --run`
- 254 existing tests continue passing
- Update auth tests with Supabase mocks
- Update sync tests with Supabase mocks

### Phase 7: Deployment

#### FR-028: Production Environment Setup
The system must:
- Set production environment variables in hosting platform
- Build production bundle: `npm run build`
- Deploy to hosting (Google Cloud Run, Vercel, Netlify, etc.)

#### FR-029: OAuth Configuration Update
The system must:
- Add production domain to Google Cloud OAuth redirect URIs
- Keep Supabase callback URI configured
- Test OAuth flow in production environment

#### FR-030: Monitoring Setup
The system must monitor:
- Authentication success rate
- Sync latency (target: <500ms)
- Error rates in Supabase dashboard logs

### Phase 8: Cleanup

#### FR-031: Legacy Code Removal
The system must delete Google Sheets implementation:
- `src/services/googleSheets.ts` (571 lines)
- `src/utils/tokenManager.ts` (if not already deleted)
- Remove old environment variables from documentation

#### FR-032: Documentation Updates
The system must update:
- `CLAUDE.md` with new architecture (Supabase instead of Google Sheets)
- `README.md` with Supabase setup instructions
- Environment variable documentation
- Architecture diagrams

---

## 5. Non-Goals (Out of Scope)

### NG-001: User Data Ownership
**Out of scope**: Maintaining user data in their Google Drive. Data will be stored on Supabase servers. This is an explicit trade-off for performance and features.

### NG-002: Backward Compatibility with Google Sheets
**Out of scope**: Supporting Google Sheets as a fallback option. Implementation is Supabase-only from launch.

### NG-003: Real-time Collaboration Features
**Out of scope**: Multi-user real-time collaboration within the same habit tracker. Real-time sync is for single user across multiple devices only.

### NG-004: Advanced Analytics in Database
**Out of scope**: Moving analytics calculations (streaks, percentages) to database stored procedures. These remain client-side calculations.

### NG-005: Data Export Features
**Out of scope**: Data export functionality at launch. Users can request manual exports if needed (future feature).

### NG-006: Self-Hosted Supabase
**Out of scope**: Setting up self-hosted Supabase instance. Use managed Supabase Cloud for launch.

### NG-007: GraphQL API
**Out of scope**: Creating GraphQL API layer. Use Supabase REST API via JavaScript SDK.

### NG-008: Serverless Functions
**Out of scope**: Creating custom Supabase Edge Functions. Use built-in database triggers only.

---

## 6. Technical Considerations

### Technology Stack

**Current Stack** (Preserved):
- **Frontend Framework**: React 18.2 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router 6.20
- **Local Storage**: IndexedDB via custom storageService
- **Offline Queue**: localStorage via syncQueue
- **Date Library**: date-fns 2.30.0
- **Testing**: Vitest 1.0.4 with happy-dom

**New Dependencies**:
- **Database SDK**: `@supabase/supabase-js` (^2.x)
- **Backend Database**: Supabase PostgreSQL (managed service)
- **Authentication**: Supabase Auth with Google OAuth

**Removed Dependencies**:
- **Google APIs**: Google Sheets API v4 (deprecated)
- **Google Auth**: Google Identity Services (replaced by Supabase Auth)

### Architecture Decisions

#### AD-001: Maintain Offline-First Architecture
**Decision**: Keep IndexedDB as local cache and single source of truth during active usage.
**Rationale**: Existing offline-first architecture is battle-tested. Supabase replaces only the remote storage layer.

#### AD-002: Use Supabase SDK Directly (No Backend Proxy)
**Decision**: Frontend calls Supabase REST API directly via JavaScript SDK.
**Rationale**: Supabase provides Row-Level Security, eliminating need for custom auth proxy. Reduces complexity.

#### AD-003: Keep Sync Queue Logic
**Decision**: Preserve existing sync queue and retry logic.
**Rationale**: Sync queue handles offline operations and network failures. Changing this increases migration risk.

#### AD-004: Replace Bulk Operations with CRUD
**Decision**: Replace Google Sheets bulk read-filter-write operations with individual CRUD calls.
**Rationale**: Supabase supports atomic operations. This simplifies code and improves performance.

#### AD-005: Soft Delete for Habits
**Decision**: Maintain soft delete pattern (mark as `status='inactive'`).
**Rationale**: Preserves historical data and log integrity. Aligns with existing PRD requirement.

#### AD-006: Text-based IDs Instead of UUIDs
**Decision**: Keep existing text-based IDs (`habit_id`, `log_id`) as TEXT type in PostgreSQL.
**Rationale**: Maintains compatibility with existing data. Frontend generates IDs using `uuid.ts` utility.

#### AD-007: ISO 8601 Date Format
**Decision**: Store dates as TEXT in ISO 8601 format (YYYY-MM-DD) instead of native PostgreSQL DATE.
**Rationale**: Avoids timezone conversion issues and maintains compatibility with existing frontend code.

### Dependencies and Integration

**External Services**:
1. **Supabase Cloud** (supabase.com)
   - PostgreSQL database (managed)
   - Authentication service
   - Real-time subscriptions
   - Dashboard for monitoring

2. **Google Cloud Platform**
   - OAuth 2.0 Client ID and Secret
   - Authorized redirect URIs

**Internal Services**:
- All existing services remain (`storage.ts`, `syncQueue.ts`, utilities)
- Only `googleSheets.ts` and `auth.ts` are replaced
- `syncService.ts` is modified but not replaced

### Database Indexes

**Performance-Critical Indexes**:
1. `idx_habits_user_id`: Fast user habit lookups
2. `idx_habits_user_status`: Filter active/inactive habits per user
3. `idx_logs_habit_id`: Fast log lookups per habit
4. `idx_logs_date`: Date-based log queries
5. `idx_logs_habit_date_unique`: Enforce one log per habit per day

**Expected Query Performance**:
- Get user's active habits: <10ms (indexed by `user_id, status`)
- Get logs for habit: <10ms (indexed by `habit_id`)
- Get logs for date: <10ms (indexed by `date`)
- Insert/update operations: <50ms

### Conflict Resolution Strategy

**Last-Write-Wins (Unchanged)**:
- Compare `modified_date` (habits) or `timestamp` (logs)
- Keep record with most recent timestamp
- Implemented in `syncService.ts` `resolveConflicts()` method

**Conflict Scenarios**:
1. User edits habit on Device A while offline
2. User edits same habit on Device B
3. Device A comes online first → writes to Supabase
4. Device B comes online → syncService compares timestamps → overwrites if Device B's timestamp is newer

---

## 7. Performance Requirements

### PR-001: Sync Latency
- **Target**: <500ms for sync operations (5-10x improvement over 2-5s baseline)
- **Measurement**: Time from API call initiation to response received
- **Test Conditions**: 10 habits, 100 logs per user, average network latency

### PR-002: Query Performance
- **Target**: <10ms for indexed database queries
- **Measurement**: PostgreSQL query execution time (via Supabase dashboard)
- **Test Conditions**: Queries on `user_id`, `habit_id`, `date` indexes

### PR-003: Initial Load Time
- **Target**: <3 seconds on 4G network (unchanged from baseline)
- **Measurement**: Time to interactive on DailyLogPage after authentication
- **Test Conditions**: Cold start with empty IndexedDB cache

### PR-004: Offline Operation Performance
- **Target**: Instant (<100ms) for writes to IndexedDB (unchanged)
- **Measurement**: Time from user action to UI update
- **Test Conditions**: Toggle habit status while offline

### PR-005: Batch Migration Performance
- **Target**: Migrate 1000 users in <2 hours
- **Measurement**: Total time for migration script to process all users
- **Test Conditions**: Each user has average 10 habits, 100 logs

### PR-006: Scalability
- **Target**: Support 10,000 active users without degradation
- **Capacity**: 500 MB database storage = ~50,000 users (10 KB per user)
- **Free Tier Limit**: 1,000-2,000 active users before upgrade needed

### PR-007: Availability
- **Target**: 99.9% uptime (Supabase SLA)
- **Measurement**: Supabase status page monitoring
- **Fallback**: App continues working offline; sync resumes when service returns

---

## 8. Security & Compliance

### SC-001: Row-Level Security (RLS)
- **Implementation**: PostgreSQL RLS policies on all tables
- **Enforcement**: Database-level (cannot be bypassed by client)
- **Validation**: Users cannot query or modify other users' data
- **Testing**: Multi-account testing to verify data isolation

### SC-002: Authentication
- **Method**: Google OAuth 2.0 via Supabase Auth
- **Token Storage**: Session stored in localStorage (managed by Supabase SDK)
- **Token Refresh**: Automatic token refresh via Supabase SDK
- **Session Expiry**: Configurable via Supabase dashboard (default: 1 week)

### SC-003: Authorization
- **Habits**: Users can CRUD only their own habits (enforced by RLS)
- **Logs**: Users can CRUD only logs for their own habits (enforced by RLS)
- **Metadata**: Users can CRUD only their own metadata (enforced by RLS)

### SC-004: Data Encryption
- **In Transit**: HTTPS/TLS for all API calls (enforced by Supabase)
- **At Rest**: PostgreSQL database encryption (Supabase managed)
- **Client Storage**: IndexedDB not encrypted (same as current implementation)

### SC-005: API Key Security
- **Anon Key**: Public key for client-side use (safe to expose)
- **Service Key**: Admin key for migration script (never exposed to client)
- **Environment Variables**: Keys stored in `.env.local` (gitignored)

### SC-006: OAuth Scopes
- **Required Scopes**: Google profile and email only
- **Removed Scopes**: Google Drive access no longer needed (data not in Drive)
- **Consent Screen**: Users consent to "Sign in with Google" only

### SC-007: Data Privacy
- **User Data Ownership**: Data moves from user's Google Drive to Supabase servers (trade-off)
- **GDPR Compliance**: Supabase is GDPR-compliant (hosted in EU regions if needed)
- **Data Deletion**: Users can request account deletion (requires manual process)
- **Data Export**: Users can export data as JSON/CSV (future feature)

### SC-008: SQL Injection Prevention
- **Parameterized Queries**: All queries use Supabase SDK with parameterized inputs
- **Input Validation**: Existing validation in `dataValidation.ts` remains active
- **Database Constraints**: CHECK constraints on enum fields (status, log status)

### SC-009: Rate Limiting
- **Supabase Limits**: Effectively unlimited for free tier (no hard rate limits)
- **Removed Limits**: Google Sheets 100 req/100s/user limit no longer applies

---

## 9. Data Requirements

### Data Models

#### Habit Entity
```typescript
interface Habit {
  habit_id: string;        // UUID format, e.g., "habit_abc123"
  user_id: string;         // Supabase auth.users UUID (injected by service)
  name: string;            // 1-100 characters
  category?: string;       // Optional category
  status: 'active' | 'inactive';  // Default 'active', soft delete
  created_date: string;    // ISO 8601 date (YYYY-MM-DD)
  modified_date: string;   // ISO 8601 date, auto-updated by trigger
}
```

#### LogEntry Entity
```typescript
interface LogEntry {
  log_id: string;          // UUID format, e.g., "log_xyz789"
  habit_id: string;        // Foreign key to habits.habit_id
  date: string;            // ISO 8601 date (YYYY-MM-DD)
  status: 'done' | 'not_done' | 'no_data';  // Completion status
  notes?: string;          // Optional, max 5000 characters
  timestamp: string;       // ISO 8601 datetime with timezone
}
```

#### Metadata Entity
```typescript
interface Metadata {
  user_id: string;         // Supabase auth.users UUID (primary key)
  last_sync: string;       // ISO 8601 datetime with timezone
  db_version: string;      // Schema version, e.g., "1.0"
}
```

### Data Storage

**PostgreSQL Database** (Supabase managed):
- **Location**: Configurable region (e.g., us-east-1, eu-central-1)
- **Replication**: Automatic backups (point-in-time recovery)
- **Backup Frequency**: Continuous (Supabase managed)
- **Backup Retention**: 7 days on free tier, 30 days on Pro tier

**IndexedDB Cache** (Client-side, unchanged):
- **Location**: Browser local storage
- **Purpose**: Offline-first cache and single source of truth during active usage
- **Storage Limit**: ~50 MB typical (browser-dependent)
- **Persistence**: Persists across browser sessions

### Data Flow

**Write Operations** (Optimistic UI):
```
User Action → Component State Update (optimistic)
           → storage.saveHabit() (IndexedDB)
           → syncQueue.addToQueue(CREATE_HABIT)
           → syncService.syncToRemote() (background)
           → supabaseData.createHabit() (Supabase)
```

**Read Operations** (Local-first):
```
Component Mount → storage.getHabits() (IndexedDB)
               → Display immediately
               → syncService.syncFromRemote() (background)
               → supabaseData.getHabits() (Supabase)
               → storage.saveHabits() (update IndexedDB)
               → Component re-renders if data changed
```

**Sync Conflict Resolution**:
```
syncFromRemote() → Get local data (IndexedDB)
                → Get remote data (Supabase)
                → resolveConflicts(local, remote) (compare timestamps)
                → saveResolvedData(IndexedDB)
```

---

## 10. Design Considerations

### UI/UX Requirements

#### DC-001: No Visual Changes
- **Requirement**: Backend replacement should be transparent (no UI changes)
- **Rationale**: Focus on backend improvement, not feature changes
- **Exception**: May add "Syncing..." indicator with faster animation

#### DC-002: Initial Authentication Flow
- **Requirement**: New users authenticate via Google OAuth
- **Flow**:
  1. User visits app for first time
  2. See WelcomePage
  3. Click "Sign in with Google"
  4. Google consent screen (Supabase OAuth)
  5. Redirect back to app at `/daily-log`
  6. Start tracking habits immediately

#### DC-003: Loading States
- **Requirement**: Preserve existing loading states
- **Components**: ProtectedRoute shows "Loading..." while checking auth
- **Sync Indicator**: Existing SyncIndicator component works unchanged

### Accessibility

#### AC-001: No Accessibility Impact
- **Requirement**: Migration must not affect accessibility compliance
- **Testing**: Run existing accessibility tests (Lighthouse audit)
- **Target**: Maintain WCAG 2.1 AA compliance

### Responsive Design

#### AC-002: No Responsive Design Impact
- **Requirement**: All existing responsive breakpoints preserved
- **Testing**: Test on mobile (320px), tablet (768px), desktop (1200px)

---

## 11. User Experience Flow

### First-Time User (Launch)

1. **Visit App**:
   - User opens app URL
   - ProtectedRoute checks auth → no valid session

2. **Welcome Page**:
   - Hero message about habit tracking
   - CTA button: "Sign in with Google"

3. **Google OAuth**:
   - Click button → Supabase initiates OAuth redirect
   - Google consent screen (profile + email)
   - User approves

4. **OAuth Callback**:
   - Google redirects to Supabase callback URL
   - Supabase creates session and user record
   - Supabase redirects to `/daily-log`

5. **Start Fresh**:
   - ProtectedRoute verifies session
   - DailyLogPage loads (empty state)
   - User adds first habits
   - User starts logging

6. **Normal Usage**:
   - User logs habits daily
   - Changes sync in <500ms
   - Offline functionality works seamlessly

### Returning User Daily Flow

1. **Open App**:
   - Session persists in localStorage
   - ProtectedRoute validates session
   - Immediate access to DailyLogPage

2. **View Habits**:
   - IndexedDB cache loads instantly
   - Background sync fetches latest from Supabase
   - Updates appear if changes from another device

3. **Log Habit**:
   - Toggle switch → optimistic UI update
   - Write to IndexedDB (instant)
   - Queue operation
   - Background sync to Supabase (<500ms)
   - SyncIndicator shows success

4. **Go Offline**:
   - Airplane mode or no WiFi
   - All reads from IndexedDB (instant)
   - All writes queued in syncQueue
   - No sync errors (app works normally)

5. **Reconnect**:
   - WiFi returns
   - syncService detects online event
   - Processes sync queue
   - All queued changes sync to Supabase
   - SyncIndicator shows success

---

## 12. Error Handling

### EH-001: Authentication Errors

**Error Scenarios**:
1. User denies Google OAuth consent
2. OAuth redirect fails (network error)
3. Invalid session token
4. Session expired

**Handling**:
- Display error message: "Sign in failed. Please try again."
- Log error to console: `[Auth] Login error: <error message>`
- Redirect to WelcomePage
- Provide "Try Again" button

### EH-002: Database Connection Errors

**Error Scenarios**:
1. Supabase service down
2. Network timeout
3. Database query error
4. RLS policy blocks operation

**Handling**:
- syncService catches error
- Add operation to retry queue
- Display error: "Sync failed. Will retry automatically."
- Retry with exponential backoff: 30s, 60s, 120s
- If max retries exceeded: Display "Sync failed. Please check your connection."

### EH-003: Validation Errors

**Error Scenarios**:
1. Habit name too long (>100 chars)
2. Notes too long (>5000 chars)
3. Invalid date format
4. Duplicate habit name (case-insensitive)

**Handling**:
- Validation runs in `dataValidation.ts` before Supabase call
- Display error inline: "Habit name must be 1-100 characters"
- Prevent form submission
- No data sent to Supabase

### EH-004: Offline Errors

**Error Scenarios**:
1. User is offline but tries to sync manually
2. Sync queue grows large (>100 operations)
3. IndexedDB quota exceeded

**Handling**:
- Offline: Display "You're offline. Changes will sync when online."
- Large queue: Display "Syncing <count> changes..."
- Quota exceeded: Display "Local storage full. Please clear old data."

### EH-005: Conflict Errors

**Error Scenarios**:
1. User edits same habit on two devices while offline
2. Concurrent updates with same timestamp

**Handling**:
- Conflict resolution runs in syncService.resolveConflicts()
- Last-write-wins strategy (compare modified_date/timestamp)
- No user prompt (automatic resolution)
- Log to console: `[Sync] Conflict resolved for habit <id>`

---

## 13. Success Metrics

### Performance Metrics

#### SM-001: Sync Latency Improvement
- **Metric**: Average sync operation latency
- **Baseline**: 2-5 seconds (Google Sheets)
- **Target**: <500ms (Supabase)
- **Measurement**: Instrumentation in syncService.ts
- **Success Criteria**: 90% of sync operations complete in <500ms

#### SM-002: Query Performance
- **Metric**: Database query execution time
- **Target**: <10ms for indexed queries
- **Measurement**: Supabase dashboard performance tab
- **Success Criteria**: 95% of queries complete in <10ms

#### SM-003: Initial Load Time
- **Metric**: Time to interactive on DailyLogPage
- **Baseline**: <3 seconds (current)
- **Target**: <3 seconds (maintained)
- **Measurement**: Lighthouse performance audit
- **Success Criteria**: No regression in load time

### Reliability Metrics

#### SM-004: Error Rate
- **Metric**: Percentage of API calls resulting in errors
- **Target**: <1%
- **Measurement**: Supabase logs and frontend error tracking
- **Success Criteria**: Error rate below 1% at launch

#### SM-005: Uptime
- **Metric**: Service availability percentage
- **Target**: 99.9% (Supabase SLA)
- **Measurement**: Supabase status page
- **Success Criteria**: No downtime during launch period

### Launch Readiness Metrics

#### SM-006: Authentication Success Rate
- **Metric**: Percentage of successful OAuth sign-ins
- **Target**: >95%
- **Measurement**: Supabase Auth logs
- **Success Criteria**: OAuth flow works reliably for new users

#### SM-007: First User Experience
- **Metric**: Time from sign-in to first habit logged
- **Target**: <2 minutes
- **Measurement**: User session analytics
- **Success Criteria**: Smooth onboarding flow

### Cost Metrics

#### SM-008: Infrastructure Cost
- **Metric**: Monthly hosting cost
- **Baseline**: $0/month (Google Sheets)
- **Target**: $0/month (<1000 users), $25/month (1000-10,000 users)
- **Measurement**: Supabase billing dashboard
- **Success Criteria**: Stay within free tier for <1000 users

---

## 14. Acceptance Criteria

### AC-001: Database Schema
- [ ] Supabase project created with free tier
- [ ] `habits` table created with correct columns, constraints, and indexes
- [ ] `logs` table created with correct columns, constraints, and indexes
- [ ] `metadata` table created with correct columns, constraints, and indexes
- [ ] RLS policies active on all tables
- [ ] Database triggers configured (auto-update modified_date, auto-create metadata)
- [ ] Schema validated via Supabase Table Editor

### AC-002: Authentication
- [ ] Google OAuth configured in Supabase Auth dashboard
- [ ] `auth.ts` replaced with Supabase implementation
- [ ] User can sign in with Google OAuth
- [ ] Session persists across page refreshes
- [ ] User can sign out successfully
- [ ] ProtectedRoute redirects unauthenticated users to welcome page
- [ ] getUserProfile() returns correct user data

### AC-003: Data Operations
- [ ] `supabaseDataService.ts` created with all CRUD functions
- [ ] createHabit() inserts habit with user_id auto-injected
- [ ] getHabits() returns only authenticated user's habits
- [ ] updateHabit() updates habit successfully
- [ ] deleteHabit() soft deletes (marks as inactive)
- [ ] createLog(), updateLog(), deleteLog() work correctly
- [ ] getMetadata(), updateMetadata() work correctly
- [ ] RLS prevents cross-user data access (verified with multi-account test)

### AC-004: Sync Service
- [ ] syncService.ts updated to use supabaseDataService
- [ ] syncFromRemote() fetches data from Supabase
- [ ] syncToRemote() processes sync queue and writes to Supabase
- [ ] processOperation() uses individual CRUD operations (not bulk)
- [ ] Conflict resolution works (last-write-wins)
- [ ] Retry logic works (exponential backoff)

### AC-005: Offline Functionality
- [ ] App works offline (reads from IndexedDB)
- [ ] Offline writes queued in syncQueue
- [ ] Reconnecting triggers automatic sync
- [ ] Queued operations processed successfully
- [ ] No data loss during offline period

### AC-006: Testing
- [ ] Authentication flow tested (sign in, sign out, session persistence)
- [ ] Data operations tested (CRUD for habits and logs)
- [ ] Offline functionality tested (disconnect WiFi, make changes, reconnect)
- [ ] Multi-device sync tested (changes appear on second device)
- [ ] Performance tested (sync latency <500ms)
- [ ] RLS tested (User A cannot access User B's data)
- [ ] Existing test suite passes (254 tests with updated mocks)

### AC-007: Deployment
- [ ] Production environment variables configured
- [ ] Production build deployed to hosting
- [ ] OAuth redirect URIs updated in Google Cloud Console
- [ ] Production authentication works
- [ ] Production sync works (<500ms latency)
- [ ] No increase in error rates

### AC-008: Documentation
- [ ] CLAUDE.md updated with Supabase architecture
- [ ] README.md updated with Supabase setup instructions
- [ ] Environment variables documented

### AC-009: Code Cleanup
- [ ] `googleSheets.ts` deleted
- [ ] `tokenManager.ts` deleted (if not already removed)
- [ ] Old environment variables removed from documentation

---

## 15. Open Questions

### OQ-001: Real-time Sync Activation
**Question**: Should we activate real-time subscriptions at launch or later?
**Options**:
- A) Activate at launch (default on)
- B) Opt-in feature flag
- C) Delayed activation (after launch stabilizes)
**Recommendation**: Option C (delayed) to ensure basic implementation stability first

### OQ-002: Monitoring Tools
**Question**: What additional monitoring should we set up?
**Options**:
- A) Supabase dashboard only
- B) Add Sentry for error tracking
- C) Add custom analytics for sync latency
- D) All of the above
**Recommendation**: Option D (comprehensive monitoring) for production readiness

### OQ-003: Test User Data
**Question**: Should we create test users with dummy data before production launch?
**Options**:
- A) Yes, create test users in staging environment
- B) Yes, test with personal accounts
- C) No, launch directly to production
**Recommendation**: Option A (staging environment) to validate all functionality

### OQ-004: Database Region Selection
**Question**: Which Supabase region should we deploy to?
**Options**:
- A) us-east-1 (lowest latency for US users)
- B) eu-central-1 (GDPR compliance for EU users)
- C) Both (multi-region setup)
**Recommendation**: Option A initially, expand to multi-region if user base grows internationally

---

## 16. Risks and Mitigation

### Risk 1: Authentication Failures at Launch
**Probability**: Medium
**Impact**: Critical
**Mitigation**:
- Test OAuth flow extensively in staging environment
- Document redirect URI configuration clearly
- Provide clear error messages for auth failures
- Implement retry logic for OAuth token refresh
- Have rollback plan ready

### Risk 2: Performance Regression
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Benchmark sync latency during testing
- Test with various data sizes (10 habits, 100 habits, 10,000 logs)
- Monitor Supabase dashboard for slow queries
- Rollback if sync latency exceeds 1 second (2x target)

### Risk 3: RLS Policy Bugs
**Probability**: Low
**Impact**: Critical (data leak)
**Mitigation**:
- Test RLS with multi-account scenarios
- Attempt to access other users' data directly via Supabase SQL editor
- Code review RLS policies before deployment
- Enable Supabase audit logging

### Risk 4: Cost Overruns
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- Monitor Supabase usage dashboard daily first week
- Set billing alerts at 80% of free tier limits
- Optimize queries to reduce bandwidth
- Plan upgrade to Pro tier ($25/mo) when approaching 500 MB storage

### Risk 5: Supabase Service Outage
**Probability**: Low
**Impact**: Medium
**Mitigation**:
- App continues working offline (IndexedDB cache)
- Monitor Supabase status page (status.supabase.com)
- Communicate downtime to users via in-app banner
- Sync resumes automatically when service returns

### Risk 6: Incomplete Testing
**Probability**: Medium
**Impact**: High
**Mitigation**:
- Create comprehensive test checklist (see FR-022 to FR-027)
- Test in staging environment with realistic test data
- Test with multiple user accounts to validate RLS
- Keep rollback plan ready (revert code + redeploy)

---

## 17. Timeline and Milestones

**Total Estimated Time**: 8-10 days

### Phase 1: Setup (Day 1)
- **Milestone**: Supabase project created and configured
- **Deliverables**:
  - [ ] Supabase project provisioned
  - [ ] Database schema deployed
  - [ ] RLS policies active
  - [ ] Google OAuth configured
  - [ ] Environment variables set
  - [ ] `@supabase/supabase-js` installed
  - [ ] TypeScript types created

### Phase 2: Authentication (Days 2-3)
- **Milestone**: Authentication implemented with Supabase
- **Deliverables**:
  - [ ] `supabaseClient.ts` created
  - [ ] `auth.ts` replaced with Supabase implementation
  - [ ] `tokenManager.ts` deleted
  - [ ] ProtectedRoute updated
  - [ ] Authentication tested in staging

### Phase 3: Data Layer (Days 4-6)
- **Milestone**: Data operations implemented with Supabase
- **Deliverables**:
  - [ ] `supabaseDataService.ts` created with all CRUD functions
  - [ ] `syncService.ts` updated to use Supabase
  - [ ] Real-time subscriptions implemented (optional)
  - [ ] Data operations tested
  - [ ] WelcomePage updated (if needed)
  - [ ] Navigation updated (if needed)

### Phase 4: Testing (Days 7-8)
- **Milestone**: Full testing completed
- **Deliverables**:
  - [ ] Authentication tested (sign in, sign out, session persistence)
  - [ ] Data operations tested (CRUD for habits and logs)
  - [ ] Offline functionality tested (disconnect WiFi, make changes, reconnect)
  - [ ] Multi-device sync tested (changes appear on second device)
  - [ ] Performance benchmarked (sync latency <500ms)
  - [ ] RLS security validated (multi-account test)
  - [ ] Existing test suite passing (254 tests with updated mocks)

### Phase 5: Deployment & Launch (Days 9-10)
- **Milestone**: Production deployment and launch
- **Deliverables**:
  - [ ] Production environment configured
  - [ ] Production build deployed
  - [ ] OAuth redirect URIs updated
  - [ ] Production authentication tested
  - [ ] Production sync tested
  - [ ] Monitoring active
  - [ ] Documentation updated
  - [ ] `googleSheets.ts` deleted
  - [ ] Ready for first users

---

## 18. Dependencies

### External Dependencies
1. **Supabase Cloud Service**
   - Status: Available (supabase.com)
   - Risk: Service outage (low probability, 99.9% uptime SLA)

2. **Google Cloud Platform**
   - OAuth 2.0 Client ID and Secret
   - Status: Already configured for current implementation
   - Risk: OAuth configuration errors (mitigated by testing)

3. **npm Packages**
   - `@supabase/supabase-js` (latest stable version)
   - Status: Stable, actively maintained
   - Risk: Breaking changes in future versions (mitigated by version pinning)

### Internal Dependencies
1. **Existing Codebase**
   - `storage.ts` (IndexedDB service) - must remain unchanged
   - `syncQueue.ts` (sync queue) - must remain unchanged
   - `dataValidation.ts` (validation) - must remain unchanged
   - Risk: Breaking these services breaks entire app

2. **Test Infrastructure**
   - Vitest, happy-dom, fake-indexeddb
   - Status: Already configured
   - Risk: Need to update mocks for Supabase SDK

3. **Deployment Pipeline**
   - Google Cloud Run (or equivalent)
   - Status: Already configured
   - Risk: Need to add Supabase environment variables

---

## 19. Appendices

### Appendix A: Database Schema SQL

See Phase 1, Section 1.2 in main document for complete SQL schema.

### Appendix B: Supabase SDK Usage Examples

**Initialize Client**:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);
```

**Query with RLS**:
```typescript
// Automatically filtered by auth.uid() via RLS
const { data, error } = await supabase
  .from('habits')
  .select('*')
  .eq('status', 'active');
```

**Insert with User ID**:
```typescript
const { data: { user } } = await supabase.auth.getUser();

const { error } = await supabase
  .from('habits')
  .insert({
    habit_id: 'habit_123',
    user_id: user.id,
    name: 'Exercise',
    status: 'active',
    created_date: '2025-01-01',
    modified_date: '2025-01-01'
  });
```

### Appendix C: Testing Checklist

See Phase 6 (FR-022 to FR-027) for complete testing checklist.

### Appendix D: Glossary

- **RLS**: Row-Level Security - PostgreSQL feature enforcing data access policies
- **Supabase**: Open-source Firebase alternative with PostgreSQL backend
- **IndexedDB**: Browser-based client-side database for offline storage
- **PWA**: Progressive Web App - installable web application with offline capabilities
- **OAuth**: Open Authorization - standard for delegated authentication
- **Optimistic UI**: UI pattern updating immediately before server confirmation
- **Sync Queue**: Queue of pending operations to sync when online
- **Last-Write-Wins**: Conflict resolution strategy using timestamps

---

**End of PRD 0002**

*Version: 2.0 - Zero-User Launch Edition*
*Last Updated: 2025-10-14*
*Next Review: Before Phase 1 implementation*
*Major Changes*: Removed all data migration complexity; simplified for pre-launch backend replacement
