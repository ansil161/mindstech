/**
 * Shown while a lazy route's chunk downloads on a hard refresh / direct hit.
 *
 * Reuses #preloader's visual language (see index.css) rather than .route-loader,
 * because .route-loader starts hidden and is driven imperatively by GSAP in
 * RouteTransition — it would render invisible here. Styles are inline so this
 * needs no new CSS and stays independent of the GSAP-owned classes.
 */
export default function RouteFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'var(--ink, #060608)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
      }}
    >
      {/* Matches #preloader's 96px mark — the two screens are the same moment
          to a visitor, and at 52px the wordmark's tagline did not read. */}
      <img src="/mindstec-logo-web.png" alt="" style={{ height: 96, width: 'auto' }} />
      <div className="pre-bar">
        <i style={{ transform: 'none', animation: 'routeFallbackBar 1.1s ease-in-out infinite' }} />
      </div>
      <style>{`
        @keyframes routeFallbackBar {
          0%   { transform: scaleX(0);   transform-origin: left; }
          50%  { transform: scaleX(1);   transform-origin: left; }
          51%  { transform: scaleX(1);   transform-origin: right; }
          100% { transform: scaleX(0);   transform-origin: right; }
        }
      `}</style>
    </div>
  );
}
