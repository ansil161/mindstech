import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import { useRegion } from '../../context/RegionContext.jsx';
import { getPublicRegionData } from '../../api/regionApi.js';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';

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

const ALL_REGION_SLUGS = [
  { slug: 'india', label: 'India' },
  { slug: 'middle-east', label: 'Middle East' },
  { slug: 'africa', label: 'Africa' },
  { slug: 'south-asia', label: 'South Asia' },
  { slug: 'hong-kong-china', label: 'Hong Kong / China' },
];

const FALLBACK_CONTACT = {
  phone: '+918045256922',
  phone_display: '+91 80 4525 6922',
  email: 'india@mindstec.com',
  address: 'No. 5M-645, Banaswadi Village, OMBR Layout, Bangalore 560043, India',
  office_name: 'Mindstec Distribution — Bangalore HQ',
  map_embed_url: 'https://maps.google.com/maps?q=MINDSTEC%20DISTRIBUTION%20PRIVATE%20LIMITED%2C%20OMBR%20Layout%2C%20Bangalore&z=15&output=embed',
  map_link: 'https://www.google.com/maps/place/MINDSTEC+DISTRIBUTION+PRIVATE+LIMITED/@13.0108201,77.6558671,849m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3bae171505942e5f:0x89ccc127b403eb0e!8m2!3d13.0108201!4d77.658442!16s%2Fg%2F11ckqsxnqv',
};

