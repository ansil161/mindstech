import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext.jsx';
import { useRegion } from '../../context/RegionContext.jsx';
import { getLanguage, suggestLanguageForRegion } from '../../constants/languages.js';

/**
 * Asks before following a region change with a language change.
 *
 * Previously the region switcher called changeLanguage() inline, so choosing
 * "Middle East" flipped the entire site to Arabic without asking — and the only
 * undo was to find the (now Arabic) region menu again. Region and language are
 * independent choices now: this dialog offers the region's language, and
 * declining keeps whatever the visitor is already reading.
 *
 * It only fires on a *change* made during this session. The region restored
 * from localStorage on mount is seeded into `prevRegionRef`, so a returning
 * visitor is never greeted by a modal about a choice they made last week.
 */
const RegionLanguagePrompt = () => {
  const { t } = useTranslation();
  const { region } = useRegion();
  const { currentLanguage, changeLanguage, isLoading } = useContext(LanguageContext);

  const prevRegionRef = useRef(region);
  const [pending, setPending] = useState(null);
  const dialogRef = useRef(null);
  const declineRef = useRef(null);

  useEffect(() => {
    if (prevRegionRef.current === region) return;
    prevRegionRef.current = region;

    const suggested = suggestLanguageForRegion(region, currentLanguage);
    if (suggested) setPending({ region, language: suggested });
  }, [region, currentLanguage]);

  // Esc closes as "keep current language" — the safe, non-destructive answer.
  useEffect(() => {
    if (!pending) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setPending(null);
    };
    document.addEventListener('keydown', onKeyDown);
    // Focus the decline button rather than the accept one: the dialog is
    // interrupting the visitor, so the default action should be the one that
    // changes nothing.
    declineRef.current?.focus();
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [pending]);

  if (!pending) return null;

  const target = getLanguage(pending.language);
  const current = getLanguage(currentLanguage);
  const regionLabel = t(
    `navbar.regions.${pending.region.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`,
    pending.region,
  );

  const accept = async () => {
    await changeLanguage(pending.language);
    setPending(null);
  };

  return (
    <div className="lang-prompt-overlay" role="presentation" onClick={() => setPending(null)}>
      <div
        className="lang-prompt"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="langPromptTitle"
        aria-describedby="langPromptBody"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="label label--red">{t('language.prompt.label', 'Region changed')}</span>
        <h2 id="langPromptTitle">
          {t('language.prompt.title', 'You are now browsing {{region}}', { region: regionLabel })}
        </h2>
        <p id="langPromptBody">
          {t(
            'language.prompt.body',
            'This region normally reads in {{language}}. Would you like to switch the site language, or keep {{current}}?',
            { language: target.native, current: current.native },
          )}
        </p>
        <div className="lang-prompt-actions">
          <button type="button" className="lang-prompt-accept" onClick={accept} disabled={isLoading}>
            {isLoading
              ? t('language.prompt.switching', 'Switching…')
              : t('language.prompt.accept', 'Switch to {{language}}', { language: target.native })}
          </button>
          <button
            type="button"
            className="lang-prompt-decline"
            ref={declineRef}
            onClick={() => setPending(null)}
          >
            {t('language.prompt.decline', 'Keep {{current}}', { current: current.native })}
          </button>
        </div>
        <small className="lang-prompt-note">
          {t('language.prompt.note', 'You can change the language any time from the menu.')}
        </small>
      </div>
    </div>
  );
};

export default RegionLanguagePrompt;
