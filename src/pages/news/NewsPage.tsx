import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { NewsListPanel } from './components/NewsListPanel';
import { NewsUploadPanel } from './components/NewsUploadPanel';
import { getStoredDayId } from './components/NewsDayPicker';
import { getNews, deleteNews, type NewsItem } from '../../services/newsApi';
import { showToast } from '../../utils/toast';
import Pagination from '../../components/Pagination';
import { NEWS_PAGE_SIZE } from '../../config/api';

export default function NewsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayId, setSelectedDayId] = useState<string>(() => getStoredDayId());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = NEWS_PAGE_SIZE;

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNews(selectedDayId || undefined, currentPage, pageSize);
      const list = res.results ?? [];
      setItems(list);
      const count = res.count ?? list.length;
      setTotalCount(count);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : t('news.failedToLoad'));
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedDayId, currentPage, pageSize, t]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleSelectDayId = useCallback((id: string) => {
    setSelectedDayId(id);
    setCurrentPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + items.length;

  const handleDelete = useCallback(async (id: number): Promise<void> => {
    const previous = [...items];
    setItems((prev) => prev.filter((p) => p.id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
    try {
      await deleteNews(id);
    } catch (err) {
      setItems(previous);
      setTotalCount((prev) => prev + 1);
      showToast.error(err instanceof Error ? err.message : t('news.deleteFailed'));
      throw err;
    }
  }, [items]);

  const handleNewsAdded = useCallback(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <div className="flex flex-col min-h-0">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/dashboard"
          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: '#0c4261' }}
          aria-label={t('common.backToDashboard')}
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('news.title')}</h1>
          <p className="text-gray-600 text-sm mt-0.5">{t('news.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="flex-1 min-w-0 order-2 lg:order-1 flex flex-col">
          <NewsListPanel items={items} loading={loading} onDelete={handleDelete} />
          {!loading && totalCount > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={pageSize}
              totalItems={totalCount}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setCurrentPage}
              showRowsPerPage={false}
            />
          )}
        </div>
        {/* Add News column: increased width (wider than videos' lg:w-80) */}
        <div className="w-full lg:w-[32rem] flex-shrink-0 order-1 lg:order-2">
          <NewsUploadPanel
            selectedDayId={selectedDayId}
            onSelectDayId={handleSelectDayId}
            onNewsAdded={handleNewsAdded}
          />
        </div>
      </div>
    </div>
  );
}
