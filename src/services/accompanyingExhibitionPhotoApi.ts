import { apiSlice } from './api';

export interface AccompanyingExhibitionPhotoStats {
  total_count: number;
  new_count: number;
}

export const accompanyingExhibitionPhotoApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAccompanyingExhibitionPhotoStats: builder.query<AccompanyingExhibitionPhotoStats, void>({
      query: () => 'accompanyingexhibition/photos/stats/',
      providesTags: ['AccompanyingExhibitionPhotoStats'],
    }),
  }),
});

export const { useGetAccompanyingExhibitionPhotoStatsQuery } = accompanyingExhibitionPhotoApi;
