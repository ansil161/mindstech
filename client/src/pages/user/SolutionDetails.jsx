import React, { useEffect, useRef, useState, useMemo, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { whenReady } from '../../utils/pageReveal';
import Button from '../../components/common/Button/Button.jsx';
import SolutionIcon from '../../components/common/SolutionIcons/SolutionIcons.jsx';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';
import { useRegion } from '../../context/RegionContext.jsx';
import { getPublicRegionSolutionBrands } from '../../api/regionApi.js';
import {
  getSolution,
  getRelatedSolutions,
  PROCESS_STEPS,
  COMPANY_METRICS,
} from '../../constants/solutionDetails.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * three.js is ~896 kB and this is one section's decorative backdrop, at the
 * very bottom of a ~9,000px page. A static import would put it in this route's
 * chunk, so every visitor pays for it before the hero paints — see the note in
 * vite.config.js about keeping three behind a lazy boundary. Mounted only once
 * the CTA is within ~600px of the viewport (see `showBackdrop`), which is what
 * actually triggers the fetch.
 */
const ParticleWave = lazy(() => import('../../components/common/ParticleWave/ParticleWave.jsx'));

/**
 * `/solutions/:slug`.
 *
 * The page is a single narrative rather than a stack of similar blocks: what it
 * is (hero) → what we deliver (grid) → what it looks like at scale (showcase) →
 * how the signal actually flows (diagram) → the company behind it (metrics) →
 * where it has been built (installations) → who buys it (industries) → how we
 * work (process) → what we distribute (brands) → the ask (CTA) → where to go
 * next (related).
 *
 * The ask comes before the onward links on purpose: "related solutions" is an
 * invitation to leave, so anything placed after it is read by fewer people.
 * Brands is the one optional section — it renders only when the active region
 * actually carries brands for this vertical.
 *
 * Layout alternates deliberately — split, grid, full-bleed, diagram, band,
 * alternating rows, grid, timeline, grid, panel, cards — so no two adjacent
 * sections share a shape. That rhythm is what stops a long page reading as a
 * template.
 *
 * Content lives in constants/solutionDetails.js. Read the header comment there
 * before publishing: the metrics band carries figures nobody has verified.
 */

/** Every counter finishes inside this window, so the band settles together. */
const COUNT_DURATION = 2;

const SolutionDetails = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { regionSlug } = useRegion();
  const containerRef = useRef(null);
  const ctaRef = useRef(null);
  const [showBackdrop, setShowBackdrop] = useState(false);

  const [regionBrands, setRegionBrands] = useState([]);
  const { translatedData: translatedBrands } = useDynamicTranslation(
    regionBrands,
    ['name'],
    `solution_brands_${regionSlug}`
  );

  useEffect(() => {
    let cancelled = false;
    getPublicRegionSolutionBrands(regionSlug, slug)
      .then((res) => {
        if (!cancelled) setRegionBrands(res.data || []);
      })
      .catch(() => {
        if (!cancelled) setRegionBrands([]);
      });
    return () => {
      cancelled = true;
    };
  }, [regionSlug, slug]);

  // Resolve the static content through i18n once per slug. Asset paths and alt
  // text are passed through untouched — same file, same photograph, every
  // language.
  const data = useMemo(() => {
    const raw = getSolution(slug);
    const tr = (key, fallback) => t(`solutions.details.${slug}.${key}`, fallback);

    return {
      ...raw,
      name: tr('name', raw.name),
      title: tr('title', raw.title),
      kicker: tr('kicker', raw.kicker),
      intro: tr('intro', raw.intro),
      capsSide: tr('capsSide', raw.capsSide),
      trust: raw.trust.map((item, i) => tr(`trust.${i}`, item)),
      heroStats: raw.heroStats.map((s, i) => ({ ...s, label: tr(`heroStats.${i}.label`, s.label) })),
      caps: raw.caps.map((c, i) => ({
        title: tr(`caps.${i}.title`, c[0]),
        desc: tr(`caps.${i}.desc`, c[1]),
        image: c[2],
        alt: c[3],
      })),
      showcase: {
        ...raw.showcase,
        label: tr('showcase.label', raw.showcase.label),
        title: tr('showcase.title', raw.showcase.title),
        desc: tr('showcase.desc', raw.showcase.desc),
        readouts: raw.showcase.readouts.map((r, i) => ({
          ...r,
          label: tr(`showcase.readouts.${i}.label`, r.label),
        })),
      },
      flow: raw.flow.map((f, i) => ({
        ...f,
        title: tr(`flow.${i}.title`, f.title),
        desc: tr(`flow.${i}.desc`, f.desc),
      })),
      installations: raw.installations.map((p, i) => ({
        ...p,
        name: tr(`installations.${i}.name`, p.name),
        industry: tr(`installations.${i}.industry`, p.industry),
        challenge: tr(`installations.${i}.challenge`, p.challenge),
        solution: tr(`installations.${i}.solution`, p.solution),
      })),
      industries: raw.industries.map((ind, i) => ({
        ...ind,
        name: tr(`industries.${i}.name`, ind.name),
      })),
      cta: {
        ...raw.cta,
        label: tr('cta.label', raw.cta.label),
        title: tr('cta.title', raw.cta.title),
        desc: tr('cta.desc', raw.cta.desc),
        primary: { ...raw.cta.primary, text: tr('cta.primary', raw.cta.primary.text) },
        secondary: { ...raw.cta.secondary, text: tr('cta.secondary', raw.cta.secondary.text) },
      },
    };
  }, [slug, t]);

  const related = useMemo(() => getRelatedSolutions(slug), [slug]);

  useEffect(() => {
    document.title = `${data.name} — Mindstec Distribution`;
    window.scrollTo(0, 0);

    let stopIntro = () => {};

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Every animated element starts visible in CSS, so the reduced-motion
      // path only has to neutralise the clip-paths GSAP would otherwise set.
      if (reduceMotion) {
        gsap.set('.reveal, .reveal-stagger > *', { opacity: 1, y: 0 });
        gsap.set('.reveal-img', { clipPath: 'inset(0 0 0% 0)' });
        gsap.utils.toArray('.metric-value[data-count]').forEach((el) => {
          el.textContent = el.dataset.formatted;
        });
        return;
      }

      /* ── HERO ─────────────────────────────────────────────────────────── */
      // paused: the fromTo applies its hidden state immediately (no flash of
      // final copy) but the intro waits for the loader to hand over.
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      intro
        .fromTo('#dTitle .w', { yPercent: 115, rotate: 2 }, { yPercent: 0, rotate: 0, duration: 1.3, stagger: 0.09, ease: 'power4.out' })
        .fromTo('.dhero-kicker', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, '-=1.05')
        .fromTo('#dIntro', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.9 }, '-=0.85')
        .fromTo('.dhero-cta > *', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, '-=0.65')
        .fromTo('.dhero-trust li', { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.5, stagger: 0.06 }, '-=0.5')
        // The frame wipes open from the bottom while the copy rises beside it.
        .fromTo('.dhero-frame', { clipPath: 'inset(0 0 100% 0 round 20px)' }, { clipPath: 'inset(0 0 0% 0 round 20px)', duration: 1.3, ease: 'power4.inOut' }, 0.25)
        .fromTo('.dhero-stat', { opacity: 0, y: 16, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1 }, '-=0.5');
      stopIntro = whenReady(() => intro.play());

      gsap.fromTo(
        '#dHeroImg',
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: '.dhero-frame', start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );

      /* ── GENERIC REVEALS ──────────────────────────────────────────────── */
      // fromTo, not to: nothing in CSS supplies a hidden start state, so a `to`
      // tween would animate 1 → 1 and produce no motion at all.
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          }
        );
      });

      gsap.utils.toArray('.reveal-stagger').forEach((group) => {
        gsap.fromTo(
          group.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.07,
            scrollTrigger: { trigger: group, start: 'top 86%', once: true },
          }
        );
      });

      gsap.utils.toArray('.reveal-img').forEach((el) => {
        // clip-path has no CSS start value and `none` cannot interpolate to an
        // inset, so the closed state has to be established explicitly.
        gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
        gsap.to(el, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.3,
          ease: 'power4.inOut',
          scrollTrigger: { trigger: el, start: 'top 84%', once: true },
        });
      });

      /* ── CAPABILITY GRID ──────────────────────────────────────────────── */
      gsap.fromTo(
        '.cap-card',
        { opacity: 0, y: 40, rotate: 0.6 },
        {
          opacity: 1,
          y: 0,
          rotate: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: { trigger: '.caps-grid', start: 'top 85%', once: true },
        }
      );

      /* ── IMMERSIVE SHOWCASE ───────────────────────────────────────────── */
      gsap.fromTo(
        '.showcase-bg img',
        { yPercent: -10, scale: 1.08 },
        {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: { trigger: '.showcase', start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );

      /* ── SIGNAL FLOW ──────────────────────────────────────────────────── */
      // The connector draws along the axis the steps are laid out on, which
      // flips at 900px. matchMedia rebuilds the tween on the breakpoint change
      // instead of leaving a stale inline scaleX on a now-vertical line.
      const mm = gsap.matchMedia();
      const lineTween = (prop) => ({
        [prop]: 1,
        duration: 1.4,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: '.flow', start: 'top 72%', once: true },
      });
      mm.add('(min-width: 900px)', () => {
        gsap.fromTo('.flow-line i', { scaleX: 0 }, lineTween('scaleX'));
      });
      mm.add('(max-width: 899px)', () => {
        gsap.fromTo('.flow-line i', { scaleY: 0 }, lineTween('scaleY'));
      });

      gsap.fromTo(
        '.flow-step',
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.13,
          scrollTrigger: { trigger: '.flow', start: 'top 72%', once: true },
        }
      );

      /* ── METRICS COUNT-UP ─────────────────────────────────────────────── */
      gsap.utils.toArray('.metric-value[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count);
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const counter = { value: 0 };

        gsap.to(counter, {
          value: target,
          duration: COUNT_DURATION,
          ease: 'power2.out',
          // Grouped separators keep 450 and 99.99 reading as figures rather
          // than raw floats mid-tween.
          onUpdate: () => {
            el.textContent =
              prefix +
              counter.value.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              }) +
              suffix;
          },
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });

      /* ── INSTALLATIONS ────────────────────────────────────────────────── */
      // Copy and image enter from opposite sides, mirrored on the reversed row,
      // so the alternation is felt in the motion and not only in the layout.
      gsap.utils.toArray('.install').forEach((row) => {
        const flipped = row.classList.contains('install--flip');
        gsap.fromTo(
          row.querySelector('.install-copy'),
          { opacity: 0, x: flipped ? 40 : -40 },
          {
            opacity: 1,
            x: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: row, start: 'top 80%', once: true },
          }
        );
      });

      /* ── PROCESS ──────────────────────────────────────────────────────── */
      gsap.fromTo(
        '.process-line i',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: '.process-steps', start: 'top 78%', end: 'bottom 70%', scrub: 0.6 },
        }
      );

      gsap.utils.toArray('.process-step').forEach((step) => {
        gsap.fromTo(
          step,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: step, start: 'top 88%', once: true },
          }
        );
      });

      return () => mm.revert();
    }, containerRef);

    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => {
      stopIntro();
      ctx.revert();
      clearTimeout(timer);
    };
  }, [slug, data.name]);

  // Defer the CTA's WebGL backdrop until the section is nearly in view — that
  // is the point at which the three.js chunk is fetched. rootMargin gives the
  // download a head start so the panel is rarely seen without it.
  useEffect(() => {
    setShowBackdrop(false);
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShowBackdrop(true);
        io.disconnect(); // one-shot: never unmount a live GL context on scroll-away
      },
      { rootMargin: '600px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slug]);

  // The brand wall fills in after its own fetch, which changes page height and
  // invalidates every trigger position below it. Re-measure only.
  useEffect(() => {
    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(timer);
  }, [translatedBrands]);

  // Split the heading at the <em> so each line masks in on its own.
  const renderTitle = (titleHtml) => {
    const emIdx = titleHtml.indexOf('<em>');
    const parts = emIdx === -1 ? [titleHtml] : [titleHtml.slice(0, emIdx), titleHtml.slice(emIdx)];
    return parts.map((part, i) => (
      <span className="line-mask" key={i}>
        <span className="w" dangerouslySetInnerHTML={{ __html: part }} />
      </span>
    ));
  };

  const arrowIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );

  // Prefer the CMS/region brands; fall back to the vertical's canonical list as
  // name tiles. The section previously rendered a bare "no brands" line when
  // the fetch came back empty, which read as a broken page rather than a
  // deliberate one.
  const hasCmsBrands = translatedBrands.length > 0;

  return (
    <main id="top" ref={containerRef} className="sdetail">
      {/* ── 1 · HERO ────────────────────────────────────────────────────── */}
      <section className="dhero" aria-label={`${data.name} overview`}>
        <div className="dhero-grid">
          <div className="dhero-copy">
            <nav className="crumb" aria-label="Breadcrumb">
              <Link to="/solutions">{t('navbar.solutions')}</Link>
              <i aria-hidden="true">·</i>
              <b>{data.name}</b>
            </nav>

            <span className="label label--red dhero-kicker">{data.kicker}</span>

            <h1 className="display" id="dTitle">
              {renderTitle(data.title)}
            </h1>

            <p id="dIntro">{data.intro}</p>

            <div className="dhero-cta">
              <Button solid to="/contact">
                <span>{t('solutions.get_solution', 'Get this solution')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button href="#capabilities">
                <span>{t('solutions.explore_caps', 'Explore capabilities')}</span>
              </Button>
            </div>

            <ul className="dhero-trust">
              {data.trust.map((item) => (
                <li key={item}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="dhero-visual">
            <div className="dhero-frame">
              <img id="dHeroImg" src={data.hero.src} alt={data.hero.alt} fetchPriority="high" />

              {/* Corner brackets and a slow signal sweep. Pure decoration —
                  hence aria-hidden — but it is what makes a stock photograph
                  read as instrumentation rather than as a stock photograph.
                  (The measurement-grid overlay that used to sit here was
                  removed on request.) */}
              <span className="dhero-sweep" aria-hidden="true" />
             

              <ul className="dhero-stats">
                {data.heroStats.map((stat) => (
                  <li className="dhero-stat" key={stat.label}>
                    <span className="dhero-stat-dot" aria-hidden="true" />
                    <b>{stat.value}</b>
                    <span>{stat.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · WHAT WE DELIVER ─────────────────────────────────────────── */}
      <section className="caps" id="capabilities" aria-label={t('solutions.capabilities', 'Capabilities')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('solutions.capabilities', 'Capabilities')}</span>
            <h2 className="display">
              {t('solutions.what_we_deliver_main', 'What we')} <em>{t('solutions.what_we_deliver_em', 'deliver')}</em>
            </h2>
          </div>
          <p className="lede side">{data.capsSide}</p>
        </div>

        {/* A plain grid. This was a snap-scrolling rail, which only pays for
            itself when the list is long enough that showing it all is the
            problem — with four cards it hid a quarter of the section behind an
            interaction and required its own keyboard affordance and two nav
            buttons. Laid out, every capability is visible at once and the
            markup drops a focus target, a role and both controls. */}
        <div className="caps-grid" id="capsList">
          {data.caps.map((cap) => (
            <article className="cap-card" key={cap.title}>
              <div className="cap-card-media">
                <img src={cap.image} alt={cap.alt} loading="lazy" />
              </div>
              <div className="cap-card-body">
                <h3>{cap.title}</h3>
                <p>{cap.desc}</p>
              </div>
              <span className="cap-card-sweep" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      {/* ── 3 · IMMERSIVE SHOWCASE ──────────────────────────────────────── */}
      <section className="showcase" aria-label={data.showcase.label}>
        <div className="showcase-bg" aria-hidden="true">
          <img src={data.showcase.src} alt="" loading="lazy" />
        </div>
        <div className="showcase-inner">
          <div className="showcase-copy reveal">
            <span className="label label--red">{data.showcase.label}</span>
            <h2 className="display" dangerouslySetInnerHTML={{ __html: data.showcase.title }} />
            <p>{data.showcase.desc}</p>
          </div>
          <ul className="showcase-readouts reveal-stagger">
            {data.showcase.readouts.map((r) => (
              <li key={r.label}>
                <b>{r.value}</b>
                <span>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 4 · SIGNAL FLOW ─────────────────────────────────────────────── */}
      <section className="flow" aria-label={t('solutions.flow_label', 'Signal flow')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('solutions.architecture', 'Architecture')}</span>
            <h2 className="display">
              {t('solutions.flow_title_main', 'Source to')} <em>{t('solutions.flow_title_em', 'screen')}</em>
            </h2>
          </div>
          <p className="lede side">
            {t('solutions.flow_side', 'Every stage we specify, in the order the signal meets it — because the weakest link decides what the room is actually capable of.')}
          </p>
        </div>

        <div className="flow-track">
          <span className="flow-line" aria-hidden="true"><i /></span>
          <ol className="flow-steps">
            {data.flow.map((step, i) => (
              <li className="flow-step" key={step.title}>
                <span className="flow-node">
                  <SolutionIcon name={step.icon} />
                </span>
                <span className="flow-index">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 5 · METRICS ─────────────────────────────────────────────────── */}
      <section className="metrics" aria-label={t('solutions.metrics_label', 'By the numbers')}>
        <ul className="metrics-row">
          {COMPANY_METRICS.map((m) => {
            const formatted =
              m.display ??
              `${m.prefix || ''}${m.count.toLocaleString(undefined, {
                minimumFractionDigits: m.decimals || 0,
                maximumFractionDigits: m.decimals || 0,
              })}${m.suffix || ''}`;

            return (
              <li className="metric" key={m.label}>
                <b
                  className="metric-value"
                  // A static value ("24/7") has no numeric part to tween, so it
                  // carries no data-count and the count-up loop skips it.
                  {...(m.count != null
                    ? {
                        'data-count': m.count,
                        'data-decimals': m.decimals || 0,
                        'data-prefix': m.prefix || '',
                        'data-suffix': m.suffix || '',
                        'data-formatted': formatted,
                      }
                    : {})}
                >
                  {formatted}
                </b>
                <span className="metric-label">{t(`solutions.metrics.${m.label}`, m.label)}</span>
                <span className="metric-desc">{m.desc}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── 6 · FEATURED INSTALLATIONS ──────────────────────────────────── */}
      <section className="installs" aria-label={t('solutions.installs_label', 'Featured installations')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('solutions.installs', 'Installations')}</span>
            <h2 className="display">
              {t('solutions.installs_title_main', 'Built in the')} <em>{t('solutions.installs_title_em', 'field')}</em>
            </h2>
          </div>
          <p className="lede side">
            {t('solutions.installs_side', 'Representative deployments for this vertical — the constraint, the architecture that answered it, and what went in the rack.')}
          </p>
        </div>

        {data.installations.map((project, i) => (
          <article className={`install${i % 2 ? ' install--flip' : ''}`} key={project.name}>
            <figure className="install-media reveal-img">
              <img src={project.src} alt={project.alt} loading="lazy" />
            </figure>

            <div className="install-copy">
              <span className="install-industry">{project.industry}</span>
              <h3 className="display">{project.name}</h3>

              <div className="install-block">
                <span className="install-key">{t('solutions.challenge', 'Challenge')}</span>
                <p>{project.challenge}</p>
              </div>
              <div className="install-block">
                <span className="install-key">{t('solutions.approach', 'Solution')}</span>
                <p>{project.solution}</p>
              </div>

              <div className="install-block">
                <span className="install-key">{t('solutions.products_used', 'Products used')}</span>
                <ul className="install-products">
                  {project.products.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* ── 7 · INDUSTRIES ──────────────────────────────────────────────── */}
      <section className="industries" aria-label={t('solutions.industries_label', 'Industries served')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('solutions.industries', 'Industries')}</span>
            <h2 className="display">
              {t('solutions.industries_title_main', 'Where this')} <em>{t('solutions.industries_title_em', 'goes in')}</em>
            </h2>
          </div>
          <p className="lede side">
            {t('solutions.industries_side', 'The sectors this vertical is specified for most often across the region.')}
          </p>
        </div>

        <ul className="industry-grid reveal-stagger">
          {data.industries.map((ind) => (
            <li className="industry-card" key={ind.name}>
              <span className="industry-icon">
                <SolutionIcon name={ind.icon} />
              </span>
              <span className="industry-name">{ind.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 8 · PROCESS ─────────────────────────────────────────────────── */}
      <section className="process" aria-label={t('solutions.process_label', 'How we work')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('solutions.process', 'Process')}</span>
            <h2 className="display">
              {t('solutions.process_title_main', 'How a project')} <em>{t('solutions.process_title_em', 'gets built')}</em>
            </h2>
          </div>
          <p className="lede side">
            {t('solutions.process_side', 'The same five stages on a single meeting room and on a command centre — the depth changes, the sequence does not.')}
          </p>
        </div>

        <div className="process-steps">
          <span className="process-line" aria-hidden="true"><i /></span>
          <ol>
            {PROCESS_STEPS.map((step, i) => (
              <li className="process-step" key={step.title}>
                <span className="process-marker">
                  <SolutionIcon name={step.icon} />
                </span>
                <div className="process-body">
                  <span className="process-index">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{t(`solutions.process_steps.${i}.title`, step.title)}</h3>
                  <p>{t(`solutions.process_steps.${i}.desc`, step.desc)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 9 · BRANDS ──────────────────────────────────────────────────────
          The whole section is conditional, heading included. Logos come from
          the region rules only — getPublicRegionSolutionBrands resolves which
          brands this region may show for this vertical — so when a region has
          none, a "Brands we distribute" heading over an apology is worse than
          silence: it advertises a gap the visitor had no reason to know about.
          Two fallbacks were tried here and dropped for the same reason (static
          wordmarks, then an empty-state line). */}
      {hasCmsBrands && (
        <section className="dbrands" aria-label={t('solutions.brands_label', 'Brands for this vertical')}>
          <div className="section-head">
            <div>
              <span className="label label--red">{t('solutions.brands', 'Brands')}</span>
              <h2 className="display">
                {t('solutions.brands_we_distribute', 'Brands we distribute')} <em>{t('solutions.for_this_vertical', 'for this vertical')}</em>
              </h2>
            </div>
          </div>

          <div className="dbrands-row">
            {translatedBrands.map((brand) => (
              <a
                key={brand.name}
                href={brand.website_url || '/partners'}
                target={brand.website_url ? '_blank' : '_self'}
                rel="noopener noreferrer"
              >
                <span className="bl-logo">
                  <img src={brand.logo} alt={`${brand.name} logo`} loading="lazy" />
                </span>
                <span className="bl-name">{brand.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── 10 · CLOSING CTA ────────────────────────────────────────────────
          Deliberately ahead of "Related solutions". The ask should land while
          the visitor is still reading about this vertical; putting the onward
          links first invites them to browse away before ever seeing it. */}
      <section className="dcta" ref={ctaRef} aria-label={data.cta.label}>
        <div className="dcta-inner reveal">
          {/* Red particle field. Mounted lazily — see `showBackdrop` above. */}
          <div className="dcta-particles" aria-hidden="true">
            {showBackdrop && (
              <Suspense fallback={null}>
                <ParticleWave />
              </Suspense>
            )}
          </div>
          <span className="dcta-glow" aria-hidden="true" />

          {/* The copy sits straight on the particle field — the frosted blue
              plate that used to hold it is gone. `.dcta-glow` behind it is now
              a plain radial darkening rather than decoration: text over a
              moving backdrop still needs a contrast floor, and a soft gradient
              supplies one without reintroducing a card. */}
          <div className="dcta-content">
            <span className="label label--red">{data.cta.label}</span>
            <h2 className="display" dangerouslySetInnerHTML={{ __html: data.cta.title }} />
            <p>{data.cta.desc}</p>
            <div className="dcta-actions">
              <Button solid to={data.cta.primary.to}>
                <span>{data.cta.primary.text}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to={data.cta.secondary.to}>
                <span>{data.cta.secondary.text}</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11 · RELATED SOLUTIONS ──────────────────────────────────────── */}
      <section className="related" aria-label={t('solutions.related_label', 'Related solutions')}>
        <div className="section-head">
          <div>
            <span className="label label--red">{t('solutions.explore', 'Explore')}</span>
            <h2 className="display">
              {t('solutions.related_title_main', 'Related')} <em>{t('solutions.related_title_em', 'solutions')}</em>
            </h2>
          </div>
          <Link className="related-all" to="/solutions">
            {t('solutions.all_solutions', 'All solutions')}
            {arrowIcon}
          </Link>
        </div>

        <div className="related-grid reveal-stagger">
          {related.map((item) => (
            <Link className="related-card" to={`/solutions/${item.slug}`} key={item.slug}>
              <span className="related-media">
                <img src={item.src} alt="" loading="lazy" />
              </span>
              <span className="related-body">
                <span className="related-kicker">{item.kicker}</span>
                <span className="related-name">{item.name}</span>
                <span className="related-arrow" aria-hidden="true">{arrowIcon}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
};

export default SolutionDetails;
