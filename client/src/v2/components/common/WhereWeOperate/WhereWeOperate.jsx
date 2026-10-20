import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button.jsx';
import { useRegion } from '../../../context/RegionContext.jsx';
import { getPublicRegionData } from '../../../api/regionApi.js';
import {
  ACTIVE_OFFICES,
  HQ_KEY,
  OFFICES,
  OFFICES_BY_KEY,
  ROUTES,
  SOON_OFFICES,
  projectOffice,
} from '../../../constants/offices.js';

gsap.registerPlugin(ScrollTrigger);

// ── Map label layout ──
// Several offices (Dubai/Doha/Riyadh) sit close together on the
// 800×400 map, so city-name labels are placed by searching a small ring of
// candidate slots around each marker — closest and most natural (directly
// above/below) first — skipping any slot that would overlap an
// already-placed label, and clamping to the viewBox so a label can never
// run off-canvas at any screen size.
const MAP_W = 800;
const MAP_H = 400;
const LABEL_H = 16;
const LABEL_GAP = 6;

const estimateLabelWidth = (text) => text.length * 5.6 + 16;

function layoutMapLabels(entries) {
  const rectsOverlap = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
  const toRect = (lx, ly, w) => ({ x1: lx - w / 2 - LABEL_GAP, x2: lx + w / 2 + LABEL_GAP, y1: ly - LABEL_H / 2, y2: ly + LABEL_H / 2 });
  const clampX = (lx, w) => Math.min(Math.max(lx, w / 2 + 4), MAP_W - w / 2 - 4);
  const clampY = (ly) => Math.min(Math.max(ly, LABEL_H), MAP_H - LABEL_H);

  // Resolve the HQ label first so it stays put, then top-to-bottom for
  // stable, repeatable placement of the rest.
  const ordered = [...entries].sort((a, b) => (a.isHQ === b.isHQ ? a.y - b.y : a.isHQ ? -1 : 1));

  const placedRects = [];
  return ordered.map((c) => {
    const w = estimateLabelWidth(c.text);
    const nearTop = c.y < 60; // avoid the label running off the map's top edge
    const near = LABEL_H + 8;
    const far = near * 2;
    const side = w / 2 + 10;

    const candidates = nearTop
      ? [
          { dx: 0, dy: near }, { dx: 0, dy: -near },
          { dx: 0, dy: far }, { dx: 0, dy: -far },
          { dx: side, dy: near }, { dx: -side, dy: near },
          { dx: side, dy: -near }, { dx: -side, dy: -near },
          { dx: 0, dy: far + near },
        ]
      : [
          { dx: 0, dy: -near }, { dx: 0, dy: near },
          { dx: 0, dy: -far }, { dx: 0, dy: far },
          { dx: side, dy: -near }, { dx: -side, dy: -near },
          { dx: side, dy: near }, { dx: -side, dy: near },
          { dx: 0, dy: -(far + near) },
        ];

    let chosen = candidates[0];
    let chosenIndex = 0;
    for (let i = 0; i < candidates.length; i++) {
      const lx = clampX(c.x + candidates[i].dx, w);
      const ly = clampY(c.y + candidates[i].dy);
      if (!placedRects.some((r) => rectsOverlap(r, toRect(lx, ly, w)))) {
        chosen = candidates[i];
        chosenIndex = i;
        break;
      }
    }

    const lx = clampX(c.x + chosen.dx, w);
    const ly = clampY(c.y + chosen.dy);
    placedRects.push(toRect(lx, ly, w));

    // A "leader" line is only drawn once a label has been pushed past the
    // two natural above/below slots, so the common case stays line-free.
    const displaced = chosenIndex >= 2;
    const edgeY = ly > c.y ? ly - LABEL_H / 2 : ly + LABEL_H / 2;
    const edgeX = Math.min(Math.max(c.x, lx - w / 2), lx + w / 2);

    return { ...c, w, lx, ly, displaced, edgeX, edgeY };
  });
}

/**
 * The "Where we operate" world map + office directory. Shared by Home and
 * Contact; it owns its own map loading, route animation, tooltips and the
 * region-contact fetch, so a page only has to render it.
 */
