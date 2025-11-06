/**
 * Empty State Component
 * Task 2.3 - Updated with Lucide icons for warm, professional look
 *
 * Reusable component for displaying empty states with customizable message and call-to-action.
 * Tasks 7.28-7.29: Support different messages and CTAs for various contexts
 */

import { Link } from 'react-router-dom';
import { Sunrise, TrendingUp, Calendar, LucideIcon } from 'lucide-react';
import './EmptyState.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  /** Icon name (Sunrise, TrendingUp, Calendar) or emoji fallback */
  iconName?: 'Sunrise' | 'TrendingUp' | 'Calendar';
  /** @deprecated Use iconName instead */
  icon?: string;
}

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Sunrise,
  TrendingUp,
  Calendar,
};

// Map icon names to emoji fallbacks
const iconFallbackMap: Record<string, string> = {
  Sunrise: '🌅',
  TrendingUp: '📈',
  Calendar: '📅',
};

export const EmptyState = ({
  title,
  message,
  actionText,
  actionLink,
  onAction,
  iconName,
  icon = '📋',
}: EmptyStateProps): JSX.Element => {
  // Determine which icon to render
  let IconComponent: LucideIcon | null = null;
  let fallbackIcon = icon;

  if (iconName && iconMap[iconName]) {
    IconComponent = iconMap[iconName];
    fallbackIcon = iconFallbackMap[iconName] || icon;
  }

  return (
    <div className="empty-state">
      <div className="empty-state-icon-wrapper" aria-hidden="true">
        {IconComponent ? (
          <div className="empty-state-icon-background">
            <IconComponent
              className="empty-state-icon-lucide"
              size={80}
              strokeWidth={1.5}
            />
          </div>
        ) : (
          <div className="empty-state-icon-emoji">
            {fallbackIcon}
          </div>
        )}
      </div>

      {title && (
        <h3 className="empty-state-title">
          {title}
        </h3>
      )}

      {message && (
        <p className="empty-state-message">
          {message}
        </p>
      )}

      {/* Task 7.29: Support different call-to-action buttons for various contexts */}
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="empty-state-button btn-primary"
        >
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="empty-state-button btn-primary"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
