/**
 * Welcome Page Component
 *
 * Landing page for unauthenticated users.
 * Explains the app and provides authentication (Google OAuth via Supabase or email/password).
 * Tasks 7.6-7.10: Hero section, features, CTA
 * Updated for Supabase migration - data now stored in Supabase database
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, RotateCcw, Sparkles } from 'lucide-react';
import { initAuth, isAuthenticated } from '../services/auth';
import { logError } from '../utils/errorHandler';
import { demoModeService } from '../services/demoMode';
import { TreeOfLife } from '../components/TreeOfLife';
import { BotanicalCorners } from '../components/BotanicalCorners';
import './WelcomePage.css';

export const WelcomePage = (): JSX.Element => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth on component mount
    const init = async () => {
      try {
        await initAuth();
        setAuthInitialized(true);

        // Check if already authenticated
        if (isAuthenticated()) {
          navigate('/daily-log');
        }
      } catch (err) {
        logError('WelcomePage:init', err);
      }
    };

    init();
  }, [navigate]);

  const handleBeginPractice = () => {
    setLoading(true);
    // Initialize demo mode
    demoModeService.initializeDemoMode();
    // Navigate to daily log
    navigate('/daily-log');
  };

  return (
    <div className="welcome-page">
      <BotanicalCorners />
      <div className="welcome-container">
        {/* Hero Section */}
        <header className="welcome-hero">
          <div className="welcome-brand-hero">
            <h1 className="welcome-logo-hero">AMARA DAY</h1>
            <p className="welcome-tagline">Daily Eternal</p>
          </div>
          <div className="welcome-hero-animation">
            <TreeOfLife />
          </div>
          <p className="welcome-subtitle">
            A gentle space for daily practice.
            Not about perfection. About presence.
            About becoming, one quiet day at a time.
          </p>
          <button
            type="button"
            onClick={handleBeginPractice}
            disabled={loading || !authInitialized}
            className="welcome-hero-cta"
            aria-label="Begin your daily practice with Amara.day"
          >
            {loading ? 'Starting...' : 'Begin Your Practice'}
          </button>
          <p className="welcome-hero-signin">
            Have an account? <a href="/daily-log" className="welcome-hero-signin-link">Sign in</a>
          </p>

          {/* Scroll Indicator */}
          <div className="welcome-scroll-indicator" aria-hidden="true">
            <div className="welcome-scroll-dot"></div>
          </div>
        </header>

        {/* Why It Matters */}
        <section className="welcome-why">
          <h2 className="welcome-section-title">Why It Matters</h2>
          <div className="welcome-why-grid">
            <div className="welcome-why-card">
              <div className="welcome-why-icon-wrapper" aria-hidden="true">
                <Heart className="welcome-why-icon" strokeWidth={1.5} />
              </div>
              <h3 className="welcome-why-title">You're Not Alone</h3>
              <p className="welcome-why-text">
                Not a drill sergeant. Not a productivity app.
                Amara.day is the friend who asks, "How did it feel today?"
                and means it.
              </p>
            </div>

            <div className="welcome-why-card">
              <div className="welcome-why-icon-wrapper" aria-hidden="true">
                <RotateCcw className="welcome-why-icon" strokeWidth={1.5} />
              </div>
              <h3 className="welcome-why-title">You Can Begin Again</h3>
              <p className="welcome-why-text">
                Missed a week? A month? It happens.
                No guilt. No judgment.
                Just: "Welcome back. What feels doable today?"
              </p>
            </div>

            <div className="welcome-why-card">
              <div className="welcome-why-icon-wrapper" aria-hidden="true">
                <Sparkles className="welcome-why-icon" strokeWidth={1.5} />
              </div>
              <h3 className="welcome-why-title">You'll See Yourself Clearly</h3>
              <p className="welcome-why-text">
                Your notes become a mirror.
                See what energizes you. What drains you.
                What quietly works when you're not forcing it.
              </p>
            </div>
          </div>
        </section>

        {/* Your Journey */}
        <section className="welcome-journey">
          <h2 className="welcome-section-title">Your Journey</h2>
          <div className="welcome-journey-steps">
            <div className="welcome-step">
              <div className="welcome-step-number">1</div>
              <h3 className="welcome-step-title">Today: Just Show Up</h3>
              <p className="welcome-step-description">
                Mark what you did. Note how it felt. Done.
                No streaks to protect yet. No pressure.
                Just: you showed up.
              </p>
            </div>

            <div className="welcome-step">
              <div className="welcome-step-number">2</div>
              <h3 className="welcome-step-title">This Week: Feel the Shift</h3>
              <p className="welcome-step-description">
                Your first streak appears.
                Not dramatic. Quiet.
                Like muscle memory forming.
              </p>
            </div>

            <div className="welcome-step">
              <div className="welcome-step-number">3</div>
              <h3 className="welcome-step-title">This Month: See the Pattern</h3>
              <p className="welcome-step-description">
                Your notes reveal something.
                "I feel best when I move in the morning."
                "Rest days make me more consistent."
                Growth whispers. You listen.
              </p>
            </div>
          </div>
        </section>

        {/* Metaphor Break */}
        <section className="welcome-metaphor">
          <div className="welcome-metaphor-content">
            <p className="welcome-metaphor-quote">
              "Like a tree, growth is quiet.
              Roots deepen while you sleep.
              Branches reach when you're not watching."
            </p>
          </div>
        </section>

        {/* Secondary CTA */}
        <section className="welcome-cta-secondary">
          <p className="welcome-cta-note">
            Always free to start. Pay what feels right when AI-powered reflections begin (optional).
          </p>
        </section>

        {/* Footer */}
        <footer className="welcome-footer">
          <p className="welcome-footer-text">
            <a href="/privacy" className="welcome-footer-link">Privacy</a>
            {' • '}
            <a href="https://github.com/yourusername/habit-tracker" className="welcome-footer-link" target="_blank" rel="noopener noreferrer">Open Source</a>
            {' • '}
            Built with care
          </p>
        </footer>
      </div>
    </div>
  );
};
