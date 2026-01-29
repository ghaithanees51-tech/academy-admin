/**
 * News API helper.
 * Endpoints: GET/POST /api/news/items/, DELETE /api/news/items/:id/, GET stats, days.
 */

import { API_BASE_URL, NEWS_PAGE_SIZE } from '../config/api';
import { getAuthToken, authenticatedFetch, handleApiResponse } from '../utils/api';

export interface Day {
  id: number;
  day_name_ar: string;
  day_name_en: string;
  slug: string;
  status: string;
}

export interface NewsItem {
  id: number;
  day: number | null;
  day_name_ar: string | null;
  day_name_en: string | null;
  day_slug: string | null;
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
  image: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface NewsListResponse {
  results: NewsItem[];
  count?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface NewsStats {
  total_count: number;
  new_count: number;
}

const NEWS_BASE = '/api/news/items';
const NEWS_STATS = '/api/news/stats';
const DAYS_PATH = '/api/days';

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * GET list of news (paginated).
 * @param day - optional day filter
 * @param page - 1-based page number
 * @param pageSize - items per page (default from VITE_NEWS_PAGE_SIZE)
 */
export async function getNews(
  day?: number | string,
  page: number = 1,
  pageSize: number = NEWS_PAGE_SIZE
): Promise<NewsListResponse> {
  const params = new URLSearchParams();
  if (day != null && String(day).trim() !== '') params.set('day', String(day));
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  const url = `${API_BASE_URL}${NEWS_BASE}/?${params.toString()}`;
  const response = await authenticatedFetch(url, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  const data = await handleApiResponse<NewsListResponse>(response);
  return {
    results: Array.isArray(data?.results) ? data.results : [],
    count: data?.count,
    page: data?.page,
    page_size: data?.page_size,
    total_pages: data?.total_pages,
  };
}

export async function getNewsStats(): Promise<NewsStats> {
  const response = await authenticatedFetch(`${API_BASE_URL}${NEWS_STATS}/`, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  return handleApiResponse<NewsStats>(response);
}

export async function getDays(): Promise<Day[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}${DAYS_PATH}/`, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  const data = await handleApiResponse<Day[]>(response);
  return Array.isArray(data) ? data : [];
}

export async function postNews(formData: FormData): Promise<NewsItem> {
  const url = `${API_BASE_URL}${NEWS_BASE}/`;
  const response = await authenticatedFetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  return handleApiResponse<NewsItem>(response);
}

export async function deleteNews(id: number): Promise<{ ok?: boolean }> {
  const url = `${API_BASE_URL}${NEWS_BASE}/${id}/`;
  const response = await authenticatedFetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (response.status === 204 || response.status === 200) {
    if (response.status === 200) {
      return (await response.json()) as { ok?: boolean };
    }
    return { ok: true };
  }
  return handleApiResponse(response);
}
