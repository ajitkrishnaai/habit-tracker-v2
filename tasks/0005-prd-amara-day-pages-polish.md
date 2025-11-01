# PRD #0005: Amara.day Pages & Polish

**Project:** Habit Tracker V2 → Amara.day Redesign
**Phase:** PRD #2 - Pages & Polish (Phases 3-4)
**Created:** 2025-10-19
**Status:** Pending PRD #1 Completion
**Estimated Effort:** 7-11 hours
**Timeline:** Week 3-4
**Prerequisites:** PRD #0004 (Foundation & Core Components) must be completed and validated

---

## 1. Introduction/Overview

This PRD covers the **second phase** of the Amara.day redesign, applying the design foundation from PRD #1 to all application pages and adding delightful interactions.

**Problem:** With the design foundation established (branding, colors, typography, core components), we need to apply this warm aesthetic across all pages and add polish that makes the app feel premium and delightful.

**Solution:** Redesign all four main pages (Welcome, Daily Log, Progress, Manage Habits) with the Amara.day design system, add micro-interactions and animations for delight, and implement icon-based empty states using the Lucide Icons library.

**Prerequisites:**
- PRD #1 must be completed: Branding assets exist, design system defined, core components redesigned
- Validation checkpoint passed: Stakeholders confirm "This feels like Amara.day"
- Baseline metrics collected: Conversion rate, session duration, habits logged per week

---

## 2. Goals

1. **Apply Design Foundation**: Redesign all pages (Welcome, Daily Log, Progress, Manage Habits) using Amara.day design system
2. **Add Delightful Interactions**: Implement micro-animations, loading states, empty states, success feedback
3. **Improve Conversion**: Enhance demo mode experience with warm, inviting UI to increase signup rate by 15-20%
4. **Maintain Performance**: Keep Lighthouse Performance 90+, Accessibility 95+
5. **Establish Visual Testing**: Set up Playwright screenshot comparison for future regression prevention

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

### US-5: New User with No Data
**As a** new user with no habits or logs yet,
**I want** to see encouraging empty states with meaningful icons,
**So that** I feel welcomed and know exactly what to do next.

---

## 4. Functional Requirements

### 4.1 Page Redesigns (Phase 3)

#### 4.1.1 Welcome Page Redesign

**FR-1**: Update `src/pages/WelcomePage.tsx` and `WelcomePage.css` with hero section
- **FR-1.1**: Display large Amara.day text logo (48px font size) centered
- **FR-1.2**: Add tagline in large text: "Mindful habits. Lasting change."
- **FR-1.3**: Add subtitle in italic: "Your daily ritual. Built to last."
- **FR-1.4**: Apply gradient background: `linear-gradient(180deg, #FAF8F5 0%, #F5F1EB 100%)`
- **FR-1.5**: Optional: Add gentle fade-in animation to logo on page load
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
- **FR-17.1**: Display Amara.day text logo (48px size)
- **FR-17.2**: Add gentle fade pulse animation to logo (opacity 0.7 → 1 → 0.7)
- **FR-17.3**: Display loading message: "Building your day..."
- **FR-17.4**: Apply warm background gradient
- **FR-17.5**: Center content vertically and horizontally

**FR-18**: Create skeleton screen components
- **FR-18.1**: Implement `Skeleton` component with gradient shimmer animation
- **FR-18.2**: Use warm colors for skeleton: `--color-surface` → `--color-border-light` → `--color-surface`
- **FR-18.3**: Animation: Background slides right-to-left over 1.5 seconds (infinite loop)
- **FR-18.4**: Create skeleton variants: `SkeletonCard`, `SkeletonText`, `SkeletonButton`

#### 4.2.2 Empty States

**FR-19**: Implement icon-based empty states using Lucide Icons
- **FR-19.1**: Select appropriate Lucide icons for each empty state:
  - Empty habits: `Sunrise` or `Sprout` icon
  - Empty progress: `TrendingUp` or `Activity` icon
  - Empty logs: `Calendar` or `BookOpen` icon
