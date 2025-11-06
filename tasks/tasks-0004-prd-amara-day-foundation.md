# Task List: Amara.day Foundation & Core Components

Based on PRD: `0004-prd-amara-day-foundation.md`

**Status:** Ready for Implementation
**Estimated Effort:** 7-10 hours
**Timeline:** Week 1-2

---

## Relevant Files

### Source Code - Branding Components

- `src/components/branding/AmaraDayLogo.tsx` - **NEW** - Text-based logo component
- `src/components/branding/index.ts` - **NEW** - Barrel export for branding
- `src/components/Icon.tsx` - **NEW** - Lucide Icons wrapper component

### Source Code - Design System

- `src/styles/colors.css` - **NEW** - Color palette CSS custom properties
- `src/styles/buttons.css` - **NEW** - Button component styles (primary, secondary)
- `src/styles/main.css` - **UPDATE** - Typography, spacing, shadows, global transitions

### Source Code - Core Components

- `src/components/Navigation.tsx` - **UPDATE** - Add Amara.day branding, warm styling
- `src/components/Navigation.test.tsx` - **UPDATE** - Update tests for new branding
- `src/components/ToggleSwitch.tsx` - **UPDATE** - Organic warm design, larger size, animations
- `src/components/ToggleSwitch.test.tsx` - **UPDATE** - Update tests for new styles
- `src/components/DemoBanner.tsx` - **UPDATE** - Warm styling with gradient background
- `src/components/ConversionModal.tsx` - **UPDATE** - Warm, inviting design with milestone-specific copy
- `src/components/ConversionModal.test.tsx` - **NEW** - Tests for updated conversion modal

### Source Code - Page Styles

- `src/pages/WelcomePage.css` - **UPDATE** - Import button styles, apply warm colors
- `src/pages/DailyLogPage.css` - **UPDATE** - Apply card styles, warm colors
- `src/pages/ProgressPage.css` - **UPDATE** - Apply card styles, warm colors
- `src/pages/ManageHabitsPage.css` - **NEW** - Card and button styles

### Public Assets

- `public/favicon.ico` - **UPDATE** - Amara.day sunrise icon (32x32px)
- `public/favicon.svg` - **NEW** - Scalable vector favicon
- `public/apple-touch-icon.png` - **UPDATE** - iOS home screen icon (180x180px)
- `public/icon-192.png` - **UPDATE** - PWA icon (192x192px)
- `public/icon-512.png` - **UPDATE** - PWA icon (512x512px)
- `public/og-image.png` - **NEW** - Social sharing image (1200x630px)
- `public/manifest.json` - **UPDATE** - App name, description, theme colors, icons
- `public/fonts/dm-sans-v13-latin-regular.woff2` - **NEW** - Self-hosted DM Sans Regular
- `public/fonts/dm-sans-v13-latin-500.woff2` - **NEW** - Self-hosted DM Sans Medium
- `public/fonts/dm-sans-v13-latin-700.woff2` - **NEW** - Self-hosted DM Sans Bold
- `public/fonts/inter-v13-latin-regular.woff2` - **NEW** - Self-hosted Inter Regular
- `public/fonts/inter-v13-latin-500.woff2` - **NEW** - Self-hosted Inter Medium
- `public/fonts/inter-v13-latin-600.woff2` - **NEW** - Self-hosted Inter Semi-Bold

### Root Files

- `index.html` - **UPDATE** - Title, meta tags, Open Graph tags, Twitter Card tags, font preload

### Testing

- `src/components/branding/AmaraDayIcon.test.tsx` - **NEW** - Tests for icon component (size, variants)
- `src/components/branding/AmaraDayLogo.test.tsx` - **NEW** - Tests for logo component (layouts, variants)
- `e2e/redesign-foundation.spec.ts` - **NEW** - E2E tests for branding and core component redesigns

### Configuration

- `.github/workflows/ci.yml` - **UPDATE** - Ensure visual regression doesn't block (deferred to PRD #2)

### Documentation

