import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewsDayPicker, setStoredDayId } from './NewsDayPicker';
import { getDays, postNews, type Day } from '../../../services/newsApi';
import { showToast } from '../../../utils/toast';

interface NewsUploadPanelProps {
  selectedDayId: string;
  onSelectDayId: (id: string) => void;
  onNewsAdded?: () => void;
  className?: string;
}

export function NewsUploadPanel({
  selectedDayId,
  onSelectDayId,
  onNewsAdded,
  className = '',
}: NewsUploadPanelProps) {
  const { t } = useTranslation();
  const [days, setDays] = useState<Day[]>([]);
  const [daysLoading, setDaysLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

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

      const titleArTrim = titleAr.trim();
      const titleEnTrim = titleEn.trim();
      if (!titleArTrim && !titleEnTrim) {
        showToast.error(t('news.enterOneTitle'));
        return;
      }

      setSubmitting(true);
      try {
        const formData = new FormData();
        if (selectedDayId) formData.append('day', selectedDayId);
        formData.append('title_ar', titleArTrim || '');
        formData.append('title_en', titleEnTrim || '');
        formData.append('body_ar', bodyAr.trim());
        formData.append('body_en', bodyEn.trim());
        if (imageFile) formData.append('image', imageFile);
        formData.append('is_active', 'true');

        await postNews(formData);
        showToast.success(t('news.addNewsSuccess'));
        setTitleAr('');
        setTitleEn('');
        setBodyAr('');
        setBodyEn('');
        setImageFile(null);
        onNewsAdded?.();
      } catch (err) {
        showToast.error(err instanceof Error ? err.message : t('news.failedToAdd'));
      } finally {
        setSubmitting(false);
      }
    },
    [submitting, selectedDayId, titleAr, titleEn, bodyAr, bodyEn, imageFile, onNewsAdded]
  );

  const canSubmit = (titleAr.trim() || titleEn.trim()) && !submitting;

  return (
    <aside
      className={`flex flex-col gap-6 bg-white rounded-2xl border border-gray-200 p-6 ${className}`}
      style={{ minWidth: 'min(100%, 32rem)' }}
    >
      <h2 className="text-lg font-bold text-gray-900">{t('news.addNews')}</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <NewsDayPicker
          days={days}
          selectedDayId={selectedDayId}
          onSelect={handleDaySelect}
          loading={daysLoading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('news.titleAr')}</label>
          <input
            type="text"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-[#0c4261] focus:ring-2 focus:ring-[#0c4261]/20 focus:outline-none"
            placeholder="العنوان بالعربية"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('news.titleEn')}</label>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-[#0c4261] focus:ring-2 focus:ring-[#0c4261]/20 focus:outline-none"
            placeholder="Title in English"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('news.bodyAr')}</label>
          <textarea
            value={bodyAr}
            onChange={(e) => setBodyAr(e.target.value)}
            rows={4}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-[#0c4261] focus:ring-2 focus:ring-[#0c4261]/20 focus:outline-none resize-y"
            placeholder="المحتوى بالعربية"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('news.bodyEn')}</label>
          <textarea
            value={bodyEn}
            onChange={(e) => setBodyEn(e.target.value)}
            rows={4}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-[#0c4261] focus:ring-2 focus:ring-[#0c4261]/20 focus:outline-none resize-y"
            placeholder="Content in English"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('news.imageOptional')}</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-medium file:bg-[#0c4261] file:text-white file:cursor-pointer hover:file:bg-[#083140]"
          />
          {imageFile && (
            <p className="mt-1 text-xs text-gray-500 truncate">{imageFile.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-3 px-4 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #0c4261 0%, #083140 100%)' }}
        >
          {submitting ? t('news.adding') : t('news.addNews')}
        </button>
      </form>
    </aside>
  );
}
