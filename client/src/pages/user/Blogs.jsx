import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../../components/common/Button/Button.jsx';
import BlogModal from '../../components/common/BlogModal/BlogModal.jsx';
import axios from '../../api/axios';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';

gsap.registerPlugin(ScrollTrigger);

const Blogs = () => {
  const containerRef = useRef(null);
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [featuredPost, setFeaturedPost] = useState(null);
  // Only store the id — BlogModal fetches the full detail itself
  const [activePostId, setActivePostId] = useState(null);

  const { translatedData: translatedPosts, isTranslating: isTranslatingPosts } =
    useDynamicTranslation(posts, ['title', 'desc', 'cat'], 'blogs_list');
  const { translatedData: translatedFeatured, isTranslating: isTranslatingFeatured } =
    useDynamicTranslation(featuredPost, ['title', 'desc', 'cat'], 'featured_blog');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get('/admin/blogs/');
        if (res.data && res.data.length > 0) {
          const featured = res.data.find(b => b.is_featured) || res.data[0];
          setFeaturedPost(featured);
          setPosts(res.data.filter(b => b.id !== featured.id));
        }
      } catch (err) {
        console.error('Failed to load dynamic blogs:', err);
      }
    };
    fetchBlogs();
  }, []);

  // Hero entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        return;
      }
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .fromTo('#sheroH .w',
          { yPercent: 115, rotate: 2 },
          { yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.1, ease: 'power4.out' })
        .fromTo('#sheroSide',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.0 }, '-=.8');
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Scroll reveals
  useEffect(() => {
    ScrollTrigger.getAll()
      .filter(tr => tr.trigger &&
        (tr.trigger.classList.contains('reveal') || tr.trigger.classList.contains('bfeat')))
      .forEach(tr => tr.kill());

    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('.reveal', { opacity: 1, y: 0 });
        gsap.set('.bfeat', { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo('.bfeat', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power4.out',
        scrollTrigger: { trigger: '.bfeat', start: 'top 86%', once: true },
      });

      gsap.utils.toArray('.reveal').forEach(el => {
        gsap.to(el, {
          opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        });
      });

      gsap.fromTo('#ctaH .w', { yPercent: 110 }, {
        yPercent: 0, duration: 1.1, stagger: 0.1, ease: 'power4.out',
        scrollTrigger: { trigger: '#contact', start: 'top 72%', once: true },
      });

      gsap.fromTo('.cta-bg img', { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }, containerRef);

    const timer = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => { ctx.revert(); clearTimeout(timer); };
  }, [posts, featuredPost]);

  return (
    <div ref={containerRef}>

      {/* HERO */}
      <section className="shero" aria-label="Blogs">
        <h1 className="display" id="sheroH">
          <span className="line-mask"><span className="w">{t('blogs.hero.line1')}</span></span>
          <span className="line-mask"><span className="w">{t('blogs.hero.line2', 'the AV floor.')}</span></span>
        </h1>
        <div className="shero-side reveal" id="sheroSide">
          <span className="label label--red" style={{ display: 'block', marginBottom: '18px' }}>
            {t('blogs.hero.label')}
          </span>
          <p>{t('blogs.hero.brief')}</p>
        </div>
      </section>

      {/* FEATURED */}
      {translatedFeatured && (
        <button
          className={`bfeat bfeat--btn ${isTranslatingFeatured ? 'opacity-50' : ''}`}
          onClick={() => setActivePostId(translatedFeatured.id)}
          style={{ transition: 'opacity 0.3s', textAlign: 'left', width: '100%', cursor: 'pointer' }}
          aria-label={`Read more about: ${translatedFeatured.title}`}
        >
          <div className="bfeat-layout">
            <div className="bfeat-content">
              <div className="bf-meta">
                <span className="cat">{translatedFeatured.cat}</span>
                <time dateTime={translatedFeatured.dateStr || translatedFeatured.publish_date}>
                  {translatedFeatured.date}
                </time>
              </div>
              <h2 className="display">{translatedFeatured.title}</h2>
              <p className="bfeat-desc">{translatedFeatured.desc}</p>
              <span className="bf-go">
                {t('blogs.read_article')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </div>
            <div className="bfeat-badge">
              <span className="bf-tag">{t('blogs.featured')}</span>
            </div>
          </div>
        </button>
      )}

      {/* GRID */}
      <div className="bwrap">
        <div className="bwrap-head reveal">
          <span className="label label--red">{t('blogs.all_articles', 'All Articles')}</span>
          <h2 className="bwrap-title">{t('blogs.grid_title', 'More from the floor')}</h2>
        </div>
        <div
          className={`bgrid ${isTranslatingPosts ? 'opacity-50' : ''}`}
          style={{ transition: 'opacity 0.3s' }}
        >
          {translatedPosts.map((post, idx) => (
            <button
              key={post.id ?? idx}
              className="bcard reveal"
              onClick={() => setActivePostId(post.id)}
              aria-label={`Read more about: ${post.title}`}
              style={{ textAlign: 'left', cursor: 'pointer', width: '100%' }}
            >
              <div className="bc-meta">
                <span className="cat">{post.cat}</span>
                <time dateTime={post.dateStr || post.publish_date}>{post.date}</time>
              </div>
              <h3>{post.title}</h3>
              <p className="bcard-desc">{post.desc}</p>
              <span className="bc-go">
                {t('blogs.read_article_short')}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </span>
            </button>
          ))}
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
              <div className="c-item">
                <span>{t('contact_info.label')}</span>
                <a href={`tel:${t('contact_info.tel_href')}`}>{t('contact_info.tel_label')}</a>
              </div>
              <div className="c-item">
                <span>Email</span>
                <a href={`mailto:${t('contact_info.email')}`}>{t('contact_info.email')}</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG DETAIL MODAL — opens when a card is clicked */}
      {activePostId && (
        <BlogModal postId={activePostId} onClose={() => setActivePostId(null)} />
      )}

    </div>
  );
};

export default Blogs;
