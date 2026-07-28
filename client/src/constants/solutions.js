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
 * Card imagery per vertical — the same photograph SolutionDetails uses for that
 * page's hero, at the smaller width the 4:3 card actually needs.
 */
const SOLUTION_IMAGES = {
  'digital-signage': '/assets/img/pexels-3402937-w1400.jpg',
  'control-rooms': '/assets/img/pexels-11783119-w1400.jpg',
  'conferencing': '/assets/img/pexels-13323673-w1400.jpg',
  'hospitality': '/assets/img/pexels-29870245-w1400.jpg',
  'broadcast': '/assets/img/pexels-7865064-w1400.jpg',
  'live-events': '/assets/img/pexels-13230484-w1400.jpg',
};

/**
 * Category label and tag list for a slug, resolved from i18n.
 *
 * The verticals are a fixed set the whole site is built around — Navbar,
 * Footer, the /solutions/:slug routes and SolutionDetails all hard-code them —
 * so this copy exists in all five locales whether or not the CMS is reachable.
 *
 * Returns null for a slug the site doesn't know, which is how an unexpected
 * CMS entry ends up rendering without a chip rather than with an empty one.
 */
export function getSolutionMeta(t, slug) {
  const i = SOLUTION_SLUGS.indexOf(slug);
  if (i === -1) return null;

  return {
    cat: t(`solutions.arr.${i}.cat`, ''),
    tags: [1, 2, 3, 4].map((n) => t(`solutions.arr.${i}.tag${n}`, '')).filter(Boolean),
  };
}

/**
 * The six verticals as static content, for when `/admin/solutions/` returns
 * nothing — the API is down, the CMS is empty, or a fresh deployment hasn't
 * been seeded yet.
 *
 * Without this the solutions grid renders zero cards on both the homepage and
 * /solutions, so the section headings ("What we distribute") sit above empty
 * space. These six are not really CMS data: they are fixed routes with fixed
 * copy already translated in i18n, and the CMS only ever restates them.
 */
export function getFallbackSolutions(t) {
  return SOLUTION_SLUGS.map((slug, i) => ({
    slug,
    title: t(`solutions.arr.${i}.name`),
    desc: t(`solutions.arr.${i}.desc`),
    image: SOLUTION_IMAGES[slug],
  }));
}
