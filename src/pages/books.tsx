import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { BookOpen, BrainCircuit, CheckCircle2, ChevronLeft, ChevronRight, Filter, Loader2, Pencil, Plus, RefreshCcw, Search, ScanText, Trash2, X } from 'lucide-react';

const PAGE_SIZE = 20;
import ActionsMenu from '../components/ActionsMenu';
import Offcanvas from '../components/Offcanvas';
import PageHeader from '../components/PageHeader';
import {
  useCreateBookMutation,
  useDeleteBookMutation,
  useExtractBookTextMutation,
  useFetchExtractionQuery,
  useGetBooksQuery,
  useSaveExtractionManualMutation,
  useUpdateBookMutation,
  type Book,
  type ExtractionResult,
} from '../services/bookApi';
import { useGetCategoriesQuery } from '../services/categoryApi';

type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

const extractApiMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data === 'object' && data !== null) {
      if ('detail' in data && typeof (data as { detail?: unknown }).detail === 'string') {
        return (data as { detail: string }).detail;
      }
      const values = Object.values(data as Record<string, unknown>);
      const firstValue = values[0];
      if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
        return firstValue[0];
      }
      if (typeof firstValue === 'string') {
        return firstValue;
      }
    }
  }

  return fallback;
};

type FormState = {
  type: 'pdf' | 'audio' | 'video';
  category: string;
  title: string;
  author: string;
  publisher: string;
  edition: string;
  year: string;
  isbn: string;
  language: string;
  pages: string;
};

const initialFormState: FormState = {
  type: 'pdf',
  category: '',
  title: '',
  author: '',
  publisher: '',
  edition: '',
  year: '',
  isbn: '',
  language: 'العربية',
  pages: '',
};

// ─────────────────────────────────────────────
// Extraction Offcanvas
// ─────────────────────────────────────────────

type ExtractionTab = 'gemini' | 'manual';

