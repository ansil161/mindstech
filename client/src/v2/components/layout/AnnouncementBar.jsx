import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from '../../api/axios';
import { useRegion } from '../../context/RegionContext.jsx';

/**
 * Shown when the backend has no upcoming event (or can't be reached), so the
 * bar never goes blank. `label` is the already-formatted date text.
 */
const FALLBACK_EVENT = {
  id: 'fallback-gitex-2026',
  title: 'Mindstec Connect at GITEX Global 2026',
  label: '7–11 DEC 2026',
  location: 'Dubai, UAE',
  register_url: '',
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const formatDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const dismissedKey = (id) => `mindstec_bar_dismissed_${id}`;

const readDismissed = (id) => {
  try {
    return sessionStorage.getItem(dismissedKey(id)) === '1';
  } catch {
    return false;
  }
};

/**
 * Slim bar above the navbar announcing the next upcoming event, taken from the
 * same public events API as /events (`event_date` in the future, global or
 * tagged to the visitor's region). It sits in normal flow so it scrolls away,
 * and publishes how much of it is still visible as `--bar-offset` so the fixed
 * navbar can tuck up against the top of the viewport (see `.nav` in index.css).
 */
const AnnouncementBar = () => {
  const { t } = useTranslation();
  const { regionSlug } = useRegion();
  const [events, setEvents] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    axios
      .get('/admin/public/events/', { withCredentials: false })
      .then((res) => {
        if (!cancelled) setEvents(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const event = useMemo(() => {
    if (events === null) return null;
    const now = Date.now();
    const upcoming = events
      .filter((e) => e.is_active !== false && e.event_date && new Date(e.event_date).getTime() >= now)
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    const mine = upcoming.find((e) => !e.region_slug || e.region_slug === regionSlug);
    const next = mine || upcoming[0];
    if (!next) return FALLBACK_EVENT;
    return {
      id: `event-${next.id}`,
      title: next.title,
      label: formatDate(next.event_date),
      location: next.location,
      register_url: next.register_url,
    };
  }, [events, regionSlug]);

  useEffect(() => {
    if (event) setDismissed(readDismissed(event.id));
  }, [event]);

  const visible = Boolean(event) && !dismissed;

  // Publish the still-visible height of the bar so the fixed navbar can sit
  // directly beneath it at the top of the page and slide up as it scrolls away.
  useEffect(() => {
    const root = document.documentElement;
    if (!visible) {
      root.style.setProperty('--bar-offset', '0px');
      return undefined;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const h = barRef.current ? barRef.current.offsetHeight : 0;
      root.style.setProperty('--bar-offset', `${Math.max(0, h - window.scrollY)}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
      root.style.setProperty('--bar-offset', '0px');
    };
  }, [visible]);

  if (!visible) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(dismissedKey(event.id), '1');
    } catch {
      /* private mode: the bar just comes back on the next visit */
    }
    setDismissed(true);
  };

  const external = Boolean(event.register_url);
  const bookLabel = t('announcement.book', 'Book a meeting');

  return (
    <div className="abar" ref={barRef} role="region" aria-label={t('announcement.label', 'Upcoming event')}>
      <div className="abar-inner">
        <p className="abar-text">
          <span className="abar-date">{event.label}</span>
          <strong>{event.title}</strong>
          {event.location && <span className="abar-loc"> · {event.location}</span>}
        </p>
        {external ? (
          <a className="abar-cta" href={event.register_url} target="_blank" rel="noopener noreferrer">
            {bookLabel}
          </a>
        ) : (
          <Link className="abar-cta" to="/contact">
            {bookLabel}
          </Link>
        )}
        <button type="button" className="abar-close" onClick={dismiss} aria-label={t('announcement.dismiss', 'Dismiss announcement')}>
          ×
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
