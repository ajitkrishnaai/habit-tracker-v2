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
            Welcome to Amara.day. We are committed to protecting your privacy and ensuring
            you have complete control over your data. This Privacy Policy explains how we handle
            your information.
          </p>

          <h2>2. Data Ownership</h2>
          <p>
            <strong>Your data belongs to you.</strong> All habit tracking data, including your habits,
            daily logs, and notes, are stored in a secure Supabase PostgreSQL database with Row-Level
            Security (RLS) policies that ensure only you can access your data.
          </p>
          <p>
            We cannot view, modify, or share your data. RLS policies automatically enforce data isolation
            at the database level, preventing any unauthorized access—even from us.
          </p>

          <h2>3. Data Collection</h2>
          <h3>3.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> Email address and encrypted password (for authenticated users)</li>
            <li><strong>Habit Information:</strong> Names and categories of habits you create</li>
            <li><strong>Log Entries:</strong> Daily completion status (done/not done) and optional notes (max 5000 characters)</li>
          </ul>

          <h3>3.2 Demo Mode (No Account Required)</h3>
          <p>
            You can try Amara.day without creating an account. In demo mode:
          </p>
          <ul>
            <li>All data is stored <strong>locally in your browser</strong> (IndexedDB)</li>
            <li>No data is sent to our servers</li>
            <li>Data persists until you clear your browser data or sign up</li>
            <li>When you sign up, demo data is automatically migrated to your cloud account</li>
          </ul>

          <h3>3.3 Automatically Collected Information</h3>
          <ul>
            <li><strong>Usage Data:</strong> Local storage of preferences and session data (stored only in your browser)</li>
            <li><strong>Sync Metadata:</strong> Timestamps for synchronization between local storage and Supabase database</li>
          </ul>

          <h2>4. How We Use Your Data</h2>
          <p>Your data is used exclusively for:</p>
          <ul>
            <li>Displaying your habits and daily logs in the application interface</li>
            <li>Calculating statistics (streaks, completion percentages)</li>
            <li>Analyzing patterns in your notes (performed locally in your browser using sentiment analysis)</li>
            <li>Synchronizing data between your browser and Supabase database (authenticated users only)</li>
            <li><strong>Optional:</strong> Generating AI-powered reflections via Amara Day (when you explicitly request this feature)</li>
          </ul>

          <h2>5. Data Storage</h2>
          <h3>5.1 Local Storage (All Users)</h3>
          <p>
            The app stores data locally in your browser's IndexedDB for offline functionality and fast access.
            For demo users, this is the only storage location. For authenticated users, local data syncs
            with Supabase in the background.
          </p>

          <h3>5.2 Cloud Storage (Authenticated Users)</h3>
          <p>
            When you create an account, your habit data is stored in a Supabase PostgreSQL database
            hosted on AWS infrastructure. Supabase provides:
          </p>
          <ul>
            <li><strong>Row-Level Security (RLS):</strong> Database-level policies ensure your data is isolated and accessible only to you</li>
            <li><strong>Encryption:</strong> Data encrypted at rest and in transit (HTTPS/TLS)</li>
            <li><strong>SOC 2 Type II compliance:</strong> Supabase follows industry-standard security practices</li>
          </ul>

          <h3>5.3 Third-Party Data Processor</h3>
          <p>
            Supabase (supabase.com) is our infrastructure provider and acts as a data processor under GDPR.
            Supabase does not access, use, or share your data. For details on Supabase's security and privacy
            practices, see their <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and
            {' '}<a href="https://supabase.com/security" target="_blank" rel="noopener noreferrer">Security page</a>.
          </p>

          <h2>6. Data Sharing</h2>
          <p>
            <strong>We do not share your data with anyone.</strong> There are no third-party
            analytics, no advertising networks, no data brokers. Your data remains private between
            you, your browser, and Supabase's secure database.
          </p>
          <p>
            The only exception: If you explicitly use the optional AI reflection feature (Amara Day),
            your notes may be sent to OpenAI's API to generate personalized insights. This feature
            is opt-in and clearly labeled when you use it.
          </p>

          <h2>7. Your Rights (GDPR Compliance)</h2>
          <p>Under GDPR and other data protection regulations, you have the following rights:</p>
          <ul>
            <li><strong>Right to Access:</strong> Access your data anytime through the app interface or by contacting support for a data export</li>
            <li><strong>Right to Rectification:</strong> Edit your data directly in the app at any time</li>
            <li><strong>Right to Erasure:</strong> Request account deletion by contacting support (all data will be permanently deleted)</li>
            <li><strong>Right to Data Portability:</strong> Export your data via the app's export feature (coming soon) or request a data export from support</li>
            <li><strong>Right to Withdraw Consent:</strong> Sign out and delete your account at any time</li>
            <li><strong>Right to Object:</strong> Opt out of optional features like AI reflections</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us through our GitHub repository or email support.
          </p>

          <h2>8. Data Security</h2>
          <p>We implement the following security measures:</p>
          <ul>
            <li><strong>Authentication:</strong> Supabase Auth with encrypted password storage (bcrypt hashing)</li>
            <li><strong>Session Management:</strong> JWT tokens stored in localStorage with automatic refresh and expiration</li>
            <li><strong>Row-Level Security:</strong> Database policies prevent unauthorized data access at the database level</li>
            <li><strong>Encryption:</strong> HTTPS/TLS for all data transfers; encryption at rest for database storage</li>
            <li><strong>Minimal Data Collection:</strong> We only collect what's necessary for the app to function</li>
            <li><strong>No Backend Access:</strong> Client-side app with RLS enforcement means no backend server can access your data</li>
          </ul>
          <p>
            <strong>Important:</strong> JWT tokens are stored in your browser's localStorage for session persistence.
            Do not use this app on shared or public computers. Always sign out when using untrusted devices.
          </p>

          <h2>9. Data Retention</h2>
          <p>
            <strong>Demo Mode:</strong> Data is retained in your browser's local storage until you clear browser data or sign up.
          </p>
          <p>
            <strong>Authenticated Users:</strong> Your data is retained in Supabase indefinitely until you delete your account.
            You can delete individual habits or logs at any time through the app interface.
          </p>
          <p>
            <strong>Account Deletion:</strong> When you request account deletion, all your data (habits, logs, metadata)
            is permanently deleted from Supabase within 30 days. Backups may be retained for up to 90 days for disaster
            recovery purposes, then permanently purged.
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

          <h2>12. AI-Powered Features (Optional)</h2>
          <p>
            Amara.day offers an optional AI reflection coach called "Amara Day" that provides personalized
            insights based on your habit notes. This feature:
          </p>
          <ul>
            <li>Is <strong>completely optional</strong> and requires explicit activation</li>
            <li>Sends your habit notes to OpenAI's API to generate reflections</li>
            <li>Is clearly labeled when you use it</li>
            <li>May be subject to OpenAI's data usage policies (see <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">OpenAI Privacy Policy</a>)</li>
          </ul>
          <p>
            You can choose not to use this feature, and your habit tracking will work exactly the same without it.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your GDPR rights, please contact us:
          </p>
          <ul>
            <li><strong>GitHub:</strong> Open an issue at our <a href="https://github.com/yourusername/habit-tracker" target="_blank" rel="noopener noreferrer">GitHub repository</a></li>
            <li><strong>Email:</strong> support@amara.day (coming soon)</li>
          </ul>
        </section>

        <footer className="legal-footer">
          <Link to="/" className="legal-button">Back to Home</Link>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
