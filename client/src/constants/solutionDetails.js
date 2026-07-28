/**
 * Content model for `/solutions/:slug`.
 *
 * Moved out of SolutionDetails.jsx because the page now renders eleven sections
 * off this data instead of four, and a ~700-line literal at the top of a
 * component file makes the component itself unreadable. The component's job is
 * layout and motion; this file's job is words and pictures.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BEFORE THIS GOES LIVE — two blocks below are unverified marketing copy that
 * needs a human sign-off, and they are grouped here so they are easy to find:
 *
 *   1. COMPANY_METRICS — the counter band ("450+ projects delivered",
 *      "99.99% system reliability"). These are the figures from the design
 *      brief, not numbers anyone measured. Published on a distributor's site
 *      they read as contractual claims. Replace with real figures or drop the
 *      band; do not ship them because they happened to be in a mockup.
 *
 *   2. `installations` — deliberately NOT real projects. Each entry describes a
 *      facility *type* ("Regional transport interchange"), never a named client,
 *      because inventing a named deployment attributes work to a third party
 *      that never happened. Swap in real, cleared case studies when marketing
 *      has them; the shape is ready.
 *
 * Everything else — pixel pitches, duty cycles, signal-chain stages, industry
 * lists — is factual about the product categories Mindstec distributes.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Copy is defaulted here and overridable per-locale through i18n at
 * `solutions.details.<slug>.*` (see resolveSolution in SolutionDetails.jsx).
 * Image paths and alt text stay out of i18n: the asset is the same file in
 * every language, and the alt describes the same photograph.
 */

export const SOLUTION_ORDER = [
  'digital-signage',
  'control-rooms',
  'conferencing',
  'hospitality',
  'broadcast',
  'live-events',
];

/**
 * The five-stage engagement, identical for every vertical — it describes how
 * the company works, not what it sells.
 */
export const PROCESS_STEPS = [
  { icon: 'discover', title: 'Discover', desc: 'Site survey, sightlines, ambient light and the operational reality the system has to survive.' },
  { icon: 'design', title: 'Design', desc: 'Architecture, signal chain and redundancy modelled before a single part number is quoted.' },
  { icon: 'specify', title: 'Specify', desc: 'A bill of materials with mounts, spares and cable schedules — not just the headline hardware.' },
  { icon: 'deploy', title: 'Deploy', desc: 'Staged, configured and commissioned with the integrator, then signed off against the design.' },
  { icon: 'support', title: 'Support', desc: 'Stock-held spares, RMA handling and vendor escalation for the life of the installation.' },
];

/**
 * ⚠ UNVERIFIED — see the file header. These are the brief's example figures.
 * `value` is split into `count` + `prefix`/`suffix` so the counter can animate
 * the numeric part without mangling the "+", "%" or "24/7".
 */
export const COMPANY_METRICS = [
  { count: 450, suffix: '+', label: 'Projects delivered', desc: 'Across retail, transport, government and enterprise.' },
  { count: 99.99, suffix: '%', decimals: 2, label: 'System reliability', desc: 'Measured on mission-critical installations under contract.' },
  { count: 20, suffix: '+', label: 'Global brands', desc: 'Distributed under formal regional agreements.' },
  { count: null, display: '24/7', label: 'Monitoring support', desc: 'Escalation paths that stay open outside business hours.' },
];

/** Company-level proof points under the hero CTAs. */
const SHARED_TRUST = ['Enterprise integration', 'Distributed across the GCC', '24/7 support escalation'];

