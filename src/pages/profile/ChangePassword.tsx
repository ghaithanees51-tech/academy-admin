import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { KeyRound, Loader2, ShieldCheck, ShieldOff, Info, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useChangePasswordMutation } from '../../services/authApi';
import { Card, CardHeader, CardSection } from '../../components/ui/Card';

const ChangePassword = () => {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword) {
      setMessage({ type: 'error', text: t('changePassword.fillRequired') });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: t('changePassword.passwordsNoMatch') });
      return;
    }

    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      }).unwrap();
      setMessage({ type: 'success', text: response.message || t('changePassword.passwordUpdated') });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const serverMessage =
        (error?.data?.message as string) ||
        (Array.isArray(error?.data?.errors) ? error.data.errors.join(' ') : '') ||
        t('changePassword.changeFailed');
      setMessage({ type: 'error', text: serverMessage });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-8xl mx-auto py-2">
        {/* Header Actions */}
        <div className="mb-6 flex flex-col gap-4 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{t('changePassword.title')}</h1>
              <p className="text-xs text-gray-500">{t('changePassword.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700  transition hover:border-slate-400 hover:bg-slate-50 hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
              {t('changePassword.backToProfile')}
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Change Password Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader
                title={t('changePassword.updatePassword')}
                subtitle={t('changePassword.enterCurrentNew')}
                icon={<KeyRound className="h-5 w-5" />}
              />

              <CardSection>
                {message && (
                  <div
                    className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                      message.type === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {message.type === 'success' ? (
                        <ShieldCheck className="h-4 w-4" />
                      ) : (
                        <ShieldOff className="h-4 w-4" />
                      )}
                      <span>{message.text}</span>
                    </div>
                  </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="current-password" className="block text-sm font-medium text-slate-700">
                      {t('changePassword.currentPassword')}
                    </label>
                    <div className="relative">
                      <input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder={t('changePassword.enterCurrent')}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-indigo-600 transition-colors"
                        aria-label={t('common.togglePasswordVisibility')}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
                      {t('changePassword.newPassword')}
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder={t('changePassword.chooseStrong')}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-indigo-600 transition-colors"
                        aria-label={t('common.togglePasswordVisibility')}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">
                      {t('changePassword.confirmNewPassword')}
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder={t('changePassword.reenterNew')}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-indigo-600 transition-colors"
                        aria-label={t('common.togglePasswordVisibility')}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white  transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      <span>{t('changePassword.updatePasswordButton')}</span>
                    </button>
                  </div>
                </form>
              </CardSection>
            </Card>
          </div>

          {/* Password Instructions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader
                title={t('changePassword.passwordRequirements')}
                subtitle={t('changePassword.followGuidelines')}
                icon={<Info className="h-5 w-5" />}
              />

              <CardSection>
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-3">{t('changePassword.strongPasswordTips')}</h4>
                    <ul className="space-y-2.5">
                      <li className="flex items-start gap-2 text-sm text-blue-800">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
                        <span>{t('changePassword.use8Chars')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-blue-800">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
                        <span>{t('changePassword.includeCase')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-blue-800">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
                        <span>{t('changePassword.addNumbersSpecial')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-blue-800">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
                        <span>{t('changePassword.avoidCommon')}</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-blue-800">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
                        <span>{t('changePassword.dontReuse')}</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-amber-50 border border-amber-100 p-4">
                    <h4 className="text-sm font-semibold text-amber-900 mb-2">{t('changePassword.securityNotice')}</h4>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      {t('changePassword.securityNoticeText')}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">{t('changePassword.needHelp')}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {t('changePassword.needHelpText')}
                    </p>
                  </div>
                </div>
              </CardSection>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
