# Task List: Habit Tracker Web Application

Based on PRD: `0001-prd-habit-tracker.md`

## Relevant Files

### Source Code

#### Core Application
- `src/index.html` - Main HTML entry point
- `src/main.js` or `src/main.ts` - Application entry point and initialization
- `src/App.js` or `src/App.tsx` - Root application component
- `src/router.js` or `src/router.ts` - Client-side routing configuration
- `src/config.js` or `src/config.ts` - Application configuration and constants

#### Authentication
- `src/services/auth.js` or `src/services/auth.ts` - Google OAuth authentication service
- `src/services/googleSheets.js` or `src/services/googleSheets.ts` - Google Sheets API integration
- `src/components/ProtectedRoute.js` or `src/components/ProtectedRoute.tsx` - Route protection wrapper
- `src/utils/tokenManager.js` or `src/utils/tokenManager.ts` - OAuth token management utilities

#### Data Layer & Storage
- `src/models/Habit.js` or `src/types/habit.ts` - Habit entity model/interface
- `src/models/LogEntry.js` or `src/types/logEntry.ts` - Log entry entity model/interface
- `src/models/Metadata.js` or `src/types/metadata.ts` - Metadata entity model/interface
- `src/services/storage.js` or `src/services/storage.ts` - Local storage wrapper (IndexedDB/localStorage)
- `src/services/syncService.js` or `src/services/syncService.ts` - Sync logic between local and Google Sheets
- `src/services/syncQueue.js` or `src/services/syncQueue.ts` - Offline change queue management
- `src/utils/dataValidation.js` or `src/utils/dataValidation.ts` - Data validation utilities
- `src/utils/uuid.js` or `src/utils/uuid.ts` - UUID generation utility

#### Components - Pages/Screens
- `src/pages/WelcomePage.js` or `src/pages/WelcomePage.tsx` - Landing/welcome page
- `src/pages/DailyLogPage.js` or `src/pages/DailyLogPage.tsx` - Daily logging screen
- `src/pages/ProgressPage.js` or `src/pages/ProgressPage.tsx` - Progress and analytics screen
- `src/pages/ManageHabitsPage.js` or `src/pages/ManageHabitsPage.tsx` - Habit management screen
- `src/pages/PrivacyPolicyPage.js` or `src/pages/PrivacyPolicyPage.tsx` - Privacy policy page
- `src/pages/TermsOfServicePage.js` or `src/pages/TermsOfServicePage.tsx` - Terms of service page

#### Components - UI Components
- `src/components/Navigation.js` or `src/components/Navigation.tsx` - Top navigation bar
- `src/components/ToggleSwitch.js` or `src/components/ToggleSwitch.tsx` - Custom toggle switch component
- `src/components/HabitListItem.js` or `src/components/HabitListItem.tsx` - Habit list item component
- `src/components/HabitForm.js` or `src/components/HabitForm.tsx` - Add/edit habit form
- `src/components/DateNavigator.js` or `src/components/DateNavigator.tsx` - Date navigation component
- `src/components/SyncIndicator.js` or `src/components/SyncIndicator.tsx` - Sync status indicator
- `src/components/OfflineIndicator.js` or `src/components/OfflineIndicator.tsx` - Offline status indicator
- `src/components/ProgressCard.js` or `src/components/ProgressCard.tsx` - Expandable progress card component
- `src/components/NotesHistory.js` or `src/components/NotesHistory.tsx` - Notes history display component
- `src/components/ErrorMessage.js` or `src/components/ErrorMessage.tsx` - Error message component
- `src/components/EmptyState.js` or `src/components/EmptyState.tsx` - Empty state component
- `src/components/Footer.js` or `src/components/Footer.tsx` - Footer with links

#### Business Logic & Analytics
- `src/utils/streakCalculator.js` or `src/utils/streakCalculator.ts` - Streak calculation logic
- `src/utils/percentageCalculator.js` or `src/utils/percentageCalculator.ts` - Completion percentage logic
- `src/utils/notesAnalyzer.js` or `src/utils/notesAnalyzer.ts` - Notes pattern analysis and sentiment analysis
- `src/utils/dateHelpers.js` or `src/utils/dateHelpers.ts` - Date manipulation utilities
- `src/utils/conflictResolver.js` or `src/utils/conflictResolver.ts` - Sync conflict resolution logic

#### State Management (if using)
- `src/store/index.js` or `src/store/index.ts` - State store configuration
- `src/store/habitStore.js` or `src/store/habitStore.ts` - Habit state management
- `src/store/logStore.js` or `src/store/logStore.ts` - Log state management
- `src/store/authStore.js` or `src/store/authStore.ts` - Authentication state
- `src/contexts/AppContext.js` or `src/contexts/AppContext.tsx` - React Context (if using React)

#### Styles
- `src/styles/main.css` or `src/styles/main.scss` - Main stylesheet
- `src/styles/variables.css` - CSS variables for colors, spacing, etc.
- `src/styles/components.css` - Component-specific styles
- `src/styles/responsive.css` - Responsive design breakpoints and mobile styles
- `tailwind.config.js` - Tailwind CSS configuration (if using Tailwind)

### Testing

