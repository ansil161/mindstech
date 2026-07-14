import { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { translateDynamicContent } from '../services/translationService';

// In-memory cache — persists for the lifetime of the browser session
const translationCache = new Map();

/**
 * Custom hook to dynamically translate backend data based on current language.
 * Handles the race condition where data arrives AFTER the language has already changed.
 *
 * @param {Array|Object|String} data          - Raw data from the API.
 * @param {Array<String>} fieldsToTranslate   - Object keys to translate (e.g. ['title', 'desc']).
 * @param {String} cacheKey                   - Unique identifier for this dataset.
 * @returns {{ translatedData, isTranslating }}
 */
export const useDynamicTranslation = (
  data,
  fieldsToTranslate = ['title', 'description', 'content', 'summary'],
  cacheKey = null
) => {
  const { currentLanguage } = useContext(LanguageContext);
  const [translatedData, setTranslatedData] = useState(data);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    // Nothing to translate yet — keep original data and wait
    const isEmpty = !data || (Array.isArray(data) && data.length === 0);
    if (isEmpty) {
      setTranslatedData(data);
      return;
    }

    // English — no translation needed, use raw data directly
    if (currentLanguage === 'en') {
      setTranslatedData(data);
      setIsTranslating(false);
      return;
    }

    let isMounted = true;

    const performTranslation = async () => {
      const fullCacheKey = cacheKey ? `${cacheKey}_${currentLanguage}` : null;

      // Hit in-memory cache — instant, no API call
      if (fullCacheKey && translationCache.has(fullCacheKey)) {
        if (isMounted) {
          setTranslatedData(translationCache.get(fullCacheKey));
          setIsTranslating(false);
        }
        return;
      }

      setIsTranslating(true);
      console.log(`[i18n] Translating "${cacheKey}" → ${currentLanguage}`);

      const result = await translateDynamicContent(data, fieldsToTranslate, currentLanguage);

      if (isMounted) {
        if (fullCacheKey) {
          translationCache.set(fullCacheKey, result);
        }
        setTranslatedData(result);
        setIsTranslating(false);
      }
    };

    performTranslation();

    return () => {
      isMounted = false;
    };
  // Re-run whenever language changes OR when data finally arrives from the API
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, data]);

  return { translatedData, isTranslating };
};
