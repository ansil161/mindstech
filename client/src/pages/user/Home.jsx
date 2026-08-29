import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { whenReady } from '../../utils/pageReveal';
import Button from '../../components/common/Button/Button.jsx';
import axios from '../../api/axios';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';
import { useRegion } from '../../context/RegionContext.jsx';
import { getPublicRegionData } from '../../api/regionApi.js';
import { getPublicTestimonials } from '../../api/testimonialApi.js';
import { TestimonialsSection } from '../../components/ui/testimonials-with-marquee.jsx';
import SolutionGrid from '../../components/common/SolutionGrid/SolutionGrid.jsx';
import SolutionIcon from '../../components/common/SolutionIcons/SolutionIcons.jsx';
import { getFallbackSolutions, getSolutionMeta } from '../../constants/solutions.js';
import WaveBackdrop from '../../components/common/WaveBackdrop/WaveBackdrop.jsx';
import { safeFromTo } from '../../utils/gsapSafe';
import {
  ACTIVE_OFFICES,
  HQ_KEY,
  OFFICES,
  OFFICES_BY_KEY,
  ROUTES,
  projectOffice,
} from '../../constants/offices.js';


gsap.registerPlugin(ScrollTrigger);

/**
 * Icon + short tag for each positioning pillar, in the order the copy is
 * written. Only the non-translatable half lives here — the tag itself is looked
 * up through i18n with these as the English default, so a locale that hasn't
 * been updated still renders a sensible word rather than a raw key.
 */
const PILLAR_MARKS = [
  { icon: 'regional', tagFallback: 'Supply chain' },
  { icon: 'valueAdd', tagFallback: 'Value added' },
  { icon: 'future', tagFallback: 'Portfolio' },
];

/**
 * The hero's closing figures. English defaults live here and are resolved
 * through i18n at `home.hero.stats.<key>.*`, so a locale that has not been
 * updated renders these rather than a raw key.
 *
 * NOTE for review: these four figures do not currently agree with the numbers
 * published elsewhere on this site — the stats band lower down the page reads
 * 15+ years / 49+ brands / 973+ installations, and /partners and /solutions
 * both say 25 brands. They were supplied as-is for this redesign; they need
 * reconciling before launch, not silently diverging.
 */
const HERO_STATS = [
  { key: 'countries', value: '20+', label: 'Countries', sub: 'We operate in', icon: 'globe' },
  { key: 'brands', value: '500+', label: 'Brands', sub: 'We represent', icon: 'building' },
  { key: 'projects', value: '10K+', label: 'Projects', sub: 'Delivered', icon: 'chart' },
  { key: 'years', value: '25+', label: 'Years', sub: 'Of excellence', icon: 'shield' },
];

/**
 * Thin-line marks for the hero's figures. Drawn at 24px on a 24 grid with a
 * 1.4 stroke — heavy enough to read at the strip's scale, light enough that
 * the numeral stays the thing you see first.
 */
const HERO_STAT_ICONS = {
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.3 3.4 5.3 3.4 8.5s-1.2 6.2-3.4 8.5c-2.2-2.3-3.4-5.3-3.4-8.5S9.8 5.8 12 3.5Z" />
    </>
  ),
  building: (
    <>
      <path d="M4 20.5V6.2a1 1 0 0 1 .7-.95l6-1.9a1 1 0 0 1 1.3.95V20.5" />
      <path d="M12 9.6h6.3a1 1 0 0 1 1 1v9.9" />
      <path d="M2.6 20.5h18.8M7 8.6v.01M7 12v.01M9.5 8.6v.01M9.5 12v.01M15 13v.01M15 16.3v.01" />
    </>
  ),
  chart: (
    <>
      <path d="M3.2 20.4h17.6" />
      <path d="M6.4 20.4v-5.6M11 20.4V8.2M15.6 20.4v-8.4M20.2 20.4V4.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.2 4.8 6v6c0 4.2 3 7.6 7.2 9 4.2-1.4 7.2-4.8 7.2-9V6L12 3.2Z" />
      <path d="m12 9.1 1.1 2.2 2.4.35-1.75 1.7.4 2.4L12 14.6l-2.15 1.15.4-2.4-1.75-1.7 2.4-.35L12 9.1Z" />
    </>
  ),
};

// ── Map label layout ──
// Several offices (Bangalore/Dubai/Riyadh/Cairo) sit close together on the
// 800×400 map, so city-name labels are placed by searching a small ring of
// candidate slots around each marker — closest and most natural (directly
// above/below) first — skipping any slot that would overlap an
// already-placed label, and clamping to the viewBox so a label can never
// run off-canvas at any screen size.
const MAP_W = 800;
const MAP_H = 400;
const LABEL_H = 16;
const LABEL_GAP = 6;

const estimateLabelWidth = (text) => text.length * 5.6 + 16;

function layoutMapLabels(entries) {
  const rectsOverlap = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
  const toRect = (lx, ly, w) => ({ x1: lx - w / 2 - LABEL_GAP, x2: lx + w / 2 + LABEL_GAP, y1: ly - LABEL_H / 2, y2: ly + LABEL_H / 2 });
  const clampX = (lx, w) => Math.min(Math.max(lx, w / 2 + 4), MAP_W - w / 2 - 4);
  const clampY = (ly) => Math.min(Math.max(ly, LABEL_H), MAP_H - LABEL_H);

  // Resolve the HQ label first so it stays put, then top-to-bottom for
  // stable, repeatable placement of the rest.
  const ordered = [...entries].sort((a, b) => (a.isHQ === b.isHQ ? a.y - b.y : a.isHQ ? -1 : 1));

  const placedRects = [];
  return ordered.map((c) => {
    const w = estimateLabelWidth(c.text);
    const nearTop = c.y < 60; // avoid the label running off the map's top edge
    const near = LABEL_H + 8;
    const far = near * 2;
    const side = w / 2 + 10;

    const candidates = nearTop
      ? [
          { dx: 0, dy: near }, { dx: 0, dy: -near },
          { dx: 0, dy: far }, { dx: 0, dy: -far },
          { dx: side, dy: near }, { dx: -side, dy: near },
          { dx: side, dy: -near }, { dx: -side, dy: -near },
          { dx: 0, dy: far + near },
        ]
      : [
          { dx: 0, dy: -near }, { dx: 0, dy: near },
          { dx: 0, dy: -far }, { dx: 0, dy: far },
          { dx: side, dy: -near }, { dx: -side, dy: -near },
          { dx: side, dy: near }, { dx: -side, dy: near },
          { dx: 0, dy: -(far + near) },
        ];

    let chosen = candidates[0];
    let chosenIndex = 0;
    for (let i = 0; i < candidates.length; i++) {
      const lx = clampX(c.x + candidates[i].dx, w);
      const ly = clampY(c.y + candidates[i].dy);
      if (!placedRects.some((r) => rectsOverlap(r, toRect(lx, ly, w)))) {
        chosen = candidates[i];
        chosenIndex = i;
        break;
      }
    }

    const lx = clampX(c.x + chosen.dx, w);
    const ly = clampY(c.y + chosen.dy);
    placedRects.push(toRect(lx, ly, w));

    // A "leader" line is only drawn once a label has been pushed past the
    // two natural above/below slots, so the common case stays line-free.
    const displaced = chosenIndex >= 2;
    const edgeY = ly > c.y ? ly - LABEL_H / 2 : ly + LABEL_H / 2;
    const edgeX = Math.min(Math.max(c.x, lx - w / 2), lx + w / 2);

    return { ...c, w, lx, ly, displaced, edgeX, edgeY };
  });
}



