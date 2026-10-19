import React from 'react';
import { useTranslation } from 'react-i18next';
import './about-wf.css';

// Content-to-come placeholders from the client wireframe (global About).
const AboutMissionTimeline = () => {
  const { t } = useTranslation();
  return (
    <section className="awf-sec" aria-label="Mission, values and timeline">
      <div className="awf-grid">
        <div className="awf-ph reveal">
          <h3>{t('about.wf.values_title', 'Mission and values')}</h3>
          <p>{t('about.wf.values_hint', 'Final wording from the strategic plan.')}</p>
          <span className="awf-soon">{t('newpages.soon', 'Content to come')}</span>
        </div>
        <div className="awf-ph reveal">
          <h3>{t('about.wf.timeline_title', 'Company timeline')}</h3>
          <p>{t('about.wf.timeline_hint', 'Key milestones 2006 to 2026, matters of record only.')}</p>
          <span className="awf-soon">{t('newpages.soon', 'Content to come')}</span>
        </div>
      </div>
    </section>
  );
};

export default AboutMissionTimeline;
