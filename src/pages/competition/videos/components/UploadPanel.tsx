import { useCallback, useEffect, useRef, useState } from 'react';
import { DayPicker, setStoredDayId } from './DayPicker';
import { VideoDropzone } from './VideoDropzone';
import { ThumbnailUpload } from './ThumbnailUpload';
import {
  UploadProgress,
  type UploadQueueItem,
  type UploadFileStatus,
} from './UploadProgress';
import { getDays, postCompetitionVideo, type Day } from '../../../../services/competitionVideosApi';
import { API_BASE_URL } from '../../../../config/api';
import { authenticatedFetch } from '../../../../utils/api';
import { showToast } from '../../../../utils/toast';

interface UploadPanelProps {
  selectedDayId: string;
  onSelectDayId: (id: string) => void;
  /** Called after one or more videos are uploaded successfully (e.g. to refetch list). */
  onVideosAdded?: () => void;
  /** RTL-friendly */
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

export function UploadPanel({
  selectedDayId,
  onSelectDayId,
  onVideosAdded,
  className = '',
}: UploadPanelProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [overallPercent, setOverallPercent] = useState(0);
  const [days, setDays] = useState<Day[]>([]);
  const [daysLoading, setDaysLoading] = useState(true);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    getDays()
      .then(setDays)
      .catch(() => setDays([]))
      .finally(() => setDaysLoading(false));
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
          // Fetch video status from API
          const url = `${API_BASE_URL}/api/competition/videos/${videoId}/`;
          const response = await authenticatedFetch(url, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch video status');
          }

          const video = await response.json();

          // Update queue item with processing progress
          updateQueue((prev) =>
            prev.map((q) =>
              q.id === itemId
                ? {
                    ...q,
                    status: video.status === 'ready' ? 'done' : video.status === 'failed' ? 'error' : 'processing',
                    progress: video.processing_progress || 0,
                    error: video.processing_error || undefined,
                  }
                : q
            )
          );

          // If processing is complete, stop polling and refresh list
          if (video.status === 'ready' || video.status === 'failed') {
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
      processingRef.current = true;

      const dayId = selectedDayId ? Number(selectedDayId) : null;
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
        const setItemStatus = (status: UploadFileStatus, progress: number = 0, error?: string) => {
          updateQueue((prev) =>
            prev.map((q) =>
              q.id === item.id ? { ...q, status, progress, error } : q
            )
          );
        };

        setItemStatus('uploading');

        try {
          const formData = new FormData();
          // Always append day field - send empty string if null to allow backend to handle it properly
          formData.append('day', dayId != null ? String(dayId) : '');
          formData.append('video', item.file);
          
          // Add thumbnail if provided (use same thumbnail for all videos in batch)
          if (thumbnailFile && i === 0) {
            formData.append('thumbnail', thumbnailFile);
          }

          const result = await postCompetitionVideo(formData, (p) => {
            updateQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, progress: p } : q))
            );
          });

          // Video uploaded, now track processing
          setItemStatus('processing', 0);
          updateQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, videoId: result.id } : q))
          );

          // Start polling for processing status
          pollVideoStatus(result.id, item.id);

          addedCount += 1;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Upload failed';
          setItemStatus('error', 0, message);
        }
      }

      processingRef.current = false;

      if (addedCount > 0) {
        showToast.success(`${addedCount} video(s) uploaded. Processing in background...`);
        // Clear thumbnail after first upload
        setThumbnailFile(null);
      }

      const errors = newItems.length - addedCount;
      if (errors > 0) {
        showToast.error(`${errors} upload(s) failed.`);
      }

      // Clean up completed items after delay
      setTimeout(() => {
        updateQueue((prev) => prev.filter((q) => !newItems.some((n) => n.id === q.id && q.status === 'done')));
      }, 3000);
    },
    [selectedDayId, thumbnailFile, onVideosAdded, updateQueue, pollVideoStatus]
  );

  const handleDaySelect = (id: string) => {
    onSelectDayId(id);
    setStoredDayId(id);
  };

  const queueItems: UploadQueueItem[] = queue.map((q) => ({
    id: q.id,
    name: q.name,
    status: q.status,
    progress: q.progress,
    error: q.error,
  }));

  const canUpload = true; // Day is optional, so upload is always allowed
  const isUploading = queue.some((q) => q.status === 'uploading' || q.status === 'processing');

  return (
    <aside
      className={`flex flex-col gap-6 bg-white rounded-2xl border border-gray-200 p-6 ${className}`}
    >
      <h2 className="text-lg font-bold text-gray-900">Add Videos</h2>

      {/* Row 1: Day selector */}
      <DayPicker
        days={days}
        selectedDayId={selectedDayId}
        onSelect={handleDaySelect}
        loading={daysLoading}
      />

      {/* Row 2: Thumbnail upload (optional) */}
      <ThumbnailUpload
        value={thumbnailFile}
        onChange={setThumbnailFile}
        disabled={!canUpload || isUploading}
      />

      {/* Row 3: Upload area */}
      <VideoDropzone
        onFiles={(files) => processAndUpload(files)}
        disabled={!canUpload || isUploading}
      />

      {/* Row 4: Upload progress */}
      <UploadProgress
        items={queueItems}
        overallPercent={overallPercent}
        showOverallBar
      />
    </aside>
  );
}
