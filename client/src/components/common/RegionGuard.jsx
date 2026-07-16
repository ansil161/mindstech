import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useRegion } from '../../context/RegionContext';

/**
 * RegionGuard — route-level visibility gate.
 *
 * Usage in routes:
 *   <Route element={<RegionGuard pageKey="ewaste" />}>
 *     <Route path="/ewaste" element={<EWaste />} />
 *   </Route>
 *
 * Behaviour:
 *   - While region data is loading  → render nothing (avoids flash redirect).
 *   - Page key is enabled           → render the child route normally.
 *   - Page key is NOT enabled       → redirect to /not-found (shows 404 page).
 */
const RegionGuard = ({ pageKey }) => {
  const { regionLoading, isPageEnabled } = useRegion();

  // Still waiting for the API response — don't render or redirect yet.
  if (regionLoading) return null;

  // isPageEnabled returns null while loading (handled above), true, or false.
  return isPageEnabled(pageKey) ? <Outlet /> : <Navigate to="/not-found" replace />;
};

export default RegionGuard;
