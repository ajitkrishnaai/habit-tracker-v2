# Product Requirements Document: Habit Tracker Web Application

## 1. Introduction/Overview

This document outlines the requirements for a simple, user-friendly habit tracking web application. The primary problem this application solves is the complexity of existing habit trackers - users need a straightforward way to track daily habits without overwhelming features or locked-in proprietary data systems.

The Habit Tracker app allows users to log their daily habits as "done" or "not done", add optional notes about their state of mind, and view progress over time with streak tracking and completion percentages. All user data is stored in the user's own Google Sheet, giving them complete ownership and control of their data.

**Goal:** Create a minimal, clean web application for personal habit tracking that stores all data in the user's Google Drive via Google Sheets.

## 2. Goals

1. Enable users to easily log multiple habits daily with a simple toggle interface
2. Provide users with complete data ownership by storing all information in their Google Sheet
3. Display meaningful progress metrics including streaks, completion percentages, and note patterns
4. Support offline usage with automatic sync when connection is restored
5. Create a mobile-first experience that works seamlessly on phones and desktop browsers
6. Achieve sustained usage for at least 30 days without data loss
7. Generate useful insights from user notes to help identify habit patterns and correlations

## 3. User Stories

1. As a user, I want to log in with my Google account so that my habit data is automatically saved to my Google Drive.

2. As a user, I want to see a welcome page that clearly explains what the app does and where my data will be stored before I commit to using it.

3. As a user, I want to add custom habits with categories so that I can organize different types of habits I'm tracking.

4. As a user, I want to quickly toggle each habit as done or not done on my phone so that I can log my entire day in seconds.

5. As a user, I want to add notes about how I'm feeling or what's on my mind when logging habits so that I can remember the context later.

6. As a user, I want to go back up to 5 days to log habits I forgot so that my tracking stays accurate.

7. As a user, I want to see my current streak and longest streak for each habit so that I stay motivated to continue.

8. As a user, I want to see what percentage of days I've completed each habit so that I understand my consistency over time.

9. As a user, I want to see patterns in my notes that show correlations between my habits and feelings so that I can understand what works for me.

10. As a user, I want to edit or remove habits I'm no longer tracking so that my active list stays relevant.

11. As a user, I want the app to work offline and sync later so that I never miss logging a day due to poor internet connection.

12. As a user, I want to see my historical notes with dates so that I can review my past thoughts and progress.

## 4. Functional Requirements

### 4.1 Authentication & Onboarding

1. The system must require Google account authentication before any app functionality is accessible.
2. The system must use OAuth 2.0 for Google authentication with minimal permissions (access only to the habit tracker Google Sheet).
3. The system must display a welcome/landing page before login that:
   - Describes the core functionality of the app
   - Emphasizes the simplicity of the interface
   - Explains that all data is stored in the user's Google account
   - Provides a "Log in with Google" button
4. On first login, the system must automatically create a new Google Sheet in the user's Google Drive named "Habit Tracker Data - [Date]".
5. After first login, the system must automatically navigate the user to the "Manage Habits" screen to add their first habit, then proceed to the daily logging screen.

### 4.2 Habit Management

6. The system must provide a "Manage Habits" screen accessible via top navigation.
7. The system must allow users to add new habits with the following fields:
   - Habit name (required, with character length limit of 100 characters)
   - Category (optional, user-defined custom categories)
8. The system must prevent duplicate habit names (case-insensitive comparison).
9. The system must allow users to edit existing habit names and categories.
10. The system must allow users to remove habits from tracking.
11. When a habit is removed, the system must mark it as "inactive" and retain all historical data in the Google Sheet.
12. The system must not permanently delete any habit data when a habit is removed.

### 4.3 Daily Habit Logging

