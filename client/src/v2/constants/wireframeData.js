/**
 * Data lifted from the "Mindstec Website 2026 v2" wireframe. Source of truth for
 * the wireframe-driven sections (brands by solution/region, offices, routing).
 * Read-only: import from here, do not edit per-page. Where the CMS/backend has
 * the same data, prefer the backend and use these as placeholders/fallbacks.
 * Region keys: me = Middle East, in = India, af = Africa, eu = Europe.
 * Solution keys: cr cc ie bp ds pa hg ai ict.
 */
const BRANDS = [{"n":"Amino","u":"https://www.amino.tv","s":["ds"],"r":["in"]},{"n":"AtlasIED","u":"https://www.atlasied.com","s":["pa"],"r":["me"]},{"n":"Aurora","u":"https://www.auroramultimedia.com","s":["cr","cc"],"r":["eu"]},{"n":"Avocor","u":"https://www.avocor.com","s":["cc"],"r":["in"]},{"n":"B-Tech","u":"https://www.btechavmounts.com","s":["cr","cc","ie","bp","ai"],"r":["me","in","af","eu"]},{"n":"Bluefin","u":"https://www.thebluefin.com/","s":["ds"],"r":["me","in"]},{"n":"Blustream","u":"https://www.blustream.com.au","s":["ai"],"r":["me","in","af"]},{"n":"Christie","u":"https://www.christiedigital.com","s":["cr","ie"],"r":["in"]},{"n":"Datapath","u":"https://www.datapath.co.uk","s":["cr","ie"],"r":["me","in","af","eu"]},{"n":"Delta","u":"https://www.deltadisplays.com","s":["cr"],"r":["me"]},{"n":"GoGet","u":"https://www.gogetcorp.com","s":["cc"],"r":["me","in"]},{"n":"Horion","u":"https://www.horion.com","s":["cr"],"r":["af"]},{"n":"Humelab","u":"https://www.humelab-hospitality.com","s":["hg"],"r":["me","in","af"]},{"n":"Iport","u":"https://www.iportproducts.com","s":["cc"],"r":["me","in"]},{"n":"Kordz","u":"https://www.kordz.com","s":["ai"],"r":["me","in","af","eu"]},{"n":"Lemco","u":"https://www.lemco.gr","s":["hg"],"r":["me","in","eu"]},{"n":"Magnum","u":"","s":["cc"],"r":["in"]},{"n":"MTC","u":"https://mtc-technologies.com","s":["cr","cc","ie","hg"],"r":["me","in","af","eu"]},{"n":"Netgear","u":"https://www.netgear.com/av/","s":["cr","ai","ict"],"r":["in"]},{"n":"Polywall","u":"https://polywall.net","s":["cr"],"r":["me","in","af"]},{"n":"PTZ Optics","u":"https://www.ptzoptics.com","s":["bp"],"r":["af"]},{"n":"RDL","u":"https://www.rdlnet.com","s":["hg"],"r":["me","in"]},{"n":"RTI","u":"https://www.rticontrol.com","s":["hg","ai"],"r":["me","in","af"]},{"n":"SalrayWorks","u":"https://www.salrayworks.com/","s":["bp"],"r":["in"]},{"n":"Sapling","u":"https://www.sapling-inc.com","s":["cr"],"r":["me","in","af"]},{"n":"SCT","u":"https://www.soundcontrol.net","s":["cc","pa"],"r":["me","in"]},{"n":"Smartsign","u":"https://www.smartsign.se","s":["ds"],"r":["af"]},{"n":"Sonance","u":"https://www.sonance.com","s":["cc","ie","pa","hg"],"r":["in"]},{"n":"T1V","u":"https://www.t1v.com","s":["cr","cc","ie"],"r":["me","in","af","eu"]},{"n":"Telycam","u":"https://www.telycam.com","s":["bp"],"r":["in"]},{"n":"Vitec","u":"https://www.vitec.com/","s":["ds"],"r":["me","in"]},{"n":"Vizrt","u":"https://www.vizrt.com","s":["ie","bp"],"r":["in"]},{"n":"Wavex","u":"https://www.wavextouch.com","s":["cr","cc","ie","ds"],"r":["in"]}];

