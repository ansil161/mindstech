import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import CursorFollower from './components/CursorFollower';
import GalleryHero from './components/GalleryHero';
import GalleryGrid from './components/GalleryGrid';
import GalleryModal from './components/GalleryModal';
import { usePageEntrance } from './hooks/useGalleryAnimations';
import apiClient from '../../../api/axios';

export default function Gallery() {
  const { laserRef } = usePageEntrance();

  // ── Data ─────────────────────────────────────────────────────────────────
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiClient.get('/admin/gallery/')
      .then(({ data }) => { if (!cancelled) { setItems(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setError('Failed to load gallery.'); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  // ── Modal state ──────────────────────────────────────────────────────────
  const [activeItem, setActiveItem] = useState(null);

  const openModal = useCallback((item) => setActiveItem(item), []);
  const closeModal = useCallback(() => setActiveItem(null), []);

  const navigate = useCallback(
    (dir) => {
      if (!activeItem || items.length === 0) return;
      const idx = items.findIndex((i) => i.id === activeItem.id);
      const next =
        dir === 'next'
          ? items[(idx + 1) % items.length]
          : items[(idx - 1 + items.length) % items.length];
      setActiveItem(next);
    },
    [activeItem, items]
  );

  // Pause Lenis while modal is open
  useEffect(() => {
    if (window.lenis) {
      activeItem ? window.lenis.stop() : window.lenis.start();
    }
  }, [activeItem]);

  return (
    <>
      {/* ── Custom cursor ── */}
      <CursorFollower />

      {/* ── Red laser sweep (decorative, never blocks the page) ── */}
      <div
        ref={laserRef}
        aria-hidden="true"
        className="fixed inset-y-0 left-0 z-[500] pointer-events-none"
        style={{
          width: '100vw',
          height: '100vh',
          opacity: 0,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(204,0,1,0.04) 35%, rgba(204,0,1,0.85) 50%, rgba(204,0,1,0.04) 65%, transparent 100%)',
          willChange: 'transform',
        }}
      />

      {/* ── Page ── */}
      <div style={{ background: 'var(--ink, #060608)', minHeight: '100vh' }}>
        <GalleryHero />

        <AnimatePresence>
          {loading && <GalleryLoadingState />}
          {error && <GalleryErrorState message={error} />}
          {!loading && !error && (
            <GalleryGrid items={items} onCardClick={openModal} />
          )}
        </AnimatePresence>

        <CtaStrip />
      </div>

      {/* ── Modal ── */}
      <AnimatePresence mode="wait">
        {activeItem && (
          <GalleryModal
            key={activeItem.id}
            item={activeItem}
            items={items}
            onClose={closeModal}
            onPrev={() => navigate('prev')}
            onNext={() => navigate('next')}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Loading state ─────────────────────────────────────────────────────── */
function GalleryLoadingState() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        color: 'rgba(255,255,255,0.25)',
        fontSize: 13,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
    >
      Loading gallery…
    </div>
  );
}

/* ─── Error state ────────────────────────────────────────────────────────── */
function GalleryErrorState({ message }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        color: '#CC0001',
        fontSize: 13,
        letterSpacing: '0.06em',
      }}
    >
      {message}
    </div>
  );
}

/* ─── CTA strip ─────────────────────────────────────────────────────────── */
function CtaStrip() {
  return (
    <section
      style={{
        background: 'var(--ink, #060608)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: 'clamp(56px,7vw,96px) clamp(20px,4vw,56px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 20,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#CC0001',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#CC0001', display: 'inline-block' }} />
        Join the Community
      </div>

      <h2
        style={{
          fontFamily: 'var(--display, Archivo, sans-serif)',
          fontWeight: 700,
          fontSize: 'clamp(28px, 4vw, 56px)',
          letterSpacing: '-0.035em',
          lineHeight: 1.06,
          color: 'var(--white, #FAFAFA)',
          maxWidth: '16ch',
        }}
      >
        Want to be part of our{' '}
        <em
          style={{
            fontStyle: 'normal',
            background: 'linear-gradient(135deg,#ff4d4d 0%,#CC0001 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          next chapter?
        </em>
      </h2>

      <p
        style={{
          fontSize: 'clamp(13px, 1vw, 15px)',
          color: 'var(--grey, #A3A3A3)',
          lineHeight: 1.75,
          maxWidth: '42ch',
        }}
      >
        Whether you're a prospective partner, a technology enthusiast, or
        someone who wants to work with us — we'd love to hear from you.
      </p>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
        <a href="/contact" className="btn btn--solid">
          <span>Get in touch</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </a>
        <a href="/solutions" className="btn">
          <span>View Solutions</span>
        </a>
      </div>
    </section>
  );
}
