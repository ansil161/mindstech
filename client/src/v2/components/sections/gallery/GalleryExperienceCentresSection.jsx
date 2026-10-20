import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './gallerySections.css';

/** Wireframe "Experience Centres" block on the gallery listing. */
export default function GalleryExperienceCentresSection() {
  const { t } = useTranslation();
  return (
    <section className="gsx" id="xc" aria-label="Experience Centres">
      <div className="section-head">
        <div>
          <span className="label label--red">{t('gallery.xc.label', 'Experience Centres')}</span>
          <h2 className="display">
            {t('gallery.xc.title', 'See it working ')}
            <em>{t('gallery.xc.title_em', 'before you specify it')}</em>
          </h2>
        </div>
        <p className="side">
          {t('gallery.xc.desc', 'Our Experience Centres show our brands running together in real spaces. Visit one near you.')}
        </p>
      </div>
      <div className="gsx-xc">
        <div className="office gsx-card">
          <div className="office-head"><h3>{t('gallery.xc.card_title', 'Mindstec Experience Centre')}</h3></div>
          <p className="gsx-note">{t('gallery.xc.card_note', 'Content to come')}</p>
          <Link to="/experience" className="text-link">{t('gallery.xc.explore', 'Explore this centre')} →</Link>
        </div>
        <div className="office gsx-card">
          <div className="office-head"><h3>{t('gallery.xc.book_title', 'Book a visit')}</h3></div>
          <p className="gsx-note">
            {t('gallery.xc.book_desc', 'Book a visit and we will show you the systems that fit your project.')}
          </p>
          <Link to="/contact?s=visit" className="text-link">{t('gallery.xc.book_cta', 'Request a visit')} →</Link>
        </div>
      </div>
    </section>
  );
}
