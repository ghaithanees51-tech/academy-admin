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

/**
 * List page size for Photos, Videos, News, Open Data from VITE_PAGE_SIZE (default 24).
 */
function getListPageSize(): number {
  const raw = import.meta.env.VITE_PAGE_SIZE;
  if (raw === undefined || raw === '') return 24;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 24;
}

const LIST_PAGE_SIZE = getListPageSize();
export const PHOTOS_PAGE_SIZE = LIST_PAGE_SIZE;
export const VIDEOS_PAGE_SIZE = LIST_PAGE_SIZE;
export const NEWS_PAGE_SIZE = LIST_PAGE_SIZE;
export const OPEN_DATA_PAGE_SIZE = LIST_PAGE_SIZE;
