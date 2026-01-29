import { useCallback, useEffect, useRef, useState } from 'react';
import { VideoDayPicker, setStoredDayId } from './VideoDayPicker';
import { CategoryPicker, setStoredCategoryId } from './CategoryPicker';
import { VideoDropzone } from './VideoDropzone';
import { ThumbnailUpload } from './ThumbnailUpload';
import { UploadProgress, type UploadQueueItem, type UploadFileStatus } from './VideoUploadProgress';
import { getDays, getCategories, postVideo, getVideoStatus, type Day, type Category } from '../../../services/videosApi';
import { showToast } from '../../../utils/toast';

interface VideoUploadPanelProps {
  selectedDayId: string;
  onSelectDayId: (id: string) => void;
  selectedCategoryId: string;
  onSelectCategoryId: (id: string) => void;
  onVideosAdded?: () => void;
  className?: string;
}

interface QueuedFile {
  id: string;
  file: File;
  name: string;
  status: UploadFileStatus;
  progress: number;
  error?: string;
  videoId?: number; // Track uploaded video ID for status polling
}

export function VideoUploadPanel({
  selectedDayId,
  onSelectDayId,
  selectedCategoryId,
  onSelectCategoryId,
  onVideosAdded,
  className = '',
}: VideoUploadPanelProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [overallPercent, setOverallPercent] = useState(0);
  const [days, setDays] = useState<Day[]>([]);
  const [daysLoading, setDaysLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    getDays()
      .then(setDays)
      .catch(() => setDays([]))
      .finally(() => setDaysLoading(false));
  }, []);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const updateQueue = useCallback((updater: (prev: QueuedFile[]) => QueuedFile[]) => {
    setQueue((prev) => {
      const next = updater(prev);
      const total = next.length;
      if (total === 0) {
        setOverallPercent(0);
        return next;
      }
      const progressSum = next.reduce((s, q) => s + q.progress, 0);
      setOverallPercent(progressSum / total);
      return next;
    });
  }, []);

  // Poll video processing status
  const pollVideoStatus = useCallback(
    async (videoId: number, itemId: string) => {
      const maxAttempts = 120; // Poll for up to 2 minutes (120 * 1s)
      let attempts = 0;

      const poll = async (): Promise<void> => {
        try {
          const status = await getVideoStatus(videoId);

          // Update queue item with processing progress
          updateQueue((prev) =>
            prev.map((q) =>
              q.id === itemId
                ? {
                    ...q,
                    status: status.status === 'ready' ? 'done' : status.status === 'failed' ? 'error' : 'processing',
                    progress: status.processing_progress,
                    error: status.processing_error || undefined,
                  }
                : q
            )
          );

          // If processing is complete, stop polling and refresh list
          if (status.is_processing_complete) {
            // Refresh list to show updated video with compression/thumbnail
            onVideosAdded?.();
            return;
          }

          // Continue polling if not complete
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(() => poll(), 1000); // Poll every 1 second
          } else {
            // Timeout
            updateQueue((prev) =>
              prev.map((q) =>
                q.id === itemId ? { ...q, status: 'error', error: 'Processing timeout' } : q
              )
            );
          }
        } catch (err) {
          console.error('Error polling video status:', err);
          // Continue polling on error (network issues, etc.)
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(() => poll(), 2000); // Retry after 2 seconds
          }
        }
      };

      await poll();
    },
    [updateQueue, onVideosAdded]
  );

  const processAndUpload = useCallback(
    async (files: File[]) => {
      if (processingRef.current || files.length === 0) return;
      if (!selectedDayId || !selectedCategoryId) {
        showToast.error('Please select Day and Category first.');
        return;
      }
      processingRef.current = true;

      const dayId = Number(selectedDayId);
      const categoryId = Number(selectedCategoryId);
      const newItems: QueuedFile[] = files.map((file, i) => ({
        id: `${Date.now()}-${i}-${file.name}`,
        file,
        name: file.name,
        status: 'pending',
        progress: 0,
      }));

      setQueue((prev) => [...prev, ...newItems]);
      setOverallPercent(0);

      let addedCount = 0;

      for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        const setItemStatus = (
          status: UploadFileStatus,
          progress: number = 0,
          error?: string,
          videoId?: number
        ) => {
          updateQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, status, progress, error, videoId } : q))
          );
        };

        setItemStatus('uploading', 0);

        try {
          const formData = new FormData();
          formData.append('day', String(dayId));
          formData.append('category', String(categoryId));
          formData.append('video', item.file);
          
          // Add optional thumbnail if provided (applies to each video in batch)
          if (thumbnailFile) {
            formData.append('thumbnail', thumbnailFile);
          }

          // Upload with progress tracking
          const response = await postVideo(formData, (p) => {
            updateQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, progress: p } : q))
            );
          });

          // Upload complete, now processing
          setItemStatus('processing', response.processing_progress || 0, undefined, response.id);
          addedCount += 1;

          // Start polling for processing status
          pollVideoStatus(response.id, item.id);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Upload failed';
          setItemStatus('error', 0, message);
        }
      }

      processingRef.current = false;

      if (addedCount > 0) {
        // Refresh video list immediately so uploads appear right away
        onVideosAdded?.();
        showToast.success(`${addedCount} video(s) uploaded${thumbnailFile ? ' with thumbnail' : ''}. Processing...`);
        // Clear Thumbnail Image (Optional) field after upload complete
        setThumbnailFile(null);
      }
      const errors = newItems.length - addedCount;
      if (errors > 0) showToast.error(`${errors} upload(s) failed.`);

      // Remove completed items after delay
      setTimeout(() => {
        updateQueue((prev) => prev.filter((q) => !['done', 'error'].includes(q.status)));
      }, 3000);
    },
    [selectedDayId, selectedCategoryId, updateQueue, pollVideoStatus, thumbnailFile, onVideosAdded]
  );

  const handleDaySelect = (id: string) => {
    onSelectDayId(id);
    setStoredDayId(id);
  };

  const handleCategorySelect = (id: string) => {
    onSelectCategoryId(id);
    setStoredCategoryId(id);
  };

  const queueItems: UploadQueueItem[] = queue.map((q) => ({
    id: q.id,
    name: q.name,
    status: q.status,
    progress: q.progress,
    error: q.error,
  }));

  const canUpload = selectedDayId && selectedCategoryId;
  const isUploading = queue.some((q) => q.status === 'uploading');

  return (
    <aside className={`flex flex-col gap-6 bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      <h2 className="text-lg font-bold text-gray-900">Add Videos</h2>

      <VideoDayPicker
        days={days}
        selectedDayId={selectedDayId}
        onSelect={handleDaySelect}
        loading={daysLoading}
      />

      <CategoryPicker
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelect={handleCategorySelect}
        loading={categoriesLoading}
        disabled={!selectedDayId}
      />

      <ThumbnailUpload
        value={thumbnailFile}
        onChange={setThumbnailFile}
        disabled={!canUpload || isUploading}
      />

      <VideoDropzone
        onFiles={processAndUpload}
        disabled={!canUpload || isUploading}
      />

      <UploadProgress items={queueItems} overallPercent={overallPercent} showOverallBar />
    </aside>
  );
}
