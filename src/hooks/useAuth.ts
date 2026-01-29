import { useAppSelector } from '../store/hooks';
import { selectCurrentUser, selectIsAuthenticated, selectAuthLoading } from '../store/authSlice';

/**
 * Custom hook to access authentication state
 * 
 * Returns:
 * - user: Current authenticated user object or null
 * - isAuthenticated: Boolean indicating if user is logged in
 * - loading: Boolean indicating if auth state is being loaded
 */
export const useAuth = () => {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);

  return {
    user,
    isAuthenticated,
    loading,
  };
};

export default useAuth;
