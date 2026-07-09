import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../components/common/Button/Button.jsx';

gsap.registerPlugin(ScrollTrigger);

const Experience = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [coverHidden, setCoverHidden] = useState(false);

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
    { id: '01', slug: 'control-rooms', name: 'Control Room Wall', desc: 'A 24/7-rated video wall driven by live processors — switch sources, split layouts and stress-test the workflow your operators will actually use.', img: '/assets/img/pexels-11783119-w1400.jpg' },
    { id: '02', slug: 'conferencing', name: 'Collaboration Suite', desc: 'A fully wired hybrid meeting room — interactive display, PTZ cameras, ceiling audio and room booking, joined to a real call so you can hear the difference.', img: '/assets/img/pexels-13323673-w1400.jpg' },
    { id: '03', slug: 'digital-signage', name: 'Signage Gallery', desc: 'Indoor LED, professional panels and wayfinding running scheduled content from a live CMS — compare brightness, pitch and processing side by side.', img: '/assets/img/pexels-3402937-w1400.jpg' },
    { id: '04', slug: 'broadcast', name: 'Broadcast Corner', desc: 'Cameras, vision mixing and live graphics in a compact production setup — see a multi-camera stream go from lens to output in one take.', img: '/assets/img/pexels-7865064-w1400.jpg' },
    { id: '05', slug: 'hospitality', name: 'Audio & Hospitality Lounge', desc: 'Invisible and architectural speakers, guest-room IPTV and background audio staged as a lounge — technology that disappears until you press play.', img: '/assets/img/pexels-29870245-w1400.jpg' },
    { id: '06', slug: 'conferencing', name: 'AV-over-IP Backbone', desc: 'The rack room that ties the floor together — AV-over-IP switching, extension and control, so you can trace every signal path end to end.', img: '/assets/img/unsplash-1558494949-ef010cbdcc31-w1400.jpg' }
  ];

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="xhero" aria-label="The Mindstec Experience Centre">
        <div className="xhero-bg" aria-hidden="true">
          <img src="/assets/img/unsplash-1605810230434-7631ac76ec81-w2000.jpg" alt="" id="xheroImg" />
        </div>
        <div className="xhero-inner">
          <span className="label label--red reveal" id="xheroLabel">Experience Centre — Bengaluru</span>
          <h1 className="display" id="xheroH">
            <span className="line-mask"><span className="w">Don't imagine it.</span></span>
            <span className="line-mask"><span className="w"><em>Walk into it.</em></span></span>
          </h1>
          <div className="xhero-foot reveal" id="xheroFoot">
            <p className="lede">A hands-on floor where technology meets functionality — live control rooms, collaboration suites, signage and broadcast, running side by side so you can judge them the way your clients will.</p>
            <div className="xhero-actions">
              <Button to="/contact?s=visit" className="btn btn--solid">
                <span>Book a visit</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button href="#film" className="btn">
                <span>Watch the film</span>
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M8 5.5v13l11-6.5z" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <div className="xhero-meta reveal">
        <div className="fact"><b>6 live zones</b><span>Running demos daily</span></div>
        <div className="fact"><b>25 brands</b><span>On the floor</span></div>
        <div className="fact"><b>OMBR Layout</b><span>Bangalore, India</span></div>
        <div className="fact"><b>By appointment</b><span>Guided walkthroughs</span></div>
      </div>

      {/* OVERVIEW */}
      <section className="ov" aria-label="Overview">
        <div className="ov-label reveal"><span className="label label--red">Overview</span></div>
        <div>
          <p className="ov-state reveal">Spec sheets tell you what a system should do. The Experience Centre shows you what it <em>actually does</em> — live, integrated, and under real conditions.</p>
          <div className="ov-copy reveal">
            <p>Our Bengaluru Experience Centre is a dynamic, hands-on environment designed to showcase the power of integrated AV. The floor runs live demonstrations of control room systems, collaborative meeting technologies, digital signage and more — real products from 25 global brands, wired together the way they'd be deployed on site.</p>
            <p>Visitors explore real-world applications, test system interoperability across brands, and work directly with our technical experts. Whether you're a consultant writing a spec, an integrator validating a design, or an enterprise client choosing a standard — this is the shortest path from shortlist to certainty.</p>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* ZONES */}
      <section className="zones" aria-label="Demo zones on the floor">
        <div className="zones-head">
          <div className="reveal">
            <span className="label label--red">On the floor</span>
            <h2 className="display">Six zones. All <em>live.</em></h2>
          </div>
          <p className="reveal">Every zone runs shipping product — no mock-ups, no renders. Walk from one vertical to the next and see how the pieces interoperate.</p>
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
                  Explore the vertical 
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
          <span className="label label--red">The film</span>
          <h2 className="display">Step inside before <em>you step inside.</em></h2>
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
            <span className="film-tag">Mindstec Experience Centre — Bengaluru</span>
          </div>
        </div>
        <p className="film-note">Filmed on the floor of our Bengaluru centre. Streams on demand — press play.</p>
      </section>

      <div className="rule"></div>

      {/* WHO */}
      <section className="who" aria-label="Who the centre is for">
        <div className="who-head reveal">
          <span className="label label--red">Who it's for</span>
          <h2 className="display">Built for the people <em>who decide.</em></h2>
        </div>
        <div className="who-grid reveal">
          <div className="who-cell">
            <span className="num">01</span>
            <h3>Consultants</h3>
            <p>Validate a specification against live hardware before it goes to tender — compare brands in the same room, under the same light, on the same network.</p>
          </div>
          <div className="who-cell">
            <span className="num">02</span>
            <h3>System Integrators</h3>
            <p>Prove a design to your client without building a demo room of your own. Bring them in, walk the floor, and close on what they've already seen working.</p>
          </div>
          <div className="who-cell">
            <span className="num">03</span>
            <h3>Enterprise Clients</h3>
            <p>Choosing a standard for a hundred rooms? Sit in one first. Test the workflow, the audio and the ergonomics before you commit the budget.</p>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* VISIT */}
      <section className="visit" aria-label="Plan your visit">
        <div className="visit-left reveal">
          <span className="label label--red">Plan your visit</span>
          <h2 className="display">See it running, <em>in person.</em></h2>
          <p>Visits are guided and by appointment, so the floor is set up around what you're evaluating. Tell us what you want to see and we'll have it live when you arrive.</p>
          <div className="visit-actions">
            <Button to="/contact?s=visit" className="btn btn--solid">
              <span>Book a visit</span>
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
              <span>Open in Google Maps</span>
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
              <h4>Where</h4>
              <p>No. 5M-645, Banaswadi Village,<br />OMBR Layout, Bangalore 560043, India</p>
            </div>
          </div>
          <div className="vrow reveal">
            <span className="num">02</span>
            <div>
              <h4>Call ahead</h4>
              <a href="tel:+918045256922">+91 80 4525 6922</a>
              <p className="sub-note">Mon–Fri, business hours IST</p>
            </div>
          </div>
          <div className="vrow reveal">
            <span className="num">03</span>
            <div>
              <h4>Write to us</h4>
              <a href="mailto:india@mindstec.com">india@mindstec.com</a>
              <p className="sub-note">Tell us which zones you want live</p>
            </div>
          </div>
          <div className="vrow reveal">
            <span className="num">04</span>
            <div>
              <h4>Format</h4>
              <p>Guided walkthrough, 60–90 minutes</p>
              <p className="sub-note">With a product specialist for your vertical</p>
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
          <span className="label label--red">Next step</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">Start selling.</span></span>
            <span className="line-mask"><span className="w"><em>Start growing.</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact?s=visit" className="btn btn--solid">
                <span>Book a visit</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/solutions" className="btn"><span>See all solutions</span></Button>
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

export default Experience;
