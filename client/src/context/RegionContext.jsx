import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { getPublicRegionData, getPublicRegions } from '../api/regionApi';

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
  const [region, setRegionState] = useState(() => {
    return localStorage.getItem('mindstec_region') || 'Global'; // default to Global if India not there, but let's keep previous logic if possible, wait, previously it was 'India'.
  });

  const [enabledPages, setEnabledPages] = useState(null);
  const [regionLoading, setRegionLoading] = useState(true);
  
  // NEW: Store all dynamic regions for Navbar
  const [allRegions, setAllRegions] = useState([]);

  // Fetch all regions on mount
  useEffect(() => {
    getPublicRegions().then(res => {
      setAllRegions(res.data);
      
      // If the currently stored region isn't in the list (e.g. they changed it in DB), 
      // we might want to default to the first one, but let's leave that to the UI.
    }).catch(err => console.error("Failed to fetch regions", err));
  }, []);

  const setRegion = useCallback((r) => {
    setRegionState(r);
    localStorage.setItem('mindstec_region', r);
  }, []);

  const regionSlug = region.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-');

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
      value={{ region, setRegion, regionSlug, enabledPages, regionLoading, isPageEnabled, allRegions }}
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
