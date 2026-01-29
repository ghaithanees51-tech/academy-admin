import { apiSlice } from './api';

export type ActivityType = 'gallery' | 'news' | 'video' | 'opendata' | 'auth_code';

export interface RecentActivityItem {
  id: string;
  activity_type: ActivityType;
  action: string;
  timestamp: string;
  item_id: number | null;
  title: string | null;
}

export interface RecentActivityResponse {
  results: RecentActivityItem[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RecentActivityParams {
  page?: number;
  page_size?: number;
}

export const activityApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRecentActivity: builder.query<RecentActivityResponse, RecentActivityParams | void>({
      query: (params) => ({
        url: 'dashboard/recent-activity/',
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 10,
        },
      }),
      providesTags: ['RecentActivity'],
    }),
  }),
});

export const { useGetRecentActivityQuery } = activityApi;
