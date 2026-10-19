import { BRANDS } from './products.js';

/**
 * Which brands each solution vertical shows in each region, taken from the
 * distribution brand sheet. This is the source of truth for the regions it
 * covers (India, Middle East, Africa, Europe): switching region changes the
 * "Brands we distribute" row on every solution page to exactly that region's
 * list. Regions the sheet doesn't cover fall back to the CMS brands.
 *
 * Each row is [brand, regions] where regions is a string of region letters:
 * I = India, M = Middle East, A = Africa, E = Europe.
 */
const REGION_LETTER = { india: 'I', 'middle-east': 'M', africa: 'A', europe: 'E' };

// The CMS slug can drift from the canonical one (a sub-region such as
// "middle-east-uae", or a differently spelled name), so match on the slug or
// the display name containing the region word.
function regionLetter(slugOrName) {
  const v = String(slugOrName || '').toLowerCase().replace(/[\s_/]+/g, '-');
  if (REGION_LETTER[v]) return REGION_LETTER[v];
  if (v.includes('middle-east')) return 'M';
  if (v.includes('india')) return 'I';
  if (v.includes('africa')) return 'A';
  if (v.includes('europe')) return 'E';
  return null;
}

const SHEET = {
  'control-rooms-critical-environments': [
    ['Datapath', 'IMAE'], ['Christie', 'I'], ['Delta', 'M'], ['Horion', 'A'],
    ['Polywall', 'IMA'], ['NETGEAR AV', 'I'], ['Cambium', 'M'], ['MTC', 'IMAE'],
    ['Kordz', 'IMAE'], ['B-Tech', 'IMAE'], ['Blustream', 'IMA'], ['RTI', 'MA'],
    ['Sapling', 'IMA'], ['Wavex', 'I'], ['AtlasIED', 'M'], ['Aurora', 'E'],
  ],
  'conferencing-collaboration': [
    ['T1V', 'IMAE'], ['MTC', 'IMAE'], ['Avocor', 'I'], ['Sonance', 'I'], ['Kordz', 'IMAE'],
    ['B-Tech', 'IMAE'], ['GoGet', 'IM'], ['iPort', 'IM'], ['Magnum', 'I'],
    ['Blustream', 'IMA'], ['RTI', 'MA'], ['SCT', 'IM'], ['Wavex', 'I'], ['Aurora', 'E'],
  ],
  'immersive-experience': [
    ['Datapath', 'IMAE'], ['T1V', 'IMAE'], ['MTC', 'IMAE'], ['Christie', 'I'], ['Sonance', 'I'],
    ['Kordz', 'IMAE'], ['B-Tech', 'IMAE'], ['Blustream', 'IMA'], ['RTI', 'MA'],
    ['Wavex', 'I'], ['Vizrt', 'I'],
  ],
  'broadcast-production-streaming': [
    ['Vizrt', 'I'], ['Telycam', 'I'], ['PTZ Optics', 'A'], ['Kordz', 'IMAE'],
    ['B-Tech', 'IMAE'], ['Blustream', 'IMA'], ['SalrayWorks', 'I'],
  ],
  'digital-signage-dooh': [
    ['Kordz', 'IMAE'], ['B-Tech', 'IMAE'], ['Blustream', 'IMA'], ['Amino', 'I'],
    ['Wavex', 'I'], ['Smartsign', 'A'], ['Bluefin', 'IM'],
  ],
  'hospitality-guest-experience': [
    ['Lemco', 'IME'], ['Sonance', 'I'], ['RDL', 'IM'], ['Kordz', 'IMAE'],
    ['B-Tech', 'IMAE'], ['Blustream', 'IMA'], ['RTI', 'MA'], ['MTC', 'I'],
    ['Humelab', 'IMA'],
  ],
  'information-and-communication-technology': [
    ['Cambium', 'M'], ['Kordz', 'IMAE'],
  ],
  'professional-audio-systems': [
    ['Sonance', 'I'], ['AtlasIED', 'M'], ['SCT', 'IM'],
  ],
  // Not a column in the brand sheet: the cabling, mounting, distribution and
  // transport lines that sit under every other vertical.
  'av-infrastructure': [
    ['Kordz', 'IMAE'], ['B-Tech', 'IMAE'], ['Blustream', 'IMA'], ['MTC', 'IMAE'],
  ],
};

