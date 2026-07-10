import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import axios from '../../api/axios';

gsap.registerPlugin(ScrollTrigger);

const CITIES = {
  bangalore: { lat: 12.97, lng: 77.59, label: 'Bangalore HQ', chip: true },
  delhi:     { lat: 28.61, lng: 77.21, label: 'New Delhi' },
  dhaka:     { lat: 23.81, lng: 90.41, label: 'Dhaka' },
  colombo:   { lat: 6.93,  lng: 79.86, label: 'Colombo' },
  nairobi:   { lat: -1.29, lng: 36.82, label: 'Nairobi', chip: true },
  lagos:     { lat: 6.52,  lng: 3.38,  label: 'Lagos' },
  joburg:    { lat: -26.20, lng: 28.05, label: 'Johannesburg' },
  warsaw:    { lat: 52.23, lng: 21.01, label: 'Warsaw', chip: true },
  prague:    { lat: 50.08, lng: 14.44, label: 'Prague' }
};

const ROUTES = [
  ['bangalore', 'delhi'], ['bangalore', 'dhaka'], ['bangalore', 'colombo'],
  ['bangalore', 'nairobi'], ['nairobi', 'lagos'], ['nairobi', 'joburg'],
  ['bangalore', 'warsaw'], ['warsaw', 'prague']
];

const project = (lat, lng) => ({
  x: (lng + 180) * (800 / 360),
  y: (90 - lat) * (400 / 180),
});

const STATIC_PROJECTS = [
  {
    id: 'static-1',
    title: "Government command centre",
    location_meta: "New Delhi, India — 48-screen video wall",
    category: "Control room",
    image: "/assets/img/pexels-11783119-w1400.jpg"
  },
  {
    id: 'static-2',
    title: "Luxury hotel, full property AV",
    location_meta: "Bangalore, India — 280 rooms and ballroom",
    category: "Hospitality",
    image: "/assets/img/unsplash-1551882547-ff40c63fe5fa-w1100.jpg"
  },
  {
    id: 'static-3',
    title: "Broadcast studio fit-out",
    location_meta: "Nairobi, Kenya — production and streaming",
    category: "Broadcast",
    image: "/assets/img/pexels-7865064-w1100.jpg"
  },
  {
    id: 'static-4',
    title: "Enterprise meeting rooms",
    location_meta: "Warsaw, Poland — 32 conference spaces",
    category: "Corporate",
    image: "/assets/img/pexels-13141583-w1400.jpg"
  }
];

