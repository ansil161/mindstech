import React, { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NewPageHero from '../../components/sections/newpages/NewPageHero.jsx';
import PlaceholderCard from '../../components/sections/newpages/PlaceholderCard.jsx';
import { useRegion } from '../../context/RegionContext.jsx';
import { EVENTS } from '../../components/common/UpcomingEvents/UpcomingEvents.jsx';
import { REGION_ABOUT, joinList, uniqueCountries } from '../../components/sections/about/regionAbout.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parts = (iso) => [Number(iso.slice(0, 4)), Number(iso.slice(5, 7)), Number(iso.slice(8, 10))];
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * `/about/:region`. The regional "About" page from the design wireframe: hub,
 * offices, the region's upcoming events and the regional team.
 */
const RegionAbout = () => {
  const { region: slug } = useParams();
  const { t } = useTranslation();
  const { setRegion } = useRegion();
  const R = REGION_ABOUT[slug];

  useEffect(() => {
    if (!R) return;
    document.title = `Mindstec ${R.name} — Mindstec Distribution`;
    window.scrollTo(0, 0);
  }, [R]);

  if (!R) return <Navigate to="/about" replace />;

  const today = todayISO();
  const events = EVENTS
    .filter((e) => e.region === R.name && e.end >= today)
    .sort((a, b) => (a.start < b.start ? -1 : 1));
  const countries = joinList(uniqueCountries(R.offices));
  const contactHere = () => setRegion(R.name);

  return (
    <main id="top" className="ct">
      <NewPageHero
        crumb={t('about.region.crumb', 'Mindstec / {{region}}', { region: R.name })}
        title={t('about.region.title', 'Mindstec {{region}}', { region: R.name })}
        lede={t(
          'about.region.lede',
          'The {{region}} team brings Mindstec brands and engineering support to integrators and end users across {{countries}}.',
          { region: R.name, countries }
        )}
      />

      <section className="ct-wrap np-body">
        {/* HUB + OFFICES */}
        <div className="np-split">
          <div className="np-stack">
            <span className="np-eyebrow">{t('about.region.hub', 'Our hub')}</span>
            <h2 className="display">{R.name}</h2>
            <PlaceholderCard
              title={t('about.region.hub_story', 'Hub story')}
              hint={t('about.region.hub_story_hint', 'When the office opened, markets served, local capabilities and certifications.')}
            />
            {R.lang && <p className="np-eyebrow">{R.lang}</p>}
          </div>
          <div className="np-stack">
            <span className="np-eyebrow">{t('about.region.offices', 'Offices')}</span>
            <div className="np-chips">
              {R.offices.map((o) => (
                <Link key={o.city} to="/contact" className="np-chip" onClick={contactHere}>{o.city}</Link>
              ))}
            </div>
            <p className="ct-note">
              {t('about.region.offices_note', 'Addresses, phone numbers and hours are on the Contact page.')}
            </p>
            <Link to="/contact" className="ct-btn ct-btn--solid" style={{ justifySelf: 'start' }} onClick={contactHere}>
              {t('about.region.contact_team', 'Contact the {{region}} team', { region: R.name })}
            </Link>
          </div>
        </div>

        {/* EVENTS IN THE REGION */}
        <div className="np-stack">
          <span className="np-eyebrow">{t('about.region.events', 'Events in {{region}}', { region: R.name })}</span>
          <h2 className="display">{t('about.region.meet_team', 'Meet the team')}</h2>
          <div className="upev-list" style={{ margin: 0 }}>
            {events.length === 0 ? (
              <article className="upev-row">
                <div className="upev-date">
                  <span className="upev-day">—</span>
                  <span className="upev-month">{t('about.region.next', 'Next')}</span>
                </div>
                <div className="upev-main">
                  <p>{t('about.region.no_events', 'No upcoming events in {{region}} right now.', { region: R.name })}</p>
                </div>
                <Link to="/events" className="text-link"><span>{t('about.region.see_events', 'See all events')}</span></Link>
              </article>
            ) : (
              events.map((e) => {
                const [y, m, d] = parts(e.start);
                const endDay = e.end !== e.start ? `–${parts(e.end)[2]}` : '';
                return (
                  <article key={e.name} className="upev-row">
                    <div className="upev-date">
                      <span className="upev-day">{d}{endDay}</span>
                      <span className="upev-month">{MONTHS[m - 1]} {y}</span>
                    </div>
                    <div className="upev-main">
                      <h3>{e.name}</h3>
                      <p>{e.city} · {e.venue}{e.booth ? ` · ${e.booth}` : ''}</p>
                      {e.note && <div className="upev-tags"><span className="office-tag">{e.note}</span></div>}
                    </div>
                    <Link to="/contact" className="text-link" onClick={contactHere}>
                      <span>{t('home.events.book', 'Book a meeting')}</span>
                    </Link>
                  </article>
                );
              })
            )}
          </div>
        </div>

        {/* REGIONAL TEAM */}
        <div className="np-stack">
          <span className="np-eyebrow">{t('about.region.team', 'Regional team')}</span>
          <h2 className="display">{t('about.region.team_title', 'Who you will work with')}</h2>
          <PlaceholderCard
            title={t('about.region.team_cards', 'Name, role')}
            hint={t('about.region.team_hint', 'Photos and roles of the regional team.')}
          />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link to="/contact" className="ct-btn ct-btn--solid" onClick={contactHere}>
              {t('about.region.contact_team', 'Contact the {{region}} team', { region: R.name })}
            </Link>
            <Link to="/partners" className="ct-btn" onClick={contactHere}>
              {t('about.region.brands_in', 'Brands in {{region}}', { region: R.name })}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default RegionAbout;
