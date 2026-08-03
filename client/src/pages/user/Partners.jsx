import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { whenReady } from '../../utils/pageReveal';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from 'react-i18next';
import { BRANDS, PARTNER_CATEGORY_CODES } from '../../constants/products.js';


gsap.registerPlugin(ScrollTrigger);

// The brand registry lives in constants/products.js, which /products renders
// too. It used to be a second copy of the same twenty-five brands right here;
// two lists of the same data drift the moment one brand is added, and the logo
// paths were already duplicated between them.
//
// The portfolio is global — the same brands are represented in every region.
// (Region- and solution-specific brand lists stay on the solution detail pages.)

const Partners = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  const categories = PARTNER_CATEGORY_CODES.map(code => ({ code, label: t(`partners.categories.${code}`) }));

  useEffect(() => {
    cardsRef.current = cardsRef.current.slice(0, BRANDS.length);

    let stopIntro = () => {};
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        gsap.set('.p-card', { opacity: 1, y: 0 });
        return;
      }

      // Hero Entrance Timeline. paused: fromTo applies the hidden state
      // immediately (no flash) but the intro only plays once the active loader
      // has revealed the page — see whenReady().
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      intro.fromTo('#pheroH .w',
          { yPercent: 115, rotate: 2 },
          { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.1, ease: 'power4.out' })
        .fromTo('#pheroSide',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.0 },
          '-=.8')
        .fromTo('.phero-meta',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=.6')
        .fromTo('.filter-btn',
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.05 },
          '-=.5');
      stopIntro = whenReady(() => intro.play());

      // Generic reveals. fromTo, not to: nothing supplies a hidden start state
      // in CSS, so a `to` tween animated 1 -> 1 and produced no motion.
      gsap.utils.toArray('.reveal').forEach(el => {
        gsap.fromTo(el,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            }
          }
        );
      });

      gsap.utils.toArray('.section-head').forEach(head => {
        gsap.fromTo(head.querySelectorAll('h2, .label'),
          { opacity: 0, y: 30, filter: 'blur(4px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: head,
              start: 'top 84%',
              once: true,
            }
          }
        );
      });

      // CTA animations
      gsap.fromTo('#ctaH .w', { yPercent: 110 }, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 72%',
          once: true,
        }
      });

      gsap.fromTo('.cta-bg img', { yPercent: -6 }, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: '.cta',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Initial card batch scroll reveals
      const visibleCards = cardsRef.current.filter(el => el !== null);
      if (visibleCards.length > 0) {
        gsap.fromTo(visibleCards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '#pgrid',
              start: 'top 88%',
              once: true
            }
          }
        );
      }
    }, containerRef);

    return () => { stopIntro(); ctx.revert(); };
  }, []);

  // Animate cards on filter change
  useEffect(() => {
    const visibleCards = cardsRef.current.filter(el => {
      if (!el) return false;
      const cardCat = el.getAttribute('data-cat');
      return filter === 'all' || cardCat === filter;
    });

    if (visibleCards.length > 0) {
      gsap.fromTo(visibleCards,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out', overwrite: 'auto' }
      );
    }
  }, [filter]);

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="phero" aria-label="Our partners">
        <h1 className="display" id="pheroH">
          <span className="line-mask"><span className="w">{t('partners.hero.line1')}</span></span>
          <span className="line-mask"><span className="w"><em>{t('partners.hero.line2')}</em></span></span>
        </h1>
        <div className="phero-side" id="pheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>{t('partners.hero.label')}</span>
          <p>{t('partners.hero.brief')}</p>
        </div>
      </section>

      <div className="phero-meta">
        <div className="fact"><b>{t('partners.meta.fact1_b')}</b><span>{t('partners.meta.fact1_s')}</span></div>
        <div className="fact"><b>{t('partners.meta.fact2_b')}</b><span>{t('partners.meta.fact2_s')}</span></div>
        <div className="fact"><b>{t('partners.meta.fact3_b')}</b><span>{t('partners.meta.fact3_s')}</span></div>
      </div>

      {/* FILTERS */}
      <div className="filters" id="filters" role="group" aria-label="Filter partners by category">
        {categories.map(cat => (
          <button
            key={cat.code}
            className={`filter-btn ${filter === cat.code ? 'on' : ''}`}
            onClick={() => setFilter(cat.code)}
          >
            {cat.label}
            {cat.code === 'all' && <span className="filter-count">{BRANDS.length}</span>}
          </button>
        ))}
      </div>

      {/* PARTNER GRID */}
      <div className="pgrid" id="pgrid">
        {BRANDS.map((brand, i) => {
          const isVisible = filter === 'all' || brand.cat === filter;
          return (
            // Each card now opens the brand's catalogue page. Before, the grid
            // was twenty-five dead ends — the logos were the only thing the
            // page said about any of them.
            <Link
              key={brand.id}
              to={`/products/${brand.slug}`}
              className={`p-card ${isVisible ? '' : 'is-hidden'}`}
              data-cat={brand.cat}
              ref={el => (cardsRef.current[i] = el)}
            >
              <div className="p-logo">
                <span className="p-index">{brand.id}</span>
                <img src={brand.img} alt={`${brand.name} logo`} loading="lazy" />
              </div>
              <div className="p-body">
                <h3>{brand.name}</h3>
                <span className="p-cat">{t(brand.descKey)}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rule"></div>

      {/* WHY PARTNER */}
      <section className="why" aria-label="Why partner with Mindstec">
        <div className="section-head">
          <div>
            <span className="label label--red">{t('partners.why.label')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>{t('partners.why.title_main')} <em>{t('partners.why.title_em')}</em></h2>
          </div>
        </div>
        <div className="why-list">
          <div className="why-row reveal">
            <span className="num">01</span>
            <h3>{t('partners.why.p1_title')}</h3>
            <p>{t('partners.why.p1_desc')}</p>
          </div>
          <div className="why-row reveal">
            <span className="num">02</span>
            <h3>{t('partners.why.p2_title')}</h3>
            <p>{t('partners.why.p2_desc')}</p>
          </div>
          <div className="why-row reveal">
            <span className="num">03</span>
            <h3>{t('partners.why.p3_title')}</h3>
            <p>{t('partners.why.p3_desc')}</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="contact">
        <div className="cta-bg" aria-hidden="true">
          <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="" loading="lazy" />
        </div>
        <div className="cta-inner">
          <span className="label label--red">{t('partners.cta.label')}</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">{t('partners.cta.title_main1')}</span></span>
            <span className="line-mask"><span className="w"><em>{t('partners.cta.title_main2')}</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact?s=partner" className="btn btn--solid">
                <span>{t('partners.cta.btn1')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/contact?s=reseller" className="btn"><span>{t('partners.cta.btn2')}</span></Button>
            </div>
            <div className="cta-contacts">
              <div className="c-item"><span>{t('contact_info.partner_label')}</span><a href={`mailto:${t('contact_info.partner_email')}`}>{t('contact_info.partner_email')}</a></div>
              <div className="c-item"><span>{t('contact_info.label')}</span><a href={`tel:${t('contact_info.tel_href')}`}>{t('contact_info.tel_label')}</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Partners;
