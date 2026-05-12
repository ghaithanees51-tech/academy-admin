import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut, Phone, User, RefreshCcw } from 'lucide-react';
import {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useLogoutMutation,
} from '../services/authApi';
import { useAppDispatch } from '../store/hooks';
import { logout as logoutAction, updateUser } from '../store/authSlice';

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { data: user, isLoading, refetch } = useGetCurrentUserQuery();
  const [updateCurrentUser, { isLoading: isUpdating }] = useUpdateCurrentUserMutation();
  const [logoutMutation] = useLogoutMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone_number || '');
    }
  }, [user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    try {
      const response = await updateCurrentUser({
        name,
        phone_number: phone,
      }).unwrap();

      dispatch(updateUser(response));
      setStatusMessage({ type: 'success', message: t('profile.profileUpdated') });
      refetch();
    } catch (error) {
      console.error('Failed to update user profile', error);
      setStatusMessage({ type: 'error', message: t('profile.updateFailed') });
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await logoutMutation({ refresh: refreshToken }).unwrap();
      }
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      dispatch(logoutAction());
      navigate('/login');
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 rounded-xl bg-white p-8 shadow">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-gray-600">{t('profile.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto py-2">
        {/* Header Actions */}
        <div className="mb-6 flex flex-col gap-4 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{t('profile.myProfile')}</h1>
              <p className="text-xs text-gray-500">{t('profile.manageAccount')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600  transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('profile.refreshProfile')}
            >
              <RefreshCcw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            
            <Link
              to="/profile/change-password"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700  transition hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
            >
              {t('profile.changePassword')}
            </Link>
            
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600  transition hover:border-red-300 hover:bg-red-50 hover:shadow-md"
            >
              <LogOut className="h-4 w-4" />
              {t('profile.logout')}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 px-4 sm:px-6 lg:px-8">

          {statusMessage && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                statusMessage.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {statusMessage.message}
            </div>
          )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-300 bg-white p-6  lg:col-span-1">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-2xl font-semibold text-white">
                {user.name ? user.name[0]?.toUpperCase() : 'U'}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{user.name || t('profile.unnamedUser')}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>{t('profile.role')}</span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('profile.accountStatus')}</span>
                <span className="text-sm font-medium text-emerald-600">
                  {user.is_active ? t('profile.active') : t('profile.inactive')}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-300 bg-white p-6  lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">{t('profile.accountDetails')}</h2>
            <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('profile.fullName')}
                </label>
                <div className="mt-1 flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                  <User className="h-4 w-4 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-11 w-full border-none bg-transparent px-3 text-sm focus:outline-none"
                    placeholder={t('profile.yourFullName')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  {t('profile.phoneNumber')}
                </label>
                <div className="mt-1 flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="h-11 w-full border-none bg-transparent px-3 text-sm focus:outline-none"
                    placeholder={t('profile.phonePlaceholder')}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white  transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isUpdating && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>}
                  {t('profile.saveChanges')}
                </button>
              </div>
            </form>
          </section>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

