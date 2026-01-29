import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { VideoListPanel, VideoEditModal } from './components';
import { VideoUploadPanel } from './components/VideoUploadPanel';
import { getStoredDayId } from './components/VideoDayPicker';
import { getStoredCategoryId } from './components/CategoryPicker';
import { getVideos, deleteVideo, type Video } from '../../services/videosApi';
import { showToast } from '../../utils/toast';
import Pagination from '../../components/Pagination';
import { VIDEOS_PAGE_SIZE } from '../../config/api';

export default function VideosPage() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayId, setSelectedDayId] = useState<string>(() => getStoredDayId());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => getStoredCategoryId());
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = VIDEOS_PAGE_SIZE;

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVideos(
        selectedDayId || undefined,
        selectedCategoryId || undefined,
        currentPage,
        pageSize
      );
      const list = res.results ?? [];
      setVideos(list);
      const count = res.count ?? list.length;
      setTotalCount(count);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : t('videos.failedToLoad'));
      setVideos([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [selectedDayId, selectedCategoryId, currentPage, pageSize, t]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleSelectDayId = useCallback((id: string) => {
    setSelectedDayId(id);
    setCurrentPage(1);
  }, []);

  const handleSelectCategoryId = useCallback((id: string) => {
    setSelectedCategoryId(id);
    setCurrentPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + videos.length;

  const handleDelete = useCallback(async (id: number): Promise<void> => {
    const previous = [...videos];
    setVideos((prev) => prev.filter((p) => p.id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
    try {
      await deleteVideo(id);
    } catch (err) {
      setVideos(previous);
      setTotalCount((prev) => prev + 1);
      showToast.error(err instanceof Error ? err.message : t('videos.deleteFailed'));
      throw err;
    }
  }, [videos]);

  const handleVideosAdded = useCallback(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleEdit = useCallback((video: Video) => {
    setEditingVideo(video);
  }, []);

  const handleEditSaved = useCallback(() => {
    fetchVideos();
  }, [fetchVideos]);

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
          <h1 className="text-2xl font-bold text-gray-900">{t('videos.title')}</h1>
          <p className="text-gray-600 text-sm mt-0.5">{t('videos.subtitle')}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        <div className="flex-1 min-w-0 order-2 lg:order-1 flex flex-col">
          <VideoListPanel videos={videos} loading={loading} onDelete={handleDelete} onEdit={handleEdit} />
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
        <div className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-2">
          <VideoUploadPanel
            selectedDayId={selectedDayId}
            onSelectDayId={handleSelectDayId}
            selectedCategoryId={selectedCategoryId}
            onSelectCategoryId={handleSelectCategoryId}
            onVideosAdded={handleVideosAdded}
          />
        </div>
      </div>

      <VideoEditModal
        video={editingVideo}
        isOpen={editingVideo != null}
        onClose={() => setEditingVideo(null)}
        onSaved={handleEditSaved}
      />
    </div>
  );
}
