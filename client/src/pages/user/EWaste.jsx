import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';


gsap.registerPlugin(ScrollTrigger);

const CENTRES = [
  { g: 'deshwal', city: 'New Delhi', addr: 'B1/14 Basement, EROS Apartment, 56, Nehru Place, New Delhi 110019', name: 'Mr. Ashwani', tel: '9555999163' },
  { g: 'deshwal', city: 'Manesar', addr: 'Plot No. 292, Sector-7, IMT Manesar, Haryana 122050', name: 'Mr. Kishore', tel: '9873592319' },
  { g: 'deshwal', city: 'Ahmedabad', addr: 'G/D No. 1051, Vishal Estate, Opp. Bharat Petrol Pump, Sarkhej Bavla Road, Taluka Sanand, Santhal, Ahmedabad 382210', name: 'Mr. Mukesh Parikh', tel: '9727355189' },
  { g: 'deshwal', city: 'Pune', addr: 'Survey No. 119, Deokar Building, Pune Alandi Road, Kalas, Vishrantwadi, Pune 411015, Maharashtra', name: 'Mr. Samar Pan', tel: '9834480443' },
  { g: 'deshwal', city: 'Mumbai (Thane)', addr: '105, Sewanti Chhaya Building, Dombivali East, Ayre Road, Kalyan-Dombivali, Thane, Mumbai 421201', name: 'Mr. Anjani Tripathi', tel: '9643013881' },
  { g: 'deshwal', city: 'Chennai', addr: 'Survey No. 91 & 92/2, No. 1/33, Kumaran Rice Mill Compound, Tirupati Road, Vellavedu, Chennai 602107, Tamil Nadu', name: 'Mr. Gyaniram Choudhary', tel: '9080113177' },
  { g: 'deshwal', city: 'Jaipur', addr: 'Plot No. 1, Sita Nagar 2, Heerapur Rajni Pura, Heerawala, Ajmer Road, Jaipur 302024, Rajasthan', name: 'Mr. Shravan Swami', tel: '9261118000' },
  { g: 'deshwal', city: 'Kolkata', addr: '3/7, Jadavgarh, P.S. Garfa, Kolkata 700078', name: 'Mr. Indresh', tel: '7415191708' },
  { g: 'deshwal', city: 'Bengaluru', addr: 'B-39, 3rd Cross Road, Near Bharat Sevashram Sangha, Jakkur, Bengaluru 560064, Karnataka', name: 'Mr. Lokesh', tel: '9873592320' },
  { g: 'rtl', city: 'New Delhi', addr: 'B-13, Okhla Phase-2, New Delhi', name: 'Mr. Ibrahim', tel: '9555493838' },
  { g: 'rtl', city: 'Chennai', addr: 'No. 389, Sembium Road, Kathevedu, Puzhal, Chennai 600066', name: 'Mr. Dwevdi', tel: '9884309370' },
  { g: 'rtl', city: 'Jammu', addr: 'Panamma Chowk, Jammu 180001', name: 'Mr. Narender Kumar', tel: '9419622202' },
  { g: 'rtl', city: 'Patna', addr: 'South Gandhi Maidan, behind IMA Hall, Slimpur Ohra, Patna 800001', name: 'Mr. Satendra Prasad', tel: '9431079451' },
  { g: 'rtl', city: 'Ranchi', addr: 'Mahadeo Munda, Near Kali Mandir, Chutia, Ranchi 834001', name: 'Mr. Briju Kumar', tel: '9113728020' },
  { g: 'rtl', city: 'Ahmedabad', addr: '23 Manorath Complex, Sarapur, Ahmedabad 380052', name: 'Mr. Rajesh Patel', tel: '9374887483' },
  { g: 'rtl', city: 'Mumbai (Bhiwandi)', addr: 'Kolher Village, Near Kolher Vajan Kanta, Bhiwandi, Mumbai', name: 'Mr. Sanjay Kumar', tel: '9999434721' },
  { g: 'rtl', city: 'Kolkata', addr: '161/1 M G Road, Bangur Building, Kolkata 700007', name: 'Mr. M Tiwari', tel: '9831744758' },
  { g: 'rtl', city: 'Bhubaneshwar', addr: '24/711, Bhimpur, New Airport Road, Bhubaneshwar 751020', name: 'Mr. Basant', tel: '9338933801' },
  { g: 'rtl', city: 'Guwahati', addr: 'A K Azad Road, Rehabari Tinali, Near Namghar, Guwahati', name: 'Mr. Raju', tel: '7002649709' },
  { g: 'rtl', city: 'Nagpur', addr: 'J P Complex, MIDC T-Point, Amravati Road, Wadi, Nagpur 440024', name: 'Mr. Kailash', tel: '9823361807' },
  { g: 'rtl', city: 'Bengaluru (Nelamangala)', addr: 'No. 63 A, Dasanapur, NH-4 Tumkur Road, Behind Hanuman Temple, Nelamangala, Bangalore 562123', name: 'Mr. Singh', tel: '9379757223' },
  { g: 'rtl', city: 'Pune', addr: 'Lane No. 14, Opp. Municipal Garden, Tiger Nagar, Pune 411015', name: 'Mr. Deepak', tel: '9730007723' },
  { g: 'rtl', city: 'Jaipur', addr: 'Plant No. 20, Dyanand Nagar, Jodla Power House, Bhandarana Road, Jaipur', name: 'Mr. Nawrang', tel: '9351755333' },
  { g: 'rtl', city: 'Ludhiana', addr: 'Plot No. 17, Transport Nagar, Ludhiana', name: 'Mr. Birbal', tel: '9316055333' },
  { g: 'rtl', city: 'Chandigarh', addr: 'SCO 1086-87, Cabin No. 7, Sector 22B, Chandigarh', name: 'Mr. Jaiver', tel: '9312255333' },
  { g: 'rtl', city: 'Hyderabad', addr: '1-A 600/12, Prakash Nagar, Hyderabad', name: 'Mr. Jammal', tel: '9346086996' },
  { g: 'rtl', city: 'Raipur', addr: 'Near Gurudwara, Station Road, Raipur', name: 'Mr. R. L. Sahu', tel: '9302228182' }
];

