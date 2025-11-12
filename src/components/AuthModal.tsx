import React, { useState } from 'react';
import { loginWithEmail, signUpWithEmail } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import './AuthModal.css';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

/**
 * AuthModal Component
 *
 * Displays a modal for email/password authentication
 * Supports both sign-in and sign-up flows
 * Automatically migrates demo data on successful authentication
 */
export const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'signup' }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }

      // Close modal and navigate to daily log
      onClose();
      navigate('/daily-log');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="auth-modal-content">
        <button
          className="auth-modal-close"
          onClick={onClose}
          aria-label="Close authentication modal"
        >
          ×
        </button>

        <h2 id="auth-modal-title" className="auth-modal-title">
          {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
        </h2>

        <p className="auth-modal-subtitle">
          {mode === 'signup'
            ? 'Sign up to save your progress across devices'
            : 'Sign in to access your saved habits'}
        </p>

        <form onSubmit={handleSubmit} className="auth-modal-form">
          <div className="auth-modal-field">
            <label htmlFor="email" className="auth-modal-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-modal-input"
              placeholder="your@email.com"
              required
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="auth-modal-field">
            <label htmlFor="password" className="auth-modal-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-modal-input"
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
            />
            {mode === 'signup' && (
              <p className="auth-modal-hint">At least 6 characters</p>
            )}
          </div>

          {error && (
            <div className="auth-modal-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary auth-modal-submit"
            disabled={loading}
          >
            {loading
              ? (mode === 'signup' ? 'Creating Account...' : 'Signing In...')
              : (mode === 'signup' ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="auth-modal-toggle">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="auth-modal-toggle-link"
                disabled={loading}
              >
                Sign in
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="auth-modal-toggle-link"
                disabled={loading}
              >
                Sign up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
