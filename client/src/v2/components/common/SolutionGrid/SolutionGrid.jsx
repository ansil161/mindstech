import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * The solutions grid, shared by Home's "What we distribute" section and the
 * /solutions listing. Both used to render their own layout — a hover-to-expand
 * row list on Home and alternating full-bleed rows on the listing page — which
 * meant two sets of markup, CSS and GSAP bindings for the same six verticals.
 *
 * The entrance animation lives here rather than in each page for the same
 * reason: two copies drifted apart once already (one shared trigger on Home,
 * per-card triggers on the listing), and scoping the context to this grid means
 * a page rendering two of them can never cross-bind.
 *
 * Each tile is a single <Link>, so the whole card is the hit target rather than
 * a 44px arrow at the end of a row. That is what lets the hover reveal stay
 * pure decoration: a touch device that can never fire :hover still gets one
 * unambiguous tap area, and the CSS shows those users the revealed state from
 * the start (see the `hover: none` block in index.css).
 *
 * `items` are already-translated and already-normalised — resolving slugs to
 * i18n copy is the caller's job, since Home and the listing page pull from
 * different shapes.
 *
 * @param {Array<{slug: string, title: string, desc?: string, image?: string,
 *                cat?: string, tags?: string[]}>} items
 * @param {string} [id]        DOM id, kept for in-page anchors.
 * @param {string} [className] Extra class, e.g. `sol-grid--page` for spacing.
 * @param {string} [cta]       Per-card link text; omit to hide the CTA button.
 */
export default function SolutionGrid({ items, id, className = '', cta }) {
  const gridRef = useRef(null);
  const count = items?.length ?? 0;

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || count === 0) return;
    // Nothing is hidden in CSS, so bailing out here just leaves the grid
    // visible — no risk of stranding a card at opacity 0.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.sol-card');
      const media = gsap.utils.toArray('.sol-card-media');

      // Read the column count off the rendered grid rather than hard-coding 3,
      // so the stagger still travels row by row at the 2- and 1-column
      // breakpoints instead of sweeping all six cards single-file.
      const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      const stagger = {
        each: 0.07,
        grid: [Math.ceil(cards.length / cols), cols],
        from: 'start',
      };

      const tl = gsap.timeline({
        scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
      });

      tl.fromTo(
        cards,
        { opacity: 0, y: 42, scale: 0.965 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out', stagger },
        0
      );

      // The photograph wipes up inside its own frame while the card rises.
      // `round 12px` matches .sol-card-media's radius — a plain inset() would
      // square the corners for the duration of the tween.
      tl.fromTo(
        media,
        { clipPath: 'inset(0 0 100% 0 round 12px)' },
        {
          clipPath: 'inset(0 0 0% 0 round 12px)',
          duration: 1.1,
          ease: 'power4.inOut',
          stagger,
        },
        0.08
      );
    }, grid);

    // Other async content above the grid (fieldwork, testimonials, the region
    // fetch) can shift its position after this binds.
    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
    // Re-runs when the fetch swaps fallback cards for CMS ones, which replaces
    // the very nodes these triggers are bound to.
  }, [count]);

  if (!count) return null;

  return (
    <div className={`sol-grid ${className}`.trim()} id={id} ref={gridRef}>
      {items.map((item, i) => (
        <Link className="sol-card" key={item.slug || i} to={`/solutions/${item.slug}`}>
          <span className="sol-card-media">
            {/* alt="" on purpose: the title sits directly below inside the same
                link, so a description here is announced twice. */}
            {item.image && <img src={item.image} alt="" loading="lazy" />}
            {item.cat && <span className="sol-card-cat">{item.cat}</span>}
          </span>

          <span className="sol-card-body">
            <span className="sol-card-title">{item.title}</span>
            {item.desc && <span className="sol-card-desc">{item.desc}</span>}

            {item.tags?.length > 0 && (
              <span className="sol-card-tags">
                {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </span>
            )}

            {cta && (
              <span className="sol-card-cta">
                {cta}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}
