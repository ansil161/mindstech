import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EVENTS, REG } from '../../../constants/wireframeData.js';
import './events.css';

// Placeholder content shown while the backend has no events/news, so the
// page is never empty. Data is the client's wireframe list.

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parts = (s) => [Number(s.slice(0, 4)), Number(s.slice(5, 7)), Number(s.slice(8, 10))];
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const FALLBACK_UPCOMING = () =>
  EVENTS.filter((e) => e.end >= todayISO()).sort((a, b) => (a.start < b.start ? -1 : 1));
export const FALLBACK_PAST = () =>
  EVENTS.filter((e) => e.end < todayISO()).sort((a, b) => (a.start < b.start ? 1 : -1));

const Row = ({ e, past, t }) => {
  const [y, m, d] = parts(e.start);
  const endDay = parts(e.end)[2];
  return (
    <article className={`ev-past-row evfb-row reveal ${past ? '' : 'evfb-row--up'}`}>
      <div className="ev-past-date">
        <span>{d}{e.end !== e.start ? `–${endDay}` : ''}</span>
        <small>{MON[m - 1]} {y}</small>
      </div>
      <div className="ev-past-main">
        <h3>{e.name}</h3>
        <p>{e.city} · {e.venue}{e.booth ? ` · ${e.booth}` : ''}</p>
        <div className="evfb-tags">
          <span className="nw-cat nw-cat--region">{REG[e.r].n}</span>
          {e.note && <span className="nw-cat">{e.note}</span>}
        </div>
      </div>
      {past
        ? <span className="evfb-past-label">{t('events.past.label_past', 'Past event')}</span>
        : <Link to="/contact" className="btn"><span>{t('events.upcoming.book', 'Book a meeting')}</span></Link>}
    </article>
  );
};

export const FallbackEvents = ({ past = false, slots = 3 }) => {
  const { t } = useTranslation();
  const list = past ? FALLBACK_PAST() : FALLBACK_UPCOMING();
  const pad = past ? 0 : Math.max(0, slots - list.length);
  return (
    <div className="ev-past">
      {list.map((e) => <Row key={e.name} e={e} past={past} t={t} />)}
      {Array.from({ length: pad }, (_, i) => (
        <article key={`slot${i}`} className="ev-past-row evfb-row evfb-slot">
          <div className="ev-past-date"><span>—</span><small>{t('events.upcoming.slot_date', 'Date')}</small></div>
          <div className="ev-past-main">
            <h3>{t('events.upcoming.slot_title', 'Upcoming event')}</h3>
            <p>{t('events.upcoming.slot_hint', 'Name, dates, city, venue, booth')}</p>
          </div>
          <span />
        </article>
      ))}
    </div>
  );
};

const NEWS_SLOTS = [0, 1, 2, 3, 4, 5];

export const FallbackNews = () => {
  const { t } = useTranslation();
  return (
    <div className="nw-grid">
      {NEWS_SLOTS.map((i) => (
        <article key={i} className="nw-card reveal evfb-news">
          <div className="nw-card-media"><div className="evfb-img" aria-hidden="true" /></div>
          <div className="nw-card-body">
            <div className="nw-card-meta">
              <span className="nw-cat nw-cat--region">{t('events.news.slot_region', 'Region')}</span>
              <span>{t('events.news.slot_date', 'Date')}</span>
            </div>
            <h3 className="nw-card-title">{t('events.news.slot_title', 'News headline')}</h3>
            <p className="nw-card-desc">{t('events.news.slot_desc', 'Company and brand news will appear here.')}</p>
          </div>
        </article>
      ))}
    </div>
  );
};
