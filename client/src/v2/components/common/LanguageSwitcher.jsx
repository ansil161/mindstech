import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext.jsx';
import { LANGUAGES, getLanguage } from '../../constants/languages.js';

/**
 * Explicit language picker for the navbar.
 *
 * Shares `activeDropdown`/`setActiveDropdown` with the region menu so the two
 * can never be open at once, and so the Navbar's existing click-outside and
 * route-change handlers close this too — it deliberately owns no open state.
 */
const LanguageSwitcher = ({ activeDropdown, setActiveDropdown, onMouseEnter, onMouseLeave }) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isLoading } = useContext(LanguageContext);
  const active = getLanguage(currentLanguage);
  const open = activeDropdown === 'language';

  return (
    <li
      className={`nav-item nav-lang-item ${open ? 'open' : ''}`}
      style={{ listStyle: 'none' }}
      onMouseEnter={() => onMouseEnter?.('language')}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        className="nav-lang"
        aria-label={t('language.change_aria', 'Change language, current language {{language}}', {
          language: active.label,
        })}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setActiveDropdown((prev) => (prev === 'language' ? null : 'language'));
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M3 5h12M9 3v2c0 5-2.5 8-6 10M6 10c0 3 2.5 5.5 7 6.5" />
          <path d="M13 20l4.5-10 4.5 10M15 17h5" />
        </svg>
        <span>{active.short}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-lang-caret" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div className={`sub ${open ? 'open' : ''}`} style={{ right: 0, left: 'auto', minWidth: '176px' }}>
        <span className="sub-heading">{t('language.select', 'Select language')}</span>
        {LANGUAGES.map((lng) => (
          <a
            key={lng.code}
            href="#"
            className={lng.code === active.code ? 'sub-active' : ''}
            aria-current={lng.code === active.code ? 'true' : undefined}
            onClick={(e) => {
              e.preventDefault();
              setActiveDropdown(null);
              if (lng.code !== active.code && !isLoading) changeLanguage(lng.code);
            }}
          >
            <span className="sub-lang-native">{lng.native}</span>
            <span className="sub-lang-code">{lng.short}</span>
          </a>
        ))}
      </div>
    </li>
  );
};

export default LanguageSwitcher;
