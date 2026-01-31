import { useCallback, useEffect, useRef, useState } from 'react';
import { DayPicker, setStoredDayId } from './DayPicker';
import { DropzoneUploader } from './DropzoneUploader';
import {
  UploadProgress,
  type UploadQueueItem,
  type UploadFileStatus,
} from './UploadProgress';
import { getDays, postCompetitionPhoto, type Day } from '../../../../services/competitionPhotosApi';
import { preprocessImage, getExtensionForMime } from '../../../../utils/imagePreprocess';
import { showToast } from '../../../../utils/toast';

interface UploadPanelProps {
  selectedDayId: string;
  onSelectDayId: (id: string) => void;
  /** Called after one or more photos are uploaded successfully (e.g. to refetch list). */
  onPhotosAdded?: () => void;
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
}

export function UploadPanel({
  selectedDayId,
  onSelectDayId,
  onPhotosAdded,
  className = '',
}: UploadPanelProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [overallPercent, setOverallPercent] = useState(0);
  const [days, setDays] = useState<Day[]>([]);
  const [daysLoading, setDaysLoading] = useState(true);
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
      const done = next.filter((q) => q.status === 'done').length;
      const inProgress = next.filter((q) => q.status === 'uploading' || q.status === 'processing').length;
      const progressSum = next.reduce((s, q) => s + q.progress, 0);
      const percent = inProgress > 0 ? progressSum / total : (done / total) * 100;
      setOverallPercent(percent);
      return next;
    });
  }, []);

  const processAndUpload = useCallback(
    async (files: File[]) => {
      if (processingRef.current || files.length === 0) return;
      processingRef.current = true;

      const dayId = selectedDayId ? Number(selectedDayId) : undefined;
      const newItems: QueuedFile[] = files.map((file, i) => ({
        id: `${Date.now()}-${i}-${file.name}`,
        file,
        name: file.name,
        status: 'pending' as UploadFileStatus,
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

        setItemStatus('processing');

        try {
          const result = await preprocessImage(item.file);
          const ext = getExtensionForMime(result.mimeType);
          const blob = result.blob;
          const processedFile = new File([blob], `${item.name.replace(/\.[^.]+$/, '')}.${ext}`, {
            type: result.mimeType,
          });

          const formData = new FormData();
          if (dayId != null) formData.append('day', String(dayId));
          formData.append('file', processedFile);

          setItemStatus('uploading', 0);

          await postCompetitionPhoto(formData, (p) => {
            updateQueue((prev) =>
              prev.map((q) => (q.id === item.id ? { ...q, progress: p } : q))
            );
          });

          setItemStatus('done', 100);
          addedCount += 1;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Upload failed';
          setItemStatus('error', 0, message);
        }
      }

      processingRef.current = false;

      if (addedCount > 0) {
        onPhotosAdded?.();
        showToast.success(`${addedCount} photo(s) added.`);
      }

      const errors = newItems.length - addedCount;
      if (errors > 0) {
        showToast.error(`${errors} upload(s) failed.`);
      }

      setTimeout(() => {
        updateQueue((prev) => prev.filter((q) => !newItems.some((n) => n.id === q.id)));
      }, 1500);
    },
    [selectedDayId, onPhotosAdded, updateQueue]
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

  return (
    <aside
      className={`flex flex-col gap-6 bg-white rounded-2xl border border-gray-200 p-6 ${className}`}
    >
      <h2 className="text-lg font-bold text-gray-900">Add Photos</h2>

      {/* Row 1: Day selector */}
      <DayPicker
        days={days}
        selectedDayId={selectedDayId}
        onSelect={handleDaySelect}
        loading={daysLoading}
      />

      {/* Row 2: Upload area */}
      <DropzoneUploader
        onFiles={(files) => processAndUpload(files)}
        disabled={queue.some((q) => q.status === 'processing' || q.status === 'uploading')}
      />

      {/* Row 3: Upload progress */}
      <UploadProgress
        items={queueItems}
        overallPercent={overallPercent}
        showOverallBar
      />
    </aside>
  );
}
