import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../../context/RegionContext.jsx';
import { getPublicRegionData } from '../../api/regionApi.js';

gsap.registerPlugin(ScrollTrigger);

const SOLUTIONS_RAW = {
  'digital-signage': {
    name: 'Digital Signage',
    title: 'Digital <em>Signage</em>',
    intro: 'LED walls, professional display panels and wayfinding that turn retail floors, terminals and public spaces into media surfaces — with the software to run them.',
    fact: 'Retail · Transport · Public space',
    capsSide: 'From a single menu board to a stadium facade — hardware, software and mounting from one price list.',
    hero: { src: '/assets/img/pexels-3402937-w1920.jpg', alt: 'Tokyo street at night covered in glowing digital signs and screen facades' },
    caps: [
      ['Indoor & outdoor LED', 'Fine-pitch indoor walls to high-brightness outdoor facades, with the receiving cards, spares and service to keep them lit.'],
      ['Professional display panels', 'Commercial-grade panels rated for continuous operation — portrait, landscape, high-brightness and touch.'],
      ['Wayfinding & kiosks', 'Interactive totems and self-service kiosks for malls, airports, hospitals and campuses.'],
      ['CMS & scheduling', 'Content management, day-parting and remote monitoring for networks of one screen or one thousand.'],
    ],
    brands: ['Christie', 'Datapath', 'Polywall', 'B-Tech', 'MTC', 'Kordz'],
    gallery: [
      { src: '/assets/img/unsplash-1605810230434-7631ac76ec81-w1400.jpg', alt: 'A dark exhibition space with a suspended cluster of glowing display screens' },
      { src: '/assets/img/unsplash-1477959858617-67f85cf4f1df-w1100.jpg', alt: 'A city skyline at dusk seen from above' }
    ],
    next: 'control-rooms'
  },
  'control-rooms': {
    name: 'Control Rooms',
    title: 'Control <em>Rooms</em>',
    intro: '24/7-rated video walls, processors and operator workflows for command centres, surveillance suites and network operations — engineered for zero downtime.',
    fact: 'Command · Surveillance · NOC',
    capsSide: 'Mission-critical means no single point of failure — we spec redundancy from source to screen.',
    hero: { src: '/assets/img/pexels-11783119-w1920.jpg', alt: 'An operator facing a dark wall of monitors with red timecode displays' },
    caps: [
      ['Video wall processors', 'Hardware and software processing that puts any source on any display, at any size, without dropped frames.'],
      ['24/7 mission-critical displays', 'Panels and LED rated for round-the-clock duty cycles, with redundant power and burn-in management.'],
      ['KVM & operator desks', 'Low-latency KVM so operators control every system from one seat, plus console furniture and ergonomics.'],
      ['Source & layout management', 'Preset layouts, alarm-triggered views and multi-operator workflows for the moments that matter.'],
    ],
    brands: ['Datapath', 'Polywall', 'Christie', 'NETGEAR AV', 'Blustream'],
    gallery: [
      { src: '/assets/img/pexels-17323801-w1400.jpg', alt: 'A row of server racks bathed in deep blue light' },
      { src: '/assets/img/unsplash-1551288049-bebda4e38f71-w1100.jpg', alt: 'Analytics dashboards with charts on a dark screen' }
    ],
    next: 'conferencing'
  },
  'conferencing': {
    name: 'Conferencing & Collaboration',
    title: 'Conferencing &amp; <em>Collaboration</em>',
    intro: 'Hybrid meeting rooms that sound as good as they look — interactive displays, cameras, ceiling audio and the AV-over-IP backbone connecting them.',
    fact: 'Workplace · Education · Hybrid',
    capsSide: 'Rooms people actually want to book — from huddle spaces to boardrooms and lecture theatres.',
    hero: { src: '/assets/img/pexels-13323673-w1920.jpg', alt: 'A dark-toned conference room with a wall-mounted display and leather chairs' },
    caps: [
      ['Interactive displays', 'Touch collaboration displays for ideation, annotation and wireless presentation in any room size.'],
      ['Cameras & tracking', 'PTZ, ePTZ and auto-framing cameras that keep every participant in the shot, in any layout.'],
      ['Ceiling & beamforming audio', 'Microphones and speakers that disappear into the ceiling and still pick up the quietest voice.'],
      ['Booking & room intelligence', 'Scheduling panels, occupancy analytics and wayfinding that make the whole floor work harder.'],
    ],
    brands: ['Avocor', 'T1V', 'GoGet', 'iPort', 'SCT', 'Telycam'],
    gallery: [
      { src: '/assets/img/unsplash-1497366811353-6870744d04b2-w1400.jpg', alt: 'A modern glass and concrete meeting room with a wall-mounted display' },
      { src: '/assets/img/unsplash-1517245386807-bb43f82c33c4-w1100.jpg', alt: 'People in a meeting with a laptop on the table' }
    ],
    next: 'hospitality'
  },
  'hospitality': {
    name: 'Hospitality AV',
    title: 'Hospitality <em>AV</em>',
    intro: 'Guest-room entertainment, ballroom systems and background audio for hotels, restaurants and venues — technology that stays invisible until it matters.',
    fact: 'Hotels · Restaurants · Venues',
    capsSide: 'The best hospitality AV is the kind guests never notice — until the lights dim and the show starts.',
    hero: { src: '/assets/img/pexels-29870245-w1920.jpg', alt: 'A dark stone-walled luxury hotel lounge with glowing cube lamps' },
    caps: [
      ['Guest-room entertainment', 'IPTV headends, casting and in-room control that feel like home — branded for the property.'],
      ['Ballroom & event spaces', 'Divisible-room audio, projection and LED for conferences, weddings and everything between.'],
      ['Background music & paging', 'Zoned audio that follows the mood from breakfast to last orders, with paging built in.'],
      ['Interactive hospitality tablets', 'Smart tables and in-room tablets for ordering, concierge and guest services.'],
    ],
    brands: ['Humelab', 'Amino', 'Sonance', 'Lemco', 'iPort'],
    gallery: [
      { src: '/assets/img/unsplash-1551882547-ff40c63fe5fa-w1400.jpg', alt: 'A resort hotel courtyard with pools and palm trees at dusk' },
      { src: '/assets/img/unsplash-1566073771259-6a8506099945-w1100.jpg', alt: 'A resort pool deck with loungers at sunset' }
    ],
    next: 'broadcast'
  },
  'broadcast': {
    name: 'Broadcast & Production',
    title: 'Broadcast &amp; <em>Production</em>',
    intro: 'Cameras, switching, live graphics and streaming infrastructure for broadcasters, studios and creators — from single-operator setups to full facilities.',
    fact: 'Studios · Streaming · Creators',
    capsSide: 'From a one-person streaming desk to a national newsroom — the same signal discipline applies.',
    hero: { src: '/assets/img/pexels-7865064-w1920.jpg', alt: 'Two professional pedestal cameras in a dark television studio facing a lit set' },
    caps: [
      ['Studio & PTZ cameras', 'Broadcast-grade imaging from fixed studio chains to remotely operated PTZ fleets.'],
      ['Vision mixing & switching', 'Production switchers and routing for live programmes, sport and events.'],
      ['Live graphics & virtual sets', 'Real-time graphics, augmented reality and virtual studio tools used by the world’s broadcasters.'],
      ['Streaming & delivery', 'Encoders, IPTV and OTT delivery that get the programme to every screen, reliably.'],
    ],
    brands: ['Vizrt', 'SalrayWorks', 'Telycam', 'Amino', 'RDL'],
    gallery: [
      { src: '/assets/img/unsplash-1516035069371-29a1b244cc32-w1400.jpg', alt: 'Professional camera bodies and lenses laid out on a dark surface' },
      { src: '/assets/img/unsplash-1558494949-ef010cbdcc31-w1100.jpg', alt: 'Server racks with dense structured cabling in a dark room' }
    ],
    next: 'live-events'
  },
  'live-events': {
    name: 'Live Events & Immersive',
    title: 'Live Events &amp; <em>Immersive</em>',
    intro: 'Touring-grade LED, projection mapping and spatial audio for concerts, exhibitions and experiential spaces — built to survive the road.',
    fact: 'Concerts · Exhibitions · XR',
    capsSide: 'Rigged, run and struck in hours — event technology has no second chances, so we spec accordingly.',
    hero: { src: '/assets/img/pexels-13230484-w1920.jpg', alt: 'A night concert stage with red LED fixtures and blue beam lights over the crowd' },
    caps: [
      ['Touring & rental LED', 'Fast-lock touring frames, curved arrays and floor systems built for load-in after load-in.'],
      ['Projection mapping', 'High-output projection and warping tools for architecture, stages and art installations.'],
      ['Spatial & concert audio', 'Point-source and immersive audio systems that scale from galleries to arenas.'],
      ['Show control', 'Timecode, triggering and media servers keeping lights, video and sound on the same beat.'],
    ],
    brands: ['Christie', 'Magnum', 'Sonance', 'Kordz', 'Wavex'],
    gallery: [
      { src: '/assets/img/pexels-13136106-w1400.jpg', alt: 'A crowd silhouetted in a dark hall in front of a giant glowing projection' },
      { src: '/assets/img/unsplash-1492684223066-81342ee5ff30-w1100.jpg', alt: 'Confetti falling over a concert crowd under stage lights' }
    ],
    next: 'digital-signage'
  }
};


