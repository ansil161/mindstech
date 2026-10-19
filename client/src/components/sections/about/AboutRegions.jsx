import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../../../context/RegionContext.jsx';
import './about-extras.css';

const AboutRegions = () => {
  const { t } = useTranslation();
  const { allRegions, setRegion } = useRegion();
  const regions = (Array.isArray(allRegions) ? allRegions : []).filter((r) => r && r.name);
  if (!regions.length) return null;

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
        {regions.map((r) => (
          <Link
            key={r.slug || r.name}
            to="/contact"
            className="ax-region reveal"
            onClick={() => setRegion(r.name)}
          >
            <h3>{r.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AboutRegions;
