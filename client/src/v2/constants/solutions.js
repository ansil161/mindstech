import { SOLUTION_ORDER, LEGACY_SOLUTION_SLUGS } from './solutionDetails.js';

/**
 * Card-level data for the seven verticals — the listing on `/solutions`, the
 * section on the homepage, and the Navbar/Footer menus.
 *
 * `SOLUTION_ORDER` in solutionDetails.js is the single source of truth for
 * which slugs exist and in what order; this file only adds the shorter,
 * card-sized copy that the detail page doesn't need.
 *
 * Everything here carries an English default that is passed through `t()`, so a
 * locale whose `solutions.*` block hasn't caught up renders readable English
 * rather than a raw key like "solutions.arr.6.name". That was the failure mode
 * of the previous index-based lookup (`solutions.arr.<n>.name` with no
 * fallback) — adding a seventh vertical would have printed the key itself in
 * all five languages until every file was updated.
 */
export const SOLUTION_SLUGS = SOLUTION_ORDER;

export { LEGACY_SOLUTION_SLUGS };

/**
 * @typedef {object} SolutionCard
 * @property {string} name    Card title.
 * @property {string} cat     Sector line above the title.
 * @property {string} desc    Two-line summary.
 * @property {string[]} tags  Capability chips (listing page only).
 * @property {string} image   4:3 card photograph.
 */

/** @type {Record<string, SolutionCard>} */
const CARDS = {
  'information-and-communication-technology': {
    name: 'Information & Communication Technology',
    cat: 'Enterprise · Campus · Public infrastructure',
    desc: 'Networking, structured cabling, unified communications and data management — the transport layer every other vertical on this page runs over.',
    tags: ['Structured cabling', 'AV-over-IP', 'Unified comms', 'Network management'],
    image: '/assets/img/unsplash-1558494949-ef010cbdcc31-w1400.jpg',
  },
  'hospitality-guest-experience': {
    name: 'Hospitality & Guest Experience',
    cat: 'Hotels · Resorts · Venues',
    desc: 'In-room entertainment, digital displays and smart control across the guest journey — technology that stays invisible until it matters.',
    tags: ['Guest-room IPTV', 'Ballroom AV', 'Background audio', 'Room control'],
    image: '/assets/img/pexels-29870245-w1400.jpg',
  },
  'immersive-experience': {
    name: 'Immersive Experience',
    cat: 'Museums · Retail · Public venues',
    desc: 'Interactive displays, projection and synchronised sound that turn ordinary spaces into environments an audience stays inside.',
    tags: ['Interactive walls', 'Projection mapping', 'Spatial audio', 'Show control'],
    image: '/assets/img/pexels-13230484-w1400.jpg',
  },
  'broadcast-production-streaming': {
    name: 'Broadcast, Production & Streaming',
    cat: 'Studios · Streaming · Media distribution',
    desc: 'Media distribution over IP, cameras, switching and live graphics — from a single-operator setup to a full facility.',
    tags: ['Media distribution', 'Studio cameras', 'Vision mixing', 'IP clocks'],
    image: '/assets/img/pexels-7865064-w1400.jpg',
  },
  'digital-signage-dooh': {
    name: 'Digital Signage & DOOH',
    cat: 'Retail · Transport · Public space',
    desc: 'Indoor and outdoor signage with the software behind it — scheduled, changed or stopped remotely, and interactive where the brief calls for it.',
    tags: ['Indoor & outdoor LED', 'Display panels', 'Wayfinding', 'CMS & scheduling'],
    image: '/assets/img/pexels-3402937-w1400.jpg',
  },
  'control-rooms-critical-environments': {
    name: 'Control Rooms & Critical Environments',
    cat: 'Command · Surveillance · NOC',
    desc: 'Complete NOC solutions — video wall displays, processors and controlling hardware for environments under continuous supervision.',
    tags: ['Video wall processors', '24/7 displays', 'KVM', 'Source management'],
    image: '/assets/img/pexels-11783119-w1400.jpg',
  },
  'conferencing-collaboration': {
    name: 'Conferencing & Collaboration',
    cat: 'Workplace · Education · Hybrid',
    desc: 'Displays, conference systems, table management and BYOD tied together with room management, so a booked room actually works.',
    tags: ['Interactive displays', 'PTZ cameras', 'Ceiling audio', 'Room booking'],
    image: '/assets/img/pexels-13323673-w1400.jpg',
  },
};

/** Resolves the CMS's or a bookmark's older slug to the current one. */
export function resolveSolutionSlug(slug) {
  return LEGACY_SOLUTION_SLUGS[slug] || slug;
}

/**
 * Display name for a slug — the one string the Navbar, the Footer and the
 * detail page all need, so none of them reaches into the i18n keys directly.
 */
export function getSolutionName(t, slug) {
  const key = resolveSolutionSlug(slug);
  return t(`solutions.details.${key}.name`, CARDS[key] ? CARDS[key].name : key);
}

/** The seven verticals as `{ slug, name }`, for menus. */
export function getSolutionLinks(t) {
  return SOLUTION_SLUGS.map((slug) => ({ slug, name: getSolutionName(t, slug) }));
}

/**
 * Category label and tag list for a slug, resolved through i18n with the
 * English copy above as the default.
 *
 * Returns null for a slug the site doesn't know, which is how an unexpected CMS
 * entry ends up rendering without a chip rather than with an empty one.
 */
export function getSolutionMeta(t, slug) {
  const card = CARDS[resolveSolutionSlug(slug)];
  if (!card) return null;

  const key = resolveSolutionSlug(slug);
  return {
    cat: t(`solutions.details.${key}.cat`, card.cat),
    tags: card.tags.map((tag, i) => t(`solutions.details.${key}.tags.${i}`, tag)),
  };
}

/**
 * The seven verticals as static content, for when `/admin/solutions/` returns
 * nothing — the API is down, the CMS is empty, or a fresh deployment hasn't
 * been seeded yet.
 *
 * Without this the solutions grid renders zero cards on both the homepage and
 * /solutions, so the section headings ("What we distribute") sit above empty
 * space. These seven are not really CMS data: they are fixed routes with fixed
 * copy already in the repo, and the CMS only ever restates them.
 */
export function getFallbackSolutions(t) {
  return SOLUTION_SLUGS.map((slug) => ({
    slug,
    title: t(`solutions.details.${slug}.name`, CARDS[slug].name),
    desc: t(`solutions.details.${slug}.desc`, CARDS[slug].desc),
    image: CARDS[slug].image,
  }));
}
