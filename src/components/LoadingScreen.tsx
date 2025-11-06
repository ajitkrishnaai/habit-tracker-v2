/**
 * LoadingScreen Component
 * Task 2.1 - Branded loading screen with pulse animation
 *
 * Features:
 * - Full-screen centered layout
 * - Amara.day logo with pulse animation
 * - Loading message
 * - Warm gradient background
 */

import { AmaraDayLogo } from './branding/AmaraDayLogo';
import './LoadingScreen.css';

interface LoadingScreenProps {
  /** Optional loading message (defaults to "Building your day...") */
  message?: string;
}

export const LoadingScreen = ({ message = "Building your day..." }: LoadingScreenProps): JSX.Element => {
  return (
    <div className="loading-screen">
      <div className="loading-screen__content">
        <div className="loading-screen__logo">
          <AmaraDayLogo size={80} layout="vertical" />
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};
