import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../../../api/axios';
import Button from '../../common/Button/Button.jsx';

// Words that tie a CMS project's free-text category to a solution vertical.
const KEYWORDS = {
  'control-rooms-critical-environments': ['control', 'command', 'noc', 'critical', 'surveillance'],
  'conferencing-collaboration': ['conferenc', 'collaborat', 'meeting', 'boardroom', 'workplace', 'education'],
  'immersive-experience': ['immersive', 'experience', 'event', 'exhibition', 'projection'],
  'broadcast-production-streaming': ['broadcast', 'production', 'streaming', 'studio'],
  'digital-signage-dooh': ['signage', 'dooh', 'retail', 'led', 'display'],
  'hospitality-guest-experience': ['hospitality', 'hotel', 'guest', 'restaurant'],
  'information-and-communication-technology': ['ict', 'network', 'infrastructure', 'communication'],
};

/**
 * "Projects / In action" from the wireframe's solution page: up to three
 * delivered projects for this vertical, from the CMS. Projects whose category
 * matches the vertical come first; the rest fill any remaining slots so the
 * section reads as a showcase rather than an empty box. Renders nothing when
 * there are no projects at all.
 */
const SolutionProjects = ({ slug }) => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let cancelled = false;
    axios
      .get('/admin/fieldwork/', { withCredentials: false })
      .then((res) => {
        if (!cancelled) setProjects(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const words = KEYWORDS[slug] || [];
  const matches = (p) => words.some((w) => `${p.category} ${p.title}`.toLowerCase().includes(w));
  const shown = [...projects.filter(matches), ...projects.filter((p) => !matches(p))].slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <section className="work" aria-label={t('solutions.projects_label', 'Projects')}>
      <div className="section-head">
        <div>
          <span className="label label--red">{t('solutions.projects', 'Projects')}</span>
          <h2 className="display" style={{ marginTop: '16px' }}>
            {t('solutions.projects_title_main', 'In')} <em>{t('solutions.projects_title_em', 'action')}</em>
          </h2>
        </div>
        <Button to="/projects" className="text-link">
          <span>{t('solutions.projects_all', 'All projects')}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Button>
      </div>
      <div className="work-grid-premium">
        {shown.map((project) => (
          <div key={project.id} className="work-card">
            <div className="work-card-image">
              <img src={project.image} alt={project.title} loading="lazy" />
              <div className="work-card-overlay"></div>
            </div>
            <div className="work-card-content">
              <span className="work-card-category">{project.category}</span>
              <h3 className="work-card-title">{project.title}</h3>
              <p className="work-card-meta">{project.location_meta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SolutionProjects;
