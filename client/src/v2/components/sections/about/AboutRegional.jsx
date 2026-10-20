import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from '../../../api/axios';
import Button from '../../common/Button/Button.jsx';
import { useRegion } from '../../../context/RegionContext.jsx';
import { REG, OFF } from '../../../constants/wireframeData.js';
import './about-wf.css';

const fmt = (d) => {
  try {
    return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

// Regional About variant: only rendered when a specific region is selected.
const AboutRegional = () => {
  const { t } = useTranslation();
  const { region, regionSlug } = useRegion();
  const [events, setEvents] = useState([]);

  const isGlobal = !region || region === 'Global';

  useEffect(() => {
    if (isGlobal) return undefined;
    let cancelled = false;
    axios
      .get('/admin/public/events/', { withCredentials: false })
      .then((res) => { if (!cancelled) setEvents(Array.isArray(res.data) ? res.data : []); })
      .catch(() => { if (!cancelled) setEvents([]); });
    return () => { cancelled = true; };
  }, [isGlobal]);

  // Wireframe office data is keyed by its own region codes; match by name.
  const wf = useMemo(() => {
    const n = (region || '').toLowerCase();
    if (!n) return null;
    return Object.values(REG).find((r) => n.includes(r.n.toLowerCase()) || r.n.toLowerCase().includes(n)) || null;
  }, [region]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return events
      .filter((e) => e.is_active !== false && e.event_date && new Date(e.event_date).getTime() >= now)
      .filter((e) => !e.region_slug || e.region_slug === regionSlug)
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  }, [events, regionSlug]);

  if (isGlobal) return null;

  const contactBtn = (
    <Button to="/contact" className="btn btn--solid">
      <span>{t('about.regional.contact_btn', { region, defaultValue: 'Contact the {{region}} team' })}</span>
    </Button>
  );
  const soon = <span className="awf-soon">{t('newpages.soon', 'Content to come')}</span>;

  return (
    <>
      <section className="awf-sec" aria-label="Our hub">
        <div className="section-head">
          <div>
            <span className="label label--red">{t('about.regional.hub_label', 'Our hub')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>{region}</h2>
          </div>
        </div>
        <div className="awf-grid">
          <div className="awf-ph reveal">
            <h3>{t('about.regional.hub_story', 'Hub story')}</h3>
            <p>{t('about.regional.hub_hint', 'When the office opened, markets served, local capabilities and certifications.')}</p>
            {soon}
          </div>
          <div className="reveal">
            <span className="label label--red">{t('about.regional.offices', 'Offices')}</span>
            {wf && (
              <div className="awf-chips">
                {wf.offices.map((k) => (
                  <Link key={k} to="/contact" className="awf-chip">{OFF[k].city}</Link>
                ))}
              </div>
            )}
            <p className="awf-note">{t('about.regional.offices_note', 'Addresses, phone numbers and hours are on the Contact page.')}</p>
            <div className="awf-actions">{contactBtn}</div>
          </div>
        </div>
      </section>

      <section className="awf-sec" aria-label="Regional events">
        <div className="section-head">
          <div>
            <span className="label label--red">{t('about.regional.events_label', { region, defaultValue: 'Events in {{region}}' })}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>{t('about.regional.events_title', 'Meet the team')}</h2>
          </div>
        </div>
        <div className="awf-evs">
          {upcoming.length ? upcoming.map((e) => (
            <div className="awf-ev reveal" key={e.id}>
              <span className="awf-ev-date">{fmt(e.event_date)}</span>
              <div>
                <h3>{e.title}</h3>
                {e.location && <p>{e.location}</p>}
              </div>
            </div>
          )) : (
            <div className="awf-ev">
              <span className="awf-ev-date">-</span>
              <div>
                <p>{t('about.regional.no_events', { region, defaultValue: 'No upcoming events in {{region}} right now.' })}</p>
                <div className="awf-actions">
                  <Button to="/events" className="btn"><span>{t('about.regional.all_events', 'See all events')}</span></Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="awf-sec" aria-label="Regional team">
        <div className="section-head">
          <div>
            <span className="label label--red">{t('about.regional.team_label', 'Regional team')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>{t('about.regional.team_title', 'Who you will work with')}</h2>
          </div>
        </div>
        <div className="awf-grid awf-grid--team">
          {[1, 2, 3, 4].map((n) => (
            <div className="awf-card reveal" key={n}>
              <div className="awf-photo">{t('about.regional.photo', 'Photo')}</div>
              <div className="awf-ph awf-ph--sm">
                <h3>{t('about.regional.name_role', 'Name, role')}</h3>
                {soon}
              </div>
            </div>
          ))}
        </div>
        <div className="awf-actions">
          {contactBtn}
          <Button to="/clients" className="btn">
            <span>{t('about.regional.brands_btn', { region, defaultValue: 'Brands in {{region}}' })}</span>
          </Button>
        </div>
      </section>
    </>
  );
};

export default AboutRegional;
