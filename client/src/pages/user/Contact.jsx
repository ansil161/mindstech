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

  const [contactInfo, setContactInfo] = useState(null);
  const [allRegionContacts, setAllRegionContacts] = useState([]);

  const { translatedData: translatedContact } = useDynamicTranslation(
    contactInfo,
    ['office_name', 'address'],
    `contact_info_${regionSlug}`
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
        if (!cancelled) setContactInfo(res.data.contact_info || null);
      } catch (err) {
        console.error('Failed to load region contact:', err);
        if (!cancelled) setContactInfo(null);
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
              const info = res.data.contact_info;
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
  // translatedContact only adds translated office_name/address on top — never replaces the base data.
  const baseContact = contactInfo || FALLBACK_CONTACT;
  const telHref = baseContact.phone || FALLBACK_CONTACT.phone;
  const telLabel = baseContact.phone_display || baseContact.phone || FALLBACK_CONTACT.phone_display;
  const contactEmail = baseContact.email || FALLBACK_CONTACT.email;
  const contactAddress = (translatedContact?.address && translatedContact.email === baseContact.email ? translatedContact.address : null) || baseContact.address || FALLBACK_CONTACT.address;
  const officeName = (translatedContact?.office_name && translatedContact.email === baseContact.email ? translatedContact.office_name : null) || baseContact.office_name || FALLBACK_CONTACT.office_name;
  const mapEmbed = baseContact.map_embed_url || FALLBACK_CONTACT.map_embed_url;
  const mapLink = baseContact.map_link || FALLBACK_CONTACT.map_link;

  const regionalDesks = allRegionContacts.length > 0
    ? allRegionContacts
    : [
        { label: 'India', email: 'india@mindstec.com' },
        { label: 'Africa', email: 'africa@mindstec.com' },
        { label: 'Partnerships', email: 'partners@mindstec.com' },
      ];

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
              <a href={`tel:${telHref}`}>{telLabel}</a>
            </div>
          </div>
          <div className="ci">
            <span className="num">02</span>
            <div>
              <b>Visit us</b>
              <address style={{ whiteSpace: 'pre-line' }}>{contactAddress}</address>
            </div>
          </div>
          <div className="ci">
            <span className="num">03</span>
            <div>
              <b>Write to us</b>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
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

      <div className="map-band reveal" style={{ opacity: 0, transform: 'translateY(36px)' }}>
        <div className="map-frame">
          {mapEmbed && (
            <iframe
              title={`Map showing ${officeName}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapEmbed}
            ></iframe>
          )}
          <div className="map-tag">
            <b>{officeName}</b>
            <span>{contactAddress}</span>
            {mapLink && (
              <a href={mapLink} target="_blank" rel="noopener noreferrer">
                Open in Google Maps
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
