import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';


gsap.registerPlugin(ScrollTrigger);

const About = () => {
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
      intro.fromTo('#aheroH .w', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.12 })
        .fromTo('#aheroSide', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, '-=.6')
        .fromTo('.ahero-meta', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, '-=.5');

      // Hero image parallax
      gsap.fromTo('#aheroImg', { yPercent: -8 }, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: '.ahero-visual',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });

      // Story word ink-in
      gsap.to('.story-text .st-w', {
        color: '#FAFAFA',
        stagger: 0.5,
        ease: 'none',
        scrollTrigger: {
          trigger: '.story',
          start: 'top 70%',
          end: 'top 5%',
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

      gsap.utils.toArray('.section-head').forEach(head => {
        gsap.fromTo(head.querySelectorAll('h2, .label, .side'),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
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

      // Team grid stagger
      gsap.fromTo('.member', { opacity: 0, y: 44 }, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.09,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#teamGrid',
          start: 'top 82%',
          once: true,
        }
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

  const renderWords = (str) => {
    return str.split(/(\s+)/).map((word, i) => {
      if (/^\s+$/.test(word)) return word;
      if (!word) return null;
      return (
        <span key={i} className="st-w inline-block">
          {word}
        </span>
      );
    });
  };

  const team = [
    { name: 'Syed Abdul Wahab', role: 'Founder & CEO', img: '/assets/uploads/2026/04/WhatsApp-Image-2026-04-09-at-11.41.55-AM.jpeg' },
    { name: 'Sabarishan N.', role: 'Managing Director', img: '/assets/uploads/2026/05/Sab-White-Bankground-1.jpg' },
    { name: 'Manasa Iyer', role: 'Admin & Finance Director', img: '/assets/uploads/2026/04/WhatsApp-Image-2026-04-02-at-3.44.53-PM.jpeg' },
    { name: 'Karthikeyan Sekar', role: 'Regional Manager, Sales — South', img: '/assets/uploads/2026/04/Karthikeyan-Sekar-Profile-Pic.jpg-5.jpeg' },
    { name: 'Sneha Shenoy', role: 'HR Operations Manager', img: '/assets/uploads/2026/03/image2.png' },
    { name: 'Karthikeyan Selvaraj', role: 'Country Head, Projects & Service Support', img: '/assets/uploads/2026/03/image3.png' },
    { name: 'Flavia Robert', role: 'Finance & Administration Manager', img: '/assets/uploads/2026/03/image4.png' },
    { name: 'Sajid Ali Kazi', role: 'Regional Sales Manager', img: '/assets/uploads/2026/03/image6.png' }
  ];

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="ahero" aria-label="About Mindstec Distribution">
        <h1 className="display" id="aheroH">
          <span className="line-mask"><span className="w">Passion.</span></span>
          <span className="line-mask"><span className="w">Purpose.</span></span>
          <span className="line-mask"><span className="w"><em>Progress.</em></span></span>
        </h1>
        <div className="ahero-side reveal" id="aheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>About Us</span>
          <p>Mindstec Distribution is a leading procurement and distribution specialist for high-end audio-visual solutions across the Middle East, Africa and Asia — bringing cutting-edge AV technology to these regions at accessible prices.</p>
          <Button href="#team" className="btn">
            <span>Meet the team</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </Button>
        </div>
      </section>

      <div className="ahero-meta reveal">
        <div className="fact"><b>Middle East · Africa · Asia</b><span>Regions served</span></div>
        <div className="fact"><b>Global partner network</b><span>Manufacturers to dealers</span></div>
        <div className="fact"><b>Bangalore HQ</b><span>India — SAARC operations</span></div>
      </div>

      {/* HERO VISUAL */}
      <div className="ahero-visual reveal-img">
        <img id="aheroImg" src="/assets/uploads/2025/03/about-img-1.jpg" alt="A curved wall of bright video displays inside a dark showroom" fetchpriority="high" />
        <span className="caption">High-end AV, delivered</span>
      </div>

      {/* STORY */}
      <section className="story" aria-label="Our story">
        <div>
          <div className="story-text" id="storyText">
            <p>
              {renderWords("We bridge the gap between global AV manufacturers and regional dealers — optimising supply chains, reducing costs and improving the efficiency of every operation in between.")}
            </p>
            <p>
              {renderWords("With deep market knowledge and a tech-savvy team, we help the world's AV brands expand into new markets, and we support our dealers with sales, marketing and promotion — fostering growth without competition.")}
            </p>
          </div>
          <div className="story-more reveal">
            <p>Committed to innovation and customer support, we continuously invest in technical expertise, ensuring seamless integration of AV solutions in high-profile projects worldwide.</p>
            <p>Driven by excellence and innovation, we empower businesses to stay at the forefront of the evolving AV industry.</p>
          </div>
        </div>
        <div className="story-visual">
          <figure className="sv1 reveal-img">
            <img src="/assets/uploads/2025/03/about-img-2.jpg" alt="Extreme close-up of an LED display panel glowing magenta and red" loading="lazy" />
            <figcaption>Pixel-level expertise</figcaption>
          </figure>
          <figure className="sv2 reveal-img">
            <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="Macro view of an LED video wall surface in blue and pink light" loading="lazy" />
            <figcaption>Display technology</figcaption>
          </figure>
        </div>
      </section>

      <div className="rule"></div>

      {/* PILLARS */}
      <section className="pillars" aria-label="What we do">
        <div className="section-head">
          <div>
            <span className="label label--red">What we do</span>
            <h2 className="display" style={{ marginTop: '16px' }}>Built on three <em>pillars.</em></h2>
          </div>
        </div>
        <div className="pillar-list">
          <div className="pillar reveal">
            <span className="num">01</span>
            <h3>Market access for manufacturers</h3>
            <p>We help global AV manufacturers expand into the Middle East, Africa and Asia — with local knowledge, an established dealer network and in-region logistics.</p>
          </div>
          <div className="pillar reveal">
            <span className="num">02</span>
            <h3>Optimised supply chains</h3>
            <p>Procurement, warehousing and distribution tuned for the region — reducing costs, shortening lead times and improving the efficiency of every project.</p>
          </div>
          <div className="pillar reveal">
            <span className="num">03</span>
            <h3>Dealer enablement</h3>
            <p>Sales, marketing and promotional support for our dealers, plus the technical expertise to integrate AV solutions in high-profile projects — growth without competition.</p>
          </div>
        </div>
      </section>

      {/* VISION / MISSION */}
      <section className="vm-wrap" aria-label="Vision and mission" style={{ padding: '0 0 clamp(80px,10vw,140px)' }}>
        <div className="vm">
          <div className="vm-cell reveal">
            <span className="num">01</span>
            <h3>Our <em>Vision</em></h3>
            <p>To be a distribution leader in futuristic, convergent, technology-driven system solutions.</p>
          </div>
          <div className="vm-cell reveal">
            <span className="num">02</span>
            <h3>Our <em>Mission</em></h3>
            <p>To be a regional leader in cutting-edge audio-visual system solution distribution — creating immense value for our supplier-dealer networks while being first and fastest in bringing the latest technology to the region.</p>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="team" id="team">
        <div className="section-head">
          <div>
            <span className="label label--red">Our team</span>
            <h2 className="display" style={{ marginTop: '16px' }}>Making an impact,<br />one step at a <em>time</em></h2>
          </div>
          <p className="lede side">Industry experts, innovators and problem-solvers — collaborating to deliver top-tier AV solutions and seamless experiences for our partners.</p>
        </div>
        <div className="team-grid" id="teamGrid">
          {team.map((member, i) => (
            <div className="member" key={i}>
              <div className="photo">
                <span className="m-index">{String(i + 1).padStart(2, '0')}</span>
                <img src={member.img} alt={`Portrait of ${member.name}`} loading="lazy" />
              </div>
              <div className="m-line"></div>
              <h3>{member.name}</h3>
              <div className="m-role">{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta" id="contact">
        <div className="cta-bg" aria-hidden="true">
          <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="" loading="lazy" />
        </div>
        <div className="cta-inner">
          <span className="label label--red">Become a reseller</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">Start selling.</span></span>
            <span className="line-mask"><span className="w"><em>Start growing.</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact?s=reseller" className="btn btn--solid">
                <span>Become a reseller</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/contact" className="btn"><span>Contact us</span></Button>
            </div>
            <div className="cta-contacts">
              <div className="c-item"><span>India operations</span><a href="tel:+918045256922">+91 80 4525 6922</a></div>
              <div className="c-item"><span>Email</span><a href="mailto:india@mindstec.com">india@mindstec.com</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
