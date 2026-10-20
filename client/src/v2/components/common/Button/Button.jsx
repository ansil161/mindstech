import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const Button = ({
  children,
  to,
  href,
  onClick,
  solid = false,
  className = '',
  ...props
}) => {
  const btnRef = useRef(null);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    if (reduceMotion || !isFinePointer) return;

    const onPointerMove = (e) => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * 0.18;
      const dy = (e.clientY - r.top - r.height / 2) * 0.3;

      gsap.to(btn, {
        x: dx,
        y: dy,
        duration: 0.45,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    };

    const onPointerLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.65,
        ease: 'elastic.out(1, 0.4)',
        overwrite: 'auto',
      });
    };

    btn.addEventListener('pointermove', onPointerMove);
    btn.addEventListener('pointerleave', onPointerLeave);

    return () => {
      btn.removeEventListener('pointermove', onPointerMove);
      btn.removeEventListener('pointerleave', onPointerLeave);
      gsap.killTweensOf(btn);
    };
  }, []);

  const baseClasses = `btn ${solid ? 'btn--solid' : ''} ${className}`;

  if (to) {
    return (
      <Link ref={btnRef} to={to} className={baseClasses} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={btnRef} href={href} className={baseClasses} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button ref={btnRef} type="button" onClick={onClick} className={baseClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
