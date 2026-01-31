import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccompanyingExhibitionVideo } from '../../../../services/accompanyingExhibitionVideosApi';
import { Trash2, Loader2, VideoOff, Play } from 'lucide-react';
import { VideoPlayerModal } from '../../../videos/components/VideoPlayerModal';

interface VideoListPanelProps {
  videos: AccompanyingExhibitionVideo[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  /** RTL-friendly: use for grid/list alignment */
  className?: string;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function VideoCard({
  video,
  onDelete,
}: {
  video: AccompanyingExhibitionVideo;
  onDelete: (id: number) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const handleConfirm = async () => {
    setConfirming(false);
    setDeleting(true);
    try {
      await onDelete(video.id);
    } finally {
      setDeleting(false);
    }
  };

  const handlePlayClick = () => {
    const videoUrl = video.video_compressed_url || video.video_url;
    if (videoUrl) {
      setIsPlayerOpen(true);
    }
  };

  const dayLabel = video.day_name_en || video.day_name_ar || '—';
  const videoUrl = video.video_compressed_url || video.video_url;
  const isReady = video.status === 'ready' && !!videoUrl;

  return (
    <>
      <div className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-video bg-gray-100 relative">
          {video.thumbnail_url ? (
            <img
              src={video.thumbnail_url}
              alt={dayLabel}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <VideoOff className="w-12 h-12" />
            </div>
          )}
          {isReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handlePlayClick}
                className="p-3 rounded-full bg-white/90 text-gray-900 hover:bg-white transition-colors"
                aria-label={t('videos.playVideo') || 'Play video'}
              >
                <Play className="w-6 h-6" fill="currentColor" />
              </button>
            </div>
          )}
          {video.status === 'processing' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-xs">{video.processing_progress}%</p>
              </div>
            </div>
          )}
          {deleting && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0c4261]" />
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900 truncate" title={dayLabel}>
            <span className="text-gray-500 font-normal">{t('videos.day', 'Day')}: </span>
            {dayLabel}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(video.created_at)}</p>
          {video.duration_seconds != null && (
            <p className="text-xs text-gray-500 mt-0.5">
              {t('videos.duration', 'Duration')}: {formatDuration(video.duration_seconds)}
            </p>
          )}
          {video.status !== 'ready' && (
            <p className="text-xs mt-0.5">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                video.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                video.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {video.status}
              </span>
            </p>
          )}
        </div>
        <div className="absolute top-2 end-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={deleting}
              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
              aria-label={t('common.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-2 py-1 text-xs font-medium rounded bg-red-500 text-white hover:bg-red-600"
              >
                {t('common.confirm')}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="px-2 py-1 text-xs font-medium rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                {t('common.cancel')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {isPlayerOpen && videoUrl && (
        <VideoPlayerModal
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          videoUrl={videoUrl}
          title={dayLabel}
        />
      )}
    </>
  );
}

export function VideoListPanel({
  videos,
  loading,
  onDelete,
  className = '',
}: VideoListPanelProps) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
          <VideoOff className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600">{t('accompanyingExhibitionVideos.noVideosYet') || 'No videos yet'}</p>
          <p className="text-sm text-gray-500 mt-1">{t('accompanyingExhibitionVideos.addUsingPanel') || 'Add videos using the panel on the right'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
