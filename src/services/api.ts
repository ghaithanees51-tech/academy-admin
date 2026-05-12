import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import Swal from 'sweetalert2';
import { setAccessToken, logout } from '../store/authSlice';
import { API_BASE_URL } from '../config/api';

// Base query with automatic token attachment
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/`,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth?: { accessToken?: string | null } };
    const token =
      state?.auth?.accessToken ??
      (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Only set Accept header for JSON responses
    // Don't set it if we're sending FormData (RTK Query will handle Content-Type)
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }
    
    return headers;
  },
  credentials: 'include',
});

// Base query with token refresh logic
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result;
  try {
    result = await baseQuery(args, api, extraOptions);
  } catch (error) {
    // Handle network errors (connection refused, etc.)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      // Return a network error response
      return {
        error: {
          status: 'FETCH_ERROR' as const,
          error: 'Network Error: Unable to connect to server. Please ensure the backend server is running.',
        },
      };
    }
    // Re-throw other errors
    throw error;
  }

  if (result.error && result.error.status === 401) {
    // Check if this is a session revocation (not just expired token)
    const errorData = result.error.data as { code?: string; detail?: string };
    
    if (errorData?.code === 'session_revoked') {
      // Session was revoked from another device - logout immediately
      api.dispatch(logout());
      
      // Show message to user
      await Swal.fire({
        title: 'Session Logged Out',
        text: errorData.detail || 'Your session has been logged out from another device. Please log in again.',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      
      window.location.href = '/login';
      return result;
    }
    
    // Try to get a new token using refresh token
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: 'auth/refresh/',
          method: 'POST',
          body: { refresh: refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new token
        const data = refreshResult.data as { access: string };
        const newAccessToken = data.access;
        localStorage.setItem('access_token', newAccessToken);
        
        // Update Redux state with the new token
        api.dispatch(setAccessToken(newAccessToken));
        
        // Retry the original query with new token
        // Create a custom baseQuery that uses the new token explicitly
        const retryBaseQuery = fetchBaseQuery({
          baseUrl: `${API_BASE_URL}/api/`,
          prepareHeaders: (headers) => {
            headers.set('Authorization', `Bearer ${newAccessToken}`);
            if (!headers.has('Accept')) {
              headers.set('Accept', 'application/json');
            }
            return headers;
          },
          credentials: 'include',
        });
        
        result = await retryBaseQuery(args, api, extraOptions);
      } else {
        // Refresh failed - logout user
        api.dispatch(logout());
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else {
      // No refresh token - user needs to log in
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        // No authentication token - user will be redirected by PrivateRoute
        // The PrivateRoute component should handle this
      }
    }
  }

  return result;
};

// Create the API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'AuthCodeStats',
    'RecentActivity',
    'GalleryStats',
    'VideoStats',
    'NewsStats',
    'OpenDataStats',
    'CompetitionPhotoStats',
    'CompetitionVideoStats',
    'AccompanyingExhibitionPhotoStats',
    'AccompanyingExhibitionVideoStats',
    'Overview',
    'Categories',
    'CatalogProducts',
    'Brands',
    'Units',
    'Attributes',
    'AttributeValues',
    'ProductOptions',
    'ProductVariants',
    'Products',
    'Orders',
    'OTPSettings',
    'Stores',
    'MediaAssets',
    'Locations',
    'Settings',
    'StoreSettings',
    'Variants',
    'Books',
  ],
  endpoints: () => ({}),
});

export default apiSlice;

