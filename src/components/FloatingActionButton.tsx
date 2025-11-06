/**
 * Floating Action Button Component
 * Task 1.20 - FAB for "Add Habit" action on Manage Habits Page
 *
 * Design:
 * - Circular button with warm gradient background
 * - Fixed positioning at bottom-right corner
 * - Rotation and scale animation on hover
 * - Plus icon centered inside
 */

import './FloatingActionButton.css';

interface FloatingActionButtonProps {
  onClick: () => void;
  'aria-label'?: string;
}

export const FloatingActionButton = ({
  onClick,
  'aria-label': ariaLabel = 'Add new habit'
}: FloatingActionButtonProps): JSX.Element => {
  return (
    <button
      className="fab"
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
    >
      <svg
        className="fab__icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
};
