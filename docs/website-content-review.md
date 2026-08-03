# Mindstec Distribution — Website Content Review

**Purpose:** a page-by-page transcript of every piece of copy on the public website, prepared for client review and sign-off.

**Source of truth:** extracted from the live codebase (`client/src`), branch `main`, on 29 July 2026. Copy shown here is the **English** version.

---

## How to read this document

Each page is broken into the sections a visitor scrolls through, in order. Every section is tagged with where its content comes from:

| Tag | Meaning | Who edits it |
| --- | --- | --- |
| **STATIC** | Fixed copy shipped with the site. Translated into 5 languages (EN/FR/AR/DE/ZH). | Developer (code change + re-deploy) |
| **CMS** | Pulled live from the admin dashboard database. | Client, via `/admin/dashboard` |
| **REGION** | Changes depending on the region selected in the top navigation. | Client, via admin → Regions |

### Source references

Every section carries a **Source:** line with clickable links to the exact file and line the content lives at. There are usually two:

- **Layout** — the page component that renders the section (the JSX). Change this to move, add or remove a section.
- **Copy** — where the words themselves are stored. For **STATIC** content this is almost always [`locales/en/common.json`](../client/src/locales/en/common.json), the English translation file. **To change wording, this is the only file that needs editing** — and the same key must be updated in the four other language files ([fr](../client/src/locales/fr/common.json), [ar](../client/src/locales/ar/common.json), [de](../client/src/locales/de/common.json), [zh](../client/src/locales/zh/common.json)).

A third link appears where relevant: **Data** — the API endpoint or constants file supplying CMS-driven or hardcoded list content.

