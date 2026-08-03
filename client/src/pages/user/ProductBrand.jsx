import React, { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { whenReady } from '../../utils/pageReveal';
import { useTranslation } from 'react-i18next';
import Button from '../../components/common/Button/Button.jsx';
import SolutionIcon from '../../components/common/SolutionIcons/SolutionIcons.jsx';
import NotFound from './NotFound.jsx';
import { getBrand, getBrandCategories, getRelatedBrands } from '../../constants/products.js';
import { getSolutionName } from '../../constants/solutions.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * `/products/:brand`.
 *
 * The China catalogue's brand pages are the model: who the manufacturer is,
 * then the product families under it, then how to get one. This adds the two
 * cross-links that page is missing — the applications the brand appears under,
 * and the `/solutions` verticals it contributes to — so the catalogue is a
 * graph rather than a set of leaves.
 *
 * An unknown slug renders NotFound rather than an empty shell: a brand page for
 * a brand that doesn't exist is worse than a 404, because it looks like the
 * brand was dropped.
 */
const ProductBrand = () => {
  const { brand: slug } = useParams();
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const brand = getBrand(slug);

  useEffect(() => {
    if (!brand) return;
    document.title = `${brand.name} — Products — Mindstec Distribution`;
    window.scrollTo(0, 0);
  }, [brand]);

  useEffect(() => {
    if (!brand) return undefined;
    let stopIntro = () => {};

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        return;
      }

      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      intro
        .fromTo('.pb-crumb', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo('#pbTitle .w', { yPercent: 115 }, { yPercent: 0, duration: 1.2, stagger: 0.08, ease: 'power4.out' }, '-=0.35')
        .fromTo('.pb-logo', { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.8 }, '-=0.9')
        .fromTo('.pb-lede', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
        .fromTo('.pb-chip', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04 }, '-=0.5');
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
  }, [brand]);

  if (!brand) return <NotFound />;

  const categories = getBrandCategories(brand);
  const related = getRelatedBrands(brand.slug);

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="pb-hero">
        <nav className="pb-crumb" aria-label="Breadcrumb">
          <Link to="/products">{t('navbar.products', 'Products')}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{brand.name}</span>
        </nav>

        <div className="pb-hero-layout">
          <div className="pb-hero-main">
            <h1 className="display" id="pbTitle">
              <span className="line-mask"><span className="w">{brand.name}</span></span>
            </h1>
            <p className="pb-lede">{t(`products.brands.${brand.slug}.blurb`, brand.blurb)}</p>
            <div className="pb-chips">
              {categories.map((cat) => (
                <Link key={cat.code} to={`/products/category/${cat.code}`} className="pb-chip">
                  {t(`products.categories.${cat.code}.short`, cat.short)}
                </Link>
              ))}
            </div>
          </div>

          <div className="pb-logo">
            <img src={brand.img} alt={`${brand.name} logo`} />
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="pb-about">
        <span className="label label--red">{t('products.about_label', 'The manufacturer')}</span>
        <p className="pb-about-body reveal">{t(`products.brands.${brand.slug}.about`, brand.about)}</p>
      </section>

      <div className="rule" />

      {/* PRODUCT FAMILIES */}
      <section className="pb-families" aria-label={t('products.families_label', 'Product families')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('products.families_label', 'Product families')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>
              {t('products.families_title_main', 'What sits under')} <em>{t('products.families_title_em', 'the logo')}</em>
            </h2>
          </div>
          <p className="lede side">
            {t(
              'products.families_side',
              'Categories, not part numbers. Tell us the room and we come back with the specific models, the mounting and the spares.'
            )}
          </p>
        </div>

        <ol className="pb-family-list">
          {brand.families.map(([title, desc], i) => (
            <li className="pb-family reveal" key={title}>
              <span className="pb-family-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div className="pb-family-body">
                <h3>{t(`products.brands.${brand.slug}.families.${i}.title`, title)}</h3>
                <p>{t(`products.brands.${brand.slug}.families.${i}.desc`, desc)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* SOLUTIONS THIS BRAND SERVES */}
      {brand.solutions.length > 0 && (
        <section className="pb-solutions" aria-label={t('products.solutions_label', 'Where it is specified')}>
          <div className="section-head">
            <div>
              <span className="label label--red">{t('products.solutions_label', 'Where it is specified')}</span>
              <h2 className="display" style={{ marginTop: '16px' }}>
                {t('products.solutions_title_main', 'Solutions it')} <em>{t('products.solutions_title_em', 'shows up in')}</em>
              </h2>
            </div>
          </div>
          <div className="pb-sol-grid">
            {brand.solutions.map((solSlug) => (
              <Link key={solSlug} to={`/solutions/${solSlug}`} className="pb-sol reveal">
                <span>{getSolutionName(t, solSlug)}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* APPLICATIONS */}
      <section className="pb-apps" aria-label={t('products.apps_label', 'Applications')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('products.apps_label', 'Applications')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>
              {t('products.apps_title_main', 'Rooms it was')} <em>{t('products.apps_title_em', 'built for')}</em>
            </h2>
          </div>
        </div>
        <div className="pb-app-grid">
          {categories.map((cat) => (
            <Link key={cat.code} to={`/products/category/${cat.code}`} className="pb-app reveal">
              <span className="pb-app-mark" aria-hidden="true">
                <SolutionIcon name={cat.icon} />
              </span>
              <h3>{t(`products.categories.${cat.code}.name`, cat.name)}</h3>
              <p>{t(`products.categories.${cat.code}.desc`, cat.desc)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-bg" aria-hidden="true">
          <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="" loading="lazy" />
        </div>
        <div className="cta-inner">
          <span className="label label--red">{t('products.cta.label', 'Start a project')}</span>
          <h2 className="display" style={{ marginTop: '20px' }}>
            {t('products.brand_cta_main', 'Specifying')} <em>{brand.name}?</em>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact" className="btn btn--solid">
                <span>{t('products.cta.btn1', 'Ask for a specification')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/products" className="btn">
                <span>{t('products.cta.btn3', 'Back to catalogue')}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* OTHER BRANDS */}
      <section className="pb-next" aria-label={t('products.next_label', 'Other brands')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('products.next_label', 'Other brands')}</span>
          </div>
        </div>
        <div className="pb-next-grid">
          {related.map((other) => (
            <Link key={other.slug} to={`/products/${other.slug}`} className="pb-next-card">
              <div className="pb-next-logo">
                <img src={other.img} alt="" loading="lazy" />
              </div>
              <h3>{other.name}</h3>
              <p>{t(`products.brands.${other.slug}.blurb`, other.blurb)}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export default ProductBrand;
