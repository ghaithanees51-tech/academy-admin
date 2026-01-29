import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import { VideoListPanel } from './components/VideoListPanel';
import { VideoUploadPanel } from './components/VideoUploadPanel';
import { getStoredDayId } from './components/VideoDayPicker';
import { getStoredCategoryId } from './components/CategoryPicker';
import { getVideos, deleteVideo, type Video } from '../../services/videosApi';
import { showToast } from '../../utils/toast';

export default function VideosPage() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayId, setSelectedDayId] = useState<string>(() => getStoredDayId());
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(() => getStoredCategoryId());

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getVideos(
        selectedDayId || undefined,
        selectedCategoryId || undefined
      );
      setVideos(res.results ?? []);
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : t('videos.failedToLoad'));
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDayId, selectedCategoryId]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleDelete = useCallback(async (id: number): Promise<void> => {
    const previous = [...videos];
    setVideos((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteVideo(id);
    } catch (err) {
      setVideos(previous);
      showToast.error(err instanceof Error ? err.message : t('videos.deleteFailed'));
      throw err;
    }
  }, [videos]);

  const handleVideosAdded = useCallback(() => {
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
        <div className="flex-1 min-w-0 order-2 lg:order-1">
          <VideoListPanel videos={videos} loading={loading} onDelete={handleDelete} />
        </div>
        <div className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-2">
          <VideoUploadPanel
            selectedDayId={selectedDayId}
            onSelectDayId={setSelectedDayId}
            selectedCategoryId={selectedCategoryId}
            onSelectCategoryId={setSelectedCategoryId}
            onVideosAdded={handleVideosAdded}
          />
        </div>
      </div>
    </div>
  );
}
