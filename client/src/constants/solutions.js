/**
 * Canonical solution verticals, in the order they appear across the site.
 *
 * The slugs are the source of truth for `/solutions/:slug` routes and were
 * previously duplicated inline in Navbar.jsx and Footer.jsx. Copy lives in
 * i18n under `solutions.arr.<index>` (name / cat / desc / tag1..4).
 */
export const SOLUTION_SLUGS = [
  'digital-signage',
  'control-rooms',
  'conferencing',
  'hospitality',
  'broadcast',
  'live-events',
];
