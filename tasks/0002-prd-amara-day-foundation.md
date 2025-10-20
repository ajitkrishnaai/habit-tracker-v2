# PRD #0002: Amara.day Foundation & Core Components

**Project:** Habit Tracker V2 → Amara.day Redesign
**Phase:** PRD #1 - Foundation & Core Components (Phases 0-2)
**Created:** 2025-10-19
**Status:** Ready for Implementation
**Estimated Effort:** 7-10 hours
**Timeline:** Week 1-2

---

## 1. Introduction/Overview

This PRD covers the foundational redesign of Habit Tracker V2 to **Amara.day**, a warm minimalism habit tracking app. This is **PRD #1 of 2** in a phased redesign approach.

**Problem:** The current "Habit Tracker V2" branding is generic and the visual design lacks warmth and personality. Users need a more inviting, calming experience that encourages sustainable habit building.

**Solution:** Rebrand to "Amara.day" (meaning "eternal" + emphasis on daily practice) with a warm earthy color palette, organic shapes, and refined typography. This PRD establishes the design foundation (branding, design system, core components) that will be applied to all pages in PRD #2.

**Why Split Into Two PRDs?**
- PRD #1 creates the design language and validates the aesthetic before full rollout
- Allows checkpoint: "Does this feel like Amara.day?"
- PRD #2 will apply the foundation to all pages and add polish/dark mode

---

## 2. Goals

1. **Establish Brand Identity**: Create recognizable Amara.day branding with sunrise logo and warm color palette
2. **Build Design System**: Define reusable design tokens (colors, typography, spacing, shadows) for consistency
3. **Redesign Core Components**: Transform key UI elements (Navigation, ToggleSwitch, Buttons, Inputs, Cards) with warm aesthetic
4. **Maintain Performance**: Ensure no regressions in Lighthouse Performance (maintain 90+ score)
5. **Ensure Accessibility**: Achieve WCAG 2.1 AA compliance (Lighthouse Accessibility 95+)
6. **Enhance Demo Mode Conversion**: Update demo mode UI elements to encourage signup at key milestones

---

## 3. User Stories

### US-1: First-Time Visitor
**As a** first-time visitor,
**I want to** see a warm, inviting brand that communicates mindfulness and sustainability,
**So that** I feel confident this app will support my long-term habit building journey.

### US-2: Demo Mode User
**As a** demo mode user,
**I want to** experience a beautiful, polished interface that encourages me to sign up,
**So that** I'm motivated to commit to creating an account.

### US-3: Daily Habit Logger
**As a** daily habit tracker,
**I want** interactive elements (toggles, buttons, inputs) to feel responsive and satisfying,
**So that** logging my habits feels rewarding rather than tedious.

### US-4: Mobile User
**As a** mobile user,
**I want** touch targets to be large (44x44px minimum) and visually clear,
**So that** I can easily interact with the app on my phone.

### US-5: Accessibility User
**As a** keyboard/screen reader user,
**I want** all interactive elements to be keyboard-navigable with clear focus states,
**So that** I can use the app without a mouse.

---

## 4. Functional Requirements

### 4.1 Branding Assets (Phase 0)

