# Demo Mode Onboarding Implementation Plan

**Feature:** Shadow Account with Progressive Journey Onboarding
**Goal:** Allow users to try the app without signup, with seamless data migration on conversion
**Status:** Planning Phase
**Estimated Effort:** 14-19 days (2.5-4 weeks for one developer)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Strategic Rationale](#strategic-rationale)
3. [PRD Clarification Questions & Answers](#prd-clarification-questions--answers)
4. [Phase 1: Core Infrastructure](#phase-1-core-infrastructure)
5. [Phase 2: UI Components](#phase-2-ui-components)
6. [Phase 3: Update Existing Components](#phase-3-update-existing-components)
7. [Phase 4: Data Migration Flow](#phase-4-data-migration-flow)
8. [Phase 5: Milestone Celebrations](#phase-5-milestone-celebrations)
9. [Phase 6: Expiry & Cleanup](#phase-6-expiry--cleanup)
10. [Testing Plan](#testing-plan)
11. [Implementation Timeline](#implementation-timeline)
12. [Success Metrics](#success-metrics)
13. [Risk Mitigation](#risk-mitigation)
14. [Future Enhancements](#future-enhancements)

---

## Executive Summary

This plan implements a **lightweight shadow account** onboarding pattern where users can try the Habit Tracker app immediately without signup. The implementation leverages the existing offline-first architecture (IndexedDB + sync queue) to minimize new code while maximizing conversion opportunities.

### Key Features

- **"Try Without Signing In"** button on welcome page
- **Progressive journey messaging** (Today → This Week → This Month)
- **Persistent demo banner** reminding users to sign in
- **Conversion triggers** based on engagement:
  - After adding 3+ habits
  - After completing first daily log
  - When visiting Progress page (locked features)
- **Milestone celebrations** (toasts for achievements)
- **Locked progress preview** showing what users unlock with signup
- **Seamless data migration** using existing sync service
- **7-day expiry** with warnings starting day 5

### Why This Approach?

1. **Leverages Existing Architecture**: Demo data uses IndexedDB; migration calls existing `syncService.fullSync()`
2. **Minimal New Code**: ~23 files (12 new, 8 modified, 3 tests)
3. **Conversion Psychology**: Triggers aligned with emotional investment, not arbitrary timers
4. **Mobile-First Simplicity**: No heavy onboarding tours - users learn by doing

---

## Strategic Rationale

### Why Shadow Account Over Other Patterns?

**✅ Chosen: Progressive "Shadow Account" Creation (Option #2)**

**Reasons:**
- **Architectural alignment**: Offline-first design is 90% there already
- **Emotional investment**: Users who add 3 habits and log for 3 days are committed
- **Mobile-first friction reduction**: No signup wall blocking quick trial
- **Conversion timing**: Ask when invested, not when curious

### Value Proposition Timing

The real "wow" moments aren't immediate - they emerge over time:
- **Day 1**: Complete first daily log session
- **Day 7**: See first 7-day streak
- **After 7+ notes**: Unlock notes analysis feature

This timing supports shadow accounts: conversion triggers align with value realization.

---

## PRD Clarification Questions & Answers

This section documents key decisions for PRD generation and implementation planning.

### 1. Implementation Priority & Scope
**Answer: A) Implement all phases (1-6) as a single large release**

**Rationale:** The 6 phases are tightly integrated - demo mode without celebrations/expiry feels incomplete, and migration without proper error handling risks user trust. The 14-19 day timeline is manageable for a feature that will become the primary onboarding flow. All phases are necessary for a polished, conversion-optimized experience.

### 2. Primary Success Metric
**Answer: B) Demo → Signup conversion rate (% who eventually create accounts)**

**Rationale:** While demo adoption rate validates the entry point and engagement depth shows product-market fit, **conversion rate** is the ultimate measure of this feature's success. Target: 20-30% (industry standard for freemium trial-to-paid). This metric directly impacts business growth and validates the shadow account approach.

### 3. Conversion Trigger Strategy
**Answer: A) Implement all 3 triggers as planned**

**Rationale:** Each trigger targets different user behaviors:
- **3+ habits**: Catches users building their system (planning mindset)
- **First log**: Catches users taking action (execution mindset)
- **Progress visit**: Catches users seeking insights (analytical mindset)

Implementing all three maximizes conversion opportunities across diverse user types. Post-launch analytics will reveal which trigger converts best, informing future optimization.

### 4. Demo Data Expiry Period
**Answer: A) Keep 7 days as proposed**

**Rationale:** 7 days balances user comfort with urgency. It's longer than typical freemium trials (3-5 days) but short enough to create FOMO. Habit formation research shows 7 days is enough to see initial patterns. Warnings starting day 5 provide 2 days' notice - enough to spur action without being annoying. This aligns with D7 retention metrics (target: 15%).

### 5. Migration Error Handling
**Answer: A) Show error banner with retry button (don't block auth)**

**Rationale:** User authentication success is more critical than perfect data migration. Blocking signup on migration failure creates a terrible first impression and destroys conversion. By allowing auth to complete and showing a retry banner, we:
1. Preserve the conversion (user is now signed in)
2. Give users control (they can retry manually)
3. Avoid data loss (IndexedDB data still exists locally)
4. Maintain trust (transparent about the issue)

Implementation: Add `<ErrorBanner>` component with "Retry Sync" button that calls `syncService.fullSync()`.

### 6. Milestone Celebrations
**Answer: A) Implement all 4 milestones as toast notifications**

**Rationale:** Milestone toasts provide positive reinforcement and build emotional investment - key for conversion. The 4 milestones are:
1. **First habit added**: "Great start! Add 2 more to build your routine."
2. **3 habits added**: "You've added 3 habits! Come back tomorrow to start your streak."
3. **First log completed**: "First log complete! Come back tomorrow to build your streak."
4. **3 days in demo mode**: "You're building momentum! Sign in to unlock streak tracking."

These are lightweight (Toast component ~100 lines) and create "wow" moments during the demo journey. Skipping them would make demo mode feel lifeless.

### 7. Locked Progress Preview
**Answer: A) Show full locked preview with blurred charts (as designed)**

**Rationale:** The blurred chart preview creates visual curiosity and demonstrates real value ("This is what you're missing"). A simple "Sign in to unlock" message lacks emotional impact. Partial data (option C) defeats the purpose - we want users to *feel* what they're missing, not half-experience it. The implementation is straightforward (~150 lines for LockedProgressPreview component) and creates strong conversion motivation when users visit the Progress page.

### 8. Testing & Quality Bar
**Answer: A) Unit tests + E2E tests + Manual testing (as planned, ~4 days)**

**Rationale:** This feature will become the **primary onboarding flow** for new users - it must be rock-solid. Required testing:
- **Unit tests** for demoMode service (conversion triggers, milestone logic, expiry calculations)
- **E2E tests** for critical flows (demo mode entry, conversion modal triggers, data migration, expiry warnings)
- **Manual testing** for UX polish (mobile responsiveness, accessibility, error states)

Skipping E2E tests risks broken conversion flows (catastrophic for business). Skipping manual testing risks poor mobile UX (70%+ of users are mobile). The 4-day investment ensures launch quality and prevents post-launch firefighting.

---

## Phase 1: Core Infrastructure

### 1.1 Create Demo Mode Service

**New File:** `src/services/demoMode.ts`

```typescript
/**
 * Demo Mode Service
 * Manages shadow account state and conversion triggers
 */

import { isAuthenticated } from './auth';
import { syncService } from './syncService';

export interface DemoMetrics {
  demo_start_date: string;          // ISO timestamp
  demo_habits_added: number;
  demo_logs_completed: number;
  demo_last_visit: string;
  demo_progress_visits: number;      // Times user visited progress page
  demo_conversion_shown: boolean;    // Whether conversion modal was shown
}

// LocalStorage key for demo metrics
const DEMO_METRICS_KEY = 'habitTracker_demoMetrics';
const SHOWN_MILESTONES_KEY = 'habitTracker_shownMilestones';

class DemoModeService {
  /**
   * Check if app is in demo mode (no authenticated session)
   */
  isDemoMode(): boolean {
    return !isAuthenticated();
  }

  /**
   * Initialize demo mode - called when user clicks "Try Without Signing In"
   */
  initializeDemoMode(): void {
    const metrics: DemoMetrics = {
      demo_start_date: new Date().toISOString(),
      demo_habits_added: 0,
      demo_logs_completed: 0,
      demo_last_visit: new Date().toISOString(),
      demo_progress_visits: 0,
      demo_conversion_shown: false,
    };
    localStorage.setItem(DEMO_METRICS_KEY, JSON.stringify(metrics));
  }

  /**
   * Get current demo metrics
   */
  getDemoMetrics(): DemoMetrics | null {
    const json = localStorage.getItem(DEMO_METRICS_KEY);
    return json ? JSON.parse(json) : null;
  }

  /**
   * Update demo metrics
   */
  updateDemoMetrics(updates: Partial<DemoMetrics>): void {
    const current = this.getDemoMetrics();
    if (!current) return;

    const updated = { ...current, ...updates, demo_last_visit: new Date().toISOString() };
    localStorage.setItem(DEMO_METRICS_KEY, JSON.stringify(updated));
  }

  /**
   * Track habit added in demo mode
   */
  trackHabitAdded(): void {
    const metrics = this.getDemoMetrics();
    if (metrics) {
      this.updateDemoMetrics({
        demo_habits_added: metrics.demo_habits_added + 1,
      });
    }
  }

  /**
   * Track log completed in demo mode
   */
  trackLogCompleted(): void {
    const metrics = this.getDemoMetrics();
    if (metrics) {
      this.updateDemoMetrics({
        demo_logs_completed: metrics.demo_logs_completed + 1,
      });
    }
  }

  /**
   * Track progress page visit
   */
  trackProgressVisit(): void {
    const metrics = this.getDemoMetrics();
    if (metrics) {
      this.updateDemoMetrics({
        demo_progress_visits: metrics.demo_progress_visits + 1,
      });
    }
  }

  /**
   * Check if conversion modal should be shown
   * Returns trigger reason or null if shouldn't show
   */
  shouldShowConversionModal(): string | null {
    const metrics = this.getDemoMetrics();
    if (!metrics || metrics.demo_conversion_shown) return null;

    // Trigger 1: After 3+ habits added
    if (metrics.demo_habits_added >= 3) {
      return 'habits_threshold';
    }

    // Trigger 2: After first daily log completed
    if (metrics.demo_logs_completed >= 1) {
      return 'first_log';
    }

    // Trigger 3: Visiting progress page (locked features)
    if (metrics.demo_progress_visits >= 1) {
      return 'progress_page';
    }

    return null;
  }

  /**
   * Mark conversion modal as shown
   */
  markConversionShown(): void {
    this.updateDemoMetrics({ demo_conversion_shown: true });
  }

  /**
   * Get days in demo mode
   */
  getDaysInDemo(): number {
    const metrics = this.getDemoMetrics();
    if (!metrics) return 0;

    const start = new Date(metrics.demo_start_date);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if demo data should expire (7 days)
   */
  shouldExpireDemo(): boolean {
    return this.getDaysInDemo() >= 7;
  }

  /**
   * Clear demo mode data (called after conversion or expiry)
   */
  clearDemoData(): void {
    localStorage.removeItem(DEMO_METRICS_KEY);
    localStorage.removeItem(SHOWN_MILESTONES_KEY);
  }

  /**
   * Migrate demo data to authenticated account
   * This triggers the existing sync logic
   */
  async migrateDemoData(): Promise<void> {
    console.log('[DemoMode] Starting data migration...');

    // Demo data is already in IndexedDB
    // Just trigger sync to Supabase - existing sync logic handles it!
    await syncService.fullSync();

    console.log('[DemoMode] Migration complete, clearing demo metrics');

    // Clear demo metrics after successful migration
    this.clearDemoData();
  }

  /**
   * Get milestone message if a milestone was just reached
   * Returns null if no new milestone
   */
  getMilestoneMessage(): string | null {
    const metrics = this.getDemoMetrics();
    if (!metrics) return null;

    // Check localStorage for already-shown milestones
    const shown = JSON.parse(localStorage.getItem(SHOWN_MILESTONES_KEY) || '[]');

    // Milestone 1: First habit added
    if (metrics.demo_habits_added === 1 && !shown.includes('first_habit')) {
      localStorage.setItem(SHOWN_MILESTONES_KEY, JSON.stringify([...shown, 'first_habit']));
      return "✓ Great start! Add 2 more to build your routine.";
    }

    // Milestone 2: 3 habits added
    if (metrics.demo_habits_added === 3 && !shown.includes('three_habits')) {
      localStorage.setItem(SHOWN_MILESTONES_KEY, JSON.stringify([...shown, 'three_habits']));
      return "🎉 You've added 3 habits! Come back tomorrow to start your streak.";
    }

    // Milestone 3: First log completed
    if (metrics.demo_logs_completed === 1 && !shown.includes('first_log')) {
      localStorage.setItem(SHOWN_MILESTONES_KEY, JSON.stringify([...shown, 'first_log']));
      return "🎉 First log complete! Come back tomorrow to build your streak.";
    }

    // Milestone 4: 3 days in demo mode
    const days = this.getDaysInDemo();
    if (days === 3 && !shown.includes('three_days')) {
      localStorage.setItem(SHOWN_MILESTONES_KEY, JSON.stringify([...shown, 'three_days']));
      return "📈 You're building momentum! Sign in to unlock streak tracking.";
    }

    return null;
  }
}

export const demoModeService = new DemoModeService();
```

**Key Design Decisions:**

1. **Uses localStorage for metrics** (not IndexedDB) - simpler, lighter
2. **Actual habit/log data** already in IndexedDB via existing storage service
3. **Migration just calls `syncService.fullSync()`** - no new sync logic needed!
4. **Milestone tracking** prevents showing same message twice

---

## Phase 2: UI Components

### 2.1 Demo Mode Banner

**New File:** `src/components/DemoBanner.tsx`

```typescript
/**
 * DemoBanner Component
 * Shown at top of protected routes when in demo mode
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DemoBanner.css';

export const DemoBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="demo-banner" role="alert" aria-live="polite">
      <div className="demo-banner-content">
        <span className="demo-banner-icon" aria-hidden="true">📍</span>
        <span className="demo-banner-text">
          You're trying Habit Tracker. <strong>Sign in to sync across devices.</strong>
        </span>
        <button
          className="demo-banner-cta"
          onClick={() => navigate('/')}
          aria-label="Sign in to save your progress"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
```

**New File:** `src/components/DemoBanner.css`

```css
.demo-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.demo-banner-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.demo-banner-icon {
  font-size: 20px;
  line-height: 1;
}

.demo-banner-text {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  min-width: 200px;
}

.demo-banner-cta {
  background: white;
  color: #667eea;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 44px; /* Touch target */
  min-width: 88px;
}

.demo-banner-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.demo-banner-cta:active {
  transform: translateY(0);
}

/* Mobile optimization */
@media (max-width: 768px) {
  .demo-banner-content {
    justify-content: center;
    text-align: center;
  }

  .demo-banner-cta {
    width: 100%;
    margin-top: 4px;
  }
}
```

### 2.2 Conversion Modal

**New File:** `src/components/ConversionModal.tsx`

```typescript
/**
 * ConversionModal Component
 * Shown when demo user hits engagement triggers
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ConversionModal.css';

interface ConversionModalProps {
  trigger: 'habits_threshold' | 'first_log' | 'progress_page';
  onClose: () => void;
}

export const ConversionModal: React.FC<ConversionModalProps> = ({ trigger, onClose }) => {
  const navigate = useNavigate();

  const getTitleAndMessage = () => {
    switch (trigger) {
      case 'habits_threshold':
        return {
          title: "You're building momentum! 🚀",
          message: "You've added 3 habits. Sign in now to sync your progress across devices and never lose your data.",
        };
      case 'first_log':
        return {
          title: "Great start! 🎉",
          message: "You've completed your first daily log. Sign in to save your progress and track your streaks over time.",
        };
      case 'progress_page':
        return {
          title: "Unlock Your Analytics 📊",
          message: "See your streaks, completion trends, and notes analysis. Sign in to unlock all progress features.",
        };
    }
  };

  const { title, message } = getTitleAndMessage();

  const handleSignIn = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="conversion-modal-overlay" onClick={onClose}>
      <div
        className="conversion-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="conversion-modal-title"
        aria-describedby="conversion-modal-message"
      >
        <button
          className="conversion-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <h2 id="conversion-modal-title" className="conversion-modal-title">{title}</h2>
        <p id="conversion-modal-message" className="conversion-modal-message">{message}</p>

        <div className="conversion-modal-benefits">
          <h3>With a free account:</h3>
          <ul>
            <li>✓ Cloud sync across all devices</li>
            <li>✓ Never lose your progress</li>
            <li>✓ Unlock advanced analytics</li>
            <li>✓ Track unlimited habits & notes</li>
          </ul>
        </div>

        <div className="conversion-modal-actions">
          <button
            className="conversion-modal-primary"
            onClick={handleSignIn}
          >
            Sign In to Save Progress
          </button>
          <button
            className="conversion-modal-secondary"
            onClick={onClose}
          >
            Continue in Demo Mode
          </button>
        </div>

        <p className="conversion-modal-note">
          Your demo data will be automatically saved when you sign in.
        </p>
      </div>
    </div>
  );
};
```

**New File:** `src/components/ConversionModal.css`

```css
.conversion-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.conversion-modal {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  padding: 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.conversion-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  color: #666;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.conversion-modal-close:hover {
  color: #000;
}

.conversion-modal-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #1a1a1a;
}

.conversion-modal-message {
  font-size: 16px;
  line-height: 1.6;
  color: #555;
  margin: 0 0 24px 0;
}

.conversion-modal-benefits {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.conversion-modal-benefits h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #333;
}

.conversion-modal-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.conversion-modal-benefits li {
  font-size: 14px;
  line-height: 1.8;
  color: #555;
}

.conversion-modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.conversion-modal-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  min-height: 48px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.conversion-modal-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

.conversion-modal-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #e0e0e0;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  min-height: 44px;
  transition: border-color 0.2s, background 0.2s;
}

.conversion-modal-secondary:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.conversion-modal-note {
  font-size: 13px;
  color: #888;
  text-align: center;
  margin: 0;
  line-height: 1.4;
}

/* Mobile optimization */
@media (max-width: 768px) {
  .conversion-modal {
    padding: 24px;
  }

  .conversion-modal-title {
    font-size: 20px;
  }

  .conversion-modal-message {
    font-size: 14px;
  }
}
```

### 2.3 Locked Progress Preview

**New File:** `src/components/LockedProgressPreview.tsx`

```typescript
/**
 * LockedProgressPreview Component
 * Shown on Progress page in demo mode
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LockedProgressPreview.css';

export const LockedProgressPreview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="locked-progress">
      <div className="locked-progress-blur" aria-hidden="true">
        {/* Fake blurred chart/graph */}
        <div className="fake-chart">
          <div className="fake-bar" style={{ height: '40%' }}></div>
          <div className="fake-bar" style={{ height: '60%' }}></div>
          <div className="fake-bar" style={{ height: '80%' }}></div>
          <div className="fake-bar" style={{ height: '100%' }}></div>
          <div className="fake-bar" style={{ height: '85%' }}></div>
          <div className="fake-bar" style={{ height: '90%' }}></div>
          <div className="fake-bar" style={{ height: '100%' }}></div>
        </div>
      </div>

      <div className="locked-progress-content">
        <div className="locked-icon" aria-hidden="true">🔒</div>
        <h2>Unlock Your Progress Analytics</h2>
        <p>Sign in to unlock:</p>
        <ul className="locked-features">
          <li>7-day & 30-day streak tracking</li>
          <li>Completion trends over time</li>
          <li>Notes sentiment analysis (after 7+ notes)</li>
          <li>Pattern discovery and insights</li>
        </ul>
        <button
          className="locked-cta"
          onClick={() => navigate('/')}
        >
          Sign In to Unlock
        </button>
      </div>
    </div>
  );
};
```

**New File:** `src/components/LockedProgressPreview.css`

```css
.locked-progress {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  margin: 24px 0;
}

.locked-progress-blur {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  filter: blur(8px);
  opacity: 0.3;
  z-index: 1;
}

.fake-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  padding: 40px;
}

.fake-bar {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  width: 40px;
  border-radius: 4px 4px 0 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.locked-progress-content {
  position: relative;
  z-index: 2;
  text-align: center;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.locked-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.locked-progress-content h2 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.locked-progress-content > p {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.locked-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  text-align: left;
}

.locked-features li {
  font-size: 14px;
  line-height: 2;
  color: #555;
  padding-left: 8px;
}

.locked-cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  min-height: 48px;
  transition: transform 0.2s, box-shadow 0.2s;
  width: 100%;
}

.locked-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

/* Mobile optimization */
@media (max-width: 768px) {
  .locked-progress {
    min-height: 300px;
  }

  .locked-progress-content {
    padding: 32px 24px;
  }

  .locked-progress-content h2 {
    font-size: 20px;
  }
}
```

### 2.4 Toast Notification System

**New File:** `src/components/Toast.tsx`

```typescript
/**
 * Toast Component
 * Generic toast notification for milestone celebrations
 */

import React, { useEffect } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  icon?: string;
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  icon = '🎉',
  duration = 4000,
  onClose
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast" role="alert" aria-live="polite">
      <span className="toast-icon" aria-hidden="true">{icon}</span>
      <span className="toast-message">{message}</span>
    </div>
  );
};
```

**New File:** `src/components/Toast.css`

```css
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-width: 90%;
  animation: slideUpFade 0.3s ease-out;
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.toast-icon {
  font-size: 24px;
  line-height: 1;
}

.toast-message {
  font-size: 14px;
  line-height: 1.4;
}

/* Mobile optimization */
@media (max-width: 768px) {
  .toast {
    bottom: 80px; /* Above mobile navigation */
    max-width: calc(100% - 32px);
  }
}
```

### 2.5 Migration Success Toast

**New File:** `src/components/MigrationToast.tsx`

```typescript
/**
 * MigrationToast Component
 * Shown after successful demo data migration
 */

import React, { useEffect, useState } from 'react';
import './MigrationToast.css';

export const MigrationToast: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="migration-toast" role="alert" aria-live="polite">
      <span className="migration-toast-icon" aria-hidden="true">✓</span>
      <div className="migration-toast-content">
        <strong>Welcome!</strong>
        <p>Your demo data has been saved. All your habits and logs are now synced to your account.</p>
      </div>
      <button
        className="migration-toast-close"
        onClick={() => setVisible(false)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};
```

**New File:** `src/components/MigrationToast.css`

```css
.migration-toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 20px 24px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-width: 400px;
  animation: slideInRight 0.4s ease-out;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.migration-toast-icon {
  font-size: 28px;
  line-height: 1;
  background: rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.migration-toast-content {
  flex: 1;
}

.migration-toast-content strong {
  display: block;
  font-size: 16px;
  margin-bottom: 4px;
}

.migration-toast-content p {
  font-size: 14px;
  line-height: 1.4;
  margin: 0;
  opacity: 0.95;
}

.migration-toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.migration-toast-close:hover {
  opacity: 1;
}

/* Mobile optimization */
@media (max-width: 768px) {
  .migration-toast {
    bottom: 80px;
    left: 16px;
    right: 16px;
    max-width: none;
  }
}
```

### 2.6 Expiry Warning Banner

**New File:** `src/components/ExpiryWarning.tsx`

```typescript
/**
 * ExpiryWarning Component
 * Shown when demo data is close to expiring (day 5+)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { demoModeService } from '../services/demoMode';
import './ExpiryWarning.css';

export const ExpiryWarning: React.FC = () => {
  const navigate = useNavigate();
  const daysInDemo = demoModeService.getDaysInDemo();
  const daysLeft = 7 - daysInDemo;

  // Only show in last 2 days
  if (daysLeft > 2) return null;

  return (
    <div className="expiry-warning" role="alert">
      <div className="expiry-warning-content">
        <span className="expiry-warning-icon" aria-hidden="true">⚠️</span>
        <span className="expiry-warning-text">
          Your demo data will be deleted in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>.
          Sign in to save your progress permanently.
        </span>
        <button
          className="expiry-warning-cta"
          onClick={() => navigate('/')}
        >
          Sign In Now
        </button>
      </div>
    </div>
  );
};
```

**New File:** `src/components/ExpiryWarning.css`

```css
.expiry-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 16px;
  border-bottom: 3px solid #b45309;
}

.expiry-warning-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.expiry-warning-icon {
  font-size: 24px;
  line-height: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.expiry-warning-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.5;
  min-width: 200px;
}

.expiry-warning-text strong {
  font-weight: 700;
  text-decoration: underline;
}

.expiry-warning-cta {
  background: white;
  color: #d97706;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 44px;
  min-width: 120px;
}

.expiry-warning-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Mobile optimization */
@media (max-width: 768px) {
  .expiry-warning-content {
    justify-content: center;
    text-align: center;
  }

  .expiry-warning-cta {
    width: 100%;
    margin-top: 8px;
  }
}
```

---

## Phase 3: Update Existing Components

### 3.1 Update Layout Component

**File:** `src/components/Layout.tsx`

```typescript
import React from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import OfflineIndicator from './OfflineIndicator';
import { DemoBanner } from './DemoBanner';
import { ExpiryWarning } from './ExpiryWarning';
import { demoModeService } from '../services/demoMode';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isDemo = demoModeService.isDemoMode();

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
};

export default Layout;
```

### 3.2 Update ProtectedRoute Component

**File:** `src/components/ProtectedRoute.tsx`

```typescript
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';
import { demoModeService } from '../services/demoMode';
import Layout from './Layout';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps): JSX.Element => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      setChecking(false);
    };

    checkAuth();
  }, [location]);

  if (checking) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  // NEW: Allow demo mode users through
  const demoMetrics = demoModeService.getDemoMetrics();

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

  return <Layout>{children}</Layout>;
};
```

### 3.3 Update WelcomePage Component

**File:** `src/pages/WelcomePage.tsx`

**Key changes:**

1. Add "Try Without Signing In" handler
2. Restructure hero section with progressive journey messaging
3. Add "How It Works" section with 3-step journey
4. Make email/password form secondary (collapsible)

```typescript
// Add to imports:
import { demoModeService } from '../services/demoMode';

// Add handler function:
const handleTryDemo = () => {
  demoModeService.initializeDemoMode();
  navigate('/daily-log');
};

// Update hero section (replace lines 94-99):
<header className="welcome-hero">
  <h1 className="welcome-title">Track habits. Build streaks. Own your data.</h1>
  <p className="welcome-subtitle">
    Start today. See progress in a week. Discover patterns in a month.
  </p>
</header>

// Add new "How It Works" section after hero:
<section className="welcome-journey">
  <h2 className="welcome-section-title">How It Works</h2>

  <div className="welcome-journey-steps">
    <div className="welcome-step">
      <div className="welcome-step-number">1</div>
      <h3 className="welcome-step-title">Today: Add Your Habits</h3>
      <p className="welcome-step-description">
        Simple toggles to mark done or not done. Works offline.
      </p>
    </div>

    <div className="welcome-step">
      <div className="welcome-step-number">2</div>
      <h3 className="welcome-step-title">This Week: See Your Streaks</h3>
      <p className="welcome-step-description">
        Track consistency over 7+ days. Build momentum.
      </p>
    </div>

    <div className="welcome-step">
      <div className="welcome-step-number">3</div>
      <h3 className="welcome-step-title">This Month: Discover Patterns</h3>
      <p className="welcome-step-description">
        AI analyzes your notes to show what helps you succeed.
      </p>
    </div>
  </div>
</section>

// Update CTA section (replace lines 136-230):
<section className="welcome-cta">
  <h2 className="welcome-cta-title">Get Started</h2>

  {/* NEW: Primary CTA for demo mode */}
  <button
    className="welcome-button welcome-button-demo"
    onClick={handleTryDemo}
    disabled={loading || !authInitialized}
    aria-label="Try the app without signing up"
  >
    Try Without Signing In
  </button>

  <p className="welcome-cta-divider">or</p>

  {/* Existing email/password form becomes collapsible */}
  <details className="welcome-auth-details">
    <summary className="welcome-auth-summary">Sign In with Email</summary>

    <form onSubmit={handleSubmit} className="welcome-form">
      {isSignUp && (
        <div className="welcome-form-field">
          <label htmlFor="name" className="welcome-label">
            Name (optional)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="welcome-input"
            placeholder="Your name"
            disabled={loading || !authInitialized}
          />
        </div>
      )}

      <div className="welcome-form-field">
        <label htmlFor="email" className="welcome-label">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="welcome-input"
          placeholder="your.email@example.com"
          required
          disabled={loading || !authInitialized}
          autoComplete="email"
        />
      </div>

      <div className="welcome-form-field">
        <label htmlFor="password" className="welcome-label">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="welcome-input"
          placeholder="••••••••"
          required
          minLength={6}
          disabled={loading || !authInitialized}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
        />
        {isSignUp && (
          <p className="welcome-input-hint">
            Minimum 6 characters
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !authInitialized}
        className="welcome-button"
        aria-label={isSignUp ? 'Create account and start tracking habits' : 'Sign in to your account'}
      >
        {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
      </button>

      {error && (
        <p className="welcome-error" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={toggleMode}
        className="welcome-toggle-mode"
        disabled={loading}
      >
        {isSignUp
          ? 'Already have an account? Sign in'
          : "Don't have an account? Sign up"}
      </button>
    </form>
  </details>

  <p className="welcome-privacy-note">
    Your habit data is private and secure. We use industry-standard encryption.
  </p>
</section>
```

**Update CSS** (`src/pages/WelcomePage.css`):

```css
/* Add to existing WelcomePage.css: */

.welcome-journey {
  margin: 48px 0;
  padding: 0 16px;
}

.welcome-section-title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 32px 0;
  color: #1a1a1a;
}

.welcome-journey-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  max-width: 900px;
  margin: 0 auto;
}

.welcome-step {
  text-align: center;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.welcome-step:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.welcome-step-number {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  margin: 0 auto 16px;
}

.welcome-step-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.welcome-step-description {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  margin: 0;
}

.welcome-button-demo {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 18px;
  padding: 16px 32px;
  margin-bottom: 16px;
}

.welcome-cta-divider {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin: 16px 0;
  position: relative;
}

.welcome-cta-divider::before,
.welcome-cta-divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #ddd;
}

.welcome-cta-divider::before {
  left: 0;
}

.welcome-cta-divider::after {
  right: 0;
}

.welcome-auth-details {
  margin-top: 16px;
  width: 100%;
}

.welcome-auth-summary {
  cursor: pointer;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
  color: #667eea;
  text-align: center;
  transition: background 0.2s, border-color 0.2s;
  list-style: none;
}

.welcome-auth-summary::-webkit-details-marker {
  display: none;
}

.welcome-auth-summary:hover {
  background: #f0f1f5;
  border-color: #667eea;
}

.welcome-auth-details[open] .welcome-auth-summary {
  margin-bottom: 16px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

/* Mobile optimization */
@media (max-width: 768px) {
  .welcome-journey-steps {
    grid-template-columns: 1fr;
  }
}
```

### 3.4 Update ManageHabitsPage Component

**File:** `src/pages/ManageHabitsPage.tsx`

Add demo tracking after successful habit save:

```typescript
// Add imports:
import { demoModeService } from '../services/demoMode';
import { ConversionModal } from '../components/ConversionModal';
import { Toast } from '../components/Toast';

// Add state:
const [showConversionModal, setShowConversionModal] = useState(false);
const [conversionTrigger, setConversionTrigger] = useState<'habits_threshold' | 'first_log' | 'progress_page'>('habits_threshold');
const [showToast, setShowToast] = useState(false);
const [toastMessage, setToastMessage] = useState('');

// In handleSaveHabit function, after successful save:
const handleSaveHabit = async () => {
  // ... existing save logic ...

  // NEW: Track demo metrics if in demo mode
  if (demoModeService.isDemoMode()) {
    demoModeService.trackHabitAdded();

    // Check for milestone
    const milestoneMsg = demoModeService.getMilestoneMessage();
    if (milestoneMsg) {
      setToastMessage(milestoneMsg);
      setShowToast(true);
    }

    // Check if conversion modal should show
    const trigger = demoModeService.shouldShowConversionModal();
    if (trigger) {
      setShowConversionModal(true);
      setConversionTrigger(trigger as 'habits_threshold' | 'first_log' | 'progress_page');
      demoModeService.markConversionShown();
    }
  }
};

// Add to render (before closing div):
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

### 3.5 Update DailyLogPage Component

**File:** `src/pages/DailyLogPage.tsx`

Add demo tracking after successful log save:

```typescript
// Add imports:
import { demoModeService } from '../services/demoMode';
import { ConversionModal } from '../components/ConversionModal';
import { Toast } from '../components/Toast';

// Add state:
const [showConversionModal, setShowConversionModal] = useState(false);
const [conversionTrigger, setConversionTrigger] = useState<'habits_threshold' | 'first_log' | 'progress_page'>('first_log');
const [showToast, setShowToast] = useState(false);
const [toastMessage, setToastMessage] = useState('');

// In handleSaveLogs function, after successful save:
const handleSaveLogs = async () => {
  // ... existing save logic ...

  // NEW: Track demo metrics if in demo mode
  if (demoModeService.isDemoMode()) {
    demoModeService.trackLogCompleted();

    // Check for milestone
    const milestoneMsg = demoModeService.getMilestoneMessage();
    if (milestoneMsg) {
      setToastMessage(milestoneMsg);
      setShowToast(true);
    }

    // Check if conversion modal should show
    const trigger = demoModeService.shouldShowConversionModal();
    if (trigger) {
      setShowConversionModal(true);
      setConversionTrigger(trigger as 'habits_threshold' | 'first_log' | 'progress_page');
      demoModeService.markConversionShown();
    }
  }
};

// Add to render (before closing div):
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

### 3.6 Update ProgressPage Component

**File:** `src/pages/ProgressPage.tsx`

Show locked preview in demo mode:

```typescript
// Add imports:
import { demoModeService } from '../services/demoMode';
import { LockedProgressPreview } from '../components/LockedProgressPreview';
import { ConversionModal } from '../components/ConversionModal';

// Add state:
const [showConversionModal, setShowConversionModal] = useState(false);
const [conversionTrigger, setConversionTrigger] = useState<'habits_threshold' | 'first_log' | 'progress_page'>('progress_page');

// At top of component:
const isDemo = demoModeService.isDemoMode();

// Update useEffect:
useEffect(() => {
  // NEW: Track progress visit if in demo mode
  if (isDemo) {
    demoModeService.trackProgressVisit();

    // Check if conversion modal should show
    const trigger = demoModeService.shouldShowConversionModal();
    if (trigger) {
      setShowConversionModal(true);
      setConversionTrigger(trigger as 'habits_threshold' | 'first_log' | 'progress_page');
      demoModeService.markConversionShown();
    }
  }

  loadHabitsAndLogs();
}, [isDemo]);

// Add early return for demo mode (after loading check):
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

---

## Phase 4: Data Migration Flow

### 4.1 Update Auth Service

**File:** `src/services/auth.ts`

Add migration trigger after successful login/signup:

```typescript
// Add import:
import { demoModeService } from './demoMode';

// Update loginWithEmail (after line 102):
export const loginWithEmail = async (email: string, password: string): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }

    currentSession = data.session;
    currentUser = data.user;

    console.log('[Auth] Login successful:', currentUser?.email);

    // NEW: Check for demo data and migrate if exists
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
  } catch (error) {
    console.error('[Auth] Failed to complete login:', error);
    throw error;
  }
};

// Update signUpWithEmail (same changes after line 136):
export const signUpWithEmail = async (email: string, password: string, name?: string): Promise<void> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      console.error('[Auth] Sign up error:', error);
      throw error;
    }

    currentSession = data.session;
    currentUser = data.user;

    console.log('[Auth] Sign up successful:', currentUser?.email);

    // NEW: Check for demo data and migrate if exists
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
  } catch (error) {
    console.error('[Auth] Failed to complete sign up:', error);
    throw error;
  }
};
```

### 4.2 Show Migration Success Toast

**Update DailyLogPage** (or Layout) to show migration toast after successful login:

```typescript
// In DailyLogPage.tsx (or Layout.tsx):

import { MigrationToast } from '../components/MigrationToast';

// Add state:
const [showMigrationToast, setShowMigrationToast] = useState(false);

// Add useEffect to check for migration success flag:
useEffect(() => {
  const migrationSuccess = sessionStorage.getItem('demo_migration_success');
  if (migrationSuccess) {
    setShowMigrationToast(true);
    sessionStorage.removeItem('demo_migration_success');
  }
}, []);

// Add to render:
{showMigrationToast && <MigrationToast />}
```

---

## Phase 5: Milestone Celebrations

Milestone logic is already built into `demoModeService.getMilestoneMessage()` (see Phase 1).

Milestones are automatically shown as Toast notifications in:
- ManageHabitsPage (after adding habits)
- DailyLogPage (after completing logs)

**Milestone triggers:**
1. **First habit added**: "✓ Great start! Add 2 more to build your routine."
2. **3 habits added**: "🎉 You've added 3 habits! Come back tomorrow to start your streak."
3. **First log completed**: "🎉 First log complete! Come back tomorrow to build your streak."
4. **3 days in demo mode**: "📈 You're building momentum! Sign in to unlock streak tracking."

---

## Phase 6: Expiry & Cleanup

### 6.1 Expiry Warning

Already implemented in **Phase 2.6** - `ExpiryWarning` component shows when 2 days or less remain.

### 6.2 Auto-Cleanup on Expiry

Already implemented in **Phase 3.2** - `ProtectedRoute` checks for expiry and clears demo data before redirecting.

### 6.3 Manual Cleanup on Logout

No action needed - demo mode only exists when not authenticated. Logout clears all state.

---

## Testing Plan

### Unit Tests

**New File:** `src/services/demoMode.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { demoModeService } from './demoMode';

describe('DemoModeService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initializeDemoMode', () => {
    it('should initialize demo metrics with default values', () => {
      demoModeService.initializeDemoMode();
      const metrics = demoModeService.getDemoMetrics();

      expect(metrics).not.toBeNull();
      expect(metrics?.demo_habits_added).toBe(0);
      expect(metrics?.demo_logs_completed).toBe(0);
      expect(metrics?.demo_progress_visits).toBe(0);
      expect(metrics?.demo_conversion_shown).toBe(false);
    });
  });

  describe('trackHabitAdded', () => {
    it('should increment habits counter', () => {
      demoModeService.initializeDemoMode();
      demoModeService.trackHabitAdded();

      const metrics = demoModeService.getDemoMetrics();
      expect(metrics?.demo_habits_added).toBe(1);
    });
  });

  describe('shouldShowConversionModal', () => {
    it('should return habits_threshold after 3 habits', () => {
      demoModeService.initializeDemoMode();
      demoModeService.trackHabitAdded();
      demoModeService.trackHabitAdded();
      demoModeService.trackHabitAdded();

      const trigger = demoModeService.shouldShowConversionModal();
      expect(trigger).toBe('habits_threshold');
    });

    it('should return null after modal is shown', () => {
      demoModeService.initializeDemoMode();
      demoModeService.trackHabitAdded();
      demoModeService.trackHabitAdded();
      demoModeService.trackHabitAdded();
      demoModeService.markConversionShown();

      const trigger = demoModeService.shouldShowConversionModal();
      expect(trigger).toBeNull();
    });
  });

  describe('getDaysInDemo', () => {
    it('should return 0 on first day', () => {
      demoModeService.initializeDemoMode();
      expect(demoModeService.getDaysInDemo()).toBe(0);
    });

    it('should return correct days after time passes', () => {
      demoModeService.initializeDemoMode();

      // Manually set start date to 3 days ago
      const metrics = demoModeService.getDemoMetrics();
      if (metrics) {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        metrics.demo_start_date = threeDaysAgo.toISOString();
        localStorage.setItem('habitTracker_demoMetrics', JSON.stringify(metrics));
      }

      expect(demoModeService.getDaysInDemo()).toBe(3);
    });
  });

  describe('shouldExpireDemo', () => {
    it('should return true after 7 days', () => {
      demoModeService.initializeDemoMode();

      // Set start date to 7 days ago
      const metrics = demoModeService.getDemoMetrics();
      if (metrics) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        metrics.demo_start_date = sevenDaysAgo.toISOString();
        localStorage.setItem('habitTracker_demoMetrics', JSON.stringify(metrics));
      }

      expect(demoModeService.shouldExpireDemo()).toBe(true);
    });
  });

  describe('getMilestoneMessage', () => {
    it('should return first_habit message on first habit', () => {
      demoModeService.initializeDemoMode();
      demoModeService.trackHabitAdded();

      const message = demoModeService.getMilestoneMessage();
      expect(message).toContain('Great start');
    });

    it('should not repeat milestone messages', () => {
      demoModeService.initializeDemoMode();
      demoModeService.trackHabitAdded();

      demoModeService.getMilestoneMessage(); // First call
      const secondCall = demoModeService.getMilestoneMessage(); // Second call

      expect(secondCall).toBeNull();
    });
  });
});
```

### Integration Tests (Playwright)

**New File:** `e2e/demo-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Demo Mode Onboarding Flow', () => {
  test('should allow user to try app without signing in', async ({ page }) => {
    // Go to welcome page
    await page.goto('/');

    // Click "Try Without Signing In"
    await page.click('text=Try Without Signing In');

    // Should redirect to daily log page
    await expect(page).toHaveURL('/daily-log');

    // Should show demo banner
    await expect(page.locator('.demo-banner')).toBeVisible();
  });

  test('should show conversion modal after adding 3 habits', async ({ page }) => {
    // Initialize demo mode
    await page.goto('/');
    await page.click('text=Try Without Signing In');

    // Navigate to manage habits
    await page.goto('/manage-habits');

    // Add 3 habits
    for (let i = 1; i <= 3; i++) {
      await page.click('text=Add Habit');
      await page.fill('input[name="habitName"]', `Habit ${i}`);
      await page.click('text=Save');
      await page.waitForTimeout(500);
    }

    // Conversion modal should appear
    await expect(page.locator('.conversion-modal')).toBeVisible();
    await expect(page.locator('.conversion-modal')).toContainText('building momentum');
  });

  test('should show milestone toast after first habit', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Without Signing In');
    await page.goto('/manage-habits');

    await page.click('text=Add Habit');
    await page.fill('input[name="habitName"]', 'Test Habit');
    await page.click('text=Save');

    // Toast should appear
    await expect(page.locator('.toast')).toBeVisible();
    await expect(page.locator('.toast')).toContainText('Great start');
  });

  test('should show locked progress preview in demo mode', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Try Without Signing In');
    await page.goto('/progress');

    // Locked preview should be visible
    await expect(page.locator('.locked-progress')).toBeVisible();
    await expect(page.locator('text=Unlock Your Progress Analytics')).toBeVisible();
  });

  test('should show expiry warning on day 6', async ({ page }) => {
    // Initialize demo mode with start date 6 days ago
    await page.goto('/');
    await page.evaluate(() => {
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
      const metrics = {
        demo_start_date: sixDaysAgo.toISOString(),
        demo_habits_added: 0,
        demo_logs_completed: 0,
        demo_last_visit: new Date().toISOString(),
        demo_progress_visits: 0,
        demo_conversion_shown: false,
      };
      localStorage.setItem('habitTracker_demoMetrics', JSON.stringify(metrics));
    });

    await page.goto('/daily-log');

    // Expiry warning should be visible
    await expect(page.locator('.expiry-warning')).toBeVisible();
    await expect(page.locator('.expiry-warning')).toContainText('1 day');
  });
});
```

**New File:** `e2e/migration.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Demo Data Migration', () => {
  test('should migrate demo data on sign up', async ({ page }) => {
    // Initialize demo mode and add data
    await page.goto('/');
    await page.click('text=Try Without Signing In');

    // Add a habit
    await page.goto('/manage-habits');
    await page.click('text=Add Habit');
    await page.fill('input[name="habitName"]', 'Test Migration Habit');
    await page.click('text=Save');

    // Sign up
    await page.goto('/');
    await page.click('text=Sign In with Email');
    await page.click('text=Don\'t have an account');
    await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button:has-text("Create Account")');

    // Should show migration success toast
    await expect(page.locator('.migration-toast')).toBeVisible();

    // Verify habit exists
    await page.goto('/manage-habits');
    await expect(page.locator('text=Test Migration Habit')).toBeVisible();
  });

  test('should clear demo banner after migration', async ({ page }) => {
    // Create demo data
    await page.goto('/');
    await page.click('text=Try Without Signing In');

    // Verify demo banner exists
    await expect(page.locator('.demo-banner')).toBeVisible();

    // Sign in (assume test user exists)
    await page.goto('/');
    await page.click('text=Sign In with Email');
    await page.fill('input[type="email"]', 'existing@example.com');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button:has-text("Sign In")');

    // Demo banner should be gone
    await expect(page.locator('.demo-banner')).not.toBeVisible();
  });
});
```

### Manual Testing Checklist

- [ ] Demo banner shows on all protected routes in demo mode
- [ ] Demo banner disappears after sign in
- [ ] Conversion modal appears after 3 habits added
- [ ] Conversion modal appears after first log completed
- [ ] Conversion modal appears when visiting progress page
- [ ] Conversion modal only shows once per trigger
- [ ] Milestone toasts appear after key actions
- [ ] Milestone toasts don't repeat
- [ ] Progress page shows locked preview in demo mode
- [ ] Locked preview shows correct messaging
- [ ] Expiry warning shows on day 5
- [ ] Expiry warning shows on day 6
- [ ] Demo data expires and clears after 7 days
- [ ] Demo data migrates successfully on sign up
- [ ] Demo data migrates successfully on sign in
- [ ] Migration success toast appears after sign up/in
- [ ] All demo habits appear in authenticated account
- [ ] All demo logs appear in authenticated account
- [ ] Sync to Supabase succeeds after migration
- [ ] No errors in console during demo mode
- [ ] Offline mode works in demo mode
- [ ] Touch targets meet 44x44px minimum on mobile
- [ ] All text is readable on mobile screens
- [ ] Conversion modal is responsive on mobile
- [ ] Demo banner is responsive on mobile

---

## Implementation Timeline

### Sprint 1: Core Infrastructure (3-4 days)

**Day 1-2: Demo Mode Service**
- Create `demoMode.ts` service
- Implement metric tracking
- Implement conversion trigger logic
- Implement milestone detection
- Write unit tests for demoMode service

**Day 3: Auth & Route Updates**
- Update `ProtectedRoute.tsx` to allow demo mode
- Update `auth.ts` to trigger migration
- Test demo mode initialization

**Day 4: Integration Testing**
- Test demo metrics tracking
- Test expiry logic
- Test migration trigger
- Fix any bugs found

### Sprint 2: UI Components (3-4 days)

**Day 5: Banner & Warning Components**
- Create `DemoBanner` component + CSS
- Create `ExpiryWarning` component + CSS
- Test on mobile and desktop

**Day 6: Modal Components**
- Create `ConversionModal` component + CSS
- Create different messaging per trigger
- Test modal interactions

**Day 7: Progress & Toast Components**
- Create `LockedProgressPreview` component + CSS
- Create `Toast` component + CSS
- Create `MigrationToast` component + CSS

**Day 8: CSS Polish**
- Mobile responsiveness testing
- Touch target verification (44x44px min)
- Accessibility testing (keyboard nav, screen readers)
- Cross-browser testing

### Sprint 3: Page Integration (3-4 days)

**Day 9: Welcome Page Updates**
- Add progressive journey section
- Add "Try Without Signing In" button
- Make email form collapsible
- Update CSS for new layout

**Day 10: Layout Updates**
- Update `Layout.tsx` to show demo banners
- Test banner stacking (offline + expiry + demo)
- Verify z-index hierarchy

**Day 11: Habit & Log Pages**
- Update `ManageHabitsPage` with tracking
- Update `DailyLogPage` with tracking
- Add conversion modal triggers
- Add milestone toast triggers

**Day 12: Progress Page**
- Update `ProgressPage` with locked preview
- Add progress visit tracking
- Add conversion modal trigger
- Test locked state UI

### Sprint 4: Migration & Milestones (2-3 days)

**Day 13: Migration Flow**
- Test full migration flow end-to-end
- Verify data appears in Supabase
- Verify data appears in authenticated UI
- Test migration error handling

**Day 14: Milestone System**
- Test all 4 milestone triggers
- Verify milestones don't repeat
- Test milestone toast UI
- Verify timing of milestone messages

**Day 15: Edge Cases**
- Test migration with large datasets
- Test migration with offline queue
- Test expiry edge cases
- Test concurrent user sessions

### Sprint 5: Polish & Testing (3-4 days)

**Day 16: E2E Tests**
- Write `demo-flow.spec.ts` tests
- Write `migration.spec.ts` tests
- Run all E2E tests across browsers

**Day 17: Manual Testing**
- Complete manual testing checklist
- Test on real mobile devices
- Test on different screen sizes
- Test offline scenarios

**Day 18: Bug Fixes**
- Fix issues found in testing
- Refinement of UI/UX details
- Performance optimization

**Day 19: Final QA**
- Final regression testing
- Documentation updates
- Prepare for deployment

---

## Success Metrics

Track these metrics post-launch to measure feature success:

### Primary Metrics

1. **Demo Adoption Rate**
   - % of welcome page visitors who click "Try Without Signing In"
   - **Target:** 60%+ (higher than signup button initially)

2. **Demo → Signup Conversion Rate**
   - % of demo users who eventually create accounts
   - **Target:** 20-30% (industry standard for freemium trial-to-paid)

3. **Time to Conversion**
   - Median time from demo start to signup
   - **Target:** 1-3 days (aligns with habit formation psychology)

4. **Migration Success Rate**
   - % of signups where demo data migrates without errors
   - **Target:** 99%+ (critical for user trust)

### Engagement Metrics

5. **Demo Engagement Depth**
   - % of demo users who add 3+ habits
   - **Target:** 60%+ (indicates product-market fit)

6. **Demo Retention**
   - **D1 retention:** % returning next day
   - **D3 retention:** % returning after 3 days
   - **D7 retention:** % returning after 7 days
   - **Targets:** D1: 40%, D3: 25%, D7: 15%

7. **Conversion Trigger Effectiveness**
   - Which trigger leads to most conversions?
   - **Hypothesis:** "first_log" will convert best (emotional investment)

8. **Milestone Engagement**
   - % of demo users who see milestone toasts
   - % who continue using after milestone
   - **Target:** 70%+ engagement with milestones

### UX Metrics

9. **Modal Abandonment Rate**
   - % who close conversion modal and continue demo
   - **Target:** <70% (some friction is expected)

10. **Expiry-Driven Conversions**
    - % who sign up in last 2 days before expiry
    - **Hypothesis:** 10-15% of total conversions

### Technical Metrics

11. **Migration Errors**
    - Number of migration failures
    - Types of errors encountered
    - **Target:** <1% error rate

12. **Demo Data Size**
    - Average habits per demo user
    - Average logs per demo user
    - Monitor for quota issues

---

## Risk Mitigation

### Risk 1: Demo Data Not Migrating

**Impact:** HIGH - Users lose data, destroy trust
**Probability:** LOW - Existing sync logic is proven

**Mitigation Strategies:**
1. Add extensive logging to migration flow
2. Show migration progress indicator during sync
3. Provide manual "Re-sync" button if auto-migration fails
4. Store migration status in sessionStorage to prevent retries
5. Test migration with large datasets (100+ habits/logs)

**Recovery Plan:**
- If migration fails silently, add banner with "Retry Sync" button
- Implement migration health check on first authenticated page load
- Log all migration attempts to analytics for debugging

### Risk 2: Users Confused About Demo vs. Authenticated State

**Impact:** MEDIUM - Reduced conversion, support burden
**Probability:** MEDIUM - State confusion is common in freemium apps

**Mitigation Strategies:**
1. Make demo banner very prominent (colorful, sticky, top of page)
2. Add "🔒 Demo Mode" label in navigation bar
3. Use consistent messaging ("Sign in to save" vs. "Sign in to unlock")
4. Clear explanation in conversion modal about data preservation
5. Show migration success toast prominently after signup

**Recovery Plan:**
- Add "Am I signed in?" FAQ to help page
- A/B test different banner designs for clarity
- Collect user feedback on confusion points

### Risk 3: Demo Data Expires Before User Returns

**Impact:** MEDIUM - Lost users who were engaged
**Probability:** MEDIUM - D7 retention in habit apps is ~15%

**Mitigation Strategies:**
1. 7-day expiry is generous (most apps use 3-5 days)
2. Start showing expiry warning on day 5 (2 days notice)
3. Make expiry warning urgent (⚠️ icon, pulsing animation)
4. Consider email reminder on day 6 (future enhancement)

**Recovery Plan:**
- Track expiry abandonment rates
- If high (>50%), increase expiry to 10 days
- Add "Export demo data" option before expiry

### Risk 4: IndexedDB Quota Exceeded

**Impact:** LOW - App breaks for power users
**Probability:** VERY LOW - Habit data is tiny (~1-5KB per user)

**Mitigation Strategies:**
1. Monitor storage usage (IndexedDB has 50MB+ on most browsers)
2. Set limits: max 100 habits, max 1000 logs in demo mode
3. Show warning if approaching quota: "Sign in to unlock unlimited storage"

**Recovery Plan:**
- Implement storage cleanup (delete oldest logs first)
- Graceful degradation: disable new habits when quota reached

### Risk 5: Conversion Modal Shown Too Aggressively

**Impact:** MEDIUM - User annoyance, abandonment
**Probability:** MEDIUM - Aggressive modals are a common UX mistake

**Mitigation Strategies:**
1. Only show modal ONCE per session (tracked via `demo_conversion_shown`)
2. Don't show on first action (wait for 3 habits or 1 log)
3. Easy to dismiss (big X button, click outside to close)
4. "Continue in Demo Mode" option clearly visible

**Recovery Plan:**
- A/B test different trigger thresholds (2 habits vs. 3 habits)
- Track modal dismissal rates
- If >80% dismiss, reduce frequency

### Risk 6: Poor Mobile Experience

**Impact:** HIGH - 70%+ users are mobile-first
**Probability:** LOW - Mobile-first design from start

**Mitigation Strategies:**
1. Test all components on real devices (iOS, Android)
2. Ensure 44x44px minimum touch targets
3. Responsive layouts for all screen sizes (320px+)
4. Avoid text wrapping issues in banners
5. Test with slow 3G connections

**Recovery Plan:**
- Monitor mobile conversion rates separately
- If significantly lower, prioritize mobile UX improvements
- Consider mobile-specific messaging

### Risk 7: Sync Conflicts During Migration

**Impact:** MEDIUM - Duplicate or missing data
**Probability:** LOW - Last-write-wins strategy is robust

**Mitigation Strategies:**
1. Use existing `syncService.fullSync()` (proven conflict resolution)
2. Migration happens immediately after auth (no race conditions)
3. Test with multiple devices simultaneously
4. Add conflict resolution logs for debugging

**Recovery Plan:**
- If conflicts detected, show "Data sync issue" banner with retry
- Implement manual conflict resolution UI (future enhancement)
- Provide customer support channel for data recovery

---

## Future Enhancements (Post-MVP)

Once core demo flow is working and metrics are validated, consider these enhancements:

### Phase 2 Features

1. **Smart Conversion Timing (ML-Based)**
   - Use ML to predict optimal conversion moment per user
   - Track: time of day, day of week, action sequence
   - Personalize trigger thresholds dynamically

2. **Demo Data Export**
   - Let users export demo data as JSON before expiry
   - Builds trust ("your data, your control")
   - Reduces anxiety about losing progress

3. **Social Proof in Conversion Modal**
   - Show "Join 10,000+ habit trackers" messaging
   - Display recent anonymous sign-ups
   - Add testimonials or success stories

4. **Progressive Onboarding Checklist**
   - Gamify first 3 actions in demo mode
   - Progress bar: "2/3 steps to unlock streaks"
   - Visual momentum toward unlock moment

5. **Email Capture Before Demo**
   - Optional: collect email before demo mode starts
   - Send reminder emails on day 3 & day 6
   - Requires email service integration (SendGrid, etc.)

6. **Referral Program for Demo Users**
   - "Invite a friend to extend your demo by 3 days"
   - Viral growth mechanism
   - Requires referral tracking system

### Technical Enhancements

7. **Real-time Sync for Demo Users**
   - Use Supabase Realtime for demo data
   - Sync across tabs/devices without signup
   - Requires anonymous user sessions

8. **Demo Data Analytics Dashboard**
   - Internal tool to track demo metrics
   - Funnel analysis: entry → engagement → conversion
   - Identify drop-off points

9. **A/B Testing Framework**
   - Test different trigger thresholds
   - Test different modal designs
   - Test different messaging

10. **Demo Mode Tour**
    - Optional guided tour for first-time users
    - Highlights key features with tooltips
    - Skippable, non-intrusive

### Conversion Optimization

11. **Urgency Tactics**
    - "2 other users signed up in the last hour"
    - Limited-time feature unlocks
    - Countdown timer in expiry warning

12. **Personalized Conversion Messages**
    - Different messaging based on habit categories
    - E.g., "Fitness trackers see 30% better results with streak tracking"

13. **Incentivized Conversion**
    - "Sign up now and unlock premium analytics free for 30 days"
    - Requires premium tier implementation

---

## Files Summary

### New Files Created (12 total)

**Services (1):**
1. `src/services/demoMode.ts` - Core demo mode service with metrics tracking

**Components (11):**
2. `src/components/DemoBanner.tsx` - Persistent demo mode banner
3. `src/components/DemoBanner.css`
4. `src/components/ConversionModal.tsx` - Signup prompt modal
5. `src/components/ConversionModal.css`
6. `src/components/LockedProgressPreview.tsx` - Locked features preview
7. `src/components/LockedProgressPreview.css`
8. `src/components/Toast.tsx` - Milestone celebrations
9. `src/components/Toast.css`
10. `src/components/MigrationToast.tsx` - Migration success message
11. `src/components/MigrationToast.css`
12. `src/components/ExpiryWarning.tsx` - Expiry countdown banner
13. `src/components/ExpiryWarning.css`

### Modified Files (8 total)

**Components (2):**
1. `src/components/Layout.tsx` - Add demo banner + expiry warning
2. `src/components/ProtectedRoute.tsx` - Allow demo mode access

**Pages (4):**
3. `src/pages/WelcomePage.tsx` - Add progressive journey + demo CTA
4. `src/pages/WelcomePage.css` - New styling for journey section
5. `src/pages/ManageHabitsPage.tsx` - Track demo metrics + conversion triggers
6. `src/pages/DailyLogPage.tsx` - Track demo metrics + milestones + conversion triggers
7. `src/pages/ProgressPage.tsx` - Show locked preview in demo mode

**Services (1):**
8. `src/services/auth.ts` - Trigger migration on signup/login

### Test Files (3 new)

1. `src/services/demoMode.test.ts` - Unit tests for demo service (~200 lines)
2. `e2e/demo-flow.spec.ts` - E2E test for demo → conversion flow (~150 lines)
3. `e2e/migration.spec.ts` - E2E test for data migration (~100 lines)

---

**Total Lines of Code (estimated):**
- Services: ~350 lines
- Components: ~800 lines (TS + CSS)
- Page updates: ~300 lines
- Tests: ~450 lines
- **Grand Total: ~1,900 lines of code**

---

## Key Architectural Insights

### Why This Implementation Is Elegant

1. **Leverages Existing Infrastructure**
   - Demo data uses IndexedDB (already exists)
   - Migration uses `syncService.fullSync()` (already exists)
   - No parallel data systems to maintain

2. **Progressive Enhancement**
   - Demo mode = "authenticated mode without user_id"
   - All existing components work with minor modifications
   - No new data models or schemas needed

3. **Conversion Psychology**
   - Triggers aligned with emotional investment (3 habits, first log)
   - Not arbitrary time limits
   - Milestones create positive reinforcement

4. **Mobile-First**
   - All components designed for 320px+ screens
   - Touch targets meet accessibility standards
   - Progressive disclosure (collapsible email form)

5. **Future-Proof**
   - Metrics tracking allows data-driven optimization
   - Easy to add new triggers or milestones
   - A/B testing ready

---

## Conclusion

This implementation plan provides a comprehensive roadmap for adding a shadow account onboarding flow to the Habit Tracker app. The approach is:

- **Minimal:** Only ~1,900 lines of new code, leveraging existing architecture
- **User-Friendly:** Removes signup friction while building emotional investment
- **Conversion-Optimized:** Multiple triggers aligned with value realization
- **Mobile-First:** All components designed for mobile users
- **Future-Proof:** Metrics tracking and extensibility built in

**Estimated Timeline:** 14-19 days (2.5-4 weeks) for one developer

**Next Steps:**
1. Get stakeholder approval
2. Set up analytics tracking
3. Begin Sprint 1 (Core Infrastructure)
4. Ship MVP and monitor metrics
5. Iterate based on conversion data

---

*Last Updated: 2025-10-19*
*Document Version: 1.0*
