import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BRANDS, slug } from '../../../constants/wireframeData.js';
import BrandDetailExtras from './BrandDetailExtras.jsx';
import './brand-detail.css';

export const findFallbackBrand = (s) => BRANDS.find((b) => slug(b.n) === s);

/** Lightweight page for brands that exist in the wireframe but not the catalogue. */
const BrandFallback = ({ brand }) => {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = `${brand.n} — Products — Mindstec Distribution`;
    window.scrollTo(0, 0);
  }, [brand]);

  return (
    <main id="top">
      <section className="pb-hero">
        <nav className="pb-crumb" aria-label="Breadcrumb">
          <Link to="/products">{t('navbar.products', 'Brands')}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{brand.n}</span>
        </nav>
        <div className="pb-hero-main">
          <h1 className="display">{brand.n}</h1>
          <p className="pb-lede">{t('bd.positioning', 'One-line positioning to come, approved by the OEM.')}</p>
        </div>
      </section>
      <section className="pb-about">
        <span className="label label--red">{t('bd.overview', 'Overview')}</span>
        <p className="pb-about-body">
          {t('bd.overview_ph', 'Overview to come: 60 to 100 words in Mindstec’s voice on what the brand does and why we carry it.')}
        </p>
      </section>
      <BrandDetailExtras brandName={brand.n} showSolutions />
    </main>
  );
};

export default BrandFallback;
