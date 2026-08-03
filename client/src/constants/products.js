/**
 * Product catalogue: the ten application categories and the brand registry
 * behind `/products` and `/products/:brand`.
 *
 * ── Why it is shaped this way ────────────────────────────────────────────────
 * Mindstec's China site organises its catalogue by *application* — "meeting and
 * training rooms", "command centres", "lighting control" — and then lists the
 * brands that serve each one, with a page per brand describing its product
 * families. That is the right model for a distributor: a specifier arrives
 * knowing the room they have to fill, not the manufacturer they want. This file
 * reproduces that structure in English and hangs it off the brands Mindstec
 * actually carries (the same twenty-five as `/partners`).
 *
 * `/solutions` answers "what should this space do"; `/products` answers "whose
 * hardware does it". `solutions` on each brand is the cross-link between them.
 *
 * ── One registry, two pages ─────────────────────────────────────────────────
 * `BRANDS` is also what `/partners` renders. The logo paths and the partner
 * filter category (`cat`) used to be a second copy of this list inside
 * Partners.jsx; two lists of the same twenty-five brands drift the moment one
 * brand is added. `cat` and `descKey` exist for that page, `categories`,
 * `families`, `about` and `solutions` for this one.
 *
 * ── Copy ────────────────────────────────────────────────────────────────────
 * Brand descriptions and product families are drawn from Mindstec's own
 * published brand pages (mindstec.com/in/solution/*, mindstec.com.cn/products/*)
 * and from each manufacturer's product line-up. They describe product
 * *categories*, not part numbers or specifications — nothing here should be
 * read as a stock or pricing commitment.
 */

/**
 * The ten application categories, in the order the catalogue presents them.
 * `icon` keys into components/common/SolutionIcons.
 */
export const PRODUCT_CATEGORIES = [
  {
    code: 'meeting-collaboration',
    icon: 'workplace',
    name: 'Meeting & Training Rooms',
    short: 'Meeting rooms',
    desc: 'Room control, wireless presentation and collaboration for huddle spaces, boardrooms and training suites.',
  },
  {
    code: 'command-video-wall',
    icon: 'command',
    name: 'Command Centres & Video Walls',
    short: 'Command centres',
    desc: 'Video wall processing, wall management software and 24/7 displays for control rooms and NOCs.',
  },
  {
    code: 'media-distribution-signage',
    icon: 'display',
    name: 'Media Distribution & Digital Signage',
    short: 'Signage',
    desc: 'Content distribution, media asset management and signage networks across one site or hundreds.',
  },
  {
    code: 'hospitality-real-estate',
    icon: 'hospitality',
    name: 'Hospitality, Real Estate & Catering',
    short: 'Hospitality',
    desc: 'Guest-room technology, back-of-house audio and building-wide control for hotels, restaurants and developments.',
  },
  {
    code: 'events-exhibition',
    icon: 'venue',
    name: 'Events & Exhibition',
    short: 'Events',
    desc: 'Projection, large-format interactive surfaces and touring-grade hardware for shows, stands and installations.',
  },
  {
    code: 'retail-chain-store',
    icon: 'retail',
    name: 'Retail & Chain Store',
    short: 'Retail',
    desc: 'Storefront and in-store technology that runs unattended and is administered across an estate.',
  },
  {
    code: 'smart-home',
    icon: 'workplace',
    name: 'Smart Home',
    short: 'Smart home',
    desc: 'Whole-home control, architectural audio and the infrastructure behind them, for residential integrators.',
  },
  {
    code: 'education',
    icon: 'education',
    name: 'Education',
    short: 'Education',
    desc: 'Lecture capture, interactive teaching surfaces and campus-wide distribution for schools and universities.',
  },
  {
    code: 'display-mounting',
    icon: 'display',
    name: 'Display Mounting',
    short: 'Mounting',
    desc: 'Video wall, display, kiosk and speaker mounting — the half of the bill of materials that is usually forgotten.',
  },
  {
    code: 'lighting-control',
    icon: 'energy',
    name: 'Lighting & Dimming Control',
    short: 'Lighting',
    desc: 'Scene-based lighting and dimming driven from the same control platform as the AV in the room.',
  },
];

/**
 * The brand registry.
 *
 * `id`         two-digit index shown on the partner cards
 * `cat`        `/partners` filter group (displays | audio | broadcast | collab | infra)
 * `descKey`    i18n key for the one-line partner-card description
 * `categories` application categories this brand appears under on `/products`
 * `solutions`  `/solutions/:slug` verticals this brand contributes to
 * `families`   product families shown on `/products/:slug`
 */
