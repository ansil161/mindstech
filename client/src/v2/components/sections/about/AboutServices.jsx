import React from 'react';
import { useTranslation } from 'react-i18next';
import './about-extras.css';

const SERVICES = [
  ['svc1', 'System design and consultancy'],
  ['svc2', 'Supply'],
  ['svc3', 'Installation'],
  ['svc4', 'Commissioning'],
  ['svc5', 'Training and after-sales support'],
];

const AboutServices = () => {
  const { t } = useTranslation();
  return (
    <section className="ax-sec" aria-label="From design to commissioning">
      <div className="section-head">
        <div>
          <span className="label label--red">{t('about.services.label', 'What we do')}</span>
          <h2 className="display" style={{ marginTop: '16px' }}>
            {t('about.services.title_main', 'From design to')} <em>{t('about.services.title_em', 'commissioning')}</em>
          </h2>
        </div>
        <p className="lede side">
          {t('about.services.lede', 'We design, supply, install, commission and consult on professional audio-visual systems, working with integrators, consultants and end users.')}
        </p>
      </div>
      <ul className="ax-list">
        {SERVICES.map(([k, label], i) => (
          <li className="ax-row reveal" key={k}>
            <span className="num">{String(i + 1).padStart(2, '0')}</span>
            <span>{t(`about.services.${k}`, label)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default AboutServices;
