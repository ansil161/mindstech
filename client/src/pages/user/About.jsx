import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../../context/RegionContext.jsx';
import { getPublicRegionData } from '../../api/regionApi.js';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';

gsap.registerPlugin(ScrollTrigger);

const renderWords = (str) => {
  return str.split(/(\s+)/).map((word, i) => {
    if (/^\s+$/.test(word)) return word;
    return <span key={i} className="st-w">{word}</span>;
  });
};

const FALLBACK_CONTACT = {
  phone: '+918045256922',
  phone_display: '+91 80 4525 6922',
  email: 'india@mindstec.com',
};

const About = () => {
  const { t } = useTranslation();
  const { regionSlug } = useRegion();
  const containerRef = useRef(null);

  const [team, setTeam] = useState([]);
  const [contactInfo, setContactInfo] = useState(null);
  const [loadingRegion, setLoadingRegion] = useState(false);

  const { translatedData: translatedTeam } = useDynamicTranslation(
    team,
    ['name', 'role'],
    `about_team_${regionSlug}`
  );
  const { translatedData: translatedContact } = useDynamicTranslation(
    contactInfo,
    ['office_name', 'address'],
    `about_contact_${regionSlug}`
  );

  useEffect(() => {
    let cancelled = false;
    const fetchRegionData = async () => {
      setLoadingRegion(true);
      try {
        const res = await getPublicRegionData(regionSlug);
        if (!cancelled) {
          setTeam(res.data.team_members || []);
          setContactInfo(Array.isArray(res.data.contact_info) ? res.data.contact_info[0] : (res.data.contact_info || null));
        }
      } catch (err) {
        console.error('Failed to load region data:', err);
        if (!cancelled) {
          setTeam([]);
          setContactInfo(null);
        }
      } finally {
        if (!cancelled) setLoadingRegion(false);
      }
    };
    fetchRegionData();
    return () => { cancelled = true; };
  }, [regionSlug]);

  const contact = translatedContact || contactInfo;
  const telHref = (contact?.phone_display || contact?.phone || '').replace(/[^+\d]/g, '');
  const telLabel = contact?.phone_display || contact?.phone || '';
  const email = contact?.email || '';

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        gsap.set('.reveal-img', { clipPath: 'inset(0 0 0% 0)' });
        return;
      }

      // Hero Intro Timeline Animation
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

      // Scroll reveals for sections
      gsap.utils.toArray('.reveal').forEach((el) => {
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

      gsap.utils.toArray('.reveal-img').forEach((el) => {
        gsap.to(el, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.2,
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

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
        {(t(`about.hero_facts.${regionSlug}`, { returnObjects: true, defaultValue: t('about.hero_facts.default', { returnObjects: true }) }) || []).map((fact, i) => (
          <div className="fact" key={i}>
            <b>{fact.bold}</b>
            <span>{fact.sub}</span>
          </div>
        ))}
      </div>

      <div className="ahero-visual reveal-img" aria-hidden="true">
        <img src="/assets/img/unsplash-1497366811353-6870744d04b2-w1400.jpg" alt="" loading="lazy" />
      </div>

      {/* STORY */}
      <section className="story" aria-label="Our story">
        <div>
          <div className="story-text" id="storyText">
            <p>{renderWords(t('about.story.p1'))}</p>
            <p>{renderWords(t('about.story.p2'))}</p>
          </div>
          <div className="story-more reveal">
            <p>{t('about.story.more_p1')}</p>
            <p>{t('about.story.more_p2')}</p>
          </div>
        </div>
        <div className="story-visual reveal-img" aria-hidden="true">
          <figure className="sv1">
            <img src="/assets/img/unsplash-1516035069371-29a1b244cc32-w1400.jpg" alt="" loading="lazy" />
          </figure>
          <figure className="sv2">
            <img src="/assets/img/unsplash-1558494949-ef010cbdcc31-w1400.jpg" alt="" loading="lazy" />
          </figure>
        </div>
      </section>

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
          {loadingRegion ? (
            <p style={{ color: 'var(--grey)', gridColumn: '1 / -1' }}>Loading team...</p>
          ) : translatedTeam.length === 0 ? (
            <p style={{ color: 'var(--grey)', gridColumn: '1 / -1' }}>No team members listed for this region yet.</p>
          ) : (
            translatedTeam.map((member, i) => (
              <div className="member" key={member.id || i}>
                <div className="photo">
                  <span className="m-index">{String(i + 1).padStart(2, '0')}</span>
                  <img src={member.photo} alt={`Portrait of ${member.name}`} loading="lazy" />
                </div>
                <div className="m-line"></div>
                <h3>{member.name}</h3>
                <div className="m-role">{member.role}</div>
              </div>
            ))
          )}
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
              <div className="c-item">
                <span>{t('contact_info.label')}</span>
                <a href={`tel:${telHref}`}>{telLabel}</a>
              </div>
              <div className="c-item">
                <span>Email</span>
                <a href={`mailto:${email}`}>{email}</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
