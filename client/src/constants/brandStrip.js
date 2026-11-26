/**
 * Manufacturers in the scrolling strip under the home page hero.
 *
 * `logo` points at a white, tightly cropped version made for the strip's dark
 * background (public/assets/img/brands/strip/, 96px tall for sharp rendering
 * at ~28px). Brands without one fall back to their name as text, so a brand
 * can be listed before its logo arrives: add the file and set `logo`.
 */
const logo = (slug) => `/assets/img/brands/strip/${slug}.png`;

export const BRAND_STRIP = [
  { name: 'Amino', logo: logo('amino') },
  { name: 'AtlasIED' },
  { name: 'Aurora' },
  { name: 'Avocor' },
  { name: 'Blustream', logo: logo('blustream') },
  { name: 'Bluefin' },
  { name: 'B-Tech', logo: logo('b-tech') },
  { name: 'Cambium' },
  { name: 'Christie', logo: logo('christie') },
  { name: 'Datapath', logo: logo('datapath') },
  { name: 'Delta' },
  { name: 'GoGet', logo: logo('goget') },
  { name: 'Horion' },
  { name: 'Humelab', logo: logo('humelab') },
  { name: 'iPort', logo: logo('iport') },
  { name: 'Kordz', logo: logo('kordz') },
  { name: 'Lemco', logo: logo('lemco') },
  { name: 'Magnum', logo: logo('magnum') },
  { name: 'MTC', logo: logo('mtc') },
  { name: 'NETGEAR AV', logo: logo('netgear') },
  { name: 'Polywall', logo: logo('polywall') },
  { name: 'PTZ Optics' },
  { name: 'RDL', logo: logo('rdl') },
  { name: 'RTI', logo: logo('rti') },
  { name: 'SalrayWorks', logo: logo('salrayworks') },
  { name: 'Sapling', logo: logo('sapling') },
  { name: 'SCT', logo: logo('sct') },
  { name: 'Smartsign' },
  { name: 'Sonance', logo: logo('sonance') },
  { name: 'T1V', logo: logo('t1v') },
  { name: 'Telycam', logo: logo('telycam') },
  { name: 'Vitec' },
  { name: 'Vizrt', logo: logo('vizrt') },
  { name: 'Wavex', logo: logo('wavex') },
];
