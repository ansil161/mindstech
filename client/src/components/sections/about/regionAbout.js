/**
 * The four regional sites from the design wireframe, with the offices each one
 * covers. The key is the /about/:region URL segment.
 */
export const REGION_ABOUT = {
  'middle-east': {
    name: 'Middle East',
    offices: [
      { city: 'Dubai', country: 'United Arab Emirates' },
      { city: 'Doha', country: 'Qatar' },
      { city: 'Riyadh', country: 'Saudi Arabia' },
      { city: 'Jeddah', country: 'Saudi Arabia' },
      { city: 'Cairo', country: 'Egypt' },
    ],
    lang: 'Arabic version planned',
  },
  india: {
    name: 'India',
    offices: [{ city: 'Bengaluru', country: 'India' }],
  },
  africa: {
    name: 'Africa',
    offices: [{ city: 'Johannesburg', country: 'South Africa' }],
  },
  europe: {
    name: 'Europe',
    offices: [{ city: 'Warsaw', country: 'Poland' }],
    lang: 'Polish version planned',
  },
};

/** "A, B and C" */
export const joinList = (items) =>
  items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

export const uniqueCountries = (offices) => [...new Set(offices.map((o) => o.country))];
