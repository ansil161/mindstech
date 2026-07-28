import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Only English is bundled. The other four locales were ~180 kB of JSON sitting
// in the entry chunk so that every visitor downloaded five translations to read
// one. They are now separate chunks, fetched by loadLanguage() below.
//
// English stays static because it is `fallbackLng`: i18next needs it available
// synchronously to resolve any key missing from the active language.
import enCommon from '../locales/en/common.json';

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'ar', 'de', 'zh'];

// A static map, not `import(`../locales/${lng}/common.json`)`. A fully dynamic
// specifier makes the bundler emit a chunk for everything matching the glob and
// wire up a runtime resolver; naming each import keeps one chunk per locale and
// lets an unknown `lng` fail fast here instead of at fetch time.
const LOCALE_LOADERS = {
  fr: () => import('../locales/fr/common.json'),
  ar: () => import('../locales/ar/common.json'),
  de: () => import('../locales/de/common.json'),
  zh: () => import('../locales/zh/common.json'),
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { common: enCommon } },
    // Tells i18next that `resources` is deliberately incomplete, so it does not
    // treat the absent locales as a misconfiguration and collapse them to `en`
    // permanently once addResourceBundle() supplies them.
    partialBundledLanguages: true,
    defaultNS: 'common',
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      // No Suspense: loadLanguage() is always awaited before the language is
      // switched, so components never render against a half-loaded bundle and
      // we avoid needing a Suspense boundary around the whole tree.
      useSuspense: false,
    },
  });

/**
 * Fetch and register a locale bundle. Idempotent and safe to call with 'en' or
 * an unsupported code. Callers MUST await this before i18n.changeLanguage(lng),
 * otherwise the UI renders English until the chunk lands.
 */
export async function loadLanguage(lng) {
  const base = String(lng || '').split('-')[0];
  if (!base || base === 'en') return;
  if (i18n.hasResourceBundle(base, 'common')) return;

  const load = LOCALE_LOADERS[base];
  if (!load) return;

  try {
    const { default: bundle } = await load();
    i18n.addResourceBundle(base, 'common', bundle, true, true);
  } catch (error) {
    // A failed chunk fetch degrades to the English fallback rather than
    // blocking navigation or leaving raw keys on screen.
    console.error(`Failed to load "${base}" translations:`, error);
  }
}

export default i18n;
