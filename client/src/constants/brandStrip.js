/**
 * Manufacturers in the scrolling logo strip under the home page hero.
 *
 * Logos live in public/assets/img/brands/strip/<slug>.png: white, cropped
 * tight to the artwork and 96px tall, made for the strip's dark background.
 * `ratio` is that file's width / height.
 *
 * To add a brand: drop its white, cropped PNG in that folder and add a row
 * here with its ratio. Sizing is automatic (see stripLogoSize).
 */
export const BRAND_STRIP = [
  { name: 'Amino', slug: 'amino', ratio: 3.562 },
  { name: 'Blustream', slug: 'blustream', ratio: 9.26 },
  { name: 'B-Tech', slug: 'b-tech', ratio: 2.417 },
  { name: 'Christie', slug: 'christie', ratio: 6.938 },
  { name: 'Datapath', slug: 'datapath', ratio: 4.719 },
  { name: 'GoGet', slug: 'goget', ratio: 4.167 },
  { name: 'Humelab', slug: 'humelab', ratio: 3.031 },
  { name: 'iPort', slug: 'iport', ratio: 4.031 },
  { name: 'Kordz', slug: 'kordz', ratio: 2.479 },
  { name: 'Lemco', slug: 'lemco', ratio: 7.5 },
  { name: 'Magnum', slug: 'magnum', ratio: 3.833 },
  { name: 'MTC', slug: 'mtc', ratio: 6.76 },
  { name: 'NETGEAR AV', slug: 'netgear', ratio: 7.24 },
  { name: 'Polywall', slug: 'polywall', ratio: 5.51 },
  { name: 'RDL', slug: 'rdl', ratio: 3.167 },
  { name: 'RTI', slug: 'rti', ratio: 3.167 },
  { name: 'SalrayWorks', slug: 'salrayworks', ratio: 1.469 },
  { name: 'Sapling', slug: 'sapling', ratio: 3.333 },
  { name: 'SCT', slug: 'sct', ratio: 4.417 },
  { name: 'Sonance', slug: 'sonance', ratio: 8.104 },
  { name: 'T1V', slug: 't1v', ratio: 1.938 },
  { name: 'Telycam', slug: 'telycam', ratio: 1.625 },
  { name: 'Vizrt', slug: 'vizrt', ratio: 1.635 },
  { name: 'Wavex', slug: 'wavex', ratio: 4.031 },
];

// Every logo gets roughly the same visual area rather than the same height,
// so long wordmarks and compact marks read at equal weight, and sits centred
// in a slot of the same width so the spacing between logos is even.
const AREA = 2600;
const MIN_H = 18;
const MAX_H = 40;
export const STRIP_SLOT_W = 150;

export const stripLogoSize = (ratio) => {
  let height = Math.min(MAX_H, Math.max(MIN_H, Math.sqrt(AREA / ratio)));
  let width = ratio * height;
  if (width > STRIP_SLOT_W) {
    width = STRIP_SLOT_W;
    height = width / ratio;
  }
  return { width: Math.round(width), height: Math.round(height) };
};

export const stripLogoSrc = (slug) => `/assets/img/brands/strip/${slug}.png`;
