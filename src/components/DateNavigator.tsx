/**
 * DateNavigator Component
 *
 * Allows users to navigate between dates for logging habits.
 * Features:
 * - Navigate to previous day (up to 5 days in past)
 * - Jump back to today
 * - Clear display of current date
 * - Disables previous button when at 5-day limit
 */

import {
  formatDateDisplay,
  getPreviousDate,
  getNextDate,
  getTodayAtMidnight,
  canNavigateToPreviousDay,
  isTodayDate,
} from '../utils/dateHelpers';
import './DateNavigator.css';

interface DateNavigatorProps {
  /** Currently selected date */
  currentDate: Date;
  /** Callback when date changes */
  onDateChange: (date: Date) => void;
  /** Whether date navigation is disabled (e.g., during loading) */
  disabled?: boolean;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  currentDate,
  onDateChange,
  disabled = false,
}) => {
  const isCurrentDateToday = isTodayDate(currentDate);
  const canGoToPreviousDay = canNavigateToPreviousDay(currentDate);

  const handlePreviousDay = () => {
    if (!canGoToPreviousDay || disabled) return;
    const previousDay = getPreviousDate(currentDate);
    onDateChange(previousDay);
  };

  const handleNextDay = () => {
    if (isCurrentDateToday || disabled) return;
    const nextDay = getNextDate(currentDate);
    // Don't go beyond today
    const today = getTodayAtMidnight();
    if (nextDay > today) return;
    onDateChange(nextDay);
  };

  return (
    <div className="date-navigator">
      <button
        type="button"
        className="date-navigator__btn date-navigator__btn--prev"
        onClick={handlePreviousDay}
        disabled={!canGoToPreviousDay || disabled}
        aria-label="Go to previous day"
      >
        <svg
          className="date-navigator__icon"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12.5 5L7.5 10L12.5 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="date-navigator__btn-text">Previous</span>
      </button>

      <div className="date-navigator__current">
        <span className="date-navigator__date">{formatDateDisplay(currentDate)}</span>
      </div>

      {/* Show "Next" button when not viewing today, or invisible placeholder to maintain spacing */}
      {!isCurrentDateToday ? (
        <button
          type="button"
          className="date-navigator__btn date-navigator__btn--next"
          onClick={handleNextDay}
          disabled={disabled}
          aria-label="Go to next day"
        >
          <svg
            className="date-navigator__icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M7.5 5L12.5 10L7.5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="date-navigator__btn-text">Next</span>
        </button>
      ) : (
        <div className="date-navigator__btn date-navigator__btn--placeholder" aria-hidden="true" />
      )}
    </div>
  );
};
