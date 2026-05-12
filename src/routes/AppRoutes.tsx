import { createBrowserRouter, Outlet } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import Profile from '../pages/Profile';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import RootRedirect from './RootRedirect';
import ChangePassword from '../pages/ChangePassword';
import Categories from '../pages/Categories';
import Books from '../pages/books';


export const router = createBrowserRouter([
  // Root redirect - checks auth and redirects accordingly
  {
    path: '/',
    element: <RootRedirect />,
  },

  // Public Routes (Auth pages)
  {
    path: '/',
    element: <PublicRoute restricted={true} />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
    ],
  },

  // Private Routes (Protected pages - Admin only)
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: 'dashboard',
        element: <Outlet />,
        children: [
          { index: true, element: <Dashboard /> },
        ],
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'profile/change-password',
        element: <ChangePassword />,
      },
      {
        path: 'categories',
        element: <Categories />,
      },
      {
        path: 'books',
        element: <Books />,
      },
    ],
  },

  // 404 Not Found
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-xl mb-8" style={{ color: 'var(--text-muted)' }}>
            Page not found
          </p>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    ),
  },
]);

export default router;
