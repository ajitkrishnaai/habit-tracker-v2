/**
 * ReflectionModal Component
 *
 * Full-screen modal that prompts users to reflect on their habit changes.
 * Shows what habits were changed and provides a space for emotional reflection.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PendingChange } from '../pages/DailyLogPage';
import './ReflectionModal.css';

interface ReflectionModalProps {
  pendingChanges: Map<string, PendingChange>;
  onSave: (notes?: string) => void;
  onSkip: () => void;
}

export const ReflectionModal: React.FC<ReflectionModalProps> = ({
  pendingChanges,
  onSave,
  onSkip,
}) => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const maxLength = 5000;

  const handleSave = async () => {
    setIsSaving(true);

    // Save the changes
    await onSave(notes.trim() || undefined);

    // Navigate to progress page after brief animation (intentional UX)
    // The progress page will handle showing conversion modal if needed
    setTimeout(() => {
      navigate('/progress');
    }, 800);
  };

  const handleSkip = () => {
    onSkip();
    // Navigate to progress page (intentional UX)
    navigate('/progress');
  };

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

        {/* Actions */}
        <div className="reflection-modal__actions">
          <button
            type="button"
            className={`reflection-modal__btn reflection-modal__btn--primary ${isSaving ? 'reflection-modal__btn--saving' : ''}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="reflection-modal__spinner animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
          <button
            type="button"
            className="reflection-modal__btn reflection-modal__btn--secondary"
            onClick={handleSkip}
            disabled={isSaving}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};
