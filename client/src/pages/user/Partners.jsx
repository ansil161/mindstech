import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../../context/RegionContext.jsx';
import { getPublicRegionData } from '../../api/regionApi.js';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';


gsap.registerPlugin(ScrollTrigger);

const Partners = () => {
  const { t } = useTranslation();
  const { regionSlug } = useRegion();
  const [filter, setFilter] = useState('all');
  const [rawBrands, setRawBrands] = useState([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  const { translatedData: brands } = useDynamicTranslation(rawBrands, ['name'], `partners_brands_${regionSlug}`);

  // Fetch brands from the backend (region-specific)
  useEffect(() => {
    let cancelled = false;
    setBrandsLoading(true);
    const fetchBrands = async () => {
      try {
        const res = await getPublicRegionData(regionSlug);
        if (!cancelled) {
          setRawBrands(res.data.brands || []);
        }
      } catch (err) {
        console.error('Failed to load brands:', err);
        if (!cancelled) setRawBrands([]);
      } finally {
        if (!cancelled) setBrandsLoading(false);
      }
    };
    fetchBrands();
    return () => { cancelled = true; };
  }, [regionSlug]);

  // Build unique category list from brand solutions data
  // Since brands from backend have solutions as array of IDs, we'll use a flat all/active approach
  // The backend brands don't have 'cat' field natively — we'll derive categories from solutions slugs if available
  // Otherwise fall back to "all" only filter
  const categories = React.useMemo(() => {
    const cats = new Set();
    brands.forEach(b => {
      if (b.cat) cats.add(b.cat);
    });
    const result = [{ code: 'all', label: t('partners.categories.all') }];
    const catMap = {
      displays: t('partners.categories.displays'),
      audio: t('partners.categories.audio'),
      broadcast: t('partners.categories.broadcast'),
      collab: t('partners.categories.collab'),
      infra: t('partners.categories.infra'),
    };
    cats.forEach(cat => {
      result.push({ code: cat, label: catMap[cat] || cat });
    });
    return result;
  }, [brands, t]);

  const filteredBrands = filter === 'all' ? brands : brands.filter(b => b.cat === filter);

  useEffect(() => {
    cardsRef.current = cardsRef.current.slice(0, brands.length);

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        gsap.set('.p-card', { opacity: 1, y: 0 });
        return;
      }

      // Hero Entrance Timeline
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
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

      // Generic reveals
      gsap.utils.toArray('.reveal').forEach(el => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          }
        });
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

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brands]);

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
        <div className="phero-side reveal" id="pheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>{t('partners.hero.label')}</span>
          <p>{t('partners.hero.brief')}</p>
        </div>
      </section>

      <div className="phero-meta reveal">
        <div className="fact"><b>{t('partners.meta.fact1_b')}</b><span>{t('partners.meta.fact1_s')}</span></div>
        <div className="fact"><b>{t('partners.meta.fact2_b')}</b><span>{t('partners.meta.fact2_s')}</span></div>
        <div className="fact"><b>{t('partners.meta.fact3_b')}</b><span>{t('partners.meta.fact3_s')}</span></div>
      </div>

      {/* FILTERS — only show if there are extra categories */}
      {categories.length > 1 && (
        <div className="filters" id="filters" role="group" aria-label="Filter partners by category">
          {categories.map(cat => (
            <button
              key={cat.code}
              className={`filter-btn ${filter === cat.code ? 'on' : ''}`}
              onClick={() => setFilter(cat.code)}
            >
              {cat.label}
              {cat.code === 'all' && <span className="filter-count">{brands.length}</span>}
            </button>
          ))}
        </div>
      )}

      {/* PARTNER GRID */}
      <div className="pgrid" id="pgrid">
        {brandsLoading && (
          <p style={{ color: 'var(--grey)', gridColumn: '1 / -1' }}>Loading partners...</p>
        )}
        {!brandsLoading && filteredBrands.length === 0 && (
          <p style={{ color: 'var(--grey)', gridColumn: '1 / -1' }}>No partner brands listed for this region yet.</p>
        )}
        {filteredBrands.map((brand, i) => {
          const isVisible = filter === 'all' || brand.cat === filter;
          return (
            <div
              key={brand.id}
              className={`p-card ${isVisible ? '' : 'is-hidden'}`}
              data-cat={brand.cat || 'all'}
              ref={el => (cardsRef.current[i] = el)}
            >
              <div className="p-logo">
                <span className="p-index">{String(i + 1).padStart(2, '0')}</span>
                {brand.logo
                  ? <img src={brand.logo} alt={`${brand.name} logo`} loading="lazy" />
                  : <span className="p-logo-text">{brand.name}</span>
                }
              </div>
              <div className="p-body">
                <h3>{brand.name}</h3>
                {brand.website_url && (
                  <a
                    href={brand.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-link p-cat"
                  >
                    Visit site ↗
                  </a>
                )}
              </div>
            </div>
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