const Home = () => {
  const containerRef = useRef(null);
  const mapBaseRef = useRef(null);
  const mapOverlayRef = useRef(null);
  const solPreviewRef = useRef(null);
  const solListRef = useRef(null);
  const edgeListRef = useRef(null);
  const pathsRef = useRef([]);
  const dotsRef = useRef([]);

  const [fieldwork, setFieldwork] = useState(STATIC_PROJECTS);
  const [solutions, setSolutions] = useState([]);

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const res = await axios.get('/admin/solutions/');
        if (res.data && res.data.length > 0) {
          setSolutions(res.data);
        }
      } catch (err) {
        console.error("Failed to load dynamic solutions:", err);
      }
    };
    fetchSolutions();
  }, []);

  useEffect(() => {
    const fetchFieldwork = async () => {
      try {
        const res = await axios.get('/admin/fieldwork/');
        if (res.data && res.data.length > 0) {
          setFieldwork(res.data);
        }
      } catch (err) {
        console.error("Failed to load dynamic fieldwork:", err);
      }
    };
    fetchFieldwork();
  }, []);

  // Separate effect for reveal-img GSAP animations triggered when fieldwork items render
  useEffect(() => {
    if (fieldwork.length === 0) return;

    // Clear any existing ScrollTriggers on these elements to prevent duplicates
    const triggers = ScrollTrigger.getAll().filter(t => 
      t.trigger && t.trigger.classList.contains('reveal-img')
    );
    triggers.forEach(t => t.kill());

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal-img').forEach((el) => {
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
    }, containerRef);

    // Refresh ScrollTrigger to recalculate metrics since card list height changed
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [fieldwork]);

  // preloader and entrance animation
  useEffect(() => {
    let runIntroHandler = null;
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Hero intro timeline
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      intro.fromTo('#heroImg', 
          { scale: 1.15, filter: 'brightness(.2) saturate(.8)' },
          { scale: 1, filter: 'brightness(.58) saturate(1)', duration: 2.2, ease: 'power2.out' })
        .fromTo('#heroH .w', 
          { yPercent: 115, rotate: 2 }, 
          { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.09, ease: 'power4.out' }, 
          '-=1.8')
        .fromTo('#heroBrief', 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 1.2 }, 
          '-=1.2')
        .fromTo('#heroFoot', 
          { opacity: 0, y: 20 }, 
          { opacity: 1, y: 0, duration: 1.0 }, 
          '-=0.9')
        .fromTo('#cueLine', 
          { scaleX: 0 }, 
          { scaleX: 1, duration: 0.8 }, 
          '-=0.7');

      const runIntro = () => {
        intro.play();
      };
      runIntroHandler = runIntro;

      if (!document.getElementById('preloader')) {
        runIntro();
      } else {
        window.addEventListener('preloaderExited', runIntro);
      }

      if (reduceMotion) {
        runIntro();
        return;
      }

      // 2. Parallax Image
      gsap.to('#heroImg', {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });

      // 3. Statement word color transition
      gsap.fromTo('#stText .st-w', 
        { opacity: 0.18 },
        {
          opacity: 1,
          color: (i, t) => t.parentElement.tagName === 'EM' ? '#CC0001' : '#FAFAFA',
          stagger: 0.4,
          ease: 'none',
          scrollTrigger: {
            trigger: '.statement',
            start: 'top 75%',
            end: 'top 18%',
            scrub: true,
          }
        }
      );

      // 4. Reveal triggers
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



      // 5. Section heads cascade
      gsap.utils.toArray('.section-head').forEach((head) => {
        gsap.fromTo(head.querySelectorAll('h2, .label, .side, .text-link'),
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

      // 6. Solutions cascade
      gsap.fromTo('.sol-row', 
        { opacity: 0, y: 34 }, 
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#solList',
            start: 'top 80%',
            once: true,
          }
        }
      );

      // 7. Stat counters
      document.querySelectorAll('.count').forEach((el) => {
        const to = +el.dataset.to;
        const proxy = { val: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter() {
            gsap.to(proxy, {
              val: to,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate() {
                el.textContent = Math.round(proxy.val).toLocaleString('en');
              }
            });
          }
        });
      });

      // 8. Band parallaxes
      gsap.fromTo('#bandImg', 
        { yPercent: -9 }, 
        {
          yPercent: 9,
          ease: 'none',
          scrollTrigger: {
            trigger: '.band',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        }
      );
      gsap.fromTo('#bandH', 
        { opacity: 0, y: 50 }, 
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.band',
            start: 'top 65%',
            once: true,
          }
        }
      );

      // 9. CTA masked title
      gsap.fromTo('#ctaH .w', 
        { yPercent: 110 }, 
        {
          yPercent: 0,
          duration: 1.1,
          stagger: 0.1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '#contact',
            start: 'top 72%',
            once: true,
          }
        }
      );

    }, containerRef);

    return () => {
      ctx.revert();
      if (runIntroHandler) {
        window.removeEventListener('preloaderExited', runIntroHandler);
      }
    };
  }, []);

  // Solutions hover image coordinates tracker (pointer: fine)
  useEffect(() => {
    const preview = solPreviewRef.current;
    const solList = solListRef.current;
    if (!preview || !solList) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine || reduceMotion) return;

    const qx = gsap.quickTo(preview, 'left', { duration: 0.45, ease: 'power3' });
    const qy = gsap.quickTo(preview, 'top', { duration: 0.45, ease: 'power3' });
    const qRotate = gsap.quickTo(preview, 'rotate', { duration: 0.45, ease: 'power3' });
    let lastX = 0;
    let shown = false;

    const onPointerMove = (e) => {
      qx(e.clientX + 28);
      qy(e.clientY - 100);
      
      const velocity = (e.clientX - lastX) * 0.08;
      const angle = Math.min(Math.max(velocity, -10), 10);
      qRotate(angle);
      lastX = e.clientX;
    };

    const fadePreview = (show) => {
      gsap.to(preview, {
        opacity: show ? 1 : 0,
        scale: show ? 1 : 0.92,
        rotate: show ? undefined : 0,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const pImgs = preview.querySelectorAll('img');
    const rows = solList.querySelectorAll('.sol-row');
    rows.forEach((row, i) => {
      row.addEventListener('pointerenter', () => {
        pImgs.forEach((img, idx) => img.classList.toggle('on', idx === i));
        if (!shown) {
          fadePreview(true);
          shown = true;
        }
      });
    });

    const onPointerLeave = () => {
      fadePreview(false);
      shown = false;
    };

    solList.addEventListener('pointermove', onPointerMove);
    solList.addEventListener('pointerleave', onPointerLeave);

    return () => {
      solList.removeEventListener('pointermove', onPointerMove);
      solList.removeEventListener('pointerleave', onPointerLeave);
      gsap.killTweensOf(preview);
    };
  }, [solutions]);

  // Edge accordion logic (matches original scrollHeight mapping)
  useEffect(() => {
    const list = edgeListRef.current;
    if (!list) return;

    const items = list.querySelectorAll('.edge-item');
    const visuals = document.querySelectorAll('#edgeVisual img');
    const caption = document.getElementById('edgeCaption');

    function openItem(item) {
      items.forEach(i => {
        const on = i === item;
        i.classList.toggle('open', on);
        i.querySelector('.edge-q').setAttribute('aria-expanded', String(on));
        const a = i.querySelector('.edge-a');
        if (a) {
          a.style.maxHeight = on ? a.scrollHeight + 'px' : '0px';
        }
      });
      visuals.forEach((img, i) => img.classList.toggle('on', i === +item.dataset.visual));
      if (caption) caption.textContent = item.dataset.caption;
    }

    items.forEach(item => {
      const q = item.querySelector('.edge-q');
      if (q) {
        q.addEventListener('click', () => {
          if (!item.classList.contains('open')) openItem(item);
        });
      }
    });

    const firstOpen = list.querySelector('.edge-item.open') || items[0];
    if (firstOpen) openItem(firstOpen);
  }, []);

  // Dotted world map base loader
  useEffect(() => {
    let active = true;
    const base = mapBaseRef.current;
    if (!base) return;

    (async () => {
      try {
        const mod = await import('https://cdn.jsdelivr.net/npm/dotted-map@2.2.3/+esm');
        if (!active) return;
        const DottedMap = mod.default?.default || mod.default || mod.DottedMap;
        const map = new DottedMap({ height: 100, grid: 'diagonal' });
        base.innerHTML = map.getSVG({
          radius: 0.22,
          color: '#FFFFFF38',
          shape: 'circle',
          backgroundColor: 'transparent',
        });
        const s = base.querySelector('svg');
        if (s) {
          s.removeAttribute('width');
          s.removeAttribute('height');
          s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }
      } catch (e) {
        if (active) base.classList.add('map-base--fallback');
      }
    })();

    return () => {
      active = false;
      base.innerHTML = '';
    };
  }, []);

  // Map route animation timeline
  useEffect(() => {
    const paths = pathsRef.current;
    const dots = dotsRef.current;
    if (!paths.length || !dots.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // Reset dash offsets
    paths.forEach((path) => {
      if (!path) return;
      const L = path.getTotalLength();
      path.style.strokeDasharray = L;
      path.style.strokeDashoffset = L;
    });

    const quad = (t, a, m, b) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * m + t * t * b;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, defaults: { ease: 'power2.inOut' } });
    
    ROUTES.forEach((route, i) => {
      const path = paths[i];
      const dot = dots[i];
      if (!path || !dot) return;

      const s = project(CITIES[route[0]].lat, CITIES[route[0]].lng);
      const e = project(CITIES[route[1]].lat, CITIES[route[1]].lng);
      const m = { x: (s.x + e.x) / 2, y: Math.min(s.y, e.y) - 50 };

      const t0 = i * 0.3;
      tl.to(path, { strokeDashoffset: 0, duration: 2 }, t0);
      
      const prox = { t: 0 };
      tl.to(prox, {
        t: 1,
        duration: 2,
        onUpdate() {
          const t = prox.t;
          dot.setAttribute('cx', quad(t, s.x, m.x, e.x));
          dot.setAttribute('cy', quad(t, s.y, m.y, e.y));
          dot.setAttribute('opacity', t < 0.1 ? t * 10 : t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 1);
        },
      }, t0);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        en.isIntersecting ? tl.play() : tl.pause();
      });
    });

    const overlay = mapOverlayRef.current;
    if (overlay) io.observe(overlay);

    return () => {
      tl.kill();
      if (overlay) io.unobserve(overlay);
    };
  }, []);

  const statementText = () => {
    const text = 'A screen in a boardroom. A wall of pixels in a terminal. A voice that carries to the last row. ';
    const emText = 'Someone has to get that technology there';
    const postText = ' — sourced, specified and supported. That is the work we do.';

    const renderWords = (str) => {
      return str.split(/(\s+)/).map((word, i) => {
        if (/^\s+$/.test(word)) return word;
        return <span key={i} className="st-w">{word}</span>;
      });
    };

    return (
      <p id="stText">
        {renderWords(text)}
        <em>{renderWords(emText)}</em>
        {renderWords(postText)}
      </p>
    );
  };

  const edgeItems = [
    { title: 'A portfolio built over fifteen years', desc: 'We represent more than fifty manufacturers — Crestron to Samsung Professional — chosen so that an integrator can specify an entire project from one price list. No gaps, no grey imports.', visual: '/assets/img/unsplash-1486406146926-c627a92ad1ab-w1100.jpg', caption: 'Brand network' },
    { title: 'Engineers, not order-takers', desc: "Every category we carry has a product specialist behind it. We do system design reviews, run demos from our own stock, and stay on the escalation path long after the invoice is paid.", visual: '/assets/img/pexels-33966530-w1100.jpg', caption: 'Technical depth' },
    { title: 'Local teams in three markets', desc: 'Bangalore covers India and the SAARC region, our Africa office serves the continent\'s commercial hubs, and Warsaw handles Central and Eastern Europe — local currency, local warranty, local people.', visual: '/assets/img/unsplash-1522071820081-009f0129c71c-w1100.jpg', caption: 'Regional teams' },
    { title: 'Support from enquiry to install', desc: 'Pre-sales consultation, procurement, logistics, commissioning help and after-sales service under one roof. Each partner gets a named account manager and a direct line to technical staff.', visual: '/assets/img/unsplash-1504384308090-c894fdcc538d-w1100.jpg', caption: 'End-to-end support' },
  ];

  return (
    <div ref={containerRef}>
      {/* HERO SECTION */}
      <section className="hero" aria-label="Introduction">
        <div className="hero-media">
          <img 
            id="heroImg" 
            src="/assets/img/pexels-7513419-w1920.jpg" 
            alt="A technician silhouetted on a dark stage while installing a large glowing LED video wall" 
            fetchPriority="high" 
          />
        </div>
        <div className="hero-inner">
          <div className="hero-top">
            <h1 className="display" id="heroH">
              <span className="line-mask"><span className="w">The quiet</span></span>
              <span className="line-mask"><span className="w">infrastructure behind</span></span>
              <span className="line-mask"><span className="w"><em>every experience.</em></span></span>
            </h1>
            <div className="hero-brief reveal" id="heroBrief">
              <p>Mindstec distributes professional AV technology from fifty-plus global manufacturers to the integrators, consultants and enterprises building the spaces people remember.</p>
              <Button href="#solutions">
                <span>Explore solutions</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
            </div>
          </div>
          <div className="hero-foot reveal" id="heroFoot">
            <div className="fact"><b>Since 2008</b><span>AV distribution</span></div>
            <div className="fact"><b>India · Africa · Poland</b><span>Three regional operations</span></div>
            <div className="fact"><b>50+ brands</b><span>Manufacturer portfolio</span></div>
            <div className="hero-scrollcue" aria-hidden="true"><i id="cueLine"></i>Scroll</div>
          </div>
        </div>
      </section>

      {/* BRAND TICKER STRIP */}
      <div className="strip" aria-label="Represented manufacturers">
        <div className="strip-track">
          <span>Samsung Professional</span><span>Crestron</span><span>Extron</span><span>Shure</span><span>Barco</span><span>LG Electronics</span><span>Sony Professional</span><span>Biamp</span><span>QSC</span><span>Christie</span><span>Sennheiser</span><span>Epson</span>
          <span aria-hidden="true">Samsung Professional</span><span aria-hidden="true">Crestron</span><span aria-hidden="true">Extron</span><span aria-hidden="true">Shure</span><span aria-hidden="true">Barco</span><span aria-hidden="true">LG Electronics</span><span aria-hidden="true">Sony Professional</span><span aria-hidden="true">Biamp</span><span aria-hidden="true">QSC</span><span aria-hidden="true">Christie</span><span aria-hidden="true">Sennheiser</span><span aria-hidden="true">Epson</span>
        </div>
      </div>

      {/* STATEMENT SECTION */}
      <section className="statement" aria-label="About Mindstec">
        {statementText()}
        <div className="statement-side reveal">
          <div className="thumb reveal-img">
            <img src="/assets/img/pexels-13136106-w900.jpg" alt="A crowd silhouetted in a dark exhibition hall in front of a giant glowing projection" loading="lazy" />
          </div>
          <small>Distribution is logistics only on paper. In practice it is product knowledge, demo stock, engineering support and someone who answers the phone.</small>
        </div>
      </section>

      <div className="rule"></div>

      {/* SOLUTIONS SECTION */}
      <section className="solutions" id="solutions">
        <div className="section-head">
          <div>
            <span className="label label--red">Solutions</span>
            <h2 className="display" style={{ marginTop: '16px' }}>What we <em>distribute</em></h2>
          </div>
          <p className="lede side">Six verticals, one supply chain. Hover a category to see it in the field.</p>
        </div>
        <div className="sol-list" id="solList" ref={solListRef}>
          {solutions.map((sol, i) => (
            <Link key={i} className="sol-row" to={`/solutions/${sol.slug}`} data-img={i}>
              <span className="num">{(i + 1).toString().padStart(2, '0')}</span>
              <span className="sol-title">{sol.title}</span>
              <span className="sol-desc">{sol.desc}</span>
              <span className="sol-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
        <div className="sol-preview" id="solPreview" ref={solPreviewRef} aria-hidden="true">
          {solutions.map((sol, i) => (
            <img key={i} src={sol.image} alt={sol.title} loading="lazy" />
          ))}
        </div>
      </section>

      <div className="rule"></div>

      {/* STATS SECTION */}
      <section className="stats" aria-label="Company figures">
        <div className="stats-grid">
          <div className="stat-cell reveal">
            <div className="value"><span className="count" data-to="15">0</span><sup>+</sup></div>
            <p className="desc">Years distributing professional AV technology</p>
          </div>
          <div className="stat-cell reveal">
            <div className="value"><span className="count" data-to="50">0</span><sup>+</sup></div>
            <p className="desc">Manufacturer brands in the portfolio</p>
          </div>
          <div className="stat-cell reveal">
            <div className="value"><span className="count" data-to="3">0</span></div>
            <p className="desc">Regional operations — India, Africa, Poland</p>
          </div>
          <div className="stat-cell reveal">
            <div className="value"><span className="count" data-to="1000">0</span><sup>+</sup></div>
            <p className="desc">Installations supplied and supported to date</p>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* EDGE SECTION */}
      <section className="edge" id="edge">
        <div className="section-head">
          <div>
            <span className="label label--red">Why Mindstec</span>
            <h2 className="display" style={{ marginTop: '16px' }}>A distributor that acts<br />like a <em>partner</em></h2>
          </div>
        </div>
        <div className="edge-layout">
          <div className="edge-visual reveal-img" id="edgeVisual">
            <img className="on" src="/assets/img/unsplash-1486406146926-c627a92ad1ab-w1100.jpg" alt="Dark glass office towers photographed from street level" loading="lazy" />
            <img src="/assets/img/pexels-33966530-w1100.jpg" alt="Extreme close-up of an LED panel with rows of glowing pixels fading into darkness" loading="lazy" />
            <img src="/assets/img/unsplash-1522071820081-009f0129c71c-w1100.jpg" alt="A team working together on laptops around a wooden table" loading="lazy" />
            <img src="/assets/img/unsplash-1504384308090-c894fdcc538d-w1100.jpg" alt="A large open-plan office floor with rows of desks" loading="lazy" />
            <span className="edge-caption" id="edgeCaption">Brand network</span>
          </div>
          <div className="edge-list" id="edgeList" ref={edgeListRef}>
            {edgeItems.map((item, i) => (
              <div 
                key={i} 
                className={`edge-item ${i === 0 ? 'open' : ''}`}
                data-visual={i}
                data-caption={item.caption}
              >
                <button className="edge-q">
                  <span className="num">{(i + 1).toString().padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <span className="ind" aria-hidden="true"></span>
                </button>
                <div className="edge-a">
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GLOBAL REACH BANNER */}
      <section className="band" aria-label="Global reach">
        <img id="bandImg" src="/assets/img/unsplash-1451187580459-43490279c0fa-w2000.jpg" alt="Earth photographed from orbit at night, city lights glowing across the surface" loading="lazy" />
        <div className="band-inner">
          <span className="label">Our reach</span>
          <h2 className="display" id="bandH">One supply chain, <em>three continents.</em></h2>
        </div>
      </section>

      {/* REGIONS MAP SECTION */}
      <section className="regions" id="regions">
        <div className="section-head">
          <div>
            <span className="label label--red">Regions</span>
            <h2 className="display" style={{ marginTop: '16px' }}>Where we <em>operate</em></h2>
          </div>
          <p className="lede side">Stock, currency, warranty and people — all handled in-region.</p>
        </div>
        <div className="map-wrap reveal">
          <div className="map-base" id="mapBase" ref={mapBaseRef} aria-hidden="true"></div>
          <svg className="map-overlay" id="mapOverlay" ref={mapOverlayRef} viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet" role="img" aria-label="World map showing Mindstec supply routes from Bangalore to New Delhi, Dhaka, Colombo, Nairobi, Lagos, Johannesburg, Warsaw and Prague">
            <defs>
              <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CC0001" stopOpacity="0" />
                <stop offset="8%" stopColor="#CC0001" stopOpacity="1" />
                <stop offset="92%" stopColor="#CC0001" stopOpacity="1" />
                <stop offset="100%" stopColor="#CC0001" stopOpacity="0" />
              </linearGradient>
              <filter id="mapGlow">
                <feMorphology operator="dilate" radius="0.5" />
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Arcs & Traveling Dots */}
            {ROUTES.map((route, i) => {
              const s = project(CITIES[route[0]].lat, CITIES[route[0]].lng);
              const e = project(CITIES[route[1]].lat, CITIES[route[1]].lng);
              const m = { x: (s.x + e.x) / 2, y: Math.min(s.y, e.y) - 50 };
              return (
                <g key={i}>
                  <path
                    ref={(el) => (pathsRef.current[i] = el)}
                    d={`M ${s.x} ${s.y} Q ${m.x} ${m.y} ${e.x} ${e.y}`}
                    fill="none"
                    stroke="url(#mapGrad)"
                    strokeWidth="1"
                  />
                  <circle
                    ref={(el) => (dotsRef.current[i] = el)}
                    r="2.5"
                    fill="#CC0001"
                    opacity="0"
                  />
                </g>
              );
            })}

            {/* Pins with Pulsating Rings & Hub Chip Labels */}
            {Object.entries(CITIES).filter(([key, city]) => city.chip).map(([key, city], idx) => {
              const p = project(city.lat, city.lng);
              const w = city.label.length * 6.4 + 18;
              const above = p.y > 60;
              const ly = above ? p.y - 26 : p.y + 12;

              return (
                <g key={key} className="map-pin">
                  <title>{city.label}</title>
                  <circle
                    className="pin-core"
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill="#CC0001"
                    filter="url(#mapGlow)"
                  />
                  <circle cx={p.x} cy={p.y} r="3" fill="#CC0001" opacity="0.5">
                    <animate
                      attributeName="r"
                      from="3"
                      to="12"
                      dur="2s"
                      begin={`${idx * 0.25}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.6"
                      to="0"
                      dur="2s"
                      begin={`${idx * 0.25}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  {city.chip && (
                    <g className="map-label">
                      <rect x={p.x - w / 2} y={ly} width={w} height="19" rx="3" />
                      <text x={p.x} y={ly + 13} textAnchor="middle">
                        {city.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="map-contacts reveal">
          <div className="mc">
            <span>India — SAARC · Bangalore HQ</span>
            <a href="tel:+918045256922">+91 80 4525 6922</a>
            <a href="mailto:india@mindstec.com">india@mindstec.com</a>
          </div>
          <div className="mc">
            <span>Africa — Commercial hubs · Nairobi</span>
            <a href="mailto:africa@mindstec.com">africa@mindstec.com</a>
          </div>
          <div className="mc">
            <span>Poland — Central &amp; Eastern Europe · Warsaw</span>
            <a href="mailto:poland@mindstec.com">poland@mindstec.com</a>
          </div>
        </div>
      </section>

      {/* INSTALLATIONS GRID */}
      <section className="work" id="work">
        <div className="section-head">
          <div>
            <span className="label label--red">Installations</span>
            <h2 className="display" style={{ marginTop: '16px' }}>Recent <em>field work</em></h2>
          </div>
          <p className="lede side">A sample of projects our partners have delivered with equipment we supplied.</p>
        </div>
        <div className="work-grid">
          {fieldwork.map((project) => (
            <figure key={project.id} className="project reveal-img">
              <img src={project.image} alt={project.title} loading="lazy" />
              <figcaption>
                <div>
                  <div className="p-title">{project.title}</div>
                  <div className="p-meta">{project.location_meta}</div>
                </div>
                <span className="p-tag">{project.category}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="work-more reveal">
          <Button href="#contact" className="text-link">
            <span>See more installations</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Button>
        </div>
      </section>

      <div className="rule"></div>

      {/* JOURNAL GRID */}
      <section className="journal" id="journal">
        <div className="section-head">
          <div>
            <span className="label label--red">Journal</span>
            <h2 className="display" style={{ marginTop: '16px' }}>Notes from the <em>field</em></h2>
          </div>
          <Button to="/blogs" className="text-link">
            <span>All articles</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Button>
        </div>
        <div className="journal-grid">
          <Link className="post reveal" to="/blogs">
            <div className="post-img">
              <img src="/assets/img/pexels-18304031-w900.jpg" alt="A dark desk setup with one large monitor and a second vertical display" loading="lazy" />
            </div>
            <div className="post-body">
              <div className="post-meta"><span className="cat">Displays</span><span>5 min read</span></div>
              <h3>Why interactive panels are replacing projectors in the meeting room</h3>
              <div className="post-foot">12 May 2026</div>
            </div>
          </Link>
          <Link className="post reveal" to="/blogs">
            <div className="post-img">
              <img src="/assets/img/unsplash-1518770660439-4636190af475-w900.jpg" alt="Macro photograph of a circuit board with processors and components" loading="lazy" />
            </div>
            <div className="post-body">
              <div className="post-meta"><span className="cat">Infrastructure</span><span>7 min read</span></div>
              <h3>AV-over-IP in 2026: what integrators should standardise on</h3>
              <div className="post-foot">28 Apr 2026</div>
            </div>
          </Link>
          <Link className="post reveal" to="/blogs">
            <div className="post-img">
              <img src="/assets/img/pexels-6476782-w900.jpg" alt="A presenter pointing at a large projected chart in a dim training room" loading="lazy" />
            </div>
            <div className="post-body">
              <div className="post-meta"><span className="cat">Buying guide</span><span>9 min read</span></div>
              <h3>Specifying an interactive whiteboard: a checklist for schools and offices</h3>
              <div className="post-foot">10 Apr 2026</div>
            </div>
          </Link>
        </div>
      </section>

      <div className="rule"></div>

      {/* CTA SECTION */}
      <section className="cta" id="contact">
        <span className="label label--red">Contact</span>
        <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
          <span className="line-mask"><span className="w">Let's put the right</span></span>
          <span className="line-mask"><span className="w">technology <em>in the room.</em></span></span>
        </h2>
        <div className="cta-row reveal">
          <div className="cta-actions">
            <Button solid to="/contact">
              <span>Get a quote</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </Button>
            <Button to="/contact?s=partner">
              <span>Become a partner</span>
            </Button>
          </div>
          <div className="cta-contacts">
            <div className="c-item"><span>India operations</span><a href="tel:+918045256922">+91 80 4525 6922</a></div>
            <div className="c-item"><span>Global enquiries</span><a href="mailto:info@mindstec.com">info@mindstec.com</a></div>
            <div className="c-item"><span>Partnerships</span><a href="mailto:partners@mindstec.com">partners@mindstec.com</a></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
