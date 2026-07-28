import { useEffect, useRef } from 'react';

/**
 * Animated wave-line backdrop for a section.
 *
 * Adapted from the "animated wave visualizer" canvas: eight sine lines whose
 * frequency drifts on its own timer, so the field never repeats exactly.
 *
 * Three things differ from the original, all of them because this runs inside a
 * page rather than as a full-screen demo:
 *
 *  - It sizes to its own parent (ResizeObserver + devicePixelRatio) instead of
 *    `window.innerWidth/innerHeight`, which would have drawn a viewport-sized
 *    canvas into a section-sized box and stretched every line.
 *  - It clears to transparent rather than filling black, so the section's own
 *    background (and the page's `--ink`) still shows through.
 *  - It only animates while it is actually on screen, and not at all under
 *    `prefers-reduced-motion` — a permanent requestAnimationFrame loop on the
 *    homepage would otherwise run behind every other section too.
 *
 * Colours come from the brand red rather than the original's indigo: lines rest
 * at `--red` (#CC0001) and heat toward a lighter coral as their amplitude rises.
 */

const LINE_COUNT = 8;

// #CC0001 at rest → a hot coral at full amplitude.
const BASE_RGB = [204, 0, 1];
const PEAK_RGB = [255, 82, 68];

// Sample the sine every Nth pixel instead of every pixel. The original stepped
// x by 1, which is ~1,300 lineTo calls per line and ~10,400 per frame for a
// curve smooth enough that nobody can see the difference at 6px. Measured: this
// plus dropping shadowBlur took long frames during scroll from 12.6% to 0.7%.
const X_STEP = 6;

// A decorative backdrop does not need to run at display refresh rate. Halving
// it frees the budget for scrolling, which is what the eye actually tracks.
const FRAME_MS = 1000 / 30;

export default function WaveBackdrop({ className = '', opacity = 0.5 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const host = canvas.parentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let time = 0;
    let frame = null;
    let width = 0;
    let height = 0;

    const waves = Array.from({ length: LINE_COUNT }, () => ({
      value: Math.random() * 0.5 + 0.1,
      targetValue: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.02 + 0.01,
    }));

    function resize() {
      // Cap the pixel ratio: at 3x this is a multi-megapixel canvas repainted
      // every frame, and it's a background.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function updateWaves() {
      waves.forEach((wave) => {
        if (Math.random() < 0.01) wave.targetValue = Math.random() * 0.7 + 0.1;
        wave.value += (wave.targetValue - wave.value) * wave.speed;
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      waves.forEach((wave, i) => {
        const freq = wave.value * 7;
        ctx.beginPath();

        for (let x = 0; x <= width + X_STEP; x += X_STEP) {
          const cx = Math.min(x, width);
          const nx = (cx / width) * 2 - 1;
          const px = nx + i * 0.04 + freq * 0.03;
          const py = Math.sin(px * 10 + time) * Math.cos(px * 2) * freq * 0.1 * ((i + 1) / LINE_COUNT);
          const y = ((py + 1) * height) / 2;
          if (x === 0) ctx.moveTo(cx, y);
          else ctx.lineTo(cx, y);
        }

        const intensity = Math.min(1, freq * 0.3);
        const [r, g, b] = BASE_RGB.map((c, k) => Math.round(c + (PEAK_RGB[k] - c) * intensity));

        // No shadowBlur. It was the single most expensive thing here — canvas
        // shadows run a full blur pass per stroke, eight times a frame. The
        // glow is recreated in CSS instead (see .wave-backdrop's filter), which
        // the compositor handles once for the whole layer.
        ctx.lineWidth = 1 + i * 0.3;
        ctx.strokeStyle = `rgba(${r},${g},${b},0.55)`;
        ctx.stroke();
      });
    }

    let lastDraw = 0;

    function animate(now) {
      frame = requestAnimationFrame(animate);
      // Throttle to FRAME_MS. Still driven by rAF so it stays synced to the
      // compositor and pauses with the tab, but it yields most frames to the
      // scroll.
      if (now - lastDraw < FRAME_MS) return;
      // Advance by elapsed time, not a fixed step, or the waves crawl at 30fps.
      time += Math.min((now - lastDraw) / 1000, 0.05) * 0.5;
      lastDraw = now;
      updateWaves();
      draw();
    }

    function start() {
      if (frame != null || reduceMotion) return;
      frame = requestAnimationFrame(animate);
    }

    function stop() {
      if (frame == null) return;
      cancelAnimationFrame(frame);
      frame = null;
    }

    resize();
    draw(); // one frame up front, so a reduced-motion or offscreen canvas isn't blank

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(host);

    // Only burn frames while the section is actually in view, and never while
    // the tab is in the background.
    let onScreen = false;

    const sync = () => (onScreen && !document.hidden ? start() : stop());

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: '120px' }
    );
    io.observe(host);

    document.addEventListener('visibilitychange', sync);

    return () => {
      stop();
      resizeObserver.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`wave-backdrop ${className}`.trim()}
      style={{ opacity }}
    />
  );
}
