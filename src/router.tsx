import { createBrowserRouter, Navigate } from 'react-router-dom';

// Pages will be imported here as they are created
// import WelcomePage from './pages/WelcomePage';
// import DailyLogPage from './pages/DailyLogPage';
// import ProgressPage from './pages/ProgressPage';
// import ManageHabitsPage from './pages/ManageHabitsPage';
// import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
// import TermsOfServicePage from './pages/TermsOfServicePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/welcome" replace />,
  },
  // Routes will be added as pages are created
  // {
  //   path: '/welcome',
  //   element: <WelcomePage />,
  // },
  // {
  //   path: '/daily',
  //   element: <DailyLogPage />,
  // },
  // {
  //   path: '/progress',
  //   element: <ProgressPage />,
  // },
  // {
  //   path: '/manage',
  //   element: <ManageHabitsPage />,
  // },
  // {
  //   path: '/privacy',
  //   element: <PrivacyPolicyPage />,
  // },
  // {
  //   path: '/terms',
  //   element: <TermsOfServicePage />,
  // },
]);
