import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './galleryNew.css';

/** Wireframe: three Experience Centre cards (photo, 3-photo strip, placeholder details). */
export default function GalleryCentresGrid() {
  const { t } = useTranslation();
  return (
    <section className="gnx" id="gallery-centres" aria-label="Experience Centres">
      <div className="gnx-xc">
        {[1, 2, 3].map((i) => (
          <Link key={i} to="/experience" className="office">
            <div className="gnx-ph">{t('gallery.centres.photo', 'Experience Centre photo')}</div>
            <div className="gnx-strip">
              {[1, 2, 3].map((j) => (
                <div key={j} className="gnx-ph">{t('gallery.centres.strip', 'Photo')}</div>
              ))}
            </div>
            <div className="office-head">
              <h3>{t('gallery.centres.name', 'Experience Centre {{n}}', { n: i })}</h3>
            </div>
            <div className="gnx-dash">
              {t('gallery.centres.details', 'City and country, what is on show, opening hours.')}
            </div>
            <span className="gnx-go">{t('gallery.centres.explore', 'Explore this centre')} →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
