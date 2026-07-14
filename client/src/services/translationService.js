import apiClient from '../api/axios';

/**
 * Calls the backend Django API to dynamically translate content via Google Translate.
 * @param {Array|Object|String} data - The content to translate.
 * @param {Array<String>} fields - Keys inside the object(s) to translate (e.g., ['title', 'description']).
 * @param {String} targetLang - The target language code (e.g., 'fr', 'ar').
 * @returns {Promise<any>} - The translated data.
 */
export const translateDynamicContent = async (data, fields, targetLang) => {
  if (targetLang === 'en' || !data) return data;

  try {
    const response = await apiClient.post('/translate/', {
      data,
      fields,
      target_lang: targetLang,
    });
    console.log('[i18n] translate response:', response.data);
    if (!response.data?.translated_data) {
      console.warn('[i18n] No translated_data in response, using original');
      return data;
    }
    return response.data.translated_data;
  } catch (error) {
    console.error('[i18n] Dynamic translation failed — full error:', error);
    // Graceful fallback: return original data on failure
    return data;
  }
};
