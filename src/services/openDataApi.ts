/**
 * Open Data API helper.
 * Endpoints: GET/POST /api/open-data/items/, DELETE /api/open-data/items/:id/, GET stats, days.
 */

import { API_BASE_URL, OPEN_DATA_PAGE_SIZE } from '../config/api';
import { getAuthToken, authenticatedFetch, handleApiResponse } from '../utils/api';

export interface Day {
  id: number;
  day_name_ar: string;
  day_name_en: string;
  slug: string;
  status: string;
}

export interface OpenDataItem {
  id: number;
  day: number | null;
  day_name_ar: string | null;
  day_name_en: string | null;
  day_slug: string | null;
  caption_ar: string;
  caption_en: string;
  document: string | null;
  document_url: string | null;
  file_size_bytes: number | null;
  file_size_human: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OpenDataListResponse {
  results: OpenDataItem[];
  count?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface OpenDataStats {
  total_count: number;
  new_count: number;
}

const OPEN_DATA_BASE = '/api/open-data/items';
const OPEN_DATA_STATS = '/api/open-data/stats';
const DAYS_PATH = '/api/days';

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * GET list of open data items (paginated).
 * @param day - optional day filter
 * @param page - 1-based page number
 * @param pageSize - items per page (default from VITE_OPEN_DATA_PAGE_SIZE)
 */
export async function getOpenData(
  day?: number | string,
  page: number = 1,
  pageSize: number = OPEN_DATA_PAGE_SIZE
): Promise<OpenDataListResponse> {
  const params = new URLSearchParams();
  if (day != null && String(day).trim() !== '') params.set('day', String(day));
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  const url = `${API_BASE_URL}${OPEN_DATA_BASE}/?${params.toString()}`;
  const response = await authenticatedFetch(url, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  const data = await handleApiResponse<OpenDataListResponse>(response);
  return {
    results: Array.isArray(data?.results) ? data.results : [],
    count: data?.count,
    page: data?.page,
    page_size: data?.page_size,
    total_pages: data?.total_pages,
  };
}

export async function getOpenDataStats(): Promise<OpenDataStats> {
  const response = await authenticatedFetch(`${API_BASE_URL}${OPEN_DATA_STATS}/`, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  return handleApiResponse<OpenDataStats>(response);
}

export async function getDays(): Promise<Day[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}${DAYS_PATH}/`, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  const data = await handleApiResponse<Day[]>(response);
  return Array.isArray(data) ? data : [];
}

export async function postOpenData(formData: FormData): Promise<OpenDataItem> {
  const url = `${API_BASE_URL}${OPEN_DATA_BASE}/`;
  const response = await authenticatedFetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  return handleApiResponse<OpenDataItem>(response);
}

export async function deleteOpenData(id: number): Promise<{ ok?: boolean }> {
  const url = `${API_BASE_URL}${OPEN_DATA_BASE}/${id}/`;
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
