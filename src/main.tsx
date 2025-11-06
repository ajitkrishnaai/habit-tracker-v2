import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router.tsx';
import './styles/main.css';
import './styles/animations.css';

// Load test helpers and migration utility in development mode
if (import.meta.env.DEV) {
  import('./utils/testHelpers');
  import('./utils/migrateToSupabase');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
