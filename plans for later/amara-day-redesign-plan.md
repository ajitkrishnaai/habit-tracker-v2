# Amara.day - Warm Minimalism Redesign Plan

**Project:** Habit Tracker V2 → Amara.day
**Design Direction:** Warm Minimalism - Earthy & Organic
**Tagline:** "Mindful habits. Lasting change."
**Created:** October 19, 2025
**Updated:** October 19, 2025
**Status:** Ready for Implementation

---

## 📋 Implementation Strategy & Decisions

### Scope & Approach

**Implementation Scope:** Phase 0-2 in PRD #1, Phase 3-5 in PRD #2

**Rationale:**
- PRD #1 establishes design foundation (branding, colors, typography, core components)
- Allows validation of aesthetic before committing to all pages
- Creates natural checkpoint: "Does this feel like Amara.day?"
- PRD #2 applies foundation to all pages + adds polish

**Timeline:** 3-4 week phased rollout (balanced approach)
- Week 1: Phase 0 (Branding) + Phase 1 (Design System) - 4-6 hours
- Week 2: Phase 2 (Core Components) - 3-4 hours
- Week 3: Phase 3 (Page Redesigns) - 4-5 hours
- Week 4: Phase 4-5 (Polish + Dark Mode) - 4-6 hours

**Phase Priority:** Sequential dependency chain
1. Phase 0 (Branding) - establishes identity
2. Phase 1 (Design System) - creates design language
3. Phase 2 (Core Components) - implements the system
4. Phases 3-5 build on the foundation

---

### Technical Decisions

**Design Asset Creation:** Mix approach
- **Create in code (SVG):** Logo icon (sunrise), simple icons, buttons, basic shapes
- **Commission/design later:** Complex illustrations for empty states, advanced animations
- **Start with placeholders:** Defer complex illustrations to Phase 4, focus on core design first

**Animation Library:** CSS-first with optional library enhancement
- **Pure CSS:** Button hovers, card lifts, toggle switches, input focus states, transitions
- **Library (optional in Phase 4):** Complex animations like confetti (if needed)
- **Benefits:** Keeps bundle size small, no dependency overhead for simple animations

**Dark Mode Strategy:** Light mode first, dark mode in Phase 5
- Complete and perfect light mode across all components/pages
- Phase 5 adds dark mode as a layer (faster if color system is well-structured)
- Reduces cognitive load during initial implementation
- System preference detection + manual toggle in Phase 5

---

### User Experience Strategy

**Demo Mode Impact:** Enhanced conversion prompts with new design
- Demo mode is a key conversion path (per CLAUDE.md)
- **Priority updates:**
  - Navigation with Amara.day branding
  - Welcome page hero (first impression)
  - Conversion modals with warm, inviting design
- Full demo mode UX refinement in Phase 3-4

**Migration Strategy:** Hard cutover (pre-launch/early stage)
- Project is in "Ready for Deployment" stage (per CLAUDE.md)
- If users exist: Announce rebrand as positive milestone ("Amara.day has a new look!")
- No feature flags or A/B testing (comprehensive visual overhaul)

---

### Success Metrics

**Measurement Approach:** Track all dimensions

**Baseline Metrics (before redesign):**
- Demo → Signup conversion: X%
- Daily log session duration: X minutes
- Habits logged per user per week: X
- First Contentful Paint: X seconds
- Lighthouse Performance Score: X

**Success Targets (after redesign):**
- Demo → Signup conversion: **+15-20%** (improved warm UX encourages commitment)
- Session duration: **+10%** (users enjoy the experience, spend more time)
- Habits logged: **Maintain or +5%** (better UX encourages consistent logging)
- First Contentful Paint: **< 1.5s** (performance maintained despite richer design)
- Lighthouse Performance: **90+** (no regressions)
- Lighthouse Accessibility: **95+** (WCAG AA compliance)

**Tracking by Phase:**
- **Phase 0-2:** Performance metrics (CSS load time, bundle size, no regressions)
- **Phase 3:** User engagement (time on Daily Log, habits logged, page navigation patterns)
- **Phase 4-5:** Conversion metrics (demo → signup rate, completion rate)

---

### Testing Requirements

**Level:** Enhanced (accessibility audits + cross-browser testing)

**Standard Testing (all phases):**
- ✅ Visual regression testing (Percy/Chromatic or screenshot comparison)
- ✅ Existing E2E test suite (Playwright) - all tests must pass
- ✅ Unit tests for new components
- ✅ Manual QA on desktop + mobile viewports

