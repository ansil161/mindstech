import React, { useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../common/Button/Button.jsx';

const Navbar = ({ drawerOpen, setDrawerOpen, region, cycleRegion }) => {
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let lastY = 0;
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        const y = self.scroll();
        nav.classList.toggle('is-solid', y > 40);
        if (!drawerOpen) {
          nav.classList.toggle('is-hidden', y > 500 && y > lastY + 4);
        }
        if (Math.abs(y - lastY) > 4) lastY = y;
      },
    });

    return () => {
      trigger.kill();
    };
  }, [drawerOpen]);

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
  const isResourcesActive = location.pathname === '/blogs' || location.pathname === '/ewaste' || location.pathname === '/experience';

  return (
    <header ref={navRef} className="nav" id="nav">
      <Link to="/" className="logo" aria-label="Mindstec home">
        <img src="/mindstec-logo-web.png" alt="Mindstec — Technology of the Future, Today" />
      </Link>
      <nav aria-label="Primary">
        <ul className="nav-links">
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
          </li>
          <li className="nav-item">
            <Link to="/about" className={isAboutActive ? 'active' : ''}>
              About
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Link>
            <div className="sub">
              <NavLink to="/about" end className={({ isActive }) => isActive ? 'sub-active' : ''}>About Us</NavLink>
              <NavLink to="/partners" className={({ isActive }) => isActive ? 'sub-active' : ''}>Partners</NavLink>
            </div>
          </li>
          <li className="nav-item">
            <Link to="/solutions" className={isSolutionsActive ? 'active' : ''}>
              Solutions
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Link>
            <div className="sub">
              <NavLink to="/solutions/digital-signage" className={({ isActive }) => isActive ? 'sub-active' : ''}>Digital Signage</NavLink>
              <NavLink to="/solutions/control-rooms" className={({ isActive }) => isActive ? 'sub-active' : ''}>Control Rooms</NavLink>
              <NavLink to="/solutions/conferencing" className={({ isActive }) => isActive ? 'sub-active' : ''}>Conferencing &amp; Collaboration</NavLink>
              <NavLink to="/solutions/hospitality" className={({ isActive }) => isActive ? 'sub-active' : ''}>Hospitality AV</NavLink>
              <NavLink to="/solutions/broadcast" className={({ isActive }) => isActive ? 'sub-active' : ''}>Broadcast &amp; Production</NavLink>
              <NavLink to="/solutions/live-events" className={({ isActive }) => isActive ? 'sub-active' : ''}>Live Events &amp; Immersive</NavLink>
            </div>
          </li>
          <li className="nav-item">
            <Link to="/blogs" className={isResourcesActive ? 'active' : ''}>
              Resources
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Link>
            <div className="sub">
              <NavLink to="/blogs" className={({ isActive }) => isActive ? 'sub-active' : ''}>Blogs</NavLink>
              <NavLink to="/ewaste" className={({ isActive }) => isActive ? 'sub-active' : ''}>E-Waste Management</NavLink>
              <NavLink to="/experience" className={({ isActive }) => isActive ? 'sub-active' : ''}>Experience Centre</NavLink>
            </div>
          </li>
          <li>
            <Link to="/#work" onClick={handleInstallationsClick}>Installations</Link>
          </li>
        </ul>
      </nav>
      <div className="nav-cta">
        <button className="nav-region" id="regionBtn" onClick={cycleRegion} aria-label={`Change region, current region ${region}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.6 3.9 5.7 3.9 9S14.5 18.4 12 21c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3z" />
          </svg>
          <span id="regionLabel">{region}</span>
        </button>
        <Button solid to="/contact">
          <span>Talk to us</span>
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
