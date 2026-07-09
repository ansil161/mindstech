import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../components/common/Button/Button.jsx';

gsap.registerPlugin(ScrollTrigger);

const Blogs = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        return;
      }

      // Hero Entrance Timeline
      const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
      intro.fromTo('#sheroH .w', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.12 })
        .fromTo('#sheroSide', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, '-=.6')
        .fromTo('.bfeat', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, '-=.5');

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

  const posts = [
    {
      href: 'https://www.mindstec.com/in/why-interactive-display-panels-are-better-than-normal-led-tvs/',
      cat: 'Displays',
      date: '20 Jan 2026',
      dateStr: '2026-01-20',
      title: 'Why Interactive Display Panels Are Better Than Normal LED TVs',
      desc: "In collaborative workplaces, standard LED TVs fall short on interactivity and productivity — here's where interactive panels pull ahead."
    },
    {
      href: 'https://www.mindstec.com/in/how-ai-iot-shaping-future-commercial-display-solutions/',
      cat: 'Signage',
      date: '20 Jan 2026',
      dateStr: '2026-01-20',
      title: 'How AI and IoT Are Shaping the Future of Commercial Displays',
      desc: 'Commercial displays are no longer passive screens — AI and IoT are turning them into responsive, data-driven communication surfaces.'
    },
    {
      href: 'https://www.mindstec.com/in/what-is-a-conference-room-monitor-a-simple-guide/',
      cat: 'Collaboration',
      date: '20 Jan 2026',
      dateStr: '2026-01-20',
      title: 'What Is a Conference Room Monitor? A Simple Guide',
      desc: 'Meetings are no longer whiteboards and talk — how a dedicated conference room monitor changes what a meeting space can do.'
    },
    {
      href: 'https://www.mindstec.com/in/ipad-stand-for-conference-why-every-event-needs-one/',
      cat: 'Workspace',
      date: '24 Dec 2025',
      dateStr: '2025-12-24',
      title: 'iPad Stand for Conference: A Must-Have Tool for Modern Events',
      desc: 'In tech-driven events, the right mounting hardware keeps presenters, check-in desks and breakout rooms running without friction.'
    },
    {
      href: 'https://www.mindstec.com/in/digital-signage-monitors-beginners-guide/',
      cat: 'Signage',
      date: '24 Dec 2025',
      dateStr: '2025-12-24',
      title: "What Are Digital Signage Monitors? A Beginner's Guide",
      desc: 'Grabbing attention quickly is everything in retail — the difference between consumer TVs and purpose-built signage monitors, explained.'
    },
    {
      href: 'https://www.mindstec.com/in/international-time-zone-clocks-for-airports-and-airlines/',
      cat: 'Infrastructure',
      date: '23 Dec 2025',
      dateStr: '2025-12-23',
      title: 'Why Airports and Airlines Rely on Time Zone Clocks',
      desc: 'Aviation runs on precision across countries and time zones — how synchronised clock systems keep operations on schedule.'
    },
    {
      href: 'https://www.mindstec.com/in/what-is-hdmi-presentation-switcher-simple-explanation/',
      cat: 'Collaboration',
      date: '22 Dec 2025',
      dateStr: '2025-12-22',
      title: 'What Is an HDMI Presentation Switcher? A Simple Explanation',
      desc: 'Meeting rooms and classrooms juggle multiple video sources — a presentation switcher is the piece that makes it seamless.'
    },
    {
      href: 'https://www.mindstec.com/in/what-is-ipad-wireless-charging-wall-mount-and-how-it-works/',
      cat: 'Workspace',
      date: '14 Nov 2025',
      dateStr: '2025-11-14',
      title: 'What Is an iPad Wireless Charging Wall Mount and How Does It Work?',
      desc: 'Room panels that never die and never dangle a cable — the hardware behind always-on iPad deployments.'
    },
    {
      href: 'https://www.mindstec.com/in/what-is-a-video-capture-card-beginners-guide/',
      cat: 'Broadcast',
      date: '14 Nov 2025',
      dateStr: '2025-11-14',
      title: "What Is a Video Capture Card? A Beginner's Guide",
      desc: "Ever wondered how live streams look so clean? The capture card is doing the heavy lifting — here's how it works."
    },
    {
      href: 'https://www.mindstec.com/in/interactive-whiteboards-in-the-classroom-future-of-learning/',
      cat: 'Education',
      date: '14 Nov 2025',
      dateStr: '2025-11-14',
      title: 'The Future of Learning: Role of Interactive Whiteboards in EdTech',
      desc: 'Interactive whiteboards are becoming the mainstay of the evolving classroom — what that shift means for schools.'
    },
    {
      href: 'https://www.mindstec.com/in/what-is-video-over-ip-solution-av-industry-revolution/',
      cat: 'AV-over-IP',
      date: '14 Nov 2025',
      dateStr: '2025-11-14',
      title: 'How Video over IP Solutions Are Revolutionizing the AV Industry',
      desc: "The AV world's biggest transformation yet — why signal distribution is moving off dedicated cabling and onto the network."
    },
    {
      href: 'https://www.mindstec.com/in/distribution-amplifier-role-in-broadcasting-media/',
      cat: 'Broadcast',
      date: '23 Sep 2025',
      dateStr: '2025-09-23',
      title: 'Role of Distribution Amplifiers in Broadcasting and Media',
      desc: 'From live sports telecasts to studio production, reliable signal delivery is non-negotiable — where distribution amplifiers fit in.'
    }
  ];

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="shero" aria-label="Blogs">
        <h1 className="display" id="sheroH">
          <span className="line-mask"><span className="w">Notes from</span></span>
          <span className="line-mask"><span className="w">the <em>AV floor.</em></span></span>
        </h1>
        <div className="shero-side reveal" id="sheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>Blogs — The Mindstec Journal</span>
          <p>Buying guides, explainers and field notes from our product specialists — the same advice we give integrators and enterprise clients every day, written down.</p>
        </div>
      </section>

      {/* FEATURED */}
      <a className="bfeat reveal" href="https://www.mindstec.com/in/interactive-whiteboard-buying-guide-for-schools-offices/" target="_blank" rel="noopener noreferrer">
        <span className="bf-tag">Featured</span>
        <div className="bf-meta">
          <span className="cat">Buying guide</span>
          <time datetime="2026-01-20">20 Jan 2026</time>
        </div>
        <h2 className="display">Interactive Whiteboard Buying Guide for Schools &amp; Offices</h2>
        <p>Modern learning and workspaces are evolving, and the traditional whiteboard is no longer enough. What to look for in touch technology, software ecosystems and installation before you commit a classroom or boardroom budget.</p>
        <span className="bf-go">
          Read the article
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 17L17 7M9 7h8v8" />
          </svg>
        </span>
      </a>

      {/* GRID */}
      <div className="bwrap">
        <div className="bgrid">
          {posts.map((post, idx) => (
            <a className="bcard reveal" href={post.href} target="_blank" rel="noopener noreferrer" key={idx}>
              <div className="bc-meta">
                <span className="cat">{post.cat}</span>
                <time datetime={post.dateStr}>{post.date}</time>
              </div>
              <h3>{post.title}</h3>
              <p>{post.desc}</p>
              <span className="bc-go">
                Read article 
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </a>
          ))}
        </div>
        <div className="ball reveal">
          <a className="btn" href="https://www.mindstec.com/in/blogs/" target="_blank" rel="noopener noreferrer">
            <span>Browse all articles on mindstec.com</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        </div>
      </div>

      {/* CTA */}
      <section className="cta" id="contact">
        <div className="cta-bg" aria-hidden="true">
          <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="" loading="lazy" />
        </div>
        <div className="cta-inner">
          <span className="label label--red">Talk shop with us</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">Questions the blog</span></span>
            <span className="line-mask"><span className="w"><em>didn't answer?</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact" className="btn btn--solid">
                <span>Ask a specialist</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/solutions" className="btn"><span>See our solutions</span></Button>
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

export default Blogs;
