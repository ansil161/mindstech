import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Navbar from './Navbar/Navbar.jsx';
import Drawer from './Drawer/Drawer.jsx';
import Footer from './Footer/Footer.jsx';
import ChatWidget from '../chat/ChatWidget.jsx';

gsap.registerPlugin(ScrollTrigger);

const Layout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [region, setRegion] = useState('India');
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setDrawerOpen(false);
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }
  }, [location.pathname]);

  // Handle Preloader exit animation
  useEffect(() => {
    const pre = document.getElementById('preloader');
    if (pre) {
      const barTween = gsap.to('.pre-bar i', { scaleX: 0.7, duration: 1.4, ease: 'power1.out' });
      
      const handleExit = () => {
        barTween.kill();
        gsap.timeline()
          .to('.pre-bar i', { scaleX: 1, duration: 0.4, ease: 'power2.inOut' })
          .to(pre, { yPercent: -100, duration: 0.7, ease: 'power4.inOut' }, '+=0.15')
          .add(() => {
            pre.remove();
            window.dispatchEvent(new Event('preloaderExited'));
          });
      };

      if (document.readyState === 'complete') {
        handleExit();
      } else {
        window.addEventListener('load', handleExit);
        const timeoutId = setTimeout(handleExit, 3500);
        return () => {
          window.removeEventListener('load', handleExit);
          clearTimeout(timeoutId);
        };
      }
    } else {
      window.dispatchEvent(new Event('preloaderExited'));
    }
  }, []);

  // Handle Lenis smooth scrolling setup and sync with ScrollTrigger/GSAP
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenis.on('scroll', ScrollTrigger.update);

    const updatePhysics = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updatePhysics);
    gsap.ticker.lagSmoothing(0);

    window.lenis = lenis;

    return () => {
      lenis.destroy();
      gsap.ticker.remove(updatePhysics);
      window.lenis = null;
    };
  }, []);

  // Sync drawer state with Lenis scrolling
  useEffect(() => {
    if (window.lenis) {
      if (drawerOpen) {
        window.lenis.stop();
      } else {
        window.lenis.start();
      }
    }
  }, [drawerOpen]);

  const cycleRegion = () => {
    const regions = ['India', 'Africa', 'Poland'];
    setRegion((prev) => {
      const idx = regions.indexOf(prev);
      return regions[(idx + 1) % regions.length];
    });
  };

  return (
    <div className="min-h-screen bg-ink text-white font-body selection:bg-red selection:text-white antialiased">
      {/* Dynamic site layout header nav */}
      <Navbar 
        drawerOpen={drawerOpen} 
        setDrawerOpen={setDrawerOpen} 
        region={region} 
        cycleRegion={cycleRegion} 
      />

      {/* Mobile Drawer */}
      <Drawer 
        drawerOpen={drawerOpen} 
        setDrawerOpen={setDrawerOpen} 
      />

      {/* Main page content area */}
      <main id="top">
        {children}
      </main>

      {/* Footer component */}
      <Footer />

      {/* Floating chatbot assistant */}
      <ChatWidget />
    </div>
  );
};

export default Layout;
