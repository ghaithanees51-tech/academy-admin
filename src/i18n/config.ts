import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

// Get saved language from localStorage or default to 'en'
// Check if window is defined to avoid SSR issues
const savedLanguage = typeof window !== 'undefined' 
  ? (localStorage.getItem('i18nextLng') || 'en')
  : 'en';
const defaultLanguage = savedLanguage === 'ar' ? 'ar' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      ar: {
        translation: arTranslations,
      },
    },
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Set document direction based on language
const setDocumentDirection = (lang: string, direction?: 'ltr' | 'rtl') => {
  // Check if document is defined to avoid SSR issues
  if (typeof document === 'undefined') return;
  
  // If direction is provided, use it; otherwise infer from language code
  const dir = direction || (lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('data-lang', lang);
};

// Set initial direction (only in browser)
if (typeof window !== 'undefined') {
  setDocumentDirection(defaultLanguage);
}

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', lng);
  }
});

/**
 * Sync i18n language with user's preferred language
 * This should be called when user logs in or user data changes
 */
export const syncLanguageWithUser = (languageCode?: string | null, languageDirection?: 'ltr' | 'rtl' | null) => {
  if (!languageCode) {
    // If no user preference, use saved language from localStorage
    const savedLang = typeof window !== 'undefined'
      ? (localStorage.getItem('i18nextLng') || 'en')
      : 'en';
    i18n.changeLanguage(savedLang);
    return;
  }

  // Change language if different from current
  if (i18n.language !== languageCode) {
    i18n.changeLanguage(languageCode);
  }

  // Set direction based on user preference
  if (languageDirection) {
    setDocumentDirection(languageCode, languageDirection);
  }
};

export default i18n;

