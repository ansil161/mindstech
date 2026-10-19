import React from 'react';
import { useTranslation } from 'react-i18next';
import { BRAND_FILTER_REGIONS, brandMatches } from '../../../constants/regionBrands.js';
import './BrandExtras.css';

const ADDS = [
  ['brandx.adds.presales', 'Pre-sales system design'],
  ['brandx.adds.demo', 'Demonstration at the Experience Centre'],
  ['brandx.adds.training', 'Training and certification'],
  ['brandx.adds.stock', 'Local stock'],
  ['brandx.adds.warranty', 'Warranty and RMA support'],
];

/** "Available in" regions + "What Mindstec adds", from the brand wireframe. */
const BrandExtras = ({ brandName }) => {
  const { t } = useTranslation();
  const regions = BRAND_FILTER_REGIONS.filter((r) => brandMatches(brandName, null, r.key));

  return (
    <>
      {regions.length > 0 && (
        <section className="bx-section" aria-label={t('brandx.regions_label', 'Available in')}>
          <div className="section-head">
            <div>
              <span className="label label--red">{t('brandx.regions_label', 'Available in')}</span>
              <h2 className="display" style={{ marginTop: '16px' }}>
                {t('brandx.regions_title_main', 'Regions that')} <em>{t('brandx.regions_title_em', 'carry it')}</em>
              </h2>
            </div>
          </div>
          <div className="bx-tags">
            {regions.map((r) => (
              <span key={r.key} className="bx-tag">{r.label}</span>
            ))}
          </div>
        </section>
      )}

      <section className="bx-section" aria-label={t('brandx.adds_label', 'What Mindstec adds')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('brandx.adds_label', 'What Mindstec adds')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>
              {t('brandx.adds_title_main', 'Beyond the')} <em>{t('brandx.adds_title_em', 'box')}</em>
            </h2>
          </div>
        </div>
        <ul className="bx-list">
          {ADDS.map(([key, label]) => (
            <li key={key} className="bx-row reveal">{t(key, label)}</li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default BrandExtras;
