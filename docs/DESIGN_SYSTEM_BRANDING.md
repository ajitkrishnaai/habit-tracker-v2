# Branding Components - Design System

This document outlines the branding components used throughout Amara.day and provides guidelines for their usage.

## Overview

Amara.day uses two primary branding components to maintain consistent visual identity across all pages:

1. **AppHeader** - Primary branding header with "AMARA DAY" + "Daily Eternal"
2. **AmaraDayLogo** - Small inline logo with "Amara.day"

## AppHeader Component

### Purpose
The AppHeader component displays the main "AMARA DAY" branding with the "Daily Eternal" tagline. It appears at the top of **every page** to ensure consistent brand presence.

### Variants

#### Hero Variant
- **Use Case**: Landing/welcome pages
- **Visual Style**: Large, prominent header
- **Font Size**: `clamp(2rem, 6vw, 3.5rem)` for "AMARA DAY"
- **Font Size**: `clamp(0.875rem, 2vw, 1rem)` for "Daily Eternal"
- **Usage**:
```tsx
<AppHeader variant="hero" />
```

#### Compact Variant (Default)
- **Use Case**: Authenticated app pages (Daily Log, Progress, Manage Habits)
- **Visual Style**: Smaller, sticky header
- **Font Size**: `clamp(1.5rem, 4vw, 2rem)` for "AMARA DAY"
- **Font Size**: `clamp(0.625rem, 1.5vw, 0.75rem)` for "Daily Eternal"
- **Behavior**: Sticky positioned at top with backdrop blur effect
- **Usage**:
```tsx
<AppHeader variant="compact" />
```

### Typography
- **Font Family**: DM Sans (display font)
- **Primary Text**: "AMARA DAY"
  - Weight: 600 (Semi-Bold)
  - Color: `var(--moss-700)` (#567347)
  - Letter Spacing: 0.15em
  - Text Transform: Uppercase
- **Tagline**: "Daily Eternal"
  - Weight: 400 (Regular)
  - Color: `var(--stone-600)` (#8B8D7F)
  - Letter Spacing: 0.2em
  - Text Transform: Uppercase

### Integration
The AppHeader is automatically included in:
- **Layout Component**: All authenticated pages receive `variant="compact"`
- **WelcomePage**: Uses `variant="hero"` for hero section

### File Locations
- Component: `/src/components/AppHeader.tsx`
- Styles: `/src/components/AppHeader.css`

---

## AmaraDayLogo Component

### Purpose
A smaller, inline logo component for navigation and footer contexts where the full AppHeader would be too large.

### Visual Style
- **Text**: "Amara.day" (lowercase with dot notation)
- **Amara**: Bold weight (700), moss-700 color
- **.day**: Medium weight (500), stone-600 color
- **Layouts**: Horizontal (default) or vertical

### Variants
- **Full Color** (default): Brand colors (moss-700 + stone-600)
- **Monochrome**: Uses `currentColor` to inherit parent text color

### Usage
```tsx
// Horizontal layout (default)
<AmaraDayLogo size={28} />

// Vertical layout
<AmaraDayLogo size={28} layout="vertical" />

// Monochrome variant
<AmaraDayLogo variant="monochrome" />
```

### Integration
Currently used in:
- **Navigation Component**: Top nav bar branding
- **Footer Component**: Footer branding
- **LoadingScreen**: Initial load branding

### File Locations
- Component: `/src/components/branding/AmaraDayLogo.tsx`
- Barrel Export: `/src/components/branding/index.ts`

---

## Usage Guidelines

### DO ✓
- **Use AppHeader on ALL pages** for consistent brand presence
- Use `variant="hero"` for landing/welcome pages
- Use `variant="compact"` for authenticated app pages
- Use AmaraDayLogo in navigation and footer contexts
- Maintain consistent spacing and layout

### DON'T ✗
- **Never omit AppHeader from a page** - it's required for brand consistency
- Don't use both AppHeader and AmaraDayLogo in the same context
- Don't modify brand colors or typography
- Don't create custom variants without updating this documentation

---

## Responsive Behavior

### Mobile (< 768px)
- Hero variant: Reduced font sizes, tighter letter spacing
- Compact variant: Further reduced sizes for mobile optimization
- All variants maintain readability with `clamp()` functions

### Accessibility
- Both components support:
  - `prefers-reduced-motion`: Disables transitions/animations
  - `prefers-contrast: high`: Increased border widths and contrast
  - Semantic HTML with proper heading hierarchy
  - ARIA roles (`role="banner"` for AppHeader)

---

## Design Tokens

### Colors
```css
--moss-700: #567347;      /* Primary brand color - "AMARA DAY" */
--stone-600: #8B8D7F;     /* Tagline and secondary text */
--stone-0: #FFFFFF;       /* Background gradient start */
--stone-50: #FDFCF9;      /* Background gradient end */
--stone-200: #E5E3DF;     /* Border color */
```

### Typography
```css
--font-display: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Spacing
```css
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
--space-2xl: 3rem;
```

---

## Change Log

### 2025-11-05
- **Created AppHeader component** to standardize "AMARA DAY" branding across all pages
- Added hero and compact variants
- Integrated into Layout component (compact) and WelcomePage (hero)
- Updated branding documentation in `/src/components/branding/index.ts`
- Removed duplicate hero branding styles from WelcomePage.css

---

## Future Enhancements

### Potential Additions
- [ ] Dark mode support for AppHeader
- [ ] Additional size variants for AppHeader (e.g., "mini" for mobile-only contexts)
- [ ] Animation variants for hero transitions
- [ ] Custom theme color support via props

---

*This documentation should be updated whenever branding components are modified or new variants are added.*
