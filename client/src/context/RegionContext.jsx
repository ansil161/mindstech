import React, { createContext, useState, useContext, useCallback } from 'react';

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

  const setRegion = useCallback((r) => {
    setRegionState(r);
    localStorage.setItem('mindstec_region', r);
  }, []);

  const regionSlug = REGION_SLUG_MAP[region] || region.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-');

  return (
    <RegionContext.Provider value={{ region, setRegion, regionSlug }}>
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
