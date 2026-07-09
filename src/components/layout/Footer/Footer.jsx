import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const Footer = () => {
  const location = useLocation();

  useEffect(() => {
    // Ported footer mark animation scroll trigger
    const trigger = ScrollTrigger.create({
      trigger: 'footer',
      start: 'top 90%',
      end: 'bottom bottom',
      scrub: true,
      animation: gsap.fromTo('.foot-mark', { yPercent: 30, opacity: 0.4 }, { yPercent: 0, opacity: 1, ease: 'none' })
    });

    return () => {
      trigger.kill();
    };
  }, []);

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

  return (
    <footer>
      <div className="foot-grid">
        <div className="foot-brand">
          <Link to="/" className="logo" aria-label="Mindstec home">
            <img src="/mindstec-logo-web.png" alt="Mindstec — Technology of the Future, Today" />
          </Link>
          <p>Mindstec Distribution bridges the gap between the manufacturer and the dealer, increasing the efficiency of overall operations.</p>
          <div className="foot-social" style={{ marginTop: '20px' }}>
            <a href="https://www.linkedin.com/company/mindstec/" target="_blank" rel="noopener noreferrer" aria-label="Mindstec on LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>
            </a>
            <a href="https://www.instagram.com/mindstec.distribution/" target="_blank" rel="noopener noreferrer" aria-label="Mindstec on Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://www.youtube.com/channel/UCrmKbX0DP9TZBP2zJ5PHiXA" target="_blank" rel="noopener noreferrer" aria-label="Mindstec on YouTube">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2.7 8.1c.2-1.6 1.4-2.7 3-2.8C7.7 5.1 10 5 12 5s4.3.1 6.3.3c1.6.1 2.8 1.2 3 2.8.1 1.2.2 2.6.2 3.9s-.1 2.7-.2 3.9c-.2 1.6-1.4 2.7-3 2.8-2 .2-4.3.3-6.3.3s-4.3-.1-6.3-.3c-1.6-.1-2.8-1.2-3-2.8-.1-1.2-.2-2.6-.2-3.9s.1-2.7.2-3.9z"/><path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none"/></svg>
            </a>
          </div>
        </div>
        <div className="foot-col">
          <h5>Solutions</h5>
          <Link to="/solutions/digital-signage">Digital Signage</Link>
          <Link to="/solutions/control-rooms">Control Rooms</Link>
          <Link to="/solutions/conferencing">Conferencing</Link>
          <Link to="/solutions/hospitality">Hospitality AV</Link>
          <Link to="/solutions/broadcast">Broadcast</Link>
          <Link to="/solutions/live-events">Live Events</Link>
        </div>
        <div className="foot-col">
          <h5>Company</h5>
          <Link to="/about">About Us</Link>
          <Link to="/partners">Partners</Link>
          <Link to="/experience">Experience Centre</Link>
          <Link to="/ewaste">E-Waste Management</Link>
          <Link to="/#work" onClick={handleInstallationsClick}>Installations</Link>
          <Link to="/blogs">Blogs</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
        <div className="foot-col">
          <h5>Bangalore HQ</h5>
          <address>No. 5M-645, Banaswadi Village,<br />OMBR Layout, Bangalore 560043, India</address>
          <a href="tel:+918045256922" style={{ marginTop: '10px' }}>+91 80 4525 6922</a>
          <a href="mailto:india@mindstec.com">india@mindstec.com</a>
        </div>
      </div>
      <div className="foot-mark" aria-hidden="true">MINDSTEC<i>.</i></div>
      <div className="foot-bottom">
        <p>© 2026 Mindstec Distribution. All rights reserved.</p>
        <div className="legal">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Disclaimer</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
