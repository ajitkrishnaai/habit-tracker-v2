# PRD #0003: Amara.day Pages, Polish & Dark Mode

**Project:** Habit Tracker V2 → Amara.day Redesign
**Phase:** PRD #2 - Pages, Polish & Dark Mode (Phases 3-5)
**Created:** 2025-10-19
**Status:** Pending PRD #1 Completion
**Estimated Effort:** 9-13 hours
**Timeline:** Week 3-4
**Prerequisites:** PRD #0002 (Foundation & Core Components) must be completed and validated

---

## 1. Introduction/Overview

This PRD covers the **second phase** of the Amara.day redesign, applying the design foundation from PRD #1 to all application pages, adding delightful interactions, and implementing dark mode support.

**Problem:** With the design foundation established (branding, colors, typography, core components), we need to apply this warm aesthetic across all pages and add polish that makes the app feel premium and delightful.

**Solution:** Redesign all four main pages (Welcome, Daily Log, Progress, Manage Habits) with the Amara.day design system, add micro-interactions and animations for delight, implement empty states with professional illustrations, and create a comprehensive dark mode experience.

**Prerequisites:**
- PRD #1 must be completed: Branding assets exist, design system defined, core components redesigned
- Validation checkpoint passed: Stakeholders confirm "This feels like Amara.day"
- Baseline metrics collected: Conversion rate, session duration, habits logged per week

---

## 2. Goals

1. **Apply Design Foundation**: Redesign all pages (Welcome, Daily Log, Progress, Manage Habits) using Amara.day design system
2. **Add Delightful Interactions**: Implement micro-animations, loading states, empty states, success feedback
3. **Implement Dark Mode**: Create comprehensive dark theme with smooth toggle experience
4. **Improve Conversion**: Enhance demo mode experience with warm, inviting UI to increase signup rate by 15-20%
5. **Maintain Performance**: Keep Lighthouse Performance 90+, Accessibility 95+
6. **Establish Visual Testing**: Set up Playwright screenshot comparison for future regression prevention

---

## 3. User Stories

### US-1: Demo Mode User Conversion
**As a** demo mode user exploring the app,
**I want** to see a beautiful, inviting Welcome page and warm conversion prompts,
**So that** I'm motivated to create an account and save my progress.

### US-2: Daily Logger
**As a** daily habit tracker,
**I want** the Daily Log page to feel calm and rewarding when I mark habits complete,
**So that** logging habits feels like a mindful ritual rather than a chore.

### US-3: Progress Enthusiast
**As a** user tracking progress,
**I want** the Progress page to celebrate my streaks and patterns with warm colors and animations,
**So that** I feel proud of my achievements and motivated to continue.

### US-4: Habit Manager
**As a** user managing habits,
**I want** adding new habits to feel smooth with a floating action button and success animation,
**So that** organizing my habits feels effortless and satisfying.

### US-5: Dark Mode Preference User
**As a** user who prefers dark themes for nighttime use,
**I want** a warm dark mode that's easy on my eyes,
**So that** I can use the app comfortably in low-light environments.

### US-6: New User with No Data
**As a** new user with no habits or logs yet,
**I want** to see encouraging empty states with beautiful illustrations,
**So that** I feel welcomed and know exactly what to do next.

---

## 4. Functional Requirements

### 4.1 Page Redesigns (Phase 3)

#### 4.1.1 Welcome Page Redesign

**FR-1**: Update `src/pages/WelcomePage.tsx` and `WelcomePage.css` with hero section
- **FR-1.1**: Display large Amara.day branding: sunrise icon (80px) + wordmark with gradient
- **FR-1.2**: Add tagline in large text: "Mindful habits. Lasting change."
- **FR-1.3**: Add subtitle in italic: "Your daily ritual. Built to last."
- **FR-1.4**: Apply gradient background: `linear-gradient(180deg, #FAF8F5 0%, #F5F1EB 100%)`
- **FR-1.5**: Add gentle pulse animation to sunrise icon (scale 1 → 1.05 → 1 over 3 seconds)
- **FR-1.6**: Center-align hero content with generous padding (`var(--space-3xl)`)

**FR-2**: Update "How It Works" section
- **FR-2.1**: Add circular gradient badges for step numbers (48px, terracotta gradient, white text)
- **FR-2.2**: Apply warm card styling to step cards (surface background, soft shadow)
- **FR-2.3**: Add subtle hover lift to step cards (`translateY(-2px)`)

**FR-3**: Update CTA (Call-to-Action) section
- **FR-3.1**: Style "Try Without Signing In" button with primary button styles from PRD #1
- **FR-3.2**: Add larger size variant for hero CTA (e.g., `padding: 1rem 3rem`)
- **FR-3.3**: Style email sign-in form with warm inputs and floating labels
- **FR-3.4**: Add privacy note in warm gray text below form

#### 4.1.2 Daily Log Page Redesign

**FR-4**: Update `src/pages/DailyLogPage.tsx` and `DailyLogPage.css` with warm header
- **FR-4.1**: Add page title "Today's Habits" in display font (DM Sans)
- **FR-4.2**: Add page subtitle "Track your mindful practice" in warm gray
- **FR-4.3**: Apply generous spacing (`var(--space-xl)`) around header

