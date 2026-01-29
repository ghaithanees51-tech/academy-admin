/**
 * Videos API helper.
 * Endpoints: GET/POST /api/video-gallery/items/, DELETE /api/video-gallery/items/:id/, GET stats, days, categories.
 */

import { API_BASE_URL } from '../config/api';
import { getAuthToken, authenticatedFetch, handleApiResponse } from '../utils/api';

export interface Video {
  id: number;
  category: number;
  category_name_ar: string;
  category_name_en: string;
  category_slug: string;
  day: number;
  day_name_ar: string | null;
  day_name_en: string | null;
  day_slug: string | null;
  caption_ar?: string;
  caption_en?: string;
  video?: string;
  video_url: string | null;
  video_compressed?: string;
  video_compressed_url: string | null;
  thumbnail?: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  duration_formatted: string | null;
  file_size_bytes: number | null;
  file_size_human: string | null;
  compressed_size_bytes: number | null;
  compressed_size_human: string | null;
  compression_ratio: number | null;
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  processing_progress: number;
  processing_error: string | null;
  is_processing_complete: boolean;
  is_ready: boolean;
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

export interface Category {
  id: number;
  category_name_ar: string;
  category_name_en: string;
  slug: string;
  status: string;
}

export interface VideosListResponse {
  results: Video[];
  count?: number;
  page?: number;
  page_size?: number;
  total_pages?: number;
}

export interface VideoStats {
  total_count: number;
  new_count: number;
}

export interface PostVideoResponse {
  id: number;
  video_url?: string | null;
  thumbnail_url?: string | null;
  day?: number | null;
  category?: number | null;
  status: string;
  processing_progress: number;
  created_at: string;
}

export interface VideoStatus {
  id: number;
  status: 'uploaded' | 'processing' | 'ready' | 'failed';
  processing_progress: number;
  processing_error: string | null;
  is_processing_complete: boolean;
  is_ready: boolean;
}

const VIDEOS_BASE = '/api/videogallery/items';
const VIDEOS_STATS = '/api/videogallery/stats';
const DAYS_PATH = '/api/days';
const CATEGORIES_PATH = '/api/categories';

function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * GET list of videos (same pattern as getPhotos).
 * @param day - optional day id filter
 * @param category - optional category id filter
 */
export async function getVideos(day?: number | string, category?: number | string): Promise<VideosListResponse> {
  const params = new URLSearchParams();
  params.set('page_size', '100');
  if (day != null && String(day).trim() !== '') params.set('day', String(day));
  if (category != null && String(category).trim() !== '') params.set('category', String(category));
  const query = params.toString();
  const url = `${API_BASE_URL}${VIDEOS_BASE}/${query ? `?${query}` : ''}`;
  const response = await authenticatedFetch(url, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  const data = await handleApiResponse<VideosListResponse>(response);
  return {
    results: Array.isArray(data?.results) ? data.results : [],
    count: data?.count,
    page: data?.page,
    page_size: data?.page_size,
    total_pages: data?.total_pages,
  };
}

export async function getVideoStats(): Promise<VideoStats> {
  const response = await authenticatedFetch(`${API_BASE_URL}${VIDEOS_STATS}/`, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  return handleApiResponse<VideoStats>(response);
}

export async function postVideo(
  formData: FormData,
  onUploadProgress?: (percent: number) => void
): Promise<PostVideoResponse> {
  const url = `${API_BASE_URL}${VIDEOS_BASE}/`;
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
          resolve(JSON.parse(xhr.responseText) as PostVideoResponse);
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

export interface UpdateVideoPayload {
  caption_ar?: string | null;
  caption_en?: string | null;
  day?: number | null;
  category?: number | null;
  thumbnail?: File | null;
}

export async function updateVideo(id: number, payload: UpdateVideoPayload): Promise<Video> {
  const url = `${API_BASE_URL}${VIDEOS_BASE}/${id}/`;
  const token = getAuthToken();
  if (!token) throw new Error('Authentication required');

  const hasThumbnail = payload.thumbnail != null && payload.thumbnail instanceof File;
  if (hasThumbnail) {
    const formData = new FormData();
    formData.append('caption_ar', payload.caption_ar ?? '');
    formData.append('caption_en', payload.caption_en ?? '');
    formData.append('day', payload.day != null ? String(payload.day) : '');
    formData.append('category', payload.category != null ? String(payload.category) : '');
    formData.append('thumbnail', payload.thumbnail!);
    const response = await authenticatedFetch(url, {
      method: 'PATCH',
      headers: { ...getAuthHeaders(), Accept: 'application/json' },
      body: formData,
    });
    return handleApiResponse<Video>(response);
  }

  const { thumbnail: _t, ...jsonPayload } = payload;
  const response = await authenticatedFetch(url, {
    method: 'PATCH',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(jsonPayload),
  });
  return handleApiResponse<Video>(response);
}

export async function deleteVideo(id: number): Promise<{ ok?: boolean }> {
  const url = `${API_BASE_URL}${VIDEOS_BASE}/${id}/`;
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

export async function getDays(): Promise<Day[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}${DAYS_PATH}/`, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  const data = await handleApiResponse<Day[]>(response);
  return Array.isArray(data) ? data : (data as { results?: Day[] }).results ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}${CATEGORIES_PATH}/`, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  const data = await handleApiResponse<Category[]>(response);
  return Array.isArray(data) ? data : (data as { results?: Category[] }).results ?? [];
}

/**
 * Check video processing status (for polling during compression).
 * @param id - Video ID
 */
export async function getVideoStatus(id: number): Promise<VideoStatus> {
  const url = `${API_BASE_URL}${VIDEOS_BASE}/${id}/status/`;
  const response = await authenticatedFetch(url, {
    method: 'GET',
    headers: { ...getAuthHeaders(), Accept: 'application/json' },
  });
  return handleApiResponse<VideoStatus>(response);
}
