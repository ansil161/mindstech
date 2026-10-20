import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './TrainingBand.css';

/**
 * "Coming soon" band for the Mindstec Training Academy, from the wireframe's
 * closing strip on the Home page. Links to /training.
 */
const TrainingBand = () => {
  const { t } = useTranslation();
  return (
    <section className="home-training" aria-label={t('home.training.aria', 'Mindstec Training Academy')}>
      <Link to="/training" className="home-training__band">
        <span className="home-training__tag">{t('home.training.soon', 'Coming soon')}</span>
        <span className="home-training__text">
          <b>{t('home.training.title', 'Mindstec Training Academy')}</b>
          {' · '}
          {t('home.training.desc', 'Brand certifications and technical courses')}
        </span>
      </Link>
    </section>
  );
};

export default TrainingBand;