> ⚠️ **Flags** mark copy that needs a decision before launch. All flags are collected in [Appendix A](#appendix-a--items-needing-your-decision) at the end.

---

## Site map

**Public pages (13 routes)** — route table: [`routes/index.jsx#L27`](../client/src/routes/index.jsx#L27)

| # | Page | URL | Component |
| --- | --- | --- | --- |
| 1 | Home | `/` | [`pages/user/Home.jsx`](../client/src/pages/user/Home.jsx) |
| 2 | About Us | `/about` | [`pages/user/About.jsx`](../client/src/pages/user/About.jsx) |
| 3 | Solutions (listing) | `/solutions` | [`pages/user/Solutions.jsx`](../client/src/pages/user/Solutions.jsx) |
| 4 | Solution Detail × 6 | `/solutions/:slug` | [`pages/user/SolutionDetails.jsx`](../client/src/pages/user/SolutionDetails.jsx) |
| 5 | Partners | `/partners` | [`pages/user/Partners.jsx`](../client/src/pages/user/Partners.jsx) |
| 6 | Experience Centre | `/experience` | [`pages/user/Experience.jsx`](../client/src/pages/user/Experience.jsx) |
| 7 | E-Waste Management | `/ewaste` *(region-gated)* | [`pages/user/EWaste.jsx`](../client/src/pages/user/EWaste.jsx) |
| 8 | Gallery | `/gallery` | [`pages/user/gallery/Gallery.jsx`](../client/src/pages/user/gallery/Gallery.jsx) |
| 9 | Events & News | `/events` | [`pages/user/Events.jsx`](../client/src/pages/user/Events.jsx) |
| 10 | Blogs | `/blogs` | [`pages/user/Blogs.jsx`](../client/src/pages/user/Blogs.jsx) |
| 11 | Contact Us | `/contact` | [`pages/user/Contact.jsx`](../client/src/pages/user/Contact.jsx) |
| 12 | 404 — Page not found | any unknown URL | [`pages/user/NotFound.jsx`](../client/src/pages/user/NotFound.jsx) |

**Global elements** appearing on every page: Navigation bar, Footer, Chat widget — assembled in [`components/layout/Layout.jsx#L182`](../client/src/components/layout/Layout.jsx#L182).

**Admin pages** (`/admin/login`, `/admin/dashboard`) are internal tools, not public content — excluded from this review.

---

# Global elements

## Navigation bar — STATIC

> **Source:** Layout → [`Navbar.jsx#L112`](../client/src/components/layout/Navbar/Navbar.jsx#L112) · Copy → [`common.json#L2`](../client/src/locales/en/common.json#L2) (`navbar.*`) · Solution names → [`common.json#L852`](../client/src/locales/en/common.json#L852) (`solutions.arr[].name`)

The logo links to Home. Menu structure:

| Menu item | Type | Links to | Line |
| --- | --- | --- | --- |
| **Home** | Direct link | `/` | [L120](../client/src/components/layout/Navbar/Navbar.jsx#L120) |
| **About** | Dropdown | `/about` | [L128](../client/src/components/layout/Navbar/Navbar.jsx#L128) |
| ↳ About Us | | `/about` | [L134](../client/src/components/layout/Navbar/Navbar.jsx#L134) |
| ↳ Partners | | `/partners` | [L135](../client/src/components/layout/Navbar/Navbar.jsx#L135) |
| **Solutions** | Dropdown | `/solutions` | [L144](../client/src/components/layout/Navbar/Navbar.jsx#L144) |
| ↳ Digital Signage | | `/solutions/digital-signage` | [L150](../client/src/components/layout/Navbar/Navbar.jsx#L150) |
| ↳ Control Rooms | | `/solutions/control-rooms` | [L151](../client/src/components/layout/Navbar/Navbar.jsx#L151) |
| ↳ Conferencing & Collaboration | | `/solutions/conferencing` | [L152](../client/src/components/layout/Navbar/Navbar.jsx#L152) |
| ↳ Hospitality AV | | `/solutions/hospitality` | [L153](../client/src/components/layout/Navbar/Navbar.jsx#L153) |
| ↳ Broadcast & Production | | `/solutions/broadcast` | [L154](../client/src/components/layout/Navbar/Navbar.jsx#L154) |
| ↳ Live Events & Immersive | | `/solutions/live-events` | [L155](../client/src/components/layout/Navbar/Navbar.jsx#L155) |
| **Resources** | Dropdown | `/blogs` | [L164](../client/src/components/layout/Navbar/Navbar.jsx#L164) |
| ↳ Blogs | | `/blogs` | [L170](../client/src/components/layout/Navbar/Navbar.jsx#L170) |
| ↳ E-Waste Management | *region-gated* | `/ewaste` | [L172](../client/src/components/layout/Navbar/Navbar.jsx#L172) |
| ↳ Experience Centre | | `/experience` | [L176](../client/src/components/layout/Navbar/Navbar.jsx#L176) |
| ↳ Gallery | | `/gallery` | [L179](../client/src/components/layout/Navbar/Navbar.jsx#L179) |
| ↳ Events & News | | `/events` | [L182](../client/src/components/layout/Navbar/Navbar.jsx#L182) |
| **Installations** | Direct link | Home page, "Recent field work" section | [L188](../client/src/components/layout/Navbar/Navbar.jsx#L188) |
| **Region selector** | Dropdown | Global · India · Middle East · Africa · South Asia · Hong Kong / China | [L204](../client/src/components/layout/Navbar/Navbar.jsx#L204) |
| **Talk to us** | Button (solid red) | `/contact` | [L266](../client/src/components/layout/Navbar/Navbar.jsx#L266) |

Region names are translated at [`common.json#L16`](../client/src/locales/en/common.json#L16) (`navbar.regions.*`); the list itself comes from the CMS (admin → Regions).

> ⚠️ **Flag N1** — "E-Waste Management" only appears when the selected region has it enabled ([`Navbar.jsx#L109`](../client/src/components/layout/Navbar/Navbar.jsx#L109)). Confirm which regions should show it.

---

## Footer — STATIC + REGION

> **Source:** Layout → [`Footer.jsx#L70`](../client/src/components/layout/Footer/Footer.jsx#L70) · Copy → [`common.json#L25`](../client/src/locales/en/common.json#L25) (`footer.*`) · Data → [`api/regionApi.js`](../client/src/api/regionApi.js)

**Brand blurb** — [`common.json#L29`](../client/src/locales/en/common.json#L29):
> Mindstec Distribution bridges the gap between the manufacturer and the dealer, increasing the efficiency of overall operations.

**Social links** — [`Footer.jsx#L78`](../client/src/components/layout/Footer/Footer.jsx#L78): LinkedIn (`linkedin.com/company/mindstec/`) · Instagram (`instagram.com/mindstec.distribution/`) · YouTube (`youtube.com/channel/UCrmKbX0DP9TZBP2zJ5PHiXA`)

**Column — Solutions** — [`Footer.jsx#L90`](../client/src/components/layout/Footer/Footer.jsx#L90): Digital Signage · Control Rooms · Conferencing & Collaboration · Hospitality AV · Broadcast & Production · Live Events & Immersive

**Column — Company** — [`Footer.jsx#L99`](../client/src/components/layout/Footer/Footer.jsx#L99): About Us · Partners · Experience Centre · E-Waste Management *(region-gated)* · Installations · Blogs · Contact Us

**Column — Office details** — REGION — [`Footer.jsx#L109`](../client/src/components/layout/Footer/Footer.jsx#L109): office name, address, phone and email for the currently selected region. Managed in admin → Regions → Contact Info.

**Large background wordmark** — [`Footer.jsx#L126`](../client/src/components/layout/Footer/Footer.jsx#L126): `MINDSTEC.`

**Bottom bar** — [`common.json#L33`](../client/src/locales/en/common.json#L33):
> © 2026 Mindstec Distribution. All rights reserved.

**Legal links** — [`Footer.jsx#L129`](../client/src/components/layout/Footer/Footer.jsx#L129): Privacy · Terms · Disclaimer

> ⚠️ **Flag N2** — The three legal links point nowhere (`href="#"` at [`Footer.jsx#L130-132`](../client/src/components/layout/Footer/Footer.jsx#L130)). Those pages do not exist. Please supply the copy or confirm they should be removed.

---

## Chat widget — STATIC

> **Source:** Layout → [`components/chat/ChatWidget.jsx`](../client/src/components/chat/ChatWidget.jsx) · Copy → [`common.json#L937`](../client/src/locales/en/common.json#L937) (`chat.*`)

A floating AI assistant, bottom-right on every page.

| Element | Copy | Source |
| --- | --- | --- |
| Launcher label | Ask AI | [`AskAIPanel.jsx#L80`](../client/src/components/chat/AskAIPanel.jsx#L80) |
| Header title | Mindstec Support | [`ChatHeader.jsx#L19`](../client/src/components/chat/ChatHeader.jsx#L19) |
| Status | Online | [`ChatHeader.jsx#L24`](../client/src/components/chat/ChatHeader.jsx#L24) |
| Input placeholder | Type your message... | [`ChatInput.jsx#L61`](../client/src/components/chat/ChatInput.jsx#L61) |

> ⚠️ **Flag C1** — The translation file also holds copy for an **"Avg. response <30 sec"** header line and **four quick-action buttons** (Company Info / Products / Solutions / Technical Support, [`common.json#L941`](../client/src/locales/en/common.json#L941) and [`#L951`](../client/src/locales/en/common.json#L951)). None of it is referenced anywhere in the code — **these do not appear on the site.** Either the feature was removed or never finished. Confirm whether the quick-action buttons should be built, or the copy deleted. See [Appendix D](#appendix-d--copy-written-but-never-displayed).

---

# 1. Home — `/`

> **Page source:** [`pages/user/Home.jsx`](../client/src/pages/user/Home.jsx) · **Copy block:** [`common.json#L201`](../client/src/locales/en/common.json#L201) (`home.*`)

## 1.1 Hero — STATIC

> **Source:** Layout → [`Home.jsx#L887`](../client/src/pages/user/Home.jsx#L887) · Copy → [`common.json#L212`](../client/src/locales/en/common.json#L212) (`home.hero.*`)

Full-screen background **video** ([`Home.jsx#L898`](../client/src/pages/user/Home.jsx#L898)) with a still poster image; phones get a lighter encode.

**Headline:**
> The quiet
> infrastructure behind
> ***every experience.***

**Paragraph:**
> Mindstec distributes professional AV technology from fifty-plus global manufacturers to the integrators, consultants and enterprises building the spaces people remember.

**Button:** `Explore solutions`

**Three facts along the bottom** — [`Home.jsx#L932`](../client/src/pages/user/Home.jsx#L932):

| Bold | Sub-label |
| --- | --- |
| Since 2008 | AV distribution |
| India · Africa · Poland | Three regional operations |
| 50+ brands | Manufacturer portfolio |

Scroll cue: "Scroll"

> ⚠️ **Flag H1** — "Since 2008" implies 18 years of trading, but the stats band below says "15+" years. Also "India · Africa · Poland" contradicts the About and Partners pages, which say "Middle East, Africa and Asia". Please confirm the correct regions and founding year.

## 1.2 Brand ticker — STATIC

> **Source:** Layout **and** copy → [`Home.jsx#L941-947`](../client/src/pages/user/Home.jsx#L941) — hardcoded directly in the JSX, **not** in the translation file.

> Samsung Professional · Crestron · Extron · Shure · Barco · LG Electronics · Sony Professional · Biamp · QSC · Christie · Sennheiser · Epson

> ⚠️ **Flag H2** — Of these twelve names, **only Christie** appears in the 25-brand portfolio at [`Partners.jsx#L13`](../client/src/pages/user/Partners.jsx#L13). The other eleven are not brands the site elsewhere claims to distribute.

## 1.3 Statement — STATIC

> **Source:** Layout → [`Home.jsx#L949`](../client/src/pages/user/Home.jsx#L949), text assembly at [`Home.jsx#L837`](../client/src/pages/user/Home.jsx#L837) · Copy → [`common.json#L226`](../client/src/locales/en/common.json#L226) (`home.statement.*`)

Large animated paragraph:
> A screen in a boardroom. A wall of pixels in a terminal. A voice that carries to the last row. ***Someone has to get that technology there*** — sourced, specified and supported. That is the work we do.

Side note beside a photograph:
> Distribution is logistics only on paper. In practice it is product knowledge, demo stock, engineering support and someone who answers the phone.

## 1.4 Solutions grid — STATIC heading / CMS cards

> **Source:** Layout → [`Home.jsx#L962`](../client/src/pages/user/Home.jsx#L962) · Heading copy → [`common.json#L232`](../client/src/locales/en/common.json#L232) (`home.solutions.*`) · Card component → [`SolutionGrid.jsx`](../client/src/components/common/SolutionGrid/SolutionGrid.jsx) · Data → `GET /admin/solutions/` ([`Home.jsx#L177`](../client/src/pages/user/Home.jsx#L177)) · Fallback → [`constants/solutions.js#L60`](../client/src/constants/solutions.js#L60)

- **Label:** Solutions
- **Heading:** What we ***distribute***
- **Lede:** Six verticals, one supply chain. Hover a category to see it in the field.

The six cards are pulled from the CMS. If the CMS returns nothing, the site falls back to the same six static verticals so the section is never empty. Card copy is listed under [Page 3 — Solutions](#3-solutions--solutions).

## 1.5 Stats band — STATIC

> **Source:** Layout → [`Home.jsx#L983`](../client/src/pages/user/Home.jsx#L983) · Numbers → **hardcoded in the JSX** at [`Home.jsx#L987`, `L991`, `L995`, `L999`](../client/src/pages/user/Home.jsx#L987) (`data-to` attributes) · Descriptions → [`common.json#L238`](../client/src/locales/en/common.json#L238) (`home.stats.*`)

| Number | Description |
| --- | --- |
| **15+** | Years distributing professional AV technology |
| **49+** | Manufacturer brands in the portfolio |
| **3** | Regional operations — India, Africa, Poland |
| **973+** | Installations supplied and supported to date |

> ⚠️ **Flag H3** — Four brand counts appear across the site: **50+** (hero), **49+** (this band), **25** (Partners/Solutions/Experience), **20+** (solution detail metrics). Likewise "973+ installations" here vs "1,000+ installs" on Solutions. Note the numbers live in the JSX, not the translation file — changing them is a code edit.

## 1.6 Why Mindstec (accordion) — STATIC

> **Source:** Layout → [`Home.jsx#L1007`](../client/src/pages/user/Home.jsx#L1007), item array at [`Home.jsx#L858`](../client/src/pages/user/Home.jsx#L858) · Copy → [`common.json#L244`](../client/src/locales/en/common.json#L244) (`home.edge.*`) and [`#L249`](../client/src/locales/en/common.json#L249) (`home.edgeItems[]`)

| # | Title | Body | Image caption |
| --- | --- | --- | --- |
| 01 | A portfolio built over fifteen years | We represent more than fifty manufacturers — Crestron to Samsung Professional — chosen so that an integrator can specify an entire project from one price list. No gaps, no grey imports. | Brand network |
| 02 | Engineers, not order-takers | Every category we carry has a product specialist behind it. We do system design reviews, run demos from our own stock, and stay on the escalation path long after the invoice is paid. | Technical depth |
| 03 | Local teams in three markets | Bangalore covers India and the SAARC region, our Africa office serves the continent's commercial hubs, and Warsaw handles Central and Eastern Europe — local currency, local warranty, local people. | Regional teams |
| 04 | Support from enquiry to install | Pre-sales consultation, procurement, logistics, commissioning help and after-sales service under one roof. Each partner gets a named account manager and a direct line to technical staff. | End-to-end support |

Section heading: **A distributor that acts / like a *partner***

> ⚠️ **Flag H4** — Item 01 again names Crestron and Samsung Professional, which are not in the Partners portfolio (see Flag H2).

## 1.7 Global reach banner — STATIC

> **Source:** Layout → [`Home.jsx#L1045`](../client/src/pages/user/Home.jsx#L1045) · Copy → [`common.json#L271`](../client/src/locales/en/common.json#L271) (`home.band.*`)

Full-width image of Earth from orbit.

- **Label:** Our reach
- **Heading:** One supply chain, ***three continents.***

## 1.8 Regions map — STATIC map / REGION contacts

> **Source:** Layout → [`Home.jsx#L1054`](../client/src/pages/user/Home.jsx#L1054) · City list → **hardcoded** at [`Home.jsx#L22`](../client/src/pages/user/Home.jsx#L22) (`CITIES`) · City-name translations → [`common.json#L202`](../client/src/locales/en/common.json#L202) (`home.cities.*`) · Headings → [`common.json#L276`](../client/src/locales/en/common.json#L276) (`home.regions.*`) · Contact data → [`api/regionApi.js`](../client/src/api/regionApi.js)

- **Label:** Regions
- **Heading:** Where we ***operate***
- **Lede:** Stock, currency, warranty and people — all handled in-region.

**Cities plotted on the animated world map** (routes radiate from Bangalore):

| City | Country | Type |
| --- | --- | --- |
| Bangalore | India | Global Headquarters |
| Dubai | United Arab Emirates | Regional Office |
| Riyadh | Saudi Arabia | Regional Office |
| Nairobi | Kenya | Regional Office |
| Johannesburg | South Africa | Regional Office |
| Cairo | Egypt | Regional Office |
| Bangkok | Thailand | Regional Office |
| Warsaw | Poland | Regional Office |

**Contact strip below the map** — [`Home.jsx#L1166`](../client/src/pages/user/Home.jsx#L1166):
1. *(selected region)* — phone and email pulled live from the CMS
2. Africa — Commercial hubs · Nairobi → `africa@mindstec.com` *(hardcoded, [`Home.jsx#L1180`](../client/src/pages/user/Home.jsx#L1180))*
3. Poland — Central & Eastern Europe · Warsaw → `poland@mindstec.com` *(hardcoded, [`Home.jsx#L1184`](../client/src/pages/user/Home.jsx#L1184))*

> ⚠️ **Flag H5** — Eight offices are pinned on the map, but only three contact entries appear beneath it, and the stats band says "3 regional operations". Please confirm which of the eight cities are actual Mindstec offices.

## 1.9 Recent field work — STATIC heading / CMS cards

> **Source:** Layout → [`Home.jsx#L1189`](../client/src/pages/user/Home.jsx#L1189) · Copy → [`common.json#L290`](../client/src/locales/en/common.json#L290) (`home.work.*`) · Data → `GET /admin/fieldwork/` ([`Home.jsx#L224`](../client/src/pages/user/Home.jsx#L224))

- **Label:** Installations
- **Heading:** Recent ***field work***
- **Lede:** A sample of projects our partners have delivered with equipment we supplied.
- **Button:** `See more installations`

Cards (image, category, title, location) come from admin → Fieldwork.

**If no fieldwork has been published** — [`Home.jsx#L1212`](../client/src/pages/user/Home.jsx#L1212):
> **Case studies in preparation**
> Recent installations are being written up with our partners. In the meantime, talk to us about work in your sector.

## 1.10 Testimonials — STATIC heading / CMS quotes

> **Source:** Layout → [`Home.jsx#L1249`](../client/src/pages/user/Home.jsx#L1249) · Component → [`testimonials-with-marquee.jsx`](../client/src/components/ui/testimonials-with-marquee.jsx) · Copy → [`common.json#L332`](../client/src/locales/en/common.json#L332) (`home.testimonials.*`) · Data → [`api/testimonialApi.js`](../client/src/api/testimonialApi.js)

- **Label:** Client voices
- **Heading:** What our ***clients say***
- **Sub-heading:** Hear directly from our valued clients and global partners.

Scrolling marquee of quotes: name, designation · company, photo, message — all from admin → Testimonials. **The entire section is hidden if no testimonials are published.**

## 1.11 Journal — STATIC

> **Source:** Layout → [`Home.jsx#L1267`](../client/src/pages/user/Home.jsx#L1267) · Copy → [`common.json#L297`](../client/src/locales/en/common.json#L297) (`home.journal.*`), post titles/dates at [`#L302`](../client/src/locales/en/common.json#L302)

| Category | Read time | Title | Date |
| --- | --- | --- | --- |
| Displays | 5 min read | Why interactive panels are replacing projectors in the meeting room | 12 May 2026 |
| Infrastructure | 7 min read | AV-over-IP in 2026: what integrators should standardise on | 28 Apr 2026 |
| Buying guide | 9 min read | Specifying an interactive whiteboard: a checklist for schools and offices | 10 Apr 2026 |

Section heading: **Notes from the *field*** · Button: `All articles`

> ⚠️ **Flag H6** — These three articles are **hardcoded placeholders**. They are not real blog posts, and all three cards link to the `/blogs` listing rather than to an article ([`Home.jsx#L1282`, `L1292`, `L1302`](../client/src/pages/user/Home.jsx#L1282)). They should either be written and published through the CMS, or this section wired to pull the three latest real posts.

## 1.12 Closing CTA — STATIC + REGION

> **Source:** Layout → [`Home.jsx#L1317`](../client/src/pages/user/Home.jsx#L1317) · Copy → [`common.json#L323`](../client/src/locales/en/common.json#L323) (`home.cta.*`) · Contact values → [`common.json#L974`](../client/src/locales/en/common.json#L974) (`contact_info.*`)

- **Label:** Contact
- **Heading:** Let's put the right / technology ***in the room.***
- **Buttons:** `Get a quote` (→ Contact) · `Become a partner` (→ Contact, pre-filled subject)

| Label | Value |
| --- | --- |
| India operations | +91 80 4525 6922 |
| Global enquiries | india@mindstec.com |
| Partnerships | partners@mindstec.com |

---

# 2. About Us — `/about`

> **Page source:** [`pages/user/About.jsx`](../client/src/pages/user/About.jsx) · **Copy block:** [`common.json#L38`](../client/src/locales/en/common.json#L38) (`about.*`)

## 2.1 Hero — STATIC

> **Source:** Layout → [`About.jsx#L283`](../client/src/pages/user/About.jsx#L283) · Copy → [`common.json#L39`](../client/src/locales/en/common.json#L39) (`about.hero.*`)

**Headline:**
> Passion.
> Purpose.
> ***Progress.***

- **Label:** About Us
- **Paragraph:**
  > Mindstec Distribution is a leading procurement and distribution specialist for high-end audio-visual solutions across the Middle East, Africa and Asia — bringing cutting-edge AV technology to these regions at accessible prices.
- **Button:** `Meet the team`

## 2.2 Hero facts — REGION

> **Source:** Layout → [`About.jsx#L302`](../client/src/pages/user/About.jsx#L302) · Copy → [`common.json#L114`](../client/src/locales/en/common.json#L114) (`about.hero_facts.*`)

| Region | Fact 1 | Fact 2 | Fact 3 |
| --- | --- | --- | --- |
| **Default / Global** | Middle East · Africa · Asia — *Regions served* | Global partner network — *Manufacturers to dealers* | Bangalore HQ — *India — SAARC operations* |
| **India** | India · SAARC — *Regions served* | Global partner network | Bangalore HQ — *India — SAARC operations* |
| **Middle East** | Middle East — *Region served* | Global partner network | Dubai hub — *Middle East operations* |
| **Africa** | Africa — *Region served* | Global partner network | Nairobi hub — *Africa operations* |
| **South Asia** | South Asia — *Region served* | Global partner network | Bangalore HQ — *SAARC operations* |
| **Hong Kong / China** | Hong Kong · China — *Region served* | Global partner network | Hong Kong hub — *Asia-Pacific operations* |

## 2.3 Our story — STATIC

> **Source:** Layout → [`About.jsx#L315`](../client/src/pages/user/About.jsx#L315) · Copy → [`common.json#L48`](../client/src/locales/en/common.json#L48) (`about.story.*`)

Animated lead paragraphs:
> We bridge the gap between global AV manufacturers and regional dealers — optimising supply chains, reducing costs and improving the efficiency of every operation in between.
>
> With deep market knowledge and a tech-savvy team, we help the world's AV brands expand into new markets, and we support our dealers with sales, marketing and promotion — fostering growth without competition.

Supporting paragraphs:
> Committed to innovation and customer support, we continuously invest in technical expertise, ensuring seamless integration of AV solutions in high-profile projects worldwide.
>
> Driven by excellence and innovation, we empower businesses to stay at the forefront of the evolving AV industry.

## 2.4 Three pillars — STATIC

> **Source:** Layout → [`About.jsx#L337`](../client/src/pages/user/About.jsx#L337) · Copy → [`common.json#L56`](../client/src/locales/en/common.json#L56) (`about.pillars.*`)

Heading: **Built on three *pillars.***

| # | Title | Body |
| --- | --- | --- |
| 01 | Market access for manufacturers | We help global AV manufacturers expand into the Middle East, Africa and Asia — with local knowledge, an established dealer network and in-region logistics. |
| 02 | Optimised supply chains | Procurement, warehousing and distribution tuned for the region — reducing costs, shortening lead times and improving the efficiency of every project. |
| 03 | Dealer enablement | Sales, marketing and promotional support for our dealers, plus the technical expertise to integrate AV solutions in high-profile projects — growth without competition. |

## 2.5 Vision & Mission — STATIC

> **Source:** Layout → [`About.jsx#L364`](../client/src/pages/user/About.jsx#L364) · Copy → [`common.json#L67`](../client/src/locales/en/common.json#L67) (`about.vm.*`)

**01 — Our *Vision***
> To be a distribution leader in futuristic, convergent, technology-driven system solutions.

**02 — Our *Mission***
> To be a regional leader in cutting-edge audio-visual system solution distribution — creating immense value for our supplier-dealer networks while being first and fastest in bringing the latest technology to the region.

## 2.6 Our team — STATIC heading / CMS members

> **Source:** Layout → [`About.jsx#L380`](../client/src/pages/user/About.jsx#L380) · Heading copy → [`common.json#L75`](../client/src/locales/en/common.json#L75) (`about.team.*`) · Data → [`api/teamApi.js`](../client/src/api/teamApi.js) (admin → Team)

- **Label:** Our team
- **Heading:** Making an impact, ***one step at a time***
- **Lede:** Industry experts, innovators and problem-solvers — collaborating to deliver top-tier AV solutions and seamless experiences for our partners.
- **Empty state:** *No team members listed for this region yet.*

Photos, names and roles are **entirely CMS-driven** — whatever is entered in admin → Team is what appears.

**Separately**, a roster of 8 names and titles sits in the translation file at [`common.json#L80-L102`](../client/src/locales/en/common.json#L80) (`about.team.names` / `about.team.roles`):

| Name | Role |
| --- | --- |
| Syed Abdul Wahab | Founder & Chairman |
| Sabarishan N. | Managing Director — India & SAARC |
| Manasa Iyer | Director of Finance |
| Karthikeyan Sekar | Head of Sales — South |
| Sneha Shenoy | HR Manager |
| Karthikeyan Selvaraj | Country Head — India |
| Flavia Robert | Finance Manager |
| Sajid Ali Kazi | Sales Manager |

> ⚠️ **Flag A1** — These keys are **never read by any component** — they are leftovers from before the team section became CMS-driven, and appear nowhere on the site. They are duplicated across all five language files. Confirm the roster is correct in admin → Team (that is what visitors see), and approve deleting these dead keys. See [Appendix D](#appendix-d--copy-written-but-never-displayed).

## 2.7 Closing CTA — STATIC + REGION

> **Source:** Layout → [`About.jsx#L410`](../client/src/pages/user/About.jsx#L410) · Copy → [`common.json#L103`](../client/src/locales/en/common.json#L103) (`about.cta.*`)

- **Label:** Become a reseller
- **Heading:** Start selling. / ***Start growing.***
- **Buttons:** `Become a reseller` · `Contact us`
- **Contacts:** phone + email, pulled from the CMS for the selected region.

---

# 3. Solutions — `/solutions`

> **Page source:** [`pages/user/Solutions.jsx`](../client/src/pages/user/Solutions.jsx) · **Copy block:** [`common.json#L677`](../client/src/locales/en/common.json#L677) (`solutions.*`)

## 3.1 Hero — STATIC

> **Source:** Layout → [`Solutions.jsx#L151`](../client/src/pages/user/Solutions.jsx#L151) · Copy → [`common.json#L838`](../client/src/locales/en/common.json#L838) (`solutions.hero.*`)

**Headline:** Every vertical. / ***One partner.***

- **Label:** Solutions
- **Paragraph:**
  > From a single meeting room to a national command centre — six AV verticals, one price list, and product specialists behind every category we distribute.

**Three facts** — [`Solutions.jsx#L163`](../client/src/pages/user/Solutions.jsx#L163) · copy at [`common.json#L844`](../client/src/locales/en/common.json#L844):

| Bold | Sub-label |
| --- | --- |
| 6 verticals | Complete AV coverage |
| 25 brands | Curated portfolio |
| 1,000+ installs | Supplied & supported |

## 3.2 The six verticals — CMS (static fallback shown)

> **Source:** Layout → [`Solutions.jsx#L169`](../client/src/pages/user/Solutions.jsx#L169) · Component → [`SolutionGrid.jsx`](../client/src/components/common/SolutionGrid/SolutionGrid.jsx) · Copy → [`common.json#L852`](../client/src/locales/en/common.json#L852) (`solutions.arr[]`) · Data → `GET /admin/solutions/` ([`Solutions.jsx#L31`](../client/src/pages/user/Solutions.jsx#L31)) · Slugs & fallback → [`constants/solutions.js#L8`](../client/src/constants/solutions.js#L8)

| Vertical | Category strip | Description | Tags |
| --- | --- | --- | --- |
| **Digital Signage** | Retail · Transport · Public space | LED walls, professional display panels and wayfinding that turn retail floors, terminals and public spaces into media surfaces — with the software to run them. | Indoor & outdoor LED · Display panels · Wayfinding · CMS & scheduling |
| **Control Rooms** | Command · Surveillance · NOC | 24/7-rated video walls, processors and operator workflows for command centres, surveillance suites and network operations — engineered for zero downtime. | Video wall processors · 24/7 displays · KVM · Source management |
| **Conferencing & Collaboration** | Workplace · Education · Hybrid | Hybrid meeting rooms that sound as good as they look — interactive displays, cameras, ceiling audio and the AV-over-IP backbone connecting them. | Interactive displays · PTZ cameras · Ceiling audio · Room booking |
| **Hospitality AV** | Hotels · Restaurants · Venues | Guest-room entertainment, ballroom systems and background audio for hotels, restaurants and venues — technology that stays invisible until it matters. | Guest-room IPTV · Ballroom AV · Background audio · Hospitality tablets |
| **Broadcast & Production** | Studios · Streaming · Creators | Cameras, switching, live graphics and streaming infrastructure for broadcasters, studios and creators — from single-operator setups to full facilities. | Studio cameras · Vision mixing · Live graphics · Streaming |
| **Live Events & Immersive** | Concerts · Exhibitions · XR | Touring-grade LED, projection mapping and spatial audio for concerts, exhibitions and experiential spaces — built to survive the road. | Touring LED · Projection mapping · Spatial audio · Show control |

Each card carries an `Explore` link to its detail page.

## 3.3 Closing CTA — STATIC + REGION

> **Source:** Layout → [`Solutions.jsx#L180`](../client/src/pages/user/Solutions.jsx#L180) · Copy → **inline fallbacks in the JSX** ([`Solutions.jsx#L186-199`](../client/src/pages/user/Solutions.jsx#L186)) — the `solutions.cta.*` keys are *not* present in the translation file, so this CTA shows English in every language.

- **Label:** Start a project
- **Heading:** Tell us what the / space needs ***to do.***
- **Buttons:** `Get a quote` · `See our brands`
- **Contacts:** phone + email for the selected region.

> ⚠️ **Flag SO1** — This CTA's five strings have no entries in any language file. French, Arabic, German and Chinese visitors see English here. Add `solutions.cta.*` keys to all five locale files.

---

# 4. Solution Detail pages — `/solutions/:slug`

> **Page source:** [`pages/user/SolutionDetails.jsx`](../client/src/pages/user/SolutionDetails.jsx) · **Content model:** [`constants/solutionDetails.js`](../client/src/constants/solutionDetails.js) · **Translation overrides:** [`common.json#L686`](../client/src/locales/en/common.json#L686) (`solutions.details.<slug>.*`)

Six pages, all built to the same eleven-section template. Sections 5 (metrics) and 8 (process) are **identical on all six pages**; everything else is per-vertical.

> **How copy resolves here:** the English default lives in [`solutionDetails.js`](../client/src/constants/solutionDetails.js); the translation file can override any string per language ([resolution logic at `SolutionDetails.jsx#L90`](../client/src/pages/user/SolutionDetails.jsx#L90)). Image paths and alt text stay out of translation — same photo in every language.

## Shared template structure

| § | Section | Layout source |
| --- | --- | --- |
| 1 | Hero — title, intro, three stats, four trust points | [`L427`](../client/src/pages/user/SolutionDetails.jsx#L427) |
| 2 | What we deliver — four capabilities | [`L495`](../client/src/pages/user/SolutionDetails.jsx#L495) |
| 3 | In the field — showcase with three readouts | [`L529`](../client/src/pages/user/SolutionDetails.jsx#L529) |
| 4 | Signal flow — six-stage diagram | [`L551`](../client/src/pages/user/SolutionDetails.jsx#L551) |
| 5 | **By the numbers** — shared metrics band | [`L582`](../client/src/pages/user/SolutionDetails.jsx#L582) |
| 6 | Featured installations — two case studies | [`L619`](../client/src/pages/user/SolutionDetails.jsx#L619) |
| 7 | Industries — six sectors | [`L665`](../client/src/pages/user/SolutionDetails.jsx#L665) |
| 8 | **How a project gets built** — shared five-step process | [`L691`](../client/src/pages/user/SolutionDetails.jsx#L691) |
| 9 | Brands for this vertical *(conditional)* | [`L724`](../client/src/pages/user/SolutionDetails.jsx#L724) |
| 10 | Closing CTA | [`L761`](../client/src/pages/user/SolutionDetails.jsx#L761) |
| 11 | Related solutions — three onward links | [`L801`](../client/src/pages/user/SolutionDetails.jsx#L801) |

### Shared: trust points (under every hero)

> **Source:** [`solutionDetails.js#L69`](../client/src/constants/solutionDetails.js#L69) (`SHARED_TRUST`)

Vertical-specific first item, then: *Enterprise integration* · *Distributed across the GCC* · *24/7 support escalation*

### Shared: "By the numbers" band

> **Source:** [`solutionDetails.js#L61`](../client/src/constants/solutionDetails.js#L61) (`COMPANY_METRICS`)

| Value | Label | Description |
| --- | --- | --- |
| 450+ | Projects delivered | Across retail, transport, government and enterprise. |
| 99.99% | System reliability | Measured on mission-critical installations under contract. |
| 20+ | Global brands | Distributed under formal regional agreements. |
| 24/7 | Monitoring support | Escalation paths that stay open outside business hours. |

> 🚨 **Flag S1 — HIGHEST PRIORITY.** These four figures are **placeholder numbers taken from the design mockup**. Nobody has measured them. Published on a distributor's site they read as contractual claims — particularly "99.99% system reliability". The code itself carries a warning about this at [`solutionDetails.js#L9-27`](../client/src/constants/solutionDetails.js#L9). They must be replaced with verified figures or the band removed before launch. Note also "20+ Global brands" contradicts the 25 / 49+ / 50+ figures used elsewhere.

### Shared: "How a project gets built"

> **Source:** [`solutionDetails.js#L48`](../client/src/constants/solutionDetails.js#L48) (`PROCESS_STEPS`)

| # | Stage | Description |
| --- | --- | --- |
| 01 | Discover | Site survey, sightlines, ambient light and the operational reality the system has to survive. |
| 02 | Design | Architecture, signal chain and redundancy modelled before a single part number is quoted. |
| 03 | Specify | A bill of materials with mounts, spares and cable schedules — not just the headline hardware. |
| 04 | Deploy | Staged, configured and commissioned with the integrator, then signed off against the design. |
| 05 | Support | Stock-held spares, RMA handling and vendor escalation for the life of the installation. |

### Shared: section side notes

> **Source:** inline fallbacks in the JSX at [`L561`](../client/src/pages/user/SolutionDetails.jsx#L561), [`L629`](../client/src/pages/user/SolutionDetails.jsx#L629), [`L675`](../client/src/pages/user/SolutionDetails.jsx#L675), [`L701`](../client/src/pages/user/SolutionDetails.jsx#L701)

- **Signal flow:** Every stage we specify, in the order the signal meets it — because the weakest link decides what the room is actually capable of.
- **Installations:** Representative deployments for this vertical — the constraint, the architecture that answered it, and what went in the rack.
- **Industries:** The sectors this vertical is specified for most often across the region.
- **Process:** The same five stages on a single meeting room and on a command centre — the depth changes, the sequence does not.

> 🚨 **Flag S2 — HIGH PRIORITY.** The twelve "Featured installations" across these six pages are **not real projects**. Each deliberately describes a facility *type* ("Regional transport interchange", "Flagship retail environment") rather than a named client, so that no work is falsely attributed to a third party — see the note at [`solutionDetails.js#L19-23`](../client/src/constants/solutionDetails.js#L19). They read as case studies. Please supply real, client-cleared case studies to swap in — the layout is ready — or confirm you are happy publishing generic examples.

### Section 9 — Brands for this vertical (conditional)

> **Source:** Layout → [`SolutionDetails.jsx#L724`](../client/src/pages/user/SolutionDetails.jsx#L724) · Data → `getPublicRegionSolutionBrands` in [`api/regionApi.js`](../client/src/api/regionApi.js)

The whole section — heading included — only renders when the selected region has brands assigned to this vertical in admin → Regions → Solution Brands. When a region has none, nothing is shown rather than an empty state.

The **Associated brands** listed per vertical below are the defaults recorded in [`solutionDetails.js`](../client/src/constants/solutionDetails.js) (the `brands` field); the region rules are what actually appear.

---

## 4.1 Digital Signage — `/solutions/digital-signage`

> **Source:** [`solutionDetails.js#L72`](../client/src/constants/solutionDetails.js#L72) · Translation overrides → [`common.json#L687`](../client/src/locales/en/common.json#L687)

**Title:** Digital ***Signage*** · **Kicker:** Media surfaces at scale

**Intro:** LED walls, professional display panels and wayfinding that turn retail floors, terminals and public spaces into media surfaces — with the software to run them.

**Hero stats:** P0.9–P10 *(Pixel pitch range)* · IP65 *(Outdoor rated)* · 24/7 *(Duty cycle)*
**First trust point:** Fine-pitch LED specialists
**Capabilities side note:** From a single menu board to a stadium facade — hardware, software and mounting from one price list.

**What we deliver**

| Capability | Description |
| --- | --- |
| Indoor & outdoor LED | Fine-pitch indoor walls to high-brightness outdoor facades, with the receiving cards, spares and service to keep them lit. |
| Professional display panels | Commercial-grade panels rated for continuous operation — portrait, landscape, high-brightness and touch. |
| Wayfinding & kiosks | Interactive totems and self-service kiosks for malls, airports, hospitals and campuses. |
| CMS & scheduling | Content management, day-parting and remote monitoring for networks of one screen or one thousand. |

**In the field** — *One network. **Thousands** of screens.*
> A signage estate is not a screen — it is a fleet. Day-parted content, per-site overrides and a health check on every player, so a dark panel in a terminal is a ticket before it is a complaint.

Readouts: 1 → 10k *(Screens per network)* · Day-part *(Scheduling granularity)* · Proof *(Of play reporting)*

**Signal flow:** Content → CMS → Distribution → Display → Monitoring → Reporting

**Featured installations:**

| Project | Industry | Challenge | Solution | Products |
| --- | --- | --- | --- | --- |
| Regional transport interchange | Transportation | Passenger information across three concourses on a mix of legacy panels, with no single view of what was actually on screen at any moment. | A unified CMS over high-brightness commercial panels and a fine-pitch LED feature wall, with player health surfaced on one dashboard. | Fine-pitch LED · High-brightness panels · CMS & scheduling · Mounting systems |
| Flagship retail environment | Retail | A storefront facade readable in direct sun, paired with interior screens that had to stay colour-matched to the brand palette. | Outdoor-rated LED at the facade, calibrated indoor panels through the store, and one scheduling layer driving both. | Outdoor LED · Professional panels · Wayfinding kiosks · Content management |

**Industries:** Retail & malls · Transportation · Airports · Hospitality · Education · Healthcare

**CTA:** *Planning a **signage network**?*
> Send us the site count, the screen types and whether they are going indoors or into direct sun. You get back a hardware schedule, a CMS recommendation and pricing — not a brochure.

Buttons: `Scope my network` · `See signage brands`
**Associated brands:** Christie, Datapath, Polywall, B-Tech, MTC, Kordz

---

## 4.2 Control Rooms — `/solutions/control-rooms`

> **Source:** [`solutionDetails.js#L161`](../client/src/constants/solutionDetails.js#L161) · Translation overrides → [`common.json#L712`](../client/src/locales/en/common.json#L712)

**Title:** Control ***Rooms*** · **Kicker:** Mission-critical visualization

**Intro:** 24/7-rated video walls, processors and operator workflows for command centres, surveillance suites and network operations — engineered for zero downtime.

**Hero stats:** 24/7 *(Continuous duty)* · 4K60 *(Per-input capture)* · N+1 *(Redundant power)*
**First trust point:** Video wall specialists
**Capabilities side note:** Mission-critical means no single point of failure — we spec redundancy from source to screen.

**What we deliver**

| Capability | Description |
| --- | --- |
| Video wall processors | Hardware and software processing that puts any source on any display, at any size, without dropped frames. |
| 24/7 mission-critical displays | Panels and LED rated for round-the-clock duty cycles, with redundant power and burn-in management. |
| KVM & operator desks | Low-latency KVM so operators control every system from one seat, plus console furniture and ergonomics. |
| Source & layout management | Preset layouts, alarm-triggered views and multi-operator workflows for the moments that matter. |

**In the field** — *Mission-critical **visualization***
> An operator watching a wall is watching thousands of data points at once — camera feeds, SCADA, network health, incident queues. The room's job is to make the one that matters impossible to miss, and to keep showing it when a source, a card or a panel fails.

Readouts: Any → any *(Source to window)* · Alarm *(Triggered layouts)* · Hot-swap *(Field-serviceable)*

**Signal flow:** Sources → Processing → Routing → Video wall → Operator → Analytics

**Featured installations:**

| Project | Industry | Challenge | Solution | Products |
| --- | --- | --- | --- | --- |
| Utility network operations centre | Utilities | A grid-monitoring floor where the wall had to survive a source failure mid-incident without operators losing the layout they were working in. | Redundant processing with hot-swap input cards, 24/7-rated panels and alarm-triggered presets that recall a full incident view in one action. | Video wall processors · 24/7 panels · KVM · Operator consoles |
| City-wide surveillance suite | Public safety | Hundreds of camera streams, a small operator team, and a requirement that any feed reach any seat without a video engineer in the loop. | A software wall over a shared source pool, with per-operator KVM and saved layouts mapped to incident types. | Software video wall · Low-latency KVM · Layout management · Console furniture |

**Industries:** Command centres · Surveillance · Utilities · Oil & gas · Transportation · Government

**CTA:** *Specifying a **control room**?*
> Send the sightlines, the source list and the duty cycle. We model the processing, the redundancy and the operator positions before anyone quotes a panel.

Buttons: `Request a design review` · `See control room brands`
**Associated brands:** Datapath, Polywall, Christie, NETGEAR AV, Blustream

---

## 4.3 Conferencing & Collaboration — `/solutions/conferencing`

> **Source:** [`solutionDetails.js#L250`](../client/src/constants/solutionDetails.js#L250) · Translation overrides → [`common.json#L737`](../client/src/locales/en/common.json#L737)

**Title:** Conferencing & ***Collaboration*** · **Kicker:** Rooms that just work

**Intro:** Hybrid meeting rooms that sound as good as they look — interactive displays, cameras, ceiling audio and the AV-over-IP backbone connecting them.

**Hero stats:** AV/IP *(1Gb transport)* · 4K60 *(End to end)* · Sub-frame *(Switching latency)*
**First trust point:** Hybrid room specialists
**Capabilities side note:** Rooms people actually want to book — from huddle spaces to boardrooms and lecture theatres.

**What we deliver**

| Capability | Description |
| --- | --- |
| Interactive displays | Touch collaboration displays for ideation, annotation and wireless presentation in any room size. |
| Cameras & tracking | PTZ, ePTZ and auto-framing cameras that keep every participant in the shot, in any layout. |
| Ceiling & beamforming audio | Microphones and speakers that disappear into the ceiling and still pick up the quietest voice. |
| Booking & room intelligence | Scheduling panels, occupancy analytics and wayfinding that make the whole floor work harder. |

**In the field** — *Every seat is the **best** seat*
> Hybrid fails on the far end, not in the room. Auto-framing that follows the speaker, ceiling arrays that reject the air handling, and a signal path short enough that nobody talks over anybody — that is the whole brief.

Readouts: Auto-frame *(Speaker tracking)* · Beamforming *(Ceiling pickup)* · One-touch *(Meeting join)*

**Signal flow:** Room devices → Encode → Transport → Display & audio → Participants → Room analytics

**Featured installations:**

| Project | Industry | Challenge | Solution | Products |
| --- | --- | --- | --- | --- |
| Corporate headquarters floor | Enterprise | Forty rooms of five different sizes, each previously specified by a different contractor, with no consistent way to start a meeting. | A single room standard scaled across huddle, medium and boardroom tiers over shared AV-over-IP, with one join experience in every space. | Interactive displays · Auto-framing cameras · Ceiling audio · Scheduling panels |
| University lecture theatre | Education | Lecture capture for a raked theatre where the presenter moves constantly and student questions come from anywhere in the room. | Tracking cameras with presenter and audience presets, distributed ceiling microphones, and capture feeding the existing VLE. | PTZ cameras · Beamforming microphones · Large-format displays · AV-over-IP |

**Industries:** Corporate · Education · Government · Healthcare · Defence · Energy

**CTA:** *Standardising your **meeting rooms**?*
> Tell us the room count and the tiers. We spec one repeatable standard across huddle, medium and boardroom, so the join experience is identical in every space on the floor.

Buttons: `Get a room standard` · `See collaboration brands`
**Associated brands:** Avocor, T1V, GoGet, iPort, SCT, Telycam

---

## 4.4 Hospitality AV — `/solutions/hospitality`

> **Source:** [`solutionDetails.js#L339`](../client/src/constants/solutionDetails.js#L339) · Translation overrides → [`common.json#L762`](../client/src/locales/en/common.json#L762)

**Title:** Hospitality ***AV*** · **Kicker:** Invisible until it matters

**Intro:** Guest-room entertainment, ballroom systems and background audio for hotels, restaurants and venues — technology that stays invisible until it matters.

**Hero stats:** IPTV *(Headend to room)* · Zoned *(Background audio)* · Divisible *(Ballroom systems)*
**First trust point:** Property-wide AV specialists
**Capabilities side note:** The best hospitality AV is the kind guests never notice — until the lights dim and the show starts.

**What we deliver**

| Capability | Description |
| --- | --- |
| Guest-room entertainment | IPTV headends, casting and in-room control that feel like home — branded for the property. |
| Ballroom & event spaces | Divisible-room audio, projection and LED for conferences, weddings and everything between. |
| Background music & paging | Zoned audio that follows the mood from breakfast to last orders, with paging built in. |
| Interactive hospitality tablets | Smart tables and in-room tablets for ordering, concierge and guest services. |

**In the field** — *From check-in to **last orders***
> One property is a dozen different rooms with a dozen different jobs — a lobby that sets a tone, a ballroom that reconfigures twice a day, a guest room that has to feel like home on the first try. The infrastructure underneath is one system.

Readouts: Per-zone *(Audio scheduling)* · Branded *(Guest interface)* · Single pane *(Property control)*

**Signal flow:** Headend → Middleware → Distribution → Rooms & zones → Guest → Property view

**Featured installations:**

| Project | Industry | Challenge | Solution | Products |
| --- | --- | --- | --- | --- |
| Resort property refurbishment | Hospitality | Guest-room entertainment on end-of-life hardware, and background audio zones that had drifted so far apart that walking the property was jarring. | An IPTV headend with branded guest UI to every room, re-zoned background audio with scheduled day-parts, and paging overlaid on the same system. | IPTV headend · In-room displays · Zoned audio · Paging |
| Hotel ballroom and conference wing | Events | A divisible ballroom turned over between a morning conference and an evening banquet, with in-house staff running it rather than an AV crew. | Partition-aware audio that follows the room configuration automatically, plus projection and LED presets recalled from a single panel. | Divisible-room DSP · Projection · LED · Control panels |

**Industries:** Hotels & resorts · Restaurants & bars · Retail & leisure · Event venues · Senior living · Serviced offices

**CTA:** *Fitting out a **property**?*
> Guest rooms, ballrooms, lobby and back of house. Send the floor plan and we will zone the audio, size the headend and brand the guest interface around it.

Buttons: `Plan the property` · `See hospitality brands`
**Associated brands:** Humelab, Amino, Sonance, Lemco, iPort

---

## 4.5 Broadcast & Production — `/solutions/broadcast`

> **Source:** [`solutionDetails.js#L428`](../client/src/constants/solutionDetails.js#L428) · Translation overrides → [`common.json#L787`](../client/src/locales/en/common.json#L787)

**Title:** Broadcast & ***Production*** · **Kicker:** Signal discipline, any scale

**Intro:** Cameras, switching, live graphics and streaming infrastructure for broadcasters, studios and creators — from single-operator setups to full facilities.

**Hero stats:** 12G *(SDI infrastructure)* · ST 2110 *(IP production)* · HDR *(Capable chain)*
**First trust point:** Live production specialists
**Capabilities side note:** From a one-person streaming desk to a national newsroom — the same signal discipline applies.

**What we deliver**

| Capability | Description |
| --- | --- |
| Studio & PTZ cameras | Broadcast-grade imaging from fixed studio chains to remotely operated PTZ fleets. |
| Vision mixing & switching | Production switchers and routing for live programmes, sport and events. |
| Live graphics & virtual sets | Real-time graphics, augmented reality and virtual studio tools used by the world's broadcasters. |
| Streaming & delivery | Encoders, IPTV and OTT delivery that get the programme to every screen, reliably. |

**In the field** — *Live has no **second take***
> Every stage between the lens and the viewer is a place a live programme can fail. Reference, timing, redundancy on the encode, a return path an operator can actually read under pressure — the gear list is the easy part.

Readouts: Genlocked *(Reference chain)* · Redundant *(Encode path)* · Real-time *(Graphics and AR)*

**Signal flow:** Acquisition → Vision mixing → Graphics → Encode → Delivery → Audience

**Featured installations:**

| Project | Industry | Challenge | Solution | Products |
| --- | --- | --- | --- | --- |
| Regional newsroom studio | Broadcast | A daily bulletin produced by a crew of three, needing the on-air look of a facility several times the size. | Robotic PTZ chain with shot presets, a compact switcher driving real-time graphics, and a virtual set extending the physical one. | PTZ cameras · Production switcher · Real-time graphics · Virtual set |
| Corporate streaming facility | Enterprise | Town halls and investor briefings streamed to a global audience, where a dropped encode is a reputational problem rather than an inconvenience. | A fully redundant encode and delivery path with automatic failover, monitored end to end from a single position. | Encoders · OTT delivery · Switching · Monitoring |

**Industries:** Broadcasters · Sport & venues · Education · Government · Corporate studios · Houses of worship

**CTA:** *Building a **studio** or a stream?*
> From a single-operator desk to a full facility. Tell us the format, the output and where it has to land, and we build the signal chain backwards from there.

Buttons: `Spec the chain` · `See broadcast brands`
**Associated brands:** Vizrt, SalrayWorks, Telycam, Amino, RDL

---

## 4.6 Live Events & Immersive — `/solutions/live-events`

> **Source:** [`solutionDetails.js#L517`](../client/src/constants/solutionDetails.js#L517) · Translation overrides → [`common.json#L812`](../client/src/locales/en/common.json#L812)

**Title:** Live Events & ***Immersive*** · **Kicker:** Built to survive the road

**Intro:** Touring-grade LED, projection mapping and spatial audio for concerts, exhibitions and experiential spaces — built to survive the road.

**Hero stats:** IP65 *(Touring rated)* · Fast-lock *(Frame system)* · Timecode *(Show sync)*
**First trust point:** Touring-grade specialists
**Capabilities side note:** Rigged, run and struck in hours — event technology has no second chances, so we spec accordingly.

**What we deliver**

| Capability | Description |
| --- | --- |
| Touring & rental LED | Fast-lock touring frames, curved arrays and floor systems built for load-in after load-in. |
| Projection mapping | High-output projection and warping tools for architecture, stages and art installations. |
| Spatial & concert audio | Point-source and immersive audio systems that scale from galleries to arenas. |
| Show control | Timecode, triggering and media servers keeping lights, video and sound on the same beat. |

**In the field** — *Load in. Show. **Strike.***
> Event kit lives a harder life than anything else we distribute — trucked, rigged in the dark, run once and struck the same night. Fast-lock frames, spares in the case and a show file that survives a panel swap are not luxuries.

Readouts: Hours *(Load-in to show)* · Curved *(Array capable)* · Hot-swap *(Panel spares)*

**Signal flow:** Show file → Media servers → Distribution → LED & projection → Show control → Post-show

**Featured installations:**

| Project | Industry | Challenge | Solution | Products |
| --- | --- | --- | --- | --- |
| Arena touring production | Live music | A curved upstage wall rebuilt in a different venue every night, by a crew working against a fixed load-in window. | Fast-lock touring frames with curve-capable hardware, panel-level spares in the case, and a show file that recovers from a mid-run swap. | Touring LED · Media servers · Show control · Spares programme |
| Immersive exhibition space | Experiential | A gallery running a mapped, multi-surface piece on a loop all day, with no technician on site once it opened. | High-output projection with warping and blending held in the server, spatial audio locked to timecode, and unattended daily start-up. | Projection · Warping & blending · Spatial audio · Show control |

**Industries:** Concert venues · Stadiums & arenas · Brand experience · Museums & galleries · Civic events · Hospitality events

**CTA:** *Speccing for **the road**?*
> Load-in windows, curve requirements, spares levels, crew size. Tell us the tour or the install and we build a kit list that survives it — including what goes in the spares case.

Buttons: `Build a kit list` · `See event brands`
**Associated brands:** Christie, Magnum, Sonance, Kordz, Wavex

---

# 5. Partners — `/partners`

> **Page source:** [`pages/user/Partners.jsx`](../client/src/pages/user/Partners.jsx) · **Copy block:** [`common.json#L338`](../client/src/locales/en/common.json#L338) (`partners.*`)

## 5.1 Hero — STATIC

> **Source:** Layout → [`Partners.jsx#L188`](../client/src/pages/user/Partners.jsx#L188) · Copy → [`common.json#L339`](../client/src/locales/en/common.json#L339) (`partners.hero.*`), facts at [`#L345`](../client/src/locales/en/common.json#L345)

**Headline:** World-class brands. / ***One distributor.***

- **Label:** Our Partners
- **Paragraph:**
  > Twenty-five manufacturers, one price list. We represent the world's leading AV brands across displays, audio, broadcast, collaboration and connectivity — so our dealers can specify an entire project from a single partner.

| Bold | Sub-label |
| --- | --- |
| 25 brands | Represented portfolio |
| 5 categories | Every AV vertical covered |
| 3 regions | Middle East · Africa · Asia |

## 5.2 Category filters — STATIC

> **Source:** Layout → [`Partners.jsx#L206`](../client/src/pages/user/Partners.jsx#L206) · Codes → [`Partners.jsx#L41`](../client/src/pages/user/Partners.jsx#L41) · Labels → [`common.json#L353`](../client/src/locales/en/common.json#L353) (`partners.categories.*`)

All (25) · Displays & Video Walls · Audio · Broadcast & Media · Collaboration & Control · Connectivity & Infrastructure

## 5.3 Brand portfolio — STATIC (25 brands)

> **Source:** Layout → [`Partners.jsx#L220`](../client/src/pages/user/Partners.jsx#L220) · Brand list (names, categories, logo paths) → **hardcoded** at [`Partners.jsx#L13`](../client/src/pages/user/Partners.jsx#L13) · Descriptions → [`common.json#L361`](../client/src/locales/en/common.json#L361) (`partners.brands.b1`–`b25`)

The portfolio is **global** — the same 25 brands show in every region ([note at `Partners.jsx#L11`](../client/src/pages/user/Partners.jsx#L11)).

| # | Brand | Category | Description | Source line |
| --- | --- | --- | --- | --- |
| 01 | Avocor | Displays & Video Walls | Interactive displays | [L14](../client/src/pages/user/Partners.jsx#L14) |
| 02 | Christie | Displays & Video Walls | Projection | [L15](../client/src/pages/user/Partners.jsx#L15) |
| 03 | Datapath | Displays & Video Walls | Video wall control | [L16](../client/src/pages/user/Partners.jsx#L16) |
| 04 | Polywall | Displays & Video Walls | Videowall software | [L17](../client/src/pages/user/Partners.jsx#L17) |
| 05 | Magnum | Displays & Video Walls | Projection screens | [L18](../client/src/pages/user/Partners.jsx#L18) |
| 06 | Sonance | Audio | Architectural audio | [L19](../client/src/pages/user/Partners.jsx#L19) |
| 07 | RDL | Audio | Pro audio interfaces | [L20](../client/src/pages/user/Partners.jsx#L20) |
| 08 | Amino | Broadcast & Media | IPTV & streaming | [L21](../client/src/pages/user/Partners.jsx#L21) |
| 09 | SalrayWorks | Broadcast & Media | Broadcast cameras | [L22](../client/src/pages/user/Partners.jsx#L22) |
| 10 | Telycam | Broadcast & Media | PTZ cameras | [L23](../client/src/pages/user/Partners.jsx#L23) |
| 11 | Humelab | Collaboration & Control | Hospitality tech | [L24](../client/src/pages/user/Partners.jsx#L24) |
| 12 | Vizrt | Broadcast & Media | Live production | [L25](../client/src/pages/user/Partners.jsx#L25) |
| 13 | Lemco | Broadcast & Media | RF & IPTV headend | [L26](../client/src/pages/user/Partners.jsx#L26) |
| 14 | T1V | Collaboration & Control | Visual collaboration | [L27](../client/src/pages/user/Partners.jsx#L27) |
| 15 | GoGet | Collaboration & Control | Workspace booking | [L28](../client/src/pages/user/Partners.jsx#L28) |
| 16 | iPort | Collaboration & Control | iPad enclosures | [L29](../client/src/pages/user/Partners.jsx#L29) |
| 17 | RTI | Collaboration & Control | Control & automation | [L30](../client/src/pages/user/Partners.jsx#L30) |
| 18 | SCT | Collaboration & Control | Camera interfaces | [L31](../client/src/pages/user/Partners.jsx#L31) |
| 19 | Blustream | Connectivity & Infrastructure | AV distribution | [L32](../client/src/pages/user/Partners.jsx#L32) |
| 20 | NETGEAR AV | Connectivity & Infrastructure | AV networking | [L33](../client/src/pages/user/Partners.jsx#L33) |
| 21 | Kordz | Connectivity & Infrastructure | Connectivity | [L34](../client/src/pages/user/Partners.jsx#L34) |
| 22 | B-Tech | Connectivity & Infrastructure | AV mounts | [L35](../client/src/pages/user/Partners.jsx#L35) |
| 23 | MTC | Connectivity & Infrastructure | Mounting solutions | [L36](../client/src/pages/user/Partners.jsx#L36) |
| 24 | Sapling | Connectivity & Infrastructure | Synchronised clocks | [L37](../client/src/pages/user/Partners.jsx#L37) |
| 25 | Wavex | Connectivity & Infrastructure | AV accessories | [L38](../client/src/pages/user/Partners.jsx#L38) |

> ⚠️ **Flag P1** — Brand #11 (Humelab, "Hospitality tech") is filed under *Collaboration & Control* at [`Partners.jsx#L24`](../client/src/pages/user/Partners.jsx#L24). Please confirm the intended category.

## 5.4 Why brands choose Mindstec — STATIC

> **Source:** Layout → [`Partners.jsx#L246`](../client/src/pages/user/Partners.jsx#L246) · Copy → [`common.json#L388`](../client/src/locales/en/common.json#L388) (`partners.why.*`)

| # | Title | Body |
| --- | --- | --- |
| 01 | One price list, every category | A curated portfolio that lets integrators specify an entire project — displays, audio, control, connectivity — from a single distribution partner. |
| 02 | Real market access | Established dealer networks across the Middle East, Africa and Asia, with in-region stock, local currency and logistics built for each market. |
| 03 | Growth without competition | We support dealers with sales, marketing and promotion — and we never compete with them. Product specialists back every brand we carry. |

## 5.5 Closing CTA — STATIC

> **Source:** Layout → [`Partners.jsx#L273`](../client/src/pages/user/Partners.jsx#L273) · Copy → [`common.json#L399`](../client/src/locales/en/common.json#L399) (`partners.cta.*`)

- **Label:** Partner with us
- **Heading:** Your brand, / ***our region.***
- **Buttons:** `Become a partner` · `Become a reseller`
- **Contacts:** Partnerships → partners@mindstec.com · India operations → +91 80 4525 6922

---

# 6. Experience Centre — `/experience`

> **Page source:** [`pages/user/Experience.jsx`](../client/src/pages/user/Experience.jsx) · **Copy block:** [`common.json#L560`](../client/src/locales/en/common.json#L560) (`experience.*`)

## 6.1 Hero — STATIC

> **Source:** Layout → [`Experience.jsx#L208`](../client/src/pages/user/Experience.jsx#L208) · Copy → [`common.json#L561`](../client/src/locales/en/common.json#L561) (`experience.hero.*`), facts at [`#L569`](../client/src/locales/en/common.json#L569)

- **Label:** Experience Centre — Bengaluru
- **Headline:** Don't imagine it. / ***Walk into it.***
- **Paragraph:**
  > A hands-on floor where technology meets functionality — live control rooms, collaboration suites, signage and broadcast, running side by side so you can judge them the way your clients will.
- **Buttons:** `Book a visit` · `Watch the film`

| Bold | Sub-label |
| --- | --- |
| 6 live zones | Running demos daily |
| 25 brands | On the floor |
| OMBR Layout | Bangalore, India |
| By appointment | Guided walkthroughs |

## 6.2 Overview — STATIC

> **Source:** Layout → [`Experience.jsx#L247`](../client/src/pages/user/Experience.jsx#L247) · Copy → [`common.json#L579`](../client/src/locales/en/common.json#L579) (`experience.ov.*`)

**Lede:** Spec sheets tell you what a system should do. The Experience Centre shows you what it *actually does* — live, integrated, and under real conditions.

> Our Bengaluru Experience Centre is a dynamic, hands-on environment designed to showcase the power of integrated AV. The floor runs live demonstrations of control room systems, collaborative meeting technologies, digital signage and more — real products from 25 global brands, wired together the way they'd be deployed on site.
>
> Visitors explore real-world applications, test system interoperability across brands, and work directly with our technical experts. Whether you're a consultant writing a spec, an integrator validating a design, or an enterprise client choosing a standard — this is the shortest path from shortlist to certainty.

## 6.3 The six zones — STATIC

> **Source:** Layout → [`Experience.jsx#L261`](../client/src/pages/user/Experience.jsx#L261) · Zone array (slugs + images) → [`Experience.jsx#L197`](../client/src/pages/user/Experience.jsx#L197) · Copy → [`common.json#L585`](../client/src/locales/en/common.json#L585) (`experience.zones.*`) and [`#L592`](../client/src/locales/en/common.json#L592) (`experience.zones_arr[]`)

**Heading:** Six zones. All ***live***.
**Sub-heading:** Every zone runs shipping product — no mock-ups, no renders. Walk from one vertical to the next and see how the pieces interoperate.

| Zone | Name | Description | Links to |
| --- | --- | --- | --- |
| 01 | Control Room Wall | A 24/7-rated video wall driven by live processors — switch sources, split layouts and stress-test the workflow your operators will actually use. | Control Rooms |
| 02 | Collaboration Suite | A fully wired hybrid meeting room — interactive display, PTZ cameras, ceiling audio and room booking, joined to a real call so you can hear the difference. | Conferencing |
| 03 | Signage Gallery | Indoor LED, professional panels and wayfinding running scheduled content from a live CMS — compare brightness, pitch and processing side by side. | Digital Signage |
| 04 | Broadcast Corner | Cameras, vision mixing and live graphics in a compact production setup — see a multi-camera stream go from lens to output in one take. | Broadcast |
| 05 | Audio & Hospitality Lounge | Invisible and architectural speakers, guest-room IPTV and background audio staged as a lounge — technology that disappears until you press play. | Hospitality |
| 06 | AV-over-IP Backbone | The rack room that ties the floor together — AV-over-IP switching, extension and control, so you can trace every signal path end to end. | Conferencing |

Each card carries: `Explore the vertical`

> ⚠️ **Flag X1** — Zone 06 links to the *Conferencing* page, the same destination as Zone 02 ([`Experience.jsx#L203`](../client/src/pages/user/Experience.jsx#L203)). Confirm whether this is intended.

## 6.4 The film — STATIC

> **Source:** Layout → [`Experience.jsx#L294`](../client/src/pages/user/Experience.jsx#L294) · Copy → [`common.json#L618`](../client/src/locales/en/common.json#L618) (`experience.film.*`) · Video URL → [`Experience.jsx#L310`](../client/src/pages/user/Experience.jsx#L310)

- **Label:** The film
- **Heading:** Step inside before ***you step inside.***
- **Video overlay tag:** Mindstec Experience Centre — Bengaluru
- **Caption:** Filmed on the floor of our Bengaluru centre. Streams on demand — press play.

> ⚠️ **Flag X2** — The video is served from the **old WordPress site** (`mindstec.com/wp-content/uploads/2025/05/Mindstec-Experience-Centre.mp4`, [`Experience.jsx#L310`](../client/src/pages/user/Experience.jsx#L310)). If that site is retired, the film breaks. The file should be moved onto the new site.

## 6.5 Who it's for — STATIC

> **Source:** Layout → [`Experience.jsx#L334`](../client/src/pages/user/Experience.jsx#L334) · Copy → [`common.json#L625`](../client/src/locales/en/common.json#L625) (`experience.who.*`)

**Heading:** Built for the people ***who decide.***

| # | Audience | Body |
| --- | --- | --- |
| 01 | Consultants | Validate a specification against live hardware before it goes to tender — compare brands in the same room, under the same light, on the same network. |
| 02 | System Integrators | Prove a design to your client without building a demo room of your own. Bring them in, walk the floor, and close on what they've already seen working. |
| 03 | Enterprise Clients | Choosing a standard for a hundred rooms? Sit in one first. Test the workflow, the audio and the ergonomics before you commit the budget. |

## 6.6 Plan your visit — STATIC + REGION

> **Source:** Layout → [`Experience.jsx#L361`](../client/src/pages/user/Experience.jsx#L361) · Copy → [`common.json#L644`](../client/src/locales/en/common.json#L644) (`experience.visit.*`) · Address/phone/email overridden by region CMS ([`Experience.jsx#L391-411`](../client/src/pages/user/Experience.jsx#L391))

- **Label:** Plan your visit
- **Heading:** See it running, ***in person.***
- **Paragraph:** Visits are guided and by appointment, so the floor is set up around what you're evaluating. Tell us what you want to see and we'll have it live when you arrive.
- **Buttons:** `Book a visit` · `Open in Google Maps`

| # | Item | Detail |
| --- | --- | --- |
| 01 | Where | No. 5M-645, Banaswadi Village, OMBR Layout, Bangalore 560043, India *(overridden by the CMS address for the selected region)* |
| 02 | Call ahead | *(region phone)* — Mon–Fri, business hours IST |
| 03 | Write to us | *(region email)* — Tell us which zones you want live |
| 04 | Format | Guided walkthrough, 60–90 minutes — With a product specialist for your vertical |

## 6.7 Closing CTA — STATIC + REGION

> **Source:** Layout → [`Experience.jsx#L426`](../client/src/pages/user/Experience.jsx#L426) · Copy → [`common.json#L670`](../client/src/locales/en/common.json#L670) (`experience.cta.*`)

- **Label:** Next step
- **Heading:** Start selling. / ***Start growing.***
- **Buttons:** `Book a visit` · `See all solutions`

---

# 7. E-Waste Management — `/ewaste`

> **Page source:** [`pages/user/EWaste.jsx`](../client/src/pages/user/EWaste.jsx) · **Copy block:** [`common.json#L411`](../client/src/locales/en/common.json#L411) (`ewaste.*`) · **Region gate:** [`RegionGuard.jsx`](../client/src/components/common/RegionGuard.jsx), wired at [`routes/index.jsx#L73`](../client/src/routes/index.jsx#L73)

> **Region-gated.** This page and its navigation links only appear for regions where it has been enabled in the admin panel (India-specific content).

## 7.1 Hero — STATIC

> **Source:** Layout → [`EWaste.jsx#L214`](../client/src/pages/user/EWaste.jsx#L214), facts at [`#L225`](../client/src/pages/user/EWaste.jsx#L225) · Copy → [`common.json#L412`](../client/src/locales/en/common.json#L412) (`ewaste.hero.*`) and [`#L418`](../client/src/locales/en/common.json#L418) (`ewaste.meta.*`)

- **Label:** E-Waste Management
- **Headline:** End of life. / ***Not end of story.***
- **Paragraph:**
  > Around 90% of electronic equipment is recyclable. Our authorized programme with Deshwal Waste Management takes back end-of-life electronics anywhere in India — at zero cost to you.

| Bold | Sub-label |
| --- | --- |
| 1800 102 9077 | Toll-free pickup line |
| 27 drop points | Across India |
| Deshwal WM | Authorized recycler |
| ₹0 | Cost to the consumer |

> ⚠️ **Flag E1** — "27 drop points" is hardcoded at [`common.json#L421`](../client/src/locales/en/common.json#L421), but the collection-centre list below is CMS-driven and can change. The count will go stale. Confirm the number or make it dynamic.

## 7.2 Overview — STATIC

> **Source:** Layout → [`EWaste.jsx#L232`](../client/src/pages/user/EWaste.jsx#L232) · Copy → [`common.json#L425`](../client/src/locales/en/common.json#L425) (`ewaste.ov.*`)

**Lede:** Dumped in a landfill, old electronics leach lead and mercury into soil and groundwater. Recycled right, almost all of them ***get a second life.***

> E-waste is the informal name for electronic products nearing the end of their useful life — computers, televisions, displays, copiers, phones, audio equipment and batteries. Many of their components contain hazardous materials that pose a real threat to human health and the environment when disposed of improperly.
>
> Most of these products can be reused, refurbished or recycled in an environmentally sound manner. Under India's E-Waste (Management & Handling) Rules, Mindstec runs a compliant take-back programme so the hardware we distribute never ends up where it shouldn't.

## 7.3 Why recycle — STATIC

> **Source:** Layout → [`EWaste.jsx#L246`](../client/src/pages/user/EWaste.jsx#L246) · Copy → [`common.json#L432`](../client/src/locales/en/common.json#L432) (`ewaste.recyclers.*`)

**Heading:** What responsible recycling ***gives back.***

| # | Title | Body |
| --- | --- | --- |
| 01 | Conserves natural resources | Metals recovered from circuit boards, and the plastics and glass in monitors and televisions, go into new products — reducing the need to mine new raw materials. |
| 02 | Supports the community | Donated electronics become refurbished computers and phones for low-income families, schools and non-profits — access to technology they couldn't otherwise afford. |
| 03 | Creates local employment | With around 90% of electronic equipment recyclable, demand for recycling builds new firms and new jobs — and a second market for the recovered materials. |
| 04 | Protects health & environment | CRTs and monitors contain lead; circuit boards carry cadmium, mercury and chromium. Safe recycling keeps these toxins out of trashcans, landfills and groundwater. |

## 7.4 Do's & Don'ts — STATIC

> **Source:** Layout → [`EWaste.jsx#L278`](../client/src/pages/user/EWaste.jsx#L278) · Copy → [`common.json#L445`](../client/src/locales/en/common.json#L445) (`ewaste.dd.*`)

**Heading:** Do's & ***don'ts.***

**✓ Always**
1. Check the product catalogue for end-of-life handling information before you dispose of anything.
2. Make sure only authorized recyclers and dismantlers handle your electronic products.
3. Call the toll-free line to dispose of products that have reached end of life.
4. Drop used electronics, batteries and accessories at your nearest authorized e-waste collection point.
5. Disconnect batteries and protect any glass surfaces against breakage before handing equipment over.

**✗ Never**
1. Dismantle electronic products on your own.
2. Throw electronics into bins marked with the "Do not dispose" sign.
3. Hand e-waste to informal, unorganized collectors like local scrap dealers or rag pickers.
4. Mix electronics with municipal garbage that ultimately reaches landfills.

## 7.5 The programme — STATIC

> **Source:** Layout → [`EWaste.jsx#L336`](../client/src/pages/user/EWaste.jsx#L336) · Copy → [`common.json#L465`](../client/src/locales/en/common.json#L465) (`ewaste.plan.*`)

- **Image tag:** Authorized recycling — Deshwal Waste Management
- **Label:** The programme
- **Heading:** How your hardware ***comes back around.***
- **Paragraph:**
  > In India, most e-waste ends up in the informal sector, recycled with no consideration for health or the environment. Abiding by all pertinent e-waste laws, Mindstec has partnered with Deshwal Waste Management Pvt. Ltd. — a recycler authorized by the appropriate government agencies — to provide drop-off centres and environmentally sound processing of end-of-life electronics.

| # | Step | Detail |
| --- | --- | --- |
| 01 | Raise a pickup request | Call the toll-free line 1800 102 9077, Monday to Friday, 10:00 AM – 5:30 PM — or drop your e-waste at any collection centre below. |
| 02 | Collection & transport | Deshwal Waste Management, our authorized recycler, collects the equipment and transports it to the nearest collection centre. |
| 03 | Environmentally sound recycling | Equipment is processed at government-authorized facilities in compliance with India's E-Waste Management & Handling Rules. |

**Note:** **Free of charge.** No fee is charged for giving goods for recycling, and no monetary benefit is offered in return — the sole aim of the programme is to keep the environment clean.

## 7.6 Collection centres — STATIC heading / CMS list

> **Source:** Layout → [`EWaste.jsx#L377`](../client/src/pages/user/EWaste.jsx#L377) · Copy → [`common.json#L488`](../client/src/locales/en/common.json#L488) (`ewaste.centres.*`) · Data → [`services/collectionCentreService.js`](../client/src/pages/admin/services/collectionCentreService.js) (admin → Collection Centres)

- **Label:** Drop points
- **Heading:** Collection centres ***across India.***
- **Toll-free pickup:** 1800 102 9077 — Mon–Fri, 10:00 AM – 5:30 PM *(hardcoded, [`EWaste.jsx#L386-387`](../client/src/pages/user/EWaste.jsx#L386))*

Filterable by operator ("All centres" + one button per operator). Each centre card shows: **City**, operator, address, Contact Person, Tel.

## 7.7 Closing CTA — STATIC

> **Source:** Layout → [`EWaste.jsx#L418`](../client/src/pages/user/EWaste.jsx#L418) · Copy → [`common.json#L501`](../client/src/locales/en/common.json#L501) (`ewaste.cta.*`)

- **Label:** Do your part
- **Heading:** Recycle it right. / ***It costs nothing.***
- **Buttons:** `Call 1800 102 9077` · `Talk to Mindstec`

---

# 8. Gallery — `/gallery`

> **Page source:** [`pages/user/gallery/Gallery.jsx`](../client/src/pages/user/gallery/Gallery.jsx) · **Copy block:** [`common.json#L1021`](../client/src/locales/en/common.json#L1021) (`gallery.*`)

## 8.1 Hero — STATIC

> **Source:** Layout → [`GalleryHero.jsx`](../client/src/pages/user/gallery/components/GalleryHero.jsx), mounted at [`Gallery.jsx#L79`](../client/src/pages/user/gallery/Gallery.jsx#L79) · Copy → [`common.json#L1022`](../client/src/locales/en/common.json#L1022) (`gallery.hero.*`)

- **Meta label:** Community & Events · **Meta subtitle:** Mindstec Gallery
- **Eyebrow:** People · Culture · Milestones
- **Headline:** Our ***Community***
- **Paragraph:**
  > Behind every great technology company are the people and moments that define its culture. Here's a look at Mindstec — our summits, workshops, outings and celebrations.
- **Scroll cue:** Scroll to explore

**Counters** — [`GalleryHero.jsx#L228`](../client/src/pages/user/gallery/components/GalleryHero.jsx#L228):

| Value | Label |
| --- | --- |
| 22+ | Moments |
| 50+ | Events |
| 300+ | People |

> ⚠️ **Flag G1** — The three counter *values* (22+, 50+, 300+) are **hardcoded in the component**, not in the translation file and not derived from the gallery contents. They will not change as photos are added or removed. Please confirm the figures, or approve making them count the actual gallery items.

## 8.2 Gallery grid — CMS

> **Source:** Layout → [`GalleryGrid.jsx`](../client/src/pages/user/gallery/components/GalleryGrid.jsx), mounted at [`Gallery.jsx#L85`](../client/src/pages/user/gallery/Gallery.jsx#L85) · Lightbox → [`GalleryModal.jsx`](../client/src/pages/user/gallery/components/GalleryModal.jsx) · Data → `GET /admin/gallery/` ([`Gallery.jsx#L25`](../client/src/pages/user/gallery/Gallery.jsx#L25))

An interactive, animated grid of photographs with a full-screen lightbox viewer. All images, titles and categories come from admin → Gallery.

- **Loading state:** "Loading gallery…" — [`Gallery.jsx#L110`](../client/src/pages/user/gallery/Gallery.jsx#L110)
- **Error state:** "Failed to load gallery." — [`Gallery.jsx#L131`](../client/src/pages/user/gallery/Gallery.jsx#L131)

## 8.3 Closing CTA — STATIC

> **Source:** Layout → [`Gallery.jsx#L151`](../client/src/pages/user/gallery/Gallery.jsx#L151) (`CtaStrip`) · Copy → [`common.json#L1034`](../client/src/locales/en/common.json#L1034) (`gallery.cta.*`)

- **Label:** Join the Community
- **Heading:** Want to be part of our ***next chapter?***
- **Paragraph:**
  > Whether you're a prospective partner, a technology enthusiast, or someone who wants to work with us — we'd love to hear from you.
- **Buttons:** `Get in touch` · `View Solutions`

---

# 9. Events & News — `/events`

> **Page source:** [`pages/user/Events.jsx`](../client/src/pages/user/Events.jsx) · **Copy block:** [`common.json#L983`](../client/src/locales/en/common.json#L983) (`events.*`)

## 9.1 Hero — STATIC

> **Source:** Layout → [`Events.jsx#L261`](../client/src/pages/user/Events.jsx#L261) · Copy → [`common.json#L984`](../client/src/locales/en/common.json#L984) (`events.hero.*`)

- **Label:** What's happening
- **Headline:** Events & ***News***
- **Paragraph:**
  > Upcoming events from Mindstec — product launches, industry shows, and partner conferences — alongside the latest news and press from across our regions.

## 9.2 Tab filter — STATIC

> **Source:** Layout → [`Events.jsx#L277`](../client/src/pages/user/Events.jsx#L277) · Copy → [`common.json#L990`](../client/src/locales/en/common.json#L990) (`events.tabs.*`)

`All` · `Events` *(with count)* · `News` *(with count)*

## 9.3 Upcoming Events — STATIC heading / CMS cards

> **Source:** Layout → [`Events.jsx#L307`](../client/src/pages/user/Events.jsx#L307), card component at [`Events.jsx#L40`](../client/src/pages/user/Events.jsx#L40) · Copy → [`common.json#L995`](../client/src/locales/en/common.json#L995) (`events.upcoming.*`), button at [`#L1009`](../client/src/locales/en/common.json#L1009) · Data → [`services/eventService.js`](../client/src/pages/admin/services/eventService.js)

- **Label:** Upcoming Events
- **Heading:** See us ***live.***
- **Lede:** Meet the Mindstec team at trade shows, launch events, and partner conferences across our regions.
- **Card button:** `Register Now`
- **Empty state:** No upcoming events at the moment — check back soon.

## 9.4 Latest News — STATIC heading / CMS cards

> **Source:** Layout → [`Events.jsx#L336`](../client/src/pages/user/Events.jsx#L336) · Copy → [`common.json#L1002`](../client/src/locales/en/common.json#L1002) (`events.news.*`)

- **Label:** Latest News
- **Heading:** Stay ***informed.***
- **Lede:** Press releases, industry partnerships, and product announcements from Mindstec Distribution.
- **Card button:** `Read More`
- **Empty state:** No news items yet — check back soon.

## 9.5 Closing CTA — STATIC + REGION

> **Source:** Layout → [`Events.jsx#L363`](../client/src/pages/user/Events.jsx#L363) · Copy → [`common.json#L1013`](../client/src/locales/en/common.json#L1013) (`events.cta.*`)

- **Label:** Stay connected
- **Heading:** Want to be ***at the next one?***
- **Buttons:** `Get in touch` · `Our partners`

---

# 10. Blogs — `/blogs`

> **Page source:** [`pages/user/Blogs.jsx`](../client/src/pages/user/Blogs.jsx) · **Copy block:** [`common.json#L912`](../client/src/locales/en/common.json#L912) (`blogs.*`) · **Data:** [`services/blogService.js`](../client/src/pages/admin/services/blogService.js)

## 10.1 Hero — STATIC

> **Source:** Layout → [`Blogs.jsx#L147`](../client/src/pages/user/Blogs.jsx#L147) · Copy → [`common.json#L913`](../client/src/locales/en/common.json#L913) (`blogs.hero.*`)

- **Label:** Blogs — The Mindstec Journal
- **Headline:** Notes from / the AV floor.
- **Paragraph:**
  > Buying guides, explainers and field notes from our product specialists — the same advice we give integrators and enterprise clients every day, written down.

## 10.2 Featured article — CMS

> **Source:** Layout → [`Blogs.jsx#L161`](../client/src/pages/user/Blogs.jsx#L161) · Copy → [`common.json#L919-921`](../client/src/locales/en/common.json#L919)

The most recent / flagged post, shown as a large card with a **Featured** badge, category, date, title, excerpt and a `Read the article` link. Clicking opens the full article in an overlay.

## 10.3 Article grid — CMS

> **Source:** Layout → [`Blogs.jsx#L196`](../client/src/pages/user/Blogs.jsx#L196) · Heading copy → **inline fallbacks** at [`Blogs.jsx#L199-200`](../client/src/pages/user/Blogs.jsx#L199)

- **Label:** All Articles
- **Heading:** More from the floor

Each card: category, date, title, excerpt, `Read article`. All posts come from admin → Blogs.

> ⚠️ **Flag B1** — `blogs.all_articles` and `blogs.grid_title` have no entries in any language file, so this heading shows English in all five languages.

## 10.4 Article overlay — STATIC chrome / CMS body

> **Source:** Layout → [`Blogs.jsx#L266`](../client/src/pages/user/Blogs.jsx#L266) → [`BlogModal`](../client/src/components/common/BlogModal.jsx) · Copy → [`common.json#L930`](../client/src/locales/en/common.json#L930) (`blogs.modal.*`)

- **Tag:** Article · **Back link:** Back to Blogs
- **Error state:** Could not load this article. Please try again. · `Retry`

## 10.5 Closing CTA — STATIC

> **Source:** Layout → [`Blogs.jsx#L231`](../client/src/pages/user/Blogs.jsx#L231) · Copy → [`common.json#L923`](../client/src/locales/en/common.json#L923) (`blogs.cta.*`)

- **Label:** Talk shop with us
- **Heading:** Questions the blog ***didn't answer?***
- **Buttons:** `Ask a specialist` · `See our solutions`

---

# 11. Contact Us — `/contact`

> **Page source:** [`pages/user/Contact.jsx`](../client/src/pages/user/Contact.jsx) · **Copy block:** [`common.json#L509`](../client/src/locales/en/common.json#L509) (`contact.*`)

**Browser tab title:** Contact us — Mindstec Distribution — [`Contact.jsx#L111`](../client/src/pages/user/Contact.jsx#L111)

## 11.1 Hero — STATIC

> **Source:** Layout → [`Contact.jsx#L246`](../client/src/pages/user/Contact.jsx#L246) · Copy → [`common.json#L511`](../client/src/locales/en/common.json#L511) (`contact.hero.*`)

- **Label:** Contact us
- **Headline:** Have a project? / ***Get in touch.***

## 11.2 Enquiry form — STATIC

> **Source:** Layout → [`Contact.jsx#L255`](../client/src/pages/user/Contact.jsx#L255) · Copy → [`common.json#L515`](../client/src/locales/en/common.json#L515) (`contact.form.*`) · Submits to `POST /admin/enquiries/submit/` ([`Contact.jsx#L182`](../client/src/pages/user/Contact.jsx#L182))

| Field | Label | Placeholder | Required |
| --- | --- | --- | --- |
| Name | Name | Your name | Yes |
| Phone | Phone | +91 ... | No |
| Email | Email address | you@company.com | Yes |
| Subject | Subject | *(dropdown, see below)* | Yes |
| Message | Message | How can we help you? Feel free to get in touch! | Yes |

**Subject dropdown options** — [`Contact.jsx#L294`](../client/src/pages/user/Contact.jsx#L294), labels at [`common.json#L526`](../client/src/locales/en/common.json#L526):
General enquiries · Become a partner · Become a reseller · Visit the Experience Centre · Digital Signage · Control Rooms · Conferencing & Collaboration · Hospitality AV · Broadcast & Production · Live Events & Immersive

*(The dropdown pre-selects automatically when arriving from a "Become a partner" / "Book a visit" / solution-page button — mapping at [`Contact.jsx#L14`](../client/src/pages/user/Contact.jsx#L14).)*

**Submit button:** `Send message` → "Sending..." while in progress
**Note under the button:** Your inquiry is transmitted securely to our *{region}* office *{office name}*. — [`common.json#L557`](../client/src/locales/en/common.json#L557)
**Success message:** Thanks for reaching out! We'll get back to you shortly.
**Error message:** Something went wrong. Please try again.

## 11.3 Contact details sidebar — REGION

> **Source:** Layout → [`Contact.jsx#L358`](../client/src/pages/user/Contact.jsx#L358) · Copy → [`common.json#L548`](../client/src/locales/en/common.json#L548) (`contact.info.*`) · Data → [`api/regionApi.js`](../client/src/api/regionApi.js)

| # | Heading | Content |
| --- | --- | --- |
| 01 | Call us | Phone number(s) for the selected region |
| 02 | Visit us | Office name + address for the selected region |
| 03 | Write to us | Email address(es) for the selected region |

**Regional desks** — [`Contact.jsx#L409`](../client/src/pages/user/Contact.jsx#L409) — when "Global" is selected, every regional office is listed here as a card (region, office name, address, phone, email). Plus a fixed entry:
- Partnerships → partners@mindstec.com *(hardcoded, [`Contact.jsx#L428`](../client/src/pages/user/Contact.jsx#L428))*

**Social icons** — [`Contact.jsx#L431`](../client/src/pages/user/Contact.jsx#L431): LinkedIn · Instagram · YouTube

## 11.4 Office maps — CMS

> **Source:** Layout → [`Contact.jsx#L454`](../client/src/pages/user/Contact.jsx#L454) · Map URLs come from admin → Regions → Contact Info

One embedded Google Map per office with a caption card showing office name, address, Phone, Email, and an `Open in Google Maps` link.

**Fallback address if no CMS record exists** — [`Contact.jsx#L26`](../client/src/pages/user/Contact.jsx#L26):
> Mindstec Distribution — Bangalore HQ
> No. 5M-645, Banaswadi Village, OMBR Layout, Bangalore 560043, India
> +91 80 4525 6922 · india@mindstec.com

---

# 12. 404 — Page not found

> **Source:** Layout → [`NotFound.jsx#L135`](../client/src/pages/user/NotFound.jsx#L135) · Copy → **inline fallbacks only** ([`NotFound.jsx#L140-145`](../client/src/pages/user/NotFound.jsx#L140))

Shown for any unrecognised URL.

- **Logo:** Mindstec — Technology of the Future, Today
- **Big number:** 4**0**4
- **Heading:** This page isn't on the floor.
- **Paragraph:** The address may have changed, or it never existed. Everything we distribute is one click away.
- **Buttons:** `Back to home` · `Browse solutions` · `Contact us`

> ⚠️ **Flag NF1** — The `not_found.*` keys have no entries in any language file, so the 404 page shows English in all five languages.

---

# Appendix A — Items needing your decision

Ordered by priority.

| ID | Page | Issue | Where it lives | What we need from you |
| --- | --- | --- | --- | --- |
| **S1** 🚨 | All 6 solution detail pages | "By the numbers" band — **450+ projects, 99.99% system reliability, 20+ global brands, 24/7 monitoring** — are placeholder figures from the design mockup. Published, they read as contractual claims. | [`solutionDetails.js#L61`](../client/src/constants/solutionDetails.js#L61) | Verified figures, or approval to remove the band. |
| **S2** 🚨 | All 6 solution detail pages | The 12 "Featured installations" are **generic facility types, not real projects** (deliberately, so no work is falsely attributed to a client). | [`solutionDetails.js`](../client/src/constants/solutionDetails.js) — `installations` in each block | Real, client-cleared case studies — or written approval to publish generic examples. |
| **H2 / H4** ⚠️ | Home | Brand ticker and "Why Mindstec" accordion name **Samsung Professional, Crestron, Extron, Shure, Barco, LG, Sony Professional, Biamp, QSC, Sennheiser, Epson** — none in the 25-brand Partners portfolio. | [`Home.jsx#L944`](../client/src/pages/user/Home.jsx#L944), [`common.json#L252`](../client/src/locales/en/common.json#L252) | Confirm whether these are represented brands. If not, the copy must change. |
| **H3** ⚠️ | Home / Solutions / Partners / Experience | Brand count stated as **50+**, **49+**, **25**, **20+** in four places. Install count as **973+** and **1,000+**. | [`Home.jsx#L991`](../client/src/pages/user/Home.jsx#L991), [`common.json#L223`](../client/src/locales/en/common.json#L223), [`#L847`](../client/src/locales/en/common.json#L847), [`solutionDetails.js#L64`](../client/src/constants/solutionDetails.js#L64) | One authoritative figure for each. |
| **H1** ⚠️ | Home / About / Partners | Regions stated as **"India · Africa · Poland"** (Home) vs **"Middle East, Africa and Asia"** (About, Partners). Founding as **"Since 2008"** but experience as **"15+ years"**. | [`common.json#L218-222`](../client/src/locales/en/common.json#L218), [`#L44`](../client/src/locales/en/common.json#L44) | Confirm the correct regions and founding year. |
| **H5** ⚠️ | Home | Eight cities pinned on the world map but only **3 regional operations** claimed, with 3 contact entries. | [`Home.jsx#L22`](../client/src/pages/user/Home.jsx#L22) | Confirm which cities are real offices. |
| **N2** ⚠️ | Footer (every page) | **Privacy, Terms and Disclaimer** links go nowhere — those pages don't exist. | [`Footer.jsx#L129`](../client/src/components/layout/Footer/Footer.jsx#L129) | Supply the legal copy, or confirm removal. |
| **H6** ⚠️ | Home | Three "Journal" cards are **hardcoded placeholders** with invented titles and dates; all link to the blog listing, not to articles. | [`common.json#L302`](../client/src/locales/en/common.json#L302), [`Home.jsx#L1282`](../client/src/pages/user/Home.jsx#L1282) | Publish as real posts, or approve wiring the section to the latest real posts. |
| **X2** ⚠️ | Experience Centre | The film is still hosted on the **old WordPress site**. It breaks if that site is retired. | [`Experience.jsx#L310`](../client/src/pages/user/Experience.jsx#L310) | Approval to move the video onto the new site. |
| **G1** ⚠️ | Gallery | Hero counters (**22+ Moments, 50+ Events, 300+ People**) are hardcoded and unrelated to actual gallery contents. | [`GalleryHero.jsx#L228`](../client/src/pages/user/gallery/components/GalleryHero.jsx#L228) | Confirm the figures, or approve making them count real items. |
| **E1** ⚠️ | E-Waste | "**27 drop points**" is hardcoded while the centre list is CMS-managed — the number will go stale. | [`common.json#L421`](../client/src/locales/en/common.json#L421) | Confirm the figure, or approve making it count automatically. |
| **A1** ⚠️ | About | An 8-person roster sits in all five language files but is **read by no component** — leftover from before the team section became CMS-driven. | [`common.json#L80`](../client/src/locales/en/common.json#L80) | Confirm the live roster in admin → Team; approve deleting the dead keys. |
| **C1** ⚠️ | Chat widget | Copy exists for an "Avg. response <30 sec" line and **four quick-action buttons** — none of it is wired up, so none appears. | [`common.json#L941`](../client/src/locales/en/common.json#L941), [`#L951`](../client/src/locales/en/common.json#L951) | Build the buttons, or approve deleting the copy. |
| **SO1 / B1 / NF1** ⚠️ | Solutions CTA, Blogs grid heading, 404 page | These strings exist **only as English fallbacks in the code** — no translation keys. Non-English visitors see English. | [`Solutions.jsx#L186`](../client/src/pages/user/Solutions.jsx#L186), [`Blogs.jsx#L199`](../client/src/pages/user/Blogs.jsx#L199), [`NotFound.jsx#L140`](../client/src/pages/user/NotFound.jsx#L140) | Approval to add these keys to all five locale files. |
| **N1** | Navigation | E-Waste Management is hidden for regions where it isn't enabled. | [`Navbar.jsx#L109`](../client/src/components/layout/Navbar/Navbar.jsx#L109) | Confirm which regions should show it. |
| **X1** | Experience Centre | Zone 06 (AV-over-IP Backbone) links to the same page as Zone 02 (Conferencing). | [`Experience.jsx#L203`](../client/src/pages/user/Experience.jsx#L203) | Confirm intended, or supply the right destination. |
| **P1** | Partners | Humelab is described as "Hospitality tech" but filed under *Collaboration & Control*. | [`Partners.jsx#L24`](../client/src/pages/user/Partners.jsx#L24) | Confirm the category. |

---

# Appendix B — What you can edit yourself

Content marked **CMS** in this document is editable from `/admin/dashboard` without a developer:

| Admin section | Controls content on | Admin component |
| --- | --- | --- |
| Solutions | Home solutions grid, Solutions listing page | [`SolutionsTab.jsx`](../client/src/pages/admin/tabs/SolutionsTab.jsx) |
| Fieldwork | Home "Recent field work" | [`FieldworkTab.jsx`](../client/src/pages/admin/tabs/FieldworkTab.jsx) |
| Testimonials | Home "Client voices" | *(via [`testimonialApi.js`](../client/src/api/testimonialApi.js))* |
| Team | About "Our team" | [`TeamTab.jsx`](../client/src/pages/admin/tabs/TeamTab.jsx) |
| Blogs | Blogs page + article overlay | [`BlogsTab.jsx`](../client/src/pages/admin/tabs/BlogsTab.jsx) |
| Events | Events & News page | [`EventsTab.jsx`](../client/src/pages/admin/tabs/EventsTab.jsx) |
| Gallery | Gallery page | [`GalleryTab.jsx`](../client/src/pages/admin/tabs/GalleryTab.jsx) |
| Collection Centres | E-Waste drop points | [`CollectionCentresTab.jsx`](../client/src/pages/admin/tabs/CollectionCentresTab.jsx) |
| Regions → Contact Info | Footer address block, Contact page, all CTA phone/email, Experience Centre visit details | [`RegionsTab.jsx`](../client/src/pages/admin/tabs/RegionsTab.jsx) |
| Regions → Solution Brands | "Brands we distribute" on each solution detail page | [`RegionsTab.jsx`](../client/src/pages/admin/tabs/RegionsTab.jsx) |
| Regions → Page visibility | Whether E-Waste appears for a region | [`RegionsTab.jsx`](../client/src/pages/admin/tabs/RegionsTab.jsx) |
| Enquiries | *(read-only — contact form submissions land here)* | [`InquiriesTab.jsx`](../client/src/pages/admin/tabs/InquiriesTab.jsx) |

Everything marked **STATIC** requires a developer change and re-deployment. In practice that means editing one of:

| File | What it holds |
| --- | --- |
| [`locales/en/common.json`](../client/src/locales/en/common.json) *(+ 4 language files)* | Almost all headlines and body copy |
| [`constants/solutionDetails.js`](../client/src/constants/solutionDetails.js) | All six solution detail pages |
| [`pages/user/Partners.jsx#L13`](../client/src/pages/user/Partners.jsx#L13) | The 25-brand portfolio |
| [`pages/user/Home.jsx#L22`](../client/src/pages/user/Home.jsx#L22) | The map's city list |
| [`pages/user/Home.jsx#L941`](../client/src/pages/user/Home.jsx#L941) | The brand ticker |
| [`pages/user/Home.jsx#L983`](../client/src/pages/user/Home.jsx#L983) | The four stat counters |
| [`pages/user/Experience.jsx#L197`](../client/src/pages/user/Experience.jsx#L197) | Experience Centre zone images and links |

---

# Appendix C — Languages

> **Source:** [`i18n.js`](../client/src/i18n.js) · Language files: [en](../client/src/locales/en/common.json) · [fr](../client/src/locales/fr/common.json) · [ar](../client/src/locales/ar/common.json) · [de](../client/src/locales/de/common.json) · [zh](../client/src/locales/zh/common.json) · Runtime translation of CMS content: [`services/translationService.js`](../client/src/services/translationService.js) + [`hooks/useDynamicTranslation.js`](../client/src/hooks/useDynamicTranslation.js)

Every **STATIC** string is translated into five languages: **English (en)** · **French (fr)** · **Arabic (ar)** · **German (de)** · **Chinese (zh)** — except the gaps noted in Flags SO1, B1 and NF1.

**CMS** content (blogs, events, team, testimonials, fieldwork, gallery, addresses) is translated **automatically at runtime** when a visitor switches language — it is authored once in English in the admin panel.

> Note: Arabic renders left-to-right rather than right-to-left — a deliberate choice in [`context/LanguageContext.jsx`](../client/src/context/LanguageContext.jsx). Please confirm this is intended.

---

# Appendix D — Copy written but never displayed

These keys exist in all five language files but are referenced by **no component**, so nothing on the site shows them. They are translation work already paid for that produces nothing, and they mislead anyone editing copy.

| Key | Content | Notes |
| --- | --- | --- |
| `chat.quick_actions.*` — [L951](../client/src/locales/en/common.json#L951) | Four quick-action buttons (Company Info, Products, Solutions, Technical Support) with titles, descriptions and preset questions | Feature never built or removed — Flag C1 |
| `chat.header.avg_response` — [L941](../client/src/locales/en/common.json#L941) | "Avg. response <30 sec" | Not rendered in [`ChatHeader.jsx`](../client/src/components/chat/ChatHeader.jsx) |
| `chat.launcher.placeholder`, `chat.launcher.panel_label` — [L948](../client/src/locales/en/common.json#L948) | "Ask me anything...", "Ask AI" | Only `chat.launcher.label` is used |
| `about.team.names.*`, `about.team.roles.*` — [L80](../client/src/locales/en/common.json#L80) | 8 team members' names and job titles | Superseded by admin → Team — Flag A1 |
| `contact.offices.*`, `contact.general.*` — [L540](../client/src/locales/en/common.json#L540) | "Offices" / "General" section intros | Sections not present on the Contact page |
| `footer.address`, `footer.follow_us` — [L27](../client/src/locales/en/common.json#L27) | "Address", "Follow Us" | Footer uses no column headings for these |
| `blogs.browse_all` — [L922](../client/src/locales/en/common.json#L922) | "Browse all articles on mindstec.com" | Points at the old WordPress site |
| `solutions.primary_verticals` — [L678](../client/src/locales/en/common.json#L678) | "Primary verticals" | Unused |
| `solutions.next` — [L909](../client/src/locales/en/common.json#L909) | "Next solution" | Replaced by the "Related solutions" section |

**Recommendation:** delete these once the client confirms none are wanted. They are dead weight in every translation pass.

---

*End of document.*
