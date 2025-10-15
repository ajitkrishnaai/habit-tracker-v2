import { createBrowserRouter } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { ManageHabitsPage } from './pages/ManageHabitsPage';
import { DailyLogPage } from './pages/DailyLogPage';
import { ProgressPage } from './pages/ProgressPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

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
