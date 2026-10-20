import React, { createContext, useState, useEffect } from 'react';
import i18n, { loadLanguage } from '../i18n/index.js';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLanguage(lng);
      localStorage.setItem('i18nextLng', lng);
      
      // Update HTML lang attribute
      document.documentElement.lang = lng;
      // Keep page layout strictly LTR across all languages (including Arabic)
      document.documentElement.dir = 'ltr';
    };

    // Ensure document direction stays LTR on initial load
    document.documentElement.dir = 'ltr';

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  const changeLanguage = async (lng) => {
    setIsLoading(true);
    try {
      // Locale bundles are separate chunks (see i18n/index.js). Fetch first, so
      // the switch is atomic — otherwise the UI flashes English for a moment.
      // `isLoading` is already exposed for callers that want to show a spinner.
      await loadLanguage(lng);
      await i18n.changeLanguage(lng);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};
