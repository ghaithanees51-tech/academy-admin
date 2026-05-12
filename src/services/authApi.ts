import { apiSlice } from './api';

export interface StoreSummary {
  id: number;
  store_name: string;
  slug: string;
  store_email?: string;
  store_mobile?: string;
  is_approved: boolean;
}

export interface UserPermissions {
  catalog: {
    product: {
      view: boolean;
      add: boolean;
      change: boolean;
      delete: boolean;
    };
    brand: {
      view: boolean;
      add: boolean;
      change: boolean;
      delete: boolean;
    };
    category: {
      view: boolean;
      add: boolean;
      change: boolean;
      delete: boolean;
    };
    attribute: {
      view: boolean;
      add: boolean;
      change: boolean;
      delete: boolean;
    };
    attributevalue: {
      view: boolean;
      add: boolean;
      change: boolean;
      delete: boolean;
    };
    mediaasset: {
      view: boolean;
      add: boolean;
      change: boolean;
      delete: boolean;
    };
    storeproduct: {
      view: boolean;
      add: boolean;
      change: boolean;
      delete: boolean;
    };
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  role: string;
  profile_image_url?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  stores: StoreSummary[];
  permissions: UserPermissions;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  message: string;
}

export interface LogoutResponse {
  message: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone_number?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

const normalizeUserResponse = (response: any): User => {
  const u = response || {};
  const firstName = u.first_name ?? '';
  const lastName = u.last_name ?? '';
  // Prefer backend-provided ``name`` (UserSerializer computes it), otherwise
  // fall back to assembling it from first/last name or the email.
  const name =
    (typeof u.name === 'string' && u.name.trim()) ||
    [firstName, lastName].filter(Boolean).join(' ') ||
    u.email ||
    '';
  return {
    id: u.id,
    email: u.email,
    name,
    first_name: firstName,
    last_name: lastName,
    phone_number: u.phone_number ?? '',
    role: u.role ?? 'staff',
    is_active: u.is_active !== false,
    stores: [],
    permissions: {} as UserPermissions,
  } as User;
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login/admin/',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: any) => {
        const u = response.user || {};
        const firstName = u.first_name ?? '';
        const lastName = u.last_name ?? '';
        const name = [firstName, lastName].filter(Boolean).join(' ') || u.email || '';
        return {
          access: response.access,
          refresh: response.refresh,
          user: {
            id: u.id,
            email: u.email,
            name,
            first_name: firstName,
            last_name: lastName,
            role: u.role ?? 'staff',
            is_active: u.is_active !== false,
            stores: [],
            permissions: {} as UserPermissions,
          } as User,
          message: response.message,
        };
      },
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<LogoutResponse, { refresh: string }>({
      query: (body) => ({
        url: 'auth/logout/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    getUsersCount: builder.query<{ count: number }, void>({
      query: () => 'auth/admin/users/count/',
      providesTags: ['User'],
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => 'auth/me/',
      transformResponse: (response: any) => normalizeUserResponse(response),
      providesTags: ['User'],
    }),

    updateCurrentUser: builder.mutation<User, UpdateProfileRequest>({
      query: (payload) => ({
        url: 'auth/me/',
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: (response: any) => normalizeUserResponse(response),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (payload) => ({
        url: 'auth/change-password/',
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetUsersCountQuery,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useChangePasswordMutation,
} = authApi;
