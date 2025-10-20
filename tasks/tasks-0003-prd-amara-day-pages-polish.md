# Task List: Amara.day Pages, Polish & Dark Mode

Based on PRD: `0003-prd-amara-day-pages-polish.md`

**Status:** Pending PRD #1 Completion
**Estimated Effort:** 9-13 hours
**Timeline:** Week 3-4
**Prerequisites:** PRD #0002 (Foundation & Core Components) must be completed and validated

---

## Relevant Files

### Source Code - Page Redesigns

- `src/pages/WelcomePage.tsx` - **UPDATE** - Hero section with Amara.day branding
- `src/pages/WelcomePage.css` - **UPDATE** - Warm gradient hero, step cards, CTA styling
- `src/pages/DailyLogPage.tsx` - **UPDATE** - Warm header, enhanced habit cards
- `src/pages/DailyLogPage.css` - **UPDATE** - Pill date navigator, card animations, notes section
- `src/pages/ProgressPage.tsx` - **UPDATE** - Warm header, stat icons, colorful charts
- `src/pages/ProgressPage.css` - **UPDATE** - Gradient borders, chart colors
- `src/pages/ManageHabitsPage.tsx` - **UPDATE** - Responsive grid, FAB integration
- `src/pages/ManageHabitsPage.css` - **UPDATE** - Grid layout, FAB styles, modal

### Source Code - Polish Components

- `src/components/LoadingScreen.tsx` - **NEW** - Branded loading screen with pulse animation
- `src/components/LoadingScreen.test.tsx` - **NEW** - Tests for loading screen
- `src/components/Skeleton.tsx` - **NEW** - Skeleton loading component with shimmer
- `src/components/Skeleton.test.tsx` - **NEW** - Tests for skeleton component
- `src/components/EmptyState.tsx` - **UPDATE** - Professional illustration integration
- `src/components/EmptyState.test.tsx` - **UPDATE** - Tests for updated empty states
- `src/components/Toast.tsx` - **UPDATE** - Enhanced warm styling (may already exist)
- `src/components/Toast.test.tsx` - **UPDATE** - Tests for toast component
- `src/components/ToastContext.tsx` - **NEW** - Global toast management context
- `src/components/ToastContext.test.tsx` - **NEW** - Tests for toast context
- `src/components/FloatingActionButton.tsx` - **NEW** - FAB component for Manage Habits
- `src/components/FloatingActionButton.test.tsx` - **NEW** - Tests for FAB
- `src/components/Footer.tsx` - **UPDATE** - Amara.day branding, warm styling
- `src/components/Footer.test.tsx` - **UPDATE** - Tests for updated footer

### Source Code - Dark Mode

- `src/components/DarkModeToggle.tsx` - **NEW** - Sun/moon icon toggle component
- `src/components/DarkModeToggle.test.tsx` - **NEW** - Tests for dark mode toggle
- `src/styles/colors.css` - **UPDATE** - Add dark mode color palette under `[data-theme="dark"]`
- `src/hooks/useDarkMode.ts` - **NEW** - Hook for system preference detection and theme management
- `src/hooks/useDarkMode.test.ts` - **NEW** - Tests for dark mode hook

### Source Code - Animations

- `src/utils/confetti.ts` - **NEW** - Canvas-based confetti animation utility
- `src/utils/confetti.test.ts` - **NEW** - Tests for confetti utility
- `src/styles/animations.css` - **NEW** - Keyframe animations (checkmarks, streaks, ripples, pulses)

### Public Assets

- `public/illustrations/empty-habits.svg` - **NEW** - Professional sunrise illustration for empty habits
- `public/illustrations/empty-progress.svg` - **NEW** - Professional illustration for empty progress
- `public/illustrations/empty-logs.svg` - **NEW** - Professional illustration for empty daily log

### Testing

- `e2e/visual-regression.spec.ts` - **NEW** - Playwright screenshot comparison tests
- `e2e/dark-mode.spec.ts` - **NEW** - E2E tests for dark mode functionality
- `e2e/animations.spec.ts` - **NEW** - E2E tests for animations (confetti, streaks)
- `e2e/screenshots/baseline/` - **NEW** - Directory for baseline screenshots (light + dark modes)

### Documentation

- `VISUAL_TESTING.md` - **NEW** - Visual regression testing workflow guide
- `CHANGELOG.md` - **UPDATE** - Document pages redesign, polish, and dark mode
- `DESIGN_SYSTEM.md` - **NEW** - Comprehensive design system documentation

### Configuration

- `playwright.config.ts` - **UPDATE** - Add visual regression test configuration
- `package.json` - **UPDATE** - Add `test:e2e:visual` script

### Notes

- Commission professional illustrations early in Phase 3 (1-2 week turnaround)
- Use placeholder SVGs/emojis until professional assets ready
- Dark mode implementation requires testing in both themes for all components
- Visual regression tests run only on specific CI triggers (not every commit)
- Confetti uses canvas API, degrades gracefully in unsupported browsers

---

## Tasks

