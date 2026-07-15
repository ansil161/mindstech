import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';
import axios from '../../../api/axios';

const BlogModal = ({ postId, onClose }) => {
  const { t } = useTranslation();
  const overlayRef = useRef(null);
  const drawerRef = useRef(null);
  const contentRef = useRef(null);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 1. Slide drawer up immediately on mount
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo(overlayRef.current,
      { opacity: 0 }, { opacity: 1, duration: 0.3 }
    )
    .fromTo(drawerRef.current,
      { y: '100%' }, { y: '0%', duration: 0.55, ease: 'expo.out' },
      '-=0.15'
    );

    // Stop Lenis so it doesn't swallow wheel events
    if (window.lenis) window.lenis.stop();
    document.body.style.overflow = 'hidden';

    // Lenis intercepts wheel events even when stopped via its raf loop.
    // We forward wheel events manually to the scroll container so it scrolls.
    const scrollEl = contentRef.current;
    const handleWheel = (e) => {
      e.stopPropagation();
      scrollEl.scrollTop += e.deltaY;
    };
    scrollEl.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
      scrollEl.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // 2. Fetch blog detail by id
  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    setError(false);
    axios.get(`/admin/blogs/${postId}/`)
      .then(res => { setPost(res.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [postId]);

  // 3. Stagger content in after data arrives
  useEffect(() => {
    if (loading || !contentRef.current) return;
    const items = contentRef.current.querySelectorAll('.bm-animate');
    if (!items.length) return;
    gsap.fromTo(items,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out' }
    );
  }, [loading]);

  const handleClose = () => {
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(drawerRef.current, { y: '100%', duration: 0.4, ease: 'expo.in' })
      .to(overlayRef.current, { opacity: 0, duration: 0.25 }, '-=0.25');
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const retry = () => {
    setError(false);
    setLoading(true);
    axios.get(`/admin/blogs/${postId}/`)
      .then(res => { setPost(res.data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  };

  const dateLabel = post?.date || post?.publish_date || '';

  return (
    <div className="bmodal-root" role="dialog" aria-modal="true" aria-label={post?.title || 'Blog detail'}>

      {/* Backdrop */}
      <div ref={overlayRef} className="bmodal-overlay" onClick={handleClose} aria-hidden="true" style={{ opacity: 0 }} />

      {/* Drawer */}
      <div ref={drawerRef} className="bmodal-drawer" style={{ transform: 'translateY(100%)' }}>

        <div className="bmodal-handle" aria-hidden="true" />

        <button className="bmodal-close" onClick={handleClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Scroll container */}
        <div className="bmodal-scroll" ref={contentRef}>

          {/* SKELETON */}
          {loading && (
            <div className="bmodal-loading">
              <div className="bmodal-skeleton bmodal-skeleton--meta" />
              <div className="bmodal-skeleton bmodal-skeleton--title" />
              <div className="bmodal-skeleton bmodal-skeleton--divider" />
              <div className="bmodal-skeleton bmodal-skeleton--line" />
              <div className="bmodal-skeleton bmodal-skeleton--line bmodal-skeleton--line-short" />
              <div className="bmodal-skeleton bmodal-skeleton--line" />
              <div className="bmodal-skeleton bmodal-skeleton--line bmodal-skeleton--line-short" />
            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="bmodal-error bm-animate" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              <p>{t('blogs.modal.error', 'Could not load this article. Please try again.')}</p>
              <button className="btn" onClick={retry}><span>Retry</span></button>
            </div>
          )}

          {/* CONTENT */}
          {!loading && !error && post && (
            <>
              {/* Meta row */}
              <div className="bmodal-meta bm-animate">
                <span className="bmodal-cat">{post.cat}</span>
                {dateLabel && (
                  <time className="bmodal-date" dateTime={post.publish_date}>{dateLabel}</time>
                )}
              </div>

              {/* Title */}
              <h2 className="bmodal-title display bm-animate">{post.title}</h2>

              {/* Divider */}
              <div className="bmodal-divider bm-animate" aria-hidden="true" />

              {/* If full content exists, show desc as lead + content as body */}
              {post.content ? (
                <>
                  <p className="bmodal-lead bm-animate">{post.desc}</p>
                  <div className="bmodal-body bm-animate">
                    {post.content.split(/\n{2,}/).filter(p => p.trim()).map((para, i) => (
                      <p key={i}>{para.trim()}</p>
                    ))}
                  </div>
                </>
              ) : (
                /* No content yet — show desc as the full readable article */
                <div className="bmodal-body bm-animate">
                  {post.desc.split(/\n{2,}/).filter(p => p.trim()).map((para, i) => (
                    <p key={i}>{para.trim()}</p>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="bmodal-tags bm-animate">
                <span className="bmodal-tag">{post.cat}</span>
                <span className="bmodal-tag">Article</span>
                {dateLabel && <span className="bmodal-tag">{dateLabel.split(' ').pop()}</span>}
              </div>

              {/* Back */}
              <div className="bmodal-actions bm-animate">
                <button className="bmodal-close-btn btn" onClick={handleClose}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  <span>Back to Blogs</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogModal;
