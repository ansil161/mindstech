import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import NewPageHero from '../../components/sections/newpages/NewPageHero.jsx';
import PlaceholderCard from '../../components/sections/newpages/PlaceholderCard.jsx';
import EnquiryForm from '../../components/sections/newpages/EnquiryForm.jsx';

const Training = () => {
  const { t } = useTranslation();
  useEffect(() => {
    document.title = 'Training Academy — Mindstec Distribution';
    window.scrollTo(0, 0);
  }, []);

  return (
    <main id="top" className="ct">
      <NewPageHero
        crumb={t('training.crumb', 'Mindstec / Training Academy')}
        title={t('training.title', 'Mindstec Training Academy')}
        lede={t('training.lede', 'Brand certifications and technical courses for integrators, consultants and end users.')}
      />
      <section className="ct-wrap np-body">
        <div className="np-split">
          <div className="np-stack">
            <PlaceholderCard title={t('training.catalogue', 'Course catalogue')} hint={t('training.catalogue_hint', 'By brand and solution, with level and duration.')} />
            <PlaceholderCard title={t('training.schedule', 'Schedule')} hint={t('training.schedule_hint', 'Upcoming sessions by city and date.')} />
            <PlaceholderCard title={t('training.certs', 'Brand certifications')} hint={t('training.certs_hint', 'What each certification covers and who it is for.')} />
          </div>
          <div className="np-card">
            <span className="np-eyebrow">{t('training.coming', 'Coming soon')}</span>
            <h3>{t('training.notify_title', 'Get notified when courses open')}</h3>
            <EnquiryForm
              id="tr"
              subject="Training Academy: notify me"
              messageLabel={t('training.notify_msg', 'Brands or topics you are interested in')}
              cta={t('training.notify_cta', 'Notify me')}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Training;
