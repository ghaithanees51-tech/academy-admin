/**
 * Photos API helper
 * Plug your real base URL and auth in getBaseUrl() and getAuthHeaders().
 * Endpoints: GET /api/photos, POST /api/photos, DELETE /api/photos/:id
 * Current implementation uses: GET /api/gallery/items/, POST /api/gallery/items/, DELETE /api/gallery/items/:id
 */

import { API_BASE_URL, PHOTOS_PAGE_SIZE } from '../config/api';
import { getAuthToken, authenticatedFetch, handleApiResponse } from '../utils/api';

// --- Types / Interfaces ---

export interface Photo {
  id: number;
  day: number | null;
  day_name_ar: string | null;
  day_name_en: string | null;
  day_slug: string | null;
  caption_ar?: string;
  caption_en?: string;
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
export interface PhotosListResponse {
  results: Photo[];
  count?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface PostPhotoResponse {
  id: number;
  file_url?: string | null;
  day?: number | null;
  created_at: string;
}

export interface DeletePhotoResponse {
  ok?: boolean;
}

// --- Endpoint config (plug real paths here) ---

const PHOTOS_BASE = '/api/gallery/items';
const DAYS_PATH = '/api/days';

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * GET list of photos (paginated).
 * @param day - optional day filter: day id (number) or date string 'YYYY-MM-DD' depending on backend
 * @param page - 1-based page number
 * @param pageSize - items per page (default from VITE_PHOTOS_PAGE_SIZE)
 */
export async function getPhotos(
  day?: number | string,
  page: number = 1,
  pageSize: number = PHOTOS_PAGE_SIZE
): Promise<PhotosListResponse> {
  const params = new URLSearchParams();
  if (day != null) params.set('day', String(day));
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  const url = `${API_BASE_URL}${PHOTOS_BASE}/?${params.toString()}`;
  const response = await authenticatedFetch(url, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  return handleApiResponse<PhotosListResponse>(response);
}

/**
 * POST a single photo (multipart).
 * Body: FormData with 'day' (optional) and 'file'.
 */
export async function postPhoto(
  formData: FormData,
  onUploadProgress?: (percent: number) => void
): Promise<PostPhotoResponse> {
  const url = `${API_BASE_URL}${PHOTOS_BASE}/`;
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
          const data = JSON.parse(xhr.responseText) as PostPhotoResponse;
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
 * DELETE a photo by id.
 */
export async function deletePhoto(id: number): Promise<DeletePhotoResponse> {
  const url = `${API_BASE_URL}${PHOTOS_BASE}/${id}/`;
  const response = await authenticatedFetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (response.status === 204 || response.status === 200) {
    if (response.status === 200) {
      return response.json() as Promise<DeletePhotoResponse>;
    }
    return Promise.resolve({ ok: true });
  }
  return handleApiResponse<DeletePhotoResponse>(response);
}

/**
 * GET list of days (for DayPicker).
 * Plug real endpoint if different (e.g. /api/days with date range).
 */
export async function getDays(): Promise<Day[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}${DAYS_PATH}/`, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  const data = await handleApiResponse<Day[]>(response);
  return Array.isArray(data) ? data : (data as { results?: Day[] }).results ?? [];
}