13. The system must provide a "Daily Log" screen as the primary interface, accessible via top navigation.
14. The system must display all active habits on the daily logging screen with toggle switches for marking done/not done.
15. The system must clearly indicate the date being logged (default: today).
16. The system must provide one shared text field for notes that applies to all habits logged in that session.
17. The system must allow users to log habits without adding notes (notes are optional).
18. Each habit can only be logged once per day as either "done" or "not done".
19. The system must save log entries immediately to local storage and sync to Google Sheets when online.
20. The system must provide a "previous day" button to navigate backward one day at a time, up to 5 days in the past.
21. The system must visually distinguish between:
    - Logged as "done"
    - Logged as "not done"
    - No data logged yet
22. When viewing past dates, the system must show existing log data if available.
23. When navigating between dates, the system must preserve unsaved changes and prompt the user before discarding.

### 4.4 Progress & Analytics

24. The system must provide a "Progress" screen accessible via top navigation.
25. The system must display all active habits in a list view with summary statistics.
26. For each habit, the system must display:
    - Habit name and category
    - Current streak (consecutive days marked "done")
    - Longest streak ever achieved
    - Completion percentage displayed as both fraction and percentage (e.g., "17/20 days - 85%")
27. The percentage calculation must:
    - Include only days where data was logged (done or not done)
    - Exclude days with no data from the calculation
    - Show "no data" separately from "not done"
28. The system must provide an expandable view for each habit to see detailed information.
29. When expanded, each habit must show:
    - Notes pattern analysis summary
    - List of all historical notes with associated dates and times
30. The notes pattern analysis must:
    - Trigger only after collecting at least 7 log entries with notes
    - Use simple keyword extraction and sentiment analysis
    - Display correlations such as "When you do this, then you feel like this"
    - Update in real-time after each new log entry (once the 7-entry threshold is met)
31. When displaying historical notes, the system must show them in reverse chronological order (newest first).

### 4.5 Data Storage & Sync

32. The system must store all data in a single Google Sheet with the following data structure:
    - Habits table (habit_id, name, category, status, created_date)
    - Logs table (log_id, habit_id, date, status, notes, timestamp)
    - Metadata table (sheet_version, last_sync)
33. The system must sync data to Google Sheets whenever an internet connection is available.
34. The system must store all data locally using browser localStorage or IndexedDB for offline capability.
35. When offline, the system must queue all changes and automatically sync when connection is restored.
36. The system must show a visual indicator when syncing is in progress.
37. The system must show a visual indicator when the app is offline.
38. If sync fails, the system must:
    - Save data locally
    - Display an error message with details
    - Provide a manual "Retry" button
    - Automatically retry sync in the background every 30 seconds
39. The system must handle sync conflicts by using "last write wins" strategy (most recent timestamp takes precedence).

### 4.6 Navigation & Layout

40. The system must use a top navigation bar with the following menu items:
    - Daily Log (default/home)
    - Progress
    - Manage Habits
41. The system must use a mobile-first design approach, optimizing primarily for phone screens.
42. The system must be fully responsive and functional on desktop browsers.
43. The system must use a minimal, clean design aesthetic with ample white space and simple colors.

## 5. Non-Goals (Out of Scope)

1. **Mobile Native Apps:** This version will be web-only, not native iOS/Android apps.
2. **Multi-device Real-time Sync:** While data is stored in Google Sheets, real-time sync across multiple browser tabs/devices is not required.
3. **Social Features:** No sharing, comparing, or social networking features.
4. **Reminders/Notifications:** No push notifications or email reminders to log habits.
5. **Advanced Analytics:** No complex charts, graphs, or statistical analysis beyond basic streaks and percentages.
6. **Habit Templates:** No pre-defined habit suggestions or templates.
7. **Time-of-Day Tracking:** No tracking of what time habits were completed, only whether they were done on a given day.
8. **Multiple Logs Per Day:** Users cannot log the same habit multiple times per day.
9. **Habit Scheduling:** No ability to set specific days of the week for habits (e.g., gym only on Mon/Wed/Fri).
10. **Data Export:** No CSV/PDF export functionality (data is already in Google Sheets).
11. **Collaborative Tracking:** No ability to share habits or track with others.
12. **Advanced Note Features:** No rich text formatting, image attachments, or voice notes.

## 6. Technical Considerations

### 6.1 Technology Stack

