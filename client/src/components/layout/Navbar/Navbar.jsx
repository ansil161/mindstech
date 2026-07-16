import React, { useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { LanguageContext } from '../../../context/LanguageContext.jsx';
import { useRegion } from '../../../context/RegionContext.jsx';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../common/Button/Button.jsx';

const Navbar = ({ drawerOpen, setDrawerOpen }) => {
  const navRef = useRef(null);
  const location = useLocation();
  const { t } = useTranslation();
  const { changeLanguage } = useContext(LanguageContext);
  const { region, setRegion, isPageEnabled } = useRegion();

  const regionLanguageMap = {
    'India': 'en',
    'Middle East': 'ar',
    'Africa': 'fr',
    'South Asia': 'en',
    'Hong Kong / China': 'zh'
  };

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

  // Handle installations link navigation vs section scroll on Home page
  const handleInstallationsClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const target = document.querySelector('#work');
      if (target) {
        if (window.lenis) {
          window.lenis.scrollTo(target, { offset: -70 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const isSolutionsActive = location.pathname.startsWith('/solutions');
  const isAboutActive = location.pathname === '/about' || location.pathname === '/partners';

  // Resources dropdown is active if the current path is any resource page
  const isResourcesActive =
    location.pathname === '/blogs' ||
    location.pathname === '/experience' ||
    (isPageEnabled('ewaste') && location.pathname === '/ewaste');

  // Only E-Waste is region-gated — null while loading (hidden until confirmed)
  const showEwaste = isPageEnabled('ewaste') === true;

  return (
    <header ref={navRef} className="nav" id="nav">
      <Link to="/" className="logo" aria-label="Mindstec home">
        <img src="/mindstec-logo-web.png" alt="Mindstec — Technology of the Future, Today" />
      </Link>
      <nav aria-label="Primary">
        <ul className="nav-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>{t('navbar.home')}</NavLink>
          </li>
          <li className="nav-item">
            <Link to="/about" className={isAboutActive ? 'active' : ''}>
              {t('navbar.about')}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Link>
            <div className="sub">
              <NavLink to="/about" end className={({ isActive }) => isActive ? 'sub-active' : ''}>{t('navbar.about_us')}</NavLink>
              <NavLink to="/partners" className={({ isActive }) => isActive ? 'sub-active' : ''}>{t('navbar.partners')}</NavLink>
            </div>
          </li>
          <li className="nav-item">
            <Link to="/solutions" className={isSolutionsActive ? 'active' : ''}>
              {t('navbar.solutions')}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Link>
            <div className="sub">
              <NavLink to="/solutions/digital-signage" className={({ isActive }) => isActive ? 'sub-active' : ''}>{t('solutions.arr.0.name')}</NavLink>
              <NavLink to="/solutions/control-rooms" className={({ isActive }) => isActive ? 'sub-active' : ''}>{t('solutions.arr.1.name')}</NavLink>
              <NavLink to="/solutions/conferencing" className={({ isActive }) => isActive ? 'sub-active' : ''}>{t('solutions.arr.2.name')}</NavLink>
              <NavLink to="/solutions/hospitality" className={({ isActive }) => isActive ? 'sub-active' : ''}>{t('solutions.arr.3.name')}</NavLink>
              <NavLink to="/solutions/broadcast" className={({ isActive }) => isActive ? 'sub-active' : ''}>{t('solutions.arr.4.name')}</NavLink>
              <NavLink to="/solutions/live-events" className={({ isActive }) => isActive ? 'sub-active' : ''}>{t('solutions.arr.5.name')}</NavLink>
            </div>
          </li>
          <li className="nav-item">
            <Link to="/blogs" className={isResourcesActive ? 'active' : ''}>
              {t('navbar.resources')}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Link>
            <div className="sub">
              <NavLink to="/blogs" className={({ isActive }) => isActive ? 'sub-active' : ''}>{t('navbar.blogs')}</NavLink>
              {showEwaste && (
                <NavLink to="/ewaste" className={({ isActive }) => isActive ? 'sub-active' : ''}>
                  {t('navbar.ewaste', 'E-Waste Management')}
                </NavLink>
              )}
              <NavLink to="/experience" className={({ isActive }) => isActive ? 'sub-active' : ''}>
                {t('navbar.experience', 'Experience Centre')}
              </NavLink>
            </div>
          </li>
          <li>
            <Link to="/#work" onClick={handleInstallationsClick}>{t('navbar.installations')}</Link>
          </li>
        </ul>
      </nav>
      <div className="nav-cta">
        <div className="nav-item">
          <button className="nav-region" id="regionBtn" aria-label={`Change region, current region ${region}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 2.6 3.9 5.7 3.9 9S14.5 18.4 12 21c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3z" />
            </svg>
            <span id="regionLabel">{t(`navbar.regions.${region.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`, region)}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', transition: 'transform .3s' }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div className="sub" style={{ right: 0, left: 'auto' }}>
            {['India', 'Middle East', 'Africa', 'South Asia', 'Hong Kong / China'].map((r) => {
              const regKey = `navbar.regions.${r.toLowerCase().replace(/ \/ /g, '_').replace(/ /g, '_')}`;
              return (
                <a
                  key={r}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setRegion(r);
                    changeLanguage(regionLanguageMap[r] || 'en');
                  }}
                  className={region === r ? 'sub-active' : ''}
                >
                  {t(regKey, r)}
                </a>
              );
            })}
          </div>
        </div>
        <Button solid to="/contact">
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
    </header>
  );
};

export default Navbar;
