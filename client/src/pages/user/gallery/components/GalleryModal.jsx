import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GalleryModal
 * Fullscreen lightbox with Framer Motion shared layout transition.
 * - Opens with scale+fade from card position
 * - Keyboard: ESC to close, ArrowLeft/Right to navigate
 * - Click outside image to close
 * - Blurred dark backdrop
 */
export default function GalleryModal({ item, items, onClose, onPrev, onNext }) {
  // Keyboard navigation
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    // Lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prev;
    };
  }, [handleKey]);

  const currentIndex = items.findIndex((i) => i.id === item.id);

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="modal-backdrop"
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(4,4,6,0.92)', backdropFilter: 'blur(18px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Modal container ── */}
          <motion.div
            key="modal-content"
            role="dialog"
            aria-modal="true"
            aria-label={`Gallery: ${item.title}`}
            className="fixed inset-0 z-[201] flex flex-col items-center justify-center p-4 md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* ── Close button ── */}
            <button
              onClick={onClose}
              aria-label="Close gallery"
              className="absolute top-5 right-5 z-10 flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(6,6,8,0.7)',
                color: '#fff',
                cursor: 'none',
                transition: 'border-color 0.25s, background 0.25s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(204,0,1,0.8)';
                e.currentTarget.style.background = 'rgba(204,0,1,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.background = 'rgba(6,6,8,0.7)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* ── Image (shared layout morphs from card) ── */}
            <motion.div
              layoutId={`gallery-image-${item.id}`}
              className="relative w-full max-w-5xl"
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full object-cover"
                style={{
                  maxHeight: '72vh',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />

              {/* Red corner accent */}
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 3,
                  height: 40,
                  background: '#CC0001',
                }}
              />
            </motion.div>

            {/* ── Title + nav row ── */}
            <motion.div
              className="w-full max-w-5xl mt-5 flex items-center justify-between gap-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title block */}
              <motion.div layoutId={`gallery-title-${item.id}`} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                <div
                  style={{
                    fontFamily: 'var(--body, Inter, sans-serif)',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#CC0001',
                    marginBottom: 6,
                  }}
                >
                  {item.category}
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--display, Archivo, sans-serif)',
                    fontSize: 'clamp(18px, 2vw, 26px)',
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    color: 'var(--white, #FAFAFA)',
                    lineHeight: 1.2,
                  }}
                >
                  {item.title}
                </h2>
                {/* Counter */}
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: 'var(--body, Inter, sans-serif)',
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.1em',
                  }}
                >
                  {String(currentIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </div>
              </motion.div>

              {/* Prev / Next */}
              <div className="flex items-center gap-3">
                <NavButton onClick={onPrev} direction="left" label="Previous image" />
                <NavButton onClick={onNext} direction="right" label="Next image" />
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NavButton({ onClick, direction, label }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.12)',
        background: 'rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'none',
        transition: 'border-color 0.25s, background 0.25s, color 0.25s, transform 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(204,0,1,0.6)';
        e.currentTarget.style.background = 'rgba(204,0,1,0.1)';
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.transform = direction === 'left' ? 'translateX(-2px)' : 'translateX(2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        {direction === 'left'
          ? <path d="M15 18l-6-6 6-6" />
          : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}
