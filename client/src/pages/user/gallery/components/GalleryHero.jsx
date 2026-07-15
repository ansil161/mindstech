import { useRef, lazy, Suspense } from 'react';
import { useHeroAnimations } from '../hooks/useGalleryAnimations';

const GalleryBackground = lazy(() => import('./GalleryBackground'));

function SplitWords({ text }) {
  return (
    <span aria-label={text}>
      {text.split(' ').map((word, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block overflow-hidden"
          style={{ marginRight: '0.22em' }}
        >
          <span className="gallery-hero-word inline-block">{word}</span>
        </span>
      ))}
    </span>
  );
}

export default function GalleryHero() {
  const containerRef = useRef(null);
  useHeroAnimations(containerRef);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: '100svh', background: 'var(--ink, #060608)' }}
      aria-label="Gallery hero"
    >
      {/* ── Grain texture ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          opacity: 0.028,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* ── Radial glow top-center ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(204,0,1,0.07) 0%, transparent 70%)',
        }}
      />

      {/* ── 3D scene ── */}
      <div className="absolute inset-0 z-[2]">
        <Suspense fallback={null}>
          <GalleryBackground />
        </Suspense>
      </div>

      {/* ── Bottom gradient ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 z-[3] pointer-events-none"
        style={{
          height: 220,
          background: 'linear-gradient(to bottom, transparent 0%, var(--ink, #060608) 100%)',
        }}
      />

      {/* ── Left edge accent line ── */}
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0 z-[4] pointer-events-none"
        style={{ width: 1, background: 'linear-gradient(to bottom, transparent 0%, rgba(204,0,1,0.4) 40%, rgba(204,0,1,0.4) 60%, transparent 100%)' }}
      />

      {/* ── Content ── */}
      <div
        className="relative z-[4] flex flex-col justify-between w-full max-w-[1440px] mx-auto"
        style={{
          minHeight: '100svh',
          padding: 'clamp(100px,14vh,160px) clamp(20px,4vw,56px) clamp(48px,7vh,80px)',
        }}
      >
        {/* Top row: label + year */}
        <div className="gallery-hero-meta flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#CC0001',
                flexShrink: 0,
                boxShadow: '0 0 8px rgba(204,0,1,0.7)',
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#CC0001',
              }}
            >
              Community &amp; Events
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.2)',
            }}
          >
            Mindstec Gallery
          </span>
        </div>

        {/* Center block */}
        <div className="flex flex-col gap-0" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
          {/* Eyebrow */}
          <div
            className="gallery-hero-meta flex items-center gap-3 mb-6"
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            <span style={{ display: 'block', width: 28, height: 1, background: 'rgba(255,255,255,0.25)' }} />
            People · Culture · Milestones
          </div>

          {/* Main heading */}
          <h1
            style={{
              fontFamily: 'var(--display, Archivo, sans-serif)',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 0.96,
              fontSize: 'clamp(56px, 9vw, 130px)',
              color: 'var(--white, #FAFAFA)',
            }}
          >
            <div style={{ overflow: 'hidden', display: 'block' }}>
              <span className="gallery-hero-word inline-block">Our</span>
            </div>
            <div style={{ overflow: 'hidden', display: 'block' }}>
              <span
                className="gallery-hero-word inline-block"
                style={{
                  background: 'linear-gradient(135deg, #FAFAFA 0%, rgba(250,250,250,0.55) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Community
              </span>
            </div>
          </h1>

          {/* Subtext + stats side by side */}
          <div
            className="gallery-hero-sub flex flex-col sm:flex-row gap-10 sm:gap-20 mt-10 pt-8"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p
              style={{
                fontSize: 'clamp(13px, 1.05vw, 16px)',
                color: 'var(--grey, #A3A3A3)',
                lineHeight: 1.8,
                maxWidth: '40ch',
              }}
            >
              Behind every great technology company are the people and moments
              that define its culture. Here's a look at Mindstec — our
              summits, workshops, outings and celebrations.
            </p>

            {/* Stats */}
            <div className="flex gap-8 sm:gap-12 items-start flex-shrink-0">
              {[
                { value: '22+',  label: 'Moments' },
                { value: '50+',  label: 'Events'  },
                { value: '300+', label: 'People'  },
              ].map(({ value, label }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span
                    style={{
                      fontFamily: 'var(--display, Archivo, sans-serif)',
                      fontSize: 'clamp(22px, 2.5vw, 34px)',
                      fontWeight: 700,
                      letterSpacing: '-0.04em',
                      color: 'var(--white, #FAFAFA)',
                      lineHeight: 1,
                    }}
                  >
                    {value}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: 'var(--grey-dark, #737373)',
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row: scroll cue */}
        <div className="gallery-hero-meta flex items-center gap-4">
          <div
            className="relative overflow-hidden"
            style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.08)' }}
            aria-hidden="true"
          >
            <div
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%',
                height: '45%',
                background: '#CC0001',
                animation: 'galleryCue 2s cubic-bezier(0.4,0,0.6,1) infinite',
              }}
            />
          </div>
          <span
            style={{
              fontSize: 9,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.28)',
            }}
            aria-hidden="true"
          >
            Scroll to explore
          </span>
        </div>
      </div>

      <style>{`
        @keyframes galleryCue {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(260%); }
        }
      `}</style>
    </section>
  );
}
