import { apiSlice } from './api';

export interface VideoStats {
  total_count: number;
  new_count: number;
}

export const videoStatsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getVideoStats: builder.query<VideoStats, void>({
      query: () => 'videogallery/stats/',
      providesTags: ['VideoStats'],
    }),
  }),
});

export const { useGetVideoStatsQuery } = videoStatsApi;
