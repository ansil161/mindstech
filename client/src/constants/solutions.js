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

/**
 * Build the six solution rows from i18n copy.
 *
 * Used as a fallback when GET /admin/solutions/ returns nothing, so the
 * "six verticals" section still renders 01–06 instead of collapsing to empty.
 * Shape matches the API response fields consumed by Home.jsx (title/desc/slug);
 * `image` is intentionally absent — callers must guard the hover thumbnail.
 *
 * @param {(key: string, fallback?: string) => string} t i18next translate fn
 */
export const buildSolutionsFallback = (t) =>
  SOLUTION_SLUGS.map((slug, i) => ({
    slug,
    title: t(`solutions.arr.${i}.name`),
    desc: t(`solutions.arr.${i}.desc`),
  }));
