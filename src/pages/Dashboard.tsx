import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  FileAudio,
  FileText,
  FileVideo,
  LayoutDashboard,
  RefreshCcw,
  Tags,
  TrendingUp,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useGetBooksQuery, type Book } from '../services/bookApi';
import { useGetCategoriesQuery } from '../services/categoryApi';
import { useAuth } from '../hooks/useAuth';

type BookType = Book['type'];

const TYPE_META: Record<BookType, { label: string; icon: typeof FileText; color: string; bg: string }> = {
  pdf: { label: 'PDF', icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' },
  audio: { label: 'Audio', icon: FileAudio, color: 'text-amber-600', bg: 'bg-amber-50' },
  video: { label: 'Video', icon: FileVideo, color: 'text-sky-600', bg: 'bg-sky-50' },
};

const formatPercent = (value: number, total: number) => {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

const Dashboard = () => {
  const { user } = useAuth();
  const {
    data: books = [],
    isLoading: isLoadingBooks,
    isFetching: isFetchingBooks,
    refetch: refetchBooks,
  } = useGetBooksQuery();
  const {
    data: categories = [],
    isLoading: isLoadingCategories,
    isFetching: isFetchingCategories,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();

  const isLoading = isLoadingBooks || isLoadingCategories;
  const isFetching = isFetchingBooks || isFetchingCategories;

  const refreshAll = () => {
    refetchBooks();
    refetchCategories();
  };

  const stats = useMemo(() => {
    const total = books.length;
    const active = books.filter((b) => b.status === 'active').length;
    const inactive = total - active;
    const extracted = books.filter((b) => b.has_text_extraction).length;
    const withFile = books.filter((b) => b.file || b.file_url).length;
    return { total, active, inactive, extracted, withFile };
  }, [books]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    for (const book of books) {
      counts.set(book.category, (counts.get(book.category) ?? 0) + 1);
    }

    const rows = categories
      .map((cat) => ({
        slug: cat.slug,
        name: cat.category_name,
        status: cat.status,
        count: counts.get(cat.slug) ?? 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Surface category slugs that exist on books but aren't in the Category table
    // (legacy data). These appear as "Unmapped" so admins can clean them up.
    const knownSlugs = new Set(categories.map((c) => c.slug));
    const orphanRows = Array.from(counts.entries())
      .filter(([slug]) => !knownSlugs.has(slug))
      .map(([slug, count]) => ({
        slug,
        name: `${slug} (unmapped)`,
        status: 'inactive' as const,
        count,
      }));

    return [...rows, ...orphanRows];
  }, [books, categories]);

  const maxCategoryCount = useMemo(
    () => categoryBreakdown.reduce((max, row) => Math.max(max, row.count), 0),
    [categoryBreakdown]
  );

  const typeBreakdown = useMemo(() => {
    const counts: Record<BookType, number> = { pdf: 0, audio: 0, video: 0 };
    for (const book of books) {
      counts[book.type] = (counts[book.type] ?? 0) + 1;
    }
    return (['pdf', 'audio', 'video'] as BookType[]).map((type) => ({
      type,
      count: counts[type],
    }));
  }, [books]);

  const recentBooks = useMemo(
    () =>
      [...books]
        .sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 5),
    [books]
  );

  const extractionRate = stats.total > 0 ? Math.round((stats.extracted / stats.total) * 100) : 0;

  const greetingName = useMemo(() => {
    if (!user) return '';
    if (user.name && user.name.trim()) return user.name.split(' ')[0];
    return user.email?.split('@')[0] ?? '';
  }, [user]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={greetingName ? `Welcome back, ${greetingName}` : 'Dashboard'}
        subtitle="A snapshot of the library catalog, categories and AI extractions"
        icon={LayoutDashboard}
        sticky={false}
        action={
          <button
            type="button"
            onClick={refreshAll}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Books"
          value={stats.total}
          hint={`${stats.active} active · ${stats.inactive} inactive`}
          icon={BookOpen}
          accent="indigo"
          loading={isLoading}
        />
        <StatCard
          label="Categories"
          value={categories.length}
          hint={`${categories.filter((c) => c.status === 'active').length} active`}
          icon={Tags}
          accent="emerald"
          loading={isLoading}
        />
        <StatCard
          label="AI Extracted"
          value={stats.extracted}
          hint={`${extractionRate}% of catalogue`}
          icon={BrainCircuit}
          accent="violet"
          loading={isLoading}
        />
        <StatCard
          label="With PDF File"
          value={stats.withFile}
          hint={`${formatPercent(stats.withFile, stats.total)} of books`}
          icon={FileText}
          accent="amber"
          loading={isLoading}
        />
      </div>

      {/* Middle: category breakdown + type breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <header className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Tags className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Books by category</h2>
                <p className="text-sm text-slate-500">Distribution across all configured categories</p>
              </div>
            </div>
            <Link
              to="/categories"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
            >
              Manage
              <ChevronRight className="h-4 w-4" />
            </Link>
          </header>

          <div className="mt-6 space-y-3">
            {isLoading ? (
              <SkeletonBars count={4} />
            ) : categoryBreakdown.length === 0 ? (
              <EmptyState
                title="No categories yet"
                hint="Create categories on the Categories page to start grouping books."
              />
            ) : (
              categoryBreakdown.map((row) => {
                const width = maxCategoryCount === 0 ? 0 : (row.count / maxCategoryCount) * 100;
                const isInactive = row.status === 'inactive';
                return (
                  <div key={row.slug} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`truncate font-medium ${isInactive ? 'text-slate-400' : 'text-slate-700'}`}>
                          {row.name}
                        </span>
                        {isInactive ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                            inactive
                          </span>
                        ) : null}
                      </div>
                      <span className="shrink-0 font-semibold text-slate-900">{row.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isInactive ? 'bg-slate-300' : 'bg-linear-to-r from-indigo-500 to-emerald-500'
                        }`}
                        style={{ width: `${Math.max(width, row.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Books by type</h2>
              <p className="text-sm text-slate-500">Media format breakdown</p>
            </div>
          </header>

          <div className="mt-6 space-y-4">
            {isLoading ? (
              <SkeletonBars count={3} />
            ) : (
              typeBreakdown.map(({ type, count }) => {
                const meta = TYPE_META[type];
                const Icon = meta.icon;
                const pct = stats.total === 0 ? 0 : (count / stats.total) * 100;
                return (
                  <div key={type} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="text-sm font-medium text-slate-700">{meta.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-slate-900">{count}</span>
                        <span className="ml-2 text-xs text-slate-500">{formatPercent(count, stats.total)}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${meta.bg.replace('bg-', 'bg-').replace('-50', '-400')}`}
                        style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Bottom: recent books + extraction summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <header className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recently added books</h2>
                <p className="text-sm text-slate-500">The five most recent records</p>
              </div>
            </div>
            <Link
              to="/books"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </header>

          <div className="mt-5 divide-y divide-slate-100">
            {isLoading ? (
              <div className="flex justify-center py-8 text-slate-400">
                <RefreshCcw className="h-5 w-5 animate-spin" />
              </div>
            ) : recentBooks.length === 0 ? (
              <EmptyState title="No books yet" hint="Add the first book from the Books page." />
            ) : (
              recentBooks.map((book) => {
                const meta = TYPE_META[book.type];
                const Icon = meta.icon;
                return (
                  <div key={book.id} className="flex items-center gap-3 py-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{book.title}</p>
                      <p className="truncate text-xs text-slate-500">
                        {book.author || 'Unknown author'} · {book.category}
                      </p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs text-slate-500">
                        {book.created_at ? new Date(book.created_at).toLocaleDateString() : '—'}
                      </p>
                      {book.has_text_extraction ? (
                        <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Extracted
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Extraction progress</h2>
              <p className="text-sm text-slate-500">Arabic text extracted by Gemini</p>
            </div>
          </header>

          <div className="mt-6 flex items-center justify-center">
            <ProgressRing value={extractionRate} loading={isLoading} />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Extracted</dt>
              <dd className="mt-1 text-lg font-semibold text-emerald-600">{stats.extracted}</dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <dt className="text-xs uppercase tracking-wide text-slate-500">Pending</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-700">
                {Math.max(stats.total - stats.extracted, 0)}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

type Accent = 'indigo' | 'emerald' | 'violet' | 'amber';

const ACCENT_META: Record<Accent, { bg: string; text: string; ring: string }> = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
};

interface StatCardProps {
  label: string;
  value: number;
  hint?: string;
  icon: typeof BookOpen;
  accent: Accent;
  loading?: boolean;
}

const StatCard = ({ label, value, hint, icon: Icon, accent, loading }: StatCardProps) => {
  const meta = ACCENT_META[accent];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {loading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-slate-200" /> : value}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.text} ring-4 ${meta.ring}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
};

const SkeletonBars = ({ count }: { count: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="space-y-1.5">
        <div className="flex justify-between">
          <span className="inline-block h-3 w-32 animate-pulse rounded bg-slate-200" />
          <span className="inline-block h-3 w-8 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
      </div>
    ))}
  </div>
);

const EmptyState = ({ title, hint }: { title: string; hint: string }) => (
  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
    <p className="text-sm font-medium text-slate-700">{title}</p>
    <p className="mt-1 text-xs text-slate-500">{hint}</p>
  </div>
);

const ProgressRing = ({ value, loading }: { value: number; loading?: boolean }) => {
  const size = 140;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.max(0, Math.min(100, value));
  const offset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={loading ? circumference : offset}
          className="text-violet-500 transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold text-slate-900">
          {loading ? '—' : `${safeValue}%`}
        </span>
        <span className="text-xs text-slate-500">complete</span>
      </div>
    </div>
  );
};

export default Dashboard;
