import { apiSlice } from './api';

export interface CompetitionPhotoStats {
  total_count: number;
  new_count: number;
}

export const competitionPhotoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompetitionPhotoStats: builder.query<CompetitionPhotoStats, void>({
      query: () => 'competition/photos/stats/',
      providesTags: ['CompetitionPhotoStats'],
    }),
  }),
});

export const { useGetCompetitionPhotoStatsQuery } = competitionPhotoApi;