const OPS = { deshwal: 'Deshwal WM', rtl: 'Reliable Trans' };

const EWaste = () => {
  const containerRef = useRef(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    document.title = 'E-Waste Management — Mindstec Distribution';
    window.scrollTo(0, 0);

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

  const filteredCentres = CENTRES.filter(c => filter === 'all' || c.g === filter);

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="shero" aria-label="E-waste management">
        <h1 className="display" id="sheroH">
          <span className="line-mask"><span className="w">End of life.</span></span>
          <span className="line-mask"><span className="w"><em>Not end of story.</em></span></span>
        </h1>
        <div className="shero-side reveal" id="sheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>E-Waste Management</span>
          <p>Around 90% of electronic equipment is recyclable. Our authorized programme with Deshwal Waste Management takes back end-of-life electronics anywhere in India — at zero cost to you.</p>
        </div>
      </section>
      <div className="shero-meta reveal">
        <div className="fact"><b>1800 102 9077</b><span>Toll-free pickup line</span></div>
        <div className="fact"><b>27 drop points</b><span>Across India</span></div>
        <div className="fact"><b>Deshwal WM</b><span>Authorized recycler</span></div>
        <div className="fact"><b>₹0</b><span>Cost to the consumer</span></div>
      </div>

      {/* OVERVIEW */}
      <section className="ov" aria-label="Overview">
        <div className="ov-label reveal"><span className="label label--red">Overview</span></div>
        <div>
          <p className="ov-state reveal">Dumped in a landfill, old electronics leach lead and mercury into soil and groundwater. Recycled right, almost all of it <em>gets a second life.</em></p>
          <div className="ov-copy reveal">
            <p>E-waste is the informal name for electronic products nearing the end of their useful life — computers, televisions, displays, copiers, phones, audio equipment and batteries. Many of their components contain hazardous materials that pose a real threat to human health and the environment when disposed of improperly.</p>
            <p>Most of these products can be reused, refurbished or recycled in an environmentally sound manner. Under India's E-Waste (Management & Handling) Rules, Mindstec runs a compliant take-back programme so the hardware we distribute never ends up where it shouldn't.</p>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* BENEFITS */}
      <section className="ben" aria-label="Benefits of e-waste recycling">
        <div className="ben-head reveal">
          <span className="label label--red">Why recycle</span>
          <h2 className="display">What responsible recycling <em>gives back.</em></h2>
        </div>
        <div className="ben-grid reveal">
          <div className="ben-cell">
            <span className="num">01</span>
            <h3>Conserves natural resources</h3>
            <p>Metals recovered from circuit boards, and the plastics and glass in monitors and televisions, go into new products — reducing the need to mine new raw materials.</p>
          </div>
          <div className="ben-cell">
            <span className="num">02</span>
            <h3>Supports the community</h3>
            <p>Donated electronics become refurbished computers and phones for low-income families, schools and non-profits — access to technology they couldn't otherwise afford.</p>
          </div>
          <div className="ben-cell">
            <span className="num">03</span>
            <h3>Creates local employment</h3>
            <p>With around 90% of electronic equipment recyclable, demand for recycling builds new firms and new jobs — and a second market for the recovered materials.</p>
          </div>
          <div className="ben-cell">
            <span className="num">04</span>
            <h3>Protects health &amp; environment</h3>
            <p>CRTs and monitors contain lead; circuit boards carry cadmium, mercury and chromium. Safe recycling keeps these toxins out of trashcans, landfills and groundwater.</p>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* DO'S & DON'TS */}
      <section className="dd" aria-label="Do's and don'ts">
        <div className="dd-head reveal">
          <span className="label label--red">Handle with care</span>
          <h2 className="display">Do's &amp; <em>don'ts.</em></h2>
        </div>
        <div className="dd-grid">
          <div className="dd-col dd-do reveal">
            <h3>Always</h3>
            <ul>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                Check the product catalogue for end-of-life handling information before you dispose of anything.
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                Make sure only authorized recyclers and dismantlers handle your electronic products.
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                Call the toll-free line to dispose of products that have reached end of life.
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                Drop used electronics, batteries and accessories at your nearest authorized e-waste collection point.
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                Disconnect batteries and protect any glass surfaces against breakage before handing equipment over.
              </li>
            </ul>
          </div>
          <div className="dd-col dd-dont reveal">
            <h3>Never</h3>
            <ul>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
                Dismantle electronic products on your own.
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
                Throw electronics into bins marked with the "Do not dispose" sign.
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
                Hand e-waste to informal, unorganized collectors like local scrap dealers or rag pickers.
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
                Mix electronics with municipal garbage that ultimately reaches landfills.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* PLAN */}
      <section className="plan" aria-label="Our e-waste management plan">
        <div className="plan-media reveal-img">
          <img src="/assets/img/unsplash-1518770660439-4636190af475-w1400.jpg" alt="A close-up of an electronic circuit board with gold and green traces" loading="lazy" />
          <span className="plan-tag">Authorized recycling — Deshwal Waste Management</span>
        </div>
        <div className="plan-body">
          <span className="label label--red reveal">The programme</span>
          <h2 className="display reveal">How your hardware <em>comes back around.</em></h2>
          <p className="reveal">In India, most e-waste ends up in the informal sector, recycled with no consideration for health or the environment. Abiding by all pertinent e-waste laws, Mindstec has partnered with <b style={{ color: 'var(--white)' }}>Deshwal Waste Management Pvt. Ltd.</b> — a recycler authorized by the appropriate government agencies — to provide drop-off centres and environmentally sound processing of end-of-life electronics.</p>
          <div className="steps">
            <div className="step reveal">
              <span className="num">01</span>
              <div>
                <h4>Raise a pickup request</h4>
                <p>Call the toll-free line 1800 102 9077, Monday to Friday, 10:00 AM – 5:30 PM — or drop your e-waste at any collection centre below.</p>
              </div>
            </div>
            <div className="step reveal">
              <span className="num">02</span>
              <div>
                <h4>Collection &amp; transport</h4>
                <p>Deshwal Waste Management, our authorized recycler, collects the equipment and transports it to the nearest collection centre.</p>
              </div>
            </div>
            <div className="step reveal">
              <span className="num">03</span>
              <div>
                <h4>Environmentally sound recycling</h4>
                <p>Equipment is processed at government-authorized facilities in compliance with India's E-Waste Management &amp; Handling Rules.</p>
              </div>
            </div>
          </div>
          <p className="plan-note reveal"><b>Free of charge.</b> No fee is charged for giving goods for recycling, and no monetary benefit is offered in return — the sole aim of the programme is to keep the environment clean.</p>
        </div>
      </section>

      <div className="rule"></div>

      {/* COLLECTION CENTRES */}
      <section className="cc" aria-label="Collection centres">
        <div className="cc-head">
          <div className="reveal">
            <span className="label label--red">Drop points</span>
            <h2 className="display">Collection centres <em>across India.</em></h2>
          </div>
          <div className="cc-call reveal">
            <span>Toll-free pickup</span>
            <a href="tel:18001029077">1800 102 9077</a>
            <small>Mon–Fri, 10:00 AM – 5:30 PM</small>
          </div>
        </div>

        <div className="cc-filters reveal" role="group" aria-label="Filter collection centres">
          <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All centres</button>
          <button className={filter === 'deshwal' ? 'on' : ''} onClick={() => setFilter('deshwal')}>Deshwal Waste Management</button>
          <button className={filter === 'rtl' ? 'on' : ''} onClick={() => setFilter('rtl')}>Reliable Trans Logistics</button>
        </div>

        <div className="cc-grid" id="ccGrid">
          {filteredCentres.map((c, i) => (
            <div className="cc-card" key={i}>
              <div className="cc-top">
                <h3>{c.city}</h3>
                <span className="cc-op">{OPS[c.g]}</span>
              </div>
              <address>{c.addr}</address>
              <div className="cc-contact">
                <span>{c.name}</span>
                <a href={`tel:+91${c.tel}`}>{c.tel}</a>
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
          <span className="label label--red">Do your part</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">Recycle it right.</span></span>
            <span className="line-mask"><span className="w"><em>It costs nothing.</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <a href="tel:18001029077" className="btn btn--solid">
                <span>Call 1800 102 9077</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2z" />
                </svg>
              </a>
              <Button to="/contact" className="btn"><span>Talk to Mindstec</span></Button>
            </div>
            <div className="cta-contacts">
              <div className="c-item"><span>India operations</span><a href="tel:+918045256922">+91 80 4525 6922</a></div>
              <div className="c-item"><span>Write to us</span><a href="mailto:india@mindstec.com">india@mindstec.com</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EWaste;
