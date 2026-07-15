import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * CursorFollower
 * A premium magnetic cursor that replaces the system cursor on pointer:fine devices.
 * - Outer ring follows with lag (lerp)
 * - Inner dot snaps immediately
 * - Expands + shows label text on hovering gallery cards
 * - Contracts on interactive elements
 */
export default function CursorFollower() {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const labelRef = useRef(null);
  const pos = useRef({ x: -100, y: -100 });
  const smoothPos = useRef({ x: -100, y: -100 });
  const raf = useRef(null);
  const isVisible = useRef(false);

  useEffect(() => {
    // Only on pointer:fine (mouse) devices
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // Hide system cursor on the gallery page
    document.documentElement.style.cursor = 'none';

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible.current) {
        isVisible.current = true;
        gsap.to([outer, inner], { autoAlpha: 1, duration: 0.3 });
      }
      // Inner dot: snap
      gsap.set(inner, { x: e.clientX, y: e.clientY });
    };

    const onLeave = () => {
      gsap.to([outer, inner], { autoAlpha: 0, duration: 0.3 });
      isVisible.current = false;
    };

    const onEnter = () => {
      gsap.to([outer, inner], { autoAlpha: 1, duration: 0.3 });
      isVisible.current = true;
    };

    // Card hover: expand cursor + show "VIEW" label
    const onCardEnter = () => {
      gsap.to(outer, {
        scale: 2.4,
        borderColor: 'rgba(204,0,1,0.9)',
        backgroundColor: 'rgba(204,0,1,0.08)',
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.to(inner, { scale: 0, duration: 0.3 });
      if (labelRef.current) {
        gsap.to(labelRef.current, { autoAlpha: 1, scale: 1, duration: 0.3, delay: 0.1 });
      }
    };

    const onCardLeave = () => {
      gsap.to(outer, {
        scale: 1,
        borderColor: 'rgba(255,255,255,0.5)',
        backgroundColor: 'transparent',
        duration: 0.4,
        ease: 'power3.out',
      });
      gsap.to(inner, { scale: 1, duration: 0.3 });
      if (labelRef.current) {
        gsap.to(labelRef.current, { autoAlpha: 0, scale: 0.8, duration: 0.2 });
      }
    };

    // Click burst
    const onClick = () => {
      gsap.timeline()
        .to(outer, { scale: 0.75, duration: 0.1, ease: 'power2.in' })
        .to(outer, { scale: 1, duration: 0.4, ease: 'elastic.out(1.2, 0.5)' });
    };

    // Smooth outer ring loop
    const tick = () => {
      smoothPos.current.x += (pos.current.x - smoothPos.current.x) * 0.1;
      smoothPos.current.y += (pos.current.y - smoothPos.current.y) * 0.1;
      gsap.set(outer, { x: smoothPos.current.x, y: smoothPos.current.y });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    // Delegate card hover
    const delegate = (e) => {
      const card = e.target.closest('.gallery-card');
      if (card) {
        if (e.type === 'mouseover') onCardEnter();
        if (e.type === 'mouseout' && !card.contains(e.relatedTarget)) onCardLeave();
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mouseenter', onEnter);
    window.addEventListener('click', onClick);
    document.addEventListener('mouseover', delegate);
    document.addEventListener('mouseout', delegate);

    return () => {
      document.documentElement.style.cursor = '';
      cancelAnimationFrame(raf.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('click', onClick);
      document.removeEventListener('mouseover', delegate);
      document.removeEventListener('mouseout', delegate);
    };
  }, []);

  return (
    <>
      {/* Outer ring — follows with lag */}
      <div
        ref={outerRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          width: 40,
          height: 40,
          marginLeft: -20,
          marginTop: -20,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.5)',
          opacity: 0,
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* VIEW label inside ring */}
        <span
          ref={labelRef}
          style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#CC0001',
            opacity: 0,
            transform: 'scale(0.8)',
            whiteSpace: 'nowrap',
          }}
        >
          VIEW
        </span>
      </div>

      {/* Inner dot — snaps to cursor */}
      <div
        ref={innerRef}
        aria-hidden="true"
        className="fixed top-0 left-0 z-[9999] pointer-events-none"
        style={{
          width: 5,
          height: 5,
          marginLeft: -2.5,
          marginTop: -2.5,
          borderRadius: '50%',
          backgroundColor: '#CC0001',
          opacity: 0,
          willChange: 'transform',
        }}
      />
    </>
  );
}