const WhereWeOperate = () => {
  const { t } = useTranslation();
  const { region, regionSlug } = useRegion();
  const mapBaseRef = useRef(null);
  const mapOverlayRef = useRef(null);
  const mapTooltipRef = useRef(null);
  const pathsRef = useRef([]);
  const dotsRef = useRef([]);

  const [regionContact, setRegionContact] = useState(null);
  // Which office card the pointer is over, so its marker can be highlighted.
  const [focusedOffice, setFocusedOffice] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchRegionContact = async () => {
      try {
        const res = await getPublicRegionData(regionSlug);
        if (!cancelled) {
          setRegionContact(Array.isArray(res.data.contact_info) ? res.data.contact_info[0] : (res.data.contact_info || null));
        }
      } catch {
        if (!cancelled) {
          setRegionContact(null);
        }
      }
    };
    fetchRegionContact();
    return () => { cancelled = true; };
  }, [regionSlug]);

  // Dotted world map base loader.
  //
  // This used to run on mount. Two costs landed during first paint even though
  // the map sits far below the fold: a runtime import of a ~900KB module over
  // the network, and DottedMap.getSVG() synthesising several thousand <circle>
  // nodes which are then parsed in one synchronous innerHTML write. Together
  // they blocked the main thread long enough to stall the whole page.
  //
  // The work is identical, just deferred until the region section is within a
  // screen and a half of the viewport, and started in idle time. By the time
  // the map is actually scrolled to, it is already painted — so nothing about
  // the result changes, only when the cost is paid.
  useEffect(() => {
    let active = true;
    const base = mapBaseRef.current;
    if (!base) return;

    const buildMap = async () => {
      try {
        const res = await fetch('/assets/img/world-map.svg');
        if (!res.ok) throw new Error('Failed to load map asset');
        const svg = await res.text();
        if (!active) return;
        base.innerHTML = svg;
        ScrollTrigger.refresh();
      } catch (e) {
        if (active) base.classList.add('map-base--fallback');
      }
    };

    const start = () => {
      if (!active) return;
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(buildMap, { timeout: 2000 });
      } else {
        setTimeout(buildMap, 0);
      }
    };

    // No IntersectionObserver (very old browsers): fall back to the previous
    // behaviour rather than never rendering the map.
    if (!('IntersectionObserver' in window)) {
      start();
      return () => { active = false; base.innerHTML = ''; };
    }

    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) {
        io.disconnect();
        start();
      }
    }, { rootMargin: '150% 0px' });
    io.observe(base);

    return () => {
      active = false;
      io.disconnect();
      base.innerHTML = '';
    };
  }, []);

  // Map route animation timeline
  useEffect(() => {
    const paths = pathsRef.current;
    const dots = dotsRef.current;
    if (!paths.length || !dots.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // Reset dash offsets
    paths.forEach((path) => {
      if (!path) return;
      const L = path.getTotalLength();
      path.style.strokeDasharray = L;
      path.style.strokeDashoffset = L;
    });

    const quad = (t, a, m, b) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * m + t * t * b;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, defaults: { ease: 'power2.inOut' } });

    ROUTES.forEach((route, i) => {
      const path = paths[i];
      const dot = dots[i];
      if (!path || !dot) return;

      const s = projectOffice(OFFICES_BY_KEY[route[0]]);
      const e = projectOffice(OFFICES_BY_KEY[route[1]]);
      const m = { x: (s.x + e.x) / 2, y: Math.min(s.y, e.y) - 50 };

      const t0 = i * 0.3;
      tl.to(path, { strokeDashoffset: 0, duration: 2 }, t0);

      const prox = { t: 0 };
      tl.to(prox, {
        t: 1,
        duration: 2,
        onUpdate() {
          const t = prox.t;
          dot.setAttribute('cx', quad(t, s.x, m.x, e.x));
          dot.setAttribute('cy', quad(t, s.y, m.y, e.y));
          dot.setAttribute('opacity', t < 0.1 ? t * 10 : t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 1);
        },
      }, t0);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        en.isIntersecting ? tl.play() : tl.pause();
      });
    });

    const overlay = mapOverlayRef.current;
    if (overlay) io.observe(overlay);

    return () => {
      tl.kill();
      if (overlay) io.unobserve(overlay);
    };
  }, []);

  // Map pin tooltip — a small popover anchored directly above/below the
  // marker (via getBoundingClientRect, so it tracks the map's actual
  // rendered scale) with an arrow pointing at it. Desktop/tablet show it on
  // hover; touch devices (no hover) show/hide it on tap instead, since
  // permanent labels are hidden on mobile.
  useEffect(() => {
    const overlay = mapOverlayRef.current;
    const tooltip = mapTooltipRef.current;
    if (!overlay || !tooltip) return;

    const cityEl = tooltip.querySelector('[data-role="city"]');
    const countryEl = tooltip.querySelector('[data-role="country"]');
    const typeEl = tooltip.querySelector('[data-role="type"]');
    const roleLabels = {
      hq: t('home.regions.office_hq', 'Global Headquarters'),
      regional: t('home.regions.office_regional', 'Regional Office'),
      soon: t('home.regions.office_soon', 'Coming soon'),
    };

    const showTooltip = (pin) => {
      const city = OFFICES_BY_KEY[pin.dataset.city];
      const core = pin.querySelector('.pin-core');
      const anchor = (core || pin).getBoundingClientRect();
      const cx = anchor.left + anchor.width / 2;
      const cy = anchor.top + anchor.height / 2;

      cityEl.textContent = city.city;
      countryEl.textContent = city.country;
      typeEl.textContent = roleLabels[city.role] || roleLabels.regional;

      tooltip.classList.toggle('mt-soon', city.role === 'soon');
      tooltip.classList.add('on');
      const margin = 12;
      const gap = 16;
      const tw = tooltip.offsetWidth;
      const th = tooltip.offsetHeight;
      const above = cy - gap - th > margin;
      tooltip.classList.toggle('tooltip-above', above);
      tooltip.classList.toggle('tooltip-below', !above);

      const left = Math.min(Math.max(cx, tw / 2 + margin), window.innerWidth - tw / 2 - margin);
      const top = above ? cy - gap - th : cy + gap;
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${Math.min(Math.max(top, margin), window.innerHeight - th - margin)}px`;
    };

    const hideTooltip = () => tooltip.classList.remove('on');

    const pins = Array.from(overlay.querySelectorAll('.map-pin'));
    const canHover = window.matchMedia('(hover: hover)').matches;
    const cleanups = [];

    if (canHover) {
      pins.forEach((pin) => {
        const onEnter = () => showTooltip(pin);
        pin.addEventListener('mouseenter', onEnter);
        pin.addEventListener('mouseleave', hideTooltip);
        cleanups.push(() => {
          pin.removeEventListener('mouseenter', onEnter);
          pin.removeEventListener('mouseleave', hideTooltip);
        });
      });
    } else {
      let openPin = null;
      const onDocClick = (e) => {
        if (openPin && !openPin.contains(e.target)) {
          hideTooltip();
          openPin = null;
        }
      };
      pins.forEach((pin) => {
        const onTap = (e) => {
          e.stopPropagation();
          if (openPin === pin) {
            hideTooltip();
            openPin = null;
          } else {
            showTooltip(pin);
            openPin = pin;
          }
        };
        pin.addEventListener('click', onTap);
        cleanups.push(() => pin.removeEventListener('click', onTap));
      });
      document.addEventListener('click', onDocClick);
      cleanups.push(() => document.removeEventListener('click', onDocClick));
    }

    return () => {
      hideTooltip();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [t]);

  // Hovering an office card highlights its marker. Done by toggling a class on
  // the existing <g class="map-pin"> rather than by re-rendering the SVG: the
  // pins carry running SMIL <animate> pulses, and re-rendering them would
  // restart every pulse from zero on each hover.
  useEffect(() => {
    const overlay = mapOverlayRef.current;
    if (!overlay) return undefined;
    const pins = Array.from(overlay.querySelectorAll('.map-pin'));
    pins.forEach((pin) => pin.classList.toggle('is-focus', pin.dataset.city === focusedOffice));
    return () => pins.forEach((pin) => pin.classList.remove('is-focus'));
  }, [focusedOffice]);

  // The map's accessible description, built from the office list so it can
  // never name a city the map no longer draws.
  const mapLabel = useMemo(() => {
    const served = ACTIVE_OFFICES.filter((o) => o.key !== HQ_KEY).map((o) => o.city).join(', ');
    const planned = SOON_OFFICES.map((o) => `${o.city}, ${o.country}`).join(', ');
    return `World map showing Mindstec supply routes from the ${OFFICES_BY_KEY[HQ_KEY].city} headquarters to ${served}${
      planned ? `, plus a planned office in ${planned}` : ''
    }`;
  }, []);

  // City-only labels ("Dubai (HQ)", "Riyadh", "<city> — Coming soon", ...) —
  // country and office type live in the hover tooltip instead, to keep the map
  // itself uncluttered.
  const labeledPins = useMemo(() => {
    const hqSuffix = t('home.regions.hq_suffix', '(HQ)');
    const soonSuffix = t('home.regions.soon_suffix', '— Coming soon');
    return layoutMapLabels(
      OFFICES.map((office) => {
        const p = projectOffice(office);
        const label = t(`home.cities.${office.key}`, office.city);
        const suffix = office.role === 'hq' ? ` ${hqSuffix}` : office.role === 'soon' ? ` ${soonSuffix}` : '';
        return {
          key: office.key,
          city: office,
          x: p.x,
          y: p.y,
          isHQ: office.role === 'hq',
          role: office.role,
          text: `${label}${suffix}`,
        };
      })
    );
  }, [t]);

  return (
    <section className="regions" id="regions">
      <div className="section-head">
        <div>
          <span className="label label--red">{t('home.regions.label')}</span>
          <h2 className="display" style={{ marginTop: '16px' }}>{t('home.regions.title_main')} <em>{t('home.regions.title_em')}</em></h2>
        </div>
        <p className="lede side">{t('home.regions.lede')}</p>
      </div>
      <div className="map-wrap reveal">
        <div className="map-base" id="mapBase" ref={mapBaseRef} aria-hidden="true"></div>
        <svg
          className="map-overlay"
          id="mapOverlay"
          ref={mapOverlayRef}
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={mapLabel}
        >
          <defs>
            <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#CC0001" stopOpacity="0" />
              <stop offset="8%" stopColor="#CC0001" stopOpacity="1" />
              <stop offset="92%" stopColor="#CC0001" stopOpacity="1" />
              <stop offset="100%" stopColor="#CC0001" stopOpacity="0" />
            </linearGradient>
            <filter id="mapGlow">
              <feMorphology operator="dilate" radius="0.5" />
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Arcs & Traveling Dots */}
          {ROUTES.map((route, i) => {
            const s = projectOffice(OFFICES_BY_KEY[route[0]]);
            const e = projectOffice(OFFICES_BY_KEY[route[1]]);
            const m = { x: (s.x + e.x) / 2, y: Math.min(s.y, e.y) - 50 };
            return (
              <g key={i}>
                <path
                  ref={(el) => (pathsRef.current[i] = el)}
                  d={`M ${s.x} ${s.y} Q ${m.x} ${m.y} ${e.x} ${e.y}`}
                  fill="none"
                  stroke="url(#mapGrad)"
                  strokeWidth="1"
                />
                <circle
                  ref={(el) => (dotsRef.current[i] = el)}
                  r="2.5"
                  fill="#CC0001"
                  opacity="0"
                />
              </g>
            );
          })}

          {/* Pins with pulsating rings & city labels. Dubai (HQ) gets a
              larger core and a stronger, faster pulse; a `soon` marker is
              drawn hollow in white so it reads as an announcement rather
              than as another live office. */}
          {labeledPins.map((pin, idx) => {
            const isSoon = pin.role === 'soon';
            const baseR = pin.isHQ ? 4.5 : 3;
            const pulseTo = pin.isHQ ? 18 : 12;
            const pulseOpacity = pin.isHQ ? 0.75 : 0.6;
            const pulseDur = pin.isHQ ? '1.6s' : '2s';
            const colour = isSoon ? '#FAFAFA' : '#CC0001';
            const roleLabel = isSoon
              ? t('home.regions.office_soon', 'Coming soon')
              : pin.isHQ
                ? t('home.regions.office_hq', 'Global Headquarters')
                : t('home.regions.office_regional', 'Regional Office');
            return (
              <g
                key={pin.key}
                className={`map-pin${pin.isHQ ? ' map-pin--hq' : ''}${isSoon ? ' map-pin--soon' : ''}`}
                data-city={pin.key}
              >
                <title>{`${pin.city.city}, ${pin.city.country} — ${roleLabel}`}</title>
                <circle className="pin-halo" cx={pin.x} cy={pin.y} r={baseR + 3} fill={colour} />
                <circle
                  className="pin-core"
                  cx={pin.x}
                  cy={pin.y}
                  r={baseR}
                  fill={isSoon ? 'none' : colour}
                  stroke={isSoon ? colour : 'none'}
                  strokeWidth={isSoon ? 1.4 : 0}
                  strokeDasharray={isSoon ? '2 1.6' : undefined}
                  filter={isSoon ? undefined : 'url(#mapGlow)'}
                />
                {!isSoon && (
                  <circle cx={pin.x} cy={pin.y} r={baseR} fill={colour} opacity="0.5">
                    <animate
                      attributeName="r"
                      from={baseR}
                      to={pulseTo}
                      dur={pulseDur}
                      begin={`${idx * 0.25}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from={pulseOpacity}
                      to="0"
                      dur={pulseDur}
                      begin={`${idx * 0.25}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {pin.displaced && (
                  <line className="map-leader" x1={pin.x} y1={pin.y} x2={pin.edgeX} y2={pin.edgeY} />
                )}
                <g className="map-label">
                  <rect x={pin.lx - pin.w / 2} y={pin.ly - LABEL_H / 2} width={pin.w} height={LABEL_H} rx="3" />
                  <text x={pin.lx} y={pin.ly - LABEL_H / 2 + LABEL_H * 0.68} textAnchor="middle">
                    {pin.text}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
        <div className="map-tooltip" ref={mapTooltipRef} aria-hidden="true">
          <div className="mt-city">
            <span className="mt-pin" aria-hidden="true">📍</span>
            <span data-role="city"></span>
          </div>
          <div className="mt-country" data-role="country"></div>
          <div className="mt-type" data-role="type"></div>
        </div>
      </div>
      {/* Legend — the map now carries three marker treatments, so say what
          they mean instead of leaving it to the hover tooltip. */}
      <ul className="map-legend reveal" aria-label={t('home.regions.legend_label', 'Map key')}>
        <li><i className="lg-dot lg-dot--hq" aria-hidden="true" />{t('home.regions.office_hq', 'Global Headquarters')}</li>
        <li><i className="lg-dot" aria-hidden="true" />{t('home.regions.office_regional', 'Regional Office')}</li>
        {SOON_OFFICES.length > 0 && (
          <li><i className="lg-dot lg-dot--soon" aria-hidden="true" />{t('home.regions.office_soon', 'Coming soon')}</li>
        )}
      </ul>

      {/* Office directory. Hovering a card lights up its marker (and vice
          versa) via a shared data-city attribute, so the two halves of the
          section read as one object rather than a map and a list. */}
      <div className="offices reveal">
        {ACTIVE_OFFICES.map((office) => {
          // Only the office matching the visitor's selected region can show
          // a phone/address: those come from the CMS RegionContact row for
          // that region, and there is no per-city record to read for others.
          const showRegionContact = office.region === region && regionContact;
          return (
            <article
              key={office.key}
              className={`office ${office.role === 'hq' ? 'office--hq' : ''}`}
              data-office={office.key}
              onMouseEnter={() => setFocusedOffice(office.key)}
              onMouseLeave={() => setFocusedOffice(null)}
            >
              <header className="office-head">
                <h3>{t(`home.cities.${office.key}`, office.city)}</h3>
                <span className={`office-tag ${office.role === 'hq' ? 'office-tag--hq' : ''}`}>
                  {office.role === 'hq'
                    ? t('home.regions.office_hq', 'Global Headquarters')
                    : t('home.regions.office_regional', 'Regional Office')}
                </span>
              </header>
              <p className="office-country">{t(`home.countries.${office.key}`, office.country)}</p>
              <p className="office-coverage">
                {t(`home.offices.${office.key}`, `Serving ${office.country} and neighbouring markets.`)}
              </p>
              <div className="office-links">
                {showRegionContact && (regionContact.phone_display || regionContact.phone) && (
                  <a href={`tel:${(regionContact.phone_display || regionContact.phone).replace(/[^+\d]/g, '')}`}>
                    {regionContact.phone_display || regionContact.phone}
                  </a>
                )}
                {office.email && <a href={`mailto:${office.email}`}>{office.email}</a>}
              </div>
              {showRegionContact && regionContact.address && (
                <address className="office-address">{regionContact.address}</address>
              )}
            </article>
          );
        })}
      </div>

      <div className="offices-foot reveal">
        <p>{t('home.regions.foot', 'Stock, currency, warranty and people — all handled in-region.')}</p>
        <Button to="/contact" className="text-link">
          <span>{t('home.regions.foot_btn', 'Find your local desk')}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Button>
      </div>
    </section>
  );
};

export default WhereWeOperate;
