import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../../../context/RegionContext.jsx';
import { LanguageContext } from '../../../context/LanguageContext.jsx';
import { LANGUAGES, getLanguage } from '../../../constants/languages.js';

/**
 * Mobile navigation.
 *
 * Mirrors the desktop groups (Company / Solutions / Projects / Resources)
 * instead of the previous flat run of ten links, so the same mental model
 * survives the breakpoint. Region and language are separate controls here too:
 * picking a region no longer silently re-translates the site.
 */
const Drawer = ({ drawerOpen, setDrawerOpen }) => {
  const { t } = useTranslation();
  const { region, setRegion, isPageEnabled, allRegions } = useRegion();
  const { currentLanguage, changeLanguage, isLoading } = useContext(LanguageContext);

  const activeLanguage = getLanguage(currentLanguage);
  const showEwaste = isPageEnabled('ewaste') === true;
  const close = () => setDrawerOpen(false);

  const regionLabel = (name) =>
    t(`navbar.regions.${name.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`, name);

  const regionButton = (name, isSub = false) => (
    <button
      key={name}
      type="button"
      className={`drawer-chip ${region === name ? 'is-active' : ''} ${isSub ? 'drawer-chip--sub' : ''}`}
      onClick={() => {
        setRegion(name);
        close();
      }}
    >
      {isSub ? `- ${regionLabel(name)}` : regionLabel(name)}
    </button>
  );

  return (
    <div
      className={`drawer ${drawerOpen ? 'open' : ''}`}
      id="drawer"
      aria-hidden={!drawerOpen}
    >
      <NavLink to="/" end onClick={close}>{t('navbar.home')}</NavLink>

      <span className="drawer-group">{t('navbar.company', 'Company')}</span>
      <NavLink to="/about" className="drawer-sub" onClick={close}>{t('navbar.about_us')}</NavLink>
      <NavLink to="/partners" className="drawer-sub" onClick={close}>{t('navbar.partners')}</NavLink>
      <NavLink to="/experience" className="drawer-sub" onClick={close}>
        {t('navbar.experience', 'Experience Centre')}
      </NavLink>

      <NavLink to="/solutions" onClick={close}>{t('navbar.solutions')}</NavLink>
      <NavLink to="/products" onClick={close}>{t('navbar.products', 'Products')}</NavLink>
      <NavLink to="/projects" onClick={close}>{t('navbar.projects', 'Projects')}</NavLink>

      <span className="drawer-group">{t('navbar.resources')}</span>
      <NavLink to="/blogs" className="drawer-sub" onClick={close}>{t('navbar.blogs')}</NavLink>
      <NavLink to="/gallery" className="drawer-sub" onClick={close}>
        {t('navbar.gallery', 'Gallery')}
      </NavLink>
      <NavLink to="/events" className="drawer-sub" onClick={close}>
        {t('navbar.events', 'Events & News')}
      </NavLink>
      {showEwaste && (
        <NavLink to="/ewaste" className="drawer-sub" onClick={close}>
          {t('navbar.ewaste', 'E-Waste Management')}
        </NavLink>
      )}

      <NavLink to="/contact" onClick={close}>{t('footer.contact', 'Contact Us')}</NavLink>

      {/* The navbar's "Talk to us" pill is hidden below 640px, so on a phone the
          drawer is the only place the primary CTA can live. */}
      <NavLink to="/contact" className="drawer-cta" onClick={close}>
        {t('navbar.talk_to_us')}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M7 17L17 7M9 7h8v8" />
        </svg>
      </NavLink>

      {/* Region switcher — changes region only. */}
      <div className="drawer-picker">
        <span className="drawer-picker-label">
          {t('navbar.select_region', 'Select region')}
          <strong>{regionLabel(region)}</strong>
        </span>
        <div className="drawer-chips">
          {allRegions && allRegions.length > 0
            ? allRegions.map((r) => (
                <React.Fragment key={r.name}>
                  {regionButton(r.name)}
                  {r.sub_regions && r.sub_regions.map((sub) => regionButton(sub.name, true))}
                </React.Fragment>
              ))
            : ['Global', 'India', 'Middle East', 'Africa', 'South Asia', 'Hong Kong / China'].map((r) =>
                regionButton(r),
              )}
        </div>
      </div>

      {/* Language switcher — independent of region. */}
      <div className="drawer-picker">
        <span className="drawer-picker-label">
          {t('language.select', 'Select language')}
          <strong>{activeLanguage.native}</strong>
        </span>
        <div className="drawer-chips drawer-chips--row">
          {LANGUAGES.map((lng) => (
            <button
              key={lng.code}
              type="button"
              className={`drawer-chip ${lng.code === activeLanguage.code ? 'is-active' : ''}`}
              disabled={isLoading}
              onClick={() => {
                if (lng.code !== activeLanguage.code) changeLanguage(lng.code);
                close();
              }}
            >
              {lng.native}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
