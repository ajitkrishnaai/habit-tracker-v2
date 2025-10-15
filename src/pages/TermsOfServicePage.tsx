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
            By accessing and using Habit Tracker ("the Service"), you accept and agree to be bound
            by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Habit Tracker is a free, open-source web application that helps you track daily habits.
            The Service stores your data in your personal Google Drive and provides analytics and
            insights based on your habit tracking data.
          </p>

          <h2>3. User Accounts</h2>
          <p>
            To use the Service, you must:
          </p>
          <ul>
            <li>Have a valid Google account</li>
            <li>Grant the Service permission to create and access files in your Google Drive</li>
            <li>Be at least 13 years of age (or the age of digital consent in your country)</li>
          </ul>
          <p>
            You are responsible for maintaining the security of your Google account. We are not
            liable for any loss or damage from your failure to comply with this security obligation.
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
            is stored in your Google Drive. We do not claim any ownership over your content.
          </p>
          <p>
            You may export, modify, or delete your data at any time. You can revoke the Service's
            access to your Google Drive through your Google Account settings.
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
            <li>Loss of data stored in your Google Drive</li>
            <li>Errors or bugs in the Service</li>
            <li>Unauthorized access to your Google account</li>
            <li>Any indirect, incidental, special, or consequential damages</li>
          </ul>
          <p>
            <strong>You use this Service at your own risk.</strong> We recommend regularly backing
            up your habit tracking Google Sheet.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            The Service's source code is open source and available under the [LICENSE NAME] license
            (see our GitHub repository). You are free to view, modify, and distribute the code
            according to the license terms.
          </p>
          <p>
            The Habit Tracker name and branding are our property. You may not use them without
            permission, except as necessary to describe the Service.
          </p>

          <h2>9. Third-Party Services</h2>
          <p>
            The Service integrates with Google Drive and Google Sheets via the Google API. Your use
            of Google services is governed by Google's Terms of Service and Privacy Policy. We are
            not responsible for Google's services or policies.
          </p>

          <h2>10. Termination</h2>
          <p>
            You may stop using the Service at any time by:
          </p>
          <ul>
            <li>Signing out of the application</li>
            <li>Revoking the app's permissions in your Google Account settings</li>
            <li>Deleting the habit tracking Google Sheet from your Drive</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate access to the Service for violations of
            these Terms or for any other reason.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. Continued use of the Service after changes
            constitutes acceptance of the new Terms. We will update the "Last Updated" date above
            when changes are made.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of [YOUR JURISDICTION], without regard to conflict
            of law principles. Any disputes arising from these Terms or the Service shall be resolved
            in the courts of [YOUR JURISDICTION].
          </p>

          <h2>13. Severability</h2>
          <p>
            If any provision of these Terms is found to be invalid or unenforceable, the remaining
            provisions will continue in full force and effect.
          </p>

          <h2>14. Contact</h2>
          <p>
            For questions about these Terms, please contact us through our GitHub repository or
            email support.
          </p>
        </section>

        <footer className="legal-footer">
          <Link to="/" className="legal-button">Back to Home</Link>
        </footer>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
