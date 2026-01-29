import { useAppSelector } from '../store/hooks';
import { selectAccessToken } from '../store/authSlice';
import { useGetCurrentUserQuery } from '../services/authApi';

/**
 * Validates auth token on app load when token exists.
 * If token is invalid (e.g. expired), API middleware will clear auth and redirect to login.
 */
const AuthValidator = () => {
  const token = useAppSelector(selectAccessToken);
  useGetCurrentUserQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: false,
  });
  return null;
};

export default AuthValidator;
