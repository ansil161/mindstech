import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import axios from '../../api/axios';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';

gsap.registerPlugin(ScrollTrigger);

const Blogs = () => {
  const containerRef = useRef(null);
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);

  // Dynamic Translations
  const { translatedData: translatedPosts, isTranslating: isTranslatingPosts } = useDynamicTranslation(posts, ['title', 'desc', 'cat'], 'blogs_list');
  const { translatedData: translatedFeatured, isTranslating: isTranslatingFeatured } = useDynamicTranslation(featuredPost, ['title', 'desc', 'cat'], 'featured_blog');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get('/admin/blogs/');
        if (res.data && res.data.length > 0) {
          const featured = res.data.find(b => b.is_featured) || res.data[0];
          setFeaturedPost(featured);
          const remaining = res.data.filter(b => b.id !== featured.id);
          setPosts(remaining);
        }
      } catch (err) {
        console.error("Failed to load dynamic blogs:", err);
      }
    };
    fetchBlogs();
  }, []);

  // Entrance and scroll reveals
  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        return;
      }

      // Hero Entrance Timeline
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.fromTo('#sheroH .w', 
          { yPercent: 115, rotate: 2 }, 
          { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.1, ease: 'power4.out' })
        .fromTo('#sheroSide', 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 1.0 }, 
          '-=.8');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    // Clear any existing ScrollTriggers to prevent duplicates on state updates
    const triggers = ScrollTrigger.getAll().filter(t => 
      t.trigger && (t.trigger.classList.contains('reveal') || t.trigger.classList.contains('bfeat'))
    );
    triggers.forEach(t => t.kill());

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        gsap.set('.bfeat', { opacity: 1, y: 0 });
        return;
      }

      // Featured post slide up
      gsap.fromTo('.bfeat', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power4.out',
          scrollTrigger: {
            trigger: '.bfeat',
            start: 'top 86%',
            once: true,
          }
        }
      );

      // Generic reveals
      gsap.utils.toArray('.reveal').forEach(el => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            once: true,
          }
        });
      });

      // CTA masked headline
      gsap.fromTo('#ctaH .w', { yPercent: 110 }, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: '#contact',
          start: 'top 72%',
          once: true,
        }
      });

      gsap.fromTo('.cta-bg img', { yPercent: -6 }, {
        yPercent: 6,
        ease: 'none',
        scrollTrigger: {
          trigger: '.cta',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        }
      });
    }, containerRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [posts, featuredPost]);

  return (
    <main id="top" ref={containerRef}>
      {/* HERO */}
      <section className="shero" aria-label="Blogs">
        <h1 className="display" id="sheroH">
          <span className="line-mask"><span className="w">{t('blogs.hero.line1')}</span></span>
          <span className="line-mask"><span className="w">{t('blogs.hero.line2', 'the AV floor.')}</span></span>
        </h1>
        <div className="shero-side reveal" id="sheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>{t('blogs.hero.label')}</span>
          <p>{t('blogs.hero.brief')}</p>
        </div>
      </section>

      {/* FEATURED */}
      {translatedFeatured && (
        <a className={`bfeat ${isTranslatingFeatured ? 'opacity-50' : ''}`} href={translatedFeatured.href} target="_blank" rel="noopener noreferrer" style={{ transition: 'opacity 0.3s' }}>
          <span className="bf-tag">{t('blogs.featured')}</span>
          <div className="bf-meta">
            <span className="cat">{translatedFeatured.cat}</span>
            <time datetime={translatedFeatured.dateStr || translatedFeatured.publish_date}>{translatedFeatured.date}</time>
          </div>
          <h2 className="display">{translatedFeatured.title}</h2>
          <p>{translatedFeatured.desc}</p>
          <span className="bf-go">
            {t('blogs.read_article')}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </span>
        </a>
      )}

      {/* GRID */}
      <div className="bwrap">
        <div className={`bgrid ${isTranslatingPosts ? 'opacity-50' : ''}`} style={{ transition: 'opacity 0.3s' }}>
          {translatedPosts.map((post, idx) => (
            <a className="bcard reveal" href={post.href} target="_blank" rel="noopener noreferrer" key={idx}>
              <div className="bc-meta">
                <span className="cat">{post.cat}</span>
                <time datetime={post.dateStr || post.publish_date}>{post.date}</time>
              </div>
              <h3>{post.title}</h3>
              <p>{post.desc}</p>
              <span className="bc-go">
                {t('blogs.read_article_short')} 
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </a>
          ))}
        </div>
        <div className="ball reveal">
          <a className="btn" href="https://www.mindstec.com/in/blogs/" target="_blank" rel="noopener noreferrer">
            <span>{t('blogs.browse_all')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 17L17 7M9 7h8v8" />
            </svg>
          </a>
        </div>
      </div>

      {/* CTA */}
      <section className="cta" id="contact">
        <div className="cta-bg" aria-hidden="true">
          <img src="/assets/uploads/2025/03/cta-bg.jpg" alt="" loading="lazy" />
        </div>
        <div className="cta-inner">
          <span className="label label--red">Talk shop with us</span>
          <h2 className="display" id="ctaH" style={{ marginTop: '20px' }}>
            <span className="line-mask"><span className="w">Questions the blog</span></span>
            <span className="line-mask"><span className="w"><em>didn't answer?</em></span></span>
          </h2>
          <div className="cta-row reveal">
            <div className="cta-actions">
              <Button to="/contact" className="btn btn--solid">
                <span>Ask a specialist</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </Button>
              <Button to="/solutions" className="btn"><span>See our solutions</span></Button>
            </div>
            <div className="cta-contacts">
              <div className="c-item"><span>{t('contact_info.label')}</span><a href={`tel:${t('contact_info.tel_href')}`}>{t('contact_info.tel_label')}</a></div>
              <div className="c-item"><span>Email</span><a href={`mailto:${t('contact_info.email')}`}>{t('contact_info.email')}</a></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Blogs;
