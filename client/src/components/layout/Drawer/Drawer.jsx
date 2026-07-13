import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Drawer = ({ drawerOpen, setDrawerOpen }) => {
  const { t } = useTranslation();

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
      <NavLink to="/experience" className="drawer-sub" onClick={() => setDrawerOpen(false)}>{t('navbar.experience', 'Experience Centre')}</NavLink>
      <NavLink to="/ewaste" className="drawer-sub" onClick={() => setDrawerOpen(false)}>{t('navbar.ewaste', 'E-Waste Management')}</NavLink>
      <NavLink to="/contact" onClick={() => setDrawerOpen(false)}>{t('footer.contact', 'Contact')}</NavLink>
      <div className="drawer-meta">
        <span className="label">{t('home.hero.fact2_b', 'India · Africa · Poland')}</span>
      </div>
    </div>
  );
};

export default Drawer;
