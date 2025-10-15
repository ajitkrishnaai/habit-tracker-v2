/**
 * Empty State Component
 *
 * Reusable component for displaying empty states with customizable message and call-to-action.
 * Tasks 7.28-7.29: Support different messages and CTAs for various contexts
 */

import { Link } from 'react-router-dom';
import './EmptyState.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  actionLink?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyState = ({
  title,
  message,
  actionText,
  actionLink,
  onAction,
  icon = '📋',
}: EmptyStateProps): JSX.Element => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
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
          className="empty-state-button"
        >
          {actionText}
        </Link>
      )}

      {actionText && onAction && !actionLink && (
        <button
          onClick={onAction}
          className="empty-state-button"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
