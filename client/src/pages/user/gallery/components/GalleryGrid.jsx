import GalleryCard from './GalleryCard';
import { useCardReveal } from '../hooks/useGalleryAnimations';

/**
 * Premium editorial grid — luxury magazine layout.
 *
 * 12-column CSS grid, desktop. Hand-crafted row compositions:
 *  Row A  [8+4]       — hero wide + tall square
 *  Row B  [4+8]       — square + wide
 *  Row C  [5+3+4]     — three varying
 *  Row D  [12]        — full-bleed cinematic
 *  Row E  [4+4+4]     — three equal
 *  Row F  [7+5]       — landscape + portrait
 *  Row G  [5+7]       — portrait + landscape
 *  Row H  [3+6+3]     — side · hero · side
 *  Row I  [8+4]       — wide + square
 *  Row J  [6+6]       — balanced pair
 */
const SPANS = [
  { col: 'lg:col-span-8',  h: 'lg:h-[540px]' },  // 0
  { col: 'lg:col-span-4',  h: 'lg:h-[540px]' },  // 1
  { col: 'lg:col-span-4',  h: 'lg:h-[500px]' },  // 2
  { col: 'lg:col-span-8',  h: 'lg:h-[500px]' },  // 3
  { col: 'lg:col-span-5',  h: 'lg:h-[440px]' },  // 4
  { col: 'lg:col-span-3',  h: 'lg:h-[440px]' },  // 5
  { col: 'lg:col-span-4',  h: 'lg:h-[440px]' },  // 6
  { col: 'lg:col-span-12', h: 'lg:h-[580px]' },  // 7 — cinematic
  { col: 'lg:col-span-4',  h: 'lg:h-[420px]' },  // 8
  { col: 'lg:col-span-4',  h: 'lg:h-[420px]' },  // 9
  { col: 'lg:col-span-4',  h: 'lg:h-[420px]' },  // 10
  { col: 'lg:col-span-7',  h: 'lg:h-[520px]' },  // 11
  { col: 'lg:col-span-5',  h: 'lg:h-[520px]' },  // 12
  { col: 'lg:col-span-5',  h: 'lg:h-[480px]' },  // 13
  { col: 'lg:col-span-7',  h: 'lg:h-[480px]' },  // 14
  { col: 'lg:col-span-3',  h: 'lg:h-[400px]' },  // 15
  { col: 'lg:col-span-6',  h: 'lg:h-[400px]' },  // 16
  { col: 'lg:col-span-3',  h: 'lg:h-[400px]' },  // 17
  { col: 'lg:col-span-8',  h: 'lg:h-[520px]' },  // 18
  { col: 'lg:col-span-4',  h: 'lg:h-[520px]' },  // 19
  { col: 'lg:col-span-6',  h: 'lg:h-[460px]' },  // 20
  { col: 'lg:col-span-6',  h: 'lg:h-[460px]' },  // 21
];

export default function GalleryGrid({ items = [], onCardClick }) {
  const { gridRef } = useCardReveal();

  return (
    <section
      className="w-full"
      style={{
        background: 'var(--ink, #060608)',
        paddingBottom: 'clamp(80px, 10vw, 160px)',
      }}
    >
      {/* ── Section header ── */}
      <div
        className="max-w-[1440px] mx-auto"
        style={{
          padding: 'clamp(72px,9vw,120px) clamp(20px,4vw,56px) clamp(44px,5vw,72px)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">

          {/* Left */}
          <div className="flex flex-col gap-5">
            {/* Label row */}
            <div className="flex items-center gap-3">
              <span
                style={{
                  display: 'inline-block',
                  width: 5, height: 5,
                  borderRadius: '50%',
                  background: '#CC0001',
                  boxShadow: '0 0 8px rgba(204,0,1,0.6)',
                  flexShrink: 0,
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

            {/* Heading */}
            <h2
              style={{
                fontFamily: 'var(--display, Archivo, sans-serif)',
                fontWeight: 700,
                fontSize: 'clamp(28px, 3.6vw, 52px)',
                letterSpacing: '-0.038em',
                lineHeight: 1.04,
                color: 'var(--white, #FAFAFA)',
              }}
            >
              Moments that{' '}
              <em
                style={{
                  fontStyle: 'normal',
                  background: 'linear-gradient(135deg, #ff4d4d 0%, #CC0001 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                bring&nbsp;us&nbsp;together
              </em>
              .
            </h2>
          </div>

          {/* Right */}
          <div className="flex flex-col gap-5 lg:items-end lg:text-right lg:max-w-[36ch]">
            <p
              style={{
                fontSize: 'clamp(13px, 1vw, 15px)',
                color: 'var(--grey, #A3A3A3)',
                lineHeight: 1.8,
              }}
            >
              From annual summits to community drives — a window into the
              people, culture and events that define Mindstec.
            </p>

            {/* Count chips */}
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {['Annual Meet', 'Tech Workshop', 'Team Outing', 'Awards Night', 'Community Drive'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.35)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 3,
                    padding: '4px 9px',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative rule with line + count */}
        <div className="flex items-center gap-4 mt-12">
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.18)',
              flexShrink: 0,
            }}
          >
            {items.length} captures
          </span>
          <div style={{ width: 32, height: 1, background: '#CC0001', opacity: 0.5 }} />
        </div>
      </div>

      {/* ── Photo grid ── */}
      <div
        ref={gridRef}
        className="max-w-[1440px] mx-auto px-[clamp(20px,4vw,56px)]"
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12"
          style={{ gap: 'clamp(8px, 1vw, 14px)' }}
        >
          {items.map((item, i) => {
            const span = SPANS[i] ?? { col: 'lg:col-span-6', h: 'lg:h-[420px]' };
            return (
              <div
                key={item.id}
                className={`col-span-1 ${span.col} h-[280px] ${span.h} w-full`}
              >
                <GalleryCard item={item} index={i} onClick={onCardClick} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer strip ── */}
      <div
        className="max-w-[1440px] mx-auto px-[clamp(20px,4vw,56px)]"
        style={{ marginTop: 'clamp(48px,5vw,72px)' }}
      >
        <div
          className="flex items-center justify-between flex-wrap gap-4"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            paddingTop: 'clamp(18px,2.5vw,28px)',
          }}
        >
          <div className="flex items-center gap-3">
            <span
              style={{
                display: 'inline-block',
                width: 4, height: 4,
                borderRadius: '50%',
                background: '#CC0001',
                opacity: 0.7,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.06em',
              }}
            >
              {items.length} moments captured
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.12)',
            }}
          >
            Mindstec Community
          </span>
        </div>
      </div>
    </section>
  );
}
