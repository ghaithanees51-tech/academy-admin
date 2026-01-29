import type { User } from '../services/authApi';

/**
 * Get the dashboard route based on user role.
 * Backend roles: super_admin, staff (admin panel), user.
 * After login redirect to dashboard.
 */
export const getDashboardRoute = (user: User | null): string => {
  if (!user) {
    return '/login';
  }

  // Staff and super_admin can access admin panel → redirect to dashboard
  if (user.role === 'super_admin' || user.role === 'staff') {
    return '/dashboard';
  }
  // Legacy role names from other backends

  return '/login';
};

