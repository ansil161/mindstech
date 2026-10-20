import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BRANDS, nOff, nCountries, nPrac } from '../../../constants/wireframeData.js';
import './HomeFigures.css';

/**
 * Wireframe "stats strip" (years since 2006, offices, countries, brands,
 * practices) plus the brands heading with a "See all brands" link that sits
 * above the existing brand ticker. Figures derive from the shared
 * wireframe data so they stay consistent with the offices/brands pages.
 */
const HomeFigures = () => {
  const { t } = useTranslation();
  const figs = [
    { k: 'years', v: new Date().getFullYear() - 2006, l: 'Years, since 2006' },
    { k: 'offices', v: nOff(), l: 'Offices' },
    { k: 'countries', v: nCountries(), l: 'Countries' },
    { k: 'brands', v: BRANDS.length, l: 'Brands' },
    { k: 'practices', v: nPrac(), l: 'Solution practices' },
  ];

  return (
    <section className="home-figs" aria-label={t('home.figures.aria', 'Mindstec at a glance')}>
      <div className="home-figs__head">
        <div>
          <span className="label label--red">{t('home.figures.label', 'Brands')}</span>
          <h2 className="display" style={{ marginTop: '16px' }}>
            {BRANDS.length} <em>{t('home.figures.brands_em', 'brands')}</em>
          </h2>
        </div>
        <Link to="/partners" className="btn">
          <span>{t('home.figures.see_all', 'See all brands')}</span>
        </Link>
      </div>
      <div className="home-figs__grid">
        {figs.map((f) => (
          <div className="home-figs__cell reveal" key={f.k}>
            <b>{f.v}</b>
            <span>{t(`home.figures.${f.k}`, f.l)}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeFigures;
