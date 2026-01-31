import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AccompanyingExhibitionPhoto } from '../../../../services/accompanyingExhibitionPhotosApi';
import { Trash2, Loader2, ImageOff, Download } from 'lucide-react';

interface PhotoListPanelProps {
  photos: AccompanyingExhibitionPhoto[];
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

/** Download image as .jpg (converts from .webp if needed) */
async function downloadAsJpg(fileUrl: string, photoId: number): Promise<void> {
  const res = await fetch(fileUrl, { mode: 'cors' });
  const blob = await res.blob();
  const img = new Image();
  const objectUrl = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (jpegBlob) => {
            URL.revokeObjectURL(objectUrl);
            if (!jpegBlob) {
              reject(new Error('Failed to create JPEG'));
              return;
            }
            const url = URL.createObjectURL(jpegBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `accompanyingexhibition-photo-${photoId}.jpg`;
            a.click();
            URL.revokeObjectURL(url);
            resolve();
          },
          'image/jpeg',
          0.92
        );
      } catch (e) {
        URL.revokeObjectURL(objectUrl);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
}

function PhotoCard({
  photo,
  onDelete,
}: {
  photo: AccompanyingExhibitionPhoto;
  onDelete: (id: number) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleDownload = async () => {
    if (!photo.file_url) return;
    setDownloading(true);
    try {
      await downloadAsJpg(photo.file_url, photo.id);
    } catch {
      // Fallback: open in new tab or direct download with .jpg name
      const a = document.createElement('a');
      a.href = photo.file_url;
      a.download = `accompanyingexhibition-photo-${photo.id}.jpg`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteClick = () => {
    setConfirming(true);
  };

  const handleConfirm = async () => {
    setConfirming(false);
    setDeleting(true);
    try {
      await onDelete(photo.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleCancel = () => setConfirming(false);

  const dayLabel = photo.day_name_en || photo.day_name_ar || '—';

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-[4/3] bg-gray-100 relative">
        {photo.file_url ? (
          <img
            src={photo.file_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageOff className="w-12 h-12" />
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
          <span className="text-gray-500 font-normal">{t('photos.day', 'Day')}: </span>
          {dayLabel}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{formatDate(photo.created_at)}</p>
      </div>
      <div className="absolute top-2 end-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!confirming ? (
          <>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !photo.file_url}
              className="p-2 rounded-lg text-white hover:bg-opacity-90 disabled:opacity-60 transition-colors"
              style={{ backgroundColor: '#0c4261' }}
              aria-label={t('common.download')}
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={deleting}
              className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
              aria-label={t('common.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
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
              onClick={handleCancel}
              className="px-2 py-1 text-xs font-medium rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              {t('common.cancel')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function PhotoListPanel({
  photos,
  loading,
  onDelete,
  className = '',
}: PhotoListPanelProps) {
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
              <div className="aspect-[4/3] bg-gray-200" />
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

  if (photos.length === 0) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
          <ImageOff className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600">{t('accompanyingExhibitionPhotos.noPhotosYet') || 'No photos yet'}</p>
          <p className="text-sm text-gray-500 mt-1">{t('accompanyingExhibitionPhotos.addUsingPanel') || 'Add photos using the panel on the right'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}