**FR-5**: Redesign date navigator
- **FR-5.1**: Apply pill-shaped active date (terracotta background, white text, `border-radius: var(--radius-full)`)
- **FR-5.2**: Style arrow buttons with warm gray backgrounds and hover states
- **FR-5.3**: Add smooth slide transition when changing dates (fade out/in with `opacity` + `transform`)

**FR-6**: Update habit cards styling
- **FR-6.1**: Apply warm surface background, soft shadow, rounded corners (`var(--radius-lg)`)
- **FR-6.2**: Add category badges with colored backgrounds (terracotta, sage, sunset, olive)
- **FR-6.3**: Implement hover lift animation for visual feedback
- **FR-6.4**: Add completion animation: When toggle switches ON, card pulses (scale 1 → 1.02 → 1) and checkmark fades in

**FR-7**: Enhance notes section
- **FR-7.1**: Increase textarea size, apply warm border and surface background
- **FR-7.2**: Add floating label: "Add notes about your day..."
- **FR-7.3**: Style character count in warm gray, right-aligned
- **FR-7.4**: Update save button with primary gradient and icon

#### 4.1.3 Progress Page Redesign

**FR-8**: Update `src/pages/ProgressPage.tsx` and `ProgressPage.css` with warm header
- **FR-8.1**: Add page title "Progress" in display font
- **FR-8.2**: Add page subtitle "Track your habits and discover patterns"
- **FR-8.3**: Apply generous spacing around header

**FR-9**: Update `src/components/ProgressCard.tsx` with gradient border
- **FR-9.1**: Add 4px top border with gradient: `linear-gradient(90deg, #D4745E 0%, #8B9A7E 100%)`
- **FR-9.2**: Apply warm surface background, rounded corners, soft shadow
- **FR-9.3**: Add hover lift animation

