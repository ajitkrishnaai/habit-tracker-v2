import React from 'react';
import './AppHeader.css';

interface AppHeaderProps {
  /**
   * Visual variant of the header
   * - 'hero': Large, prominent header for landing/welcome pages
   * - 'compact': Smaller header for app pages (default)
   */
  variant?: 'hero' | 'compact';

  /**
   * Optional className for additional styling
   */
  className?: string;
}

/**
 * AppHeader Component
 *
 * Displays the "AMARA DAY" branding with "Daily Eternal" tagline
 * consistently across all pages.
 *
 * Design System:
 * - Primary text: "AMARA DAY" in uppercase, DM Sans, moss-700
 * - Tagline: "Daily Eternal" in uppercase, lighter weight, stone-600
 * - Responsive sizing using clamp()
 *
 * Variants:
 * - hero: Large hero header for WelcomePage (with animation support)
 * - compact: Smaller header for authenticated pages (top of Layout)
 *
 * Usage:
 * ```tsx
 * // Hero variant (WelcomePage)
 * <AppHeader variant="hero" />
 *
 * // Compact variant (Daily Log, Progress, Manage Habits)
 * <AppHeader variant="compact" />
 * ```
 *
 * See: CLAUDE.md Design System documentation
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const isHero = variant === 'hero';

  return (
    <header
      className={`app-header ${isHero ? 'app-header--hero' : 'app-header--compact'} ${className}`}
      role="banner"
    >
      <div className="app-header-brand">
        <h1 className="app-header-logo">AMARA DAY</h1>
        <p className="app-header-tagline">Daily Eternal</p>
      </div>
    </header>
  );
};

export default AppHeader;
