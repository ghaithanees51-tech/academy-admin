import { apiSlice } from './api';

export interface Category {
  id: number;
  category_name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface CategoryPayload {
  category_name: string;
  slug?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => 'category/',
      providesTags: ['Categories'],
    }),
    createCategory: builder.mutation<Category, CategoryPayload>({
      query: (body) => ({
        url: 'category/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation<Category, { id: number; body: CategoryPayload }>({
      query: ({ id, body }) => ({
        url: `category/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `category/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
