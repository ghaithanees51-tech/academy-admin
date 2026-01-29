import { Navigate, Outlet } from 'react-router-dom';
import { AuthLayout } from '../components';
import { useAuth } from '../hooks/useAuth';
import { getDashboardRoute } from '../utils/routes';

interface PublicRouteProps {
  restricted?: boolean;
}

const PublicRoute = ({ restricted = false }: PublicRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }
  
  // If route is restricted and user is authenticated, redirect to appropriate dashboard based on role
  // Restricted routes: login, register, etc. (shouldn't be accessible when logged in)
  if (restricted && isAuthenticated) {
    const dashboardRoute = getDashboardRoute(user);
    return <Navigate to={dashboardRoute} replace />;
  }

  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
};

export default PublicRoute;

