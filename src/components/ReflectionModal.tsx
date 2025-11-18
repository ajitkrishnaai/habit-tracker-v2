/**
 * ReflectionModal Component
 *
 * Full-screen modal that prompts users to reflect on their habit changes.
 * Shows what habits were changed and provides a space for emotional reflection.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PendingChange } from '../pages/DailyLogPage';
import './ReflectionModal.css';

interface ReflectionModalProps {
  pendingChanges: Map<string, PendingChange>;
  onSave: (notes?: string) => void;
  onSkip: () => void;
  aiReflection?: string | null;
  isGeneratingReflection?: boolean;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  pendingChanges,
  onSave,
  onSkip,
  aiReflection,
  isGeneratingReflection,
}) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<string>('');
  const [hasSaved, setHasSaved] = useState<boolean>(false);
  const maxLength = 5000;

  const handleSave = async () => {
    setHasSaved(true);

    // Save the changes
    await onSave(notes.trim() || undefined);

    // Parent component will generate AI reflection
    // Navigation happens automatically when reflection is ready (see useEffect below)
  };

  const handleSkip = () => {
    onSkip();
    // Navigate immediately without reflection
    navigate('/progress', {
      state: { aiReflection: null }
    });
  };

  // Auto-navigate to progress page when AI reflection is ready
  React.useEffect(() => {
    if (aiReflection && !isGeneratingReflection && hasSaved) {
      // Brief delay to show the user that reflection is complete
      const timer = setTimeout(() => {
        navigate('/progress', {
          state: { aiReflection }
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [aiReflection, isGeneratingReflection, hasSaved, navigate]);

  // Convert pending changes to array for rendering
  const changes = Array.from(pendingChanges.values());

  return (
    <div className="reflection-modal-overlay" onClick={handleSkip}>
      <div className="reflection-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="reflection-modal__header">
          <p className="reflection-modal__saved-indicator">Changes saved.</p>
          <h2 className="reflection-modal__title">How did that feel?</h2>
        </div>

        {/* Changes Summary */}
        <div className="reflection-modal__changes">
          {/* Group habits by status */}
          {(() => {
            const doneHabits = changes.filter((c) => c.newStatus === 'done');
            const notDoneHabits = changes.filter((c) => c.newStatus === 'not_done');

            return (
              <>
                {doneHabits.length > 0 && (
                  <div className="reflection-modal__habit-group">
                    <svg className="reflection-modal__icon reflection-modal__icon--done" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="reflection-modal__habit-list">
                      {doneHabits.map((h) => h.habitName).join(', ')}
                    </span>
                  </div>
                )}
                {notDoneHabits.length > 0 && (
                  <div className="reflection-modal__habit-group">
                    <svg className="reflection-modal__icon reflection-modal__icon--not-done" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="reflection-modal__habit-list">
                      {notDoneHabits.map((h) => h.habitName).join(', ')}
                    </span>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* Notes Input */}
        <div className="reflection-modal__notes">
          <div className="reflection-modal__notes-header">
            <label htmlFor="reflection-notes" className="reflection-modal__notes-label">
              Your reflection
            </label>
            <span className="reflection-modal__notes-counter">
              {notes.length} / {maxLength}
            </span>
          </div>
          <textarea
            id="reflection-notes"
            className="reflection-modal__notes-textarea"
            placeholder="I'm feeling… because…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={maxLength}
            rows={6}
            aria-label="Reflection notes"
            autoFocus
          />
        </div>

        {/* Loading States & Actions */}
        {hasSaved || isGeneratingReflection ? (
          <div className="reflection-modal__loading">
            <span className="reflection-modal__spinner animate-spin" aria-hidden="true" />
            <p>{isGeneratingReflection ? 'Amara is reflecting on your day...' : 'Saving...'}</p>
          </div>
        ) : (
          <div className="reflection-modal__actions">
            <button
              type="button"
              className="reflection-modal__btn reflection-modal__btn--primary"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="reflection-modal__btn reflection-modal__btn--secondary"
              onClick={handleSkip}
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
