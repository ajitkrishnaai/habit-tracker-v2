/**
 * ToggleSwitch Component
 *
 * An accessible toggle switch for marking habits as done/not done.
 * Features:
 * - Large touch target (44x44px minimum)
 * - Keyboard accessible (tab, space, enter)
 * - Screen reader support with ARIA labels
 * - Smooth animations
 * - Clear on/off visual states
 */

import { useState, useEffect } from 'react';
import './ToggleSwitch.css';

interface ToggleSwitchProps {
  /** Unique identifier for the toggle */
  id: string;
  /** Label for the toggle (for screen readers) */
  label: string;
  /** Whether the toggle is checked (on) */
  checked: boolean;
  /** Callback when toggle state changes */
  onChange: (checked: boolean) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  label,
  checked,
  onChange,
  disabled = false,
}) => {
  // Local state for optimistic UI
  const [localChecked, setLocalChecked] = useState(checked);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalChecked(checked);
  }, [checked]);

  const handleChange = () => {
    if (disabled) return;

    const newChecked = !localChecked;
    setLocalChecked(newChecked); // Optimistic update
    onChange(newChecked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Support space and enter keys
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleChange();
    }
  };

  return (
    <div className="toggle-switch-wrapper">
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={localChecked}
        aria-label={label}
        className={`toggle-switch ${localChecked ? 'toggle-switch--on' : 'toggle-switch--off'} ${
          disabled ? 'toggle-switch--disabled' : ''
        }`}
        onClick={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        tabIndex={0}
      >
        <span className="toggle-switch__slider" aria-hidden="true">
          <span className="toggle-switch__thumb" />
        </span>
        <span className="sr-only">
          {localChecked ? `${label} is done` : `${label} is not done`}
        </span>
      </button>
    </div>
  );
};
