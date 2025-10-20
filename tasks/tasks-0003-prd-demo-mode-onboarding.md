# Task List: Demo Mode Onboarding

Based on PRD: `0003-prd-demo-mode-onboarding.md`

**Feature:** Shadow Account with Progressive Journey Onboarding
**Primary Success Metric:** Demo → Signup Conversion Rate (Target: 20-30%)
**Estimated Effort:** 14-19 days (2.5-4 weeks for one developer)

---

## Relevant Files

### New Services
- `src/services/demoMode.ts` - Core demo mode service with metrics tracking, conversion triggers, milestone logic, expiry management, and migration coordination (~300 lines)
- `src/services/demoMode.test.ts` - Unit tests for demo mode service (~200 lines)

### New Components
- `src/components/DemoBanner.tsx` - Persistent demo mode reminder banner
- `src/components/DemoBanner.css` - Styling for demo banner
- `src/components/ConversionModal.tsx` - Signup prompt modal with benefits list
- `src/components/ConversionModal.css` - Styling for conversion modal
- `src/components/LockedProgressPreview.tsx` - Locked analytics preview for demo users
- `src/components/LockedProgressPreview.css` - Styling for locked preview
- `src/components/Toast.tsx` - Generic toast notification for milestones
- `src/components/Toast.css` - Styling for toast notifications
- `src/components/MigrationToast.tsx` - Success message after demo data migration
- `src/components/MigrationToast.css` - Styling for migration toast
- `src/components/ExpiryWarning.tsx` - Warning banner for demo expiry countdown
- `src/components/ExpiryWarning.css` - Styling for expiry warning

### Modified Components
- `src/components/Layout.tsx` - Add demo banner and expiry warning
- `src/components/ProtectedRoute.tsx` - Allow demo mode access, check expiry

### Modified Pages
- `src/pages/WelcomePage.tsx` - Add demo button, progressive journey section, collapsible email form
- `src/pages/WelcomePage.css` - Styling for new welcome page sections
- `src/pages/ManageHabitsPage.tsx` - Track demo metrics, show conversion modal and milestones
- `src/pages/DailyLogPage.tsx` - Track demo metrics, show conversion modal and milestones
- `src/pages/ProgressPage.tsx` - Show locked preview in demo mode, track progress visits

### Modified Services
- `src/services/auth.ts` - Trigger migration on signup/login

### Testing
- `src/services/demoMode.test.ts` - Unit tests for demo service (milestone detection, conversion triggers, expiry logic)
- `e2e/demo-flow.spec.ts` - E2E tests for demo mode entry, conversion triggers, milestones (~150 lines)
- `e2e/migration.spec.ts` - E2E tests for data migration flow (~100 lines)

### Documentation
- `README.md` - Update with demo mode feature description
- `CLAUDE.md` - Update implementation status (mark Task 10.0 as complete when done)

### Notes

- All demo metrics stored in localStorage at key `habitTracker_demoMetrics`
- Milestone tracking stored in localStorage at key `habitTracker_shownMilestones`
- Demo data uses existing IndexedDB stores (via `storageService`)
- Migration leverages existing `syncService.fullSync()` function
- All new components follow existing patterns (TypeScript + separate CSS files)
- Unit tests use Vitest with fake-indexeddb for storage mocking
- E2E tests use Playwright with mobile-first viewport (375x667)

---

## Tasks

### Phase 1: Core Infrastructure (3-4 days)

