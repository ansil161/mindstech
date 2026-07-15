import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useTilt } from '../hooks/useTilt';

export default function GalleryCard({ item, onClick, index }) {
  const { ref, glare, onMouseMove, onMouseLeave } = useTilt({
    maxRotateX: 4,
    maxRotateY: 6,
    scale: 1.02,
    duration: 0.5,
  });

  const [imgLoaded, setImgLoaded] = useState(false);
  const [hovered, setHovered]     = useState(false);

  return (
    <article
      ref={ref}
      className="gallery-card relative overflow-hidden w-full h-full"
      style={{
        borderRadius: 6,
        background: '#0a0a0c',
        border: '1px solid rgba(255,255,255,0.04)',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        cursor: 'none',
        userSelect: 'none',
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      aria-label={`View ${item.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(item); }
      }}
    >
      {/* ── Image ── */}
      <motion.div
        layoutId={`gallery-image-${item.id}`}
        className="absolute inset-0 w-full h-full"
      >
        {/* Shimmer skeleton */}
        {!imgLoaded && (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, #0a0a0c 25%, rgba(255,255,255,0.03) 50%, #0a0a0c 75%)',
              backgroundSize: '200% 100%',
              animation: 'gcShimmer 1.6s infinite',
            }}
          />
        )}
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          className="w-full h-full object-cover"
          style={{
            filter: hovered
              ? 'brightness(0.82) contrast(1.06) saturate(1.05)'
              : 'brightness(0.65) contrast(1.04) saturate(0.85)',
            transform: hovered ? 'scale(1.06)' : 'scale(1.0)',
            transition: 'transform 0.75s cubic-bezier(0.16,1,0.3,1), filter 0.5s ease',
          }}
        />
      </motion.div>

      {/* ── Deep gradient overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: hovered
            ? 'linear-gradient(180deg, rgba(6,6,8,0) 20%, rgba(6,6,8,0.70) 70%, rgba(6,6,8,0.92) 100%)'
            : 'linear-gradient(180deg, rgba(6,6,8,0) 30%, rgba(6,6,8,0.78) 68%, rgba(6,6,8,0.96) 100%)',
          transition: 'background 0.5s ease',
          zIndex: 2,
        }}
      />

      {/* ── Top-left: category pill ── */}
      <div
        className="absolute top-4 left-4 z-10 pointer-events-none"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.75)',
          background: 'rgba(6,6,8,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '4px 10px 4px 8px',
          borderRadius: 3,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          transition: 'border-color 0.3s, color 0.3s',
          ...(hovered && {
            borderColor: 'rgba(204,0,1,0.35)',
            color: '#fff',
          }),
        }}
      >
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: hovered ? '#CC0001' : 'rgba(255,255,255,0.4)',
            flexShrink: 0,
            transition: 'background 0.3s',
          }}
        />
        {item.category}
      </div>

      {/* ── Top-right: index ── */}
      <div
        className="absolute top-4 right-4 z-10 pointer-events-none"
        style={{
          fontFamily: 'var(--display, Archivo, sans-serif)',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: hovered ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.18)',
          transition: 'color 0.3s',
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* ── Bottom content ── */}
      <motion.div
        layoutId={`gallery-title-${item.id}`}
        className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
        style={{ padding: 'clamp(14px,1.6vw,20px)' }}
      >
        {/* Red accent line — expands on hover */}
        <div
          style={{
            height: 1.5,
            background: 'linear-gradient(90deg, #CC0001, rgba(204,0,1,0.3))',
            marginBottom: 10,
            width: hovered ? 32 : 18,
            transition: 'width 0.45s cubic-bezier(0.16,1,0.3,1)',
          }}
        />

        <h3
          style={{
            fontFamily: 'var(--display, Archivo, sans-serif)',
            fontSize: 'clamp(13px, 1.15vw, 16px)',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: hovered ? '#FAFAFA' : 'rgba(250,250,250,0.88)',
            lineHeight: 1.3,
            transition: 'color 0.3s',
          }}
        >
          {item.title}
        </h3>
      </motion.div>

      {/* ── Glare layer ── */}
      <div
        ref={glare}
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0, borderRadius: 'inherit', zIndex: 20 }}
      />

      {/* ── Border glow on hover ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius: 'inherit',
          border: hovered
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid transparent',
          boxShadow: hovered
            ? '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
            : 'none',
          transition: 'border-color 0.35s, box-shadow 0.35s',
          zIndex: 25,
        }}
      />

      {/* ── View icon on hover ── */}
      <div
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        style={{
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.25)',
            background: 'rgba(6,6,8,0.5)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: hovered ? 'scale(1)' : 'scale(0.7)',
            transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes gcShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </article>
  );
}
