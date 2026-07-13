import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from 'react-i18next';

gsap.registerPlugin(ScrollTrigger);

const Solutions = () => {
  const { t } = useTranslation();
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

    return () => ctx.revert();
  }, []);

  const solutions = [
    {
      id: '01',
      slug: 'digital-signage',
      cat: t('solutions.arr.0.cat'),
      name: t('solutions.arr.0.name'),
      desc: t('solutions.arr.0.desc'),
      tags: [t('solutions.arr.0.tag1'), t('solutions.arr.0.tag2'), t('solutions.arr.0.tag3'), t('solutions.arr.0.tag4')],
      img: '/assets/img/pexels-3402937-w1400.jpg',
      alt: 'Tokyo street at night covered in glowing digital signs and screen facades'
    },
    {
      id: '02',
      slug: 'control-rooms',
      cat: t('solutions.arr.1.cat'),
      name: t('solutions.arr.1.name'),
      desc: t('solutions.arr.1.desc'),
      tags: [t('solutions.arr.1.tag1'), t('solutions.arr.1.tag2'), t('solutions.arr.1.tag3'), t('solutions.arr.1.tag4')],
      img: '/assets/img/pexels-11783119-w1400.jpg',
      alt: 'An operator facing a dark wall of monitors with red timecode displays'
    },
    {
      id: '03',
      slug: 'conferencing',
      cat: t('solutions.arr.2.cat'),
      name: t('solutions.arr.2.name'),
      desc: t('solutions.arr.2.desc'),
      tags: [t('solutions.arr.2.tag1'), t('solutions.arr.2.tag2'), t('solutions.arr.2.tag3'), t('solutions.arr.2.tag4')],
      img: '/assets/img/pexels-13323673-w1400.jpg',
      alt: 'A dark-toned conference room with a wall-mounted display and leather chairs'
    },
    {
      id: '04',
      slug: 'hospitality',
      cat: t('solutions.arr.3.cat'),
      name: t('solutions.arr.3.name'),
      desc: t('solutions.arr.3.desc'),
      tags: [t('solutions.arr.3.tag1'), t('solutions.arr.3.tag2'), t('solutions.arr.3.tag3'), t('solutions.arr.3.tag4')],
      img: '/assets/img/pexels-29870245-w1400.jpg',
      alt: 'A dark stone-walled luxury hotel lounge with glowing cube lamps'
    },
    {
      id: '05',
      slug: 'broadcast',
      cat: t('solutions.arr.4.cat'),
      name: t('solutions.arr.4.name'),
      desc: t('solutions.arr.4.desc'),
      tags: [t('solutions.arr.4.tag1'), t('solutions.arr.4.tag2'), t('solutions.arr.4.tag3'), t('solutions.arr.4.tag4')],
      img: '/assets/img/pexels-7865064-w1400.jpg',
      alt: 'Two professional pedestal cameras in a dark television studio facing a lit set'
    },
    {
      id: '06',
      slug: 'live-events',
      cat: t('solutions.arr.5.cat'),
      name: t('solutions.arr.5.name'),
      desc: t('solutions.arr.5.desc'),
      tags: [t('solutions.arr.5.tag1'), t('solutions.arr.5.tag2'), t('solutions.arr.5.tag3'), t('solutions.arr.5.tag4')],
      img: '/assets/img/pexels-13230484-w1400.jpg',
      alt: 'A night concert stage with red LED fixtures and blue beam lights over the crowd'
    }
  ];

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
              <div className="c-item"><span>{t('contact_info.label')}</span><a href={`tel:${t('contact_info.tel_href')}`}>{t('contact_info.tel_label')}</a></div>
              <div className="c-item"><span>Email</span><a href={`mailto:${t('contact_info.email')}`}>{t('contact_info.email')}</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Solutions;
