import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PRAC, REG } from '../../../constants/wireframeData.js';
import './galleryNew.css';

/** Wireframe per-solution gallery: Application + Region filters and a project grid. */
export default function GallerySolutionView({ solKey, onBack }) {
  const { t } = useTranslation();
  const [app, setApp] = useState('All');
  const [region, setRegion] = useState('All');
  const p = PRAC.find((x) => x.k === solKey);
  if (!p) return null;

  const chips = (cur, set, list) =>
    ['All', ...list].map((val) => (
      <button key={val} type="button" className="gnx-chip" aria-pressed={cur === val} onClick={() => set(val)}>
        {val === 'All' ? t('gallery.sol.all', 'All') : val}
      </button>
    ));

  return (
    <section className="gnx" id="gallery-solution" aria-label={p.n}>
      <div className="section-head">
        <div>
          <span className="label label--red">{t('gallery.sol.label', 'Project gallery')}</span>
          <h2 className="display">{p.n}</h2>
        </div>
        <p className="side">
          {t('gallery.sol.desc', 'Project photos from our {{name}} work. Filter by application or region.', { name: p.n })}
        </p>
      </div>
      <div className="gnx-filters">
        <span>{t('gallery.sol.application', 'Application')}</span>
        {chips(app, setApp, p.a)}
      </div>
      <div className="gnx-filters">
        <span>{t('gallery.sol.region', 'Region')}</span>
        {chips(region, setRegion, Object.values(REG).map((v) => v.n))}
      </div>
      <div className="gnx-proj">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="gnx-ph">{p.a[i % p.a.length]}</div>
            <div className="gnx-dash">{t('gallery.sol.placeholder', 'Project name, client, country')}</div>
          </div>
        ))}
      </div>
      <div className="gnx-nav">
        <button type="button" className="btn" onClick={onBack}>
          <span>← {t('gallery.sol.back', 'All solutions')}</span>
        </button>
        <Link to="/solutions" className="btn">
          <span>{t('gallery.sol.about', 'About {{name}}', { name: p.n })}</span>
        </Link>
      </div>
    </section>
  );
}