#### Unit Tests
- `src/services/auth.test.js` or `src/services/auth.test.ts` - Authentication service tests
- `src/services/storage.test.js` or `src/services/storage.test.ts` - Storage service tests
- `src/services/syncService.test.js` or `src/services/syncService.test.ts` - Sync service tests
- `src/utils/streakCalculator.test.js` or `src/utils/streakCalculator.test.ts` - Streak calculation tests
- `src/utils/percentageCalculator.test.js` or `src/utils/percentageCalculator.test.ts` - Percentage calculation tests
- `src/utils/notesAnalyzer.test.js` or `src/utils/notesAnalyzer.test.ts` - Notes analysis tests
- `src/utils/dataValidation.test.js` or `src/utils/dataValidation.test.ts` - Validation tests
- `src/utils/conflictResolver.test.js` or `src/utils/conflictResolver.test.ts` - Conflict resolution tests

#### Component Tests
- `src/components/ToggleSwitch.test.js` or `src/components/ToggleSwitch.test.tsx` - Toggle switch tests
- `src/components/HabitForm.test.js` or `src/components/HabitForm.test.tsx` - Habit form tests
- `src/components/DateNavigator.test.js` or `src/components/DateNavigator.test.tsx` - Date navigator tests
- `src/components/ProgressCard.test.js` or `src/components/ProgressCard.test.tsx` - Progress card tests

#### Integration Tests
- `tests/integration/auth-flow.test.js` - Authentication flow integration tests
- `tests/integration/habit-management.test.js` - Habit CRUD integration tests
- `tests/integration/daily-logging.test.js` - Daily logging integration tests
- `tests/integration/sync.test.js` - Sync functionality integration tests

#### End-to-End Tests
- `tests/e2e/first-time-user.spec.js` - First-time user flow E2E test
- `tests/e2e/daily-logging.spec.js` - Daily logging flow E2E test
- `tests/e2e/habit-management.spec.js` - Habit management E2E test
- `tests/e2e/progress-view.spec.js` - Progress viewing E2E test
- `tests/e2e/offline-sync.spec.js` - Offline and sync E2E test
- `tests/e2e/back-dating.spec.js` - Back-dating functionality E2E test

### Configuration & Infrastructure

