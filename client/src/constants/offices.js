/**
 * The office directory behind the "Global presence" section on the home page.
 *
 * One source of truth for both the map pins and the office cards beneath it,
 * so a pin can never exist without matching card copy (or the reverse).
 *
 * Deliberately conservative about contact details: `email` is only present
 * where that address already exists in this repo (the region seed migration in
 * adminpanel/migrations/0016 and the locale contact blocks). Street addresses
 * and phone numbers are NOT duplicated here — they belong to the CMS
 * (RegionContact), which the footer and /contact already render, and inventing
 * them here would put unverified detail on the front page.
 */

/** Global HQ — every trade lane on the map originates here. */
export const HQ_KEY = 'dubai';

export const OFFICES = [
  {
    key: 'dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    lat: 25.2048,
    lng: 55.2708,
    role: 'hq',
    region: 'Middle East',
    email: 'middleeast@mindstec.com',
  },
  {
    key: 'riyadh',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    lat: 24.7136,
    lng: 46.6753,
    role: 'regional',
    region: 'Middle East',
    email: 'middleeast@mindstec.com',
  },
  {
    key: 'doha',
    city: 'Doha',
    country: 'Qatar',
    lat: 25.2854,
    lng: 51.5310,
    role: 'regional',
    region: 'Middle East',
    email: 'middleeast@mindstec.com',
  },
  {
    key: 'bangalore',
    city: 'Bangalore',
    country: 'India',
    lat: 12.9716,
    lng: 77.5946,
    role: 'regional',
    region: 'India',
    email: 'india@mindstec.com',
  },
  {
    key: 'bangkok',
    city: 'Bangkok',
    country: 'Thailand',
    lat: 13.7563,
    lng: 100.5018,
    role: 'regional',
    region: 'South Asia',
    email: 'southasia@mindstec.com',
  },
  {
    key: 'johannesburg',
    city: 'Johannesburg',
    country: 'South Africa',
    lat: -26.2041,
    lng: 28.0473,
    role: 'regional',
    region: 'Africa',
    email: 'africa@mindstec.com',
  },
  {
    key: 'warsaw',
    city: 'Warsaw',
    country: 'Poland',
    lat: 52.2297,
    lng: 21.0122,
    role: 'regional',
    region: 'Europe',
    email: 'poland@mindstec.com',
  },
  {
    // `mapLng` only: the dotted base map draws eastern Brazil several degrees
    // west of where a true Mercator puts it, so the honest -46.63 lands the
    // pin in the Atlantic, visibly detached from the coast. The marker is
    // drawn at -52.53 — on the artwork's own São Paulo coastline — while
    // `lng` stays real for anything that needs the actual location.
    key: 'sao-paulo',
    city: 'São Paulo',
    country: 'Brazil',
    lat: -23.5505,
    lng: -46.6333,
    mapLng: -52.53,
    role: 'regional',
    region: 'South America',
  },
];

export const OFFICES_BY_KEY = Object.fromEntries(OFFICES.map((o) => [o.key, o]));

/** Offices a visitor can actually reach today — excludes `soon` markers. */
export const ACTIVE_OFFICES = OFFICES.filter((o) => o.role !== 'soon');

/**
 * Announced-but-not-open offices. Empty today; the map legend and the SVG's
 * description both read this rather than naming a city, so removing the last
 * `soon` marker cannot leave a key on the legend with nothing to point at.
 */
export const SOON_OFFICES = OFFICES.filter((o) => o.role === 'soon');

/**
 * Trade lanes drawn on the map. Every active office links back to the Dubai
 * HQ hub; `soon` markers get no lane, so a planned office reads as an
 * announcement rather than as an operating route.
 */
export const ROUTES = ACTIVE_OFFICES.filter((o) => o.key !== HQ_KEY).map((o) => [HQ_KEY, o.key]);

// ── Map projection ────────────────────────────────────────────────────────
//
// The dotted base map (public/assets/img/world-map.svg, viewBox 0 0 198 100)
// is a Mercator projection, and the previous pin maths assumed a plain
// equirectangular one over the full -90..90 / -180..180 range. That is why
// every marker sat too far north — Dubai landed ~34 overlay units above its
// actual position, out in the Caspian.
//
// These constants were fitted numerically against the dot grid itself: for a
// panel of ~60 inland cities across every continent, each projected point now
// lands within roughly half a dot of a land dot, and a control set of
// open-ocean points lands on none.
//
// The +4 in X_OFFSET is not part of the projection. `.map-wrap` is
// aspect-ratio 2/1 while the base SVG is 198:100 (1.98:1), so
// preserveAspectRatio="xMidYMid meet" letterboxes the dotted map by 1 base
// unit (4 overlay units) on each side. The overlay's own viewBox is 800x400
// (exactly 2:1) and is therefore NOT letterboxed — without this shift the two
// layers drift apart horizontally.
const X_SCALE = 2.277420;
const X_OFFSET = 404.317192;
const Y_SCALE = -139.758336;
const Y_OFFSET = 241.876280;

const mercatorY = (lat) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));

/** lat/lng → coordinates in the overlay SVG's 800×400 viewBox. */
export const project = (lat, lng) => ({
  x: X_SCALE * lng + X_OFFSET,
  y: Y_SCALE * mercatorY(Math.max(Math.min(lat, 84), -84)) + Y_OFFSET,
});

/**
 * Where an office's marker is drawn.
 *
 * Normally the office's real coordinates, but the dotted base map is a
 * stylised drawing, not a survey: a few coastlines (eastern South America
 * worst of all) sit a couple of degrees off a true Mercator, which strands an
 * otherwise-correct pin in open water. An office may therefore carry
 * `mapLat`/`mapLng` overrides used *for drawing only* — `lat`/`lng` stay
 * truthful for every other purpose.
 */
export const projectOffice = (office) =>
  project(office.mapLat ?? office.lat, office.mapLng ?? office.lng);
