import { useTranslation } from 'react-i18next';
import { PRAC } from '../../../constants/wireframeData.js';
import './galleryNew.css';

/** Wireframe "Choose a solution": 9 practice cards that open the per-solution gallery. */
export default function GalleryProjectPicker({ onSelect }) {
  const { t } = useTranslation();
  return (
    <section className="gnx" id="gallery-practices" aria-label="Choose a solution">
      <div className="section-head">
        <div>
          <span className="label label--red">{t('gallery.pick.label', 'Projects by solution')}</span>
          <h2 className="display">
            {t('gallery.pick.title', 'Browse projects by ')}
            <em>{t('gallery.pick.title_em', 'practice')}</em>
          </h2>
        </div>
        <p className="side">{t('gallery.pick.desc', 'Choose a solution to see its project photos.')}</p>
      </div>
      <div className="gnx-pick">
        {PRAC.map((p) => (
          <button key={p.k} type="button" className="gnx-btn" onClick={() => onSelect(p.k)}>
            <div className="gnx-ph">{t('gallery.pick.cover', 'Cover photo')}</div>
            <span className="gnx-name">{p.n}</span>
            <span className="gnx-go">{t('gallery.pick.go', 'View projects')} →</span>
          </button>
        ))}
      </div>
    </section>
  );
}
