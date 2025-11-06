# Manual Testing Checklist - Amara.day Redesign
For PRD #0004: Foundation & Core Components

## Overview
This checklist covers manual testing tasks that require human verification or browser-based tools. Automated tests (unit, E2E) have been completed and are passing.

---

## 4.4: Lighthouse Performance Audit

**Prerequisites:**
- Production build: `npm run build && npm run preview`
- Open in Chrome (incognito mode recommended)

**Steps:**
1. Open Chrome DevTools (F12)
2. Navigate to "Lighthouse" tab
3. Select categories:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
4. Device: Mobile (default)
5. Click "Analyze page load"

**Success Criteria:**
- [ ] Performance Score ≥ 90
- [ ] Accessibility Score ≥ 95
- [ ] Best Practices Score ≥ 90
- [ ] SEO Score ≥ 90

**Expected Results:**
- **Performance**: Fast loading, fonts preloaded, minimal layout shift
- **Accessibility**: WCAG AA compliance, proper ARIA labels
- **Best Practices**: HTTPS, console errors clear, security best practices
- **SEO**: Meta tags present, semantic HTML

**Common Issues to Check:**
- ❗ Font loading causing FOIT → Should see `font-display: swap`
- ❗ Image sizing issues → Not applicable (no images in design)
- ❗ Render-blocking resources → Fonts should be preloaded

**Notes:**
_Record scores here after testing:_
- Performance: _____
- Accessibility: _____
- Best Practices: _____
- SEO: _____

---

## 4.5: axe-core Accessibility Scan

