import { apiSlice } from './api';

export interface NewsStats {
  total_count: number;
  new_count: number;
}

export const newsStatsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNewsStats: builder.query<NewsStats, void>({
      query: () => 'news/stats/',
      providesTags: ['NewsStats'],
    }),
  }),
});

export const { useGetNewsStatsQuery } = newsStatsApi;
