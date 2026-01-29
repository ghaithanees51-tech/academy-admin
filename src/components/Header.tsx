import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu,
  PanelLeftClose,
  Search,
  Moon,
  Sun,
  Bell,
  User,
  Settings as SettingsIcon,
  LogOut,
  PanelRightClose,
  PanelLeftOpen,
  PanelRightOpen,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLogoutMutation } from '../services/authApi';
import { useAppDispatch } from '../store/hooks';
import { logout as logoutAction } from '../store/authSlice';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCollapseTooltip, setShowCollapseTooltip] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const collapseButtonRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [logout] = useLogoutMutation();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === 'ar';

  // Menu structure (same as Sidebar)
  interface MenuItem {
    id: string;
    label: string;
    to?: string;
    parentLabel?: string;
  }

  // Get all menu items flattened
  const allMenuItems = useMemo<MenuItem[]>(() => {
    const isAdmin = user?.role === 'admin';
    const items: MenuItem[] = [];

    // Store section
    items.push({
      id: 'dashboard',
      label: 'Dashboard',
      to: isAdmin ? '/admin-dashboard' : '/dashboard',
    });

    if (isAdmin) {
      items.push(
        { id: 'store-list', label: 'Store List', to: '/stores/list', parentLabel: 'Store' },
        { id: 'store-create', label: 'Create New Store', to: '/stores/create', parentLabel: 'Store' }
      );
    }

    // Catalog section
    if (!isAdmin) {
      items.push({ id: 'catalog-store-products', label: 'Store Products', to: '/catalog/store-products', parentLabel: 'Products' });
    }
    items.push(
      { id: 'catalog-products-list', label: 'Products', to: '/catalog/products', parentLabel: 'Products' },
      { id: 'catalog-attributes', label: 'Attributes', to: '/catalog/attributes', parentLabel: 'Products' },
      { id: 'catalog-categories', label: 'Categories', to: '/catalog/categories', parentLabel: 'Products' },
      { id: 'catalog-brands', label: 'Brands', to: '/catalog/brands', parentLabel: 'Products' },
      { id: 'catalog-media-library', label: 'Media Library', to: '/catalog/media', parentLabel: 'Products' }
    );

    // Sales section
    items.push({ id: 'orders', label: 'Orders', to: '/orders' });
    items.push(
      { id: 'customers-list', label: 'Customer List', to: '/customers', parentLabel: 'Customers' },
      { id: 'customers-unverified', label: 'Not Verified Customers', to: '/customers/unverified', parentLabel: 'Customers' }
    );

    // Growth & Channels section
    items.push(
      { id: 'marketing-coupons', label: 'Coupons', to: '/marketing/coupons', parentLabel: 'Marketing' },
      { id: 'marketing-discounts', label: 'Discount Rules', to: '/marketing/discounts', parentLabel: 'Marketing' },
      { id: 'marketing-campaigns', label: 'Campaigns', to: '/marketing/campaigns', parentLabel: 'Marketing' },
      { id: 'marketing-communications', label: 'Email & SMS', to: '/marketing/communications', parentLabel: 'Marketing' },
      { id: 'channel-whatsapp', label: 'WhatsApp Configuration', to: '/channels/whatsapp', parentLabel: 'WhatsApp' },
      { id: 'channel-instagram', label: 'Instagram', to: '/channels/instagram', parentLabel: 'Sales Channels' },
      { id: 'channel-facebook', label: 'Facebook', to: '/channels/facebook', parentLabel: 'Sales Channels' },
      { id: 'channel-google', label: 'Google Products', to: '/channels/google-products', parentLabel: 'Sales Channels' },
      { id: 'channel-storefront', label: 'Online Storefront', to: '/channels/storefront', parentLabel: 'Sales Channels' }
    );

    // Insights & Settings section
    items.push(
      { id: 'analytics-customers', label: 'Customer Analytics', to: '/analytics/customers', parentLabel: 'Analytics' },
      { id: 'analytics-products', label: 'Product Analytics', to: '/analytics/products', parentLabel: 'Analytics' },
      { id: 'analytics-categories', label: 'Category Analytics', to: '/analytics/categories', parentLabel: 'Analytics' },
      { id: 'analytics-brands', label: 'Brand Analytics', to: '/analytics/brands', parentLabel: 'Analytics' }
    );

    if (isAdmin) {
      items.push(
        { id: 'settings-email-templates', label: 'Email Templates', to: '/settings/email-templates', parentLabel: 'Settings' }
      );
    } else {
      items.push(
        { id: 'settings-store-profile', label: 'Store Profile', to: '/settings/store-profile', parentLabel: 'Settings' },
        { id: 'settings-payments', label: 'Payments', to: '/settings/payments', parentLabel: 'Settings' },
        { id: 'settings-shipping', label: 'Shipping', to: '/settings/shipping', parentLabel: 'Settings' },
        { id: 'settings-taxes', label: 'Taxes', to: '/settings/taxes', parentLabel: 'Settings' },
        { id: 'settings-printing', label: 'Printing', to: '/settings/printing', parentLabel: 'Settings' }
      );
    }
    items.push({ id: 'settings-staff', label: 'Staff & Roles', to: '/settings/staff', parentLabel: 'Settings' });

    return items;
  }, [user?.role]);

  // Filter menu items based on search query
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return allMenuItems.filter(item => {
      const labelMatch = item.label.toLowerCase().includes(query);
      const parentMatch = item.parentLabel?.toLowerCase().includes(query);
      return labelMatch || parentMatch;
    }).slice(0, 10); // Limit to 10 results
  }, [searchQuery, allMenuItems]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchDropdown(value.length > 0);
    setSelectedIndex(-1);
  };

  // Handle menu item selection
  const handleMenuItemSelect = (item: MenuItem) => {
    if (item.to) {
      navigate(item.to);
      setSearchQuery('');
      setShowSearchDropdown(false);
      setSelectedIndex(-1);
      // Close mobile sidebar if open
      const layout = document.getElementById('layout');
      if (layout) {
        layout.classList.remove('sidebar-mobile-open');
      }
    }
  };

  // Handle keyboard navigation
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchDropdown || filteredMenuItems.length === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        // Navigate to first result if available
        if (filteredMenuItems.length > 0) {
          handleMenuItemSelect(filteredMenuItems[0]);
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredMenuItems.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredMenuItems.length) {
          handleMenuItemSelect(filteredMenuItems[selectedIndex]);
        } else if (filteredMenuItems.length > 0) {
          handleMenuItemSelect(filteredMenuItems[0]);
        }
        break;
      case 'Escape':
        setSearchQuery('');
        setShowSearchDropdown(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('adminlite.theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const clickedInsideNotifButton = notifRef.current && notifRef.current.contains(target);
      const clickedInsideNotifDropdown = notifDropdownRef.current && notifDropdownRef.current.contains(target);
      if (!clickedInsideNotifButton && !clickedInsideNotifDropdown) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setShowProfileDropdown(false);
      }
      if (collapseButtonRef.current && !collapseButtonRef.current.contains(target)) {
        setShowCollapseTooltip(false);
      }
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(target) && 
          searchInputRef.current && !searchInputRef.current.contains(target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside as EventListener);
    document.addEventListener('touchstart', handleClickOutside as EventListener);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener);
      document.removeEventListener('touchstart', handleClickOutside as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => setIsScrolled(window.scrollY > 4);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifDropdown(false);
        setShowProfileDropdown(false);
        setShowMobileSearch(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileSearch(false);
      }
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    handleScroll();
    handleResize();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const layout = document.getElementById('layout');
    if (!layout) return;

    // Check localStorage for saved collapsed state
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsedState === 'true') {
      layout.classList.add('sidebar-collapsed');
      setIsSidebarCollapsed(true);
    }

    const syncSidebarState = () => {
      const open = layout.classList.contains('sidebar-mobile-open');
      const collapsed = layout.classList.contains('sidebar-collapsed');
      setIsSidebarOpen(open);
      setIsSidebarCollapsed(collapsed);
      document.body.classList.toggle('sidebar-locked', open);
    };

    syncSidebarState();

    const observer = new MutationObserver(() => {
      syncSidebarState();
    });

    observer.observe(layout, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
      document.body.classList.remove('sidebar-locked');
    };
  }, []);

  useEffect(() => {
    if (!showMobileSearch) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMobileSearch(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    mobileSearchInputRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showMobileSearch]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('adminlite.theme', newTheme);
  };

  const toggleSidebar = () => {
    const layout = document.getElementById('layout');
    if (!layout) return;
    
    const isCurrentlyCollapsed = layout.classList.contains('sidebar-collapsed');
    
    if (isCurrentlyCollapsed) {
      layout.classList.remove('sidebar-collapsed');
      localStorage.setItem('sidebar-collapsed', 'false');
      setIsSidebarCollapsed(false);
    } else {
      layout.classList.add('sidebar-collapsed');
      localStorage.setItem('sidebar-collapsed', 'true');
      setIsSidebarCollapsed(true);
    }
    
    setIsSidebarOpen(false);
  };

  const toggleMobileSidebar = () => {
    const layout = document.getElementById('layout');
    if (!layout) return;
    layout.classList.toggle('sidebar-mobile-open');
    setIsSidebarOpen(layout.classList.contains('sidebar-mobile-open'));
  };
  
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await logout({ refresh: refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logoutAction());
      navigate('/login');
    }
  };
  
  const getDisplayName = () => {
    const firstLast = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
    return firstLast || user?.name || user?.email?.split('@')[0] || 'User';
  };

  const getUserInitial = () => {
    const displayName = getDisplayName();
    if (displayName && displayName !== 'User') {
      return displayName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => getDisplayName();

  return (
    <header
      className={`topbar px-3 py-2.5 sm:px-4 sm:py-3 lg:px-6 transition-all bg-white shadow-sm duration-200 ${isScrolled ? 'shadow-lg' : ''}`}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              setShowMobileSearch(false);
              toggleMobileSidebar();
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
            aria-label="Toggle menu"
            aria-controls="admin-sidebar"
            aria-expanded={isSidebarOpen}
          >
            <Menu size={19} />
          </button>

          <div className="relative hidden lg:block" ref={collapseButtonRef}>
            <button
              onClick={toggleSidebar}
              onMouseEnter={() => setShowCollapseTooltip(true)}
              onMouseLeave={() => setShowCollapseTooltip(false)}
              onTouchStart={() => setShowCollapseTooltip(true)}
              className="flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                isRTL ? <PanelRightOpen size={19} /> : <PanelLeftOpen size={19} />
              ) : (
                isRTL ? <PanelRightClose size={19} /> : <PanelLeftClose size={19} />
              )}
            </button>
            
            {showCollapseTooltip && (
              <div
                className="absolute left-3/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 shadow-lg"
              >
                {isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                <div
                  className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderBottom: '5px solid var(--border)',
                  }}
                />
                <div
                  className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%-1px)]"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderBottom: '5px solid var(--bg-card)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-3">
          <form className="hidden flex-1 items-center md:flex md:max-w-md lg:max-w-lg" role="search" onSubmit={(e) => e.preventDefault()}>
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                <Search size={15} className="text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (searchQuery.length > 0) {
                    setShowSearchDropdown(true);
                  }
                }}
                className="w-full rounded-lg border border-slate-200 bg-white ps-9 pe-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                placeholder={t('header.searchPlaceholder', { defaultValue: 'Quick Search…' })}
                aria-label="Search"
                aria-autocomplete="list"
                aria-expanded={showSearchDropdown}
                aria-controls="search-results"
              />
              
              {/* Autocomplete Dropdown */}
              {showSearchDropdown && filteredMenuItems.length > 0 && (
                <div
                  ref={searchDropdownRef}
                  id="search-results"
                  className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-[400px] overflow-y-auto"
                  role="listbox"
                >
                  {filteredMenuItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleMenuItemSelect(item)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        index === selectedIndex
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      role="option"
                      aria-selected={index === selectedIndex}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.label}</div>
                        {item.parentLabel && (
                          <div className="text-xs text-gray-500 truncate">{item.parentLabel}</div>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-gray-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
              
              {showSearchDropdown && searchQuery.length > 0 && filteredMenuItems.length === 0 && (
                <div
                  ref={searchDropdownRef}
                  className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg px-4 py-8 text-center text-sm text-gray-500"
                >
                  No results found
                </div>
              )}
            </div>
          </form>

          <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowMobileSearch((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
              aria-label="Open search"
              aria-expanded={showMobileSearch}
            >
              <Search size={18} />
            </button>

            <button
              onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifDropdown((prev) => !prev);
                  setShowProfileDropdown(false);
                }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label={t('header.openNotifications')}
                aria-expanded={showNotifDropdown}
              >
                <Bell size={18} />
              </button>

              {showNotifDropdown && (
                <div
                  ref={notifDropdownRef}
                className="absolute end-0 z-50 mt-2 w-[min(90vw,22rem)] rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl overflow-hidden"
                  role="menu"
                  aria-label={t('header.notifications')}
                >
                  <div
                    className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm font-semibold sm:px-5 sm:py-4"
                  >
                    <span>{t('header.notifications')}</span>
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-600">
                      2
                    </span>
                  </div>
                  <div className="space-y-3 px-4 py-4 text-sm sm:px-5 sm:py-5 max-h-[60vh] overflow-auto">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          New order
                        </p>
                        <p className="text-xs">
                          INV-00421 · 2m ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          Backup complete
                        </p>
                        <p className="text-xs">
                          10:24 AM
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    className="w-full rounded-b-2xl border-t border-slate-200 px-4 py-2.5 text-sm font-medium text-center transition hover:bg-gray-100 sm:px-5 sm:py-3"
                    type="button"
                  >
                    {t('header.viewAll')}
                  </button>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileDropdown((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-1.5 py-1.5 text-sm transition-colors hover:bg-gray-100 hover:text-gray-900 sm:gap-2 sm:px-2"
                aria-label={t('header.openProfile')}
                aria-expanded={showProfileDropdown}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white sm:h-9 sm:w-9 sm:text-sm">
                  {getUserInitial()}
                </div>
                <span className="hidden text-sm font-medium sm:inline">{getUserDisplayName()}</span>
              </button>

              {showProfileDropdown && (
                <div
                  className="dropdown-menu absolute end-0 z-50 mt-2 w-52 bg-white border-slate-200 rounded-xl border py-1.5 shadow-xl overflow-hidden"                 
                  role="menu"
                >
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowProfileDropdown(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition hover:bg-gray-100"
                    type="button"
                  >
                    <User size={16} className="shrink-0" />
                    <span>{t('header.profile')}</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowProfileDropdown(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition hover:bg-gray-100"                   
                    type="button"
                  >
                    <SettingsIcon size={16} className="shrink-0" />
                    <span>{t('header.settings')}</span>
                  </button>
                  <hr className="my-1.5 border-slate-200"/>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    type="button"
                  >
                    <LogOut size={16} className="shrink-0" />
                    <span>{t('header.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMobileSearch && (
        <div className="mt-2 md:hidden">
          <form role="search" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
                <Search size={15} className="text-gray-400" />
              </div>
              <input
                ref={mobileSearchInputRef}
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (searchQuery.length > 0) {
                    setShowSearchDropdown(true);
                  }
                }}
                className="w-full rounded-lg border border-slate-200 bg-white ps-9 pe-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-indigo-500"
                placeholder={t('header.searchPlaceholder', { defaultValue: 'Search for anything…' })}
                aria-label="Search"
                aria-autocomplete="list"
                aria-expanded={showSearchDropdown}
                aria-controls="mobile-search-results"
              />
              
              {/* Mobile Autocomplete Dropdown */}
              {showSearchDropdown && filteredMenuItems.length > 0 && (
                <div
                  ref={searchDropdownRef}
                  id="mobile-search-results"
                  className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-[400px] overflow-y-auto"
                  role="listbox"
                >
                  {filteredMenuItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleMenuItemSelect(item)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        index === selectedIndex
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      role="option"
                      aria-selected={index === selectedIndex}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{item.label}</div>
                        {item.parentLabel && (
                          <div className="text-xs text-gray-500 truncate">{item.parentLabel}</div>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-gray-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
              
              {showSearchDropdown && searchQuery.length > 0 && filteredMenuItems.length === 0 && (
                <div
                  ref={searchDropdownRef}
                  className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg px-4 py-8 text-center text-sm text-gray-500"
                >
                  No results found
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </header>
  );
};

export default Header;
