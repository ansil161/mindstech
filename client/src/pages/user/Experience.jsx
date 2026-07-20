import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../../context/RegionContext.jsx';
import { getPublicRegionData } from '../../api/regionApi.js';


gsap.registerPlugin(ScrollTrigger);

const Experience = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [coverHidden, setCoverHidden] = useState(false);
  
  const { regionSlug } = useRegion();
  const [regionContact, setRegionContact] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchRegionContact = async () => {
      if (!regionSlug) return;
      try {
        const res = await getPublicRegionData(regionSlug);
        if (!cancelled) {
          setRegionContact(Array.isArray(res.data.contact_info) ? res.data.contact_info[0] : (res.data.contact_info || null));
        }
      } catch (err) {
        if (!cancelled) setRegionContact(null);
      }
    };
    fetchRegionContact();
    return () => { cancelled = true; };
  }, [regionSlug]);

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
      intro.fromTo('#xheroImg', { scale: 1.08 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0)
        .fromTo('#xheroLabel', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, 0.1)
        .fromTo('#xheroH .w', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.2)
        .fromTo('#xheroFoot', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, '-=.55')
        .fromTo('.xhero-meta', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, '-=.5');

      // Hero parallax
      gsap.fromTo('#xheroImg', { yPercent: 0 }, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.xhero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });

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

      // CTA reveals
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

  // Video scroll pause detector
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting && !video.paused) {
          video.pause();
        }
      });
    }, { threshold: 0.15 });

    observer.observe(video);
    return () => {
      observer.unobserve(video);
    };
  }, []);

  const handlePlayFilm = () => {
    setCoverHidden(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleKeyDownFilm = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePlayFilm();
    }
  };

  const zones = [
    { id: '01', slug: 'control-rooms', name: t('experience.zones_arr.0.name'), desc: t('experience.zones_arr.0.desc'), img: '/assets/img/pexels-11783119-w1400.jpg' },
    { id: '02', slug: 'conferencing', name: t('experience.zones_arr.1.name'), desc: t('experience.zones_arr.1.desc'), img: '/assets/img/pexels-13323673-w1400.jpg' },
    { id: '03', slug: 'digital-signage', name: t('experience.zones_arr.2.name'), desc: t('experience.zones_arr.2.desc'), img: '/assets/img/pexels-3402937-w1400.jpg' },
    { id: '04', slug: 'broadcast', name: t('experience.zones_arr.3.name'), desc: t('experience.zones_arr.3.desc'), img: '/assets/img/pexels-7865064-w1400.jpg' },
    { id: '05', slug: 'hospitality', name: t('experience.zones_arr.4.name'), desc: t('experience.zones_arr.4.desc'), img: '/assets/img/pexels-29870245-w1400.jpg' },
    { id: '06', slug: 'conferencing', name: t('experience.zones_arr.5.name'), desc: t('experience.zones_arr.5.desc'), img: '/assets/img/unsplash-1558494949-ef010cbdcc31-w1400.jpg' }
  ];

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="xhero" aria-label="The Mindstec Experience Centre">
        <div className="xhero-bg" aria-hidden="true">
          <img src="/assets/img/unsplash-1605810230434-7631ac76ec81-w2000.jpg" alt="" id="xheroImg" />
        </div>
        <div className="xhero-inner">
          <span className="label label--red reveal" id="xheroLabel">{t('experience.hero.label')}</span>
          <h1 className="display" id="xheroH">
            <span className="line-mask"><span className="w">{t('experience.hero.line1')}</span></span>
            <span className="line-mask"><span className="w"><em>{t('experience.hero.line2')}</em></span></span>
          </h1>
          <div className="xhero-foot reveal" id="xheroFoot">
            <p className="lede">{t('experience.hero.desc')}</p>
            <div className="xhero-actions">
              <Button to="/contact?s=visit" className="btn btn--solid">
                <span>{t('experience.hero.book')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button href="#film" className="btn">
                <span>{t('experience.hero.film')}</span>
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <div className="xhero-meta reveal">
        <div className="fact"><b>{t('experience.meta.zones_b')}</b><span>{t('experience.meta.zones_s')}</span></div>
        <div className="fact"><b>{t('experience.meta.brands_b')}</b><span>{t('experience.meta.brands_s')}</span></div>
        <div className="fact"><b>{t('experience.meta.loc_b')}</b><span>{t('experience.meta.loc_s')}</span></div>
        <div className="fact"><b>{t('experience.meta.appt_b')}</b><span>{t('experience.meta.appt_s')}</span></div>
      </div>

      {/* OVERVIEW */}
      <section className="ov" aria-label="Overview">
        <div className="ov-label reveal"><span className="label label--red">{t('experience.ov.label')}</span></div>
        <div>
          <p className="ov-state reveal">&gt;{t('experience.ov.lede')}&lt;</p>
          <div className="ov-copy reveal">
            <p>{t('experience.ov.p1')}</p>
            <p>{t('experience.ov.p2')}</p>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* ZONES */}
      <section className="zones" aria-label="Demo zones on the floor">
        <div className="zones-head">
          <div className="reveal">
            <span className="label label--red">{t('experience.meta.brands_s')}</span>
            <h2 className="display">{t('experience.zones.title', 'Six zones. All ')}<em>{t('experience.zones.title_em')}</em>.</h2>
          </div>
          <p className="reveal">{t('experience.zones.desc', 'Every zone runs shipping product — no mock-ups, no renders. Walk from one vertical to the next and see how the pieces interoperate.')}</p>
        </div>
        <div className="zgrid">
          {zones.map((zone) => (
            <Link className="zcard" to={`/solutions/${zone.slug}`} key={zone.id}>
              <div className="zcard-media reveal-img">
                <img src={zone.img} alt={zone.name} loading="lazy" />
                <span className="zcat">Zone {zone.id}</span>
              </div>
              <div className="zcard-body reveal">
                <div className="ztitle"><span className="num">{zone.id}</span><h3>{zone.name}</h3></div>
                <p>{zone.desc}</p>
                <span className="zcard-go">
                  {t('experience.zones.explore', 'Explore the vertical')}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="rule"></div>

      {/* FILM */}
      <section className="film" id="film" aria-label="Experience Centre film">
        <div className="film-head reveal">
          <span className="label label--red">{t('experience.film.label', 'The film')}</span>
          <h2 className="display">{t('experience.film.line1', 'Step inside before ')}<em>{t('experience.film.line2', 'you step inside.')}</em></h2>
        </div>
        <div className="film-frame reveal-img">
          <video
            ref={videoRef}
            id="xcVideo"
            preload="none"
            playsInline
            controls
            poster="/assets/img/pexels-17323801-w1920.jpg"
            aria-label="Video tour of the Mindstec Experience Centre in Bengaluru"
          >
            <source src="https://www.mindstec.com/wp-content/uploads/2025/05/Mindstec-Experience-Centre.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div
            className={`film-cover ${coverHidden ? 'is-hidden' : ''}`}
            id="filmCover"
            role="button"
            tabIndex={0}
            aria-label="Play the Experience Centre film"
            onClick={handlePlayFilm}
            onKeyDown={handleKeyDownFilm}
            style={{ backgroundImage: "url('/assets/img/pexels-17323801-w1920.jpg')" }}
          >
            <span className="film-play" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" /></svg>
            </span>
            <span className="film-tag">{t('experience.film.tag', 'Mindstec Experience Centre — Bengaluru')}</span>
          </div>
        </div>
        <p className="film-note">{t('experience.film.note', 'Filmed on the floor of our Bengaluru centre. Streams on demand — press play.')}</p>
      </section>

      <div className="rule"></div>

      {/* WHO */}
      <section className="who" aria-label="Who the centre is for">
        <div className="who-head reveal">
          <span className="label label--red">{t('experience.who.label', "Who it's for")}</span>
          <h2 className="display">{t('experience.who.title', 'Built for the people ')}<em>{t('experience.who.title_em', 'who decide.')}</em></h2>
        </div>
        <div className="who-grid reveal">
          <div className="who-cell">
            <span className="num">01</span>
            <h3>{t('experience.who.arr.0.name', 'Consultants')}</h3>
            <p>{t('experience.who.arr.0.desc', 'Validate a specification against live hardware before it goes to tender — compare brands in the same room, under the same light, on the same network.')}</p>
          </div>
          <div className="who-cell">
            <span className="num">02</span>
            <h3>{t('experience.who.arr.1.name', 'System Integrators')}</h3>
            <p>{t('experience.who.arr.1.desc', 'Prove a design to your client without building a demo room of your own. Bring them in, walk the floor, and close on what they\'ve already seen working.')}</p>
          </div>
          <div className="who-cell">
            <span className="num">03</span>
            <h3>{t('experience.who.arr.2.name', 'Enterprise Clients')}</h3>
            <p>{t('experience.who.arr.2.desc', 'Choosing a standard for a hundred rooms? Sit in one first. Test the workflow, the audio and the ergonomics before you commit the budget.')}</p>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* VISIT */}
      <section className="visit" aria-label="Plan your visit">
        <div className="visit-left reveal">
          <span className="label label--red">{t('experience.visit.label', 'Plan your visit')}</span>
          <h2 className="display">{t('experience.visit.line1', 'See it running, ')}<em>{t('experience.visit.line2', 'in person.')}</em></h2>
          <p>{t('experience.visit.desc', 'Visits are guided and by appointment, so the floor is set up around what you\'re evaluating. Tell us what you want to see and we\'ll have it live when you arrive.')}</p>
          <div className="visit-actions">
            <Button to="/contact?s=visit" className="btn btn--solid">
              <span>{t('experience.hero.book')}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </Button>
            <a
              className="btn"
              href="https://www.google.com/maps/place/MINDSTEC+DISTRIBUTION+PRIVATE+LIMITED/@13.0108201,77.6558671,849m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bae171505942e5f:0x89ccc127b403eb0e!8m2!3d13.0108201!4d77.658442!16s%2Fg%2F11ckqsxnqv"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t('experience.visit.maps', 'Open in Google Maps')}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        </div>
        <div className="visit-rows">
          <div className="vrow reveal">
            <span className="num">01</span>
            <div>
              <h4>{regionContact?.office_name || t('experience.visit.arr.0.title', 'Where')}</h4>
              <p style={{ whiteSpace: 'pre-wrap' }}>{regionContact?.address || t('experience.visit.arr.0.desc', 'No. 5M-645, Banaswadi Village, OMBR Layout, Bangalore 560043, India')}</p>
            </div>
          </div>
          <div className="vrow reveal">
            <span className="num">02</span>
            <div>
              <h4>{t('experience.visit.arr.1.title', 'Call ahead')}</h4>
              <a href={`tel:${(regionContact?.phone_display || regionContact?.phone || t('contact_info.tel_href')).replace(/[^+\\d]/g, '')}`}>
                {regionContact?.phone_display || regionContact?.phone || t('contact_info.tel_label')}
              </a>
              <p className="sub-note">{t('experience.visit.arr.1.desc', 'Mon–Fri, business hours IST')}</p>
            </div>
          </div>
          <div className="vrow reveal">
            <span className="num">03</span>
            <div>
              <h4>{t('experience.visit.arr.2.title', 'Write to us')}</h4>
              <a href={`mailto:${regionContact?.email || t('contact_info.email')}`}>
                {regionContact?.email || t('contact_info.email')}
              </a>
              <p className="sub-note">{t('experience.visit.arr.2.desc', 'Tell us which zones you want live')}</p>
            </div>
          </div>
          <div className="vrow reveal">
            <span className="num">04</span>
            <div>
              <h4>{t('experience.visit.arr.3.title', 'Format')}</h4>
              <p>{t('experience.visit.arr.3.desc', 'Guided walkthrough, 60–90 minutes')}</p>
              <p className="sub-note">{t('experience.visit.arr.3.sub', 'With a product specialist for your vertical')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="contact">
        <div className="cta-bg" aria-hidden="true">
          <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="" loading="lazy" />
        </div>
        <div className="cta-inner">
          <span className="label label--red">{t('experience.cta.next', 'Next step')}</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">{t('experience.cta.line1', 'Start selling.')}</span></span>
            <span className="line-mask"><span className="w"><em>{t('experience.cta.line2', 'Start growing.')}</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact?s=visit" className="btn btn--solid">
                <span>{t('experience.hero.book')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/solutions" className="btn"><span>{t('experience.cta.solutions', 'See all solutions')}</span></Button>
            </div>
            <div className="cta-contacts">
              <div className="c-item">
                <span>{t('contact_info.label')}</span>
                <a href={`tel:${(regionContact?.phone_display || regionContact?.phone || t('contact_info.tel_href')).replace(/[^+\\d]/g, '')}`}>
                  {regionContact?.phone_display || regionContact?.phone || t('contact_info.tel_label')}
                </a>
              </div>
              <div className="c-item">
                <span>{t('contact_info.partner_label')}</span>
                <a href={`mailto:${regionContact?.email || t('contact_info.partner_email')}`}>
                  {regionContact?.email || t('contact_info.partner_email')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Experience;
