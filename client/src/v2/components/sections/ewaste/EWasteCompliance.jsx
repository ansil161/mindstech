import React from 'react';
import { useTranslation } from 'react-i18next';
import './EWasteCompliance.css';

// Wireframe sections not otherwise present on the page: responsibility /
// compliance details and the authorised recyclers list.
const EWasteCompliance = () => {
  const { t } = useTranslation();
  const soon = t('newpages.soon', 'Content to come');
  return (
    <section className="ewc" aria-label="Our responsibility and authorised recyclers">
      <div className="ewc-head" data-reveal>
        <span className="label label--red">{t('ewaste.compliance.label', 'Compliance')}</span>
        <h2 className="display">{t('ewaste.compliance.title_main', 'Our responsibility,')} <em>{t('ewaste.compliance.title_em', 'on record.')}</em></h2>
      </div>
      <div className="ewc-grid">
        <div className="ewc-card" data-reveal>
          <h3>{t('ewaste.compliance.resp_title', 'Our responsibility')}</h3>
          <p>{t('ewaste.compliance.resp_hint', 'Compliance statement and registration details for India.')}</p>
          <div className="ewc-soon">{soon}</div>
        </div>
        <div className="ewc-card" data-reveal>
          <h3>{t('ewaste.compliance.rec_title', 'Authorised recyclers')}</h3>
          <p>{t('ewaste.compliance.rec_hint', 'Government-authorised recyclers who process returned equipment.')}</p>
          <div className="ewc-soon">{soon}</div>
        </div>
      </div>
    </section>
  );
};

export default EWasteCompliance;
