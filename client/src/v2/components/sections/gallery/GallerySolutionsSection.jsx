import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getFallbackSolutions } from '../../../constants/solutions.js';
import './gallerySections.css';

/** Wireframe "Projects by solution": one card per solution vertical. */
export default function GallerySolutionsSection() {
  const { t } = useTranslation();
  const solutions = getFallbackSolutions(t);

  return (
    <section className="gsx" aria-label="Projects by solution">
      <div className="section-head">
        <div>
          <span className="label label--red">{t('gallery.solutions.label', 'Projects by solution')}</span>
          <h2 className="display">
            {t('gallery.solutions.title', 'Choose a ')}
            <em>{t('gallery.solutions.title_em', 'solution')}</em>
          </h2>
        </div>
        <p className="side">{t('gallery.solutions.desc', 'Our projects, organised by solution.')}</p>
      </div>
      <div className="gsx-grid">
        {solutions.map((s) => (
          <Link key={s.slug} to={`/solutions/${s.slug}`} className="office gsx-card">
            <div className="gsx-cover" aria-hidden="true">
              {s.image && <img src={s.image} alt="" loading="lazy" />}
            </div>
            <div className="office-head"><h3>{s.title}</h3></div>
            <span className="text-link">{t('gallery.solutions.go', 'About this solution')} →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
