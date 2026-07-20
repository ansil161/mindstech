import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';
import { useRegion } from '../../context/RegionContext.jsx';
import { getPublicRegionData } from '../../api/regionApi.js';

gsap.registerPlugin(ScrollTrigger);

const Solutions = () => {
  const { t } = useTranslation();
  const { regionSlug } = useRegion();
  const containerRef = useRef(null);

  const [rawSolutions, setRawSolutions] = useState([]);
  const [regionContact, setRegionContact] = useState(null);

  const { translatedData: solutions } = useDynamicTranslation(rawSolutions, ['title', 'desc'], 'solutions_list');

  // Fetch solutions from the backend
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const res = await axios.get('/admin/solutions/');
        if (res.data && res.data.length > 0) {
          setRawSolutions(res.data);
        }
      } catch (err) {
        console.error('Failed to load solutions:', err);
      }
    };
    fetchSolutions();
  }, []);

  // Fetch contact info for CTA section
  useEffect(() => {
    let cancelled = false;
    const fetchContact = async () => {
      try {
        const res = await getPublicRegionData(regionSlug);
        if (!cancelled) {
          setRegionContact(Array.isArray(res.data.contact_info) ? res.data.contact_info[0] : (res.data.contact_info || null));
        }
      } catch {
        if (!cancelled) setRegionContact(null);
      }
    };
    fetchContact();
    return () => { cancelled = true; };
  }, [regionSlug]);

  const telHref = (regionContact?.phone_display || regionContact?.phone || '').replace(/[^+\d]/g, '');
  const telLabel = regionContact?.phone_display || regionContact?.phone || '';
  const email = regionContact?.email || '';

  useEffect(() => {
    if (solutions.length === 0) return;

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        gsap.set('.reveal-img', { clipPath: 'inset(0 0 0% 0)' });
        return;
      }

      // Hero Entrance Timeline
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.fromTo('#sheroH .w', 
          { yPercent: 115, rotate: 2 }, 
          { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.1, ease: 'power4.out' })
        .fromTo('#sheroSide', 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 1.0 }, 
          '-=.8')
        .fromTo('.shero-meta', 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.8 }, 
          '-=.6');

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

      gsap.utils.toArray('.reveal-img').forEach(el => {
        gsap.to(el, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.4,
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 84%',
            once: true,
          }
        });
      });

      // CTA masked headline
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
    }, containerRef);

    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => { ctx.revert(); clearTimeout(timer); };
  }, [solutions]);

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="shero" aria-label="Our solutions">
        <h1 className="display" id="sheroH">
          <span className="line-mask"><span className="w">{t('solutions.hero.line1')}</span></span>
          <span className="line-mask"><span className="w"><em>{t('solutions.hero.line2')}</em></span></span>
        </h1>
        <div className="shero-side reveal" id="sheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>{t('solutions.hero.label')}</span>
          <p>{t('solutions.hero.desc')}</p>
        </div>
      </section>
      
      <div className="shero-meta reveal">
        <div className="fact"><b>{t('solutions.meta.vert_b')}</b><span>{t('solutions.meta.vert_s')}</span></div>
        <div className="fact"><b>{t('solutions.meta.brands_b')}</b><span>{t('solutions.meta.brands_s')}</span></div>
        <div className="fact"><b>{t('solutions.meta.installs_b')}</b><span>{t('solutions.meta.installs_s')}</span></div>
      </div>

      {/* SOLUTION ROWS — from backend */}
      <div className="sol-flow" id="solFlow">
        {solutions.map((sol, idx) => (
          <article className="srow" key={sol.id || idx}>
            <Link
              className="srow-media reveal-img"
              to={`/solutions/${sol.slug}`}
              aria-label={`Explore ${sol.title}`}
            >
              <img src={sol.image} alt={sol.title} loading="lazy" />
              <span className="srow-cat">{sol.title}</span>
            </Link>
            <div className="srow-body reveal">
              <span className="num">{String(idx + 1).padStart(2, '0')}</span>
              <h2 className="display">
                <Link to={`/solutions/${sol.slug}`}>{sol.title}</Link>
              </h2>
              <p>{sol.desc}</p>
              <Link className="srow-link" to={`/solutions/${sol.slug}`}>
                {t('solutions.explore', 'Explore')} {sol.title}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* CTA */}
      <section className="cta" id="contact">
        <div className="cta-bg" aria-hidden="true">
          <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="" loading="lazy" />
        </div>
        <div className="cta-inner">
          <span className="label label--red">{t('solutions.cta.label', 'Start a project')}</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">{t('solutions.cta.line1', 'Tell us what the')}</span></span>
            <span className="line-mask"><span className="w">{t('solutions.cta.line2', 'space needs')} <em>{t('solutions.cta.line2_em', 'to do.')}</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact" className="btn btn--solid">
                <span>{t('solutions.cta.btn1', 'Get a quote')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/partners" className="btn"><span>{t('solutions.cta.btn2', 'See our brands')}</span></Button>
            </div>
            <div className="cta-contacts">
              <div className="c-item"><span>{t('contact_info.label')}</span><a href={`tel:${telHref}`}>{telLabel}</a></div>
              <div className="c-item"><span>Email</span><a href={`mailto:${email}`}>{email}</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Solutions;
