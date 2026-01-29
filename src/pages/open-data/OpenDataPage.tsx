import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { OpenDataListPanel } from './components/OpenDataListPanel';
import { OpenDataUploadPanel } from './components/OpenDataUploadPanel';
import { getStoredDayId } from './components/OpenDataDayPicker';
import { getOpenData, deleteOpenData, type OpenDataItem } from '../../services/openDataApi';
import { showToast } from '../../utils/toast';

export default function OpenDataPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<OpenDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayId, setSelectedDayId] = useState<string>(() => getStoredDayId());

  const fetchOpenData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOpenData(selectedDayId || undefined);
      setItems(res.results ?? []);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : t('openData.failedToLoad'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDayId]);

  useEffect(() => {
    fetchOpenData();
  }, [fetchOpenData]);

  const handleDelete = useCallback(async (id: number): Promise<void> => {
    const previous = [...items];
    setItems((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteOpenData(id);
    } catch (err) {
      setItems(previous);
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
        <div className="flex-1 min-w-0 order-2 lg:order-1">
          <OpenDataListPanel items={items} loading={loading} onDelete={handleDelete} />
        </div>
        <div className="w-full lg:w-[32rem] flex-shrink-0 order-1 lg:order-2">
          <OpenDataUploadPanel
            selectedDayId={selectedDayId}
            onSelectDayId={setSelectedDayId}
            onOpenDataAdded={handleOpenDataAdded}
          />
        </div>
      </div>
    </div>
  );
}
