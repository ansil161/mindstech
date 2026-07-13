import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from 'react-i18next';


gsap.registerPlugin(ScrollTrigger);

const About = () => {
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
      intro.fromTo('#aheroH .w', 
          { yPercent: 115, rotate: 2 }, 
          { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.1, ease: 'power4.out' })
        .fromTo('#aheroSide', 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 1.0 }, 
          '-=.8')
        .fromTo('.ahero-meta', 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 0.8 }, 
          '-=.6');

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
      gsap.fromTo('.story-text .st-w', 
        { opacity: 0.18 },
        {
          opacity: 1,
          color: '#FAFAFA',
          stagger: 0.35,
          ease: 'none',
          scrollTrigger: {
            trigger: '.story',
            start: 'top 75%',
            end: 'top 15%',
            scrub: true,
          }
        }
      );

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
    { name: t('about.team.names.founder'), role: t('about.team.roles.founder'), img: '/assets/uploads/2026/04/WhatsApp-Image-2026-04-09-at-11.41.55-AM.jpeg' },
    { name: t('about.team.names.md'), role: t('about.team.roles.md'), img: '/assets/uploads/2026/05/Sab-White-Bankground-1.jpg' },
    { name: t('about.team.names.finance_dir'), role: t('about.team.roles.finance_dir'), img: '/assets/uploads/2026/04/WhatsApp-Image-2026-04-02-at-3.44.53-PM.jpeg' },
    { name: t('about.team.names.sales_south'), role: t('about.team.roles.sales_south'), img: '/assets/uploads/2026/04/Karthikeyan-Sekar-Profile-Pic.jpg-5.jpeg' },
    { name: t('about.team.names.hr'), role: t('about.team.roles.hr'), img: '/assets/uploads/2026/03/image2.png' },
    { name: t('about.team.names.country_head'), role: t('about.team.roles.country_head'), img: '/assets/uploads/2026/03/image3.png' },
    { name: t('about.team.names.finance_mgr'), role: t('about.team.roles.finance_mgr'), img: '/assets/uploads/2026/03/image4.png' },
    { name: t('about.team.names.sales_mgr'), role: t('about.team.roles.sales_mgr'), img: '/assets/uploads/2026/03/image6.png' }
  ];

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="ahero" aria-label="About Mindstec Distribution">
        <h1 className="display" id="aheroH">
          <span className="line-mask"><span className="w">{t('about.hero.line1')}</span></span>
          <span className="line-mask"><span className="w">{t('about.hero.line2')}</span></span>
          <span className="line-mask"><span className="w"><em>{t('about.hero.line3')}</em></span></span>
        </h1>
        <div className="ahero-side reveal" id="aheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>{t('about.hero.label')}</span>
          <p>{t('about.hero.brief')}</p>
          <Button href="#team" className="btn">
            <span>{t('about.hero.meet_team_btn')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </Button>
        </div>
      </section>

      <div className="ahero-meta reveal">
        <div className="fact"><b>{t('about.hero.fact1_b')}</b><span>{t('about.hero.fact1_s')}</span></div>
        <div className="fact"><b>{t('about.hero.fact2_b')}</b><span>{t('about.hero.fact2_s')}</span></div>
        <div className="fact"><b>{t('about.hero.fact3_b')}</b><span>{t('about.hero.fact3_s')}</span></div>
      </div>

      {/* HERO VISUAL */}
      <div className="ahero-visual reveal-img">
        <img id="aheroImg" src="/assets/uploads/2025/03/about-img-1.jpg" alt="A curved wall of bright video displays inside a dark showroom" fetchpriority="high" />
        <span className="caption">{t('about.hero.caption')}</span>
      </div>

      {/* STORY */}
      <section className="story" aria-label="Our story">
        <div>
          <div className="story-text" id="storyText">
            <p>
              {renderWords(t('about.story.p1'))}
            </p>
            <p>
              {renderWords(t('about.story.p2'))}
            </p>
          </div>
          <div className="story-more reveal">
            <p>{t('about.story.more_p1')}</p>
            <p>{t('about.story.more_p2')}</p>
          </div>
        </div>
        <div className="story-visual">
          <figure className="sv1 reveal-img">
            <img src="/assets/uploads/2025/03/about-img-2.jpg" alt="Extreme close-up of an LED display panel glowing magenta and red" loading="lazy" />
            <figcaption>{t('about.story.cap1')}</figcaption>
          </figure>
          <figure className="sv2 reveal-img">
            <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="Macro view of an LED video wall surface in blue and pink light" loading="lazy" />
            <figcaption>{t('about.story.cap2')}</figcaption>
          </figure>
        </div>
      </section>

      <div className="rule"></div>

      {/* PILLARS */}
      <section className="pillars" aria-label="What we do">
        <div className="section-head">
          <div>
            <span className="label label--red">{t('about.pillars.label')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>{t('about.pillars.title_main')} <em>{t('about.pillars.title_em')}</em></h2>
          </div>
        </div>
        <div className="pillar-list">
          <div className="pillar reveal">
            <span className="num">01</span>
            <h3>{t('about.pillars.p1_title')}</h3>
            <p>{t('about.pillars.p1_desc')}</p>
          </div>
          <div className="pillar reveal">
            <span className="num">02</span>
            <h3>{t('about.pillars.p2_title')}</h3>
            <p>{t('about.pillars.p2_desc')}</p>
          </div>
          <div className="pillar reveal">
            <span className="num">03</span>
            <h3>{t('about.pillars.p3_title')}</h3>
            <p>{t('about.pillars.p3_desc')}</p>
          </div>
        </div>
      </section>

      {/* VISION / MISSION */}
      <section className="vm-wrap" aria-label="Vision and mission" style={{ padding: '0 0 clamp(80px,10vw,140px)' }}>
        <div className="vm">
          <div className="vm-cell reveal">
            <span className="num">01</span>
            <h3>{t('about.vm.vision_title')} <em>{t('about.vm.vision_em')}</em></h3>
            <p>{t('about.vm.vision_desc')}</p>
          </div>
          <div className="vm-cell reveal">
            <span className="num">02</span>
            <h3>{t('about.vm.mission_title')} <em>{t('about.vm.mission_em')}</em></h3>
            <p>{t('about.vm.mission_desc')}</p>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="team" id="team">
        <div className="section-head">
          <div>
            <span className="label label--red">{t('about.team.label')}</span>
            <h2 className="display" style={{ marginTop: '16px' }} dangerouslySetInnerHTML={{__html: t('about.team.title_main') + ' <em>' + t('about.team.title_em') + '</em>'}}></h2>
          </div>
          <p className="lede side">{t('about.team.lede')}</p>
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
          <span className="label label--red">{t('about.cta.label')}</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">{t('about.cta.title_main1')}</span></span>
            <span className="line-mask"><span className="w"><em>{t('about.cta.title_main2')}</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact?s=reseller" className="btn btn--solid">
                <span>{t('about.cta.btn1')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/contact" className="btn"><span>{t('about.cta.btn2')}</span></Button>
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

export default About;
