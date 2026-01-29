import { apiSlice } from './api';

export interface GalleryStats {
  total_count: number;
  new_count: number;
}

export interface Day {
  id: number;
  day_name_ar: string;
  day_name_en: string;
  slug: string;
  status: string;
}

export const galleryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGalleryStats: builder.query<GalleryStats, void>({
      query: () => 'gallery/stats/',
      providesTags: ['GalleryStats'],
    }),
    getDays: builder.query<Day[], void>({
      query: () => 'days/',
    }),
    createGalleryItem: builder.mutation<{ id: number }, FormData>({
      query: (formData) => ({
        url: 'gallery/items/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['GalleryStats', 'RecentActivity'],
    }),
  }),
});

export const {
  useGetGalleryStatsQuery,
  useGetDaysQuery,
  useCreateGalleryItemMutation,
} = galleryApi;
