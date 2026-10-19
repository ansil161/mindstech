import React, { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NewPageHero from '../../components/sections/newpages/NewPageHero.jsx';
import PlaceholderCard from '../../components/sections/newpages/PlaceholderCard.jsx';
import '../../components/sections/newpages/newpages.css';

const DOCS = [
  ['disclaimer', 'Disclaimer'],
  ['terms', 'Terms & Conditions'],
  ['privacy', 'Privacy Policy'],
  ['cookies', 'Cookie Policy'],
];

const Legal = () => {
  const { t } = useTranslation();
  const { doc } = useParams();
  const current = doc || 'disclaimer';
  const found = DOCS.find(([k]) => k === current);

  useEffect(() => {
    document.title = `${found ? found[1] : 'Legal'} — Mindstec Distribution`;
    window.scrollTo(0, 0);
  }, [found]);

  if (!found) return <Navigate to="/legal" replace />;

  return (
    <main id="top" className="ct">
      <NewPageHero
        crumb={t('legal.crumb', 'Mindstec / Legal')}
        title={t('legal.title', 'Legal')}
        lede={t('legal.lede', 'One set of terms for every Mindstec site.')}
      />
      <section className="ct-wrap np-body">
        <div className="np-legal">
          <nav className="np-tabs" aria-label={t('legal.docs', 'Legal documents')}>
            {DOCS.map(([k, name]) => (
              <Link
                key={k}
                to={k === 'disclaimer' ? '/legal' : `/legal/${k}`}
                className="np-tab"
                aria-selected={k === current}
                aria-current={k === current ? 'page' : undefined}
              >
                {t(`legal.${k}`, name)}
              </Link>
            ))}
          </nav>
          <PlaceholderCard
            title={t(`legal.${found[0]}`, found[1])}
            hint={t('legal.final_text', 'Final text from Mindstec legal.')}
          />
          {current === 'privacy' && (
            <p className="ct-note">
              {t('legal.privacy_scope', 'Covers GDPR (Poland), UAE PDPL, Saudi PDPL, Qatar PDPPL, India DPDP Act, POPIA (South Africa), Egypt data protection law, Thailand PDPA and Brazil LGPD, with the data controller for each region.')}
            </p>
          )}
        </div>
      </section>
    </main>
  );
};

export default Legal;