**FR-1**: Create an organic flowing sunrise SVG icon as the Amara.day logo
- **FR-1.1**: Icon must be a semi-circle sun rising from horizon with 3-5 organic (non-geometric) rays
- **FR-1.2**: Use warm gradient: Terracotta (#D4745E) to Sunset Orange (#E89C5A)
- **FR-1.3**: Icon must scale cleanly from 16px (favicon) to 512px (PWA icon)
- **FR-1.4**: Implement as React component `AmaraDayIcon.tsx` with `size` prop
- **FR-1.5**: Support `variant` prop: `"full-color"`, `"dark-mode"`, `"monochrome"`

**FR-2**: Create Amara.day wordmark component
- **FR-2.1**: Display "Amara" in DM Sans Bold + ".day" in DM Sans Medium
- **FR-2.2**: Apply terracotta color (#D4745E) to "Amara", warm gray (#7A7166) to ".day" in light mode
- **FR-2.3**: Implement as React component `AmaraDayLogo.tsx` with sunrise icon + wordmark
- **FR-2.4**: Support horizontal and vertical layout variants

**FR-3**: Generate favicon assets
- **FR-3.1**: Export `favicon.ico` (32x32px)
- **FR-3.2**: Export `favicon.svg` (scalable vector)
- **FR-3.3**: Export `apple-touch-icon.png` (180x180px)

**FR-4**: Generate PWA icons
- **FR-4.1**: Export `icon-192.png` (192x192px for PWA manifest)
- **FR-4.2**: Export `icon-512.png` (512x512px for PWA manifest)
- **FR-4.3**: Export `og-image.png` (1200x630px for social sharing)

**FR-5**: Update `index.html` meta tags
- **FR-5.1**: Set `<title>` to "Amara.day - Mindful habits. Lasting change."
- **FR-5.2**: Add meta description: "Track your daily habits with warmth and intention. Amara.day helps you build sustainable routines that last."
- **FR-5.3**: Set `theme-color` meta tag to #D4745E (terracotta primary color)
- **FR-5.4**: Add Open Graph tags: `og:title`, `og:description`, `og:image` (og-image.png), `og:url`
- **FR-5.5**: Add Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

**FR-6**: Update `public/manifest.json`
- **FR-6.1**: Set `name` to "Amara.day"
- **FR-6.2**: Set `short_name` to "Amara"
- **FR-6.3**: Update `description` to "Mindful habits. Lasting change."
- **FR-6.4**: Set `theme_color` to "#D4745E"
- **FR-6.5**: Set `background_color` to "#FAF8F5" (warm white)
- **FR-6.6**: Reference new icon files (icon-192.png, icon-512.png)

### 4.2 Design System Foundation (Phase 1)

**FR-7**: Create `src/styles/colors.css` with CSS custom properties
- **FR-7.1**: Define light mode primary colors: `--color-primary` (#D4745E), `--color-primary-hover` (#B86F50), `--color-primary-light` (#E89676), `--color-primary-dark` (#A85D47)
- **FR-7.2**: Define light mode success/accent colors: `--color-success` (#8B9A7E), `--color-sunset` (#E89C5A), `--color-clay` (#B86F50), `--color-dusty-rose` (#C89F94), `--color-olive` (#9CAA7C)
- **FR-7.3**: Define light mode backgrounds: `--color-background` (#FAF8F5), `--color-surface` (#F5F1EB), `--color-surface-hover` (#EBE5DC)
- **FR-7.4**: Define light mode borders: `--color-border` (#D4CFC5), `--color-border-light` (#E8E3D9)
- **FR-7.5**: Define light mode text: `--color-text-primary` (#3A3631), `--color-text-secondary` (#7A7166), `--color-text-tertiary` (#9D9389)
- **FR-7.6**: Define light mode error/warning: `--color-error` (#C85A4F), `--color-warning` (#D4915A)
- **FR-7.7**: Define dark mode palette under `[data-theme="dark"]` selector (implementation in PRD #2, structure only in PRD #1)

**FR-8**: Verify WCAG AA contrast compliance
- **FR-8.1**: Ensure primary text (#3A3631) on background (#FAF8F5) meets 4.5:1 contrast ratio
- **FR-8.2**: Ensure secondary text (#7A7166) on background meets 4.5:1 for large text (18px+)
- **FR-8.3**: Ensure white text on primary button (#D4745E) meets 4.5:1 contrast ratio
- **FR-8.4**: Document any color combinations that fail WCAG AA and provide alternatives

**FR-9**: Update `src/styles/main.css` with typography system
- **FR-9.1**: Import Google Fonts: DM Sans (400, 500, 700), Inter (400, 500, 600)
- **FR-9.2**: Self-host fonts by downloading woff2 files to `public/fonts/` directory
- **FR-9.3**: Define font family variables: `--font-display` (DM Sans), `--font-body` (Inter), `--font-mono` (JetBrains Mono)
- **FR-9.4**: Define fluid type scale using `clamp()`: `--text-xs` (12-14px), `--text-sm` (14-16px), `--text-base` (16-18px), `--text-lg` (18-22px), `--text-xl` (20-28px), `--text-2xl` (24-36px), `--text-3xl` (32-56px), `--text-4xl` (40-72px)
- **FR-9.5**: Define line heights: `--leading-tight` (1.2), `--leading-snug` (1.375), `--leading-normal` (1.6), `--leading-relaxed` (1.8)
- **FR-9.6**: Define letter spacing: `--tracking-tight` (-0.03em), `--tracking-normal` (-0.01em), `--tracking-wide` (0.02em)
- **FR-9.7**: Apply `--font-display` to `h1, h2, h3, h4, h5, h6` with `--tracking-tight`
- **FR-9.8**: Apply `--font-body` to `body` with `--leading-normal`

**FR-10**: Update `src/styles/main.css` with spacing and layout system
- **FR-10.1**: Define spacing scale: `--space-xs` (8px), `--space-sm` (12px), `--space-md` (20px), `--space-lg` (32px), `--space-xl` (48px), `--space-2xl` (64px), `--space-3xl` (96px)
- **FR-10.2**: Define border radius (organic curves): `--radius-sm` (8px), `--radius-md` (12px), `--radius-lg` (16px), `--radius-xl` (24px), `--radius-full` (9999px)
- **FR-10.3**: Define light mode shadows: `--shadow-sm` (0 2px 8px rgba(58,54,49,0.08)), `--shadow-md` (0 4px 16px rgba(58,54,49,0.12)), `--shadow-lg` (0 8px 32px rgba(58,54,49,0.16)), `--shadow-xl` (0 16px 48px rgba(58,54,49,0.2))
- **FR-10.4**: Define transitions: `--transition-fast` (150ms cubic-bezier(0.4,0,0.2,1)), `--transition-base` (250ms cubic-bezier(0.4,0,0.2,1)), `--transition-slow` (350ms cubic-bezier(0.4,0,0.2,1))

**FR-11**: Add global transition styles for smooth color changes
- **FR-11.1**: Apply `transition: background-color 300ms ease-in-out, border-color 300ms ease-in-out, color 300ms ease-in-out` to all elements
- **FR-11.2**: Respect `prefers-reduced-motion` media query by disabling transitions when user prefers reduced motion

### 4.3 Core Component Redesigns (Phase 2)

**FR-12**: Update `src/components/Navigation.tsx` with Amara.day branding
- **FR-12.1**: Replace "Habit Tracker" text with `<AmaraDayLogo />` component
- **FR-12.2**: Display sunrise icon (32px) + "Amara" wordmark (terracotta) + ".day" (warm gray)
- **FR-12.3**: Apply sticky positioning with `backdrop-filter: blur(10px)` and semi-transparent background
- **FR-12.4**: Ensure navigation links use warm colors for active/hover states
- **FR-12.5**: Maintain existing mobile-first responsive behavior

**FR-13**: Update `src/components/ToggleSwitch.tsx` with warm organic design
- **FR-13.1**: Increase size to 60px × 34px on desktop, 52px × 28px on mobile
- **FR-13.2**: Apply `border-radius: var(--radius-full)` for organic pill shape
- **FR-13.3**: OFF state: warm gray background (`--color-border`, #D4CFC5)
- **FR-13.4**: ON state: sage green gradient (`linear-gradient(135deg, #8B9A7E 0%, #A8B89A 100%)`)
- **FR-13.5**: Thumb: 28px white circle with `box-shadow: var(--shadow-sm)`
- **FR-13.6**: Animation: Spring ease (`cubic-bezier(0.34, 1.56, 0.64, 1)`), 250ms duration
- **FR-13.7**: Press state: Apply `transform: scale(0.95)` on `:active`
- **FR-13.8**: Ensure 44x44px minimum touch target for accessibility
- **FR-13.9**: Maintain keyboard accessibility (Enter/Space to toggle) with visible focus ring

**FR-14**: Create `src/styles/buttons.css` for button redesigns
- **FR-14.1**: Primary button: Terracotta gradient (`linear-gradient(135deg, #D4745E 0%, #B86F50 100%)`), white text, `padding: 0.75rem 2rem`, `border-radius: var(--radius-md)`, `font-weight: 600`, `font-family: var(--font-display)`
- **FR-14.2**: Primary button hover: Lift animation (`transform: translateY(-2px)`), increase shadow (`--shadow-lg`), lighter gradient (`#E89676 → #D4745E`)
- **FR-14.3**: Primary button active: Reset transform, reduce shadow (`--shadow-sm`)
- **FR-14.4**: Secondary button: Transparent background, 2px solid border (`--color-primary`), terracotta text, same padding/radius/font as primary
- **FR-14.5**: Secondary button hover: Fill with primary color, white text
- **FR-14.6**: Ensure buttons meet 44x44px minimum touch target
- **FR-14.7**: Add visible focus ring for keyboard navigation

**FR-15**: Update input and textarea styles in `src/styles/main.css`
- **FR-15.1**: Apply warm surface background (`--color-surface`), 2px border (`--color-border`), `border-radius: var(--radius-md)`
- **FR-15.2**: Padding: `0.875rem 1.25rem`, font-size: `var(--text-base)`
- **FR-15.3**: Focus state: Border color `--color-primary`, box-shadow `0 0 0 4px rgba(212, 116, 94, 0.15)`, background `--color-background`
- **FR-15.4**: Implement floating label pattern with CSS (label floats above input on focus or when filled)
- **FR-15.5**: Transition: `all var(--transition-base)`

**FR-16**: Update card styles in `src/styles/main.css`
- **FR-16.1**: Apply warm surface background (`--color-surface`), `border-radius: var(--radius-lg)`, `padding: var(--space-lg)`
- **FR-16.2**: Add soft shadow (`--shadow-sm`) and light border (`1px solid var(--color-border-light)`)
- **FR-16.3**: Hover state (for interactive cards): Lift (`translateY(-4px)`), increase shadow (`--shadow-md`), background becomes `--color-background`
- **FR-16.4**: Active state: Reduce lift (`translateY(-2px)`), reduce shadow (`--shadow-sm`)
- **FR-16.5**: Transition: `all var(--transition-base)`

**FR-17**: Update `src/components/DemoBanner.tsx` with warm styling
- **FR-17.1**: Apply warm background with subtle gradient (e.g., `--color-surface` to `--color-surface-hover`)
- **FR-17.2**: Style "Sign Up" button with primary button styles (FR-14.1)
- **FR-17.3**: Ensure banner is visually distinct but not intrusive
- **FR-17.4**: Add smooth entrance animation (slide down from top)

**FR-18**: Create conversion modal/prompt component for demo mode
- **FR-18.1**: Create `src/components/ConversionModal.tsx` component
- **FR-18.2**: Display warm, inviting copy at key milestones: "Love Amara.day? Sign up to save your progress!"
- **FR-18.3**: Show milestone-specific messages: First habit ("Great start!"), 3 habits ("You're building momentum!"), First log ("Keep the streak going!"), Progress visit ("See your patterns grow!")
- **FR-18.4**: Include primary CTA button ("Create Free Account") and secondary dismiss ("Maybe later")
- **FR-18.5**: Apply warm surface background, rounded corners, soft shadow
- **FR-18.6**: Integrate with existing `demoMode.shouldShowConversion()` logic

---

## 5. Non-Goals (Out of Scope)

**NG-1**: Dark mode implementation (deferred to PRD #2)

**NG-2**: Page-specific redesigns (Welcome, Daily Log, Progress, Manage Habits) - deferred to PRD #2

**NG-3**: Advanced animations (confetti, streak flames) - deferred to PRD #2, Phase 4

**NG-4**: Complex illustrations for empty states - will commission professional assets, use placeholders in PRD #1

**NG-5**: Custom animation libraries (Framer Motion, React Spring) - using pure CSS only

**NG-6**: Visual regression testing setup - deferred to PRD #2

**NG-7**: Real-time analytics tracking integration - focus on establishing baseline metrics first

**NG-8**: Multi-language support or internationalization

---

## 6. Technical Considerations

### 6.1 Technology Stack

- **React 18.2** with TypeScript 5.2.2
- **Vite 5.0.8** for build tooling
- **CSS Custom Properties** for design tokens (no CSS-in-JS libraries)
- **Self-hosted fonts** (woff2 format) for performance and offline capability
- **Pure CSS animations** (no external animation libraries)

### 6.2 Font Self-Hosting Strategy

1. Download woff2 files for DM Sans (400, 500, 700) and Inter (400, 500, 600) from Google Fonts
2. Store in `public/fonts/` directory
3. Define `@font-face` rules in `src/styles/main.css`
4. Use `font-display: swap` for progressive enhancement
5. Preload critical font weights in `index.html` with `<link rel="preload">`

### 6.3 Component Architecture

- Maintain existing component structure (no major refactoring)
- Update styling via CSS modules or inline styles
- Ensure all components accept `className` prop for extensibility
- Logo components (`AmaraDayIcon`, `AmaraDayLogo`) should be stateless functional components

### 6.4 Performance Considerations

- Self-hosted fonts reduce external DNS lookup and CDN dependency
- CSS custom properties have negligible performance impact
- Pure CSS animations are GPU-accelerated (better than JS animations)
- SVG icons are scalable and lightweight (use `<symbol>` for reuse if needed)

### 6.5 Accessibility Architecture

- Maintain existing keyboard navigation support
- Ensure all interactive elements have `:focus-visible` styles
- Use `aria-label` for icon-only buttons (e.g., dark mode toggle in PRD #2)
- Maintain semantic HTML structure
- Test with keyboard navigation and automated tools (axe-core)

---

## 7. Performance Requirements

**PR-1**: Lighthouse Performance score must remain 90+ (no regressions from current baseline)

**PR-2**: First Contentful Paint (FCP) must be < 1.5 seconds on 4G network

**PR-3**: Font loading must not block initial render (use `font-display: swap`)

**PR-4**: Total CSS bundle size increase must be < 10KB gzipped

**PR-5**: SVG icon sizes must be optimized (remove unnecessary paths, use SVGO)

**PR-6**: No layout shifts (CLS) during font loading or image rendering

---

## 8. Security & Compliance

**SC-1**: No new security risks introduced (branding changes are UI-only)

**SC-2**: Self-hosted fonts eliminate third-party tracking concerns (GDPR-friendly)

**SC-3**: Ensure no sensitive data in meta tags or social sharing images

**SC-4**: Maintain existing Content Security Policy (CSP) compliance

---

## 9. Data Requirements

**DR-1**: No new database schema changes required

**DR-2**: Demo mode conversion tracking uses existing `localStorage` metrics (no changes)

**DR-3**: Theme preference storage (for PRD #2 dark mode) will use system preference only (no user data storage per FR-6 decision)

---

## 10. Design Considerations

### 10.1 Design Philosophy

- **Warm Minimalism**: Combine earthy colors with clean, uncluttered layouts
- **Organic Shapes**: Rounded corners (16px+), flowing curves in logo
- **Generous Spacing**: Increased padding/margins for breathing room (20px base instead of 16px)
- **Soft Shadows**: Warm-toned shadows (rgba based on primary text color)

### 10.2 Color Psychology

- **Terracotta (#D4745E)**: Warmth, comfort, grounded energy
- **Sage Green (#8B9A7E)**: Calm, growth, natural balance
- **Warm Neutrals**: Inviting backgrounds without harsh white (#FFFFFF)

### 10.3 Typography Rationale

- **DM Sans**: Soft geometric sans-serif with warmth (vs. cold Helvetica/Arial)
- **Inter**: Excellent readability for body text, humanist proportions
- **Fluid Type Scale**: Responsive text sizes adapt to viewport width

### 10.4 Mockups and References

- No external mockups provided
- Reference plan document (`amara-day-redesign-plan.md`) for detailed specifications
- Use CSS examples in plan as implementation guide

### 10.5 Accessibility Design

- Minimum 44x44px touch targets (mobile-friendly)
- WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Visible focus indicators (2px outline with offset)
- Clear hover states distinct from active states

---

## 11. User Experience Flow

### 11.1 First-Time Visitor Flow

1. User lands on Welcome page (not redesigned in PRD #1, only Navigation updated)
2. Sees new Amara.day branding in navigation (sunrise icon + wordmark)
3. Notices warm color palette and inviting typography
4. Clicks "Try Without Signing Up" (existing button, now styled per FR-14)
5. Enters Daily Log page with redesigned toggle switches and warm cards

### 11.2 Demo Mode Conversion Flow

1. Demo user adds first habit
2. `ConversionModal` appears with warm styling: "Great start! Sign up to save your progress."
3. User can dismiss ("Maybe later") or sign up ("Create Free Account")
4. If dismissed, modal reappears at next milestone (3 habits, first log, progress visit)
5. Persistent `DemoBanner` remains at top with "Sign Up" button

### 11.3 Component Interaction Flow

1. User hovers over button → Lift animation (translateY -2px), shadow increases
2. User clicks button → Press animation (translateY 0), shadow reduces
3. User focuses input → Border turns terracotta, soft glow appears
4. User toggles habit switch → Smooth slide with spring ease, color transitions from gray to sage green

---

## 12. Error Handling

### 12.1 Font Loading Errors

**EH-1**: If self-hosted fonts fail to load, gracefully fallback to system fonts (`-apple-system, BlinkMacSystemFont, sans-serif`)

**EH-2**: Use `font-display: swap` to prevent invisible text during font loading

### 12.2 Icon Loading Errors

**EH-3**: If SVG icon fails to render, display text fallback ("Amara.day")

**EH-4**: Ensure favicon.ico fallback exists for browsers that don't support SVG favicons

### 12.3 CSS Custom Properties Fallback

**EH-5**: Provide fallback values for CSS variables for very old browsers:
```css
color: #D4745E; /* fallback */
color: var(--color-primary); /* modern browsers */
```

---

## 13. Success Metrics

### 13.1 Performance Metrics

**SM-1**: Lighthouse Performance: Maintain 90+ score (baseline: current score)

**SM-2**: Lighthouse Accessibility: Achieve 95+ score (baseline: current score)

**SM-3**: First Contentful Paint: < 1.5 seconds on 4G (baseline: current FCP)

**SM-4**: CSS bundle size increase: < 10KB gzipped

### 13.2 Accessibility Metrics

**SM-5**: axe-core violations: 0 (automated scan)

**SM-6**: Keyboard navigation: 100% of interactive elements focusable and operable

**SM-7**: Focus indicators: Visible on all interactive elements (manual inspection)

### 13.3 Conversion Metrics (Demo Mode)

**SM-8**: Demo → Signup conversion rate: Track baseline before PRD #1, measure improvement after ConversionModal implementation

**SM-9**: Conversion prompt dismissal rate: Track how often users dismiss vs. convert

### 13.4 Aesthetic Validation

**SM-10**: Subjective assessment: "Does this feel like Amara.day?" - Gather feedback from stakeholders after PRD #1 completion

---

## 14. Acceptance Criteria

### 14.1 Branding (Phase 0)

**AC-1**: Sunrise logo SVG renders cleanly at 16px, 32px, 80px, 192px, 512px

**AC-2**: Amara.day wordmark displays correctly in Navigation on all screen sizes (320px+)

**AC-3**: Favicon appears in browser tab with sunrise icon

**AC-4**: PWA install prompt shows Amara.day name and icon

**AC-5**: Social sharing (Open Graph) shows og-image.png when link is shared

### 14.2 Design System (Phase 1)

**AC-6**: All color variables defined in `colors.css` and applied globally

**AC-7**: WCAG AA contrast verified for all text/background combinations

**AC-8**: Typography system uses DM Sans for headings, Inter for body text

**AC-9**: Fluid type scale adjusts smoothly from 320px to 1920px viewports

**AC-10**: Spacing scale applied consistently across all redesigned components

**AC-11**: `prefers-reduced-motion` disables transitions for users who prefer reduced motion

### 14.3 Core Components (Phase 2)

**AC-12**: Navigation displays Amara.day logo with sticky positioning and backdrop blur

**AC-13**: ToggleSwitch has 60x34px size, smooth spring animation, warm colors (OFF: gray, ON: sage green)

**AC-14**: Primary buttons have terracotta gradient, lift on hover, press on active

**AC-15**: Input fields have floating labels, warm backgrounds, terracotta focus ring

**AC-16**: Cards have soft shadows, lift on hover (if interactive)

**AC-17**: DemoBanner displays with warm styling at top of protected routes for demo users

**AC-18**: ConversionModal appears at correct milestones (first habit, 3 habits, first log, progress visit) with warm design

### 14.4 Accessibility (All Phases)

**AC-19**: All interactive elements have 44x44px minimum touch target

**AC-20**: Keyboard navigation works: Tab to focus, Enter/Space to activate

**AC-21**: Focus indicators visible on all focusable elements (2px outline)

**AC-22**: axe-core reports 0 violations

**AC-23**: Manual keyboard testing passes (can complete all core tasks without mouse)

### 14.5 Performance (All Phases)

**AC-24**: Lighthouse Performance score ≥ 90

**AC-25**: Lighthouse Accessibility score ≥ 95

**AC-26**: First Contentful Paint < 1.5 seconds on 4G throttling

**AC-27**: CSS bundle size increase < 10KB gzipped

### 14.6 Cross-Browser Compatibility

**AC-28**: Design renders correctly in Chrome (latest), Safari (macOS + iOS), Firefox (latest)

**AC-29**: Self-hosted fonts load correctly in all tested browsers

**AC-30**: CSS animations work smoothly in all tested browsers

### 14.7 Validation Checkpoint

**AC-31**: After PRD #1 completion, stakeholder review confirms: "This feels like Amara.day"

**AC-32**: Color palette, typography, and spacing feel warm and inviting (subjective assessment)

---

## 15. Open Questions

**OQ-1**: Should we add a subtle texture or gradient to the warm background colors, or keep them solid?

**OQ-2**: For the sunrise logo, should rays be evenly spaced or organically varied?

**OQ-3**: Should the ConversionModal include a preview of features available after signup, or just a simple message?

**OQ-4**: If font loading fails (rare), should we show a temporary loading state or immediately show fallback fonts?

**OQ-5**: Should hover states on cards be enabled on touch devices (mobile), or only desktop?

**OQ-6**: For the floating label pattern, should labels always float, or only on focus/filled state?

**OQ-7**: Should we add a subtle entrance animation when Navigation first loads, or keep it static?

**OQ-8**: What is the preferred professional illustration service for empty states in PRD #2? (To budget accordingly)

---

## 16. Implementation Notes for Developers

### 16.1 Getting Started

1. **Review Design Plan**: Read `plans for later/amara-day-redesign-plan.md` sections on Phases 0-2
2. **Set Up Fonts**: Download DM Sans and Inter woff2 files, place in `public/fonts/`
3. **Start with Phase 0**: Create logo components first, test at multiple sizes
4. **Build Design System**: Define all CSS custom properties before touching components
5. **Update Components One-by-One**: Test each component individually before moving to next

### 16.2 Testing Strategy

- **Unit Tests**: Update component tests for new styles (snapshot tests may need updates)
- **Visual Inspection**: Manually review each component at 320px, 375px, 768px, 1440px viewports
- **Keyboard Testing**: Tab through all interactive elements, ensure focus is visible
- **Accessibility Scan**: Run `axe-core` or Lighthouse Accessibility audit
- **Performance Check**: Run Lighthouse Performance before and after to catch regressions

### 16.3 Common Pitfalls to Avoid

- **Don't hardcode colors**: Always use CSS custom properties (`var(--color-primary)`)
- **Don't skip fallbacks**: Provide font-family fallbacks and CSS variable fallbacks
- **Don't override touch targets**: Ensure all buttons/toggles meet 44x44px minimum
- **Don't forget reduced motion**: Wrap animations in `@media (prefers-reduced-motion: no-preference)`
- **Don't skip contrast checks**: Verify WCAG AA before committing color changes

### 16.4 File Organization

```
src/
├── components/
│   ├── branding/
│   │   ├── AmaraDayIcon.tsx (new)
│   │   ├── AmaraDayLogo.tsx (new)
│   ├── ConversionModal.tsx (new)
│   ├── DemoBanner.tsx (update)
│   ├── Navigation.tsx (update)
│   ├── ToggleSwitch.tsx (update)
├── styles/
│   ├── colors.css (new)
│   ├── buttons.css (new)
│   ├── main.css (update)
public/
├── fonts/
│   ├── dm-sans-v13-latin-regular.woff2 (new)
│   ├── dm-sans-v13-latin-500.woff2 (new)
│   ├── dm-sans-v13-latin-700.woff2 (new)
│   ├── inter-v13-latin-regular.woff2 (new)
│   ├── inter-v13-latin-500.woff2 (new)
│   ├── inter-v13-latin-600.woff2 (new)
├── favicon.ico (update)
├── favicon.svg (new)
├── apple-touch-icon.png (new)
├── icon-192.png (update)
├── icon-512.png (update)
├── og-image.png (new)
├── manifest.json (update)
├── index.html (update)
```

---

## 17. Dependencies

- No new npm packages required (pure CSS approach)
- Existing dependencies remain unchanged
- Font files downloaded externally (Google Fonts woff2 files)

---

## 18. Risks and Mitigations

### Risk 1: Font Loading Performance
**Mitigation**: Use `font-display: swap`, preload critical fonts, subset fonts to reduce file size

### Risk 2: Accessibility Regressions
**Mitigation**: Run automated tests (axe-core) + manual keyboard testing before merging

### Risk 3: Browser Compatibility (CSS Variables)
**Mitigation**: Test in target browsers (Chrome, Safari, Firefox), provide fallbacks for CSS variables

### Risk 4: Increased CSS Bundle Size
**Mitigation**: Monitor bundle size, use CSS purging in production build, avoid duplicate styles

### Risk 5: Subjective Design Approval
**Mitigation**: Use AC-31 validation checkpoint - gather stakeholder feedback before PRD #2

---

## 19. Timeline and Effort Estimate

**Total Estimated Effort**: 7-10 hours

### Phase 0: Branding Foundation (2-3 hours)
- Create sunrise logo SVG: 1 hour
- Generate favicon/PWA icons: 0.5 hours
- Update meta tags and manifest: 0.5 hours
- Create logo React components: 1 hour

### Phase 1: Design System Foundation (2-3 hours)
- Define color palette CSS variables: 0.5 hours
- WCAG contrast verification: 0.5 hours
- Set up self-hosted fonts: 1 hour
- Define typography, spacing, shadows: 1 hour

### Phase 2: Core Component Redesigns (3-4 hours)
- Update Navigation: 0.5 hours
- Redesign ToggleSwitch: 1 hour
- Create button styles: 0.5 hours
- Update input/textarea styles: 0.5 hours
- Update card styles: 0.5 hours
- Create ConversionModal: 1 hour
- Update DemoBanner: 0.5 hours

### Testing and Polish (1-2 hours)
- Accessibility testing: 0.5 hours
- Performance testing: 0.5 hours
- Cross-browser testing: 0.5 hours
- Bug fixes and refinements: 0.5 hours

---

## 20. Next Steps After PRD #1 Completion

1. **Validation Checkpoint**: Review with stakeholders - "Does this feel like Amara.day?"
2. **Gather Feedback**: Collect feedback on color palette, typography, spacing
3. **Adjust if Needed**: Make minor refinements to design system based on feedback
4. **Proceed to PRD #2**: Apply foundation to all pages, add polish, implement dark mode

---

**Document Status**: Ready for Implementation
**Approval Required**: Stakeholder sign-off on aesthetic after Phase 2 completion
**Related Documents**:
- `plans for later/amara-day-redesign-plan.md` (design specification)
- `tasks/0003-prd-amara-day-pages-polish.md` (PRD #2 - to be implemented after this)