/** Filter options for the brands page, in display order. */
export const BRAND_FILTER_SOLUTIONS = [
  { key: 'control-rooms-critical-environments', label: 'Control Rooms' },
  { key: 'conferencing-collaboration', label: 'Conferencing' },
  { key: 'immersive-experience', label: 'Immersive' },
  { key: 'broadcast-production-streaming', label: 'Broadcast' },
  { key: 'digital-signage-dooh', label: 'Signage & DOOH' },
  { key: 'professional-audio-systems', label: 'Pro Audio' },
  { key: 'hospitality-guest-experience', label: 'Hospitality' },
  { key: 'av-infrastructure', label: 'AV Infrastructure' },
  { key: 'information-and-communication-technology', label: 'ICT' },
];

export const BRAND_FILTER_REGIONS = [
  { key: 'middle-east', label: 'Middle East' },
  { key: 'india', label: 'India' },
  { key: 'africa', label: 'Africa' },
  { key: 'europe', label: 'Europe' },
];

/**
 * Whether a brand (by name) is offered under a solution and/or in a region.
 * `null` for either filter means "any".
 */
export function brandMatches(name, solutionKey, regionSlug) {
  const letter = regionSlug ? regionLetter(regionSlug) : null;
  const keys = solutionKey ? [solutionKey] : Object.keys(SHEET);
  return keys.some((k) =>
    (SHEET[k] || []).some(
      ([n, regions]) => n.toLowerCase() === name.toLowerCase() && (!letter || regions.includes(letter))
    )
  );
}

const URLS = {
  Datapath: 'https://www.datapath.co.uk',
  Christie: 'https://www.christiedigital.com',
  Delta: 'https://www.deltadisplays.com',
  Horion: 'https://www.horion.com',
  Polywall: 'https://polywall.net',
  'NETGEAR AV': 'https://www.netgear.com/av/',
  Cambium: 'https://www.cambiumnetworks.com',
  MTC: 'https://mtc-technologies.com',
  Kordz: 'https://www.kordz.com',
  'B-Tech': 'https://www.btechavmounts.com',
  Blustream: 'https://www.blustream.com.au',
  RTI: 'https://www.rticontrol.com',
  Sapling: 'https://www.sapling-inc.com',
  Wavex: 'https://www.wavextouch.com',
  AtlasIED: 'https://www.atlasied.com',
  Aurora: 'https://www.auroramultimedia.com',
  T1V: 'https://www.t1v.com',
  Avocor: 'https://www.avocor.com',
  Sonance: 'https://www.sonance.com',
  GoGet: 'https://www.gogetcorp.com',
  iPort: 'https://www.iportproducts.com',
  SCT: 'https://www.soundcontrol.net',
  Vizrt: 'https://www.vizrt.com',
  Telycam: 'https://www.telycam.com',
  'PTZ Optics': 'https://www.ptzoptics.com',
  SalrayWorks: 'https://www.salrayworks.com',
  Amino: 'https://www.amino.tv',
  Smartsign: 'https://www.smartsign.se',
  Bluefin: 'https://www.thebluefin.com',
  Lemco: 'https://www.lemco.gr',
  RDL: 'https://www.rdlnet.com',
  Humelab: 'https://www.humelab-hospitality.com',
};

const logoFor = (name) => BRANDS.find((b) => b.name.toLowerCase() === name.toLowerCase())?.img || '';

/**
 * Brands for a vertical in a region, as `{ name, logo, website_url }`, or null
 * when the sheet doesn't cover that region (caller falls back to the CMS).
 */
export function getRegionSolutionBrands(regionSlug, solutionSlug, regionName) {
  const letter = regionLetter(regionSlug) || regionLetter(regionName);
  const isGlobal = !letter && /global/i.test(`${regionSlug} ${regionName}`);
  // Global is the whole portfolio; any other uncovered region defers to the CMS.
  if (!letter && !isGlobal) return null;
  const rows = SHEET[solutionSlug] || [];
  return rows
    .filter(([, regions]) => isGlobal || regions.includes(letter))
    .map(([name]) => ({ name, logo: logoFor(name), website_url: URLS[name] || '' }));
}

/**
 * Lower-cased names of every brand offered in a region (any vertical), or null
 * when the sheet doesn't cover that region.
 */
export function getRegionBrandNames(regionSlug, regionName) {
  const letter = regionLetter(regionSlug) || regionLetter(regionName);
  if (!letter) return null;
  const names = new Set();
  Object.values(SHEET).forEach((rows) => {
    rows.forEach(([name, regions]) => {
      if (regions.includes(letter)) names.add(name.toLowerCase());
    });
  });
  return names;
}
