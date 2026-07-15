import { useEffect, useRef, useState } from 'react';

/**
 * useMousePosition
 * Returns normalized mouse position {x, y} in range [-1, 1]
 * and raw pixel position {px, py}.
 * Optionally smoothed via lerp.
 */
export function useMousePosition({ smooth = false, lerpFactor = 0.08 } = {}) {
  const raw = useRef({ x: 0, y: 0 });
  const smoothed = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      raw.current = { x: nx, y: ny, px: e.clientX, py: e.clientY };
      if (!smooth) {
        setPosition({ x: nx, y: -ny, px: e.clientX, py: e.clientY });
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    if (smooth) {
      const tick = () => {
        const dx = raw.current.x - smoothed.current.x;
        const dy = raw.current.y - smoothed.current.y;
        if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
          smoothed.current.x += dx * lerpFactor;
          smoothed.current.y += dy * lerpFactor;
          setPosition({
            x: smoothed.current.x,
            y: -smoothed.current.y,
            px: raw.current.px,
            py: raw.current.py,
          });
        }
        raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [smooth, lerpFactor]);

  return position;
}
