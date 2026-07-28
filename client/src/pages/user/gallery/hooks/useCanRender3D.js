import { useEffect, useState } from 'react';

/**
 * Probe for a WebGL context and throw it away again. Creating a context is the
 * only reliable test — `'WebGL2RenderingContext' in window` is true on machines
 * where the driver is blocklisted and creation still fails.
 */
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * useCanRender3D
 *
 * Decides whether the Gallery hero should pull in the three.js scene at all.
 * The lazy() boundary in GalleryHero keeps three out of the initial bundle, but
 * it does nothing for someone who actually opens /gallery — they still fetch
 * ~900 kB (~240 kB gzip) for a decorative background. This gate means only
 * visitors who can meaningfully render it pay that cost; everyone else gets the
 * CSS fallback and never requests the chunk.
 *
 * Returns false on the first render even when eligible, so the decision (and
 * the chunk request) lands after first paint rather than competing with it.
 */
export function useCanRender3D() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 768px)');

    const evaluate = () => {
      if (motion.matches) return false;
      if (!wide.matches) return false;
      // Phones and low-end laptops run this scene at a few fps; the download
      // buys them nothing but a drained battery.
      if ((navigator.hardwareConcurrency ?? 8) < 4) return false;
      if (navigator.connection?.saveData) return false;
      return hasWebGL();
    };

    // Defer past first paint: an idle callback so the LCP text and the gallery
    // grid render before we start a ~240 kB gzip fetch.
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout;
    const handle = idle(() => setEnabled(evaluate()), { timeout: 1500 });

    // Re-evaluate on resize/OS setting change, but only ever to turn the scene
    // ON. Unmounting a live Canvas mid-session to a static gradient reads as a
    // glitch, and the chunk is already paid for by then.
    const onChange = () => setEnabled((prev) => prev || evaluate());
    motion.addEventListener('change', onChange);
    wide.addEventListener('change', onChange);

    return () => {
      cancelIdle(handle);
      motion.removeEventListener('change', onChange);
      wide.removeEventListener('change', onChange);
    };
  }, []);

  return enabled;
}
