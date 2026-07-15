import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * usePageEntrance
 * Simple, reliable page-open animation:
 * - Hero content fades in from slight offset
 * - Red laser line sweeps across the screen once
 * No fixed overlay so the page is never blocked.
 */
export function usePageEntrance() {
  const laserRef = useRef(null);

  useEffect(() => {
    const laser = laserRef.current;
    if (!laser) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // Laser sweep: starts off-screen left, sweeps right, exits right
    const tl = gsap.timeline({ defaults: { ease: 'power4.inOut' } });

    gsap.set(laser, {
      xPercent: -105,
      autoAlpha: 1,
    });

    tl.to(laser, { xPercent: 0, duration: 0.55, ease: 'power4.out' }, 0.1)
      .to(laser, { xPercent: 105, duration: 0.55, ease: 'power4.in' }, '+=0.05');

    return () => tl.kill();
  }, []);

  return { laserRef };
}

/**
 * useHeroAnimations
 * Animates hero words, subtext and meta in on mount.
 * Uses gsap.context scoped to the hero container ref.
 */
export function useHeroAnimations(containerRef) {
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) {
      // Make everything visible immediately
      el.querySelectorAll('.gallery-hero-word').forEach((w) => {
        w.style.opacity = '1';
        w.style.transform = 'none';
      });
      el.querySelectorAll('.gallery-hero-sub, .gallery-hero-meta').forEach((w) => {
        w.style.opacity = '1';
      });
      return;
    }

    const ctx = gsap.context(() => {
      const words = el.querySelectorAll('.gallery-hero-word');
      const sub = el.querySelectorAll('.gallery-hero-sub');
      const meta = el.querySelectorAll('.gallery-hero-meta');

      // Reset
      gsap.set(words, { yPercent: 110, opacity: 0 });
      gsap.set(sub, { opacity: 0, y: 22 });
      gsap.set(meta, { opacity: 0, y: 16 });

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 });

      tl.to(words, {
        yPercent: 0,
        opacity: 1,
        duration: 1.0,
        stagger: 0.06,
      })
        .to(sub, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.6')
        .to(meta, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, '-=0.5');
    });

    return () => ctx.revert();
  }, [containerRef]);
}

/**
 * useCardReveal
 * ScrollTrigger-based reveal for each gallery card — fires once.
 * Cards already in viewport on mount are revealed immediately.
 */
export function useCardReveal() {
  const gridRef = useRef(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cards = Array.from(grid.querySelectorAll('.gallery-card'));

    if (reduceMotion || cards.length === 0) {
      cards.forEach((c) =>
        gsap.set(c, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' })
      );
      return;
    }

    // Set initial hidden state on ALL cards first
    gsap.set(cards, { opacity: 0, y: 50, scale: 0.96, filter: 'blur(0px)' });

    const triggers = [];

    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight * 0.95;

      if (alreadyVisible) {
        // Reveal immediately with a small stagger
        gsap.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          delay: i * 0.06,
          ease: 'power3.out',
        });
      } else {
        // Reveal on scroll
        triggers.push(
          ScrollTrigger.create({
            trigger: card,
            start: 'top 92%',
            once: true,
            onEnter: () => {
              gsap.to(card, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.85,
                delay: (i % 4) * 0.07,
                ease: 'power3.out',
              });
            },
          })
        );
      }
    });

    // Refresh ScrollTrigger after layout settles
    const timer = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      triggers.forEach((t) => t.kill());
      clearTimeout(timer);
    };
  }, []);

  return { gridRef };
}

/**
 * useSectionHeadingReveal
 * Fades in section heading elements on scroll.
 */
export function useSectionHeadingReveal(ref) {
  useEffect(() => {
    if (!ref?.current) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ['.section-label', '.section-title', '.section-body'],
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 82%',
            once: true,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [ref]);
}
