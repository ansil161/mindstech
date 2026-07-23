import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';
import axios from '../../api/axios';

gsap.registerPlugin(ScrollTrigger);

const EWaste = () => {
  const containerRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [centres, setCentres] = useState([]);
  const [centresLoading, setCentresLoading] = useState(true);
  const [centresError, setCentresError] = useState('');
  const { t } = useTranslation();

  const { translatedData: translatedCentres } = useDynamicTranslation(centres, ['city', 'operator', 'address', 'contact_name'], 'ewaste_centres');

  useEffect(() => {
    const loadCentres = async () => {
      try {
        const response = await axios.get('/admin/collection-centres/');
        setCentres(response.data);
      } catch (error) {
        console.error('Unable to load collection centres:', error);
        setCentresError('Collection centres are currently unavailable. Please try again shortly.');
      } finally {
        setCentresLoading(false);
      }
    };

    loadCentres();
  }, []);

  useEffect(() => {
    document.title = 'E-Waste Management — Mindstec Distribution';
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
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

      // Generic reveals - use data-reveal attribute
      gsap.utils.toArray('[data-reveal]').forEach(el => {
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

      gsap.utils.toArray('[data-reveal-img]').forEach(el => {
        gsap.set(el, { clipPath: 'inset(0 100% 0 0)' });
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

      // Footer mark drift
      const footerMark = document.querySelector('.foot-mark');
      if (footerMark) {
        gsap.fromTo(footerMark, { yPercent: 30, opacity: 0.4 }, {
          yPercent: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: 'footer',
            start: 'top 90%',
            end: 'bottom bottom',
            scrub: true,
          }
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Filter change transition
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    gsap.fromTo('.cc-card',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.55, stagger: 0.03, ease: 'power3.out', overwrite: 'auto' }
    );
  }, [filter]);

  const operators = [...new Set(translatedCentres.map(centre => centre.operator))];
  const filteredCentres = translatedCentres.filter(centre => filter === 'all' || centre.operator === filter);

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="shero" aria-label="E-waste management">
        <h1 className="display" id="sheroH">
          <span className="line-mask"><span className="w">{t('ewaste.hero.line1', 'End of life.')}</span></span>
          <span className="line-mask"><span className="w"><em>{t('ewaste.hero.line2', 'Not end of story.')}</em></span></span>
        </h1>
        <div className="shero-side" id="sheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>{t('ewaste.hero.title')}</span>
          <p>{t('ewaste.hero.brief', 'Around 90% of electronic equipment is recyclable. Our authorized programme with Deshwal Waste Management takes back end-of-life electronics anywhere in India — at zero cost to you.')}</p>
        </div>
      </section>
      <div className="shero-meta">
        <div className="fact"><b>1800 102 9077</b><span>{t('ewaste.meta.pickup_label', 'Toll-free pickup line')}</span></div>
        <div className="fact"><b>{t('ewaste.meta.drop_points', '27 drop points')}</b><span>{t('ewaste.meta.across_india', 'Across India')}</span></div>
        <div className="fact"><b>Deshwal WM</b><span>{t('ewaste.meta.recycler_label', 'Authorized recycler')}</span></div>
        <div className="fact"><b>₹0</b><span>{t('ewaste.meta.cost_label', 'Cost to the consumer')}</span></div>
      </div>

      {/* OVERVIEW */}
      <section className="ov" aria-label="Overview">
        <div className="ov-label" data-reveal><span className="label label--red">{t('ewaste.ov.label', 'Overview')}</span></div>
        <div>
          <p className="ov-state" data-reveal>{t('ewaste.ov.lede_main', 'Dumped in a landfill, old electronics leach lead and mercury into soil and groundwater. Recycled right, almost all of them')} <em>{t('ewaste.ov.lede_em', 'get a second life.')}</em></p>
          <div className="ov-copy" data-reveal>
            <p>{t('ewaste.ov.p1', 'E-waste is the informal name for electronic products nearing the end of their useful life — computers, televisions, displays, copiers, phones, audio equipment and batteries. Many of their components contain hazardous materials that pose a real threat to human health and the environment when disposed of improperly.')}</p>
            <p>{t('ewaste.ov.p2', 'Most of these products can be reused, refurbished or recycled in an environmentally sound manner. Under India\'s E-Waste (Management & Handling) Rules, Mindstec runs a compliant take-back programme so the hardware we distribute never ends up where it shouldn\'t.')}</p>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* BENEFITS */}
      <section className="ben" aria-label="Benefits of e-waste recycling">
        <div className="ben-head" data-reveal>
          <span className="label label--red">{t('ewaste.recyclers.why_recycle', 'Why recycle')}</span>
          <h2 className="display">{t('ewaste.recyclers.gives_back_main', 'What responsible recycling')} <em>{t('ewaste.recyclers.gives_back_em', 'gives back.')}</em></h2>
        </div>
        <div className="ben-grid" data-reveal>
          <div className="ben-cell">
            <span className="num">01</span>
            <h3>{t('ewaste.recyclers.b1_title', 'Conserves natural resources')}</h3>
            <p>{t('ewaste.recyclers.b1_desc', 'Metals recovered from circuit boards, and the plastics and glass in monitors and televisions, go into new products — reducing the need to mine new raw materials.')}</p>
          </div>
          <div className="ben-cell">
            <span className="num">02</span>
            <h3>{t('ewaste.recyclers.b2_title', 'Supports the community')}</h3>
            <p>{t('ewaste.recyclers.b2_desc', 'Donated electronics become refurbished computers and phones for low-income families, schools and non-profits — access to technology they couldn\'t otherwise afford.')}</p>
          </div>
          <div className="ben-cell">
            <span className="num">03</span>
            <h3>{t('ewaste.recyclers.b3_title', 'Creates local employment')}</h3>
            <p>{t('ewaste.recyclers.b3_desc', 'With around 90% of electronic equipment recyclable, demand for recycling builds new firms and new jobs — and a second market for the recovered materials.')}</p>
          </div>
          <div className="ben-cell">
            <span className="num">04</span>
            <h3>{t('ewaste.recyclers.b4_title', 'Protects health & environment')}</h3>
            <p>{t('ewaste.recyclers.b4_desc', 'CRTs and monitors contain lead; circuit boards carry cadmium, mercury and chromium. Safe recycling keeps these toxins out of trashcans, landfills and groundwater.')}</p>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* DO'S & DON'TS */}
      <section className="dd" aria-label="Do's and don'ts">
        <div className="dd-head" data-reveal>
          <span className="label label--red">{t('ewaste.dd.label', 'Handle with care')}</span>
          <h2 className="display">{t('ewaste.dd.title_main', "Do's &")} <em>{t('ewaste.dd.title_em', 'don\'ts.')}</em></h2>
        </div>
        <div className="dd-grid">
          <div className="dd-col dd-do" data-reveal>
            <h3>{t('ewaste.dd.do_title', 'Always')}</h3>
            <ul>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                {t('ewaste.dd.dos.0', 'Check the product catalogue for end-of-life handling information before you dispose of anything.')}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                {t('ewaste.dd.dos.1', 'Make sure only authorized recyclers and dismantlers handle your electronic products.')}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                {t('ewaste.dd.dos.2', 'Call the toll-free line to dispose of products that have reached end of life.')}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                {t('ewaste.dd.dos.3', 'Drop used electronics, batteries and accessories at your nearest authorized e-waste collection point.')}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                {t('ewaste.dd.dos.4', 'Disconnect batteries and protect any glass surfaces against breakage before handing equipment over.')}
              </li>
            </ul>
          </div>
          <div className="dd-col dd-dont" data-reveal>
            <h3>{t('ewaste.dd.dont_title', 'Never')}</h3>
            <ul>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
                {t('ewaste.dd.donts.0', 'Dismantle electronic products on your own.')}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
                {t('ewaste.dd.donts.1', 'Throw electronics into bins marked with the "Do not dispose" sign.')}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
                {t('ewaste.dd.donts.2', 'Hand e-waste to informal, unorganized collectors like local scrap dealers or rag pickers.')}
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
                {t('ewaste.dd.donts.3', 'Mix electronics with municipal garbage that ultimately reaches landfills.')}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* PLAN */}
      <section className="plan" aria-label="Our e-waste management plan">
        <div className="plan-media" data-reveal-img>
          <img src="/assets/img/unsplash-1518770660439-4636190af475-w1400.jpg" alt="A close-up of an electronic circuit board with gold and green traces" loading="lazy" />
          <span className="plan-tag">{t('ewaste.plan.media_tag', 'Authorized recycling — Deshwal Waste Management')}</span>
        </div>
        <div className="plan-body">
          <span className="label label--red" data-reveal>{t('ewaste.plan.label', 'The programme')}</span>
          <h2 className="display" data-reveal>{t('ewaste.plan.title_main', 'How your hardware')} <em>{t('ewaste.plan.title_em', 'comes back around.')}</em></h2>
          <p className="reveal" data-reveal>{t('ewaste.plan.brief', 'In India, most e-waste ends up in the informal sector, recycled with no consideration for health or the environment. Abiding by all pertinent e-waste laws, Mindstec has partnered with Deshwal Waste Management Pvt. Ltd. — a recycler authorized by the appropriate government agencies — to provide drop-off centres and environmentally sound processing of end-of-life electronics.')}</p>
          <div className="steps">
  <div className="step" data-reveal>
    <span className="num">01</span>
    <div>
      <h4>{t('ewaste.plan.steps.0.title', 'Raise a pickup request')}</h4>
      <p>{t('ewaste.plan.steps.0.desc', 'Call the toll-free line 1800 102 9077, Monday to Friday, 10:00 AM – 5:30 PM — or drop your e-waste at any collection centre below.')}</p>
    </div>
  </div>
  
  <div className="step" data-reveal>
    <span className="num">02</span>
    <div>
      <h4>{t('ewaste.plan.steps.1.title', 'Collection & transport')}</h4>
      <p>{t('ewaste.plan.steps.1.desc', 'Deshwal Waste Management, our authorized recycler, collects the equipment and transports it to the nearest collection centre.')}</p>
    </div>
  </div>
  
  <div className="step" data-reveal>
    <span className="num">03</span>
    <div>
      <h4>{t('ewaste.plan.steps.2.title', 'Environmentally sound recycling')}</h4>
      <p>{t('ewaste.plan.steps.2.desc', 'Equipment is processed at government-authorized facilities in compliance with India\'s E-Waste Management & Handling Rules.')}</p>
    </div>
  </div>
</div>
          <p className="plan-note" data-reveal><b>{t('ewaste.plan.note_bold', 'Free of charge.')}</b> {t('ewaste.plan.note', 'No fee is charged for giving goods for recycling, and no monetary benefit is offered in return — the sole aim of the programme is to keep the environment clean.')}</p>
        </div>
      </section>

      <div className="rule"></div>

      {/* COLLECTION CENTRES */}
      <section className="cc" aria-label="Collection centres">
        <div className="cc-head">
          <div className="reveal">
            <span className="label label--red">{t('ewaste.centres.label', 'Drop points')}</span>
            <h2 className="display">{t('ewaste.centres.title_main', 'Collection centres')} <em>{t('ewaste.centres.title_em', 'across India.')}</em></h2>
          </div>
          <div className="cc-call reveal">
            <span>{t('ewaste.centres.pickup_label', 'Toll-free pickup')}</span>
            <a href="tel:18001029077">1800 102 9077</a>
            <small>Mon–Fri, 10:00 AM – 5:30 PM</small>
          </div>
        </div>

        <div className="cc-filters reveal" role="group" aria-label="Filter collection centres">
          <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>{t('ewaste.filter.all', 'All centres')}</button>
          {operators.map(operator => (
            <button key={operator} className={filter === operator ? 'on' : ''} onClick={() => setFilter(operator)}>{operator}</button>
          ))}
        </div>

        <div className="cc-grid" id="ccGrid">
          {centresLoading && <p>Loading collection centres...</p>}
          {centresError && <p>{centresError}</p>}
          {!centresLoading && !centresError && filteredCentres.length === 0 && <p>No collection centres are available for this operator.</p>}
          {filteredCentres.map(c => (
            <div className="cc-card" key={c.id}>
              <div className="cc-top">
                <h3>{c.city}</h3>
                <span className="cc-op">{c.operator}</span>
              </div>
              <address>{c.address}</address>
              <div className="cc-contact">
                <span>{t('ewaste.contact_person', 'Contact Person')}: {c.contact_name}</span>
                <a href={`tel:${c.phone}`}>{t('ewaste.tel', 'Tel')}: {c.phone}</a>
              </div>
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
          <span className="label label--red">{t('ewaste.cta.label', 'Do your part')}</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">{t('ewaste.cta.title_main', 'Recycle it right.')}</span></span>
            <span className="line-mask"><span className="w"><em>{t('ewaste.cta.title_em', 'It costs nothing.')}</em></span></span>
          </h2>
          <div className="cta-row" data-reveal>
            <div className="cta-actions">
              <a href="tel:18001029077" className="btn btn--solid">
                <span>{t('ewaste.cta.btn1', 'Call 1800 102 9077')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" />
                </svg>
              </a>
              <Button to="/contact" className="btn"><span>{t('ewaste.cta.btn2', 'Talk to Mindstec')}</span></Button>
            </div>
            <div className="cta-row-info">
              <div className="c-item"><span>{t('contact_info.label')}</span><a href={`tel:${t('contact_info.tel_href')}`}>{t('contact_info.tel_label')}</a></div>
              <div className="c-item"><span>Email</span><a href={`mailto:${t('contact_info.email')}`}>{t('contact_info.email')}</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EWaste;
