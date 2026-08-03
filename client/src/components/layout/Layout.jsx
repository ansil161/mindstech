import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Navbar from './Navbar/Navbar.jsx';
import Drawer from './Drawer/Drawer.jsx';
import Footer from './Footer/Footer.jsx';
import RouteTransition from './RouteTransition.jsx';
import ChatWidget from '../chat/ChatWidget.jsx';
import RegionLanguagePrompt from '../common/RegionLanguagePrompt.jsx';

gsap.registerPlugin(ScrollTrigger);

const Layout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const hasExitedRef = useRef(false);

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
    if (!pre) {
      window.__preloaderExited = true;
      window.dispatchEvent(new Event('preloaderExited'));
      return undefined;
    }

    const bar = pre.querySelector('.pre-bar i');
    const startTime = performance.now();

    // Animate progress bar to 80% initially to show progress is happening
    const barTween = bar ? gsap.to(bar, { scaleX: 0.8, duration: 1.2, ease: 'power1.out' }) : null;
    let exitTimeline = null;

    const animateExit = () => {
      // Guard against React Strict Mode's dev-only double-invoke scheduling
      // this twice, and against #preloader already having been removed.
      if (hasExitedRef.current || !pre.isConnected) return;
      hasExitedRef.current = true;

      barTween?.kill();

      exitTimeline = gsap.timeline();
      if (bar) {
        // Snappily fill the bar to 100%
        exitTimeline.to(bar, { scaleX: 1, duration: 0.2, ease: 'power2.inOut' });
      }
      // Smoothly fade out the loader overlay while launching home page entrance animations
      exitTimeline.to(pre, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
        onStart: () => {
          window.__preloaderExited = true;
          window.dispatchEvent(new Event('preloaderExited'));
        },
        onComplete: () => {
          pre.remove();
        }
      }, bar ? '+=0.05' : 0);
    };

    const handleExit = () => {
      const elapsedTime = performance.now() - startTime;
      const minDuration = 800; // 800ms minimum display threshold to avoid quick flashing

      if (elapsedTime < minDuration) {
        const remainingTime = minDuration - elapsedTime;
        timeoutId = setTimeout(animateExit, remainingTime);
      } else {
        animateExit();
      }
    };

    let timeoutId = null;
    let loadListenerAttached = false;

    if (document.readyState === 'complete') {
      handleExit();
    } else {
      window.addEventListener('load', handleExit);
      loadListenerAttached = true;
      timeoutId = setTimeout(handleExit, 3000); // 3-second fallback
    }

    return () => {
      if (loadListenerAttached) window.removeEventListener('load', handleExit);
      if (timeoutId) clearTimeout(timeoutId);
      barTween?.kill();
      exitTimeline?.kill();
    };
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

  // Route in-page anchor jumps through Lenis.
  //
  // `href="#solutions"`, `#contact`, `#team` and `#film` were plain anchors, so
  // the browser teleported to them instantly — a hard cut in the middle of an
  // otherwise smoothly-scrolled site, and the one place the smoothing visibly
  // wasn't applied. Delegated from the document so it covers <Button href> and
  // any raw <a> alike, rather than being reimplemented per call site.
  useEffect(() => {
    const onClick = (event) => {
      // Let modified clicks (new tab, download, etc.) behave natively.
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

      const anchor = event.target.closest?.('a[href^="#"]');
      if (!anchor) return;

      const hash = anchor.getAttribute('href');
      // `href="#"` is used as a placeholder for the not-yet-built legal pages;
      // hijacking those would scroll to the top on every click.
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();

      // Clear the fixed navbar so the target isn't parked underneath it.
      const options = { offset: -90, immediate: window.matchMedia('(prefers-reduced-motion: reduce)').matches };

      if (window.lenis) window.lenis.scrollTo(target, options);
      else target.scrollIntoView({ behavior: options.immediate ? 'auto' : 'smooth' });
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
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



  return (
    <div className="min-h-screen bg-ink text-white font-body selection:bg-red selection:text-white antialiased">
      {/* Dynamic site layout header nav */}
      <Navbar
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      {/* Mobile Drawer */}
      <Drawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />

      {/* Main page content area — deliberately unconstrained. The 1440px
          content column lives entirely in CSS now (see the "CONTENT
          CONTAINER" rules at the end of index.css): every section that
          needs it caps itself individually via max-width:1440px, and
          full-bleed sections (.hero, .band, .next-sol, .xhero) simply don't,
          so they're edge-to-edge as plain children of this unconstrained
          <main>. <body> already carries an unconditional overflow-x: hidden,
          which is what guards against a page-level horizontal scrollbar. */}
      <main id="top">
        <RouteTransition>{children}</RouteTransition>
      </main>

      {/* Footer component */}
      <Footer />

      {/* Floating chatbot assistant */}
      <ChatWidget />

      {/* Asks (never assumes) when a region change implies a language change. */}
      <RegionLanguagePrompt />
    </div>
  );
};

export default Layout;