**Prerequisites:**
- Install [axe DevTools Extension](https://www.deque.com/axe/devtools/) (Chrome/Firefox/Edge)
- Or use: `npm install -g @axe-core/cli` for CLI testing

**Pages to Test:**
1. [ ] Welcome Page (`/`)
2. [ ] Daily Log Page (`/daily-log` - after sign-in)
3. [ ] Progress Page (`/progress` - after sign-in)
4. [ ] Manage Habits Page (`/manage-habits` - after sign-in)

**Steps for Each Page:**
1. Navigate to page
2. Open axe DevTools (or run `axe <url>`)
3. Click "Scan ALL of my page"
4. Review violations

**Success Criteria:**
- [ ] 0 Critical violations
- [ ] 0 Serious violations
- [ ] < 5 Moderate violations (acceptable if documented)
- [ ] < 10 Minor violations

**Common Issues to Check:**
- ✅ Color contrast (WCAG AA 4.5:1 for text, 3:1 for UI components)
- ✅ Focus indicators visible (2px solid outline)
- ✅ Touch targets ≥ 44x44px
- ✅ Semantic HTML (proper heading hierarchy)
- ✅ Form labels and ARIA attributes
- ✅ Alt text for images (N/A - logo is text-based)

**Expected Violations:**
- **None expected** - Design system built with accessibility in mind

**Notes:**
_Record violations here:_

Page: `/` (Welcome)
- Violations: _____

Page: `/daily-log`
- Violations: _____

Page: `/progress`
- Violations: _____

Page: `/manage-habits`
- Violations: _____

---

## 4.6: Manual Keyboard Navigation Testing

**Prerequisites:**
- Close mouse or use keyboard-only mode
- Test in Chrome, Firefox, and Safari

**Test Cases:**

### TC1: Tab Navigation Through All Pages
**Pages:** All (`/`, `/daily-log`, `/progress`, `/manage-habits`)

**Steps:**
1. Load page
2. Press Tab repeatedly to navigate through all interactive elements
3. Verify visible focus indicator on each element
4. Verify logical tab order (left-to-right, top-to-bottom)

**Expected:**
- [ ] Logo/navigation links focusable
- [ ] All buttons focusable
- [ ] All inputs focusable
- [ ] Toggle switches focusable
- [ ] Focus indicator visible (2px solid outline, 2px offset)
- [ ] Tab order logical (no skipping elements)

**Notes:**
_Document any issues:_

---

### TC2: Toggle Switch Keyboard Operation
**Page:** `/daily-log` (with at least one habit)

**Steps:**
1. Tab to toggle switch
2. Press Space key → should toggle ON
3. Press Space key again → should toggle OFF
4. Press Enter key → should toggle state
5. Verify screen reader text updates

**Expected:**
- [ ] Space key toggles switch
- [ ] Enter key toggles switch
- [ ] Visual state changes (on/off)
- [ ] ARIA attributes update (`aria-checked`)
- [ ] Screen reader announces state change

**Notes:**
_Document any issues:_

---

### TC3: Form Submission with Keyboard
**Page:** `/manage-habits`

**Steps:**
1. Tab to "Habit name" input
2. Type "Test Habit"
3. Press Tab to "Category" input (optional)
4. Press Enter or Tab to "Add Habit" button
5. Press Enter or Space to submit

**Expected:**
- [ ] Form submits on Enter key
- [ ] Button activates with Space or Enter
- [ ] Validation messages appear if needed
- [ ] Success feedback visible

**Notes:**
_Document any issues:_

---

### TC4: Navigation Links Activation
**Page:** Any authenticated page

**Steps:**
1. Tab to "Daily Log" link in navigation
2. Press Enter → should navigate to `/daily-log`
3. Tab to "Progress" link
4. Press Enter → should navigate to `/progress`
5. Tab to "Manage Habits" link
6. Press Enter → should navigate to `/manage-habits`

**Expected:**
- [ ] All navigation links keyboard accessible
- [ ] Enter key activates links
- [ ] Active link visually distinct
- [ ] Focus moves to main content after navigation

**Notes:**
_Document any issues:_

---

### TC5: Escape Key and Modal Dismissal
**Page:** Any page with ConversionModal (demo mode)

**Steps:**
1. Trigger conversion modal (3+ habits in demo mode)
2. Press Escape key
3. Verify modal dismisses

**Expected:**
- [ ] Escape key closes modal
- [ ] Focus returns to trigger element
- [ ] Page remains functional after dismissal

**Notes:**
_Document any issues:_

---

## 4.7: Cross-Browser Testing

**Browsers to Test:**
1. [ ] Chrome (latest) - Desktop & Mobile
2. [ ] Firefox (latest) - Desktop
3. [ ] Safari (macOS) - Desktop
4. [ ] Safari (iOS) - Mobile (iPhone/iPad)
5. [ ] Edge (latest) - Desktop

**Test Matrix:**

### Visual Regression Check
**Test:** Compare visual appearance across browsers

**Pages:** All (`/`, `/daily-log`, `/progress`, `/manage-habits`)

**Checklist:**
- [ ] Logo renders correctly (Amara + .day)
- [ ] Fonts load (DM Sans for headings, Inter for body)
- [ ] Colors match (moss green, warm grays)
- [ ] Shadows render (warm-toned, soft)
- [ ] Gradients display (button backgrounds)
- [ ] Border radius consistent (organic curves)
- [ ] Spacing consistent (8pt grid)

**Notes:**
_Browser-specific issues:_

**Chrome:**
- Visual issues: _____

**Firefox:**
- Visual issues: _____

**Safari (macOS):**
- Visual issues: _____

**Safari (iOS):**
- Visual issues: _____

**Edge:**
- Visual issues: _____

---

### Interaction Testing
**Test:** Verify all interactions work in each browser

**Checklist:**
- [ ] Toggle switches animate smoothly
- [ ] Buttons show hover states
- [ ] Inputs show focus styles
- [ ] Cards have hover effects
- [ ] Navigation glassmorphism (backdrop-filter)
- [ ] Transitions smooth (300ms ease-in-out)

**Known Limitations:**
- ⚠️ Firefox < 103: `backdrop-filter` not supported (fallback to solid background)
- ⚠️ Safari < 15: Some CSS properties may need `-webkit-` prefix

**Notes:**
_Browser-specific interaction issues:_

**Chrome:**
- Issues: _____

**Firefox:**
- Issues: _____ (backdrop-filter fallback working?)

**Safari (macOS):**
- Issues: _____

**Safari (iOS):**
- Issues: _____ (touch targets adequate?)

**Edge:**
- Issues: _____

---

### Font Loading Test
**Test:** Verify fonts load correctly and use fallbacks

**Steps:**
1. Open browser DevTools → Network tab
2. Filter by "Font"
3. Reload page
4. Verify font files load from `/fonts/`
5. Disable network → reload → verify fallback fonts

**Checklist:**
- [ ] DM Sans loads for headings
- [ ] Inter loads for body text
- [ ] No FOIT (Flash of Invisible Text)
- [ ] Fallback fonts render if network fails
- [ ] Font weights correct (400, 500, 600, 700)

**Notes:**
_Font loading issues by browser:_

---

### Responsive Design Test
**Test:** Verify responsive behavior on mobile and desktop

**Breakpoint:** 768px (mobile → desktop)

**Mobile (<768px):**
- [ ] Navigation stacked or hamburger menu (if applicable)
- [ ] Cards full-width
- [ ] Touch targets ≥ 44x44px
- [ ] Font size ≥ 16px (prevents iOS zoom)
- [ ] Toggle switches sized for touch (52x28px minimum)

**Desktop (≥768px):**
- [ ] Navigation horizontal
- [ ] Cards grid layout (if applicable)
- [ ] Max width 800px (centered)
- [ ] Toggle switches sized for mouse (60x34px)

**Test Viewports:**
- [ ] 375x667 (iPhone SE)
- [ ] 390x844 (iPhone 13)
- [ ] 768x1024 (iPad)
- [ ] 1280x720 (Desktop)
- [ ] 1920x1080 (Large Desktop)

**Notes:**
_Responsive issues:_

---

## 4.8: Additional Manual Checks

### Design System Consistency
**Test:** Verify design tokens applied consistently

**Checklist:**
- [ ] All buttons use `.btn-primary` or `.btn-secondary` classes
- [ ] All colors use CSS variables (no hardcoded hex)
- [ ] All spacing uses `--space-*` variables
- [ ] All border radius uses `--radius-*` variables
- [ ] All shadows use `--shadow-*` variables
- [ ] All fonts use `--font-display` or `--font-body`

**Notes:**
_Inconsistencies found:_

---

### Offline PWA Test
**Test:** Verify fonts and styles work offline

**Steps:**
1. Install PWA (Chrome → "Install Amara.day")
2. Open installed app
3. Go offline (DevTools → Network → Offline)
4. Navigate through all pages
5. Verify fonts and styles intact

**Expected:**
- [ ] Fonts load from service worker cache
- [ ] CSS loads from cache
- [ ] No broken styles
- [ ] All interactions work

**Notes:**
_Offline issues:_

---

## Summary & Sign-Off

**Date Tested:** __________

**Tested By:** __________

**Overall Assessment:**
- [ ] All critical tests passed
- [ ] No blocking issues found
- [ ] Minor issues documented
- [ ] Ready for production

**Blocking Issues (must fix before merge):**
1. _____
2. _____

**Non-Blocking Issues (can defer to future):**
1. _____
2. _____

**Sign-Off:**
- [ ] QA Approved
- [ ] Design Approved
- [ ] Product Approved

---

## Appendix: Tools & Resources

### Browser DevTools
- **Chrome:** F12 → Lighthouse, Console, Network, Performance
- **Firefox:** F12 → Accessibility Inspector, Network, Console
- **Safari:** Cmd+Option+I → Network, Console, Responsive Design Mode

### Accessibility Tools
- [axe DevTools Extension](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools → Accessibility Inspector

### Testing Utilities
- [BrowserStack](https://www.browserstack.com/) - Cross-browser testing
- [Responsive Design Checker](https://responsivedesignchecker.com/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Web.dev Measure](https://web.dev/measure/)

### Screen Reader Testing
- **macOS:** VoiceOver (Cmd+F5)
- **Windows:** NVDA (free), JAWS (commercial)
- **iOS:** VoiceOver (Settings → Accessibility)
- **Android:** TalkBack (Settings → Accessibility)

---

_Last Updated: November 5, 2025_
