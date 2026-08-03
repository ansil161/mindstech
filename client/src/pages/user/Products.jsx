import React, { useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { whenReady } from '../../utils/pageReveal';
import { useTranslation } from 'react-i18next';
import Button from '../../components/common/Button/Button.jsx';
import SolutionIcon from '../../components/common/SolutionIcons/SolutionIcons.jsx';
import {
  BRANDS,
  CATEGORY_COUNTS,
  PRODUCT_CATEGORIES,
  getBrandsByCategory,
  getCategory,
} from '../../constants/products.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * `/products` and `/products/category/:category`.
 *
 * The catalogue is organised by application first and brand second, which is
 * the order a specifier actually arrives in: they know the room they have to
 * fill, not the manufacturer they want. Picking a category is a real
 * navigation, not a client-side filter — each one has its own URL, so a
 * category can be linked from a proposal, a campaign or another page on this
 * site and land somewhere shareable.
 *
 * The category rail is sticky under the navbar. On a long grid that is the
 * difference between "filter, scroll, scroll, lose the filter" and being able
 * to change your mind at any point without scrolling back up.
 */
const Products = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { category } = useParams();
  const containerRef = useRef(null);

  const active = getCategory(category) || null;
  // An unknown category in the URL falls back to the full list rather than
  // rendering an empty grid under a heading for a category that doesn't exist.
  const activeCode = active ? active.code : 'all';
  const brands = useMemo(() => getBrandsByCategory(activeCode), [activeCode]);

  useEffect(() => {
    document.title = active
      ? `${active.name} — Products — Mindstec Distribution`
      : 'Products — Mindstec Distribution';
  }, [active]);

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
  }, [activeCode]);

  const goToCategory = (code) => {
    navigate(code === 'all' ? '/products' : `/products/category/${code}`);
  };

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
          <b>{PRODUCT_CATEGORIES.length}</b>
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
              onClick={() => goToCategory('all')}
            >
              {t('products.all', 'All brands')}
              <span className="pr-chip-count">{BRANDS.length}</span>
            </button>
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.code}
                type="button"
                className={`pr-chip ${activeCode === cat.code ? 'is-active' : ''}`}
                aria-current={activeCode === cat.code ? 'true' : undefined}
                onClick={() => goToCategory(cat.code)}
              >
                {t(`products.categories.${cat.code}.short`, cat.short)}
                <span className="pr-chip-count">{CATEGORY_COUNTS[cat.code]}</span>
              </button>
            ))}
          </div>
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
              <>
                <span className="pr-head-mark" aria-hidden="true">
                  <SolutionIcon name={active.icon} />
                </span>
                <h2 className="display">{t(`products.categories.${active.code}.name`, active.name)}</h2>
              </>
            ) : (
              <h2 className="display">
                {t('products.all_title_main', 'Every brand we')} <em>{t('products.all_title_em', 'distribute')}</em>
              </h2>
            )}
          </div>
          <p className="lede side">
            {active
              ? t(`products.categories.${active.code}.desc`, active.desc)
              : t(
                  'products.all_desc',
                  'Twenty-five manufacturers held under formal regional agreements, with the stock, spares and engineering support behind each one.'
                )}
          </p>
        </div>

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

      {/* ALL CATEGORIES — the same navigation as the rail, laid out so the
          whole catalogue is visible at once rather than only in a scroller. */}
      <section className="pr-cats" aria-label={t('products.cats_label', 'All application categories')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('products.cats_kicker', 'By application')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>
              {t('products.cats_title_main', 'Ten places this')} <em>{t('products.cats_title_em', 'gets used')}</em>
            </h2>
          </div>
        </div>
        <div className="pr-cat-grid">
          {PRODUCT_CATEGORIES.map((cat, i) => (
            <Link
              key={cat.code}
              to={`/products/category/${cat.code}`}
              className={`pr-cat reveal ${activeCode === cat.code ? 'is-active' : ''}`}
            >
              <span className="pr-cat-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <span className="pr-cat-mark" aria-hidden="true">
                <SolutionIcon name={cat.icon} />
              </span>
              <h3>{t(`products.categories.${cat.code}.name`, cat.name)}</h3>
              <p>{t(`products.categories.${cat.code}.desc`, cat.desc)}</p>
              <span className="pr-cat-foot">
                {CATEGORY_COUNTS[cat.code]} {t('products.brands_word', 'brands')}
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