- [x] **1.0 Create Demo Mode Service**
  - [x] 1.1 Create `src/services/demoMode.ts` file with TypeScript interfaces
    - Define `DemoMetrics` interface with all required fields (demo_start_date, demo_habits_added, demo_logs_completed, demo_last_visit, demo_progress_visits, demo_conversion_shown)
    - Define constants for localStorage keys: `DEMO_METRICS_KEY = 'habitTracker_demoMetrics'` and `SHOWN_MILESTONES_KEY = 'habitTracker_shownMilestones'`
    - Create `DemoModeService` class skeleton
    - **Acceptance:** File created with proper TypeScript interfaces matching PRD REQ-2

  - [x] 1.2 Implement demo mode detection and initialization
    - Implement `isDemoMode(): boolean` - returns `!isAuthenticated()` (check if Supabase session exists)
    - Implement `initializeDemoMode(): void` - creates DemoMetrics object with default values and saves to localStorage
    - Implement `getDemoMetrics(): DemoMetrics | null` - reads and parses from localStorage, validates data structure
    - Implement `clearDemoData(): void` - removes both demo metrics and shown milestones from localStorage
    - **Acceptance:** Can initialize demo mode, detect demo state, and retrieve metrics from localStorage

  - [x] 1.3 Implement metric tracking functions
    - Implement `updateDemoMetrics(updates: Partial<DemoMetrics>): void` - merges updates with current metrics, always updates demo_last_visit timestamp
    - Implement `trackHabitAdded(): void` - increments demo_habits_added counter
    - Implement `trackLogCompleted(): void` - increments demo_logs_completed counter
    - Implement `trackProgressVisit(): void` - increments demo_progress_visits counter
    - Add error handling for localStorage quota exceeded (catch QuotaExceededError)
    - **Acceptance:** All metric counters increment correctly, timestamps update, errors handled gracefully

  - [x] 1.4 Implement conversion trigger logic
    - Implement `shouldShowConversionModal(): string | null` - checks if conversion modal should be shown
    - Return `'habits_threshold'` if demo_habits_added >= 3 AND demo_conversion_shown is false
    - Return `'first_log'` if demo_logs_completed >= 1 AND demo_conversion_shown is false
    - Return `'progress_page'` if demo_progress_visits >= 1 AND demo_conversion_shown is false
    - Return `null` if no trigger met or modal already shown
    - Implement `markConversionShown(): void` - sets demo_conversion_shown to true
    - **Acceptance:** Conversion triggers fire correctly at 3+ habits, 1+ log, and progress visit (PRD REQ-20 to REQ-23)

  - [x] 1.5 Implement milestone detection logic
    - Implement `getMilestoneMessage(): string | null` - checks if a new milestone was reached
    - Check localStorage for already-shown milestones array
    - Return "✓ Great start! Add 2 more to build your routine." for first habit (if not in shown list)
    - Return "🎉 You've added 3 habits! Come back tomorrow to start your streak." for 3rd habit (if not in shown list)
    - Return "🎉 First log complete! Come back tomorrow to build your streak." for first log (if not in shown list)
    - Return "📈 You're building momentum! Sign in to unlock streak tracking." for 3 days in demo (if not in shown list)
    - Update shown milestones list in localStorage after returning message
    - Return null if no new milestone
    - **Acceptance:** Each milestone fires exactly once, messages match PRD REQ-28 to REQ-31

  - [x] 1.6 Implement expiry logic
    - Implement `getDaysInDemo(): number` - calculates days elapsed since demo_start_date
    - Use formula: `Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))`
    - Handle invalid demo_start_date (return 0 if invalid)
    - Implement `shouldExpireDemo(): boolean` - returns true if getDaysInDemo() >= 7
    - **Acceptance:** Correctly calculates days elapsed, handles invalid dates, expires at 7 days (PRD REQ-39 to REQ-41)

  - [x] 1.7 Implement data migration coordinator
    - Import `syncService` from `./syncService`
    - Implement `async migrateDemoData(): Promise<void>`
    - Log: "Starting data migration..."
    - Call `await syncService.fullSync()` to sync IndexedDB to Supabase
    - Log: "Migration complete, clearing demo metrics"
    - Call `clearDemoData()` to remove demo metrics
    - Wrap in try-catch and re-throw errors (caller will handle)
    - **Acceptance:** Calls existing sync service, clears metrics after success, propagates errors (PRD REQ-44 to REQ-47)

  - [x] 1.8 Export singleton instance
    - Create singleton instance: `export const demoModeService = new DemoModeService();`
    - Add JSDoc comments for all public methods
    - **Acceptance:** Service can be imported as singleton in other files

### Phase 2: UI Components (3-4 days)

