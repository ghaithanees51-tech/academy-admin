import { useEffect, useState } from 'react';
import { Listbox } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { Loader2, Check, ChevronDown, Calendar, FolderOpen, Pencil } from 'lucide-react';
import Offcanvas from '../../../components/Offcanvas';
import { ThumbnailUpload } from './ThumbnailUpload';
import type { Video, Day, Category } from '../../../services/videosApi';
import { getDays, getCategories, updateVideo, type UpdateVideoPayload } from '../../../services/videosApi';
import { showToast } from '../../../utils/toast';

const PRIMARY = '#0c4261';

interface VideoEditModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function VideoEditModal({ video, isOpen, onClose, onSaved }: VideoEditModalProps) {
  const { t } = useTranslation();
  const [captionAr, setCaptionAr] = useState('');
  const [captionEn, setCaptionEn] = useState('');
  const [dayId, setDayId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [days, setDays] = useState<Day[]>([]);
  const [daysLoading, setDaysLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDaysLoading(true);
    setCategoriesLoading(true);
    getDays().then(setDays).catch(() => setDays([])).finally(() => setDaysLoading(false));
    getCategories().then(setCategories).catch(() => setCategories([])).finally(() => setCategoriesLoading(false));
  }, [isOpen]);

  useEffect(() => {
    if (video) {
      setCaptionAr(video.caption_ar ?? '');
      setCaptionEn(video.caption_en ?? '');
      setDayId(video.day != null ? String(video.day) : '');
      setCategoryId(video.category != null ? String(video.category) : '');
      setThumbnailFile(null);
    }
  }, [video]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video) return;
    if (!categoryId) {
      showToast.error(t('videos.selectCategory'));
      return;
    }
    setSaving(true);
    try {
      const payload: UpdateVideoPayload = {
        caption_ar: captionAr.trim() || '',
        caption_en: captionEn.trim() || '',
        day: dayId ? Number(dayId) : null,
        category: Number(categoryId),
        thumbnail: thumbnailFile ?? undefined,
      };
      await updateVideo(video.id, payload);
      showToast.success(t('videos.updateSuccess'));
      onSaved();
      onClose();
    } catch (err) {
      showToast.error(err instanceof Error ? err.message : t('videos.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (!video) return null;

  const selectedDay = days.find((d) => String(d.id) === dayId);
  const selectedCategory = categories.find((c) => String(c.id) === categoryId);

  const footer = (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0c4261]/20 focus:ring-offset-0"
      >
        {t('common.cancel')}
      </button>
      <button
        type="submit"
        form="video-edit-form"
        disabled={saving || !categoryId}
        className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60 flex items-center justify-center gap-2"
        style={{ backgroundColor: PRIMARY }}
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('common.loading')}
          </>
        ) : (
          t('common.save')
        )}
      </button>
    </div>
  );

  return (
    <Offcanvas
      isOpen={isOpen}
      onClose={onClose}
      title={t('videos.editVideo')}
      headerIcon={<Pencil className="w-5 h-5" style={{ color: PRIMARY }} />}
      footer={footer}
      maxWidth="max-w-md"
    >
      <form id="video-edit-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('videos.captionAr')}
          </label>
          <input
            type="text"
            value={captionAr}
            onChange={(e) => setCaptionAr(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#0c4261] focus:ring-2 focus:ring-[#0c4261]/20 focus:outline-none"
            placeholder={t('videos.captionArPlaceholder')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('videos.captionEn')}
          </label>
          <input
            type="text"
            value={captionEn}
            onChange={(e) => setCaptionEn(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#0c4261] focus:ring-2 focus:ring-[#0c4261]/20 focus:outline-none"
            placeholder={t('videos.captionEnPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline-block w-4 h-4 mr-2 -mt-0.5 opacity-70" style={{ color: PRIMARY }} />
            {t('videos.selectDay')}
          </label>
          <Listbox value={dayId} onChange={setDayId} disabled={daysLoading}>
            <div className="relative">
              <Listbox.Button
                className="relative w-full rounded-xl border-2 border-gray-200 bg-white py-3 pr-10 pl-4 text-left text-sm font-medium text-gray-900 focus:border-[#0c4261] focus:ring-2 focus:ring-[#0c4261]/20 focus:outline-none disabled:opacity-60"
              >
                <span className="block truncate">
                  {selectedDay ? selectedDay.day_name_en : t('videos.noDay')}
                </span>
                <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
                  {daysLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                <Listbox.Option value="">
                  {({ selected }) => (
                    <div
                      className={`flex items-center justify-between py-3 px-4 cursor-pointer ${
                        selected ? 'bg-[rgba(12,66,97,0.08)] font-semibold' : 'font-medium text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {t('videos.noDay')}
                      {selected && <Check className="h-4 w-4" style={{ color: PRIMARY }} />}
                    </div>
                  )}
                </Listbox.Option>
                {days.map((day) => (
                  <Listbox.Option key={day.id} value={String(day.id)}>
                    {({ selected }) => (
                      <div
                        className={`flex items-center justify-between py-3 px-4 cursor-pointer ${
                          selected ? 'bg-[rgba(12,66,97,0.08)] font-semibold' : 'font-medium text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {day.day_name_en}
                        {selected && <Check className="h-4 w-4" style={{ color: PRIMARY }} />}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FolderOpen className="inline-block w-4 h-4 mr-2 -mt-0.5 opacity-70" style={{ color: PRIMARY }} />
            {t('videos.selectCategory')} <span className="text-red-500">*</span>
          </label>
          <Listbox value={categoryId} onChange={setCategoryId} disabled={categoriesLoading}>
            <div className="relative">
              <Listbox.Button
                className="relative w-full rounded-xl border-2 border-gray-200 bg-white py-3 pr-10 pl-4 text-left text-sm font-medium text-gray-900 focus:border-[#0c4261] focus:ring-2 focus:ring-[#0c4261]/20 focus:outline-none disabled:opacity-60"
              >
                <span className="block truncate">
                  {selectedCategory ? selectedCategory.category_name_en : t('videos.selectCategory')}
                </span>
                <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
                  {categoriesLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute z-10 mt-2 max-h-48 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                {categories.map((cat) => (
                  <Listbox.Option key={cat.id} value={String(cat.id)}>
                    {({ selected }) => (
                      <div
                        className={`flex items-center justify-between py-3 px-4 cursor-pointer ${
                          selected ? 'bg-[rgba(12,66,97,0.08)] font-semibold' : 'font-medium text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {cat.category_name_en}
                        {selected && <Check className="h-4 w-4" style={{ color: PRIMARY }} />}
                      </div>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        <ThumbnailUpload
          value={thumbnailFile}
          onChange={setThumbnailFile}
          disabled={saving}
        />
      </form>
    </Offcanvas>
  );
}