#### Build & Development
- `package.json` - NPM dependencies and scripts
- `vite.config.js` or `webpack.config.js` - Build tool configuration
- `tsconfig.json` - TypeScript configuration (if using TypeScript)
- `.eslintrc.js` or `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier code formatting configuration
- `.env.example` - Example environment variables
- `.env.local` - Local environment variables (not committed)
- `.gitignore` - Git ignore file

#### PWA & Service Worker
- `public/manifest.json` - PWA manifest file
- `public/service-worker.js` - Service worker for offline functionality and caching
- `public/icons/` - PWA icon assets (various sizes)

#### Testing Configuration
- `jest.config.js` or `vitest.config.js` - Test runner configuration
- `playwright.config.js` or `cypress.config.js` - E2E testing framework configuration

#### Deployment & CI/CD
- `app.yaml` - Google App Engine configuration (if using App Engine)
- `Dockerfile` - Docker container configuration (if using Cloud Run)
- `.gcloudignore` - Files to ignore when deploying to GCP
- `.github/workflows/ci.yml` - GitHub Actions CI/CD pipeline (optional)
- `.github/workflows/deploy.yml` - Deployment workflow (optional)
- `cloudbuild.yaml` - Google Cloud Build configuration (alternative CI/CD)

### Documentation

- `README.md` - Project overview, setup instructions, and development guide
- `docs/SETUP.md` - Detailed setup and installation instructions
- `docs/ARCHITECTURE.md` - Architecture and design decisions documentation
- `docs/API.md` - Google Sheets API integration documentation
- `docs/USER_GUIDE.md` - User guide for the application
- `docs/DEPLOYMENT.md` - Deployment instructions for GCP
- `PRIVACY_POLICY.md` - Privacy policy content
- `TERMS_OF_SERVICE.md` - Terms of service content

### Notes

- Choose either TypeScript (`.ts`/`.tsx`) or JavaScript (`.js`/`.jsx`) based on preference - TypeScript recommended for better type safety
- Component file extensions depend on chosen framework (`.jsx`/`.tsx` for React, `.vue` for Vue, `.js` for vanilla)
- Test files should be colocated with source files or in a separate `tests/` directory
- Use appropriate test runner: Jest/Vitest for unit tests, Cypress/Playwright for E2E tests
- Service worker can be generated automatically by build tools (Vite PWA plugin, Workbox)
- IndexedDB is recommended over localStorage for better performance with larger datasets
- Consider using libraries: `date-fns` or `day.js` for dates, `compromise` or `ml-sentiment` for NLP

---

## Tasks

- [x] 1.0 Project Setup & Configuration
  - [x] 1.1 Initialize new project with chosen build tool (Vite recommended for modern SPA)
  - [x] 1.2 Create `package.json` and install core dependencies (framework, router, date library)
  - [x] 1.3 Install Google API dependencies (`gapi-script` or `@react-oauth/google`, Google Sheets API client)
  - [x] 1.4 Set up TypeScript configuration (recommended) or JavaScript with JSDoc
  - [x] 1.5 Configure ESLint and Prettier for code quality
  - [x] 1.6 Create folder structure (`src/pages/`, `src/components/`, `src/services/`, `src/utils/`, `src/types/`, `src/styles/`)
  - [x] 1.7 Set up environment variables file (`.env.example` with `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_API_KEY`)
  - [x] 1.8 Configure PWA plugin/settings for offline capability and installability
  - [x] 1.9 Create PWA manifest file (`public/manifest.json`) with app metadata and icons
  - [x] 1.10 Set up service worker configuration for offline caching
  - [x] 1.11 Configure client-side routing (React Router, Vue Router, or vanilla routing)
  - [x] 1.12 Create basic HTML entry point (`index.html`) with viewport meta tags
  - [x] 1.13 Set up main CSS file with CSS variables for colors, spacing, typography
  - [x] 1.14 Add `.gitignore` file (ignore `node_modules/`, `.env.local`, `dist/`, `.DS_Store`)
  - [x] 1.15 Initialize git repository and make initial commit
  - [x] 1.16 Test: Verify development server runs and displays basic page

- [x] 2.0 Authentication & Google Integration
  - [x] 2.1 Create Google Cloud Console project at console.cloud.google.com
  - [x] 2.2 Enable Google Sheets API and Google Drive API in the Cloud Console
  - [x] 2.3 Configure OAuth consent screen (app name, logo, scopes, privacy policy URL)
  - [x] 2.4 Create OAuth 2.0 client ID credentials for web application
  - [x] 2.5 Add authorized JavaScript origins and redirect URIs
  - [x] 2.6 Create authentication service (`src/services/auth.ts`) with Google Identity Services
  - [x] 2.7 Implement `login()` function that initiates Google OAuth flow with required scopes
  - [x] 2.8 Implement `logout()` function to clear authentication state
  - [x] 2.9 Implement `getAccessToken()` function to retrieve current access token
  - [x] 2.10 Implement `isAuthenticated()` function to check authentication status
  - [x] 2.11 Create token manager utility (`src/utils/tokenManager.ts`) for secure token storage in memory
  - [x] 2.12 Implement automatic token refresh before expiration
  - [x] 2.13 Create Google Sheets service (`src/services/googleSheets.ts`) with API client initialization
  - [x] 2.14 Implement `createNewSheet(sheetName)` function to create Google Sheet in user's Drive
  - [x] 2.15 Implement `initializeSheetStructure(sheetId)` to create Habits, Logs, and Metadata tabs
  - [x] 2.16 Implement `checkSheetExists(sheetId)` to verify sheet accessibility
  - [x] 2.17 Implement batch read operations (`readHabits()`, `readLogs()`, `readMetadata()`)
  - [x] 2.18 Implement batch write operations (`writeHabits()`, `writeLogs()`, `writeMetadata()`)
  - [x] 2.19 Create protected route component/logic to redirect unauthenticated users to welcome page
  - [x] 2.20 Handle OAuth errors gracefully (insufficient permissions, user denial, network errors)
  - [x] 2.21 Test: Verify OAuth flow works end-to-end
  - [x] 2.22 Test: Verify token refresh works automatically
  - [x] 2.23 Test: Verify Google Sheet creation and tab initialization

- [x] 3.0 Data Layer & Offline Storage
  - [x] 3.1 Define TypeScript interfaces or JSDoc types for Habit entity (habit_id, name, category, status, created_date, modified_date)
  - [x] 3.2 Define TypeScript interfaces or JSDoc types for LogEntry entity (log_id, habit_id, date, status, notes, timestamp)
  - [x] 3.3 Define TypeScript interfaces or JSDoc types for Metadata entity (sheet_version, last_sync, user_id, sheet_id)
  - [x] 3.4 Create storage service (`src/services/storage.js`) using IndexedDB (recommended) or localStorage
  - [x] 3.5 Implement `initDB()` function to initialize IndexedDB with object stores for habits, logs, metadata
  - [x] 3.6 Implement `saveHabits(habits)` function to save habits to local storage
  - [x] 3.7 Implement `getHabits()` function to retrieve all habits from local storage
  - [x] 3.8 Implement `saveHabit(habit)` function to save single habit
  - [x] 3.9 Implement `deleteHabit(habitId)` function to mark habit as inactive
  - [x] 3.10 Implement `saveLogs(logs)` function to save log entries to local storage
  - [x] 3.11 Implement `getLogs(habitId?, date?)` function to retrieve logs with optional filters
  - [x] 3.12 Implement `saveLog(log)` function to save single log entry
  - [x] 3.13 Implement `saveMetadata(metadata)` function to save app metadata
  - [x] 3.14 Implement `getMetadata()` function to retrieve metadata
  - [x] 3.15 Create sync queue service (`src/services/syncQueue.js`) to track pending changes
  - [x] 3.16 Implement `addToQueue(operation, data)` to queue offline changes
  - [x] 3.17 Implement `getQueue()` to retrieve all pending operations
  - [x] 3.18 Implement `clearQueue()` after successful sync
  - [x] 3.19 Create sync service (`src/services/syncService.js`) to coordinate local and remote data
  - [x] 3.20 Implement `syncToRemote()` function to push local changes to Google Sheets
  - [x] 3.21 Implement `syncFromRemote()` function to pull changes from Google Sheets to local storage
  - [x] 3.22 Implement `fullSync()` function for complete bidirectional sync
  - [x] 3.23 Implement conflict resolution using last-write-wins strategy (compare timestamps)
  - [x] 3.24 Implement automatic sync retry with exponential backoff (30s, 60s, 120s intervals)
  - [x] 3.25 Add network status detection (online/offline event listeners)
  - [x] 3.26 Implement sync on online event when connection is restored
  - [x] 3.27 Create data validation utility (`src/utils/dataValidation.js`) for input validation
  - [x] 3.28 Implement habit name validation (1-100 chars, no duplicates, case-insensitive)
  - [x] 3.29 Implement date validation (ISO 8601 format, not more than 5 days in past)
  - [x] 3.30 Implement notes validation (max 5000 characters)
  - [x] 3.31 Create UUID utility (`src/utils/uuid.js`) for generating unique IDs
  - [x] 3.32 Test: Verify local storage CRUD operations work correctly
  - [x] 3.33 Test: Verify sync queue adds and processes operations correctly
  - [x] 3.34 Test: Verify sync service handles online/offline transitions
  - [x] 3.35 Test: Verify conflict resolution works with last-write-wins logic
  - [x] 3.36 Test: Verify data validation catches invalid inputs

- [x] 4.0 Core Features - Habit Management
  - [x] 4.1 Create ManageHabitsPage component (`src/pages/ManageHabitsPage.tsx`)
  - [x] 4.2 Create HabitForm component (`src/components/HabitForm.tsx`) for adding/editing habits
  - [x] 4.3 Implement form fields: habit name input (max 100 chars with counter), category input
  - [x] 4.4 Implement form validation: required name, character limit, no empty strings
  - [x] 4.5 Implement duplicate name check (case-insensitive) before saving
  - [x] 4.6 Display inline validation errors ("Habit name cannot be empty", "Habit already exists")
  - [x] 4.7 Implement "Add Habit" button that saves new habit to local storage and triggers sync
  - [x] 4.8 Generate UUID for new habits using UUID utility
  - [x] 4.9 Set created_date and modified_date timestamps (ISO 8601 format)
  - [x] 4.10 Create HabitListItem component (`src/components/HabitListItem.tsx`) for displaying habits
  - [x] 4.11 Display habit name, category (if present), and action buttons (edit, remove)
  - [x] 4.12 Implement edit functionality: populate form with existing habit data
  - [x] 4.13 Update modified_date timestamp when editing habits
  - [x] 4.14 Implement remove/delete functionality: mark habit status as 'inactive' (not permanent delete)
  - [x] 4.15 Show confirmation prompt before removing habit ("Are you sure?")
  - [x] 4.16 Create empty state component for when no habits exist ("You haven't added any habits yet...")
  - [x] 4.17 Display list of all active habits (status === 'active') sorted by created_date
  - [x] 4.18 Implement category badge/tag display for visual organization
  - [x] 4.19 Add optimistic UI updates (show changes immediately, sync in background)
  - [x] 4.20 Display sync status indicator during save operations
  - [x] 4.21 Handle sync errors gracefully with retry option
  - [x] 4.22 Test: Add a new habit and verify it appears in list
  - [x] 4.23 Test: Edit an existing habit and verify changes are saved
  - [x] 4.24 Test: Remove a habit and verify it's marked inactive (not visible, but data retained)
  - [x] 4.25 Test: Verify duplicate habit names are rejected
  - [x] 4.26 Test: Verify character limit validation works (100 chars)
  - [x] 4.27 Test: Verify empty state displays when no habits exist

- [ ] 5.0 Core Features - Daily Logging Interface
  - [ ] 5.1 Create DailyLogPage component (`src/pages/DailyLogPage.js`)
  - [ ] 5.2 Create ToggleSwitch component (`src/components/ToggleSwitch.js`) with accessible markup
  - [ ] 5.3 Style toggle switch: large touch target (min 44x44px), clear on/off states, smooth animation
  - [ ] 5.4 Ensure toggle is keyboard accessible (tab navigation, space/enter to toggle)
  - [ ] 5.5 Add ARIA labels for screen reader accessibility
  - [ ] 5.6 Create DateNavigator component (`src/components/DateNavigator.js`) for date selection
  - [ ] 5.7 Display current selected date prominently (e.g., "Today, October 13" or "October 12, 2025")
  - [ ] 5.8 Implement "Previous Day" button to go back one day (up to 5 days in past)
  - [ ] 5.9 Implement "Today" button to return to current date
  - [ ] 5.10 Disable "Previous Day" button when at 5-day limit
  - [ ] 5.11 Use date utility functions for date manipulation (add/subtract days)
  - [ ] 5.12 Display all active habits with toggle switches for the selected date
  - [ ] 5.13 Load existing log data for selected date from local storage
  - [ ] 5.14 Display visual distinction: done (toggle on), not done (toggle off), no data (default state)
  - [ ] 5.15 Implement toggle handler that creates/updates log entry immediately
  - [ ] 5.16 Generate UUID for new log entries
  - [ ] 5.17 Set date field to selected date (ISO 8601 YYYY-MM-DD format)
  - [ ] 5.18 Set timestamp to current time when log is created/modified
  - [ ] 5.19 Create shared notes text field (textarea) below habit list
  - [ ] 5.20 Implement notes field with character counter (5000 max)
  - [ ] 5.21 Save notes with log entries (shared notes applied to all habits logged in session)
  - [ ] 5.22 Make notes optional (allow logging without notes)
  - [ ] 5.23 Implement optimistic UI updates (toggle responds immediately)
  - [ ] 5.24 Save changes to local storage immediately after toggle/notes change
  - [ ] 5.25 Trigger background sync to Google Sheets after changes
  - [ ] 5.26 Implement unsaved changes detection when navigating away from date
  - [ ] 5.27 Show prompt if user tries to change date with unsaved notes
  - [ ] 5.28 Add loading state when fetching data for past dates
  - [ ] 5.29 Display empty state if no habits exist ("Go to Manage Habits to add your first habit")
  - [ ] 5.30 Handle errors gracefully (sync failures, storage errors)
  - [ ] 5.31 Test: Toggle habit to "done" and verify it saves locally and syncs
  - [ ] 5.32 Test: Toggle habit to "not done" and verify state change
  - [ ] 5.33 Test: Navigate to previous day and verify existing data loads
  - [ ] 5.34 Test: Verify cannot navigate more than 5 days in past
  - [ ] 5.35 Test: Add notes and verify they save with log entries
  - [ ] 5.36 Test: Navigate between dates with unsaved changes and verify prompt appears
  - [ ] 5.37 Test: Verify keyboard navigation works for toggles
  - [ ] 5.38 Test: Verify toggle switches meet 44x44px minimum touch target

- [ ] 6.0 Core Features - Progress & Analytics
  - [ ] 6.1 Create ProgressPage component (`src/pages/ProgressPage.js`)
  - [ ] 6.2 Create ProgressCard component (`src/components/ProgressCard.js`) for expandable habit items
  - [ ] 6.3 Create streak calculator utility (`src/utils/streakCalculator.js`)
  - [ ] 6.4 Implement `calculateCurrentStreak(logs)` function to compute consecutive "done" days from today backward
  - [ ] 6.5 Implement `calculateLongestStreak(logs)` function to find longest streak in all history
  - [ ] 6.6 Handle streak reset when "not_done" is logged (reset to 0)
  - [ ] 6.7 Create percentage calculator utility (`src/utils/percentageCalculator.js`)
  - [ ] 6.8 Implement `calculateCompletionPercentage(logs)` function
  - [ ] 6.9 Calculate percentage as: (done count / total logged days) × 100
  - [ ] 6.10 Exclude "no_data" days from calculation (only count done/not_done)
  - [ ] 6.11 Return both fraction format (e.g., "17/20 days") and percentage (e.g., "85%")
  - [ ] 6.12 Fetch all active habits and their log entries from local storage
  - [ ] 6.13 Display habits in list view with summary statistics visible
  - [ ] 6.14 For each habit, display: name, category, current streak, longest streak, completion percentage
  - [ ] 6.15 Format display as: "Current: 7 days | Best: 12 days | 17/20 days - 85%"
  - [ ] 6.16 Implement expandable/collapsible functionality (click to expand habit details)
  - [ ] 6.17 Show expand/collapse icon or affordance
  - [ ] 6.18 Create NotesHistory component (`src/components/NotesHistory.js`) for displaying historical notes
  - [ ] 6.19 Fetch all log entries with notes for selected habit
  - [ ] 6.20 Display notes in reverse chronological order (newest first)
  - [ ] 6.21 Show date and time alongside each note entry
  - [ ] 6.22 Format timestamps in readable format (e.g., "Oct 12, 2025 at 9:30 AM")
  - [ ] 6.23 Create notes analyzer utility (`src/utils/notesAnalyzer.js`) for pattern analysis
  - [ ] 6.24 Install sentiment analysis library (compromise.js or ml-sentiment)
  - [ ] 6.25 Implement `analyzeNotes(logs)` function that takes logs with notes
  - [ ] 6.26 Extract keywords from notes using simple NLP (word frequency, remove stop words)
  - [ ] 6.27 Perform sentiment analysis (positive/negative/neutral)
  - [ ] 6.28 Identify correlations: "When you [habit status], you feel [sentiment]"
  - [ ] 6.29 Generate summary text (e.g., "When you complete this habit, you often mention feeling energized and positive")
  - [ ] 6.30 Only show pattern analysis if habit has 7+ log entries with notes
  - [ ] 6.31 Display pattern analysis summary in expanded habit view
  - [ ] 6.32 Update analysis in real-time when new logs with notes are added
  - [ ] 6.33 Show placeholder message if insufficient data for analysis ("Add notes to at least 7 logs to see patterns")
  - [ ] 6.34 Handle empty notes gracefully (skip in analysis)
  - [ ] 6.35 Add loading state when calculating analytics for large datasets
  - [ ] 6.36 Display "No habits to display" message if no active habits
  - [ ] 6.37 Test: Verify current streak calculates correctly for consecutive done days
  - [ ] 6.38 Test: Verify streak resets to 0 when habit marked not done
  - [ ] 6.39 Test: Verify longest streak finds maximum streak in history
  - [ ] 6.40 Test: Verify completion percentage excludes "no_data" days
  - [ ] 6.41 Test: Verify completion percentage calculation is accurate (17/20 = 85%)
  - [ ] 6.42 Test: Verify notes display in reverse chronological order
  - [ ] 6.43 Test: Verify pattern analysis appears after 7+ notes entries
  - [ ] 6.44 Test: Verify pattern analysis generates meaningful insights
  - [ ] 6.45 Test: Verify expand/collapse functionality works smoothly

- [ ] 7.0 UI/UX & Responsive Design
  - [ ] 7.1 Create Navigation component (`src/components/Navigation.js`) for top navigation bar
  - [ ] 7.2 Implement top nav with three menu items: "Daily Log" (default), "Progress", "Manage Habits"
  - [ ] 7.3 Add active state styling to highlight current page
  - [ ] 7.4 Make navigation fixed/sticky at top on mobile
  - [ ] 7.5 Ensure navigation is accessible (semantic HTML, ARIA labels)
  - [ ] 7.6 Create WelcomePage component (`src/pages/WelcomePage.js`) for landing page
  - [ ] 7.7 Add compelling hero section explaining app functionality
  - [ ] 7.8 Emphasize simplicity and data ownership in copy
  - [ ] 7.9 Clearly state "All data stored in YOUR Google Drive"
  - [ ] 7.10 Add prominent "Log in with Google" button
  - [ ] 7.11 Create Footer component (`src/components/Footer.js`) with links
  - [ ] 7.12 Add links to Privacy Policy and Terms of Service in footer
  - [ ] 7.13 Create PrivacyPolicyPage component (`src/pages/PrivacyPolicyPage.js`)
  - [ ] 7.14 Write privacy policy content explaining data collection and storage
  - [ ] 7.15 Include GDPR compliance statements (user data ownership, deletion rights)
  - [ ] 7.16 Create TermsOfServicePage component (`src/pages/TermsOfServicePage.js`)
  - [ ] 7.17 Write terms of service content (basic terms, liability, usage rights)
  - [ ] 7.18 Create SyncIndicator component (`src/components/SyncIndicator.js`)
  - [ ] 7.19 Show spinning icon or animation when sync is in progress
  - [ ] 7.20 Show success checkmark when sync completes
  - [ ] 7.21 Show error state with "Retry" button if sync fails
  - [ ] 7.22 Create OfflineIndicator component (`src/components/OfflineIndicator.js`)
  - [ ] 7.23 Display banner/badge when app is offline ("You're offline. Changes will sync when online.")
  - [ ] 7.24 Hide indicator when back online
  - [ ] 7.25 Create ErrorMessage component (`src/components/ErrorMessage.js`) for consistent error display
  - [ ] 7.26 Support different error types: auth errors, sync errors, validation errors
  - [ ] 7.27 Include retry button where appropriate
  - [ ] 7.28 Create EmptyState component (`src/components/EmptyState.js`) for reusable empty states
  - [ ] 7.29 Support different messages and call-to-action buttons for various contexts
  - [ ] 7.30 Implement mobile-first CSS: start with mobile styles (320px+), then add desktop breakpoints
  - [ ] 7.31 Set up CSS breakpoint at 768px for tablet/desktop styles
  - [ ] 7.32 Use single column layout on mobile, optional wider layout (max 800px centered) on desktop
  - [ ] 7.33 Ensure all interactive elements have min 44x44px touch targets on mobile
  - [ ] 7.34 Set base font size to 16px (prevents iOS zoom on input focus)
  - [ ] 7.35 Implement generous padding and margins for easy touch interaction
  - [ ] 7.36 Style toggle switches with clear on/off states, smooth transitions
  - [ ] 7.37 Use minimal color palette: neutral grays with one accent color (e.g., blue or green)
  - [ ] 7.38 Implement ample white space throughout design
  - [ ] 7.39 Use clean, readable sans-serif font (system font stack or Inter/Roboto)
  - [ ] 7.40 Test color contrast ratios meet WCAG 2.1 AA standards (4.5:1 for text, 3:1 for UI components)
  - [ ] 7.41 Add focus visible styles for keyboard navigation
  - [ ] 7.42 Test keyboard navigation: tab through interactive elements, enter/space to activate
  - [ ] 7.43 Add proper ARIA labels and roles for screen readers
  - [ ] 7.44 Test with screen reader (VoiceOver on macOS/iOS, NVDA on Windows)
  - [ ] 7.45 Ensure form inputs have associated <label> elements
  - [ ] 7.46 Add loading states with spinners or skeletons for async operations
  - [ ] 7.47 Implement smooth transitions and animations (prefer CSS animations over JS)
  - [ ] 7.48 Test responsive design on multiple screen sizes (320px, 375px, 768px, 1024px, 1440px)
  - [ ] 7.49 Test on actual mobile devices (iOS and Android) if possible
  - [ ] 7.50 Test hover states work on desktop, don't interfere on mobile
  - [ ] 7.51 Optimize for performance: minimize CSS, use efficient selectors
  - [ ] 7.52 Test: Verify app looks good on iPhone SE (320px wide)
  - [ ] 7.53 Test: Verify app looks good on standard phone (375px-414px)
  - [ ] 7.54 Test: Verify app looks good on tablet (768px+)
  - [ ] 7.55 Test: Verify app looks good on desktop (1024px+)
  - [ ] 7.56 Test: Verify all touch targets are at least 44x44px
  - [ ] 7.57 Test: Verify contrast ratios pass WCAG AA standards
  - [ ] 7.58 Test: Verify keyboard navigation works throughout app

- [ ] 8.0 Testing & Quality Assurance
  - [ ] 8.1 Set up testing framework (Jest/Vitest for unit tests)
  - [ ] 8.2 Configure test environment and test utilities
  - [ ] 8.3 Set up E2E testing framework (Playwright or Cypress)
  - [ ] 8.4 Write unit tests for authentication service (`auth.test.js`)
  - [ ] 8.5 Test: login() initiates OAuth flow correctly
  - [ ] 8.6 Test: logout() clears authentication state
  - [ ] 8.7 Test: Token refresh works automatically before expiration
  - [ ] 8.8 Write unit tests for storage service (`storage.test.js`)
  - [ ] 8.9 Test: Habits can be saved and retrieved from local storage
  - [ ] 8.10 Test: Logs can be saved and retrieved with filters
  - [ ] 8.11 Test: Metadata saves and retrieves correctly
  - [ ] 8.12 Write unit tests for sync service (`syncService.test.js`)
  - [ ] 8.13 Test: Sync queue adds operations correctly
  - [ ] 8.14 Test: Sync processes queue and pushes to Google Sheets
  - [ ] 8.15 Test: Conflict resolution uses last-write-wins strategy
  - [ ] 8.16 Test: Automatic retry works with exponential backoff
  - [ ] 8.17 Write unit tests for streak calculator (`streakCalculator.test.js`)
  - [ ] 8.18 Test: Current streak calculates correctly for consecutive done days
  - [ ] 8.19 Test: Streak resets to 0 when not_done is logged
  - [ ] 8.20 Test: Longest streak finds maximum in history
  - [ ] 8.21 Test: Edge cases (no logs, all not done, gaps in data)
  - [ ] 8.22 Write unit tests for percentage calculator (`percentageCalculator.test.js`)
  - [ ] 8.23 Test: Percentage calculation excludes no_data days
  - [ ] 8.24 Test: Percentage rounds correctly
  - [ ] 8.25 Test: Returns both fraction and percentage format
  - [ ] 8.26 Write unit tests for notes analyzer (`notesAnalyzer.test.js`)
  - [ ] 8.27 Test: Keyword extraction identifies common words
  - [ ] 8.28 Test: Sentiment analysis detects positive/negative/neutral
  - [ ] 8.29 Test: Returns meaningful correlation text
  - [ ] 8.30 Test: Handles insufficient data gracefully
  - [ ] 8.31 Write unit tests for data validation (`dataValidation.test.js`)
  - [ ] 8.32 Test: Habit name validation rejects empty, too long, duplicates
  - [ ] 8.33 Test: Date validation accepts valid dates, rejects invalid
  - [ ] 8.34 Test: Notes validation enforces 5000 char limit
  - [ ] 8.35 Write component tests for ToggleSwitch (`ToggleSwitch.test.js`)
  - [ ] 8.36 Test: Toggle switches between on/off states
  - [ ] 8.37 Test: Toggle is keyboard accessible
  - [ ] 8.38 Test: Calls onChange handler with correct value
  - [ ] 8.39 Write component tests for HabitForm (`HabitForm.test.js`)
  - [ ] 8.40 Test: Form validation shows errors for invalid inputs
  - [ ] 8.41 Test: Form submits with valid data
  - [ ] 8.42 Test: Character counter updates correctly
  - [ ] 8.43 Write component tests for DateNavigator (`DateNavigator.test.js`)
  - [ ] 8.44 Test: Previous day button navigates backward
  - [ ] 8.45 Test: Previous day button disables at 5-day limit
  - [ ] 8.46 Test: Today button returns to current date
  - [ ] 8.47 Write component tests for ProgressCard (`ProgressCard.test.js`)
  - [ ] 8.48 Test: Card displays correct statistics
  - [ ] 8.49 Test: Card expands and collapses on click
  - [ ] 8.50 Test: Shows pattern analysis when available
  - [ ] 8.51 Write integration test for authentication flow (`auth-flow.test.js`)
  - [ ] 8.52 Test: Full OAuth flow from login to authenticated state
  - [ ] 8.53 Test: Google Sheet creation on first login
  - [ ] 8.54 Test: Sheet structure initialization (tabs and columns)
  - [ ] 8.55 Write integration test for habit management (`habit-management.test.js`)
  - [ ] 8.56 Test: Add habit → appears in list → syncs to Google Sheets
  - [ ] 8.57 Test: Edit habit → changes reflected → syncs to Google Sheets
  - [ ] 8.58 Test: Remove habit → marked inactive → data retained
  - [ ] 8.59 Write integration test for daily logging (`daily-logging.test.js`)
  - [ ] 8.60 Test: Toggle habit → saves locally → syncs to Google Sheets
  - [ ] 8.61 Test: Add notes → saves with log → syncs to Google Sheets
  - [ ] 8.62 Test: Navigate to past date → loads existing data
  - [ ] 8.63 Write integration test for sync functionality (`sync.test.js`)
  - [ ] 8.64 Test: Changes made offline → queue populates → syncs when online
  - [ ] 8.65 Test: Conflict resolution works correctly
  - [ ] 8.66 Test: Retry mechanism works after sync failure
  - [ ] 8.67 Write E2E test for first-time user flow (`first-time-user.spec.js`)
  - [ ] 8.68 Test: Visit app → see welcome page → login → sheet created → add habit → log habit
  - [ ] 8.69 Write E2E test for daily logging flow (`daily-logging.spec.js`)
  - [ ] 8.70 Test: Open app → see today's date → toggle habits → add notes → verify saved
  - [ ] 8.71 Write E2E test for habit management (`habit-management.spec.js`)
  - [ ] 8.72 Test: Navigate to manage habits → add habit → edit habit → remove habit
  - [ ] 8.73 Write E2E test for progress view (`progress-view.spec.js`)
  - [ ] 8.74 Test: Navigate to progress → see statistics → expand habit → view notes history
  - [ ] 8.75 Write E2E test for offline/sync (`offline-sync.spec.js`)
  - [ ] 8.76 Test: Go offline → make changes → go online → verify changes sync
  - [ ] 8.77 Write E2E test for back-dating (`back-dating.spec.js`)
  - [ ] 8.78 Test: Click previous day → navigate back 5 days → log habit → return to today
  - [ ] 8.79 Run performance testing with Lighthouse (target: 3s load time on 4G)
  - [ ] 8.80 Test with 50 habits and 1000+ log entries to verify performance
  - [ ] 8.81 Run accessibility audit with Lighthouse or axe DevTools
  - [ ] 8.82 Test with keyboard navigation only (no mouse)
  - [ ] 8.83 Test with screen reader (VoiceOver or NVDA)
  - [ ] 8.84 Test in Chrome, Firefox, Safari, Edge browsers
  - [ ] 8.85 Test on iOS Safari (iPhone) if possible
  - [ ] 8.86 Test on Android Chrome if possible
  - [ ] 8.87 Verify PWA installability on mobile devices
  - [ ] 8.88 Test offline functionality: cache assets, work without internet
  - [ ] 8.89 Achieve 80%+ code coverage with unit tests (target 85%)
  - [ ] 8.90 Document all known issues and edge cases in GitHub issues or TODO comments

- [ ] 9.0 Deployment & Documentation
  - [ ] 9.1 Create Google Cloud Platform (GCP) project for hosting
  - [ ] 9.2 Enable Cloud Run API (for containerized deployment) or App Engine
  - [ ] 9.3 Set up billing for GCP project
  - [ ] 9.4 Install and configure Google Cloud SDK (`gcloud` CLI)
  - [ ] 9.5 Create production environment variables file (`.env.production`)
  - [ ] 9.6 Set production Google OAuth client ID and API key
  - [ ] 9.7 Build production bundle (`npm run build` or `vite build`)
  - [ ] 9.8 Optimize build: minify JS/CSS, compress images, tree-shake dependencies
  - [ ] 9.9 Test production build locally to ensure it works
  - [ ] 9.10 Create `Dockerfile` for Cloud Run deployment (Node.js base, serve static files)
  - [ ] 9.11 OR create `app.yaml` for App Engine deployment (static file service)
  - [ ] 9.12 Configure environment variables in GCP (Cloud Run env vars or App Engine settings)
  - [ ] 9.13 Deploy to Cloud Run: `gcloud run deploy habit-tracker --source .`
  - [ ] 9.14 OR deploy to App Engine: `gcloud app deploy`
  - [ ] 9.15 Configure custom domain (optional): register domain, point DNS, add to GCP
  - [ ] 9.16 Enable HTTPS (Cloud Run provides this automatically)
  - [ ] 9.17 Update OAuth authorized origins and redirect URIs with production URL
  - [ ] 9.18 Test production deployment: verify all features work in production
  - [ ] 9.19 Set up error monitoring (Google Cloud Monitoring or Sentry)
  - [ ] 9.20 Configure logging for debugging issues in production
  - [ ] 9.21 Write comprehensive README.md with project overview
  - [ ] 9.22 Document prerequisites: Node.js version, npm/yarn, Google Cloud account
  - [ ] 9.23 Document local development setup: clone repo, install dependencies, set environment variables
  - [ ] 9.24 Document available npm scripts: `dev`, `build`, `test`, `lint`
  - [ ] 9.25 Create SETUP.md with detailed installation instructions
  - [ ] 9.26 Document how to create Google Cloud project and OAuth credentials
  - [ ] 9.27 Document how to set up local environment variables
  - [ ] 9.28 Document how to run tests and view coverage
  - [ ] 9.29 Create ARCHITECTURE.md documenting key design decisions
  - [ ] 9.30 Document SPA architecture, offline-first design, PWA features
  - [ ] 9.31 Document data flow: local storage ↔ sync service ↔ Google Sheets
  - [ ] 9.32 Document state management approach
  - [ ] 9.33 Create API.md documenting Google Sheets API integration
  - [ ] 9.34 Document sheet structure: Habits tab, Logs tab, Metadata tab
  - [ ] 9.35 Document batch read/write operations
  - [ ] 9.36 Document sync strategy and conflict resolution
  - [ ] 9.37 Create USER_GUIDE.md with end-user instructions
  - [ ] 9.38 Document how to get started: login, add habits, log daily
  - [ ] 9.39 Document all features: daily logging, back-dating, progress view, analytics
  - [ ] 9.40 Include screenshots or GIFs of key features
  - [ ] 9.41 Create DEPLOYMENT.md with deployment instructions
  - [ ] 9.42 Document GCP setup steps in detail
  - [ ] 9.43 Document deployment commands for Cloud Run and App Engine
  - [ ] 9.44 Document how to update OAuth settings for production
  - [ ] 9.45 Set up CI/CD pipeline (optional but recommended)
  - [ ] 9.46 Create GitHub Actions workflow for automated testing on push
  - [ ] 9.47 Create GitHub Actions workflow for automated deployment to GCP
  - [ ] 9.48 Configure deployment to trigger only on main branch merges
  - [ ] 9.49 Add badges to README: build status, test coverage, deployment status
  - [ ] 9.50 Create CONTRIBUTING.md if planning to accept contributions
  - [ ] 9.51 Tag initial release as v1.0.0 in git
  - [ ] 9.52 Celebrate launch! 🎉
