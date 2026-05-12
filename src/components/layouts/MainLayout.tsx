import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../Header';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    // Initialize theme from localStorage on mount
    const saved = localStorage.getItem('adminlite.theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('adminlite.theme', 'light');
    }

    // Set document direction based on language
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    // Initialize sidebar state based on screen size and localStorage
    const layout = document.getElementById('layout');
    if (!layout) return;

    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    
    // Check if user has manually set a preference
    if (savedCollapsedState !== null) {
      // User has a saved preference, use it
      if (savedCollapsedState === 'true') {
        layout.classList.add('sidebar-collapsed');
      }
    } else {
      // No saved preference, set based on screen size
      const isSmallScreen = window.innerWidth < 1440; // < 1440px = collapsed by default
      
      if (isSmallScreen) {
        layout.classList.add('sidebar-collapsed');
        localStorage.setItem('sidebar-collapsed', 'true');
      } else {
        localStorage.setItem('sidebar-collapsed', 'false');
      }
    }
  }, [isRTL]);

  return (
    <div
      className="layout relative flex min-h-screen flex-col "
      id="layout"
    >
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="flex min-h-screen flex-1 flex-col">
        <Header />
        <main
          id="main-content"
          className="content flex-1 bg-slate-50 transition-all duration-200"
        >
          <div className="content-shell mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 sm:gap-5 lg:gap-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
