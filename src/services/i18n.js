// src/services/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import localforage from 'localforage';

// RTL languages
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Language names in their native language
export const LANGUAGE_NAMES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  ar: 'العربية',
  hi: 'हिन्दी',
  pt: 'Português',
  ru: 'Русский',
};

// Create a cache store with localforage
const languageCache = localforage.createInstance({
  name: 'i18nextCache',
  storeName: 'translations',
});

// Custom backend cache
const backendOptions = {
  loadPath: process.env.PUBLIC_URL + '/locales/{{lng}}/{{ns}}.json',
  // Cache translations in browser storage
  expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  // Custom request function to handle caching
  request: async (options, url, payload, callback) => {
    try {
      // Try to get from cache first
      const cachedData = await languageCache.getItem(url);
      if (cachedData) {
        return callback(null, {
          status: 200,
          data: cachedData,
        });
      }

      // If not in cache, fetch from server
      const response = await fetch(url, options);
      
      // Check if response is OK before trying to parse JSON
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store in cache
      await languageCache.setItem(url, data);
      
      callback(null, {
        status: response.status,
        data,
      });
    } catch (error) {
      console.error('Error loading translations:', error);
      // Log more details about the failed request
      console.error('Failed URL:', url);
      
      // Check if the error is related to parsing JSON (which might indicate HTML was returned)
      if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
        console.warn('Received non-JSON response. This might be a 404 page or server error.');
        
        // Try to use an empty object as fallback for missing translations
        // This prevents the app from continuously trying to load a missing file
        await languageCache.setItem(url, {});
        
        callback(null, {
          status: 200,
          data: {},
        });
      } else {
        callback(error, {
          status: 500,
          data: '',
        });
      }
    }
  }
};

// Set document direction based on language
export const setDocumentDirection = (language) => {
  const dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = language;
  
  // Add language-specific class to body for additional styling
  document.body.className = document.body.className
    .replace(/lang-\w+/g, '')
    .trim();
  document.body.classList.add(`lang-${language}`);
};

// Initialize i18next
i18n
  // Load translations from /public/locales
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Default language
    fallbackLng: 'en',
    // Debug mode in development
    debug: process.env.NODE_ENV === 'development',
    // Add fallback behavior for missing translations
    fallbackNS: 'common',
    partialBundledLanguages: true,
    // Namespace for translations
    ns: ['common', 'home', 'coupons', 'cashback', 'account', 'admin'],
    defaultNS: 'common',
    // Interpolation configuration
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    // Backend configuration
    backend: backendOptions,
    // Language detector options
    detection: {
      // Order of detection
      order: ['localStorage', 'cookie', 'navigator'],
      // Cache user language
      caches: ['localStorage', 'cookie'],
      // Cookie options
      cookieExpirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
      cookieDomain: window.location.hostname,
    },
    // React options
    react: {
      useSuspense: true,
    },
    // Performance options
    load: 'languageOnly', // Only load specific language (not all variants)
    preload: ['en'], // Preload English
  });

// Set document direction when language changes
i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
  
  // Dispatch custom event for components to react to language change
  const event = new CustomEvent('languageChanged', { detail: { language: lng } });
  document.dispatchEvent(event);
});

// Set initial document direction
setDocumentDirection(i18n.language);

export default i18n;