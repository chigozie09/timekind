import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation resources
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import frTranslations from '../locales/fr.json';
import deTranslations from '../locales/de.json';
import jaTranslations from '../locales/ja.json';

const LANGUAGE_KEY = 'timekind_language';

// Language detector for React Native and Web
const languageDetector = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async (callback: (lang: string) => void) => {
    try {
      // Check if we're in a React Native environment
      if (typeof window === 'undefined') {
        // React Native: use AsyncStorage
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        callback(savedLanguage || 'en');
      } else {
        // Web environment: use localStorage
        const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
        callback(savedLanguage || 'en');
      }
    } catch (error) {
      console.error('Failed to detect language:', error);
      callback('en');
    }
  },
  cacheUserLanguage: async (language: string) => {
    try {
      if (typeof window === 'undefined') {
        // React Native
        await AsyncStorage.setItem(LANGUAGE_KEY, language);
      } else {
        // Web
        localStorage.setItem(LANGUAGE_KEY, language);
      }
    } catch (error) {
      console.error('Failed to cache language:', error);
    }
  },
};

// Initialize i18n
i18n
  .use(languageDetector as any)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
      fr: { translation: frTranslations },
      de: { translation: deTranslations },
      ja: { translation: jaTranslations },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

export default i18n;

/**
 * Get list of available languages
 */
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
];

/**
 * Change app language
 */
export async function changeLanguage(languageCode: string): Promise<void> {
  try {
    await i18n.changeLanguage(languageCode);
    if (typeof window === 'undefined') {
      // React Native
      await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    } else {
      // Web
      localStorage.setItem(LANGUAGE_KEY, languageCode);
    }
  } catch (error) {
    console.error('Failed to change language:', error);
  }
}

/**
 * Get current language
 */
export function getCurrentLanguage(): string {
  return i18n.language || 'en';
}

/**
 * Get current language name
 */
export function getCurrentLanguageName(): string {
  const lang = AVAILABLE_LANGUAGES.find((l) => l.code === getCurrentLanguage());
  return lang?.name || 'English';
}
