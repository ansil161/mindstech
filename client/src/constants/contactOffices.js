/**
 * Offices shown on /contact: the pin map, the office cards and the
 * country → team routing in the enquiry form all read this one list.
 *
 * `visit` is the region site the "Visit Mindstec …" button switches to.
 * `match` finds the office's CMS record (RegionContact) among the contacts the
 * page has loaded, so real address/phone/email replace the placeholder box.
 * `email` is only set where that address already exists elsewhere in the repo
 * (constants/offices.js, region seed) — nothing is invented here.
 */

export const HQ = 'dubai';

export const CONTACT_OFFICES = [
  { key: 'dubai', city: 'Dubai', country: 'United Arab Emirates', tz: 'Asia/Dubai', lat: 25.2048, lng: 55.2708, role: 'Global headquarters and Middle East hub', team: 'Middle East', visit: 'Middle East', label: 'tr', match: /dubai|uae|emirates/i, email: 'middleeast@mindstec.com' },
  { key: 'doha', city: 'Doha', country: 'Qatar', tz: 'Asia/Qatar', lat: 25.2854, lng: 51.531, role: 'Middle East office', team: 'Middle East', visit: 'Middle East', label: 't', match: /doha|qatar/i, email: 'middleeast@mindstec.com' },
  { key: 'riyadh', city: 'Riyadh', country: 'Saudi Arabia', tz: 'Asia/Riyadh', lat: 24.7136, lng: 46.6753, role: 'Middle East office', team: 'Middle East', visit: 'Middle East', label: 'b', match: /riyadh/i, email: 'middleeast@mindstec.com' },
  { key: 'jeddah', city: 'Jeddah', country: 'Saudi Arabia', tz: 'Asia/Riyadh', lat: 21.5433, lng: 39.1728, role: 'Middle East office', team: 'Middle East', visit: 'Middle East', label: 'l', match: /jeddah/i, email: 'middleeast@mindstec.com' },
  { key: 'bengaluru', city: 'Bengaluru', country: 'India', tz: 'Asia/Kolkata', lat: 12.9716, lng: 77.5946, role: 'India hub', team: 'India', visit: 'India', label: 'r', match: /bengaluru|bangalore/i, email: 'india@mindstec.com' },
  { key: 'bangkok', city: 'Bangkok', country: 'Thailand', tz: 'Asia/Bangkok', lat: 13.7563, lng: 100.5018, role: 'Southeast Asia hub', team: 'Southeast Asia', visit: 'Global', label: 'r', match: /bangkok|thailand/i, email: 'southasia@mindstec.com' },
  { key: 'cairo', city: 'Cairo', country: 'Egypt', tz: 'Africa/Cairo', lat: 30.0444, lng: 31.2357, role: 'Middle East office', team: 'Middle East', visit: 'Middle East', label: 'l', match: /cairo|egypt/i, email: 'middleeast@mindstec.com' },
  { key: 'johannesburg', city: 'Johannesburg', country: 'South Africa', tz: 'Africa/Johannesburg', lat: -26.2041, lng: 28.0473, role: 'Africa hub', team: 'Africa', visit: 'Africa', label: 'r', match: /johannesburg|south africa/i, email: 'africa@mindstec.com' },
  { key: 'warsaw', city: 'Warsaw', country: 'Poland', tz: 'Europe/Warsaw', lat: 52.2297, lng: 21.0122, role: 'Europe hub', team: 'Europe', visit: 'Europe', label: 'r', match: /warsaw|poland/i, email: 'poland@mindstec.com' },
  { key: 'sao-paulo', city: 'São Paulo', country: 'Brazil', tz: 'America/Sao_Paulo', lat: -23.5505, lng: -46.6333, role: 'Latin America office', team: 'Latin America', visit: 'Global', label: 'r', match: /s[aã]o paulo|brazil|brasil/i },
];

export const OFFICE_COUNT = CONTACT_OFFICES.length;
export const COUNTRY_COUNT = new Set(CONTACT_OFFICES.map((o) => o.country)).size;

/** Countries offered in the form: one per office country, then a catch-all. */
export const COUNTRIES = [...new Set(CONTACT_OFFICES.map((o) => o.country))];
export const OTHER_COUNTRY = 'Other';

/** The office whose team receives an enquiry from `country`. */
export const routeFor = (country) => {
  const office = CONTACT_OFFICES.find((o) => o.country === country);
  return office
    ? { office, label: `${office.team} team · ${office.city}` }
    : { office: CONTACT_OFFICES[0], label: `Global team · ${CONTACT_OFFICES[0].city}` };
};

export const TOPICS = [
  'Product or brand enquiry',
  'Solutions & projects',
  'Become a partner',
  'Become a reseller',
  'Visit the Experience Centre',
  'General enquiries',
];

// Map frame: longitude -60°..120°, latitude 60°N..35°S, matching a 1160×560 box.
export const MAP = { w: 1160, h: 560, lngMin: -60, lngMax: 120, latMax: 60, latMin: -35 };

export const mapPoint = (lat, lng) => ({
  x: ((lng - MAP.lngMin) / (MAP.lngMax - MAP.lngMin)) * MAP.w,
  y: ((MAP.latMax - lat) / (MAP.latMax - MAP.latMin)) * MAP.h,
});
