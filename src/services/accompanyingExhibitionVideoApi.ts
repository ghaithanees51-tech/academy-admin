import { apiSlice } from './api';

export interface AccompanyingExhibitionVideoStats {
  total_count: number;
  new_count: number;
}

export const accompanyingExhibitionVideoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccompanyingExhibitionVideoStats: builder.query<AccompanyingExhibitionVideoStats, void>({
      query: () => 'accompanyingexhibition/videos/stats/',
      providesTags: ['AccompanyingExhibitionVideoStats'],
    }),
  }),
});

export const { useGetAccompanyingExhibitionVideoStatsQuery } = accompanyingExhibitionVideoApi;
