import { apiSlice } from './api';

// ==================== Types ====================

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  barcode?: string;
  price?: string | number;
  selling_price?: string | number;
  description?: string;
  short_description?: string;
  product_type?: 'simple' | 'variable';
  status?: 'draft' | 'active' | 'archived';
  brand?: number;
  brand_detail?: {
    id: number;
    name: string;
    slug: string;
  };
  unit?: number;
  unit_detail?: {
    id: number;
    name: string;
    slug: string;
  };
  categories?: number[];
  categories_detail?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  thumbnail?: string;
  thumbnail_url?: string;
  gallery?: string[];
  gallery_urls?: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  specs?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedProductResponse {
  results: Product[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

// ==================== Product API ====================

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== Products ====================
    getProducts: builder.query<PaginatedProductResponse, { 
      search?: string; 
      status?: string; 
      brand?: string; 
      category?: string; 
      page?: number; 
      page_size?: number;
      ordering?: string;
    } | void>({
      query: (params) => ({
        url: 'admin/products/',
        params: params || {},
      }),
      providesTags: ['Products'],
    }),
    
    getProduct: builder.query<Product, number>({
      query: (id) => `admin/products/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Products', id }],
    }),
    
    createProduct: builder.mutation<Product, Partial<Product> | FormData>({
      query: (data) => ({
        url: 'admin/products/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
    
    updateProduct: builder.mutation<Product, { id: number; data: Partial<Product> | FormData }>({
      query: ({ id, data }) => ({
        url: `admin/products/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Products', id }, 'Products'],
    }),
    
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/products/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Products'],
    }),
    
    suggestProductSlug: builder.query<{ slug: string; suggested_slug?: string }, { name: string }>({
      query: ({ name }) => ({
        url: 'admin/products/suggest-slug/',
        params: { name },
      }),
    }),

    importProducts: builder.mutation<{
      total: number;
      successful: number;
      failed: number;
      errors: Array<{ row: number; errors: string[] }>;
    }, FormData>({
      query: (formData) => ({
        url: 'admin/products/import/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Products'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSuggestProductSlugQuery,
  useImportProductsMutation,
} = productApi;

