import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardRoute } from '../utils/routes';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-body)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }
  
  // If authenticated, redirect to appropriate dashboard based on role; otherwise, go to login
  const redirectPath = isAuthenticated ? getDashboardRoute(user) : '/login';
  return <Navigate to={redirectPath} replace />;
};

export default RootRedirect;