- **FR-19.2**: Render icons at 200px size in warm terracotta color (#D4745E)
- **FR-19.3**: Add subtle CSS effects: circular gradient background, soft drop shadow
- **FR-19.4**: Icons are imported from `lucide-react` package (already added in PRD #1)

**FR-20**: Update `src/components/EmptyState.tsx` component
- **FR-20.1**: Accept `iconName` prop (string) to specify which Lucide icon to render
- **FR-20.2**: Render specified icon at 200px with terracotta coloring and circular background
- **FR-20.3**: Add title in display font (e.g., "No habits yet")
- **FR-20.4**: Add encouraging message in warm gray (e.g., "Start tracking habits to see your progress bloom")
- **FR-20.5**: Style CTA button with primary button styles
- **FR-20.6**: Center-align content with generous spacing

**FR-21**: Apply empty states to pages
- **FR-21.1**: Daily Log: Icon `Calendar`, "No habits yet. Add your first habit to get started!"
- **FR-21.2**: Progress: Icon `TrendingUp`, "No progress yet. Start tracking habits to see your progress bloom."
- **FR-21.3**: Manage Habits: Icon `Sunrise`, "Your habit garden awaits. Plant your first habit!"

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

### 4.3 Visual Regression Testing (Phase 4)

**FR-29**: Set up Playwright screenshot comparison
- **FR-29.1**: Create `e2e/visual-regression.spec.ts` test file
- **FR-29.2**: Capture baseline screenshots for all pages
- **FR-29.3**: Store screenshots in `e2e/screenshots/baseline/` directory
- **FR-29.4**: Configure Playwright to compare screenshots on test runs
- **FR-29.5**: Set pixel difference threshold (e.g., 0.2% tolerance for minor anti-aliasing differences)

**FR-30**: Document visual regression testing workflow
- **FR-30.1**: Create `VISUAL_TESTING.md` with instructions for:
  - Running visual tests: `npm run test:e2e:visual`
  - Updating baselines when design changes intentionally
  - Reviewing diff images when tests fail
- **FR-30.2**: Add npm script: `"test:e2e:visual": "playwright test e2e/visual-regression.spec.ts"`

---

## 5. Non-Goals (Out of Scope)

**NG-1**: Advanced animation libraries (Framer Motion, React Spring) - using pure CSS only

**NG-2**: Custom theme builder or user-customizable color palettes

**NG-3**: Seasonal palette variations (e.g., winter theme, spring theme)

**NG-4**: Sound effects for success states

**NG-5**: Animated onboarding tour (may be added post-launch)

**NG-6**: Export progress as shareable images (future enhancement)

**NG-7**: Push notifications or reminder system

---

## 6. Technical Considerations

### 6.1 Animation Performance

- **Pure CSS animations** are GPU-accelerated (use `transform` and `opacity`, avoid animating `width`, `height`, `top`, `left`)
- **Canvas-based confetti** runs on separate thread, won't block main UI thread
- **Debounce rapid toggles** to prevent animation performance issues

### 6.2 Toast Management

- Use React Context + custom hook pattern for global toast state
- Implement toast queue with max 3 visible toasts (auto-dismiss oldest if queue exceeds)
- Use `setTimeout` for auto-dismiss, clear timeout on manual close

### 6.3 Visual Regression Testing

- Playwright's `toHaveScreenshot()` API for screenshot comparison
- Store baselines in version control (git LFS optional for large images)
- Run visual tests only on CI for specific PRs (not every commit to save time)

---

## 7. Performance Requirements

**PR-1**: Maintain Lighthouse Performance score 90+ (no regressions from PRD #1)

**PR-2**: First Contentful Paint (FCP) must remain < 1.5 seconds on 4G

**PR-3**: Confetti animation must not drop below 30 FPS (use `requestAnimationFrame`)

**PR-4**: Dark mode toggle transition must complete within 300ms

**PR-5**: Page transitions must be smooth (no layout shifts or jank)

**PR-6**: Total CSS bundle size increase from PRD #1 must be < 15KB gzipped

**PR-7**: Lucide icons are minimal (~1-2KB each), negligible performance impact

---

## 8. Security & Compliance

**SC-1**: No new security risks introduced (UI-only changes)

**SC-2**: Lucide Icons library uses ISC license (open source, commercial use permitted)

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

---

## 11. User Experience Flow

### 11.1 Demo User Conversion Journey (Enhanced)

1. User lands on **Welcome page** → Sees beautiful hero with Amara.day branding and warm gradient
2. Clicks "Try Without Signing Up" → Enters app with DemoBanner visible
3. Navigates to Manage Habits → Sees empty state with Sunrise icon: "Your habit garden awaits"
4. Clicks "Add Your First Habit" → FAB opens modal with warm styling
5. Creates first habit → **Confetti animation** + ConversionModal: "Great start! Sign up to save your progress."
6. Dismisses modal → Continues exploring
7. Marks first habit done on Daily Log → **Checkmark animation** + ConversionModal reappears
8. Reaches 7-day streak → **Flame animation** + Toast: "🔥 7-day streak!"
9. Visits Progress page → Sees warm charts and stats + final ConversionModal
10. Decides to sign up → Data seamlessly migrates to authenticated account

### 11.2 Empty State to Content Journey

1. New user sees empty state on Daily Log → Calendar icon with "No habits yet"
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

**EH-3**: If empty state icon fails to load, display text-only empty state with emoji fallback (e.g., 🌅)

**EH-4**: Use `<img>` `onerror` handler to show fallback SVG icon if PNG fails

### 12.3 Toast Errors

**EH-5**: If toast fails to render, log to console but don't crash app (toasts are non-critical)

**EH-6**: Limit toast queue to prevent memory leaks (max 10 toasts in history, auto-clear oldest)

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

**SM-10**: Lighthouse Accessibility: Maintain **95+** score

**SM-11**: axe-core violations: **0**

**SM-12**: Keyboard navigation: **100%** of features operable without mouse

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

**AC-11**: Empty states display appropriate Lucide icon (200px) with encouraging copy and CTA button

**AC-12**: Confetti animation triggers on first habit creation with warm-colored particles

**AC-13**: Streak milestone animations display for 7, 14, 30-day streaks with flame icon and toast notification

**AC-14**: Daily log completion animation (checkmark ripple) triggers when all habits marked done

**AC-15**: Toast notifications slide in from top, auto-dismiss after 3 seconds, and support success/error/info variants

**AC-16**: Footer displays Amara.day wordmark, Privacy/Terms links, and dynamic copyright year in warm colors

### 14.3 Visual Regression Testing

**AC-17**: Playwright screenshot comparison test file created (`e2e/visual-regression.spec.ts`)

**AC-18**: Baseline screenshots captured for all pages

**AC-19**: `npm run test:e2e:visual` script runs visual regression tests

**AC-20**: `VISUAL_TESTING.md` documentation created with workflow instructions

### 14.4 Performance & Accessibility (All Phases)

**AC-21**: Lighthouse Performance score ≥ 90

**AC-22**: Lighthouse Accessibility score ≥ 95

**AC-23**: First Contentful Paint < 1.5 seconds on 4G throttling

**AC-24**: Confetti animation runs at 30+ FPS (smooth, no lag)

**AC-25**: axe-core reports 0 violations

**AC-26**: All interactive elements keyboard-navigable (Tab, Enter, Space)

### 14.5 Cross-Browser Compatibility (All Phases)

**AC-27**: All features work correctly in Chrome (latest), Safari (macOS + iOS), Firefox (latest)

**AC-28**: Animations run smoothly in all tested browsers

### 14.6 Conversion & Engagement (Post-Launch Tracking)

**AC-29**: Demo → Signup conversion rate increased by 15-20% (measured 2 weeks post-launch)

**AC-30**: Session duration increased by 10% (measured 2 weeks post-launch)

**AC-31**: Habits logged per user per week maintained or increased by 5%

---

## 15. Open Questions

**OQ-1**: Should the FAB on Manage Habits page also appear on mobile, or only desktop? (Current spec: all devices)

**OQ-2**: Should we add a "What's New" modal on first load after redesign to showcase new features?

**OQ-3**: For streak milestone animations, should flames be static SVG icons or CSS-animated (flickering effect)?

**OQ-4**: Should we add a subtle sound effect for confetti (with user preference to disable)?

**OQ-6**: For visual regression tests, should we test every page or just key pages (Welcome, Daily Log)?

**OQ-7**: Should the toast notification stack vertically or horizontally when multiple toasts appear?

---

## 16. Implementation Notes for Developers

### 16.1 Getting Started

1. **Ensure PRD #1 is complete**: Verify all design foundation (colors, typography, core components) is implemented
2. **Review baseline metrics**: Note current conversion rate, session duration, performance scores
3. **Start with Phase 3**: Redesign pages one-by-one, test each before moving to next
4. **Build Phase 4 incrementally**: Add polish features (loading, empty states, animations) as pages are completed

### 16.2 Testing Strategy

- **Visual testing**: Manually review each page at 320px, 375px, 768px, 1440px viewports
- **Animation testing**: Use Chrome DevTools Performance tab to verify 60 FPS, CPU throttling to test on slower devices
- **Conversion testing**: Clear localStorage, test full demo mode journey end-to-end
- **Accessibility testing**: Run axe-core, test keyboard navigation, verify focus indicators are visible

### 16.3 Common Pitfalls to Avoid

- **Don't over-animate**: Too many animations can feel chaotic, use sparingly for delight
- **Don't forget reduced motion**: Wrap all decorative animations in `@media (prefers-reduced-motion: no-preference)`
- **Don't skip confetti flag**: Without localStorage check, confetti will trigger on every habit creation (annoying)
- **Icon fallbacks**: Ensure emoji fallbacks exist for icon loading failures

### 16.4 File Organization

```
src/
├── components/
│   ├── LoadingScreen.tsx (new)
│   ├── Skeleton.tsx (new)
│   ├── EmptyState.tsx (update)
│   ├── Toast.tsx (new)
│   ├── ToastContext.tsx (new)
│   ├── FloatingActionButton.tsx (new - FAB)
│   ├── Footer.tsx (update)
├── pages/
│   ├── WelcomePage.tsx + .css (update)
│   ├── DailyLogPage.tsx + .css (update)
│   ├── ProgressPage.tsx + .css (update)
│   ├── ManageHabitsPage.tsx + .css (update)
├── styles/
│   ├── animations.css (new - confetti, streaks, checkmarks)
├── utils/
│   ├── confetti.ts (new - canvas confetti implementation)
public/
e2e/
├── visual-regression.spec.ts (new)
├── screenshots/
│   ├── baseline/ (new - baseline screenshots)
VISUAL_TESTING.md (new)
```

---

## 17. Dependencies

**No new npm packages required** (Lucide Icons already added in PRD #1)

**External dependencies:**
- Google Fonts woff2 files (already self-hosted in PRD #1)

---

## 18. Risks and Mitigations

### Risk 1: Animation Performance on Low-End Devices
**Mitigation**: Test on throttled CPU (Chrome DevTools), simplify animations if FPS drops below 30

### Risk 2: Confetti Performance Impact
**Mitigation**: Use `requestAnimationFrame`, limit particle count to 20-30, auto-cleanup after 3 seconds

### Risk 3: Visual Regression Tests Too Sensitive
**Mitigation**: Set pixel difference threshold (0.2% tolerance), use consistent test environment (Docker or CI)

### Risk 4: Conversion Rate Doesn't Improve
**Mitigation**: Track intermediate metrics (CTA clicks, time on Welcome page), A/B test copy/design if needed

---

## 19. Timeline and Effort Estimate

**Total Estimated Effort**: 6.5-10 hours

### Phase 3: Page Redesigns (4-5 hours)
- Welcome Page: 1 hour
- Daily Log Page: 1.5 hours
- Progress Page: 1.5 hours
- Manage Habits Page (with FAB): 1.5 hours

### Phase 4: Polish & Delight (1.5-2.5 hours)
- Loading states: 0.5 hours
- Empty states (with Lucide icons): 0.25 hours
- Success animations (confetti, streaks, checkmarks): 1.5 hours
- Toast notifications: 0.5 hours
- Footer redesign: 0.25 hours

### Phase 4: Visual Regression Testing (1-2 hours)
- Set up Playwright screenshots: 0.5 hours
- Capture baseline screenshots: 0.5 hours
- Document workflow: 0.5 hours

### Testing and Polish (1 hour)
- Cross-browser testing: 0.25 hours
- Accessibility testing: 0.25 hours
- Performance testing: 0.25 hours
- Bug fixes and refinements: 0.25 hours

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

### Month 2-3 After Launch
- **A/B test variations**: Test different empty state copy or CTA button text
- **Consider enhancements**: Seasonal palettes, custom themes, advanced features
- **Plan next iteration**: Based on learnings, plan future design improvements

---

## 22. Related Documents

- **PRD #0004**: Amara.day Foundation & Core Components (prerequisite)
- **Design Plan**: `plans for later/amara-day-redesign-plan.md` (design specification)
- **Original PRD**: `tasks/0001-prd-habit-tracker.md` (feature requirements)
- **Project Instructions**: `CLAUDE.md` (codebase overview)

---

## 23. Approval and Sign-Off

**Prerequisites for Starting PRD #2 Implementation:**
- ✅ PRD #1 (0004) completed and merged to main
- ✅ Validation checkpoint passed: "This feels like Amara.day"
- ✅ Baseline metrics collected: Conversion rate, session duration, performance scores
- ✅ Stakeholder approval to proceed with full redesign rollout

**Final Approval Required:**
- Stakeholder review of all pages
- Conversion rate improvement validation (2 weeks post-launch)
- Performance and accessibility scores maintained

---

**Document Status**: Ready for Implementation (pending PRD #1 completion)
**Approval Required**: Stakeholder sign-off after PRD #1 validation checkpoint
**Next Steps**:
1. Complete PRD #1
2. Validate foundation ("Does this feel like Amara.day?")
3. Begin PRD #2 implementation