- **Frontend Framework:** Developer's choice (React, Vue.js, or vanilla JavaScript - whatever works best for the requirements)
- **Hosting:** Google Cloud Platform (App Engine or Cloud Run recommended)
- **Authentication:** Google OAuth 2.0 via Google Identity Services
- **Database:** Google Sheets API v4 for data storage
- **Local Storage:** IndexedDB or localStorage for offline data
- **Build Tools:** Modern bundler (Webpack, Vite, or Parcel)
- **CSS Framework:** Optional - Tailwind CSS or plain CSS for minimal design

### 6.2 Architecture Decisions

1. **Single Page Application (SPA):** The app should function as an SPA with client-side routing for smooth navigation.
2. **Offline-First Architecture:** Use service workers to cache app assets and implement offline functionality.
3. **Progressive Web App (PWA):** Implement PWA features for installability on mobile devices.
4. **API Integration:** Use Google Sheets API v4 for all data operations (read/write).
5. **State Management:** Implement appropriate state management (Context API, Vuex, or simple state object).

### 6.3 Dependencies

- Google Identity Services library for OAuth authentication
- Google Sheets API client library
- Date manipulation library (date-fns or day.js recommended)
- Optional: Sentiment analysis library for notes pattern analysis (compromise.js or ml-sentiment)

### 6.4 Integration Requirements

1. **Google Sheets API:**
   - Requires OAuth 2.0 authentication
   - Needs spreadsheet read/write permissions
   - Should use batch operations when possible to reduce API calls
   - Must handle API rate limits gracefully

2. **Google Drive API (minimal):**
   - Only for creating the initial Google Sheet
   - No ongoing Drive operations needed

## 7. Performance Requirements

1. **Initial Load Time:** Standard web performance is acceptable; aim for under 3 seconds on 4G mobile connection.
2. **Logging Response Time:** Toggle switches should respond immediately (optimistic UI updates), with background sync.
3. **Progress View Load:** Should load and display all habits with statistics within 2 seconds.
4. **Offline Performance:** App should function at full speed when offline, with no noticeable lag.
5. **Sync Performance:** Sync operations should complete within 5 seconds for up to 50 habits with 1000+ log entries.
6. **Google Sheets API:** Minimize API calls by using batch operations and caching data locally.

## 8. Security & Compliance

### 8.1 Authentication & Authorization

1. All users must authenticate via Google OAuth 2.0 before accessing any functionality.
2. The app must request minimal OAuth scopes:
   - `https://www.googleapis.com/auth/spreadsheets` (for creating and accessing the habit tracker sheet only)
   - `https://www.googleapis.com/auth/userinfo.profile` (for displaying user name)
3. OAuth tokens must be stored securely in browser memory, not localStorage.
4. The app must implement automatic token refresh before expiration.
5. Users must be able to revoke access via Google account settings.

### 8.2 Data Protection

1. All communication with Google APIs must use HTTPS.
2. No user data should be stored on the server (serverless or stateless server only).
3. All user data resides only in:
   - The user's Google Sheet (in their Google Drive)
   - The user's browser (localStorage/IndexedDB)
4. No analytics or tracking should collect personally identifiable information (PII).

### 8.3 Privacy & Compliance

