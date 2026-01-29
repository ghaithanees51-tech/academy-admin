import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { OpenDataListPanel } from './components/OpenDataListPanel';
import { OpenDataUploadPanel } from './components/OpenDataUploadPanel';
import { getStoredDayId } from './components/OpenDataDayPicker';
import { getOpenData, deleteOpenData, type OpenDataItem } from '../../services/openDataApi';
import { showToast } from '../../utils/toast';
import Pagination from '../../components/Pagination';
import { OPEN_DATA_PAGE_SIZE } from '../../config/api';

export default function OpenDataPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<OpenDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayId, setSelectedDayId] = useState<string>(() => getStoredDayId());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = OPEN_DATA_PAGE_SIZE;

  const fetchOpenData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOpenData(selectedDayId || undefined, currentPage, pageSize);
      const list = res.results ?? [];
      setItems(list);
      const count = res.count ?? list.length;
      setTotalCount(count);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : t('openData.failedToLoad'));
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedDayId, currentPage, pageSize, t]);

  useEffect(() => {
    fetchOpenData();
  }, [fetchOpenData]);

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
      await deleteOpenData(id);
    } catch (err) {
      setItems(previous);
      setTotalCount((prev) => prev + 1);
      showToast.error(err instanceof Error ? err.message : t('openData.deleteFailed'));
      throw err;
    }
  }, [items]);

  const handleOpenDataAdded = useCallback(() => {
    fetchOpenData();
  }, [fetchOpenData]);

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
          <h1 className="text-2xl font-bold text-gray-900">{t('openData.title')}</h1>
          <p className="text-gray-600 text-sm mt-0.5">{t('openData.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="flex-1 min-w-0 order-2 lg:order-1 flex flex-col">
          <OpenDataListPanel items={items} loading={loading} onDelete={handleDelete} />
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
        <div className="w-full lg:w-[32rem] flex-shrink-0 order-1 lg:order-2">
          <OpenDataUploadPanel
            selectedDayId={selectedDayId}
            onSelectDayId={handleSelectDayId}
            onOpenDataAdded={handleOpenDataAdded}
          />
        </div>
      </div>
    </div>
  );
}
