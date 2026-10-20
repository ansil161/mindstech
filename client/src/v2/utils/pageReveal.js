/**
 * whenReady — run a page's entrance animation only once the active loader has
 * revealed the page, so intros are never wasted behind a cover (and nothing,
 * e.g. the gallery laser, shows on top of it).
 *
 * Two loaders can be covering the page:
 *   - Client navigation → RouteTransition's overlay. It sets
 *     window.__routeTransitioning while covering and dispatches `routeRevealed`
 *     when it finishes fading.
 *   - Hard refresh → the index.html #preloader. Layout sets
 *     window.__preloaderExited and dispatches `preloaderExited` on its exit.
 *
 * Each branch carries a safety timeout so a missed event (e.g. React StrictMode's
 * dev-only double-invoke killing the transition timeline) can never leave content
 * stuck hidden. Returns a cleanup function to detach the listener.
 *
 * @param {() => void} cb  runs exactly once when the page is revealed
 * @returns {() => void}   cleanup
 */
export function whenReady(cb) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    cleanup();
    cb();
  };
  let cleanup = () => {};

  // Client-side navigation: park on the route loader's reveal.
  if (window.__routeTransitioning) {
    const fallback = setTimeout(run, 1600);
    window.addEventListener('routeRevealed', run);
    cleanup = () => {
      clearTimeout(fallback);
      window.removeEventListener('routeRevealed', run);
    };
    return () => { if (!done) cleanup(); };
  }

  // Hard refresh: the preloader is still up — park on its exit.
  if (document.getElementById('preloader') && !window.__preloaderExited) {
    const fallback = setTimeout(run, 4000);
    window.addEventListener('preloaderExited', run);
    cleanup = () => {
      clearTimeout(fallback);
      window.removeEventListener('preloaderExited', run);
    };
    return () => { if (!done) cleanup(); };
  }

  // No loader active — run on the next frame so the browser paints the initial
  // (hidden) state first.
  const id = requestAnimationFrame(run);
  return () => cancelAnimationFrame(id);
}
