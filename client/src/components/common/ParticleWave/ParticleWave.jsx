import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * A drifting field of red particles, used as the backdrop for the solution
 * detail page's closing CTA.
 *
 * Adapted from the reference "particle wave" implementation. Six things differ,
 * all of them because this runs as one section's background inside a long
 * scrolling page rather than as a full-screen demo:
 *
 *  1. It sizes to its own parent (ResizeObserver), not `window.innerWidth/
 *     innerHeight`. The original hard-codes 100vw/100vh, which would draw a
 *     viewport-sized canvas into a ~500px panel and stretch the whole field.
 *  2. The clear colour is transparent instead of opaque black/white, so the
 *     panel's own background still shows through. The original's light/dark
 *     theme switch is dropped — this site has one theme.
 *  3. It only renders while the section is actually on screen and the tab is
 *     visible. A permanent requestAnimationFrame loop would otherwise run
 *     behind all ten sections above it.
 *  4. Under `prefers-reduced-motion` it draws a single static frame instead of
 *     animating.
 *  5. The mouse listener is gone. The original tracks pointer position into a
 *     `mouse` vector that no shader ever reads — it is two live window
 *     listeners driving nothing.
 *  6. Three.js owns its canvas (`renderer.domElement`) rather than rendering
 *     into a React-managed <canvas>. A React-owned canvas that survives a
 *     StrictMode remount after `dispose()` comes back with a dead context and
 *     paints as an opaque rectangle — that exact bug cost us the whole site
 *     earlier in this project.
 *
 * The particle count is also cut from 200×200 to 130×130. At this camera
 * position the far half of the original grid is off-frame, so the extra 24,000
 * points were being simulated and never seen.
 */

// #CC0001 in linear-ish 0–1 space. Slightly lifted from the exact token so the
// dots stay legible at 60% alpha against near-black.
const PARTICLE_RGB = [0.86, 0.06, 0.07];

const AMOUNT = 130;
const GAP = 0.3;

/**
 * Wave phase advanced per second.
 *
 * The reference adds a flat 0.05 per frame, which is two bugs in one: it is
 * fast enough to read as agitated behind a call to action, and because it is
 * per-frame rather than per-second the whole field runs at double speed on a
 * 120 Hz display and half speed on a throttled tab. Advancing by elapsed time
 * fixes the second half; this constant settles the first.
 *
 * 1.0/sec — one full sine period every ~6 seconds. Still a third of the
 * reference's effective 3.0/sec, so the field reads as drifting rather than
 * churning, but with enough movement to be noticed.
 */
const WAVE_SPEED = 2.0;

const VERTEX_SHADER = `
  attribute float scale;
  uniform float uTime;
  void main() {
    vec3 p = position;
    float s = scale;
    p.y += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;
    p.x += (sin(p.y + uTime) * 0.5);
    s += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = s * 19.0 * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Round, soft-edged dots. The reference shader emits flat squares, which read
// as compression artefacts once they are tinted rather than white.
const FRAGMENT_SHADER = `
  uniform vec3 uColor;
  void main() {
    vec2 offset = gl_PointCoord - vec2(0.5);
    float d = dot(offset, offset);
    if (d > 0.25) discard;
    gl_FragColor = vec4(uColor, 0.92 * smoothstep(0.25, 0.02, d));
  }
`;

export default function ParticleWave({ className = '' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      // No WebGL (blocked, software-rasteriser refusal, too many live
      // contexts). The CTA is fully readable without its backdrop.
      return undefined;
    }

    // Cap the pixel ratio: this is a decorative background, and at 3x it is a
    // multi-megapixel target redrawn every frame.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.01, 1000);
    camera.position.set(0, 3.4, 4.2);

    const count = AMOUNT * AMOUNT;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const span = (AMOUNT * GAP) / 2;

    let i = 0;
    let j = 0;
    for (let ix = 0; ix < AMOUNT; ix++) {
      for (let iy = 0; iy < AMOUNT; iy++) {
        positions[i] = ix * GAP - span;
        positions[i + 1] = 0;
        positions[i + 2] = iy * GAP - span;
        scales[j] = 1;
        i += 3;
        j++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Vector3(...PARTICLE_RGB) },
      },
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    camera.lookAt(scene.position);

    let frame = null;
    let lastTime = 0;
    let onScreen = false;
    let alive = true;

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const draw = () => renderer.render(scene, camera);

    const animate = (now) => {
      frame = requestAnimationFrame(animate);
      // Clamp the delta so returning to a backgrounded tab resumes the drift
      // instead of jumping the wave forward by however long you were away.
      const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
      lastTime = now;
      material.uniforms.uTime.value += delta * WAVE_SPEED;
      draw();
    };

    const start = () => {
      if (frame != null || reduceMotion || !alive) return;
      frame = requestAnimationFrame(animate);
    };

    const stop = () => {
      if (frame == null) return;
      cancelAnimationFrame(frame);
      frame = null;
      // Next start() gets a fresh baseline rather than one delta covering the
      // entire time the section was off screen.
      lastTime = 0;
    };

    const sync = () => (onScreen && !document.hidden ? start() : stop());

    // A lost context (GPU reset, too many contexts on the page) would otherwise
    // leave a frozen or black rectangle sitting over the CTA.
    const onContextLost = (event) => {
      event.preventDefault();
      alive = false;
      stop();
      host.style.display = 'none';
    };
    canvas.addEventListener('webglcontextlost', onContextLost);

    resize();
    draw(); // one frame up front, so a reduced-motion or offscreen panel isn't blank

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(host);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: '150px' }
    );
    io.observe(host);

    document.addEventListener('visibilitychange', sync);

    return () => {
      stop();
      io.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
      // Detach before disposing: a context-lost event fired during teardown
      // would otherwise run the handler against an unmounted host.
      canvas.removeEventListener('webglcontextlost', onContextLost);
      scene.remove(particles);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div className={`particle-wave ${className}`.trim()} aria-hidden="true" ref={hostRef} />;
}
