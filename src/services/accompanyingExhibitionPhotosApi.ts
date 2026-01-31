/**
 * Accompanying Exhibition Photos API helper
 * Endpoints: GET /api/accompanyingexhibition/photos, POST /api/accompanyingexhibition/photos, DELETE /api/accompanyingexhibition/photos/:id
 */

import { API_BASE_URL, PHOTOS_PAGE_SIZE } from '../config/api';
import { getAuthToken, authenticatedFetch, handleApiResponse } from '../utils/api';

// --- Types / Interfaces ---

export interface AccompanyingExhibitionPhoto {
  id: number;
  day: number | null;
  day_name_ar: string | null;
  day_name_en: string | null;
  day_slug: string | null;
  file?: string;
  file_url: string | null;
  file_size_bytes: number | null;
  file_size_human: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Day {
  id: number;
  day_name_ar: string;
  day_name_en: string;
  slug: string;
  status: string;
}

/** List response: use results array; day filter can be day id or date string depending on backend */
export interface AccompanyingExhibitionPhotosListResponse {
  results: AccompanyingExhibitionPhoto[];
  count?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface PostAccompanyingExhibitionPhotoResponse {
  id: number;
  file_url?: string | null;
  day?: number | null;
  created_at: string;
}

export interface DeleteAccompanyingExhibitionPhotoResponse {
  ok?: boolean;
}

// --- Endpoint config ---

const ACCOMPANYING_EXHIBITION_PHOTOS_BASE = '/api/accompanyingexhibition/photos';
const DAYS_PATH = '/api/days';

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * GET list of accompanying exhibition photos (paginated).
 * @param day - optional day filter: day id (number) or date string 'YYYY-MM-DD' depending on backend
 * @param page - 1-based page number
 * @param pageSize - items per page (default from VITE_PHOTOS_PAGE_SIZE)
 */
export async function getAccompanyingExhibitionPhotos(
  day?: number | string,
  page: number = 1,
  pageSize: number = PHOTOS_PAGE_SIZE
): Promise<AccompanyingExhibitionPhotosListResponse> {
  const params = new URLSearchParams();
  if (day != null) params.set('day', String(day));
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  const url = `${API_BASE_URL}${ACCOMPANYING_EXHIBITION_PHOTOS_BASE}/?${params.toString()}`;
  const response = await authenticatedFetch(url, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  return handleApiResponse<AccompanyingExhibitionPhotosListResponse>(response);
}

/**
 * POST a single accompanying exhibition photo (multipart).
 * Body: FormData with 'day' (optional) and 'file'.
 */
export async function postAccompanyingExhibitionPhoto(
  formData: FormData,
  onUploadProgress?: (percent: number) => void
): Promise<PostAccompanyingExhibitionPhotoResponse> {
  const url = `${API_BASE_URL}${ACCOMPANYING_EXHIBITION_PHOTOS_BASE}/`;
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onUploadProgress) {
        onUploadProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText) as PostAccompanyingExhibitionPhotoResponse;
          resolve(data);
        } catch {
          reject(new Error('Invalid response'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.detail || err.message || `Request failed ${xhr.status}`));
        } catch {
          reject(new Error(`Request failed ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error')));
    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
}

/**
 * DELETE an accompanying exhibition photo by id.
 */
export async function deleteAccompanyingExhibitionPhoto(id: number): Promise<DeleteAccompanyingExhibitionPhotoResponse> {
  const url = `${API_BASE_URL}${ACCOMPANYING_EXHIBITION_PHOTOS_BASE}/${id}/`;
  const response = await authenticatedFetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (response.status === 204 || response.status === 200) {
    if (response.status === 200) {
      return response.json() as Promise<DeleteAccompanyingExhibitionPhotoResponse>;
    }
    return Promise.resolve({ ok: true });
  }
  return handleApiResponse<DeleteAccompanyingExhibitionPhotoResponse>(response);
}

/**
 * GET list of days (for DayPicker).
 */
export async function getDays(): Promise<Day[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}${DAYS_PATH}/`, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  const data = await handleApiResponse<Day[]>(response);
  return Array.isArray(data) ? data : (data as { results?: Day[] }).results ?? [];
}
