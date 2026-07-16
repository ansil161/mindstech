import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = 'Page not found — Mindstec Distribution';
  }, []);

  return (
    <>
      <style>{`
        .not-found-body {
          background: #0C0C0C;
          color: #FAFAFA;
          font-family: 'Inter', sans-serif;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 24px;
          text-align: center;
          -webkit-font-smoothing: antialiased;
        }
        .not-found-body a {
          color: inherit;
          text-decoration: none;
          cursor: pointer;
        }
        .not-found-body ::selection {
          background: #CC0001;
          color: #fff;
        }
        .not-found-body :focus-visible {
          outline: 2px solid #CC0001;
          outline-offset: 3px;
        }
        .not-found-body .logo img {
          height: 44px;
          width: auto;
          margin-bottom: 36px;
        }
        .not-found-body .code {
          font-family: 'Archivo', sans-serif;
          font-weight: 700;
          letter-spacing: -.04em;
          line-height: .9;
          font-size: clamp(96px, 22vw, 240px);
        }
        .not-found-body .code em {
          font-style: normal;
          color: #CC0001;
        }
        .not-found-body h1 {
          font-family: 'Archivo', sans-serif;
          font-weight: 600;
          letter-spacing: -.02em;
          font-size: clamp(20px, 3vw, 30px);
          margin-top: 18px;
        }
        .not-found-body p {
          color: #9A9A9A;
          font-size: 15px;
          line-height: 1.7;
          max-width: 46ch;
          margin-top: 10px;
        }
        .not-found-body .actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 36px;
        }
        .not-found-body .btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: .02em;
          padding: 16px 28px;
          min-height: 48px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 2px;
          overflow: hidden;
          transition: color .3s cubic-bezier(.22,1,.36,1), border-color .3s cubic-bezier(.22,1,.36,1);
          background: transparent;
          color: #FAFAFA;
        }
        .not-found-body .btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #CC0001;
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform .35s cubic-bezier(.22,1,.36,1);
          z-index: 0;
        }
        .not-found-body .btn:hover::before {
          transform: scaleY(1);
        }
        .not-found-body .btn:hover {
          border-color: #CC0001;
          color: #fff;
        }
        .not-found-body .btn > * {
          position: relative;
          z-index: 1;
        }
        .not-found-body .btn--solid {
          background: #CC0001;
          border-color: #CC0001;
        }
        .not-found-body .btn--solid::before {
          background: #fff;
        }
        .not-found-body .btn--solid:hover {
          color: #0C0C0C;
        }
      `}</style>

      <div className="not-found-body">
        <Link className="logo" to="/" aria-label="Mindstec home">
          <img src="/mindstec-logo-web.png" alt="Mindstec — Technology of the Future, Today" />
        </Link>
        <div className="code" aria-hidden="true">4<em>0</em>4</div>
        <h1>{t('not_found.title', "This page isn't on the floor.")}</h1>
        <p>{t('not_found.desc', 'The address may have changed, or it never existed. Everything we distribute is one click away.')}</p>
        <div className="actions">
          <Link className="btn btn--solid" to="/"><span>{t('not_found.home', 'Back to home')}</span></Link>
          <Link className="btn" to="/solutions"><span>{t('not_found.solutions', 'Browse solutions')}</span></Link>
          <Link className="btn" to="/contact"><span>{t('not_found.contact', 'Contact us')}</span></Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
