import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../components/common/Button/Button.jsx';

gsap.registerPlugin(ScrollTrigger);

const Solutions = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        gsap.set('.reveal-img', { clipPath: 'inset(0 0 0% 0)' });
        return;
      }

      // Hero Entrance Timeline
      const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
      intro.fromTo('#sheroH .w', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.12 })
        .fromTo('#sheroSide', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, '-=.6')
        .fromTo('.shero-meta', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, '-=.5');

      // Generic reveals
      gsap.utils.toArray('.reveal').forEach(el => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            once: true,
          }
        });
      });

      gsap.utils.toArray('.reveal-img').forEach(el => {
        gsap.to(el, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.2,
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
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

    return () => ctx.revert();
  }, []);

  const solutions = [
    {
      id: '01',
      slug: 'digital-signage',
      cat: 'Retail · Transport · Public space',
      name: 'Digital Signage',
      desc: 'LED walls, professional display panels and wayfinding that turn retail floors, terminals and public spaces into media surfaces — with the software to run them.',
      tags: ['Indoor & outdoor LED', 'Display panels', 'Wayfinding', 'CMS & scheduling'],
      img: '/assets/img/pexels-3402937-w1400.jpg',
      alt: 'Tokyo street at night covered in glowing digital signs and screen facades'
    },
    {
      id: '02',
      slug: 'control-rooms',
      cat: 'Command · Surveillance · NOC',
      name: 'Control Rooms',
      desc: '24/7-rated video walls, processors and operator workflows for command centres, surveillance suites and network operations — engineered for zero downtime.',
      tags: ['Video wall processors', '24/7 displays', 'KVM', 'Source management'],
      img: '/assets/img/pexels-11783119-w1400.jpg',
      alt: 'An operator facing a dark wall of monitors with red timecode displays'
    },
    {
      id: '03',
      slug: 'conferencing',
      cat: 'Workplace · Education · Hybrid',
      name: 'Conferencing & Collaboration',
      desc: 'Hybrid meeting rooms that sound as good as they look — interactive displays, cameras, ceiling audio and the AV-over-IP backbone connecting them.',
      tags: ['Interactive displays', 'PTZ cameras', 'Ceiling audio', 'Room booking'],
      img: '/assets/img/pexels-13323673-w1400.jpg',
      alt: 'A dark-toned conference room with a wall-mounted display and leather chairs'
    },
    {
      id: '04',
      slug: 'hospitality',
      cat: 'Hotels · Restaurants · Venues',
      name: 'Hospitality AV',
      desc: 'Guest-room entertainment, ballroom systems and background audio for hotels, restaurants and venues — technology that stays invisible until it matters.',
      tags: ['Guest-room IPTV', 'Ballroom AV', 'Background audio', 'Hospitality tablets'],
      img: '/assets/img/pexels-29870245-w1400.jpg',
      alt: 'A dark stone-walled luxury hotel lounge with glowing cube lamps'
    },
    {
      id: '05',
      slug: 'broadcast',
      cat: 'Studios · Streaming · Creators',
      name: 'Broadcast & Production',
      desc: 'Cameras, switching, live graphics and streaming infrastructure for broadcasters, studios and creators — from single-operator setups to full facilities.',
      tags: ['Studio cameras', 'Vision mixing', 'Live graphics', 'Streaming'],
      img: '/assets/img/pexels-7865064-w1400.jpg',
      alt: 'Two professional pedestal cameras in a dark television studio facing a lit set'
    },
    {
      id: '06',
      slug: 'live-events',
      cat: 'Concerts · Exhibitions · XR',
      name: 'Live Events & Immersive',
      desc: 'Touring-grade LED, projection mapping and spatial audio for concerts, exhibitions and experiential spaces — built to survive the road.',
      tags: ['Touring LED', 'Projection mapping', 'Spatial audio', 'Show control'],
      img: '/assets/img/pexels-13230484-w1400.jpg',
      alt: 'A night concert stage with red LED fixtures and blue beam lights over the crowd'
    }
  ];

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="shero" aria-label="Our solutions">
        <h1 className="display" id="sheroH">
          <span className="line-mask"><span className="w">Every vertical.</span></span>
          <span className="line-mask"><span className="w"><em>One partner.</em></span></span>
        </h1>
        <div className="shero-side reveal" id="sheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>Solutions</span>
          <p>From a single meeting room to a national command centre — six AV verticals, one price list, and product specialists behind every category we distribute.</p>
        </div>
      </section>
      
      <div className="shero-meta reveal">
        <div className="fact"><b>6 verticals</b><span>Complete AV coverage</span></div>
        <div className="fact"><b>25 brands</b><span>Curated portfolio</span></div>
        <div className="fact"><b>1,000+ installs</b><span>Supplied &amp; supported</span></div>
      </div>

      {/* SOLUTION ROWS */}
      <div className="sol-flow" id="solFlow">
        {solutions.map(sol => (
          <article className="srow" key={sol.id}>
            <Link
              className="srow-media reveal-img"
              to={`/solutions/${sol.slug}`}
              aria-label={`Explore ${sol.name}`}
            >
              <img src={sol.img} alt={sol.alt} loading="lazy" />
              <span className="srow-cat">{sol.cat}</span>
            </Link>
            <div className="srow-body reveal">
              <span className="num">{sol.id}</span>
              <h2 className="display">
                <Link to={`/solutions/${sol.slug}`}>{sol.name}</Link>
              </h2>
              <p>{sol.desc}</p>
              <div className="srow-tags">
                {sol.tags.map((tag, idx) => (
                  <span key={idx}>{tag}</span>
                ))}
              </div>
              <Link className="srow-link" to={`/solutions/${sol.slug}`}>
                Explore {
                  sol.slug === 'conferencing' 
                    ? 'Conferencing' 
                    : sol.slug === 'broadcast' 
                      ? 'Broadcast' 
                      : sol.slug === 'live-events' 
                        ? 'Live Events' 
                        : sol.name
                }
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
          <span className="label label--red">Start a project</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">Tell us what the</span></span>
            <span className="line-mask"><span className="w">space needs <em>to do.</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact" className="btn btn--solid">
                <span>Get a quote</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/partners" className="btn"><span>See our brands</span></Button>
            </div>
            <div className="cta-contacts">
              <div className="c-item"><span>India operations</span><a href="tel:+918045256922">+91 80 4525 6922</a></div>
              <div className="c-item"><span>Global enquiries</span><a href="mailto:info@mindstec.com">info@mindstec.com</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Solutions;