const SolutionDetails = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { regionSlug } = useRegion();
  const containerRef = useRef(null);

  const [regionBrands, setRegionBrands] = useState([]);

  // Fetch region brands whenever region changes
  useEffect(() => {
    let cancelled = false;
    getPublicRegionData(regionSlug)
      .then(res => {
        if (!cancelled) setRegionBrands(res.data.brands || []);
      })
      .catch(() => {
        if (!cancelled) setRegionBrands([]);
      });
    return () => { cancelled = true; };
  }, [regionSlug]);
  
  const slugs = ['digital-signage', 'control-rooms', 'conferencing', 'hospitality', 'broadcast', 'live-events'];
  const solIndex = slugs.indexOf(slug) !== -1 ? slugs.indexOf(slug) : 0;

  const getSolutionData = (s) => {
    const raw = SOLUTIONS_RAW[s] || SOLUTIONS_RAW['digital-signage'];
    return {
      ...raw,
      name: t(`solutions.details.${s}.name`, raw.name),
      title: t(`solutions.details.${s}.title`, raw.title),
      intro: t(`solutions.details.${s}.intro`, raw.intro),
      fact: t(`solutions.details.${s}.fact`, raw.fact),
      capsSide: t(`solutions.details.${s}.capsSide`, raw.capsSide),
      caps: raw.caps.map((c, i) => [
        t(`solutions.details.${s}.caps.${i}.title`, c[0]),
        t(`solutions.details.${s}.caps.${i}.desc`, c[1])
      ])
    };
  };

  const data = getSolutionData(slug);
  const nextData = getSolutionData(data.next);

  useEffect(() => {
    document.title = `${data.name} — Mindstec Distribution`;
    
    // Scroll window back to top immediately on route changes
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        gsap.set('.reveal-img', { clipPath: 'inset(0 0 0% 0)' });
        return;
      }

      // Reset scroll trigger coordinates
      ScrollTrigger.refresh();

      // Entrance timeline
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.fromTo('#dTitle .w', 
          { yPercent: 115, rotate: 2 }, 
          { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.1, ease: 'power4.out' })
        .fromTo('#dIntro', 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 1.0 }, 
          '-=.9')
        .fromTo('.dhero-row .fact', 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.8 }, 
          '-=.7');

      // Hero image parallax
      gsap.fromTo('#dHeroImg', { yPercent: -12 }, {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: {
          trigger: '.dhero-visual',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });

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

      // Next solution parallax
      gsap.fromTo('.next-bg img', { yPercent: 0 }, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.next-sol',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [slug, data.name]);

  const renderTitle = (titleHtml) => {
    const emIdx = titleHtml.indexOf('<em>');
    if (emIdx !== -1) {
      const line1 = titleHtml.slice(0, emIdx);
      const line2 = titleHtml.slice(emIdx);
      return (
        <>
          <span className="line-mask">
            <span className="w" dangerouslySetInnerHTML={{ __html: line1 }} />
          </span>
          <span className="line-mask">
            <span className="w" dangerouslySetInnerHTML={{ __html: line2 }} />
          </span>
        </>
      );
    }
    return (
      <span className="line-mask">
        <span className="w" dangerouslySetInnerHTML={{ __html: titleHtml }} />
      </span>
    );
  };

  return (
    <main id="top" ref={containerRef}>
      {/* DETAIL HERO */}
      <section className="dhero" aria-label={`${data.name} details`}>
        <div className="crumb">
          <Link to="/solutions">{t('navbar.solutions')}</Link>
          <i>·</i>
          <b id="crumbName">{data.name}</b>
        </div>
        <h1 className="display" id="dTitle">
          {renderTitle(data.title)}
        </h1>
        <div className="dhero-row">
          <p id="dIntro">{t(`solutions.arr.${solIndex}.desc`)}</p>
          <div className="fact">
            <b id="dFact">{t(`solutions.arr.${solIndex}.cat`)}</b>
            <span>{t('solutions.primary_verticals', 'Primary verticals')}</span>
          </div>
        </div>
        <div className="dhero-cta reveal" style={{ marginTop: 'clamp(24px, 3vw, 40px)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button solid to="/contact" id="dGetBtn">
            <span>{t('solutions.get_solution', 'Get this solution')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </Button>
          <Button to="/solutions"><span>{t('solutions.all_solutions', 'All solutions')}</span></Button>
        </div>
      </section>

      {/* HERO VISUAL */}
      <div className="dhero-visual reveal-img">
        <img id="dHeroImg" src={data.hero.src} alt={data.hero.alt} fetchpriority="high" />
      </div>

      {/* CAPABILITIES */}
      <section className="caps" aria-label="Capabilities">
        <div className="section-head">
          <div>
            <span className="label label--red">{t('solutions.capabilities', 'Capabilities')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>{t('solutions.what_we_deliver_main', 'What we')} <em>{t('solutions.what_we_deliver_em', 'deliver')}</em></h2>
          </div>
          <p className="lede side" id="dCapsSide">{t(`solutions.arr.${solIndex}.desc`)}</p>
        </div>
        <div className="caps-list" id="capsList">
          {data.caps.map(([h, p], i) => (
            <div className="cap reveal" key={i}>
              <span className="num">0{i + 1}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <div className="duo">
        <figure className="d1 reveal-img">
          <img id="dImg1" src={data.gallery[0].src} alt={data.gallery[0].alt} loading="lazy" />
        </figure>
        <figure className="d2 reveal-img">
          <img id="dImg2" src={data.gallery[1].src} alt={data.gallery[1].alt} loading="lazy" />
        </figure>
      </div>

      {/* BRANDS */}
      <section className="dbrands" aria-label="Brands for this vertical">
        <h2 className="display">{t('solutions.brands_we_distribute', 'Brands we distribute')} <em>{t('solutions.for_this_vertical', 'for this vertical')}</em></h2>
        <div className="dbrands-row" id="dBrandsRow">
          {regionBrands.length > 0
            ? regionBrands.map((brand, i) => (
                <a
                  key={i}
                  href={brand.website_url || '/partners'}
                  target={brand.website_url ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                >
                  <div className="bl-logo">
                    <img src={brand.logo} alt={`${brand.name} logo`} loading="lazy" />
                  </div>
                  <div className="bl-name">{brand.name}</div>
                </a>
              ))
            : <p style={{ color: 'var(--grey)', fontSize: '14px' }}>No brands listed for this region yet.</p>
          }
        </div>
      </section>

      {/* NEXT SOLUTION */}
      <Link className="next-sol" to={`/solutions/${data.next}`} aria-label={`Go to next vertical: ${nextData.name}`}>
        <div className="next-bg" aria-hidden="true">
          <img src={nextData.hero.src} alt={nextData.hero.alt} loading="lazy" />
        </div>
        <div className="next-inner">
          <div>
            <span className="label">{t('solutions.next')}</span>
            <h2 className="display" dangerouslySetInnerHTML={{ __html: nextData.title }} />
          </div>
          <div className="next-arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </div>
        </div>
      </Link>
    </main>
  );
};

export default SolutionDetails;
