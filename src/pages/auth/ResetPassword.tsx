import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { showToast } from '../../utils/toast';
import { API_BASE_URL } from '../../config/api';

const ResetPassword = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError(t('auth.reset.invalidLinkMessage'));
    }
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      showToast.error(t('auth.reset.pleaseEnterNew'));
      return;
    }

    if (newPassword.length < 8) {
      showToast.error(t('auth.reset.passwordMin8'));
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast.error(t('auth.reset.passwordsDontMatch'));
      return;
    }

    if (!token) {
      showToast.error(t('auth.reset.invalidLink'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/public/reset-password/admin/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        showToast.success(t('auth.reset.resetSuccess'));
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || t('auth.reset.resetFailed'));
        showToast.error(data.message || t('auth.reset.resetFailed'));
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(t('auth.reset.errorOccurred'));
      showToast.error(t('auth.reset.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">{t('auth.reset.passwordResetSuccess')}</h1>
            <p className="mt-4 text-sm text-gray-600">
              {t('auth.reset.passwordResetMessage')}
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              {t('auth.reset.goToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-gray-900">{t('auth.reset.invalidLink')}</h1>
            <p className="mt-4 text-sm text-gray-600">{error}</p>
            <div className="mt-8 space-y-3">
              <Link
                to="/forgot-password"
                className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                {t('auth.reset.requestNewLink')}
              </Link>
              <Link
                to="/login"
                className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                {t('auth.reset.backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Lock className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 text-center">{t('auth.reset.resetYourPassword')}</h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            {t('auth.reset.enterNewBelow')}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('auth.reset.newPassword')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm hover:border-indigo-300"
                placeholder={t('auth.reset.enterNewPassword')}
                required
                disabled={loading}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">{t('auth.reset.mustBe8Chars')}</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('auth.reset.confirmPassword')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm hover:border-indigo-300"
                placeholder={t('auth.reset.confirmNewPassword')}
                required
                disabled={loading}
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t('auth.reset.resettingPassword')}
              </>
            ) : (
              <>
                <Lock className="h-5 w-5" />
                {t('auth.reset.resetPassword')}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
          >
            {t('auth.reset.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
