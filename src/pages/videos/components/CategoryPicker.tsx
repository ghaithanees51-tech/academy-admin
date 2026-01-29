import { Listbox, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FolderOpen, Check, ChevronDown, Loader2 } from 'lucide-react';
import type { Category } from '../../../services/videosApi';

const STORAGE_KEY = 'videos.selectedCategoryId';
const ALL_CATEGORIES_VALUE = '';

export function getStoredCategoryId(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ALL_CATEGORIES_VALUE;
  } catch {
    return ALL_CATEGORIES_VALUE;
  }
}

export function setStoredCategoryId(categoryId: string): void {
  try {
    if (categoryId && categoryId !== ALL_CATEGORIES_VALUE) {
      localStorage.setItem(STORAGE_KEY, categoryId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

const PRIMARY = '#0c4261';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelect: (categoryId: string) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
  loading = false,
  disabled = false,
  className = '',
}: CategoryPickerProps) {
  const selected = categories.find((c) => String(c.id) === selectedCategoryId);
  const displayValue = selectedCategoryId && selected ? selected.category_name_en : 'All categories';

  const handleChange = (id: string) => {
    onSelect(id);
    setStoredCategoryId(id);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        <FolderOpen className="inline-block w-4 h-4 mr-2 -mt-0.5 opacity-70" style={{ color: PRIMARY }} />
        Category
      </label>
      <Listbox value={selectedCategoryId} onChange={handleChange} disabled={disabled || loading}>
        <div className="relative">
          <Listbox.Button
            className={`
              relative w-full rounded-xl border-2 bg-white py-3 pr-10 text-left
              transition-all duration-200
              disabled:cursor-not-allowed disabled:opacity-60
              focus:outline-none focus:ring-2 focus:ring-offset-0
              hover:border-gray-300
              ${selectedCategoryId ? 'border-gray-300' : 'border-gray-200'}
            `}
            style={{ paddingLeft: '1rem', '--tw-ring-color': PRIMARY } as React.CSSProperties}
          >
            <span className="block truncate text-sm font-medium text-gray-900">{displayValue}</span>
            <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" aria-hidden />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" aria-hidden />
              )}
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Listbox.Options className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <Listbox.Option
                value=""
                className={({ active, selected }) =>
                  `relative cursor-pointer select-none py-3 px-4 text-sm transition-colors ${
                    active ? 'bg-gray-100' : selected ? 'bg-[rgba(12,66,97,0.08)]' : ''
                  }`
                }
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-2">
                    <span className={selected ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}>
                      All categories
                    </span>
                    {selected && <Check className="h-4 w-4 flex-shrink-0" style={{ color: PRIMARY }} aria-hidden />}
                  </div>
                )}
              </Listbox.Option>
              {categories.map((cat) => (
                <Listbox.Option
                  key={cat.id}
                  value={String(cat.id)}
                  className={({ active, selected }) =>
                    `relative cursor-pointer select-none py-3 px-4 text-sm transition-colors ${
                      active ? 'bg-gray-100' : selected ? 'bg-[rgba(12,66,97,0.08)]' : ''
                    }`
                  }
                >
                  {({ selected }) => (
                    <div className="flex items-center justify-between gap-2">
                      <span className={selected ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}>
                        {cat.category_name_en}
                      </span>
                      {selected && <Check className="h-4 w-4 flex-shrink-0" style={{ color: PRIMARY }} aria-hidden />}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