const SOLUTIONS = {
  'digital-signage': {
    name: 'Digital Signage',
    title: 'Digital <em>Signage</em>',
    kicker: 'Media surfaces at scale',
    intro:
      'LED walls, professional display panels and wayfinding that turn retail floors, terminals and public spaces into media surfaces — with the software to run them.',
    fact: 'Retail · Transport · Public space',
    capsSide:
      'From a single menu board to a stadium facade — hardware, software and mounting from one price list.',
    hero: {
      src: '/assets/img/pexels-3402937-w1920.jpg',
      alt: 'Tokyo street at night covered in glowing digital signs and screen facades',
    },
    trust: ['Fine-pitch LED specialists', ...SHARED_TRUST],
    heroStats: [
      { value: 'P0.9–P10', label: 'Pixel pitch range' },
      { value: 'IP65', label: 'Outdoor rated' },
      { value: '24/7', label: 'Duty cycle' },
    ],
    caps: [
      ['Indoor & outdoor LED', 'Fine-pitch indoor walls to high-brightness outdoor facades, with the receiving cards, spares and service to keep them lit.', '/assets/img/pexels-33966530-w1100.jpg', 'Extreme close-up of an LED panel with rows of glowing pixels fading into darkness'],
      ['Professional display panels', 'Commercial-grade panels rated for continuous operation — portrait, landscape, high-brightness and touch.', '/assets/img/unsplash-1605810230434-7631ac76ec81-w1400.jpg', 'A dark exhibition space with a suspended cluster of glowing display screens'],
      ['Wayfinding & kiosks', 'Interactive totems and self-service kiosks for malls, airports, hospitals and campuses.', '/assets/img/pexels-3402937-w1400.jpg', 'Tokyo street at night covered in glowing digital signs and screen facades'],
      ['CMS & scheduling', 'Content management, day-parting and remote monitoring for networks of one screen or one thousand.', '/assets/img/unsplash-1551288049-bebda4e38f71-w700.jpg', 'Analytics dashboards with charts on a dark screen'],
    ],
    showcase: {
      label: 'In the field',
      title: 'One network. <em>Thousands</em> of screens.',
      desc:
        'A signage estate is not a screen — it is a fleet. Day-parted content, per-site overrides and a health check on every player, so a dark panel in a terminal is a ticket before it is a complaint.',
      src: '/assets/img/unsplash-1605810230434-7631ac76ec81-w2000.jpg',
      alt: 'A dark exhibition space with a suspended cluster of glowing display screens',
      readouts: [
        { value: '1 → 10k', label: 'Screens per network' },
        { value: 'Day-part', label: 'Scheduling granularity' },
        { value: 'Proof', label: 'Of play reporting' },
      ],
    },
    flow: [
      { icon: 'source', title: 'Content', desc: 'Artwork, feeds and live data' },
      { icon: 'processing', title: 'CMS', desc: 'Scheduling and day-parting' },
      { icon: 'routing', title: 'Distribution', desc: 'Players and network transport' },
      { icon: 'display', title: 'Display', desc: 'LED, panels and kiosks' },
      { icon: 'network', title: 'Monitoring', desc: 'Health, uptime and alerts' },
      { icon: 'analytics', title: 'Reporting', desc: 'Proof of play and audience' },
    ],
    installations: [
      {
        name: 'Regional transport interchange',
        industry: 'Transportation',
        challenge:
          'Passenger information across three concourses on a mix of legacy panels, with no single view of what was actually on screen at any moment.',
        solution:
          'A unified CMS over high-brightness commercial panels and a fine-pitch LED feature wall, with player health surfaced on one dashboard.',
        products: ['Fine-pitch LED', 'High-brightness panels', 'CMS & scheduling', 'Mounting systems'],
        src: '/assets/img/unsplash-1477959858617-67f85cf4f1df-w1100.jpg',
        alt: 'A city skyline at dusk seen from above',
      },
      {
        name: 'Flagship retail environment',
        industry: 'Retail',
        challenge:
          'A storefront facade readable in direct sun, paired with interior screens that had to stay colour-matched to the brand palette.',
        solution:
          'Outdoor-rated LED at the facade, calibrated indoor panels through the store, and one scheduling layer driving both.',
        products: ['Outdoor LED', 'Professional panels', 'Wayfinding kiosks', 'Content management'],
        src: '/assets/img/pexels-3402937-w1400.jpg',
        alt: 'Tokyo street at night covered in glowing digital signs and screen facades',
      },
    ],
    industries: [
      { icon: 'retail', name: 'Retail & malls' },
      { icon: 'transport', name: 'Transportation' },
      { icon: 'airport', name: 'Airports' },
      { icon: 'hospitality', name: 'Hospitality' },
      { icon: 'education', name: 'Education' },
      { icon: 'healthcare', name: 'Healthcare' },
    ],
    cta: {
      label: 'Start a project',
      title: 'Planning a <em>signage network</em>?',
      desc: 'Send us the site count, the screen types and whether they are going indoors or into direct sun. You get back a hardware schedule, a CMS recommendation and pricing — not a brochure.',
      primary: { text: 'Scope my network', to: '/contact' },
      secondary: { text: 'See signage brands', to: '/partners' },
    },
    brands: ['Christie', 'Datapath', 'Polywall', 'B-Tech', 'MTC', 'Kordz'],
    next: 'control-rooms',
  },

  'control-rooms': {
    name: 'Control Rooms',
    title: 'Control <em>Rooms</em>',
    kicker: 'Mission-critical visualization',
    intro:
      '24/7-rated video walls, processors and operator workflows for command centres, surveillance suites and network operations — engineered for zero downtime.',
    fact: 'Command · Surveillance · NOC',
    capsSide:
      'Mission-critical means no single point of failure — we spec redundancy from source to screen.',
    hero: {
      src: '/assets/img/pexels-11783119-w1920.jpg',
      alt: 'An operator facing a dark wall of monitors with red timecode displays',
    },
    trust: ['Video wall specialists', ...SHARED_TRUST],
    heroStats: [
      { value: '24/7', label: 'Continuous duty' },
      { value: '4K60', label: 'Per-input capture' },
      { value: 'N+1', label: 'Redundant power' },
    ],
    caps: [
      ['Video wall processors', 'Hardware and software processing that puts any source on any display, at any size, without dropped frames.', '/assets/img/pexels-11783119-w1400.jpg', 'An operator facing a dark wall of monitors with red timecode displays'],
      ['24/7 mission-critical displays', 'Panels and LED rated for round-the-clock duty cycles, with redundant power and burn-in management.', '/assets/img/unsplash-1605810230434-7631ac76ec81-w1400.jpg', 'A dark room with a suspended cluster of continuously-lit display screens'],
      ['KVM & operator desks', 'Low-latency KVM so operators control every system from one seat, plus console furniture and ergonomics.', '/assets/img/unsplash-1504384308090-c894fdcc538d-w1100.jpg', 'A large open-plan floor with rows of operator desks'],
      ['Source & layout management', 'Preset layouts, alarm-triggered views and multi-operator workflows for the moments that matter.', '/assets/img/unsplash-1558494949-ef010cbdcc31-w1100.jpg', 'Server racks with dense structured cabling in a dark room'],
    ],
    showcase: {
      label: 'In the field',
      title: 'Mission-critical <em>visualization</em>',
      desc:
        'An operator watching a wall is watching thousands of data points at once — camera feeds, SCADA, network health, incident queues. The room\'s job is to make the one that matters impossible to miss, and to keep showing it when a source, a card or a panel fails.',
      src: '/assets/img/pexels-17323801-w1920.jpg',
      alt: 'A row of server racks bathed in deep blue light',
      readouts: [
        { value: 'Any → any', label: 'Source to window' },
        { value: 'Alarm', label: 'Triggered layouts' },
        { value: 'Hot-swap', label: 'Field-serviceable' },
      ],
    },
    flow: [
      { icon: 'source', title: 'Sources', desc: 'Cameras, SCADA and workstations' },
      { icon: 'processing', title: 'Processing', desc: 'Capture, scaling and compositing' },
      { icon: 'routing', title: 'Routing', desc: 'Any input to any window' },
      { icon: 'display', title: 'Video wall', desc: 'Continuously-rated canvas' },
      { icon: 'operator', title: 'Operator', desc: 'KVM and layout presets' },
      { icon: 'analytics', title: 'Analytics', desc: 'Logging and incident review' },
    ],
    installations: [
      {
        name: 'Utility network operations centre',
        industry: 'Utilities',
        challenge:
          'A grid-monitoring floor where the wall had to survive a source failure mid-incident without operators losing the layout they were working in.',
        solution:
          'Redundant processing with hot-swap input cards, 24/7-rated panels and alarm-triggered presets that recall a full incident view in one action.',
        products: ['Video wall processors', '24/7 panels', 'KVM', 'Operator consoles'],
        src: '/assets/img/unsplash-1558494949-ef010cbdcc31-w1400.jpg',
        alt: 'Server racks with dense structured cabling in a dark room',
      },
      {
        name: 'City-wide surveillance suite',
        industry: 'Public safety',
        challenge:
          'Hundreds of camera streams, a small operator team, and a requirement that any feed reach any seat without a video engineer in the loop.',
        solution:
          'A software wall over a shared source pool, with per-operator KVM and saved layouts mapped to incident types.',
        products: ['Software video wall', 'Low-latency KVM', 'Layout management', 'Console furniture'],
        src: '/assets/img/unsplash-1504384308090-c894fdcc538d-w1100.jpg',
        alt: 'A large open-plan floor with rows of operator desks',
      },
    ],
    industries: [
      { icon: 'command', name: 'Command centres' },
      { icon: 'surveillance', name: 'Surveillance' },
      { icon: 'utilities', name: 'Utilities' },
      { icon: 'energy', name: 'Oil & gas' },
      { icon: 'transport', name: 'Transportation' },
      { icon: 'government', name: 'Government' },
    ],
    cta: {
      label: 'Start a project',
      title: 'Specifying a <em>control room</em>?',
      desc: 'Send the sightlines, the source list and the duty cycle. We model the processing, the redundancy and the operator positions before anyone quotes a panel.',
      primary: { text: 'Request a design review', to: '/contact' },
      secondary: { text: 'See control room brands', to: '/partners' },
    },
    brands: ['Datapath', 'Polywall', 'Christie', 'NETGEAR AV', 'Blustream'],
    next: 'conferencing',
  },

  'conferencing': {
    name: 'Conferencing & Collaboration',
    title: 'Conferencing &amp; <em>Collaboration</em>',
    kicker: 'Rooms that just work',
    intro:
      'Hybrid meeting rooms that sound as good as they look — interactive displays, cameras, ceiling audio and the AV-over-IP backbone connecting them.',
    fact: 'Workplace · Education · Hybrid',
    capsSide:
      'Rooms people actually want to book — from huddle spaces to boardrooms and lecture theatres.',
    hero: {
      src: '/assets/img/pexels-13323673-w1920.jpg',
      alt: 'A dark-toned conference room with a wall-mounted display and leather chairs',
    },
    trust: ['Hybrid room specialists', ...SHARED_TRUST],
    heroStats: [
      { value: 'AV/IP', label: '1Gb transport' },
      { value: '4K60', label: 'End to end' },
      { value: 'Sub-frame', label: 'Switching latency' },
    ],
    caps: [
      ['Interactive displays', 'Touch collaboration displays for ideation, annotation and wireless presentation in any room size.', '/assets/img/unsplash-1497366811353-6870744d04b2-w1400.jpg', 'A modern glass and concrete meeting room with a wall-mounted display'],
      ['Cameras & tracking', 'PTZ, ePTZ and auto-framing cameras that keep every participant in the shot, in any layout.', '/assets/img/unsplash-1516035069371-29a1b244cc32-w700.jpg', 'Professional camera bodies and lenses laid out on a dark surface'],
      ['Ceiling & beamforming audio', 'Microphones and speakers that disappear into the ceiling and still pick up the quietest voice.', '/assets/img/pexels-13323673-w1400.jpg', 'A dark-toned conference room with a wall-mounted display and leather chairs'],
      ['Booking & room intelligence', 'Scheduling panels, occupancy analytics and wayfinding that make the whole floor work harder.', '/assets/img/unsplash-1517245386807-bb43f82c33c4-w1100.jpg', 'People in a meeting with a laptop on the table'],
    ],
    showcase: {
      label: 'In the field',
      title: 'Every seat is the <em>best</em> seat',
      desc:
        'Hybrid fails on the far end, not in the room. Auto-framing that follows the speaker, ceiling arrays that reject the air handling, and a signal path short enough that nobody talks over anybody — that is the whole brief.',
      src: '/assets/img/unsplash-1497366811353-6870744d04b2-w1400.jpg',
      alt: 'A modern glass and concrete meeting room with a wall-mounted display',
      readouts: [
        { value: 'Auto-frame', label: 'Speaker tracking' },
        { value: 'Beamforming', label: 'Ceiling pickup' },
        { value: 'One-touch', label: 'Meeting join' },
      ],
    },
    flow: [
      { icon: 'source', title: 'Room devices', desc: 'Cameras, mics and laptops' },
      { icon: 'processing', title: 'Encode', desc: 'AV-over-IP and DSP' },
      { icon: 'network', title: 'Transport', desc: 'Standard 1Gb network' },
      { icon: 'display', title: 'Display & audio', desc: 'Interactive panels and arrays' },
      { icon: 'operator', title: 'Participants', desc: 'In-room and far end' },
      { icon: 'analytics', title: 'Room analytics', desc: 'Occupancy and utilisation' },
    ],
    installations: [
      {
        name: 'Corporate headquarters floor',
        industry: 'Enterprise',
        challenge:
          'Forty rooms of five different sizes, each previously specified by a different contractor, with no consistent way to start a meeting.',
        solution:
          'A single room standard scaled across huddle, medium and boardroom tiers over shared AV-over-IP, with one join experience in every space.',
        products: ['Interactive displays', 'Auto-framing cameras', 'Ceiling audio', 'Scheduling panels'],
        src: '/assets/img/unsplash-1517245386807-bb43f82c33c4-w1100.jpg',
        alt: 'People in a meeting with a laptop on the table',
      },
      {
        name: 'University lecture theatre',
        industry: 'Education',
        challenge:
          'Lecture capture for a raked theatre where the presenter moves constantly and student questions come from anywhere in the room.',
        solution:
          'Tracking cameras with presenter and audience presets, distributed ceiling microphones, and capture feeding the existing VLE.',
        products: ['PTZ cameras', 'Beamforming microphones', 'Large-format displays', 'AV-over-IP'],
        src: '/assets/img/pexels-13323673-w1400.jpg',
        alt: 'A dark-toned conference room with a wall-mounted display and leather chairs',
      },
    ],
    industries: [
      { icon: 'workplace', name: 'Corporate' },
      { icon: 'education', name: 'Education' },
      { icon: 'government', name: 'Government' },
      { icon: 'healthcare', name: 'Healthcare' },
      { icon: 'defense', name: 'Defence' },
      { icon: 'energy', name: 'Energy' },
    ],
    cta: {
      label: 'Start a project',
      title: 'Standardising your <em>meeting rooms</em>?',
      desc: 'Tell us the room count and the tiers. We spec one repeatable standard across huddle, medium and boardroom, so the join experience is identical in every space on the floor.',
      primary: { text: 'Get a room standard', to: '/contact' },
      secondary: { text: 'See collaboration brands', to: '/partners' },
    },
    brands: ['Avocor', 'T1V', 'GoGet', 'iPort', 'SCT', 'Telycam'],
    next: 'hospitality',
  },

  'hospitality': {
    name: 'Hospitality AV',
    title: 'Hospitality <em>AV</em>',
    kicker: 'Invisible until it matters',
    intro:
      'Guest-room entertainment, ballroom systems and background audio for hotels, restaurants and venues — technology that stays invisible until it matters.',
    fact: 'Hotels · Restaurants · Venues',
    capsSide:
      'The best hospitality AV is the kind guests never notice — until the lights dim and the show starts.',
    hero: {
      src: '/assets/img/pexels-29870245-w1920.jpg',
      alt: 'A dark stone-walled luxury hotel lounge with glowing cube lamps',
    },
    trust: ['Property-wide AV specialists', ...SHARED_TRUST],
    heroStats: [
      { value: 'IPTV', label: 'Headend to room' },
      { value: 'Zoned', label: 'Background audio' },
      { value: 'Divisible', label: 'Ballroom systems' },
    ],
    caps: [
      ['Guest-room entertainment', 'IPTV headends, casting and in-room control that feel like home — branded for the property.', '/assets/img/pexels-29870245-w1400.jpg', 'A dark stone-walled luxury hotel lounge with glowing cube lamps'],
      ['Ballroom & event spaces', 'Divisible-room audio, projection and LED for conferences, weddings and everything between.', '/assets/img/pexels-13136106-w1400.jpg', 'A crowd silhouetted in a dark hall in front of a giant glowing projection'],
      ['Background music & paging', 'Zoned audio that follows the mood from breakfast to last orders, with paging built in.', '/assets/img/unsplash-1551882547-ff40c63fe5fa-w1100.jpg', 'A resort hotel courtyard with pools and palm trees at dusk'],
      ['Interactive hospitality tablets', 'Smart tables and in-room tablets for ordering, concierge and guest services.', '/assets/img/unsplash-1566073771259-6a8506099945-w1100.jpg', 'A resort pool deck with loungers at sunset'],
    ],
    showcase: {
      label: 'In the field',
      title: 'From check-in to <em>last orders</em>',
      desc:
        'One property is a dozen different rooms with a dozen different jobs — a lobby that sets a tone, a ballroom that reconfigures twice a day, a guest room that has to feel like home on the first try. The infrastructure underneath is one system.',
      src: '/assets/img/unsplash-1551882547-ff40c63fe5fa-w1400.jpg',
      alt: 'A resort hotel courtyard with pools and palm trees at dusk',
      readouts: [
        { value: 'Per-zone', label: 'Audio scheduling' },
        { value: 'Branded', label: 'Guest interface' },
        { value: 'Single pane', label: 'Property control' },
      ],
    },
    flow: [
      { icon: 'source', title: 'Headend', desc: 'Broadcast and property feeds' },
      { icon: 'processing', title: 'Middleware', desc: 'Branding and guest services' },
      { icon: 'routing', title: 'Distribution', desc: 'Structured cabling and IP' },
      { icon: 'display', title: 'Rooms & zones', desc: 'Screens, audio and tablets' },
      { icon: 'operator', title: 'Guest', desc: 'Ordering, concierge, control' },
      { icon: 'analytics', title: 'Property view', desc: 'Usage and system health' },
    ],
    installations: [
      {
        name: 'Resort property refurbishment',
        industry: 'Hospitality',
        challenge:
          'Guest-room entertainment on end-of-life hardware, and background audio zones that had drifted so far apart that walking the property was jarring.',
        solution:
          'An IPTV headend with branded guest UI to every room, re-zoned background audio with scheduled day-parts, and paging overlaid on the same system.',
        products: ['IPTV headend', 'In-room displays', 'Zoned audio', 'Paging'],
        src: '/assets/img/unsplash-1566073771259-6a8506099945-w1100.jpg',
        alt: 'A resort pool deck with loungers at sunset',
      },
      {
        name: 'Hotel ballroom and conference wing',
        industry: 'Events',
        challenge:
          'A divisible ballroom turned over between a morning conference and an evening banquet, with in-house staff running it rather than an AV crew.',
        solution:
          'Partition-aware audio that follows the room configuration automatically, plus projection and LED presets recalled from a single panel.',
        products: ['Divisible-room DSP', 'Projection', 'LED', 'Control panels'],
        src: '/assets/img/pexels-13136106-w1400.jpg',
        alt: 'A crowd silhouetted in a dark hall in front of a giant glowing projection',
      },
    ],
    industries: [
      { icon: 'hospitality', name: 'Hotels & resorts' },
      { icon: 'venue', name: 'Restaurants & bars' },
      { icon: 'retail', name: 'Retail & leisure' },
      { icon: 'stadium', name: 'Event venues' },
      { icon: 'healthcare', name: 'Senior living' },
      { icon: 'workplace', name: 'Serviced offices' },
    ],
    cta: {
      label: 'Start a project',
      title: 'Fitting out a <em>property</em>?',
      desc: 'Guest rooms, ballrooms, lobby and back of house. Send the floor plan and we will zone the audio, size the headend and brand the guest interface around it.',
      primary: { text: 'Plan the property', to: '/contact' },
      secondary: { text: 'See hospitality brands', to: '/partners' },
    },
    brands: ['Humelab', 'Amino', 'Sonance', 'Lemco', 'iPort'],
    next: 'broadcast',
  },

  'broadcast': {
    name: 'Broadcast & Production',
    title: 'Broadcast &amp; <em>Production</em>',
    kicker: 'Signal discipline, any scale',
    intro:
      'Cameras, switching, live graphics and streaming infrastructure for broadcasters, studios and creators — from single-operator setups to full facilities.',
    fact: 'Studios · Streaming · Creators',
    capsSide:
      'From a one-person streaming desk to a national newsroom — the same signal discipline applies.',
    hero: {
      src: '/assets/img/pexels-7865064-w1920.jpg',
      alt: 'Two professional pedestal cameras in a dark television studio facing a lit set',
    },
    trust: ['Live production specialists', ...SHARED_TRUST],
    heroStats: [
      { value: '12G', label: 'SDI infrastructure' },
      { value: 'ST 2110', label: 'IP production' },
      { value: 'HDR', label: 'Capable chain' },
    ],
    caps: [
      ['Studio & PTZ cameras', 'Broadcast-grade imaging from fixed studio chains to remotely operated PTZ fleets.', '/assets/img/pexels-7865064-w1400.jpg', 'Two professional pedestal cameras in a dark television studio facing a lit set'],
      ['Vision mixing & switching', 'Production switchers and routing for live programmes, sport and events.', '/assets/img/unsplash-1551288049-bebda4e38f71-w1100.jpg', 'A vision-mixing workstation showing live layouts on a dark screen'],
      ['Live graphics & virtual sets', "Real-time graphics, augmented reality and virtual studio tools used by the world's broadcasters.", '/assets/img/pexels-13141583-w1400.jpg', 'A darkened studio lounge lit in teal and orange with a reflective floor'],
      ['Streaming & delivery', 'Encoders, IPTV and OTT delivery that get the programme to every screen, reliably.', '/assets/img/unsplash-1558494949-ef010cbdcc31-w1400.jpg', 'Server racks with dense structured cabling carrying live video'],
    ],
    showcase: {
      label: 'In the field',
      title: 'Live has no <em>second take</em>',
      desc:
        'Every stage between the lens and the viewer is a place a live programme can fail. Reference, timing, redundancy on the encode, a return path an operator can actually read under pressure — the gear list is the easy part.',
      src: '/assets/img/unsplash-1516035069371-29a1b244cc32-w1400.jpg',
      alt: 'Professional camera bodies and lenses laid out on a dark surface',
      readouts: [
        { value: 'Genlocked', label: 'Reference chain' },
        { value: 'Redundant', label: 'Encode path' },
        { value: 'Real-time', label: 'Graphics and AR' },
      ],
    },
    flow: [
      { icon: 'source', title: 'Acquisition', desc: 'Studio and PTZ cameras' },
      { icon: 'processing', title: 'Vision mixing', desc: 'Switching and keying' },
      { icon: 'storage', title: 'Graphics', desc: 'Real-time and virtual sets' },
      { icon: 'routing', title: 'Encode', desc: 'Contribution and playout' },
      { icon: 'network', title: 'Delivery', desc: 'OTT, IPTV and broadcast' },
      { icon: 'analytics', title: 'Audience', desc: 'QoS and viewing data' },
    ],
    installations: [
      {
        name: 'Regional newsroom studio',
        industry: 'Broadcast',
        challenge:
          'A daily bulletin produced by a crew of three, needing the on-air look of a facility several times the size.',
        solution:
          'Robotic PTZ chain with shot presets, a compact switcher driving real-time graphics, and a virtual set extending the physical one.',
        products: ['PTZ cameras', 'Production switcher', 'Real-time graphics', 'Virtual set'],
        src: '/assets/img/pexels-7865064-w1400.jpg',
        alt: 'Two professional pedestal cameras in a dark television studio facing a lit set',
      },
      {
        name: 'Corporate streaming facility',
        industry: 'Enterprise',
        challenge:
          'Town halls and investor briefings streamed to a global audience, where a dropped encode is a reputational problem rather than an inconvenience.',
        solution:
          'A fully redundant encode and delivery path with automatic failover, monitored end to end from a single position.',
        products: ['Encoders', 'OTT delivery', 'Switching', 'Monitoring'],
        src: '/assets/img/unsplash-1558494949-ef010cbdcc31-w1400.jpg',
        alt: 'Server racks with dense structured cabling carrying live video',
      },
    ],
    industries: [
      { icon: 'broadcast', name: 'Broadcasters' },
      { icon: 'stadium', name: 'Sport & venues' },
      { icon: 'education', name: 'Education' },
      { icon: 'government', name: 'Government' },
      { icon: 'workplace', name: 'Corporate studios' },
      { icon: 'venue', name: 'Houses of worship' },
    ],
    cta: {
      label: 'Start a project',
      title: 'Building a <em>studio</em> or a stream?',
      desc: 'From a single-operator desk to a full facility. Tell us the format, the output and where it has to land, and we build the signal chain backwards from there.',
      primary: { text: 'Spec the chain', to: '/contact' },
      secondary: { text: 'See broadcast brands', to: '/partners' },
    },
    brands: ['Vizrt', 'SalrayWorks', 'Telycam', 'Amino', 'RDL'],
    next: 'live-events',
  },

  'live-events': {
    name: 'Live Events & Immersive',
    title: 'Live Events &amp; <em>Immersive</em>',
    kicker: 'Built to survive the road',
    intro:
      'Touring-grade LED, projection mapping and spatial audio for concerts, exhibitions and experiential spaces — built to survive the road.',
    fact: 'Concerts · Exhibitions · XR',
    capsSide:
      'Rigged, run and struck in hours — event technology has no second chances, so we spec accordingly.',
    hero: {
      src: '/assets/img/pexels-13230484-w1920.jpg',
      alt: 'A night concert stage with red LED fixtures and blue beam lights over the crowd',
    },
    trust: ['Touring-grade specialists', ...SHARED_TRUST],
    heroStats: [
      { value: 'IP65', label: 'Touring rated' },
      { value: 'Fast-lock', label: 'Frame system' },
      { value: 'Timecode', label: 'Show sync' },
    ],
    caps: [
      ['Touring & rental LED', 'Fast-lock touring frames, curved arrays and floor systems built for load-in after load-in.', '/assets/img/pexels-7513419-w1920.jpg', 'A technician working on a huge LED wall rigged from stage truss'],
      ['Projection mapping', 'High-output projection and warping tools for architecture, stages and art installations.', '/assets/img/pexels-13136106-w900.jpg', 'A crowd silhouetted in front of a giant glowing projection'],
      ['Spatial & concert audio', 'Point-source and immersive audio systems that scale from galleries to arenas.', '/assets/img/pexels-13230484-w1400.jpg', 'A night concert stage with red LED fixtures and blue beam lights over the crowd'],
      ['Show control', 'Timecode, triggering and media servers keeping lights, video and sound on the same beat.', '/assets/img/unsplash-1492684223066-81342ee5ff30-w1100.jpg', 'Confetti falling over a concert crowd under stage lights'],
    ],
    showcase: {
      label: 'In the field',
      title: 'Load in. Show. <em>Strike.</em>',
      desc:
        'Event kit lives a harder life than anything else we distribute — trucked, rigged in the dark, run once and struck the same night. Fast-lock frames, spares in the case and a show file that survives a panel swap are not luxuries.',
      src: '/assets/img/pexels-7513419-w1920.jpg',
      alt: 'A technician working on a huge LED wall rigged from stage truss',
      readouts: [
        { value: 'Hours', label: 'Load-in to show' },
        { value: 'Curved', label: 'Array capable' },
        { value: 'Hot-swap', label: 'Panel spares' },
      ],
    },
    flow: [
      { icon: 'source', title: 'Show file', desc: 'Content and cue stack' },
      { icon: 'storage', title: 'Media servers', desc: 'Playback and warping' },
      { icon: 'routing', title: 'Distribution', desc: 'Signal to every surface' },
      { icon: 'display', title: 'LED & projection', desc: 'Walls, floors and facades' },
      { icon: 'operator', title: 'Show control', desc: 'Timecode and triggering' },
      { icon: 'analytics', title: 'Post-show', desc: 'Reporting and asset return' },
    ],
    installations: [
      {
        name: 'Arena touring production',
        industry: 'Live music',
        challenge:
          'A curved upstage wall rebuilt in a different venue every night, by a crew working against a fixed load-in window.',
        solution:
          'Fast-lock touring frames with curve-capable hardware, panel-level spares in the case, and a show file that recovers from a mid-run swap.',
        products: ['Touring LED', 'Media servers', 'Show control', 'Spares programme'],
        src: '/assets/img/pexels-13230484-w1400.jpg',
        alt: 'A night concert stage with red LED fixtures and blue beam lights over the crowd',
      },
      {
        name: 'Immersive exhibition space',
        industry: 'Experiential',
        challenge:
          'A gallery running a mapped, multi-surface piece on a loop all day, with no technician on site once it opened.',
        solution:
          'High-output projection with warping and blending held in the server, spatial audio locked to timecode, and unattended daily start-up.',
        products: ['Projection', 'Warping & blending', 'Spatial audio', 'Show control'],
        src: '/assets/img/pexels-13136106-w1400.jpg',
        alt: 'A crowd silhouetted in a dark hall in front of a giant glowing projection',
      },
    ],
    industries: [
      { icon: 'venue', name: 'Concert venues' },
      { icon: 'stadium', name: 'Stadiums & arenas' },
      { icon: 'retail', name: 'Brand experience' },
      { icon: 'education', name: 'Museums & galleries' },
      { icon: 'government', name: 'Civic events' },
      { icon: 'hospitality', name: 'Hospitality events' },
    ],
    cta: {
      label: 'Start a project',
      title: 'Speccing for <em>the road</em>?',
      desc: 'Load-in windows, curve requirements, spares levels, crew size. Tell us the tour or the install and we build a kit list that survives it — including what goes in the spares case.',
      primary: { text: 'Build a kit list', to: '/contact' },
      secondary: { text: 'See event brands', to: '/partners' },
    },
    brands: ['Christie', 'Magnum', 'Sonance', 'Kordz', 'Wavex'],
    next: 'digital-signage',
  },
};

export default SOLUTIONS;

/** Falls back to the first vertical so an unknown slug renders a page, not a crash. */
export function getSolution(slug) {
  return SOLUTIONS[slug] || SOLUTIONS['digital-signage'];
}

/**
 * The three verticals following `slug`, wrapping around the list.
 *
 * Replaces the single "next solution" band: one onward link is a dead end for
 * anyone whose interest isn't the very next item in a fixed order.
 */
export function getRelatedSolutions(slug) {
  const i = SOLUTION_ORDER.indexOf(slug);
  const from = i === -1 ? 0 : i;
  return [1, 2, 3].map((offset) => {
    const nextSlug = SOLUTION_ORDER[(from + offset) % SOLUTION_ORDER.length];
    const s = SOLUTIONS[nextSlug];
    return { slug: nextSlug, name: s.name, kicker: s.kicker, src: s.hero.src, alt: s.hero.alt };
  });
}