**FR-10**: Add warm-toned stat icons
- **FR-10.1**: Create flame icon SVG for current streak (warm gradient: terracotta to sunset)
- **FR-10.2**: Create trophy icon SVG for longest streak (warm gold: #E89C5A)
- **FR-10.3**: Create chart icon SVG for completion percentage (warm colors)
- **FR-10.4**: Display numbers in display font (DM Sans) with larger size

**FR-11**: Update pattern analysis section
- **FR-11.1**: Style keyword badges as rounded pills with category colors (terracotta, sage, sunset)
- **FR-11.2**: Highlight correlation text with warm background (`--color-surface`)
- **FR-11.3**: Use warm-toned sentiment indicators (e.g., warm emoji or colored dots)

**FR-12**: Add colorful charts/visualizations
- **FR-12.1**: Use warm color palette for charts (not cold blues):
  - Bar charts: Terracotta gradient
  - Line charts: Sage green strokes
  - Sparklines: Sunset orange
- **FR-12.2**: Ensure chart colors meet WCAG AA contrast requirements

#### 4.1.4 Manage Habits Page Redesign

**FR-13**: Update `src/pages/ManageHabitsPage.tsx` with responsive grid
- **FR-13.1**: Implement grid layout: 1 column (mobile), 2 columns (tablet 768px+), 2-3 columns (desktop 1024px+)
- **FR-13.2**: Apply gap spacing (`var(--space-lg)`)

**FR-14**: Update habit card styling
- **FR-14.1**: Apply warm surface background, rounded corners, soft shadow
- **FR-14.2**: Style edit/delete icon buttons with warm hover colors (terracotta for edit, error color for delete)
- **FR-14.3**: Add hover lift animation

**FR-15**: Create floating action button (FAB) for "Add Habit"
- **FR-15.1**: Create circular FAB component (64px diameter)
- **FR-15.2**: Position fixed: bottom 2rem, right 2rem
- **FR-15.3**: Apply terracotta-to-sunset gradient background
- **FR-15.4**: Add large shadow (`--shadow-xl`)
- **FR-15.5**: Hover animation: Scale to 1.1 + rotate 90° (plus icon rotates)
- **FR-15.6**: Add glow effect on hover: `box-shadow: 0 20px 60px rgba(212, 116, 94, 0.4)`
- **FR-15.7**: On click, open habit form modal

**FR-16**: Update habit form modal
- **FR-16.1**: Add slide-up animation from bottom (transform: translateY(100%) → translateY(0))
- **FR-16.2**: Apply warm surface background with rounded top corners
- **FR-16.3**: Use warm inputs with floating labels
- **FR-16.4**: Style category color picker with warm palette swatches
- **FR-16.5**: Add backdrop overlay (semi-transparent warm dark color)

### 4.2 Polish & Delight (Phase 4)

#### 4.2.1 Loading States

**FR-17**: Create `src/components/LoadingScreen.tsx` component
- **FR-17.1**: Display Amara.day logo (sunrise icon 80px + wordmark)
- **FR-17.2**: Add gentle pulse animation to icon
- **FR-17.3**: Display loading message: "Building your day..."
- **FR-17.4**: Apply warm background gradient
- **FR-17.5**: Center content vertically and horizontally

**FR-18**: Create skeleton screen components
- **FR-18.1**: Implement `Skeleton` component with gradient shimmer animation
- **FR-18.2**: Use warm colors for skeleton: `--color-surface` → `--color-border-light` → `--color-surface`
- **FR-18.3**: Animation: Background slides right-to-left over 1.5 seconds (infinite loop)
- **FR-18.4**: Create skeleton variants: `SkeletonCard`, `SkeletonText`, `SkeletonButton`

#### 4.2.2 Empty States

**FR-19**: Create professional empty state illustration
- **FR-19.1**: Commission hand-drawn sunrise illustration (warm terracotta/sunset colors, organic style)
- **FR-19.2**: Illustration dimensions: 200x200px @ 2x resolution (400x400px actual)
- **FR-19.3**: Export as SVG (preferred) or optimized PNG
- **FR-19.4**: Ensure illustration matches Amara.day warm aesthetic

**FR-20**: Update `src/components/EmptyState.tsx` component
- **FR-20.1**: Display illustration at 200px width
- **FR-20.2**: Add title in display font (e.g., "No habits yet")
- **FR-20.3**: Add encouraging message in warm gray (e.g., "Start tracking habits to see your progress bloom")
- **FR-20.4**: Style CTA button with primary button styles
- **FR-20.5**: Center-align content with generous spacing

**FR-21**: Apply empty states to pages
- **FR-21.1**: Daily Log: "No habits yet. Add your first habit to get started!"
- **FR-21.2**: Progress: "No progress yet. Start tracking habits to see your progress bloom."
- **FR-21.3**: Manage Habits: "Your habit garden awaits. Plant your first habit!"

#### 4.2.3 Success Animations

**FR-22**: Create confetti animation for first habit added
- **FR-22.1**: Implement lightweight canvas-based confetti (no external library)
- **FR-22.2**: Use warm colors: terracotta (#D4745E), sage (#8B9A7E), sunset (#E89C5A), dusty rose (#C89F94)
- **FR-22.3**: Spawn 20-30 particles falling from top over 2-3 seconds
- **FR-22.4**: Trigger on first habit creation only (use localStorage flag)

**FR-23**: Create streak milestone animations
- **FR-23.1**: For 7-day streak: Small flame animation (scale pulse + gentle flicker)
- **FR-23.2**: For 14-day streak: Medium flame with sparkle particles
- **FR-23.3**: For 30-day streak: Large flame with confetti
- **FR-23.4**: Display toast notification with flame emoji: "🔥 30-day streak! You're on fire!"

**FR-24**: Create daily log completion animation
- **FR-24.1**: When all habits marked done for the day, trigger checkmark ripple effect
- **FR-24.2**: Ripple: Circular wave expanding from center (CSS keyframe animation)
- **FR-24.3**: Scale pulse: Element scales 1 → 1.05 → 1 with warm success color
- **FR-24.4**: Duration: 600ms with ease-out timing

**FR-25**: Create notes saved feedback
- **FR-25.1**: Display toast notification sliding from top: "Notes saved ✓"
- **FR-25.2**: Auto-dismiss after 3 seconds with fade-out
- **FR-25.3**: Apply warm surface background, soft shadow

#### 4.2.4 Toast Notifications

**FR-26**: Create `src/components/Toast.tsx` component
- **FR-26.1**: Support variants: `success` (sage green), `error` (warm red), `info` (terracotta)
- **FR-26.2**: Slide-in animation from top: `transform: translateY(-100%) → translateY(0)`
- **FR-26.3**: Apply warm background, rounded corners, soft shadow
- **FR-26.4**: Auto-dismiss after specified duration (default 3 seconds)
- **FR-26.5**: Include close button (X icon) for manual dismissal
- **FR-26.6**: Position: fixed top center, z-index above all content

**FR-27**: Create toast manager/context
- **FR-27.1**: Implement `ToastContext` for global toast management
- **FR-27.2**: Provide `useToast()` hook for triggering toasts
- **FR-27.3**: Support stacking multiple toasts (max 3 visible at once)

#### 4.2.5 Footer Redesign

**FR-28**: Update `src/components/Footer.tsx` with warm styling
- **FR-28.1**: Add small Amara.day wordmark (16px icon + text)
- **FR-28.2**: Style links (Privacy, Terms) with warm colors (terracotta on hover)
- **FR-28.3**: Add copyright with dynamic year: `© ${new Date().getFullYear()} Amara.day`
- **FR-28.4**: Apply warm gray text color (`--color-text-tertiary`)
- **FR-28.5**: Add subtle top border (`1px solid var(--color-border)`)

### 4.3 Dark Mode Implementation (Phase 5)

#### 4.3.1 Dark Mode Color System

**FR-29**: Update `src/styles/colors.css` with dark mode palette
- **FR-29.1**: Define `[data-theme="dark"]` color overrides:
  - Primary: `--color-primary: #E89676` (lighter terracotta for visibility)
  - Success: `--color-success: #A8B89A` (muted sage)
  - Background: `--color-background: #1E1B17` (deep warm charcoal)
  - Surface: `--color-surface: #2C2822` (warm brown)
  - Border: `--color-border: #4A4640` (warm dark gray)
  - Text Primary: `--color-text-primary: #F5F1EB` (warm off-white)
  - Text Secondary: `--color-text-secondary: #B8AFA3`
- **FR-29.2**: Update shadows for dark mode (lighter, softer):
  - `--shadow-sm: 0 2px 8px rgba(0,0,0,0.3)`
  - `--shadow-md: 0 4px 16px rgba(0,0,0,0.4)`
  - `--shadow-lg: 0 8px 32px rgba(0,0,0,0.5)`

**FR-30**: Verify WCAG AA contrast in dark mode
- **FR-30.1**: Test primary text (#F5F1EB) on background (#1E1B17) - must meet 4.5:1
- **FR-30.2**: Test interactive elements (buttons, links) for sufficient contrast
- **FR-30.3**: Document any failing combinations and provide alternatives

#### 4.3.2 Dark Mode Toggle

**FR-31**: Create `src/components/DarkModeToggle.tsx` component
- **FR-31.1**: Display sun icon (light mode) or moon icon (dark mode)
- **FR-31.2**: Implement toggle button with smooth icon transition (fade out/in or rotate)
- **FR-31.3**: On click, toggle `data-theme` attribute on `<html>` element
- **FR-31.4**: Respect system preference on initial load: `window.matchMedia('(prefers-color-scheme: dark)')`
- **FR-31.5**: Do NOT store preference in localStorage (per user decision: system preference only)
- **FR-31.6**: Add `aria-label`: "Switch to dark mode" / "Switch to light mode"
- **FR-31.7**: Style toggle with warm colors (icon color matches theme)

**FR-32**: Add dark mode toggle to Navigation
- **FR-32.1**: Position toggle in top-right of Navigation (mobile and desktop)
- **FR-32.2**: Ensure toggle has 44x44px touch target
- **FR-32.3**: Apply smooth hover state (slight scale or glow)

#### 4.3.3 Dark Mode Application

**FR-33**: Apply dark mode to all components
- **FR-33.1**: Test all components from PRD #1 in dark mode (Navigation, ToggleSwitch, Buttons, Inputs, Cards)
- **FR-33.2**: Adjust logo variant: Use warm off-white (#F5F1EB) wordmark in dark mode
- **FR-33.3**: Ensure borders are visible in dark mode (use lighter warm grays)
- **FR-33.4**: Verify shadows are visible (may need to increase opacity)

**FR-34**: Apply dark mode to all pages
- **FR-34.1**: Test Welcome page hero gradient in dark mode (adjust to dark warm tones)
- **FR-34.2**: Test Daily Log habit cards, ensure readability and visual hierarchy
- **FR-34.3**: Test Progress page charts, ensure colors remain distinguishable
- **FR-34.4**: Test Manage Habits page FAB, ensure shadow visible on dark background

**FR-35**: Add smooth theme transition
- **FR-35.1**: Apply 300ms ease-in-out transition to `background-color`, `border-color`, `color` (already implemented in PRD #1 FR-11.1)
- **FR-35.2**: Ensure no jarring flashes during theme toggle
- **FR-35.3**: Test transition on all pages and components

#### 4.3.4 Dark Mode Testing

**FR-36**: Create E2E tests for dark mode
- **FR-36.1**: Add Playwright test: "should toggle dark mode when dark mode toggle is clicked"
- **FR-36.2**: Add Playwright test: "should respect system preference on initial load"
- **FR-36.3**: Add Playwright test: "all pages render correctly in dark mode"
- **FR-36.4**: Capture screenshots in dark mode for visual regression testing

### 4.4 Visual Regression Testing (Phase 5)

**FR-37**: Set up Playwright screenshot comparison
- **FR-37.1**: Create `e2e/visual-regression.spec.ts` test file
- **FR-37.2**: Capture baseline screenshots for all pages in light and dark mode
- **FR-37.3**: Store screenshots in `e2e/screenshots/baseline/` directory
- **FR-37.4**: Configure Playwright to compare screenshots on test runs
- **FR-37.5**: Set pixel difference threshold (e.g., 0.2% tolerance for minor anti-aliasing differences)

**FR-38**: Document visual regression testing workflow
- **FR-38.1**: Create `VISUAL_TESTING.md` with instructions for:
  - Running visual tests: `npm run test:e2e:visual`
  - Updating baselines when design changes intentionally
  - Reviewing diff images when tests fail
- **FR-38.2**: Add npm script: `"test:e2e:visual": "playwright test e2e/visual-regression.spec.ts"`

---

## 5. Non-Goals (Out of Scope)

**NG-1**: Advanced animation libraries (Framer Motion, React Spring) - using pure CSS only

**NG-2**: Real-time multi-device dark mode sync - system preference only, no user storage

**NG-3**: Custom theme builder or user-customizable color palettes

**NG-4**: Seasonal palette variations (e.g., winter theme, spring theme)

**NG-5**: Sound effects for success states

**NG-6**: Animated onboarding tour (may be added post-launch)

**NG-7**: Export progress as shareable images (future enhancement)

**NG-8**: Push notifications or reminder system

---

## 6. Technical Considerations

### 6.1 Animation Performance

- **Pure CSS animations** are GPU-accelerated (use `transform` and `opacity`, avoid animating `width`, `height`, `top`, `left`)
- **Canvas-based confetti** runs on separate thread, won't block main UI thread
- **Debounce rapid toggles** to prevent animation performance issues

### 6.2 Dark Mode System Preference Detection

- Use `window.matchMedia('(prefers-color-scheme: dark)')` on initial load
- Listen for system preference changes: `matchMedia.addEventListener('change', ...)`
- Apply `data-theme="dark"` or `data-theme="light"` to `<html>` element

### 6.3 Toast Management

- Use React Context + custom hook pattern for global toast state
- Implement toast queue with max 3 visible toasts (auto-dismiss oldest if queue exceeds)
- Use `setTimeout` for auto-dismiss, clear timeout on manual close

### 6.4 Visual Regression Testing

- Playwright's `toHaveScreenshot()` API for screenshot comparison
- Store baselines in version control (git LFS optional for large images)
- Run visual tests only on CI for specific PRs (not every commit to save time)

### 6.5 Professional Illustration

- Hire illustrator from platforms: Dribbble, Fiverr, Upwork, 99designs
- Provide brand guidelines: Warm earthy colors, organic hand-drawn style, sunrise theme
- Budget: $50-$200 for 3-5 empty state illustrations (range depends on complexity)

---

## 7. Performance Requirements

**PR-1**: Maintain Lighthouse Performance score 90+ (no regressions from PRD #1)

**PR-2**: First Contentful Paint (FCP) must remain < 1.5 seconds on 4G

**PR-3**: Confetti animation must not drop below 30 FPS (use `requestAnimationFrame`)

**PR-4**: Dark mode toggle transition must complete within 300ms

**PR-5**: Page transitions must be smooth (no layout shifts or jank)

**PR-6**: Total CSS bundle size increase from PRD #1 must be < 15KB gzipped

**PR-7**: Empty state illustrations must be optimized (SVG < 10KB or PNG < 50KB)

---

## 8. Security & Compliance

**SC-1**: No new security risks introduced (UI-only changes)

**SC-2**: Commissioned illustrations must have proper licensing for commercial use

**SC-3**: Canvas-based confetti must not execute untrusted code (use inline implementation only)

**SC-4**: Toast notifications must not display sensitive user data (sanitize inputs)

---

## 9. Data Requirements

**DR-1**: No database schema changes required

**DR-2**: Dark mode preference NOT stored (system preference only per user decision)

**DR-3**: Confetti "first habit" flag stored in localStorage: `amaday_confetti_shown`

**DR-4**: Streak milestone animations may query existing logs from IndexedDB (no new data storage)

---

## 10. Design Considerations

### 10.1 Empty State Copy Guidelines

- **Tone**: Encouraging, warm, actionable (not negative or harsh)
- **Length**: 1-2 short sentences maximum
- **CTA**: Clear next action (e.g., "Add Your First Habit")
- **Examples**:
  - ✅ "Your habit garden awaits. Plant your first habit!"
  - ✅ "No progress yet. Start tracking to see your growth bloom."
  - ❌ "Nothing here." (too cold)
  - ❌ "You haven't added any habits yet, so there's nothing to show." (too wordy)

### 10.2 Animation Timing Guidelines

- **Micro-interactions** (hover, focus): 150ms fast
- **Component transitions** (modal open, toast slide): 250ms base
- **Page transitions**: 300ms slow
- **Celebrations** (confetti, streak): 2-3 seconds (one-time, not repetitive)

### 10.3 Dark Mode Design Principles

- **Warm, not cold**: Use warm browns/grays, not pure black (#000000)
- **Softer shadows**: Increase opacity for visibility on dark backgrounds
- **Avoid pure white text**: Use warm off-white (#F5F1EB) for reduced eye strain
- **Maintain warmth**: Dark mode should still feel inviting, not harsh or techy

### 10.4 Professional Illustration Brief

**Style**: Hand-drawn, organic, warm
**Colors**: Terracotta (#D4745E), Sunset Orange (#E89C5A), Sage Green (#8B9A7E)
**Theme**: Sunrise, growth, mindfulness
**Scenes**:
1. Empty habits: Single sunrise over horizon with small plant sprouting
2. Empty progress: Sun rising with path leading forward
3. Empty logs: Sunrise with calendar/journal motif

---

## 11. User Experience Flow

### 11.1 Demo User Conversion Journey (Enhanced)

1. User lands on **Welcome page** → Sees beautiful hero with Amara.day branding and warm gradient
2. Clicks "Try Without Signing Up" → Enters app with DemoBanner visible
3. Navigates to Manage Habits → Sees empty state with sunrise illustration: "Your habit garden awaits"
4. Clicks "Add Your First Habit" → FAB opens modal with warm styling
5. Creates first habit → **Confetti animation** + ConversionModal: "Great start! Sign up to save your progress."
6. Dismisses modal → Continues exploring
7. Marks first habit done on Daily Log → **Checkmark animation** + ConversionModal reappears
8. Reaches 7-day streak → **Flame animation** + Toast: "🔥 7-day streak!"
9. Visits Progress page → Sees warm charts and stats + final ConversionModal
10. Decides to sign up → Data seamlessly migrates to authenticated account

### 11.2 Dark Mode User Journey

1. User visits app at night → System preference detects dark mode
2. App loads with warm dark theme (brown backgrounds, off-white text)
3. User manually toggles to light mode using sun/moon icon in Navigation
4. Smooth 300ms transition: colors fade to light theme
5. User toggles back to dark mode → Smooth transition back
6. User closes app → Next visit respects system preference again (no storage)

### 11.3 Empty State to Content Journey

1. New user sees empty state on Daily Log → Sunrise illustration with "No habits yet"
2. Clicks "Add Your First Habit" → Modal opens
3. Creates habit → Empty state disappears, habit card appears with warm styling
4. User logs habit → Toggle animates smoothly, checkmark appears
5. User visits Progress page → Empty state: "No progress yet. Start tracking..."
6. Returns to Daily Log, logs more habits → Progress page populates with warm charts and streaks

---

## 12. Error Handling

### 12.1 Animation Errors

**EH-1**: If canvas API unavailable (very old browsers), skip confetti animation gracefully (no crash)

**EH-2**: If CSS animations disabled (reduced motion preference), skip all decorative animations but maintain functional interactions

### 12.2 Illustration Loading Errors

**EH-3**: If empty state illustration fails to load, display text-only empty state with emoji fallback (e.g., 🌅)

**EH-4**: Use `<img>` `onerror` handler to show fallback SVG icon if PNG fails

### 12.3 Dark Mode Errors

**EH-5**: If `matchMedia` API unavailable, default to light mode

**EH-6**: If dark mode toggle fails, display toast error: "Unable to switch theme. Please refresh."

### 12.4 Toast Errors

**EH-7**: If toast fails to render, log to console but don't crash app (toasts are non-critical)

**EH-8**: Limit toast queue to prevent memory leaks (max 10 toasts in history, auto-clear oldest)

---

## 13. Success Metrics

### 13.1 Conversion Metrics (Primary Goal)

**SM-1**: Demo → Signup conversion rate: **+15-20% improvement** from baseline (tracked via demo mode analytics)

**SM-2**: Time to first signup: Measure if enhanced Welcome page reduces friction

**SM-3**: Conversion prompt click-through rate: Track which milestones drive most signups

### 13.2 Engagement Metrics

**SM-4**: Daily log session duration: **+10% increase** (warm UX encourages longer engagement)

**SM-5**: Habits logged per user per week: **Maintain or +5%** (better UX encourages consistency)

**SM-6**: Progress page visit frequency: Track if warm charts increase visits

### 13.3 Performance Metrics

**SM-7**: Lighthouse Performance: Maintain **90+** score (no regressions from PRD #1)

**SM-8**: First Contentful Paint: Maintain **< 1.5s** on 4G

**SM-9**: Cumulative Layout Shift (CLS): **< 0.1** (stable page loads)

### 13.4 Accessibility Metrics

**SM-10**: Lighthouse Accessibility: Maintain **95+** score in both light and dark modes

**SM-11**: axe-core violations: **0** in both themes

**SM-12**: Keyboard navigation: **100%** of features operable without mouse

### 13.5 Dark Mode Adoption

**SM-13**: Percentage of users using dark mode: Track via analytics (expected 20-40% based on system preferences)

**SM-14**: Theme toggle usage: Track manual toggles (if analytics available)

---

## 14. Acceptance Criteria

### 14.1 Page Redesigns (Phase 3)

**AC-1**: Welcome page displays Amara.day hero with large logo, tagline, subtitle, and gradient background

**AC-2**: "How It Works" step cards have circular gradient badges, warm backgrounds, and hover lift

**AC-3**: Daily Log page has warm header, pill-shaped active date, and colorful habit cards

**AC-4**: Habit cards on Daily Log pulse and show checkmark animation when toggled ON

**AC-5**: Progress page has gradient-bordered cards, warm stat icons (flame, trophy, chart), and colorful visualizations

**AC-6**: Manage Habits page uses responsive grid layout (1/2/3 columns)

**AC-7**: Floating Action Button (FAB) appears on Manage Habits page with gradient, shadow, and hover animation (scale + rotate)

**AC-8**: Habit form modal slides up from bottom with warm styling and backdrop overlay

### 14.2 Polish & Delight (Phase 4)

**AC-9**: LoadingScreen component displays Amara.day branding with pulse animation

**AC-10**: Skeleton screens use warm gradient shimmer animation

**AC-11**: Empty states display professional sunrise illustration (200px) with encouraging copy and CTA button

**AC-12**: Confetti animation triggers on first habit creation with warm-colored particles

**AC-13**: Streak milestone animations display for 7, 14, 30-day streaks with flame icon and toast notification

**AC-14**: Daily log completion animation (checkmark ripple) triggers when all habits marked done

**AC-15**: Toast notifications slide in from top, auto-dismiss after 3 seconds, and support success/error/info variants

**AC-16**: Footer displays Amara.day wordmark, Privacy/Terms links, and dynamic copyright year in warm colors

### 14.3 Dark Mode (Phase 5)

**AC-17**: Dark mode colors defined in `colors.css` under `[data-theme="dark"]` selector

**AC-18**: Dark mode meets WCAG AA contrast requirements (verified with Lighthouse and manual testing)

**AC-19**: DarkModeToggle component displays sun/moon icon and toggles `data-theme` attribute on click

**AC-20**: Dark mode toggle positioned in Navigation with 44x44px touch target

**AC-21**: App respects system preference on initial load (`prefers-color-scheme: dark`)

**AC-22**: Theme transition is smooth (300ms) with no jarring flashes

**AC-23**: All components from PRD #1 render correctly in dark mode (Navigation, ToggleSwitch, Buttons, Inputs, Cards)

**AC-24**: All pages render correctly in dark mode (Welcome, Daily Log, Progress, Manage Habits)

**AC-25**: Amara.day logo uses warm off-white wordmark in dark mode

**AC-26**: Shadows are visible in dark mode (increased opacity)

### 14.4 Visual Regression Testing

**AC-27**: Playwright screenshot comparison test file created (`e2e/visual-regression.spec.ts`)

**AC-28**: Baseline screenshots captured for all pages in light and dark mode

**AC-29**: `npm run test:e2e:visual` script runs visual regression tests

**AC-30**: `VISUAL_TESTING.md` documentation created with workflow instructions

### 14.5 Performance & Accessibility (All Phases)

**AC-31**: Lighthouse Performance score ≥ 90 (light and dark modes)

**AC-32**: Lighthouse Accessibility score ≥ 95 (light and dark modes)

**AC-33**: First Contentful Paint < 1.5 seconds on 4G throttling

**AC-34**: Confetti animation runs at 30+ FPS (smooth, no lag)

**AC-35**: axe-core reports 0 violations in both light and dark modes

**AC-36**: All interactive elements keyboard-navigable (Tab, Enter, Space)

### 14.6 Cross-Browser Compatibility (All Phases)

**AC-37**: All features work correctly in Chrome (latest), Safari (macOS + iOS), Firefox (latest)

**AC-38**: Dark mode renders correctly in all tested browsers

**AC-39**: Animations run smoothly in all tested browsers

### 14.7 Conversion & Engagement (Post-Launch Tracking)

**AC-40**: Demo → Signup conversion rate increased by 15-20% (measured 2 weeks post-launch)

**AC-41**: Session duration increased by 10% (measured 2 weeks post-launch)

**AC-42**: Habits logged per user per week maintained or increased by 5%

---

## 15. Open Questions

**OQ-1**: Should the FAB on Manage Habits page also appear on mobile, or only desktop? (Current spec: all devices)

**OQ-2**: Should we add a "What's New" modal on first load after redesign to showcase new features?

**OQ-3**: For streak milestone animations, should flames be static SVG icons or CSS-animated (flickering effect)?

**OQ-4**: Should empty state illustrations be commissioned as a set (consistent style) or individually?

**OQ-5**: If user has system dark mode preference but manually toggles to light, should we override system preference for future visits? (Current spec: No, always respect system)

**OQ-6**: Should we add a subtle sound effect for confetti (with user preference to disable)?

**OQ-7**: For visual regression tests, should we test every page or just key pages (Welcome, Daily Log)?

**OQ-8**: Should the toast notification stack vertically or horizontally when multiple toasts appear?

---

## 16. Implementation Notes for Developers

### 16.1 Getting Started

1. **Ensure PRD #1 is complete**: Verify all design foundation (colors, typography, core components) is implemented
2. **Review baseline metrics**: Note current conversion rate, session duration, performance scores
3. **Start with Phase 3**: Redesign pages one-by-one, test each before moving to next
4. **Commission illustrations early**: Hire illustrator at start of Phase 3 so assets ready for Phase 4
5. **Build Phase 4 incrementally**: Add polish features (loading, empty states, animations) as pages are completed
6. **Implement Phase 5 last**: Dark mode is additive layer, easier when all light mode pages complete

### 16.2 Testing Strategy

- **Visual testing**: Manually review each page at 320px, 375px, 768px, 1440px in both light and dark modes
- **Animation testing**: Use Chrome DevTools Performance tab to verify 60 FPS, CPU throttling to test on slower devices
- **Dark mode testing**: Toggle theme multiple times, ensure no flashing or broken colors
- **Conversion testing**: Clear localStorage, test full demo mode journey end-to-end
- **Accessibility testing**: Run axe-core, test keyboard navigation, verify focus indicators visible in both themes

### 16.3 Common Pitfalls to Avoid

- **Don't skip dark mode testing**: Easy to miss contrast issues or invisible borders
- **Don't over-animate**: Too many animations can feel chaotic, use sparingly for delight
- **Don't hardcode dark colors**: Use CSS variables even for dark mode (`var(--color-background)`)
- **Don't forget reduced motion**: Wrap all decorative animations in `@media (prefers-reduced-motion: no-preference)`
- **Don't skip confetti flag**: Without localStorage check, confetti will trigger on every habit creation (annoying)
- **Don't block on illustrations**: Use placeholder SVGs/emojis if professional illustrations delayed

### 16.4 File Organization

```
src/
├── components/
│   ├── LoadingScreen.tsx (new)
│   ├── Skeleton.tsx (new)
│   ├── EmptyState.tsx (update)
│   ├── Toast.tsx (new)
│   ├── ToastContext.tsx (new)
│   ├── DarkModeToggle.tsx (new)
│   ├── FloatingActionButton.tsx (new - FAB)
│   ├── Footer.tsx (update)
├── pages/
│   ├── WelcomePage.tsx + .css (update)
│   ├── DailyLogPage.tsx + .css (update)
│   ├── ProgressPage.tsx + .css (update)
│   ├── ManageHabitsPage.tsx + .css (update)
├── styles/
│   ├── colors.css (update with dark mode)
│   ├── animations.css (new - confetti, streaks, checkmarks)
├── utils/
│   ├── confetti.ts (new - canvas confetti implementation)
│   ├── darkMode.ts (new - system preference detection)
public/
├── illustrations/
│   ├── empty-habits.svg (new - commissioned)
│   ├── empty-progress.svg (new - commissioned)
│   ├── empty-logs.svg (new - commissioned)
e2e/
├── visual-regression.spec.ts (new)
├── screenshots/
│   ├── baseline/ (new - baseline screenshots)
VISUAL_TESTING.md (new)
```

---

## 17. Dependencies

**No new npm packages required** (pure CSS + vanilla JS approach)

**External dependencies:**
- Professional illustrator (budget: $50-$200 for 3-5 illustrations)
- Google Fonts woff2 files (already self-hosted in PRD #1)

---

## 18. Risks and Mitigations

### Risk 1: Dark Mode Contrast Issues
**Mitigation**: Run Lighthouse Accessibility audit early in Phase 5, adjust colors before finalizing

### Risk 2: Animation Performance on Low-End Devices
**Mitigation**: Test on throttled CPU (Chrome DevTools), simplify animations if FPS drops below 30

### Risk 3: Commissioned Illustrations Delayed
**Mitigation**: Use placeholder SVG icons/emojis until professional assets ready, don't block launch

### Risk 4: Confetti Performance Impact
**Mitigation**: Use `requestAnimationFrame`, limit particle count to 20-30, auto-cleanup after 3 seconds

### Risk 5: Visual Regression Tests Too Sensitive
**Mitigation**: Set pixel difference threshold (0.2% tolerance), use consistent test environment (Docker or CI)

### Risk 6: Conversion Rate Doesn't Improve
**Mitigation**: Track intermediate metrics (CTA clicks, time on Welcome page), A/B test copy/design if needed

---

## 19. Timeline and Effort Estimate

**Total Estimated Effort**: 9-13 hours

### Phase 3: Page Redesigns (4-5 hours)
- Welcome Page: 1 hour
- Daily Log Page: 1.5 hours
- Progress Page: 1.5 hours
- Manage Habits Page (with FAB): 1.5 hours

### Phase 4: Polish & Delight (2-3 hours)
- Loading states: 0.5 hours
- Empty states (with placeholders): 0.5 hours
- Success animations (confetti, streaks, checkmarks): 1.5 hours
- Toast notifications: 0.5 hours
- Footer redesign: 0.25 hours

### Phase 5: Dark Mode (2-3 hours)
- Dark mode color system: 0.5 hours
- Dark mode toggle component: 0.5 hours
- Apply dark mode to all components: 1 hour
- Apply dark mode to all pages: 0.5 hours
- Dark mode testing and refinements: 0.5 hours

### Phase 5: Visual Regression Testing (1-2 hours)
- Set up Playwright screenshots: 0.5 hours
- Capture baseline screenshots: 0.5 hours
- Document workflow: 0.5 hours

### Testing and Polish (1-2 hours)
- Cross-browser testing: 0.5 hours
- Accessibility testing (light + dark): 0.5 hours
- Performance testing: 0.5 hours
- Bug fixes and refinements: 0.5 hours

### Professional Illustrations (External)
- Timeline: 1-2 weeks turnaround (commission at start of Phase 3)
- Cost: $50-$200 total

---

## 20. Success Validation

### Validation Checkpoint 1: After Phase 3 Completion
- **Question**: "Do all pages feel cohesive with the Amara.day design system?"
- **Test**: Navigate through all pages, ensure consistent colors, typography, spacing
- **Action**: Make adjustments if any page feels off-brand

### Validation Checkpoint 2: After Phase 4 Completion
- **Question**: "Do animations feel delightful without being distracting?"
- **Test**: Trigger all animations (confetti, streaks, checkmarks), gather feedback
- **Action**: Reduce animation duration or frequency if too much

### Validation Checkpoint 3: After Phase 5 Completion
- **Question**: "Is dark mode comfortable for nighttime use?"
- **Test**: Use app in dark mode for 10 minutes, check for eye strain or readability issues
- **Action**: Adjust contrast or reduce brightness if needed

### Final Validation: 2 Weeks Post-Launch
- **Metrics Review**: Compare conversion rate, session duration, habits logged to baseline
- **User Feedback**: Gather qualitative feedback on redesign warmth and usability
- **Iterate**: Make minor refinements based on data and feedback

---

## 21. Post-Launch Monitoring

### Week 1-2 After Launch
- **Track metrics daily**: Demo → Signup conversion, session duration, error rates
- **Monitor performance**: Run Lighthouse audits, check for any regressions
- **Collect feedback**: User interviews or surveys on redesign

### Week 3-4 After Launch
- **Analyze patterns**: Which conversion prompts drive most signups?
- **Refine animations**: Adjust confetti/streaks if users report annoyance
- **Optimize dark mode**: If dark mode adoption low, investigate usability issues

### Month 2-3 After Launch
- **A/B test variations**: Test different empty state copy or CTA button text
- **Consider enhancements**: Seasonal palettes, custom themes, advanced features
- **Plan next iteration**: Based on learnings, plan future design improvements

---

## 22. Related Documents

- **PRD #0002**: Amara.day Foundation & Core Components (prerequisite)
- **Design Plan**: `plans for later/amara-day-redesign-plan.md` (design specification)
- **Original PRD**: `tasks/0001-prd-habit-tracker.md` (feature requirements)
- **Project Instructions**: `CLAUDE.md` (codebase overview)

---

## 23. Approval and Sign-Off

**Prerequisites for Starting PRD #2 Implementation:**
- ✅ PRD #1 (0002) completed and merged to main
- ✅ Validation checkpoint passed: "This feels like Amara.day"
- ✅ Baseline metrics collected: Conversion rate, session duration, performance scores
- ✅ Stakeholder approval to proceed with full redesign rollout

**Final Approval Required:**
- Stakeholder review of all pages in light and dark modes
- Conversion rate improvement validation (2 weeks post-launch)
- Performance and accessibility scores maintained

---

**Document Status**: Ready for Implementation (pending PRD #1 completion)
**Approval Required**: Stakeholder sign-off after PRD #1 validation checkpoint
**Next Steps**:
1. Complete PRD #1
2. Validate foundation ("Does this feel like Amara.day?")
3. Commission professional illustrations
4. Begin PRD #2 implementation
