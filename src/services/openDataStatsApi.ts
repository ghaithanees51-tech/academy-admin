import { apiSlice } from './api';

export interface OpenDataStats {
  total_count: number;
  new_count: number;
}

export const openDataStatsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOpenDataStats: builder.query<OpenDataStats, void>({
      query: () => 'open-data/stats/',
      providesTags: ['OpenDataStats'],
    }),
  }),
});

export const { useGetOpenDataStatsQuery } = openDataStatsApi;
