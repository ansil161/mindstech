/**
 * Keeps already-open tabs in step with new deploys.
 *
 * A tab that was open before a deploy keeps running the old JavaScript until a
 * full reload, and because pages are lazy route chunks it can also try to load
 * a chunk whose hashed filename no longer exists. Two guards:
 *
 * 1. Every build emits /version.json with its build id (see vite.config.js).
 *    The tab polls it; once a newer build is live, the next in-app navigation
 *    does a full page load instead, so the visitor lands on the new code
 *    without losing anything they were typing on the current page.
 * 2. If a lazy chunk fails to load anyway (Vite's `vite:preloadError`), reload
 *    once to pick up the new index.html.
 */

/* global __APP_BUILD_ID__ */
const BUILD_ID = typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'dev';
const CHECK_EVERY_MS = 5 * 60 * 1000;
const RELOAD_GUARD_KEY = 'app_update_reloaded_at';

let updateAvailable = false;

const checkForUpdate = async () => {
  if (updateAvailable) return;
  try {
    const res = await fetch('/version.json', { cache: 'no-store' });
    if (!res.ok) return;
    const { buildId } = await res.json();
    if (buildId && buildId !== BUILD_ID) updateAvailable = true;
  } catch {
    // Offline or blocked: try again on the next tick.
  }
};

// Avoid a reload loop if the new build is itself broken: at most one
// automatic reload per 30 seconds.
const reloadOnce = () => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || 0);
    if (Date.now() - last < 30000) return false;
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  } catch {
    // Storage unavailable: still reload, the browser cache makes a loop unlikely.
  }
  window.location.reload();
  return true;
};

export const initAppUpdates = (router) => {
  if (import.meta.env.DEV) return;

  window.addEventListener('vite:preloadError', (event) => {
    if (reloadOnce()) event.preventDefault();
  });

  checkForUpdate();
  setInterval(checkForUpdate, CHECK_EVERY_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForUpdate();
  });

  let lastPath = window.location.pathname;
  router.subscribe((state) => {
    const path = state.location.pathname;
    if (path === lastPath) return;
    lastPath = path;
    // The URL already points at the new page, so a reload lands there.
    if (updateAvailable) reloadOnce();
  });
};
