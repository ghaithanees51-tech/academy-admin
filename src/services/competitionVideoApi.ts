import { apiSlice } from './api';

export interface CompetitionVideoStats {
  total_count: number;
  new_count: number;
}

export const competitionVideoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompetitionVideoStats: builder.query<CompetitionVideoStats, void>({
      query: () => 'competition/videos/stats/',
      providesTags: ['CompetitionVideoStats'],
    }),
  }),
});

export const { useGetCompetitionVideoStatsQuery } = competitionVideoApi;
