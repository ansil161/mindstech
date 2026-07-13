import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import local translations
import enCommon from '../locales/en/common.json';
import frCommon from '../locales/fr/common.json';
import arCommon from '../locales/ar/common.json';
import deCommon from '../locales/de/common.json';
import zhCommon from '../locales/zh/common.json';

const resources = {
  en: { common: enCommon },
  fr: { common: frCommon },
  ar: { common: arCommon },
  de: { common: deCommon },
  zh: { common: zhCommon },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'ar', 'de', 'zh'],
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
