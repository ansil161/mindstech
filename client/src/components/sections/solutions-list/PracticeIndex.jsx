import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PRAC, BRANDS, nPrac, pad2 } from '../../../constants/wireframeData.js';
import './solutions-list.css';

// Practice key -> existing detail-page slug. pa and ai have no detail page yet.
const SLUG = {
  cr: 'control-rooms-critical-environments',
  cc: 'conferencing-collaboration',
  ie: 'immersive-experience',
  bp: 'broadcast-production-streaming',
  ds: 'digital-signage-dooh',
  hg: 'hospitality-guest-experience',
  ict: 'information-and-communication-technology',
};

const PracticeIndex = () => {
  const { t } = useTranslation();
  const total = nPrac();

  return (
    <section className="spi" aria-label={t('solutions.index.aria', 'All practices')}>
      <div className="section-head">
        <div>
          <span className="label label--red">{t('solutions.index.label', 'All practices')}</span>
          <h2 className="display" style={{ marginTop: '20px' }}>
            {t('solutions.index.title', 'Solutions')}
          </h2>
        </div>
        <p>
          {t('solutions.index.lede', {
            defaultValue: '{{count}} practices. Each has its own page with the brands we carry for it, the services we provide and the projects we have delivered.',
            count: total,
          })}
        </p>
      </div>

      <div className="spi-grid">
        {PRAC.map((p, i) => {
          const brands = BRANDS.filter((b) => b.s.includes(p.k)).length;
          const slug = SLUG[p.k];
          const body = (
            <>
              <span className="spi-idx">
                {pad2(i + 1)} / {pad2(total)} · {brands} {brands === 1 ? t('solutions.index.brand', 'brand') : t('solutions.index.brands', 'brands')}
              </span>
              <h3>{p.n}</h3>
              <p>{p.d}</p>
              {slug ? (
                <span className="spi-more">{t('solutions.index.view', 'View solution')} &rarr;</span>
              ) : (
                <span className="spi-soon">{t('newpages.soon', 'Content to come')}</span>
              )}
            </>
          );
          return slug ? (
            <Link key={p.k} to={`/solutions/${slug}`} className="spi-card">{body}</Link>
          ) : (
            <div key={p.k} className="spi-card spi-card--soon">{body}</div>
          );
        })}
      </div>
    </section>
  );
};

export default PracticeIndex;
