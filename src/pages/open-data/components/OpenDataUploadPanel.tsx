import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { OpenDataDayPicker, setStoredDayId } from './OpenDataDayPicker';
import { getDays, postOpenData, type Day } from '../../../services/openDataApi';
import { showToast } from '../../../utils/toast';

const ACCEPT_ATTR = 'application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv';

interface OpenDataUploadPanelProps {
  selectedDayId: string;
  onSelectDayId: (id: string) => void;
  onOpenDataAdded?: () => void;
  className?: string;
}

export function OpenDataUploadPanel({
  selectedDayId,
  onSelectDayId,
  onOpenDataAdded,
  className = '',
}: OpenDataUploadPanelProps) {
  const { t } = useTranslation();
  const [days, setDays] = useState<Day[]>([]);
  const [daysLoading, setDaysLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [captionAr, setCaptionAr] = useState('');
  const [captionEn, setCaptionEn] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    getDays()
      .then(setDays)
      .catch(() => setDays([]))
      .finally(() => setDaysLoading(false));
  }, []);

  const handleDaySelect = (id: string) => {
    onSelectDayId(id);
    setStoredDayId(id);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (submitting) return;

      const captionArTrim = captionAr.trim();
      const captionEnTrim = captionEn.trim();
      if (!captionArTrim && !captionEnTrim) {
        showToast.error(t('openData.enterOneCaption'));
        return;
      }
      if (!documentFile) {
        showToast.error(t('openData.selectDocument'));
        return;
      }

      setSubmitting(true);
      try {
        const formData = new FormData();
        if (selectedDayId) formData.append('day', selectedDayId);
        formData.append('caption_ar', captionArTrim || '');
        formData.append('caption_en', captionEnTrim || '');
        formData.append('document', documentFile);
        formData.append('is_active', 'true');

        await postOpenData(formData);
        showToast.success('Document added successfully.');
        setCaptionAr('');
        setCaptionEn('');
        setDocumentFile(null);
        onOpenDataAdded?.();
      } catch (err) {
        showToast.error(err instanceof Error ? err.message : 'Failed to add document');
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, selectedDayId, captionAr, captionEn, documentFile, onOpenDataAdded]
  );

  const canSubmit =
    (captionAr.trim() || captionEn.trim()) && documentFile && !submitting;

  return (
    <aside
      className={`flex flex-col gap-6 bg-white rounded-2xl border border-gray-200 p-6 ${className}`}
      style={{ minWidth: 'min(100%, 32rem)' }}
    >
      <h2 className="text-lg font-bold text-gray-900">{t('openData.addOpenData')}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <OpenDataDayPicker
          days={days}
          selectedDayId={selectedDayId}
          onSelect={handleDaySelect}
          loading={daysLoading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('openData.captionAr')}</label>
          <input
            type="text"
            value={captionAr}
            onChange={(e) => setCaptionAr(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-[#0c4261] focus:ring-2 focus:ring-[#0c4261]/20 focus:outline-none"
            placeholder="التسمية بالعربية"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('openData.captionEn')}</label>
          <input
            type="text"
            value={captionEn}
            onChange={(e) => setCaptionEn(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-[#0c4261] focus:ring-2 focus:ring-[#0c4261]/20 focus:outline-none"
            placeholder="Caption in English"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('openData.documentRequired')}</label>
          <p className="text-xs text-gray-500 mb-2">PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV</p>
          <input
            type="file"
            accept={ACCEPT_ATTR}
            onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-[#0c4261] file:text-white file:cursor-pointer hover:file:bg-[#083140]"
          />
          {documentFile && (
            <p className="mt-1 text-xs text-gray-500 truncate">{documentFile.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #0c4261 0%, #083140 100%)' }}
        >
          {submitting ? t('openData.adding') : t('openData.addOpenData')}
        </button>
      </form>
    </aside>
  );
}
