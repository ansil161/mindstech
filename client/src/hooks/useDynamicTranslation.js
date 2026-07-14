import { useState, useEffect, useContext, useRef } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { translateDynamicContent } from '../services/translationService';

// Basic in-memory cache to prevent duplicate fetches during the same session for the same data
const translationCache = new Map();

/**
 * Custom hook to dynamically translate content based on current language.
 * @param {Array|Object|String} data - Data to translate.
 * @param {Array<String>} fieldsToTranslate - Fields to translate. Defaults to ['title', 'description', 'content', 'summary'].
 * @param {String} cacheKey - Optional unique identifier for this dataset to leverage caching.
 * @returns {Object} { translatedData, isTranslating }
 */
export const useDynamicTranslation = (data, fieldsToTranslate = ['title', 'description', 'content', 'summary'], cacheKey = null) => {
  const { currentLanguage } = useContext(LanguageContext);
  const [translatedData, setTranslatedData] = useState(data);
  const [isTranslating, setIsTranslating] = useState(false);
  const previousDataRef = useRef(null);

  useEffect(() => {
    // Optimization: Avoid re-translating if data and language are unchanged
    if (
      (!data || (Array.isArray(data) && data.length === 0)) ||
      (currentLanguage === 'en' && data)
    ) {
      setTranslatedData(data);
      setIsTranslating(false);
      previousDataRef.current = data;
      return;
    }

    let isMounted = true;

    const performTranslation = async () => {
      setIsTranslating(true);
      
      const fullCacheKey = cacheKey ? `${cacheKey}_${currentLanguage}` : null;
      if (fullCacheKey && translationCache.has(fullCacheKey)) {
        if (isMounted) {
          setTranslatedData(translationCache.get(fullCacheKey));
          setIsTranslating(false);
        }
        return;
      }

      const result = await translateDynamicContent(data, fieldsToTranslate, currentLanguage);
      
      if (isMounted) {
        if (fullCacheKey) {
          translationCache.set(fullCacheKey, result);
        }
        setTranslatedData(result);
        setIsTranslating(false);
        previousDataRef.current = data;
      }
    };

    performTranslation();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage, data, cacheKey]); // Re-run if language or raw data changes

  return { translatedData, isTranslating };
};