const PRAC = [
  {k:'cr', n:'Control Rooms & Critical Environments', d:'Video walls, signal processing and operator environments for command centres, utilities, transport and security.', a:['Traffic and transport control', 'Utilities and energy', 'Security operations centres', 'Emergency response', 'Network operations centres']},
  {k:'cc', n:'Conferencing & Collaboration', d:'Boardrooms, meeting rooms and huddle spaces with interactive displays, room control and wireless sharing.', a:['Boardrooms', 'Meeting and huddle rooms', 'Training rooms and lecture halls', 'Town halls and auditoriums']},
  {k:'ie', n:'Immersive Experience', d:'Large-format and interactive spaces for experience centres, museums, retail and brand showcases.', a:['Experience centres', 'Museums and visitor attractions', 'Retail flagships', 'Corporate lobbies', 'Events and exhibitions']},
  {k:'bp', n:'Broadcast, Production & Streaming', d:'Cameras, graphics and production tools for studios, live events and streaming.', a:['Broadcast studios', 'Live event production', 'Corporate and education streaming', 'Sports and esports']},
  {k:'ds', n:'Digital Signage & DOOH', d:'Players, software and mounting for digital signage and digital out-of-home networks.', a:['Retail signage', 'Airports and transport hubs', 'Corporate communications', 'Outdoor DOOH', 'Menu boards']},
  {k:'pa', n:'Professional Audio Systems', d:'Speakers, amplification and audio interfaces for commercial and architectural spaces.', a:['Background music and paging', 'Public address and voice evacuation', 'Hospitality venues', 'Meeting room audio']},
  {k:'hg', n:'Hospitality & Guest Experience', d:'In-room entertainment, control and guest-facing technology for hotels and residences.', a:['Guest rooms', 'Lobbies and public areas', 'Restaurants and bars', 'Residences']},
  {k:'ai', n:'AV Infrastructure', d:'Connectivity, signal routing and switching, mounting and control: the backbone behind every AV system.', a:['Cabling and connectivity','Signal extension and switching','AV-over-IP distribution','Display and equipment mounting','Room and system control']},
  {k:'ict', n:'Information and Communication Technology', d:'Network switching and infrastructure that carries AV and IT traffic on one network.', a:['AV-over-IP networks','Network switching for AV and IT','Campus and venue networks']}
];
const CATS = {"Vitec":["IPTV and digital signage platforms","Video encoders and decoders"],"Amino": ["Media players", "IPTV set-top boxes", "Device management software"], "AtlasIED": ["Loudspeakers", "Amplifiers", "IP paging and mass notification"], "Aurora": ["AV-over-IP", "Control systems", "Video processing"], "Avocor": ["Interactive displays", "Video conferencing displays"], "B-Tech": ["Display mounts", "Video wall mounts", "Floor stands and trolleys"], "Blustream": ["HDMI matrix switchers", "HDBaseT extenders", "AV-over-IP"], "Cambium": ["Wi-Fi access points", "Point-to-point wireless", "Network switches"], "Christie": ["Projectors", "LED video walls", "Image processing"], "Datapath": ["Video wall controllers", "Capture cards", "Video wall software"], "Iport": ["Tablet mounts and charging"], "Kordz": ["HDMI cables", "USB-C cables", "AV connectivity"], "Netgear": ["AV-over-IP network switches"], "PTZ Optics": ["PTZ cameras", "Camera controllers"], "RDL": ["Audio interfaces", "Amplifiers", "Signal converters"], "RTI": ["Control processors", "Touch panels and remotes"], "Sapling": ["Synchronised clock systems", "Digital and analogue clocks"], "SCT": ["USB and camera extenders", "Camera control"], "Smartsign": ["Digital signage software", "Room booking displays"], "Sonance": ["Architectural loudspeakers", "Amplifiers"], "T1V": ["Visual collaboration software", "Wireless presentation"], "Telycam": ["PTZ cameras", "Conference cameras"], "Vizrt": ["Real-time graphics", "Live production systems", "Streaming"]}; // draft product categories, confirm with brand teams
const PN = Object.fromEntries(PRAC.map(p=>[p.k,p.n]));
const PSHORT = {cr:'Control Rooms',cc:'Conferencing',ie:'Immersive',bp:'Broadcast',ds:'Signage & DOOH',pa:'Pro Audio',hg:'Hospitality',ai:'AV Infrastructure',ict:'ICT'};

