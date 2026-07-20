import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../../../context/RegionContext.jsx';
import { LanguageContext } from '../../../context/LanguageContext.jsx';

const Drawer = ({ drawerOpen, setDrawerOpen }) => {
  const { t } = useTranslation();
  const { region, setRegion, isPageEnabled, allRegions } = useRegion();
  const { changeLanguage } = useContext(LanguageContext);

  const regionLanguageMap = {
    'India': 'en',
    'Middle East': 'ar',
    'Africa': 'fr',
    'South Asia': 'en',
    'Hong Kong / China': 'zh'
  };

  // Only E-Waste is region-gated
  const showEwaste = isPageEnabled('ewaste') === true;

  return (
    <div
      className={`drawer ${drawerOpen ? 'open' : ''}`}
      id="drawer"
      aria-hidden={!drawerOpen}
    >
      <NavLink to="/" onClick={() => setDrawerOpen(false)}>{t('navbar.home')}</NavLink>
      <NavLink to="/about" onClick={() => setDrawerOpen(false)}>{t('navbar.about_us')}</NavLink>
      <NavLink to="/partners" className="drawer-sub" onClick={() => setDrawerOpen(false)}>{t('navbar.partners')}</NavLink>
      <NavLink to="/solutions" onClick={() => setDrawerOpen(false)}>{t('navbar.solutions')}</NavLink>
      <NavLink to="/blogs" onClick={() => setDrawerOpen(false)}>{t('navbar.blogs')}</NavLink>
      <NavLink to="/experience" className="drawer-sub" onClick={() => setDrawerOpen(false)}>
        {t('navbar.experience', 'Experience Centre')}
      </NavLink>
      {showEwaste && (
        <NavLink to="/ewaste" className="drawer-sub" onClick={() => setDrawerOpen(false)}>
          {t('navbar.ewaste', 'E-Waste Management')}
        </NavLink>
      )}
      <NavLink to="/gallery" className="drawer-sub" onClick={() => setDrawerOpen(false)}>
        {t('navbar.gallery', 'Gallery')}
      </NavLink>
      <NavLink to="/events" className="drawer-sub" onClick={() => setDrawerOpen(false)}>
        {t('navbar.events', 'Events & News')}
      </NavLink>
      <NavLink to="/contact" onClick={() => setDrawerOpen(false)}>{t('footer.contact', 'Contact')}</NavLink>

      {/* Region Switcher inside Mobile Drawer */}
      <div className="drawer-region-section" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <span className="label" style={{ display: 'block', marginBottom: '10px', fontSize: '0.85em', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px' }}>
          {t('navbar.select_region', 'Region:')} <strong style={{ color: '#fff' }}>{region}</strong>
        </span>
        <div className="drawer-region-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {allRegions && allRegions.length > 0 ? (
            allRegions.map((r) => (
              <React.Fragment key={r.name}>
                <button
                  type="button"
                  onClick={() => {
                    setRegion(r.name);
                    changeLanguage(regionLanguageMap[r.name] || 'en');
                    setDrawerOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: region === r.name ? '#e63946' : 'rgba(255,255,255,0.85)',
                    fontWeight: region === r.name ? 'bold' : 'normal',
                    textAlign: 'left',
                    padding: '4px 0',
                    fontSize: '0.95em',
                    cursor: 'pointer'
                  }}
                >
                  {t(`navbar.regions.${r.name.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`, r.name)}
                </button>
                {r.sub_regions && r.sub_regions.map(sub => (
                  <button
                    key={sub.name}
                    type="button"
                    onClick={() => {
                      setRegion(sub.name);
                      changeLanguage(regionLanguageMap[sub.name] || 'en');
                      setDrawerOpen(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: region === sub.name ? '#e63946' : 'rgba(255,255,255,0.7)',
                      fontWeight: region === sub.name ? 'bold' : 'normal',
                      textAlign: 'left',
                      padding: '4px 0 4px 16px',
                      fontSize: '0.9em',
                      cursor: 'pointer'
                    }}
                  >
                    - {t(`navbar.regions.${sub.name.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`, sub.name)}
                  </button>
                ))}
              </React.Fragment>
            ))
          ) : (
            ['India', 'Middle East', 'Africa', 'South Asia', 'Hong Kong / China'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRegion(r);
                  changeLanguage(regionLanguageMap[r] || 'en');
                  setDrawerOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: region === r ? '#e63946' : 'rgba(255,255,255,0.85)',
                  fontWeight: region === r ? 'bold' : 'normal',
                  textAlign: 'left',
                  padding: '4px 0',
                  fontSize: '0.95em',
                  cursor: 'pointer'
                }}
              >
                {t(`navbar.regions.${r.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`, r)}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
