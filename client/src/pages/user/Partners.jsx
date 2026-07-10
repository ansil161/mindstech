import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';


gsap.registerPlugin(ScrollTrigger);

const Partners = () => {
  const [filter, setFilter] = useState('all');
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  const BRANDS = [
    { id: '01', name: 'Avocor', cat: 'displays', desc: 'Interactive displays', img: '/assets/uploads/2019/03/1.png' },
    { id: '02', name: 'Christie', cat: 'displays', desc: 'Projection', img: '/assets/uploads/2025/04/christie_250x250.png' },
    { id: '03', name: 'Datapath', cat: 'displays', desc: 'Video wall control', img: '/assets/uploads/2025/04/datapath-1.png' },
    { id: '04', name: 'Polywall', cat: 'displays', desc: 'Videowall software', img: '/assets/uploads/2025/04/polywall_250x250.png' },
    { id: '05', name: 'Magnum', cat: 'displays', desc: 'Projection screens', img: '/assets/uploads/2025/04/magnum-2-1.png' },
    { id: '06', name: 'Sonance', cat: 'audio', desc: 'Architectural audio', img: '/assets/uploads/2026/03/Screenshot-2026-03-24-124551.png' },
    { id: '07', name: 'RDL', cat: 'audio', desc: 'Pro audio interfaces', img: '/assets/uploads/2025/04/RDL-1.png' },
    { id: '08', name: 'Amino', cat: 'broadcast', desc: 'IPTV & streaming', img: '/assets/uploads/2026/04/Untitled-design-27.png' },
    { id: '09', name: 'SalrayWorks', cat: 'broadcast', desc: 'Broadcast cameras', img: '/assets/uploads/2026/04/a1966c_b6188e7c73814b5fa62a8a2fdb076fe5mv2.jpeg' },
    { id: '10', name: 'Telycam', cat: 'broadcast', desc: 'PTZ cameras', img: '/assets/uploads/2025/04/telycam_250x250.png' },
    { id: '11', name: 'Humelab', cat: 'collab', desc: 'Hospitality tech', img: '/assets/uploads/2026/04/Untitled-design-19.png' },
    { id: '12', name: 'Vizrt', cat: 'broadcast', desc: 'Live production', img: '/assets/uploads/2025/06/7-1.png' },
    { id: '13', name: 'Lemco', cat: 'broadcast', desc: 'RF & IPTV headend', img: '/assets/uploads/2026/04/Untitled-design-26-1.png' },
    { id: '14', name: 'T1V', cat: 'collab', desc: 'Visual collaboration', img: '/assets/uploads/2025/04/T1V-Orange-Standard-Logo-1.png' },
    { id: '15', name: 'GoGet', cat: 'collab', desc: 'Workspace booking', img: '/assets/uploads/2025/04/GoGet_Filled_RGB_Black-1.png' },
    { id: '16', name: 'iPort', cat: 'collab', desc: 'iPad enclosures', img: '/assets/uploads/2025/04/iPort_Logo_250x250.png' },
    { id: '17', name: 'RTI', cat: 'collab', desc: 'Control & automation', img: '/assets/uploads/2025/04/logo-300x300-1.png' },
    { id: '18', name: 'SCT', cat: 'collab', desc: 'Camera interfaces', img: '/assets/uploads/2025/04/SCT_250W.png' },
    { id: '19', name: 'Blustream', cat: 'infra', desc: 'AV distribution', img: '/assets/uploads/2025/04/Blustream_Logo-3-1.png' },
    { id: '20', name: 'NETGEAR AV', cat: 'infra', desc: 'AV networking', img: '/assets/uploads/2025/04/netgearav_250x250.png' },
    { id: '21', name: 'Kordz', cat: 'infra', desc: 'Connectivity', img: '/assets/uploads/2025/04/kordz_250x250.png' },
    { id: '22', name: 'B-Tech', cat: 'infra', desc: 'AV mounts', img: '/assets/uploads/2025/04/btech_250x250.png' },
    { id: '23', name: 'MTC', cat: 'infra', desc: 'Mounting solutions', img: '/assets/uploads/2025/04/MTC_new-1.png' },
    { id: '24', name: 'Sapling', cat: 'infra', desc: 'Synchronised clocks', img: '/assets/uploads/2025/04/sapling-1.png' },
    { id: '25', name: 'Wavex', cat: 'infra', desc: 'AV accessories', img: '/assets/uploads/2025/04/Wavex-Transparent-Logo-Source_1024-1.png' }
  ];

  useEffect(() => {
    // Reset cards ref array length
    cardsRef.current = cardsRef.current.slice(0, BRANDS.length);

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

  const categories = [
    { code: 'all', label: 'All' },
    { code: 'displays', label: 'Displays & Video Walls' },
    { code: 'audio', label: 'Audio' },
    { code: 'broadcast', label: 'Broadcast & Media' },
    { code: 'collab', label: 'Collaboration & Control' },
    { code: 'infra', label: 'Connectivity & Infrastructure' }
  ];

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="phero" aria-label="Our partners">
        <h1 className="display" id="pheroH">
          <span className="line-mask"><span className="w">World-class brands.</span></span>
          <span className="line-mask"><span className="w"><em>One distributor.</em></span></span>
        </h1>
        <div className="phero-side reveal" id="pheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>Our Partners</span>
          <p>Twenty-five manufacturers, one price list. We represent the world's leading AV brands across displays, audio, broadcast, collaboration and connectivity — so our dealers can specify an entire project from a single partner.</p>
        </div>
      </section>

      <div className="phero-meta reveal">
        <div className="fact"><b>25 brands</b><span>Represented portfolio</span></div>
        <div className="fact"><b>5 categories</b><span>Every AV vertical covered</span></div>
        <div className="fact"><b>3 regions</b><span>Middle East · Africa · Asia</span></div>
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
            {cat.code === 'all' && <span className="filter-count">25</span>}
          </button>
        ))}
      </div>

      {/* PARTNER GRID */}
      <div className="pgrid" id="pgrid">
        {BRANDS.map((brand, i) => {
          const isVisible = filter === 'all' || brand.cat === filter;
          return (
            <div
              key={brand.id}
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
                <span className="p-cat">{brand.desc}</span>
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
            <span className="label label--red">For manufacturers &amp; dealers</span>
            <h2 className="display" style={{ marginTop: '16px' }}>Why brands choose <em>Mindstec</em></h2>
          </div>
        </div>
        <div className="why-list">
          <div className="why-row reveal">
            <span className="num">01</span>
            <h3>One price list, every category</h3>
            <p>A curated portfolio that lets integrators specify an entire project — displays, audio, control, connectivity — from a single distribution partner.</p>
          </div>
          <div className="why-row reveal">
            <span className="num">02</span>
            <h3>Real market access</h3>
            <p>Established dealer networks across the Middle East, Africa and Asia, with in-region stock, local currency and logistics built for each market.</p>
          </div>
          <div className="why-row reveal">
            <span className="num">03</span>
            <h3>Growth without competition</h3>
            <p>We support dealers with sales, marketing and promotion — and we never compete with them. Product specialists back every brand we carry.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="contact">
        <div className="cta-bg" aria-hidden="true">
          <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="" loading="lazy" />
        </div>
        <div className="cta-inner">
          <span className="label label--red">Partner with us</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">Your brand,</span></span>
            <span className="line-mask"><span className="w"><em>our region.</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact?s=partner" className="btn btn--solid">
                <span>Become a partner</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/contact?s=reseller" className="btn"><span>Become a reseller</span></Button>
            </div>
            <div className="cta-contacts">
              <div className="c-item"><span>Partnerships</span><a href="mailto:partners@mindstec.com">partners@mindstec.com</a></div>
              <div className="c-item"><span>India operations</span><a href="tel:+918045256922">+91 80 4525 6922</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Partners;