- [x] **2.0 Create Demo Mode UI Components**
  - [x] 2.1 Create DemoBanner component
    - Create `src/components/DemoBanner.tsx` with functional component
    - Import `useNavigate` from react-router-dom
    - Display banner with: icon (📍), text ("You're trying Habit Tracker. Sign in to sync across devices."), and "Sign In" button
    - Add click handler to navigate to `/` on button click
    - Add ARIA attributes: `role="alert"`, `aria-live="polite"`, `aria-label="Sign in to save your progress"` on button
    - Create `src/components/DemoBanner.css` with styling:
      - Purple/blue gradient background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
      - Sticky positioning: `position: sticky; top: 0; z-index: 100;`
      - 12px vertical padding, 16px horizontal padding
      - White text, flexbox layout with gap
      - Mobile responsive: full-width button on <768px
      - Button: 44px min-height, white background, purple text, rounded corners
    - **Acceptance:** Banner appears at top, sticky on scroll, navigates to welcome page, meets WCAG AA contrast (PRD REQ-10 to REQ-12)

  - [x] 2.2 Create ConversionModal component
    - Create `src/components/ConversionModal.tsx` with functional component
    - Accept props: `trigger: 'habits_threshold' | 'first_log' | 'progress_page'`, `onClose: () => void`
    - Implement `getTitleAndMessage()` function to return title and message based on trigger type:
      - habits_threshold: "You're building momentum! 🚀" + message about 3 habits
      - first_log: "Great start! 🎉" + message about first daily log
      - progress_page: "Unlock Your Analytics 📊" + message about progress features
    - Render modal overlay (full-screen, semi-transparent black background with backdrop-filter blur)
    - Render modal content: title, message, benefits list, "Sign In to Save Progress" button, "Continue in Demo Mode" button, reassurance note
    - Add X button in top-right corner
    - Add click handlers: X button and overlay click call onClose(), primary button navigates to `/` then onClose(), secondary button calls onClose()
    - Add ARIA attributes: `role="dialog"`, `aria-labelledby`, `aria-describedby`, `aria-label="Close modal"` on X button
    - Stop propagation on modal content click (prevent closing when clicking inside modal)
    - Create `src/components/ConversionModal.css` with styling:
      - Full-screen overlay with flexbox centering, z-index 1000
      - Modal content: white background, 32px padding (24px on mobile), rounded corners, max-width 500px
      - Slide-up animation on appear (0.3s ease-out)
      - Benefits section: light gray background, rounded corners, bullet list with checkmarks
      - Primary button: purple gradient, 48px height, white text
      - Secondary button: white background, purple border, 44px height
      - Mobile responsive: reduce padding, stack buttons vertically
    - **Acceptance:** Modal shows correct messaging per trigger, dismissible three ways (X, overlay, secondary button), accessible (PRD REQ-20 to REQ-27)

  - [x] 2.3 Create LockedProgressPreview component
    - Create `src/components/LockedProgressPreview.tsx` with functional component
    - Import `useNavigate` from react-router-dom
    - Render wrapper div with relative positioning
    - Render blurred background div with fake chart (7 bars with varying heights: 40%, 60%, 80%, 100%, 85%, 90%, 100%)
    - Render centered content card on top (white background, z-index 2, box shadow):
      - Icon: 🔒
      - Title: "Unlock Your Progress Analytics"
      - Subtitle: "Sign in to unlock:"
      - Feature list: 7-day & 30-day streak tracking, Completion trends over time, Notes sentiment analysis (after 7+ notes), Pattern discovery and insights
      - Button: "Sign In to Unlock" (navigates to `/`)
    - Create `src/components/LockedProgressPreview.css` with styling:
      - Wrapper: min-height 400px, flexbox centering, rounded corners, overflow hidden
      - Blurred background: absolute positioning, filter blur(8px), opacity 0.3, z-index 1
      - Fake chart: flexbox row with 7 bars (purple gradient), bars pulse animation (2s ease-in-out infinite)
      - Content card: white background, 40px padding (32px on mobile), rounded corners, max-width 400px, z-index 2
      - Icon: 48px font size
      - Button: purple gradient, 48px height, full width
      - Mobile responsive: reduce min-height to 300px, reduce padding
    - **Acceptance:** Shows blurred chart preview with centered unlock message, button navigates to welcome page (PRD REQ-35 to REQ-38)

  - [x] 2.4 Create Toast component
    - Create `src/components/Toast.tsx` with functional component
    - Accept props: `message: string`, `icon?: string` (default '🎉'), `duration?: number` (default 4000), `onClose: () => void`
    - Use `useEffect` to set up auto-dismiss timer: `setTimeout(onClose, duration)`
    - Return cleanup function to clear timeout
    - Render toast with: icon span, message span
    - Add ARIA attributes: `role="alert"`, `aria-live="polite"`
    - Create `src/components/Toast.css` with styling:
      - Fixed positioning: bottom 24px (80px on mobile to avoid nav bar), left 50%, transform translateX(-50%)
      - Dark background: rgba(0, 0, 0, 0.9), white text
      - 16px vertical padding, 24px horizontal padding, rounded corners
      - Flexbox layout with gap, max-width 90%
      - Slide-up + fade-in animation (0.3s ease-out)
      - z-index 1000
      - Mobile responsive: adjust bottom position
    - **Acceptance:** Toast appears, shows message with icon, auto-dismisses after 4 seconds (PRD REQ-32 to REQ-34)

  - [x] 2.5 Create MigrationToast component
    - Create `src/components/MigrationToast.tsx` with functional component
    - Use `useState` for visibility, `useEffect` for 6-second auto-dismiss timer
    - Return null if not visible (after timer or manual dismiss)
    - Render toast with: green checkmark icon (✓ in circular background), title ("Welcome!"), message ("Your demo data has been saved..."), X button
    - Add ARIA attributes: `role="alert"`, `aria-live="polite"`, `aria-label="Close notification"` on X button
    - Create `src/components/MigrationToast.css` with styling:
      - Fixed positioning: bottom 24px (80px on mobile), right 24px, max-width 400px
      - Green gradient background: `linear-gradient(135deg, #10b981 0%, #059669 100%)`, white text
      - 20px vertical padding, 24px horizontal padding, rounded corners
      - Flexbox layout with icon, content, close button
      - Slide-in from right animation (0.4s ease-out)
      - z-index 1000
      - Mobile responsive: full width, left/right 16px
    - **Acceptance:** Toast appears after migration, shows success message, auto-dismisses after 6 seconds or manual close (PRD REQ-50)

  - [x] 2.6 Create ExpiryWarning component
    - Create `src/components/ExpiryWarning.tsx` with functional component
    - Import `demoModeService` and `useNavigate`
    - Calculate `daysInDemo = demoModeService.getDaysInDemo()` and `daysLeft = 7 - daysInDemo`
    - Return null if daysLeft > 2 (only show in last 2 days)
    - Render warning banner with: warning icon (⚠️ with pulsing animation), text ("Your demo data will be deleted in X day(s)..."), "Sign In Now" button
    - Add ARIA attribute: `role="alert"`
    - Create `src/components/ExpiryWarning.css` with styling:
      - Orange/yellow gradient background: `linear-gradient(135deg, #f59e0b 0%, #d97706 100%)`, white text
      - 16px padding, border-bottom: 3px solid darker orange
      - Flexbox layout with gap, wrap on mobile
      - Icon: pulsing animation (scale 1 to 1.1, 2s ease-in-out infinite)
      - Button: white background, orange text, 44px min-height, 600 weight
      - Mobile responsive: full-width button, center text
    - **Acceptance:** Warning appears on day 5 (2 days left), updates daily, shows correct day count (PRD REQ-42 to REQ-43)

  - [x] 2.7 Verify accessibility compliance
    - Test all components with keyboard navigation (Tab, Enter, Escape)
    - Verify ARIA labels are announced by screen reader (test with browser dev tools)
    - Verify color contrast meets WCAG 2.1 AA (minimum 4.5:1 ratio)
    - Verify focus indicators are visible on all interactive elements
    - Test modal focus trap (focus should stay within modal when open)
    - **Acceptance:** All components meet WCAG 2.1 AA standards (PRD AC-25)

  - [x] 2.8 Verify mobile responsiveness
    - Test all components at 320px, 375px, 414px, 768px, and 1024px widths
    - Verify all buttons meet 44x44px minimum touch target size
    - Verify text is readable without zooming (minimum 14px font size)
    - Verify no horizontal scrolling on small screens
    - Test on real mobile devices (iOS and Android) if possible
    - **Acceptance:** All components work correctly on 320px+ screens, meet touch target minimums (PRD AC-26 to AC-28)

