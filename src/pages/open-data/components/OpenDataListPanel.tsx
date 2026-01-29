import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { OpenDataItem } from '../../../services/openDataApi';
import { Trash2, Loader2, FileText, Download } from 'lucide-react';

interface OpenDataListPanelProps {
  items: OpenDataItem[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
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

function OpenDataCard({ item, onDelete }: { item: OpenDataItem; onDelete: (id: number) => Promise<void> }) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(false);
    setDeleting(true);
    try {
      await onDelete(item.id);
    } finally {
      setDeleting(false);
    }
  };

  const dayLabel = item.day_name_en || item.day_name_ar || '—';
  const caption = item.caption_en || item.caption_ar || '—';

  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-4 p-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[rgba(12,66,97,0.08)] flex items-center justify-center">
          <FileText className="w-6 h-6 text-[#0c4261]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate" title={caption}>
            {caption}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{dayLabel}</p>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(item.created_at)}</p>
          {item.file_size_human && (
            <p className="text-xs text-gray-500 mt-0.5">{item.file_size_human}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          {item.document_url && (
            <a
              href={item.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[#0c4261] hover:bg-[rgba(12,66,97,0.08)] transition-colors"
              aria-label={t('common.download')}
            >
              <Download className="w-5 h-5" />
            </a>
          )}
          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              aria-label={t('common.delete')}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : (
            <>
              <span className="text-xs text-gray-600">{t('openData.deleteConfirm')}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-2 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700"
                >
                  {t('common.yes')}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="px-2 py-1 text-xs font-medium rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  {t('common.no')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {deleting && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0c4261]" />
        </div>
      )}
    </div>
  );
}

export function OpenDataListPanel({ items, loading, onDelete, className = '' }: OpenDataListPanelProps) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center ${className}`}>
        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-600">{t('openData.noDataYet')}</p>
        <p className="text-sm text-gray-500 mt-1">{t('openData.addUsingPanel')}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item) => (
        <OpenDataCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  );
}