**Enhanced Testing (PRD #1 completion):**
- ✅ Lighthouse audits (Performance, Accessibility, Best Practices, SEO)
- ✅ axe-core automated accessibility testing
- ✅ Manual keyboard navigation testing
- ✅ Screen reader testing (VoiceOver on macOS/iOS, NVDA on Windows)
- ✅ Cross-browser compatibility:
  - Chrome/Edge (latest)
  - Firefox (latest)
  - Safari (macOS latest + iOS Safari)

**Cross-Browser Testing Matrix:**
| Browser | Desktop | Mobile | Priority |
|---------|---------|--------|----------|
| Chrome | ✅ 1280x720, 1920x1080 | ✅ 375x667, 414x896 | High |
| Safari | ✅ 1440x900 | ✅ iPhone 13, iPad | High |
| Firefox | ✅ 1280x720 | ⚠️ Manual spot-check | Medium |
| Edge | ✅ 1920x1080 | - | Medium |

**Deferred Testing (post-launch):**
- ⏳ User testing sessions with real users
- ⏳ A/B testing (not applicable for hard cutover)
- ⏳ Analytics heat mapping

---

### Asset Creation Strategy

**Assets to Create in Code (SVG):**

1. **Amara.day Sunrise Logo Icon**
   ```svg
   <!-- Organic flowing sunrise with soft curves -->
   - Semi-circle sun rising from horizon
   - 3-5 organic rays (flowing, not geometric)
   - Gradient: Terracotta (#D4745E) → Sunset Orange (#E89C5A)
   - Viewbox: 0 0 64 64 (scalable)
   - Optimized for 16px (favicon) to 512px (PWA)
   ```

2. **Simple Icons**
   - Sun icon (dark mode toggle)
   - Moon icon (dark mode toggle)
   - Checkmark (success states)
   - Arrow icons (date navigator)

3. **Basic Shapes**
   - Gradient backgrounds (CSS)
   - Soft blob shapes (SVG `<path>` with organic curves)

**Assets to Defer/Commission:**

1. **Complex Illustrations (Phase 4)**
   - Empty state sunrise illustration (hand-drawn style)
   - Onboarding illustrations (if added)
   - Decorative page elements

2. **Advanced Animations (Phase 4, optional)**
   - Confetti particles (may use library or SVG animation)
   - Flame animations for streaks (CSS or Lottie)

**Placeholder Approach:**
- Use simple geometric SVG shapes as placeholders
- Replace with refined illustrations in Phase 4
- Focus: Get core design solid before polish

---

## 🎯 PRD Preparation

### PRD #1: Foundation & Core Components
**Phases:** 0, 1, 2
**Timeline:** Week 1-2 (7-10 hours)
**Status:** Ready to generate

**Scope:**
- **Phase 0:** Branding assets (logo, favicon, PWA icons, meta tags)
- **Phase 1:** Design system foundation (colors, typography, spacing, shadows)
- **Phase 2:** Core component redesigns (Navigation, ToggleSwitch, Buttons, Inputs, Cards)

**Deliverables:**
- [ ] Amara.day sunrise logo SVG component
- [ ] Favicon + PWA icons (all sizes)
- [ ] Updated `index.html` and `manifest.json`
- [ ] `src/styles/colors.css` (light mode palette)
- [ ] `src/styles/main.css` (typography, spacing, shadows)
- [ ] Updated Navigation with Amara.day branding
- [ ] Redesigned ToggleSwitch component
- [ ] Updated button styles (`src/styles/buttons.css`)
- [ ] Enhanced input/textarea styles
- [ ] Updated card component styles
- [ ] Component unit tests updated
- [ ] E2E tests passing

**Success Criteria:**
- ✅ All components render with warm earthy aesthetic
- ✅ Lighthouse Performance: 90+
- ✅ Lighthouse Accessibility: 95+
- ✅ axe-core audit: 0 violations
- ✅ Cross-browser tested (Chrome, Safari, Firefox)
- ✅ Keyboard navigation functional
- ✅ Screen reader compatible
- ✅ No visual regressions in existing functionality

**Validation Checkpoint:**
- Review aesthetic: "Does this feel like Amara.day?"
- Gather feedback before proceeding to PRD #2
- Adjust colors/typography if needed

---

### PRD #2: Pages, Polish & Dark Mode
**Phases:** 3, 4, 5
**Timeline:** Week 3-4 (9-13 hours)
**Status:** Pending PRD #1 completion

**Scope:**
- **Phase 3:** Page redesigns (Welcome, Daily Log, Progress, Manage Habits)
- **Phase 4:** Polish & delight (loading states, empty states, animations, toasts, footer)
- **Phase 5:** Dark mode (color system, toggle component, all components/pages)

**Deliverables:**
- [ ] Welcome Page hero with Amara.day branding
- [ ] Daily Log Page with warm habit cards
- [ ] Progress Page with colorful analytics
- [ ] Manage Habits Page with FAB
- [ ] Loading screen component
- [ ] Empty state components with illustrations
- [ ] Success animations (confetti, checkmarks, flames)
- [ ] Toast notification component
- [ ] Footer redesign
- [ ] Dark mode color system (`colors.css` updated)
- [ ] Dark mode toggle component
- [ ] All components dark mode compatible
- [ ] Dark mode E2E tests

**Success Criteria:**
- ✅ All pages cohesive with warm minimalism aesthetic
- ✅ Demo → Signup conversion: +15-20% improvement
- ✅ User engagement metrics stable or improved
- ✅ Dark mode WCAG AA compliant
- ✅ Smooth theme toggle (300ms transition)
- ✅ Performance budget maintained
- ✅ Cross-browser tested in both modes

**Validation Checkpoint:**
- Track conversion metrics (before/after)
- User feedback on warmth and usability
- Accessibility re-audit in dark mode

---

## 🎨 Design Vision

### Brand Personality
**Warm • Eternal • Daily • Grounded • Intentional • Calm**

### Design Philosophy
Combine **warm earthy aesthetics** with **clean minimalism**:
- Soft colors and organic shapes (not cold/techy)
- Gentle shadows and refined typography
- Playful yet focused experience
- Light + Dark mode support

### Target Experience
- **Calm & Focused:** Reduces anxiety, encourages daily practice
- **Playful & Fun:** Delightful micro-interactions, warm colors
- **Grounded:** Sustainable long-term habit building
- **Beautiful:** Premium feel without being pretentious

---

## 🌅 Branding

### Name & Meaning
**Amara.day**
- "Amara" = eternal/everlasting (Sanskrit/Greek)
- ".day" = emphasizes daily logging core feature
- Perfect alignment with sustainable habit building

### Tagline
**Primary:** "Mindful habits. Lasting change."

**Alternates:**
- "Daily rituals. Eternal progress."
- "Your daily practice. Built to last."
- "Track today. Build tomorrow. Forever."

### Logo System

#### Logo Icon: Organic Flowing Sunrise (Option B - Selected)
```
Concept: Hand-drawn sunrise with soft curves
- Semi-circle sun rising from horizon
- 3-5 organic rays (flowing, not geometric)
- Warm gradient: Terracotta (#D4745E) → Sunset Orange (#E89C5A)
- Subtle glow/shadow for depth
- Scales beautifully: 16px (favicon) → 512px (PWA)
```

#### Wordmark: Organic Typography (Option 3 - Selected)
```
Structure:
- "Amara" in DM Sans Bold
- ".day" in DM Sans Medium (lighter weight)
- Custom kerning for elegance
- Gradient option: Terracotta to Clay

Color Treatment:
- Light mode: Terracotta (#D4745E)
- Dark mode: Warm off-white (#F5F1EB)
- ".day" in warm gray for contrast
```

---

## 🎨 Color Palette

### Light Mode - Warm Earthy Palette

#### Primary Colors
```css
--color-primary: #D4745E;        /* Terracotta */
--color-primary-hover: #B86F50;  /* Clay */
--color-primary-light: #E89676;  /* Soft Terracotta */
--color-primary-dark: #A85D47;   /* Deep Clay */
```

#### Success & Accent
```css
--color-success: #8B9A7E;        /* Sage Green */
--color-success-hover: #748264;  /* Dark Sage */
--color-success-light: #A8B89A;  /* Muted Sage */

--color-sunset: #E89C5A;         /* Sunset Orange */
--color-clay: #B86F50;           /* Clay */
--color-dusty-rose: #C89F94;     /* Dusty Rose */
--color-olive: #9CAA7C;          /* Olive */
```

#### Backgrounds - Warm Neutrals
```css
--color-background: #FAF8F5;     /* Warm White */
--color-surface: #F5F1EB;        /* Warm Gray 100 */
--color-surface-hover: #EBE5DC;  /* Warm Gray 150 */
```

#### Borders
```css
--color-border: #D4CFC5;         /* Warm Gray 300 */
--color-border-light: #E8E3D9;   /* Warm Gray 200 */
```

#### Text
```css
--color-text-primary: #3A3631;   /* Warm Gray 900 - Softer than black */
--color-text-secondary: #7A7166; /* Warm Gray 600 */
--color-text-tertiary: #9D9389;  /* Warm Gray 500 */
```

#### Error & Warning (Warm Tones)
```css
--color-error: #C85A4F;          /* Warm Red */
--color-warning: #D4915A;        /* Warm Amber */
```

### Dark Mode - Warm Cozy Palette

#### Primary Colors
```css
--color-primary: #E89676;        /* Lighter Terracotta (more visible) */
--color-primary-hover: #F0A98A;  /* Soft Coral */
--color-primary-light: #F5C0AA;  /* Peachy */
--color-primary-dark: #D4745E;   /* Original Terracotta */
```

#### Success & Accent
```css
--color-success: #A8B89A;        /* Muted Sage */
--color-success-hover: #BCC9AF;  /* Light Sage */
--color-success-light: #C5D4B7;  /* Very Light Sage */
```

#### Backgrounds - Warm Dark Browns
```css
--color-background: #1E1B17;     /* Deep Charcoal (warm brown-black) */
--color-surface: #2C2822;        /* Warm Brown */
--color-surface-hover: #3A3631;  /* Lighter Warm Brown */
```

#### Borders
```css
--color-border: #4A4640;         /* Warm Dark Gray */
--color-border-light: #3A3631;   /* Lighter than surface */
```

#### Text
```css
--color-text-primary: #F5F1EB;   /* Warm Off-White */
--color-text-secondary: #B8AFA3; /* Muted Warm Gray */
--color-text-tertiary: #8A8179;  /* Darker Warm Gray */
```

#### Error & Warning
```css
--color-error: #E89676;          /* Soft Terracotta */
--color-warning: #E8B176;        /* Warm Peach */
```

---

## 📐 Typography System

### Font Families
```css
/* Display/Headings - Soft geometric sans */
--font-display: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

/* Body - Humanist sans (warmth + readability) */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace - For stats/numbers (optional) */
--font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
```

### Fluid Type Scale
```css
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);     /* 12-14px */
--text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);       /* 14-16px */
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);     /* 16-18px */
--text-lg: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);       /* 18-22px */
--text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem);      /* 20-28px */
--text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);       /* 24-36px */
--text-3xl: clamp(2rem, 1.5rem + 2.5vw, 3.5rem);          /* 32-56px */
--text-4xl: clamp(2.5rem, 2rem + 3vw, 4.5rem);            /* 40-72px */
```

### Line Heights
```css
--leading-tight: 1.2;      /* Headings */
--leading-snug: 1.375;     /* Subheadings */
--leading-normal: 1.6;     /* Body (increased for warmth) */
--leading-relaxed: 1.8;    /* Spacious paragraphs */
```

### Letter Spacing
```css
--tracking-tight: -0.03em;  /* Large headings */
--tracking-normal: -0.01em; /* Standard headings */
--tracking-wide: 0.02em;    /* Small caps, labels */
```

### Usage
```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  letter-spacing: var(--tracking-tight);
}

body {
  font-family: var(--font-body);
  line-height: var(--leading-normal);
}
```

---

## 📏 Spacing & Layout

### Spacing Scale
```css
--space-xs: 0.5rem;    /* 8px */
--space-sm: 0.75rem;   /* 12px */
--space-md: 1.25rem;   /* 20px - Increased from 16px */
--space-lg: 2rem;      /* 32px - Increased from 24px */
--space-xl: 3rem;      /* 48px - Increased from 32px */
--space-2xl: 4rem;     /* 64px - Increased from 48px */
--space-3xl: 6rem;     /* 96px */
```

### Border Radius - Organic Curves
```css
--radius-sm: 0.5rem;   /* 8px */
--radius-md: 0.75rem;  /* 12px */
--radius-lg: 1rem;     /* 16px - Increased for organic feel */
--radius-xl: 1.5rem;   /* 24px */
--radius-full: 9999px; /* Pills/circles */
```

### Shadows - Soft & Warm

#### Light Mode
```css
--shadow-sm: 0 2px 8px rgba(58, 54, 49, 0.08);
--shadow-md: 0 4px 16px rgba(58, 54, 49, 0.12);
--shadow-lg: 0 8px 32px rgba(58, 54, 49, 0.16);
--shadow-xl: 0 16px 48px rgba(58, 54, 49, 0.2);
```

#### Dark Mode (Softer shadows)
```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.6);
```

### Transitions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🧩 Component Redesigns

### Navigation

**Current:** Generic "Habit Tracker" text
**New:** Amara.day branded navigation

```tsx
<nav className="navigation">
  <div className="navigation-brand">
    <a href="/" className="brand-logo">
      <AmaraDayIcon className="brand-icon" size={32} />
      <h1 className="brand-wordmark">
        <span className="brand-name">Amara</span>
        <span className="brand-tld">.day</span>
      </h1>
    </a>
  </div>
  {/* Navigation menu items */}
</nav>
```

**Styling:**
- Sticky positioning with backdrop blur (glassmorphism)
- Sunrise icon: 32px, warm gradient
- Wordmark: Terracotta "Amara" + warm gray ".day"
- Dark mode: Warm off-white wordmark

---

### Toggle Switch - Organic & Playful

**Current:** Basic gray/blue toggle
**New:** Larger, organic, satisfying interaction

**Specifications:**
- **Size:** 60px × 34px (desktop), 52px × 28px (mobile)
- **Shape:** Organic pill (fully rounded)
- **OFF State:** Warm gray background (#D4CFC5)
- **ON State:** Sage green gradient (#8B9A7E → #A8B89A)
- **Thumb:** 28px circle, white, soft shadow
- **Animation:** Spring ease (cubic-bezier), 250ms
- **Press State:** Squish effect (scale 0.95)
- **Success Feedback:** Checkmark icon briefly appears on toggle

**CSS Example:**
```css
.toggle-switch {
  width: 60px;
  height: 34px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  transition: background var(--transition-base);
}

.toggle-switch--on {
  background: linear-gradient(135deg, #8B9A7E 0%, #A8B89A 100%);
}

.toggle-switch__thumb {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: white;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-base);
}

.toggle-switch--on .toggle-switch__thumb {
  transform: translateX(26px);
}

.toggle-switch:active .toggle-switch__thumb {
  transform: scale(0.95);
}
```

---

### Buttons - Warm & Inviting

#### Primary Button
**Current:** Basic blue button
**New:** Terracotta gradient with lift animation

```css
.btn-primary {
  background: linear-gradient(135deg, #D4745E 0%, #B86F50 100%);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-family: var(--font-display);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: linear-gradient(135deg, #E89676 0%, #D4745E 100%);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.75rem 2rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all var(--transition-base);
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
}
```

#### Floating Action Button (FAB)
For "Add Habit" button on Manage Habits page:
```css
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #D4745E 0%, #E89C5A 100%);
  box-shadow: var(--shadow-xl);
  transition: all var(--transition-base);
}

.fab:hover {
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 20px 60px rgba(212, 116, 94, 0.4);
}
```

---

### Input Fields - Calm Focus

**Current:** Basic border inputs
**New:** Warm backgrounds, floating labels, soft focus states

```css
input, textarea {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.875rem 1.25rem;
  font-size: var(--text-base);
  font-family: var(--font-body);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(212, 116, 94, 0.15);
  background: var(--color-background);
}
```

**Floating Label Pattern:**
```tsx
<div className="input-group">
  <input
    type="text"
    id="habit-name"
    placeholder=" "
  />
  <label htmlFor="habit-name">Habit Name</label>
</div>
```

```css
.input-group {
  position: relative;
}

.input-group label {
  position: absolute;
  top: 50%;
  left: 1.25rem;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
  transition: all var(--transition-base);
}

.input-group input:focus + label,
.input-group input:not(:placeholder-shown) + label {
  top: -0.5rem;
  left: 0.75rem;
  font-size: var(--text-xs);
  color: var(--color-primary);
  background: var(--color-background);
  padding: 0 0.5rem;
}
```

---

### Cards - Layered Depth

**Current:** Flat with basic borders
**New:** Soft shadows, hover lift, warm backgrounds

```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
  transition: all var(--transition-base);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  background: var(--color-background);
}

.card--interactive {
  cursor: pointer;
}

.card--interactive:active {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}
```

**Habit Card Specific:**
```css
.habit-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.habit-card__category {
  display: inline-block;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-sunset);
  color: white;
  font-size: var(--text-xs);
  font-weight: 600;
  border-radius: var(--radius-sm);
}
```

---

## 📄 Page-Specific Redesigns

### Welcome Page

#### Hero Section
```tsx
<header className="welcome-hero">
  <div className="hero-brand">
    <AmaraDayIcon className="hero-icon" size={80} />
    <h1 className="hero-wordmark">
      <span className="hero-amara">Amara</span>
      <span className="hero-tld">.day</span>
    </h1>
  </div>

  <p className="hero-tagline">
    Mindful habits. Lasting change.
  </p>

  <p className="hero-subtitle">
    Your daily ritual. Built to last.
  </p>
</header>
```

**Styling:**
```css
.welcome-hero {
  text-align: center;
  padding: var(--space-3xl) var(--space-md);
  background: linear-gradient(180deg, #FAF8F5 0%, #F5F1EB 100%);
}

.hero-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.hero-icon {
  width: 80px;
  height: 80px;
  animation: gentle-pulse 3s ease-in-out infinite;
}

@keyframes gentle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.hero-wordmark {
  font-size: var(--text-4xl);
  font-weight: 800;
  letter-spacing: var(--tracking-tight);
}

.hero-amara {
  background: linear-gradient(135deg, #D4745E 0%, #E89C5A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-tld {
  color: var(--color-text-secondary);
  font-weight: 600;
}

.hero-tagline {
  font-size: var(--text-2xl);
  color: var(--color-text-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  font-style: italic;
}
```

#### How It Works Section
- Keep 3-step journey cards
- Update number badges: Circular with terracotta gradient
- Add subtle sunrise icon to each step
- Warm card backgrounds with soft shadows

```css
.welcome-step-number {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #D4745E 0%, #E89C5A 100%);
  color: white;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-md);
}
```

#### CTA Section
- Large "Try Without Signing In" button with gradient
- Collapsible email sign-in form (warm inputs, floating labels)
- Privacy note in warm gray

---

### Daily Log Page

#### Header
```tsx
<div className="page-header">
  <h1 className="page-title">Today's Habits</h1>
  <p className="page-subtitle">Track your mindful practice</p>
</div>
```

#### Date Navigator
- Pill-shaped active date (terracotta background, white text)
- Arrow buttons with warm gray backgrounds
- Smooth slide transition between dates

```css
.date-navigator__date--active {
  background: var(--color-primary);
  color: white;
  border-radius: var(--radius-full);
  padding: var(--space-sm) var(--space-md);
}
```

#### Habit Cards
- Each card: warm surface background, soft shadow
- Category badges: Colored (terracotta, sage, sunset, olive)
- Large organic toggle switches
- Hover: Subtle lift + shadow increase
- Completion animation: Scale pulse + checkmark fade-in

#### Notes Section
- Larger textarea (warm border, surface background)
- Floating label: "Add notes about your day..."
- Character count: warm gray, right-aligned
- Save button: Gradient with icon

---

### Progress Page

#### Page Header
```tsx
<div className="page-header">
  <h1 className="page-title">Progress</h1>
  <p className="page-subtitle">Track your habits and discover patterns</p>
</div>
```

#### Progress Cards
```css
.progress-card {
  border-top: 4px solid;
  border-image: linear-gradient(90deg, #D4745E 0%, #8B9A7E 100%) 1;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-sm);
}
```

**Stats Section:**
- Flame icon for current streak (warm gradient)
- Trophy icon for longest streak (warm gold)
- Chart icon for completion percentage (warm colors)
- Numbers in display font, larger size

**Pattern Analysis:**
- Sentiment indicators: Warm-toned emoji replacements
- Keyword badges: Rounded pills with category colors (terracotta, sage, sunset)
- Correlation text: Highlighted with warm background

**Charts/Visualizations:**
- Use warm color palette (not cold blues)
- Bar charts: Terracotta gradient
- Line charts: Sage green strokes
- Sparklines: Sunset orange

#### Empty State
```tsx
<EmptyState
  illustration={<SunriseIllustration />}
  title="No progress yet"
  message="Start tracking habits to see your progress bloom"
  actionText="Add Your First Habit"
  actionLink="/manage-habits"
/>
```

---

### Manage Habits Page

#### Grid Layout
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 2-3 columns

#### Habit Cards
- Warm surface background
- Edit/Delete actions (icon buttons, warm colors)
- Hover: Lift + shadow

#### Add Habit FAB
- Bottom-right floating action button
- Terracotta gradient, large (64px)
- Hover: Scale + rotate 90°
- Opens modal on click

#### Habit Form Modal
- Slide-up animation from bottom
- Warm inputs with floating labels
- Category color picker (warm palette)
- Success animation: Confetti (warm colors)

---

## ✨ Animation & Interaction Patterns

### Micro-interactions

#### Button Press
```css
.btn:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-sm);
}
```

#### Card Hover
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

#### Toggle Switch
```css
.toggle-switch {
  transition: background 250ms cubic-bezier(0.34, 1.56, 0.64, 1); /* Spring */
}
```

#### Success Checkmark
```css
@keyframes checkmark-fade-in {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.checkmark {
  animation: checkmark-fade-in 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Delightful Touches

#### First Habit Added
- Gentle confetti animation (warm colors: terracotta, sage, sunset)
- Duration: 2-3 seconds
- Particles: 20-30, falling from top

#### Streak Milestones
- 7 days: Small flame animation
- 14 days: Medium flame with sparkle
- 30 days: Large flame with confetti
- Toast notification: "🔥 30-day streak! You're on fire!"

#### Daily Log Complete
- Checkmark ripple effect (circular wave)
- Scale pulse animation
- Warm success color

#### Notes Saved
- Toast notification slides from top
- "Notes saved ✓" message
- Warm surface background, soft shadow
- Auto-dismiss after 3 seconds

### Page Transitions
```css
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 300ms ease-out;
}

.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity 200ms ease-in;
}
```

### Loading States

#### Skeleton Screens
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface) 0%,
    var(--color-border-light) 50%,
    var(--color-surface) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### Loading Screen
```tsx
<div className="loading-screen">
  <AmaraDayIcon className="loading-icon animate-pulse" size={80} />
  <h2 className="loading-wordmark">
    <span className="loading-amara">Amara</span>
    <span className="loading-tld">.day</span>
  </h2>
  <p className="loading-message">Building your day...</p>
</div>
```

---

## 🌙 Dark Mode Implementation

### Theme Toggle Component
```tsx
export const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
};
```

### Color Transition
```css
* {
  transition: background-color 300ms ease-in-out,
              border-color 300ms ease-in-out,
              color 300ms ease-in-out;
}
```

### Dark Mode Specific Adjustments

#### Logo
- Use warm off-white (#F5F1EB) instead of terracotta
- Keep ".day" in muted gray for contrast

#### Shadows
- Softer, lighter shadows (see color palette)
- Increased opacity for visibility

#### Borders
- Lighter warm grays for better contrast
- Slightly thicker borders (2px instead of 1px)

#### Text Contrast
- Ensure WCAG AA compliance
- Warm off-white (#F5F1EB) for primary text
- Avoid pure white (too harsh)

---

## 🏗️ Implementation Strategy

### Phase 0: Branding Foundation (2-3 hours)

**0.1. Design Logo Assets**
- [ ] Create organic flowing sunrise SVG icon
- [ ] Design Amara.day wordmark variations
- [ ] Export favicon (32x32 .ico)
- [ ] Export favicon.svg (scalable)
- [ ] Generate PWA icons (192x192, 512x512)
- [ ] Create apple-touch-icon (180x180)
- [ ] Design social sharing image (1200x630)

**0.2. Create React Components**
- [ ] `src/components/branding/AmaraDayLogo.tsx`
- [ ] `src/components/branding/AmaraDayIcon.tsx`
- [ ] Props: size, variant (full-color, dark-mode, monochrome)

**0.3. Update Meta Tags**
- [ ] Update `index.html` title
- [ ] Add meta description
- [ ] Set theme-color (#D4745E)
- [ ] Add Open Graph tags
- [ ] Add Twitter card tags

**0.4. Update Manifest**
- [ ] Update `public/manifest.json`
- [ ] App name: "Amara.day"
- [ ] Short name, description
- [ ] Theme colors, background color
- [ ] Icon references

---

### Phase 1: Design System Foundation (2-3 hours)

**1.1. Color System**
- [ ] Create `src/styles/colors.css`
- [ ] Define light mode palette (CSS variables)
- [ ] Define dark mode palette (`[data-theme="dark"]`)
- [ ] Test WCAG AA contrast compliance

**1.2. Typography**
- [ ] Import Google Fonts (DM Sans, Inter)
- [ ] Update `src/styles/main.css` with font families
- [ ] Define fluid type scale (clamp values)
- [ ] Set line heights, letter spacing
- [ ] Apply to headings and body

**1.3. Spacing & Layout**
- [ ] Update spacing scale (generous for warmth)
- [ ] Define border radius values (organic curves)
- [ ] Create shadow system (soft warm tones)
- [ ] Set up transition variables

**1.4. Global Styles**
- [ ] Add smooth color transitions
- [ ] Implement prefers-reduced-motion support
- [ ] Set up theme data attribute handling

---

### Phase 2: Core Components (3-4 hours)

**2.1. Navigation**
- [ ] Update `src/components/Navigation.tsx`
- [ ] Replace "Habit Tracker" with Amara.day logo
- [ ] Add sunrise icon + wordmark
- [ ] Style with warm colors
- [ ] Implement dark mode variant
- [ ] Add backdrop blur (glassmorphism)

**2.2. Toggle Switch**
- [ ] Update `src/components/ToggleSwitch.tsx`
- [ ] Increase size (60x34px desktop)
- [ ] Add warm gray OFF state
- [ ] Add sage green gradient ON state
- [ ] Implement spring animation
- [ ] Add press squish effect
- [ ] Add checkmark success feedback

**2.3. Buttons**
- [ ] Create `src/styles/buttons.css`
- [ ] Primary: Terracotta gradient with lift
- [ ] Secondary: Outlined warm border
- [ ] FAB: Circular gradient for Manage Habits
- [ ] Hover/active states
- [ ] Dark mode variants

**2.4. Input Fields**
- [ ] Update input/textarea base styles
- [ ] Warm surface backgrounds
- [ ] Soft focus states (terracotta ring)
- [ ] Implement floating label pattern
- [ ] Character count styling

**2.5. Cards**
- [ ] Update card base styles
- [ ] Soft shadows, warm backgrounds
- [ ] Hover lift animation
- [ ] Habit card specific styling
- [ ] Category badge colors

---

### Phase 3: Page Redesigns (4-5 hours)

**3.1. Welcome Page**
- [ ] Update `src/pages/WelcomePage.tsx` and `.css`
- [ ] Hero: Large Amara.day branding
- [ ] Add animated sunrise icon
- [ ] Update tagline and subtitle
- [ ] Gradient background
- [ ] Update "How It Works" cards (warm badges)
- [ ] Redesign CTA section
- [ ] Style email form (floating labels)

**3.2. Daily Log Page**
- [ ] Update `src/pages/DailyLogPage.tsx` and `.css`
- [ ] Add warm page header
- [ ] Redesign date navigator (pill active state)
- [ ] Update habit cards (warm colors, shadows)
- [ ] Implement category color badges
- [ ] Enhance notes section (floating label)
- [ ] Add completion animation

**3.3. Progress Page**
- [ ] Update `src/pages/ProgressPage.tsx` and `.css`
- [ ] Update `src/components/ProgressCard.tsx` and `.css`
- [ ] Add gradient top border
- [ ] Add warm stat icons (flame, trophy)
- [ ] Color code charts/visualizations
- [ ] Update sentiment indicators
- [ ] Style keyword badges (warm colors)
- [ ] Update empty state illustration

**3.4. Manage Habits Page**
- [ ] Update `src/pages/ManageHabitsPage.tsx` and `.css`
- [ ] Implement grid layout
- [ ] Add FAB (floating action button)
- [ ] Update habit cards
- [ ] Style habit form modal
- [ ] Add confetti success animation

---

### Phase 4: Polish & Delight (2-3 hours)

**4.1. Loading States**
- [ ] Create `src/components/LoadingScreen.tsx`
- [ ] Amara.day branded loading screen
- [ ] Animated sunrise icon
- [ ] Skeleton screens for content

**4.2. Empty States**
- [ ] Update `src/components/EmptyState.tsx`
- [ ] Create sunrise illustration
- [ ] Warm encouraging copy
- [ ] Terracotta CTA buttons

**4.3. Success Animations**
- [ ] First habit confetti (warm colors)
- [ ] Streak milestone flames
- [ ] Daily log checkmark ripple
- [ ] Notes saved feedback

**4.4. Toast Notifications**
- [ ] Create `src/components/Toast.tsx`
- [ ] Slide-in animation
- [ ] Warm background styling
- [ ] Auto-dismiss functionality

**4.5. Footer**
- [ ] Update `src/components/Footer.tsx`
- [ ] Add Amara.day branding
- [ ] Style links (warm colors)
- [ ] Copyright with dynamic year

---

### Phase 5: Dark Mode (2-3 hours)

**5.1. Dark Mode Toggle**
- [ ] Create `src/components/DarkModeToggle.tsx`
- [ ] Sun/moon icon toggle
- [ ] localStorage persistence
- [ ] System preference detection

**5.2. Apply Dark Styles**
- [ ] Test all components in dark mode
- [ ] Logo: Warm off-white variant
- [ ] Verify shadow visibility
- [ ] Check border contrast
- [ ] Test text readability

**5.3. Smooth Transitions**
- [ ] Implement 300ms color transitions
- [ ] Test toggle experience
- [ ] Verify no jarring flashes

---

### Phase 6: Final Polish (1-2 hours)

**6.1. Accessibility Audit**
- [ ] WCAG AA contrast verification
- [ ] Keyboard navigation testing
- [ ] Screen reader testing
- [ ] Focus visible states
- [ ] Reduced motion support

**6.2. Responsive Testing**
- [ ] Mobile (320px, 375px, 414px)
- [ ] Tablet (768px, 834px)
- [ ] Desktop (1024px, 1440px, 1920px)
- [ ] Test light + dark modes on all sizes

**6.3. Performance**
- [ ] Optimize SVG assets
- [ ] Compress PNG icons
- [ ] Lazy load Google Fonts
- [ ] Test PWA install flow

**6.4. Cross-browser Testing**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS + iOS)

---

## 📦 Asset Checklist

### Branding Assets
- [ ] Amara.day sunrise icon SVG (organic flowing style)
- [ ] Wordmark SVG (light + dark variants)
- [ ] favicon.ico (32x32)
- [ ] favicon.svg (scalable)
- [ ] apple-touch-icon.png (180x180)
- [ ] icon-192.png (PWA)
- [ ] icon-512.png (PWA)
- [ ] og-image.png (1200x630 social sharing)

### Illustrations
- [ ] Sunrise empty state illustration
- [ ] Flame icons (small, medium, large for streaks)
- [ ] Checkmark animation SVG

### Icons
- [ ] Sun icon (light mode toggle)
- [ ] Moon icon (dark mode toggle)
- [ ] Category icons (optional warm-toned set)

---

## 🎯 Success Criteria

### Visual Quality
- [ ] Warm, cohesive color palette throughout
- [ ] Consistent organic shapes and rounded corners
- [ ] Soft shadows create depth without harshness
- [ ] Typography hierarchy is clear and refined
- [ ] Animations are smooth and delightful

### Branding
- [ ] Amara.day logo visible on all pages
- [ ] Tagline "Mindful habits. Lasting change." prominent
- [ ] Consistent brand voice and personality
- [ ] Favicon and PWA icons properly display

### User Experience
- [ ] All interactive elements feel responsive
- [ ] Micro-interactions provide satisfying feedback
- [ ] Dark mode is comfortable for nighttime use
- [ ] Loading states are clear and branded
- [ ] Empty states are encouraging, not harsh

### Technical
- [ ] WCAG AA accessibility compliance
- [ ] Responsive on all screen sizes
- [ ] Smooth transitions between light/dark modes
- [ ] No performance regressions
- [ ] Works on Chrome, Firefox, Safari

### Emotional Impact
- [ ] Users feel calm and focused
- [ ] Interface feels warm and inviting
- [ ] Accomplishments feel rewarding
- [ ] Long-term use feels sustainable

---

## 📝 Notes & Considerations

### Design Decisions

**Why warm colors?**
- Psychologically associated with comfort and motivation
- Creates emotional connection vs. cold tech feel
- Earth tones feel grounding (sustainable habit building)
- Less harsh on eyes during daily check-ins

**Why organic shapes?**
- Mirrors natural growth (habits as organic practice)
- Hand-drawn feel creates warmth
- Differentiates from geometric corporate apps
- Inviting, not intimidating

**Why generous spacing?**
- Creates calm, breathing room
- Reduces cognitive load
- Encourages mindful interaction
- Mobile-friendly (easier touch targets)

### Open Questions

- [ ] Should category colors be user-customizable?
- [ ] Add illustrations throughout or keep minimal?
- [ ] Include sound effects for success states?
- [ ] Offer additional theme variations (beyond light/dark)?

### Future Enhancements

- [ ] Animated onboarding tour
- [ ] Customizable color themes
- [ ] Seasonal palette variations
- [ ] Premium tier with enhanced animations
- [ ] Export progress as beautiful shareable images

---

## 🚀 Getting Started

### Implementation Approach

This redesign is split into **two PRDs for phased implementation**:

#### **Step 1: PRD #1 - Foundation & Core Components (Week 1-2)**
1. **Review PRD #1 scope** - Phases 0-2 (see "PRD Preparation" section above)
2. **Generate PRD #1** - Use this plan to create detailed implementation PRD
3. **Implement Phases 0-2:**
   - Phase 0: Create Amara.day branding assets
   - Phase 1: Build design system (colors, typography, spacing)
   - Phase 2: Redesign core components
4. **Validation checkpoint** - "Does this feel like Amara.day?"
5. **Test thoroughly:**
   - Run Lighthouse audits (Performance 90+, Accessibility 95+)
   - Cross-browser testing (Chrome, Safari, Firefox)
   - Keyboard navigation and screen reader testing
6. **Gather feedback** - Share component library with stakeholders

#### **Step 2: PRD #2 - Pages, Polish & Dark Mode (Week 3-4)**
1. **Review PRD #2 scope** - Phases 3-5 (pending PRD #1 completion)
2. **Generate PRD #2** - Apply foundation to all pages + add polish
3. **Implement Phases 3-5:**
   - Phase 3: Redesign all pages (Welcome, Daily Log, Progress, Manage Habits)
   - Phase 4: Add polish (animations, loading states, empty states)
   - Phase 5: Implement dark mode
4. **Track metrics:**
   - Demo → Signup conversion (target: +15-20%)
   - User engagement (session duration, habits logged)
   - Performance (maintain < 1.5s FCP)
5. **Final testing:**
   - Complete accessibility audit (light + dark modes)
   - Cross-browser testing in both themes
   - Visual regression testing
6. **Launch announcement** - "Amara.day has a new look!"

---

### Quick Start Checklist

**Before starting PRD #1:**
- [ ] Review complete design plan (this document)
- [ ] Confirm warm earthy aesthetic aligns with vision
- [ ] Set up baseline metrics (conversion rate, session duration, etc.)
- [ ] Prepare testing tools (Lighthouse, axe-core, cross-browser setup)

**During PRD #1 implementation:**
- [ ] Create sunrise logo SVG in code
- [ ] Generate favicon + PWA icons
- [ ] Build color system (CSS variables)
- [ ] Update typography and spacing
- [ ] Redesign components one by one
- [ ] Test each component (unit + visual + accessibility)

**After PRD #1 completion:**
- [ ] Validate aesthetic ("Does this feel like Amara.day?")
- [ ] Gather stakeholder feedback
- [ ] Make any color/typography adjustments
- [ ] Ensure all success criteria met
- [ ] Proceed to PRD #2 only if foundation is solid

**During PRD #2 implementation:**
- [ ] Apply foundation to all pages
- [ ] Add delightful animations and polish
- [ ] Implement dark mode
- [ ] Track before/after metrics
- [ ] Final accessibility and performance audits

**Post-launch:**
- [ ] Monitor conversion metrics
- [ ] Gather user feedback
- [ ] Iterate on any usability issues
- [ ] Consider advanced features (custom themes, seasonal palettes)

---

### Key Success Indicators

**After PRD #1 (Foundation):**
- ✅ Components feel warm, grounded, and inviting
- ✅ Lighthouse scores: Performance 90+, Accessibility 95+
- ✅ Zero accessibility violations (axe-core)
- ✅ Works perfectly on Chrome, Safari, Firefox

**After PRD #2 (Complete Redesign):**
- ✅ Demo → Signup conversion improved by 15-20%
- ✅ Users spend 10% more time in app (warm UX encourages engagement)
- ✅ Dark mode is comfortable and WCAG AA compliant
- ✅ Performance maintained (< 1.5s FCP)
- ✅ Brand identity "Amara.day" is clear and memorable

---

### Design Iteration Process

1. **Implement** - Build according to plan
2. **Test** - Run automated + manual tests
3. **Validate** - Check against success criteria
4. **Gather feedback** - Show to users/stakeholders
5. **Iterate** - Refine colors, spacing, or interactions if needed
6. **Repeat** - Continue to next phase

**Remember:** This is a **warm, human-centered design**. If something feels cold, harsh, or intimidating, adjust it. The goal is to make habit tracking feel like a daily ritual, not a chore.

---

**Document Version:** 2.0
**Created:** October 19, 2025
**Last Updated:** October 19, 2025
**Status:** Ready for PRD Generation
**Implementation Timeline:** 3-4 weeks (phased)
**Estimated Total Time:** 16-23 hours

---

*"Mindful habits. Lasting change."* 🌅

**Next Step:** Generate PRD #1 (Foundation & Core Components)
