import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { whenReady } from '../../utils/pageReveal';
import { useTranslation } from 'react-i18next';
import Button from '../../components/common/Button/Button.jsx';
import { useRegion } from '../../context/RegionContext.jsx';
import {
  BRAND_FILTER_REGIONS,
  BRAND_FILTER_SOLUTIONS,
  brandMatches,
  getRegionBrandNames,
} from '../../constants/regionBrands.js';
import { BRANDS as ALL_BRANDS } from '../../constants/products.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * `/products` — the brands page, filterable by solution and by region.
 *
 * The filter rail is sticky under the navbar. On a long grid that is the
 * difference between "filter, scroll, scroll, lose the filter" and being able
 * to change your mind at any point without scrolling back up.
 */
const Products = () => {
  const { t } = useTranslation();
  const { regionSlug, region } = useRegion();
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  const [solFilter, setSolFilter] = useState('all');
  const [regFilter, setRegFilter] = useState('all');
  const activeCode = solFilter;
  const active = BRAND_FILTER_SOLUTIONS.find((s) => s.key === solFilter) || null;

  // Picking a region in the rail searches the whole catalogue for that region;
  // otherwise only the brands the site's active region carries (per the brand
  // sheet), and regions the sheet doesn't cover keep the full catalogue.
  const BRANDS = useMemo(() => {
    if (regFilter !== 'all') {
      return ALL_BRANDS.filter((b) => brandMatches(b.name, null, regFilter));
    }
    const names = getRegionBrandNames(regionSlug, region);
    return names ? ALL_BRANDS.filter((b) => names.has(b.name.toLowerCase())) : ALL_BRANDS;
  }, [regionSlug, region, regFilter]);
  const CATEGORY_COUNTS = useMemo(
    () => BRAND_FILTER_SOLUTIONS.reduce((acc, s) => {
      acc[s.key] = BRANDS.filter((b) => brandMatches(b.name, s.key, regFilter === 'all' ? null : regFilter)).length;
      return acc;
    }, {}),
    [BRANDS, regFilter]
  );
  // Switching region can leave the chosen solution with no brands (Europe
  // carries far fewer than India); fall back to All rather than an empty grid.
  useEffect(() => {
    if (solFilter !== 'all' && CATEGORY_COUNTS[solFilter] === 0) setSolFilter('all');
  }, [CATEGORY_COUNTS, solFilter]);
  const brands = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BRANDS.filter(
      (b) =>
        (activeCode === 'all' || brandMatches(b.name, activeCode, regFilter === 'all' ? null : regFilter)) &&
        (!q || `${b.name} ${b.blurb}`.toLowerCase().includes(q))
    );
  }, [BRANDS, activeCode, regFilter, query]);

  useEffect(() => {
    document.title = 'Brands — Mindstec Distribution';
  }, []);

  useEffect(() => {
    let stopIntro = () => {};

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        return;
      }

      // paused + fromTo: the hidden state lands immediately so there is no
      // flash of final copy, but the intro waits for the route loader.
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      intro
        .fromTo('#prheroH .w', { yPercent: 115, rotate: 2 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.1, ease: 'power4.out' })
        .fromTo('#prheroSide', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1 }, '-=0.8')
        .fromTo('.prhero-meta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');
      stopIntro = whenReady(() => intro.play());

      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        );
      });
    }, containerRef);

    return () => {
      stopIntro();
      ctx.revert();
    };
  }, []);

  // Cards re-enter on every category change. Keyed off activeCode rather than
  // the array so switching to a category with the same length still animates.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pr-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.03, ease: 'power2.out', overwrite: 'auto' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [activeCode, regFilter]);

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="prhero" aria-label={t('products.hero.aria', 'Our product catalogue')}>
        <h1 className="display" id="prheroH">
          <span className="line-mask"><span className="w">{t('products.hero.line1', 'Fifty-plus brands.')}</span></span>
          <span className="line-mask"><span className="w"><em>{t('products.hero.line2', 'One price list.')}</em></span></span>
        </h1>
        <div className="prhero-side" id="prheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>
            {t('products.hero.label', 'Products')}
          </span>
          <p>
            {t(
              'products.hero.desc',
              'Start with the space you have to fill. Every application below lists the manufacturers we stock and support for it — and every brand page sets out the product families behind the logo.'
            )}
          </p>
        </div>
      </section>

      <div className="prhero-meta">
        <div className="fact">
          <b>{BRANDS.length}</b>
          <span>{t('products.meta.brands', 'Brands distributed')}</span>
        </div>
        <div className="fact">
          <b>{BRAND_FILTER_SOLUTIONS.length}</b>
          <span>{t('products.meta.categories', 'Application categories')}</span>
        </div>
        <div className="fact">
          <b>{t('products.meta.support_b', 'In-region')}</b>
          <span>{t('products.meta.support_s', 'Stock & support')}</span>
        </div>
      </div>

      {/* CATEGORY RAIL — sticky, so the filter is reachable from anywhere in
          the grid without scrolling back to the top. */}
      <div className="pr-rail" id="catalogue">
        <div className="pr-rail-inner">
          <span className="pr-rail-label">{t('products.choose', 'Choose a category')}</span>
          <div className="pr-chips" role="group" aria-label={t('products.choose', 'Choose a category')}>
            <button
              type="button"
              className={`pr-chip ${activeCode === 'all' ? 'is-active' : ''}`}
              aria-current={activeCode === 'all' ? 'true' : undefined}
              onClick={() => setSolFilter('all')}
            >
              {t('partners.filter.all_solutions', 'All solutions')}
              <span className="pr-chip-count">{BRANDS.length}</span>
            </button>
            {BRAND_FILTER_SOLUTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`pr-chip ${activeCode === s.key ? 'is-active' : ''}`}
                aria-current={activeCode === s.key ? 'true' : undefined}
                disabled={CATEGORY_COUNTS[s.key] === 0}
                onClick={() => setSolFilter(s.key)}
              >
                {s.label}
                <span className="pr-chip-count">{CATEGORY_COUNTS[s.key]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* REGION FILTER — between the category rail and the search box. */}
      <div className="pr-region-band">
        <div className="pr-rail-inner">
          <span className="pr-rail-label">{t('products.choose_region', 'Choose a region')}</span>
          <div className="pr-chips" role="group" aria-label={t('products.choose_region', 'Choose a region')}>
            <button
              type="button"
              className={`pr-chip ${regFilter === 'all' ? 'is-active' : ''}`}
              aria-current={regFilter === 'all' ? 'true' : undefined}
              onClick={() => setRegFilter('all')}
            >
              {t('partners.filter.all_regions', 'All regions')}
            </button>
            {BRAND_FILTER_REGIONS.map((r) => (
              <button
                key={r.key}
                type="button"
                className={`pr-chip ${regFilter === r.key ? 'is-active' : ''}`}
                aria-current={regFilter === r.key ? 'true' : undefined}
                onClick={() => setRegFilter(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BRAND SEARCH — directly under the region filter. */}
      <div className="pr-search-wrap">
        <div className="bsearch pr-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.6-3.6" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('brands.search_placeholder', 'Search brands…')}
            aria-label={t('brands.search_aria', 'Search brands')}
          />
          {query && (
            <button type="button" className="bsearch-clear" onClick={() => setQuery('')} aria-label={t('brands.search_clear', 'Clear search')}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE CATEGORY.
          Deliberately not an aria-live region: changing category is a route
          change, and announcing twenty-five re-rendered cards every time is
          noise. The heading below carries the category name, which is what a
          screen reader user lands on. */}
      <section className="pr-section">
        <div className="pr-head">
          <div className="pr-head-main">
            {active ? (
              <h2 className="display">{active.label}</h2>
            ) : (
              <h2 className="display">
                {t('products.all_title_main', 'Every brand we')} <em>{t('products.all_title_em', 'distribute')}</em>
              </h2>
            )}
          </div>
          <p className="lede side">
            {active
              ? `${brands.length} ${t('products.brands_word', 'brands')}`
              : t(
                  'products.all_desc',
                  'Twenty-five manufacturers held under formal regional agreements, with the stock, spares and engineering support behind each one.'
                )}
          </p>
        </div>


        {brands.length === 0 && (
          <p className="pr-empty">
            {query
              ? t('brands.no_results', 'No brands match your search.')
              : t('brands.no_results_filters', 'No brands for this combination yet.')}
          </p>
        )}

        <div className="pr-grid">
          {brands.map((brand) => (
            <Link key={brand.slug} to={`/products/${brand.slug}`} className="pr-card">
              <div className="pr-card-logo">
                <img src={brand.img} alt="" loading="lazy" />
              </div>
              <div className="pr-card-body">
                <h3>{brand.name}</h3>
                <p>{t(`products.brands.${brand.slug}.blurb`, brand.blurb)}</p>
                {/* Counts are composed rather than interpolated through
                    i18next's `count` option, which switches on plural
                    resolution and looks for `<key>_other` before `<key>`. */}
                <span className="pr-card-count">
                  {brand.families.length} {t('products.families_word', 'product families')}
                </span>
              </div>
              <span className="pr-card-go" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="contact">
        <div className="cta-bg" aria-hidden="true">
          <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="" loading="lazy" />
        </div>
        <div className="cta-inner">
          <span className="label label--red">{t('products.cta.label', 'Start a project')}</span>
          <h2 className="display" style={{ marginTop: '20px' }}>
            {t('products.cta.title_main', 'Know the room.')} <em>{t('products.cta.title_em', 'Not the part number.')}</em>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact" className="btn btn--solid">
                <span>{t('products.cta.btn1', 'Ask for a specification')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/solutions" className="btn">
                <span>{t('products.cta.btn2', 'Browse by solution')}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Products;
