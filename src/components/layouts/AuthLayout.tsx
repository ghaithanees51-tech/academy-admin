import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    // Initialize theme from localStorage on mount
    const saved = localStorage.getItem('adminlite.theme') as 'light' | 'dark' | null;
    const nextTheme = saved === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (!saved) localStorage.setItem('adminlite.theme', nextTheme);

    // Set document language + direction for auth pages
    document.documentElement.setAttribute('lang', i18n.language || 'en');
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }, [i18n.language, isRTL]);

  return (
    <main
      className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50 ${isRTL ? 'text-right' : 'text-left'}`}
      style={{ color: 'var(--text)' }}
    >
      {/* Optional max-width card wrapper for login/register pages */}
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
};

export default AuthLayout;
