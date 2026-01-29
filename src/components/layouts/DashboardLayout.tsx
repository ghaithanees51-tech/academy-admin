import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Search,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLogoutMutation } from '../../services/authApi';
import { useAppDispatch } from '../../store/hooks';
import { logout as logoutAction } from '../../store/authSlice';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();
  
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const isPhotos = location.pathname === '/photos';
  const isVideos = location.pathname === '/videos';
  const isNews = location.pathname === '/news';
  const isOpenData = location.pathname === '/open-data';
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await logout({ refresh: refreshToken }).unwrap();
      }
    } catch (error) {
      // Silent fail - user will be logged out anyway
    } finally {
      dispatch(logoutAction());
      navigate('/login');
    }
  };

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b shadow-sm" style={{ borderColor: 'rgba(12, 66, 97, 0.1)' }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #0c4261 0%, #083140 100%)' }}>
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                  </svg>
                </div>
                <span className="text-xl font-bold" style={{ color: '#0c4261' }}>
                  Admin Panel
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center gap-1">
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={location.pathname === '/dashboard' ? { color: '#0c4261', backgroundColor: 'rgba(12, 66, 97, 0.08)' } : { color: '#6b7280' }}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/photos" 
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={isPhotos ? { color: '#0c4261', backgroundColor: 'rgba(12, 66, 97, 0.08)' } : { color: '#6b7280' }}
                >
                  Photos
                </Link>
                <Link 
                  to="/videos" 
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={isVideos ? { color: '#0c4261', backgroundColor: 'rgba(12, 66, 97, 0.08)' } : { color: '#6b7280' }}
                >
                  Videos
                </Link>
                <Link 
                  to="/news" 
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={isNews ? { color: '#0c4261', backgroundColor: 'rgba(12, 66, 97, 0.08)' } : { color: '#6b7280' }}
                >
                  News
                </Link>
                <Link 
                  to="/open-data" 
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={isOpenData ? { color: '#0c4261', backgroundColor: 'rgba(12, 66, 97, 0.08)' } : { color: '#6b7280' }}
                >
                  Open Data
                </Link>
                <Link 
                  to="/profile" 
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Profile
                </Link>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': '#0c4261' } as React.CSSProperties}
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={handleLanguageToggle}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {i18n.language === 'en' ? 'AR' : 'EN'}
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ backgroundColor: '#0c4261' }}></span>
              </button>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ backgroundColor: '#0c4261' }}>
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/profile/change-password"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="lg:hidden border-t py-4 space-y-2">
              <Link
                to="/dashboard"
                className="block px-4 py-2 rounded-lg text-sm font-medium"
                style={{ color: '#0c4261', backgroundColor: 'rgba(12, 66, 97, 0.08)' }}
                onClick={() => setShowMobileMenu(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/photos"
                className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600"
                onClick={() => setShowMobileMenu(false)}
              >
                Photos
              </Link>
              <Link
                to="/videos"
                className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600"
                onClick={() => setShowMobileMenu(false)}
              >
                Videos
              </Link>
              <Link
                to="/news"
                className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600"
                onClick={() => setShowMobileMenu(false)}
              >
                News
              </Link>
              <Link
                to="/open-data"
                className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600"
                onClick={() => setShowMobileMenu(false)}
              >
                Open Data
              </Link>
              <Link
                to="/profile"
                className="block px-4 py-2 rounded-lg text-sm font-medium text-gray-600"
                onClick={() => setShowMobileMenu(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleLanguageToggle}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 w-full"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {i18n.language === 'en' ? 'العربية' : 'English'}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
