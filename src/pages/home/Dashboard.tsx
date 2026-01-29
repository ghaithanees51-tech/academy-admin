import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import { selectCurrentUser } from '../../store/authSlice';
import { useGetGalleryStatsQuery } from '../../services/galleryApi';
import { useGetVideoStatsQuery } from '../../services/videoStatsApi';
import { useGetNewsStatsQuery } from '../../services/newsStatsApi';
import { useGetOpenDataStatsQuery } from '../../services/openDataStatsApi';
import { useGetAuthCodeStatsQuery } from '../../services/authCodesApi';
import { useGetUsersCountQuery } from '../../services/authApi';
import { useGetRecentActivityQuery } from '../../services/activityApi';
import type { ActivityType } from '../../services/activityApi';
import { 
  Image, 
  Video, 
  Newspaper, 
  Database,
  Plus,
  KeyRound,
  Calendar,
  BarChart3,
  Users,
  Download,
  FileText,
  Play
} from 'lucide-react';

function useFormatTimeAgo() {
  const { t } = useTranslation();
  return (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return t('dashboard.justNow');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return t('dashboard.minutesAgo', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('dashboard.hoursAgo', { count: hours });
    const days = Math.floor(hours / 24);
    if (days < 7) return t('dashboard.daysAgo', { count: days });
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return t('dashboard.weeksAgo', { count: weeks });
    const months = Math.floor(days / 30);
    return t('dashboard.monthsAgo', { count: months });
  };
}

const ACTIVITY_ICONS: Record<ActivityType, typeof Image> = {
  gallery: Image,
  news: FileText,
  video: Play,
  opendata: Database,
  auth_code: KeyRound,
};

const Dashboard = () => {
  const { t } = useTranslation();
  const formatTimeAgo = useFormatTimeAgo();
  const user = useAppSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats'>('overview');
  
  // Refetch stats every time user returns to dashboard
  const { data: galleryStats } = useGetGalleryStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: videoStats } = useGetVideoStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: newsStats } = useGetNewsStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: openDataStats } = useGetOpenDataStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: authCodeStats } = useGetAuthCodeStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const { data: usersCountData } = useGetUsersCountQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const [activityPage, setActivityPage] = useState(1);
  const PAGE_SIZE = 10;
  const { data: recentActivityData } = useGetRecentActivityQuery(
    { page: activityPage, page_size: PAGE_SIZE },
    { refetchOnMountOrArgChange: true }
  );

  const stats = {
    photos: {
      total: galleryStats?.total_count ?? 0,
      new: galleryStats?.new_count ?? 0,
    },
    videos: {
      total: videoStats?.total_count ?? 0,
      new: videoStats?.new_count ?? 0,
    },
    news: {
      total: newsStats?.total_count ?? 0,
      new: newsStats?.new_count ?? 0,
      recent: newsStats?.new_count ?? 0,
      views: '—',
    },
    openData: {
      total: openDataStats?.total_count ?? 0,
      recent: openDataStats?.new_count ?? 0,
      downloads: '—',
    }
  };

  const modules = [
    {
      id: 'photos',
      title: t('dashboard.photos'),
      description: t('dashboard.managePhotos'),
      icon: Image,
      color: '#0c4261',
      bgColor: 'rgba(12, 66, 97, 0.08)',
      stats: stats.photos,
      action: '/photos',
      gradient: 'linear-gradient(135deg, #0c4261 0%, #083140 100%)'
    },
    {
      id: 'videos',
      title: t('dashboard.videos'),
      description: t('dashboard.uploadManageVideos'),
      icon: Video,
      color: '#A29475',
      bgColor: 'rgba(162, 148, 117, 0.08)',
      stats: stats.videos,
      action: '/videos',
      gradient: 'linear-gradient(135deg, #A29475 0%, #8a7d62 100%)'
    },
    {
      id: 'news',
      title: t('dashboard.news'),
      description: t('dashboard.createPublishNews'),
      icon: Newspaper,
      color: '#0c4261',
      bgColor: 'rgba(12, 66, 97, 0.08)',
      stats: stats.news,
      action: '/news',
      gradient: 'linear-gradient(135deg, #0c4261 0%, #083140 100%)'
    },
    {
      id: 'opendata',
      title: t('dashboard.openData'),
      description: t('dashboard.managePublicDatasets'),
      icon: Database,
      color: '#A29475',
      bgColor: 'rgba(162, 148, 117, 0.08)',
      stats: stats.openData,
      action: '/open-data',
      gradient: 'linear-gradient(135deg, #A29475 0%, #8a7d62 100%)'
    }
  ];

  const recentActivities = recentActivityData?.results ?? [];

  // Show personalized welcome only when both first_name and last_name are not empty
  const hasFullName = Boolean(
    user?.first_name?.trim() && user?.last_name?.trim()
  );
  const welcomeTitle = hasFullName
    ? t('dashboard.welcomeBackName', { name: [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() })
    : t('dashboard.welcomeBack');

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl p-8 text-white" style={{ background: 'linear-gradient(135deg, #0c4261 0%, #083140 100%)' }}>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 200 200" fill="currentColor">
            <circle cx="100" cy="100" r="80" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            {welcomeTitle}
          </h1>
          <p className="text-white/90 text-lg">
            {t('dashboard.manageContent')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-[#0c4261] text-[#0c4261]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('dashboard.overview')}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'stats'
              ? 'border-[#0c4261] text-[#0c4261]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('dashboard.statistics')}
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Module Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.id}
                  to={module.action}
                  className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Gradient Background on Hover */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: module.gradient }}
                  />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div 
                      className="inline-flex p-3 rounded-xl mb-4 transition-colors"
                      style={{ backgroundColor: module.bgColor }}
                    >
                      <Icon 
                        className="h-6 w-6 group-hover:text-white transition-colors" 
                        style={{ color: module.color }}
                      />
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-white transition-colors mb-1">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors mb-4">
                      {module.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 group-hover:text-white/80 transition-colors">
                        {module.id === 'photos' ? module.stats.total : (module.stats as { total?: number; recent?: number }).total ?? 0} {t('dashboard.totalLabel')}
                      </span>
                      <span 
                        className="font-semibold group-hover:text-white transition-colors"
                        style={{ color: module.color }}
                      >
                        +{module.id === 'photos' || module.id === 'videos' ? (module.stats as { new?: number }).new : (module.stats as { recent?: number }).recent ?? 0} {t('dashboard.newLabel')}
                      </span>
                    </div>
                  </div>

                  {/* Plus Icon */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick Stats Row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.totalAuthCodes')}</p>
                  <p className="text-2xl font-bold" style={{ color: '#0c4261' }}>
                    {authCodeStats?.total_count ?? 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(12, 66, 97, 0.08)' }}>
                  <KeyRound className="h-6 w-6" style={{ color: '#0c4261' }} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                <span>{t('dashboard.activeRevokedCodes')}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.usedCount')}</p>
                  <p className="text-2xl font-bold" style={{ color: '#0c4261' }}>
                    {authCodeStats?.used_count ?? 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(162, 148, 117, 0.08)' }}>
                  <BarChart3 className="h-6 w-6" style={{ color: '#A29475' }} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                <span>{t('dashboard.totalCodeLogins')}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.usersCount')}</p>
                  <p className="text-2xl font-bold" style={{ color: '#0c4261' }}>
                    {usersCountData?.count ?? 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(12, 66, 97, 0.08)' }}>
                  <Users className="h-6 w-6" style={{ color: '#0c4261' }} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                <span>{t('dashboard.registeredUsers')}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('dashboard.totalDownload')}</p>
                  <p className="text-lg font-bold" style={{ color: '#0c4261' }}>
                    {t('dashboard.image')}: {galleryStats?.total_count ?? 0}
                  </p>
                  <p className="text-lg font-bold" style={{ color: '#A29475' }}>
                    {t('dashboard.video')}: {videoStats?.total_count ?? 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(162, 148, 117, 0.08)' }}>
                  <Download className="h-6 w-6" style={{ color: '#A29475' }} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                <span>{t('dashboard.imageVideoSeparate')}</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{t('dashboard.recentActivity')}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {t('dashboard.noRecentActivity')}
                </div>
              ) : (
                recentActivities.map((activity) => {
                  const Icon = ACTIVITY_ICONS[activity.activity_type];
                  return (
                    <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div 
                          className="flex h-12 w-12 items-center justify-center rounded-xl"
                          style={{ backgroundColor: 'rgba(12, 66, 97, 0.08)' }}
                        >
                          <Icon className="h-5 w-5" style={{ color: '#0c4261' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          {activity.title && (
                            <p className="text-sm text-gray-600 truncate mt-0.5">{activity.title}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>{formatTimeAgo(activity.timestamp)}</span>
                          </div>
                        </div>                       
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {recentActivityData && recentActivityData.total_pages > 1 && (
              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {t('common.page')} {recentActivityData.page} {t('common.of')} {recentActivityData.total_pages}
                  {' '}({recentActivityData.count} {t('common.total')})
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                    disabled={recentActivityData.page <= 1}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.previous')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityPage((p) => Math.min(recentActivityData.total_pages, p + 1))}
                    disabled={recentActivityData.page >= recentActivityData.total_pages}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.next')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('dashboard.contentStatistics')}</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {modules.map((module) => {
                const Icon = module.icon;
                return (
                  <div key={module.id} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: module.bgColor }}
                      >
                        <Icon className="h-5 w-5" style={{ color: module.color }} />
                      </div>
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('dashboard.totalItems')}</span>
                        <span className="font-semibold text-gray-900">
                          {(module.stats as { total?: number }).total ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('dashboard.newLast7Days')}</span>
                        <span className="font-semibold" style={{ color: module.color }}>
                          +{(module.stats as { new?: number; recent?: number }).new ?? (module.stats as { recent?: number }).recent ?? 0}
                        </span>
                      </div>
                      {'views' in module.stats || 'downloads' in module.stats ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {module.id === 'opendata' ? t('dashboard.downloads') : t('dashboard.views')}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {module.id === 'opendata' ? (module.stats as { downloads?: string }).downloads : (module.stats as { views?: string }).views}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Placeholder for Charts */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.performanceTrends')}</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>{t('dashboard.chartPlaceholder')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
