import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const slugSubject = {
  'digital-signage': 'Digital Signage',
  'control-rooms': 'Control Rooms',
  'conferencing': 'Conferencing & Collaboration',
  'hospitality': 'Hospitality AV',
  'broadcast': 'Broadcast & Production',
  'live-events': 'Live Events & Immersive',
  'partner': 'Become a partner',
  'reseller': 'Become a reseller',
  'visit': 'Visit the Experience Centre'
};

const Contact = () => {
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);

  const [subject, setSubject] = useState('General enquiries');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  // Handle auto subject pre-select on parameter load
  useEffect(() => {
    const s = searchParams.get('s');
    if (s && slugSubject[s]) {
      setSubject(slugSubject[s]);
    }
  }, [searchParams]);

  useEffect(() => {
    document.title = 'Contact us — Mindstec Distribution';
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.field, .fsubmit, .cinfo', { opacity: 1, y: 0 });
        return;
      }

      // Entrance sequence
      const intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
      intro.fromTo('.chero .label', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo('#cheroH .w', { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.12 }, '-=.3')
        .fromTo('.cform .field, .cform .fsubmit', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07 }, '-=.5')
        .fromTo('.cinfo', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8 }, '-=.7');

      // Map reveal
      gsap.to('.map-band', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.map-band',
          start: 'top 86%',
          once: true,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const body = [
      'Name: ' + name,
      'Phone: ' + phone,
      'Email: ' + email,
      '',
      msg
    ].join('\n');

    window.location.href = 'mailto:india@mindstec.com'
      + '?subject=' + encodeURIComponent('[Website] ' + subject)
      + '&body=' + encodeURIComponent(body);
  };

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="chero" aria-label="Contact Mindstec">
        <span className="label label--red">Contact us</span>
        <h1 className="display" id="cheroH">
          <span className="line-mask"><span className="w">Have a project?</span></span>
          <span className="line-mask"><span className="w"><em>Get in touch.</em></span></span>
        </h1>
      </section>

      {/* CONTACT LAYOUT */}
      <div className="contact-layout">
        {/* FORM SIDE */}
        <form className="cform reveal" id="cform" onSubmit={handleSubmit} aria-label="Contact form">
          <div className="frow">
            <div className="field">
              <label htmlFor="fName">Name</label>
              <input
                type="text"
                id="fName"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="fPhone">Phone</label>
              <input
                type="tel"
                id="fPhone"
                placeholder="+91 ..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="fEmail">Email address</label>
            <input
              type="email"
              id="fEmail"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="fSubject">Subject</label>
            <select id="fSubject" value={subject} onChange={(e) => setSubject(e.target.value)} required>
              <option value="General enquiries">General enquiries</option>
              <option value="Become a partner">Become a partner</option>
              <option value="Become a reseller">Become a reseller</option>
              <option value="Visit the Experience Centre">Visit the Experience Centre</option>
              <option value="Digital Signage">Digital Signage</option>
              <option value="Control Rooms">Control Rooms</option>
              <option value="Conferencing &amp; Collaboration">Conferencing &amp; Collaboration</option>
              <option value="Hospitality AV">Hospitality AV</option>
              <option value="Broadcast &amp; Production">Broadcast &amp; Production</option>
              <option value="Live Events &amp; Immersive">Live Events &amp; Immersive</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="fMsg">Message</label>
            <textarea
              id="fMsg"
              placeholder="How can we help you? Feel free to get in touch!"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="fsubmit">
            <button type="submit" className="btn btn--solid">
              <span>Send message</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </button>
            <p className="fnote">Your message opens in your email client, addressed to our Bangalore team.</p>
          </div>
        </form>

        {/* INFO SIDE */}
        <aside className="cinfo reveal" aria-label="Contact details">
          <div className="ci">
            <span className="num">01</span>
            <div>
              <b>Call us</b>
              <a href="tel:+918045256922">+91 80 4525 6922</a>
            </div>
          </div>
          <div className="ci">
            <span className="num">02</span>
            <div>
              <b>Visit us</b>
              <address>No. 5M-645, Banaswadi Village,<br />OMBR Layout, Bangalore 560043, India</address>
            </div>
          </div>
          <div className="ci">
            <span className="num">03</span>
            <div>
              <b>Write to us</b>
              <a href="mailto:india@mindstec.com">india@mindstec.com</a>
            </div>
          </div>
          <div className="regions-mini">
            <b>Regional desks</b>
            <div className="rm"><span>India — SAARC</span><a href="mailto:india@mindstec.com">india@mindstec.com</a></div>
            <div className="rm"><span>Africa</span><a href="mailto:africa@mindstec.com">africa@mindstec.com</a></div>
            <div className="rm"><span>Poland — CEE</span><a href="mailto:poland@mindstec.com">poland@mindstec.com</a></div>
            <div className="rm"><span>Partnerships</span><a href="mailto:partners@mindstec.com">partners@mindstec.com</a></div>
          </div>
          <div className="socials">
            <a href="https://www.linkedin.com/company/mindstec/" aria-label="Mindstec on LinkedIn" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
              </svg>
            </a>
            <a href="https://www.instagram.com/mindstec.distribution/" aria-label="Mindstec on Instagram" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://www.youtube.com/channel/UCrmKbX0DP9TZBP2zJ5PHiXA" aria-label="Mindstec on YouTube" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2.7 8.1c.2-1.6 1.4-2.7 3-2.8C7.7 5.1 10 5 12 5s4.3.1 6.3.3c1.6.1 2.8 1.2 3 2.8.1 1.2.2 2.6.2 3.9s-.1 2.7-.2 3.9c-.2 1.6-1.4 2.7-3 2.8-2 .2-4.3.3-6.3.3s-4.3-.1-6.3-.3c-1.6-.1-2.8-1.2-3-2.8-.1-1.2-.2-2.6-.2-3.9s.1-2.7.2-3.9z" />
                <path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </aside>
      </div>

      {/* MAP */}
      <div className="map-band reveal" style={{ opacity: 0, transform: 'translateY(36px)' }}>
        <div className="map-frame">
          <iframe
            title="Map showing the Mindstec Distribution office in Bangalore"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://maps.google.com/maps?q=MINDSTEC%20DISTRIBUTION%20PRIVATE%20LIMITED%2C%20OMBR%20Layout%2C%20Bangalore&z=15&output=embed"
          ></iframe>
          <div className="map-tag">
            <b>Mindstec Distribution — Bangalore HQ</b>
            <span>No. 5M-645, Banaswadi Village, OMBR Layout, Bangalore 560043</span>
            <a
              href="https://www.google.com/maps/place/MINDSTEC+DISTRIBUTION+PRIVATE+LIMITED/@13.0108201,77.6558671,849m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bae171505942e5f:0x89ccc127b403eb0e!8m2!3d13.0108201!4d77.658442!16s%2Fg%2F11ckqsxnqv"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