- `CHANGELOG.md` - **UPDATE** - Document Amara.day rebrand and design system changes

### Notes

- All new CSS files should be imported in `src/styles/main.css`
- Self-hosted fonts go in `public/fonts/` directory
- Use `@font-face` declarations in `main.css` with `font-display: swap`
- Preload critical fonts in `index.html` for performance
- All existing component tests should pass after styling updates
- Use CSS custom properties exclusively (no hardcoded colors)

---

## Tasks

- [ ] **1.0 Phase 0: Branding Assets** (1-1.5 hours)
  - [ ] 1.1 Create `src/components/branding/AmaraDayLogo.tsx` component (text-based)
    - Create text-based logo (no custom SVG icon)
    - Render "Amara" in `font-family: 'DM Sans'`, `font-weight: 700`, `color: #D4745E` (terracotta)
    - Render ".day" in `font-family: 'DM Sans'`, `font-weight: 500`, `color: #7A7166` (warm gray)
    - Add `size` prop (number, default 32) to scale font size dynamically
    - Add `variant` prop: `"full-color"` (default), `"monochrome"` (uses currentColor)
    - Add `layout` prop: `"horizontal"` (default), `"vertical"` (stacked)
    - Optional: Add CSS `text-shadow` or `background-clip: text` gradient for depth
    - Add `className` prop for wrapper div
    - **Note**: Welcome Page uses uppercase "AMARA DAY" text directly (not this logo component). Welcome Page also includes TreeOfLife watercolor illustration (page-specific, not part of core design system). See PRD #0005 FR-1 for full Welcome Page specification.
  - [ ] 1.2 Install Lucide Icons library
    - Run: `npm install lucide-react`
    - Verify installation in `package.json`
  - [ ] 1.3 Create `src/components/Icon.tsx` wrapper component
    - Import icons from `lucide-react`: `import { Sunrise, TrendingUp, Calendar, CheckCircle, AlertCircle, Info } from 'lucide-react'`
    - Accept `name` prop (string) to select icon dynamically
    - Accept `size` prop (number, default 24) for consistent sizing
    - Accept `color` prop (string, default 'currentColor')
    - Accept `className` prop for additional styling
    - Map icon names to Lucide components
  - [ ] 1.4 Create barrel export `src/components/branding/index.ts`
    - Export `AmaraDayLogo` only (no AmaraDayIcon)
  - [ ] 1.5 Download self-hosted fonts
    - Visit Google Fonts: https://fonts.google.com/
    - Download DM Sans: weights 400, 500, 700 (woff2 format)
    - Download Inter: weights 400, 500, 600 (woff2 format)
    - Place files in `public/fonts/` directory
    - Use naming convention: `{font-name}-v{version}-latin-{weight}.woff2`
  - [ ] 1.6 Generate simple favicon assets (using online tool)
    - Visit favicon.io or RealFaviconGenerator.net
    - Create simple favicon: Letter "A" in terracotta (#D4745E) on transparent background
    - Generate and download: `favicon.ico` (32x32px), `favicon.svg`, `apple-touch-icon.png` (180x180px)
    - For PWA icons: Terracotta background (#D4745E) with white "A" letter
    - Generate: `icon-192.png` (192x192px), `icon-512.png` (512x512px)
    - Download and place all files in `public/` directory
  - [ ] 1.7 Create social sharing image `og-image.png`
    - Use online tool (Canva, Figma, or similar) to create 1200x630px image
    - Warm gradient background (#FAF8F5 to #F5F1EB)
    - Center "Amara.day" text in DM Sans Bold (terracotta color)
    - Add tagline: "Mindful habits. Lasting change." below in smaller text
    - Export as optimized PNG (< 300KB) and place in `public/`
  - [ ] 1.8 Update `index.html` meta tags
    - Change `<title>` to "Amara.day - Mindful habits. Lasting change."
    - Add `<meta name="description" content="Track your daily habits with warmth and intention. Amara.day helps you build sustainable routines that last." />`
    - Add `<meta name="theme-color" content="#D4745E" />`
    - Add Open Graph tags:
      - `<meta property="og:title" content="Amara.day - Mindful habits. Lasting change." />`
      - `<meta property="og:description" content="Track your daily habits with warmth and intention." />`
      - `<meta property="og:image" content="/og-image.png" />`
      - `<meta property="og:url" content="https://amara.day" />` (or actual domain)
      - `<meta property="og:type" content="website" />`
    - Add Twitter Card tags:
      - `<meta name="twitter:card" content="summary_large_image" />`
      - `<meta name="twitter:title" content="Amara.day - Mindful habits. Lasting change." />`
      - `<meta name="twitter:description" content="Track your daily habits with warmth and intention." />`
      - `<meta name="twitter:image" content="/og-image.png" />`
    - Add font preload links for critical fonts (before CSS):
      - `<link rel="preload" href="/fonts/dm-sans-v13-latin-700.woff2" as="font" type="font/woff2" crossorigin />`
      - `<link rel="preload" href="/fonts/inter-v13-latin-regular.woff2" as="font" type="font/woff2" crossorigin />`
  - [ ] 1.8 Update `public/manifest.json`
    - Set `"name": "Amara.day"`
    - Set `"short_name": "Amara"`
    - Set `"description": "Mindful habits. Lasting change."`
    - Set `"theme_color": "#D4745E"`
    - Set `"background_color": "#FAF8F5"`
    - Update `"icons"` array:
      - `{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }`
      - `{ "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }`

- [ ] **2.0 Phase 1: Design System Foundation** (2-3 hours)
  - [ ] 2.1 Create `src/styles/colors.css` with light mode palette
    - Define CSS custom properties under `:root` selector:
      - Primary colors: `--color-primary: #D4745E;`, `--color-primary-hover: #B86F50;`, `--color-primary-light: #E89676;`, `--color-primary-dark: #A85D47;`
      - Success/accent: `--color-success: #8B9A7E;`, `--color-success-hover: #748264;`, `--color-success-light: #A8B89A;`, `--color-sunset: #E89C5A;`, `--color-clay: #B86F50;`, `--color-dusty-rose: #C89F94;`, `--color-olive: #9CAA7C;`
      - Backgrounds: `--color-background: #FAF8F5;`, `--color-surface: #F5F1EB;`, `--color-surface-hover: #EBE5DC;`
      - Borders: `--color-border: #D4CFC5;`, `--color-border-light: #E8E3D9;`
      - Text: `--color-text-primary: #3A3631;`, `--color-text-secondary: #7A7166;`, `--color-text-tertiary: #9D9389;`
      - Error/warning: `--color-error: #C85A4F;`, `--color-warning: #D4915A;`
  - [ ] 2.2 Verify WCAG AA contrast compliance
    - Test primary text (#3A3631) on background (#FAF8F5) using contrast checker (target: 4.5:1)
    - Test secondary text (#7A7166) on background (target: 4.5:1 for normal, 3:1 for large text 18px+)
    - Test white (#FFFFFF) on primary button (#D4745E) (target: 4.5:1)
    - Document results in comment at top of `colors.css`
    - If any fail, adjust colors and re-test
  - [ ] 2.4 Update `src/styles/main.css` with @font-face declarations
    - Add `@font-face` rules for DM Sans (400, 500, 700):
      ```css
      @font-face {
        font-family: 'DM Sans';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/fonts/dm-sans-v13-latin-regular.woff2') format('woff2');
      }
      ```
    - Repeat for DM Sans 500, 700
    - Add `@font-face` rules for Inter (400, 500, 600)
    - Place @font-face rules at top of file, before other styles
  - [ ] 2.5 Define font family variables in `main.css`
    - Add to `:root`:
      - `--font-display: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;`
      - `--font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;`
      - `--font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace;`
  - [ ] 2.6 Define fluid type scale in `main.css`
    - Add to `:root`:
      - `--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);` /* 12-14px */
      - `--text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);` /* 14-16px */
      - `--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);` /* 16-18px */
      - `--text-lg: clamp(1.125rem, 1rem + 0.5vw, 1.375rem);` /* 18-22px */
      - `--text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.75rem);` /* 20-28px */
      - `--text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);` /* 24-36px */
      - `--text-3xl: clamp(2rem, 1.5rem + 2.5vw, 3.5rem);` /* 32-56px */
      - `--text-4xl: clamp(2.5rem, 2rem + 3vw, 4.5rem);` /* 40-72px */
  - [ ] 2.7 Define line heights and letter spacing in `main.css`
    - Add to `:root`:
      - `--leading-tight: 1.2;`, `--leading-snug: 1.375;`, `--leading-normal: 1.6;`, `--leading-relaxed: 1.8;`
      - `--tracking-tight: -0.03em;`, `--tracking-normal: -0.01em;`, `--tracking-wide: 0.02em;`
  - [ ] 2.8 Apply typography system to global elements
    - Update `h1, h2, h3, h4, h5, h6` styles:
      - `font-family: var(--font-display);`
      - `letter-spacing: var(--tracking-tight);`
    - Update `body` styles:
      - `font-family: var(--font-body);`
      - `line-height: var(--leading-normal);`
      - `color: var(--color-text-primary);`
      - `background-color: var(--color-background);`
  - [ ] 2.9 Define spacing scale in `main.css`
    - Add to `:root`:
      - `--space-xs: 0.5rem;` /* 8px */
      - `--space-sm: 0.75rem;` /* 12px */
      - `--space-md: 1.25rem;` /* 20px */
      - `--space-lg: 2rem;` /* 32px */
      - `--space-xl: 3rem;` /* 48px */
      - `--space-2xl: 4rem;` /* 64px */
      - `--space-3xl: 6rem;` /* 96px */
  - [ ] 2.10 Define border radius (organic curves) in `main.css`
    - Add to `:root`:
      - `--radius-sm: 0.5rem;` /* 8px */
      - `--radius-md: 0.75rem;` /* 12px */
      - `--radius-lg: 1rem;` /* 16px */
      - `--radius-xl: 1.5rem;` /* 24px */
      - `--radius-full: 9999px;`
  - [ ] 2.11 Define soft warm shadows in `main.css`
    - Add to `:root`:
      - `--shadow-sm: 0 2px 8px rgba(58, 54, 49, 0.08);`
      - `--shadow-md: 0 4px 16px rgba(58, 54, 49, 0.12);`
      - `--shadow-lg: 0 8px 32px rgba(58, 54, 49, 0.16);`
      - `--shadow-xl: 0 16px 48px rgba(58, 54, 49, 0.2);`
  - [ ] 2.12 Define transition variables in `main.css`
    - Add to `:root`:
      - `--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);`
      - `--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);`
      - `--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);`
  - [ ] 2.13 Add global smooth color transitions
    - Add to `main.css` (after `:root`):
      ```css
      * {
        transition: background-color 300ms ease-in-out,
                    border-color 300ms ease-in-out,
                    color 300ms ease-in-out;
      }
      ```
  - [ ] 2.14 Add `prefers-reduced-motion` support
    - Add media query to disable transitions for users who prefer reduced motion:
      ```css
      @media (prefers-reduced-motion: reduce) {
        * {
          transition: none !important;
          animation: none !important;
        }
      }
      ```
  - [ ] 2.15 Import `colors.css` in `main.css`
    - Add at top of `main.css`: `@import './colors.css';`

- [ ] **3.0 Phase 2: Core Component Redesigns** (3-4 hours)
  - [ ] 3.1 Update `src/components/Navigation.tsx` with Amara.day branding
    - Import `AmaraDayLogo` from `@/components/branding`
    - Replace "Habit Tracker" text with `<AmaraDayLogo size={32} layout="horizontal" />`
    - Update CSS class for navigation bar:
      - Add `backdrop-filter: blur(10px);` for glassmorphism
      - Set `background-color: rgba(250, 248, 245, 0.9);` (semi-transparent warm white)
      - Keep `position: sticky; top: 0; z-index: 100;`
    - Update navigation link styles:
      - Active link: `color: var(--color-primary);` with underline or border-bottom
      - Hover: `color: var(--color-primary-hover);`
    - Ensure mobile-first responsive behavior maintained
  - [ ] 3.2 Update `src/components/Navigation.test.tsx`
    - Update snapshot if logo changed from text to component
    - Test that AmaraDayLogo renders with correct size and layout
    - Verify navigation links still render and have correct hrefs
  - [ ] 3.3 Create `src/styles/buttons.css` for button redesigns
    - Create new file with comment header explaining button system
    - Define `.btn-primary` styles:
      - `background: linear-gradient(135deg, #D4745E 0%, #B86F50 100%);`
      - `color: white;`
      - `padding: 0.75rem 2rem;`
      - `border-radius: var(--radius-md);`
      - `font-weight: 600;`
      - `font-family: var(--font-display);`
      - `box-shadow: var(--shadow-md);`
      - `transition: all var(--transition-base);`
      - `border: none;`
      - `cursor: pointer;`
      - `min-height: 44px;` /* Accessibility: touch target */
    - Define `.btn-primary:hover`:
      - `transform: translateY(-2px);`
      - `box-shadow: var(--shadow-lg);`
      - `background: linear-gradient(135deg, #E89676 0%, #D4745E 100%);`
    - Define `.btn-primary:active`:
      - `transform: translateY(0);`
      - `box-shadow: var(--shadow-sm);`
    - Define `.btn-primary:focus-visible`:
      - `outline: 2px solid var(--color-primary);`
      - `outline-offset: 2px;`
    - Define `.btn-secondary` styles:
      - `background: transparent;`
      - `border: 2px solid var(--color-primary);`
      - `color: var(--color-primary);`
      - `padding: 0.75rem 2rem;`
      - `border-radius: var(--radius-md);`
      - `font-weight: 600;`
      - `font-family: var(--font-display);`
      - `transition: all var(--transition-base);`
      - `cursor: pointer;`
      - `min-height: 44px;`
    - Define `.btn-secondary:hover`:
      - `background: var(--color-primary);`
      - `color: white;`
    - Define `.btn-secondary:focus-visible` (same as primary)
  - [ ] 3.4 Import `buttons.css` in `main.css`
    - Add: `@import './buttons.css';`
  - [ ] 3.5 Update `src/components/ToggleSwitch.tsx` with warm organic design
    - Increase toggle dimensions:
      - Desktop: `width: 60px; height: 34px;`
      - Mobile (< 768px): `width: 52px; height: 28px;`
    - Update container styles:
      - `border-radius: var(--radius-full);` for pill shape
      - OFF state background: `background-color: var(--color-border);` (#D4CFC5 warm gray)
      - ON state background: `background: linear-gradient(135deg, #8B9A7E 0%, #A8B89A 100%);` (sage green gradient)
      - `transition: background var(--transition-base);`
      - Use spring ease: `cubic-bezier(0.34, 1.56, 0.64, 1)`
    - Update thumb (sliding circle) styles:
      - `width: 28px; height: 28px;`
      - `background: white;`
      - `border-radius: var(--radius-full);`
      - `box-shadow: var(--shadow-sm);`
      - `transition: transform var(--transition-base) cubic-bezier(0.34, 1.56, 0.64, 1);`
      - ON state: `transform: translateX(26px);` (60px width - 28px thumb - 6px padding)
    - Add press state (`:active`):
      - `transform: scale(0.95);` on thumb
    - Ensure 44x44px minimum touch target (wrapper element if needed)
    - Maintain keyboard accessibility (Enter/Space to toggle)
    - Add visible focus ring: `outline: 2px solid var(--color-primary); outline-offset: 2px;`
  - [ ] 3.6 Update `src/components/ToggleSwitch.test.tsx`
    - Update snapshot for new styling
    - Test that toggle still responds to clicks and keyboard (Enter/Space)
    - Verify ON/OFF states apply correct classes/styles
  - [ ] 3.7 Update input and textarea styles in `main.css`
    - Define global `input, textarea` styles:
      - `background: var(--color-surface);`
      - `border: 2px solid var(--color-border);`
      - `border-radius: var(--radius-md);`
      - `padding: 0.875rem 1.25rem;`
      - `font-size: var(--text-base);`
      - `font-family: var(--font-body);`
      - `color: var(--color-text-primary);`
      - `transition: all var(--transition-base);`
    - Define `input:focus, textarea:focus` styles:
      - `outline: none;`
      - `border-color: var(--color-primary);`
      - `box-shadow: 0 0 0 4px rgba(212, 116, 94, 0.15);` (soft terracotta glow)
      - `background: var(--color-background);`
    - Add floating label pattern (optional, can defer complex implementation):
      - Use CSS-only approach with `:placeholder-shown` and sibling selector
      - Or note: "Floating labels implemented per-component as needed"
  - [ ] 3.8 Update card styles in `main.css`
    - Define `.card` base class:
      - `background: var(--color-surface);`
      - `border-radius: var(--radius-lg);`
      - `padding: var(--space-lg);`
      - `box-shadow: var(--shadow-sm);`
      - `border: 1px solid var(--color-border-light);`
      - `transition: all var(--transition-base);`
    - Define `.card:hover` (for interactive cards):
      - `transform: translateY(-4px);`
      - `box-shadow: var(--shadow-md);`
      - `background: var(--color-background);`
    - Define `.card--interactive` modifier:
      - `cursor: pointer;`
    - Define `.card--interactive:active`:
      - `transform: translateY(-2px);`
      - `box-shadow: var(--shadow-sm);`
  - [ ] 3.9 Update `src/components/DemoBanner.tsx` with warm styling
    - Update banner background:
      - `background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-hover) 100%);`
      - Or solid: `background: var(--color-surface);`
    - Update "Sign Up" button to use `.btn-primary` class
    - Add smooth entrance animation:
      ```css
      @keyframes slide-down {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      animation: slide-down 300ms ease-out;
      ```
    - Ensure banner is not intrusive (subtle, warm design)
  - [ ] 3.10 Update `src/components/ConversionModal.tsx` with warm styling
    - Update modal container styles:
      - `background: var(--color-surface);`
      - `border-radius: var(--radius-xl);`
      - `box-shadow: var(--shadow-xl);`
      - `padding: var(--space-xl);`
    - Add milestone-specific copy based on `demoMode.shouldShowConversion()` trigger:
      - First habit: "Great start! Sign up to save your progress."
      - 3 habits: "You're building momentum! Create an account to keep going."
      - First log: "Keep the streak going! Sign up to track your journey."
      - Progress visit: "Love seeing your patterns? Sign up to save them forever."
    - Style primary CTA button with `.btn-primary` class
    - Style secondary "Maybe later" button with `.btn-secondary` class or text link
    - Add backdrop overlay:
      - `background: rgba(58, 54, 49, 0.5);` (warm dark semi-transparent)
      - Click backdrop to dismiss
  - [ ] 3.11 Create or update `src/components/ConversionModal.test.tsx`
    - Test that modal renders with correct milestone copy
    - Test "Create Free Account" button triggers signup flow
    - Test "Maybe later" button dismisses modal
    - Test backdrop click dismisses modal
  - [ ] 3.12 Apply warm colors to existing page CSS files
    - Update `src/pages/WelcomePage.css`:
      - Import buttons.css if not globally imported
      - Replace any hardcoded colors with CSS variables
      - Ensure CTA buttons use `.btn-primary` class
    - Update `src/pages/DailyLogPage.css`:
      - Replace card backgrounds with `var(--color-surface)`
      - Update borders to `var(--color-border)`
      - Apply `.card` class or inline equivalent
    - Update `src/pages/ProgressPage.css`:
      - Replace card backgrounds with `var(--color-surface)`
      - Apply warm shadows `var(--shadow-sm)`
    - Create `src/pages/ManageHabitsPage.css` if doesn't exist:
      - Import card and button styles
      - Apply warm colors to habit cards

- [ ] **4.0 Testing & Quality Assurance** (1-2 hours)
  - [ ] 4.1 Create unit tests for branding components
    - Create `src/components/branding/AmaraDayIcon.test.tsx`:
      - Test icon renders with default size (32px)
      - Test custom size prop (e.g., size={64})
      - Test variant prop: full-color, monochrome
      - Test className prop is applied to wrapper
      - Snapshot test for SVG structure
    - Create `src/components/branding/AmaraDayLogo.test.tsx`:
      - Test logo renders with icon + "Amara.day" text
      - Test horizontal layout (default)
      - Test vertical layout
      - Test size prop scales icon and text
      - Snapshot test for both layouts
  - [ ] 4.2 Update existing component tests
    - Run `npm test -- --run` to see which tests fail after styling changes
    - Update snapshots if only CSS/styling changed: `npm test -- -u`
    - Manually verify snapshots show correct new styles
    - Fix any broken functionality tests (should be minimal, mostly styling)
  - [ ] 4.3 Create E2E test for branding and redesign
    - Create `e2e/redesign-foundation.spec.ts`:
      - Test: "Welcome page displays Amara.day branding"
        - Visit `/`
        - Check for AmaraDayLogo in navigation (via alt text or test ID)
        - Verify page title is "Amara.day - Mindful habits. Lasting change."
      - Test: "Navigation shows Amara.day logo on all pages"
        - Visit `/daily-log`, `/progress`, `/manage-habits`
        - Verify logo visible on each page
      - Test: "Toggle switches have warm organic design"
        - Visit `/daily-log`
        - Locate toggle switch
        - Verify toggle has expected size (60x34px or close)
        - Click toggle, verify smooth animation
      - Test: "Buttons use primary gradient styling"
        - Visit `/`
        - Locate "Try Without Signing In" button
        - Verify button has terracotta gradient background (check computed styles)
  - [ ] 4.4 Run Lighthouse Performance audit
    - Open production build in Chrome: `npm run build && npm run preview`
    - Open DevTools → Lighthouse
    - Run audit with "Performance" and "Accessibility" categories
    - Verify Performance score ≥ 90
    - Verify Accessibility score ≥ 95
    - If scores lower, investigate and optimize:
      - Check font loading (should use font-display: swap)
      - Check image sizes (favicon/icons optimized)
      - Check CSS bundle size (should be < 10KB increase)
  - [ ] 4.5 Run axe-core accessibility scan
    - Install axe DevTools extension (Chrome/Firefox)
    - Visit each page: `/`, `/daily-log`, `/progress`, `/manage-habits`
    - Run axe scan, verify 0 violations
    - Common issues to check:
      - Color contrast (WCAG AA 4.5:1)
      - Focus indicators visible
      - Touch targets ≥ 44x44px
      - Semantic HTML (headings, labels)
  - [ ] 4.6 Manual keyboard navigation testing
    - Visit each page without using mouse
    - Tab through all interactive elements (links, buttons, inputs, toggles)
    - Verify focus indicators visible (2px outline)
    - Verify all elements reachable and operable via keyboard
    - Test Enter/Space to activate buttons and toggles
  - [ ] 4.7 Cross-browser testing
    - Test in Chrome (latest): All features work, styling correct
    - Test in Safari (macOS): Fonts load, shadows render, animations smooth
    - Test in Firefox (latest): CSS variables work, gradients render
    - Test on iOS Safari (iPhone): Touch targets work, fonts render
    - Document any browser-specific issues in CHANGELOG or GitHub issue
  - [ ] 4.8 Performance testing
    - Check CSS bundle size increase:
      - Run `npm run build`
      - Compare `dist/assets/*.css` file sizes before/after redesign
      - Verify total increase < 10KB gzipped
    - Check font loading performance:
      - Use Chrome DevTools Network tab
      - Verify fonts preloaded in `<head>`
      - Verify no FOIT (Flash of Invisible Text) - fonts should swap
    - Check First Contentful Paint (FCP):
      - Use Lighthouse or WebPageTest
      - Verify FCP < 1.5 seconds on 4G throttling

- [ ] **5.0 Validation Checkpoint & Documentation** (0.5-1 hour)
  - [ ] 5.1 Conduct stakeholder review
    - Deploy PRD #1 changes to staging or preview environment
    - Share link with stakeholders (product owner, designers, etc.)
    - Gather feedback on question: **"Does this feel like Amara.day?"**
    - Focus on: warmth, inviting feel, color palette, typography, spacing
    - Document feedback in GitHub issue or PRD comments
  - [ ] 5.2 Make adjustments based on feedback
    - If colors feel too muted: Increase saturation slightly
    - If spacing feels cramped: Increase `--space-md`, `--space-lg` values
    - If typography feels off: Adjust font weights or line heights
    - Re-test after adjustments (Lighthouse, accessibility, cross-browser)
  - [ ] 5.3 Update CHANGELOG.md
    - Add entry under new version (e.g., v2.0.0 - Amara.day Rebrand):
      - "🎨 Rebrand to Amara.day with warm minimalism design system"
      - "✨ New sunrise logo and warm earthy color palette"
      - "♿ Enhanced accessibility with WCAG AA compliance"
      - "🔧 Self-hosted fonts for offline PWA capability"
      - "🎯 Redesigned core components: Navigation, ToggleSwitch, Buttons, Inputs, Cards"
      - "📱 Improved mobile touch targets (44x44px minimum)"
  - [ ] 5.4 Create or update README section on design system
    - Add section: "## Design System"
    - Document color palette (link to `src/styles/colors.css`)
    - Document typography scale
    - Document spacing scale
    - Provide examples of using CSS variables in components
  - [ ] 5.5 Final approval and merge
    - Ensure all tests pass: `npm test -- --run`
    - Ensure E2E tests pass: `npm run test:e2e`
    - Create feature branch: `git checkout -b feature/prd-0002-amara-day-foundation`
    - Commit changes with descriptive message:
      ```
      feat: Amara.day foundation and core component redesign

      - Add Amara.day branding (sunrise logo, warm color palette)
      - Implement design system (colors, typography, spacing, shadows)
      - Redesign core components (Navigation, ToggleSwitch, Buttons, Inputs, Cards)
      - Self-host fonts for offline capability
      - Achieve WCAG AA accessibility compliance
      - Update demo mode conversion modal with warm styling

      Completes PRD #0002 (Phase 0-2)
      ```
    - Push branch and create PR
    - Wait for CI checks (all tests must pass)
    - Request stakeholder approval
    - Merge to main after approval

---

## Notes

- **Order of implementation**: Follow task order (Phase 0 → Phase 1 → Phase 2) for logical dependency chain
- **CSS organization**: All new CSS files imported in `main.css` for single entry point
- **Color usage**: Always use CSS variables, never hardcode colors (enables consistency and future theme variations)
- **Testing strategy**: Unit tests for components, E2E tests for user journeys, manual testing for accessibility and cross-browser
- **Performance budget**: CSS increase < 10KB gzipped, fonts preloaded, Lighthouse 90+
- **Validation checkpoint**: PRD #2 cannot start until stakeholders approve: "This feels like Amara.day"
- **Font licensing**: Google Fonts are open source (OFL license), safe to self-host
- **Favicon generation**: Use online tools like RealFaviconGenerator.net or ImageMagick CLI
- **Contrast checking**: Use WebAIM Contrast Checker or Chrome DevTools built-in tool

---

**Estimated Total Effort:** 6-8 hours
**Completion Criteria:** All acceptance criteria in PRD #0004 met, stakeholder validation passed
**Next Steps:** After completion and validation, proceed to PRD #0005 (Pages & Polish)