function ExtractionModal({
  book,
  onClose,
}: {
  book: Book;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<ExtractionTab>('gemini');
  const [manualText, setManualText] = useState('');
  const [manualSummary, setManualSummary] = useState('');
  const [localResult, setLocalResult] = useState<ExtractionResult | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const { data: existing, isLoading: isFetchingExisting } = useFetchExtractionQuery(book.id);
  const [extractBookText, { isLoading: isExtracting }] = useExtractBookTextMutation();
  const [saveExtractionManual, { isLoading: isSaving }] = useSaveExtractionManualMutation();

  const isBusyModal = isExtracting || isSaving;

  const handleTabChange = (next: ExtractionTab) => {
    if (next === 'manual' && existing && !manualText) {
      setManualText(existing.arabic_text ?? '');
      setManualSummary(existing.summary ?? '');
    }
    setLocalResult(null);
    setLocalError(null);
    setTab(next);
  };

  const handleGeminiExtract = async () => {
    setLocalResult(null);
    setLocalError(null);
    try {
      const result = await extractBookText({ id: book.id, force: true }).unwrap();
      setLocalResult(result);
    } catch (err) {
      const msg =
        typeof err === 'object' && err !== null && 'data' in err
          ? ((err as { data?: { message?: string; error?: string } }).data?.message ??
            (err as { data?: { error?: string } }).data?.error ??
            'Gemini extraction failed')
          : 'Gemini extraction failed';
      setLocalError(msg);
    }
  };

  const handleManualSave = async () => {
    if (!manualText.trim()) return;
    setLocalResult(null);
    setLocalError(null);
    try {
      const result = await saveExtractionManual({
        id: book.id,
        arabic_text: manualText.trim(),
        summary: manualSummary.trim(),
      }).unwrap();
      setLocalResult(result);
    } catch (err) {
      const msg =
        typeof err === 'object' && err !== null && 'data' in err
          ? ((err as { data?: { message?: string } }).data?.message ?? 'Save failed')
          : 'Save failed';
      setLocalError(msg);
    }
  };

  const statusBadge = book.has_text_extraction ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
      <CheckCircle2 className="h-3 w-3" />
      Extracted
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400">
      <BrainCircuit className="h-3 w-3" />
      Not extracted
    </span>
  );

  return (
    <Offcanvas
      isOpen
      onClose={onClose}
      title="Text Extraction"
      subtitle={book.title}
      headerIcon={<ScanText className="h-5 w-5 text-indigo-600" />}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          {statusBadge}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Close
            </button>
            {tab === 'gemini' ? (
              <button
                type="button"
                onClick={() => void handleGeminiExtract()}
                disabled={isBusyModal || !book.file}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isExtracting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Extracting…</>
                ) : (
                  <><BrainCircuit className="h-4 w-4" />{existing ? 'Re-extract' : 'Extract'}</>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleManualSave()}
                disabled={isBusyModal || !manualText.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Saving…</>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" />Save</>
                )}
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Tabs */}
      <div className="-mx-6 -mt-5 mb-5 flex border-b border-slate-200 px-6">
        {(['gemini', 'manual'] as ExtractionTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabChange(t)}
            className={`pb-3 pr-5 text-sm font-semibold border-b-2 transition-colors ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'gemini' ? '⚡ Gemini Auto' : '✏️ Manual Entry'}
          </button>
        ))}
      </div>

      {/* Status feedback */}
      {localResult && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {localResult.message}
        </div>
      )}
      {localError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError}
        </div>
      )}

      {/* ── GEMINI TAB ── */}
      {tab === 'gemini' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-700">
            <p className="font-semibold">How it works</p>
            <p className="mt-1 leading-relaxed">
              The PDF file for this book will be uploaded to Gemini AI which will extract the
              Arabic text and generate a short summary. Any existing extraction will be overwritten.
            </p>
            {!book.file && (
              <p className="mt-2 font-semibold text-red-600">
                ⚠ No PDF file is attached to this book. Upload a file first.
              </p>
            )}
          </div>

          {isFetchingExisting ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading existing extraction…
            </div>
          ) : existing?.arabic_text ? (
            <details className="rounded-xl border border-slate-200 bg-slate-50">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-600 select-none">
                Current saved extraction (click to expand)
              </summary>
              <div className="border-t border-slate-200 px-4 py-3 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Summary</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700" dir="rtl">
                  {existing.summary || '—'}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Arabic text (preview)</p>
                <p className="line-clamp-6 text-sm leading-relaxed whitespace-pre-wrap text-slate-700" dir="rtl">
                  {existing.arabic_text}
                </p>
              </div>
            </details>
          ) : null}
        </div>
      )}

      {/* ── MANUAL TAB ── */}
      {tab === 'manual' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-700">
            Enter the Arabic text and summary manually. This will create or overwrite the saved
            extraction for this book.
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Summary
            </label>
            <textarea
              value={manualSummary}
              onChange={(e) => setManualSummary(e.target.value)}
              rows={4}
              dir="rtl"
              placeholder="ملخص قصير (اختياري)…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Arabic Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              rows={10}
              dir="rtl"
              placeholder="أدخل النص العربي هنا…"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          
        </div>
      )}
    </Offcanvas>
  );
}

// ─────────────────────────────────────────────
// Books page
// ─────────────────────────────────────────────

const Books = () => {
  const { data: books = [], isLoading, isFetching, error, refetch } = useGetBooksQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createBook, { isLoading: isCreating }] = useCreateBookMutation();
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();
  const [deleteBook, { isLoading: isDeleting }] = useDeleteBookMutation();
  const [extractBookText] = useExtractBookTextMutation();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [formValues, setFormValues] = useState(initialFormState);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [removeBookFile, setRemoveBookFile] = useState(false);
  const [removeAudioFile, setRemoveAudioFile] = useState(false);
  const [removeVideoFile, setRemoveVideoFile] = useState(false);
  const [extractWithGemini, setExtractWithGemini] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractingBook, setExtractingBook] = useState<Book | null>(null);

  const totalBooks = useMemo(() => books.length, [books]);
  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => category.status === 'active')
        .map((category) => ({
          value: category.slug,
          label: category.category_name,
        })),
    [categories]
  );

  const hasCategories = categoryOptions.length > 0;

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return books.filter((book) => {
      const matchesSearch =
        !q ||
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q);
      const matchesCategory = !categoryFilter || book.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, categoryFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE)),
    [filteredBooks]
  );

  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredBooks.slice(start, start + PAGE_SIZE);
  }, [filteredBooks, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const isBusy = isCreating || isUpdating || isDeleting || isExtracting;

  const resetForm = () => {
    setFormValues(initialFormState);
    setCoverFile(null);
    setBookFile(null);
    setAudioFile(null);
    setVideoFile(null);
    setRemoveCover(false);
    setRemoveBookFile(false);
    setRemoveAudioFile(false);
    setRemoveVideoFile(false);
    setExtractWithGemini(false);
  };

  const handleOpenCreate = () => {
    setEditingBook(null);
    resetForm();
    setFormValues((current) => ({
      ...current,
      category: categoryOptions[0]?.value ?? '',
    }));
    setStatusMessage(null);
    setIsOffcanvasOpen(true);
  };

  // If the offcanvas is open for creation and categories load late, fill in
  // a sensible default so the user never submits an empty slug.
  useEffect(() => {
    if (!isOffcanvasOpen || editingBook) return;
    if (formValues.category) return;
    const fallback = categoryOptions[0]?.value;
    if (fallback) {
      setFormValues((current) => ({ ...current, category: fallback }));
    }
  }, [isOffcanvasOpen, editingBook, formValues.category, categoryOptions]);

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setFormValues({
      type: book.type,
      category: book.category,
      title: book.title,
      author: book.author,
      publisher: book.publisher ?? '',
      edition: book.edition ?? '',
      year: book.year ?? '',
      isbn: book.isbn ?? '',
      language: book.language ?? 'العربية',
      pages: book.pages != null ? String(book.pages) : '',
    });
    setCoverFile(null);
    setBookFile(null);
    setAudioFile(null);
    setVideoFile(null);
    setRemoveCover(false);
    setRemoveBookFile(false);
    setRemoveAudioFile(false);
    setRemoveVideoFile(false);
    setStatusMessage(null);
    setIsOffcanvasOpen(true);
  };

  const handleCloseOffcanvas = () => {
    if (isBusy) return;
    setIsOffcanvasOpen(false);
    setEditingBook(null);
  };

  const buildPayload = () => {
    const payload = new FormData();
    payload.append('type', formValues.type);
    payload.append('category', formValues.category);
    payload.append('title', formValues.title.trim());
    payload.append('author', formValues.author.trim());
    if (formValues.publisher.trim()) payload.append('publisher', formValues.publisher.trim());
    if (formValues.edition.trim()) payload.append('edition', formValues.edition.trim());
    if (formValues.year.trim()) payload.append('year', formValues.year.trim());
    if (formValues.isbn.trim()) payload.append('isbn', formValues.isbn.trim());
    if (formValues.language.trim()) payload.append('language', formValues.language.trim());
    if (formValues.pages.trim()) payload.append('pages', formValues.pages.trim());
    if (coverFile) payload.append('cover', coverFile);
    else if (removeCover) payload.append('remove_cover', 'true');

    if (bookFile) payload.append('file', bookFile);
    else if (removeBookFile) payload.append('remove_file', 'true');

    if (audioFile) payload.append('audio_file', audioFile);
    else if (removeAudioFile) payload.append('remove_audio_file', 'true');

    if (videoFile) payload.append('video_file', videoFile);
    else if (removeVideoFile) payload.append('remove_video_file', 'true');

    return payload;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.title.trim() || !formValues.author.trim()) {
      setStatusMessage({ type: 'error', text: 'Title and author are required.' });
      return;
    }

    if (!formValues.category) {
      setStatusMessage({
        type: 'error',
        text: 'Please pick a category. Create one first on the Categories page if the list is empty.',
      });
      return;
    }

    try {
      let savedBook: Book;
      if (editingBook) {
        savedBook = await updateBook({ id: editingBook.id, body: buildPayload() }).unwrap();
        setStatusMessage({ type: 'success', text: 'Book updated successfully.' });
      } else {
        savedBook = await createBook(buildPayload()).unwrap();
        setStatusMessage({ type: 'success', text: 'Book created successfully.' });
      }

      if (extractWithGemini) {
        if (savedBook.file || bookFile) {
          setIsExtracting(true);
          try {
            const result = await extractBookText({ id: savedBook.id }).unwrap();
            const cached = result.from_cache ? ' (already extracted, returned from cache)' : '';
            setStatusMessage({
              type: 'success',
              text: `Book saved and Gemini extraction completed.${cached}`,
            });
          } catch (extractError) {
            setStatusMessage({
              type: 'error',
              text: `Book saved, but Gemini extraction failed: ${extractApiMessage(extractError, 'Unknown error')}`,
            });
          } finally {
            setIsExtracting(false);
          }
        } else {
          setStatusMessage({
            type: 'error',
            text: 'Book saved, but Gemini extraction skipped — no PDF file attached.',
          });
        }
      }

      resetForm();
      setIsOffcanvasOpen(false);
      setEditingBook(null);
    } catch (submitError) {
      console.error('Failed to submit book', submitError);
      setStatusMessage({
        type: 'error',
        text: extractApiMessage(submitError, 'Unable to save book. Please try again.'),
      });
    }
  };

  const handleDelete = async (book: Book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    try {
      await deleteBook(book.id).unwrap();
      setStatusMessage({ type: 'success', text: 'Book deleted successfully.' });
    } catch (deleteError) {
      console.error('Failed to delete book', deleteError);
      setStatusMessage({
        type: 'error',
        text: extractApiMessage(deleteError, 'Unable to delete book.'),
      });
    }
  };

  const handleFieldChange = (
    field: keyof FormState,
    value: string
  ) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    setter(event.target.files?.[0] ?? null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Books"
        subtitle="View the library catalog and add new books from the header button"
        icon={BookOpen}
        sticky={false}
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              disabled={!hasCategories}
              title={hasCategories ? undefined : 'Create at least one category first.'}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-indigo-600"
            >
              <Plus className="h-4 w-4" />
              Add Book
            </button>
            <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
              {totalBooks} total
            </div>
          </div>
        }
      />

      {statusMessage ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            statusMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {statusMessage.text}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Book list</h2>
            <p className="text-sm text-slate-600">All books returned by the backend are shown here.</p>
          </div>
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {filteredBooks.length === totalBooks
              ? `${totalBooks} records`
              : `${filteredBooks.length} of ${totalBooks}`}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or author…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilterChange(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          {(searchQuery || categoryFilter) && (
            <button
              type="button"
              onClick={() => { handleSearchChange(''); handleCategoryFilterChange(''); }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="mt-6 flex items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading books...
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load books. Make sure the backend API is running.
          </div>
        ) : books.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">
            No books found. Add the first book using the header button.
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-12 text-center text-sm text-slate-500">
            No books match the current filters.
          </div>
        ) : (
          <>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Book
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Metadata
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Media
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Gemini
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedBooks.map((book: Book) => (
                    <tr key={book.id}>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{book.title}</p>
                            <p className="text-xs text-slate-500">{book.author}</p>
                            <p className="text-xs text-slate-500">{book.category} · {book.type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-600">
                        <div className="space-y-1">
                          <p>{book.publisher || 'No publisher provided.'}</p>
                          <p>{book.edition ? `Edition: ${book.edition}` : 'No edition provided.'}</p>
                          <p>{book.year ? `Year: ${book.year}` : 'No year provided.'}</p>
                          <p>{book.isbn ? `ISBN: ${book.isbn}` : 'No ISBN provided.'}</p>
                          <p>{book.pages ? `${book.pages} pages` : 'Pages not specified.'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-sm text-slate-600">
                        <div className="space-y-1">
                          <p>{book.language || 'No language provided.'}</p>
                          <p>
                            {book.cover_url || book.cover ? (
                              <a
                                href={book.cover_url ?? book.cover ?? '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-indigo-600 hover:underline"
                              >
                                Cover file
                              </a>
                            ) : (
                              'No cover uploaded.'
                            )}
                          </p>
                          <p>
                            {book.file_url || book.file ? (
                              <a
                                href={book.file_url ?? book.file ?? '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-indigo-600 hover:underline"
                              >
                                Document file
                              </a>
                            ) : (
                              'No document uploaded.'
                            )}
                          </p>
                          <p>
                            {book.audio_file_url || book.audio_file ? (
                              <a
                                href={book.audio_file_url ?? book.audio_file ?? '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-indigo-600 hover:underline"
                              >
                                Audio file
                              </a>
                            ) : (
                              'No audio uploaded.'
                            )}
                          </p>
                          <p>
                            {book.video_file_url || book.video_file ? (
                              <a
                                href={book.video_file_url ?? book.video_file ?? '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-indigo-600 hover:underline"
                              >
                                Video file
                              </a>
                            ) : (
                              'No video uploaded.'
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-middle text-center">
                        {book.has_text_extraction ? (
                          <span title="Text extracted by Gemini" className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Done
                          </span>
                        ) : (
                          <span title="Not extracted yet" className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-400">
                            <BrainCircuit className="h-3.5 w-3.5" />
                            None
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center justify-end">
                          <ActionsMenu
                            actions={[
                              {
                                label: 'Edit',
                                icon: <Pencil className="h-4 w-4 text-blue-600" />,
                                onClick: () => handleOpenEdit(book),
                                disabled: isBusy,
                              },
                              {
                                label: 'Extract',
                                description: book.has_text_extraction ? 'Re-extract or edit' : 'Gemini / Manual',
                                icon: <ScanText className="h-4 w-4 text-indigo-600" />,
                                onClick: () => setExtractingBook(book),
                                disabled: isBusy,
                              },
                              { divider: true, label: '', onClick: () => {} },
                              {
                                label: 'Delete',
                                icon: <Trash2 className="h-4 w-4 text-red-600" />,
                                onClick: () => handleDelete(book),
                                disabled: isBusy,
                                className: 'text-red-600 hover:bg-red-50',
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages} &mdash; showing{' '}
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filteredBooks.length)} of{' '}
                  {filteredBooks.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) =>
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 2
                    )
                    .reduce<(number | '…')[]>((acc, page, idx, arr) => {
                      if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                        acc.push('…');
                      }
                      acc.push(page);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === '…' ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 text-sm text-slate-400"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCurrentPage(item as number)}
                          className={`h-9 min-w-[36px] rounded-xl border text-sm font-medium transition ${
                            currentPage === item
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Offcanvas
        isOpen={isOffcanvasOpen}
        onClose={handleCloseOffcanvas}
        title={editingBook ? 'Edit Book' : 'Add Book'}
        subtitle={editingBook ? 'Update the selected book details' : 'Create a new book record from the admin panel'}
        headerIcon={<Plus className="h-5 w-5 text-indigo-600" />}
        maxWidth="max-w-3xl"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseOffcanvas}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              type="submit"
              form="book-create-form"
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting…
                </>
              ) : isBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editingBook ? 'Updating…' : 'Saving…'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {editingBook ? 'Update Book' : 'Save Book'}
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="book-create-form" className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="book-title" className="mb-1 block text-sm font-medium text-slate-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="book-title"
                type="text"
                value={formValues.title}
                onChange={(event) => handleFieldChange('title', event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label htmlFor="book-author" className="mb-1 block text-sm font-medium text-slate-700">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                id="book-author"
                type="text"
                value={formValues.author}
                onChange={(event) => handleFieldChange('author', event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>
            <div>
              <label htmlFor="book-type" className="mb-1 block text-sm font-medium text-slate-700">
                Type
              </label>
              <select
                id="book-type"
                value={formValues.type}
                onChange={(event) => handleFieldChange('type', event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="pdf">PDF</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
              </select>
            </div>
            <div>
              <label htmlFor="book-category" className="mb-1 block text-sm font-medium text-slate-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="book-category"
                value={formValues.category}
                onChange={(event) => handleFieldChange('category', event.target.value)}
                disabled={!hasCategories}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                {hasCategories ? (
                  <>
                    {!formValues.category && (
                      <option value="" disabled>
                        Select a category…
                      </option>
                    )}
                    {categoryOptions.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="" disabled>
                    No categories — create one first
                  </option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="book-publisher" className="mb-1 block text-sm font-medium text-slate-700">
                Publisher
              </label>
              <input
                id="book-publisher"
                type="text"
                value={formValues.publisher}
                onChange={(event) => handleFieldChange('publisher', event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="book-edition" className="mb-1 block text-sm font-medium text-slate-700">
                Edition
              </label>
              <input
                id="book-edition"
                type="text"
                value={formValues.edition}
                onChange={(event) => handleFieldChange('edition', event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="book-year" className="mb-1 block text-sm font-medium text-slate-700">
                Year
              </label>
              <input
                id="book-year"
                type="text"
                value={formValues.year}
                onChange={(event) => handleFieldChange('year', event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="book-isbn" className="mb-1 block text-sm font-medium text-slate-700">
                ISBN
              </label>
              <input
                id="book-isbn"
                type="text"
                value={formValues.isbn}
                onChange={(event) => handleFieldChange('isbn', event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="book-language" className="mb-1 block text-sm font-medium text-slate-700">
                Language
              </label>
              <input
                id="book-language"
                type="text"
                value={formValues.language}
                onChange={(event) => handleFieldChange('language', event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="book-pages" className="mb-1 block text-sm font-medium text-slate-700">
                Pages
              </label>
              <input
                id="book-pages"
                type="number"
                min="0"
                value={formValues.pages}
                onChange={(event) => handleFieldChange('pages', event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Cover image */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Cover image</label>
              {editingBook && (editingBook.cover_url || editingBook.cover) && !removeCover && !coverFile ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <a
                    href={editingBook.cover_url ?? editingBook.cover ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 truncate font-medium text-indigo-600 hover:underline"
                  >
                    Current cover
                  </a>
                  <button
                    type="button"
                    onClick={() => setRemoveCover(true)}
                    className="shrink-0 rounded-lg p-1 text-red-500 hover:bg-red-50"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {removeCover && !coverFile && (
                    <p className="text-xs text-red-500">File will be removed on save.</p>
                  )}
                  <input
                    id="book-cover"
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleFileChange(event, setCoverFile)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  />
                  {removeCover && !coverFile && (
                    <button
                      type="button"
                      onClick={() => setRemoveCover(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      Keep existing file
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Document file */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Document file</label>
              {editingBook && (editingBook.file_url || editingBook.file) && !removeBookFile && !bookFile ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <a
                    href={editingBook.file_url ?? editingBook.file ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 truncate font-medium text-indigo-600 hover:underline"
                  >
                    Current document
                  </a>
                  <button
                    type="button"
                    onClick={() => setRemoveBookFile(true)}
                    className="shrink-0 rounded-lg p-1 text-red-500 hover:bg-red-50"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {removeBookFile && !bookFile && (
                    <p className="text-xs text-red-500">File will be removed on save.</p>
                  )}
                  <input
                    id="book-file"
                    type="file"
                    onChange={(event) => handleFileChange(event, setBookFile)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  />
                  {removeBookFile && !bookFile && (
                    <button
                      type="button"
                      onClick={() => setRemoveBookFile(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      Keep existing file
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Audio file */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Audio file</label>
              {editingBook && (editingBook.audio_file_url || editingBook.audio_file) && !removeAudioFile && !audioFile ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <a
                    href={editingBook.audio_file_url ?? editingBook.audio_file ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 truncate font-medium text-indigo-600 hover:underline"
                  >
                    Current audio
                  </a>
                  <button
                    type="button"
                    onClick={() => setRemoveAudioFile(true)}
                    className="shrink-0 rounded-lg p-1 text-red-500 hover:bg-red-50"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {removeAudioFile && !audioFile && (
                    <p className="text-xs text-red-500">File will be removed on save.</p>
                  )}
                  <input
                    id="book-audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={(event) => handleFileChange(event, setAudioFile)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  />
                  {removeAudioFile && !audioFile && (
                    <button
                      type="button"
                      onClick={() => setRemoveAudioFile(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      Keep existing file
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Video file */}
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Video file</label>
              {editingBook && (editingBook.video_file_url || editingBook.video_file) && !removeVideoFile && !videoFile ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <a
                    href={editingBook.video_file_url ?? editingBook.video_file ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 truncate font-medium text-indigo-600 hover:underline"
                  >
                    Current video
                  </a>
                  <button
                    type="button"
                    onClick={() => setRemoveVideoFile(true)}
                    className="shrink-0 rounded-lg p-1 text-red-500 hover:bg-red-50"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {removeVideoFile && !videoFile && (
                    <p className="text-xs text-red-500">File will be removed on save.</p>
                  )}
                  <input
                    id="book-video-file"
                    type="file"
                    accept="video/*"
                    onChange={(event) => handleFileChange(event, setVideoFile)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                  />
                  {removeVideoFile && !videoFile && (
                    <button
                      type="button"
                      onClick={() => setRemoveVideoFile(false)}
                      className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                    >
                      Keep existing file
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Gemini extraction toggle — only relevant for PDF type */}
          {formValues.type === 'pdf' && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <BrainCircuit className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">
                      Extract text with Gemini AI
                    </p>
                    <p className="mt-0.5 text-xs text-indigo-600">
                      After saving, the PDF will be sent to Gemini to extract Arabic text and generate a summary.
                      {editingBook?.has_text_extraction
                        ? ' Existing extraction will be overwritten.'
                        : ''}
                    </p>
                  </div>
                </div>
                {/* Pill toggle */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={extractWithGemini}
                  onClick={() => setExtractWithGemini((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    extractWithGemini ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      extractWithGemini ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </form>
      </Offcanvas>

      {extractingBook ? (
        <ExtractionModal
          book={extractingBook}
          onClose={() => setExtractingBook(null)}
        />
      ) : null}
    </div>
  );
};

export default Books;