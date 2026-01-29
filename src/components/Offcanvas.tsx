import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';

interface OffcanvasProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  subtitle?: string;
  headerIcon?: ReactNode;
  footer?: ReactNode;
  placement?: 'left' | 'right';
}

export default function Offcanvas({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  subtitle,
  headerIcon,
  footer,
  placement,
}: OffcanvasProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const side = placement ?? (isRTL ? 'left' : 'right');
  
  // Hooks must be called before any early returns
  useEffect(() => {
    if (!isOpen) return;
    
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300 backdrop-blur-sm bg-black/50"
        onClick={onClose}
      />
      
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offcanvas-title"
        className={`fixed inset-y-0 w-full ${maxWidth} z-50 transform transition-transform duration-300 ease-in-out ${
          side === 'left' ? 'left-0' : 'right-0'
        }`}
        style={{ color: 'var(--text)' }}
      >
        <div
          className={`h-full bg-white shadow-2xl ${side === 'left' ? 'rounded-r-2xl' : 'rounded-l-2xl'} flex flex-col`}
        >
          <div className="sticky top-0 z-10">
            <div className="bg-white/90 backdrop-blur supports-backdrop-filter:bg-white/70 border-b border-gray-200 px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex items-start gap-3">
                  {headerIcon ? (
                    <div className="mt-0.5 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                      {headerIcon}
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <h2 id="offcanvas-title" className="text-lg font-semibold text-gray-900 truncate">
                      {title}
                    </h2>
                    {subtitle ? (
                      <p className="text-sm text-gray-500 truncate">{subtitle}</p>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {children}
          </div>

          {footer ? (
            <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t border-gray-200 px-6 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}


