/**
 * Competition Videos API helper
 * Endpoints: GET /api/competition/videos, POST /api/competition/videos, DELETE /api/competition/videos/:id
 */

import { API_BASE_URL, VIDEOS_PAGE_SIZE } from '../config/api';
import { getAuthToken, authenticatedFetch, handleApiResponse } from '../utils/api';

// --- Types / Interfaces ---

export interface CompetitionVideo {
  id: number;
  day: number | null;
  day_name_ar: string | null;
  day_name_en: string | null;
  day_slug: string | null;
  video?: string;
  video_url: string | null;
  video_compressed?: string;
  video_compressed_url: string | null;
  thumbnail?: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  file_size_bytes: number | null;
  file_size_human: string | null;
  compressed_size_bytes: number | null;
  compressed_size_human: string | null;
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  processing_progress: number;
  processing_error: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Day {
  id: number;
  day_name_ar: string;
  day_name_en: string;
  slug: string;
  status: string;
}

/** List response: use results array; day filter can be day id or date string depending on backend */
export interface CompetitionVideosListResponse {
  results: CompetitionVideo[];
  count?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface PostCompetitionVideoResponse {
  id: number;
  video_url?: string | null;
  thumbnail_url?: string | null;
  day?: number | null;
  status: string;
  processing_progress: number;
  created_at: string;
}

export interface DeleteCompetitionVideoResponse {
  ok?: boolean;
}

// --- Endpoint config ---

const COMPETITION_VIDEOS_BASE = '/api/competition/videos';
const DAYS_PATH = '/api/days';

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * GET list of competition videos (paginated).
 * @param day - optional day filter: day id (number) or date string 'YYYY-MM-DD' depending on backend
 * @param page - 1-based page number
 * @param pageSize - items per page (default from VITE_PAGE_SIZE)
 */
export async function getCompetitionVideos(
  day?: number | string,
  page: number = 1,
  pageSize: number = VIDEOS_PAGE_SIZE
): Promise<CompetitionVideosListResponse> {
  const params = new URLSearchParams();
  if (day != null) params.set('day', String(day));
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  const url = `${API_BASE_URL}${COMPETITION_VIDEOS_BASE}/?${params.toString()}`;
  const response = await authenticatedFetch(url, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  return handleApiResponse<CompetitionVideosListResponse>(response);
}

/**
 * POST a single competition video (multipart).
 * Body: FormData with 'day' (optional), 'video' (required), and optional 'thumbnail'.
 */
export async function postCompetitionVideo(
  formData: FormData,
  onUploadProgress?: (percent: number) => void
): Promise<PostCompetitionVideoResponse> {
  const url = `${API_BASE_URL}${COMPETITION_VIDEOS_BASE}/`;
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
          const data = JSON.parse(xhr.responseText) as PostCompetitionVideoResponse;
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
 * DELETE a competition video by id.
 */
export async function deleteCompetitionVideo(id: number): Promise<DeleteCompetitionVideoResponse> {
  const url = `${API_BASE_URL}${COMPETITION_VIDEOS_BASE}/${id}/`;
  const response = await authenticatedFetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (response.status === 204 || response.status === 200) {
    if (response.status === 200) {
      return response.json() as Promise<DeleteCompetitionVideoResponse>;
    }
    return Promise.resolve({ ok: true });
  }
  return handleApiResponse<DeleteCompetitionVideoResponse>(response);
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
