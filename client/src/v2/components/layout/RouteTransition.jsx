import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import gsap from 'gsap';

/**
 * Route-change loader. On every in-app navigation it drops the same logo +
 * progress-bar overlay used by the hard-refresh preloader (#preloader in
 * index.html), then dispatches `routeRevealed` when it clears. Pages gate their
 * entrance animation on that signal (see utils/pageReveal.js), so each page's
 * intro plays fresh AFTER the loader instead of hidden underneath it — and
 * nothing (e.g. the gallery laser) shows over the loader.
 *
 * The routes render via <Layout><Outlet/></Layout>, so `children` here is a
 * stable <Outlet/> that always renders the matched route; there is no page to
 * hold or swap. This component only drives the overlay and the reveal signal.
 */
export default function RouteTransition({ children }) {
  const location = useLocation();

  // Nav detection at RENDER time (top-down) so the flag is set before the
  // destination page's effects run (effects are bottom-up) — its whenReady()
  // then parks on `routeRevealed` rather than firing under the cover.
  const renderPath = useRef(location.pathname);
  if (renderPath.current !== location.pathname) {
    renderPath.current = location.pathname;
    window.__routeTransitioning = true;
  }

  const animPath = useRef(location.pathname);
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    // Skip the initial mount (and StrictMode's re-invoke of it): only real
    // navigations change the pathname away from the last animated one.
    if (animPath.current === location.pathname) return undefined;
    animPath.current = location.pathname;

    const reveal = () => {
      window.__routeTransitioning = false;
      window.dispatchEvent(new Event('routeRevealed'));
    };

    const overlay = overlayRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !overlay) {
      reveal();
      return undefined;
    }

    const logo = logoRef.current;
    const bar = barRef.current;

    gsap.killTweensOf([overlay, logo, bar]);
    // Cover synchronously so the route's scroll-to-top jump never shows.
    gsap.set(overlay, { autoAlpha: 1 });
    gsap.set(bar, { scaleX: 0 });
    overlay.style.pointerEvents = 'auto';

    const tl = gsap.timeline();
    tl.fromTo(logo, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' })
      .to(bar, { scaleX: 1, duration: 0.6, ease: 'power1.inOut' }, 0)
      .to(logo, { autoAlpha: 0, duration: 0.25, ease: 'power1.out' }, '+=0.05')
      // Reveal: fire `routeRevealed` on complete so the destination page's intro
      // starts exactly as the overlay finishes clearing.
      .to(overlay, {
        autoAlpha: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => { overlay.style.pointerEvents = 'none'; reveal(); },
      }, '<');

    return () => tl.kill();
  }, [location.pathname]);

  return (
    <>
      {children}
      {createPortal(
        <div ref={overlayRef} className="route-loader" aria-hidden="true">
          <img ref={logoRef} src="/mindstec-logo-web.png" alt="" />
          <div className="pre-bar"><i ref={barRef} /></div>
        </div>,
        document.body,
      )}
    </>
  );
}
