/**
 * Language + region-language wiring.
 *
 * Language is a deliberate, user-owned choice. Picking a region NEVER changes
 * the language on its own any more — the region switcher used to call
 * changeLanguage() inline (Navbar/Drawer), so an Indian visitor who wanted
 * Middle East pricing silently got the whole site in Arabic with no way back
 * except finding the region menu again.
 *
 * The map below is now only a *suggestion*: RegionLanguagePrompt asks before
 * switching, and "Keep English" (or whatever is currently active) is always a
 * first-class answer. English is the fallback in every case.
 */

/** Display metadata for the five bundles in i18n/index.js. */
export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', short: 'EN' },
  { code: 'fr', label: 'French', native: 'Français', short: 'FR' },
  { code: 'ar', label: 'Arabic', native: 'العربية', short: 'AR' },
  { code: 'de', label: 'German', native: 'Deutsch', short: 'DE' },
  { code: 'zh', label: 'Chinese', native: '中文', short: 'ZH' },
];

/** The language a region *suggests*. Absent region → no prompt at all. */
export const REGION_LANGUAGE = {
  Global: 'en',
  India: 'en',
  'Middle East': 'ar',
  Africa: 'fr',
  'South Asia': 'en',
  'Hong Kong / China': 'zh',
  Romania: 'de',
  Poland: 'de',
  France: 'fr',
};

export const DEFAULT_LANGUAGE = 'en';

/** Normalises 'en-GB' → 'en' and unknown codes → English. */
export const resolveLanguage = (code) => {
  const base = String(code || '').split('-')[0].toLowerCase();
  return LANGUAGES.some((l) => l.code === base) ? base : DEFAULT_LANGUAGE;
};

export const getLanguage = (code) =>
  LANGUAGES.find((l) => l.code === resolveLanguage(code)) || LANGUAGES[0];

/**
 * The suggested language for a region, or null when there is nothing to
 * suggest — either the region is unmapped or it already matches what the
 * visitor is reading, in which case no prompt should ever appear.
 */
export const suggestLanguageForRegion = (regionName, currentLanguage) => {
  const suggested = REGION_LANGUAGE[regionName];
  if (!suggested) return null;
  if (resolveLanguage(suggested) === resolveLanguage(currentLanguage)) return null;
  return resolveLanguage(suggested);
};
