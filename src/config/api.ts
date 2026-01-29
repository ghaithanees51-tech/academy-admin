/**
 * API base URL from VITE_API_URL (no trailing slash).
 * Used for all backend requests.
 */
function getApiBaseUrl(): string {
  const url =
    import.meta.env.VITE_API_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    'http://127.0.0.1:8000';
  return String(url).replace(/\/+$/, '');
}

export const API_BASE_URL = getApiBaseUrl();

