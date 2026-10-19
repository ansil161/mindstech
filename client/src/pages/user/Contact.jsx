import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import { whenReady } from '../../utils/pageReveal';
import { useRegion } from '../../context/RegionContext.jsx';
import { getPublicRegionData } from '../../api/regionApi.js';
import {
  CONTACT_OFFICES,
  COUNTRIES,
  COUNTRY_COUNT,
  OFFICE_COUNT,
  OTHER_COUNTRY,
  TOPICS,
  routeFor,
} from '../../constants/contactOffices';
import WhereWeOperate from '../../components/common/WhereWeOperate/WhereWeOperate.jsx';

// ?s=<slug> deep links (from solution pages, partner CTAs, …) preselect a topic.
const slugTopic = {
  'digital-signage': 'Solutions & projects',
  'control-rooms': 'Solutions & projects',
  'conferencing': 'Solutions & projects',
  'hospitality': 'Solutions & projects',
  'broadcast': 'Solutions & projects',
  'live-events': 'Solutions & projects',
  'partner': 'Become a partner',
  'reseller': 'Become a reseller',
  'visit': 'Visit the Experience Centre',
};

// Country preselected from the active region site.
const regionCountry = {
  'Middle East': 'United Arab Emirates',
  India: 'India',
  Africa: 'South Africa',
  Europe: 'Poland',
};

const localTime = (tz, now) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }).format(now);

