import React from 'react';
import { useTranslation } from 'react-i18next';
import { SOLUTION_APPLICATIONS } from './solutionApplications.js';

/** "Where it is used": the wireframe's Applications list for a solution. */
const SolutionApplications = ({ slug }) => {
  const { t } = useTranslation();
  const items = SOLUTION_APPLICATIONS[slug];
  if (!items || !items.length) return null;

  return (
    <section className="industries" aria-label={t('solutions.applications_label', 'Applications')}>
      <div className="section-head">
        <div>
          <span className="label label--red">{t('solutions.applications', 'Applications')}</span>
          <h2 className="display">
            {t('solutions.applications_title_main', 'Where it is')} <em>{t('solutions.applications_title_em', 'used')}</em>
          </h2>
        </div>
      </div>
      <ul className="industry-grid reveal-stagger">
        {items.map((name) => (
          <li className="industry-card" key={name}>
            <span className="industry-name">{t(`solutions.applications_items.${name}`, name)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SolutionApplications;
