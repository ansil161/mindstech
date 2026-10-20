import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRegion } from '../../context/RegionContext.jsx';
import './GeoSuggestion.css';

const CHOICE_KEY = 'mtc-region-choice';

// Wireframe `guessRegion`: browser timezone -> region name.
const guessRegionName = () => {
  let tz = '';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    tz = '';
  }
  if (/^Asia\/(Dubai|Qatar|Riyadh|Muscat|Bahrain|Kuwait)$/.test(tz)) return 'Middle East';
  if (/^Asia\/(Kolkata|Calcutta)$/.test(tz)) return 'India';
  if (tz === 'Africa/Cairo') return 'Middle East';
  if (/^Africa\//.test(tz)) return 'Africa';
  if (tz === 'Europe/Warsaw') return 'Europe';
  return null;
};

const readChoice = () => {
  try {
    return Boolean(localStorage.getItem(CHOICE_KEY));
  } catch {
    return false;
  }
};

const flatten = (regions) =>
  (regions || []).flatMap((r) => [r.name, ...(r.sub_regions || []).map((s) => s.name)]);

/**
 * Decides whether to suggest the visitor's local regional site. Only suggests a
 * region the backend actually knows about, so "Go to" never lands on a dead one.
 * Layout uses `target` to show this banner instead of the announcement bar.
 */
export const useGeoSuggestion = () => {
  const { region, setRegion, allRegions } = useRegion();
  const [decided, setDecided] = useState(readChoice);
  const guess = useMemo(guessRegionName, []);

  const target = useMemo(() => {
    if (decided || !guess) return null;
    const match = flatten(allRegions).find((n) => n.toLowerCase() === guess.toLowerCase());
    if (!match || match === region) return null;
    return match;
  }, [decided, guess, allRegions, region]);

  const remember = useCallback(() => {
    try {
      localStorage.setItem(CHOICE_KEY, '1');
    } catch {
      /* private mode: banner may return next visit */
    }
    setDecided(true);
  }, []);

  const accept = useCallback(() => {
    if (target) setRegion(target);
    remember();
  }, [target, setRegion, remember]);

  return { target, current: region, accept, stay: remember };
};

const GeoSuggestion = ({ geo }) => {
  const { t } = useTranslation();
  const barRef = useRef(null);
  const { target, current, accept, stay } = geo;
  const visible = Boolean(target);

  // Same contract as AnnouncementBar: publish remaining height for the fixed navbar.
  useEffect(() => {
    if (!visible) return undefined;
    const root = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const h = barRef.current ? barRef.current.offsetHeight : 0;
      root.style.setProperty('--bar-offset', `${Math.max(0, h - window.scrollY)}px`);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
      root.style.setProperty('--bar-offset', '0px');
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="geo-bar" ref={barRef} role="region" aria-label={t('geo.label', 'Regional site suggestion')}>
      <div className="geo-bar__inner">
        <p className="geo-bar__text">
          {t(
            'geo.message',
            "You're viewing Mindstec {{current}}. There is a Mindstec {{target}} site for your location.",
            { current, target },
          )}
        </p>
        <div className="geo-bar__actions">
          <button type="button" className="geo-bar__btn geo-bar__btn--go" onClick={accept}>
            {t('geo.go', 'Go to {{target}}', { target })}
          </button>
          <button type="button" className="geo-bar__btn" onClick={stay}>
            {t('geo.stay', 'Stay here')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeoSuggestion;
