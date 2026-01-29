import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { showToast } from '../../utils/toast';

import { API_BASE_URL } from '../../config/api';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast.error(t('auth.forgot.pleaseEnterEmail'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/public/forgot-password/admin/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        showToast.success(t('auth.forgot.resetLinkSent'));
      } else {
        showToast.error(data.message || t('auth.forgot.failedToSend'));
      }
    } catch (error) {
      console.error('Error sending reset request:', error);
      showToast.error(t('auth.forgot.errorOccurred'));
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
            <h1 className="mt-6 text-2xl font-bold text-gray-900">{t('auth.forgot.checkEmail')}</h1>
            <p className="mt-4 text-sm text-gray-600">
              {t('auth.forgot.weSentLink')} <strong>{email}</strong>
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {t('auth.forgot.checkInbox')}
            </p>
            <div className="mt-8 space-y-3">
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
              >
                {t('auth.forgot.sendAnother')}
              </button>
              <Link
                to="/login"
                className="block w-full rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
              >
                {t('auth.forgot.backToLogin')}
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
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.forgot.backToLogin')}
          </Link>
        </div>

        <div className="mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <Mail className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 text-center">{t('auth.forgot.forgotPasswordTitle')}</h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            {t('auth.forgot.enterEmailWeSend')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              {t('auth.forgot.emailRequired')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm hover:border-indigo-300"
                placeholder="name@company.com"
                required
                disabled={loading}
              />
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
                {t('auth.forgot.sending')}
              </>
            ) : (
              <>
                <Mail className="h-5 w-5" />
                {t('auth.forgot.sendResetLink')}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.forgot.rememberPassword')}{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
              {t('auth.forgot.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
