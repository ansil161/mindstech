/**
 * Client registry for /clients.
 *
 * PLACEHOLDER DATA. The wireframe asks for 12–20 flagship clients chosen by
 * Mindstec marketing, each with the client's approval to publish. Until that
 * list exists every entry is a labelled slot: drop the approved logo into
 * `public/assets/clients/` and set `logo` to its path, and the tile switches
 * from the dashed placeholder to the logo automatically. `name` is used for
 * the alt text and the caption once a logo is present.
 *
 * `region` matches a REGIONS code, `sector` matches a SECTOR_CODES entry.
 * `flagship` entries also appear in the global "Selected clients" grid.
 */

export const SECTOR_CODES = [
  'all',
  'government',
  'enterprise',
  'hospitality',
  'education',
  'broadcast',
  'retail',
];

// Region codes mirror the wireframe's four regional sites.
export const REGIONS = [
  { code: 'me', labelKey: 'clients.regions.me', fallback: 'Middle East' },
  { code: 'in', labelKey: 'clients.regions.in', fallback: 'India' },
  { code: 'af', labelKey: 'clients.regions.af', fallback: 'Africa' },
  { code: 'eu', labelKey: 'clients.regions.eu', fallback: 'Europe' },
];

const slot = (id, region, sector, flagship = false) => ({
  id,
  name: null,
  logo: null,
  region,
  sector,
  flagship,
});

export const CLIENTS = [
  slot('c01', 'me', 'government', true),
  slot('c02', 'me', 'hospitality', true),
  slot('c03', 'me', 'enterprise', true),
  slot('c04', 'me', 'broadcast', true),
  slot('c05', 'me', 'retail'),
  slot('c06', 'me', 'education'),
  slot('c07', 'in', 'enterprise', true),
  slot('c08', 'in', 'education', true),
  slot('c09', 'in', 'government', true),
  slot('c10', 'in', 'retail', true),
  slot('c11', 'in', 'hospitality'),
  slot('c12', 'in', 'broadcast'),
  slot('c13', 'af', 'government', true),
  slot('c14', 'af', 'enterprise', true),
  slot('c15', 'af', 'hospitality', true),
  slot('c16', 'af', 'education'),
  slot('c17', 'eu', 'enterprise', true),
  slot('c18', 'eu', 'broadcast', true),
  slot('c19', 'eu', 'government', true),
  slot('c20', 'eu', 'retail', true),
];
