import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BRANDS, PN } from '../../../constants/wireframeData.js';
import './experience.css';

const Ph = ({ label, hint }) => {
  const { t } = useTranslation();
  return (
    <div className="xw-ph">
      <span>{label}</span>
      {hint && <span>{hint}</span>}
      <b>{t('newpages.soon', 'Content to come')}</b>
    </div>
  );
};

export const ExperienceCrumb = () => {
  const { t } = useTranslation();
  return (
    <nav className="xw-crumb" aria-label="Breadcrumb">
      <Link to="/">Mindstec</Link><span>/</span>
      <Link to="/gallery">{t('experience.crumb.gallery', 'Gallery')}</Link><span>/</span>
      <span aria-current="page">{t('experience.crumb.centre', 'Experience Centre')}</span>
    </nav>
  );
};

export const ExperiencePhotos = () => {
  const { t } = useTranslation();
  return (
    <section className="xw-wrap" aria-label="Centre photos">
      <div className="xw-ph" style={{ aspectRatio: '16/6', placeItems: 'center' }}>
        <span>{t('experience.xw.main_photo', 'Main photo carousel')}</span>
      </div>
      <div className="xw-thumbs">
        {[1, 2, 3].map((n) => <div className="xw-ph" key={n}><span>{t('experience.xw.photo', 'Photo')}</span></div>)}
      </div>
      <Ph label={t('experience.xw.centre_name', 'Centre name, city and country')} />
    </section>
  );
};

export const ExperienceVisitTour = () => {
  const { t } = useTranslation();
  return (
    <section className="xw-wrap xw-split" aria-label="Visit details and virtual tour">
      <div className="xw-stack">
        <span className="label label--red">{t('experience.xw.visit_details', 'Visit details')}</span>
        <Ph label={t('experience.xw.address', 'Address and map link')} />
        <Ph label={t('experience.xw.hours', 'Opening hours and contact')} />
      </div>
      <div className="xw-stack">
        <span className="label label--red">{t('experience.xw.tour', 'Virtual tour')}</span>
        <div className="xw-ph xw-tour"><span>{t('experience.xw.tour_hint', '360° tour (optional)')}</span></div>
      </div>
    </section>
  );
};

const ZONES = [
  ['cr', 'Control room'],
  ['cc', 'Boardroom'],
  ['ie', 'Immersive room'],
  ['hg', 'Hotel guest room'],
];

export const ExperienceZoneDetail = () => {
  const { t } = useTranslation();
  return (
    <section className="xw-wrap" aria-label="What you can see here">
      <div>
        <span className="label label--red">{t('experience.xw.zones_label', 'Zones')}</span>
        <h2 className="display">{t('experience.xw.zones_title', 'What you can see here')}</h2>
        <p className="lede">{t('experience.xw.zones_desc', 'Each zone is a working space. Open its solution, or any brand on show.')}</p>
      </div>
      <div>
        {ZONES.map(([k, name]) => {
          const brands = BRANDS.filter((b) => b.s.includes(k)).slice(0, 3);
          return (
            <div className="xw-zone" key={k}>
              <div className="xw-strip">
                {[1, 2, 3].map((n) => <div className="xw-ph" key={n}><span>{t('experience.xw.photo', 'Photo')}</span></div>)}
              </div>
              <div>
                <h3>{name} {t('experience.xw.zone', 'zone')}</h3>
                <Ph label={t('experience.xw.zone_desc', 'Two lines on what this zone demonstrates')} />
                <span className="xw-sub">{t('experience.xw.solution', 'Solution')}</span>
                <div className="xw-chips"><Link className="xw-chip" to="/solutions">{PN[k]}</Link></div>
                <span className="xw-sub">{t('experience.xw.brands', 'Brands on show (examples, confirm)')}</span>
                <div className="xw-chips">
                  {brands.map((b) => <Link className="xw-chip" to="/brands" key={b.n}>{b.n}</Link>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="xw-note">{t('experience.xw.zones_note', 'Example zones · each centre lists its own')}</p>
    </section>
  );
};

export const ExperienceEvents = () => {
  const { t } = useTranslation();
  return (
    <section className="xw-wrap" aria-label="Events and training here">
      <span className="label label--red">{t('experience.xw.events', 'Events and training here')}</span>
      <Ph label={t('experience.xw.events_ph', 'Upcoming sessions at this centre')} hint={t('experience.xw.events_hint', 'Hidden when there are none.')} />
    </section>
  );
};