const OFF = {
  ae:{c:'United Arab Emirates', city:'Dubai', role:'Global headquarters and Middle East hub', tz:'Asia/Dubai', lat:25.2, lon:55.27, hq:true},
  qa:{c:'Qatar', city:'Doha', role:'Middle East office', tz:'Asia/Qatar', lat:25.29, lon:51.53},
  sa:{c:'Saudi Arabia', city:'Riyadh', role:'Middle East office', tz:'Asia/Riyadh', lat:24.71, lon:46.68},
  sj:{c:'Saudi Arabia', city:'Jeddah', role:'Middle East office', tz:'Asia/Riyadh', lat:21.49, lon:39.19},
  in:{c:'India', city:'Bengaluru', role:'India hub', tz:'Asia/Kolkata', lat:12.97, lon:77.59},
  th:{c:'Thailand', city:'Bangkok', role:'Southeast Asia hub', tz:'Asia/Bangkok', lat:13.75, lon:100.5},
  eg:{c:'Egypt', city:'Cairo', role:'Middle East office', tz:'Africa/Cairo', lat:30.04, lon:31.24},
  za:{c:'South Africa', city:'Johannesburg', role:'Africa hub', tz:'Africa/Johannesburg', lat:-26.2, lon:28.05},
  pl:{c:'Poland', city:'Warsaw', role:'Europe hub', tz:'Europe/Warsaw', lat:52.23, lon:21.01},
  br:{c:'Brazil', city:'São Paulo', role:'Latin America office', tz:'America/Sao_Paulo', lat:-23.55, lon:-46.63}
};
const REG = {
  me:{n:'Middle East', path:'/me/', offices:['ae','qa','sa','sj','eg'], lang:'Arabic version planned'},
  in:{n:'India', path:'/in/', offices:['in']},
  af:{n:'Africa', path:'/af/', offices:['za']},
  eu:{n:'Europe', path:'/eu/', offices:['pl'], lang:'Polish version planned'}
};
const nOff = () => Object.keys(OFF).length, nCountries = () => new Set(Object.values(OFF).map(o=>o.c)).size, nPrac = () => PRAC.length, pad2 = n => String(n).padStart(2,'0');
const REGPAGES = ['about','brands','clients','ewaste'];
/* Country routing: draft table, Mindstec to confirm. Each country goes to one team inbox or CRM queue. */
const TEAMS = {me:'Middle East team · Dubai', in:'India team · Bengaluru', af:'Africa team · Johannesburg', eu:'Europe team · Warsaw', th:'Bangkok office', br:'São Paulo office', hq:'Dubai headquarters'};
const ROUTES = {
  me:['United Arab Emirates','Saudi Arabia','Qatar','Egypt','Kuwait','Bahrain','Oman','Jordan','Iraq','Lebanon'],
  in:['India','Sri Lanka','Bangladesh','Nepal','Maldives'],
  af:['South Africa','Kenya','Nigeria','Ghana','Botswana','Namibia','Zambia'],
  eu:['Poland','Germany','Czech Republic','Slovakia','Hungary','Romania','Lithuania'],
  th:['Thailand','Vietnam','Malaysia','Singapore','Indonesia','Philippines'],
  br:['Brazil','Argentina','Chile','Colombia','Mexico']};
const COUNTRIES = Object.values(ROUTES).flat().sort().concat(['Other country']);
const TOPIC_ROUTE = {'Careers':'HR team · Dubai','Partnership (OEM)':'Dubai headquarters'};
function routeFor(country, topic){ if(topic && TOPIC_ROUTE[topic]) return TOPIC_ROUTE[topic];
  const k=Object.keys(ROUTES).find(r=>ROUTES[r].includes(country)); return country?(k?TEAMS[k]:TEAMS.hq):''; }
const REG_COUNTRY = {me:'United Arab Emirates', in:'India', af:'South Africa', eu:'Poland'};

const EVENTS = [
  {name:'Mindstec Connect at GITEX Global 2026', start:'2026-12-07', end:'2026-12-11', city:'Dubai, UAE', venue:'Hosted event alongside GITEX Global', r:'me', flag:true, note:'Dates to confirm'},
  {name:'Pro AV iT Competence Days 2026', start:'2026-10-07', end:'2026-10-08', city:'Kraków, Poland', venue:'Metropolo by Golden Tulip Krakow Conference Centre', r:'eu'},
  {name:'InfoComm India 2026', start:'2026-09-16', end:'2026-09-18', city:'Mumbai, India', venue:'Jio World Convention Centre', booth:'Booth D10', r:'in'}
];

export const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const GROUP = ['MTC', 'Humelab'];
export { nOff, nCountries, nPrac, pad2, BRANDS, PRAC, CATS, PN, PSHORT, OFF, REG, REGPAGES, TEAMS, ROUTES, COUNTRIES, TOPIC_ROUTE, routeFor, REG_COUNTRY, EVENTS };
