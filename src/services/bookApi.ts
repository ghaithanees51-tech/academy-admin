import { apiSlice } from './api';

export interface Book {
  id: number;
  type: 'pdf' | 'audio' | 'video';
  category: string;
  title: string;
  author: string;
  publisher: string;
  edition: string;
  year: string;
  isbn: string;
  language: string;
  pages: number | null;
  audio: string;
  video: string;
  audio_file: string | null;
  video_file: string | null;
  cover: string | null;
  file: string | null;
  date: string;
  status: 'active' | 'inactive';
  created_at: string;
  cover_url?: string | null;
  file_url?: string | null;
  audio_file_url?: string | null;
  video_file_url?: string | null;
  has_text_extraction?: boolean;
}

export interface ExtractionResult {
  message: string;
  from_cache?: boolean;
  book_id?: number;
  arabic_text?: string;
  summary?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BookPayload {
  type?: 'pdf' | 'audio' | 'video';
  category?: string;
  title: string;
  author: string;
  publisher?: string;
  edition?: string;
  year?: string;
  isbn?: string;
  language?: string;
  pages?: number | null;
  audio?: string;
  video?: string;
  audio_file?: File | null;
  video_file?: File | null;
  cover?: File | null;
  file?: File | null;
  date?: string;
  status?: 'active' | 'inactive';
}

export const bookApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query<Book[], void>({
      query: () => 'book/books/',
      providesTags: ['Books'],
    }),
    createBook: builder.mutation<Book, FormData>({
      query: (body) => ({
        url: 'book/books/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Books'],
    }),
    updateBook: builder.mutation<Book, { id: number; body: FormData }>({
      query: ({ id, body }) => ({
        url: `book/books/${id}/`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Books'],
    }),
    deleteBook: builder.mutation<void, number>({
      query: (id) => ({
        url: `book/books/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Books'],
    }),
    extractBookText: builder.mutation<ExtractionResult, { id: number; force?: boolean }>({
      query: ({ id, force = false }) => ({
        url: `book/publications/${id}/extract-arabic-text/`,
        method: 'POST',
        body: { force },
      }),
      invalidatesTags: ['Books'],
    }),
    fetchExtraction: builder.query<ExtractionResult, number>({
      query: (id) => `book/publications/${id}/extraction/`,
      providesTags: (_result, _error, id) => [{ type: 'Books', id }],
    }),
    saveExtractionManual: builder.mutation<
      ExtractionResult,
      { id: number; arabic_text: string; summary: string }
    >({
      query: ({ id, arabic_text, summary }) => ({
        url: `book/publications/${id}/extraction/`,
        method: 'POST',
        body: { arabic_text, summary },
      }),
      invalidatesTags: ['Books'],
    }),
  }),
});

export const {
  useGetBooksQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useExtractBookTextMutation,
  useFetchExtractionQuery,
  useSaveExtractionManualMutation,
} = bookApi;
