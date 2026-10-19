import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { REGION_ABOUT, uniqueCountries } from './regionAbout.js';
import './about-extras.css';

// "Regional sites" from the wireframe's About page: one card per regional
// team, each opening that region's About page.
const AboutRegions = () => {
  const { t } = useTranslation();

  return (
    <section className="ax-sec" aria-label="Regional sites">
      <div className="section-head">
        <div>
          <span className="label label--red">{t('about.regions.label', 'Regional sites')}</span>
          <h2 className="display" style={{ marginTop: '16px' }}>
            {t('about.regions.title_main', 'Meet your')} <em>{t('about.regions.title_em', 'regional team')}</em>
          </h2>
        </div>
      </div>
      <div className="ax-regions">
        {Object.entries(REGION_ABOUT).map(([slug, r]) => (
          <Link key={slug} to={`/about/${slug}`} className="ax-region reveal">
            <h3>{r.name}</h3>
            <span className="ax-region-countries">{uniqueCountries(r.offices).join(' · ')}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AboutRegions;
