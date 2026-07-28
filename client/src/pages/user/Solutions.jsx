import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { whenReady } from '../../utils/pageReveal';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';
import { useRegion } from '../../context/RegionContext.jsx';
import { getPublicRegionData } from '../../api/regionApi.js';
import { getFallbackSolutions, getSolutionMeta } from '../../constants/solutions.js';
import SolutionGrid from '../../components/common/SolutionGrid/SolutionGrid.jsx';
import WaveBackdrop from '../../components/common/WaveBackdrop/WaveBackdrop.jsx';

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

  // The listing shows the same cards as Home's section, plus the tag row the
  // extra room here affords. Falls back to the static six verticals when the
  // CMS returns nothing, so the page is never just a hero over empty space.
  const cards = (solutions.length ? solutions : getFallbackSolutions(t))
    .map((sol) => ({ ...sol, ...(getSolutionMeta(t, sol.slug) || {}) }));

  // Mount-time animations: everything targeting markup that exists on first
  // paint. Previously this whole block sat behind `if (solutions.length === 0)
  // return`, which held the hero intro hostage to the solutions fetch.
  useEffect(() => {
    let stopIntro = () => {};
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        return;
      }

      // Hero Entrance Timeline. paused: fromTo applies the hidden state
      // immediately (no flash) but the intro only plays once the active loader
      // has revealed the page — see whenReady().
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
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
      stopIntro = whenReady(() => intro.play());

      // Static reveals (the CTA row). Solution rows are handled below, once
      // they exist. fromTo, not to: no CSS supplies a hidden start state.
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

    return () => { stopIntro(); ctx.revert(); };
  }, []);

  // The cards animate themselves — SolutionGrid owns that timeline so this page
  // and Home's section can't drift apart. The .reveal pass above deliberately
  // doesn't match them.

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="shero" aria-label="Our solutions">
        <h1 className="display" id="sheroH">
          <span className="line-mask"><span className="w">{t('solutions.hero.line1')}</span></span>
          <span className="line-mask"><span className="w"><em>{t('solutions.hero.line2')}</em></span></span>
        </h1>
        <div className="shero-side" id="sheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>{t('solutions.hero.label')}</span>
          <p>{t('solutions.hero.desc')}</p>
        </div>
      </section>
      
      <div className="shero-meta">
        <div className="fact"><b>{t('solutions.meta.vert_b')}</b><span>{t('solutions.meta.vert_s')}</span></div>
        <div className="fact"><b>{t('solutions.meta.brands_b')}</b><span>{t('solutions.meta.brands_s')}</span></div>
        <div className="fact"><b>{t('solutions.meta.installs_b')}</b><span>{t('solutions.meta.installs_s')}</span></div>
      </div>

      {/* SOLUTION GRID — from backend, same cards as the Home section */}
      <section className="sol-section">
        <WaveBackdrop />
        <SolutionGrid
          id="solGrid"
          className="sol-grid--page"
          cta={t('solutions.explore', 'Explore')}
          items={cards}
        />
      </section>

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
              <div className="c-item"><span>{t('contact_info.email_label')}</span><a href={`mailto:${email}`}>{email}</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Solutions;