const Home = () => {
  const { t } = useTranslation();
  const { region, regionSlug } = useRegion();
  const containerRef = useRef(null);
  const mapBaseRef = useRef(null);
  const mapOverlayRef = useRef(null);
  const edgeListRef = useRef(null);
  const mapTooltipRef = useRef(null);
  const pathsRef = useRef([]);
  const dotsRef = useRef([]);
  const heroVideoRef = useRef(null);

  // Read once at first render, not in an effect: it decides `autoPlay` and
  // `preload` on the very first paint, so a reduced-motion visitor never starts
  // a download and then has it cancelled.
  const [prefersReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Phones get a 960-wide encode instead of the 1600 one — roughly a third of
  // the bytes for a background nobody resolves detail in. Chosen once at mount
  // rather than via <source media>, which browsers only honour inconsistently
  // and never re-evaluate after load anyway.
  const [videoVariant] = useState(
    () => (typeof window !== 'undefined' && window.matchMedia('(max-width: 700px)').matches ? '-mobile' : '')
  );

  const [rawFieldwork, setRawFieldwork] = useState([]);
  const [fieldworkLoading, setFieldworkLoading] = useState(true);
  const [rawSolutions, setRawSolutions] = useState([]);
  const [regionContact, setRegionContact] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  // Which office card the pointer is over, so its marker can be highlighted.
  const [focusedOffice, setFocusedOffice] = useState(null);
  // The scroll cue retires as soon as the visitor takes its advice.
  const [cueVisible, setCueVisible] = useState(true);

  const { translatedData: fieldwork } = useDynamicTranslation(rawFieldwork, ['title', 'location_meta', 'category'], 'home_fieldwork');
  const { translatedData: solutions } = useDynamicTranslation(rawSolutions, ['title', 'desc'], 'home_solutions');
  const { translatedData: translatedTestimonials } = useDynamicTranslation(testimonials, ['name', 'designation', 'company', 'message'], 'home_testimonials');

  // Fall back to the static six verticals when the CMS returns nothing, so the
  // section never renders a heading above an empty grid. The category chip is
  // resolved from i18n either way, so an API-backed card and a fallback card
  // look identical.
  const solutionRows = (solutions.length ? solutions : getFallbackSolutions(t))
    .map((sol) => ({ ...sol, cat: getSolutionMeta(t, sol.slug)?.cat }));

  const marqueeTestimonials = (translatedTestimonials || []).map((item) => ({
    author: {
      name: item.name || 'Client',
      handle: [item.designation, item.company].filter(Boolean).join(' · ') || '@client',
      avatar: item.photo || '',
    },
    text: item.message || '',
    href: item.link || undefined,
  }));


  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const res = await axios.get('/admin/solutions/');
        if (res.data) {
          setRawSolutions(res.data);
        }
      } catch (err) {
        console.error("Failed to load dynamic solutions:", err);
      }
    };
    fetchSolutions();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchRegionContact = async () => {
      try {
        const res = await getPublicRegionData(regionSlug);
        if (!cancelled) {
          setRegionContact(Array.isArray(res.data.contact_info) ? res.data.contact_info[0] : (res.data.contact_info || null));
        }
      } catch {
        if (!cancelled) {
          setRegionContact(null);
        }
      }
    };
    fetchRegionContact();
    return () => { cancelled = true; };
  }, [regionSlug]);

  // Testimonials are global — the same list is shown for every region.
  useEffect(() => {
    let cancelled = false;
    const fetchTestimonials = async () => {
      try {
        const res = await getPublicTestimonials();
        if (!cancelled) setTestimonials(res.data || []);
      } catch {
        if (!cancelled) setTestimonials([]);
      }
    };
    fetchTestimonials();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const fetchFieldwork = async () => {
      try {
        const res = await axios.get('/admin/fieldwork/');
        if (res.data && res.data.length > 0) {
          setRawFieldwork(res.data);
        }
      } catch (err) {
        console.error("Failed to load dynamic fieldwork:", err);
      } finally {
        setFieldworkLoading(false);
      }
    };
    fetchFieldwork();
  }, []);

  // Separate effect for reveal-img GSAP animations triggered when fieldwork items render
  // Fieldwork arrives asynchronously and changes the work-grid height, shifting
  // every trigger below it — so re-measure. This effect used to also own the
  // .reveal-img animation, but those two elements (.thumb and .edge-visual) are
  // static markup unrelated to fieldwork: binding them here meant a slow or
  // failed /admin/fieldwork/ call left them unrevealed. They are bound at mount
  // now, and this effect only re-measures.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.work-card[data-reveal]');
      if (cards.length === 0) return;

      // [data-reveal] hides these in CSS, so reduced-motion must restore them.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(cards, { opacity: 1, y: 0 });
        return;
      }

      // One trigger for the grid rather than one per card: the cards enter
      // together, so a single staggered batch reads as one deliberate movement
      // instead of four independent ones.
      gsap.fromTo(cards,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.work-grid-premium',
            start: 'top 85%',
            once: true,
          }
        }
      );
    }, containerRef);

    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => { ctx.revert(); clearTimeout(timer); };
  }, [fieldwork]);

  // Hero video playback.
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return undefined;

    // React does not reliably reflect the `muted` prop onto the DOM property,
    // and an unmuted <video> is refused autoplay outright — so set it directly.
    // This is also what makes the element silent regardless of markup.
    video.muted = true;
    video.defaultMuted = true;

    if (prefersReducedMotion) {
      video.pause();
      return undefined;
    }

    // The hero is ~100vh at the top of a very long page, so without this the
    // decoder keeps running for the entire scroll. Browsers throttle offscreen
    // video inconsistently; pausing explicitly does not depend on that.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Rejects when the browser blocks playback (e.g. data-saver mode).
          // The poster stays up, which is a fine outcome.
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.01 }
    );
    io.observe(video);

    return () => io.disconnect();
  }, [prefersReducedMotion]);

  // Retire the scroll cue once the page has actually moved. The threshold is
  // well above the few pixels a trackpad emits on an accidental brush, and the
  // setState is a no-op while the boolean is unchanged, so a full scroll of the
  // page costs exactly two renders.
  useEffect(() => {
    const onScroll = () => setCueVisible(window.scrollY < 90);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // preloader and entrance animation
  useEffect(() => {
    let stopIntro = () => {};
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        // Nothing animates, so every element has to be placed at the state the
        // timeline would have resolved to — including the video's brightness,
        // which is what the scrim is balanced against. The statement .st-w
        // spans sit at #3a3a3a (index.css) until the ink-in tween lifts them.
        gsap.set('#heroImg', { scale: 1, filter: 'brightness(.62) saturate(.95)' });
        gsap.set('#heroEyebrow, #heroBrief, #heroActions, #heroStats li, .hero-scrollcue', { opacity: 1, y: 0 });
        gsap.set('#heroH .w', { yPercent: 0 });
        gsap.set('#stText .st-w', { opacity: 1, color: '#FAFAFA' });
        return;
      }

      // Hidden start states, applied before the timeline so nothing shows in
      // the frame between mount and first play. Everything except the headline
      // also carries opacity:0 in CSS; the headline deliberately does NOT, so
      // that a visitor whose JS never arrives still reads it — the preloader
      // covers the frame in which GSAP takes it away and gives it back.
      gsap.set('#heroImg', { scale: 1.12, filter: 'brightness(.18) saturate(.85)' });
      gsap.set('#heroEyebrow', { opacity: 0, y: 16 });
      gsap.set('#heroH .w', { yPercent: 120 });
      gsap.set('#heroBrief', { opacity: 0, y: 20 });
      gsap.set('#heroActions', { opacity: 0, y: 20 });
      gsap.set('#heroStats li', { opacity: 0, y: 18 });
      gsap.set('.hero-scrollcue', { opacity: 0 });

      // Hero intro. One staggered movement, top to bottom, in the order the
      // page is meant to be read: eyebrow, headline, lede, actions, figures,
      // cue. The headline is the only element that moves on its own terms —
      // a masked wipe with no fade, which is what makes it read as editorial
      // rather than as a UI element appearing.
      const intro = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
      intro.fromTo('#heroImg',
        { scale: 1.12, filter: 'brightness(.18) saturate(.85)' },
        { scale: 1, filter: 'brightness(.62) saturate(.95)', duration: 1.9, ease: 'power2.out' })
        .fromTo('#heroEyebrow',
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7 },
          '-=1.6')
        .fromTo('#heroH .w',
          { yPercent: 120 },
          { yPercent: 0, duration: 1.1, stagger: 0.09, ease: 'power4.out' },
          '-=1.4')
        .fromTo('#heroBrief',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.75')
        .fromTo('#heroActions',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.62')
        .fromTo('#heroStats li',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.07 },
          '-=0.55')
        .fromTo('.hero-scrollcue',
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          '-=0.35');

      // Gate the intro on the active loader — the route overlay on client
      // navigation, the #preloader on hard refresh — so it plays fresh on reveal
      // rather than hidden underneath. whenReady falls back to the next frame
      // when no loader is present.
      stopIntro = whenReady(() => intro.play());

      // 2. Parallax Image
      gsap.to('#heroImg', {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });

      // 3. Statement word color transition
      gsap.fromTo('#stText .st-w',
        { opacity: 0.18 },
        {
          opacity: 1,
          color: (i, t) => (t.parentElement && t.parentElement.tagName === 'EM') ? '#CC0001' : '#FAFAFA',
          stagger: 0.4,
          ease: 'none',
          scrollTrigger: {
            trigger: '.statement',
            start: 'top 75%',
            end: 'top 18%',
            scrub: true,
          }
        }
      );

      // 4. Reveal triggers. fromTo, not to: no CSS supplies a hidden start
      // state for .reveal, so a `to` tween animated 1 -> 1 and produced no
      // motion on any of the twelve elements carrying the class.
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            }
          }
        );
      });

      // 4b. Image wipes. clip-path has no CSS start value and `none` cannot
      // interpolate to an inset, so establish the closed state first.
      gsap.utils.toArray('.reveal-img').forEach((el) => {
        gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
        gsap.to(el, {
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.2,
          ease: 'power4.inOut',
          scrollTrigger: {
            trigger: el,
            start: 'top 82%',
            once: true,
          }
        });
      });



      // 5. Section heads cascade
      gsap.utils.toArray('.section-head').forEach((head) => {
        gsap.fromTo(head.querySelectorAll('h2, .label, .side, .text-link'),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: head,
              start: 'top 84%',
              once: true,
            }
          }
        );
      });

      // 7. Stat counters
      document.querySelectorAll('.count').forEach((el) => {
        const to = +el.dataset.to;
        const proxy = { val: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter() {
            gsap.to(proxy, {
              val: to,
              duration: 1.8,
              ease: 'power2.out',
              onUpdate() {
                el.textContent = Math.round(proxy.val).toLocaleString('en');
              }
            });
          }
        });
      });

      // 8. Band parallaxes
      gsap.fromTo('#bandImg',
        { yPercent: -9 },
        {
          yPercent: 9,
          ease: 'none',
          scrollTrigger: {
            trigger: '.band',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        }
      );
      gsap.fromTo('#bandH',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.band',
            start: 'top 65%',
            once: true,
          }
        }
      );

      // 9. CTA masked title
      gsap.fromTo('#ctaH .w',
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.1,
          stagger: 0.1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '#contact',
            start: 'top 72%',
            once: true,
          }
        }
      );

    }, containerRef);

    return () => {
      ctx.revert();
      stopIntro();
    };
  }, []);

  // The solutions cards animate themselves — SolutionGrid owns that timeline so
  // this page and /solutions can't drift apart. Nothing to bind here.

  // Separate effect for testimonial card animations
  useEffect(() => {
    if (translatedTestimonials.length === 0) return;

    const ctx = gsap.context(() => {
      // Animate the section header
      safeFromTo('#testimonials [data-testimonials-head]',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#testimonials',
            start: 'top 75%',
            once: true,
          }
        }
      );

      // Animate the marquee track in as a whole (cards are duplicated for the
      // seamless loop, so staggering individual cards doesn't apply here)
      safeFromTo('#testimonials [data-testimonials-track]',
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#testimonials [data-testimonials-track]',
            start: 'top 85%',
            once: true,
          }
        }
      );
    }, containerRef);

    // The testimonials section is the largest late-arriving height change on the
    // page; without this the journal and CTA triggers below it stay measured
    // against a document that no longer exists.
    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [translatedTestimonials]);

  // Edge accordion logic (matches original scrollHeight mapping)
  useEffect(() => {
    const list = edgeListRef.current;
    if (!list) return;

    const items = list.querySelectorAll('.edge-item');
    const visuals = document.querySelectorAll('#edgeVisual img');
    const caption = document.getElementById('edgeCaption');

    function openItem(item) {
      items.forEach(i => {
        const on = i === item;
        i.classList.toggle('open', on);
        i.querySelector('.edge-q').setAttribute('aria-expanded', String(on));
        const a = i.querySelector('.edge-a');
        if (a) {
          a.style.maxHeight = on ? a.scrollHeight + 'px' : '0px';
        }
      });
      visuals.forEach((img, i) => img.classList.toggle('on', i === +item.dataset.visual));
      if (caption) caption.textContent = item.dataset.caption;
    }

    items.forEach(item => {
      const q = item.querySelector('.edge-q');
      if (q) {
        q.addEventListener('click', () => {
          if (!item.classList.contains('open')) openItem(item);
        });
      }
    });

    const firstOpen = list.querySelector('.edge-item.open') || items[0];
    if (firstOpen) openItem(firstOpen);
  }, []);

  // The row list's hover-to-reveal-a-thumbnail effect used to live here. The
  // grid shows every image up front and does its reveal in CSS, so there is no
  // longer any JS state to coordinate — and touch users, who previously had to
  // tap a row open before they could reach it, now tap the card itself.

  // Dotted world map base loader.
  //
  // This used to run on mount. Two costs landed during first paint even though
  // the map sits far below the fold: a runtime import of a ~900KB module over
  // the network, and DottedMap.getSVG() synthesising several thousand <circle>
  // nodes which are then parsed in one synchronous innerHTML write. Together
  // they blocked the main thread long enough to stall the whole page.
  //
  // The work is identical, just deferred until the region section is within a
  // screen and a half of the viewport, and started in idle time. By the time
  // the map is actually scrolled to, it is already painted — so nothing about
  // the result changes, only when the cost is paid.
  useEffect(() => {
    let active = true;
    const base = mapBaseRef.current;
    if (!base) return;

    const buildMap = async () => {
      try {
        const res = await fetch('/assets/img/world-map.svg');
        if (!res.ok) throw new Error('Failed to load map asset');
        const svg = await res.text();
        if (!active) return;
        base.innerHTML = svg;
        ScrollTrigger.refresh();
      } catch (e) {
        if (active) base.classList.add('map-base--fallback');
      }
    };

    const start = () => {
      if (!active) return;
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(buildMap, { timeout: 2000 });
      } else {
        setTimeout(buildMap, 0);
      }
    };

    // No IntersectionObserver (very old browsers): fall back to the previous
    // behaviour rather than never rendering the map.
    if (!('IntersectionObserver' in window)) {
      start();
      return () => { active = false; base.innerHTML = ''; };
    }

    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) {
        io.disconnect();
        start();
      }
    }, { rootMargin: '150% 0px' });
    io.observe(base);

    return () => {
      active = false;
      io.disconnect();
      base.innerHTML = '';
    };
  }, []);

  // Map route animation timeline
  useEffect(() => {
    const paths = pathsRef.current;
    const dots = dotsRef.current;
    if (!paths.length || !dots.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // Reset dash offsets
    paths.forEach((path) => {
      if (!path) return;
      const L = path.getTotalLength();
      path.style.strokeDasharray = L;
      path.style.strokeDashoffset = L;
    });

    const quad = (t, a, m, b) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * m + t * t * b;

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2, defaults: { ease: 'power2.inOut' } });

    ROUTES.forEach((route, i) => {
      const path = paths[i];
      const dot = dots[i];
      if (!path || !dot) return;

      const s = projectOffice(OFFICES_BY_KEY[route[0]]);
      const e = projectOffice(OFFICES_BY_KEY[route[1]]);
      const m = { x: (s.x + e.x) / 2, y: Math.min(s.y, e.y) - 50 };

      const t0 = i * 0.3;
      tl.to(path, { strokeDashoffset: 0, duration: 2 }, t0);

      const prox = { t: 0 };
      tl.to(prox, {
        t: 1,
        duration: 2,
        onUpdate() {
          const t = prox.t;
          dot.setAttribute('cx', quad(t, s.x, m.x, e.x));
          dot.setAttribute('cy', quad(t, s.y, m.y, e.y));
          dot.setAttribute('opacity', t < 0.1 ? t * 10 : t > 0.85 ? Math.max(0, (1 - t) / 0.15) : 1);
        },
      }, t0);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        en.isIntersecting ? tl.play() : tl.pause();
      });
    });

    const overlay = mapOverlayRef.current;
    if (overlay) io.observe(overlay);

    return () => {
      tl.kill();
      if (overlay) io.unobserve(overlay);
    };
  }, []);

  // Map pin tooltip — a small popover anchored directly above/below the
  // marker (via getBoundingClientRect, so it tracks the map's actual
  // rendered scale) with an arrow pointing at it. Desktop/tablet show it on
  // hover; touch devices (no hover) show/hide it on tap instead, since
  // permanent labels are hidden on mobile.
  useEffect(() => {
    const overlay = mapOverlayRef.current;
    const tooltip = mapTooltipRef.current;
    if (!overlay || !tooltip) return;

    const cityEl = tooltip.querySelector('[data-role="city"]');
    const countryEl = tooltip.querySelector('[data-role="country"]');
    const typeEl = tooltip.querySelector('[data-role="type"]');
    const roleLabels = {
      hq: t('home.regions.office_hq', 'Global Headquarters'),
      regional: t('home.regions.office_regional', 'Regional Office'),
      soon: t('home.regions.office_soon', 'Coming soon'),
    };

    const showTooltip = (pin) => {
      const city = OFFICES_BY_KEY[pin.dataset.city];
      const core = pin.querySelector('.pin-core');
      const anchor = (core || pin).getBoundingClientRect();
      const cx = anchor.left + anchor.width / 2;
      const cy = anchor.top + anchor.height / 2;

      cityEl.textContent = city.city;
      countryEl.textContent = city.country;
      typeEl.textContent = roleLabels[city.role] || roleLabels.regional;

      tooltip.classList.toggle('mt-soon', city.role === 'soon');
      tooltip.classList.add('on');
      const margin = 12;
      const gap = 16;
      const tw = tooltip.offsetWidth;
      const th = tooltip.offsetHeight;
      const above = cy - gap - th > margin;
      tooltip.classList.toggle('tooltip-above', above);
      tooltip.classList.toggle('tooltip-below', !above);

      const left = Math.min(Math.max(cx, tw / 2 + margin), window.innerWidth - tw / 2 - margin);
      const top = above ? cy - gap - th : cy + gap;
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${Math.min(Math.max(top, margin), window.innerHeight - th - margin)}px`;
    };

    const hideTooltip = () => tooltip.classList.remove('on');

    const pins = Array.from(overlay.querySelectorAll('.map-pin'));
    const canHover = window.matchMedia('(hover: hover)').matches;
    const cleanups = [];

    if (canHover) {
      pins.forEach((pin) => {
        const onEnter = () => showTooltip(pin);
        pin.addEventListener('mouseenter', onEnter);
        pin.addEventListener('mouseleave', hideTooltip);
        cleanups.push(() => {
          pin.removeEventListener('mouseenter', onEnter);
          pin.removeEventListener('mouseleave', hideTooltip);
        });
      });
    } else {
      let openPin = null;
      const onDocClick = (e) => {
        if (openPin && !openPin.contains(e.target)) {
          hideTooltip();
          openPin = null;
        }
      };
      pins.forEach((pin) => {
        const onTap = (e) => {
          e.stopPropagation();
          if (openPin === pin) {
            hideTooltip();
            openPin = null;
          } else {
            showTooltip(pin);
            openPin = pin;
          }
        };
        pin.addEventListener('click', onTap);
        cleanups.push(() => pin.removeEventListener('click', onTap));
      });
      document.addEventListener('click', onDocClick);
      cleanups.push(() => document.removeEventListener('click', onDocClick));
    }

    return () => {
      hideTooltip();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [t]);

  // Hovering an office card highlights its marker. Done by toggling a class on
  // the existing <g class="map-pin"> rather than by re-rendering the SVG: the
  // pins carry running SMIL <animate> pulses, and re-rendering them would
  // restart every pulse from zero on each hover.
  useEffect(() => {
    const overlay = mapOverlayRef.current;
    if (!overlay) return undefined;
    const pins = Array.from(overlay.querySelectorAll('.map-pin'));
    pins.forEach((pin) => pin.classList.toggle('is-focus', pin.dataset.city === focusedOffice));
    return () => pins.forEach((pin) => pin.classList.remove('is-focus'));
  }, [focusedOffice]);

  const statementText = () => {
    const text = t('home.statement.text', 'A screen in a boardroom. A wall of pixels in a terminal. A voice that carries to the last row. ');
    const emText = t('home.statement.emText', 'Someone has to get that technology there');
    const postText = t('home.statement.postText', ' — sourced, specified and supported. That is the work we do.');

    const renderWords = (str) => {
      return str.split(/(\s+)/).map((word, i) => {
        if (/^\s+$/.test(word)) return word;
        return <span key={i} className="st-w">{word}</span>;
      });
    };

    return (
      <p id="stText">
        {renderWords(text)}
        <em>{renderWords(emText)}</em>
        {renderWords(postText)}
      </p>
    );
  };

  const edgeItems = [
    { title: t('home.edgeItems.0.title'), desc: t('home.edgeItems.0.desc'), visual: '/assets/img/unsplash-1486406146926-c627a92ad1ab-w1100.jpg', caption: t('home.edgeItems.0.caption') },
    { title: t('home.edgeItems.1.title'), desc: t('home.edgeItems.1.desc'), visual: '/assets/img/pexels-33966530-w1100.jpg', caption: t('home.edgeItems.1.caption') },
    { title: t('home.edgeItems.2.title'), desc: t('home.edgeItems.2.desc'), visual: '/assets/img/unsplash-1522071820081-009f0129c71c-w1100.jpg', caption: t('home.edgeItems.2.caption') },
    { title: t('home.edgeItems.3.title'), desc: t('home.edgeItems.3.desc'), visual: '/assets/img/unsplash-1504384308090-c894fdcc538d-w1100.jpg', caption: t('home.edgeItems.3.caption') },
  ];

  // City-only labels ("Dubai (HQ)", "Jeddah", "Paris — Coming soon", ...) —
  // country and office type live in the hover tooltip instead, to keep the map
  // itself uncluttered.
  const labeledPins = useMemo(() => {
    const hqSuffix = t('home.regions.hq_suffix', '(HQ)');
    const soonSuffix = t('home.regions.soon_suffix', '— Coming soon');
    return layoutMapLabels(
      OFFICES.map((office) => {
        const p = projectOffice(office);
        const label = t(`home.cities.${office.key}`, office.city);
        const suffix = office.role === 'hq' ? ` ${hqSuffix}` : office.role === 'soon' ? ` ${soonSuffix}` : '';
        return {
          key: office.key,
          city: office,
          x: p.x,
          y: p.y,
          isHQ: office.role === 'hq',
          role: office.role,
          text: `${label}${suffix}`,
        };
      })
    );
  }, [t]);

  return (
    <div ref={containerRef}>
      {/* HERO SECTION */}
      <section className="hero" aria-label="Introduction">
        {/* The element keeps id="heroImg" from the still it replaced, so the
            existing intro tween (scale + brightness ramp) and the scroll
            parallax bind to it untouched — a <video> animates identically.

            aria-hidden: it is a background behind the headline, carrying no
            information the copy does not already state. tabIndex={-1} keeps it
            out of the tab order, since a <video> is focusable by default even
            without controls. */}
        <div className="hero-media">
          <video
            id="heroImg"
            ref={heroVideoRef}
            poster="/assets/videos/hero-poster.jpg"
            autoPlay={!prefersReducedMotion}
            preload={prefersReducedMotion ? 'none' : 'metadata'}
            muted
            loop
            playsInline
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={`/assets/videos/hero-video${videoVariant}.webm`} type="video/webm" />
            {/* H.264 fallback for Safari versions without VP9-in-WebM. */}
            <source src={`/assets/videos/hero-video${videoVariant}.mp4`} type="video/mp4" />
          </video>
        </div>
        {/* Drawn outside .hero-media so the scroll parallax moves the footage
            and not the gradient — the two used to share an element, which made
            the overlay creep upward as the page scrolled. */}
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow" id="heroEyebrow">
              <i aria-hidden="true" />
              {t('home.hero.eyebrow', 'Global presence. Local impact.')}
            </p>

            {/* Three masked lines. Each .w is translated inside its own
                overflow-hidden mask, so the headline wipes up rather than
                fading — the only piece of motion in the hero that is allowed
                to be noticed. */}
            <h1 className="display" id="heroH">
              <span className="line-mask"><span className="w">{t('home.hero.hl1', 'Technology')}</span></span>
              <span className="line-mask"><span className="w">{t('home.hero.hl2', 'of the future,')}</span></span>
              <span className="line-mask"><span className="w"><em>{t('home.hero.hl3', 'today.')}</em></span></span>
            </h1>

            {/* The closing phrase is set solid white against the paragraph's
                muted grey — the comp's one piece of emphasis in the body copy,
                and the half of the sentence that carries the positioning. */}
            <p className="hero-lede" id="heroBrief">
              {t('home.hero.lede', 'We deliver end-to-end AV, technology, and distribution solutions that empower businesses, connect people, and drive innovation ')}
              <strong>{t('home.hero.lede_accent', 'across the region.')}</strong>
            </p>

            <div className="hero-actions" id="heroActions">
              <Button solid href="#solutions">
                <span>{t('home.hero.cta_primary', 'Explore solutions')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Button>
              <Button href="#regions">
                <span>{t('home.hero.cta_secondary', 'Our global presence')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
                  {HERO_STAT_ICONS.globe}
                </svg>
              </Button>
            </div>
          </div>

          <div className="hero-base">
            <ul className="hero-stats" id="heroStats">
              {HERO_STATS.map(({ key, value, label, sub, icon }) => (
                <li key={key}>
                  <span className="hs-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      {HERO_STAT_ICONS[icon]}
                    </svg>
                  </span>
                  <span className="hs-body">
                    <b>{t(`home.hero.stats.${key}.value`, value)}</b>
                    <span>{t(`home.hero.stats.${key}.label`, label)}</span>
                    <em>{t(`home.hero.stats.${key}.sub`, sub)}</em>
                  </span>
                </li>
              ))}
            </ul>

            <div className="hero-cue" data-cue={cueVisible ? 'on' : 'off'} aria-hidden="true">
              <div className="hero-scrollcue">
                <svg className="cue-mouse" viewBox="0 0 16 26" fill="none" aria-hidden="true">
                  <rect x="0.75" y="0.75" width="14.5" height="24.5" rx="7.25" stroke="currentColor" strokeWidth="1.2" />
                  <circle className="cue-dot" cx="8" cy="7" r="2" fill="var(--red)" />
                </svg>
                {t('home.hero.scroll_cue', 'Scroll to explore')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND TICKER STRIP */}
      <div className="strip" aria-label="Represented manufacturers">
        <div className="strip-track">
          <span>Samsung Professional</span><span>Crestron</span><span>Extron</span><span>Shure</span><span>Barco</span><span>LG Electronics</span><span>Sony Professional</span><span>Biamp</span><span>QSC</span><span>Christie</span><span>Sennheiser</span><span>Epson</span>
          <span aria-hidden="true">Samsung Professional</span><span aria-hidden="true">Crestron</span><span aria-hidden="true">Extron</span><span aria-hidden="true">Shure</span><span aria-hidden="true">Barco</span><span aria-hidden="true">LG Electronics</span><span aria-hidden="true">Sony Professional</span><span aria-hidden="true">Biamp</span><span aria-hidden="true">QSC</span><span aria-hidden="true">Christie</span><span aria-hidden="true">Sennheiser</span><span aria-hidden="true">Epson</span>
        </div>
      </div>

      {/* POSITIONING PILLARS — the three claims the rest of the page has to
          earn: global company / regional presence, value-added distribution
          rather than box moving, and future technology available now.

          Previously three identical bordered boxes with a numeral on top,
          which read as filler beside the sections either side of it. Rebuilt as
          a numbered ledger: a sticky heading column on the left, three rows on
          the right carrying an icon mark, a short tag, the claim and the
          reasoning, over an oversized outlined numeral. Same words, same
          palette — the difference is hierarchy, so the eye lands on the claim
          before the paragraph instead of scanning three equal blocks. */}
      <section className="pillars" aria-label={t('home.pillars.label', 'What sets us apart')}>
        <div className="pillars-layout">
          <div className="pillars-head">
            <span className="label label--red">{t('home.pillars.label')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>
              {t('home.pillars.title_main')} <em>{t('home.pillars.title_em')}</em>
            </h2>
            <span className="pillars-rule" aria-hidden="true" />
          </div>

          <ol className="pillar-ledger">
            {PILLAR_MARKS.map(({ icon, tagFallback }, i) => (
              <li className="pillar-row reveal" key={icon}>
                <span className="pillar-ghost" aria-hidden="true">{`0${i + 1}`}</span>
                <div className="pillar-mark" aria-hidden="true">
                  <SolutionIcon name={icon} />
                </div>
                <div className="pillar-body">
                  <span className="pillar-tag">
                    <i aria-hidden="true" />
                    {t(`home.pillars.items.${i}.tag`, tagFallback)}
                  </span>
                  <h3>{t(`home.pillars.items.${i}.title`)}</h3>
                  <p>{t(`home.pillars.items.${i}.desc`)}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* STATEMENT SECTION */}
      <section className="statement" aria-label="About Mindstec">
        {statementText()}
        <div className="statement-side reveal">
          <div className="thumb reveal-img">
            <img src="/assets/img/pexels-13136106-w900.jpg" alt="A crowd silhouetted in a dark exhibition hall in front of a giant glowing projection" loading="lazy" />
          </div>
          <small>{t('home.statement.side_text')}</small>
        </div>
      </section>

      <div className="rule"></div>

      {/* SOLUTIONS SECTION */}
      <section className="solutions" id="solutions">
        {/* Animated wave lines behind the grid. Absolutely positioned to this
            section, which is why .solutions is position: relative. */}
        <WaveBackdrop />
        <div className="section-head">
          <div>
            <span className="label label--red">{t('home.solutions.label')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>{t('home.solutions.title_main')} <em>{t('home.solutions.title_em')}</em></h2>
          </div>
          <p className="lede side">{t('home.solutions.lede')}</p>
        </div>
        <SolutionGrid
          items={solutionRows}
          id="solGrid"
          cta={t('solutions.explore', 'Explore')}
        />
      </section>

      <div className="rule"></div>

      {/* STATS SECTION */}
      <section className="stats" aria-label="Company figures">
        <div className="stats-grid">
          <div className="stat-cell reveal">
            <div className="value"><span className="count" data-to="15">0</span><sup>+</sup></div>
            <p className="desc">{t('home.stats.years_desc')}</p>
          </div>
          <div className="stat-cell reveal">
            <div className="value"><span className="count" data-to="49">0</span><sup>+</sup></div>
            <p className="desc">{t('home.stats.brands_desc')}</p>
          </div>
          <div className="stat-cell reveal">
            <div className="value"><span className="count" data-to="3">0</span></div>
            <p className="desc">{t('home.stats.ops_desc')}</p>
          </div>
          <div className="stat-cell reveal">
            <div className="value"><span className="count" data-to="973">0</span><sup>+</sup></div>
            <p className="desc">{t('home.stats.installs_desc')}</p>
          </div>
        </div>
      </section>

      <div className="rule"></div>

      {/* EDGE SECTION */}
      <section className="edge" id="edge">
        <div className="section-head">
          <div>
            <span className="label label--red">{t('home.edge.label')}</span>
            {/* No hard <br />. The forced break put "like a partner" on its own
                line regardless of the width available or the language in use;
                `text-wrap: balance` (index.css) now splits the heading evenly
                wherever it actually needs to break. */}
            <h2 className="display" style={{ marginTop: '16px' }}>{t('home.edge.title_main')} {t('home.edge.title_em')} <em>{t('home.edge.partner', 'partner')}</em></h2>
          </div>
        </div>
        <div className="edge-layout">
          <div className="edge-visual reveal-img" id="edgeVisual">
            <img className="on" src="/assets/img/unsplash-1486406146926-c627a92ad1ab-w1100.jpg" alt="Dark glass office towers photographed from street level" loading="lazy" />
            <img src="/assets/img/pexels-33966530-w1100.jpg" alt="Extreme close-up of an LED panel with rows of glowing pixels fading into darkness" loading="lazy" />
            <img src="/assets/img/unsplash-1522071820081-009f0129c71c-w1100.jpg" alt="A team working together on laptops around a wooden table" loading="lazy" />
            <img src="/assets/img/unsplash-1504384308090-c894fdcc538d-w1100.jpg" alt="A large open-plan office floor with rows of desks" loading="lazy" />
            <span className="edge-caption" id="edgeCaption">{t('home.edgeItems.0.caption')}</span>
          </div>
          <div className="edge-list" id="edgeList" ref={edgeListRef}>
            {edgeItems.map((item, i) => (
              <div
                key={i}
                className={`edge-item ${i === 0 ? 'open' : ''}`}
                data-visual={i}
                data-caption={item.caption}
              >
                <button className="edge-q">
                  <span className="num">{(i + 1).toString().padStart(2, '0')}</span>
                  <h3>{item.title}</h3>
                  <span className="ind" aria-hidden="true"></span>
                </button>
                <div className="edge-a">
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GLOBAL REACH BANNER */}
      <section className="band" aria-label="Global reach">
        <img id="bandImg" src="/assets/img/unsplash-1451187580459-43490279c0fa-w2000.jpg" alt="Earth photographed from orbit at night, city lights glowing across the surface" loading="lazy" />
        <div className="band-inner">
          <span className="label">{t('home.band.label')}</span>
          <h2 className="display" id="bandH">{t('home.band.title_main')} <em>{t('home.band.title_em')}</em></h2>
        </div>
      </section>

      {/* REGIONS MAP SECTION */}
      <section className="regions" id="regions">
        <div className="section-head">
          <div>
            <span className="label label--red">{t('home.regions.label')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>{t('home.regions.title_main')} <em>{t('home.regions.title_em')}</em></h2>
          </div>
          <p className="lede side">{t('home.regions.lede')}</p>
        </div>
        <div className="map-wrap reveal">
          <div className="map-base" id="mapBase" ref={mapBaseRef} aria-hidden="true"></div>
          <svg
            className="map-overlay"
            id="mapOverlay"
            ref={mapOverlayRef}
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`World map showing Mindstec supply routes from the ${OFFICES_BY_KEY[HQ_KEY].city} headquarters to ${ACTIVE_OFFICES.filter((o) => o.key !== HQ_KEY).map((o) => o.city).join(', ')}, plus a planned office in Paris, France`}
          >
            <defs>
              <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#CC0001" stopOpacity="0" />
                <stop offset="8%" stopColor="#CC0001" stopOpacity="1" />
                <stop offset="92%" stopColor="#CC0001" stopOpacity="1" />
                <stop offset="100%" stopColor="#CC0001" stopOpacity="0" />
              </linearGradient>
              <filter id="mapGlow">
                <feMorphology operator="dilate" radius="0.5" />
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Arcs & Traveling Dots */}
            {ROUTES.map((route, i) => {
              const s = projectOffice(OFFICES_BY_KEY[route[0]]);
              const e = projectOffice(OFFICES_BY_KEY[route[1]]);
              const m = { x: (s.x + e.x) / 2, y: Math.min(s.y, e.y) - 50 };
              return (
                <g key={i}>
                  <path
                    ref={(el) => (pathsRef.current[i] = el)}
                    d={`M ${s.x} ${s.y} Q ${m.x} ${m.y} ${e.x} ${e.y}`}
                    fill="none"
                    stroke="url(#mapGrad)"
                    strokeWidth="1"
                  />
                  <circle
                    ref={(el) => (dotsRef.current[i] = el)}
                    r="2.5"
                    fill="#CC0001"
                    opacity="0"
                  />
                </g>
              );
            })}

            {/* Pins with pulsating rings & city labels. Dubai (HQ) gets a
                larger core and a stronger, faster pulse; a `soon` marker is
                drawn hollow in white so it reads as an announcement rather
                than as another live office. */}
            {labeledPins.map((pin, idx) => {
              const isSoon = pin.role === 'soon';
              const baseR = pin.isHQ ? 4.5 : 3;
              const pulseTo = pin.isHQ ? 18 : 12;
              const pulseOpacity = pin.isHQ ? 0.75 : 0.6;
              const pulseDur = pin.isHQ ? '1.6s' : '2s';
              const colour = isSoon ? '#FAFAFA' : '#CC0001';
              const roleLabel = isSoon
                ? t('home.regions.office_soon', 'Coming soon')
                : pin.isHQ
                  ? t('home.regions.office_hq', 'Global Headquarters')
                  : t('home.regions.office_regional', 'Regional Office');
              return (
                <g
                  key={pin.key}
                  className={`map-pin${pin.isHQ ? ' map-pin--hq' : ''}${isSoon ? ' map-pin--soon' : ''}`}
                  data-city={pin.key}
                >
                  <title>{`${pin.city.city}, ${pin.city.country} — ${roleLabel}`}</title>
                  <circle className="pin-halo" cx={pin.x} cy={pin.y} r={baseR + 3} fill={colour} />
                  <circle
                    className="pin-core"
                    cx={pin.x}
                    cy={pin.y}
                    r={baseR}
                    fill={isSoon ? 'none' : colour}
                    stroke={isSoon ? colour : 'none'}
                    strokeWidth={isSoon ? 1.4 : 0}
                    strokeDasharray={isSoon ? '2 1.6' : undefined}
                    filter={isSoon ? undefined : 'url(#mapGlow)'}
                  />
                  {!isSoon && (
                    <circle cx={pin.x} cy={pin.y} r={baseR} fill={colour} opacity="0.5">
                      <animate
                        attributeName="r"
                        from={baseR}
                        to={pulseTo}
                        dur={pulseDur}
                        begin={`${idx * 0.25}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from={pulseOpacity}
                        to="0"
                        dur={pulseDur}
                        begin={`${idx * 0.25}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  {pin.displaced && (
                    <line className="map-leader" x1={pin.x} y1={pin.y} x2={pin.edgeX} y2={pin.edgeY} />
                  )}
                  <g className="map-label">
                    <rect x={pin.lx - pin.w / 2} y={pin.ly - LABEL_H / 2} width={pin.w} height={LABEL_H} rx="3" />
                    <text x={pin.lx} y={pin.ly - LABEL_H / 2 + LABEL_H * 0.68} textAnchor="middle">
                      {pin.text}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
          <div className="map-tooltip" ref={mapTooltipRef} aria-hidden="true">
            <div className="mt-city">
              <span className="mt-pin" aria-hidden="true">📍</span>
              <span data-role="city"></span>
            </div>
            <div className="mt-country" data-role="country"></div>
            <div className="mt-type" data-role="type"></div>
          </div>
        </div>
        {/* Legend — the map now carries three marker treatments, so say what
            they mean instead of leaving it to the hover tooltip. */}
        <ul className="map-legend reveal" aria-label={t('home.regions.legend_label', 'Map key')}>
          <li><i className="lg-dot lg-dot--hq" aria-hidden="true" />{t('home.regions.office_hq', 'Global Headquarters')}</li>
          <li><i className="lg-dot" aria-hidden="true" />{t('home.regions.office_regional', 'Regional Office')}</li>
          <li><i className="lg-dot lg-dot--soon" aria-hidden="true" />{t('home.regions.office_soon', 'Coming soon')}</li>
        </ul>

        {/* Office directory. Hovering a card lights up its marker (and vice
            versa) via a shared data-city attribute, so the two halves of the
            section read as one object rather than a map and a list. */}
        <div className="offices reveal">
          {ACTIVE_OFFICES.map((office) => {
            // Only the office matching the visitor's selected region can show
            // a phone/address: those come from the CMS RegionContact row for
            // that region, and there is no per-city record to read for others.
            const showRegionContact = office.region === region && regionContact;
            return (
              <article
                key={office.key}
                className={`office ${office.role === 'hq' ? 'office--hq' : ''}`}
                data-office={office.key}
                onMouseEnter={() => setFocusedOffice(office.key)}
                onMouseLeave={() => setFocusedOffice(null)}
              >
                <header className="office-head">
                  <h3>{t(`home.cities.${office.key}`, office.city)}</h3>
                  <span className={`office-tag ${office.role === 'hq' ? 'office-tag--hq' : ''}`}>
                    {office.role === 'hq'
                      ? t('home.regions.office_hq', 'Global Headquarters')
                      : t('home.regions.office_regional', 'Regional Office')}
                  </span>
                </header>
                <p className="office-country">{t(`home.countries.${office.key}`, office.country)}</p>
                <p className="office-coverage">
                  {t(`home.offices.${office.key}`, `Serving ${office.country} and neighbouring markets.`)}
                </p>
                <div className="office-links">
                  {showRegionContact && (regionContact.phone_display || regionContact.phone) && (
                    <a href={`tel:${(regionContact.phone_display || regionContact.phone).replace(/[^+\d]/g, '')}`}>
                      {regionContact.phone_display || regionContact.phone}
                    </a>
                  )}
                  {office.email && <a href={`mailto:${office.email}`}>{office.email}</a>}
                </div>
                {showRegionContact && regionContact.address && (
                  <address className="office-address">{regionContact.address}</address>
                )}
              </article>
            );
          })}
        </div>

        <div className="offices-foot reveal">
          <p>{t('home.regions.foot', 'Stock, currency, warranty and people — all handled in-region.')}</p>
          <Button to="/contact" className="text-link">
            <span>{t('home.regions.foot_btn', 'Find your local desk')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Button>
        </div>
      </section>

      {/* INSTALLATIONS GRID */}
      <section className="work" id="work">
        <div className="section-head">
          <div>
            <span className="label label--red">{t('home.work.label')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>{t('home.work.title_main')} <em>{t('home.work.title_em')}</em></h2>
          </div>
          <p className="lede side">{t('home.work.lede')}</p>
        </div>
        <div className="work-grid-premium">
          {fieldworkLoading ? (
            // Skeleton placeholders while fetching
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="work-card work-card--skeleton">
                <div className="work-card-image work-card-image--skeleton"></div>
                <div className="work-card-content">
                  <span className="work-card-category--skeleton"></span>
                  <div className="work-card-title--skeleton"></div>
                  <div className="work-card-meta--skeleton"></div>
                </div>
              </div>
            ))
          ) : fieldwork.length === 0 ? (
            <div className="work-empty">
              <b>{t('home.work.empty_title', 'Case studies in preparation')}</b>
              <span>
                {t(
                  'home.work.empty',
                  'Recent installations are being written up with our partners. In the meantime, talk to us about work in your sector.'
                )}
              </span>
            </div>
          ) : (
            fieldwork.map((project) => (
              <div key={project.id} className="work-card" data-reveal>
                <div className="work-card-image">
                  <img src={project.image} alt={project.title} loading="lazy" />
                  <div className="work-card-overlay"></div>
                </div>
                <div className="work-card-content">
                  <span className="work-card-category">{project.category}</span>
                  <h3 className="work-card-title">{project.title}</h3>
                  <p className="work-card-meta">{project.location_meta}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="work-more reveal">
          {/* Points at the real case-study index now, not back at the contact
              form on the same page. */}
          <Button to="/projects" className="text-link">
            <span>{t('home.work.btn')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Button>
        </div>
      </section>

      <div className="rule"></div>

      {/* TESTIMONIALS MARQUEE */}
      {marqueeTestimonials.length > 0 && (
        <section id="testimonials" aria-label="Client testimonials" className="relative">
          <TestimonialsSection
            title={
              <>
                {t('home.testimonials.title_main', 'What our')} <em>{t('home.testimonials.title_em', 'clients say')}</em>
              </>
            }
            description={t('home.testimonials.subtitle', 'Hear directly from our valued clients and global partners.')}
            testimonials={marqueeTestimonials}
          />
        </section>
      )}


      <div className="rule"></div>

      {/* JOURNAL GRID */}
      <section className="journal" id="journal">
        <div className="section-head">
          <div>
            <span className="label label--red">{t('home.journal.label')}</span>
            <h2 className="display" style={{ marginTop: '16px' }}>{t('home.journal.title_main')} <em>{t('home.journal.title_em')}</em></h2>
          </div>
          <Button to="/blogs" className="text-link">
            <span>{t('home.journal.btn')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Button>
        </div>
        <div className="journal-grid">
          <Link className="post reveal" to="/blogs">
            <div className="post-img">
              <img src="/assets/img/pexels-18304031-w900.jpg" alt="A dark desk setup with one large monitor and a second vertical display" loading="lazy" />
            </div>
            <div className="post-body">
              <div className="post-meta"><span className="cat">{t('home.journal.posts.post1.cat')}</span><span>{t('home.journal.posts.post1.read')}</span></div>
              <h3>{t('home.journal.posts.post1.title')}</h3>
              <div className="post-foot">{t('home.journal.posts.post1.date')}</div>
            </div>
          </Link>
          <Link className="post reveal" to="/blogs">
            <div className="post-img">
              <img src="/assets/img/unsplash-1518770660439-4636190af475-w900.jpg" alt="Macro photograph of a circuit board with processors and components" loading="lazy" />
            </div>
            <div className="post-body">
              <div className="post-meta"><span className="cat">{t('home.journal.posts.post2.cat')}</span><span>{t('home.journal.posts.post2.read')}</span></div>
              <h3>{t('home.journal.posts.post2.title')}</h3>
              <div className="post-foot">{t('home.journal.posts.post2.date')}</div>
            </div>
          </Link>
          <Link className="post reveal" to="/blogs">
            <div className="post-img">
              <img src="/assets/img/pexels-6476782-w900.jpg" alt="A presenter pointing at a large projected chart in a dim training room" loading="lazy" />
            </div>
            <div className="post-body">
              <div className="post-meta"><span className="cat">{t('home.journal.posts.post3.cat')}</span><span>{t('home.journal.posts.post3.read')}</span></div>
              <h3>{t('home.journal.posts.post3.title')}</h3>
              <div className="post-foot">{t('home.journal.posts.post3.date')}</div>
            </div>
          </Link>
        </div>
      </section>

      <div className="rule"></div>

      {/* CTA SECTION */}
      <section className="cta" id="contact">
        <span className="label label--red">{t('home.cta.label')}</span>
        <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
          <span className="line-mask"><span className="w">{t('home.cta.title_main1')}</span></span>
          <span className="line-mask"><span className="w">{t('home.cta.title_main2')} <em>{t('home.cta.title_em')}</em></span></span>
        </h2>
        <div className="cta-row reveal">
          <div className="cta-actions">
            <Button solid to="/contact">
              <span>{t('home.cta.btn1')}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </Button>
            <Button to="/contact?s=partner">
              <span>{t('home.cta.btn2')}</span>
            </Button>
          </div>
          <div className="cta-contacts">
            <div className="c-item"><span>{t('contact_info.label')}</span><a href={`tel:${t('contact_info.tel_href')}`}>{t('contact_info.tel_label')}</a></div>
            <div className="c-item"><span>{t('home.cta.global_label', 'Global enquiries')}</span><a href={`mailto:${t('contact_info.email')}`}>{t('contact_info.email')}</a></div>
            <div className="c-item"><span>{t('contact_info.partner_label')}</span><a href={`mailto:${t('contact_info.partner_email')}`}>{t('contact_info.partner_email')}</a></div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
