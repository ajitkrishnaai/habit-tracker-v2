/**
 * Empty State Component
 *
 * Reusable component for displaying empty states with customizable message and call-to-action.
 */

interface EmptyStateProps {
  title: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title,
  message,
  actionText,
  onAction,
}: EmptyStateProps): JSX.Element => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '3rem 1rem',
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem',
      }}>
        📋
      </div>

      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '0.5rem',
      }}>
        {title}
      </h3>

      {message && (
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          marginBottom: actionText ? '1.5rem' : '0',
        }}>
          {message}
        </p>
      )}

      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            backgroundColor: '#2563eb',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1d4ed8';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
