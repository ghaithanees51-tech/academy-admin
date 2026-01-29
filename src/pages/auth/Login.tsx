import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from '../../services/authApi';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/authSlice';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { getDashboardRoute } from '../../utils/routes';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [login, { isLoading, error }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      return;
    }
    
    try {
      const result = await login({ 
        email: email.trim(), 
        password: password.trim(),
        remember_me: rememberMe 
      }).unwrap();
      
      // Save credentials to Redux store (and localStorage via authSlice)
      dispatch(setCredentials({
        user: result.user,
        access: result.access,
        refresh: result.refresh,
      }));
      
      // Redirect to appropriate dashboard based on user role
      const dashboardRoute = getDashboardRoute(result.user);
      navigate(dashboardRoute);
    } catch (err) {
      // Error is handled by RTK Query and displayed in the UI via the error state
      // No need to log to console in production
    }
  };

  const currentYear = new Date().getFullYear();
  
  // Extract error message
  const errorMessage = (() => {
    if (error) {
      // Handle RTK Query error structure - check data first
      if ('data' in error) {
        const data = (error as FetchBaseQueryError).data;
        if (typeof data === 'object' && data !== null) {
          const errorData = data as { detail?: string; error?: string; message?: string; non_field_errors?: string[] };
          // Prioritize detail field (most common in Django REST Framework)
          if (errorData.detail) {
            return errorData.detail;
          }
          if (errorData.error) {
            return errorData.error;
          }
          if (errorData.message) {
            return errorData.message;
          }
          if (Array.isArray(errorData.non_field_errors) && errorData.non_field_errors.length > 0) {
            return errorData.non_field_errors.join(', ');
          }
        }
        if (typeof data === 'string') {
          return data;
        }
      }
      
      // Handle status code - provide user-friendly messages
      if ('status' in error) {
        const status = (error as FetchBaseQueryError).status;
        if (status === 401) {
          return t('auth.login.invalidCredentials');
        }
        if (status === 403) {
          return t('auth.login.accessDenied');
        }
        if (status === 404) {
          return t('auth.login.loginNotFound');
        }
        if (status === 500) {
          return t('auth.login.serverError');
        }
        if (typeof status === 'number') {
          return t('auth.login.loginFailed', { status });
        }
      }
      
      // Handle network errors
      if ('error' in error && typeof error.error === 'string') {
        if (error.error.includes('Failed to fetch') || error.error.includes('NetworkError')) {
          return t('auth.login.networkError');
        }
        return error.error;
      }
    }
    return t('auth.login.unexpectedError');
  })();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#f0f4f6] via-white to-[#faf9f7] overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob" style={{ backgroundColor: '#0c4261' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-2000" style={{ backgroundColor: '#A29475' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-blob animation-delay-4000" style={{ backgroundColor: '#0c4261' }}></div>
      </div>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full">
        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl border border-white/20">
          {/* Header */}
          <div className="px-8 py-10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0c4261 0%, #0a3650 50%, #083140 100%)' }}>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full -mr-20 -mt-20" style={{ backgroundColor: 'rgba(162, 148, 117, 0.1)' }}></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full -ml-16 -mb-16" style={{ backgroundColor: 'rgba(162, 148, 117, 0.1)' }}></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">{t('auth.login.welcomeBack')}</h1>
                  <p className="text-white/90 text-sm mt-1">{t('auth.login.signInToContinue')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-10 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="animate-fade-in">
                <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-red-800 text-sm font-medium flex-1">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2.5 transition-colors" style={{ color: 'var(--focus-color, #374151)' }}>
                  {t('auth.login.emailAddress')}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none transition-colors`}>
                    <svg className="w-5 h-5 text-gray-400 transition-colors" style={{ color: 'var(--icon-color, #9ca3af)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={(e) => {
                      e.currentTarget.parentElement?.parentElement?.style.setProperty('--focus-color', '#0c4261');
                      e.currentTarget.parentElement?.querySelector('svg')?.style.setProperty('color', '#0c4261');
                    }}
                    onBlur={(e) => {
                      e.currentTarget.parentElement?.parentElement?.style.removeProperty('--focus-color');
                      e.currentTarget.parentElement?.querySelector('svg')?.style.removeProperty('color');
                    }}
                    className={`block w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:border-gray-300 bg-gray-50/50 focus:bg-white hover:shadow-md`}
                    style={{ 
                      '--tw-ring-color': '#0c4261',
                      borderColor: 'var(--border-color, #e5e7eb)'
                    } as React.CSSProperties}
                    placeholder={t('auth.login.emailPlaceholder')}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <div className="flex justify-between items-center mb-2.5">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700 transition-colors" style={{ color: 'var(--focus-color-pwd, #374151)' }}>
                    {t('auth.login.password')}
                  </label>
                  <Link to="/forgot-password" className="text-sm font-medium transition-all hover:underline underline-offset-2" style={{ color: '#0c4261' }}>
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none transition-colors`}>
                    <svg className="w-5 h-5 text-gray-400 transition-colors" style={{ color: 'var(--icon-color-pwd, #9ca3af)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={(e) => {
                      e.currentTarget.parentElement?.parentElement?.style.setProperty('--focus-color-pwd', '#0c4261');
                      e.currentTarget.parentElement?.querySelector('svg')?.style.setProperty('color', '#0c4261');
                    }}
                    onBlur={(e) => {
                      e.currentTarget.parentElement?.parentElement?.style.removeProperty('--focus-color-pwd');
                      e.currentTarget.parentElement?.querySelector('svg')?.style.removeProperty('color');
                    }}
                    className={`block w-full ${isRTL ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:border-gray-300 bg-gray-50/50 focus:bg-white hover:shadow-md`}
                    style={{ 
                      '--tw-ring-color': '#0c4261',
                      borderColor: 'var(--border-color-pwd, #e5e7eb)'
                    } as React.CSSProperties}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 ${isRTL ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center text-gray-400 transition-colors`}
                    style={{ '--hover-color': '#0c4261' } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#0c4261'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                    aria-label={t('common.togglePasswordVisibility')}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center pt-1">
                <input
                  type="checkbox"
                  id="remember_me"
                  name="remember_me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2 transition-all cursor-pointer"
                  style={{ 
                    accentColor: '#0c4261',
                    '--tw-ring-color': '#0c4261'
                  } as React.CSSProperties}
                  disabled={isLoading}
                />
                <label htmlFor="remember_me" className={`${isRTL ? 'mr-3' : 'ml-3'} text-sm text-gray-700 font-medium cursor-pointer select-none`}>
                  {t('auth.login.rememberMe')}
                </label>
              </div>

              {/* Sign in button */}
              <button
                type="submit"
                className="w-full mt-2 py-4 px-4 text-white rounded-xl font-bold text-base focus:outline-none focus:ring-4 transition-all duration-200 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, #0c4261 0%, #0a3650 50%, #083140 100%)',
                  '--tw-ring-color': 'rgba(12, 66, 97, 0.3)'
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #083140 0%, #0a3650 50%, #0c4261 100%)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0c4261 0%, #0a3650 50%, #083140 100%)';
                }}
                disabled={isLoading}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="relative">{t('auth.login.signingIn')}</span>
                  </>
                ) : (
                  <>
                    <span className="relative">{t('auth.login.signIn')}</span>
                    <svg className="w-5 h-5 relative transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Tip */}
            <div className="mt-6 rounded-xl p-4 shadow-sm" style={{ 
              background: 'linear-gradient(135deg, rgba(12, 66, 97, 0.05) 0%, rgba(162, 148, 117, 0.05) 100%)',
              border: '1px solid rgba(12, 66, 97, 0.15)'
            }}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ backgroundColor: 'rgba(12, 66, 97, 0.1)' }}>
                  <svg className="w-3 h-3" style={{ color: '#0c4261' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium flex-1" style={{ color: '#0c4261' }}>
                  {t('auth.login.useCompanyEmail')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>{t('common.securedConnection')}</span>
          </div>
          <p className="text-xs text-gray-400">© {currentYear} {t('common.allRightsReserved')}</p>
        </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .hover\:shadow-3xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default Login;