const Contact = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { region, regionSlug, currentRegionObj, setRegion } = useRegion();
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const nameRef = useRef(null);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(regionCountry[region] || 'India');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [msg, setMsg] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [contacts, setContacts] = useState([]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const s = searchParams.get('s');
    if (s && slugTopic[s]) setTopic(slugTopic[s]);
  }, [searchParams]);

  useEffect(() => {
    if (regionCountry[region]) setCountry(regionCountry[region]);
  }, [region]);

  // CMS contact records for the active region (every sub-region for an umbrella
  // region such as "Global"); each card picks up its own record from this list.
  useEffect(() => {
    let cancelled = false;
    const fetchContacts = async () => {
      try {
        const subRegions = currentRegionObj?.sub_regions || [];
        const slugs = subRegions.length > 0
          ? [currentRegionObj.slug, ...subRegions.map((r) => r.slug)]
          : [regionSlug];
        const results = await Promise.all(
          slugs.map(async (slug) => {
            try {
              const res = await getPublicRegionData(slug);
              return res.data.contact_info || [];
            } catch {
              return [];
            }
          })
        );
        if (!cancelled) setContacts(results.flat());
      } catch (err) {
        console.error('Failed to load region contact:', err);
        if (!cancelled) setContacts([]);
      }
    };
    fetchContacts();
    return () => { cancelled = true; };
  }, [regionSlug, currentRegionObj]);

  useEffect(() => {
    document.title = 'Contact us — Mindstec Distribution';
    window.scrollTo(0, 0);

    let stopIntro = () => {};
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      intro
        .fromTo('.ct-hero .ct-crumb', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo('.ct-hero h1', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1 }, '-=.4')
        .fromTo('.ct-hero p', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, '-=.6');
      stopIntro = whenReady(() => intro.play());
    }, containerRef);
    return () => { stopIntro(); ctx.revert(); };
  }, []);

  // One office → its CMS record, falling back to the repo's known region email.
  const detailsFor = useMemo(() => {
    const cache = {};
    CONTACT_OFFICES.forEach((o) => {
      const rec = contacts.find((c) => o.match.test(`${c.office_name || ''} ${c.address || ''}`));
      const phone = rec?.phone_display || rec?.phone || '';
      cache[o.key] = {
        address: rec?.address || '',
        phone,
        phoneHref: phone.replace(/[^+\d]/g, ''),
        email: rec?.email || o.email || '',
        mapLink: rec?.map_link || '',
      };
    });
    return cache;
  }, [contacts]);

  const route = routeFor(country);

  const messageOffice = (office) => {
    setCountry(office.country);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 450);
  };

  const visitSite = (regionName) => {
    setRegion(regionName);
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');

    try {
      await axios.post('/admin/enquiries/submit/', {
        name,
        company,
        email,
        subject: topic,
        message: `${msg}\n\nCountry: ${country}\nRouted to: ${route.label}`,
      });
      setSubmitSuccess(true);
      setName('');
      setCompany('');
      setEmail('');
      setMsg('');
      setTopic(TOPICS[0]);
    } catch (err) {
      console.error(err);
      const errorData = err.response?.data;
      let errorMsg = t('contact.form.error_generic');
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

  return (
    <main id="top" ref={containerRef} className="ct">
      <section className="ct-hero" aria-label="Contact Mindstec">
        <div className="ct-wrap">
          <span className="ct-crumb">{t('contact.page.crumb', 'Mindstec / Contact')}</span>
          <h1 className="display">{t('contact.page.title', 'Contact us')}</h1>
          <p>
            {t('contact.page.lede', '{{offices}} offices in {{countries}} countries. Message an office directly, or use the form: your country decides which team receives it.', { offices: OFFICE_COUNT, countries: COUNTRY_COUNT })}
          </p>
        </div>
      </section>

      <WhereWeOperate />

      <section className="ct-wrap ct-body">
        <div className="ct-offices">
          {CONTACT_OFFICES.map((o) => {
            const d = detailsFor[o.key];
            const hasDetails = d.address || d.phone || d.email;
            return (
              <article
                key={o.key}
                id={`office-${o.key}`}
                className="ct-card"
              >
                <header>
                  <h2>{o.city}</h2>
                  <time dateTime={now.toISOString()}>{localTime(o.tz, now)}</time>
                </header>
                <span className="ct-country">{o.country}</span>
                <p className="ct-role">{o.role}</p>

                {hasDetails ? (
                  <ul className="ct-details">
                    {d.address && <li><address>{d.address}</address></li>}
                    {d.phone && <li><a href={`tel:${d.phoneHref}`}>{d.phone}</a></li>}
                    {d.email && <li><a href={`mailto:${d.email}`}>{d.email}</a></li>}
                    {d.mapLink && (
                      <li>
                        <a href={d.mapLink} target="_blank" rel="noopener noreferrer">
                          {t('contact.info.open_maps')}
                        </a>
                      </li>
                    )}
                  </ul>
                ) : (
                  <div className="ct-details ct-details--empty">
                    {t('contact.page.soon', 'Content to come · address, phone, email, hours')}
                  </div>
                )}

                <div className="ct-card-actions">
                  <button type="button" className="ct-btn ct-btn--solid" onClick={() => messageOffice(o)}>
                    {t('contact.page.message_office', 'Message this office')}
                  </button>
                  <button type="button" className="ct-btn" onClick={() => visitSite(o.visit)}>
                    {t('contact.page.visit_site', 'Visit Mindstec {{region}}', { region: o.visit })}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <form className="ct-form" id="cform" ref={formRef} onSubmit={handleSubmit} aria-label="Contact form">
          <h2>{t('contact.page.form_title', 'Send a message')}</h2>

          <div className="ct-row">
            <div className="ct-field">
              <label htmlFor="fName">{t('contact.form.name')}</label>
              <input ref={nameRef} type="text" id="fName" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="ct-field">
              <label htmlFor="fCompany">{t('contact.page.company', 'Company')}</label>
              <input type="text" id="fCompany" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>

          <div className="ct-row">
            <div className="ct-field">
              <label htmlFor="fEmail">{t('contact.page.work_email', 'Work email')}</label>
              <input type="email" id="fEmail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="ct-field">
              <label htmlFor="fCountry">{t('contact.page.country', 'Country')}</label>
              <select id="fCountry" value={country} onChange={(e) => setCountry(e.target.value)}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value={OTHER_COUNTRY}>{OTHER_COUNTRY}</option>
              </select>
            </div>
          </div>
          <p className="ct-route" aria-live="polite">
            {t('contact.page.goes_to', 'Goes to')}: {route.label}
          </p>

          <div className="ct-field">
            <label htmlFor="fTopic">{t('contact.page.topic', 'Topic')}</label>
            <select id="fTopic" value={topic} onChange={(e) => setTopic(e.target.value)}>
              {TOPICS.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
            </select>
          </div>

          <div className="ct-field">
            <label htmlFor="fMsg">{t('contact.page.help', 'How can we help?')}</label>
            <textarea id="fMsg" value={msg} onChange={(e) => setMsg(e.target.value)} required minLength={10} />
          </div>

          <p className="ct-note">
            {t('contact.page.privacy', 'We use these details to answer your enquiry. Data controller: Mindstec Global. See our privacy notice.')}
          </p>

          {submitSuccess && <div className="ct-alert ct-alert--ok" role="status">{t('contact.form.success')}</div>}
          {submitError && <div className="ct-alert ct-alert--err" role="alert">{submitError}</div>}

          <button type="submit" className="ct-btn ct-btn--solid ct-btn--lg" disabled={isSubmitting}>
            {isSubmitting ? t('contact.form.submitting') : t('contact.page.send', 'Send enquiry')}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Contact;
