import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BRANDS as WF_BRANDS } from '../../../constants/wireframeData.js';
import { BRANDS as CATALOGUE } from '../../../constants/products.js';
import { BRAND_FILTER_SOLUTIONS, BRAND_FILTER_REGIONS } from '../../../constants/regionBrands.js';
import './BrandsListExtras.css';

const SOL_KEY = {
  cr: 'control-rooms-critical-environments', cc: 'conferencing-collaboration', ie: 'immersive-experience',
  bp: 'broadcast-production-streaming', ds: 'digital-signage-dooh', pa: 'professional-audio-systems',
  hg: 'hospitality-guest-experience', ai: 'av-infrastructure', ict: 'information-and-communication-technology',
};
const REG_KEY = { me: 'middle-east', in: 'india', af: 'africa', eu: 'europe' };
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const solLabel = (k) => BRAND_FILTER_SOLUTIONS.find((s) => s.key === SOL_KEY[k])?.label || k;
const regLabel = (k) => BRAND_FILTER_REGIONS.find((r) => r.key === REG_KEY[k])?.label || k;

const known = CATALOGUE.map((b) => norm(b.name));
// Wireframe brands with no catalogue page (NETGEAR AV counts as Netgear).
const EXTRAS = WF_BRANDS
  .filter((b) => !known.some((k) => k === norm(b.n) || k.startsWith(norm(b.n))))
  .sort((a, b) => a.n.localeCompare(b.n));

/**
 * Count line, lightweight tiles for wireframe brands that have no catalogue
 * page yet, and the clear-filters empty state. `regionKey` may be null.
 */
const BrandsListExtras = ({ baseCount, solKey, regionKey, query, onClear }) => {
  const { t } = useTranslation();
  const list = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    const sol = solKey && solKey !== 'all' ? solKey : null;
    return EXTRAS.filter(
      (b) =>
        (!sol || b.s.some((s) => SOL_KEY[s] === sol)) &&
        (!regionKey || b.r.some((r) => REG_KEY[r] === regionKey)) &&
        (!q || b.n.toLowerCase().includes(q))
    );
  }, [solKey, regionKey, query]);

  const total = baseCount + list.length;
  return (
    <>
      <p className="bl-count">
        {total} {total === 1 ? t('brands.count_one', 'brand') : t('brands.count_other', 'brands')}
      </p>
      {list.length > 0 && (
        <>
          <p className="bl-sub">{t('brands.more_distributed', 'Also distributed')}</p>
          <div className="bl-grid">
            {list.map((b) => {
              const Tag = b.u ? 'a' : 'div';
              const props = b.u ? { href: b.u, target: '_blank', rel: 'noopener noreferrer' } : {};
              return (
                <Tag key={b.n} className="bl-tile" {...props}>
                  <span className="bl-name">
                    {b.n}
                    {b.u && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <path d="M7 17L17 7M9 7h8v8" />
                      </svg>
                    )}
                  </span>
                  <span className="bl-tags">
                    {b.s.map((s) => <span key={s} className="bl-tag">{solLabel(s)}</span>)}
                  </span>
                  <span className="bl-tags">
                    {b.r.map((r) => <span key={r} className="bl-tag bl-tag--reg">{regLabel(r)}</span>)}
                  </span>
                </Tag>
              );
            })}
          </div>
        </>
      )}
      {total === 0 && (
        <p className="bl-empty ev-empty">
          {t('brands.no_results_clear', 'No brands match these filters.')}
          <button type="button" onClick={onClear}>{t('brands.clear_filters', 'Clear filters')}</button>
        </p>
      )}
    </>
  );
};

export default BrandsListExtras;
