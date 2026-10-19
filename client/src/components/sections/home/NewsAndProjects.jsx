import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from '../../../api/axios';
import Button from '../../common/Button/Button.jsx';

// Shown until the backend has content: local library images + placeholder copy.
const FALLBACK = {
  news: [
    { image: '/assets/img/pexels-18304031-w900.jpg', alt: 'A dark desk setup with one large monitor and a second vertical display' },
    { image: '/assets/img/unsplash-1518770660439-4636190af475-w900.jpg', alt: 'Macro photograph of a circuit board with processors and components' },
  ],
  project: [
    { image: '/assets/img/pexels-13323673-w1400.jpg', alt: 'A dark-toned conference room with a wall-mounted display' },
  ],
};

const formatDate = (iso, lang) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: 'numeric' });
};

/** Home "News and projects": latest two news items around the latest project. */
const NewsAndProjects = () => {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let cancelled = false;
    axios.get('/admin/public/news/', { withCredentials: false })
      .then((res) => { if (!cancelled) setNews(res.data || []); })
      .catch(() => {});
    axios.get('/admin/fieldwork/', { withCredentials: false })
      .then((res) => { if (!cancelled) setProjects(res.data || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // News / Project / News, matching the wireframe order.
  const slots = [
    { kind: 'news', item: news[0], fb: FALLBACK.news[0] },
    { kind: 'project', item: projects[0], fb: FALLBACK.project[0] },
    { kind: 'news', item: news[1], fb: FALLBACK.news[1] },
  ];

  return (
    <section className="journal" id="news-projects" aria-label={t('home.news_projects.label', 'News and projects')}>
      <div className="section-head">
        <div>
          <span className="label label--red">{t('home.news_projects.eyebrow', 'Latest')}</span>
          <h2 className="display" style={{ marginTop: '16px' }}>
            {t('home.news_projects.title_main', 'News and')} <em>{t('home.news_projects.title_em', 'projects')}</em>
          </h2>
        </div>
        <div className="np-actions">
          <Button to="/events" className="text-link">
            <span>{t('home.news_projects.all_news', 'All news')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Button>
          <Button to="/gallery" className="text-link">
            <span>{t('home.news_projects.gallery', 'Gallery')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="journal-grid">
        {slots.map(({ kind, item, fb }, i) => {
          const isProject = kind === 'project';
          const kindLabel = isProject ? t('home.news_projects.project', 'Project') : t('home.news_projects.news', 'News');
          const title = item
            ? item.title
            : (isProject ? t('home.news_projects.project_placeholder', 'Featured project') : t('home.news_projects.news_placeholder', 'Latest news item'));
          const meta = item
            ? (isProject ? item.location_meta : formatDate(item.created_at, i18n.language))
            : t('home.news_projects.soon', 'Coming soon');
          const href = isProject ? '/projects' : '/events';
          const external = !isProject && item?.external_url;
          const body = (
            <>
              <div className="post-img">
                <img src={item?.image || fb.image} alt={item ? item.title : fb.alt} loading="lazy" />
              </div>
              <div className="post-body">
                <div className="post-meta">
                  <span className="cat">{kindLabel}</span>
                  {item?.region_name && <span>{item.region_name}</span>}
                </div>
                <h3>{title}</h3>
                <div className="post-foot">{meta}</div>
              </div>
            </>
          );
          return external ? (
            <a className="post reveal" key={i} href={item.external_url} target="_blank" rel="noopener noreferrer">{body}</a>
          ) : (
            <Link className="post reveal" key={i} to={href}>{body}</Link>
          );
        })}
      </div>
    </section>
  );
};

export default NewsAndProjects;
