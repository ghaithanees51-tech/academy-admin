/**
 * Utility functions for making authenticated API calls
 */

import { API_BASE_URL } from '../config/api';

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Refresh access token using refresh token
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    return null;
  }

  try {
    const refreshUrl = `${API_BASE_URL}/api/auth/refresh/`;
    
    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
      credentials: 'include',
    });

    if (!response.ok) {
      // If refresh token is invalid, clear tokens
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      return null;
    }

    const data = await response.json() as { access?: string };
    if (data?.access) {
      localStorage.setItem('access_token', data.access);
      return data.access;
    }
  } catch (error) {
    // Silent fail - token refresh errors are handled gracefully
  }

  return null;
};

/**
 * Make an authenticated API request with error handling and token refresh
 */
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {},
  retryOn401: boolean = true
): Promise<Response> => {
  let token = getAuthToken();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
  const isFormData = options.body instanceof FormData;
  
  // Convert headers to Record for easier manipulation
  const existingHeaders = options.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : Array.isArray(options.headers)
    ? Object.fromEntries(options.headers)
    : (options.headers as Record<string, string> | undefined) || {};
  
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...existingHeaders,
  };

  // Only set Content-Type for non-FormData requests
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  
  let response = await fetch(url, {
    ...options,
    headers: headers as HeadersInit,
  });

  // If 401 and retry is enabled, try to refresh token and retry once
  if (response.status === 401 && retryOn401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry the request with the new token
      const retryHeaders: Record<string, string> = {
        Authorization: `Bearer ${newToken}`,
        ...existingHeaders,
      };

      // Only set Content-Type for non-FormData requests
      if (!isFormData && !retryHeaders['Content-Type']) {
        retryHeaders['Content-Type'] = 'application/json';
      }

      response = await fetch(url, {
        ...options,
        headers: retryHeaders as HeadersInit,
      });
    }
  }

  return response;
};

/**
 * Handle API response with proper error handling
 */
export const handleApiResponse = async <T = any>(
  response: Response,
  onUnauthorized?: () => void
): Promise<T> => {
  if (response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text() as any;
  }

  // Handle 401 Unauthorized
  if (response.status === 401) {
    if (onUnauthorized) {
      onUnauthorized();
    } else {
      // Default behavior: clear tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Access denied. You do not have permission.');
  }

  // Handle other errors
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.message || errorData.detail || `Request failed with status ${response.status}`);
};

/**
 * Make an authenticated API request and handle response
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {},
  onUnauthorized?: () => void
): Promise<T> => {
  try {
    const response = await authenticatedFetch(endpoint, options);
    return await handleApiResponse<T>(response, onUnauthorized);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

/**
 * API Client - Axios-like interface for making API calls
 */
export const apiClient = {
  get: async <T = any>(endpoint: string): Promise<{ data: T }> => {
    const data = await apiRequest<T>(`/api${endpoint}`, { method: 'GET' });
    return { data };
  },

  post: async <T = any>(endpoint: string, body?: any): Promise<{ data: T }> => {
    const options: RequestInit = {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    };
    
    if (!(body instanceof FormData)) {
      options.headers = { 'Content-Type': 'application/json' };
    }
    
    const data = await apiRequest<T>(`/api${endpoint}`, options);
    return { data };
  },

  put: async <T = any>(endpoint: string, body?: any): Promise<{ data: T }> => {
    const options: RequestInit = {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    };
    
    if (!(body instanceof FormData)) {
      options.headers = { 'Content-Type': 'application/json' };
    }
    
    const data = await apiRequest<T>(`/api${endpoint}`, options);
    return { data };
  },

  delete: async <T = any>(endpoint: string): Promise<{ data: T }> => {
    const data = await apiRequest<T>(`/api${endpoint}`, { method: 'DELETE' });
    return { data };
  },

  patch: async <T = any>(endpoint: string, body?: any): Promise<{ data: T }> => {
    const options: RequestInit = {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    };
    
    if (!(body instanceof FormData)) {
      options.headers = { 'Content-Type': 'application/json' };
    }
    
    const data = await apiRequest<T>(`/api${endpoint}`, options);
    return { data };
  },
};

/**
 * Normalize image/media URLs to absolute URLs
 * Converts relative URLs to absolute URLs pointing to the Django backend
 */
export const normalizeImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  // If it's already a full URL, return it as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative URL (starts with /), prepend the API base URL
  if (url.startsWith('/')) {
    return `${API_BASE_URL.replace(/\/$/, '')}${url}`;
  }
  
  // Otherwise, it's a relative path without leading slash
  return `${API_BASE_URL.replace(/\/$/, '')}/${url}`;
};