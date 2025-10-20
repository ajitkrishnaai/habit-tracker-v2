# Manual Testing Checklist: Demo Mode Onboarding

This document provides comprehensive manual testing checklists for the Demo Mode Onboarding feature (PRD 0003). These tests complement the automated unit and E2E tests and should be performed before production deployment.

---

## Table of Contents

1. [Mobile Device Testing](#mobile-device-testing)
2. [Accessibility Testing](#accessibility-testing)
3. [Cross-Browser Compatibility](#cross-browser-compatibility)
4. [Performance Testing](#performance-testing)

---

## Mobile Device Testing

### Test Environment Requirements

**iOS Devices:**
- iPhone 13 or newer (iOS 15+)
- iPhone SE (3rd generation) - smallest screen test
- iPad (9th generation or newer)

**Android Devices:**
- Google Pixel 5 or newer (Android 12+)
- Samsung Galaxy S21 or newer
- Device with 320px width (smallest supported)

**Chrome DevTools Device Emulation:**
- iPhone SE (375x667)
- iPhone 13 (390x844)
- iPhone 13 Pro Max (428x926)
- Pixel 5 (393x851)
- iPad Air (820x1180)

---

### Mobile Testing Checklist

#### 1. Demo Mode Entry

- [ ] **Welcome Page - Demo Button**
  - [ ] "Try Without Signing In" button is visible and tappable (≥44x44px)
  - [ ] Button text is readable at 16px+ font size
  - [ ] Tap registers on first attempt (no delay)
  - [ ] Navigation to /daily-log happens within 2 seconds
  - [ ] No horizontal scrolling on 320px screens

- [ ] **Demo Banner**
  - [ ] Banner is sticky at top of screen
  - [ ] Banner remains visible when scrolling down
  - [ ] "Sign In" button is full-width on mobile (<768px)
  - [ ] Banner text wraps correctly on narrow screens
  - [ ] No text overflow or truncation

#### 2. Milestone Toasts

- [ ] **Toast Positioning**
  - [ ] Toast appears 80px from bottom (above navigation bar)
  - [ ] Toast is centered horizontally
  - [ ] Toast does not overlap with navigation
  - [ ] Toast is readable on light and dark backgrounds

- [ ] **Toast Interaction**
  - [ ] Toast auto-dismisses after 4 seconds
  - [ ] Multiple toasts stack correctly (if applicable)
  - [ ] Toast text is readable at 14px font size
  - [ ] Emoji renders correctly on iOS and Android

#### 3. Conversion Modal

- [ ] **Modal Display**
  - [ ] Modal centers correctly on all screen sizes
  - [ ] Modal content is scrollable if needed (small screens)
  - [ ] Modal padding adjusts from 32px (desktop) to 24px (mobile)
  - [ ] No content cut off on smallest screens (320px)

- [ ] **Modal Buttons**
  - [ ] "Sign In to Save Progress" button is ≥48px height
  - [ ] "Continue in Demo Mode" button is ≥44px height
  - [ ] Buttons stack vertically on mobile (<768px)
  - [ ] Button text does not wrap awkwardly
  - [ ] Tap targets are comfortable (no mis-taps)

- [ ] **Modal Dismissal**
  - [ ] X button is tappable (≥44x44px touch target)
  - [ ] Tapping outside modal (overlay) dismisses it
  - [ ] Modal animations are smooth (no jank)

#### 4. Locked Progress Preview

- [ ] **Preview Display**
  - [ ] Blurred background is visible and readable
  - [ ] Fake chart bars animate smoothly (pulse effect)
  - [ ] Content card is centered and readable
  - [ ] No horizontal scrolling

- [ ] **Button Sizing**
  - [ ] "Sign In to Unlock" button is full-width on mobile
  - [ ] Button is ≥48px height
  - [ ] Button text is legible and does not wrap

#### 5. Expiry Warning

- [ ] **Warning Display**
  - [ ] Orange warning banner is visually distinct
  - [ ] Warning icon (⚠️) is visible and not cut off
  - [ ] Text wraps correctly: "Your demo data will be deleted in X day(s)"
  - [ ] "Sign In Now" button is prominent

- [ ] **Warning Interaction**
  - [ ] Button is tappable and navigates to /
  - [ ] Warning persists across page refreshes (day 5-7)
  - [ ] Warning updates daily (1 day, 2 days, etc.)

#### 6. Touch Target Compliance

- [ ] **All Interactive Elements**
  - [ ] Demo banner "Sign In" button: ≥44x44px
  - [ ] Conversion modal X button: ≥44x44px
  - [ ] Conversion modal primary button: ≥48px height
  - [ ] Conversion modal secondary button: ≥44px height
  - [ ] Expiry warning "Sign In Now" button: ≥44px height
  - [ ] Locked preview "Sign In to Unlock" button: ≥48px height

#### 7. Orientation Changes

- [ ] **Portrait to Landscape**
  - [ ] Demo banner adjusts correctly
  - [ ] Conversion modal repositions appropriately
  - [ ] Toast notifications remain visible
  - [ ] No layout breakage

---

## Accessibility Testing

### Tools Required

- **Screen Readers:**
  - NVDA (Windows) - Free
  - JAWS (Windows) - Trial version
  - VoiceOver (macOS/iOS) - Built-in
  - TalkBack (Android) - Built-in

- **Browser Extensions:**
  - axe DevTools (Chrome/Firefox)
  - WAVE (Web Accessibility Evaluation Tool)
  - Lighthouse (Chrome DevTools)

- **Color Contrast Checkers:**
  - WebAIM Contrast Checker
  - Chrome DevTools Color Picker

---

### Accessibility Checklist

#### 1. Keyboard Navigation

- [ ] **Tab Navigation**
  - [ ] Tab through all interactive elements in logical order
  - [ ] Focus indicators are visible on all elements
  - [ ] Focus does not get trapped outside modals
  - [ ] No elements are skipped or unreachable

- [ ] **Demo Banner**
  - [ ] Tab to "Sign In" button shows focus indicator
  - [ ] Enter/Space activates button

- [ ] **Conversion Modal**
  - [ ] Modal traps focus when open (Tab cycles within modal)
  - [ ] First focusable element receives focus on open
  - [ ] Escape key closes modal
  - [ ] Focus returns to trigger element after close

- [ ] **Locked Progress Preview**
  - [ ] "Sign In to Unlock" button is keyboard accessible
  - [ ] Enter/Space activates button

#### 2. Screen Reader Announcements

- [ ] **Demo Banner**
  - [ ] Banner announces: "You're trying Habit Tracker. Sign in to sync across devices."
  - [ ] "Sign In" button is announced with clear label
  - [ ] Banner has `role="alert"` and `aria-live="polite"`

- [ ] **Conversion Modal**
  - [ ] Modal announces title and message on open
  - [ ] Modal has `role="dialog"`
  - [ ] Modal has `aria-labelledby` pointing to title
  - [ ] Modal has `aria-describedby` pointing to message
  - [ ] X button announces: "Close modal" or similar

- [ ] **Toast Notifications**
  - [ ] Toast announces milestone message immediately
  - [ ] Toast has `role="alert"` and `aria-live="polite"`
  - [ ] Toast does not interrupt current reading

- [ ] **Expiry Warning**
  - [ ] Warning announces: "Your demo data will be deleted in X days"
  - [ ] Warning has `role="alert"`
  - [ ] "Sign In Now" button has clear label

- [ ] **Locked Progress Preview**
  - [ ] Locked content is described as "preview of analytics charts"
  - [ ] Feature list is announced (7-day streak, trends, etc.)
  - [ ] Button label is clear: "Sign In to Unlock"

#### 3. Color Contrast (WCAG 2.1 AA)

- [ ] **Demo Banner**
  - [ ] White text on purple gradient: ≥4.5:1 contrast ratio
  - [ ] "Sign In" button white text on purple: ≥4.5:1

- [ ] **Expiry Warning**
  - [ ] White text on orange/yellow gradient: ≥4.5:1
  - [ ] "Sign In Now" button white text: ≥4.5:1

- [ ] **Conversion Modal**
  - [ ] Modal title text: ≥4.5:1 contrast
  - [ ] Modal body text: ≥4.5:1 contrast
  - [ ] Primary button white text on purple: ≥4.5:1
  - [ ] Secondary button purple text on white: ≥4.5:1

- [ ] **Toast Notifications**
  - [ ] White text on dark background: ≥4.5:1
  - [ ] Emoji contrast is adequate (if applicable)

- [ ] **Locked Progress Preview**
  - [ ] Content card text: ≥4.5:1 contrast
  - [ ] Button text: ≥4.5:1 contrast

#### 4. ARIA Attributes Verification

- [ ] **All Interactive Elements**
  - [ ] Buttons have descriptive labels (no "Click here")
  - [ ] Icons have `aria-label` if no visible text
  - [ ] Alerts have `role="alert"` and `aria-live`
  - [ ] Dialogs have `role="dialog"`, `aria-labelledby`, `aria-describedby`

#### 5. Focus Management

- [ ] **Conversion Modal**
  - [ ] Focus moves to modal on open
  - [ ] Focus is trapped within modal (cannot Tab outside)
  - [ ] Focus returns to trigger element on close
  - [ ] Escape key works consistently

- [ ] **Locked Progress Preview**
  - [ ] Focus outline is visible on button
  - [ ] Button activates on Enter and Space

#### 6. Automated Accessibility Scan

- [ ] **Run axe DevTools**
  - [ ] No critical or serious violations
  - [ ] Review and address moderate violations
  - [ ] Document any false positives

- [ ] **Run Lighthouse Accessibility Audit**
  - [ ] Score ≥95/100
  - [ ] Address any flagged issues

- [ ] **Run WAVE**
  - [ ] No errors
  - [ ] Review alerts and warnings

---

## Cross-Browser Compatibility

### Browsers to Test

**Desktop:**
- Chrome (latest version)
- Firefox (latest version)
- Safari (latest version)
- Edge (latest version)

**Mobile:**
- iOS Safari (latest)
- Chrome for Android (latest)
- Samsung Internet (if available)

---

### Cross-Browser Checklist

#### 1. Chrome (Desktop & Mobile)

- [ ] **All Features Work**
  - [ ] Demo mode initialization
  - [ ] Milestone toasts appear and dismiss
  - [ ] Conversion modal displays correctly
  - [ ] Locked progress preview renders
  - [ ] Expiry warning appears on correct days
  - [ ] Data migration succeeds

- [ ] **Performance**
  - [ ] No console errors
  - [ ] Page load time <2 seconds (4G)
  - [ ] Animations are smooth (60fps)

- [ ] **Data Persistence**
  - [ ] localStorage data persists across sessions
  - [ ] IndexedDB data persists
  - [ ] No quota errors

#### 2. Firefox (Desktop)

- [ ] **All Features Work**
  - [ ] Same checklist as Chrome

- [ ] **Firefox-Specific**
  - [ ] localStorage API works correctly
  - [ ] IndexedDB operations succeed
  - [ ] CSS gradients render correctly
  - [ ] Backdrop filters work (or graceful fallback)

#### 3. Safari (Desktop & iOS)

- [ ] **All Features Work**
  - [ ] Same checklist as Chrome

- [ ] **Safari-Specific**
  - [ ] localStorage size limits are respected
  - [ ] IndexedDB quota is not exceeded
  - [ ] CSS gradients render on older iOS versions
  - [ ] Touch events work on iOS (tap, scroll)
  - [ ] Sticky positioning works correctly
  - [ ] Modal scrolling works on iOS

- [ ] **iOS Safari Quirks**
  - [ ] Input fields do not zoom on focus (16px+ font size)
  - [ ] Sticky banner does not overlap with iOS Safari toolbar
  - [ ] Toast notifications do not overlap with bottom toolbar
  - [ ] Viewport height calculations are correct (100vh issues)

#### 4. Edge (Desktop)

- [ ] **All Features Work**
  - [ ] Same checklist as Chrome

- [ ] **Edge-Specific**
  - [ ] No Chromium-specific bugs
  - [ ] Performance is acceptable

#### 5. Samsung Internet (Android)

- [ ] **All Features Work**
  - [ ] Demo mode initialization
  - [ ] Toasts and modals display
  - [ ] Touch interactions work

- [ ] **Samsung-Specific**
  - [ ] No Samsung-specific rendering issues
  - [ ] localStorage and IndexedDB work

---

## Performance Testing

### Tools Required

- Chrome DevTools Performance Tab
- Lighthouse (Chrome DevTools)
- Network throttling (Simulate 4G/3G)
- Browser console for timing measurements

---

### Performance Checklist

#### 1. Initial Page Load

- [ ] **Welcome Page with Demo Button**
  - [ ] Load time <2 seconds on 4G connection
  - [ ] Time to Interactive (TTI) <3 seconds
  - [ ] First Contentful Paint (FCP) <1.5 seconds
  - [ ] Largest Contentful Paint (LCP) <2.5 seconds

- [ ] **Lighthouse Performance Score**
  - [ ] Desktop: ≥90/100
  - [ ] Mobile: ≥80/100

#### 2. Demo Mode Initialization

- [ ] **Timing**
  - [ ] `demoModeService.initializeDemoMode()` completes in <100ms
  - [ ] Navigation to /daily-log happens within 1 second
  - [ ] No blocking JavaScript during initialization

- [ ] **localStorage Operations**
  - [ ] Writing demo metrics <10ms
  - [ ] Reading demo metrics <5ms
  - [ ] No `QuotaExceededError` exceptions

#### 3. Metric Tracking Performance

- [ ] **Tracking Operations**
  - [ ] `trackHabitAdded()` completes in <10ms
  - [ ] `trackLogCompleted()` completes in <10ms
  - [ ] `trackProgressVisit()` completes in <10ms
  - [ ] Tracking does not block UI updates

#### 4. Conversion Trigger Checks

- [ ] **Modal Trigger Logic**
  - [ ] `shouldShowConversionModal()` completes in <5ms
  - [ ] Checking triggers does not delay habit save operation
  - [ ] Modal appears within 100ms of trigger

#### 5. Milestone Detection

- [ ] **Toast Notifications**
  - [ ] `getMilestoneMessage()` completes in <10ms
  - [ ] Toast appears within 100ms of milestone achievement
  - [ ] Toast animations are smooth (60fps)

#### 6. Data Migration Performance

- [ ] **Small Dataset (3 habits, 5 logs)**
  - [ ] Migration starts within 100ms after authentication
  - [ ] Migration completes within 2 seconds
  - [ ] No UI blocking during migration

- [ ] **Large Dataset (100 habits, 700 logs)**
  - [ ] Migration does not block UI
  - [ ] Progress indicator appears if migration >2 seconds
  - [ ] All data migrates successfully
  - [ ] No timeout errors

- [ ] **Migration Success Toast**
  - [ ] Appears within 500ms after migration completes
  - [ ] Does not cause layout shift

#### 7. Expiry Logic Performance

- [ ] **Date Calculations**
  - [ ] `getDaysInDemo()` completes in <5ms
  - [ ] `shouldExpireDemo()` completes in <5ms
  - [ ] Expiry check does not delay page load

#### 8. Component Rendering Performance

- [ ] **Demo Banner**
  - [ ] Renders in <50ms
  - [ ] Sticky positioning does not cause jank
  - [ ] No layout shifts when banner appears

- [ ] **Conversion Modal**
  - [ ] Opens in <300ms (including animation)
  - [ ] Slide-up animation is smooth (60fps)
  - [ ] No reflow/repaint issues

- [ ] **Toast Notifications**
  - [ ] Appears in <100ms
  - [ ] Slide-up animation is smooth (60fps)
  - [ ] Auto-dismiss does not cause jank

- [ ] **Locked Progress Preview**
  - [ ] Renders in <200ms
  - [ ] Blur filter does not impact performance
  - [ ] Pulse animations are smooth (30-60fps)

#### 9. Memory Usage

- [ ] **localStorage Size**
  - [ ] Demo metrics: <5KB
  - [ ] Shown milestones: <1KB
  - [ ] Total demo mode overhead: <10KB

- [ ] **IndexedDB Size**
  - [ ] 100 habits: ~50KB
  - [ ] 700 logs: ~200KB
  - [ ] No quota warnings for typical usage

- [ ] **Memory Leaks**
  - [ ] Open/close conversion modal 10 times - no memory increase
  - [ ] Navigate between pages 20 times - no memory increase
  - [ ] Chrome DevTools Memory Profiler shows no detached DOM nodes

#### 10. Network Performance

- [ ] **Offline Handling**
  - [ ] Demo mode works 100% offline
  - [ ] Migration gracefully fails if offline during signup
  - [ ] Retry mechanism works when connection restored

- [ ] **Sync Performance**
  - [ ] Demo data sync to Supabase <2 seconds (small dataset)
  - [ ] Demo data sync <10 seconds (large dataset)
  - [ ] Sync does not block other operations

---

## Test Execution Logs

### Tester Information
- **Name:** ___________________
- **Date:** ___________________
- **Environment:** ___________________

### Test Results Summary

| Test Category | Tests Passed | Tests Failed | Notes |
|---------------|--------------|--------------|-------|
| Mobile Device Testing | ___/42 | ___ | _____ |
| Accessibility Testing | ___/38 | ___ | _____ |
| Cross-Browser Compatibility | ___/25 | ___ | _____ |
| Performance Testing | ___/32 | ___ | _____ |
| **TOTAL** | **___/137** | **___** | **___** |

### Critical Issues Found
1. ___________________________________________________
2. ___________________________________________________
3. ___________________________________________________

### Recommendations for Production
- [ ] All critical issues resolved
- [ ] Accessibility audit score ≥95%
- [ ] Performance scores meet targets (Desktop ≥90, Mobile ≥80)
- [ ] No browser-specific blocking bugs
- [ ] Mobile touch targets meet 44x44px minimum

---

**Sign-off:**

**QA Lead:** ___________________ **Date:** ___________

**Product Manager:** ___________________ **Date:** ___________