1. The welcome page must clearly disclose:
   - What data is collected (habit names, logs, notes)
   - Where data is stored (user's Google Drive)
   - That the app only accesses the one sheet it creates
2. The app must include a Privacy Policy page accessible from the footer.
3. The app must include Terms of Service accessible from the footer.
4. The app must comply with GDPR requirements:
   - Users own their data (in their Google Drive)
   - Users can export data (already in Google Sheets)
   - Users can delete data (by deleting the Google Sheet)
5. No cookies should be used except for essential authentication.

## 9. Data Requirements

### 9.1 Data Models

**Habit Entity:**
- `habit_id` (string, UUID): Unique identifier
- `name` (string, max 100 chars): Habit name
- `category` (string, optional): User-defined category
- `status` (enum: 'active', 'inactive'): Current status
- `created_date` (ISO 8601 timestamp): When habit was added
- `modified_date` (ISO 8601 timestamp): Last modification

**Log Entry Entity:**
- `log_id` (string, UUID): Unique identifier
- `habit_id` (string, UUID): Reference to habit
- `date` (ISO 8601 date, YYYY-MM-DD): Date of log
- `status` (enum: 'done', 'not_done', 'no_data'): Log status
- `notes` (string, optional): User notes for this log
- `timestamp` (ISO 8601 timestamp): When log was created/modified

**Metadata Entity:**
- `sheet_version` (string): Version of data schema
- `last_sync` (ISO 8601 timestamp): Last successful sync to Google Sheets
- `user_id` (string): Google user ID

### 9.2 Google Sheet Structure

The single Google Sheet should contain tabs:

1. **Habits Tab:**
   - Columns: habit_id | name | category | status | created_date | modified_date
   - One row per habit

2. **Logs Tab:**
   - Columns: log_id | habit_id | date | status | notes | timestamp
   - One row per log entry

3. **Metadata Tab:**
   - Columns: key | value
   - Stores app version, last sync time, etc.

### 9.3 Data Validation

1. Habit names must be 1-100 characters long.
2. Habit names must be unique (case-insensitive).
3. Dates must be valid ISO 8601 dates.
4. Status fields must be one of the defined enum values.
5. Notes can be any text, max 5000 characters.
6. All IDs must be valid UUIDs.

### 9.4 Data Migration

- **Initial Version:** No migration needed; fresh Google Sheet created on first use.
- **Future Versions:** Metadata tab should track schema version for future migrations.

## 10. Design Considerations

### 10.1 Visual Design

- **Style:** Minimal and clean with lots of white space
- **Color Palette:** Simple, limited color scheme (suggest neutral grays with one accent color)
- **Typography:** Clean, readable sans-serif font (e.g., Inter, Roboto, System UI)
- **Spacing:** Generous padding and margins for easy touch targets on mobile

### 10.2 UI Components

1. **Toggle Switches:** Large, easy-to-tap toggle switches for done/not done
2. **Navigation Bar:** Simple top nav with clear labels
3. **Text Input:** Clean, large text fields for notes and habit names
4. **Buttons:** Clear, high-contrast buttons for primary actions
5. **Cards/Lists:** Expandable list items on progress screen
6. **Progress Indicators:** Simple text-based display for percentages and streaks

### 10.3 Accessibility

1. All interactive elements must meet WCAG 2.1 AA standards for contrast ratios.
2. Toggle switches must be keyboard accessible (tab navigation, space to toggle).
3. All form inputs must have associated labels.
4. The app must work with screen readers (proper ARIA labels).
5. Touch targets must be at least 44x44 pixels on mobile.
6. Font size must be at least 16px for body text (prevents iOS zoom on focus).

### 10.4 Responsive Design

1. **Mobile (320px - 767px):**
   - Single column layout
   - Full-width components
   - Stacked navigation if needed
   - Large touch targets (min 44px)

2. **Tablet/Desktop (768px+):**
   - May use wider layout with max-width constraint (e.g., 800px centered)
   - Same functionality, just better spacing
   - Hover states for interactive elements

## 11. User Experience Flow

### 11.1 First-Time User Flow

1. User visits app URL
2. Sees welcome page with description and "Log in with Google" button
3. Clicks "Log in with Google"
4. Google OAuth consent screen (requests spreadsheet permission)
5. User approves
6. App creates new Google Sheet in background
7. User lands on "Manage Habits" screen with empty state
8. User adds first habit (name, optional category)
9. User clicks "Add Habit" button
10. Habit appears in list
11. User adds more habits or navigates to "Daily Log"
12. User sees all habits with toggle switches
13. User toggles habits and optionally adds notes
14. User sees confirmation that data is synced
15. User can now use app daily

### 11.2 Daily Logging Flow

1. User opens app (already authenticated)
2. App loads directly to "Daily Log" screen showing today's date
3. User sees list of all habits with toggle switches
4. User toggles each habit done or not done
5. Toggles update immediately with visual feedback
6. User optionally adds notes in the shared text field
7. App auto-saves to local storage immediately
8. App syncs to Google Sheets in background
9. User sees sync indicator confirming data is saved
10. User can navigate away or close app

### 11.3 Viewing Progress Flow

1. User clicks "Progress" in top navigation
2. App loads progress screen
3. User sees list of all habits with summary stats:
   - Current streak, longest streak
   - Completion percentage and fraction
4. User taps/clicks a habit to expand details
5. Expanded view shows:
   - Notes pattern analysis (if available)
   - List of historical notes with dates
6. User can collapse habit or expand another
7. User navigates back to daily log or manage habits

### 11.4 Back-Dating Flow

1. User is on "Daily Log" screen (showing today)
2. User clicks "Previous Day" button
3. Date indicator updates to yesterday
4. Habits load with existing data if available
5. User can toggle and save changes for that date
6. User can click "Previous Day" again (up to 5 days total)
7. User can return to today via "Today" button
8. Changes sync to Google Sheets for the correct date

## 12. Error Handling

### 12.1 Authentication Errors

1. **OAuth Failure:** Display user-friendly message "Unable to connect to Google. Please try again." with retry button.
2. **Insufficient Permissions:** If user denies spreadsheet permission, show message: "This app requires Google Sheets access to function. Please log in again and grant permission."
3. **Token Expiration:** Automatically refresh token; if refresh fails, redirect to login.

### 12.2 Data Sync Errors

1. **Network Timeout:** Show message "Sync taking longer than expected. Data saved locally and will sync when connection improves."
2. **API Rate Limit:** Queue operations and retry with exponential backoff. Show message "Syncing..." with spinner.
3. **Sheet Access Error:** Show message "Unable to access your Google Sheet. Please check your Google Drive permissions."
4. **Conflict:** Use last-write-wins; log conflict to console for debugging.

### 12.3 Validation Errors

1. **Duplicate Habit Name:** Show inline error "A habit with this name already exists. Please choose a different name."
2. **Empty Habit Name:** Show inline error "Habit name cannot be empty."
3. **Name Too Long:** Show character count and prevent typing beyond limit.
4. **Invalid Date:** Prevent user from navigating beyond 5 days in past.

### 12.4 Edge Cases

1. **No Habits:** Show empty state with message "You haven't added any habits yet. Go to Manage Habits to get started."
2. **First Log:** Don't show pattern analysis until 7+ logs with notes exist.
3. **Deleted Google Sheet:** Detect missing sheet and offer to create a new one.
4. **Extremely Long Notes:** Warn user if notes exceed 5000 characters.
5. **Browser Storage Full:** Show error message asking user to free up browser storage.
6. **Unsupported Browser:** Detect and show message recommending modern browser.

## 13. Success Metrics

### 13.1 Primary Metrics

1. **Daily Active Usage:** User logs habits at least 25 out of 30 days after starting.
2. **Data Integrity:** Zero data loss incidents; all logs successfully sync to Google Sheets.
3. **Note Insights Value:** Users with 7+ log entries view the pattern analysis at least once per week.
4. **Task Completion:** User can add a habit, log it daily, and view progress without encountering errors.

### 13.2 Secondary Metrics

1. **Time to First Log:** Average time from landing page to first habit log is under 2 minutes.
2. **Session Duration:** Average daily session is 1-3 minutes (indicating efficient logging).
3. **Habit Retention:** Users maintain at least 3 active habits over 30 days.
4. **Feature Usage:** At least 50% of users add notes when logging habits.

### 13.3 Performance Metrics

1. **Load Time:** Initial app load under 3 seconds on 4G mobile.
2. **Sync Success Rate:** 99%+ sync success rate.
3. **Offline Capability:** App remains functional 100% of the time when offline.

## 14. Acceptance Criteria

### 14.1 Authentication & Setup

- [ ] User can see welcome page explaining app functionality before login
- [ ] User can log in with Google account
- [ ] App requests only minimal permissions (spreadsheet access)
- [ ] App automatically creates Google Sheet on first login
- [ ] Google Sheet appears in user's Google Drive with appropriate name

### 14.2 Habit Management

- [ ] User can add new habits with name and optional category
- [ ] User can edit existing habit names and categories
- [ ] User cannot create duplicate habit names
- [ ] Habit names are limited to 100 characters
- [ ] User can remove habits (marked as inactive, data retained)
- [ ] Empty state is shown when no habits exist

### 14.3 Daily Logging

- [ ] User can see all active habits on daily log screen
- [ ] Each habit has a toggle switch for done/not done
- [ ] Current date is clearly displayed
- [ ] User can add optional notes in shared text field
- [ ] Changes save immediately to local storage
- [ ] Changes sync to Google Sheets when online
- [ ] User can navigate to previous days (up to 5 days back)
- [ ] Past dates show existing log data if available
- [ ] Visual distinction between done, not done, and no data

### 14.4 Progress & Analytics

- [ ] User can view list of all habits with summary statistics
- [ ] Each habit shows current streak and longest streak
- [ ] Each habit shows completion percentage as fraction and percentage
- [ ] Percentage calculation excludes "no data" days
- [ ] User can expand habit to see detailed view
- [ ] Notes pattern analysis appears after 7+ logs with notes
- [ ] Pattern analysis updates in real-time with new logs
- [ ] Historical notes display with dates in reverse chronological order

### 14.5 Offline & Sync

- [ ] App functions fully when offline
- [ ] Offline indicator is shown when no internet connection
- [ ] Changes made offline are queued
- [ ] Changes automatically sync when connection restored
- [ ] Sync indicator shows when syncing is in progress
- [ ] Sync errors display user-friendly messages with retry option

### 14.6 Design & UX

- [ ] App uses mobile-first responsive design
- [ ] App works on both mobile and desktop browsers
- [ ] Design is minimal and clean with white space
- [ ] Top navigation bar with Daily Log, Progress, and Manage Habits
- [ ] Touch targets are at least 44x44 pixels
- [ ] Font size is at least 16px for body text
- [ ] WCAG 2.1 AA contrast standards are met

### 14.7 Security & Privacy

- [ ] All API communication uses HTTPS
- [ ] OAuth tokens are stored securely
- [ ] App only accesses the one Google Sheet it creates
- [ ] Privacy policy page is accessible
- [ ] Terms of service page is accessible
- [ ] Welcome page clearly explains data storage

### 14.8 30-Day Sustained Usage

- [ ] User continues to use app daily for 30+ consecutive days
- [ ] No data loss occurs during 30-day period
- [ ] User finds value in progress tracking and note insights

## 15. Open Questions

1. **Notes Pattern Analysis Implementation:** Should we use a third-party NLP library or build a simple keyword/sentiment analyzer in-house? What level of accuracy is acceptable?

2. **Google Sheets Performance:** With 1000+ log entries, what is the acceptable lag time for loading the progress screen? Should we implement pagination?

3. **Future Multi-Device Sync:** While out of scope now, should the data structure be designed with real-time multi-device sync in mind for future iterations?

4. **Category Management:** Should there be a predefined list of suggested categories, or is completely free-form user input preferred?

5. **Streak Calculation Logic:** If a user back-dates a missed habit, should it affect their current streak, or should streaks only count forward from today?

6. **Google Sheet Permissions:** Should the app check if the user has accidentally moved/deleted the Google Sheet and handle gracefully?

7. **Data Retention:** Should there be a limit on how far back data is retained (e.g., 1 year), or keep all data indefinitely?

8. **Export/Backup:** While out of scope, should the app provide a one-click "duplicate Google Sheet" backup option for safety?

9. **Tutorial/Onboarding:** Should there be an interactive tutorial on first use, or is the empty state messaging sufficient?

10. **Dark Mode:** Should the app support a dark mode toggle, or is light mode sufficient for MVP?

---

## Document Version

- **Version:** 1.0
- **Date:** 2025-10-13
- **Author:** Product Requirements
- **Status:** Ready for Development