export const BRANDS = [
  {
    id: '01',
    slug: 'avocor',
    name: 'Avocor',
    cat: 'displays',
    descKey: 'partners.brands.b1',
    img: '/assets/uploads/2019/03/1.png',
    blurb: 'Interactive collaboration displays for meeting rooms and classrooms.',
    about:
      'Avocor builds interactive flat panels designed around the platforms people already meet on, rather than around a proprietary whiteboard. The range spans huddle-room sizes up to large-format teaching surfaces, with native Teams and Zoom room variants and the accessories to hang, connect and manage them.',
    categories: ['meeting-collaboration', 'education'],
    solutions: ['conferencing-collaboration', 'immersive-experience'],
    families: [
      ['Interactive flat panels', 'Touch displays from huddle-room to lecture-theatre sizes, with anti-glare glass, pen and palm rejection, and multi-user touch.'],
      ['Windows collaboration displays', 'Room systems certified for Microsoft Teams and Zoom, so the panel is the room rather than an accessory to it.'],
      ['Room accessories', 'Trolleys, wall mounts, cameras and soundbars matched to the panel sizes, quoted on the same line.'],
    ],
  },
  {
    id: '02',
    slug: 'christie',
    name: 'Christie',
    cat: 'displays',
    descKey: 'partners.brands.b2',
    img: '/assets/uploads/2025/04/christie_250x250.png',
    blurb: 'Projection, LED and processing for the largest visual installations.',
    about:
      'Christie Digital Systems is a global leader in advanced visual display technology, with a projection line that runs from meeting rooms to planetariums and a direct-view LED range built for continuous operation. Its processing and warping tools are what make multi-projector and mapped installations hold together.',
    categories: ['command-video-wall', 'events-exhibition'],
    solutions: ['immersive-experience', 'control-rooms-critical-environments', 'broadcast-production-streaming'],
    families: [
      ['Laser projection', 'Pure laser and laser phosphor projectors from installation to large-venue brightness, with long-life illumination and no lamp schedule.'],
      ['Direct-view LED', 'Indoor LED for control rooms, lobbies and studio backdrops, rated for the duty cycle those rooms actually run at.'],
      ['Warping & blending', 'Geometry correction, edge blending and multi-projector alignment held in the processing rather than in the rigging.'],
      ['Content processing', 'Media servers and image processors that drive multi-surface installations from one show file.'],
    ],
  },
  {
    id: '03',
    slug: 'datapath',
    name: 'Datapath',
    cat: 'displays',
    descKey: 'partners.brands.b3',
    img: '/assets/uploads/2025/04/datapath-1.png',
    blurb: 'Video wall processing, capture and multi-display graphics since 1982.',
    about:
      'Datapath has specialised in computer graphics and video wall display since 1982, covering hardware and driver software design in-house. Its expertise runs from single capture cards to complete video wall control systems, with offices in the UK, France and the United States and the engineering depth to take on large projects.',
    categories: ['command-video-wall', 'meeting-collaboration', 'events-exhibition'],
    solutions: ['control-rooms-critical-environments', 'immersive-experience', 'broadcast-production-streaming'],
    families: [
      ['Graphics cards', 'Multi-display output for control rooms, video walls and high-end signage — PCI and PCIe, supporting HD, SD, DVI and RGB overlay, up to four 1920 × 1200 outputs.'],
      ['Video capture cards', 'High-end and standard-definition capture with audio on selected models: single and dual-link DVI, 3G-SDI, RGB, component YPbPr, composite and S-Video, for streaming, medical imaging, machine vision and wall display.'],
      ['Multi-display controllers', 'Standalone controllers that take single or dual-link DVI-D in and drive it back out over DVI-I, with rotation, cropping, scaling, mirroring and edge correction.'],
      ['Video wall controllers', 'Systems that integrate any mix of digital sources into any display configuration — complete solutions, sub-systems or components, driven by the Wall Control application.'],
    ],
  },
  {
    id: '04',
    slug: 'polywall',
    name: 'Polywall',
    cat: 'displays',
    descKey: 'partners.brands.b4',
    img: '/assets/uploads/2025/04/polywall_250x250.png',
    blurb: 'Video wall management software built for control room operators.',
    about:
      'Polywall is video wall management software written for the people who sit in front of the wall rather than the people who commissioned it. Sources, layouts and alarms are arranged as presets an operator can recall in one action, across walls of any size and mixed source types.',
    categories: ['command-video-wall'],
    solutions: ['control-rooms-critical-environments'],
    families: [
      ['Wall management', 'Any source on any part of the wall, at any size, arranged from a drag-and-drop canvas rather than a configuration file.'],
      ['Layouts & presets', 'Saved scenes per shift, per incident or per operator, recalled in a single action.'],
      ['Alarm-driven views', 'Automatic layout changes triggered by an external system, so an incident brings its own sources up.'],
      ['Multi-operator control', 'Concurrent operators on one wall with defined rights, from a workstation, a tablet or a touch panel.'],
    ],
  },
  {
    id: '05',
    slug: 'magnum',
    name: 'Magnum',
    cat: 'displays',
    descKey: 'partners.brands.b5',
    img: '/assets/uploads/2025/04/magnum-2-1.png',
    blurb: 'Table connectivity and cable management for meeting spaces.',
    about:
      'Magnum makes the connectivity that sits where people actually sit: table boxes, cable retractors, power and data modules that combine AV signal with power and stay serviceable after the furniture is installed.',
    categories: ['meeting-collaboration', 'display-mounting'],
    solutions: ['conferencing-collaboration'],
    families: [
      ['Table connection boxes', 'Flush, pop-up and under-table enclosures combining HDMI, USB-C, network and power in one plate.'],
      ['Cable retractors', 'Managed cable returns that keep a boardroom table tidy between meetings without loose leads in a drawer.'],
      ['Power & data modules', 'Regional socket modules and USB charging built into the same housing as the AV connections.'],
    ],
  },
  {
    id: '06',
    slug: 'sonance',
    name: 'Sonance',
    cat: 'audio',
    descKey: 'partners.brands.b6',
    img: '/assets/uploads/2026/03/Screenshot-2026-03-24-124551.png',
    blurb: 'Architectural audio — the loudspeaker you are not meant to notice.',
    about:
      'Sonance invented the in-wall loudspeaker and still leads architectural audio: in-wall, in-ceiling, invisible and landscape ranges, with the amplification and distribution to drive them. The design brief is always the same — the room sounds finished and the hardware disappears into it.',
    categories: ['hospitality-real-estate', 'smart-home', 'meeting-collaboration', 'retail-chain-store', 'events-exhibition'],
    solutions: ['hospitality-guest-experience', 'conferencing-collaboration', 'immersive-experience'],
    families: [
      ['In-wall & in-ceiling', 'Architectural loudspeakers that finish flush with the surface, from background music to full-range performance.'],
      ['Invisible series', 'Speakers plastered into the wall or ceiling and painted over, for spaces where no visible grille is acceptable.'],
      ['Landscape series', 'Weatherised satellite and subwoofer systems for terraces, pool decks and outdoor dining.'],
      ['Amplifiers & distribution', 'Multi-zone amplification sized to the speaker count, with the DSP and control integration to run it.'],
    ],
  },
  {
    id: '07',
    slug: 'rdl',
    name: 'RDL',
    cat: 'audio',
    descKey: 'partners.brands.b7',
    img: '/assets/uploads/2025/04/RDL-1.png',
    blurb: 'Professional audio and AV interfacing modules.',
    about:
      'Radio Design Labs builds the small, reliable modules that make a professional audio system work: format conversion, level matching, distribution, mixing and control, in rack, wall and under-table formats. They are the parts that turn a set of specified boxes into a system that passes commissioning.',
    categories: ['hospitality-real-estate', 'media-distribution-signage', 'meeting-collaboration'],
    solutions: ['hospitality-guest-experience', 'broadcast-production-streaming'],
    families: [
      ['Format converters & interfaces', 'Balanced and unbalanced conversion, level matching and isolation between anything and anything else.'],
      ['Distribution amplifiers', 'Audio distribution and mixing modules for paging, background music and multi-zone systems.'],
      ['Wall-mounted controls', 'Volume, source and mute controls in architectural plates, so the room is operable without a touch panel.'],
      ['Power & racking', 'Power supplies, racking and mounting accessories designed around the module range.'],
    ],
  },
  {
    id: '08',
    slug: 'amino',
    name: 'Amino',
    cat: 'broadcast',
    descKey: 'partners.brands.b8',
    img: '/assets/uploads/2026/04/Untitled-design-27.png',
    blurb: 'IPTV, set-top and media delivery for operators and venues.',
    about:
      'Amino specialises in media and entertainment delivery: IPTV and Android TV endpoints, device management and the cloud services behind them, deployed by operators, hotels and enterprise venues that need a managed estate rather than a shelf of consumer boxes.',
    categories: ['media-distribution-signage', 'hospitality-real-estate', 'retail-chain-store'],
    solutions: ['digital-signage-dooh', 'hospitality-guest-experience', 'broadcast-production-streaming'],
    families: [
      ['IPTV endpoints', 'Managed set-top and stick devices for guest room, venue and enterprise television over the existing network.'],
      ['Android TV devices', 'Certified Android TV endpoints where the estate needs an app ecosystem alongside linear channels.'],
      ['Device management', 'Remote provisioning, firmware and monitoring across thousands of endpoints from one console.'],
      ['Media delivery software', 'Middleware and cloud services for channel line-ups, entitlements and on-demand content.'],
    ],
  },
  {
    id: '09',
    slug: 'salrayworks',
    name: 'SalrayWorks',
    cat: 'broadcast',
    descKey: 'partners.brands.b9',
    img: '/assets/uploads/2026/04/a1966c_b6188e7c73814b5fa62a8a2fdb076fe5mv2.jpeg',
    blurb: 'Broadcast POV, box and specialty cameras.',
    about:
      'SalrayWorks builds compact broadcast cameras for the positions a full-size body cannot reach — POV heads, box cameras and specialty rigs, with the CCUs and control to keep them matched to the main camera chain.',
    categories: ['media-distribution-signage', 'events-exhibition'],
    solutions: ['broadcast-production-streaming'],
    families: [
      ['POV & mini cameras', 'Compact heads for rigged positions, robotics and tight mounts, colour-matched to the main chain.'],
      ['Box cameras', 'Studio and OB box cameras with interchangeable lenses and standard broadcast interfaces.'],
      ['Camera control units', 'CCUs and RCPs so a shaded camera stays shaded through the whole show.'],
    ],
  },
  {
    id: '10',
    slug: 'telycam',
    name: 'Telycam',
    cat: 'broadcast',
    descKey: 'partners.brands.b10',
    img: '/assets/uploads/2025/04/telycam_250x250.png',
    blurb: 'PTZ and conferencing cameras for rooms of every size.',
    about:
      'Telycam makes PTZ and fixed conferencing cameras across the range of room sizes, with NDI, SDI, HDMI and USB output and auto-framing that keeps participants in shot without an operator.',
    categories: ['meeting-collaboration', 'education', 'events-exhibition'],
    solutions: ['conferencing-collaboration', 'broadcast-production-streaming'],
    families: [
      ['PTZ cameras', 'Optical-zoom pan-tilt-zoom cameras for boardrooms, lecture theatres and streamed events.'],
      ['Conferencing cameras', 'Fixed and ePTZ cameras with auto-framing and speaker tracking for huddle and mid-size rooms.'],
      ['NDI & IP output', 'Network video output alongside SDI and HDMI, so one camera serves the room and the stream.'],
      ['Control & accessories', 'Joystick controllers, mounts and power over Ethernet for permanent installations.'],
    ],
  },
  {
    id: '11',
    slug: 'humelab',
    name: 'Humelab',
    cat: 'collab',
    descKey: 'partners.brands.b11',
    img: '/assets/uploads/2026/04/Untitled-design-19.png',
    blurb: 'Guest-facing technology built for the hospitality industry.',
    about:
      'Humelab develops technology specifically for hospitality: in-room and public-area experiences, guest communication and the content management behind them, designed around how a property actually operates rather than adapted from a corporate product.',
    categories: ['hospitality-real-estate', 'media-distribution-signage', 'retail-chain-store'],
    solutions: ['hospitality-guest-experience', 'digital-signage-dooh'],
    families: [
      ['In-room experience', 'Guest-facing interfaces for television, services and property information, branded per property.'],
      ['Guest communication', 'Messaging, wayfinding and event information delivered to the screens a guest already looks at.'],
      ['Content management', 'Central scheduling across properties, with per-site overrides for local events and languages.'],
    ],
  },
  {
    id: '12',
    slug: 'vizrt',
    name: 'Vizrt',
    cat: 'broadcast',
    descKey: 'partners.brands.b12',
    img: '/assets/uploads/2025/06/7-1.png',
    blurb: 'Real-time broadcast graphics and production software.',
    about:
      'Vizrt is the standard for real-time broadcast graphics and software-defined production, from on-air branding and data-driven graphics to virtual sets and full IP production workflows.',
    categories: ['media-distribution-signage', 'events-exhibition'],
    solutions: ['broadcast-production-streaming'],
    families: [
      ['Real-time graphics', 'On-air branding, lower-thirds and data-driven graphics rendered live from a single template set.'],
      ['Virtual sets & AR', 'Virtual studio and augmented reality environments tracked to the camera in real time.'],
      ['Production software', 'Software-defined switching, playout and control for IP and hybrid facilities.'],
      ['Media asset management', 'Ingest, search and delivery workflows for newsrooms and sports production.'],
    ],
  },
  {
    id: '13',
    slug: 'lemco',
    name: 'Lemco',
    cat: 'broadcast',
    descKey: 'partners.brands.b13',
    img: '/assets/uploads/2026/04/Untitled-design-26-1.png',
    blurb: 'Headend, modulation and signal processing.',
    about:
      'Lemco manufactures headend and signal-processing equipment: digital modulators, transmodulators, amplifiers and distribution for hotels, hospitals, marinas and residential developments that carry television over their own cabling.',
    categories: ['hospitality-real-estate', 'media-distribution-signage'],
    solutions: ['hospitality-guest-experience', 'broadcast-production-streaming'],
    families: [
      ['Digital modulators', 'HDMI and IP sources converted to DVB-T, DVB-C or ISDB-T for distribution over existing coaxial infrastructure.'],
      ['Transmodulators', 'Satellite and terrestrial input transmodulated onto the house network with the channel line-up you want.'],
      ['Amplifiers & distribution', 'Line amplifiers, splitters and taps sized for the building rather than for a domestic run.'],
      ['IP streamers', 'Headend output as IP multicast where the property has already moved television onto the data network.'],
    ],
  },
  {
    id: '14',
    slug: 't1v',
    name: 'T1V',
    cat: 'collab',
    descKey: 'partners.brands.b14',
    img: '/assets/uploads/2025/04/T1V-Orange-Standard-Logo-1.png',
    blurb: 'Multi-touch, multi-user collaboration software and interactive walls.',
    about:
      'T1V builds interactive experiences for retail, exhibition, corporate, hospitality and education markets worldwide — from concept and custom hardware and software development through installation and support for the life of the product. The platform is patented multi-touch, multi-user software: several people work the same canvas at once, in person and remotely.',
    categories: ['meeting-collaboration', 'education', 'events-exhibition'],
    solutions: ['conferencing-collaboration', 'immersive-experience'],
    families: [
      ['Collaboration software', 'Patented multi-touch, multi-user, multi-application software so a group shares one working canvas — standard across every T1V surface, and customisable to the deployment.'],
      ['Interactive walls', 'Large-format touch video walls that make public space active. The surface divides into zones, so an audience can drive it together or work independently on the same wall.'],
      ['Hybrid meeting', 'In-room and remote participants on the same board, with content contributed from any device.'],
      ['Custom development', 'Bespoke hardware and software built around the brief, then supported through the installation life cycle.'],
    ],
  },
  {
    id: '15',
    slug: 'goget',
    name: 'GoGet',
    cat: 'collab',
    descKey: 'partners.brands.b15',
    img: '/assets/uploads/2025/04/GoGet_Filled_RGB_Black-1.png',
    blurb: 'Workspace and resource booking for hybrid offices.',
    about:
      'GOGET is a workspace management platform for hybrid working: desk and room booking, occupancy data and the signage that tells someone in the corridor whether the room they are standing outside is free.',
    categories: ['meeting-collaboration'],
    solutions: ['conferencing-collaboration'],
    families: [
      ['Room & desk booking', 'Reservations from the calendar, the app or the panel outside the door, with no double-booked rooms.'],
      ['Scheduling panels', 'Door-mounted displays showing status at a glance and releasing a room nobody turned up to.'],
      ['Occupancy analytics', 'Utilisation data per room and per floor, so the next fit-out is sized on evidence.'],
    ],
  },
  {
    id: '16',
    slug: 'iport',
    name: 'iPort',
    cat: 'collab',
    descKey: 'partners.brands.b16',
    img: '/assets/uploads/2025/04/iPort_Logo_250x250.png',
    blurb: 'Tablet mounting, charging and control enclosures.',
    about:
      'iPort turns a tablet into a fixed control surface: wall, surface and desk enclosures with inductive or wired charging, so the device that runs the room is always where it is meant to be and always charged.',
    categories: ['smart-home', 'hospitality-real-estate', 'display-mounting'],
    solutions: ['hospitality-guest-experience', 'conferencing-collaboration'],
    families: [
      ['Wall enclosures', 'Flush in-wall tablet mounts with power, in finishes that suit a finished interior.'],
      ['Charging cases', 'Protective cases with inductive charging, so a control tablet is picked up and put back rather than plugged in.'],
      ['Desk & surface stands', 'Freestanding and surface-mounted bases for reception, boardroom and guest-room positions.'],
    ],
  },
  {
    id: '17',
    slug: 'rti',
    name: 'RTI',
    cat: 'collab',
    descKey: 'partners.brands.b17',
    img: '/assets/uploads/2025/04/logo-300x300-1.png',
    blurb: 'Control and automation for AV, lighting and building systems.',
    about:
      'Remote Technologies Incorporated was founded in 1992 and has built its business in the custom installation market, supported by dealer training through Advanced Control University and by the Integration Partner Program, which keeps RTI control working cleanly with equipment from across the industry. The range is sold exclusively through professional integrators.',
    categories: ['meeting-collaboration', 'command-video-wall', 'smart-home', 'hospitality-real-estate', 'lighting-control'],
    solutions: ['conferencing-collaboration', 'control-rooms-critical-environments', 'hospitality-guest-experience', 'immersive-experience'],
    families: [
      ['Control processors', 'Central processors that hold the system logic, from a single room to a whole property.'],
      ['Handheld & in-wall controllers', 'Award-winning universal remotes and in-wall keypads and touch panels, matched to how the space is actually used.'],
      ['Audio distribution', 'Multi-zone audio distribution and amplification integrated with the same control layer.'],
      ['Lighting & dimming control', 'Scene control and dimming driven from the same processor as the AV, rather than from a second system nobody documented.'],
      ['Integration Designer', 'The programming environment and driver library behind every RTI deployment, with dealer training through ACU.'],
    ],
  },
  {
    id: '18',
    slug: 'sct',
    name: 'SCT',
    cat: 'collab',
    descKey: 'partners.brands.b18',
    img: '/assets/uploads/2025/04/SCT_250W.png',
    blurb: 'Interactive teaching and presentation technology.',
    about:
      'SCT supplies interactive teaching and presentation technology for classrooms and training rooms, covering the surface, the software and the mounting as one specification.',
    categories: ['education', 'meeting-collaboration'],
    solutions: ['conferencing-collaboration'],
    families: [
      ['Interactive surfaces', 'Touch panels and boards sized for classrooms and training rooms.'],
      ['Teaching software', 'Annotation, lesson delivery and screen sharing built for a teaching workflow.'],
      ['Mounting & trolleys', 'Fixed and mobile mounting so one surface serves more than one room.'],
    ],
  },
  {
    id: '19',
    slug: 'blustream',
    name: 'Blustream',
    cat: 'infra',
    descKey: 'partners.brands.b19',
    img: '/assets/uploads/2025/04/Blustream_Logo-3-1.png',
    blurb: 'AV distribution and signal management, from extenders to AV over IP.',
    about:
      'Blustream develops AV distribution and signal management for installations of every scale — HDBaseT extension, matrix switching, AV over IP and the control integration around them. The product line is built so that a two-room job and a two-hundred-endpoint job are designed the same way.',
    categories: ['meeting-collaboration', 'command-video-wall', 'media-distribution-signage', 'hospitality-real-estate', 'education', 'smart-home', 'retail-chain-store'],
    solutions: ['conferencing-collaboration', 'control-rooms-critical-environments', 'digital-signage-dooh', 'hospitality-guest-experience', 'broadcast-production-streaming', 'immersive-experience', 'information-and-communication-technology'],
    families: [
      ['HDBaseT extenders', 'Point-to-point video, audio, control and power over a single structured cable, at the distances a building actually needs.'],
      ['Matrix switching', 'Fixed and modular matrices with independent audio breakout and control integration.'],
      ['AV over IP', 'Video distribution over standard network infrastructure, scaling from a rack to a campus without redesigning the topology.'],
      ['Audio distribution', 'Multi-zone audio matrices and amplification that share the same control layer as the video.'],
      ['Control & accessories', 'Drivers, keypads and the connectivity that turns the distribution into an operable system.'],
    ],
  },
  {
    id: '20',
    slug: 'netgear-av',
    name: 'NETGEAR AV',
    cat: 'infra',
    descKey: 'partners.brands.b20',
    img: '/assets/uploads/2025/04/netgearav_250x250.png',
    blurb: 'Switching engineered specifically for AV-over-IP traffic.',
    about:
      'NETGEAR AV builds high-performance networking for AV over IP: switches that arrive pre-profiled for the major AV protocols, so multicast, IGMP, QoS and PTP are configured correctly before the first stream rather than debugged after the first fault.',
    categories: ['command-video-wall', 'media-distribution-signage', 'meeting-collaboration'],
    solutions: ['information-and-communication-technology', 'control-rooms-critical-environments', 'broadcast-production-streaming'],
    families: [
      ['AV-managed switches', 'Managed switches with AV protocol profiles applied from a menu, not from a command line.'],
      ['PoE++ infrastructure', 'Power budgets sized for cameras, panels and endpoints so the rack does not need a second power path.'],
      ['Network controller', 'Topology view, profile deployment and monitoring for the AV network as a whole.'],
      ['Fibre & uplinks', '10G and higher uplinks for the campus and multi-rack deployments that outgrow copper.'],
    ],
  },
  {
    id: '21',
    slug: 'kordz',
    name: 'Kordz',
    cat: 'infra',
    descKey: 'partners.brands.b21',
    img: '/assets/uploads/2025/04/kordz_250x250.png',
    blurb: 'Professional-grade cable engineered for permanent installation.',
    about:
      'Kordz manufactures professional cabling designed to be installed once and left in the wall: HDMI, structured copper and fibre with the tolerances, terminations and documentation an installation contract needs. It is the layer nobody sees and the first one blamed.',
    categories: ['meeting-collaboration', 'command-video-wall', 'media-distribution-signage', 'hospitality-real-estate', 'education', 'smart-home'],
    solutions: ['information-and-communication-technology', 'conferencing-collaboration', 'control-rooms-critical-environments', 'digital-signage-dooh', 'hospitality-guest-experience', 'broadcast-production-streaming', 'immersive-experience'],
    families: [
      ['HDMI cable', 'Certified passive and active HDMI at the lengths installations actually run, with the bandwidth headroom to survive a source upgrade.'],
      ['Structured cable', 'Cat6A and shielded copper on reels, specified for AV-over-IP and PoE rather than for office data alone.'],
      ['Fibre & AOC', 'Active optical and fibre assemblies for the runs copper cannot make.'],
      ['Terminations & accessories', 'Connectors, plates and management, so the cable schedule and the parts list are the same document.'],
    ],
  },
  {
    id: '22',
    slug: 'b-tech',
    name: 'B-Tech',
    cat: 'infra',
    descKey: 'partners.brands.b22',
    img: '/assets/uploads/2025/04/btech_250x250.png',
    blurb: 'Mounting systems for displays, video walls and loudspeakers.',
    about:
      'B-Tech AV Mounts is a globally recognised manufacturer of mounting for professional AV: video wall systems with micro-adjustment, display and projector mounts, floor and ceiling structures and speaker brackets. Mounting is usually the last thing specified and the first thing that delays a handover.',
    categories: ['display-mounting', 'command-video-wall', 'media-distribution-signage', 'hospitality-real-estate', 'education', 'events-exhibition', 'retail-chain-store'],
    solutions: ['digital-signage-dooh', 'control-rooms-critical-environments', 'conferencing-collaboration', 'hospitality-guest-experience', 'broadcast-production-streaming', 'immersive-experience'],
    families: [
      ['Video wall mounts', 'Pop-out and micro-adjustable systems that let a panel be aligned and then serviced without dismantling its neighbours.'],
      ['Display mounts', 'Fixed, tilting and articulated wall mounts across the commercial panel sizes, with the load ratings documented.'],
      ['Floor & ceiling systems', 'Freestanding stands, ceiling suspension and totem structures for spaces with no wall to use.'],
      ['Speaker & projector mounts', 'Brackets and drop poles matched to the audio and projection lines they hang.'],
    ],
  },
  {
    id: '23',
    slug: 'mtc',
    name: 'MTC',
    cat: 'infra',
    descKey: 'partners.brands.b23',
    img: '/assets/uploads/2025/04/MTC_new-1.png',
    blurb: 'Wireless presentation and collaboration for shared rooms.',
    about:
      'MTC supplies collaboration and communication products that get content onto the room display without a cable hunt: wireless presentation, BYOD switching and the room hardware around them, for meeting rooms, classrooms and shared spaces.',
    categories: ['meeting-collaboration', 'education', 'command-video-wall', 'hospitality-real-estate', 'events-exhibition'],
    solutions: ['conferencing-collaboration', 'control-rooms-critical-environments', 'hospitality-guest-experience', 'immersive-experience'],
    families: [
      ['Wireless presentation', 'Dongle and app-based screen sharing with multiple simultaneous presenters and a moderator view.'],
      ['BYOD switching', 'USB-C and HDMI switching that hands the room camera and microphone to whoever is presenting.'],
      ['Room hardware', 'Table hubs, transmitters and receivers matched to the room sizes they are specified for.'],
    ],
  },
  {
    id: '24',
    slug: 'sapling',
    name: 'Sapling',
    cat: 'infra',
    descKey: 'partners.brands.b24',
    img: '/assets/uploads/2025/04/sapling-1.png',
    blurb: 'Synchronised time systems for facilities that run on the clock.',
    about:
      'Sapling has spent more than two decades on synchronised timekeeping. Where a facility runs to the second — a control room, a hospital, a transport hub, a campus — every clock stays locked to the same source, over IP or over the building wiring, across sites and time zones.',
    categories: ['command-video-wall', 'education', 'media-distribution-signage'],
    solutions: ['control-rooms-critical-environments', 'broadcast-production-streaming'],
    families: [
      ['IP clock systems', 'Clocks synchronised over the data network, with no separate clock cabling to install or maintain.'],
      ['Wireless & wired systems', 'Synchronised systems for buildings where new cable runs are not an option.'],
      ['Master clocks', 'The reference the whole estate follows, with GPS and NTP sources and monitored drift.'],
      ['Elapsed & count-down timers', 'Operating theatre, studio and control room timers driven from the same master.'],
    ],
  },
  {
    id: '25',
    slug: 'wavex',
    name: 'Wavex',
    cat: 'infra',
    descKey: 'partners.brands.b25',
    img: '/assets/uploads/2025/04/Wavex-Transparent-Logo-Source_1024-1.png',
    blurb: 'Interactive audio-visual surfaces for collaboration and display.',
    about:
      'Wavex Touch builds interactive audio-visual products for collaboration and public display — touch surfaces, kiosks and the software behind them, specified for spaces where the public rather than a trained operator is doing the touching.',
    categories: ['meeting-collaboration', 'education', 'media-distribution-signage', 'retail-chain-store', 'events-exhibition', 'command-video-wall'],
    solutions: ['conferencing-collaboration', 'digital-signage-dooh', 'immersive-experience', 'control-rooms-critical-environments'],
    families: [
      ['Interactive displays', 'Touch panels for meeting rooms and classrooms, with annotation and wireless sharing built in.'],
      ['Kiosks & totems', 'Free-standing interactive units for wayfinding, self-service and retail floors.'],
      ['Collaboration software', 'Whiteboarding and content sharing across the surfaces and the devices in the room.'],
    ],
  },
];

