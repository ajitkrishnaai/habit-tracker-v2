import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

/**
 * Privacy Policy Page
 * Tasks 7.13-7.15: Privacy policy content with data collection, storage, and GDPR compliance
 */
const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <Link to="/" className="legal-back-link">← Back to Home</Link>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-updated">Last Updated: {new Date().toLocaleDateString()}</p>
        </header>

        <section className="legal-content">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Habit Tracker. We are committed to protecting your privacy and ensuring
            you have complete control over your data. This Privacy Policy explains how we handle
            your information.
          </p>

          <h2>2. Data Ownership</h2>
          <p>
            <strong>Your data belongs to you.</strong> All habit tracking data, including your habits,
            daily logs, and notes, are stored exclusively in your personal Google Drive in a Google Sheet
            created by this application.
          </p>
          <p>
            We do not store your data on our servers. We do not have access to your data. We cannot
            view, modify, or share your data.
          </p>

          <h2>3. Data Collection</h2>
          <h3>3.1 Information You Provide</h3>
          <ul>
            <li><strong>Habit Information:</strong> Names and categories of habits you create</li>
            <li><strong>Log Entries:</strong> Daily completion status (done/not done) and optional notes</li>
            <li><strong>Google Account:</strong> Your Google user ID and email (used only for authentication)</li>
          </ul>

          <h3>3.2 Automatically Collected Information</h3>
          <ul>
            <li><strong>Usage Data:</strong> Local storage of preferences and session data (stored only in your browser)</li>
            <li><strong>Sync Metadata:</strong> Timestamps for synchronization between local storage and Google Sheets</li>
          </ul>

          <h2>4. How We Use Your Data</h2>
          <p>Your data is used exclusively for:</p>
          <ul>
            <li>Displaying your habits and daily logs in the application interface</li>
            <li>Calculating statistics (streaks, completion percentages)</li>
            <li>Analyzing patterns in your notes (performed locally in your browser)</li>
            <li>Synchronizing data between your browser and your Google Drive</li>
          </ul>

          <h2>5. Data Storage</h2>
          <h3>5.1 Local Storage</h3>
          <p>
            The app stores data locally in your browser's IndexedDB for offline functionality.
            This data never leaves your device except when syncing to your Google Drive.
          </p>

          <h3>5.2 Google Drive Storage</h3>
          <p>
            Your habit data is stored in a Google Sheet in your personal Google Drive. We use the most
            restrictive OAuth scope (<code>https://www.googleapis.com/auth/drive.file</code>) which
            allows us to access ONLY files created by this application, not your other Drive files.
          </p>

          <h2>6. Data Sharing</h2>
          <p>
            <strong>We do not share your data with anyone.</strong> Period. There are no third-party
            analytics, no advertising networks, no data brokers. Your data remains private between
            you, your browser, and your Google Drive.
          </p>

          <h2>7. Your Rights (GDPR Compliance)</h2>
          <p>Under GDPR and other data protection regulations, you have the following rights:</p>
          <ul>
            <li><strong>Right to Access:</strong> Access your data anytime by opening the Google Sheet in your Drive</li>
            <li><strong>Right to Rectification:</strong> Edit your data directly in the app or in the Google Sheet</li>
            <li><strong>Right to Erasure:</strong> Delete the Google Sheet from your Drive at any time</li>
            <li><strong>Right to Data Portability:</strong> Export your data as a CSV from Google Sheets</li>
            <li><strong>Right to Withdraw Consent:</strong> Sign out and revoke app permissions in your Google Account settings</li>
          </ul>

          <h2>8. Data Security</h2>
          <p>We implement the following security measures:</p>
          <ul>
            <li>OAuth tokens stored in memory only (never in localStorage)</li>
            <li>HTTPS encryption for all data transfers</li>
            <li>Minimal OAuth scopes (only files created by this app)</li>
            <li>No backend servers that could be compromised</li>
          </ul>

          <h2>9. Data Retention</h2>
          <p>
            Your data is retained indefinitely in your Google Drive until you choose to delete it.
            You can delete the entire Google Sheet at any time, or selectively delete individual
            habits and logs.
          </p>

          <h2>10. Children's Privacy</h2>
          <p>
            This application is not intended for children under 13 years of age. We do not knowingly
            collect data from children under 13. If you are a parent and believe your child has
            provided data to this app, please contact us.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us through our
            GitHub repository or email support.
          </p>
        </section>

        <footer className="legal-footer">
          <Link to="/" className="legal-button">Back to Home</Link>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
