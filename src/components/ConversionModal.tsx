import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ConversionModal.css';

/**
 * ConversionModal Component
 *
 * Displays a conversion prompt when demo users hit engagement milestones.
 * Shows context-specific messaging based on the trigger type.
 *
 * Trigger Types:
 * - habits_threshold: User added 3+ habits
 * - first_log: User completed their first daily log
 * - progress_page: User visited the Progress page
 *
 * Features:
 * - Dismissible via X button, overlay click, or secondary CTA
 * - Accessible with ARIA labels and keyboard navigation
 * - Mobile-responsive with stacked buttons on small screens
 */

interface ConversionModalProps {
  trigger: 'habits_threshold' | 'first_log' | 'progress_page';
  onClose: () => void;
}

export const ConversionModal: React.FC<ConversionModalProps> = ({ trigger, onClose }) => {
  const navigate = useNavigate();

  /**
   * Get title and message based on trigger type (REQ-20 to REQ-22)
   */
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

  const handleSignInClick = () => {
    navigate('/');
    onClose();
  };

  const handleContinueDemo = () => {
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking the overlay itself, not the modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="conversion-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="conversion-modal-title"
      aria-describedby="conversion-modal-message"
    >
      <div className="conversion-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="conversion-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Title */}
        <h2 id="conversion-modal-title" className="conversion-modal-title">
          {title}
        </h2>

        {/* Message */}
        <p id="conversion-modal-message" className="conversion-modal-message">
          {message}
        </p>

        {/* Benefits list (REQ-26) */}
        <div className="conversion-modal-benefits">
          <p className="conversion-modal-benefits-title">With a free account:</p>
          <ul className="conversion-modal-benefits-list">
            <li>✓ Cloud sync across all devices</li>
            <li>✓ Never lose your progress</li>
            <li>✓ Unlock advanced analytics</li>
            <li>✓ Track unlimited habits & notes</li>
          </ul>
        </div>

        {/* Primary CTA */}
        <button
          className="btn-primary conversion-modal-button-primary"
          onClick={handleSignInClick}
        >
          Sign In to Save Progress
        </button>

        {/* Secondary CTA */}
        <button
          className="btn-secondary conversion-modal-button-secondary"
          onClick={handleContinueDemo}
        >
          Continue in Demo Mode
        </button>

        {/* Reassurance note (REQ-27) */}
        <p className="conversion-modal-reassurance">
          Your demo data will be automatically saved when you sign in.
        </p>
      </div>
    </div>
  );
};
