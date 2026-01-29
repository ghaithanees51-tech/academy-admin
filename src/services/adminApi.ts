import { apiSlice } from './api';

// ==================== Types ====================

export interface User {
  id: number;
  email: string;
  user_type: string;
  is_superuser?: boolean;
  is_active?: boolean;
  date_joined?: string;
}

export interface Store {
  id: number;
  name: string;
  slug: string;
  description?: string;
  status?: string;
  status_display?: string;
  is_approved?: boolean;
  owner?: number;
  owner_email?: string;
  location?: number;
  location_name?: string;
  store_email?: string;
  store_mobile?: string;
  store_whatsapp?: string;
  store_landline?: string;
  address?: string;
  street?: string;
  zone?: string;
  building_number?: string;
  country?: string;
  latitude?: number | string;
  longitude?: number | string;
  place_name?: string;
  store_logo?: string;
  store_logo_url?: string;
  assigned_products_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  sort_order?: number;
  parent?: number | null;
  parent_name?: string | null;
  image?: string | null;
  is_active?: boolean;
  children_count?: number;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string | null;
  image_url?: string | null;
  website?: string | null;
  is_active?: boolean;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedBrandResponse {
  results: Brand[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export interface Unit {
  id: number;
  name: string;
  slug: string;
  symbol?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku?: string;
  barcode?: string;
  category?: number;
  categories?: Array<{ id: number; name: string; slug: string }>;
  brand?: number;
  brand_id?: number;
  unit?: number;
  unit_id?: number;
  product_type?: 'simple' | 'variable';
  status?: 'draft' | 'active' | 'archived';
  base_price?: string | number;
  discount_price?: string | number;
  compare_at_price?: string | number;
  quantity?: number;
  low_stock_threshold?: number;
  is_active?: boolean;
  is_featured?: boolean;
  thumbnail?: string;
  thumbnail_url?: string;
  gallery?: string[];
  gallery_urls?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface MediaAsset {
  id: string;
  file: string;
  file_type?: string;
  file_size?: number;
  alt_text?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Location {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StoreSetting {
  id: number;
  store: number;
  key: string;
  value: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Variant {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Attribute {
  id: number;
  name: string;
  type?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AttributeValue {
  id: number;
  attribute: number;
  value: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StoreProduct {
  id: number;
  store: number;
  product: number | Product;
  sku?: string;
  barcode?: string;
  description?: string;
  price?: number | string;
  discount_price?: number | string;
  quantity?: number;
  low_stock_threshold?: number;
  is_active?: boolean;
  status?: 'draft' | 'active' | 'archived';
  created_at?: string;
  updated_at?: string;
}

// ==================== Admin API ====================

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== Users ====================
    getUsers: builder.query<User[], void>({
      query: () => 'admin/users/',
      providesTags: ['User'],
    }),
    getUser: builder.query<User, number>({
      query: (id) => `admin/users/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // ==================== Stores ====================
    getStores: builder.query<Store[], void>({
      query: () => 'admin/stores/',
      providesTags: ['Stores'],
    }),
    getStore: builder.query<Store, number>({
      query: (id) => `admin/stores/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Stores', id }],
    }),
    createStore: builder.mutation<Store, Partial<Store> & { owner_email?: string; owner_password?: string }>({
      query: (data) => ({
        url: 'admin/stores/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Stores'],
    }),
    updateStore: builder.mutation<Store, { id: number; data: Partial<Store> }>({
      query: ({ id, data }) => ({
        url: `admin/stores/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Stores', id }, 'Stores'],
    }),
    deleteStore: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/stores/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Stores'],
    }),
    suggestStoreSlug: builder.query<{ slug: string }, { name: string }>({
      query: ({ name }) => ({
        url: 'admin/stores/suggest-slug/',
        params: { name },
      }),
    }),
    importStores: builder.mutation<{
      message: string;
      summary: { total: number; created: number; failed: number };
      success: Array<{ row: number; email: string; store_name: string; message: string }>;
      errors: Array<{ row: number; email: string; store_name: string; error: string }>;
    }, FormData>({
      query: (formData) => ({
        url: 'admin/stores/import/',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Stores'],
    }),

    // ==================== Store Products ====================
    getStoreProducts: builder.query<StoreProduct[], number>({
      query: (storeId) => `admin/stores/${storeId}/products/`,
      providesTags: (_result, _error, storeId) => [{ type: 'Products', id: `store-${storeId}` }],
    }),
    getStoreProduct: builder.query<StoreProduct, { storeId: number; id: number }>({
      query: ({ storeId, id }) => `admin/stores/${storeId}/products/${id}/`,
      providesTags: (_result, _error, { id }) => [{ type: 'Products', id }],
    }),
    updateStoreProduct: builder.mutation<StoreProduct, { storeId: number; id: number; data: Partial<StoreProduct> }>({
      query: ({ storeId, id, data }) => ({
        url: `admin/stores/${storeId}/products/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { storeId, id }) => [
        { type: 'Products', id },
        { type: 'Products', id: `store-${storeId}` },
      ],
    }),
    deleteStoreProduct: builder.mutation<void, { storeId: number; id: number }>({
      query: ({ storeId, id }) => ({
        url: `admin/stores/${storeId}/products/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { storeId }) => [{ type: 'Products', id: `store-${storeId}` }],
    }),

    // ==================== Categories ====================
    getCategories: builder.query<Category[], { is_active?: boolean; parent?: number | 'null'; search?: string } | void>({
      query: (params) => ({
        url: 'admin/categories/',
        params: params || {},
      }),
      providesTags: ['Categories'],
    }),
    getCategory: builder.query<Category, number>({
      query: (id) => `admin/categories/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Categories', id }],
    }),
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (data) => ({
        url: 'admin/categories/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation<Category, { id: number; data: Partial<Category> }>({
      query: ({ id, data }) => ({
        url: `admin/categories/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Categories', id }, 'Categories'],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/categories/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
    suggestCategorySlug: builder.query<{ slug: string }, { name: string }>({
      query: ({ name }) => ({
        url: 'admin/categories/suggest-slug/',
        params: { name },
      }),
    }),

    // ==================== Brands ====================
    getBrands: builder.query<PaginatedBrandResponse, { search?: string; status?: string; page?: number; page_size?: number; ordering?: string } | void>({
      query: (params) => ({
        url: 'admin/brands/',
        params: params || {},
      }),
      providesTags: ['Brands'],
    }),
    getBrand: builder.query<Brand, number>({
      query: (id) => `admin/brands/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Brands', id }],
    }),
    createBrand: builder.mutation<Brand, Partial<Brand> | FormData>({
      query: (data) => ({
        url: 'admin/brands/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Brands'],
    }),
    updateBrand: builder.mutation<Brand, { id: number; data: Partial<Brand> | FormData }>({
      query: ({ id, data }) => ({
        url: `admin/brands/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Brands', id }, 'Brands'],
    }),
    deleteBrand: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/brands/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Brands'],
    }),
    suggestBrandSlug: builder.query<{ slug: string }, { name: string }>({
      query: ({ name }) => ({
        url: 'admin/brands/suggest-slug/',
        params: { name },
      }),
    }),

    // ==================== Units ====================
    getUnits: builder.query<Unit[], void>({
      query: () => 'admin/units/',
      providesTags: ['Units'],
    }),
    getUnit: builder.query<Unit, number>({
      query: (id) => `admin/units/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Units', id }],
    }),
    createUnit: builder.mutation<Unit, Partial<Unit>>({
      query: (data) => ({
        url: 'admin/units/create/',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { unit?: Unit } | Unit) => {
        // Handle both nested response {"unit": {...}} and direct Unit response
        if (response && typeof response === 'object' && 'unit' in response) {
          return (response as { unit: Unit }).unit;
        }
        return response as Unit;
      },
      invalidatesTags: ['Units'],
    }),
    updateUnit: builder.mutation<Unit, { id: number; data: Partial<Unit> }>({
      query: ({ id, data }) => ({
        url: `admin/units/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Units', id }, 'Units'],
    }),
    deleteUnit: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/units/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Units'],
    }),
    suggestUnitSlug: builder.query<{ slug: string }, { name: string }>({
      query: ({ name }) => ({
        url: 'admin/units/suggest-slug/',
        params: { name },
      }),
    }),

    // ==================== Products ====================
    getProducts: builder.query<Product[], { search?: string; status?: string[]; brand?: string[]; category?: string[]; assignment?: string[]; page?: number; page_size?: number } | void>({
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
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (data) => ({
        url: 'admin/products/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation<Product, { id: number; data: Partial<Product> }>({
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
    suggestProductSlug: builder.query<{ slug: string }, { name: string }>({
      query: ({ name }) => ({
        url: 'admin/products/suggest-slug/',
        params: { name },
      }),
    }),

    // ==================== Media Assets ====================
    getMediaAssets: builder.query<MediaAsset[], void>({
      query: () => 'admin/media-assets/',
      providesTags: ['MediaAssets'],
    }),
    getMediaAsset: builder.query<MediaAsset, string>({
      query: (id) => `admin/media-assets/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'MediaAssets', id }],
    }),
    createMediaAsset: builder.mutation<MediaAsset, FormData>({
      query: (data) => ({
        url: 'admin/media-assets/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MediaAssets'],
    }),
    updateMediaAsset: builder.mutation<MediaAsset, { id: string; data: Partial<MediaAsset> }>({
      query: ({ id, data }) => ({
        url: `admin/media-assets/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'MediaAssets', id }, 'MediaAssets'],
    }),
    deleteMediaAsset: builder.mutation<void, string>({
      query: (id) => ({
        url: `admin/media-assets/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MediaAssets'],
    }),

    // ==================== Locations ====================
    getLocations: builder.query<Location[], void>({
      query: () => 'admin/locations/',
      providesTags: ['Locations'],
    }),
    getLocation: builder.query<Location, number>({
      query: (id) => `admin/locations/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Locations', id }],
    }),
    createLocation: builder.mutation<Location, Partial<Location>>({
      query: (data) => ({
        url: 'admin/locations/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Locations'],
    }),
    updateLocation: builder.mutation<Location, { id: number; data: Partial<Location> }>({
      query: ({ id, data }) => ({
        url: `admin/locations/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Locations', id }, 'Locations'],
    }),
    deleteLocation: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/locations/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Locations'],
    }),

    // ==================== Settings ====================
    getSettings: builder.query<Setting[], void>({
      query: () => 'admin/settings/',
      providesTags: ['Settings'],
    }),
    getSetting: builder.query<Setting, number>({
      query: (id) => `admin/settings/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Settings', id }],
    }),
    createSetting: builder.mutation<Setting, Partial<Setting>>({
      query: (data) => ({
        url: 'admin/settings/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),
    updateSetting: builder.mutation<Setting, { id: number; data: Partial<Setting> }>({
      query: ({ id, data }) => ({
        url: `admin/settings/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Settings', id }, 'Settings'],
    }),
    deleteSetting: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/settings/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Settings'],
    }),

    // ==================== Store Settings ====================
    getStoreSettings: builder.query<StoreSetting[], void>({
      query: () => 'admin/store-settings/',
      providesTags: ['StoreSettings'],
    }),
    getStoreSetting: builder.query<StoreSetting, number>({
      query: (id) => `admin/store-settings/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'StoreSettings', id }],
    }),
    createStoreSetting: builder.mutation<StoreSetting, Partial<StoreSetting>>({
      query: (data) => ({
        url: 'admin/store-settings/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StoreSettings'],
    }),
    updateStoreSetting: builder.mutation<StoreSetting, { id: number; data: Partial<StoreSetting> }>({
      query: ({ id, data }) => ({
        url: `admin/store-settings/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'StoreSettings', id }, 'StoreSettings'],
    }),
    deleteStoreSetting: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/store-settings/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StoreSettings'],
    }),

    // ==================== Variants ====================
    getVariants: builder.query<Variant[], void>({
      query: () => 'admin/variants/',
      providesTags: ['Variants'],
    }),
    getVariant: builder.query<Variant, number>({
      query: (id) => `admin/variants/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Variants', id }],
    }),
    createVariant: builder.mutation<Variant, Partial<Variant>>({
      query: (data) => ({
        url: 'admin/variants/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Variants'],
    }),
    updateVariant: builder.mutation<Variant, { id: number; data: Partial<Variant> }>({
      query: ({ id, data }) => ({
        url: `admin/variants/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Variants', id }, 'Variants'],
    }),
    deleteVariant: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/variants/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Variants'],
    }),

    // ==================== Attributes ====================
    getAttributes: builder.query<Attribute[], void>({
      query: () => 'admin/attributes/',
      providesTags: ['Attributes'],
    }),
    getAttribute: builder.query<Attribute, number>({
      query: (id) => `admin/attributes/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Attributes', id }],
    }),
    createAttribute: builder.mutation<Attribute, Partial<Attribute>>({
      query: (data) => ({
        url: 'admin/attributes/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attributes'],
    }),
    updateAttribute: builder.mutation<Attribute, { id: number; data: Partial<Attribute> }>({
      query: ({ id, data }) => ({
        url: `admin/attributes/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Attributes', id }, 'Attributes'],
    }),
    deleteAttribute: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/attributes/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Attributes'],
    }),

    // ==================== Attribute Values ====================
    getAttributeValues: builder.query<AttributeValue[], void>({
      query: () => 'admin/attribute-values/',
      providesTags: ['AttributeValues'],
    }),
    getAttributeValue: builder.query<AttributeValue, number>({
      query: (id) => `admin/attribute-values/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'AttributeValues', id }],
    }),
    createAttributeValue: builder.mutation<AttributeValue, Partial<AttributeValue>>({
      query: (data) => ({
        url: 'admin/attribute-values/create/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AttributeValues'],
    }),
    updateAttributeValue: builder.mutation<AttributeValue, { id: number; data: Partial<AttributeValue> }>({
      query: ({ id, data }) => ({
        url: `admin/attribute-values/${id}/update/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'AttributeValues', id }, 'AttributeValues'],
    }),
    deleteAttributeValue: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/attribute-values/${id}/delete/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AttributeValues'],
    }),
  }),
});

export const {
  // Users
  useGetUsersQuery,
  useGetUserQuery,
  // Stores
  useGetStoresQuery,
  useGetStoreQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
  useSuggestStoreSlugQuery,
  useImportStoresMutation,
  // Store Products
  useGetStoreProductsQuery,
  useGetStoreProductQuery,
  useUpdateStoreProductMutation,
  useDeleteStoreProductMutation,
  // Categories
  useGetCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useSuggestCategorySlugQuery,
  // Brands
  useGetBrandsQuery,
  useGetBrandQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useSuggestBrandSlugQuery,
  // Units
  useGetUnitsQuery,
  useGetUnitQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  useSuggestUnitSlugQuery,
  // Products
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useSuggestProductSlugQuery,
  // Media Assets
  useGetMediaAssetsQuery,
  useGetMediaAssetQuery,
  useCreateMediaAssetMutation,
  useUpdateMediaAssetMutation,
  useDeleteMediaAssetMutation,
  // Locations
  useGetLocationsQuery,
  useGetLocationQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  // Settings
  useGetSettingsQuery,
  useGetSettingQuery,
  useCreateSettingMutation,
  useUpdateSettingMutation,
  useDeleteSettingMutation,
  // Store Settings
  useGetStoreSettingsQuery,
  useGetStoreSettingQuery,
  useCreateStoreSettingMutation,
  useUpdateStoreSettingMutation,
  useDeleteStoreSettingMutation,
  // Variants
  useGetVariantsQuery,
  useGetVariantQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  // Attributes
  useGetAttributesQuery,
  useGetAttributeQuery,
  useCreateAttributeMutation,
  useUpdateAttributeMutation,
  useDeleteAttributeMutation,
  // Attribute Values
  useGetAttributeValuesQuery,
  useGetAttributeValueQuery,
  useCreateAttributeValueMutation,
  useUpdateAttributeValueMutation,
  useDeleteAttributeValueMutation,
} = adminApi;

