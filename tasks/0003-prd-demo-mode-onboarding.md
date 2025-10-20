# Product Requirements Document: Demo Mode Onboarding

**PRD Number:** 0003
**Feature Name:** Demo Mode Onboarding (Shadow Account with Progressive Journey)
**Created:** 2025-10-19
**Status:** Planning Phase
**Primary Success Metric:** Demo → Signup Conversion Rate (Target: 20-30%)
**Estimated Effort:** 14-19 days (2.5-4 weeks for one developer)

---

## Table of Contents

1. [Introduction/Overview](#1-introductionoverview)
2. [Goals](#2-goals)
3. [User Stories](#3-user-stories)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Goals (Out of Scope)](#5-non-goals-out-of-scope)
6. [Technical Considerations](#6-technical-considerations)
7. [Performance Requirements](#7-performance-requirements)
8. [Security & Compliance](#8-security--compliance)
9. [Data Requirements](#9-data-requirements)
10. [Design Considerations](#10-design-considerations)
11. [User Experience Flow](#11-user-experience-flow)
12. [Error Handling](#12-error-handling)
13. [Success Metrics](#13-success-metrics)
14. [Acceptance Criteria](#14-acceptance-criteria)
15. [Open Questions](#15-open-questions)

---

## 1. Introduction/Overview

### Problem Statement

New users face **friction at signup** - they must create an account before understanding the app's value. This signup wall creates abandonment, especially for mobile users who want to "try before committing." Current analytics show that many visitors leave at the welcome page without experiencing the core habit tracking functionality.

### Proposed Solution

Implement a **shadow account onboarding pattern** that allows users to try the Habit Tracker app immediately without signup. Demo users can add habits, log daily activities, and explore the interface. Their data is stored locally in IndexedDB (leveraging the existing offline-first architecture), and seamlessly migrates to a cloud-synced account when they sign up.

### Why This Approach?

1. **Reduces friction**: Users start tracking habits in seconds, not after account creation
2. **Builds emotional investment**: Users invest time adding habits and logging before being asked to sign up
3. **Leverages existing architecture**: Demo data uses IndexedDB; migration calls existing `syncService.fullSync()`
4. **Conversion-optimized**: Triggers signup prompts at moments of high engagement (3+ habits added, first log completed)
5. **Mobile-first**: No heavy onboarding tours - users learn by doing

### Value Proposition Timing

The real "wow" moments aren't immediate - they emerge over time:
- **Day 1**: Complete first daily log session
- **Day 7**: See first 7-day streak
- **After 7+ notes**: Unlock notes analysis feature

This timing supports shadow accounts: conversion triggers align with value realization, not arbitrary time limits.

---

## 2. Goals

### Primary Goal
**Increase signup conversion rate by reducing onboarding friction and building emotional investment before asking users to create accounts.**

### Specific Objectives

1. **Reduce time-to-value**: Users can start tracking habits within 5 seconds of landing on the welcome page (no signup required)

2. **Increase demo adoption**: 60%+ of welcome page visitors click "Try Without Signing In" (higher than current direct signup rate)

3. **Optimize conversion timing**: Trigger signup prompts at moments of peak engagement:
   - After adding 3+ habits (planning mindset)
   - After completing first daily log (execution mindset)
   - When visiting Progress page (analytical mindset)

4. **Ensure seamless data migration**: 99%+ of demo users who sign up have their data successfully migrated to cloud-synced accounts

5. **Maintain data integrity**: Demo data stored locally for 7 days with warnings starting day 5 to encourage signup

6. **Preserve mobile-first experience**: All demo mode UI elements (banners, modals, toasts) optimized for 320px+ screens with 44x44px minimum touch targets

---

## 3. User Stories

### US-1: First-Time Visitor (Quick Start)
**As a** first-time visitor to the Habit Tracker app
**I want to** try the app immediately without creating an account
**So that** I can evaluate if it meets my needs before committing to signup

**Acceptance:**
- Welcome page shows prominent "Try Without Signing In" button
- Clicking button navigates to Daily Log page within 2 seconds
- No account creation or email input required
- Demo mode banner clearly indicates I'm trying the app

### US-2: Demo User (Building Habits)
**As a** demo mode user
**I want to** add multiple habits and see them in my daily log
**So that** I can experience the core functionality without restrictions

**Acceptance:**
- Can add unlimited habits in demo mode (same as authenticated users)
- Habits persist across sessions (stored in IndexedDB)
- See milestone celebrations after adding first habit and 3rd habit
- Conversion modal appears after adding 3rd habit

### US-3: Demo User (Daily Logging)
**As a** demo mode user
**I want to** mark my habits as done/not done and add notes
**So that** I can experience the daily logging workflow

**Acceptance:**
- Toggle switches work identically to authenticated mode
- Can add notes up to 5000 characters
- See milestone toast after completing first log
- Conversion modal appears after first log completion
- Data persists offline in IndexedDB

### US-4: Demo User (Exploring Progress)
**As a** demo mode user
**I want to** visit the Progress page to see what analytics are available
**So that** I can understand the value of signing up

**Acceptance:**
- Progress page shows locked preview with blurred charts
- Clear messaging: "Sign in to unlock streak tracking, trends, and notes analysis"
- Conversion modal appears on first Progress page visit
- "Sign In to Unlock" button navigates to welcome page

### US-5: Demo User (Conversion Journey)
**As a** demo mode user who has built emotional investment
**I want to** be prompted to sign up at the right moment with clear benefits
**So that** I understand why creating an account is valuable

**Acceptance:**
- Conversion modal shows only once per session
- Modal can be dismissed to continue in demo mode
- Clear benefits listed: cloud sync, never lose data, unlock analytics
- "Continue in Demo Mode" option clearly visible

### US-6: Converting User (Data Migration)
**As a** demo user who decides to sign up
**I want to** have all my habits and logs automatically saved to my new account
**So that** I don't lose the progress I've made

**Acceptance:**
- All habits and logs from demo mode appear in authenticated account after signup
- Migration happens automatically in background (no manual export/import)
- Success toast confirms: "Your demo data has been saved"
- If migration fails, show error banner with retry button (don't block authentication)

### US-7: Demo User (Expiry Warning)
**As a** demo user approaching the 7-day expiry
**I want to** be warned that my data will be deleted
**So that** I can sign up before losing my progress

**Acceptance:**
- Warning banner appears starting day 5 (2 days before expiry)
- Banner shows days remaining: "Your demo data will be deleted in X days"
- Banner is visually prominent (⚠️ icon, orange/yellow color scheme)
- "Sign In Now" button navigates to welcome page

### US-8: Demo User (Persistent Reminder)
**As a** demo user focused on tracking habits
**I want to** be gently reminded that I'm in demo mode
**So that** I'm aware of the option to save my data permanently

**Acceptance:**
- Demo banner appears at top of all protected routes
- Banner is non-intrusive but persistent (stays visible, doesn't auto-hide)
- Banner shows: "You're trying Habit Tracker. Sign in to sync across devices."
- Banner includes "Sign In" button

---

## 4. Functional Requirements

### 4.1 Demo Mode Initialization

**REQ-1:** The welcome page MUST display a prominent "Try Without Signing In" button as the primary call-to-action, positioned above the email/password sign-in form.

**REQ-2:** Clicking "Try Without Signing In" MUST initialize demo mode by creating a `DemoMetrics` object in localStorage with default values:
```typescript
{
  demo_start_date: string;          // ISO timestamp
  demo_habits_added: number;        // 0
  demo_logs_completed: number;      // 0
  demo_last_visit: string;          // ISO timestamp
  demo_progress_visits: number;     // 0
  demo_conversion_shown: boolean;   // false
}
```

**REQ-3:** After demo initialization, the user MUST be immediately redirected to `/daily-log` without requiring authentication.

**REQ-4:** Demo mode MUST be detected by checking `!isAuthenticated()` (no Supabase session exists).

### 4.2 Demo Mode Data Storage

**REQ-5:** All demo mode habit and log data MUST be stored in IndexedDB using the existing `storageService`.

**REQ-6:** Demo metrics (engagement tracking) MUST be stored in localStorage at key `habitTracker_demoMetrics`.

**REQ-7:** Shown milestones MUST be tracked in localStorage at key `habitTracker_shownMilestones` to prevent duplicate notifications.

**REQ-8:** Demo data MUST persist across browser sessions (until expiry or manual clearing).

**REQ-9:** Demo data MUST NOT be synced to Supabase (no user_id exists).

### 4.3 Demo Mode UI Components

**REQ-10:** A `<DemoBanner>` component MUST appear at the top of all protected routes when in demo mode, displaying:
- Icon: 📍
- Text: "You're trying Habit Tracker. Sign in to sync across devices."
- Button: "Sign In" (navigates to `/`)

**REQ-11:** The demo banner MUST be sticky (position: sticky, top: 0) with z-index 100 to stay visible during scrolling.

**REQ-12:** The demo banner MUST use a gradient background (purple/blue) to differentiate from normal app UI.

**REQ-13:** An `<ExpiryWarning>` component MUST appear when 2 or fewer days remain in the 7-day demo period, displaying:
- Icon: ⚠️ (pulsing animation)
- Text: "Your demo data will be deleted in X day(s). Sign in to save your progress permanently."
- Button: "Sign In Now" (navigates to `/`)

**REQ-14:** The expiry warning MUST appear above the demo banner with orange/yellow styling to indicate urgency.

### 4.4 Metric Tracking

**REQ-15:** The system MUST track `demo_habits_added` counter, incrementing by 1 each time a habit is created in demo mode.

**REQ-16:** The system MUST track `demo_logs_completed` counter, incrementing by 1 each time logs are saved in demo mode.

**REQ-17:** The system MUST track `demo_progress_visits` counter, incrementing by 1 each time the Progress page is visited.

**REQ-18:** The system MUST update `demo_last_visit` timestamp on every demo metrics update.

**REQ-19:** All metric updates MUST be non-blocking (fire-and-forget) to avoid impacting UI performance.

### 4.5 Conversion Triggers

**REQ-20:** A conversion modal MUST be shown when `demo_habits_added >= 3` for the first time, with messaging:
- Title: "You're building momentum! 🚀"
- Message: "You've added 3 habits. Sign in now to sync your progress across devices and never lose your data."

**REQ-21:** A conversion modal MUST be shown when `demo_logs_completed >= 1` for the first time, with messaging:
- Title: "Great start! 🎉"
- Message: "You've completed your first daily log. Sign in to save your progress and track your streaks over time."

**REQ-22:** A conversion modal MUST be shown when `demo_progress_visits >= 1` for the first time, with messaging:
- Title: "Unlock Your Analytics 📊"
- Message: "See your streaks, completion trends, and notes analysis. Sign in to unlock all progress features."

**REQ-23:** Each conversion modal MUST only be shown once per user (tracked via `demo_conversion_shown` flag).

**REQ-24:** Conversion modals MUST be dismissible by:
- Clicking the X button (top-right corner)
- Clicking outside the modal (on overlay)
- Clicking "Continue in Demo Mode" button

**REQ-25:** Conversion modals MUST include a "Sign In to Save Progress" primary button that navigates to `/`.

**REQ-26:** Conversion modals MUST list benefits of signing up:
- ✓ Cloud sync across all devices
- ✓ Never lose your progress
- ✓ Unlock advanced analytics
- ✓ Track unlimited habits & notes

**REQ-27:** Conversion modals MUST include reassurance text: "Your demo data will be automatically saved when you sign in."

### 4.6 Milestone Celebrations

**REQ-28:** A toast notification MUST appear after the first habit is added, displaying: "✓ Great start! Add 2 more to build your routine."

**REQ-29:** A toast notification MUST appear after the 3rd habit is added, displaying: "🎉 You've added 3 habits! Come back tomorrow to start your streak."

**REQ-30:** A toast notification MUST appear after the first log is completed, displaying: "🎉 First log complete! Come back tomorrow to build your streak."

**REQ-31:** A toast notification MUST appear after 3 days in demo mode, displaying: "📈 You're building momentum! Sign in to unlock streak tracking."

**REQ-32:** Each milestone toast MUST only be shown once per user (tracked in localStorage `habitTracker_shownMilestones`).

**REQ-33:** Toast notifications MUST auto-dismiss after 4 seconds.

**REQ-34:** Toast notifications MUST appear at bottom center of screen (mobile: 80px from bottom to avoid navigation bar).

### 4.7 Locked Progress Preview

**REQ-35:** When in demo mode, the Progress page MUST replace normal analytics with a `<LockedProgressPreview>` component.

**REQ-36:** The locked preview MUST show a blurred fake chart in the background (7 bars with gradient animation).

**REQ-37:** The locked preview MUST display centered content:
- Icon: 🔒
- Title: "Unlock Your Progress Analytics"
- Text: "Sign in to unlock:"
- List:
  - 7-day & 30-day streak tracking
  - Completion trends over time
  - Notes sentiment analysis (after 7+ notes)
  - Pattern discovery and insights
- Button: "Sign In to Unlock"

**REQ-38:** The locked preview background MUST use `filter: blur(8px)` with `opacity: 0.3` to create curiosity.

### 4.8 Demo Data Expiry

**REQ-39:** Demo data MUST expire after 7 days from `demo_start_date`.

**REQ-40:** The system MUST calculate days in demo mode using: `Math.floor((now - demo_start_date) / (1000 * 60 * 60 * 24))`.

**REQ-41:** When demo data expires (≥7 days), the `ProtectedRoute` component MUST:
1. Clear demo metrics from localStorage
2. Clear demo habits and logs from IndexedDB
3. Redirect to `/` (welcome page)

**REQ-42:** The expiry warning banner MUST appear when 2 or fewer days remain.

**REQ-43:** The expiry warning MUST show exact days remaining: "X day" or "X days".

### 4.9 Data Migration Flow

**REQ-44:** When a demo user signs up or logs in, the `auth.ts` service MUST check for existing demo metrics.

**REQ-45:** If demo metrics exist, the system MUST automatically call `demoModeService.migrateDemoData()` after authentication succeeds.

**REQ-46:** The `migrateDemoData()` function MUST call `syncService.fullSync()` to sync IndexedDB data to Supabase.

**REQ-47:** After successful migration, the system MUST:
1. Clear demo metrics from localStorage
2. Set `sessionStorage.setItem('demo_migration_success', 'true')`

**REQ-48:** If migration fails, the system MUST:
1. Log the error to console
2. NOT block authentication (user stays signed in)
3. NOT clear demo metrics (allow retry)

**REQ-49:** On the first authenticated page load, the system MUST check for `demo_migration_success` flag in sessionStorage.

**REQ-50:** If migration success flag exists, a `<MigrationToast>` component MUST appear, displaying:
- Icon: ✓ (green checkmark)
- Title: "Welcome!"
- Message: "Your demo data has been saved. All your habits and logs are now synced to your account."
- Auto-dismiss after 6 seconds

**REQ-51:** The migration success flag MUST be removed from sessionStorage after the toast is shown.

**REQ-52:** If migration fails, an `<ErrorBanner>` component MUST appear with:
- Icon: ⚠️
- Message: "We couldn't sync your demo data automatically."
- Button: "Retry Sync" (calls `syncService.fullSync()`)
- Button: "Dismiss" (hides banner)

### 4.10 Welcome Page Updates

**REQ-53:** The welcome page hero section MUST be updated with progressive journey messaging:
- Title: "Track habits. Build streaks. Own your data."
- Subtitle: "Start today. See progress in a week. Discover patterns in a month."

**REQ-54:** A new "How It Works" section MUST appear after the hero, showing 3 steps:
1. **Today: Add Your Habits** - "Simple toggles to mark done or not done. Works offline."
2. **This Week: See Your Streaks** - "Track consistency over 7+ days. Build momentum."
3. **This Month: Discover Patterns** - "AI analyzes your notes to show what helps you succeed."

**REQ-55:** The "Try Without Signing In" button MUST be the primary CTA, positioned above the email/password form.

**REQ-56:** The email/password sign-in form MUST be wrapped in a collapsible `<details>` element with summary text: "Sign In with Email".

**REQ-57:** A divider with text "or" MUST appear between the demo button and the email form.

### 4.11 Route Protection Updates

**REQ-58:** The `ProtectedRoute` component MUST allow access if EITHER:
- User is authenticated (`isAuthenticated() === true`), OR
- Demo metrics exist in localStorage

**REQ-59:** If neither condition is met, the user MUST be redirected to `/` (welcome page).

**REQ-60:** If demo data has expired (≥7 days), the user MUST be redirected to `/` after clearing demo data.

### 4.12 Layout Updates

**REQ-61:** The `Layout` component MUST conditionally render demo UI elements:
```typescript
{isDemo && <ExpiryWarning />}
{isDemo && <DemoBanner />}
```

**REQ-62:** Demo UI elements MUST appear in this stacking order (top to bottom):
1. OfflineIndicator (if offline)
2. ExpiryWarning (if 2 days or less remain)
3. DemoBanner (always in demo mode)
4. Navigation
5. Main content
6. Footer

---

## 5. Non-Goals (Out of Scope)

### NG-1: Multi-Device Demo Sync
Demo data is stored locally in IndexedDB and does NOT sync across devices before signup. Demo users who switch devices start a new demo session.

**Rationale:** Adding multi-device sync for anonymous users requires complex session management and increases architecture complexity. The migration-on-signup approach is simpler and encourages conversion.

### NG-2: Demo Data Export
Demo users cannot export their data as JSON/CSV before signing up. The only way to preserve demo data is to create an account.

**Rationale:** Export functionality could reduce conversion rates by providing an "escape hatch." We want to encourage signup, not provide alternatives.

### NG-3: Email Capture Before Demo
We do NOT collect email addresses before allowing demo mode. Users can start immediately without providing any information.

**Rationale:** Requesting email defeats the purpose of frictionless onboarding. Post-MVP, we may A/B test optional email capture with reminder emails.

### NG-4: Real-time Multi-Tab Sync
If a demo user opens the app in multiple tabs, changes are NOT synced in real-time between tabs. Each tab reads from IndexedDB on load.

**Rationale:** Real-time sync requires Supabase Realtime subscriptions, which need authenticated users. Demo mode uses local-only storage.

### NG-5: Demo Analytics Tracking
We do NOT send demo user analytics to a backend service. Demo metrics are stored locally and NOT aggregated for analysis.

**Rationale:** Tracking anonymous users raises privacy concerns and requires backend infrastructure. Post-MVP, we may add privacy-respecting analytics.

### NG-6: Progressive Web App Install Prompts in Demo Mode
We do NOT prompt demo users to install the PWA. Install prompts are reserved for authenticated users.

**Rationale:** We want demo users to sign up first, then install. Allowing PWA install before signup could reduce conversion.

### NG-7: Demo Mode Feature Restrictions
Demo mode has NO functional restrictions - users can add unlimited habits, logs, and notes just like authenticated users. The only limitation is the 7-day expiry.

**Rationale:** Feature restrictions (e.g., "max 3 habits in demo") create poor UX and don't build emotional investment. We want users to fully experience the app.

### NG-8: Social Sharing in Demo Mode
Demo users cannot share their progress on social media. Social features require authentication.

**Rationale:** Social sharing without identity doesn't make sense. This feature is naturally gated behind signup.

### NG-9: Custom Expiry Extensions
Demo users cannot extend the 7-day expiry period (e.g., by watching an ad or inviting friends). 7 days is a hard limit.

**Rationale:** Extensions add complexity and may reduce urgency to sign up. Post-MVP, we may test referral-based extensions.

### NG-10: Offline Migration
Demo data migration does NOT work offline. Users must have an internet connection when signing up for migration to succeed.

**Rationale:** Migration requires syncing to Supabase, which needs network access. Offline migration would require a queue system (future enhancement).

---

## 6. Technical Considerations

### 6.1 Technology Stack

**Frontend:**
- React 18.2 with TypeScript 5.2.2
- React Router 6.20 for client-side routing
- Vite 5.0.8 for build tooling
- CSS3 with mobile-first responsive design

**Data Storage:**
- IndexedDB (via existing `storageService`) for demo habits and logs
- localStorage for demo metrics and milestone tracking
- Supabase PostgreSQL for authenticated user data

**Authentication:**
- Supabase Auth with Google OAuth provider
- No auth required for demo mode (checked via `!isAuthenticated()`)

### 6.2 Architecture Decisions

**Decision 1: Use localStorage for Demo Metrics**

**Reasoning:** Demo metrics (counters, timestamps, flags) are small (< 1KB) and need fast synchronous access. localStorage is simpler than IndexedDB for this use case.

**Trade-off:** localStorage is limited to ~5-10MB per domain, but demo metrics use < 1KB, so this is not a concern.

**Implementation:** Create `demoModeService` class with methods like `getDemoMetrics()`, `updateDemoMetrics()`, `trackHabitAdded()`.

---

**Decision 2: Leverage Existing IndexedDB for Demo Data**

**Reasoning:** The app already has an offline-first architecture with IndexedDB caching. Demo users write to the same IndexedDB stores as authenticated users, just without a `user_id`.

**Trade-off:** This means demo data and authenticated data coexist in IndexedDB until demo data is cleared. We must ensure demo data is properly cleared after migration or expiry.

**Implementation:** Existing `storageService` already handles IndexedDB operations. No new storage layer needed.

---

**Decision 3: Migration via Existing Sync Service**

**Reasoning:** The `syncService.fullSync()` function already handles bi-directional sync between IndexedDB and Supabase. Demo data migration is just a full sync after authentication.

**Trade-off:** If sync fails, we need a retry mechanism. We choose non-blocking: allow auth to succeed, show error banner with retry button.

**Implementation:** In `auth.ts`, after successful `signInWithPassword()` or `signUp()`, check for demo metrics and call `demoModeService.migrateDemoData()` (which wraps `syncService.fullSync()`).

---

**Decision 4: Single Conversion Modal Per Session**

**Reasoning:** Showing the same modal multiple times is annoying and reduces conversion. We show it once at the first trigger, then mark `demo_conversion_shown: true`.

**Trade-off:** Users who dismiss the modal may never see it again. We compensate with persistent demo banner and expiry warnings.

**Implementation:** `demoModeService.shouldShowConversionModal()` returns trigger reason or null. After showing, call `demoModeService.markConversionShown()`.

---

**Decision 5: 7-Day Expiry with Day 5 Warnings**

**Reasoning:** 7 days is long enough to build a habit pattern (users can see multiple daily logs) but short enough to create urgency. Warnings starting day 5 provide 2 days' notice.

**Trade-off:** Users who abandon the app for >7 days lose data. This is intentional - we want active users to convert, not hoarders of stale demo data.

**Implementation:** `demoModeService.getDaysInDemo()` calculates elapsed time. `ProtectedRoute` checks `shouldExpireDemo()` and clears data if true.

### 6.3 Dependencies

**New Dependencies:** None (all features use existing libraries)

**Existing Dependencies:**
- `@supabase/supabase-js` 2.75.1 - For authenticated user data sync
- `date-fns` 2.30.0 - For date calculations (demo days elapsed)
- `react-router-dom` 6.20 - For navigation (demo button, conversion modal)

**Development Dependencies:**
- `vitest` 1.0.4 - For unit testing `demoModeService`
- `@playwright/test` 1.56.0 - For E2E testing demo flows
- `fake-indexeddb` - For testing IndexedDB operations

### 6.4 Integration Points

**Integration 1: ProtectedRoute Component**

**Changes Required:**
```typescript
// Allow demo mode users through
const demoMetrics = demoModeService.getDemoMetrics();
if (!authenticated && !demoMetrics) {
  return <Navigate to="/" replace />;
}
// Check for demo expiry
if (!authenticated && demoModeService.shouldExpireDemo()) {
  demoModeService.clearDemoData();
  return <Navigate to="/" replace />;
}
```

---

**Integration 2: Auth Service (auth.ts)**

**Changes Required:**
```typescript
// After successful login/signup
const demoMetrics = demoModeService.getDemoMetrics();
if (demoMetrics) {
  try {
    await demoModeService.migrateDemoData();
    sessionStorage.setItem('demo_migration_success', 'true');
  } catch (error) {
    console.error('Migration failed:', error);
    // Don't block auth - show retry banner later
  }
}
```

---

**Integration 3: ManageHabitsPage**

**Changes Required:**
```typescript
// After successful habit save
if (demoModeService.isDemoMode()) {
  demoModeService.trackHabitAdded();

  const milestone = demoModeService.getMilestoneMessage();
  if (milestone) {
    setToastMessage(milestone);
    setShowToast(true);
  }

  const trigger = demoModeService.shouldShowConversionModal();
  if (trigger) {
    setShowConversionModal(true);
    setConversionTrigger(trigger);
    demoModeService.markConversionShown();
  }
}
```

---

**Integration 4: DailyLogPage**

**Changes Required:**
```typescript
// After successful log save
if (demoModeService.isDemoMode()) {
  demoModeService.trackLogCompleted();

  const milestone = demoModeService.getMilestoneMessage();
  if (milestone) {
    setToastMessage(milestone);
    setShowToast(true);
  }

  const trigger = demoModeService.shouldShowConversionModal();
  if (trigger) {
    setShowConversionModal(true);
    setConversionTrigger(trigger);
    demoModeService.markConversionShown();
  }
}
```

---

**Integration 5: ProgressPage**

**Changes Required:**
```typescript
const isDemo = demoModeService.isDemoMode();

useEffect(() => {
  if (isDemo) {
    demoModeService.trackProgressVisit();

    const trigger = demoModeService.shouldShowConversionModal();
    if (trigger) {
      setShowConversionModal(true);
      setConversionTrigger(trigger);
      demoModeService.markConversionShown();
    }
  }
  loadHabitsAndLogs();
}, [isDemo]);

// Early return for demo mode
if (isDemo && !isLoading) {
  return <LockedProgressPreview />;
}
```

---

**Integration 6: Layout Component**

**Changes Required:**
```typescript
const isDemo = demoModeService.isDemoMode();

return (
  <div className="layout">
    <OfflineIndicator />
    {isDemo && <ExpiryWarning />}
    {isDemo && <DemoBanner />}
    <Navigation />
    <main>{children}</main>
    <Footer />
  </div>
);
```

### 6.5 Code Organization

**New Service File:**
- `src/services/demoMode.ts` (~300 lines) - Core demo mode logic

**New Components:**
- `src/components/DemoBanner.tsx` + `.css` (~100 lines)
- `src/components/ConversionModal.tsx` + `.css` (~200 lines)
- `src/components/LockedProgressPreview.tsx` + `.css` (~150 lines)
- `src/components/Toast.tsx` + `.css` (~100 lines)
- `src/components/MigrationToast.tsx` + `.css` (~120 lines)
- `src/components/ExpiryWarning.tsx` + `.css` (~120 lines)

**Modified Files:**
- `src/components/Layout.tsx` (add demo banners)
- `src/components/ProtectedRoute.tsx` (allow demo mode)
- `src/pages/WelcomePage.tsx` + `.css` (add demo button, journey section)
- `src/pages/ManageHabitsPage.tsx` (track metrics, show modals)
- `src/pages/DailyLogPage.tsx` (track metrics, show modals)
- `src/pages/ProgressPage.tsx` (show locked preview)
- `src/services/auth.ts` (trigger migration)

**Test Files:**
- `src/services/demoMode.test.ts` (~200 lines)
- `e2e/demo-flow.spec.ts` (~150 lines)
- `e2e/migration.spec.ts` (~100 lines)

---

## 7. Performance Requirements

### 7.1 Load Time Requirements

**PERF-1:** The welcome page with "Try Without Signing In" button MUST load in < 2 seconds on 4G mobile connections (same as current requirement).

**PERF-2:** Clicking "Try Without Signing In" MUST navigate to `/daily-log` in < 1 second (initializing demo mode is a fast localStorage write).

**PERF-3:** Demo mode components (banners, modals) MUST NOT delay page render. All are lazy-loaded and rendered after initial content.

### 7.2 Runtime Performance

**PERF-4:** Metric tracking (e.g., `trackHabitAdded()`) MUST complete in < 10ms (simple localStorage write).

**PERF-5:** Checking conversion triggers (e.g., `shouldShowConversionModal()`) MUST complete in < 5ms (localStorage read + simple boolean logic).

**PERF-6:** Demo data migration MUST start in < 100ms after authentication completes (non-blocking background sync).

**PERF-7:** Toast notifications MUST appear within 100ms of milestone achievement (simple state update).

### 7.3 Data Migration Performance

**PERF-8:** Demo data migration MUST handle up to 100 habits and 700 logs (7 days × 100 habits) without blocking the UI.

**PERF-9:** Migration progress MUST be indicated with a loading state (e.g., "Syncing your data...") if it takes > 2 seconds.

**PERF-10:** If migration fails, retry MUST not block the UI. Show error banner and allow user to navigate normally.

### 7.4 Storage Performance

**PERF-11:** localStorage usage for demo metrics MUST NOT exceed 5KB (current usage < 1KB).

**PERF-12:** IndexedDB usage for demo data MUST NOT exceed browser quota (typically 50MB+). Enforced by existing limits: max 100 habits, max 5000 chars per note.

---

## 8. Security & Compliance

### 8.1 Data Privacy

**SEC-1:** Demo data stored in IndexedDB and localStorage MUST NOT be transmitted to any server until the user signs up.

**SEC-2:** Demo metrics MUST NOT include personally identifiable information (PII). Only counters, timestamps, and boolean flags are stored.

**SEC-3:** After successful migration, all demo data MUST be cleared from localStorage (metrics) and remain in IndexedDB only (now associated with authenticated user_id).

**SEC-4:** If demo data expires, ALL demo data MUST be deleted from both localStorage and IndexedDB.

### 8.2 Authentication Security

**SEC-5:** Demo mode MUST NOT bypass any authentication checks for authenticated features. It is a separate state, not a backdoor.

**SEC-6:** Conversion modals MUST NOT pre-fill email addresses or passwords. Users must manually enter credentials.

**SEC-7:** Migration MUST NOT expose any user data from other accounts. Each user's demo data migrates only to their own authenticated account (enforced by Supabase RLS).

### 8.3 Client-Side Security

**SEC-8:** localStorage keys MUST use the `habitTracker_` prefix to avoid collisions with other apps on the same domain (if deployed to shared subdomain).

**SEC-9:** Demo metrics MUST be validated before use (e.g., check if `demo_start_date` is a valid ISO date string) to prevent injection attacks via localStorage tampering.

**SEC-10:** Migration MUST validate that Supabase session exists before calling `syncService.fullSync()` to prevent syncing data to wrong account.

### 8.4 Compliance

**COMP-1:** Demo mode MUST comply with GDPR Article 7 (consent for data processing): No personal data is collected until user signs up and accepts terms.

**COMP-2:** The welcome page MUST include a privacy note: "Your habit data is private and secure. We use industry-standard encryption."

**COMP-3:** Demo mode MUST NOT use cookies for tracking. All state is stored in localStorage (first-party, not third-party).

---

## 9. Data Requirements

### 9.1 Demo Metrics Schema

Stored in localStorage at key `habitTracker_demoMetrics`:

```typescript
interface DemoMetrics {
  demo_start_date: string;          // ISO 8601 timestamp (e.g., "2025-10-19T14:30:00.000Z")
  demo_habits_added: number;        // Counter, starts at 0
  demo_logs_completed: number;      // Counter, starts at 0
  demo_last_visit: string;          // ISO 8601 timestamp, updated on every metric change
  demo_progress_visits: number;     // Counter, starts at 0
  demo_conversion_shown: boolean;   // Flag, starts at false, set to true after first modal shown
}
```

**Validation Rules:**
- `demo_start_date` MUST be a valid ISO 8601 date string
- All counters MUST be non-negative integers
- `demo_last_visit` MUST be >= `demo_start_date`

### 9.2 Milestone Tracking Schema

Stored in localStorage at key `habitTracker_shownMilestones`:

```typescript
type ShownMilestones = string[];  // Array of milestone identifiers
// Example: ["first_habit", "three_habits", "first_log", "three_days"]
```

**Purpose:** Prevents showing the same milestone toast multiple times.

**Validation Rules:**
- MUST be a valid JSON array of strings
- Each string MUST be one of: `"first_habit"`, `"three_habits"`, `"first_log"`, `"three_days"`

### 9.3 Demo Habits and Logs

Stored in IndexedDB via existing `storageService`:

**Habits Store:**
- Same schema as authenticated habits (see `src/types/database.ts`)
- Key difference: No `user_id` in demo mode (or `user_id` is null/undefined)

**Logs Store:**
- Same schema as authenticated logs
- Key difference: No `user_id` in demo mode

**Migration Note:** During migration, the `syncService.fullSync()` function assigns the authenticated `user_id` to all IndexedDB records and syncs to Supabase.

### 9.4 Data Flow Diagram

```
1. Demo Mode Entry:
   WelcomePage (click "Try Without Signing In")
   └─> demoModeService.initializeDemoMode()
       └─> localStorage["habitTracker_demoMetrics"] = { ... }
   └─> Navigate to /daily-log

2. Demo Usage:
   User adds habits/logs
   └─> storageService.saveHabit() / saveLogs()
       └─> IndexedDB (no user_id)
   └─> demoModeService.trackHabitAdded() / trackLogCompleted()
       └─> localStorage["habitTracker_demoMetrics"] update

3. Conversion Trigger:
   demoModeService.shouldShowConversionModal()
   └─> Check metrics: habits >= 3 OR logs >= 1 OR progress_visits >= 1
   └─> Show <ConversionModal>
   └─> demoModeService.markConversionShown()

4. User Signs Up:
   WelcomePage (email/password or Google OAuth)
   └─> auth.signUpWithEmail() / loginWithEmail()
       └─> Supabase Auth creates session
       └─> demoModeService.getDemoMetrics() checks for demo data
       └─> demoModeService.migrateDemoData()
           └─> syncService.fullSync()
               └─> IndexedDB → Supabase (with user_id)
           └─> demoModeService.clearDemoData()
               └─> localStorage.removeItem("habitTracker_demoMetrics")
       └─> sessionStorage["demo_migration_success"] = "true"

5. Post-Migration:
   DailyLogPage loads
   └─> Check sessionStorage["demo_migration_success"]
   └─> Show <MigrationToast>
   └─> sessionStorage.removeItem("demo_migration_success")
```

### 9.5 Data Retention

**Retention Rule 1:** Demo data in localStorage and IndexedDB MUST be retained for exactly 7 days from `demo_start_date`.

**Retention Rule 2:** After successful migration, demo metrics MUST be deleted from localStorage. Habit and log data remain in IndexedDB (now with `user_id`).

**Retention Rule 3:** If demo data expires without conversion, ALL demo data MUST be deleted (localStorage metrics + IndexedDB habits/logs).

**Retention Rule 4:** If user manually clears browser data (via browser settings), all demo data is lost. This is acceptable and documented in UI messaging.

---

## 10. Design Considerations

### 10.1 Design System

**Colors:**
- **Demo Banner Gradient:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` (purple/blue)
- **Expiry Warning:** `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)` (orange/yellow)
- **Migration Success:** `linear-gradient(135deg, #10b981 0%, #059669 100%)` (green)
- **Primary CTA:** Same purple/blue gradient as demo banner

**Typography:**
- **Demo Banner:** 14px regular text, 600 weight for "Sign in to sync across devices"
- **Conversion Modal Title:** 24px, 700 weight (desktop), 20px (mobile)
- **Conversion Modal Body:** 16px, 1.6 line-height (desktop), 14px (mobile)
- **Toast Notifications:** 14px, 1.4 line-height

**Spacing:**
- **Demo Banner Padding:** 12px vertical, 16px horizontal
- **Conversion Modal Padding:** 32px (desktop), 24px (mobile)
- **Toast Padding:** 16px vertical, 24px horizontal

### 10.2 Mobile-First Design

**Touch Targets:**
- All buttons MUST meet 44x44px minimum (iOS/Android accessibility guidelines)
- Demo banner "Sign In" button: 44px height minimum
- Conversion modal buttons: 48px height minimum

**Responsive Breakpoints:**
- **Mobile:** 320px - 767px (default styles)
- **Desktop:** 768px+ (centered max-width: 800px)

**Mobile-Specific Adjustments:**
- Demo banner CTA button becomes full-width on mobile (<768px)
- Conversion modal padding reduces from 32px to 24px
- Toast notifications appear 80px from bottom (above mobile navigation bar)

### 10.3 Accessibility (WCAG 2.1 AA)

**ARIA Labels:**
- Demo banner: `role="alert"` + `aria-live="polite"`
- Expiry warning: `role="alert"` (no aria-live, as it's not dynamic)
- Conversion modal: `role="dialog"` + `aria-labelledby="modal-title"` + `aria-describedby="modal-message"`
- Toast notifications: `role="alert"` + `aria-live="polite"`

**Keyboard Navigation:**
- All buttons MUST be focusable and activatable via Enter/Space
- Conversion modal MUST support Escape key to close
- Focus MUST be trapped within modal while open
- After modal closes, focus MUST return to triggering element

**Color Contrast:**
- Demo banner white text on purple gradient: minimum 4.5:1 ratio
- Expiry warning white text on orange gradient: minimum 4.5:1 ratio
- All button text MUST meet 4.5:1 contrast ratio

**Screen Reader Support:**
- Demo banner text MUST be read aloud when appearing
- Conversion modal MUST announce title and message
- Toast notifications MUST announce milestone text
- Locked progress preview MUST describe blurred content as "preview of analytics charts"

### 10.4 Visual Feedback

**Loading States:**
- Migration in progress: Show spinner with text "Syncing your data..."
- Retry button in error banner: Show spinner during retry

**Animations:**
- Conversion modal: Slide up animation (0.3s ease-out) on appear, fade out on dismiss
- Toast notifications: Slide up + fade in animation (0.3s ease-out)
- Expiry warning icon: Pulsing animation (2s ease-in-out infinite)
- Locked progress fake charts: Pulse animation (2s ease-in-out infinite)

**Transitions:**
- Demo banner CTA button: `transform: translateY(-1px)` + box-shadow on hover
- Conversion modal buttons: `transform: translateY(-2px)` + box-shadow on hover

### 10.5 UI/UX Mockups

**Mockup 1: Welcome Page with Demo Button**

_(No actual mockup file - described here for developer reference)_

```
┌─────────────────────────────────────────────┐
│            HABIT TRACKER LOGO               │
├─────────────────────────────────────────────┤
│  Track habits. Build streaks. Own data.    │
│  Start today. See progress in a week.      │
│  Discover patterns in a month.             │
│                                             │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃   Try Without Signing In (PRIMARY)   ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                    or                       │
│  ▶ Sign In with Email (collapsible)        │
│                                             │
│  How It Works:                              │
│  ① Today: Add Your Habits                   │
│  ② This Week: See Your Streaks              │
│  ③ This Month: Discover Patterns            │
└─────────────────────────────────────────────┘
```

**Mockup 2: Demo Banner (Top of Protected Routes)**

```
┌─────────────────────────────────────────────┐
│ 📍 You're trying Habit Tracker.             │
│    Sign in to sync across devices.          │
│    [ Sign In ]                              │
└─────────────────────────────────────────────┘
```

**Mockup 3: Conversion Modal**

```
┌─────────────────────────────────────────────┐
│                                          ✕  │
│  You're building momentum! 🚀               │
│  You've added 3 habits. Sign in now to      │
│  sync your progress across devices and      │
│  never lose your data.                      │
│                                             │
│  With a free account:                       │
│  ✓ Cloud sync across all devices           │
│  ✓ Never lose your progress                 │
│  ✓ Unlock advanced analytics                │
│  ✓ Track unlimited habits & notes           │
│                                             │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃   Sign In to Save Progress           ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│  ┌───────────────────────────────────────┐  │
│  │   Continue in Demo Mode               │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Your demo data will be automatically       │
│  saved when you sign in.                    │
└─────────────────────────────────────────────┘
```

---

## 11. User Experience Flow

### 11.1 Flow 1: First-Time Demo User (Happy Path)

**Step 1: Landing**
- User visits welcome page (/)
- Sees "Try Without Signing In" button (primary CTA)
- Clicks button

**Step 2: Demo Initialization**
- System creates demo metrics in localStorage
- Redirects to /daily-log
- Demo banner appears at top: "You're trying Habit Tracker. Sign in to sync across devices."

**Step 3: Adding First Habit**
- User navigates to /manage-habits
- Clicks "Add Habit" button
- Fills in habit name (e.g., "Morning run")
- Clicks "Save"
- Toast appears: "✓ Great start! Add 2 more to build your routine."
- Toast auto-dismisses after 4 seconds

**Step 4: Adding More Habits**
- User adds 2nd habit (e.g., "Read 30 minutes")
- No toast (only first habit triggers milestone)
- User adds 3rd habit (e.g., "Meditate")
- Toast appears: "🎉 You've added 3 habits! Come back tomorrow to start your streak."
- Toast auto-dismisses after 4 seconds
- Conversion modal appears immediately after toast:
  - Title: "You're building momentum! 🚀"
  - Message: "You've added 3 habits. Sign in now to sync your progress..."
  - User can dismiss or continue in demo mode

**Step 5: First Daily Log**
- User navigates back to /daily-log
- Sees 3 habits with toggle switches
- Marks first habit as "done" (toggle on)
- Adds note: "Felt great after the run!"
- Clicks "Save Logs" button
- Toast appears: "🎉 First log complete! Come back tomorrow to build your streak."
- Conversion modal appears (if not already shown after 3 habits)

**Step 6: Exploring Progress**
- User navigates to /progress
- Sees locked preview with blurred charts
- Reads: "Unlock Your Progress Analytics - Sign in to unlock: 7-day & 30-day streak tracking..."
- Conversion modal appears (if not already shown)
- User understands value of signing up

**Step 7: Conversion Decision**
- User decides to sign up (from banner, modal, or locked progress)
- Clicks "Sign In" → navigates to /
- Expands "Sign In with Email" form
- Enters email and password
- Clicks "Create Account"

**Step 8: Data Migration**
- System authenticates user with Supabase
- Detects demo metrics in localStorage
- Calls `demoModeService.migrateDemoData()`
- Syncs IndexedDB data to Supabase
- Clears demo metrics
- Sets `sessionStorage["demo_migration_success"] = "true"`
- Redirects to /daily-log

**Step 9: Migration Success**
- Page loads with migration toast:
  - Icon: ✓
  - Title: "Welcome!"
  - Message: "Your demo data has been saved. All your habits and logs are now synced to your account."
- Toast auto-dismisses after 6 seconds
- Demo banner is gone (user is authenticated)
- User continues using app as authenticated user

### 11.2 Flow 2: Demo User with Expiry Warning

**Day 1-4:** User adds habits, logs daily, sees demo banner

**Day 5:** User opens app
- Expiry warning banner appears above demo banner:
  - "Your demo data will be deleted in 2 days. Sign in to save your progress permanently."
  - "Sign In Now" button

**Day 6:** User opens app
- Expiry warning updates: "Your demo data will be deleted in 1 day."

**Day 7:** User opens app
- Expiry warning updates: "Your demo data will be deleted in 0 days." (last chance)

**Day 8:** User opens app
- `ProtectedRoute` detects `getDaysInDemo() >= 7`
- Calls `demoModeService.clearDemoData()`
- Redirects to /
- User sees welcome page (clean slate, no demo data)

### 11.3 Flow 3: Demo User Abandons and Returns

**Day 1:** User tries demo, adds 2 habits, closes browser

**Day 3:** User returns (browser still has demo data)
- Demo banner appears
- Habits are still there (IndexedDB persisted)
- User adds 3rd habit
- Conversion modal appears
- User dismisses modal ("Continue in Demo Mode")

**Day 7:** User returns
- Expiry warning appears: "1 day remaining"
- User clicks "Sign In Now"
- Signs up with Google OAuth
- Data migrates successfully
- All habits from Day 1 and Day 3 are preserved

### 11.4 Flow 4: Migration Failure (Error Handling)

**Step 1-7:** Same as Flow 1 (user signs up)

**Step 8:** Migration attempt
- System authenticates user (success)
- Calls `demoModeService.migrateDemoData()`
- `syncService.fullSync()` fails (e.g., network timeout)
- Error is logged to console
- Demo metrics are NOT cleared (allow retry)
- No error thrown (authentication still succeeds)
- User is redirected to /daily-log (authenticated)

**Step 9:** Error State
- Error banner appears at top:
  - Icon: ⚠️
  - Message: "We couldn't sync your demo data automatically."
  - Buttons: "Retry Sync" | "Dismiss"
- User clicks "Retry Sync"
- System calls `syncService.fullSync()` again
- If success: Show migration success toast, clear demo metrics
- If failure: Keep error banner visible

---

## 12. Error Handling

### 12.1 localStorage Errors

**Error Type:** localStorage quota exceeded (unlikely, but possible)

**Handling:**
- Catch `QuotaExceededError` in `demoModeService.updateDemoMetrics()`
- Log error to console
- Do NOT block user action (e.g., habit save still succeeds)
- Show non-blocking error toast: "Unable to track demo progress. Your data is still saved."

**Recovery:** User can continue using demo mode, just without metric tracking (no conversion modals or milestones)

---

### 12.2 IndexedDB Errors

**Error Type:** IndexedDB quota exceeded or access denied

**Handling:**
- Existing `storageService` already handles IndexedDB errors
- If write fails, show error message: "Unable to save data locally. Please check your browser storage settings."
- Do NOT allow demo mode to continue (data can't be persisted)

**Recovery:** User must clear browser storage or enable IndexedDB in settings

---

### 12.3 Migration Errors

**Error Type:** `syncService.fullSync()` fails during migration

**Possible Causes:**
- Network timeout
- Supabase API error
- Invalid data format in IndexedDB

**Handling:**
```typescript
try {
  await demoModeService.migrateDemoData();
  sessionStorage.setItem('demo_migration_success', 'true');
} catch (error) {
  console.error('[Auth] Demo data migration failed:', error);
  // Don't block authentication - user stays signed in
  // Don't clear demo metrics - allow retry
}
```

**User Experience:**
- Authentication still succeeds (user is signed in)
- Error banner appears with "Retry Sync" button
- User can manually trigger sync or continue using app (new data syncs normally)

**Recovery:**
- Click "Retry Sync" button → calls `syncService.fullSync()` again
- If retry succeeds: Show success toast, clear demo metrics, hide banner
- If retry fails: Keep banner visible, log error

---

### 12.4 Conversion Modal Errors

**Error Type:** Conversion modal shown multiple times (logic bug)

**Prevention:**
- `demo_conversion_shown` flag prevents duplicate modals
- If flag is somehow not set, modal can appear again (minor annoyance, not critical)

**Handling:** No special handling needed (modal is dismissible)

---

### 12.5 Expiry Logic Errors

**Error Type:** `demo_start_date` is invalid or missing

**Handling:**
```typescript
getDaysInDemo(): number {
  const metrics = this.getDemoMetrics();
  if (!metrics) return 0;

  const start = new Date(metrics.demo_start_date);
  if (isNaN(start.getTime())) {
    console.error('[DemoMode] Invalid demo_start_date');
    return 0; // Treat as Day 0 (no expiry)
  }

  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
```

**Recovery:** If date is invalid, treat as Day 0 (no expiry warning, no forced redirect)

---

### 12.6 Route Protection Errors

**Error Type:** User in demo mode but `ProtectedRoute` redirects to /

**Possible Causes:**
- Demo metrics were cleared unexpectedly
- Browser storage was cleared
- localStorage was disabled

**Handling:**
- Redirect to / (welcome page)
- User sees "Try Without Signing In" button again
- Can restart demo mode (previous data is lost)

**Prevention:** Demo mode detection checks for existence of `habitTracker_demoMetrics` in localStorage

---

### 12.7 Validation Errors

**Error Type:** Demo metrics contain invalid values (e.g., negative counters)

**Handling:**
```typescript
getDemoMetrics(): DemoMetrics | null {
  const json = localStorage.getItem(DEMO_METRICS_KEY);
  if (!json) return null;

  try {
    const metrics = JSON.parse(json);

    // Validate schema
    if (typeof metrics.demo_habits_added !== 'number' || metrics.demo_habits_added < 0) {
      throw new Error('Invalid demo_habits_added');
    }
    // ... validate other fields

    return metrics;
  } catch (error) {
    console.error('[DemoMode] Invalid demo metrics, clearing:', error);
    this.clearDemoData();
    return null;
  }
}
```

**Recovery:** Clear corrupted demo data, treat user as not in demo mode

---

## 13. Success Metrics

### 13.1 Primary Metrics

**Metric 1: Demo Adoption Rate**
- **Definition:** Percentage of welcome page visitors who click "Try Without Signing In"
- **Target:** 60%+ (higher than current direct signup rate)
- **Tracking:** Analytics event on button click
- **Success Criteria:** If ≥60% of visitors try demo mode, validates frictionless entry point

---

**Metric 2: Demo → Signup Conversion Rate (PRIMARY SUCCESS METRIC)**
- **Definition:** Percentage of demo users who eventually create accounts
- **Target:** 20-30% (industry standard for freemium trial-to-paid)
- **Tracking:** Compare demo initializations vs. successful migrations
- **Success Criteria:** If conversion rate ≥20%, feature is successful; if ≥30%, feature is highly successful

---

**Metric 3: Time to Conversion**
- **Definition:** Median time from demo start to signup
- **Target:** 1-3 days (aligns with habit formation psychology)
- **Tracking:** `demo_start_date` vs. signup timestamp
- **Success Criteria:** If median is 1-3 days, conversion timing is optimal

---

**Metric 4: Migration Success Rate**
- **Definition:** Percentage of signups where demo data migrates without errors
- **Target:** 99%+ (critical for user trust)
- **Tracking:** Log migration attempts vs. successes
- **Success Criteria:** If <1% failure rate, migration is reliable

### 13.2 Engagement Metrics

**Metric 5: Demo Engagement Depth**
- **Definition:** Percentage of demo users who add 3+ habits
- **Target:** 60%+ (indicates product-market fit)
- **Tracking:** Check `demo_habits_added` in localStorage
- **Success Criteria:** If ≥60% add 3+ habits, users see value quickly

---

**Metric 6: Demo Retention**
- **Definition:** Percentage of demo users returning on subsequent days
- **Targets:**
  - D1 retention (return next day): 40%
  - D3 retention (return after 3 days): 25%
  - D7 retention (return after 7 days): 15%
- **Tracking:** Compare `demo_start_date` vs. `demo_last_visit`
- **Success Criteria:** If D1 ≥40%, users find immediate value

---

**Metric 7: Conversion Trigger Effectiveness**
- **Definition:** Which trigger leads to most conversions?
- **Breakdown:**
  - `habits_threshold` (3+ habits)
  - `first_log` (first daily log)
  - `progress_page` (visiting locked progress)
- **Hypothesis:** "first_log" will convert best (emotional investment)
- **Tracking:** Tag signups with trigger that last showed conversion modal
- **Success Criteria:** Identify highest-converting trigger for future optimization

---

**Metric 8: Milestone Engagement**
- **Definition:** Percentage of demo users who see milestone toasts and continue using app
- **Target:** 70%+ engagement with milestones
- **Tracking:** Compare users who saw milestones vs. continued activity
- **Success Criteria:** If ≥70% continue after milestone, celebrations work

### 13.3 UX Metrics

**Metric 9: Modal Dismissal Rate**
- **Definition:** Percentage who close conversion modal and continue demo
- **Target:** <70% (some friction is expected)
- **Tracking:** Modal shown vs. "Continue in Demo Mode" clicks
- **Success Criteria:** If ≤70% dismiss, modal is not overly aggressive

---

**Metric 10: Expiry-Driven Conversions**
- **Definition:** Percentage of conversions that happen after expiry warning appears (day 5+)
- **Hypothesis:** 10-15% of total conversions
- **Tracking:** Compare signup date vs. demo days elapsed
- **Success Criteria:** If 10-15% convert after warning, expiry creates useful urgency

### 13.4 Technical Metrics

**Metric 11: Migration Errors**
- **Definition:** Number of migration failures and error types
- **Target:** <1% error rate
- **Tracking:** Log errors to console with error type
- **Success Criteria:** If error rate <1%, migration is production-ready

---

**Metric 12: Demo Data Size**
- **Definition:** Average habits and logs per demo user
- **Baseline:** Unknown (to be measured)
- **Tracking:** Check IndexedDB size before migration
- **Success Criteria:** Ensure no users hit quota limits (monitor for anomalies)

---

## 14. Acceptance Criteria

### 14.1 Core Functionality Acceptance

**AC-1:** When a user clicks "Try Without Signing In" on the welcome page, they are redirected to `/daily-log` within 2 seconds without requiring authentication.

**AC-2:** A demo banner appears at the top of all protected routes (`/daily-log`, `/manage-habits`, `/progress`) when in demo mode, displaying the message "You're trying Habit Tracker. Sign in to sync across devices."

**AC-3:** Demo users can add unlimited habits, and each habit persists across browser sessions (stored in IndexedDB).

**AC-4:** Demo users can mark habits as done/not done and add notes up to 5000 characters, identical to authenticated users.

**AC-5:** The first time a demo user adds a habit, a toast notification appears: "✓ Great start! Add 2 more to build your routine."

**AC-6:** The first time a demo user adds a 3rd habit, a toast notification appears: "🎉 You've added 3 habits! Come back tomorrow to start your streak." followed immediately by a conversion modal.

**AC-7:** The first time a demo user completes a daily log, a toast notification appears: "🎉 First log complete! Come back tomorrow to build your streak." followed immediately by a conversion modal (if not already shown).

**AC-8:** When a demo user visits `/progress` for the first time, they see a locked preview with blurred charts and the message "Unlock Your Progress Analytics - Sign in to unlock: 7-day & 30-day streak tracking..." followed by a conversion modal (if not already shown).

**AC-9:** Each demo user sees at most one conversion modal per session, regardless of how many triggers are hit.

**AC-10:** Conversion modals can be dismissed by clicking the X button, clicking outside the modal, or clicking "Continue in Demo Mode."

### 14.2 Data Migration Acceptance

**AC-11:** When a demo user signs up with email/password or Google OAuth, their demo data (habits and logs) is automatically migrated to their authenticated account within 5 seconds.

**AC-12:** After successful migration, a green toast notification appears: "Welcome! Your demo data has been saved. All your habits and logs are now synced to your account."

**AC-13:** After successful migration, the demo banner is removed (user is now authenticated).

**AC-14:** After successful migration, demo metrics are cleared from localStorage.

**AC-15:** If migration fails (e.g., network error), the user is still authenticated and can use the app normally. An error banner appears with a "Retry Sync" button.

**AC-16:** Clicking "Retry Sync" attempts migration again. If successful, the error banner is replaced with the success toast.

### 14.3 Expiry Acceptance

**AC-17:** Starting on day 5 of the demo period (2 days before expiry), an orange expiry warning banner appears above the demo banner, displaying: "Your demo data will be deleted in X day(s). Sign in to save your progress permanently."

**AC-18:** On day 6, the warning updates to "1 day remaining."

**AC-19:** On day 7, the warning updates to "0 days remaining" (last chance).

**AC-20:** On day 8 or later, when a demo user tries to access a protected route, the system clears all demo data (localStorage metrics + IndexedDB habits/logs) and redirects to `/` (welcome page).

**AC-21:** After demo expiry, the welcome page displays normally with no demo data (clean slate).

### 14.4 UI/UX Acceptance

**AC-22:** The "Try Without Signing In" button is the primary CTA on the welcome page, positioned above the email/password sign-in form, with a purple/blue gradient background.

**AC-23:** The welcome page includes a "How It Works" section with 3 steps:
1. Today: Add Your Habits
2. This Week: See Your Streaks
3. This Month: Discover Patterns

**AC-24:** The email/password sign-in form is wrapped in a collapsible `<details>` element with the summary text "Sign In with Email."

**AC-25:** All demo mode UI elements (banners, modals, toasts) meet WCAG 2.1 AA accessibility standards:
- Minimum 4.5:1 color contrast
- ARIA labels for screen readers
- Keyboard navigable
- Focus management in modals

**AC-26:** All demo mode buttons meet the 44x44px minimum touch target size for mobile accessibility.

**AC-27:** On mobile (<768px), the demo banner "Sign In" button becomes full-width.

**AC-28:** On mobile, toast notifications appear 80px from the bottom to avoid overlapping with the navigation bar.

### 14.5 Testing Acceptance

**AC-29:** Unit tests for `demoModeService` cover all core functions:
- `initializeDemoMode()`
- `trackHabitAdded()`, `trackLogCompleted()`, `trackProgressVisit()`
- `shouldShowConversionModal()`
- `getDaysInDemo()`, `shouldExpireDemo()`
- `getMilestoneMessage()`
- `migrateDemoData()`, `clearDemoData()`

**AC-30:** E2E tests cover the following flows:
- Demo mode entry (click "Try Without Signing In" → redirects to `/daily-log`)
- Adding 3 habits triggers conversion modal
- First log triggers conversion modal
- Progress page shows locked preview and triggers conversion modal
- Signup migrates demo data successfully
- Expiry warning appears on day 5
- Demo data is cleared after 7 days

**AC-31:** Manual testing confirms:
- Mobile responsiveness (320px+)
- Touch target sizes (44x44px+)
- Accessibility (keyboard nav, screen readers)
- Cross-browser compatibility (Chrome, Firefox, Safari)

---

## 15. Open Questions

### OQ-1: Should we A/B test conversion trigger thresholds?

**Current Design:** 3+ habits, 1+ log, 1+ progress visit

**Question:** Should we test variations like 2 habits vs. 4 habits, or 2 logs vs. 1 log?

**Recommendation:** Launch with current thresholds, then A/B test based on initial data. If conversion rates are low, test lower thresholds (e.g., 2 habits). If conversion rates are high but demo engagement is shallow, test higher thresholds (e.g., 5 habits).

---

### OQ-2: Should we collect email before demo mode starts?

**Current Design:** No email collection - fully anonymous demo mode

**Question:** Would optional email capture (e.g., "Get a reminder email on day 6") improve conversion without harming adoption?

**Recommendation:** Launch without email capture to maximize frictionless onboarding. Post-launch, consider A/B testing optional email capture with benefits like "Get a reminder to save your data" or "Receive habit tracking tips."

---

### OQ-3: Should we show partial progress data in demo mode?

**Current Design:** Fully locked progress page with blurred preview

**Question:** Would showing basic stats (e.g., "You've logged 3 days") increase engagement without reducing conversion?

**Recommendation:** Launch with fully locked preview to maximize curiosity and conversion motivation. Post-launch, A/B test partial data reveal (e.g., show completion % but lock streaks and notes analysis).

---

### OQ-4: Should demo users be able to export data before signing up?

**Current Design:** No export - signup is the only way to preserve data

**Question:** Would a "Download my data as JSON" option provide trust without hurting conversion?

**Recommendation:** Launch without export to maintain signup urgency. Post-launch, if conversion rates are strong (≥25%), consider adding export as a trust signal. If conversion rates are weak (<15%), avoid export as it provides an "escape hatch."

---

### OQ-5: Should we allow demo expiry extensions?

**Current Design:** Fixed 7-day expiry, no extensions

**Question:** Should we allow users to extend demo by 3 days if they invite a friend (referral mechanism)?

**Recommendation:** Launch with fixed 7-day expiry to maintain urgency. Post-launch, if expiry-driven conversions are high (>20% of total), keep fixed expiry. If expiry abandonment is high (>50% of engaged users), test referral-based extensions.

---

### OQ-6: How should we handle demo users who clear browser data?

**Current Design:** Demo data is lost if browser storage is cleared - no recovery

**Question:** Should we warn users "Your demo data will be lost if you clear browser data" on the demo banner?

**Recommendation:** Launch without warning to avoid cluttering UI. If user complaints arise, add a small info icon with tooltip: "Your demo data is stored locally. Sign in to sync across devices and never lose your data."

---

### OQ-7: Should we show demo user count on welcome page?

**Example:** "Join 1,234 users trying Habit Tracker today"

**Question:** Would social proof increase demo adoption without seeming pushy?

**Recommendation:** Launch without social proof to keep welcome page clean. Post-launch, A/B test social proof messaging if demo adoption rate is <50% (indicates users need more persuasion).

---

### OQ-8: Should we implement offline migration (queue migration for when online)?

**Current Design:** Migration requires internet connection when signing up

**Question:** If a user signs up while offline, should we queue migration for when they reconnect?

**Recommendation:** Launch without offline migration (simpler implementation). Post-launch, if migration errors due to network issues are >5% of attempts, implement offline migration queue using existing `syncQueueService` architecture.

---

**End of PRD 0003: Demo Mode Onboarding**

---

## Implementation Phases

For detailed implementation timeline, see:
- `plans for later/DEMO_MODE_ONBOARDING_PLAN.md` (Phases 1-6 with 14-19 day timeline)
- Sprint 1: Core Infrastructure (3-4 days)
- Sprint 2: UI Components (3-4 days)
- Sprint 3: Page Integration (3-4 days)
- Sprint 4: Migration & Milestones (2-3 days)
- Sprint 5: Polish & Testing (3-4 days)

**Next Step:** Generate task list from this PRD using `agents/generate-tasks.md`.