- [ ] **1.0 Phase 3: Page Redesigns** (4-5 hours)
  - [ ] 1.1 Update Welcome Page hero section
    - Update `src/pages/WelcomePage.tsx`:
      - Import `AmaraDayLogo` from `@/components/branding`
      - In hero section, render `<AmaraDayLogo size={80} layout="vertical" />`
      - Add tagline text: `<p className="hero-tagline">Mindful habits. Lasting change.</p>`
      - Add subtitle text: `<p className="hero-subtitle">Your daily ritual. Built to last.</p>`
    - Update `src/pages/WelcomePage.css`:
      - `.welcome-hero` styles:
        - `background: linear-gradient(180deg, #FAF8F5 0%, #F5F1EB 100%);`
        - `text-align: center;`
        - `padding: var(--space-3xl) var(--space-md);`
      - `.hero-brand` styles (wrapper for logo):
        - `display: flex; flex-direction: column; align-items: center; gap: 1.5rem;`
        - `margin-bottom: 2rem;`
      - `.hero-icon` animation:
        ```css
        @keyframes gentle-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        animation: gentle-pulse 3s ease-in-out infinite;
        ```
      - `.hero-wordmark` styles:
        - `font-size: var(--text-4xl); font-weight: 800; letter-spacing: var(--tracking-tight);`
      - `.hero-amara` gradient text:
        - `background: linear-gradient(135deg, #D4745E 0%, #E89C5A 100%);`
        - `-webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;`
      - `.hero-tld` styles:
        - `color: var(--color-text-secondary); font-weight: 600;`
      - `.hero-tagline` styles:
        - `font-size: var(--text-2xl); color: var(--color-text-primary); font-weight: 600; margin-bottom: 0.5rem;`
      - `.hero-subtitle` styles:
        - `font-size: var(--text-lg); color: var(--color-text-secondary); font-style: italic;`
  - [ ] 1.2 Update Welcome Page "How It Works" section
    - Update `src/pages/WelcomePage.tsx`:
      - Ensure 3-step cards exist (should already be in current design)
      - Add step number wrapper: `<div className="welcome-step-number">{stepNumber}</div>`
    - Update `src/pages/WelcomePage.css`:
      - `.welcome-step-number` styles:
        - `width: 48px; height: 48px; border-radius: var(--radius-full);`
        - `background: linear-gradient(135deg, #D4745E 0%, #E89C5A 100%);`
        - `color: white; font-size: 24px; font-weight: 700;`
        - `display: flex; align-items: center; justify-content: center;`
        - `margin: 0 auto var(--space-md);`
      - `.welcome-step-card` styles (if not exist):
        - Apply `.card` styles (from main.css)
        - Add hover lift: `transform: translateY(-2px);` on `:hover`
  - [ ] 1.3 Update Welcome Page CTA section
    - Update `src/pages/WelcomePage.tsx`:
      - Ensure "Try Without Signing In" button uses `.btn-primary` class
      - Ensure button has larger size: add inline style or class for `padding: 1rem 3rem;`
      - Style email sign-in form inputs with floating labels (or defer to later)
      - Add privacy note below form: `<p className="privacy-note">Your data is private and secure.</p>`
    - Update `src/pages/WelcomePage.css`:
      - `.privacy-note` styles:
        - `color: var(--color-text-tertiary); font-size: var(--text-sm); margin-top: var(--space-sm);`
  - [ ] 1.4 Update Daily Log Page header
    - Update `src/pages/DailyLogPage.tsx`:
      - Add page header section:
        ```tsx
        <div className="page-header">
          <h1 className="page-title">Today's Habits</h1>
          <p className="page-subtitle">Track your mindful practice</p>
        </div>
        ```
    - Update `src/pages/DailyLogPage.css`:
      - `.page-header` styles:
        - `text-align: center; padding: var(--space-xl) var(--space-md);`
      - `.page-title` styles:
        - `font-size: var(--text-3xl); font-family: var(--font-display); color: var(--color-text-primary);`
      - `.page-subtitle` styles:
        - `font-size: var(--text-lg); color: var(--color-text-secondary);`
  - [ ] 1.5 Update Daily Log date navigator
    - Update `src/components/DateNavigator.tsx` or `src/pages/DailyLogPage.css`:
      - Active date pill styles:
        - `background: var(--color-primary); color: white; border-radius: var(--radius-full); padding: var(--space-sm) var(--space-md);`
      - Arrow button styles:
        - `background: var(--color-surface-hover); border-radius: var(--radius-md);`
        - Hover: `background: var(--color-border);`
      - Date transition animation:
        ```css
        .date-navigator__date {
          transition: opacity 200ms ease-in-out, transform 200ms ease-in-out;
        }
        .date-navigator__date--changing {
          opacity: 0;
          transform: translateX(10px);
        }
        ```
  - [ ] 1.6 Update Daily Log habit cards
    - Update `src/pages/DailyLogPage.css` or `src/components/HabitListItem.tsx` styles:
      - Apply `.card` base styles
      - Add category badge styles:
        - `.habit-card__category` inline badge:
        - `display: inline-block; padding: var(--space-xs) var(--space-sm);`
        - `background: var(--color-sunset);` (or map category to color)
        - `color: white; font-size: var(--text-xs); font-weight: 600; border-radius: var(--radius-sm);`
      - Hover lift animation (already in `.card:hover`)
      - Completion animation:
        ```css
        @keyframes card-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .habit-card--completed {
          animation: card-pulse 400ms ease-out;
        }
        ```
      - Add checkmark fade-in when toggle ON (use existing checkmark or create new)
  - [ ] 1.7 Update Daily Log notes section
    - Update `src/pages/DailyLogPage.tsx`:
      - Increase textarea rows or min-height
      - Add floating label if not already present
      - Add character count display: `<span className="notes-char-count">{notes.length} / 5000</span>`
      - Style save button with `.btn-primary` class
    - Update `src/pages/DailyLogPage.css`:
      - Textarea styles (already defined in main.css, may need page-specific overrides):
        - `min-height: 120px;`
      - `.notes-char-count` styles:
        - `color: var(--color-text-tertiary); font-size: var(--text-sm); text-align: right; display: block; margin-top: var(--space-xs);`
  - [ ] 1.8 Update Progress Page header
    - Update `src/pages/ProgressPage.tsx`:
      - Add page header:
        ```tsx
        <div className="page-header">
          <h1 className="page-title">Progress</h1>
          <p className="page-subtitle">Track your habits and discover patterns</p>
        </div>
        ```
    - Update `src/pages/ProgressPage.css`:
      - Use same `.page-header`, `.page-title`, `.page-subtitle` styles as Daily Log
  - [ ] 1.9 Update Progress Card with gradient border
    - Update `src/components/ProgressCard.tsx` or `.css`:
      - Add gradient top border:
        - `border-top: 4px solid;`
        - `border-image: linear-gradient(90deg, #D4745E 0%, #8B9A7E 100%) 1;`
      - Apply warm surface background and shadow (already in `.card`)
      - Add hover lift (already in `.card:hover`)
  - [ ] 1.10 Create warm-toned stat icons (SVG components)
    - Create `src/components/icons/FlameIcon.tsx`:
      - SVG flame icon with warm gradient (terracotta to sunset)
      - Accept `size` prop (default 24px)
      - Use for current streak display
    - Create `src/components/icons/TrophyIcon.tsx`:
      - SVG trophy icon with warm gold (#E89C5A)
      - Accept `size` prop
      - Use for longest streak display
    - Create `src/components/icons/ChartIcon.tsx`:
      - SVG chart/bar icon with warm colors
      - Accept `size` prop
      - Use for completion percentage display
    - Create `src/components/icons/index.ts` barrel export
  - [ ] 1.11 Update Progress Page stat display
    - Update `src/components/ProgressCard.tsx`:
      - Import stat icons (FlameIcon, TrophyIcon, ChartIcon)
      - Render icons next to corresponding stats
      - Apply larger font to numbers: `font-family: var(--font-display); font-size: var(--text-2xl);`
  - [ ] 1.12 Update Progress Page pattern analysis
    - Update `src/pages/ProgressPage.tsx` or `src/components/ProgressCard.tsx`:
      - Style keyword badges:
        - `.keyword-badge` class:
        - `display: inline-block; padding: var(--space-xs) var(--space-sm);`
        - `background: var(--color-sunset);` (or rotate warm colors)
        - `color: white; border-radius: var(--radius-full); font-size: var(--text-xs); margin-right: var(--space-xs);`
      - Highlight correlation text:
        - Wrap correlation text in `<span className="correlation-highlight">`
        - `background: var(--color-surface); padding: var(--space-xs) var(--space-sm); border-radius: var(--radius-sm);`
  - [ ] 1.13 Update Progress Page charts (if using chart library)
    - If using Chart.js, Recharts, or similar:
      - Update chart color schemes to warm palette:
        - Bar charts: Terracotta gradient (#D4745E to #E89676)
        - Line charts: Sage green (#8B9A7E) strokes
        - Sparklines: Sunset orange (#E89C5A)
      - Ensure colors meet WCAG AA contrast on backgrounds
    - If no chart library, note: "Charts will use warm colors per design system"
  - [ ] 1.14 Update Manage Habits Page with responsive grid
    - Update `src/pages/ManageHabitsPage.tsx`:
      - Wrap habit cards in grid container: `<div className="habits-grid">{habitCards}</div>`
    - Update `src/pages/ManageHabitsPage.css`:
      - `.habits-grid` styles:
        - `display: grid;`
        - `grid-template-columns: 1fr;` /* Mobile: 1 column */
        - `gap: var(--space-lg);`
        - `@media (min-width: 768px)`: `grid-template-columns: repeat(2, 1fr);` /* Tablet: 2 columns */
        - `@media (min-width: 1024px)`: `grid-template-columns: repeat(3, 1fr);` /* Desktop: 3 columns (or 2, adjust as needed) */
  - [ ] 1.15 Update Manage Habits habit cards
    - Update habit card styles in `ManageHabitsPage.css` or component:
      - Apply `.card` base styles
      - Style edit/delete buttons:
        - Edit button: `color: var(--color-primary);` on hover
        - Delete button: `color: var(--color-error);` on hover
      - Add hover lift (already in `.card:hover`)
  - [ ] 1.16 Create FloatingActionButton component for "Add Habit"
    - Create `src/components/FloatingActionButton.tsx`:
      - Circular button: `width: 64px; height: 64px; border-radius: var(--radius-full);`
      - Position: `position: fixed; bottom: 2rem; right: 2rem; z-index: 50;`
      - Background: `background: linear-gradient(135deg, #D4745E 0%, #E89C5A 100%);`
      - Shadow: `box-shadow: var(--shadow-xl);`
      - Render plus icon (`+`) or `<PlusIcon />` component
      - Hover animation:
        ```css
        .fab:hover {
          transform: scale(1.1) rotate(90deg);
          box-shadow: 0 20px 60px rgba(212, 116, 94, 0.4);
        }
        ```
      - Transition: `transition: all var(--transition-base);`
      - Accept `onClick` prop to open habit form modal
    - Create `src/components/FloatingActionButton.test.tsx`:
      - Test FAB renders with plus icon
      - Test onClick handler called when clicked
      - Test hover animation (via snapshot or class check)
  - [ ] 1.17 Integrate FAB into Manage Habits Page
    - Update `src/pages/ManageHabitsPage.tsx`:
      - Import `FloatingActionButton`
      - Render `<FloatingActionButton onClick={openHabitFormModal} />` at bottom of page
      - Ensure FAB appears above all content (z-index)
  - [ ] 1.18 Update Habit Form Modal styling
    - Update `src/components/HabitForm.tsx` or modal wrapper:
      - Add slide-up animation:
        ```css
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .habit-form-modal {
          animation: slide-up 300ms ease-out;
        }
        ```
      - Apply warm surface background: `background: var(--color-surface);`
      - Round top corners: `border-radius: var(--radius-xl) var(--radius-xl) 0 0;`
      - Backdrop overlay:
        - `.modal-backdrop`: `background: rgba(58, 54, 49, 0.5);` (warm dark semi-transparent)
        - Click backdrop to dismiss modal
      - Use warm inputs with floating labels (already styled in main.css)
      - Category color picker: Display warm palette swatches (terracotta, sage, sunset, olive, etc.)

- [ ] **2.0 Phase 4: Polish & Delight** (2-3 hours)
  - [ ] 2.1 Create LoadingScreen component
    - Create `src/components/LoadingScreen.tsx`:
      - Import `AmaraDayLogo`
      - Render `<AmaraDayLogo size={80} layout="vertical" />`
      - Add loading message: `<p className="loading-message">Building your day...</p>`
      - Wrapper styles:
        - `display: flex; flex-direction: column; align-items: center; justify-content: center;`
        - `min-height: 100vh;`
        - `background: linear-gradient(180deg, #FAF8F5 0%, #F5F1EB 100%);`
      - Logo pulse animation (reuse gentle-pulse from Welcome hero)
    - Create `src/components/LoadingScreen.test.tsx`:
      - Test renders logo and loading message
      - Test pulse animation applied (class or keyframe check)
  - [ ] 2.2 Create Skeleton component
    - Create `src/components/Skeleton.tsx`:
      - Base skeleton styles:
        - `background: linear-gradient(90deg, var(--color-surface) 0%, var(--color-border-light) 50%, var(--color-surface) 100%);`
        - `background-size: 200% 100%;`
        - `border-radius: var(--radius-md);`
        - `animation: skeleton-loading 1.5s ease-in-out infinite;`
      - Keyframe animation:
        ```css
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        ```
      - Accept props: `width`, `height`, `variant` (e.g., "text", "circle", "rect")
      - Variant styles:
        - Text: `height: 1rem; width: 100%;`
        - Circle: `border-radius: var(--radius-full); width: 40px; height: 40px;`
        - Rect: Custom width/height from props
    - Create `src/components/Skeleton.test.tsx`:
      - Test renders with default variant
      - Test custom width/height applied
      - Test circle variant has full border-radius
  - [ ] 2.3 Commission professional empty state illustrations
    - **Action**: Hire illustrator from Dribbble, Fiverr, Upwork, or 99designs
    - Provide brief:
      - **Style**: Hand-drawn, organic, warm
      - **Colors**: Terracotta (#D4745E), Sunset Orange (#E89C5A), Sage Green (#8B9A7E)
      - **Theme**: Sunrise, growth, mindfulness
      - **Deliverables**:
        1. Empty habits: Sunrise over horizon with small plant sprouting (200x200px @ 2x resolution)
        2. Empty progress: Sun rising with path leading forward
        3. Empty daily log: Sunrise with calendar/journal motif
      - **Format**: SVG (preferred) or optimized PNG (< 50KB each)
      - **License**: Commercial use, unlimited distribution
    - **Timeline**: 1-2 weeks turnaround
    - **Budget**: $50-$200 total for 3 illustrations
    - **Placeholder**: While waiting, use emoji placeholders (🌅, 🌱, 📅)
  - [ ] 2.4 Update EmptyState component with professional illustrations
    - Update `src/components/EmptyState.tsx`:
      - Accept `illustration` prop (string path or React component)
      - Render illustration at 200px width: `<img src={illustration} alt="" width={200} height={200} />`
      - If illustration fails to load, show emoji fallback
      - Apply warm styling to title and message (already defined, ensure using design system colors)
      - Style CTA button with `.btn-primary` class
      - Center-align content with generous spacing
    - Update `src/components/EmptyState.test.tsx`:
      - Test renders with illustration
      - Test renders fallback if illustration missing
      - Test CTA button calls onClick handler
  - [ ] 2.5 Apply empty states to pages with professional illustrations
    - Update `src/pages/DailyLogPage.tsx`:
      - When no habits: `<EmptyState illustration="/illustrations/empty-habits.svg" title="No habits yet" message="Add your first habit to get started!" actionText="Add Habit" actionLink="/manage-habits" />`
    - Update `src/pages/ProgressPage.tsx`:
      - When no progress: `<EmptyState illustration="/illustrations/empty-progress.svg" title="No progress yet" message="Start tracking habits to see your progress bloom." actionText="Add Your First Habit" actionLink="/manage-habits" />`
    - Update `src/pages/ManageHabitsPage.tsx`:
      - When no habits: `<EmptyState illustration="/illustrations/empty-habits.svg" title="Your habit garden awaits" message="Plant your first habit!" actionText="Add Habit" onClick={openHabitForm} />`
    - Note: Use emoji placeholders (🌅) until professional illustrations delivered
  - [ ] 2.6 Create confetti animation utility
    - Create `src/utils/confetti.ts`:
      - Implement canvas-based confetti particle system
      - Function: `triggerConfetti(canvasElement: HTMLCanvasElement, options?: ConfettiOptions)`
      - Options: `{ colors?: string[], particleCount?: number, duration?: number }`
      - Default colors: Warm palette (terracotta, sage, sunset, dusty rose)
      - Default particle count: 20-30
      - Default duration: 2500ms
      - Use `requestAnimationFrame` for smooth 60 FPS animation
      - Particles fall from top with gravity, slight rotation, fade out
      - Clean up canvas and animation frame on completion
    - Create `src/utils/confetti.test.ts`:
      - Test confetti function creates canvas context
      - Test particles rendered with warm colors
      - Test animation completes and cleans up (mock requestAnimationFrame)
  - [ ] 2.7 Integrate confetti on first habit creation
    - Update `src/pages/ManageHabitsPage.tsx` or habit creation logic:
      - Check localStorage flag: `amaday_confetti_shown`
      - If false and habit created successfully:
        - Create hidden canvas element
        - Call `triggerConfetti(canvas)`
        - Set localStorage flag to `true`
      - If true, skip confetti (only show once)
  - [ ] 2.8 Create streak milestone animations
    - Update `src/components/icons/FlameIcon.tsx` or create new animation component:
      - Small flame (7-day streak):
        - Scale pulse animation: `transform: scale(1) → scale(1.1) → scale(1)`
        - Duration: 600ms
      - Medium flame (14-day streak):
        - Same pulse + add small sparkle particles (CSS or SVG)
      - Large flame (30-day streak):
        - Same pulse + trigger confetti
    - Add keyframe animations to `src/styles/animations.css`:
      ```css
      @keyframes flame-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      .flame--milestone {
        animation: flame-pulse 600ms ease-out;
      }
      ```
  - [ ] 2.9 Create toast notification for streak milestones
    - Update `src/components/Toast.tsx` or use existing toast system:
      - When streak milestone reached (7, 14, 30 days):
      - Display toast: "🔥 {X}-day streak! You're on fire!"
      - Auto-dismiss after 3 seconds
      - Use `success` variant (sage green background)
  - [ ] 2.10 Create daily log completion animation
    - Update `src/pages/DailyLogPage.tsx`:
      - When all habits marked done for the day:
      - Trigger checkmark ripple effect
    - Add keyframe animations to `src/styles/animations.css`:
      ```css
      @keyframes checkmark-ripple {
        0% {
          box-shadow: 0 0 0 0 rgba(139, 154, 126, 0.7);
        }
        100% {
          box-shadow: 0 0 0 20px rgba(139, 154, 126, 0);
        }
      }
      .checkmark--complete {
        animation: checkmark-ripple 600ms ease-out;
      }
      ```
  - [ ] 2.11 Create notes saved feedback (toast)
    - Update `src/pages/DailyLogPage.tsx` notes save handler:
      - On successful save, trigger toast notification
      - Toast message: "Notes saved ✓"
      - Use `success` variant
      - Auto-dismiss after 3 seconds
  - [ ] 2.12 Enhance Toast component with warm styling (if not done in PRD #1)
    - Update `src/components/Toast.tsx`:
      - Support variants: `success` (sage green), `error` (warm red), `info` (terracotta)
      - Slide-in animation from top:
        ```css
        @keyframes slide-in-from-top {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        ```
      - Warm surface background: `background: var(--color-surface);`
      - Soft shadow: `box-shadow: var(--shadow-md);`
      - Rounded corners: `border-radius: var(--radius-md);`
      - Auto-dismiss functionality (setTimeout)
      - Close button (X icon) for manual dismissal
      - Position: `position: fixed; top: 1rem; left: 50%; transform: translateX(-50%); z-index: 9999;`
  - [ ] 2.13 Create ToastContext for global toast management
    - Create `src/components/ToastContext.tsx`:
      - Context to manage toast queue (array of toast objects)
      - Provider component wraps app
      - `useToast()` hook returns: `{ showToast(message, variant, duration?) }`
      - Render active toasts (max 3 visible at once)
      - Auto-dismiss oldest toast if queue exceeds 3
    - Create `src/components/ToastContext.test.tsx`:
      - Test showToast adds toast to queue
      - Test toast auto-dismissed after duration
      - Test manual dismiss removes toast from queue
  - [ ] 2.14 Update Footer with Amara.day branding
    - Update `src/components/Footer.tsx`:
      - Import `AmaraDayLogo` or just `AmaraDayIcon`
      - Render small logo/icon (16px) + "Amara.day" text
      - Links to Privacy Policy and Terms of Service:
        - `color: var(--color-text-tertiary);`
        - Hover: `color: var(--color-primary);`
      - Copyright text: `© ${new Date().getFullYear()} Amara.day`
      - Apply warm colors and subtle top border
    - Update `src/components/Footer.test.tsx`:
      - Test logo renders
      - Test Privacy and Terms links present
      - Test copyright year is current year

- [ ] **3.0 Phase 5: Dark Mode Implementation** (2-3 hours)
  - [ ] 3.1 Update colors.css with dark mode palette
    - Update `src/styles/colors.css`:
      - Add `[data-theme="dark"]` selector
      - Define dark mode color overrides:
        - Primary: `--color-primary: #E89676;` (lighter terracotta)
        - Primary hover: `--color-primary-hover: #F0A98A;`
        - Success: `--color-success: #A8B89A;` (muted sage)
        - Background: `--color-background: #1E1B17;` (deep warm charcoal)
        - Surface: `--color-surface: #2C2822;` (warm brown)
        - Surface hover: `--color-surface-hover: #3A3631;`
        - Border: `--color-border: #4A4640;` (warm dark gray)
        - Border light: `--color-border-light: #3A3631;`
        - Text primary: `--color-text-primary: #F5F1EB;` (warm off-white)
        - Text secondary: `--color-text-secondary: #B8AFA3;`
        - Text tertiary: `--color-text-tertiary: #8A8179;`
        - Error: `--color-error: #E89676;` (soft terracotta)
        - Warning: `--color-warning: #E8B176;` (warm peach)
      - Update shadows for dark mode:
        - `--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);`
        - `--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);`
        - `--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);`
        - `--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);`
  - [ ] 3.2 Verify WCAG AA contrast in dark mode
    - Test primary text (#F5F1EB) on background (#1E1B17) with contrast checker (target: 4.5:1)
    - Test interactive elements (buttons, links) for sufficient contrast
    - Document results in comment in `colors.css`
    - If any fail, adjust colors and re-test
  - [ ] 3.3 Create useDarkMode hook
    - Create `src/hooks/useDarkMode.ts`:
      - Detect system preference: `window.matchMedia('(prefers-color-scheme: dark)')`
      - Apply `data-theme` attribute to `<html>` element on mount
      - Listen for system preference changes: `matchMedia.addEventListener('change', ...)`
      - Return: `{ isDark: boolean, toggleTheme: () => void }`
      - Note: Per user decision, do NOT store preference in localStorage (always respect system)
    - Create `src/hooks/useDarkMode.test.ts`:
      - Test detects system preference (mock matchMedia)
      - Test toggleTheme updates data-theme attribute
      - Test listener updates theme when system preference changes
  - [ ] 3.4 Create DarkModeToggle component
    - Create `src/components/DarkModeToggle.tsx`:
      - Use `useDarkMode()` hook
      - Render button with sun icon (light mode) or moon icon (dark mode)
      - Icon transition animation (fade out/in or rotate):
        ```css
        .theme-toggle__icon {
          transition: opacity 200ms ease-in-out, transform 200ms ease-in-out;
        }
        .theme-toggle__icon--hidden {
          opacity: 0;
          transform: rotate(180deg);
        }
        ```
      - Button styles:
        - `width: 44px; height: 44px;` (touch target)
        - `border-radius: var(--radius-md);`
        - `background: transparent;`
        - Hover: `background: var(--color-surface-hover);`
      - `aria-label`: "Switch to dark mode" or "Switch to light mode"
      - Icon color: `color: var(--color-text-secondary);`
    - Create `src/components/DarkModeToggle.test.tsx`:
      - Test renders sun icon in light mode
      - Test renders moon icon in dark mode
      - Test toggleTheme called on click
      - Test aria-label updates based on theme
  - [ ] 3.5 Add DarkModeToggle to Navigation
    - Update `src/components/Navigation.tsx`:
      - Import `DarkModeToggle`
      - Render toggle in top-right of navigation bar
      - Desktop: Position next to navigation links
      - Mobile: Position in corner or hamburger menu (if exists)
      - Ensure 44x44px touch target maintained
  - [ ] 3.6 Test all PRD #1 components in dark mode
    - Manually toggle to dark mode
    - Test Navigation: Logo readable, links visible
    - Test ToggleSwitch: Colors inverted correctly, still visible
    - Test Buttons: Gradient visible, text readable
    - Test Inputs: Border visible, focus state clear
    - Test Cards: Background distinguishable from page background, shadow visible
    - Adjust any components with poor contrast or visibility
  - [ ] 3.7 Update AmaraDayLogo for dark mode variant
    - Update `src/components/branding/AmaraDayLogo.tsx`:
      - Detect current theme (read `data-theme` attribute or use `useDarkMode` hook)
      - If dark mode, render icon with `variant="dark-mode"` (warm off-white)
      - Wordmark "Amara" uses warm off-white: `color: var(--color-text-primary);`
      - ".day" uses muted gray: `color: var(--color-text-tertiary);`
  - [ ] 3.8 Test all pages in dark mode
    - Test Welcome Page:
      - Hero gradient adjusted for dark mode (or use dark warm tones)
      - Step cards visible, borders distinguishable
      - CTA buttons readable
    - Test Daily Log Page:
      - Habit cards visible, shadows noticeable
      - Date navigator readable
      - Notes textarea border visible
    - Test Progress Page:
      - Cards visible, gradient border visible
      - Charts legible (colors contrast with dark background)
      - Stat icons visible
    - Test Manage Habits Page:
      - Habit cards visible
      - FAB shadow visible on dark background
      - Modal backdrop overlay visible
  - [ ] 3.9 Ensure smooth theme transition
    - Verify global transition styles (from PRD #1):
      - `transition: background-color 300ms ease-in-out, border-color 300ms ease-in-out, color 300ms ease-in-out;`
    - Manually toggle theme multiple times
    - Check for jarring flashes or abrupt color changes
    - Adjust transition timing if needed
  - [ ] 3.10 Test dark mode with reduced motion preference
    - Set system preference: `prefers-reduced-motion: reduce`
    - Toggle dark mode
    - Verify no animations play (transitions disabled)
    - Ensure theme still changes (functionality maintained)

- [ ] **4.0 Phase 5: Visual Regression Testing Setup** (1-2 hours)
  - [ ] 4.1 Create visual regression test file
    - Create `e2e/visual-regression.spec.ts`:
      - Test: "Welcome page matches baseline (light mode)"
        - Visit `/`
        - Wait for page load
        - Take screenshot: `await page.screenshot({ path: 'e2e/screenshots/welcome-light.png', fullPage: true });`
        - Compare to baseline: `await expect(page).toHaveScreenshot('welcome-light.png');`
      - Test: "Welcome page matches baseline (dark mode)"
        - Set theme: `await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));`
        - Take screenshot and compare
      - Repeat for all pages: `/daily-log`, `/progress`, `/manage-habits`
      - Include both light and dark mode screenshots
  - [ ] 4.2 Capture baseline screenshots
    - Run visual regression tests once to generate baselines:
      - `npm run test:e2e e2e/visual-regression.spec.ts -- --update-snapshots`
    - Manually review all baseline screenshots in `e2e/screenshots/baseline/`
    - Ensure screenshots look correct (no errors, rendering issues)
    - Commit baseline screenshots to git
  - [ ] 4.3 Configure Playwright screenshot comparison
    - Update `playwright.config.ts`:
      - Set screenshot comparison threshold:
        ```typescript
        use: {
          screenshot: 'only-on-failure',
        },
        expect: {
          toHaveScreenshot: {
            threshold: 0.2, // 0.2% pixel difference tolerance
            maxDiffPixels: 100, // Max 100 pixels different
          },
        },
        ```
      - Configure screenshot directory: `snapshotDir: 'e2e/screenshots/baseline'`
  - [ ] 4.4 Add npm script for visual regression tests
    - Update `package.json`:
      - Add script: `"test:e2e:visual": "playwright test e2e/visual-regression.spec.ts"`
  - [ ] 4.5 Create visual testing documentation
    - Create `VISUAL_TESTING.md`:
      - Section: "Running Visual Regression Tests"
        - Command: `npm run test:e2e:visual`
        - Explanation: Tests compare current screenshots to baselines
      - Section: "Updating Baselines (Intentional Design Changes)"
        - Command: `npm run test:e2e:visual -- --update-snapshots`
        - Warning: Only update baselines for intentional design changes
        - Process: Review diff images, approve changes, commit new baselines
      - Section: "Reviewing Failed Tests"
        - Diff images location: `e2e/screenshots/diffs/`
        - How to interpret pixel diffs
        - When to update baseline vs. fix bug
      - Section: "CI Integration"
        - Visual tests run on specific triggers (PRs to main, manual workflow)
        - Failed tests block merge (optional, configure in CI)

- [ ] **5.0 Testing & Quality Assurance** (1-2 hours)
  - [ ] 5.1 Create E2E tests for dark mode
    - Create `e2e/dark-mode.spec.ts`:
      - Test: "Dark mode toggle switches theme"
        - Visit `/daily-log`
        - Locate dark mode toggle button
        - Verify current theme is light (default)
        - Click toggle
        - Verify `data-theme` attribute is "dark"
        - Verify page background color changed (use computed styles)
      - Test: "Dark mode persists across page navigation"
        - Set dark mode on `/daily-log`
        - Navigate to `/progress`
        - Verify theme is still dark
      - Test: "System preference detected on initial load"
        - Use Playwright to emulate dark color scheme
        - Visit `/`
        - Verify `data-theme` attribute is "dark"
  - [ ] 5.2 Create E2E tests for animations
    - Create `e2e/animations.spec.ts`:
      - Test: "Confetti triggers on first habit creation"
        - Clear localStorage (ensure confetti flag not set)
        - Create first habit
        - Verify confetti canvas element appears (or check for animation)
        - Verify localStorage flag set
      - Test: "Confetti does not trigger on second habit creation"
        - Set localStorage flag
        - Create habit
        - Verify no confetti canvas element
      - Test: "Streak milestone toast appears for 7-day streak"
        - Set up 7-day streak in test data
        - Visit `/progress`
        - Verify toast notification appears with "🔥 7-day streak!"
  - [ ] 5.3 Run all unit tests
    - Run: `npm test -- --run`
    - Verify all tests pass (update snapshots if needed)
    - Fix any broken tests (should be minimal, mostly styling)
  - [ ] 5.4 Run all E2E tests (including new tests)
    - Run: `npm run test:e2e`
    - Verify all tests pass in light and dark modes
    - Fix any failures
  - [ ] 5.5 Run Lighthouse audits in both themes
    - Light mode:
      - Build: `npm run build && npm run preview`
      - Run Lighthouse (Performance, Accessibility)
      - Verify: Performance ≥ 90, Accessibility ≥ 95
    - Dark mode:
      - Set dark mode in app
      - Run Lighthouse
      - Verify same scores (accessibility especially important)
  - [ ] 5.6 Run axe-core accessibility scan in both themes
    - Light mode:
      - Visit all pages
      - Run axe DevTools
      - Verify 0 violations
    - Dark mode:
      - Toggle to dark mode
      - Visit all pages
      - Run axe DevTools
      - Verify 0 violations (especially contrast issues)
  - [ ] 5.7 Manual keyboard navigation testing (both themes)
    - Light mode:
      - Tab through all pages
      - Verify focus indicators visible
      - Verify all elements reachable
    - Dark mode:
      - Repeat keyboard testing
      - Verify focus indicators still visible (contrast with dark backgrounds)
  - [ ] 5.8 Cross-browser testing (both themes)
    - Test in Chrome, Safari, Firefox (both light and dark modes)
    - Verify styling consistent across browsers
    - Verify animations smooth
    - Verify dark mode toggle works in all browsers
  - [ ] 5.9 Performance testing
    - Check CSS bundle size increase:
      - Compare `dist/assets/*.css` sizes to PRD #1 baseline
      - Verify increase < 15KB gzipped (PRD #2 budget)
    - Check illustration file sizes:
      - Verify each illustration < 50KB (PNG) or < 10KB (SVG)
    - Check animation performance:
      - Use Chrome DevTools Performance tab
      - Trigger confetti animation
      - Verify 30+ FPS (smooth, no dropped frames)
      - Check CPU usage (should not spike excessively)

- [ ] **6.0 Metrics Tracking & Validation** (Post-Launch)
  - [ ] 6.1 Set up baseline metrics collection (before launch)
    - Record current metrics:
      - Demo → Signup conversion rate: __%
      - Average session duration: __ minutes
      - Habits logged per user per week: __
      - First Contentful Paint: __ seconds
      - Lighthouse Performance score: __
      - Lighthouse Accessibility score: __
    - Document in GitHub issue or project management tool
  - [ ] 6.2 Launch redesign (merge PRD #2)
    - Create feature branch: `git checkout -b feature/prd-0003-amara-day-pages-polish`
    - Commit all changes with descriptive message
    - Push branch and create PR
    - Wait for CI checks (all tests must pass)
    - Request stakeholder approval
    - Merge to main after approval
    - Deploy to production
  - [ ] 6.3 Track conversion metrics (Week 1-2 post-launch)
    - Monitor daily:
      - Demo → Signup conversion rate
      - Which conversion prompts drive most signups (first habit, 3 habits, first log, progress visit)
      - Time to first signup (from demo mode start)
    - Compare to baseline
    - Target: +15-20% improvement in conversion rate
  - [ ] 6.4 Track engagement metrics (Week 1-2 post-launch)
    - Monitor weekly:
      - Average session duration (target: +10%)
      - Habits logged per user per week (target: maintain or +5%)
      - Progress page visit frequency
    - Compare to baseline
  - [ ] 6.5 Track performance metrics (Week 1)
    - Run Lighthouse audits
    - Verify: Performance ≥ 90, Accessibility ≥ 95
    - Check FCP < 1.5 seconds on 4G
    - Compare to baseline (ensure no regressions)
  - [ ] 6.6 Track dark mode adoption (Week 1-4)
    - If analytics available, track:
      - Percentage of users in dark mode (expected 20-40% based on system preferences)
      - Manual dark mode toggle usage
  - [ ] 6.7 Gather qualitative feedback (Week 2-4)
    - User interviews or surveys:
      - "Does the redesign feel warm and inviting?"
      - "Is the app easier or harder to use after redesign?"
      - "Do you prefer light or dark mode?"
    - Document feedback in GitHub discussions or project wiki
  - [ ] 6.8 Iterate based on data (Month 2-3)
    - If conversion rate improvement < 15%:
      - A/B test different conversion modal copy
      - Adjust conversion prompt timing
    - If session duration decreased:
      - Review animations (too distracting?)
      - Check loading performance
    - If dark mode adoption low:
      - Investigate usability issues in dark mode
      - Ensure toggle is discoverable

- [ ] **7.0 Final Documentation & Handoff** (0.5-1 hour)
  - [ ] 7.1 Update CHANGELOG.md
    - Add entry for PRD #2 (e.g., v2.1.0):
      - "🎨 Complete page redesigns (Welcome, Daily Log, Progress, Manage Habits)"
      - "✨ Added delightful animations (confetti, streaks, checkmarks)"
      - "🌙 Implemented warm dark mode with system preference detection"
      - "🖼️ Professional empty state illustrations"
      - "🧪 Visual regression testing with Playwright"
      - "📊 Improved demo → signup conversion rate by X%"
  - [ ] 7.2 Create or update DESIGN_SYSTEM.md
    - Document color palette (light + dark modes)
    - Document typography system (fonts, scales, line heights)
    - Document spacing scale
    - Document component library (buttons, cards, inputs, toggles)
    - Provide code examples for using design tokens
    - Include screenshots of components in both themes
  - [ ] 7.3 Update README.md
    - Add "Features" section:
      - Warm minimalism design
      - Dark mode support
      - Professional illustrations
      - Delightful micro-interactions
    - Update screenshots (show new Amara.day branding)
    - Link to DESIGN_SYSTEM.md
  - [ ] 7.4 Create post-launch report
    - Document metrics before/after:
      - Conversion rate improvement: +__%
      - Session duration change: +__%
      - Performance scores maintained: Yes/No
    - Lessons learned:
      - What worked well (e.g., warm colors increased engagement)
      - What could improve (e.g., confetti too distracting, reduced particle count)
    - Next steps:
      - Future enhancements (seasonal palettes, custom themes)
      - Ongoing monitoring (conversion rate, engagement)
  - [ ] 7.5 Celebrate completion! 🎉
    - Share redesign with team
    - Announce launch to users (blog post, email, social media)
    - Gather user testimonials on new design
    - Plan next iteration based on feedback and metrics

---

## Notes

- **Prerequisites**: PRD #1 (0002) must be completed and validated before starting PRD #2
- **Illustration timeline**: Commission illustrations at start of Phase 3 (1-2 week turnaround)
- **Placeholder strategy**: Use emoji placeholders until professional illustrations delivered
- **Dark mode testing**: Every component and page must be tested in both light and dark modes
- **Visual regression**: Baseline screenshots committed to git, tests run on CI for PRs
- **Metrics tracking**: Baseline collected before launch, post-launch monitoring for 2-4 weeks
- **Animation performance**: Confetti must run at 30+ FPS, use `requestAnimationFrame`
- **Accessibility priority**: Dark mode must meet WCAG AA contrast, keyboard navigation in both themes
- **Conversion focus**: Warm design + professional illustrations aim for 15-20% conversion improvement
- **Order of implementation**: Phase 3 → Phase 4 → Phase 5 (pages → polish → dark mode)

---

**Estimated Total Effort:** 9-13 hours
**Completion Criteria:** All acceptance criteria in PRD #0003 met, metrics showing improvement, stakeholder approval
**Success Metrics:** +15-20% conversion rate, +10% session duration, Performance 90+, Accessibility 95+
