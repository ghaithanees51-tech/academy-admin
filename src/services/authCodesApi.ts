import { apiSlice } from './api';

export interface AuthCodeStats {
  total_count: number;
  used_count: number;
}

export const authCodesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuthCodeStats: builder.query<AuthCodeStats, void>({
      query: () => 'admin/auth-codes/stats/',
      providesTags: ['AuthCodeStats'],
    }),
  }),
});

export const { useGetAuthCodeStatsQuery } = authCodesApi;
