import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { getPublicRegionData } from '../api/regionApi';

const RegionContext = createContext();

// Maps display name → API slug
const REGION_SLUG_MAP = {
  'India': 'india',
  'Middle East': 'middle-east',
  'Africa': 'africa',
  'South Asia': 'south-asia',
  'Hong Kong / China': 'hong-kong-china',
};

export const RegionProvider = ({ children }) => {
  const [region, setRegionState] = useState(() => {
    return localStorage.getItem('mindstec_region') || 'India';
  });

  // null  = not yet fetched (loading)
  // []    = fetched, no optional pages for this region
  // [...] = fetched, these page keys are enabled
  const [enabledPages, setEnabledPages] = useState(null);
  const [regionLoading, setRegionLoading] = useState(true);

  const regionSlug =
    REGION_SLUG_MAP[region] ||
    region.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-');

  const setRegion = useCallback((r) => {
    setRegionState(r);
    localStorage.setItem('mindstec_region', r);
  }, []);

  // Fetch region data (including enabled_pages) whenever the slug changes
  useEffect(() => {
    let cancelled = false;
    setRegionLoading(true);

    getPublicRegionData(regionSlug)
      .then((res) => {
        if (!cancelled) {
          setEnabledPages(res.data.enabled_pages ?? []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[RegionContext] Failed to load region data for slug:', regionSlug, err);
          // On error fall back to empty — guard will redirect gated pages
          setEnabledPages([]);
        }
      })
      .finally(() => {
        if (!cancelled) setRegionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [regionSlug]);

  /**
   * Returns true if the given page key is enabled for the current region.
   * While loading, returns null so callers can distinguish "unknown" from false.
   */
  const isPageEnabled = useCallback(
    (pageKey) => {
      if (enabledPages === null) return null; // still loading
      return enabledPages.includes(pageKey);
    },
    [enabledPages],
  );

  return (
    <RegionContext.Provider
      value={{ region, setRegion, regionSlug, enabledPages, regionLoading, isPageEnabled }}
    >
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};

export default RegionContext;