/** `/partners` filter groups, kept here beside the `cat` values they filter. */
export const PARTNER_CATEGORY_CODES = ['all', 'displays', 'audio', 'broadcast', 'collab', 'infra'];

const BY_SLUG = BRANDS.reduce((acc, brand) => {
  acc[brand.slug] = brand;
  return acc;
}, {});

const CATEGORY_BY_CODE = PRODUCT_CATEGORIES.reduce((acc, category) => {
  acc[category.code] = category;
  return acc;
}, {});

/** @returns {(typeof BRANDS)[number] | undefined} */
export function getBrand(slug) {
  return BY_SLUG[slug];
}

export function getCategory(code) {
  return CATEGORY_BY_CODE[code];
}

/** Brands in a category, in registry order. `'all'` returns everything. */
export function getBrandsByCategory(code) {
  if (!code || code === 'all') return BRANDS;
  return BRANDS.filter((brand) => brand.categories.includes(code));
}

/** The categories a brand appears under, resolved to their full records. */
export function getBrandCategories(brand) {
  return brand.categories.map((code) => CATEGORY_BY_CODE[code]).filter(Boolean);
}

/**
 * How many brands sit in each category — rendered on the category chips, and
 * the reason a category can never quietly end up empty without it showing.
 */
export const CATEGORY_COUNTS = PRODUCT_CATEGORIES.reduce((acc, category) => {
  acc[category.code] = getBrandsByCategory(category.code).length;
  return acc;
}, {});

/** The three brands after `slug` in registry order, wrapping around. */
export function getRelatedBrands(slug) {
  const i = BRANDS.findIndex((brand) => brand.slug === slug);
  const from = i === -1 ? 0 : i;
  return [1, 2, 3].map((offset) => BRANDS[(from + offset) % BRANDS.length]);
}
