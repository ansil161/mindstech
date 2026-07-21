import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import { useRegion } from '../../context/RegionContext.jsx';
import { getPublicRegionData } from '../../api/regionApi.js';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';

gsap.registerPlugin(ScrollTrigger);

// ── helpers ─────────────────────────────────────────────────────────────────

const formatEventDate = (iso) => {
  if (!iso) return { day: '', month: '', year: '', full: '' };
  const d = new Date(iso);
  return {
    day:   d.getDate().toString().padStart(2, '0'),
    month: d.toLocaleString('en', { month: 'short' }).toUpperCase(),
    year:  d.getFullYear(),
    full:  d.toLocaleString('en', { dateStyle: 'long', timeStyle: 'short' }),
  };
};

const formatNewsDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ── sub-components ──────────────────────────────────────────────────────────

const EventCard = ({ item, idx, t }) => {
  const date = formatEventDate(item.event_date);
  return (
    <article className="ev-card reveal">
      {/* Image */}
      <div className="ev-card-media">
        {item.image
          ? <img src={item.image} alt={item.title} loading="lazy" />
          : <div className="ev-card-placeholder" aria-hidden="true" />
        }
        {/* Date Badge */}
        <div className="ev-date-badge" aria-label={`Event date: ${date.full}`}>
          <span className="ev-date-day">{date.day}</span>
          <span className="ev-date-month">{date.month}</span>
        </div>
      </div>

      {/* Body */}
      <div className="ev-card-body">
        {item.location && (
          <div className="ev-location">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 21c-4.4-4.4-6.6-8.1-6.6-10.8a6.6 6.6 0 1113.2 0C18.6 12.9 16.4 16.6 12 21z" />
              <circle cx="12" cy="10.2" r="2.4" />
            </svg>
            <span>{item.location}</span>
          </div>
        )}
        <h3 className="ev-card-title">{item.title}</h3>
        <p className="ev-card-desc">{item.description}</p>
        {item.register_url && (
          <a
            href={item.register_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ev-register-btn"
          >
            <span>{t('events.card.register_now', 'Register Now')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
};

const NewsCard = ({ item, t }) => {
  const dateStr = formatNewsDate(item.created_at);
  return (
    <article className="nw-card reveal">
      {item.image && (
        <div className="nw-card-media">
          <img src={item.image} alt={item.title} loading="lazy" />
        </div>
      )}
      <div className="nw-card-body">
        <div className="nw-card-meta">
          {item.category && <span className="nw-cat">{item.category}</span>}
          <time dateTime={item.created_at}>{dateStr}</time>
        </div>
        <h3 className="nw-card-title">{item.title}</h3>
        <p className="nw-card-desc">{item.description}</p>
        {item.external_url && (
          <a
            href={item.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="nw-read-more"
          >
            {t('events.card.read_more', 'Read More')}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        )}
      </div>
    </article>
  );
};

// ── main page ───────────────────────────────────────────────────────────────

const Events = () => {
  const { t } = useTranslation();
  const { regionSlug } = useRegion();
  const containerRef = useRef(null);

  const [rawEvents, setRawEvents] = useState([]);
  const [rawNews, setRawNews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'events' | 'news'
  const [regionContact, setRegionContact] = useState(null);

  const { translatedData: events } = useDynamicTranslation(rawEvents, ['title', 'description', 'location'], 'events_list');
  const { translatedData: news }   = useDynamicTranslation(rawNews, ['title', 'description', 'category'], 'news_list');

  // ── fetch data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [evRes, nwRes] = await Promise.all([
          axios.get('/admin/public/events/', { withCredentials: false }),
          axios.get('/admin/public/news/',   { withCredentials: false }),
        ]);
        setRawEvents(evRes.data || []);
        setRawNews(nwRes.data   || []);
      } catch (err) {
        console.error('Failed to load events/news:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Fetch region contact for CTA
  useEffect(() => {
    let cancelled = false;
    getPublicRegionData(regionSlug)
      .then(res => {
        if (!cancelled) {
          setRegionContact(Array.isArray(res.data.contact_info)
            ? res.data.contact_info[0]
            : (res.data.contact_info || null));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [regionSlug]);

  const telHref  = (regionContact?.phone_display || regionContact?.phone || t('contact_info.tel_href')).replace(/[^+\d]/g, '');
  const telLabel = regionContact?.phone_display  || regionContact?.phone  || t('contact_info.tel_label');
  const email    = regionContact?.email || t('contact_info.email');

  // ── GSAP entrance ──────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        return;
      }

      // Hero
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('#evheroH .w',
          { yPercent: 115, rotate: 2 },
          { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.1, ease: 'power4.out' })
        .fromTo('#evheroSide',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.0 }, '-=.8')
        .fromTo('.ev-tabs',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7 }, '-=.5');

      // Section heads
      gsap.utils.toArray('.section-head').forEach(head => {
        gsap.fromTo(head.querySelectorAll('h2, .label'),
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
            scrollTrigger: { trigger: head, start: 'top 84%', once: true },
          });
      });

      // CTA
      gsap.fromTo('#ctaH .w', { yPercent: 110 }, {
        yPercent: 0, duration: 1.1, stagger: 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: '#contact', start: 'top 72%', once: true },
      });
      gsap.fromTo('.cta-bg img', { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // ── card entrance when data loads ─────────────────────────────────────────
  useEffect(() => {
    if (loading || (events.length === 0 && news.length === 0)) return;

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      gsap.utils.toArray('.reveal').forEach(el => {
        if (reduceMotion) { gsap.set(el, { opacity: 1, y: 0 }); return; }
        gsap.to(el, {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
    }, containerRef);

    const t = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => { ctx.revert(); clearTimeout(t); };
  }, [loading, events, news, activeTab]);

  const showEvents = activeTab === 'all' || activeTab === 'events';
  const showNews   = activeTab === 'all' || activeTab === 'news';

  return (
    <main id="top" ref={containerRef}>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="shero" aria-label="Events and News">
        <h1 className="display" id="evheroH">
          <span className="line-mask"><span className="w">{t('events.hero.title_main', 'Events &')}</span></span>
          <span className="line-mask"><span className="w"><em>{t('events.hero.title_em', 'News')}</em></span></span>
        </h1>
        <div className="shero-side reveal" id="evheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>
            {t('events.hero.label', "What's happening")}
          </span>
          <p>
            {t('events.hero.desc', 'Upcoming events from Mindstec — product launches, industry shows, and partner conferences — alongside the latest news and press from across our regions.')}
          </p>
        </div>
      </section>

      {/* ── TAB FILTER ───────────────────────────────────────────────── */}
      <div className="ev-tabs" role="tablist" aria-label="Filter events and news">
        {[
          { key: 'all',    label: t('events.tabs.all', 'All') },
          { key: 'events', label: t('events.tabs.events', 'Events') },
          { key: 'news',   label: t('events.tabs.news', 'News')  },
        ].map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`ev-tab-btn ${activeTab === tab.key ? 'on' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key !== 'all' && (
              <span className="ev-tab-count">
                {tab.key === 'events' ? events.length : news.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <p style={{ color: 'var(--grey)', textAlign: 'center', padding: '80px 0' }}>
          Loading…
        </p>
      )}

      {/* ── UPCOMING EVENTS ──────────────────────────────────────────── */}
      {!loading && showEvents && (
        <section className="ev-section" aria-label="Upcoming Events">
          <div className="ev-section-head section-head">
            <div>
              <span className="label label--red">{t('events.upcoming.label', 'Upcoming Events')}</span>
              <h2 className="display" style={{ marginTop: '16px' }}>
                {t('events.upcoming.title_main', 'See us')} <em>{t('events.upcoming.title_em', 'live.')}</em>
              </h2>
            </div>
            <p className="lede side">
              {t('events.upcoming.desc', 'Meet the Mindstec team at trade shows, launch events, and partner conferences across our regions.')}
            </p>
          </div>

          {events.length === 0 ? (
            <p className="ev-empty">{t('events.upcoming.empty', 'No upcoming events at the moment — check back soon.')}</p>
          ) : (
            <div className="ev-grid">
              {events.map((item, idx) => (
                <EventCard key={item.id} item={item} idx={idx} t={t} />
              ))}
            </div>
          )}
        </section>
      )}

      {!loading && showEvents && showNews && <div className="rule" />}

      {/* ── LATEST NEWS ──────────────────────────────────────────────── */}
      {!loading && showNews && (
        <section className="ev-section" aria-label="Latest News">
          <div className="ev-section-head section-head">
            <div>
              <span className="label label--red">{t('events.news.label', 'Latest News')}</span>
              <h2 className="display" style={{ marginTop: '16px' }}>
                {t('events.news.title_main', 'Stay')} <em>{t('events.news.title_em', 'informed.')}</em>
              </h2>
            </div>
            <p className="lede side">
              {t('events.news.desc', 'Press releases, industry partnerships, and product announcements from Mindstec Distribution.')}
            </p>
          </div>

          {news.length === 0 ? (
            <p className="ev-empty">{t('events.news.empty', 'No news items yet — check back soon.')}</p>
          ) : (
            <div className="nw-grid">
              {news.map(item => (
                <NewsCard key={item.id} item={item} t={t} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="cta" id="contact">
        <div className="cta-bg" aria-hidden="true">
          <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="" loading="lazy" />
        </div>
        <div className="cta-inner">
          <span className="label label--red">{t('events.cta.label', 'Stay connected')}</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">{t('events.cta.title_main', 'Want to be')}</span></span>
            <span className="line-mask"><span className="w"><em>{t('events.cta.title_em', 'at the next one?')}</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact" className="btn btn--solid">
                <span>{t('events.cta.btn_contact', 'Get in touch')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/partners" className="btn"><span>{t('events.cta.btn_partners', 'Our partners')}</span></Button>
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

export default Events;
