import { getSolutionLinks } from '../../constants/solutions.js';

// Wireframe practices the current solutions constant doesn't carry yet.
const EXTRA_SOLUTIONS = [
  { slug: 'professional-audio-systems', name: 'Professional Audio Systems' },
  { slug: 'av-infrastructure', name: 'AV Infrastructure' },
];

/** Existing solution links plus any wireframe practice not already listed. */
export const getAllSolutionLinks = (t) => {
  const base = getSolutionLinks(t);
  const have = new Set(base.map((l) => l.slug));
  return [
    ...base,
    ...EXTRA_SOLUTIONS.filter((e) => !have.has(e.slug)).map((e) => ({
      slug: e.slug,
      name: t(`navbar.solution_extra.${e.slug}`, e.name),
    })),
  ];
};

// Regions for the footer "Regional sites" column (wireframe REG).
export const FOOTER_REGIONS = ['Middle East', 'India', 'Africa', 'Europe'];
