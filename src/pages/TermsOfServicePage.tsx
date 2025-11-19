import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPage.css';

/**
 * Terms of Service Page
 * Tasks 7.16-7.17: Terms of service content with basic terms, liability, and usage rights
 */
const TermsOfServicePage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <Link to="/" className="legal-back-link">← Back to Home</Link>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-updated">Last Updated: {new Date().toLocaleDateString()}</p>
        </header>

        <section className="legal-content">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Amara.day ("the Service"), you accept and agree to be bound
            by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Amara.day is a free, open-source web application that helps you track daily habits with
            mindfulness and intention. The Service stores your data securely in a Supabase PostgreSQL
            database (for authenticated users) or locally in your browser (for demo mode users).
            The Service provides analytics, insights, and optional AI-powered reflections based on your
            habit tracking data.
          </p>

          <h2>3. User Accounts</h2>
          <h3>3.1 Account Types</h3>
          <p>
            You can use the Service in two ways:
          </p>
          <ul>
            <li><strong>Demo Mode:</strong> Try the app without creating an account. Your data is stored locally in your browser only.</li>
            <li><strong>Authenticated Account:</strong> Create an account with email and password to sync your data to the cloud.</li>
          </ul>

          <h3>3.2 Account Requirements</h3>
          <p>
            To create an authenticated account, you must:
          </p>
          <ul>
            <li>Provide a valid email address</li>
            <li>Create a secure password</li>
            <li>Be at least 13 years of age (or the age of digital consent in your country)</li>
          </ul>
          <p>
            You are responsible for maintaining the security of your account credentials. We are not
            liable for any loss or damage from your failure to comply with this security obligation.
            Never share your password with anyone.
          </p>

          <h2>4. User Responsibilities</h2>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate information when using the Service</li>
            <li>Use the Service only for lawful purposes</li>
            <li>Not attempt to reverse engineer, decompile, or hack the Service</li>
            <li>Not use the Service to store illegal, harmful, or inappropriate content</li>
            <li>Not attempt to access other users' data or accounts</li>
          </ul>

          <h2>5. Data Ownership and Control</h2>
          <p>
            <strong>You retain all ownership rights to your data.</strong> All habit tracking data
            belongs to you. We do not claim any ownership over your content.
          </p>
          <p>
            <strong>Demo Mode:</strong> Your data is stored locally in your browser. You have complete control
            and can clear it at any time by clearing your browser data.
          </p>
          <p>
            <strong>Authenticated Users:</strong> Your data is stored in Supabase with Row-Level Security policies
            that ensure only you can access it. You may export, modify, or delete your data at any time through
            the app interface or by requesting account deletion.
          </p>

          <h2>6. Service Availability</h2>
          <p>
            We strive to provide a reliable service, but we do not guarantee that the Service will
            be available at all times. The Service may experience:
          </p>
          <ul>
            <li>Temporary interruptions for maintenance or updates</li>
            <li>Downtime due to technical issues beyond our control</li>
            <li>Changes or discontinuation of features with or without notice</li>
          </ul>

          <h2>7. Limitation of Liability</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT
            PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES
            OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p>
            We are not liable for:
          </p>
          <ul>
            <li>Loss of data stored in Supabase or your browser</li>
            <li>Errors or bugs in the Service</li>
            <li>Unauthorized access to your account</li>
            <li>Downtime or unavailability of Supabase infrastructure</li>
            <li>Any indirect, incidental, special, or consequential damages</li>
          </ul>
          <p>
            <strong>You use this Service at your own risk.</strong> We recommend:
          </p>
          <ul>
            <li>Using a strong, unique password</li>
            <li>Regularly exporting your data as a backup</li>
            <li>Not storing sensitive personal information in habit notes</li>
          </ul>

          <h2>8. Intellectual Property</h2>
          <p>
            The Service's source code is open source and available under the MIT license
            (see our <a href="https://github.com/yourusername/habit-tracker" target="_blank" rel="noopener noreferrer">GitHub repository</a>).
            You are free to view, modify, and distribute the code according to the license terms.
          </p>
          <p>
            The "Amara.day" name and branding are our property. You may not use them without
            permission, except as necessary to describe the Service.
          </p>

          <h2>9. Third-Party Services</h2>
          <p>
            The Service integrates with the following third-party services:
          </p>
          <ul>
            <li>
              <strong>Supabase:</strong> Database and authentication infrastructure. Your use of Supabase
              is subject to their <a href="https://supabase.com/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a> and
              {' '}<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
            </li>
            <li>
              <strong>OpenAI (optional):</strong> AI-powered reflection feature. If you use this feature,
              your notes are sent to OpenAI's API subject to their <a href="https://openai.com/policies/terms-of-use" target="_blank" rel="noopener noreferrer">Terms</a> and
              {' '}<a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
            </li>
          </ul>
          <p>
            We are not responsible for the services, policies, or practices of these third-party providers.
          </p>

          <h2>10. Termination</h2>
          <h3>10.1 Voluntary Termination</h3>
          <p>
            You may stop using the Service at any time:
          </p>
          <ul>
            <li><strong>Demo Mode:</strong> Simply stop using the app or clear your browser data</li>
            <li><strong>Authenticated Account:</strong> Sign out and request account deletion through support</li>
          </ul>

          <h3>10.2 Account Deletion</h3>
          <p>
            To permanently delete your account and all associated data, contact us through our GitHub
            repository or email support. We will delete all your data within 30 days (see Privacy Policy
            Section 9 for details on retention and backups).
          </p>

          <h3>10.3 Service Termination</h3>
          <p>
            We reserve the right to suspend or terminate access to the Service for violations of
            these Terms or for any other reason, with or without notice.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. Continued use of the Service after changes
            constitutes acceptance of the new Terms. We will update the "Last Updated" date above
            when changes are made.
          </p>

          <h2>12. AI-Powered Features</h2>
          <p>
            The optional AI reflection coach ("Amara Day") is provided as an experimental feature.
            By using this feature:
          </p>
          <ul>
            <li>You acknowledge that AI-generated reflections are for informational and inspirational purposes only</li>
            <li>You understand that AI responses may contain errors or inaccuracies</li>
            <li>You agree not to rely on AI reflections for medical, psychological, or professional advice</li>
            <li>You consent to your habit notes being sent to OpenAI's API for processing</li>
          </ul>
          <p>
            This feature may be modified, paused, or discontinued at any time.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the United States and the State of California,
            without regard to conflict of law principles. Any disputes arising from these Terms or
            the Service shall be resolved in the courts of California.
          </p>

          <h2>14. Severability</h2>
          <p>
            If any provision of these Terms is found to be invalid or unenforceable, the remaining
            provisions will continue in full force and effect.
          </p>

          <h2>15. Contact</h2>
          <p>
            For questions about these Terms, please contact us:
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

export default TermsOfServicePage;
