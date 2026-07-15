import { useRef, useCallback } from 'react';
import gsap from 'gsap';

/**
 * useTilt
 * Attaches to a card element. On mousemove, applies a 3D perspective tilt.
 * On mouseleave, smoothly resets. GPU-only transforms — no layout shifts.
 *
 * @param {object} options
 * @param {number} options.maxRotateX  — max X rotation in degrees (default 6)
 * @param {number} options.maxRotateY  — max Y rotation in degrees (default 6)
 * @param {number} options.scale       — hover scale (default 1.03)
 * @param {number} options.duration    — gsap tween duration (default 0.4)
 */
export function useTilt({
  maxRotateX = 6,
  maxRotateY = 6,
  scale = 1.03,
  duration = 0.4,
} = {}) {
  const ref = useRef(null);
  const glare = useRef(null);

  const onMouseMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      // Normalized position inside the card: -0.5 to 0.5
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      const rotateY = nx * maxRotateY * 2;
      const rotateX = -ny * maxRotateX * 2;

      gsap.to(el, {
        rotateX,
        rotateY,
        scale,
        transformPerspective: 800,
        transformOrigin: 'center center',
        duration,
        ease: 'power2.out',
        overwrite: 'auto',
      });

      // Glare highlight follows mouse
      if (glare.current) {
        const glareX = (nx + 0.5) * 100;
        const glareY = (ny + 0.5) * 100;
        gsap.to(glare.current, {
          opacity: 0.12,
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.35) 0%, transparent 65%)`,
          duration: 0.3,
          overwrite: 'auto',
        });
      }
    },
    [maxRotateX, maxRotateY, scale, duration]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.6,
      ease: 'elastic.out(1, 0.6)',
      overwrite: 'auto',
    });

    if (glare.current) {
      gsap.to(glare.current, {
        opacity: 0,
        duration: 0.4,
        overwrite: 'auto',
      });
    }
  }, []);

  return { ref, glare, onMouseMove, onMouseLeave };
}
