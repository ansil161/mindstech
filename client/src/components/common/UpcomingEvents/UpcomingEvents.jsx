import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button.jsx';

/**
 * Trade-show and hosted events Mindstec is attending. `start`/`end` are
 * ISO dates (inclusive); an event drops off the list the day after it ends.
 */
const EVENTS = [
  {
    name: 'Mindstec Connect at GITEX Global 2026',
    start: '2026-12-07',
    end: '2026-12-11',
    city: 'Dubai, UAE',
    venue: 'Hosted event alongside GITEX Global',
    region: 'Middle East',
    note: 'Dates to confirm',
  },
  {
    name: 'Pro AV iT Competence Days 2026',
    start: '2026-10-07',
    end: '2026-10-08',
    city: 'Kraków, Poland',
    venue: 'Metropolo by Golden Tulip Krakow Conference Centre',
    region: 'Europe',
  },
  {
    name: 'InfoComm India 2026',
    start: '2026-09-16',
    end: '2026-09-18',
    city: 'Mumbai, India',
    venue: 'Jio World Convention Centre',
    booth: 'Booth D10',
    region: 'India',
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parts = (iso) => [Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), Number(iso.slice(8, 10))];

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const UpcomingEvents = () => {
  const { t } = useTranslation();
  const today = todayISO();
  const upcoming = EVENTS
    .filter((e) => e.end >= today)
    .sort((a, b) => (a.start < b.start ? -1 : 1))
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <section className="upev" id="events" aria-label={t('home.events.label', 'Upcoming events')}>
      <div className="section-head">
        <div>
          <span className="label label--red">{t('home.events.label', 'Upcoming events')}</span>
          <h2 className="display" style={{ marginTop: '16px' }}>
            {t('home.events.title_main', 'Meet')} <em>{t('home.events.title_em', 'us')}</em>
          </h2>
        </div>
        <Button to="/events" className="text-link">
          <span>{t('home.events.btn', 'All events')}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Button>
      </div>

      <div className="upev-list">
        {upcoming.map((e) => {
          const [y, m, d] = parts(e.start);
          const endDay = e.end !== e.start ? `–${parts(e.end)[2]}` : '';
          return (
            <article key={e.name} className="upev-row reveal">
              <div className="upev-date">
                <span className="upev-day">{d}{endDay}</span>
                <span className="upev-month">{MONTHS[m - 1]} {y}</span>
              </div>
              <div className="upev-main">
                <h3>{e.name}</h3>
                <p>{e.city} · {e.venue}{e.booth ? ` · ${e.booth}` : ''}</p>
                <div className="upev-tags">
                  <span className="office-tag office-tag--hq">{e.region}</span>
                  {e.note && <span className="office-tag">{e.note}</span>}
                </div>
              </div>
              <Button to="/contact" className="text-link">
                <span>{t('home.events.book', 'Book a meeting')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default UpcomingEvents;
