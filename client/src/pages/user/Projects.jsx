import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import { whenReady } from '../../utils/pageReveal';
import Button from '../../components/common/Button/Button.jsx';
import axios from '../../api/axios';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';

gsap.registerPlugin(ScrollTrigger);

/**
 * Public case-study index.
 *
 * Replaces the old "Installations" nav entry, which was an in-page anchor to
 * the home page's #work strip — four cards, no filtering, and a link that
 * behaved differently depending on which page you clicked it from.
 *
 * Backed by the same /admin/fieldwork/ collection the home page uses, plus the
 * `status` field added in adminpanel migration 0030, so "completed" and
 * "ongoing" are editorial facts from the CMS rather than a client-side guess.
 */
const STATUS_ALL = 'all';

const Projects = () => {
  const { t } = useTranslation();
  const containerRef = useRef(null);

  const [rawProjects, setRawProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(STATUS_ALL);
  const [categoryFilter, setCategoryFilter] = useState(STATUS_ALL);

  const { translatedData: projects } = useDynamicTranslation(
    rawProjects,
    ['title', 'location_meta', 'category', 'summary'],
    'projects_list',
  );

  useEffect(() => {
    document.title = 'Projects — Mindstec Distribution';
    let cancelled = false;
    const fetchProjects = async () => {
      try {
        const res = await axios.get('/admin/fieldwork/');
        if (!cancelled) setRawProjects(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load projects:', err);
        if (!cancelled) setRawProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProjects();
    return () => { cancelled = true; };
  }, []);

  // Category chips come from the data, not a hardcoded list, so a new CMS
  // category shows up without a code change.
  const categories = useMemo(() => {
    const seen = new Map();
    projects.forEach((p) => {
      const label = (p.category || '').trim();
      if (label && !seen.has(label.toLowerCase())) seen.set(label.toLowerCase(), label);
    });
    return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const counts = useMemo(() => ({
    all: projects.length,
    completed: projects.filter((p) => p.status !== 'ongoing').length,
    ongoing: projects.filter((p) => p.status === 'ongoing').length,
  }), [projects]);

  const visible = useMemo(() => projects.filter((p) => {
    const status = p.status === 'ongoing' ? 'ongoing' : 'completed';
    if (statusFilter !== STATUS_ALL && status !== statusFilter) return false;
    if (categoryFilter !== STATUS_ALL && (p.category || '').toLowerCase() !== categoryFilter) return false;
    return true;
  }), [projects, statusFilter, categoryFilter]);

  // A category can be emptied by the status filter (e.g. no ongoing hospitality
  // work). Falling back to "all categories" beats showing a dead-end grid.
  useEffect(() => {
    if (categoryFilter === STATUS_ALL) return;
    const stillExists = projects.some(
      (p) => (p.category || '').toLowerCase() === categoryFilter,
    );
    if (!stillExists) setCategoryFilter(STATUS_ALL);
  }, [projects, categoryFilter]);

  // Hero entrance
  useEffect(() => {
    let stopIntro = () => {};
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        return;
      }
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .fromTo('#pjHero .w',
          { yPercent: 115, rotate: 2 },
          { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.1, ease: 'power4.out' })
        .fromTo('#pjHeroSide',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1 }, '-=.8');
      stopIntro = whenReady(() => intro.play());
    }, containerRef);
    return () => { stopIntro(); ctx.revert(); };
  }, []);

  // Card reveals. Re-run on every filter change: the grid is rebuilt, so the
  // previous batch's triggers point at detached nodes.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.pj-card');
      if (!cards.length) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(cards, { opacity: 1, y: 0 });
        return;
      }
      gsap.set(cards, { opacity: 0, y: 30 });
      ScrollTrigger.batch(cards, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          stagger: { each: 0.07 },
          overwrite: true,
          // The gsap.set above writes an inline transform, which would
          // otherwise outrank `.pj-card:hover`'s lift.
          clearProps: 'transform',
        }),
      });
    }, containerRef);

    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => { ctx.revert(); clearTimeout(timer); };
  }, [visible.length, statusFilter, categoryFilter]);

  const statusTabs = [
    { key: STATUS_ALL, label: t('projects.filter.all', 'All projects'), count: counts.all },
    { key: 'completed', label: t('projects.filter.completed', 'Completed'), count: counts.completed },
    { key: 'ongoing', label: t('projects.filter.ongoing', 'Ongoing'), count: counts.ongoing },
  ];

  return (
    <div ref={containerRef}>
      {/* HERO */}
      <section className="shero" aria-label={t('projects.hero.label', 'Projects')}>
        <h1 className="display" id="pjHero">
          <span className="line-mask"><span className="w">{t('projects.hero.line1', 'Proof, not')}</span></span>
          <span className="line-mask"><span className="w"><em>{t('projects.hero.line2', 'promises.')}</em></span></span>
        </h1>
        <div className="shero-side" id="pjHeroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>
            {t('projects.hero.label', 'Projects & case studies')}
          </span>
          <p>
            {t(
              'projects.hero.brief',
              'Rooms, control centres and venues our integration partners have delivered with technology we sourced, specified and supported — delivered and in progress.',
            )}
          </p>
        </div>
      </section>

      {/* FILTERS */}
      <div className="pj-wrap">
        <div className="pj-filters" role="group" aria-label={t('projects.filter.aria', 'Filter projects')}>
          <div className="pj-tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`pj-tab ${statusFilter === tab.key ? 'is-active' : ''}`}
                aria-pressed={statusFilter === tab.key}
                onClick={() => setStatusFilter(tab.key)}
              >
                {tab.label}
                <span className="pj-tab-count">{tab.count}</span>
              </button>
            ))}
          </div>

          {categories.length > 1 && (
            <div className="pj-chips">
              <button
                type="button"
                className={`pj-chip ${categoryFilter === STATUS_ALL ? 'is-active' : ''}`}
                aria-pressed={categoryFilter === STATUS_ALL}
                onClick={() => setCategoryFilter(STATUS_ALL)}
              >
                {t('projects.filter.all_categories', 'All sectors')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`pj-chip ${categoryFilter === cat.toLowerCase() ? 'is-active' : ''}`}
                  aria-pressed={categoryFilter === cat.toLowerCase()}
                  onClick={() => setCategoryFilter(cat.toLowerCase())}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GRID */}
        {loading ? (
          <div className="pj-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pj-card pj-card--skeleton" aria-hidden="true">
                <div className="pj-card-img" />
                <div className="pj-card-body">
                  <span className="pj-sk pj-sk--chip" />
                  <span className="pj-sk pj-sk--title" />
                  <span className="pj-sk pj-sk--meta" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="pj-empty">
            <b>{t('projects.empty.title', 'Case studies in preparation')}</b>
            <span>
              {t(
                'projects.empty.body',
                'Nothing published under this filter yet. Talk to us about work in your sector — we can share references directly.',
              )}
            </span>
            <Button solid to="/contact">
              <span>{t('projects.empty.btn', 'Ask for references')}</span>
            </Button>
          </div>
        ) : (
          <>
            <p className="pj-count" aria-live="polite">
              {t('projects.showing', 'Showing {{count}} of {{total}} projects', {
                count: visible.length,
                total: projects.length,
              })}
            </p>
            <div className="pj-grid">
              {visible.map((project) => {
                const ongoing = project.status === 'ongoing';
                return (
                  <article key={project.id} className="pj-card">
                    <div className="pj-card-img">
                      {project.image ? (
                        <img src={project.image} alt={project.title} loading="lazy" />
                      ) : (
                        <div className="pj-card-img--none" aria-hidden="true" />
                      )}
                      <span className={`pj-status ${ongoing ? 'pj-status--ongoing' : ''}`}>
                        {ongoing
                          ? t('projects.status.ongoing', 'Ongoing')
                          : t('projects.status.completed', 'Completed')}
                      </span>
                    </div>
                    <div className="pj-card-body">
                      {project.category && <span className="pj-cat">{project.category}</span>}
                      <h3>{project.title}</h3>
                      {project.location_meta && <p className="pj-meta">{project.location_meta}</p>}
                      {project.summary && <p className="pj-summary">{project.summary}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <section className="cta" id="contact">
        <span className="label label--red">{t('projects.cta.label', 'Your project next')}</span>
        <h2 className="display" style={{ marginTop: '20px' }}>
          {t('projects.cta.title_main', 'Specifying something')}{' '}
          <em>{t('projects.cta.title_em', 'similar?')}</em>
        </h2>
        <div className="cta-row reveal">
          <div className="cta-actions">
            <Button solid to="/contact">
              <span>{t('projects.cta.btn1', 'Talk to a specialist')}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </Button>
            <Button to="/solutions">
              <span>{t('projects.cta.btn2', 'Browse solutions')}</span>
            </Button>
          </div>
          <div className="cta-contacts">
            <div className="c-item">
              <span>{t('contact_info.label')}</span>
              <a href={`tel:${t('contact_info.tel_href')}`}>{t('contact_info.tel_label')}</a>
            </div>
            <div className="c-item">
              <span>{t('contact_info.email_label', 'Email')}</span>
              <a href={`mailto:${t('contact_info.email')}`}>{t('contact_info.email')}</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Projects;
