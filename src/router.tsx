import { createBrowserRouter } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { ProtectedRoute } from './components/ProtectedRoute';

// Placeholder pages (will be implemented in later tasks)
const DailyLogPage = () => <div style={{ padding: '2rem' }}><h1>Daily Log Page (Coming Soon)</h1></div>;
const ProgressPage = () => <div style={{ padding: '2rem' }}><h1>Progress Page (Coming Soon)</h1></div>;
const ManageHabitsPage = () => <div style={{ padding: '2rem' }}><h1>Manage Habits Page (Coming Soon)</h1></div>;
const PrivacyPolicyPage = () => <div style={{ padding: '2rem' }}><h1>Privacy Policy (Coming Soon)</h1></div>;
const TermsOfServicePage = () => <div style={{ padding: '2rem' }}><h1>Terms of Service (Coming Soon)</h1></div>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <WelcomePage />,
  },
  {
    path: '/daily-log',
    element: (
      <ProtectedRoute>
        <DailyLogPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/progress',
    element: (
      <ProtectedRoute>
        <ProgressPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/manage-habits',
    element: (
      <ProtectedRoute>
        <ManageHabitsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/privacy',
    element: <PrivacyPolicyPage />,
  },
  {
    path: '/terms',
    element: <TermsOfServicePage />,
  },
]);
