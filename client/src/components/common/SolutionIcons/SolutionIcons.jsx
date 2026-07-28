/**
 * Line-icon registry for the solution detail page.
 *
 * One flat map of 24×24 stroke paths rather than a dependency: the page needs
 * ~24 marks across the industries grid, the signal-flow diagram and the process
 * timeline, and pulling in an icon package for that would ship a few hundred
 * unused glyphs. Every path is drawn on the same 24-unit grid with the same
 * 1.5 stroke, so they sit together without one looking heavier than its
 * neighbours — which is the usual giveaway of mixed icon sets.
 *
 * Deliberately not emoji: emoji render in the platform's own colour and style,
 * which breaks the monochrome-plus-red palette everywhere else on the page.
 */

const PATHS = {
  // — Industries —
  command: 'M3 5h18v11H3zM8 20h8M12 16v4M7 9l2.5 2.5L7 14M13 14h4',
  // An eye, not a CCTV body: the camera outline is a rotated parallelogram
  // with a mount arm, and at 22px it collapsed into an unreadable wedge.
  surveillance: 'M12 5.5c5 0 9 4.2 9 6.5s-4 6.5-9 6.5S3 14.3 3 12s4-6.5 9-6.5zM12 9.4a2.6 2.6 0 110 5.2 2.6 2.6 0 010-5.2z',
  utilities: 'M13 2L4.5 13.5H11L9.5 22 19 10h-6.5z',
  airport: 'M10.5 2.5a1.5 1.5 0 013 0V9l8 4.5v2.5l-8-2.5v4l2.5 2v2L12 20.5 8 21.5v-2l2.5-2v-4L2.5 16v-2.5L10.5 9z',
  defense: 'M12 2.5l8 3v6c0 5-3.4 8.9-8 10-4.6-1.1-8-5-8-10v-6zM9 12l2 2 4-4',
  broadcast: 'M12 10.5a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zM7.8 8.1a6 6 0 000 8.3M16.2 8.1a6 6 0 010 8.3M4.8 5a10 10 0 000 14.5M19.2 5a10 10 0 010 14.5',
  transport: 'M6 3.5h12a2 2 0 012 2V15a2 2 0 01-2 2H6a2 2 0 01-2-2V5.5a2 2 0 012-2zM4 10h16M8 17l-2 3.5M16 17l2 3.5M8 13.5h.01M16 13.5h.01',
  energy: 'M12 21.5c3.6 0 6.5-2.7 6.5-6 0-4.5-6.5-13-6.5-13S5.5 11 5.5 15.5c0 3.3 2.9 6 6.5 6zM12 17.5a2.5 2.5 0 01-2.5-2.5',
  government: 'M12 2.5l9 4.5v2H3V7zM5.5 9v8M10 9v8M14 9v8M18.5 9v8M3 20.5h18M3 17h18',
  retail: 'M4 8h16l-1.2 12.5H5.2zM8.5 8V5.5a3.5 3.5 0 017 0V8',
  hospitality: 'M3 18.5v-9M3 12.5h13a4 4 0 014 4v2M3 18.5h18M6.5 8.5a2 2 0 110 4 2 2 0 010-4z',
  education: 'M12 3.5L22 8l-10 4.5L2 8zM6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5M22 8v5.5',
  healthcare: 'M2.5 12.5h4l2-5 3 10 2.5-7 1.5 2h6',
  venue: 'M9 18V5.5l11-2v12.5M9 9.5l11-2M6.5 15a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM17.5 13a2.5 2.5 0 110 5 2.5 2.5 0 010-5z',
  stadium: 'M7 21v-6.5h10V21M8.5 14.5V9a3.5 3.5 0 017 0v5.5M12 2.5v2M4.5 21h15M5 9.5l1.5.8M19 9.5l-1.5.8',
  workplace: 'M3.5 20.5V6l8-3.5V20.5M11.5 20.5V9l9 2.5v9M2 20.5h20M6.5 8.5v.01M6.5 12.5v.01M6.5 16.5v.01M15.5 14.5v.01M15.5 17.5v.01',

  // — Signal flow —
  source: 'M3.5 5.5h9a2 2 0 012 2v9a2 2 0 01-2 2h-9a2 2 0 01-2-2v-9a2 2 0 012-2zM16.5 12h6M19.5 9l3 3-3 3',
  processing: 'M8 8h8v8H8zM12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M8.5 2.5V5M15.5 2.5V5M8.5 19v2.5M15.5 19v2.5M2.5 8.5H5M2.5 15.5H5M19 8.5h2.5M19 15.5h2.5',
  routing: 'M5 3.5a2 2 0 110 4 2 2 0 010-4zM19 16.5a2 2 0 110 4 2 2 0 010-4zM5 16.5a2 2 0 110 4 2 2 0 010-4zM5 7.5v9M7 5.5h7a3 3 0 013 3v10',
  display: 'M3 4.5h18v12H3zM8.5 20.5h7M12 16.5v4M7 12.5l2.5-3 2 2.5 2.5-3.5 3 4',
  operator: 'M12 3.5a3.5 3.5 0 110 7 3.5 3.5 0 010-7zM5 20.5a7 7 0 0114 0M3 12a9 9 0 0118 0v3',
  analytics: 'M3.5 20.5h17M6.5 17V11M11 17V6.5M15.5 17v-4M20 17V8.5',
  network: 'M12 2.5a9.5 9.5 0 110 19 9.5 9.5 0 010-19zM2.5 12h19M12 2.5c2.5 2.6 3.8 6 3.8 9.5S14.5 18.9 12 21.5c-2.5-2.6-3.8-6-3.8-9.5S9.5 5.1 12 2.5z',
  storage: 'M4 4.5h16v5H4zM4 14.5h16v5H4zM7.5 7h.01M7.5 17h.01M12 7h4M12 17h4',

  // — Process —
  discover: 'M10.5 3a7.5 7.5 0 110 15 7.5 7.5 0 010-15zM16 16l5 5M8 10.5h5M10.5 8v5',
  design: 'M17 2.5l4.5 4.5L8 20.5l-5.5 1 1-5.5zM14 5.5l4.5 4.5',
  specify: 'M6 2.5h9l4 4v15H6zM15 2.5v4h4M9.5 12h7M9.5 16h5',
  deploy: 'M12 2.5l8.5 4.5v9L12 20.5 3.5 16V7zM3.5 7l8.5 4.5L20.5 7M12 11.5v9',
  support: 'M4 13.5v-1a8 8 0 0116 0v1M4 13.5h1.5a1.5 1.5 0 011.5 1.5v2.5a1.5 1.5 0 01-1.5 1.5H4zM20 13.5h-1.5a1.5 1.5 0 00-1.5 1.5v2.5a1.5 1.5 0 001.5 1.5H20M20 19v.5a2.5 2.5 0 01-2.5 2.5H13',
};

/**
 * @param {{name: keyof typeof PATHS, className?: string}} props
 */
export default function SolutionIcon({ name, className = '' }) {
  const d = PATHS[name];
  if (!d) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      // Every call site pairs the icon with a visible text label, so announcing
      // it again would just double up in a screen reader.
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
