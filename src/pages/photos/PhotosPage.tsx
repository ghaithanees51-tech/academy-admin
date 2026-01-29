import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { PhotoListPanel } from './components/PhotoListPanel';
import { UploadPanel } from './components/UploadPanel';
import { getStoredDayId } from './components/DayPicker';
import { getPhotos, deletePhoto, type Photo } from '../../services/photosApi';
import { showToast } from '../../utils/toast';
import Pagination from '../../components/Pagination';
import { PHOTOS_PAGE_SIZE } from '../../config/api';

/**
 * Photos page: 2-column layout.
 * Left: list of photos (grid), with loading skeleton, empty state, delete with confirm + optimistic update.
 * Right: Add Photos sidebar (DayPicker, DropzoneUploader, UploadProgress).
 * Day selection persists in localStorage and in-memory while on page.
 */
export default function PhotosPage() {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayId, setSelectedDayId] = useState<string>(() => getStoredDayId());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = PHOTOS_PAGE_SIZE;

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPhotos(selectedDayId || undefined, currentPage, pageSize);
      const list = res.results ?? [];
      setPhotos(list);
      const count = res.count ?? list.length;
      setTotalCount(count);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : t('photos.failedToLoad'));
      setPhotos([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedDayId, currentPage, pageSize, t]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleSelectDayId = useCallback((id: string) => {
    setSelectedDayId(id);
    setCurrentPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + photos.length;

  const handleDelete = useCallback(async (id: number): Promise<void> => {
    const previous = [...photos];
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
    try {
      await deletePhoto(id);
    } catch (err) {
      setPhotos(previous);
      setTotalCount((prev) => prev + 1);
      showToast.error(err instanceof Error ? err.message : t('photos.deleteFailed'));
      throw err;
    }
  }, [photos]);

  const handlePhotosAdded = useCallback(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return (
    <div className="flex flex-col min-h-0">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-gray-900">{t('photos.title')}</h1>
          <p className="text-gray-600 text-sm mt-0.5">{t('photos.subtitle')}</p>
        </div>
      </div>

      {/* 2-column layout: RTL-friendly (flex row, main first or order) */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left: main area - photo list */}
        <div className="flex-1 min-w-0 order-2 lg:order-1 flex flex-col">
          <PhotoListPanel
            photos={photos}
            loading={loading}
            onDelete={handleDelete}
          />
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

        {/* Right: sidebar - Add Photos */}
        <div className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-2">
          <UploadPanel
            selectedDayId={selectedDayId}
            onSelectDayId={handleSelectDayId}
            onPhotosAdded={handlePhotosAdded}
          />
        </div>
      </div>
    </div>
  );
}
