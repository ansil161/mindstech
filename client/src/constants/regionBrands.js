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
};

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
export function getRegionSolutionBrands(regionSlug, solutionSlug) {
  const letter = REGION_LETTER[regionSlug];
  if (!letter) return null;
  const rows = SHEET[solutionSlug] || [];
  return rows
    .filter(([, regions]) => regions.includes(letter))
    .map(([name]) => ({ name, logo: logoFor(name), website_url: URLS[name] || '' }));
}

/**
 * Lower-cased names of every brand offered in a region (any vertical), or null
 * when the sheet doesn't cover that region.
 */
export function getRegionBrandNames(regionSlug) {
  const letter = REGION_LETTER[regionSlug];
  if (!letter) return null;
  const names = new Set();
  Object.values(SHEET).forEach((rows) => {
    rows.forEach(([name, regions]) => {
      if (regions.includes(letter)) names.add(name.toLowerCase());
    });
  });
  return names;
}
