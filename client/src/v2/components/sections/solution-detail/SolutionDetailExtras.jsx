import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlaceholderCard from '../newpages/PlaceholderCard.jsx';
import { BRANDS, PRAC, PSHORT, REG, slug as toSlug } from '../../../constants/wireframeData.js';
import './solutionDetailExtras.css';

// Site solution slug -> wireframe practice key. Pro Audio (pa) and AV
// Infrastructure (ai) exist in the wireframe but have no site page yet.
const SLUG_TO_KEY = {
  'control-rooms-critical-environments': 'cr',
  'conferencing-collaboration': 'cc',
  'immersive-experience': 'ie',
  'broadcast-production-streaming': 'bp',
  'digital-signage-dooh': 'ds',
  'hospitality-guest-experience': 'hg',
  'information-and-communication-technology': 'ict',
};
const KEY_TO_SLUG = Object.fromEntries(Object.entries(SLUG_TO_KEY).map(([s, k]) => [k, s]));

const Head = ({ label, main, em }) => (
  <div className="section-head">
    <div>
      <span className="label label--red">{label}</span>
      <h2 className="display">
        {main} {em && <em>{em}</em>}
      </h2>
    </div>
  </div>
);

/** Practice overview placeholder (wireframe: Overview). */
export const SolutionOverview = ({ slug }) => {
  const { t } = useTranslation();
  const prac = PRAC.find((p) => p.k === SLUG_TO_KEY[slug]);
  if (!prac) return null;
  return (
    <section className="sdx" aria-label={t('solutions.overview_label', 'Overview')}>
      <span className="label label--red">{t('solutions.overview', 'Overview')}</span>
      <div className="sdx-overview">
        <PlaceholderCard
          title={t('solutions.practice_overview', 'Practice overview')}
          hint={t('solutions.practice_overview_hint', 'The problems this practice solves and the outcomes clients get.')}
        />
      </div>
    </section>
  );
};

/** Brand tiles with solution + region tags, linking to the brand page. */
export const SolutionBrandTiles = ({ slug }) => {
  const { t } = useTranslation();
  const key = SLUG_TO_KEY[slug];
  const prac = PRAC.find((p) => p.k === key);
  if (!prac) return null;
  const brands = BRANDS.filter((b) => b.s.includes(key));
  if (!brands.length) return null;
  return (
    <section className="sdx" aria-label={t('solutions.brand_tiles_label', 'Brands we carry')}>
      <div className="section-head">
        <div>
          <span className="label label--red">{t('solutions.brands', 'Brands')}</span>
          <h2 className="display">
            {brands.length} <em>{brands.length === 1 ? t('solutions.brand_one', 'brand') : t('solutions.brand_many', 'brands')}</em>
          </h2>
        </div>
        <p className="lede side">
          {t('solutions.brand_tiles_side', 'The brands we carry for {{name}}. Each brand page shows the regions where it is available.', { name: prac.n })}
        </p>
      </div>
      <ul className="sdx-tiles reveal-stagger">
        {brands.map((b) => (
          <li key={b.n}>
            <Link className="sdx-tile" to={`/products/${toSlug(b.n)}`}>
              <b>{b.n}</b>
              <span className="sdx-tags">
                {b.s.map((s) => (
                  <i key={s}>{PSHORT[s]}</i>
                ))}
              </span>
              <span className="sdx-tags sdx-tags--region">
                {b.r.map((r) => (
                  <i key={r}>{REG[r].n}</i>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

/** "In action": three project placeholders. */
export const SolutionProjects = ({ slug }) => {
  const { t } = useTranslation();
  const key = SLUG_TO_KEY[slug];
  if (!key) return null;
  return (
    <section className="sdx" aria-label={t('solutions.projects_label', 'Projects')}>
      <Head
        label={t('solutions.projects', 'Projects')}
        main={t('solutions.projects_title_main', 'In')}
        em={t('solutions.projects_title_em', 'action')}
      />
      <div className="sdx-cols reveal-stagger">
        {[1, 2, 3].map((n) => (
          <div key={n} className="sdx-project">
            <div className="sdx-photo">
              <span>{t('solutions.project_photo', 'Project photo')} · {PSHORT[key]}</span>
            </div>
            <PlaceholderCard title={t('solutions.project_placeholder', 'Project name, client, region')} />
          </div>
        ))}
      </div>
    </section>
  );
};

/** Related Training Academy courses placeholder. */
export const SolutionTraining = () => {
  const { t } = useTranslation();
  return (
    <section className="sdx" aria-label={t('solutions.training_label', 'Training Academy courses')}>
      <PlaceholderCard
        title={t('solutions.training_title', 'Related Training Academy courses')}
        hint={t('solutions.training_hint', 'Shown once courses are published.')}
      />
    </section>
  );
};

/** Previous / next practice, in wireframe order, limited to practices with a page. */
export const SolutionPager = ({ slug }) => {
  const { t } = useTranslation();
  const list = PRAC.filter((p) => KEY_TO_SLUG[p.k]);
  const i = list.findIndex((p) => p.k === SLUG_TO_KEY[slug]);
  if (i < 0) return null;
  const prev = list[(i + list.length - 1) % list.length];
  const next = list[(i + 1) % list.length];
  return (
    <nav className="sdx sdx-pager" aria-label={t('solutions.pager_label', 'Previous and next solution')}>
      <Link className="btn" to={`/solutions/${KEY_TO_SLUG[prev.k]}`}>
        <span>← {prev.n}</span>
      </Link>
      <Link className="btn" to={`/solutions/${KEY_TO_SLUG[next.k]}`}>
        <span>{next.n} →</span>
      </Link>
    </nav>
  );
};
