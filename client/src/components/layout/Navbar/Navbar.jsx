import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../../../context/RegionContext.jsx';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../common/Button/Button.jsx';
import LanguageSwitcher from '../../common/LanguageSwitcher.jsx';

/**
 * Primary navigation.
 *
 * Two deliberate changes from the previous version:
 *
 * 1. Five top-level items became four, each answering one visitor question —
 *    who are you (Company), what do you sell (Solutions), have you done it
 *    before (Projects), what can I read (Insights). The old standalone
 *    "Installations" entry was an in-page anchor to the home page's #work
 *    section that behaved differently depending on which page you were already
 *    on; /projects is a real page and supersedes it.
 *
 * 2. Choosing a region no longer changes the language. It used to call
 *    changeLanguage() right here, so switching to Middle East for pricing
 *    silently translated the whole site to Arabic. Language now has its own
 *    control (LanguageSwitcher) and RegionLanguagePrompt asks first.
 */
const Navbar = ({ drawerOpen, setDrawerOpen }) => {
  const navRef = useRef(null);
  const location = useLocation();
  const { t } = useTranslation();
  const { region, setRegion, isPageEnabled, allRegions } = useRegion();

  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        const y = self.scroll();
        nav.classList.toggle('is-solid', y > 40);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = (name) => {
    setActiveDropdown(name);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  const handleItemClick = (name, e) => {
    e.stopPropagation();
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const path = location.pathname;
  const isSolutionsActive = path.startsWith('/solutions');
  const isCompanyActive = path === '/about' || path === '/partners' || path === '/experience';
  const isProjectsActive = path.startsWith('/projects');
  const isInsightsActive =
    path === '/blogs' || path === '/gallery' || path === '/events' || path === '/ewaste';

  // Only E-Waste is region-gated — null while loading (hidden until confirmed)
  const showEwaste = isPageEnabled('ewaste') === true;

  const closeMenus = () => setActiveDropdown(null);
  const subClass = ({ isActive }) => (isActive ? 'sub-active' : '');

  return (
    <header ref={navRef} className="nav" id="nav">
      <div className="nav-inner">
        <Link to="/" className="logo" aria-label="Mindstec home" onClick={closeMenus}>
          <img src="/mindstec-logo-web.png" alt="Mindstec — Technology of the Future, Today" />
        </Link>
        <nav aria-label="Primary">
          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenus}>
                {t('navbar.home')}
              </NavLink>
            </li>
            <li
              className={`nav-item ${activeDropdown === 'company' ? 'open' : ''}`}
              onMouseEnter={() => handleMouseEnter('company')}
              onMouseLeave={handleMouseLeave}
            >
              <Link to="/about" className={isCompanyActive ? 'active' : ''} onClick={(e) => handleItemClick('company', e)}>
                {t('navbar.company', 'Company')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
              <div className={`sub ${activeDropdown === 'company' ? 'open' : ''}`}>
                <NavLink to="/about" end className={subClass} onClick={closeMenus}>{t('navbar.about_us')}</NavLink>
                <NavLink to="/partners" className={subClass} onClick={closeMenus}>{t('navbar.partners')}</NavLink>
                <NavLink to="/experience" className={subClass} onClick={closeMenus}>
                  {t('navbar.experience', 'Experience Centre')}
                </NavLink>
                <NavLink to="/contact" className={subClass} onClick={closeMenus}>
                  {t('footer.contact', 'Contact Us')}
                </NavLink>
              </div>
            </li>
            <li
              className={`nav-item ${activeDropdown === 'solutions' ? 'open' : ''}`}
              onMouseEnter={() => handleMouseEnter('solutions')}
              onMouseLeave={handleMouseLeave}
            >
              <Link to="/solutions" className={isSolutionsActive ? 'active' : ''} onClick={(e) => handleItemClick('solutions', e)}>
                {t('navbar.solutions')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
              <div className={`sub ${activeDropdown === 'solutions' ? 'open' : ''}`}>
                <NavLink
                  to="/solutions"
                  end
                  className={({ isActive }) => `sub-all${isActive ? ' sub-active' : ''}`}
                  onClick={closeMenus}
                >
                  {t('navbar.all_solutions', 'All solutions')}
                </NavLink>
                <NavLink to="/solutions/digital-signage" className={subClass} onClick={closeMenus}>{t('solutions.arr.0.name')}</NavLink>
                <NavLink to="/solutions/control-rooms" className={subClass} onClick={closeMenus}>{t('solutions.arr.1.name')}</NavLink>
                <NavLink to="/solutions/conferencing" className={subClass} onClick={closeMenus}>{t('solutions.arr.2.name')}</NavLink>
                <NavLink to="/solutions/hospitality" className={subClass} onClick={closeMenus}>{t('solutions.arr.3.name')}</NavLink>
                <NavLink to="/solutions/broadcast" className={subClass} onClick={closeMenus}>{t('solutions.arr.4.name')}</NavLink>
                <NavLink to="/solutions/live-events" className={subClass} onClick={closeMenus}>{t('solutions.arr.5.name')}</NavLink>
              </div>
            </li>
            <li>
              <NavLink to="/projects" className={isProjectsActive ? 'active' : ''} onClick={closeMenus}>
                {t('navbar.projects', 'Projects')}
              </NavLink>
            </li>
            <li
              className={`nav-item ${activeDropdown === 'insights' ? 'open' : ''}`}
              onMouseEnter={() => handleMouseEnter('insights')}
              onMouseLeave={handleMouseLeave}
            >
              <Link to="/blogs" className={isInsightsActive ? 'active' : ''} onClick={(e) => handleItemClick('insights', e)}>
                {t('navbar.resources')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Link>
              <div className={`sub ${activeDropdown === 'insights' ? 'open' : ''}`}>
                <NavLink to="/blogs" className={subClass} onClick={closeMenus}>{t('navbar.blogs')}</NavLink>
                <NavLink to="/gallery" className={subClass} onClick={closeMenus}>
                  {t('navbar.gallery', 'Gallery')}
                </NavLink>
                <NavLink to="/events" className={subClass} onClick={closeMenus}>
                  {t('navbar.events', 'Events & News')}
                </NavLink>
                {showEwaste && (
                  <NavLink to="/ewaste" className={subClass} onClick={closeMenus}>
                    {t('navbar.ewaste', 'E-Waste Management')}
                  </NavLink>
                )}
              </div>
            </li>
          </ul>
        </nav>
        <div className="nav-cta">
          <li
            className={`nav-item ${activeDropdown === 'region' ? 'open' : ''}`}
            style={{ listStyle: 'none' }}
            onMouseEnter={() => handleMouseEnter('region')}
            onMouseLeave={handleMouseLeave}
          >
            <button className="nav-region" id="regionBtn" aria-label={`Change region, current region ${region}`} onClick={(e) => handleItemClick('region', e)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.6 3.9 5.7 3.9 9S14.5 18.4 12 21c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3z" />
              </svg>
              <span id="regionLabel">{t(`navbar.regions.${region.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`, region)}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', transition: 'transform .3s' }}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className={`sub ${activeDropdown === 'region' ? 'open' : ''}`} style={{ right: 0, left: 'auto' }}>
              <span className="sub-heading">{t('navbar.select_region', 'Select region')}</span>
              {allRegions && allRegions.length > 0 ? (
                allRegions.map((r) => (
                  <React.Fragment key={r.name}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setRegion(r.name);
                        setActiveDropdown(null);
                      }}
                      className={region === r.name ? 'sub-active' : ''}
                      style={{ fontWeight: r.sub_regions?.length > 0 ? '600' : 'normal' }}
                    >
                      {t(`navbar.regions.${r.name.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`, r.name)}
                    </a>
                    {r.sub_regions && r.sub_regions.map(sub => (
                      <a
                        key={sub.name}
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setRegion(sub.name);
                          setActiveDropdown(null);
                        }}
                        className={region === sub.name ? 'sub-active' : ''}
                        style={{ paddingLeft: '24px', fontSize: '0.95em' }}
                      >
                        - {t(`navbar.regions.${sub.name.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`, sub.name)}
                      </a>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                ['Global', 'India', 'Middle East', 'Africa', 'South Asia', 'Hong Kong / China'].map((r) => {
                  const regKey = `navbar.regions.${r.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`;
                  return (
                    <a
                      key={r}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setRegion(r);
                        setActiveDropdown(null);
                      }}
                      className={region === r ? 'sub-active' : ''}
                    >
                      {t(regKey, r)}
                    </a>
                  );
                })
              )}
            </div>
          </li>
          <LanguageSwitcher
            activeDropdown={activeDropdown}
            setActiveDropdown={setActiveDropdown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
          <Button solid to="/contact" onClick={closeMenus}>
            <span>{t('navbar.talk_to_us')}</span>
          </Button>
          <button
            className="burger"
            id="burger"
            onClick={() => setDrawerOpen((prev) => !prev)}
            aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={drawerOpen ? 'true' : 'false'}
            aria-controls="drawer"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