const Contact = () => {
  const { t } = useTranslation();
  const { region, regionSlug } = useRegion();
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);

  const [subject, setSubject] = useState('General enquiries');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [contacts, setContacts] = useState([]);
  const contactInfo = contacts[0] || null;
  const [allRegionContacts, setAllRegionContacts] = useState([]);

  const { translatedData: translatedContacts } = useDynamicTranslation(
    contacts,
    ['office_name', 'address'],
    `contact_list_${regionSlug}`
  );

  useEffect(() => {
    const s = searchParams.get('s');
    if (s && slugSubject[s]) {
      setSubject(slugSubject[s]);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    const fetchRegionContact = async () => {
      try {
        const res = await getPublicRegionData(regionSlug);
        if (!cancelled) setContacts(res.data.contact_info || []);
      } catch (err) {
        console.error('Failed to load region contact:', err);
        if (!cancelled) setContacts([]);
      }
    };
    fetchRegionContact();
    return () => { cancelled = true; };
  }, [regionSlug]);

  useEffect(() => {
    let cancelled = false;
    const fetchAllContacts = async () => {
      try {
        const results = await Promise.all(
          ALL_REGION_SLUGS.map(async ({ slug, label }) => {
            try {
              const res = await getPublicRegionData(slug);
              const infoList = res.data.contact_info;
              const info = Array.isArray(infoList) ? infoList[0] : infoList;
              if (info?.email) return { label, email: info.email };
            } catch { /* skip unavailable regions */ }
            return null;
          })
        );
        if (!cancelled) {
          setAllRegionContacts(results.filter(Boolean));
        }
      } catch (err) {
        console.error('Failed to load regional desks:', err);
      }
    };
    fetchAllContacts();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    document.title = 'Contact us — Mindstec Distribution';
    window.scrollTo(0, 0);

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.field, .fsubmit, .cinfo', { opacity: 1, y: 0 });
        return;
      }

      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.fromTo('.chero .label', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo('#cheroH .w',
          { yPercent: 115, rotate: 2 },
          { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.1, ease: 'power4.out' },
          '-=.4')
        .fromTo('.cform .field, .cform .fsubmit',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.07 },
          '-=.8')
        .fromTo('.cinfo',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.9 },
          '-=.9');

    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const activeContacts = contacts;
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.map-band', { opacity: 1, y: 0 });
        return;
      }
      const bands = gsap.utils.toArray('.map-band');
      bands.forEach((band) => {
        gsap.to(band, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: band,
            start: 'top 86%',
            once: true,
          }
        });
      });
      ScrollTrigger.refresh();
    }, containerRef);
    return () => ctx.revert();
  }, [contacts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      await axios.post('/admin/enquiries/submit/', {
        name,
        phone: phone || 'N/A',
        email,
        subject,
        message: msg
      });
      setSubmitSuccess(true);
      setName('');
      setPhone('');
      setEmail('');
      setMsg('');
      setSubject('General enquiries');
    } catch (err) {
      console.error(err);
      const errorData = err.response?.data;
      let errorMsg = 'Something went wrong. Please try again.';
      if (errorData) {
        if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          const firstVal = errorData[firstKey];
          errorMsg = Array.isArray(firstVal) ? `${firstKey}: ${firstVal[0]}` : `${firstKey}: ${firstVal}`;
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        }
      }
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use contactInfo as the authoritative source (updates when region changes).
  const baseContact = contactInfo || {};
  const translatedContact = translatedContacts && translatedContacts.length > 0 ? translatedContacts[0] : null;
  const telHref = (baseContact.phone_display || baseContact.phone || '').replace(/[^+\d]/g, '');
  const telLabel = baseContact.phone_display || baseContact.phone || '';
  const contactEmail = baseContact.email || '';
  const contactAddress = (translatedContact?.address && translatedContact.email === baseContact.email ? translatedContact.address : null) || baseContact.address || '';
  const officeName = (translatedContact?.office_name && translatedContact.email === baseContact.email ? translatedContact.office_name : null) || baseContact.office_name || '';
  const mapEmbed = baseContact.map_embed_url || '';
  const mapLink = baseContact.map_link || '';

  const displayContacts = translatedContacts && translatedContacts.length > 0 ? translatedContacts : contacts;

  const regionalDesks = allRegionContacts;

  return (
    <main id="top" ref={containerRef}>
      <section className="chero" aria-label="Contact Mindstec">
        <span className="label label--red">{t('contact.label')}</span>
        <h1 className="display" id="cheroH">
          <span className="line-mask"><span className="w">{t('contact.hero.line1')}</span></span>
          <span className="line-mask"><span className="w"><em>{t('contact.hero.line2')}</em></span></span>
        </h1>
      </section>

      <div className="contact-layout">
        <form className="cform reveal" id="cform" onSubmit={handleSubmit} aria-label="Contact form">
          <div className="frow">
            <div className="field">
              <label htmlFor="fName">{t('contact.form.name')}</label>
              <input
                type="text"
                id="fName"
                placeholder={t("contact.form.name_ph")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="fPhone">{t('contact.form.phone')}</label>
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
            <label htmlFor="fEmail">{t('contact.form.email')}</label>
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
            <label htmlFor="fSubject">{t('contact.form.subject')}</label>
            <select id="fSubject" value={subject} onChange={(e) => setSubject(e.target.value)} required>
              <option value="General enquiries">{t('contact.form.opt.general')}</option>
              <option value="Become a partner">{t('contact.form.opt.partner')}</option>
              <option value="Become a reseller">{t('contact.form.opt.reseller')}</option>
              <option value="Visit the Experience Centre">{t('contact.form.opt.experience')}</option>
              <option value="Digital Signage">{t('contact.form.opt.digital')}</option>
              <option value="Control Rooms">{t('contact.form.opt.control')}</option>
              <option value="Conferencing &amp; Collaboration">{t('contact.form.opt.conferencing')}</option>
              <option value="Hospitality AV">{t('contact.form.opt.hospitality')}</option>
              <option value="Broadcast &amp; Production">{t('contact.form.opt.broadcast')}</option>
              <option value="Live Events &amp; Immersive">{t('contact.form.opt.live')}</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="fMsg">{t('contact.form.message')}</label>
            <textarea
              id="fMsg"
              placeholder={t("contact.form.message_ph")}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              required
            ></textarea>
          </div>

          {submitSuccess && (
            <div style={{
              margin: '20px 0', padding: '16px', borderRadius: '4px',
              background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)',
              color: '#4ade80', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Thank you! Your enquiry has been submitted successfully. Our team will get back to you shortly.</span>
            </div>
          )}

          {submitError && (
            <div style={{
              margin: '20px 0', padding: '16px', borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#f87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{submitError}</span>
            </div>
          )}

          <div className="fsubmit">
            <button type="submit" className="btn btn--solid" disabled={isSubmitting} style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
              <span>{isSubmitting ? 'Sending inquiry...' : 'Send message'}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </button>
            <p className="fnote">
              Your inquiry is transmitted securely to our {region} office{officeName ? ` — ${officeName}` : ''}.
            </p>
          </div>
        </form>

        <aside className="cinfo reveal" aria-label="Contact details">
          <div className="ci">
            <span className="num">01</span>
            <div>
              <b>Call us</b>
              {displayContacts.map((contact, idx) => {
                const phoneVal = contact.phone_display || contact.phone;
                const phoneHref = (phoneVal || '').replace(/[^+\d]/g, '');
                if (!phoneVal) return null;
                return (
                  <div key={contact.id || idx} style={{ marginTop: idx > 0 ? '6px' : '0' }}>
                    {displayContacts.length > 1 && <span style={{ fontSize: '11px', color: 'var(--grey-dark)', display: 'block', marginBottom: '2px' }}>{contact.office_name}:</span>}
                    <a href={`tel:${phoneHref}`}>{phoneVal}</a>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="ci">
            <span className="num">02</span>
            <div>
              <b>Visit us</b>
              {displayContacts.map((contact, idx) => {
                const addr = contact.address;
                const office = contact.office_name;
                if (!addr) return null;
                return (
                  <div key={contact.id || idx} style={{ marginTop: idx > 0 ? '12px' : '0', borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingTop: idx > 0 ? '8px' : '0' }}>
                    {office && <span style={{ fontSize: '11px', color: 'var(--grey-dark)', display: 'block', fontWeight: 'bold', marginBottom: '2px' }}>{office}</span>}
                    <address style={{ whiteSpace: 'pre-line' }}>{addr}</address>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="ci">
            <span className="num">03</span>
            <div>
              <b>Write to us</b>
              {displayContacts.map((contact, idx) => {
                const emailVal = contact.email;
                if (!emailVal) return null;
                return (
                  <div key={contact.id || idx} style={{ marginTop: idx > 0 ? '6px' : '0' }}>
                    {displayContacts.length > 1 && <span style={{ fontSize: '11px', color: 'var(--grey-dark)', display: 'block', marginBottom: '2px' }}>{contact.office_name}:</span>}
                    <a href={`mailto:${emailVal}`}>{emailVal}</a>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="regions-mini">
            <b>Regional desks</b>
            {regionalDesks.map((desk) => (
              <div className="rm" key={desk.label}>
                <span>{desk.label}</span>
                <a href={`mailto:${desk.email}`}>{desk.email}</a>
              </div>
            ))}
            <div className="rm">
              <span>Partnerships</span>
              <a href="mailto:partners@mindstec.com">partners@mindstec.com</a>
            </div>
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

      {displayContacts.map((contact, index) => {
        const address = contact.address;
        const name = contact.office_name || `Office ${index + 1}`;
        const embedUrl = contact.map_embed_url;
        const mapsLink = contact.map_link;
        const phoneVal = contact.phone_display || contact.phone;
        const phoneHref = (phoneVal || '').replace(/[^+\d]/g, '');
        const emailVal = contact.email;

        return (
          <div 
            key={contact.id || index} 
            className="map-band reveal" 
            style={{ 
              opacity: 0, 
              transform: 'translateY(36px)',
              paddingBottom: index === displayContacts.length - 1 ? 'clamp(60px, 8vw, 100px)' : '32px'
            }}
          >
            <div className="map-frame">
              {embedUrl && (
                <iframe
                  title={`Map showing ${name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={embedUrl}
                ></iframe>
              )}
              <div className="map-tag" style={{ minWidth: '280px' }}>
                <b>{name}</b>
                <span style={{ whiteSpace: 'pre-line' }}>{address}</span>
                {(phoneVal || emailVal) && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    {phoneVal && (
                      <div style={{ fontSize: '11px', display: 'flex', gap: '4px' }}>
                        <span style={{ color: 'var(--grey-dark)' }}>Phone:</span>
                        <a href={`tel:${phoneHref}`} style={{ color: 'var(--grey)', textDecoration: 'none' }} className="hover-red-text">{phoneVal}</a>
                      </div>
                    )}
                    {emailVal && (
                      <div style={{ fontSize: '11px', display: 'flex', gap: '4px' }}>
                        <span style={{ color: 'var(--grey-dark)' }}>Email:</span>
                        <a href={`mailto:${emailVal}`} style={{ color: 'var(--grey)', textDecoration: 'none' }} className="hover-red-text">{emailVal}</a>
                      </div>
                    )}
                  </div>
                )}
                {mapsLink && (
                  <a href={mapsLink} target="_blank" rel="noopener noreferrer" style={{ marginTop: '12px' }}>
                    Open in Google Maps
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </main>
  );
};

export default Contact;
