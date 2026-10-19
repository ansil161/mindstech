import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { whenReady } from '../../utils/pageReveal';
import Button from '../../components/common/Button/Button.jsx';
import { CLIENTS, REGIONS, SECTOR_CODES } from '../../constants/clients.js';

gsap.registerPlugin(ScrollTrigger);

const FLAGSHIP = CLIENTS.filter((c) => c.flagship);

// One logo tile. Without an approved logo it renders the dashed "slot" state
// so the grid keeps its shape while the client list is being confirmed.
const ClientTile = React.forwardRef(function ClientTile({ client, t, showSector }, ref) {
  return (
    <div className="cl-tile" ref={ref} data-sector={client.sector}>
      <div className={`cl-logo ${client.logo ? '' : 'is-empty'}`}>
        {client.logo ? (
          <img src={client.logo} alt={`${client.name} logo`} loading="lazy" />
        ) : (
          <span>{t('clients.slot', 'Client logo')}</span>
        )}
      </div>
      {showSector && (
        <span className="cl-sector">{t(`clients.sectors.${client.sector}`, client.sector)}</span>
      )}
    </div>
  );
});

const Clients = () => {
  const { t } = useTranslation();
  const [region, setRegion] = useState('me');
  const [sector, setSector] = useState('all');
  const containerRef = useRef(null);
  const regionGridRef = useRef(null);

  const regionClients = CLIENTS.filter((c) => c.region === region);
  const visible = regionClients.filter((c) => sector === 'all' || c.sector === sector);
  const regionLabel = (r) => t(r.labelKey, r.fallback);
  const activeRegion = REGIONS.find((r) => r.code === region);

  useEffect(() => {
    let stopIntro = () => {};
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set(['.reveal', '.cl-tile'], { opacity: 1, y: 0 });
        return;
      }

      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      intro
        .fromTo('#cheroH .w', { yPercent: 115, rotate: 2 }, { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.1, ease: 'power4.out' })
        .fromTo('#cheroSide', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.0 }, '-=.8')
        .fromTo('.phero-meta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=.6');
      stopIntro = whenReady(() => intro.play());

      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 36 }, {
          opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      gsap.utils.toArray('.section-head').forEach((head) => {
        gsap.fromTo(head.querySelectorAll('h2, .label, .side'), { opacity: 0, y: 30, filter: 'blur(4px)' }, {
          opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: head, start: 'top 84%', once: true },
        });
      });

      gsap.fromTo('#flagGrid .cl-tile', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.7, stagger: 0.05, ease: 'power2.out',
        scrollTrigger: { trigger: '#flagGrid', start: 'top 88%', once: true },
      });

      gsap.fromTo('#ctaH .w', { yPercent: 110 }, {
        yPercent: 0, duration: 1.1, stagger: 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: '#contact', start: 'top 72%', once: true },
      });

      gsap.fromTo('.cta-bg img', { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }, containerRef);

    return () => { stopIntro(); ctx.revert(); };
  }, []);

  // Re-stagger the regional grid whenever the region or sector changes.
  useEffect(() => {
    const tiles = regionGridRef.current?.querySelectorAll('.cl-tile');
    if (tiles?.length) {
      gsap.fromTo(tiles, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out', overwrite: 'auto' });
    }
  }, [region, sector]);

  const pickRegion = (code) => {
    setRegion(code);
    setSector('all');
  };

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="phero" aria-label={t('clients.hero.label', 'Our clients')}>
        <h1 className="display" id="cheroH">
          <span className="line-mask"><span className="w">{t('clients.hero.line1', 'Trusted by teams')}</span></span>
          <span className="line-mask"><span className="w"><em>{t('clients.hero.line2', 'who can’t go dark.')}</em></span></span>
        </h1>
        <div className="phero-side" id="cheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>
            {t('clients.hero.label', 'Our Clients')}
          </span>
          <p>{t('clients.hero.brief', 'A selection of the organisations we work with, across every region and sector. Each regional site lists its full client base.')}</p>
        </div>
      </section>

      <div className="phero-meta">
        <div className="fact"><b>{t('clients.meta.fact1_b', '4 regions')}</b><span>{t('clients.meta.fact1_s', 'Middle East · India · Africa · Europe')}</span></div>
        <div className="fact"><b>{t('clients.meta.fact2_b', '6 sectors')}</b><span>{t('clients.meta.fact2_s', 'From government to retail')}</span></div>
        <div className="fact"><b>{t('clients.meta.fact3_b', 'Supplied & supported')}</b><span>{t('clients.meta.fact3_s', 'Systems we stand behind')}</span></div>
      </div>

      {/* FLAGSHIP CLIENTS */}
      <section className="cl-section" aria-label={t('clients.flagship.label', 'Selected clients')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('clients.flagship.label', 'Selected clients')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>
              {t('clients.flagship.title_main', 'Flagship')} <em>{t('clients.flagship.title_em', 'clients')}</em>
            </h2>
          </div>
          <p className="side">{t('clients.flagship.desc', 'Organisations that run on systems we supplied and supported, shown with their approval.')}</p>
        </div>
        <div className="cl-grid" id="flagGrid">
          {FLAGSHIP.map((c) => <ClientTile key={c.id} client={c} t={t} />)}
        </div>
      </section>

      <div className="rule"></div>

      {/* BY REGION */}
      <section className="cl-section" aria-label={t('clients.region.label', 'Clients by region')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('clients.region.label', 'By region')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>
              {t('clients.region.title_main', 'See clients')} <em>{t('clients.region.title_em', 'in your region')}</em>
            </h2>
          </div>
          <p className="side">{t('clients.region.desc', 'Pick a region, then narrow by sector to see who we work with locally.')}</p>
        </div>

        <div className="cl-regions" role="tablist" aria-label={t('clients.region.label', 'By region')}>
          {REGIONS.map((r, i) => {
            const count = CLIENTS.filter((c) => c.region === r.code).length;
            return (
              <button
                key={r.code}
                role="tab"
                aria-selected={region === r.code}
                className={`cl-region ${region === r.code ? 'on' : ''}`}
                onClick={() => pickRegion(r.code)}
              >
                <span className="cl-region-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="cl-region-name">{regionLabel(r)}</span>
                <span className="cl-region-count">{t('clients.region.count', '{{count}} clients', { count })}</span>
              </button>
            );
          })}
        </div>

        <div className="filters cl-filters" role="group" aria-label={t('clients.filter_label', 'Filter clients by sector')}>
          {SECTOR_CODES.map((code) => (
            <button
              key={code}
              className={`filter-btn ${sector === code ? 'on' : ''}`}
              aria-pressed={sector === code}
              onClick={() => setSector(code)}
            >
              {t(`clients.sectors.${code}`, code === 'all' ? 'All sectors' : code)}
            </button>
          ))}
        </div>

        <div className="cl-regional-head">
          <h3 className="display">
            {t('clients.region.in_region', 'Clients in {{region}}', { region: activeRegion ? regionLabel(activeRegion) : '' })}
          </h3>
          <span className="cl-live" aria-live="polite">
            {t('clients.region.showing', '{{count}} shown', { count: visible.length })}
          </span>
        </div>

        <div className="cl-grid" ref={regionGridRef}>
          {visible.map((c) => <ClientTile key={c.id} client={c} t={t} showSector />)}
        </div>
        {visible.length === 0 && (
          <p className="cl-empty">{t('clients.region.empty', 'No clients listed in this sector yet.')}</p>
        )}
      </section>

      {/* CTA */}
      <section className="cta" id="contact">
        <div className="cta-bg" aria-hidden="true">
          <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="" loading="lazy" />
        </div>
        <div className="cta-inner">
          <span className="label label--red">{t('clients.cta.label', 'Work with us')}</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">{t('clients.cta.title_main1', 'Your project')}</span></span>
            <span className="line-mask"><span className="w"><em>{t('clients.cta.title_main2', 'could be next.')}</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact" className="btn btn--solid">
                <span>{t('clients.cta.btn1', 'Talk to us')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/projects" className="btn"><span>{t('clients.cta.btn2', 'See our projects')}</span></Button>
            </div>
            <div className="cta-contacts">
              <div className="c-item"><span>{t('contact_info.label')}</span><a href={`tel:${t('contact_info.tel_href')}`}>{t('contact_info.tel_label')}</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Clients;
