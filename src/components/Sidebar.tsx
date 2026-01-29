import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ComponentType } from 'react';
import {
  Gauge,
  ChevronDown,
  Store,
  X,
} from 'lucide-react';
interface NavItem {
  id: string;
  label: string;
  to?: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
  children?: NavItem[];
  defaultExpanded?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const appName = t('sidebar.adminPanel');

  // Admin-only navigation sections (translated)
  const navSections = useMemo((): NavSection[] => [
    {
      title: t('sidebar.admin'),
      items: [
        { 
          id: 'dashboard', 
          label: t('sidebar.dashboard'), 
          to: '/dashboard', 
          icon: Gauge, 
          exact: true 
        },
        {
          id: 'store-management',
          label: t('sidebar.storeManagement'),
          icon: Store,
          children: [
            { id: 'store-list', label: t('sidebar.storeList'), to: '/stores/list' },
            { id: 'store-create', label: t('sidebar.createStore'), to: '/stores/create' },
            { id: 'user-list', label: t('sidebar.userList'), to: '/users' },
          ],
        },
      ],
    }
  ], [t]);

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoverItem, setHoverItem] = useState<string | null>(null);
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  const [flyoutPosition, setFlyoutPosition] = useState<{ top: number } | null>(null);
  const layoutRef = useRef<HTMLElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get display name - admin app
  const displayName = useMemo(() => {
    return appName || t('sidebar.adminPanel');
  }, [appName, t]);

  // All nav sections are for admin only - no filtering needed
  const filteredNavSections = useMemo(() => navSections, [navSections]);
  const primaryFocusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900 focus-visible:ring-white/90';
  const secondaryFocusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-800 focus-visible:ring-white/80';
  const tertiaryFocusRing =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-900 focus-visible:ring-white/70';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const layout = document.getElementById('layout');
    layoutRef.current = layout;
    if (!layout) return;

    const syncCollapsedState = () => {
      setIsCollapsed(layout.classList.contains('sidebar-collapsed'));
      if (layout.classList.contains('sidebar-mobile-open')) {
        sidebarRef.current?.focus();
      }
    };

    syncCollapsedState();

    const observer = new MutationObserver(syncCollapsedState);
    observer.observe(layout, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isCollapsed) {
      setHoverItem(null);
      setClickedItem(null);
      // Clear any pending timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    }
  }, [isCollapsed]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Close flyout when clicking outside
  useEffect(() => {
    if (!clickedItem) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const flyout = document.querySelector('.sidebar-flyout');
      const sidebarElement = document.getElementById('admin-sidebar');
      
      // Don't close if clicking inside flyout (including links) or sidebar
      if (flyout && flyout.contains(target)) {
        return;
      }
      
      if (sidebarElement && !sidebarElement.contains(target)) {
        setClickedItem(null);
        setHoverItem(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clickedItem]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const layout = layoutRef.current ?? document.getElementById('layout');
    layoutRef.current = layout;
    if (!layout) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        layout.classList.remove('sidebar-mobile-open');
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        layout.classList.remove('sidebar-mobile-open');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isActiveLink = (path?: string, exact = false) => {
    if (!path) return false;
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const closeMobileSidebar = useCallback(() => {
    if (typeof window === 'undefined') return;
    const layout = document.getElementById('layout');
    if (layout) {
      layout.classList.remove('sidebar-mobile-open');
      // Also remove body lock
      document.body.classList.remove('sidebar-locked');
    }
  }, []);

  useEffect(() => {
    setExpandedItems((prev) => {
      const next = { ...prev };
      filteredNavSections.forEach((section) => {
        section.items.forEach((item) => {
          if (item.children) {
            const childActive = item.children.some((child) => isActiveLink(child.to, child.exact));
            if (childActive) {
              next[item.id] = true;
            }
          }
        });
      });
      return next;
    });
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar, filteredNavSections]);

  return (
    <aside
      id="admin-sidebar"
      ref={(node) => {
        sidebarRef.current = node;
      }}
      className="sidebar flex h-full flex-col bg-linear-to-b from-indigo-600 via-indigo-700 to-indigo-900 text-white shadow-2xl"
      role="complementary"
      aria-label="Admin sidebar"
      tabIndex={-1}
    >
      <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-4 lg:px-5 lg:pb-4 lg:pt-5">
        <Link
          to="/admin-dashboard"
          className={`flex items-center gap-2.5 rounded-xl bg-white/10 px-2.5 py-2 text-white transition-all hover:bg-white/15 ${
            isCollapsed ? 'justify-center w-full' : 'flex-1'
          } ${primaryFocusRing}`}
          onClick={closeMobileSidebar}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-base font-bold text-indigo-700 shadow-sm">
            A
          </div>
          {!isCollapsed && (
            <div className="hidden text-start lg:block">
              <p className="text-sm font-semibold leading-tight text-white/95">
                {displayName}
              </p>
              <p className="text-xs leading-tight text-white/70">
                Admin Panel
              </p>
            </div>
          )}
        </Link>

        <button
          type="button"
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 lg:hidden ${secondaryFocusRing}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Close mobile sidebar
            const layout = document.getElementById('layout');
            if (layout) {
              layout.classList.remove('sidebar-mobile-open');
              document.body.classList.remove('sidebar-locked');
            }
          }}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <div className="sidebar-inner flex flex-1 flex-col gap-5 px-3 pb-5 lg:gap-6 lg:px-5 lg:pb-6">
        <nav className="flex-1 overflow-y-auto pb-2 scrollbar-thin" aria-label="Main navigation">
          <div className={isCollapsed ? 'flex flex-col gap-2' : 'flex flex-col gap-5 lg:gap-6'}>
            {filteredNavSections.map((section) => (
              <section key={section.title} className={isCollapsed ? 'space-y-2' : 'space-y-2'}>
                {!isCollapsed && (
                  <p className="sidebar-section-label px-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/50 lg:text-[11px]">
                    {section.title}
                  </p>
                )}
                <ul className={isCollapsed ? 'space-y-2' : 'space-y-1'}>
                  {section.items.map((item) => {
                    const hasChildren = !!item.children?.length;
                    const Icon = item.icon;
                    const isExpanded = expandedItems[item.id] ?? item.defaultExpanded ?? false;
                    const childActive = item.children?.some((child) => isActiveLink(child.to, child.exact));
                    const active = isActiveLink(item.to, item.exact) || childActive;
                    const sharedClasses = active
                      ? 'bg-white/15 text-white shadow-md shadow-indigo-500/20 font-medium'
                      : 'text-white/85 hover:bg-white/10 hover:text-white';
                    const layoutClasses = isCollapsed ? 'justify-center px-0 py-0 h-11' : 'justify-between px-2.5 py-2 lg:px-3 lg:py-2.5';
                    const labelWrapperClasses = isCollapsed
                      ? 'flex h-full w-full items-center justify-center gap-0'
                      : 'flex items-center gap-2.5 lg:gap-3';

                    return (
                      <li
                        key={item.id}
                        className="relative"
                        onMouseEnter={(e) => {
                          if (isCollapsed && !clickedItem) {
                            // Clear any pending timeout
                            if (hoverTimeoutRef.current) {
                              clearTimeout(hoverTimeoutRef.current);
                              hoverTimeoutRef.current = null;
                            }
                            setHoverItem(item.id);
                            const rect = e.currentTarget.getBoundingClientRect();
                            setFlyoutPosition({ top: rect.top });
                          }
                        }}
                        onMouseLeave={() => {
                          if (isCollapsed && !clickedItem) {
                            // Delay clearing hover to allow mouse to move to flyout
                            hoverTimeoutRef.current = setTimeout(() => {
                              setHoverItem(null);
                            }, 150);
                          }
                        }}
                      >
                        {hasChildren ? (
                          <>
                            <button
                              type="button"
                              className={`sidebar-link group flex w-full items-center rounded-xl text-sm transition-all ${layoutClasses} ${sharedClasses} ${secondaryFocusRing}`}
                              onClick={(e) => {
                                if (isCollapsed) {
                                  // Toggle flyout on click when collapsed
                                  if (clickedItem === item.id) {
                                    setClickedItem(null);
                                    setHoverItem(null);
                                  } else {
                                    setClickedItem(item.id);
                                    setHoverItem(item.id);
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setFlyoutPosition({ top: rect.top });
                                  }
                                } else {
                                  setExpandedItems((prev) => {
                                    const isCurrentlyExpanded = prev[item.id] ?? item.defaultExpanded ?? false;
                                    // Close all other items and toggle current item
                                    const newState: Record<string, boolean> = {};
                                    Object.keys(prev).forEach(key => {
                                      newState[key] = false;
                                    });
                                    newState[item.id] = !isCurrentlyExpanded;
                                    return newState;
                                  });
                                }
                              }}
                              aria-expanded={isExpanded}
                              aria-controls={`${item.id}-submenu`}
                              data-tooltip={isCollapsed ? item.label : undefined}
                            >
                              <span className={labelWrapperClasses}>
                                {Icon && <Icon size={18} className="shrink-0 text-white/75" />}
                                {!isCollapsed && <span className="sidebar-text text-sm">{item.label}</span>}
                              </span>
                              {!isCollapsed && (
                                <ChevronDown
                                  size={15}
                                  className={`sidebar-chevron shrink-0 text-white/60 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              )}
                            </button>

                            <div
                              id={`${item.id}-submenu`}
                              className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out ${
                                isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                              }`}
                              aria-hidden={!isExpanded}
                            >
                              <ul className="sidebar-submenu mt-1.5 space-y-0.5" role="list">
                                {item.children?.map((child) => {
                                  const ChildIcon = child.icon;
                                  const childIsActive = isActiveLink(child.to, child.exact);
                                  const childSharedClasses = childIsActive
                                    ? 'bg-white/15 text-white font-medium'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white';
                                  const childLayoutClasses = isCollapsed
                                    ? 'justify-center gap-0 px-0 py-0 h-9'
                                    : 'justify-start gap-2.5 px-2.5 py-1.5 lg:px-3 lg:py-2';

                                  return (
                                    <li key={child.id}>
                                      {child.to ? (
                                        <Link
                                          to={child.to}
                                          className={`sidebar-link flex items-center rounded-lg text-sm transition-all ${childLayoutClasses} ${childSharedClasses} ${tertiaryFocusRing}`}
                                          data-tooltip={isCollapsed ? child.label : undefined}
                                          onClick={() => {
                                            closeMobileSidebar();
                                            // Keep current parent menu open, close all others
                                            setExpandedItems({ [item.id]: true });
                                          }}
                                        >
                                          {ChildIcon && <ChildIcon size={16} className="shrink-0 text-white/65" />}
                                          {!isCollapsed && <span className="text-[13px]">{child.label}</span>}
                                        </Link>
                                      ) : (
                                        <span className={`flex items-center rounded-lg text-sm text-white/70 ${childLayoutClasses}`}>
                                          {ChildIcon && <ChildIcon size={16} className="shrink-0 text-white/65" />}
                                          {!isCollapsed && <span className="text-[13px]">{child.label}</span>}
                                        </span>
                                      )}
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>

                            {isCollapsed && (hoverItem === item.id || clickedItem === item.id) && flyoutPosition && (
                              <div
                                className="sidebar-flyout fixed z-100 flex min-w-[220px] bg-white flex-col gap-2 rounded-xl border px-4 py-4 shadow-2xl text-black"
                                style={{ 
                                  borderColor: '#ccc',
                                  left: 'calc(var(--sidebar-collapsed-w) + 0.75rem)',
                                  top: `${flyoutPosition.top}px`,
                                  transform: 'translateY(0)',
                                  transition: 'opacity 0.15s ease, transform 0.15s ease'
                                }}
                                onMouseEnter={() => {
                                  if (!clickedItem) {
                                    // Clear any pending timeout when entering flyout
                                    if (hoverTimeoutRef.current) {
                                      clearTimeout(hoverTimeoutRef.current);
                                      hoverTimeoutRef.current = null;
                                    }
                                    setHoverItem(item.id);
                                  }
                                }}
                                onMouseLeave={() => {
                                  if (!clickedItem) {
                                    // Immediately clear hover when leaving flyout
                                    setHoverItem(null);
                                  }
                                }}
                              >
                                {/* Arrow indicator - single layer without border */}
                                <div
                                  className="absolute -left-[6px] top-4"
                                  style={{
                                    width: 0,
                                    height: 0,
                                    borderTop: '6px solid transparent',
                                    borderBottom: '6px solid transparent',
                                    borderRight: `6px solid var(--bg-card)`,
                                  }}
                                />
                                <p className="text-sm font-semibold">{item.label}</p>
                                <ul className="space-y-1">
                                  {item.children?.map((child) => {
                                    const childIsActive = isActiveLink(child.to, child.exact);

                                    return (
                                      <li key={child.id}>
                                        {child.to ? (
                                          <Link
                                            to={child.to}
                                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${tertiaryFocusRing} ${
                                              childIsActive
                                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                            onClick={() => {
                                              closeMobileSidebar();
                                              setHoverItem(null);
                                              setClickedItem(null);
                                              // Keep current parent menu open, close all others
                                              setExpandedItems({ [item.id]: true });
                                            }}
                                          >
                                            <span>{child.label}</span>
                                          </Link>
                                        ) : (
                                          <span
                                            className="block rounded-lg px-3 py-2 text-sm"
                                            style={{ color: 'var(--text-muted)' }}
                                          >
                                            {child.label}
                                          </span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : item.to ? (
                          <>
                            <Link
                              to={item.to}
                              className={`sidebar-link sidebar-link-with-text flex items-center rounded-xl text-sm transition-all ${layoutClasses} ${sharedClasses} ${secondaryFocusRing}`}
                              data-tooltip={isCollapsed ? item.label : undefined}
                              onClick={() => {
                                closeMobileSidebar();
                                // Close all expanded menu items
                                setExpandedItems({});
                              }}
                            >
                              <span className={labelWrapperClasses}>
                                {Icon && <Icon size={18} className="shrink-0 text-white/75" />}
                                {!isCollapsed && <span className="sidebar-text text-sm">{item.label}</span>}
                              </span>
                            </Link>
                            {isCollapsed && hoverItem === item.id && flyoutPosition && (
                              <div
                                className="sidebar-flyout fixed z-100 flex min-w-[180px] items-center rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl"
                                style={{ 
                                  background: 'var(--bg-card)', 
                                  color: 'var(--text)', 
                                  borderColor: 'var(--border)',
                                  left: 'calc(var(--sidebar-collapsed-w) + 0.75rem)',
                                  top: `${flyoutPosition.top}px`,
                                  transform: 'translateY(0)',
                                  transition: 'opacity 0.15s ease, transform 0.15s ease'
                                }}
                                onMouseEnter={() => {
                                  // Clear any pending timeout when entering flyout
                                  if (hoverTimeoutRef.current) {
                                    clearTimeout(hoverTimeoutRef.current);
                                    hoverTimeoutRef.current = null;
                                  }
                                  setHoverItem(item.id);
                                }}
                                onMouseLeave={() => {
                                  // Immediately clear hover when leaving flyout
                                  setHoverItem(null);
                                }}
                              >
                                {/* Arrow indicator - single layer without border */}
                                <div
                                  className="absolute -left-[6px] top-1/2 -translate-y-1/2"
                                  style={{
                                    width: 0,
                                    height: 0,
                                    borderTop: '6px solid transparent',
                                    borderBottom: '6px solid transparent',
                                    borderRight: `6px solid var(--bg-card)`,
                                  }}
                                />
                                <span>{item.label}</span>
                              </div>
                            )}
                          </>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
