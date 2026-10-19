import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CONTACT_OFFICES, OFFICE_COUNT } from '../../constants/contactOffices';
import NewPageHero from '../../components/sections/newpages/NewPageHero.jsx';
import PlaceholderCard from '../../components/sections/newpages/PlaceholderCard.jsx';
import EnquiryForm from '../../components/sections/newpages/EnquiryForm.jsx';

const offices = CONTACT_OFFICES.map((o) => `${o.city}, ${o.country}`);
const regions = [...new Set(CONTACT_OFFICES.map((o) => o.team))];

const Careers = () => {
  const { t } = useTranslation();
  const [region, setRegion] = useState('all');
  const [office, setOffice] = useState(offices[0]);

  useEffect(() => {
    document.title = 'Careers — Mindstec Distribution';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main id="top" className="ct">
      <NewPageHero
        crumb={t('careers.crumb', 'Mindstec / Careers')}
        title={t('careers.title', 'Careers')}
        lede={t('careers.lede', 'Work with ProAV engineers, product specialists and commercial teams across {{offices}} offices.', { offices: OFFICE_COUNT })}
      />
      <section className="ct-wrap np-body">
        <div className="np-split">
          <div className="np-stack">
            <span className="label label--red">{t('careers.why_label', 'Why Mindstec')}</span>
            <PlaceholderCard title={t('careers.why', 'Why Mindstec')} hint={t('careers.why_hint', 'Culture, training, growth paths, what a first year looks like.')} />
          </div>
          <div className="np-stack">
            <span className="label label--red">{t('careers.roles_label', 'Open roles')}</span>
            <div className="np-chips" role="group" aria-label={t('careers.filter', 'Filter by region')}>
              <button type="button" className="np-chip" aria-pressed={region === 'all'} onClick={() => setRegion('all')}>
                {t('careers.all_regions', 'All regions')}
              </button>
              {regions.map((r) => (
                <button key={r} type="button" className="np-chip" aria-pressed={region === r} onClick={() => setRegion(r)}>{r}</button>
              ))}
            </div>
            <PlaceholderCard title={t('careers.roles_title', 'Open roles')} hint={t('careers.roles_hint', 'Role title, office, function.')} />
          </div>
        </div>

        <div className="np-card" style={{ maxWidth: 720 }}>
          <h3>{t('careers.cv_title', 'Send us your CV')}</h3>
          <div className="ct-field" style={{ marginTop: 16 }}>
            <label htmlFor="cv-o">{t('careers.office', 'Preferred office')}</label>
            <select id="cv-o" value={office} onChange={(e) => setOffice(e.target.value)}>
              {offices.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <EnquiryForm
            id="cv"
            subject="Careers: CV submission"
            messageLabel={t('careers.cv_msg', 'About you and the role you are interested in')}
            cta={t('careers.cv_cta', 'Submit application')}
            extra={() => `Preferred office: ${office}`}
          />
        </div>
      </section>
    </main>
  );
};

export default Careers;