### Phase 3: Page Integration (3-4 days)

- [ ] **3.0 Update Existing Pages for Demo Mode**
  - [ ] 3.1 Update WelcomePage - Add progressive journey section
    - Open `src/pages/WelcomePage.tsx`
    - Update hero section (around lines 94-99) with new progressive messaging:
      - Title: "Track habits. Build streaks. Own your data."
      - Subtitle: "Start today. See progress in a week. Discover patterns in a month."
    - Add new "How It Works" section after hero, before CTA section:
      - Create section with className "welcome-journey"
      - Add h2 with className "welcome-section-title": "How It Works"
      - Create div with className "welcome-journey-steps" containing 3 step cards:
        - Step 1: number circle (1), title "Today: Add Your Habits", description "Simple toggles to mark done or not done. Works offline."
        - Step 2: number circle (2), title "This Week: See Your Streaks", description "Track consistency over 7+ days. Build momentum."
        - Step 3: number circle (3), title "This Month: Discover Patterns", description "AI analyzes your notes to show what helps you succeed."
    - **Acceptance:** Journey section renders with 3 steps, matches PRD REQ-53 to REQ-54

  - [ ] 3.2 Update WelcomePage - Add demo button and restructure CTAs
    - Import `demoModeService` from '../services/demoMode'
    - Add handler function `handleTryDemo`:
      - Call `demoModeService.initializeDemoMode()`
      - Navigate to '/daily-log' using `navigate('/daily-log')`
    - Update CTA section (replace lines 136-230):
      - Add h2: "Get Started"
      - Add primary button with className "welcome-button welcome-button-demo":
        - Text: "Try Without Signing In"
        - onClick: handleTryDemo
        - disabled: loading || !authInitialized
        - aria-label: "Try the app without signing up"
      - Add divider paragraph with className "welcome-cta-divider": text "or"
      - Wrap existing email/password form in `<details>` element with className "welcome-auth-details":
        - `<summary>` with className "welcome-auth-summary": "Sign In with Email"
        - Move entire form (email, password, submit button, toggle mode) inside `<details>`
      - Add privacy note at bottom: "Your habit data is private and secure. We use industry-standard encryption."
    - **Acceptance:** Demo button is primary CTA, email form is collapsible, clicking demo button initializes demo mode and navigates (PRD REQ-55 to REQ-57)

  - [ ] 3.3 Update WelcomePage CSS
    - Open `src/pages/WelcomePage.css`
    - Add styles for journey section:
      - `.welcome-journey`: 48px top/bottom margin, 16px horizontal padding
      - `.welcome-section-title`: 28px font, 700 weight, center aligned, 32px bottom margin
      - `.welcome-journey-steps`: CSS Grid with auto-fit columns (min 250px), 32px gap, max-width 900px, centered
      - `.welcome-step`: center text, 24px padding, light gray background (#f8f9fa), rounded corners, hover effect (translateY(-4px) + shadow)
      - `.welcome-step-number`: 48x48px circle, purple gradient background, white text, 24px font, 700 weight, centered, 16px bottom margin
      - `.welcome-step-title`: 18px font, 600 weight, 8px bottom margin
      - `.welcome-step-description`: 14px font, 1.6 line-height, gray text
    - Add styles for demo button:
      - `.welcome-button-demo`: purple gradient background, 18px font, 16px vertical padding, 32px horizontal, 16px bottom margin
    - Add styles for divider:
      - `.welcome-cta-divider`: center text, gray color, 14px font, 16px vertical margin, relative positioning
      - Add ::before and ::after pseudo-elements for horizontal lines (40% width each, 1px height, gray background)
    - Add styles for collapsible form:
      - `.welcome-auth-details`: 16px top margin, full width
      - `.welcome-auth-summary`: cursor pointer, 12px vertical padding, 16px horizontal, light gray background, purple text, 600 weight, center text, rounded corners, hide default marker
      - `.welcome-auth-summary:hover`: darker background, purple border
      - `.welcome-auth-details[open] .welcome-auth-summary`: 16px bottom margin, no bottom border radius
    - Add mobile responsive styles (@media max-width 768px):
      - `.welcome-journey-steps`: single column grid
    - **Acceptance:** Journey section is visually appealing, demo button is prominent, form collapses correctly (PRD AC-23 to AC-24)

  - [ ] 3.4 Update ManageHabitsPage - Add demo tracking and modals
    - Open `src/pages/ManageHabitsPage.tsx`
    - Add imports:
      - `import { demoModeService } from '../services/demoMode';`
      - `import { ConversionModal } from '../components/ConversionModal';`
      - `import { Toast } from '../components/Toast';`
    - Add state variables:
      - `const [showConversionModal, setShowConversionModal] = useState(false);`
      - `const [conversionTrigger, setConversionTrigger] = useState<'habits_threshold' | 'first_log' | 'progress_page'>('habits_threshold');`
      - `const [showToast, setShowToast] = useState(false);`
      - `const [toastMessage, setToastMessage] = useState('');`
    - In `handleSaveHabit` function (after successful save), add demo mode tracking:
      ```typescript
      if (demoModeService.isDemoMode()) {
        demoModeService.trackHabitAdded();

        const milestoneMsg = demoModeService.getMilestoneMessage();
        if (milestoneMsg) {
          setToastMessage(milestoneMsg);
          setShowToast(true);
        }

        const trigger = demoModeService.shouldShowConversionModal();
        if (trigger) {
          setShowConversionModal(true);
          setConversionTrigger(trigger as 'habits_threshold' | 'first_log' | 'progress_page');
          demoModeService.markConversionShown();
        }
      }
      ```
    - Add to JSX render (before closing div):
      ```typescript
      {showConversionModal && (
        <ConversionModal
          trigger={conversionTrigger}
          onClose={() => setShowConversionModal(false)}
        />
      )}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
      ```
    - **Acceptance:** After adding habits in demo mode, milestone toasts appear (1st and 3rd habit), conversion modal appears after 3rd habit (PRD REQ-15, REQ-28, REQ-29)

  - [ ] 3.5 Update DailyLogPage - Add demo tracking and modals
    - Open `src/pages/DailyLogPage.tsx`
    - Add imports (same as ManageHabitsPage):
      - `import { demoModeService } from '../services/demoMode';`
      - `import { ConversionModal } from '../components/ConversionModal';`
      - `import { Toast } from '../components/Toast';`
    - Add state variables (same as ManageHabitsPage):
      - showConversionModal, conversionTrigger, showToast, toastMessage
    - In `handleSaveLogs` function (after successful save), add demo mode tracking:
      ```typescript
      if (demoModeService.isDemoMode()) {
        demoModeService.trackLogCompleted();

        const milestoneMsg = demoModeService.getMilestoneMessage();
        if (milestoneMsg) {
          setToastMessage(milestoneMsg);
          setShowToast(true);
        }

        const trigger = demoModeService.shouldShowConversionModal();
        if (trigger) {
          setShowConversionModal(true);
          setConversionTrigger(trigger as 'habits_threshold' | 'first_log' | 'progress_page');
          demoModeService.markConversionShown();
        }
      }
      ```
    - Add to JSX render (same as ManageHabitsPage):
      - ConversionModal component with trigger prop and onClose handler
      - Toast component with message prop and onClose handler
    - Add state for migration success toast:
      - `const [showMigrationToast, setShowMigrationToast] = useState(false);`
    - Add useEffect to check for migration success flag:
      ```typescript
      useEffect(() => {
        const migrationSuccess = sessionStorage.getItem('demo_migration_success');
        if (migrationSuccess) {
          setShowMigrationToast(true);
          sessionStorage.removeItem('demo_migration_success');
        }
      }, []);
      ```
    - Add to JSX render:
      ```typescript
      {showMigrationToast && <MigrationToast />}
      ```
    - Import MigrationToast component
    - **Acceptance:** After logging in demo mode, milestone toast appears (1st log), conversion modal appears, migration toast appears after signup (PRD REQ-16, REQ-30, REQ-50)

  - [ ] 3.6 Update ProgressPage - Add locked preview and tracking
    - Open `src/pages/ProgressPage.tsx`
    - Add imports:
      - `import { demoModeService } from '../services/demoMode';`
      - `import { LockedProgressPreview } from '../components/LockedProgressPreview';`
      - `import { ConversionModal } from '../components/ConversionModal';`
    - Add state variables:
      - `const [showConversionModal, setShowConversionModal] = useState(false);`
      - `const [conversionTrigger, setConversionTrigger] = useState<'habits_threshold' | 'first_log' | 'progress_page'>('progress_page');`
    - At top of component function, add:
      - `const isDemo = demoModeService.isDemoMode();`
    - Update useEffect to track progress visits:
      ```typescript
      useEffect(() => {
        if (isDemo) {
          demoModeService.trackProgressVisit();

          const trigger = demoModeService.shouldShowConversionModal();
          if (trigger) {
            setShowConversionModal(true);
            setConversionTrigger(trigger as 'habits_threshold' | 'first_log' | 'progress_page');
            demoModeService.markConversionShown();
          }
        }

        loadHabitsAndLogs();
      }, [isDemo]);
      ```
    - Add early return for demo mode (after loading check):
      ```typescript
      if (isDemo && !isLoading) {
        return (
          <div className="progress-page">
            <div className="page-header">
              <h1>Progress</h1>
            </div>
            <LockedProgressPreview />
            {showConversionModal && (
              <ConversionModal
                trigger={conversionTrigger}
                onClose={() => setShowConversionModal(false)}
              />
            )}
          </div>
        );
      }
      ```
    - **Acceptance:** In demo mode, Progress page shows locked preview instead of actual analytics, conversion modal appears on first visit (PRD REQ-17, REQ-35, AC-8)

### Phase 4: Route & Auth Integration (2-3 days)

- [ ] **4.0 Integrate Demo Mode with Authentication & Routing**
  - [ ] 4.1 Update ProtectedRoute - Allow demo mode access
    - Open `src/components/ProtectedRoute.tsx`
    - Add import: `import { demoModeService } from '../services/demoMode';`
    - After the authentication check (around line where `authenticated` is set), add demo mode check:
      ```typescript
      const demoMetrics = demoModeService.getDemoMetrics();
      ```
    - Update the redirect logic (replace the `if (!authenticated)` block):
      ```typescript
      // Redirect to welcome if not authenticated AND not in demo mode
      if (!authenticated && !demoMetrics) {
        return <Navigate to="/" replace state={{ from: location }} />;
      }

      // Check for demo expiry (7 days)
      if (!authenticated && demoModeService.shouldExpireDemo()) {
        console.log('[ProtectedRoute] Demo data expired, clearing and redirecting');
        demoModeService.clearDemoData();
        return <Navigate to="/" replace />;
      }
      ```
    - **Acceptance:** Demo users can access protected routes, expired demo users are redirected and data is cleared (PRD REQ-58 to REQ-60, AC-20 to AC-21)

  - [ ] 4.2 Update Layout - Add demo banners
    - Open `src/components/Layout.tsx`
    - Add imports:
      - `import { DemoBanner } from './DemoBanner';`
      - `import { ExpiryWarning } from './ExpiryWarning';`
      - `import { demoModeService } from '../services/demoMode';`
    - At top of Layout component function, add:
      - `const isDemo = demoModeService.isDemoMode();`
    - Update JSX to add demo UI elements in correct stacking order:
      ```typescript
      return (
        <div className="layout">
          <OfflineIndicator />
          {isDemo && <ExpiryWarning />}
          {isDemo && <DemoBanner />}
          <Navigation />
          <main className="layout-content">
            {children}
          </main>
          <Footer />
        </div>
      );
      ```
    - **Acceptance:** In demo mode, both banners appear at top of all protected routes, stacked correctly (PRD REQ-61 to REQ-62, AC-2, AC-17)

  - [ ] 4.3 Update auth service - Trigger migration on signup/login
    - Open `src/services/auth.ts`
    - Add import at top: `import { demoModeService } from './demoMode';`
    - In `loginWithEmail` function (after line 102, after successful authentication):
      ```typescript
      // Check for demo data and migrate if exists
      const demoMetrics = demoModeService.getDemoMetrics();
      if (demoMetrics) {
        console.log('[Auth] Demo data detected - migrating to authenticated account');
        try {
          await demoModeService.migrateDemoData();
          console.log('[Auth] Demo data migration complete');

          // Store flag to show migration success toast
          sessionStorage.setItem('demo_migration_success', 'true');
        } catch (migrationError) {
          console.error('[Auth] Demo data migration failed:', migrationError);
          // Don't block login on migration failure
          // User can manually sync later
        }
      }
      ```
    - In `signUpWithEmail` function (after line 136, after successful signup), add the same migration logic:
      ```typescript
      // Check for demo data and migrate if exists
      const demoMetrics = demoModeService.getDemoMetrics();
      if (demoMetrics) {
        console.log('[Auth] Demo data detected - migrating to new account');
        try {
          await demoModeService.migrateDemoData();
          console.log('[Auth] Demo data migration complete');

          // Store flag to show migration success toast
          sessionStorage.setItem('demo_migration_success', 'true');
        } catch (migrationError) {
          console.error('[Auth] Demo data migration failed:', migrationError);
          // Don't block signup on migration failure
        }
      }
      ```
    - **Acceptance:** After demo user signs up or logs in, demo data is migrated to authenticated account, migration success flag is set (PRD REQ-44 to REQ-51, AC-11 to AC-13)

  - [ ] 4.4 Test complete demo-to-authenticated flow
    - Manually test the full flow:
      1. Click "Try Without Signing In" → should navigate to /daily-log
      2. Add 1 habit → should see "Great start!" toast
      3. Add 2 more habits → should see "3 habits!" toast + conversion modal
      4. Dismiss modal → continue in demo mode
      5. Navigate to Progress → should see locked preview + conversion modal
      6. Navigate back to welcome page → click "Sign In with Email"
      7. Sign up with new account → should authenticate successfully
      8. Should see migration toast: "Welcome! Your demo data has been saved..."
      9. Navigate to /manage-habits → should see all 3 habits
      10. Demo banner should be gone (user is authenticated)
    - **Acceptance:** Complete flow works end-to-end, data migrates successfully, UI updates correctly (AC-1 to AC-16)

  - [ ] 4.5 Test error handling and edge cases
    - Test migration failure scenario:
      1. Start demo mode, add habits
      2. Disconnect network (browser dev tools)
      3. Try to sign up → should authenticate but migration fails
      4. Check console for error log
      5. Verify user is still authenticated (not blocked)
      6. Verify demo metrics are NOT cleared (allow retry)
    - Test expiry scenario:
      1. Manually set demo_start_date to 8 days ago in localStorage
      2. Try to access /daily-log
      3. Should redirect to welcome page
      4. Check localStorage → demo metrics should be cleared
      5. Check IndexedDB → demo habits should be cleared
    - Test invalid localStorage data:
      1. Manually corrupt demo metrics in localStorage
      2. Try to call demoModeService.getDemoMetrics()
      3. Should return null and clear corrupted data
    - **Acceptance:** All error scenarios handled gracefully, no crashes, appropriate fallbacks (PRD Section 12, AC-15 to AC-16)

### Phase 5: Testing & Quality Assurance (3-4 days)

- [ ] **5.0 Testing & Quality Assurance**
  - [ ] 5.1 Write unit tests for demoMode service - Core functions
    - Create `src/services/demoMode.test.ts`
    - Import vitest functions: `describe`, `it`, `expect`, `beforeEach`, `vi`
    - Import demoModeService
    - Add `beforeEach` hook to clear localStorage and reset mocks
    - Write test suite "DemoModeService":
      - Test `initializeDemoMode`: should initialize demo metrics with default values (counters at 0, timestamps set, conversion_shown false)
      - Test `getDemoMetrics`: should return null if no metrics exist, should return parsed metrics if they exist
      - Test `isDemoMode`: should return false if authenticated, should return true if not authenticated (mock isAuthenticated)
      - Test `trackHabitAdded`: should increment demo_habits_added counter
      - Test `trackLogCompleted`: should increment demo_logs_completed counter
      - Test `trackProgressVisit`: should increment demo_progress_visits counter
      - Test `updateDemoMetrics`: should update demo_last_visit on every call
    - **Acceptance:** All core function tests pass, achieve >90% code coverage for basic operations

  - [ ] 5.2 Write unit tests for demoMode service - Conversion triggers
    - In same test file, add test suite "Conversion Triggers":
      - Test `shouldShowConversionModal` returns 'habits_threshold' after 3 habits added
      - Test `shouldShowConversionModal` returns 'first_log' after 1 log completed
      - Test `shouldShowConversionModal` returns 'progress_page' after 1 progress visit
      - Test `shouldShowConversionModal` returns null after modal already shown (demo_conversion_shown = true)
      - Test `shouldShowConversionModal` returns null if no trigger met
      - Test `markConversionShown` sets demo_conversion_shown to true
      - Test conversion triggers fire in order of priority (habits > logs > progress)
    - **Acceptance:** All conversion trigger logic tests pass, validates PRD REQ-20 to REQ-27

  - [ ] 5.3 Write unit tests for demoMode service - Milestones
    - Add test suite "Milestone Celebrations":
      - Test `getMilestoneMessage` returns "Great start!" message for first habit
      - Test `getMilestoneMessage` returns "3 habits!" message for 3rd habit
      - Test `getMilestoneMessage` returns "First log complete!" message for first log
      - Test `getMilestoneMessage` returns "Building momentum!" message after 3 days in demo
      - Test milestone messages are not repeated (check shown milestones list in localStorage)
      - Test `getMilestoneMessage` returns null if no new milestone reached
      - Test milestone tracking persists across service instantiations
    - **Acceptance:** All milestone logic tests pass, validates PRD REQ-28 to REQ-34

  - [ ] 5.4 Write unit tests for demoMode service - Expiry logic
    - Add test suite "Demo Expiry":
      - Test `getDaysInDemo` returns 0 on day 1
      - Test `getDaysInDemo` calculates correct days after time passes (mock demo_start_date to 3 days ago, should return 3)
      - Test `getDaysInDemo` handles invalid demo_start_date (returns 0)
      - Test `shouldExpireDemo` returns false before day 7
      - Test `shouldExpireDemo` returns true on day 7 or later
      - Test `clearDemoData` removes both metrics and milestones from localStorage
    - **Acceptance:** All expiry logic tests pass, validates PRD REQ-39 to REQ-43

  - [ ] 5.5 Write unit tests for demoMode service - Migration
    - Add test suite "Data Migration":
      - Mock `syncService.fullSync` using vi.mock
      - Test `migrateDemoData` calls syncService.fullSync()
      - Test `migrateDemoData` clears demo data after successful sync
      - Test `migrateDemoData` propagates errors (doesn't swallow exceptions)
      - Test `migrateDemoData` logs appropriate messages
    - Run all tests: `npm test -- src/services/demoMode.test.ts --run`
    - Verify all tests pass and coverage is >95% for demoMode.ts
    - **Acceptance:** All migration tests pass, validates PRD REQ-44 to REQ-52

  - [ ] 5.6 Write E2E tests for demo flow
    - Create `e2e/demo-flow.spec.ts`
    - Import Playwright test utilities
    - Write test suite "Demo Mode Onboarding Flow":
      - Test "should allow user to try app without signing in":
        - Navigate to /
        - Click "Try Without Signing In" button
        - Expect URL to be /daily-log
        - Expect demo banner to be visible
      - Test "should show conversion modal after adding 3 habits":
        - Initialize demo mode
        - Navigate to /manage-habits
        - Add 3 habits in loop
        - Expect conversion modal to be visible
        - Expect modal text to contain "building momentum"
      - Test "should show milestone toast after first habit":
        - Initialize demo mode
        - Navigate to /manage-habits
        - Add 1 habit
        - Expect toast to be visible
        - Expect toast text to contain "Great start"
      - Test "should show locked progress preview in demo mode":
        - Initialize demo mode
        - Navigate to /progress
        - Expect locked preview to be visible
        - Expect text "Unlock Your Progress Analytics" to be visible
      - Test "should show expiry warning on day 6":
        - Set demo_start_date to 6 days ago in localStorage via page.evaluate
        - Navigate to /daily-log
        - Expect expiry warning to be visible
        - Expect text "1 day" to be visible
    - Run tests: `npm run test:e2e -- demo-flow.spec.ts`
    - **Acceptance:** All E2E demo flow tests pass, validates AC-1 to AC-10, AC-17 to AC-19

  - [ ] 5.7 Write E2E tests for migration flow
    - Create `e2e/migration.spec.ts`
    - Write test suite "Demo Data Migration":
      - Test "should migrate demo data on sign up":
        - Initialize demo mode
        - Add 1 habit
        - Navigate to /
        - Expand "Sign In with Email" form
        - Click "Don't have an account"
        - Fill email (use timestamp for uniqueness: `test-${Date.now()}@example.com`)
        - Fill password
        - Click "Create Account"
        - Expect migration toast to be visible with text "Welcome!"
        - Navigate to /manage-habits
        - Expect habit to exist (verify by text)
      - Test "should clear demo banner after migration":
        - Initialize demo mode
        - Verify demo banner exists
        - Sign in with existing test account
        - Expect demo banner NOT to be visible
      - Test "should handle migration failure gracefully":
        - Initialize demo mode with data
        - Disconnect network via page.route() to block sync API
        - Sign up
        - Verify user is authenticated (check for Navigation component)
        - Verify error is logged to console (listen to console events)
    - Run tests: `npm run test:e2e -- migration.spec.ts`
    - **Acceptance:** All E2E migration tests pass, validates AC-11 to AC-16

  - [ ] 5.8 Manual testing - Mobile devices
    - Test on real iOS device (iPhone 13 or newer):
      - Test demo mode entry (button is tappable, navigation works)
      - Test demo banner (sticky, readable, button works)
      - Test conversion modal (readable, buttons work, dismissible)
      - Test milestone toasts (appear at correct position, readable)
      - Test expiry warning (visible, readable, button works)
      - Test locked progress preview (blurred chart visible, button works)
    - Test on real Android device (Pixel 5 or newer):
      - Repeat all tests from iOS
    - Test on Chrome DevTools device emulation:
      - Test at 320px width (smallest supported)
      - Test at 375px width (iPhone SE)
      - Test at 414px width (iPhone Pro Max)
      - Test landscape orientation
    - **Acceptance:** All features work on mobile devices, no layout issues, all text readable (AC-26 to AC-28)

  - [ ] 5.9 Manual testing - Accessibility
    - Test keyboard navigation:
      - Tab through all interactive elements (buttons, links, modal)
      - Verify focus indicators are visible
      - Press Enter to activate buttons
      - Press Escape to close modal
      - Verify focus trap in conversion modal (Tab should not leave modal)
    - Test with screen reader (NVDA on Windows or VoiceOver on Mac):
      - Verify demo banner text is announced
      - Verify conversion modal title and message are announced
      - Verify toast notifications are announced
      - Verify button labels are clear ("Sign In", "Continue in Demo Mode")
      - Verify ARIA roles are recognized (alert, dialog)
    - Test color contrast:
      - Use browser dev tools or WebAIM Contrast Checker
      - Verify demo banner white text on purple gradient ≥ 4.5:1
      - Verify expiry warning white text on orange gradient ≥ 4.5:1
      - Verify all button text ≥ 4.5:1
    - **Acceptance:** All accessibility requirements met, WCAG 2.1 AA compliant (AC-25, PRD Section 10.3)

  - [ ] 5.10 Manual testing - Cross-browser compatibility
    - Test on Chrome (latest version):
      - All features work correctly
      - No console errors
      - Demo data persists (localStorage + IndexedDB)
    - Test on Firefox (latest version):
      - All features work correctly
      - No console errors
      - Demo data persists
    - Test on Safari (latest version):
      - All features work correctly
      - No console errors
      - Demo data persists
      - Test on iOS Safari specifically (mobile-specific issues)
    - Test on Edge (latest version):
      - All features work correctly
      - No console errors
    - **Acceptance:** All features work on all major browsers, no browser-specific bugs

  - [ ] 5.11 Performance testing
    - Test initial page load time:
      - Use Chrome DevTools Performance tab
      - Record page load with "Try Without Signing In" click
      - Verify total time < 2 seconds on simulated 4G connection
    - Test demo mode initialization time:
      - Add console.time/timeEnd around initializeDemoMode()
      - Verify initialization < 100ms
    - Test metric tracking performance:
      - Add console.time/timeEnd around trackHabitAdded()
      - Verify tracking < 10ms (should be instant localStorage write)
    - Test migration with large dataset:
      - Create 100 habits in demo mode
      - Create 700 logs (7 days × 100 habits)
      - Sign up and measure migration time
      - Verify migration completes without blocking UI
      - Verify all data appears in authenticated account
    - **Acceptance:** All performance requirements met (PRD Section 7, PERF-1 to PERF-10)

  - [ ] 5.12 Update documentation
    - Update `README.md`:
      - Add "Demo Mode Onboarding" section to Features list
      - Document demo mode behavior (7-day expiry, conversion triggers)
      - Document data migration flow
    - Update `CLAUDE.md`:
      - Mark Task 10.0 (Demo Mode Onboarding) as complete in implementation status
      - Add demo mode to "Current Implementation Status" section
      - Document new demoMode service in "Service Layer" section
      - Document new components in "Component Architecture" section
    - Add inline code comments:
      - JSDoc comments for all demoModeService public methods
      - Component prop type documentation
      - Complex logic explanations (e.g., expiry calculation, conversion trigger priority)
    - **Acceptance:** Documentation is complete and accurate, future developers can understand demo mode implementation

---

## High-Level Task Summary

**1.0 Create Demo Mode Service** - Implement core demo mode logic including metrics tracking, conversion trigger detection, milestone detection, expiry management, and migration coordination. This is the foundation that all UI components will depend on.

**2.0 Create Demo Mode UI Components** - Build 6 new React components (DemoBanner, ConversionModal, LockedProgressPreview, Toast, MigrationToast, ExpiryWarning) with mobile-first responsive design and WCAG 2.1 AA accessibility compliance.

**3.0 Update Existing Pages for Demo Mode** - Integrate demo mode tracking and UI elements into WelcomePage (demo button + progressive journey), ManageHabitsPage (milestone toasts + conversion modal), DailyLogPage (milestone toasts + conversion modal), and ProgressPage (locked preview).

**4.0 Integrate Demo Mode with Authentication & Routing** - Update ProtectedRoute to allow demo mode access, update Layout to show demo banners, and update auth.ts to trigger data migration on signup/login.

**5.0 Testing & Quality Assurance** - Write comprehensive unit tests for demoMode service, E2E tests for demo flows and migration, and perform manual testing for mobile responsiveness, accessibility, and cross-browser compatibility.

---

**I have generated the high-level tasks based on the PRD. These 5 parent tasks cover the complete implementation from core service to UI components to testing.**

**Ready to generate the detailed sub-tasks? Respond with 'Go' to proceed.**
